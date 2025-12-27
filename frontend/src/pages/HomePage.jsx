import React from 'react';

import { ChatContext } from '../../context/chatContext.jsx';
import Sidebar from '../components/Sidebar.jsx';
import ChatContainer from '../components/ChatContainer.jsx';
import RightSidebar from '../components/RightSidebar.jsx';
import CallModal from '../components/CallModal.jsx';

function HomePage() {
    const { selectedUser } = React.useContext(ChatContext);

    return (
        <div className='border w-full h-screen sm:px-[15%] sm:py-[5%]'>
            <div className={`backdrop-blur-xl border-2 border-white-600 rounded-2x1 overflow-hidden h-full grid grid-cols-1 relative 
                ${selectedUser ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]' : 'md:grid-cols-2'}`}>
                <Sidebar/>
                <ChatContainer/>
                <RightSidebar/>
            </div>
            <CallModal/>
        </div>
    );
}

export default HomePage;