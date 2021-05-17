import React, { useEffect, useState } from "react";
import "./Table.css";

const Table = ({ state, web3, handleClaim, buttonArr }) => {
  const { releaseAmountsAndTimeStamps, releasedPeriods } = state;
  return (
    <div>
      <table className="vesting-table">
        <thead className="light-pink">
          <tr>
            <th>S.No</th>
            <th>Release Amount</th>
            <th>Date Released</th>
          </tr>
        </thead>
        <tbody>
          {releaseAmountsAndTimeStamps.map((x, i) => {
            const date = new Date(x.timestamp * 1000).toString();
            return (
              <tr key={x.timestamp}>
                <td>{i}</td>
                <td>{web3.utils.fromWei(x.amount, "ether")}</td>
                <td>{date}</td>
                <td>
                  <button
                    className={
                      +releasedPeriods > i
                        ? `btn btn-claimed`
                        : `btn ${!buttonArr[i] && `btn-pending`}`
                    }
                    onClick={handleClaim}
                  >
                    {+releasedPeriods > i
                      ? `Claimed`
                      : buttonArr[i]
                      ? `Claim`
                      : `Pending...`}
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
