import React from 'react';
import ReactDOM from 'react-dom';
import ConversionArea from './conversionArea.jsx';
import ChatInput from './chatInput.jsx';

export default function() {               
    return(
        <div className="chat-container">
            <ConversionArea />
            <ChatInput />
        </div>
    )

    
}