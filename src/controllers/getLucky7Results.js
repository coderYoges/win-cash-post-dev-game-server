const { isEmpty } = require("lodash");
const db = require("../connections/db");

const getLucky7Results = async (req, res) => {
  const requestBody = {
    query: { sequenceNumber: req.body.sequenceNumber },
    database: "game-panel",
    collection: "lucky-seven",
    method: "findOne",
  };
  try {
    const data = await db(requestBody);
    const playerId = req.body.userName;
    const participation = (await data.players)
      ? data.players.find((player) => player.userName === playerId)
      : undefined;
    if (!participation) {
      if (isEmpty(data))
        res.status(401).json({
          isSuccessful: false,
          errorMessage: "Player details not found!!!",
        });
      else
        res.status(200).json({
          isSuccessful: true,
          message: "Game details captured successfully",
          data,
        });
    } else {
      const isWon = data.winnerOption === participation.betOption;
      let result;
      if (isWon) {
        result =
        data.winnerOption === "TIE"
        ? participation.betAmount * 3
        : participation.betAmount * 2;
      } else {
        result = participation.betAmount;
      }

      if (isEmpty(data))
        res.status(401).json({
          isSuccessful: false,
          errorMessage: "Game sequence is not found!!!",
        });
      else
        res.status(200).json({
          isSuccessful: true,
          message: "Game details captured successfully",
          data: {
            ...data,
            isWon: isWon,
            result: result,
          },
        });
    }
  } catch (err) {
    res.status(500).json({
      isSuccessful: false,
      errorMessage: "Internal Server Error",
    });
  }
};

module.exports = getLucky7Results;
