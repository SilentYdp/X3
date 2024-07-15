import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrash, faLink, faCheck } from '@fortawesome/free-solid-svg-icons';
import GoalSelectorModal from './GoalSelectorModal'; // 新增

const RewardManager = () => {
    const [rewards, setRewards] = useState([]);
    const [newReward, setNewReward] = useState({ name: '', description: '', file: null });
    const [editingReward, setEditingReward] = useState(null);
    const [bindingReward, setBindingReward] = useState(null); // 新增
    const [error, setError] = useState(null);
    const [showEnjoyed, setShowEnjoyed] = useState(false); // 新增状态
    const [goals, setGoals] = useState([]); // 新增

    useEffect(() => {
        fetchRewards();
        fetchGoals();
    }, []);

    const fetchRewards = async () => {
        try {
            const response = await axios.get('http://localhost:5000/rewards');
            setRewards(response.data);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchGoals = async () => {
        try {
            const response = await axios.get('http://localhost:5000/goals');
            setGoals(response.data);
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
                await axios.put(`http://localhost:5000/rewards/${bindingReward._id}/status`, { status: 'bound' }); // 设置状态为已绑定
                setBindingReward(null);
                fetchRewards();
            } catch (err) {
                setError(err.message);
            }
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
                                        {reward.status === 'available' && (
                                            <button className="btn btn-success me-2" onClick={() => handleStatusChange(reward._id, 'enjoyed')}>
                                                <FontAwesomeIcon icon={faCheck} /> Enjoy Reward
                                            </button>
                                        )}
                                        {reward.status === 'unbound' && (
                                            <button className="btn btn-link me-2" onClick={() => handleBindGoal(reward)}>
                                                <FontAwesomeIcon icon={faLink} /> Bind to Goal
                                            </button>
                                        )}
                                        {reward.status === 'bound' && (
                                            <button className="btn btn-primary me-2" onClick={() => setEditingReward(reward)}>
                                                <FontAwesomeIcon icon={faEdit} /> Edit
                                            </button>
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
