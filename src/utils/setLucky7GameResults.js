const db = require("../connections/db");
const { luckySevenCard } = require("./general");
const { isEmpty, get } = require("lodash");

async function setLucky7GameResults(sequenceNumber) {
  let winnerOption;
  const getLuckySevenSeqReq = {
    query: { sequenceNumber: sequenceNumber },
    database: "game-panel",
    collection: "lucky-seven",
    method: "findOne",
  };
  const getLuckySevenWinMode = {
    query: { docName: "luckySeven" },
    database: "admin-panel",
    collection: "admin-utils",
    method: "findOne",
  };
  try {
    const gameSeqResp = await db(getLuckySevenSeqReq);
    const gameResModeResp = await db(getLuckySevenWinMode);
    if (isEmpty(gameSeqResp)) {
    } else {
      const gameMode = get(gameResModeResp, "mode", "low");
      if (gameSeqResp.winnerOption) {
        winnerOption = gameSeqResp.winnerOption;
      } else if (
        !gameSeqResp.totalUp &&
        !gameSeqResp.totalDown &&
        !gameSeqResp.totalTie
      ) {
        const randomNo = Math.floor(Math.random() * 20) + 1;
        if (randomNo === 13) {
          winnerOption = "TIE";
        } else if (randomNo % 2 === 0) {
          winnerOption = "UP";
        } else {
          winnerOption = "DOWN";
        }
      } else if (gameMode === "high") {
        const { totalUp = 0, totalDown = 0, totalTie = 0 } = gameSeqResp;
        const highBiter =
          totalUp >= totalDown && totalUp >= totalTie * 4.5
            ? "UP"
            : totalDown >= totalDown && totalDown >= totalTie * 4.5
            ? "DOWN"
            : "TIE";
        const lowBiter =
          totalUp < totalDown && totalUp < totalTie * 4.5
            ? "UP"
            : totalDown < totalDown && totalDown < totalTie * 4.5
            ? "DOWN"
            : "TIE";
        if (sequenceNumber % 3 === 0) {
          winnerOption = lowBiter;
        } else {
          winnerOption = highBiter;
        }
      } else if (gameMode === "mid") {
        const { totalUp = 0, totalDown = 0, totalTie = 0 } = gameSeqResp;
        const highBiter = totalUp >= totalDown ? "UP" : "DOWN";
        const lowBiter = totalUp < totalDown ? "UP" : "DOWN";
        if (totalUp === totalDown) {
          winnerOption = "TIE";
          listLength = highBiter === "UP" ? 2 : highBiter === "DOWN" ? 3 : 4;
          if (sequenceNumber % 2 === 0) {
            winnerOption = lowBiter;
            listLength = lowBiter === "UP" ? 2 : lowBiter === "DOWN" ? 3 : 4;
          } else {
            winnerOption = highBiter;
            listLength = highBiter === "UP" ? 2 : highBiter === "DOWN" ? 3 : 4;
          }
        } else {
          const totalSum = totalUp + totalDown;

          const difference = Math.abs(totalUp - totalDown);
          const threshold = 0.11 * totalSum;

          if (difference < threshold) {
            winnerOption = "TIE";
            listLength = highBiter === "UP" ? 2 : highBiter === "DOWN" ? 3 : 4;
          } else {
            winnerOption = lowBiter;
            listLength = highBiter === "UP" ? 2 : highBiter === "DOWN" ? 3 : 4;
          }
        }
      } else if (gameMode === "low") {
        const { totalUp = 0, totalDown = 0, totalTie = 0 } = gameSeqResp;

        if (totalUp * 2 <= totalTie * 9 && totalUp <= totalDown) {
          winnerOption = "UP";
        } else if (totalDown * 2 <= totalTie * 9 && totalDown <= totalUp) {
          winnerOption = "DOWN";
        } else if (
          totalTie * 9 <= totalUp * 2 &&
          totalTie * 9 <= totalDown * 2
        ) {
          winnerOption = "TIE";
        } else {
          winnerOption = "UP";
        }
      } else {
      }
      let winnerCard = luckySevenCard(winnerOption);
      const setLucky7SeqReq = {
        query: { sequenceNumber: sequenceNumber },
        update: {
          $set: {
            winnerCard: winnerCard,
            winnerOption: winnerOption,
          },
        },
        database: "game-panel",
        collection: "lucky-seven",
        method: "updateOne",
      };
      await db(setLucky7SeqReq);

      let currentUTCTime = new Date();
      let diff = -currentUTCTime.getTimezoneOffset();
      const currentISTMins = currentUTCTime.getMinutes() + diff;
      currentUTCTime.setMinutes(currentISTMins);
      currentUTCTime.toISOString();

      gameSeqResp.players &&
        gameSeqResp.players.map(async (player) => {
          let isWon = player.betOption === winnerOption ? true : false;
          let amount;
          if (isWon) {
            amount =
              winnerOption === "TIE"
                ? player.betAmount * 9 - (player.betAmount * 9) / 50
                : player.betAmount * 2 - player.betAmount / 25;
          } else {
            amount = player.betAmount;
          }
          const setUserGameRes = {
            query: { userName: player.userName },
            update: {
              $inc: {
                [`${isWon ? "winnings" : "losses"}`]: amount,
                balance: isWon ? amount : -0,
              },
              $push: {
                gamesList: {
                  game: "luckyseven",
                  betAmount: player.betAmount,
                  betOption: player.betOption,
                  winnerOption: winnerOption,
                  sequenceNumber: sequenceNumber,
                  isWon: isWon,
                  result: isWon ? amount : -amount,
                  dateAndTime: currentUTCTime,
                },
                financialDetails: {
                  dateAndTime: currentUTCTime,
                  description: `Result for Lucky Seven game ${sequenceNumber}`,
                  isCredit: isWon ? true : false,
                  amount: isWon ? amount : 0,
                },
              },
            },
            database: "user-panel",
            collection: "users",
            method: "updateOne",
          };
          await db(setUserGameRes);
        });
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = setLucky7GameResults;
