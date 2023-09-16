const lodash = require("lodash");
const db = require("../connections/db");

const getAnBItemBySequence = async (req, res) => {
  const requestBody = {
    query: { sequenceNumber: req.body.sequenceNumber },
    database: "game-panel",
    collection: "andar-bahar",
    method: "findOne",
  };
  try {
    const data = await db(requestBody);

    if (lodash.isEmpty(data))
      res.status(401).json({
        isSuccessful: false,
        errorMessage: "Game sequence is not found!!!",
      });
    else
      res.status(200).json({
        isSuccessful: true,
        message: "Game details captured successfully",
        data,
      });
  } catch (err) {
    res.status(500).json({
      isSuccessful: false,
      errorMessage: "Internal Server Error",
    });
  }
};

module.exports = getAnBItemBySequence;
