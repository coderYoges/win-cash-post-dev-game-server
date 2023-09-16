const lodash = require("lodash");
const db = require("../connections/db");

const getLucky7Sequence = async (req, res) => {
  const requestBody = {
    query: {},
    database: "game-panel",
    collection: "lucky-seven",
    method: "findWithLimit",
    limit: 1,
    sort: {
      _id: -1,
    },
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

module.exports = getLucky7Sequence;
