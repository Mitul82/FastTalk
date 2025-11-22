import React from 'react';
import toast from 'react-hot-toast';

import { AuthContext } from './authContext.jsx';

export const ChatContext = React.createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = React.useState([]);
    const [users, setUsers] = React.useState([]);
    const [selectedUser, setSelectedUser] = React.useState(null);
    const [unseenMessages, setUnseenMessages] = React.useState({});

    const { socket, axios } = React.useContext(AuthContext);

    const getUsers = async () => {
        try {
            const { data } = await axios.get('/api/messages/users');

            if(data.success) {
                setUsers(data.users);

                setUnseenMessages(data.unseenMessages);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);

            if(data.success) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const sendMessage = async (messageData) => {
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);

            if(data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const subscribeToMessages = async () => {
        try {
            if(!socket) return;

            socket.on('newMessage', (newMessage)  => {
                if(selectedUser && newMessage.senderId === selectedUser._id) {
                    newMessage.seen = true;

                    setMessages((prevMessage) => [...prevMessage, newMessage]);
                    axios.put(`/api/messages/mark/${newMessage._id}`);
                } else {
                    setUnseenMessages((prevUnseen) => ({
                        ...prevUnseen,
                        [newMessage.senderId]: prevUnseen[newMessage.senderId] ? prevUnseen[newMessage.senderId] + 1 : 1
                    }));
                }
            });
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    const unsubscribeFromMessages = async () => {
        try {
            if(socket) socket.off('newMessage');
        } catch (err) {
            console.error(err);
            toast.error(err.message);
        }
    }

    React.useEffect(() => {
        subscribeToMessages();
        return () => unsubscribeFromMessages();
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        setMessages,
        setSelectedUser,
        setUnseenMessages,
        sendMessage,
        getMessages,
        getUsers
    }

    return (
        <ChatContext.Provider value={ value }>
            { children }
        </ChatContext.Provider>
    );
}