const db = require("../connections/db");
const { dragonTigerCards } = require("./general");
const { isEmpty, get } = require("lodash");

async function setDnTGameResults(sequenceNumber) {
  let winnerOption;
  const getDnTSeqReq = {
    query: { sequenceNumber: sequenceNumber },
    database: "game-panel",
    collection: "dragon-tiger",
    method: "findOne",
  };
  const getDnTWinMode = {
    query: { docName: "dragonTiger" },
    database: "admin-panel",
    collection: "admin-utils",
    method: "findOne",
  };
  try {
    const gameSeqResp = await db(getDnTSeqReq);
    const gameResModeResp = await db(getDnTWinMode);
    if (isEmpty(gameSeqResp) && isEmpty(gameResModeResp)) {
    } else {
      const gameMode = get(gameResModeResp, "mode", "low");
      if (gameSeqResp.winnerOption) {
        winnerOption = gameSeqResp.winnerOption;
      } else if (
        !gameSeqResp.totalTiger &&
        !gameSeqResp.totalDragon &&
        !gameSeqResp.totalTie
      ) {
        const randomNo = Math.floor(Math.random() * 20) + 1;
        if (randomNo === 11) {
          winnerOption = "TIE";
        } else if (randomNo % 2 === 0) {
          winnerOption = "TIGER";
        } else {
          winnerOption = "DRAGON";
        }
      } else if (gameMode === "high") {
        const { totalDragon = 0, totalTiger = 0, totalTie = 0 } = gameSeqResp;
        const highBiter =
          totalDragon >= totalTiger && totalDragon >= totalTie * 4.5
            ? "DRAGON"
            : totalTiger >= totalTiger && totalTiger >= totalTie * 4.5
            ? "TIGER"
            : "TIE";
        const lowBiter =
          totalDragon < totalTiger && totalDragon < totalTie * 4.5
            ? "DRAGON"
            : totalTiger < totalTiger && totalTiger < totalTie * 4.5
            ? "TIGER"
            : "TIE";
        if (sequenceNumber % 3 === 0) {
          winnerOption = lowBiter;
        } else {
          winnerOption = highBiter;
        }
      } else if (gameMode === "mid") {
        const { totalDragon = 0, totalTiger = 0, totalTie = 0 } = gameSeqResp;
        const highBiter = totalDragon >= totalTiger ? "DRAGON" : "TIGER";
        const lowBiter = totalDragon < totalTiger ? "DRAGON" : "TIGER";

        if (totalDragon === totalTiger) {
          winnerOption = "TIE";
          listLength =
            highBiter === "DRAGON" ? 2 : highBiter === "TIGER" ? 3 : 4;
          if (sequenceNumber % 2 === 0) {
            winnerOption = lowBiter;
            listLength =
              lowBiter === "DRAGON" ? 2 : lowBiter === "TIGER" ? 3 : 4;
          } else {
            winnerOption = highBiter;
            listLength =
              highBiter === "DRAGON" ? 2 : highBiter === "TIGER" ? 3 : 4;
          }
        } else {
          const totalSum = totalDragon + totalTiger;

          const difference = Math.abs(totalDragon - totalTiger);
          const threshold = 0.11 * totalSum;

          if (difference < threshold) {
            winnerOption = "TIE";
            listLength =
              highBiter === "DRAGON" ? 2 : highBiter === "TIGER" ? 3 : 4;
          } else {
            winnerOption = lowBiter;
            listLength =
              highBiter === "DRAGON" ? 2 : highBiter === "TIGER" ? 3 : 4;
          }
        }
      } else if (gameMode === "low") {
        const { totalDragon = 0, totalTiger = 0, totalTie = 0 } = gameSeqResp;

        if (totalDragon * 2 <= totalTie * 9 && totalDragon <= totalTiger) {
          winnerOption = "DRAGON";
        } else if (
          totalTiger * 2 <= totalTie * 9 &&
          totalTiger <= totalDragon
        ) {
          winnerOption = "TIGER";
        } else if (
          totalTie * 9 <= totalDragon * 2 &&
          totalTie * 9 <= totalTiger * 2
        ) {
          winnerOption = "TIE";
        } else {
          winnerOption = "DRAGON";
        }
      } else {
      }
      let cardsList = dragonTigerCards(winnerOption);
      const setTnDSeqReq = {
        query: { sequenceNumber: sequenceNumber },
        update: {
          $set: {
            cardsList: cardsList,
            winnerOption: winnerOption,
          },
        },
        database: "game-panel",
        collection: "dragon-tiger",
        method: "updateOne",
      };
      await db(setTnDSeqReq);

      let currentUTCTime = new Date();
      const currentISTMins =
        currentUTCTime.getMinutes() - currentUTCTime.getTimezoneOffset();
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
                  game: "dragontiger",
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
                  description: `Result for Dragon Tiger game ${sequenceNumber}`,
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

module.exports = setDnTGameResults;
