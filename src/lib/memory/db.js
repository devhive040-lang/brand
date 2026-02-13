import Dexie from 'dexie';

const db = new Dexie('BrandAI');

db.version(1).stores({
    // Brand identity
    brands: '++id, name, createdAt',

    // Conversations
    conversations: '++id, brandId, title, type, createdAt, updatedAt',
    messages: '++id, conversationId, role, createdAt',

    // Projects
    projects: '++id, brandId, name, status, createdAt',
    tasks: '++id, projectId, title, status, priority, assignee, dueDate',

    // Team
    members: '++id, brandId, name, role, email',

    // Marketing
    campaigns: '++id, brandId, name, status, startDate, endDate',
    posts: '++id, campaignId, brandId, platform, status, scheduledAt',

    // Documents
    documents: '++id, brandId, type, title, createdAt',

    // Videos
    videos: '++id, brandId, title, status, createdAt',

    // Activity log
    activities: '++id, brandId, type, description, createdAt',

    // Settings
    settings: 'key',
});

export default db;

// Helper: get current brand
export async function getCurrentBrand() {
    const setting = await db.settings.get('currentBrandId');
    if (!setting) return null;
    return db.brands.get(setting.value);
}

// Helper: set current brand
export async function setCurrentBrand(brandId) {
    await db.settings.put({ key: 'currentBrandId', value: brandId });
}

// Helper: log activity
export async function logActivity(brandId, type, description) {
    await db.activities.add({
        brandId,
        type,
        description,
        createdAt: new Date().toISOString(),
    });
}
