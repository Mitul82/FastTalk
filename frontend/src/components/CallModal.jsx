import React from 'react';
import { CallContext } from '../../context/callContext.jsx';

function CallModal() {
    const { incomingCall, callState, localStream, remoteStream, acceptCall, rejectCall, endCall, toggleMute, toggleCamera, toggleScreenShare, isMuted, isCameraOn, isScreenSharing, remoteScreenSharing } = React.useContext(CallContext);

    if(!incomingCall && callState === 'idle') return null;

    if(callState === 'in-call') {
        const remoteAudioRef = React.createRef();

        React.useEffect(() => {
            if(remoteAudioRef.current && remoteStream) {
                try {
                    remoteAudioRef.current.srcObject = remoteStream;

                    const p = remoteAudioRef.current.play();

                    if(p && p.catch) p.catch(() => {
                        console.warn('Autoplay prevented');
                    });
                } catch (err) {
                    console.error('Failed to attach remote audio', err);
                }
            }
        }, [remoteStream]);

        return (
            <div className='fixed inset-0 z-50 bg-black flex items-center justify-center'>
                <div className='w-full h-full relative'>

                    <video autoPlay playsInline ref={(el) => { if(el && remoteStream) el.srcObject = remoteStream; }} className='w-full h-full object-cover bg-black' />

                    <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />

                    <div className='absolute right-6 bottom-24 w-40 h-28 bg-black rounded overflow-hidden border border-white/20'>
                        <video autoPlay muted playsInline ref={(el) => { if(el && localStream) el.srcObject = localStream; }} className='w-full h-full object-cover' />
                    </div>

                    { remoteScreenSharing && (
                        <div className='absolute left-6 top-6 bg-white/10 text-white px-3 py-1 rounded'>Remote sharing</div>
                    ) }

                    <div className='absolute left-0 right-0 bottom-6 flex justify-center gap-4'>
                        <button onClick={() => { toggleMute(); remoteAudioRef.current && remoteAudioRef.current.play().catch(()=>{}); }} className='bg-white/10 text-white px-4 py-2 rounded'>
                            { isMuted ? 'Unmute' : 'Mute' }
                        </button>
                        <button onClick={() => toggleCamera()} className='bg-white/10 text-white px-4 py-2 rounded'>
                            { isCameraOn ? 'Stop Camera' : 'Start Camera' }
                        </button>
                        <button onClick={() => toggleScreenShare()} className='bg-white/10 text-white px-4 py-2 rounded'>
                            { isScreenSharing ? 'Stop Share' : 'Share Screen' }
                        </button>
                        <button onClick={() => endCall()} className='bg-red-600 text-white px-4 py-2 rounded'>End Call</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='fixed inset-0 flex items-center justify-center z-50'>
            <div className='bg-black/80 text-white p-6 rounded-lg w-full max-w-md shadow-lg'>
                { incomingCall && callState === 'ringing' && (
                    <div className='flex flex-col items-center gap-4'>
                        <h2 className='text-lg font-medium'>Incoming {incomingCall.type} call</h2>
                        <p className='text-sm text-gray-300'>From: {incomingCall.metadata?.callerName || incomingCall.from}</p>
                        <div className='flex gap-4 mt-4'>
                            <button onClick={() => acceptCall()} className='bg-green-600 px-4 py-2 rounded'>Accept</button>
                            <button onClick={() => rejectCall('User rejected')} className='bg-red-700 px-4 py-2 rounded'>Reject</button>
                        </div>
                    </div>
                ) }

                { callState === 'connecting' && (
                    <div className='flex flex-col items-center gap-4'>
                        <h2 className='text-lg font-medium'>Connecting...</h2>
                        <p className='text-sm text-gray-300'>{incomingCall ? `${incomingCall.metadata?.callerName || incomingCall.from} - ${incomingCall.type}` : 'Setting up your media'}</p>
                    </div>
                ) }

            </div>
        </div>
    );
}

export default CallModal;