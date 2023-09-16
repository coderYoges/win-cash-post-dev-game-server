const db = require("../connections/db");
const { randomCardList } = require("./general");
const { isEmpty, get } = require("lodash");

async function setAnBGameResults(sequenceNumber) {
  let winnerOption;
  let listLength = 0;
  const getAnBSeqReq = {
    query: { sequenceNumber: sequenceNumber },
    database: "game-panel",
    collection: "andar-bahar",
    method: "findOne",
  };
  const getAnBWinMode = {
    query: { docName: "andarBahar" },
    database: "admin-panel",
    collection: "admin-utils",
    method: "findOne",
  };
  try {
    const gameSeqResp = await db(getAnBSeqReq);
    const gameResModeResp = await db(getAnBWinMode);
    if (isEmpty(gameSeqResp) && isEmpty(gameResModeResp)) {
    } else {
      const gameMode = get(gameResModeResp, "mode", "low");
      if (gameSeqResp.winnerOption) {
        winnerOption = gameSeqResp.winnerOption;
        if (gameSeqResp.winnerOption === "TIE") {
          listLength = 4;
        } else if (gameSeqResp.winnerOption === "ANDAR") {
          listLength = 2;
        } else if (gameSeqResp.winnerOption === "BAHAR") {
          listLength = 3;
        }
      } else if (
        !gameSeqResp.totalAndar &&
        !gameSeqResp.totalBahar &&
        !gameSeqResp.totalTie
      ) {
        const randomNo = Math.floor(Math.random() * 20) + 1;
        if (randomNo === 9) {
          winnerOption = "TIE";
          listLength = 4;
        } else if (randomNo % 2 === 0) {
          winnerOption = "ANDAR";
          listLength = 2;
        } else {
          winnerOption = "BAHAR";
          listLength = 3;
        }
      } else if (gameMode === "high") {
        const { totalAndar = 0, totalBahar = 0, totalTie = 0 } = gameSeqResp;
        const highBiter =
          totalAndar >= totalBahar && totalAndar >= totalTie * 4.5
            ? "ANDAR"
            : totalBahar >= totalBahar && totalBahar >= totalTie * 4.5
            ? "BAHAR"
            : "TIE";
        const lowBiter =
          totalAndar < totalBahar && totalAndar < totalTie * 4.5
            ? "ANDAR"
            : totalBahar < totalBahar && totalBahar < totalTie * 4.5
            ? "BAHAR"
            : "TIE";
        if (sequenceNumber % 3 === 0) {
          winnerOption = lowBiter;
          listLength = lowBiter === "ANDAR" ? 2 : lowBiter === "BAHAR" ? 3 : 4;
        } else {
          winnerOption = highBiter;
          listLength =
            highBiter === "ANDAR" ? 2 : highBiter === "BAHAR" ? 3 : 4;
        }
      } else if (gameMode === "mid") {
        const { totalAndar = 0, totalBahar = 0, totalTie = 0 } = gameSeqResp;
        const highBiter = totalAndar >= totalBahar ? "ANDAR" : "BAHAR";
        const lowBiter = totalAndar < totalBahar ? "ANDAR" : "BAHAR";
        if (totalAndar === totalBahar) {
          winnerOption = "TIE";
          listLength =
            highBiter === "ANDAR" ? 2 : highBiter === "BAHAR" ? 3 : 4;
          if (sequenceNumber % 2 === 0) {
            winnerOption = lowBiter;
            listLength =
              lowBiter === "ANDAR" ? 2 : lowBiter === "BAHAR" ? 3 : 4;
          } else {
            winnerOption = highBiter;
            listLength =
              highBiter === "ANDAR" ? 2 : highBiter === "BAHAR" ? 3 : 4;
          }
        } else {
          const totalSum = totalAndar + totalBahar;

          const difference = Math.abs(totalAndar - totalBahar);
          const threshold = 0.11 * totalSum;

          if (difference < threshold) {
            winnerOption = "TIE";
            listLength =
              highBiter === "ANDAR" ? 2 : highBiter === "BAHAR" ? 3 : 4;
          } else {
            winnerOption = lowBiter;
            listLength =
              highBiter === "ANDAR" ? 2 : highBiter === "BAHAR" ? 3 : 4;
          }
        }
      } else if (gameMode === "low") {
        const { totalAndar = 0, totalBahar = 0, totalTie = 0 } = gameSeqResp;

        if (totalAndar * 2 <= totalTie * 9 && totalAndar <= totalBahar) {
          winnerOption = "ANDAR";
          listLength = 2;
        } else if (totalBahar * 2 <= totalTie * 9 && totalBahar <= totalAndar) {
          winnerOption = "BAHAR";
          listLength = 3;
        } else if (
          totalTie * 9 <= totalAndar * 2 &&
          totalTie * 9 <= totalBahar * 2
        ) {
          winnerOption = "TIE";
          listLength = 4;
        } else {
          winnerOption = "ANDAR";
          listLength = 2;
        }
      } else {
      }
      let cardsList = randomCardList(gameSeqResp.systemCard, listLength);
      if (winnerOption !== "TIE") {
        cardsList = [...cardsList, gameSeqResp.systemCard];
      }
      const setAnBSeqReq = {
        query: { sequenceNumber: sequenceNumber },
        update: {
          $set: {
            cardsList: cardsList,
            winnerOption: winnerOption,
          },
        },
        database: "game-panel",
        collection: "andar-bahar",
        method: "updateOne",
      };
      await db(setAnBSeqReq);

      let currentUTCTime = new Date();
      const currentISTMins =
        currentUTCTime.getMinutes() - currentUTCTime.getTimezoneOffset();
      currentUTCTime.setMinutes(currentISTMins);
      currentUTCTime.toISOString();

      gameSeqResp.players &&
        gameSeqResp.players.map(async (player) => {
          let isWon = player.betOption === winnerOption;
          let amount;
          if (isWon) {
            amount =
              winnerOption === "TIE"
                ? player.betAmount * 3
                : player.betAmount * 2;
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
                  game: "andarbahar",
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
                  description: `Result for Andar Bahar game ${sequenceNumber}`,
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

      gameSeqResp.players &&
        gameSeqResp.players.map(async (player) => {
          const relatedParents = [
            player.tier1Parent,
            player.tier2Parent,
            player.tier3Parent,
          ];
          relatedParents.map(async (parent) => {
            if (!isEmpty(parent)) {
              let isWon = player.betOption === winnerOption;
              let amount;
              if (isWon) {
                amount =
                  winnerOption === "TIE"
                  ? player.betAmount * 9 - (player.betAmount * 9) / 50
                  : player.betAmount * 2 - player.betAmount / 25;
              } else {
                amount = -player.betAmount;
              }
              const adminsReq = {
                query: { userName: player.userName },
                update: {
                  $inc: {
                    plBalance: amount,
                  },
                },
                database: "admin-panel",
                collection: "admin",
                method: "updateOne",
              };
              await db(adminsReq);
            }
          });
        });
    }
  } catch (err) {
    console.log(err);
  }
}

module.exports = setAnBGameResults;
