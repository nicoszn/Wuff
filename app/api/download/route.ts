import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge'; // Edge runtime optimization for fast regional response on Vercel

const TWEET_ID_REGEX = /status\/(\d+)/;

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const match = url.match(TWEET_ID_REGEX);
    if (!match) {
      return NextResponse.json({ error: 'Invalid X/Twitter link format' }, { status: 400 });
    }

    const tweetId = match[1];
    const bearerToken = process.env.TWITTER_BEARER_TOKEN;

    if (!bearerToken) {
      console.error('Missing TWITTER_BEARER_TOKEN environment variable');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Call X API v2 asking for attachments and media variants
    const apiUrl = `https://x.com{tweetId}?expansions=attachments.media_keys&media.fields=variants,type,preview_image_url,url`;

    const response = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errData.detail || 'Failed to fetch post details from platform' },
        { status: response.status }
      );
    }

    const tweetData = await response.json();
    const mediaList = tweetData.includes?.media || [];

    if (mediaList.length === 0) {
      return NextResponse.json({ error: 'No downloadable media found in this post' }, { status: 404 });
    }

    // Process all media files attached to the tweet/thread
    const processedMedia = mediaList.map((media: any) => {
      if (media.type === 'video' || media.type === 'animated_gif') {
        // Sort variants to capture highest bitrate video file available
        const videoVariants = media.variants
          ?.filter((v: any) => v.content_type === 'video/mp4')
          .sort((a: any, b: any) => (b.bitrate || 0) - (a.bitrate || 0));

        return {
          type: 'video',
          preview: media.preview_image_url,
          downloadUrl: videoVariants && videoVariants.length > 0 ? videoVariants[0].url : null,
        };
      } else {
        // Native photo upload
        return {
          type: 'image',
          preview: media.url,
          downloadUrl: media.url,
        };
      }
    }).filter((m: any) => m.downloadUrl !== null);

    return NextResponse.json({
      id: tweetId,
      text: tweetData.data?.text || '',
      media: processedMedia,
    });

  } catch (error) {
    console.error('Processing error:', error);
    return NextResponse.json({ error: 'Internal server processing error' }, { status: 500 });
  }
}
