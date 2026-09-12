import { NextRequest, NextResponse } from 'next/server';

// Pure serverless configuration tailored for high-concurrency Vercel environments
export const runtime = 'nodejs'; 

const TWEET_ID_REGEX = /status\/(\d+)/;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json().catch(() => ({}));

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'A valid post URL is required.' }, { status: 400 });
    }

    const match = url.match(TWEET_ID_REGEX);
    if (!match) {
      return NextResponse.json({ error: 'Invalid URL format. Please provide a valid link containing /status/[id]' }, { status: 400 });
    }

    const tweetId = match[1];
    
    // Querying the native public syndication endpoint directly via standard fetch
    const syndicationUrl = `https://twimg.com{tweetId}&lang=en`;

    const response = await fetch(syndicationUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 0 } // Bypasses stale data caching issues on Vercel edge nodes
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Post not found. It might be private or deleted.' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to retrieve data from the platform platform.' }, { status: response.status });
    }

    const data = await response.json();
    
    // Parse out media objects (videos, photos, gifs) safely from the payload schema
    const mediaArray = data.mediaDetails || [];
    if (mediaArray.length === 0) {
      return NextResponse.json({ error: 'No streamable media discovered in this post.' }, { status: 404 });
    }

    const processedMedia = mediaArray.map((item: any) => {
      if (item.type === 'video' || item.type === 'animated_gif') {
        // Isolate video variants and sort descending by bitrate to give the user the best quality stream
        const variants = item.videoDetails?.variants || [];
        const highestQuality = [...variants]
          .filter((v: any) => v.src && v.contentType === 'video/mp4')
          .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0))[0];

        return {
          type: 'video',
          preview: item.media_url_https || '',
          downloadUrl: highestQuality ? highestQuality.src : null,
        };
      }

      // Default to high-resolution image uploads
      return {
        type: 'image',
        preview: item.media_url_https || '',
        downloadUrl: item.media_url_https || null,
      };
    }).filter((media: any) => media.downloadUrl !== null);

    if (processedMedia.length === 0) {
      return NextResponse.json({ error: 'Could not resolve a direct download stream link for this content.' }, { status: 422 });
    }

    return NextResponse.json({
      id: tweetId,
      text: data.text || '',
      author: data.user?.name || 'Unknown Author',
      media: processedMedia,
    });

  } catch (error) {
    console.error('Extraction handler crash:', error);
    return NextResponse.json({ error: 'Internal operational failure occurred.' }, { status: 500 });
  }
}
