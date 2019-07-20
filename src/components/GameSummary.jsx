import React from "react";
import ReactDOM from "react-dom";
const Manager = require("../utilities/Manager");
import "../style/GameStyle.css";
import "../style/style2.css";

export default class GameSummary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersRoomData: this.props.usersRoomData
    };
  }

  //   turn
  //   currentScore
  //   average
  //   withdrawals

  render() {
    return (
      <div>
        <h2 key="gameSummary-title">Game Summary:</h2>

        <h2 key="winner-title">THE WINNER IS:{this.props.winName} </h2>
        <h2 key="lost-title">{this.props.lostName} lost the game...</h2>
        <h2 key="time-title">time:{this.props.currentTime.minutes}:{this.props.currentTime.seconds}</h2>

        <ul key="gameSummary-ul">
          {Object.keys(this.state.usersRoomData).map((id, index) => (
            <li key={this.state.usersRoomData[id].name + index}>
              player: {this.state.usersRoomData[id].name} 
              <br />score: {this.state.usersRoomData[id].stats.currentScore} || average time: {this.state.usersRoomData[id].stats.average.minutes}:{this.state.usersRoomData[id].stats.average.seconds} || withdrawals: {this.state.usersRoomData[id].stats.withdrawals} 
            </li>
            
          ))}
        </ul>
      </div>
    );
  }

  componentDidMount() {
    this._isMounted = true;
    //if (this.props.isUserConnected&&this._isMounted === true) this.getGamesList();
    // if (this._isMounted === true) this.getGamesSummaryList();
  }

  componentWillUnmount() {
    this._isMounted = false;
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }
}
