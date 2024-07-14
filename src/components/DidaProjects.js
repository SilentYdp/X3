import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DidaProjects = () => {
    const [projects, setProjects] = useState([]);
    const [token, setToken] = useState('');
    const [authCode, setAuthCode] = useState('');

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        if (code) {
            setAuthCode(code);
        }
    }, []);

    const handleAuth = async () => {
        try {
            const response = await axios.post('http://localhost:5000/getToken', { code: authCode });
            setToken(response.data.access_token);
            fetchProjects(response.data.access_token);
        } catch (error) {
            console.error('Error getting token', error);
        }
    };

    const fetchProjects = async (accessToken) => {
        try {
            const response = await axios.get('https://api.dida365.com/open/v1/project', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            setProjects(response.data);
        } catch (error) {
            console.error('Error fetching projects', error);
        }
    };

    return (
        <div>
            <button onClick={handleAuth}>Authorize and Fetch Projects</button>
            <ul>
                {projects.map((project) => (
                    <li key={project.id}>{project.name}</li>
                ))}
            </ul>
        </div>
    );
};

export default DidaProjects;
