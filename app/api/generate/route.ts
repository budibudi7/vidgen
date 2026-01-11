import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
    try {
        const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'Server configuration error: API Key missing' }, { status: 500 });
        }

        const body = await req.json();
        const modelName = 'veo-3.1-generate-preview';

        // Initialize Google GenAI SDK
        const ai = new GoogleGenAI({ apiKey });

        console.log(`[API] Starting generation with model: ${modelName}`);

        // Call the SDK
        const operation = await ai.models.generateVideos({
            model: modelName,
            ...body
        });

        // The SDK returns the operation object directly
        return NextResponse.json(operation);

    } catch (error: any) {
        console.error('[API] Generate error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
