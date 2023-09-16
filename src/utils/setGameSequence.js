const db = require("../connections/db");

async function setGameSequence(sequenceNumber) {
  const randomCard = "card" + (Math.floor(Math.random() * 9) + 1);
  const commonGameReqBody = {
    query: {},
    update: { sequenceNumber: sequenceNumber },
    database: "game-panel",
    collection: "common-game",
    method: "insertOne",
  }
  const andarBaharReqBody = {
    query: {},
    update: { sequenceNumber: sequenceNumber, systemCard: randomCard },
    database: "game-panel",
    collection: "andar-bahar",
    method: "insertOne",
  };
  const dragonTigerReqBody = {
    query: {},
    update: { sequenceNumber: sequenceNumber },
    database: "game-panel",
    collection: "dragon-tiger",
    method: "insertOne",
  };
  const luckySevenReqBody = {
    query: {},
    update: { sequenceNumber: sequenceNumber },
    database: "game-panel",
    collection: "lucky-seven",
    method: "insertOne",
  };
  try {
    await db(commonGameReqBody);
    await db(andarBaharReqBody);
    await db(dragonTigerReqBody);
    await db(luckySevenReqBody);
  } catch (err) {
    console.log(err);
  }
}

module.exports = setGameSequence;
