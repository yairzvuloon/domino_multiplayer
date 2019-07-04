import React from "react";
import ReactDOM from "react-dom";

export default class LoginModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      errMessage: ""
    };

    this.handleLogin = this.handleLogin.bind(this);
  }

  render() {
    return (
      <div className="login-page-wrapper">
        <h1>Domino multiplayer</h1>
        <form onSubmit={this.handleLogin}>
          <label className="username-label" htmlFor="userName">
            {" "}
            name:{" "}
          </label>
          <input className="username-input" name="userName" />
          <input className="submit-btn btn" type="submit" value="Login" />
        </form>
        {this.renderErrorMessage()}
      </div>
    );
  }

  renderErrorMessage() {
    if (this.state.errMessage) {
      return <div className="login-error-message">{this.state.errMessage}</div>;
    }
    return null;
  }

  handleLogin(e) {
    e.preventDefault();
    const userName = e.target.elements.userName.value;
    if (userName === "") {
      this.setState(() => ({
        errMessage: "You must to insert name!"
      }));
    } else {
      fetch("/users/addUser", {
        method: "POST",
        body: userName,
        credentials: "include"
      }).then(response => {
        if (response.ok) {
          this.setState(() => ({ errMessage: "" }));
          this.props.loginSuccessHandler();
        } else {
          if (response.status === 403) {
            this.setState(() => ({
              errMessage: "User name already exist, please try another one"
            }));
          }
          this.props.loginErrorHandler();
        }
      });

      return false;
    }
  }
}