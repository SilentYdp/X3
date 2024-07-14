import React, { useState } from 'react';

const GoalForm = ({ addGoal }) => {
    const [goalName, setGoalName] = useState('');
    const [goalDescription, setGoalDescription] = useState('');
    const [expectedTime, setExpectedTime] = useState(0);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newGoal = { name: goalName, description: goalDescription, expectedTime };
        addGoal(newGoal);
        setGoalName('');
        setGoalDescription('');
        setExpectedTime(0);
    };

    return (
        <div className="card mb-4">
            <div className="card-header">Add Goal</div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={goalName}
                            onChange={(e) => setGoalName(e.target.value)}
                            placeholder="Goal Name"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            value={goalDescription}
                            onChange={(e) => setGoalDescription(e.target.value)}
                            placeholder="Goal Description"
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <input
                            type="number"
                            className="form-control"
                            value={expectedTime}
                            onChange={(e) => setExpectedTime(e.target.value)}
                            placeholder="Expected Time (mins)"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success">Add Goal</button>
                </form>
            </div>
        </div>
    );
};

export default GoalForm;
