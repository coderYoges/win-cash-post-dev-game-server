const lodash = require("lodash");
const db = require("../connections/db");

const getUser = async (req, res) => {
  const requestBody = {
    query: { "userName": req.body.userName },
    database: "user-panel",
    collection: "users",
    method: "findOne",
  };
  try {
    const data = await db(requestBody);
    
    if (lodash.isEmpty(data))
    res.status(401).json({
      isSuccessful: false,
      errorMessage: "User not found!!!",
    });
  else
    res.status(200).json({
      isSuccessful: true,
      message: "Balance is updated successful",
      data: data,
    });

  } catch (err) {
    console.log("error", err);
    res.status(500).json({
      isSuccessful: false,
      errorMessage: "Internal Server Error",
    });
  }
};

module.exports = getUser;
