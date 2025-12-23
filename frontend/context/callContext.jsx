import React from 'react';
import toast from 'react-hot-toast';

import { AuthContext } from './authContext.jsx';

export const CallContext = React.createContext();

export const CallProvider = ({ children }) => {
    const [call, setCall] = React.useState();
    const [callState, setCallState] = React.useState();
    
    const { socket, axios } = React.useContext(AuthContext);

    const voiceCallUser = async () => {
        try {
            console.log("initaite voice call");
        } catch (err) {
            console.error(err);
            toast.error("Error initiating voice call");
        }
    }

    const videoCallUser = async () => {
        try {
            console.log("initiate video call");
        } catch (err) {
            console.error(err);
            toast.error("Error initiating video call");
        }
    }

    const value = {
        call,
        callState,
        setCall,
        setCallState,
        voiceCallUser,
        videoCallUser
    }

    return (
        <CallContext.Provider value={ value }>
            { children }
        </CallContext.Provider>
    );
}