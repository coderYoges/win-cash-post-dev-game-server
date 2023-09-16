const db = require("../connections/db");
const setGameSequence = require("./setGameSequence");
const setAnBGameResults = require("./setAnBGameResults");
const setDnTGameResults = require("./setDnTGameResults");
const setLucky7GameResults = require("./setLucky7GameResults");

const initializeGame = async () => {
  const intervalTimer = setInterval(async () => {
    const requestBody = {
      query: {},
      database: "game-panel",
      collection: "common-game",
      method: "findWithLimit",
      limit: 1,
      sort: {
        _id: -1,
      },
    };

    let newUTCTime = new Date();
    const newISTMins = newUTCTime.getMinutes() - newUTCTime.getTimezoneOffset();
    newUTCTime.setMinutes(newISTMins);
    let currentDate = Math.floor(newUTCTime.valueOf() / 1000);

    if (currentDate % 60 === 0) {
      const commonGameData = await db(requestBody);
      await setGameSequence(Number(commonGameData[0].sequenceNumber) + 1);
    } else {
    }

    if (currentDate % 60 === 50) {
      const commonGameData = await db(requestBody);
      await setAnBGameResults(Number(commonGameData[0].sequenceNumber));
      await setDnTGameResults(Number(commonGameData[0].sequenceNumber));
      await setLucky7GameResults(Number(commonGameData[0].sequenceNumber));
    }
  }, 1000);
  return () => clearInterval(intervalTimer);
};

module.exports = initializeGame;
