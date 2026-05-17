import { AiChatMessage } from '@/stores/appStore';

/**
 * Calls the Google Gemini REST API.
 * Uses the free tier endpoints.
 */
export async function generateGeminiResponse(
  apiKey: string,
  history: AiChatMessage[],
  newMessage: string,
  codeContext?: { code: string; language: string; consoleOutput: string }
): Promise<string> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // Build the system prompt
  let systemInstruction = "You are a helpful and expert Data Structures and Algorithms teaching assistant. Your goal is to help the user understand the code, fix errors, and learn optimal approaches. Provide concise, accurate answers.";
  
  if (codeContext && codeContext.code.trim()) {
    systemInstruction += `\n\nCURRENT CODE IN EDITOR (${codeContext.language}):\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\``;
    
    if (codeContext.consoleOutput && codeContext.consoleOutput.trim()) {
      systemInstruction += `\n\nCURRENT CONSOLE OUTPUT:\n\`\`\`\n${codeContext.consoleOutput}\n\`\`\``;
    }
  }

  // Format the history for Gemini API
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Append the new message
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates.length > 0 && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    }
    
    return "Sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(`Failed to communicate with Gemini: ${error.message}`);
  }
}

/**
 * Streams the response from Google Gemini REST API using Server-Sent Events (SSE).
 */
export async function streamGeminiResponse(
  apiKey: string,
  history: AiChatMessage[],
  newMessage: string,
  onChunk: (chunk: string) => void,
  codeContext?: { code: string; language: string; consoleOutput: string; selectedCode?: string }
): Promise<void> {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`;

  // Build the system prompt
  let systemInstruction = "You are a helpful and expert Data Structures and Algorithms teaching assistant. Your goal is to help the user understand the code, fix errors, and learn optimal approaches. Provide concise, accurate answers.";
  
  if (codeContext && codeContext.code.trim()) {
    if (codeContext.selectedCode && codeContext.selectedCode.trim()) {
      systemInstruction += `\n\nTHE USER HAS HIGHLIGHTED A SPECIFIC BLOCK OF CODE TO DISCUSS:\n\`\`\`${codeContext.language}\n${codeContext.selectedCode}\n\`\`\``;
      systemInstruction += `\n\n(Use the rest of the file below for broader context if needed):\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\``;
    } else {
      systemInstruction += `\n\nCURRENT CODE IN EDITOR (${codeContext.language}):\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\``;
    }
    
    if (codeContext.consoleOutput && codeContext.consoleOutput.trim()) {
      systemInstruction += `\n\nCURRENT CONSOLE OUTPUT:\n\`\`\`\n${codeContext.consoleOutput}\n\`\`\``;
    }
  }

  // Format the history for Gemini API
  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Append the new message
  contents.push({
    role: 'user',
    parts: [{ text: newMessage }]
  });

  const payload = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Could not initialize stream reader.");
  }

  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep the last incomplete line in buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (textChunk) {
              onChunk(textChunk);
            }
          } catch (err) {
            console.error("Failed to parse chunk JSON:", err);
          }
        }
      }
    }

    // Process remaining buffer if it has data
    if (buffer.startsWith('data: ')) {
      const jsonStr = buffer.slice(6).trim();
      try {
        const parsed = JSON.parse(jsonStr);
        const textChunk = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (textChunk) {
          onChunk(textChunk);
        }
      } catch (err) {
        // Ignore errors in trailing buffer
      }
    }
  } catch (error: any) {
    console.error("Gemini Streaming Error:", error);
    throw new Error(`Streaming failed: ${error.message}`);
  } finally {
    reader.releaseLock();
  }
}

