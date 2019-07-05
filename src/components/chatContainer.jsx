import React from 'react';
import ReactDOM from 'react-dom';
import ConverssionArea from './converssionArea.jsx';
import ChatInput from './chatInput.jsx';

export default function() {               
    return(
        <div className="chat-container">
            <ConverssionArea />
            <ChatInput />
        </div>
    )

    
}