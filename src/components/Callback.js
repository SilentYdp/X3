import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const Callback = ({ onTokenReceived }) => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const fetchToken = async () => {
            const query = new URLSearchParams(location.search);
            const code = query.get('code');

            if (code) {
                try {
                    const response = await axios.post('https://dida365.com/oauth/token', {
                        client_id: '6lUX16Raey34JaA0fO',
                        client_secret: 'E)mMUIFnPtWpXa*08n80@@!y5U#hdRn7',
                        code: code,
                        grant_type: 'authorization_code',
                        redirect_uri: 'http://localhost:3000/callback'
                    }, {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        }
                    });

                    const { access_token } = response.data;
                    onTokenReceived(access_token);
                    navigate('/dida-projects');
                } catch (error) {
                    console.error('Error fetching access token:', error.response ? error.response.data : error.message);
                }
            }
        };

        fetchToken();
    }, [location.search, onTokenReceived, navigate]);

    return (
        <div className="container">
            <h2 className="my-4">Authenticating...</h2>
        </div>
    );
};

export default Callback;
