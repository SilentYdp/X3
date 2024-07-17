import React, { useState } from 'react';
import axios from 'axios';
import TypeaheadWrapper from './common/TypeaheadWrapper';

const TaskForm = ({ goalId, taskCategories, fetchGoals }) => {
    const [taskName, setTaskName] = useState('');
    const [taskCategory, setTaskCategory] = useState('');
    const [taskExpectedTime, setTaskExpectedTime] = useState(0);

    const addTaskToGoal = async () => {
        try {
            const newTask = { task: taskName, category: taskCategory, expectedTime: taskExpectedTime, investedTime: 0 };
            await axios.post(`/goals/${goalId}/tasks`, newTask);
            fetchGoals();
            setTaskName('');
            setTaskCategory('');
            setTaskExpectedTime(0);
        } catch (error) {
            console.error('Error adding task to goal:', error);
        }
    };

    return (
        <div className="input-group mt-3">
            <input
                type="text"
                className="form-control"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Task Name"
            />
            <TypeaheadWrapper
                id="task-category"
                options={taskCategories}
                selected={taskCategory ? [taskCategory] : []}
                onChange={(selected) => setTaskCategory(selected[0] || '')}
                placeholder="Select category"
            />
            <input
                type="number"
                className="form-control"
                value={taskExpectedTime}
                onChange={(e) => setTaskExpectedTime(e.target.value)}
                placeholder="Expected Time (mins)"
            />
            <button className="btn btn-success" onClick={addTaskToGoal}>Add Task</button>
        </div>
    );
};

export default TaskForm;
