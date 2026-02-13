'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import { useAI } from '@/components/providers/AIProvider';
import { sendMessage } from '@/lib/ai/router';
import { buildBrandContext, buildConversationContext, buildSystemPrompt } from '@/lib/memory/context';
import db, { logActivity } from '@/lib/memory/db';
import styles from './chat.module.css';

export default function ChatPage() {
    const { brand } = useBrand();
    const { provider, apiKeys, models } = useAI();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        initConversation();
    }, [brand]);

    const initConversation = async () => {
        if (!brand) return;
        const convs = await db.conversations.where('brandId').equals(brand.id).reverse().limit(1).toArray();
        if (convs.length > 0) {
            setConversationId(convs[0].id);
            const msgs = await db.messages.where('conversationId').equals(convs[0].id).toArray();
            setMessages(msgs);
        }
    };

    const handleSend = useCallback(async () => {
        if (!input.trim() || loading) return;

        const userMsg = input.trim();
        setInput('');
        setLoading(true);

        // Create conversation if needed
        let convId = conversationId;
        if (!convId) {
            convId = await db.conversations.add({
                brandId: brand?.id || 0,
                title: userMsg.slice(0, 50),
                type: 'chat',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            setConversationId(convId);
        }

        // Save user message
        const userMsgId = await db.messages.add({
            conversationId: convId,
            role: 'user',
            content: userMsg,
            createdAt: new Date().toISOString(),
        });

        const userMsgObj = { id: userMsgId, role: 'user', content: userMsg, createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, userMsgObj]);

        // Build context
        const brandContext = brand ? await buildBrandContext(brand.id) : '';
        const systemPrompt = buildSystemPrompt(brandContext);
        const history = await buildConversationContext(convId, 20);

        // AI placeholder
        const aiPlaceholder = { id: 'loading', role: 'assistant', content: '', createdAt: new Date().toISOString() };
        setMessages(prev => [...prev, aiPlaceholder]);

        try {
            const fullResponse = await sendMessage({
                provider,
                apiKey: apiKeys[provider] || '',
                model: models[provider],
                messages: [...history, { role: 'user', content: userMsg }],
                systemPrompt,
                onChunk: (chunk, fullText) => {
                    setMessages(prev => {
                        const updated = [...prev];
                        updated[updated.length - 1] = { ...updated[updated.length - 1], content: fullText };
                        return updated;
                    });
                },
            });

            // Save AI response
            const aiMsgId = await db.messages.add({
                conversationId: convId,
                role: 'assistant',
                content: fullResponse,
                createdAt: new Date().toISOString(),
            });

            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { ...updated[updated.length - 1], id: aiMsgId };
                return updated;
            });

            if (brand) await logActivity(brand.id, 'chat', `AI conversation: "${userMsg.slice(0, 40)}..."`);

        } catch (err) {
            setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: `⚠️ Error: ${err.message}\n\nMake sure your AI provider is configured in Settings.`,
                    error: true,
                };
                return updated;
            });
        } finally {
            setLoading(false);
        }
    }, [input, loading, conversationId, brand, provider, apiKeys, models]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <AppShell pageTitle="AI Assistant">
            <div className={styles.chatContainer}>
                {/* Messages Area */}
                <div className={styles.messagesArea}>
                    {messages.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>🤖</div>
                            <h2 className="gradient-text">Brand AI Assistant</h2>
                            <p>Ask anything about your brand, marketing, projects, or business strategy.</p>
                            <div className={styles.suggestions}>
                                {['Analyze my brand strategy', 'Create a marketing plan', 'Suggest social media content', 'Review my project progress'].map((s, i) => (
                                    <button key={i} className={styles.suggestionBtn} onClick={() => setInput(s)}>{s}</button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((msg, i) => (
                        <div key={msg.id || i} className={`${styles.message} ${styles[msg.role]} ${msg.error ? styles.error : ''}`}>
                            <div className={styles.msgAvatar}>
                                {msg.role === 'user' ? '👤' : '🤖'}
                            </div>
                            <div className={styles.msgContent}>
                                <div className={styles.msgRole}>{msg.role === 'user' ? 'You' : 'Brand AI'}</div>
                                <div className={styles.msgText}>{msg.content || '...'}</div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className={styles.inputArea}>
                    <div className={styles.inputWrapper}>
                        <textarea
                            ref={inputRef}
                            className={styles.input}
                            placeholder={brand ? `Ask Brand AI about "${brand.name}"...` : 'Setup your brand first in Brand Identity...'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            rows={1}
                            disabled={loading}
                        />
                        <button className={styles.sendBtn} onClick={handleSend} disabled={loading || !input.trim()}>
                            {loading ? '⏳' : '➤'}
                        </button>
                    </div>
                    <div className={styles.inputMeta}>
                        <span>Provider: {provider}</span>
                        <span>•</span>
                        <span>{brand ? `Brand: ${brand.name}` : 'No brand selected'}</span>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
