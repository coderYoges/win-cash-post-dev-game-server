const db = require("../connections/db");

const setLucky7Bets = async (req, res) => {
  const gameReqBody = {
    query: { sequenceNumber: req.body.sequenceNumber },
    update: {
      $push: {
        players: {
          userName: req.body.userName,
          betOption: req.body.betOption,
          betAmount: req.body.betAmount,
        },
      },
      $inc: {
        [`${req.body.totalBetType}`]: req.body.betAmount,
      },
    },
    database: "game-panel",
    collection: "lucky-seven",
    method: "updateOneWithoutAbsert",
  };

  let currentUTCTime = new Date();
  let diff = -(currentUTCTime.getTimezoneOffset());
  const currentISTMins = currentUTCTime.getMinutes() + diff;
  currentUTCTime.setMinutes(currentISTMins);
  currentUTCTime.toISOString();

  const userReqBody = {
    query: { userName:req.body.userName },
    update: {
      $inc: {
        balance: -req.body.betAmount,
        bets: req.body.betAmount
      },
      $push: {
        financialDetails: {
          dateAndTime: currentUTCTime,
          description: `Bets for Lucky Seven game ${req.body.sequenceNumber}`,
          isCredit: false,
          amount: req.body.betAmount,
        },
      },
    },
    database: "user-panel",
    collection: "users",
    method: "updateOne",
  };

  try {
    const gameData = await db(gameReqBody);
    await db(userReqBody)
    if (!gameData.acknowledged)
      res.status(401).json({
        isSuccessful: false,
        errorMessage: "User not found!!!",
      });
    else
      res.status(200).json({
        isSuccessful: true,
        message: "Game bets updated successful",
      });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({
      isSuccessful: false,
      errorMessage: "Internal Server Error",
    });
  }
};

module.exports = setLucky7Bets;
