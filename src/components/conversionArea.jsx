import React from 'react';
import ReactDOM from 'react-dom';

export default class ConversionArea extends React.Component {
    constructor(args) {
        super(...args);
        
        this.state = {
            content: []
        };        

        this.getChatContent = this.getChatContent.bind(this);
    }

    componentDidMount() {
        this.getChatContent();
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    render() {               
        return(
            <div className="converssion-area-wrpper">
                {this.state.content.map((line, index) => (<p key={line.user.name + index}>{line.user.name}:  {line.text}</p>))}
            </div>
        )
    }

    getChatContent() {
      const interval = 200; //TODO: change to 200
        return fetch('/chat', {method: 'GET', credentials: 'include'})
        .then((response) => {
            if (!response.ok){
                throw response;
            }
            this.timeoutId = setTimeout(this.getChatContent, interval);
            return response.json();            
        })
        .then(content => {
            this.setState(()=>({content}));
        })
        .catch(err => {throw err});
    }
}