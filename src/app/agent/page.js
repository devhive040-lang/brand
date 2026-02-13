'use client';
import { useState, useEffect, useCallback } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import { useAI } from '@/components/providers/AIProvider';
import { sendMessage } from '@/lib/ai/router';
import { buildBrandContext, buildSystemPrompt } from '@/lib/memory/context';
import db, { logActivity } from '@/lib/memory/db';
import styles from './agent.module.css';

const AGENT_CAPABILITIES = [
    { icon: '📋', label: 'Create Project', desc: 'Setup a new project with tasks' },
    { icon: '📝', label: 'Write Content', desc: 'Generate marketing copy or documents' },
    { icon: '📊', label: 'Analyze Brand', desc: 'Review brand status and suggest improvements' },
    { icon: '👥', label: 'Team Task', desc: 'Assign tasks to team members' },
    { icon: '📣', label: 'Campaign Plan', desc: 'Design a marketing campaign' },
    { icon: '🎯', label: 'Strategy', desc: 'Develop business strategy recommendations' },
];

export default function AgentPage() {
    const { brand } = useBrand();
    const { provider, apiKeys, models } = useAI();
    const [task, setTask] = useState('');
    const [status, setStatus] = useState('idle'); // idle | thinking | executing | done | error
    const [steps, setSteps] = useState([]);
    const [result, setResult] = useState('');

    const executeTask = useCallback(async () => {
        if (!task.trim() || status === 'thinking' || status === 'executing') return;

        setStatus('thinking');
        setSteps([]);
        setResult('');

        const brandContext = brand ? await buildBrandContext(brand.id) : '';

        const agentPrompt = `You are Brand AI Agent — an autonomous task executor. You break down tasks into clear steps and execute them.

${brandContext}

The user has asked you to: "${task}"

You must:
1. Analyze the task
2. Break it into numbered steps
3. Execute each step and provide the result
4. Provide a final summary

Format your response as:
**Analysis:** Brief analysis
**Steps:**
1. [Step description] → [Result]
2. [Step description] → [Result]
...
**Summary:** Final summary of what was accomplished`;

        try {
            setSteps([{ text: 'Analyzing task...', status: 'active' }]);

            const fullResponse = await sendMessage({
                provider, apiKey: apiKeys[provider] || '', model: models[provider],
                messages: [{ role: 'user', content: task }],
                systemPrompt: agentPrompt,
                onChunk: (chunk, fullText) => {
                    setResult(fullText);
                    // Parse steps from response
                    const stepLines = fullText.match(/\d+\.\s+.+/g);
                    if (stepLines) {
                        setSteps(stepLines.map((s, i) => ({
                            text: s.replace(/^\d+\.\s+/, ''),
                            status: i < stepLines.length - 1 ? 'done' : 'active',
                        })));
                    }
                },
            });

            setStatus('done');
            if (brand) await logActivity(brand.id, 'agent', `Agent task: "${task.slice(0, 50)}..."`);

        } catch (err) {
            setStatus('error');
            setResult(`⚠️ Error: ${err.message}`);
        }
    }, [task, status, brand, provider, apiKeys, models]);

    if (!brand) {
        return (
            <AppShell pageTitle="AI Agent">
                <div className={styles.empty}><div className={styles.emptyIcon}>⚡</div><h2>Setup your brand first</h2></div>
            </AppShell>
        );
    }

    return (
        <AppShell pageTitle="AI Agent">
            <div className={styles.page}>
                <div className={styles.header}>
                    <div>
                        <h2 className={styles.title}>AI Agent</h2>
                        <p className={styles.subtitle}>Autonomous task execution for your brand</p>
                    </div>
                    <div className={`${styles.statusBadge} ${styles[status]}`}>
                        {status === 'idle' && '🟢 Ready'}
                        {status === 'thinking' && '🔵 Thinking...'}
                        {status === 'executing' && '🟡 Executing...'}
                        {status === 'done' && '✅ Complete'}
                        {status === 'error' && '🔴 Error'}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className={styles.capabilities}>
                    {AGENT_CAPABILITIES.map((cap, i) => (
                        <button key={i} className={styles.capCard} onClick={() => setTask(cap.desc)}>
                            <span className={styles.capIcon}>{cap.icon}</span>
                            <span className={styles.capLabel}>{cap.label}</span>
                        </button>
                    ))}
                </div>

                {/* Task Input */}
                <div className={styles.inputArea}>
                    <textarea className={styles.taskInput} placeholder="Describe a task for the AI Agent (e.g., 'Create a 3-month marketing plan for my brand')"
                        value={task} onChange={e => setTask(e.target.value)} rows={3} disabled={status === 'thinking' || status === 'executing'} />
                    <button className={styles.executeBtn} onClick={executeTask} disabled={!task.trim() || status === 'thinking' || status === 'executing'}>
                        {status === 'thinking' || status === 'executing' ? '⏳ Working...' : '⚡ Execute Task'}
                    </button>
                </div>

                {/* Steps Progress */}
                {steps.length > 0 && (
                    <div className={styles.stepsPanel}>
                        <h3>Execution Steps</h3>
                        <div className={styles.stepsList}>
                            {steps.map((step, i) => (
                                <div key={i} className={`${styles.step} ${styles[step.status]}`}>
                                    <span className={styles.stepIcon}>
                                        {step.status === 'done' ? '✅' : step.status === 'active' ? '⏳' : '⬜'}
                                    </span>
                                    <span>{step.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Result */}
                {result && (
                    <div className={styles.resultPanel}>
                        <h3>Agent Output</h3>
                        <div className={styles.resultContent}>{result}</div>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
