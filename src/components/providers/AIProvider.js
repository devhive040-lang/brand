'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import db from '@/lib/memory/db';

const AIContext = createContext();

export function AIProvider({ children }) {
    const [provider, setProvider] = useState('ollama');
    const [apiKeys, setApiKeys] = useState({});
    const [models, setModels] = useState({});

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const p = await db.settings.get('aiProvider');
        if (p) setProvider(p.value);
        const keys = await db.settings.get('aiApiKeys');
        if (keys) setApiKeys(keys.value);
        const m = await db.settings.get('aiModels');
        if (m) setModels(m.value);
    };

    const saveProvider = async (p) => {
        setProvider(p);
        await db.settings.put({ key: 'aiProvider', value: p });
    };

    const saveApiKey = async (prov, key) => {
        const updated = { ...apiKeys, [prov]: key };
        setApiKeys(updated);
        await db.settings.put({ key: 'aiApiKeys', value: updated });
    };

    const saveModel = async (prov, model) => {
        const updated = { ...models, [prov]: model };
        setModels(updated);
        await db.settings.put({ key: 'aiModels', value: updated });
    };

    return (
        <AIContext.Provider value={{
            provider, apiKeys, models,
            saveProvider, saveApiKey, saveModel,
        }}>
            {children}
        </AIContext.Provider>
    );
}

export function useAI() {
    const ctx = useContext(AIContext);
    if (!ctx) throw new Error('useAI must be used within AIProvider');
    return ctx;
}
