const db = require("../connections/db");

const updateUserPassword = async (req, res) => {
  let currentUTCTime = new Date();
  let diff = -currentUTCTime.getTimezoneOffset();
  const currentISTMins = currentUTCTime.getMinutes() + diff;
  currentUTCTime.setMinutes(currentISTMins);
  currentUTCTime.toISOString();

  const requestBody = {
    query: { userName: req.body.userName, password: req.body.oldPassword },
    update: {
      $set: {
        password: req.body.newPassword,
      },
      $push: {
        passwordHistory: {
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
    if (data.acknowledged)
      res.status(200).json({
        isSuccessful: true,
        successCode: "0000",
        data,
      });
    else
      res.status(400).json({
        isSuccessful: false,
        errorMessage: "Invalid User details!",
      });
  } catch (error) {
    res.status(500).json({
      isSuccessful: false,
      errorMessage: "Internal Server Error",
      data: { error },
    });
  }
};

module.exports = updateUserPassword;
