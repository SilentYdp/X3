import React, { useState, useRef } from 'react';
import moment from 'moment';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from 'react-bootstrap';
import TypeaheadWrapper from './common/TypeaheadWrapper';

const Task = ({ task, goalId, taskCategories, fetchGoals, deleteTask }) => {
    const [timingTasks, setTimingTasks] = useState({});
    const intervalRef = useRef({});

    const startTimingTask = (taskId) => {
        setTimingTasks(prevTimingTasks => ({
            ...prevTimingTasks,
            [taskId]: {
                ...prevTimingTasks[taskId],
                startTime: moment(),
                isTiming: true,
                formattedTime: '0:00',
            },
        }));
    };

    const stopTimingTask = async (taskId) => {
        const timingTask = timingTasks[taskId];
        if (!timingTask) return;

        const endTime = moment();
        const duration = endTime.diff(timingTask.startTime, 'minutes');

        try {
            const goalResponse = await axios.get(`http://localhost:5000/goals/${goalId}`);
            const task = goalResponse.data.tasks.find(t => t._id === taskId);
            const currentInvestedTime = task.investedTime;
            const updatedInvestedTime = currentInvestedTime + duration;

            await axios.put(`http://localhost:5000/goals/${goalId}/tasks/${taskId}`, {
                investedTime: updatedInvestedTime,
            });
            fetchGoals();
        } catch (error) {
            console.error('Error updating task duration:', error);
        }

        setTimingTasks(prevTimingTasks => ({
            ...prevTimingTasks,
            [taskId]: {
                ...timingTask,
                isTiming: false,
            },
        }));
    };

    const getProgress = (investedTime, expectedTime) => {
        if (!expectedTime) return 0;
        return Math.min((investedTime / expectedTime) * 100, 100);
    };

    const handleEditTask = async (field, value) => {
        const updatedTask = { ...task, [field]: value };
        try {
            await axios.put(`http://localhost:5000/goals/${goalId}/tasks/${task._id}`, updatedTask);
            fetchGoals();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    return (
        <div className="task-item mb-2">
            <div className="d-flex justify-content-between align-items-center">
                <div className="task-details d-flex align-items-center flex-grow-1">
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => handleEditTask('task', e.target.innerText)}
                        className="task-name me-2 flex-grow-1"
                    >
                        {task.task}
                    </div>
                    <TypeaheadWrapper
                        id={`task-category-${task._id}`}
                        options={taskCategories}
                        selected={task.category ? [task.category] : []}
                        onChange={(selected) => handleEditTask('category', selected[0] || '')}
                        placeholder="Select category"
                    />
                    <input
                        type="number"
                        className="form-control task-expected-time me-2"
                        value={task.expectedTime}
                        onChange={(e) => handleEditTask('expectedTime', e.target.value)}
                        placeholder="Expected Time (mins)"
                    />
                    <span>Invested Time: {task.investedTime.toFixed(2) || 0} mins</span>
                </div>
                <div className="task-actions">
                    {timingTasks[task._id]?.isTiming && (
                        <span className="me-2">
                            {timingTasks[task._id].formattedTime}
                        </span>
                    )}
                    <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => timingTasks[task._id]?.isTiming ? stopTimingTask(task._id) : startTimingTask(task._id)}
                    >
                        <FontAwesomeIcon icon={timingTasks[task._id]?.isTiming ? faStop : faPlay} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteTask(goalId, task._id)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
            </div>
            <ProgressBar
                now={getProgress(task.investedTime, task.expectedTime)}
                label={`${getProgress(task.investedTime, task.expectedTime).toFixed(2)}%`}
            />
        </div>
    );
};

export default Task;
