import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Task from './Task';
import TaskForm from './TaskForm';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faCheckSquare, faSquare, faUnlink } from '@fortawesome/free-solid-svg-icons';
import { Typeahead } from 'react-bootstrap-typeahead';
import { useNavigate } from 'react-router-dom';

const Goal = ({ goal, taskCategories, fetchGoals, deleteGoal, rewards, fetchRewards }) => {
    const [selectedReward, setSelectedReward] = useState([]);
    const navigate = useNavigate();

    // Update goal information
    const handleEditGoal = async (goalId, field, value) => {
        const updatedGoal = { ...goal, [field]: value };
        try {
            await axios.put(`/goals/${goalId}`, updatedGoal);
            fetchGoals();
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    // Toggle goal completion status
    const toggleGoalComplete = async (goalId) => {
        const updatedGoal = { ...goal, isComplete: !goal.isComplete };
        try {
            await axios.put(`/goals/${goalId}`, updatedGoal);
            if (updatedGoal.isComplete && updatedGoal.rewardId) {
                await axios.put(`/rewards/${updatedGoal.rewardId._id}/status`, { status: 'available' });
            }
            fetchGoals();
        } catch (error) {
            console.error('Error toggling goal complete:', error);
        }
    };

    // Delete a task from the goal
    const deleteTask = async (goalId, taskId) => {
        try {
            await axios.delete(`/goals/${goalId}/tasks/${taskId}`);
            fetchGoals();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    // Handle reward selection
    const handleRewardSelect = async (selected) => {
        if (selected.length > 0) {
            const rewardId = selected[0];
            try {
                await axios.put(`/goals/${goal._id}/reward`, { rewardId });
                fetchGoals();
                fetchRewards(); // Update unbound rewards list
                setSelectedReward([]); // Reset selected reward to avoid stale selection
            } catch (error) {
                console.error('Error binding reward:', error);
            }
        }
    };

    // Unbind reward from the goal
    const handleUnbindReward = async () => {
        try {
            if (goal.rewardId) {
                await axios.put(`/goals/${goal._id}/reward`, { rewardId: null });
                fetchGoals();
                fetchRewards(); // Update unbound rewards list
            }
        } catch (error) {
            console.error('Error unbinding reward:', error);
        }
    };

    const handleRewardClick = (rewardId) => {
        navigate(`/rewards?rewardId=${rewardId}`);
    };

    useEffect(() => {
        if (goal.tasks.length === 0) return; // If no tasks, return immediately
        const allTasksComplete = goal.tasks.every(task => task.isComplete);
        if (allTasksComplete && !goal.isComplete) {
            toggleGoalComplete(goal._id);
        }
    }, [goal.tasks, goal._id, goal.isComplete]);

    // Set background image style and text shadow
    const backgroundImageStyle = goal.rewardId ? { backgroundImage: `url(/uploads/${goal.rewardId.file})`, backgroundSize: 'cover', position: 'relative', color: 'white', textShadow: '2px 2px 4px black' } : {};

    return (
        <div className={`card mb-4 ${goal.isComplete ? 'bg-success text-white' : ''}`} style={backgroundImageStyle}>
            <div className="card-header d-flex justify-content-between align-items-center" style={{ position: 'relative', zIndex: 1 }}>
                <div>
                    <h5 contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'name', e.target.innerText)} style={{ color: 'white', textShadow: '2px 2px 4px black' }}>
                        {goal.name}
                    </h5>
                    <p contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'description', e.target.innerText)} style={{ color: 'white', textShadow: '2px 2px 4px black' }}>
                        {goal.description}
                    </p>
                    <span style={{ color: 'white', textShadow: '2px 2px 4px black' }}>
                        Expected Time: <span contentEditable suppressContentEditableWarning onBlur={(e) => handleEditGoal(goal._id, 'expectedTime', e.target.innerText)}>
                            {goal.expectedTime}
                        </span> mins
                    </span>
                    {goal.rewardId ? (
                        <div>
                            Bound to Reward: <a href={`/rewards?rewardId=${goal.rewardId._id}`} onClick={(e) => { e.preventDefault(); handleRewardClick(goal.rewardId._id); }} style={{ color: 'white', textShadow: '2px 2px 4px black' }}>
                            {goal.rewardId.name}
                        </a>
                            <button className="btn btn-warning ms-2" onClick={handleUnbindReward}>
                                <FontAwesomeIcon icon={faUnlink} />
                            </button>
                        </div>
                    ) : (
                        <Typeahead
                            id="reward-selector"
                            labelKey="name"
                            options={rewards}
                            onChange={handleRewardSelect}
                            placeholder="Choose a reward to bind..."
                            selected={selectedReward}
                        />
                    )}
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
            <div className="card-body" style={{ position: 'relative', zIndex: 1 }}>
                <h5 style={{ color: 'white', textShadow: '2px 2px 4px black' }}>Tasks</h5>
                {goal.tasks.map((task) => (
                    <Task key={task._id} task={task} goalId={goal._id} taskCategories={taskCategories} fetchGoals={fetchGoals} deleteTask={deleteTask} />
                ))}
                <TaskForm goalId={goal._id} taskCategories={taskCategories} fetchGoals={fetchGoals} />
            </div>
        </div>
    );
};

export default Goal;
