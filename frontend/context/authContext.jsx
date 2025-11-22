import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

axios.defaults.baseURL = backendUrl;

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = React.useState(localStorage.getItem('token'));
    const [authUser, setAuthUser] = React.useState(null);
    const [onlineUser, setOnlineUser] = React.useState([]);
    const [socket, setSocket] = React.useState(null);

    const checkAuth = async () => {
        try {
            const { data } = await axios.get('/api/auth/check');

            if(data.success) {
                setAuthUser(data.user);
                
                connectSocket(data.user);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);

            if(data.success) {
                setAuthUser(data.userData);
                
                connectSocket(data.userData);
                
                axios.defaults.headers.common['token'] = data.token;
                
                setToken(data.token);
                
                localStorage.setItem('token', data.token);
                
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const logout = async () => {
        try {
            localStorage.removeItem('token');

            setToken(null);

            setAuthUser(null);
            
            setOnlineUser([]);
            
            axios.defaults.headers.common['token'] = null;
            
            toast.success('Logged out successfully');

            socket.disconnect();
        } catch (err) {
            console.error(err);
        }
    }

    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put('/api/auth/update-profile', body);

            if(data.success) {
                setAuthUser(data.user);

                toast.success('Profile updated successfully');
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const connectSocket = (userData) => {
        if(!userData || socket?.connected) {
            return;
        }

        const newSocket = io(backendUrl, {
            query: {
                userId:  userData._id,
            }
        });

        newSocket.connect();

        setSocket(newSocket);

        newSocket.on('getOnlineUsers', (userIds) => {
            setOnlineUser(userIds);
        });
    }

    React.useEffect(() => {
        if(token) {
            axios.defaults.headers.common['token'] = token;
        }
        
        checkAuth();
    }, []);

    const value = {
        axios,
        authUser,
        onlineUser,
        socket,
        login,
        logout,
        updateProfile
    }

    return (
        <AuthContext.Provider value={ value }>
            { children }
        </AuthContext.Provider>
    );
}