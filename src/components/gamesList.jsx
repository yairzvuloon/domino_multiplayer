import React from "react";
import ReactDOM from "react-dom";
import GameObjList from "./GameObjList.jsx";

export default class GamesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      //usersList: { 12: "Jack", 3: "yair" }
      gamesList: {}
    };
    this.getGamesList = this.getGamesList.bind(this);
    this.getGamesListWrapper = this.getGamesListWrapper.bind(this);
    this._isMounted = false;
  }

  componentDidMount() {
    this._isMounted = true;
    //if (this.props.isUserConnected&&this._isMounted === true) this.getGamesList();
    if (this._isMounted === true) this.getGamesList();
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.timeoutId) {
        clearTimeout(this.timeoutId);
    }
  }

  getGamesListWrapper() {
    this.getGamesList();
  }
  getGamesList() {
    const interval = 1000; //TODO: change to 200
    return fetch("/games/allGames", { method: "GET", credentials: "include" })
      .then(response => {
        if (!response.ok) {
          throw response;
        }
        this.timeoutId = setTimeout(this.getGamesListWrapper, interval);

        return response.json();
      })
      .then(gamesList => {
        if (this._isMounted) this.setState(() => ({ gamesList:JSON.parse(gamesList) }));
      })
      .catch(err => {
        throw err;
      });
  }

  render() {
    return (
      <div key={"gamesList-wrapper"} className="gamesList-wrapper">
        <h2 key={"gamesList-title"}>Games List:</h2>
        <ul>
          {Object.keys(this.state.gamesList).map((id, index) => (
            <GameObjList
              key={"key"+index}
              handleJoinToGame={this.props.handleJoinToGame}
              data={this.state.gamesList[id]}
              name={this.props.name}
            />
            //<li key={id}>{JSON.parse(this.state.gamesList[id]).gameName}</li>
          ))}
        </ul>
      </div>
    );
  }
}
