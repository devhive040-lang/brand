import db from './db';

/**
 * Context Builder — Assembles full brand context for AI prompts.
 * Injects brand identity, recent activities, project status, and conversation history
 * so the AI never loses context.
 */
export async function buildBrandContext(brandId) {
    if (!brandId) return '';

    const brand = await db.brands.get(brandId);
    if (!brand) return '';

    const projects = await db.projects.where('brandId').equals(brandId).toArray();
    const members = await db.members.where('brandId').equals(brandId).toArray();
    const recentActivities = await db.activities
        .where('brandId').equals(brandId)
        .reverse().limit(10).toArray();
    const campaigns = await db.campaigns.where('brandId').equals(brandId).toArray();

    // Active tasks
    const activeTasks = [];
    for (const p of projects) {
        const tasks = await db.tasks.where('projectId').equals(p.id).toArray();
        activeTasks.push(...tasks.filter(t => t.status !== 'done'));
    }

    let context = `## Brand Context\n`;
    context += `**Name**: ${brand.name}\n`;
    if (brand.tagline) context += `**Tagline**: ${brand.tagline}\n`;
    if (brand.mission) context += `**Mission**: ${brand.mission}\n`;
    if (brand.vision) context += `**Vision**: ${brand.vision}\n`;
    if (brand.industry) context += `**Industry**: ${brand.industry}\n`;
    if (brand.audience) context += `**Target Audience**: ${brand.audience}\n`;
    if (brand.tone) context += `**Tone of Voice**: ${brand.tone}\n`;
    if (brand.colors && brand.colors.length) context += `**Brand Colors**: ${brand.colors.join(', ')}\n`;
    if (brand.fonts) context += `**Typography**: ${brand.fonts}\n`;

    if (projects.length > 0) {
        context += `\n## Projects (${projects.length})\n`;
        projects.forEach(p => {
            context += `- **${p.name}** — Status: ${p.status}\n`;
        });
    }

    if (activeTasks.length > 0) {
        context += `\n## Active Tasks (${activeTasks.length})\n`;
        activeTasks.slice(0, 10).forEach(t => {
            context += `- [${t.status}] ${t.title} (Priority: ${t.priority})\n`;
        });
    }

    if (members.length > 0) {
        context += `\n## Team (${members.length})\n`;
        members.forEach(m => {
            context += `- ${m.name} — ${m.role}\n`;
        });
    }

    if (campaigns.length > 0) {
        context += `\n## Marketing Campaigns (${campaigns.length})\n`;
        campaigns.forEach(c => {
            context += `- **${c.name}** — Status: ${c.status}\n`;
        });
    }

    if (recentActivities.length > 0) {
        context += `\n## Recent Activity\n`;
        recentActivities.forEach(a => {
            context += `- ${a.description} (${a.type})\n`;
        });
    }

    return context;
}

/**
 * Build conversation context — last N messages
 */
export async function buildConversationContext(conversationId, limit = 20) {
    const messages = await db.messages
        .where('conversationId').equals(conversationId)
        .reverse().limit(limit).toArray();

    return messages.reverse().map(m => ({
        role: m.role,
        content: m.content,
    }));
}

/**
 * System prompt builder — combines brand context + instructions
 */
export function buildSystemPrompt(brandContext) {
    return `You are Brand AI — a highly intelligent, professional business assistant.

You have complete knowledge of the user's brand and business. You MUST stay in context at all times.
You provide expert advice on branding, marketing, operations, project management, and business growth.
You can help create content, analyze data, plan campaigns, manage projects, and generate reports.
You always respond in the same language the user speaks.

${brandContext}

## Your Capabilities
- Brand strategy and identity consulting
- Marketing campaign planning and content creation
- Project and task management recommendations
- Team coordination suggestions
- Financial and growth analysis
- Social media content strategy
- Document and report generation guidance
- Video concept development

## Rules
1. NEVER lose context about the brand — always reference brand details in your responses
2. Be precise, professional, and actionable
3. When suggesting actions, be specific about implementation steps
4. Track what has been done and what remains
5. Proactively identify issues and opportunities
6. Format responses with clear structure (headers, bullet points, bold key info)`;
}
