const lodash = require("lodash");
const db = require("../connections/db");
const { client } = require("../config/client");

const validateUser = async (req, res) => {
  const requestBody = {
    query: { userName: req.body.userName },
    database: "user-panel",
    collection: "users",
    method: "findOne",
  };

  let currentUTCTime = new Date();
  const currentISTMins =
    currentUTCTime.getMinutes() - currentUTCTime.getTimezoneOffset();
  currentUTCTime.setMinutes(currentISTMins);
  currentUTCTime.toISOString();

  const updateLoginTime = {
    query: { userName: req.body.userName },
    update: {
      $push: {
        lastLogins: {
          userPlatform: req.body.userPlatform,
          userBrowser: req.body.userBrowser,
          userIPAddress: req.body.userIPAddress,
          userCity: req.body.userCity,
          loginTime: currentUTCTime,
        },
      },
    },
    database: "user-panel",
    collection: "users",
    method: "updateOne",
  };
  try {
    const data = await db(requestBody);
    !lodash.isEmpty(data) && (await db(updateLoginTime));
    const isError =
      lodash.isEmpty(data) ||
      data.isBlocked ||
      data.isDeleted ||
      data.password !== req.body.password;

    if (!isError) {
      return res.status(200).json({
        isSuccessful: true,
        successCode: "0000",
        data,
      });
    } else {
      if (lodash.isEmpty(data))
        res.status(401).json({
          isSuccessful: false,
          errorMessage: "User not found!!!",
        });
        else if (data.isDeleted)
        res.status(401).json({
          isSuccessful: true,
          errorMessage: "User is deleted !!!",
        });
      else if (data.isBlocked)
        res.status(401).json({
          isSuccessful: false,
          errorMessage: "User is not active !!!",
        });
      else if (data.password !== req.body.password)
        res.status(401).json({
          isSuccessful: false,
          errorMessage: "Password Incorrect !!!",
        });
    }
  } catch (err) {
    console.log("error", err);
    res.status(500).json({
      isSuccessful: false,
      errorMessage: "Internal Server Error",
    });
  }
};

module.exports = validateUser;
