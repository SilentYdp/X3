import React from 'react';
import axios from 'axios';
import Task from './Task';
import TaskForm from './TaskForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const Goal = ({ goal, taskCategories, fetchGoals, deleteGoal }) => {
    const handleEditGoal = async (goalId, field, value) => {
        const updatedGoal = { ...goal, [field]: value };
        try {
            await axios.put(`http://localhost:5000/goals/${goalId}`, updatedGoal);
            fetchGoals();
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const deleteTask = async (goalId, taskId) => {
        try {
            await axios.delete(`http://localhost:5000/goals/${goalId}/tasks/${taskId}`);
            fetchGoals();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h5 contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'name', e.target.innerText)}>
                        {goal.name}
                    </h5>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'description', e.target.innerText)}>
                        {goal.description}
                    </p>
                    <span>Expected Time: {goal.expectedTime} mins</span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteGoal(goal._id)}>
                    <FontAwesomeIcon icon={faTrash} />
                </button>
            </div>
            <div className="card-body">
                <h5>Tasks</h5>
                {goal.tasks.map((task) => (
                    <Task key={task._id} task={task} goalId={goal._id} taskCategories={taskCategories} fetchGoals={fetchGoals} deleteTask={deleteTask} />
                ))}
                <TaskForm goalId={goal._id} taskCategories={taskCategories} fetchGoals={fetchGoals} />
            </div>
        </div>
    );
};

export default Goal;
