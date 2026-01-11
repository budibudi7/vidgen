import { NextRequest, NextResponse } from 'next/server';

const externalApiBaseUrl = 'https://generativelanguage.googleapis.com/v1beta';

export async function GET(req: NextRequest, props: { params: Promise<{ name: string[] }> }) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
        }

        const params = await props.params;
        const operationPath = params.name.join('/');

        // Construct target URL
        const targetUrl = `${externalApiBaseUrl}/${operationPath}?key=${apiKey}`;

        const response = await fetch(targetUrl);
        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        // If operation is done and has a video URI, rewrite it
        let videoEntry = data.response?.generatedVideos?.[0]?.video ||
            data.response?.generateVideoResponse?.generatedSamples?.[0]?.video;

        if (data.done && videoEntry?.uri) {
            const originalUri = videoEntry.uri;
            // Rewrite to local proxy
            const localProxyUrl = `/api/video?url=${encodeURIComponent(originalUri)}`;

            videoEntry.uri = localProxyUrl;
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API] Operation check error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
