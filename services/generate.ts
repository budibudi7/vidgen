import { AspectRatio } from "../types";

// Helper to convert File to Base64 stripped of data URL prefix
export const fileToGenerativePart = async (file: File): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64Data,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const generateVideo = async (
  imageFile: File,
  prompt: string,
  aspectRatio: AspectRatio,
  onStatusUpdate: (status: string) => void
): Promise<string> => {
  onStatusUpdate("Preparing image...");
  const imagePart = await fileToGenerativePart(imageFile);

  onStatusUpdate("Initializing Model generation...");

  const requestBody = {
    prompt: prompt || "Animate this image naturally",
    image: {
      imageBytes: imagePart.data,
      mimeType: imagePart.mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  };

  // 1. Start generation
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `Generation failed: ${response.statusText}`);
  }

  let operation = await response.json();

  onStatusUpdate("Video generation started. This may take 1-2 minutes...");

  // 2. Poll operation status
  while (true) {
    if (operation.done) break;

    // Wait 10 seconds between polls
    await new Promise(resolve => setTimeout(resolve, 10000));

    onStatusUpdate("Still generating... Converting pixels to magic...");

    const opUrl = `/api/operations/${operation.name}`;
    const opResponse = await fetch(opUrl);

    if (!opResponse.ok) {
      const errorData = await opResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Polling failed: ${opResponse.statusText}`);
    }

    operation = await opResponse.json();
  }

  if (operation.error) {
    throw new Error(String(operation.error.message || "Unknown error during video generation"));
  }

  // Handle different response structures (Veo vs others)
  const generatedVideo = operation.response?.generatedVideos?.[0] ||
    operation.response?.generateVideoResponse?.generatedSamples?.[0];

  if (!generatedVideo?.video?.uri) {
    console.error("Operation response:", JSON.stringify(operation, null, 2));
    throw new Error("No video URI returned from the API.");
  }

  onStatusUpdate("Downloading video...");

  // 3. Download video
  // The server rewrites the URI to be a local /api/video URL
  const downloadLink = generatedVideo.video.uri as string;

  const videoResponse = await fetch(downloadLink);

  if (!videoResponse.ok) {
    throw new Error(`Failed to download video: ${videoResponse.statusText}`);
  }

  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};