
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Plus, Trash2, Search, Calendar, Flag, ChevronDown, Check, X, AlertCircle, TrendingUp } from 'lucide-react';

const StudentTodoApp = () => {
    const [tasks, setTasks] = useState([
        { id: 1, text: 'Complete Math Homework 5.1', completed: false, priority: 'High', dueDate: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], category: 'Homework' },
        { id: 2, text: 'Study for History Midterm', completed: false, priority: 'High', dueDate: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], category: 'Exam Prep' },
        { id: 3, text: 'Start final project proposal', completed: true, priority: 'Medium', dueDate: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString().split('T')[0], category: 'Project' },
        { id: 4, text: 'Schedule a group meeting', completed: false, priority: 'Low', dueDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], category: 'Personal' },
    ]);

    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskPriority, setNewTaskPriority] = useState('Medium');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [newTaskCategory, setNewTaskCategory] = useState('Homework');
    
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('dueDate');
    const [showCompleted, setShowCompleted] = useState(true);
    const [error, setError] = useState('');

    const [priorityDropdownOpen, setPriorityDropdownOpen] = useState(false);
    const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

    const PRIORITY_MAP = { High: 1, Medium: 2, Low: 3 };
    const PRIORITY_STYLES = {
        High: 'bg-rose-100 text-rose-700 border-rose-200',
        Medium: 'bg-amber-100 text-amber-700 border-amber-200',
        Low: 'bg-sky-100 text-sky-700 border-sky-200',
    };
    const CATEGORIES = ['Homework', 'Exam Prep', 'Project', 'Reading', 'Personal'];

    const handleAddTask = useCallback((e) => {
        e.preventDefault();
        if (newTaskText.trim() === '') {
            setError('Task cannot be empty.');
            setTimeout(() => setError(''), 2000);
            return;
        }
        const newTask = {
            id: Date.now(),
            text: newTaskText.trim(),
            completed: false,
            priority: newTaskPriority,
            dueDate: newTaskDueDate || new Date(new Date().setDate(new Date().getDate() + 7)).toISOString().split('T')[0],
            category: newTaskCategory,
        };
        setTasks(prevTasks => [newTask, ...prevTasks]);
        setNewTaskText('');
        setNewTaskPriority('Medium');
        setNewTaskDueDate('');
        setNewTaskCategory('Homework');
        setError('');
    }, [newTaskText, newTaskPriority, newTaskDueDate, newTaskCategory]);

    const handleToggleComplete = useCallback((id) => {
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, completed: !task.completed } : task
            )
        );
    }, []);

    const handleDeleteTask = useCallback((id) => {
        setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
    }, []);

    const handleClearCompleted = useCallback(() => {
        setTasks(prevTasks => prevTasks.filter(task => !task.completed));
    }, []);

    const filteredAndSortedTasks = useMemo(() => {
        return tasks
            .filter(task => {
                const matchesFilter = filter === 'all' || (filter === 'active' && !task.completed) || (filter === 'completed' && task.completed);
                const matchesSearch = task.text.toLowerCase().includes(searchTerm.toLowerCase());
                const matchesShowCompleted = showCompleted || !task.completed;
                return matchesFilter && matchesSearch && matchesShowCompleted;
            })
            .sort((a, b) => {
                if (sortBy === 'priority') {
                    return PRIORITY_MAP[a.priority] - PRIORITY_MAP[b.priority];
                }
                if (sortBy === 'dueDate') {
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                }
                return 0; // default order
            });
    }, [tasks, filter, searchTerm, sortBy, showCompleted]);
    
    const analytics = useMemo(() => {
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
        const today = new Date().toISOString().split('T')[0];
        const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < today).length;
        return { progress, overdueTasks };
    }, [tasks]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.priority-dropdown')) {
                setPriorityDropdownOpen(false);
            }
            if (!event.target.closest('.category-dropdown')) {
                setCategoryDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const TaskItem = ({ task }) => {
        const isOverdue = !task.completed && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));

        return (
            <li className="flex items-center p-4 bg-slate-800 rounded-lg transition-all duration-300 hover:bg-slate-700/50 group">
                <button
                    onClick={() => handleToggleComplete(task.id)}
                    aria-label={`Mark task as ${task.completed ? 'incomplete' : 'complete'}`}
                    className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                        task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 group-hover:border-indigo-500'
                    }`}
                >
                    {task.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                <div className="flex-grow mx-4">
                    <p className={`transition-colors duration-300 ${task.completed ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
                        {task.text}
                    </p>
                    <div className="flex items-center space-x-3 text-xs mt-1 text-slate-400">
                        <div className="flex items-center space-x-1">
                            <Calendar className={`w-3 h-3 ${isOverdue ? 'text-rose-400' : ''}`} />
                            <span className={isOverdue ? 'text-rose-400 font-semibold' : ''}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric'}) : 'No due date'}</span>
                        </div>
                        <span className="text-slate-600">•</span>
                        <div className="flex items-center space-x-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${PRIORITY_STYLES[task.priority]}`}>{task.priority}</span>
                        </div>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400">{task.category}</span>
                    </div>
                </div>
                <button onClick={() => handleDeleteTask(task.id)} aria-label="Delete task" className="flex-shrink-0 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-rose-500">
                    <Trash2 className="w-5 h-5" />
                </button>
            </li>
        );
    };

    return (
        <div className="bg-slate-900 min-h-screen font-sans text-slate-300 p-4 sm:p-6 lg:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-white tracking-tight">Student Task Hub</h1>
                    <p className="text-slate-400 mt-1">Organize your academic life with precision and style.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        {/* Add Task Form */}
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                            <h2 className="text-lg font-semibold text-white mb-4">Add a New Task</h2>
                            <form onSubmit={handleAddTask} className="space-y-4">
                                <div>
                                    <label htmlFor="task-input" className="sr-only">New task</label>
                                    <input
                                        id="task-input"
                                        type="text"
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        placeholder="e.g., Read Chapter 4 of Biology"
                                        className={`w-full bg-slate-900 border-2 rounded-md px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all ${error ? 'border-rose-500 animate-shake' : 'border-slate-700'}`}
                                        aria-invalid={!!error}
                                        aria-describedby={error ? "task-error" : undefined}
                                    />
                                    {error && <p id="task-error" className="text-rose-500 text-sm mt-2 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{error}</p>}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="relative priority-dropdown">
                                        <button type="button" onClick={() => setPriorityDropdownOpen(o => !o)} className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-left">
                                            <span className="flex items-center"><Flag className="w-4 h-4 mr-2" />{newTaskPriority}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${priorityDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {priorityDropdownOpen && (
                                            <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
                                                {Object.keys(PRIORITY_MAP).map(p => (
                                                    <li key={p} onClick={() => { setNewTaskPriority(p); setPriorityDropdownOpen(false); }} className="px-3 py-2 text-sm hover:bg-indigo-600 cursor-pointer rounded-md">{p}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <div className="relative category-dropdown">
                                        <button type="button" onClick={() => setCategoryDropdownOpen(o => !o)} className="w-full flex items-center justify-between bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm text-left">
                                            <span className="flex items-center">{newTaskCategory}</span>
                                            <ChevronDown className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {categoryDropdownOpen && (
                                            <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-slate-700 rounded-md shadow-lg">
                                                {CATEGORIES.map(c => (
                                                    <li key={c} onClick={() => { setNewTaskCategory(c); setCategoryDropdownOpen(false); }} className="px-3 py-2 text-sm hover:bg-indigo-600 cursor-pointer rounded-md">{c}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <label htmlFor="due-date" className="sr-only">Due date</label>
                                    <input
                                        id="due-date"
                                        type="date"
                                        value={newTaskDueDate}
                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-md px-3 py-2 text-sm"
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                                <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-md flex items-center justify-center hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500 transition-all duration-300">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add Task
                                </button>
                            </form>
                        </div>

                        {/* Analytics Section */}
                        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700/50">
                             <h2 className="text-lg font-semibold text-white mb-4 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-indigo-400" />Productivity Stats</h2>
                             <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between items-center mb-1 text-sm">
                                        <span className="font-medium text-slate-300">Completion Progress</span>
                                        <span className="text-indigo-400 font-semibold">{analytics.progress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-700 rounded-full h-2.5">
                                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${analytics.progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm p-3 bg-slate-900/50 rounded-md">
                                    <span className="text-slate-400">Overdue Tasks</span>
                                    <span className={`font-bold ${analytics.overdueTasks > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>{analytics.overdueTasks}</span>
                                </div>
                             </div>
                        </div>

                    </div>
                    
                    <div className="lg:col-span-2">
                        <div className="bg-slate-800/50 p-2 sm:p-4 rounded-xl border border-slate-700/50">
                            {/* Controls */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                                <div className="relative w-full sm:w-auto flex-grow max-w-xs">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input 
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-400">Sort by:</span>
                                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="bg-slate-900 border border-slate-700 rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                        <option value="dueDate">Due Date</option>
                                        <option value="priority">Priority</option>
                                    </select>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="flex items-center justify-between border-b border-t border-slate-700 px-4 py-2">
                                <div className="flex space-x-1 sm:space-x-2 bg-slate-900 p-1 rounded-md">
                                    {['all', 'active', 'completed'].map(f => (
                                        <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-700'}`}>
                                            {f.charAt(0).toUpperCase() + f.slice(1)}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label htmlFor="show-completed" className="text-sm text-slate-400 cursor-pointer">Show Completed</label>
                                    <button
                                      role="switch"
                                      aria-checked={showCompleted}
                                      onClick={() => setShowCompleted(!showCompleted)}
                                      id="show-completed"
                                      className={`${
                                        showCompleted ? 'bg-indigo-600' : 'bg-slate-700'
                                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                                    >
                                      <span
                                        className={`${
                                          showCompleted ? 'translate-x-6' : 'translate-x-1'
                                        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                                      />
                                    </button>
                                </div>
                            </div>

                            {/* Task List */}
                            <div className="p-4 min-h-[400px]">
                                {filteredAndSortedTasks.length > 0 ? (
                                    <ul className="space-y-3">
                                        {filteredAndSortedTasks.map(task => (
                                            <TaskItem key={task.id} task={task} />
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-16">
                                        <p className="text-slate-500">No tasks match your current filters.</p>
                                        <p className="text-slate-500 text-sm">Time to add something new!</p>
                                    </div>
                                )}
                            </div>

                            {tasks.some(t => t.completed) && (
                                <div className="p-4 border-t border-slate-700 text-center">
                                    <button onClick={handleClearCompleted} className="text-sm text-slate-400 hover:text-white transition-colors">
                                        Clear Completed Tasks
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentTodoApp;
