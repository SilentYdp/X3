import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Goal from './GoalManager/Goal';
import GoalForm from './GoalManager/GoalForm';
import './GoalManager.css';

const GoalManager = () => {
    const [goals, setGoals] = useState([]);
    const [taskCategories, setTaskCategories] = useState([]);

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

    return (
        <div className="container">
            <h1 className="my-4">Goal Manager</h1>
            <GoalForm addGoal={addGoal} />
            <h2>Goals</h2>
            {goals.map((goal) => (
                <Goal key={goal._id} goal={goal} taskCategories={taskCategories} fetchGoals={fetchGoals} deleteGoal={deleteGoal} />
            ))}
        </div>
    );
};

export default GoalManager;
