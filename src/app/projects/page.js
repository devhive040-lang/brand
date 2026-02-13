'use client';
import { useState, useEffect } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useBrand } from '@/components/providers/BrandProvider';
import db, { logActivity } from '@/lib/memory/db';
import styles from './projects.module.css';

const COLUMNS = [
    { key: 'todo', label: 'To Do', color: 'var(--text-secondary)' },
    { key: 'in-progress', label: 'In Progress', color: 'var(--brand-primary)' },
    { key: 'review', label: 'Review', color: 'var(--warning)' },
    { key: 'done', label: 'Done', color: 'var(--success)' },
];

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function ProjectsPage() {
    const { brand } = useBrand();
    const [projects, setProjects] = useState([]);
    const [activeProject, setActiveProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [showNewProject, setShowNewProject] = useState(false);
    const [showNewTask, setShowNewTask] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '' });
    const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' });
    const [view, setView] = useState('kanban');

    useEffect(() => { if (brand) loadProjects(); }, [brand]);
    useEffect(() => { if (activeProject) loadTasks(); }, [activeProject]);

    const loadProjects = async () => {
        const p = await db.projects.where('brandId').equals(brand.id).toArray();
        setProjects(p);
        if (p.length > 0 && !activeProject) setActiveProject(p[0]);
    };

    const loadTasks = async () => {
        const t = await db.tasks.where('projectId').equals(activeProject.id).toArray();
        setTasks(t);
    };

    const addProject = async () => {
        if (!newProject.name.trim()) return;
        const id = await db.projects.add({
            brandId: brand.id, ...newProject, status: 'active', createdAt: new Date().toISOString(),
        });
        await logActivity(brand.id, 'project', `Project "${newProject.name}" created`);
        setNewProject({ name: '', description: '' });
        setShowNewProject(false);
        await loadProjects();
        setActiveProject(await db.projects.get(id));
    };

    const addTask = async () => {
        if (!newTask.title.trim()) return;
        await db.tasks.add({
            projectId: activeProject.id, ...newTask, createdAt: new Date().toISOString(),
        });
        await logActivity(brand.id, 'task', `Task "${newTask.title}" added to ${activeProject.name}`);
        setNewTask({ title: '', description: '', priority: 'medium', status: 'todo', dueDate: '' });
        setShowNewTask(false);
        await loadTasks();
    };

    const moveTask = async (taskId, newStatus) => {
        await db.tasks.update(taskId, { status: newStatus });
        await loadTasks();
    };

    const deleteTask = async (taskId) => {
        await db.tasks.delete(taskId);
        await loadTasks();
    };

    if (!brand) {
        return (
            <AppShell pageTitle="Projects">
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📋</div>
                    <h2>Setup your brand first</h2>
                    <p>Go to Brand Identity to create your brand, then come back to manage projects.</p>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell pageTitle="Projects">
            <div className={styles.page}>
                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.projectTabs}>
                        {projects.map(p => (
                            <button key={p.id} className={`${styles.projTab} ${activeProject?.id === p.id ? styles.activeProj : ''}`}
                                onClick={() => setActiveProject(p)}>
                                {p.name}
                            </button>
                        ))}
                        <button className={styles.addProjBtn} onClick={() => setShowNewProject(true)}>+ New Project</button>
                    </div>
                    <div className={styles.viewToggle}>
                        <button className={`${styles.viewBtn} ${view === 'kanban' ? styles.activeView : ''}`} onClick={() => setView('kanban')}>⊞ Kanban</button>
                        <button className={`${styles.viewBtn} ${view === 'list' ? styles.activeView : ''}`} onClick={() => setView('list')}>☰ List</button>
                    </div>
                </div>

                {/* New Project Modal */}
                {showNewProject && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>New Project</h3>
                            <input placeholder="Project name" value={newProject.name} onChange={e => setNewProject(p => ({ ...p, name: e.target.value }))} />
                            <textarea placeholder="Description" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} rows={3} />
                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => setShowNewProject(false)}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={addProject}>Create</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Kanban Board */}
                {activeProject && view === 'kanban' && (
                    <div className={styles.kanban}>
                        {COLUMNS.map(col => (
                            <div key={col.key} className={styles.column}>
                                <div className={styles.colHeader}>
                                    <span className={styles.colDot} style={{ background: col.color }} />
                                    <h4>{col.label}</h4>
                                    <span className={styles.colCount}>{tasks.filter(t => t.status === col.key).length}</span>
                                </div>
                                <div className={styles.colCards}>
                                    {tasks.filter(t => t.status === col.key).map(task => (
                                        <div key={task.id} className={styles.taskCard}>
                                            <div className={styles.taskHeader}>
                                                <span className={`${styles.priority} ${styles[task.priority]}`}>{task.priority}</span>
                                                <button className={styles.deleteBtn} onClick={() => deleteTask(task.id)}>×</button>
                                            </div>
                                            <h5 className={styles.taskTitle}>{task.title}</h5>
                                            {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                                            {task.dueDate && <span className={styles.dueDate}>📅 {task.dueDate}</span>}
                                            <div className={styles.taskActions}>
                                                {COLUMNS.filter(c => c.key !== task.status).map(c => (
                                                    <button key={c.key} className={styles.moveBtn} onClick={() => moveTask(task.id, c.key)} title={`Move to ${c.label}`}>
                                                        → {c.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {col.key === 'todo' && (
                                    <button className={styles.addTaskBtn} onClick={() => setShowNewTask(true)}>+ Add Task</button>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* List View */}
                {activeProject && view === 'list' && (
                    <div className={styles.listView}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Task</th><th>Status</th><th>Priority</th><th>Due Date</th><th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map(task => (
                                    <tr key={task.id}>
                                        <td>{task.title}</td>
                                        <td><span className={styles.statusBadge} style={{ color: COLUMNS.find(c => c.key === task.status)?.color }}>{task.status}</span></td>
                                        <td><span className={`${styles.priority} ${styles[task.priority]}`}>{task.priority}</span></td>
                                        <td>{task.dueDate || '—'}</td>
                                        <td>
                                            <button className={styles.deleteBtn} onClick={() => deleteTask(task.id)}>🗑️</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className={styles.addTaskBtn} onClick={() => setShowNewTask(true)}>+ Add Task</button>
                    </div>
                )}

                {/* New Task Modal */}
                {showNewTask && (
                    <div className={styles.modal}>
                        <div className={styles.modalContent}>
                            <h3>New Task</h3>
                            <input placeholder="Task title" value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))} />
                            <textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask(t => ({ ...t, description: e.target.value }))} rows={2} />
                            <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}>
                                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <input type="date" value={newTask.dueDate} onChange={e => setNewTask(t => ({ ...t, dueDate: e.target.value }))} />
                            <div className={styles.modalActions}>
                                <button className={styles.btnSecondary} onClick={() => setShowNewTask(false)}>Cancel</button>
                                <button className={styles.btnPrimary} onClick={addTask}>Add Task</button>
                            </div>
                        </div>
                    </div>
                )}

                {!activeProject && projects.length === 0 && (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>📋</div>
                        <h2>No projects yet</h2>
                        <p>Create your first project to start managing tasks.</p>
                        <button className={styles.btnPrimary} onClick={() => setShowNewProject(true)}>+ Create Project</button>
                    </div>
                )}
            </div>
        </AppShell>
    );
}
