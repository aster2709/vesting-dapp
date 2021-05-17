import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Table from "./components/Table";
import web3 from "./ethereum/web3";
import tokenAbi from "./ethereum/tokenAbi";
import vestingAbi from "./ethereum/vestingContractAbi";

let vestingInstance, tokenInstance, intervalId;

function App() {
  const [state, setState] = useState({
    connected: false,
    account: "",
    metamaskBalance: "",
    userTokenBalance: "",
    token: "",
    vestingContractAddress: "0x3497181E2e7Da06cD7599723499C3da64C13Bb75",
    vested: "",
    beneficiary: "",
    owner: "",
    releasedPeriods: "",
    totalPeriods: "",
    totalReleased: "",
    releaseAmountsAndTimeStamps: [],
  });
  const [buttonArr, setButtonArr] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      vestingInstance = await new web3.eth.Contract(
        vestingAbi,
        state.vestingContractAddress
      );
      const {
        beneficiary,
        owner,
        releasedPeriods,
        token,
        totalPeriods,
        totalReleased,
      } = await vestingInstance.methods.getGlobalData().call();
      tokenInstance = await new web3.eth.Contract(tokenAbi, token);

      if (accounts.length) {
        const metamaskBalance = await web3.eth.getBalance(accounts[0]);
        const userTokenBalance = await tokenInstance.methods
          .balanceOf(accounts[0])
          .call({ from: accounts[0] });
        setState((prevState) => {
          return {
            ...prevState,
            metamaskBalance,
            userTokenBalance,
            account: accounts[0],
            connected: true,
          };
        });
      }

      const releaseAmountsAndTimeStamps = await Promise.all(
        Array(+totalPeriods)
          .fill()
          .map((x, i) => vestingInstance.methods.getPeriodData(i).call())
      );
      let vested = releaseAmountsAndTimeStamps.reduce((acc, curr) => {
        return acc + +web3.utils.fromWei(curr.amount, "ether");
      }, 0);
      vested = String(vested);
      setState((prevState) => {
        return {
          ...prevState,
          token,
          vested,
          beneficiary,
          owner,
          releasedPeriods,
          totalPeriods,
          totalReleased,
          releaseAmountsAndTimeStamps,
        };
      });
    }
    fetchData();
  }, [state.vestingContractAddress, state.connected]);

  if (!intervalId && state.releaseAmountsAndTimeStamps.length) {
    intervalId = setInterval(function temp() {
      const now = Date.now() / 1000;
      const myArr = state.releaseAmountsAndTimeStamps.map(
        (x) => now >= x.timestamp
      );
      setButtonArr(myArr);
    }, 1000);
  }

  const handleConnect = async () => {
    if (!state.connected) {
      await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setState((prevState) => {
        return {
          ...prevState,
          connected: true,
        };
      });
    }
  };

  const handleClaim = async () => {
    if (state.connected) {
      try {
        await vestingInstance.methods.release().send({ from: state.account });
        const userTokenBalance = await tokenInstance.methods
          .balanceOf(state.account)
          .call();
        const { releasedPeriods, totalReleased } = await vestingInstance.methods
          .getGlobalData()
          .call();
        setState((prevState) => {
          return {
            ...prevState,
            userTokenBalance,
            releasedPeriods,
            totalReleased,
          };
        });
      } catch (err) {
        console.log(err.message);
      }
    } else {
      alert("please connect wallet");
    }
  };
  return (
    <div>
      <Header handleConnect={handleConnect} state={state} web3={web3}></Header>
      <h1 className="title">Vesting Schedule</h1>
      <div className="description">
        <p>
          {" "}
          <span className="light-pink">Vesting Contract</span> :{" "}
          {state.vestingContractAddress}
        </p>
        <p>
          <span className="light-pink">Your Balance</span> :{" "}
          {state.userTokenBalance &&
            web3.utils.fromWei(state.userTokenBalance, "ether")}{" "}
          Tokens
        </p>
        <p>
          <span className="light-pink">Released / Vested</span> :{" "}
          {state.vested &&
            `${web3.utils.fromWei(state.totalReleased, "ether")} / ${
              state.vested
            }`}
        </p>
      </div>
      <Table
        state={state}
        web3={web3}
        handleClaim={handleClaim}
        buttonArr={buttonArr}
      ></Table>
    </div>
  );
}

export default App;
