import React from "react";
import ReactDOM from "react-dom";

export default class GamesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //gamesList: { 12: "gameName1", 3: "gameName2" }
     gamesList: { 12: "gameName1", 3: "gameName2" }
    };
    this.getGamesList = this.getGamesList.bind(this);
  }

  componentDidMount() {
    //this.getGamesList();
}

componentWillUnmount() {
    if (this.timeoutId) {
        clearTimeout(this.timeoutId);
    }
}

  getGamesList() {

  }

  render() {
    return (
      <div>
        <h2>games List:</h2>
        <ul>
          {Object.keys(this.state.gamesList).map(id => (
            <li>{this.state.gamesList[id]}</li>
          ))}
        </ul>
      </div>
    );
  }
}
