import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
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
    const location = useLocation();
    const rewardRefs = useRef({});

    useEffect(() => {
        fetchRewards();
        fetchGoals();
    }, []);

    useEffect(() => {
        const query = new URLSearchParams(location.search);
        const rewardId = query.get('rewardId');
        if (rewardId && rewardRefs.current[rewardId]) {
            rewardRefs.current[rewardId].scrollIntoView({ behavior: 'smooth' });
        }
    }, [rewards, location.search]);

    const fetchRewards = async () => {
        try {
            console.log('Fetching rewards...');
            const response = await axios.get('/rewards');
            setRewards(response.data);
            console.log('Fetched rewards:', response.data);
        } catch (err) {
            console.error('Error fetching rewards:', err);
            setError(err.message);
        }
    };

    const fetchGoals = async () => {
        try {
            console.log('Fetching goals...');
            const response = await axios.get('/goals');
            setGoals(response.data);
            console.log('Fetched goals:', response.data);
        } catch (err) {
            console.error('Error fetching goals:', err);
            setError(err.message);
        }
    };

    const handleCreateReward = async () => {
        console.log('Creating new reward...');
        const formData = new FormData();
        formData.append('name', newReward.name);
        formData.append('description', newReward.description);
        formData.append('file', newReward.file);

        try {
            const response = await axios.post('/rewards', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Created new reward:', response.data);
            setNewReward({ name: '', description: '', file: null });
            fetchRewards();
        } catch (err) {
            console.error('Error creating reward:', err);
            setError(err.message);
        }
    };

    const handleUpdateReward = async (id) => {
        console.log(`Updating reward with ID: ${id}...`);
        const formData = new FormData();
        formData.append('name', editingReward.name);
        formData.append('description', editingReward.description);
        if (editingReward.file) {
            formData.append('file', editingReward.file);
        }
        formData.append('status', editingReward.status || 'unbound');

        try {
            const response = await axios.put(`/rewards/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Updated reward:', response.data);
            setEditingReward(null);
            fetchRewards();
        } catch (err) {
            console.error(`Error updating reward with ID: ${id}`, err);
            setError(err.message);
        }
    };

    const handleDeleteReward = async (id) => {
        console.log(`Deleting reward with ID: ${id}...`);
        try {
            const response = await axios.delete(`/rewards/${id}`);
            console.log('Deleted reward:', response.data);
            fetchRewards();
        } catch (err) {
            console.error(`Error deleting reward with ID: ${id}`, err);
            setError(err.message);
        }
    };

    const handleFileChange = (e) => {
        console.log('Selected file for new reward:', e.target.files[0]);
        setNewReward({ ...newReward, file: e.target.files[0] });
    };

    const handleEditingFileChange = (e) => {
        console.log('Selected file for editing reward:', e.target.files[0]);
        setEditingReward({ ...editingReward, file: e.target.files[0] });
    };

    const handleStatusChange = async (id, newStatus) => {
        console.log(`Changing status of reward with ID: ${id} to ${newStatus}...`);
        try {
            const response = await axios.put(`/rewards/${id}/status`, { status: newStatus });
            console.log('Changed status of reward:', response.data);
            fetchRewards();
        } catch (err) {
            console.error(`Error changing status of reward with ID: ${id}`, err);
            setError(err.message);
        }
    };

    const handleBindGoal = (reward) => {
        console.log('Binding goal to reward:', reward);
        setBindingReward(reward);
    };

    const handleSelectGoal = async (goalId) => {
        console.log('Selected goal ID:', goalId);
        if (bindingReward) {
            try {
                console.log('Binding selected goal to reward...');
                const response = await axios.put(`/rewards/${bindingReward._id}/goal`, { goalId });
                console.log('Bound goal to reward:', response.data);
                setBindingReward(null);
                fetchRewards();
                fetchGoals();
            } catch (err) {
                console.error('Error binding goal to reward:', err);
                setError(err.message);
            }
        } else if (editingReward) {
            setEditingReward({ ...editingReward, goalId });
        }
    };

    const handleUnbindGoal = async (reward) => {
        console.log('Unbinding goal from reward:', reward);
        try {
            const response = await axios.put(`/rewards/${reward._id}/goal`, { goalId: null });
            await axios.put(`/rewards/${reward._id}/status`, { status: 'unbound' });
            console.log('Unbound goal from reward:', response.data);
            fetchRewards();
            fetchGoals();
        } catch (err) {
            console.error('Error unbinding goal from reward:', err);
            setError(err.message);
        }
    };

    const toggleShowEnjoyed = () => {
        console.log('Toggling show enjoyed rewards...');
        setShowEnjoyed(!showEnjoyed);
    };

    const filteredRewards = rewards.filter(reward => showEnjoyed ? reward.status === 'enjoyed' : reward.status !== 'enjoyed');

    const unboundGoals = goals.filter(goal => !goal.rewardId);

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
                    <div key={reward._id} className="col-md-4 mb-4" ref={(el) => (rewardRefs.current[reward._id] = el)}>
                        <div className={`card ${reward.status === 'enjoyed' ? 'bg-success text-white' : reward.status === 'available' ? 'bg-warning text-dark' : reward.status === 'bound' ? 'bg-info text-white' : ''}`}>
                            <img
                                src={`/uploads/${reward.file}`}
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
                                        {reward.goalId && (
                                            <p>
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
                                        <button className="btn btn-primary me-2" onClick={() => setEditingReward(reward)}>
                                            <FontAwesomeIcon icon={faEdit} /> Edit
                                        </button>
                                        {reward.goalId && (
                                            <>
                                                <button className="btn btn-warning me-2" onClick={() => handleUnbindGoal(reward)}>
                                                    Unbind Goal
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
                    goals={unboundGoals}
                    onSelectGoal={handleSelectGoal}
                    onClose={() => setBindingReward(null)}
                />
            )}
        </div>
    );
};

export default RewardManager;
