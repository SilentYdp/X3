import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faLink, faCheck } from '@fortawesome/free-solid-svg-icons';
import GoalSelectorModal from './GoalSelectorModal';

const RewardManager = () => {
    const [rewards, setRewards] = useState([]);
    const [newReward, setNewReward] = useState({ name: '', description: '', file: null });
    const [editingReward, setEditingReward] = useState(null);
    const [bindingReward, setBindingReward] = useState(null);
    const [error, setError] = useState(null);
    const [showEnjoyed, setShowEnjoyed] = useState(false);
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        fetchRewards();
        fetchGoals();
    }, []);

    const fetchRewards = async () => {
        try {
            const response = await axios.get('http://localhost:5000/rewards');
            setRewards(response.data);
            console.log('Rewards:', response.data); // 打印 Rewards 数据
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await axios.get('http://localhost:5000/goals');
            setGoals(response.data);
            console.log('Goals:', response.data); // 打印 Goals 数据
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCreateReward = async () => {
        const formData = new FormData();
        formData.append('name', newReward.name);
        formData.append('description', newReward.description);
        formData.append('file', newReward.file);

        try {
            await axios.post('http://localhost:5000/rewards', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setNewReward({ name: '', description: '', file: null });
            fetchRewards();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleUpdateReward = async (id) => {
        const formData = new FormData();
        formData.append('name', editingReward.name);
        formData.append('description', editingReward.description);
        if (editingReward.file) {
            formData.append('file', editingReward.file);
        }
        formData.append('goalId', editingReward.goalId || null);
        formData.append('status', editingReward.status || 'unbound');

        try {
            await axios.put(`http://localhost:5000/rewards/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setEditingReward(null);
            fetchRewards();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteReward = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/rewards/${id}`);
            fetchRewards();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleFileChange = (e) => {
        setNewReward({ ...newReward, file: e.target.files[0] });
    };

    const handleEditingFileChange = (e) => {
        setEditingReward({ ...editingReward, file: e.target.files[0] });
    };

    const handleStatusChange = async (id, newStatus) => {
        try {
            await axios.put(`http://localhost:5000/rewards/${id}/status`, { status: newStatus });
            fetchRewards();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBindGoal = (reward) => {
        setBindingReward(reward);
    };

    const handleSelectGoal = async (goalId) => {
        if (bindingReward) {
            try {
                await axios.put(`http://localhost:5000/rewards/${bindingReward._id}/goal`, { goalId });
                // await axios.put(`http://localhost:5000/goals/${goalId}/reward`, { rewardId: bindingReward._id });
                setBindingReward(null);
                fetchRewards();
                fetchGoals();
            } catch (err) {
                setError(err.message);
            }
        } else if (editingReward) {
            setEditingReward({ ...editingReward, goalId });
        }
    };

    const handleUnbindGoal = async (reward) => {
        try {
            await axios.put(`http://localhost:5000/rewards/${reward._id}/goal`, { goalId: null });
            await axios.put(`http://localhost:5000/rewards/${reward._id}/status`, { status: 'unbound' });
            // if (reward.goalId) {
            //     await axios.put(`http://localhost:5000/goals/${reward.goalId}/reward`, { rewardId: null });
            // }
            fetchRewards();
            fetchGoals();
        } catch (err) {
            setError(err.message);
        }
    };

    const toggleShowEnjoyed = () => {
        setShowEnjoyed(!showEnjoyed);
    };

    const filteredRewards = rewards.filter(reward => showEnjoyed ? reward.status === 'enjoyed' : reward.status !== 'enjoyed');

    return (
        <div className="container">
            <h2 className="my-4">Reward Manager</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <button className="btn btn-primary mb-4" onClick={toggleShowEnjoyed}>
                {showEnjoyed ? 'Show All Rewards' : 'Show Enjoyed Rewards'}
            </button>
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">Create New Reward</h5>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Reward Name"
                            value={newReward.name}
                            onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            placeholder="Reward Description"
                            value={newReward.description}
                            onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                        />
                    </div>
                    <div className="mb-3">
                        <input type="file" className="form-control" onChange={handleFileChange} />
                    </div>
                    <button className="btn btn-primary" onClick={handleCreateReward}>
                        Create Reward
                    </button>
                </div>
            </div>
            <div className="row">
                {filteredRewards.map((reward) => (
                    <div key={reward._id} className="col-md-4 mb-4">
                        <div className={`card ${reward.status === 'enjoyed' ? 'bg-success text-white' : reward.status === 'available' ? 'bg-warning text-dark' : reward.status === 'bound' ? 'bg-info text-white' : ''}`}>
                            <img
                                src={`http://localhost:5000/uploads/${reward.file}`}
                                className="card-img-top"
                                alt={reward.name}
                                style={{ height: '200px', objectFit: 'cover' }}
                            />
                            <div className="card-body">
                                {editingReward && editingReward._id === reward._id ? (
                                    <>
                                        <div className="mb-3">
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={editingReward.name}
                                                onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <textarea
                                                className="form-control"
                                                value={editingReward.description}
                                                onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="mb-3">
                                            <input type="file" className="form-control" onChange={handleEditingFileChange} />
                                        </div>
                                        <div className="mb-3">
                                            <label>Bind to Goal:</label>
                                            <select
                                                className="form-control"
                                                value={editingReward.goalId || ''}
                                                onChange={(e) => handleSelectGoal(e.target.value)}
                                            >
                                                <option value="">Unbound</option>
                                                {goals.map((goal) => (
                                                    <option key={goal._id} value={goal._id}>
                                                        {goal.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <button className="btn btn-success" onClick={() => handleUpdateReward(reward._id)}>
                                            Update Reward
                                        </button>
                                        <button className="btn btn-secondary" onClick={() => setEditingReward(null)}>
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <h5 className="card-title">{reward.name}</h5>
                                        <p className="card-text">{reward.description}</p>
                                        {reward.goalId && (
                                            <p>
                                                {/*goal没有单个goal的详情页，所以只能跳转到所有goals的主页面*/}
                                                Bound to Goal: <a href={`/goals?goalId=${reward.goalId._id}`}>
                                                {goals.find(goal => goal._id === reward.goalId._id)?.name}
                                                </a>

                                            </p>
                                        )}
                                        {reward.status === 'available' && (
                                            <button className="btn btn-success me-2" onClick={() => handleStatusChange(reward._id, 'enjoyed')}>
                                                <FontAwesomeIcon icon={faCheck} /> Enjoy Reward
                                            </button>
                                        )}
                                        {!reward.goalId && (
                                            <button className="btn btn-link me-2" onClick={() => handleBindGoal(reward)}>
                                                <FontAwesomeIcon icon={faLink} /> Bind to Goal
                                            </button>
                                        )}
                                        {reward.goalId && (
                                            <>
                                                <button className="btn btn-warning me-2" onClick={() => handleUnbindGoal(reward)}>
                                                    Unbind Goal
                                                </button>
                                                <button className="btn btn-primary me-2" onClick={() => setEditingReward(reward)}>
                                                    <FontAwesomeIcon icon={faEdit} /> Edit
                                                </button>
                                            </>
                                        )}
                                        <button className="btn btn-danger" onClick={() => handleDeleteReward(reward._id)}>
                                            <FontAwesomeIcon icon={faTrash} /> Delete
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {bindingReward && (
                <GoalSelectorModal
                    goals={goals}
                    onSelectGoal={handleSelectGoal}
                    onClose={() => setBindingReward(null)}
                />
            )}
        </div>
    );
};

export default RewardManager;
