import React from 'react';
import ReactDOM from 'react-dom';
import ConversionArea from './conversionArea.jsx';
import ChatInput from './chatInput.jsx';

export default function() {               
    return(
        <div key="chat-container-in-chat-container" className="chat-container">
            <ConversionArea key="ConversionArea-chat-container" />
            <ChatInput key="ChatInput-chat-container"/>
        </div>
    )

    
}