import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Task from './Task';
import TaskForm from './TaskForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckSquare, faSquare } from '@fortawesome/free-solid-svg-icons';
import { Typeahead } from 'react-bootstrap-typeahead';

const Goal = ({ goal, taskCategories, fetchGoals, deleteGoal }) => {
    const [rewards, setRewards] = useState([]);
    const [selectedReward, setSelectedReward] = useState([]);

    useEffect(() => {
        fetchRewards();
    }, []);

    const fetchRewards = async () => {
        try {
            const response = await axios.get('http://localhost:5000/rewards/unbound');
            setRewards(response.data);
        } catch (error) {
            console.error('Error fetching rewards:', error);
        }
    };

    const handleEditGoal = async (goalId, field, value) => {
        const updatedGoal = { ...goal, [field]: value };
        try {
            await axios.put(`http://localhost:5000/goals/${goalId}`, updatedGoal);
            fetchGoals();
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const toggleGoalComplete = async (goalId) => {
        const updatedGoal = { ...goal, isComplete: !goal.isComplete };
        try {
            await axios.put(`http://localhost:5000/goals/${goalId}`, updatedGoal);
            fetchGoals();
        } catch (error) {
            console.error('Error toggling goal complete:', error);
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

    const handleRewardSelect = async (selected) => {
        if (selected.length > 0) {
            const rewardId = selected[0]._id;
            const updatedGoal = { ...goal, rewardId };
            try {
                await axios.put(`http://localhost:5000/goals/${goal._id}`, updatedGoal);
                await axios.put(`http://localhost:5000/rewards/${rewardId}/bind`, { goalId: goal._id });
                fetchGoals();
            } catch (error) {
                console.error('Error binding reward:', error);
            }
        }
    };

    useEffect(() => {
        const allTasksComplete = goal.tasks.every(task => task.isComplete);
        if (allTasksComplete && !goal.isComplete) {
            toggleGoalComplete(goal._id);
        }
    }, [goal.tasks, goal._id, goal.isComplete]); // 修改依赖项

    return (
        <div className={`card mb-4 ${goal.isComplete ? 'bg-success text-white' : ''}`}>
            <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                    <h5 contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'name', e.target.innerText)}>
                        {goal.name}
                    </h5>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'description', e.target.innerText)}>
                        {goal.description}
                    </p>
                    <span>
                        Expected Time: <span contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'expectedTime', e.target.innerText)}>
                            {goal.expectedTime}
                        </span> mins
                    </span>
                    <Typeahead
                        id="reward-selector"
                        labelKey="name"
                        options={rewards}
                        onChange={handleRewardSelect}
                        placeholder="Choose a reward to bind..."
                        selected={selectedReward}
                    />
                </div>
                <div>
                    <button className="btn btn-sm" onClick={() => toggleGoalComplete(goal._id)}>
                        <FontAwesomeIcon icon={goal.isComplete ? faCheckSquare : faSquare} />
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteGoal(goal._id)}>
                        <FontAwesomeIcon icon={faTrash} />
                    </button>
                </div>
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
