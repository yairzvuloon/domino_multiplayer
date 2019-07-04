import React from "react";
import ReactDOM from "react-dom";

export default class GamesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //usersList: { 12: "Jack", 3: "yair" }
      gamesList: { 12: "gameName2", 3: "gameName1" }
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getGamesList() {}

  render() {
    return (
      <div>
        <h2>Games List:</h2>
        <ul>
          {Object.keys(this.state.gamesList).map(id => (
            <li>{this.state.gamesList[id]}</li>
          ))}
        </ul>
      </div>
    );
  }
}
