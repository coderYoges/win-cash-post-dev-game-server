const lodash = require("lodash");
const db = require("../connections/db");
const { client } = require("../config/client");

const updateBalance = async (req, res) => {
  const requestBody = {
    query: { userName: req.body.userName },
    update: {
      $set: {
        balance: req.body.balance,
      },
    },
    database: "user-panel",
    collection: "users",
    method: "updateOne",
  };
  try {
    const data = await db(requestBody);
    if (!data.acknowledged)
      res.status(401).json({
        isSuccessful: false,
        errorMessage: "User not found!!!",
      });
    else
      res.status(200).json({
        isSuccessful: true,
        message: "Balance is updated successful",
        data: lodash.get(data, "balance"),
      });
  } catch (err) {
    console.log("error", err);
    res.status(500).json({
      isSuccessful: false,
      errorMessage: "Internal Server Error",
    });
  } finally {
    await client.close()
  }
};

module.exports = updateBalance;
