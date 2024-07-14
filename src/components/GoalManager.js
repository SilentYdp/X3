import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Goal from './GoalManager/Goal';
import GoalForm from './GoalManager/GoalForm';
import './GoalManager.css';

const GoalManager = () => {
    const [goals, setGoals] = useState([]);
    const [taskCategories, setTaskCategories] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false); // 新增状态

    useEffect(() => {
        fetchGoals();
        fetchCategories();
    }, []);

    const fetchGoals = async () => {
        try {
            const response = await axios.get('http://localhost:5000/goals');
            setGoals(response.data);
        } catch (error) {
            console.error('Error fetching goals:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await axios.get('http://localhost:5000/categories');
            setTaskCategories(response.data.map(cat => cat.name));
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const addGoal = async (newGoal) => {
        try {
            await axios.post('http://localhost:5000/goals', newGoal);
            fetchGoals();
        } catch (error) {
            console.error('Error adding goal:', error);
        }
    };

    const deleteGoal = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/goals/${id}`);
            fetchGoals();
        } catch (error) {
            console.error('Error deleting goal:', error);
        }
    };

    const toggleShowCompleted = () => { // 新增切换显示状态的方法
        setShowCompleted(!showCompleted);
    };

    const filteredGoals = goals.filter(goal => goal.isComplete === showCompleted); // 根据状态过滤目标

    return (
        <div className="container">
            <h1 className="my-4">Goal Manager</h1>
            <button className="btn btn-primary mb-4" onClick={toggleShowCompleted}>
                {showCompleted ? 'Show Incomplete Goals' : 'Show Completed Goals'}
            </button>
            <GoalForm addGoal={addGoal} />
            <h2>Goals</h2>
            {filteredGoals.map((goal) => (
                <Goal key={goal._id} goal={goal} taskCategories={taskCategories} fetchGoals={fetchGoals} deleteGoal={deleteGoal} />
            ))}
        </div>
    );
};

export default GoalManager;
