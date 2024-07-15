import React from 'react';

const GoalSelectorModal = ({ goals, onSelectGoal, onClose }) => {
    return (
        <div className="modal" style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Select Goal</h5>
                        <button type="button" className="close" onClick={onClose}>
                            <span>&times;</span>
                        </button>
                    </div>
                    <div className="modal-body">
                        <ul className="list-group">
                            {goals.map((goal) => (
                                <li
                                    key={goal._id}
                                    className="list-group-item list-group-item-action"
                                    onClick={() => onSelectGoal(goal._id)}
                                >
                                    {goal.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalSelectorModal;
