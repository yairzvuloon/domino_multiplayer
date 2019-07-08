import React from "react";
import ReactDOM from "react-dom";
import GameObjList from "./gameObjList.jsx";

export default class GamesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //usersList: { 12: "Jack", 3: "yair" }
      gamesList: {}
    };
    this.getGamesList = this.getGamesList.bind(this);
  }

  componentDidMount() {
    this.getGamesList();
  }

  componentWillUnmount() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getGamesList() {
      const interval = 200;//TODO: change to 200 
    return fetch("/games/allGames", { method: "GET", credentials: "include" })
      .then(response => {
        this.timeoutId = setTimeout(this.getGamesList, interval);

        if (!response.ok) {
          throw response;
        }
        return response.json();
      })
      .then(gamesList => {
        this.setState(() => ({ gamesList }));
      })
      .catch(err => {
        throw err;
      });
  }

  

  render() {
    return (
      <div className="gamesList-wrapper">
        <h2>Games List:</h2>
        <ul>
      
          {Object.keys(this.state.gamesList).map(id => (
           
           <GameObjList key={id} handleJoinToGame={this.props.handleJoinToGame} data={JSON.parse(this.state.gamesList[id])}></GameObjList>
           //<li key={id}>{JSON.parse(this.state.gamesList[id]).gameName}</li>
          ))}
        </ul>
      </div>
    );
  }
}
