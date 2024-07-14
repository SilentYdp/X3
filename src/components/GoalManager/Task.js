import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faStop, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { ProgressBar } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import moment from 'moment';

const Task = ({ task, goalId, taskCategories, fetchGoals, deleteTask }) => {
    const [isTiming, setIsTiming] = useState(false);
    const [formattedTime, setFormattedTime] = useState('0:00');
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);

    const handleEditTask = async (field, value) => {
        const updatedTask = { ...task, [field]: value };
        try {
            console.log(`Updating task: ${goalId}/tasks/${task._id}`);
            await axios.put(`http://localhost:5000/goals/${goalId}/tasks/${task._id}`, updatedTask);
            fetchGoals();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const startTimingTask = () => {
        setIsTiming(true);
        startTimeRef.current = moment();
        intervalRef.current = setInterval(() => {
            const elapsedTime = moment().diff(startTimeRef.current, 'seconds');
            const minutes = Math.floor(elapsedTime / 60);
            const seconds = elapsedTime % 60;
            setFormattedTime(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }, 1000);
    };

    const stopTimingTask = async () => {
        clearInterval(intervalRef.current);
        setIsTiming(false);

        const endTime = moment();
        const duration = endTime.diff(startTimeRef.current, 'minutes'); // 计算分钟数

        // 先取出当前存储的investedTime
        try {
            const goalResponse = await axios.get(`http://localhost:5000/goals/${goalId}`);
            const taskFromServer = goalResponse.data.tasks.find(t => t._id === task._id);
            const currentInvestedTime = taskFromServer.investedTime;

            // 计算新的investedTime
            const updatedInvestedTime = currentInvestedTime + duration;

            // 更新任务的investedTime
            const updatedTask = { ...task, investedTime: updatedInvestedTime };
            await axios.put(`http://localhost:5000/goals/${goalId}/tasks/${task._id}`, updatedTask);
            fetchGoals();
        } catch (error) {
            console.error('Error updating task duration:', error);
        }
    };

    const getProgress = (investedTime, expectedTime) => {
        if (!expectedTime) return 0;
        return Math.min((investedTime / expectedTime) * 100, 100);
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
                    <Typeahead
                        id={`task-category-${task._id}`}
                        options={taskCategories}
                        selected={task.category ? [task.category] : []}
                        onChange={(selected) => handleEditTask('category', selected[0] || '')}
                        placeholder="Select category"
                        allowNew
                        newSelectionPrefix="Add a new category: "
                        className="task-category me-2"
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
                    {isTiming && (
                        <span className="me-2">
                            {formattedTime}
                        </span>
                    )}
                    <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => isTiming ? stopTimingTask() : startTimingTask()}
                    >
                        <FontAwesomeIcon icon={isTiming ? faStop : faPlay} />
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
