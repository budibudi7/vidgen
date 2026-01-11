'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/Button';
import { generateVideo } from '@/services/generate';
import { VideoState, AspectRatio } from '@/types';

export default function Home() {
    const [prompt, setPrompt] = useState<string>('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');

    const [videoState, setVideoState] = useState<VideoState>({
        isLoading: false,
        status: '',
        videoUrl: null,
        error: null,
    });

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);

            // Create local preview
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleGenerate = async () => {
        if (!selectedFile) return;

        setVideoState({
            isLoading: true,
            status: 'Initializing...',
            videoUrl: null,
            error: null
        });

        try {
            const url = await generateVideo(
                selectedFile,
                prompt,
                aspectRatio,
                (status) => setVideoState(prev => ({ ...prev, status }))
            );

            setVideoState(prev => ({
                ...prev,
                isLoading: false,
                videoUrl: url,
                status: 'Complete!'
            }));
        } catch (error: any) {
            console.error("Generation failed:", error);

            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";

            setVideoState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage
            }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
            {/* Header */}
            <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-gradient-to-tr from-blue-500 to-violet-500 w-8 h-8 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-violet-400">
                            ZLK Animator
                        </span>
                    </div>

                    <div>
                        <div className="flex items-center space-x-2 text-sm text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span>System Ready</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                    {/* Input Section */}
                    <div className="space-y-6 bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50">
                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-xs rounded-full w-6 h-6 flex items-center justify-center">1</span>
                                Upload Source Image
                            </h2>

                            <div
                                className={`border-2 border-dashed rounded-xl transition-all duration-300 relative overflow-hidden group
                    ${previewUrl ? 'border-slate-600 bg-slate-900' : 'border-slate-600 hover:border-blue-500 hover:bg-slate-800/80 cursor-pointer'}
                    h-64 flex flex-col items-center justify-center
                  `}
                                onClick={() => !previewUrl && fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <>
                                        <img src={previewUrl} alt="Preview" className="h-full w-full object-contain z-10" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedFile(null);
                                                setPreviewUrl(null);
                                                if (fileInputRef.current) fileInputRef.current.value = '';
                                            }}
                                            className="absolute top-2 right-2 z-20 bg-slate-900/80 text-white p-2 rounded-full hover:bg-red-500/80 transition-colors"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <div className="text-center p-6">
                                        <svg className="w-12 h-12 text-slate-500 mx-auto mb-3 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <p className="text-slate-300 font-medium">Click to upload an image</p>
                                        <p className="text-slate-500 text-sm mt-1">PNG or JPEG recommended</p>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                                <span className="bg-blue-600 text-xs rounded-full w-6 h-6 flex items-center justify-center">2</span>
                                Configuration
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Prompt (Optional)</label>
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Describe how the image should move (e.g., 'The camera pans slowly to the right', 'The water flows naturally')"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-24"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-2">Aspect Ratio</label>
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={() => setAspectRatio('16:9')}
                                            className={`px-4 py-2 rounded-lg border ${aspectRatio === '16:9' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                        >
                                            Landscape (16:9)
                                        </button>
                                        <button
                                            onClick={() => setAspectRatio('9:16')}
                                            className={`px-4 py-2 rounded-lg border ${aspectRatio === '9:16' ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                                        >
                                            Portrait (9:16)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleGenerate}
                                disabled={!selectedFile || videoState.isLoading}
                                isLoading={videoState.isLoading}
                                className="w-full py-4 text-lg"
                            >
                                {videoState.isLoading ? 'Generating Video...' : 'Generate Video'}
                            </Button>
                            {videoState.isLoading && (
                                <p className="text-center text-sm text-slate-400 mt-3 animate-pulse">
                                    {videoState.status}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="bg-blue-600 text-xs rounded-full w-6 h-6 flex items-center justify-center">3</span>
                            Result
                        </h2>

                        <div className="flex-1 flex items-center justify-center min-h-[400px] bg-slate-950/50 rounded-xl border border-slate-800 overflow-hidden relative">
                            {videoState.videoUrl ? (
                                <video
                                    src={videoState.videoUrl}
                                    controls
                                    autoPlay
                                    loop
                                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                                />
                            ) : videoState.error ? (
                                <div className="text-center p-8 max-w-md">
                                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium text-red-400 mb-2">Generation Failed</h3>
                                    <p className="text-slate-400 text-sm">{videoState.error}</p>
                                </div>
                            ) : (
                                <div className="text-center text-slate-500">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Generated video will appear here</p>
                                </div>
                            )}
                        </div>

                        {videoState.videoUrl && (
                            <div className="mt-4 flex justify-end">
                                <a
                                    href={videoState.videoUrl}
                                    download="zlk-generated-video.mp4"
                                    className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                    <span>Download MP4</span>
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
