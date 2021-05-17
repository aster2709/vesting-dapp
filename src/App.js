import { useEffect, useState } from "react";
import "./App.css";
import Header from "./components/Header";
import Table from "./components/Table";
import web3 from "./ethereum/web3";
import tokenAbi from "./ethereum/tokenAbi";
import vestingContractAbi from "./ethereum/vestingContractAbi";

let vestingInstance, tokenInstance;
function App() {
  const [state, setState] = useState({
    connected: false,
    account: "",
    bal: "",
    token: "",
    vestingContractAddress: "0x7a61231e9C68c03db35d246692Ce24365bd5e54E",
    vestingContractBalance: "",
    userBalance: "",
    beneficiary: "",
    owner: "",
    releasedPeriods: "",
    totalPeriods: "",
    totalReleased: "",
    releaseAmountsAndTimeStamps: [],
  });
  useEffect(() => {
    async function fetchData() {
      const accounts = await web3.eth.getAccounts();
      vestingInstance = await new web3.eth.Contract(
        vestingContractAbi,
        state.vestingContractAddress
      );

      const {
        beneficiary,
        owner,
        releasedPeriods,
        token,
        totalPeriods,
        totalReleased,
      } = await vestingInstance.methods
        .getGlobalData()
        .call({ from: accounts[0] });
      tokenInstance = await new web3.eth.Contract(tokenAbi, token);
      const vestingContractBalance = await tokenInstance.methods
        .balanceOf(state.vestingContractAddress)
        .call({ from: accounts[0] });
      const temp = await Promise.all(
        Array(+totalPeriods)
          .fill()
          .map((x, i) =>
            vestingInstance.methods.getPeriodData(i).call({ from: accounts[0] })
          )
      );
      setState((prevState) => {
        return {
          ...prevState,
          beneficiary,
          owner,
          releasedPeriods,
          token,
          totalPeriods,
          totalReleased,
          releaseAmountsAndTimeStamps: temp,
          vestingContractBalance,
        };
      });
    }
    fetchData();
  }, [state.vestingContractAddress]);
  const handleConnect = async () => {
    if (!state.connected) {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const tokenInstance = await new web3.eth.Contract(tokenAbi, state.token);
      const bal = await web3.eth.getBalance(accounts[0]);
      const userBalance = await tokenInstance.methods
        .balanceOf(accounts[0])
        .call({ from: accounts[0] });
      setState((prevState) => {
        return {
          ...prevState,
          connected: true,
          account: accounts[0],
          bal: web3.utils.fromWei(bal, "ether").slice(0, 5),
          userBalance,
        };
      });
    } else {
      setState((prevState) => {
        return {
          ...prevState,
          connected: false,
          account: "",
          bal: "",
          userBalance: "",
        };
      });
    }
  };
  const handleClaim = async () => {
    if (state.connected) {
      try {
        await vestingInstance.methods.release().send({ from: state.account });
      } catch (err) {
        console.log(err.message);
      }
    } else {
      alert("please connect wallet");
    }
  };
  return (
    <div>
      <Header handleConnect={handleConnect} state={state}></Header>
      <h1 className="title">Vesting Schedule</h1>
      <div className="description">
        <p>Vesting Contract: {state.vestingContractAddress}</p>
        <p>
          Your Balance:{" "}
          {state.userBalance ? state.userBalance : "connect wallet"}
        </p>
        <p>
          Released/Vested:{" "}
          {state.vestingContractBalance &&
            `${state.totalReleased}/${state.vestingContractBalance}`}
        </p>
      </div>
      <Table state={state} web3={web3} handleClaim={handleClaim}></Table>
    </div>
  );
}

export default App;
