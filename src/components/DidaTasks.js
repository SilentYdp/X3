import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DidaTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [accessToken, setAccessToken] = useState('');

    useEffect(() => {
        // 获取accessToken的逻辑
        // 示例中直接使用一个已经获取到的accessToken
        const accessToken = 'YOUR_ACCESS_TOKEN'; // 替换为实际获取到的accessToken
        setAccessToken(accessToken);
        fetchTasks(accessToken);
    }, []);

    const fetchTasks = async (token) => {
        try {
            const response = await axios.get('https://api.dida365.com/open/v1/project/YOUR_PROJECT_ID/task', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    return (
        <div className="container">
            <h2 className="my-4">Dida Tasks</h2>
            <div className="list-group">
                {tasks.map(task => (
                    <div key={task.id} className="list-group-item">
                        <h5>{task.title}</h5>
                        <p>{task.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DidaTasks;
