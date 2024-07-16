import React, { useState, useEffect } from 'react';
import moment from 'moment';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import './TaskTracker.css'; // 引入CSS文件

const TaskTracker = () => {
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState('');
    const [taskCategory, setTaskCategory] = useState('');
    const [taskCategories, setTaskCategories] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isTiming, setIsTiming] = useState(false);
    const [elapsedTime, setElapsedTime] = useState(0);

    useEffect(() => {
        const fetchTasks = async () => {
            const response = await axios.get('http://localhost:5000/tasks');
            setTasks(response.data);
        };

        const fetchCategories = async () => {
            const response = await axios.get('http://localhost:5000/categories');
            setTaskCategories(response.data.map(cat => cat.name));
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
                setElapsedTime(moment().diff(startTime, 'seconds'));
            }, 1000);
        } else {
            setElapsedTime(0);
        }
        return () => clearInterval(timer);
    }, [isTiming, startTime]);

    const handleStart = () => {
        setStartTime(moment());
        setIsTiming(true);
    };

    const handleEnd = async () => {
        const endTime = moment();
        const taskDuration = endTime.diff(startTime, 'minutes'); // duration in minutes
        const newTask = { task: currentTask, category: taskCategory, duration: taskDuration, startTime, endTime };
        const response = await axios.post('http://localhost:5000/tasks', newTask);
        setTasks([...tasks, response.data]);
        setCurrentTask('');
        setTaskCategory('');
        setStartTime(null);
        setEndTime(null);
        setIsTiming(false);
    };

    const addTaskCategory = async () => {
        const newCategory = prompt('Enter new task category:');
        if (newCategory && !taskCategories.includes(newCategory)) {
            await axios.post('http://localhost:5000/categories', { name: newCategory });
            setTaskCategories([...taskCategories, newCategory]);
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
        await axios.put(`http://localhost:5000/tasks/${task._id}`, updatedTask);
    };

    const handleDeleteTask = async (id) => {
        await axios.delete(`http://localhost:5000/tasks/${id}`);
        setTasks(tasks.filter(task => task._id !== id));
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
                            options={taskCategories}
                            selected={taskCategory ? [taskCategory] : []}
                            onChange={(selected) => setTaskCategory(selected[0] || '')}
                            placeholder="Select category"
                            allowNew
                            newSelectionPrefix="Add a new category: "
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
                                            options={taskCategories}
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
        </div>
    );
};

export default TaskTracker;
