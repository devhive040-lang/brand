'use client';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import db, { getCurrentBrand, setCurrentBrand, logActivity } from '@/lib/memory/db';

const BrandContext = createContext();

export function BrandProvider({ children }) {
    const [brand, setBrand] = useState(null);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ projects: 0, tasks: 0, members: 0, campaigns: 0 });

    // Load brands on mount
    useEffect(() => {
        loadBrands();
    }, []);

    const loadBrands = async () => {
        try {
            const allBrands = await db.brands.toArray();
            setBrands(allBrands);
            const current = await getCurrentBrand();
            if (current) {
                setBrand(current);
                await loadStats(current.id);
            }
        } catch (err) {
            console.error('Failed to load brands:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async (brandId) => {
        const [projects, members, campaigns] = await Promise.all([
            db.projects.where('brandId').equals(brandId).count(),
            db.members.where('brandId').equals(brandId).count(),
            db.campaigns.where('brandId').equals(brandId).count(),
        ]);
        let taskCount = 0;
        const projs = await db.projects.where('brandId').equals(brandId).toArray();
        for (const p of projs) {
            taskCount += await db.tasks.where('projectId').equals(p.id).count();
        }
        setStats({ projects, tasks: taskCount, members, campaigns });
    };

    const createBrand = useCallback(async (brandData) => {
        const id = await db.brands.add({
            ...brandData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        await setCurrentBrand(id);
        await logActivity(id, 'brand', `Brand "${brandData.name}" created`);
        await loadBrands();
        return id;
    }, []);

    const updateBrand = useCallback(async (id, updates) => {
        await db.brands.update(id, { ...updates, updatedAt: new Date().toISOString() });
        await logActivity(id, 'brand', `Brand updated`);
        await loadBrands();
    }, []);

    const switchBrand = useCallback(async (id) => {
        await setCurrentBrand(id);
        await loadBrands();
    }, []);

    return (
        <BrandContext.Provider value={{
            brand, brands, loading, stats,
            createBrand, updateBrand, switchBrand, loadStats, loadBrands,
        }}>
            {children}
        </BrandContext.Provider>
    );
}

export function useBrand() {
    const ctx = useContext(BrandContext);
    if (!ctx) throw new Error('useBrand must be used within BrandProvider');
    return ctx;
}
