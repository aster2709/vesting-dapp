import Web3 from "web3";
let web3;

if (typeof window !== "undefined") {
  if (typeof window.ethereum !== "undefined") {
    web3 = new Web3(window.ethereum);
  }
} else {
  web3 = new Web3(
    "https://kovan.infura.io/v3/98667df842b643c5a68077377ac327a2"
  );
}
export default web3;
