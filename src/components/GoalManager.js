import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import Goal from './GoalManager/Goal';
import GoalForm from './GoalManager/GoalForm';
import './GoalManager.css';

const GoalManager = () => {
    const [goals, setGoals] = useState([]);
    const [taskCategories, setTaskCategories] = useState([]);
    const [showCompleted, setShowCompleted] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const goalRefs = useRef({}); // 保存每个 goal 的引用

    useEffect(() => {
        fetchGoals();
        fetchCategories();
    }, []);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const goalId = query.get('goalId');
        if (goalId && goalRefs.current[goalId]) {
            goalRefs.current[goalId].scrollIntoView({ behavior: 'smooth' });
        }
    }, [goals, location.search]);

    const fetchGoals = async () => {
        try {
            const response = await axios.get('http://localhost:5000/goals');
            setGoals(response.data);
            console.log('Goals:', response.data); // 打印 Goals 数据
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
        newGoal.isComplete = false; // 确保新建的 goal 是未达成状态
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

    const toggleShowCompleted = () => { // 切换显示状态的方法
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
                <div key={goal._id} ref={(el) => (goalRefs.current[goal._id] = el)}>
                    <Goal
                        key={goal._id}
                        goal={goal}
                        taskCategories={taskCategories}
                        fetchGoals={fetchGoals}
                        deleteGoal={deleteGoal}
                    />
                </div>
            ))}
        </div>
    );
};

export default GoalManager;
