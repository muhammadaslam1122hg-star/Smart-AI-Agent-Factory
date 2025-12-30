
import { GoogleGenAI } from "@google/genai";

// Always create a new GoogleGenAI instance right before making an API call to ensure it uses the most up-to-date API key.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Generates text content using Gemini 3 Flash.
  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemInstruction || "You are a helpful assistant for Manifest AI Studio.",
      }
    });
    return response.text || "";
  },

  // Generates images using Gemini 2.5 Flash Image.
  async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1"): Promise<string> {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: { aspectRatio }
      }
    });
    
    // Find the image part in the response parts.
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data generated");
  },

  // Edits an image based on a prompt using Gemini 2.5 Flash Image.
  async editImage(base64ImageData: string, prompt: string): Promise<string> {
    const ai = getAI();
    const mimeType = base64ImageData.split(';')[0].split(':')[1] || 'image/png';
    const data = base64ImageData.split(',')[1] || base64ImageData;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data,
              mimeType: mimeType,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data generated during edit");
  },

  // Swaps faces between two images using Gemini 2.5 Flash Image.
  async swapFaces(base64Image1: string, base64Image2: string): Promise<string> {
    const ai = getAI();
    const mimeType1 = base64Image1.split(';')[0].split(':')[1] || 'image/png';
    const data1 = base64Image1.split(',')[1] || base64Image1;
    const mimeType2 = base64Image2.split(';')[0].split(':')[1] || 'image/png';
    const data2 = base64Image2.split(',')[1] || base64Image2;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: data1,
              mimeType: mimeType1,
            },
          },
          {
            inlineData: {
              data: data2,
              mimeType: mimeType2,
            },
          },
          {
            text: "Swap the face from the first image onto the person in the second image. Keep the second image's background and body.",
          },
        ],
      },
    });
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data generated during face swap");
  },

  // Generates video using Veo 3.1 Fast, handling mandatory API key selection.
  async generateVideo(prompt: string, startImage?: string): Promise<string> {
    // Mandatorily check for API key selection for Veo models.
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      if (!hasKey) {
        await (window as any).aistudio.openSelectKey();
        // Assume key selection was successful after triggering openSelectKey.
      }
    }

    const ai = getAI();
    let operation;
    
    // Prepare video generation request, optionally with a starting image.
    if (startImage) {
      const mimeType = startImage.split(';')[0].split(':')[1] || 'image/png';
      const data = startImage.split(',')[1] || startImage;
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: data,
          mimeType: mimeType,
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    } else {
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    }

    // Poll for the long-running video generation operation to complete.
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      try {
        operation = await ai.operations.getVideosOperation({ operation: operation });
      } catch (error: any) {
        if (error.message?.includes("Requested entity was not found.")) {
           throw new Error("Video generation operation lost. Please try selecting your API key again.");
        }
        throw error;
      }
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed: No download link provided.");
    
    // Fetch the final video bytes using the API key.
    const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!response.ok) throw new Error(`Failed to download video file: ${response.statusText}`);
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },

  // Generates HTML code based on project type using Gemini 3 Pro.
  async generateCode(prompt: string, type: 'website' | 'webapp' | 'mobile' | 'agent'): Promise<string> {
    const ai = getAI();
    let systemInstruction = "";

    switch (type) {
      case 'website':
        systemInstruction = "You are a senior frontend developer. Create a STUNNING, modern, single-file HTML/Tailwind CSS website. Must include navigation, hero, features, testimonials, and footer. Use high-quality placeholder images from Unsplash. Return ONLY raw HTML code without any markdown blocks.";
        break;
      case 'webapp':
        systemInstruction = "You are a senior fullstack developer. Create a fully functional Single Page Application (SPA) in a single HTML file using Tailwind CSS and Alpine.js or Vue.js (CDN). The UI must be highly interactive with state management. Return ONLY raw HTML code.";
        break;
      case 'mobile':
        systemInstruction = "You are a senior mobile UI developer. Create a high-fidelity mobile app prototype in a single HTML file. Use Tailwind CSS and simulate mobile gestures and transitions. The UI should look like a native iOS/Android app. Return ONLY raw HTML code.";
        break;
      case 'agent':
        systemInstruction = "You are a principal AI architect. Create a comprehensive 'Smart AI Agent' dashboard. The agent should have a name, personality, and a functional chat interface using Tailwind CSS. Include a 'Core Logic' visualization and an interactive configuration panel. Return ONLY raw HTML code.";
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { systemInstruction }
    });

    // Clean response from any markdown code blocks.
    let code = response.text || "";
    code = code.replace(/```html/gi, "").replace(/```/gi, "").trim();
    return code;
  },

  // Uploads code content to a GitHub repository.
  async uploadToGitHub(token: string, repoName: string, content: string): Promise<string> {
    try {
      // 1. Create repository.
      const repoResponse = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          private: false,
          auto_init: true,
          description: 'Manifested by Smart AI Agent Factory'
        })
      });

      const repo = await repoResponse.json();
      const fullName = repo.full_name || `user/${repoName}`;

      // 2. Push content to index.html.
      const pushResponse = await fetch(`https://api.github.com/repos/${fullName}/contents/index.html`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Manifest Project Update',
          content: btoa(unescape(encodeURIComponent(content)))
        })
      });

      if (!pushResponse.ok) {
        const err = await pushResponse.json();
        throw new Error(err.message || 'Push failed');
      }

      return `https://github.com/${fullName}`;
    } catch (error: any) {
      console.error("GitHub Error:", error);
      throw error;
    }
  }
};
