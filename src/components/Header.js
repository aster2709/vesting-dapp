import React from "react";
import "./Header.css";
import logo from "../assets/logo.svg";

const Header = ({ handleConnect, state, web3 }) => {
  const { account, metamaskBalance } = state;
  return (
    <div className="header">
      <nav>
        <a href="#">
          <img className="logo" src={logo} alt="logo" />
        </a>
        <div className="nav-right">
          <p>
            {metamaskBalance
              ? web3.utils.fromWei(metamaskBalance, "ether").slice(0, 5) +
                ` ETH`
              : `0.000 ETH`}
          </p>
          <p>
            {account
              ? `${account.slice(0, 4) + `...` + account.slice(-4)}`
              : `0x00...0000`}
          </p>
          {state.connected ? (
            <p className="connected">Connected</p>
          ) : (
            <button onClick={handleConnect} className="btn btn-connect">
              Connect Wallet
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Header;
