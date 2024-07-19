import React, { useState, useEffect } from 'react';
import moment from 'moment';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faPlus, faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Typeahead, Highlighter } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './TaskTracker.css'; // 引入CSS文件

const TaskTracker = () => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState(localStorage.getItem('currentTask') || '');
    const [taskCategory, setTaskCategory] = useState(localStorage.getItem('taskCategory') || '');
    const [taskCategories, setTaskCategories] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [isTiming, setIsTiming] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [newTask, setNewTask] = useState({
        task: '',
        category: '',
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        const fetchTasks = async () => {
            const response = await axios.get('/tasks');
            setTasks(response.data);
        };

        const fetchCategories = async () => {
            const response = await axios.get('/categories');
            setTaskCategories(response.data);
        };

        fetchTasks();
        fetchCategories();
    }, []);

    useEffect(() => {
        localStorage.setItem('taskCategories', JSON.stringify(taskCategories));
    }, [taskCategories]);

    useEffect(() => {
        let timer;
        if (isTiming) {
            timer = setInterval(() => {
                setElapsedTime(moment().diff(moment(startTime), 'seconds'));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(timer);
    }, [isTiming, startTime]);

    useEffect(() => {
        const savedTimingState = localStorage.getItem('isTiming');
        const savedStartTime = localStorage.getItem('startTime');

        if (savedTimingState === 'true' && savedStartTime) {
            setIsTiming(true);
            setStartTime(moment(savedStartTime));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('isTiming', isTiming);
        if (isTiming && startTime) {
            localStorage.setItem('startTime', startTime.toISOString());
        } else {
            localStorage.removeItem('startTime');
        }
    }, [isTiming, startTime]);

    useEffect(() => {
        localStorage.setItem('currentTask', currentTask);
    }, [currentTask]);

    useEffect(() => {
        localStorage.setItem('taskCategory', taskCategory);
    }, [taskCategory]);

    const handleStart = () => {
        const now = moment();
        setStartTime(now);
        setIsTiming(true);
        localStorage.setItem('isTiming', true);
        localStorage.setItem('startTime', now.toISOString());
    };

    const handleEnd = async () => {
        const endTime = moment();
        const taskDuration = endTime.diff(startTime, 'minutes'); // duration in minutes
        const newTask = { task: currentTask, category: taskCategory, duration: taskDuration, startTime, endTime };
        const response = await axios.post('/tasks', newTask);
        setTasks([...tasks, response.data]);
        setCurrentTask('');
        setTaskCategory('');
        setStartTime(null);
        setIsTiming(false);
        localStorage.removeItem('isTiming');
        localStorage.removeItem('startTime');
        localStorage.removeItem('currentTask');
        localStorage.removeItem('taskCategory');
    };

    const addTaskCategory = async () => {
        const newCategory = prompt('Enter new task category:');
        if (newCategory && !taskCategories.find(cat => cat.name === newCategory)) {
            const response = await axios.post('/categories', { name: newCategory });
            setTaskCategories([...taskCategories, response.data]);
        }
    };

    const handleDeleteCategory = async (categoryName) => {
        if (window.confirm(`Are you sure you want to delete the category: ${categoryName}?`)) {
            try {
                await axios.delete(`/categories/${categoryName}`);
                setTaskCategories(taskCategories.filter(cat => cat.name !== categoryName));
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const handleEditTask = (task, field, value) => {
        const updatedTask = { ...task, [field]: value };
        setTasks(tasks.map(t => (t._id === task._id ? updatedTask : t)));
        saveTask(updatedTask);
    };

    const saveTask = async (task) => {
        const updatedTask = {
            ...task,
            startTime: moment(task.startTime).toISOString(),
            endTime: moment(task.endTime).toISOString(),
        };
        await axios.put(`/tasks/${task._id}`, updatedTask);
    };

    const handleDeleteTask = async (id) => {
        await axios.delete(`/tasks/${id}`);
        setTasks(tasks.filter(task => task._id !== id));
    };

    const handleAddTask = async () => {
        const { task, category, startTime, endTime } = newTask;
        const today = moment().format('YYYY-MM-DD');
        const startDateTime = moment(`${today} ${startTime}`, 'YYYY-MM-DD HH:mm').toISOString();
        const endDateTime = moment(`${today} ${endTime}`, 'YYYY-MM-DD HH:mm').toISOString();
        const taskDuration = moment(endDateTime).diff(moment(startDateTime), 'minutes');
        const response = await axios.post('/tasks', { task, category, duration: taskDuration, startTime: startDateTime, endTime: endDateTime });
        setTasks([...tasks, response.data]);
        setShowAddTaskModal(false);
        setNewTask({
            task: '',
            category: '',
            startTime: '',
            endTime: ''
        });
    };

    const groupTasksByDate = (tasks) => {
        return tasks.reduce((groups, task) => {
            const date = moment(task.startTime).format('YYYY-MM-DD');
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(task);
            return groups;
        }, {});
    };

    const tasksGroupedByDate = groupTasksByDate(tasks);
    const today = moment().format('YYYY-MM-DD');

    return (
        <div className="container">
            <h1 className="my-4">Task Tracker</h1>
            <div className="card mb-4">
                <div className="card-body">
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={currentTask}
                            onChange={(e) => setCurrentTask(e.target.value)}
                            placeholder="Enter task"
                        />
                    </div>
                    <div className="mb-3">
                        <Typeahead
                            id="task-category"
                            options={taskCategories.map(cat => cat.name)}
                            selected={taskCategory ? [taskCategory] : []}
                            onChange={(selected) => setTaskCategory(selected[0] || '')}
                            placeholder="Select category"
                            allowNew
                            newSelectionPrefix="Add a new category: "
                            renderMenuItemChildren={(option, { text }) => (
                                <div className="d-flex justify-content-between align-items-center w-100">
                                    <Highlighter search={text}>
                                        {option}
                                    </Highlighter>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleDeleteCategory(option);
                                        }}
                                    >
                                        <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                </div>
                            )}
                        />
                    </div>
                    <div className="mb-3">
                        <button className="btn btn-success me-2" onClick={addTaskCategory}>
                            <FontAwesomeIcon icon={faPlus} /> Add Category
                        </button>
                        <button className="btn btn-primary me-2" onClick={isTiming ? handleEnd : handleStart}>
                            <FontAwesomeIcon icon={isTiming ? faStop : faPlay} /> {isTiming ? 'Stop' : 'Start'}
                        </button>
                        {isTiming && <span>{moment.utc(elapsedTime * 1000).format('HH:mm:ss')}</span>}
                        <button className="btn btn-warning ms-2" onClick={() => setShowAddTaskModal(true)}>
                            <FontAwesomeIcon icon={faEdit} /> Add Task
                        </button>
                    </div>
                </div>
            </div>
            <div>
                {Object.keys(tasksGroupedByDate).sort((a, b) => moment(b).diff(moment(a))).map(date => (
                    <div key={date}>
                        <h2>{date}</h2>
                        <table className="table table-striped">
                            <thead>
                            <tr>
                                <th className="task-column">Task</th>
                                <th className="category-column">Category</th>
                                <th className="time-column">Start Time</th>
                                <th className="time-column">End Time</th>
                                <th className="duration-column">Duration (mins)</th>
                                <th className="actions-column">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tasksGroupedByDate[date].map((task, index) => (
                                <tr key={index}>
                                    <td
                                        contentEditable
                                        suppressContentEditableWarning
                                        onBlur={(e) => handleEditTask(task, 'task', e.target.innerText)}
                                        className="task-column"
                                    >
                                        {task.task}
                                    </td>
                                    <td className="category-column">
                                        <Typeahead
                                            id={`task-category-${task._id}`}
                                            options={taskCategories.map(cat => cat.name)}
                                            selected={task.category ? [task.category] : []}
                                            onChange={(selected) => handleEditTask(task, 'category', selected[0] || '')}
                                            placeholder="Select category"
                                            allowNew
                                            newSelectionPrefix="Add a new category: "
                                        />
                                    </td>
                                    <td className="time-column">
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={moment(task.startTime).format('HH:mm')}
                                            onChange={(e) => handleEditTask(task, 'startTime', moment(task.startTime).set({
                                                hour: moment(e.target.value, 'HH:mm').hours(),
                                                minute: moment(e.target.value, 'HH:mm').minutes()
                                            }))}
                                        />
                                    </td>
                                    <td className="time-column">
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={moment(task.endTime).format('HH:mm')}
                                            onChange={(e) => handleEditTask(task, 'endTime', moment(task.endTime).set({
                                                hour: moment(e.target.value, 'HH:mm').hours(),
                                                minute: moment(e.target.value, 'HH:mm').minutes()
                                            }))}
                                        />
                                    </td>
                                    <td className="duration-column">{task.duration}</td>
                                    <td className="actions-column">
                                        <button className="btn btn-sm btn-danger ms-2" onClick={() => handleDeleteTask(task._id)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>

            {/* 补录任务的模态框 */}
            {showAddTaskModal && (
                <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Add Task</h5>
                                <button type="button" className="btn-close" onClick={() => setShowAddTaskModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={newTask.task}
                                        onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                                        placeholder="Enter task"
                                    />
                                </div>
                                <div className="mb-3">
                                    <Typeahead
                                        id="new-task-category"
                                        options={taskCategories.map(cat => cat.name)}
                                        selected={newTask.category ? [newTask.category] : []}
                                        onChange={(selected) => setNewTask({ ...newTask, category: selected[0] || '' })}
                                        placeholder="Select category"
                                        allowNew
                                        newSelectionPrefix="Add a new category: "
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="time"
                                        className="form-control"
                                        value={newTask.startTime}
                                        onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                                        placeholder="Select start time"
                                    />
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="time"
                                        className="form-control"
                                        value={newTask.endTime}
                                        onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })}
                                        placeholder="Select end time"
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddTaskModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleAddTask}>Add Task</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TaskTracker;
