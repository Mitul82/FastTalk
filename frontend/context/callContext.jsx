import React from 'react';
import toast from 'react-hot-toast';

import { AuthContext } from './authContext.jsx';
import { ChatContext } from './chatContext.jsx';

export const CallContext = React.createContext();

export const CallProvider = ({ children }) => {
    const { socket, authUser } = React.useContext(AuthContext);
    const { selectedUser } = React.useContext(ChatContext);

    const [call, setCall] = React.useState(null); // { callId, type, from, to }
    const [callState, setCallState] = React.useState('idle'); // idle | ringing | connecting | in-call | ended
    const [incomingCall, setIncomingCall] = React.useState(null);

    const [localStream, setLocalStream] = React.useState(null);
    const [remoteStream, setRemoteStream] = React.useState(null);

    const [isMuted, setIsMuted] = React.useState(false);
    const [isCameraOn, setIsCameraOn] = React.useState(true);
    const [isScreenSharing, setIsScreenSharing] = React.useState(false);
    const [remoteScreenSharing, setRemoteScreenSharing] = React.useState(false);

    const pcRef = React.useRef(null);
    const pendingCandidatesRef = React.useRef([]);
    const cameraTrackRef = React.useRef(null);
    const screenStreamRef = React.useRef(null);

    const createPeerConnection = (callId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
                // Add TURN servers here via env if available
            ]
        });

        pc.onicecandidate = (event) => {
            if(event.candidate) {
                if(call) {
                    socket.emit('sendIceCandidate', {
                        toUserId: call.to,
                        fromUserId: call.from,
                        callId,
                        candidate: event.candidate
                    });
                }
            }
        }

        pc.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        }

        pcRef.current = pc;
        return pc;
    }

    const cleanupCall = () => {
        setCall(null);
        setCallState('idle');
        setIncomingCall(null);

        if(pcRef.current) {
            try { pcRef.current.close(); } catch(e){}
            pcRef.current = null;
        }

        if(localStream) {
            localStream.getTracks().forEach(t => t.stop());
            setLocalStream(null);
        }

        if(remoteStream) {
            remoteStream.getTracks().forEach(t => t.stop());
            setRemoteStream(null);
        }

        pendingCandidatesRef.current = [];
        cameraTrackRef.current = null;
        if(screenStreamRef.current) {
            try { screenStreamRef.current.getTracks().forEach(t => t.stop()); } catch(e){}
            screenStreamRef.current = null;
        }

        setIsMuted(false);
        setIsCameraOn(true);
        setIsScreenSharing(false);
        setRemoteScreenSharing(false);
    }

    const voiceCallUser = async (toUserId = selectedUser?._id) => {
        try {
            if(!toUserId) throw new Error('No target selected');

            const callId = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

            const payload = {
                toUserId,
                fromUserId: authUser._id,
                callId,
                metadata: { callerName: authUser.fullName }
            }

            setCall({ callId, type: 'voice', from: authUser._id, to: toUserId });
            setCallState('ringing');

            socket.emit('initiateVoiceCall', payload);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error initiating voice call');
        }
    }

    const videoCallUser = async (toUserId = selectedUser?._id) => {
        try {
            if(!toUserId) throw new Error('No target selected');

            const callId = `${Date.now()}-${Math.random().toString(36).slice(2,9)}`;

            const payload = {
                toUserId,
                fromUserId: authUser._id,
                callId,
                metadata: { callerName: authUser.fullName }
            }

            setCall({ callId, type: 'video', from: authUser._id, to: toUserId });
            setCallState('ringing');

            socket.emit('initiateVideoCall', payload);
        } catch (err) {
            console.error(err);
            toast.error(err.message || 'Error initiating video call');
        }
    }

    const acceptCall = async () => {
        try {
            if(!incomingCall) return;

            setCall(incomingCall);
            setCallState('connecting');

            const constraints = { audio: true, video: incomingCall.type === 'video' };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);

            console.log('acceptCall - local stream tracks:', stream.getAudioTracks(), stream.getVideoTracks());

            // store camera track for future restore
            cameraTrackRef.current = stream.getVideoTracks()[0] || null;
            setIsCameraOn(!!cameraTrackRef.current);

            setLocalStream(stream);

            const pc = createPeerConnection(incomingCall.callId);

            // add local tracks
            stream.getTracks().forEach(track => pc.addTrack(track, stream));

            // notify caller that callee accepted (caller will create offer)
            socket.emit('acceptCall', { toUserId: incomingCall.from, fromUserId: incomingCall.to, callId: incomingCall.callId });

            setCallState('in-call');
        } catch (err) {
            console.error(err);
            toast.error('Unable to access media devices');
            cleanupCall();
        }
    }

    const rejectCall = (reason) => {
        if(!incomingCall) return;
        socket.emit('rejectCall', { toUserId: incomingCall.from, fromUserId: incomingCall.to, callId: incomingCall.callId, reason });
        setIncomingCall(null);
        setCallState('idle');
    }

    const endCall = () => {
        if(call) {
            socket.emit('endCall', { toUserId: call.to, fromUserId: call.from, callId: call.callId });
        }
        cleanupCall();
    }

    const toggleMute = () => {
        if(!localStream) return;
        const audioTracks = localStream.getAudioTracks();
        if(!audioTracks.length) return;
        const newMuted = !isMuted;
        audioTracks.forEach(t => t.enabled = !newMuted);
        setIsMuted(newMuted);
    }

    const toggleCamera = async () => {
        if(!localStream) {
            // try to get camera
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                cameraTrackRef.current = stream.getVideoTracks()[0];
                setIsCameraOn(true);
                // add to localStream and pc
                setLocalStream(prev => {
                    const merged = new MediaStream([...(prev? prev.getTracks() : []), cameraTrackRef.current]);
                    if(pcRef.current) pcRef.current.addTrack(cameraTrackRef.current, merged);
                    return merged;
                });
                return;
            } catch (err) {
                toast.error('Unable to access camera');
                return;
            }
        }

        if(cameraTrackRef.current) {
            const newState = !cameraTrackRef.current.enabled;
            cameraTrackRef.current.enabled = newState;
            setIsCameraOn(newState);
        }
    }

    const startScreenShare = async () => {
        try {
            if(!pcRef.current) throw new Error('No active peer connection');
            const displayStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = displayStream.getVideoTracks()[0];

            // store screen stream
            screenStreamRef.current = displayStream;
            setIsScreenSharing(true);

            const sender = pcRef.current && pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
            if(sender) {
                await sender.replaceTrack(screenTrack);
            } else if(pcRef.current) {
                pcRef.current.addTrack(screenTrack, displayStream);
            }

            // Notify remote side optionally
            if(call) {
                socket.emit('initiateScreenShare', { toUserId: call.to, fromUserId: call.from, callId: call.callId });
            }

            screenTrack.onended = async () => {
                await stopScreenShare();
            }
        } catch (err) {
            console.error(err);
            toast.error('Unable to share screen');
        }
    }

    const stopScreenShare = async () => {
        try {
            if(!pcRef.current) return;
            if(screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach(t => t.stop());
                screenStreamRef.current = null;
            }

            // restore camera track
            const sender = pcRef.current && pcRef.current.getSenders().find(s => s.track && s.track.kind === 'video');
            if(sender) {
                if(cameraTrackRef.current) {
                    await sender.replaceTrack(cameraTrackRef.current);
                } else {
                    // if no camera track, remove sender track
                    try { await sender.replaceTrack(null); } catch(e){}
                }
            }

            if(call) {
                socket.emit('stopScreenShare', { toUserId: call.to, fromUserId: call.from, callId: call.callId });
            }

            setIsScreenSharing(false);
        } catch (err) {
            console.error(err);
        }
    }

    const toggleScreenShare = async () => {
        if(isScreenSharing) {
            await stopScreenShare();
        } else {
            await startScreenShare();
        }
    }

    // Socket event handlers
    React.useEffect(() => {
        if(!socket) return;

        const onIncomingVoiceCall = (data) => {
            setIncomingCall({ type: 'voice', callId: data.callId, from: data.fromUserId, to: authUser._id, metadata: data.metadata });
            setCallState('ringing');
        }

        const onIncomingVideoCall = (data) => {
            setIncomingCall({ type: 'video', callId: data.callId, from: data.fromUserId, to: authUser._id, metadata: data.metadata });
            setCallState('ringing');
        }

        const onCallAccepted = (data) => {
            // caller receives acceptance; begin SDP offer/answer flow
            setCallState('connecting');

            (async () => {
                try {
                    const constraints = { audio: true, video: call?.type === 'video' };
                    const stream = await navigator.mediaDevices.getUserMedia(constraints);

                    console.log('onCallAccepted - local stream tracks:', stream.getAudioTracks(), stream.getVideoTracks());

                    // store camera track for later
                    cameraTrackRef.current = stream.getVideoTracks()[0] || null;
                    setIsCameraOn(!!cameraTrackRef.current);

                    setLocalStream(stream);

                    const pc = createPeerConnection(call.callId);
                    stream.getTracks().forEach(track => pc.addTrack(track, stream));

                    // create offer and send to callee
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);

                    socket.emit('sendOffer', { toUserId: call.to, fromUserId: call.from, callId: call.callId, description: offer });
                } catch (err) {
                    console.error(err);
                    toast.error('Error starting call');
                    cleanupCall();
                }
            })();
        }

        const onReceiveOffer = async (data) => {
            try {
                const { description, fromUserId, callId } = data;
                // ensure we have local media and pc
                const constraints = { audio: true, video: incomingCall?.type === 'video' };
                const stream = await navigator.mediaDevices.getUserMedia(constraints);

                console.log('onReceiveOffer - local stream tracks:', stream.getAudioTracks(), stream.getVideoTracks());

                cameraTrackRef.current = stream.getVideoTracks()[0] || null;
                setIsCameraOn(!!cameraTrackRef.current);

                setLocalStream(stream);

                const pc = createPeerConnection(callId);
                stream.getTracks().forEach(track => pc.addTrack(track, stream));

                await pc.setRemoteDescription(new RTCSessionDescription(description));

                // add any pending candidates
                pendingCandidatesRef.current.forEach(c => pc.addIceCandidate(c));
                pendingCandidatesRef.current = [];

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit('sendAnswer', { toUserId: data.fromUserId, fromUserId: authUser._id, callId, description: answer });

                setCall({ callId, type: incomingCall?.type || 'voice', from: fromUserId, to: authUser._id });
                setCallState('in-call');
            } catch (err) {
                console.error(err);
            }
        }

        const onReceiveAnswer = async (data) => {
            try {
                const { description } = data;
                if(pcRef.current) {
                    await pcRef.current.setRemoteDescription(new RTCSessionDescription(description));

                    // add pending candidates
                    pendingCandidatesRef.current.forEach(c => pcRef.current.addIceCandidate(c));
                    pendingCandidatesRef.current = [];

                    setCallState('in-call');
                }
            } catch (err) {
                console.error(err);
            }
        }

        const onReceiveIceCandidate = async (data) => {
            const { candidate } = data;
            try {
                if(pcRef.current && pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
                    await pcRef.current.addIceCandidate(candidate);
                } else {
                    pendingCandidatesRef.current.push(candidate);
                }
            } catch (err) {
                console.error('Error adding ICE candidate', err);
            }
        }

        const onIncomingScreenShare = (data) => {
            setRemoteScreenSharing(true);
            toast.success('Remote user started screen sharing');
        }

        const onStopScreenShare = (data) => {
            setRemoteScreenSharing(false);
            toast('Remote user stopped screen sharing');
        }

        const onCallEnded = (data) => {
            cleanupCall();
            toast('Call ended');
        }

        const onCallRejected = (data) => {
            toast.error(data.reason || 'Call rejected');
            cleanupCall();
        }

        const onCalleeNotAvailable = (data) => {
            toast.error('User is not available');
            cleanupCall();
        }

        socket.on('incomingVoiceCall', onIncomingVoiceCall);
        socket.on('incomingVideoCall', onIncomingVideoCall);
        socket.on('callAccepted', onCallAccepted);
        socket.on('receiveOffer', onReceiveOffer);
        socket.on('receiveAnswer', onReceiveAnswer);
        socket.on('receiveIceCandidate', onReceiveIceCandidate);
        socket.on('incomingScreenShare', onIncomingScreenShare);
        socket.on('stopScreenShare', onStopScreenShare);
        socket.on('callEnded', onCallEnded);
        socket.on('callRejected', onCallRejected);
        socket.on('calleeNotAvailable', onCalleeNotAvailable);

        return () => {
            socket.off('incomingVoiceCall', onIncomingVoiceCall);
            socket.off('incomingVideoCall', onIncomingVideoCall);
            socket.off('callAccepted', onCallAccepted);
            socket.off('receiveOffer', onReceiveOffer);
            socket.off('receiveAnswer', onReceiveAnswer);
            socket.off('receiveIceCandidate', onReceiveIceCandidate);
            socket.off('incomingScreenShare', onIncomingScreenShare);
            socket.off('stopScreenShare', onStopScreenShare);
            socket.off('callEnded', onCallEnded);
            socket.off('callRejected', onCallRejected);
            socket.off('calleeNotAvailable', onCalleeNotAvailable);
        }
    }, [socket, authUser, incomingCall, call]);

    const value = {
        call,
        callState,
        incomingCall,
        localStream,
        remoteStream,
        isMuted,
        isCameraOn,
        isScreenSharing,
        remoteScreenSharing,
        voiceCallUser,
        videoCallUser,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare
    }

    return (
        <CallContext.Provider value={ value }>
            { children }
        </CallContext.Provider>
    );
}