/**
 * AI Provider Router — Abstracts multiple AI backends with a unified interface.
 * Supports: OpenAI, Gemini, Ollama (local)
 */

const PROVIDERS = {
    openai: {
        name: 'OpenAI',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        defaultModel: 'gpt-4o-mini',
    },
    gemini: {
        name: 'Google Gemini',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
        defaultModel: 'gemini-2.0-flash',
    },
    ollama: {
        name: 'Ollama (Local)',
        endpoint: 'http://localhost:11434/api/chat',
        defaultModel: 'deepseek-v3.1:671b-cloud',
    },
};

/**
 * Send a message to the AI and get a streaming response
 */
export async function sendMessage({ provider = 'ollama', apiKey = '', model, messages, systemPrompt, onChunk }) {
    const config = PROVIDERS[provider];
    if (!config) throw new Error(`Unknown provider: ${provider}`);

    const finalModel = model || config.defaultModel;

    // Build messages array with system prompt
    const fullMessages = [];
    if (systemPrompt) {
        fullMessages.push({ role: 'system', content: systemPrompt });
    }
    fullMessages.push(...messages);

    try {
        if (provider === 'openai') {
            return await streamOpenAI(config.endpoint, apiKey, finalModel, fullMessages, onChunk);
        } else if (provider === 'gemini') {
            return await streamGemini(config.endpoint, apiKey, finalModel, fullMessages, onChunk);
        } else if (provider === 'ollama') {
            return await streamOllama(config.endpoint, finalModel, fullMessages, onChunk);
        }
    } catch (err) {
        console.error(`[AI Router] Error with ${provider}:`, err);
        throw err;
    }
}

// ── OpenAI Streaming ──
async function streamOpenAI(endpoint, apiKey, model, messages, onChunk) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!res.ok) throw new Error(`OpenAI Error: ${res.status} ${res.statusText}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
            const data = line.replace('data: ', '');
            if (data === '[DONE]') break;
            try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || '';
                if (content) {
                    fullText += content;
                    onChunk?.(content, fullText);
                }
            } catch { }
        }
    }

    return fullText;
}

// ── Gemini Streaming ──
async function streamGemini(endpoint, apiKey, model, messages, onChunk) {
    const contents = messages
        .filter(m => m.role !== 'system')
        .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));

    const systemInstruction = messages.find(m => m.role === 'system');

    const res = await fetch(
        `${endpoint}/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                ...(systemInstruction && {
                    systemInstruction: { parts: [{ text: systemInstruction.content }] },
                }),
            }),
        }
    );

    if (!res.ok) throw new Error(`Gemini Error: ${res.status} ${res.statusText}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

        for (const line of lines) {
            try {
                const parsed = JSON.parse(line.replace('data: ', ''));
                const content = parsed.candidates?.[0]?.content?.parts?.[0]?.text || '';
                if (content) {
                    fullText += content;
                    onChunk?.(content, fullText);
                }
            } catch { }
        }
    }

    return fullText;
}

// ── Ollama Streaming ──
async function streamOllama(endpoint, model, messages, onChunk) {
    const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: true }),
    });

    if (!res.ok) throw new Error(`Ollama Error: ${res.status} ${res.statusText}`);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(Boolean);

        for (const line of lines) {
            try {
                const parsed = JSON.parse(line);
                const content = parsed.message?.content || '';
                if (content) {
                    fullText += content;
                    onChunk?.(content, fullText);
                }
            } catch { }
        }
    }

    return fullText;
}

/**
 * Test connection to a provider
 */
export async function testConnection(provider, apiKey = '') {
    try {
        if (provider === 'ollama') {
            const res = await fetch('http://localhost:11434/api/tags');
            return res.ok;
        }
        if (provider === 'openai') {
            const res = await fetch('https://api.openai.com/v1/models', {
                headers: { 'Authorization': `Bearer ${apiKey}` },
            });
            return res.ok;
        }
        if (provider === 'gemini') {
            const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
            return res.ok;
        }
        return false;
    } catch {
        return false;
    }
}

export { PROVIDERS };
