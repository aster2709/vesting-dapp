import React from "react";
import "./Table.css";

const Table = ({ state, web3, handleClaim }) => {
  const { releaseAmountsAndTimeStamps } = state;
  return (
    <div>
      <table className="vesting-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Release Amount</th>
            <th>Date Released</th>
          </tr>
        </thead>
        <tbody>
          {releaseAmountsAndTimeStamps.map((x, i) => {
            const date = new Date(x.timestamp * 1000).toUTCString();
            return (
              <tr key={x.timestamp}>
                <td>{i}</td>
                <td>{web3.utils.fromWei(x.amount, "ether")}</td>
                <td>{date}</td>
                <td>
                  <button className="btn" onClick={handleClaim}>
                    Claim
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
