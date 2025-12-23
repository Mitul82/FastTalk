import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from '../context/authContext.jsx';
import { ChatProvider } from '../context/chatContext.jsx';
import { CallProvider } from '../context/callContext.jsx';

const root = ReactDom.createRoot(document.getElementById('root'));

function Page() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ChatProvider>
                    <CallProvider>
                        <App/>
                    </CallProvider>
                </ChatProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

root.render(
    <React.StrictMode>
        <Page/>
    </React.StrictMode>
);