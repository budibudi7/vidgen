import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
    }

    const urlStr = req.nextUrl.searchParams.get('url');
    if (!urlStr) {
        return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
    }

    try {
        const targetUrl = new URL(urlStr);
        targetUrl.searchParams.append('key', apiKey);

        console.log(`[VideoProxy] Fetching video from: ${targetUrl.toString()}`);

        const response = await fetch(targetUrl.toString());

        if (!response.ok) {
            return NextResponse.json({ error: `Upstream error: ${response.statusText}` }, { status: response.status });
        }

        const contentType = response.headers.get('content-type') || 'video/mp4';

        // Create response with appropriate headers
        const newHeaders = new Headers(response.headers);
        newHeaders.set('Content-Type', contentType);
        newHeaders.set('Access-Control-Allow-Origin', '*');

        // Return the body stream
        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders
        });

    } catch (error: any) {
        console.error('[VideoProxy] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
