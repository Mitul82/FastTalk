import React from 'react';
import ReactDom from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import { AuthProvider } from '../context/authContext.jsx';
import { ChatProvider } from '../context/chatContext.jsx';

const root = ReactDom.createRoot(document.getElementById('root'));

function Page() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <ChatProvider>
                    <App/>
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