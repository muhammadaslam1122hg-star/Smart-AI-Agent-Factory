
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async generateText(prompt: string, systemInstruction?: string) {
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

  async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1") {
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
    
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data generated");
  },

  async editImage(base64Image: string, prompt: string) {
    const ai = getAI();
    const data = base64Image.split(',')[1] || base64Image;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data, mimeType: 'image/png' } },
          { text: prompt }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async swapFaces(sourceBase64: string, targetBase64: string) {
    const ai = getAI();
    const sourceData = sourceBase64.split(',')[1] || sourceBase64;
    const targetData = targetBase64.split(',')[1] || targetBase64;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { inlineData: { data: sourceData, mimeType: 'image/png' } },
          { inlineData: { data: targetData, mimeType: 'image/png' } },
          { text: "Swap the face from the first image onto the person in the second image. Maintain lighting and realism." }
        ]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return null;
  },

  async generateVideo(prompt: string, sourceImage?: string) {
    const aistudio = (window as any).aistudio;
    if (!(await aistudio.hasSelectedApiKey())) {
      await aistudio.openSelectKey();
    }
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const payload: any = {
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '16:9'
      }
    };
    if (sourceImage) {
      payload.image = {
        imageBytes: sourceImage.split(',')[1] || sourceImage,
        mimeType: 'image/png'
      };
    }
    try {
      let operation = await ai.models.generateVideos(payload);
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }
      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed");
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      if (error.message?.includes("Requested entity was not found.")) {
        await aistudio.openSelectKey();
      }
      throw error;
    }
  },

  async generateCode(prompt: string, type: 'website' | 'webapp' | 'mobile' | 'agent') {
    const ai = getAI();
    let systemPrompt = '';
    
    if (type === 'agent') {
      systemPrompt = `You are a world-class AI Agent architect. 
      Generate a comprehensive AI Agent implementation. 
      Include:
      1. A professional UI in HTML/Tailwind for interacting with the agent.
      2. The logic/configuration in a script tag.
      3. Documentation within the HTML for how the agent works.
      Return ONLY raw HTML/CSS/JS code without markdown code blocks.`;
    } else {
      systemPrompt = `You are a world-class ${type} developer. 
      Generate a high-quality, fully responsive, modern ${type} as a single HTML file. 
      Use Tailwind CSS (via CDN) and Lucide icons. 
      The code must be production-ready, interactive, and visually stunning. 
      Return ONLY raw HTML code. Do NOT use markdown code blocks like \`\`\`html.`;
    }
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
      }
    });
    return response.text?.replace(/```html/g, '').replace(/```/g, '').trim() || "Failed to generate code.";
  },

  async uploadToGitHub(token: string, repoName: string, content: string) {
    // Real GitHub API call logic
    try {
      const response = await fetch(`https://api.github.com/user/repos`, {
        method: 'POST',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: repoName,
          private: false,
          auto_init: true
        })
      });
      
      const repo = await response.json();
      if (!response.ok) throw new Error(repo.message);

      // Create file
      const fileResponse = await fetch(`https://api.github.com/repos/${repo.full_name}/contents/index.html`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Initial project manifest from AI Studio',
          content: btoa(unescape(encodeURIComponent(content)))
        })
      });

      return repo.html_url;
    } catch (error) {
      console.error("GitHub Error:", error);
      throw error;
    }
  }
};
