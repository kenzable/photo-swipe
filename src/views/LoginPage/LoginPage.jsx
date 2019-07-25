import React from "react";
import { Redirect } from "react-router-dom";
import OAuth from "../../components/OAuth/OAuth.jsx";
import "./LoginPage.css";

export default function(props) {
  const { authenticated, location, login, socket } = props;
  const { from } = location.state || { from: { pathname: "/" } };

  if (authenticated === true) {
    return <Redirect to={from} />;
  }

  return (
    <div className="login-page u-center-vertical u-center-text">
      <header className="login-page__header">
        <h1 className="title">
          <span className="title__section">Photo</span>
          <span className="title__section">Swipe</span>
        </h1>
      </header>
      <main className="login-page__main">
        <div className="row">
          <OAuth login={login} socket={socket} />
        </div>
      </main>
    </div>
  );
}
