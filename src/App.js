import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import GoalManager from './components/GoalManager';
import DidaProjects from './components/DidaProjects';
import RewardManager from './components/RewardManager';
import TaskTracker from './components/TaskTracker';
import './App.css';

const App = () => {
    return (
        <Router>
            <div>
                <nav className="navbar navbar-expand-lg navbar-light bg-light">
                    <div className="container-fluid">
                        <Link className="navbar-brand" to="/">Task Tracker</Link>
                        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"></span>
                        </button>
                        <div className="collapse navbar-collapse" id="navbarNav">
                            <ul className="navbar-nav">
                                <li className="nav-item">
                                    <Link className="nav-link" to="/">Task Tracker</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/goals">Goal Manager</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/rewards">Reward Manager</Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/didaProjects">Dida Projects</Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>

                <Routes>
                    <Route path="/" element={<TaskTracker />} />
                    <Route path="/goals" element={<GoalManager />} />
                    <Route path="/rewards" element={<RewardManager />} />
                    <Route path="/didaProjects" element={<DidaProjects />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
