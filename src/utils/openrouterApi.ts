import { AiChatMessage } from '@/stores/appStore';

const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODEL = 'openrouter/free';

const getOpenRouterHeaders = (apiKey: string) => {
  const referer = typeof window !== 'undefined'
    ? window.location.origin
    : 'http://localhost:3000';

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
    'HTTP-Referer': referer,
    'X-Title': 'WorkPad',
  };
};

/**
 * Calls the OpenRouter Chat Completions API.
 */
export async function generateOpenRouterResponse(
  apiKey: string,
  history: AiChatMessage[],
  newMessage: string,
  codeContext?: { code: string; language: string; consoleOutput: string }
): Promise<string> {
  const endpoint = OPENROUTER_ENDPOINT;

  // Build the system prompt
  let systemInstruction = "You are a helpful and expert Data Structures and Algorithms teaching assistant. Your goal is to help the user understand the code, fix errors, and learn optimal approaches. Provide concise, accurate answers.";
  
  if (codeContext && codeContext.code.trim()) {
    systemInstruction += `\n\nCURRENT CODE IN EDITOR (${codeContext.language}):\n\`\`\`${codeContext.language}\n${codeContext.code}\n\`\`\``;
    
    if (codeContext.consoleOutput && codeContext.consoleOutput.trim()) {
      systemInstruction += `\n\nCURRENT CONSOLE OUTPUT:\n\`\`\`\n${codeContext.consoleOutput}\n\`\`\``;
    }
  }

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: newMessage },
  ];

  const payload = {
    model: OPENROUTER_MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 1200,
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: getOpenRouterHeaders(apiKey),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    const text = data?.choices?.[0]?.message?.content;
    if (typeof text === 'string' && text.trim()) return text;
    
    return "Sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("OpenRouter API Error:", error);
    throw new Error(`Failed to communicate with OpenRouter: ${error.message}`);
  }
}

/**
 * Streams the response from OpenRouter API using Server-Sent Events (SSE).
 */
export async function streamOpenRouterResponse(
  apiKey: string,
  history: AiChatMessage[],
  newMessage: string,
  onChunk: (chunk: string) => void,
  codeContext?: { code: string; language: string; consoleOutput: string; selectedCode?: string }
): Promise<void> {
  const endpoint = OPENROUTER_ENDPOINT;

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

  const messages = [
    { role: 'system', content: systemInstruction },
    ...history.map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
    { role: 'user', content: newMessage },
  ];

  const payload = {
    model: OPENROUTER_MODEL,
    messages,
    temperature: 0.5,
    max_tokens: 1200,
    stream: true,
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: getOpenRouterHeaders(apiKey),
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
            const textChunk = parsed?.choices?.[0]?.delta?.content || '';
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
        const textChunk = parsed?.choices?.[0]?.delta?.content || '';
        if (textChunk) {
          onChunk(textChunk);
        }
      } catch (err) {
        // Ignore errors in trailing buffer
      }
    }
  } catch (error: any) {
    console.error("OpenRouter Streaming Error:", error);
    throw new Error(`Streaming failed: ${error.message}`);
  } finally {
    reader.releaseLock();
  }
}

