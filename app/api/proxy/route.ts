import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mediaUrl = searchParams.get('url');

  if (!mediaUrl) {
    return new NextResponse('Missing target media URL parameter', { status: 400 });
  }

  try {
    const mediaResponse = await fetch(mediaUrl);
    if (!mediaResponse.ok) throw new Error('Failed to resolve asset resource');

    const fileBuffer = await mediaResponse.arrayBuffer();
    const contentType = mediaResponse.headers.get('content-type') || 'application/octet-stream';
    
    // Determine target extension string dynamically
    const extension = contentType.includes('video') ? 'mp4' : 'jpg';
    
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="x-download-${Date.now()}.${extension}"`,
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    return new NextResponse('Asset streaming error', { status: 500 });
  }
}
