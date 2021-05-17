import React from "react";
import "./Header.css";
import logo from "../assets/logo.svg";

const Header = ({ handleConnect, state }) => {
  const { account, bal } = state;
  return (
    <div className="header">
      <nav>
        <a href="">
          <img className="logo" src={logo} alt="logo" />
        </a>
        <div className="nav-right">
          <p>{bal ? bal + ` ETH` : `0.000 ETH`}</p>
          <p>
            {account
              ? `${account.slice(0, 4) + `...` + account.slice(-4)}`
              : `0x00...0000`}
          </p>
          <button className="connect-wallet" onClick={handleConnect}>
            {state.connected ? "Disconnect" : "Connect Wallet"}
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Header;
