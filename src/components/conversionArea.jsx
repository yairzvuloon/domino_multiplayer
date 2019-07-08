import React from "react";
import ReactDOM from "react-dom";

export default class ConversionArea extends React.Component {
  constructor(props) {
    super(props);

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
      (() => {
        clearTimeout(this.timeoutId);
      })();
    }
  }

  render() {
    return (
      <div
        key="converssion-area-wrpper-div"
        className="converssion-area-wrpper"
      >
        {this.state.content.map((line, value) => (
          <p key={JSON.parse(line.user).name + value}>
            {JSON.parse(line.user).name}: {line.text}
          </p>
        ))}
      </div>
    );
  }

  getChatContent() {
    const interval = 200; //TODO: change to 200
    return fetch("/chat", { method: "GET", credentials: "include" })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        this.timeoutId = setTimeout(this.getChatContent, interval);
        return response.json();
      })
      .then(content => {
        this.setState(() => ({ content: content }));
      })
      .catch(err => {
        throw err;
      });
  }
}
