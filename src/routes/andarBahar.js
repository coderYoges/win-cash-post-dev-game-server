const express = require("express");
const andarBahars = express.Router();

const getAnBItemBySequence = require("../controllers/getAnBItemBySequence");
const getAnBGames = require("../controllers/getAnBGames");
const setAnBBets = require("../controllers/setAnBBets");
const getAnBResults = require('../controllers/getAnBResults');
const getAnBSequence = require('../controllers/getAnBSequence');

andarBahars.post("/getAnBItemBySequence", getAnBItemBySequence);
andarBahars.get("/getAnBGames", getAnBGames);
andarBahars.post('/setAnBBets', setAnBBets);
andarBahars.post('/getAnBResults', getAnBResults);
andarBahars.get('/getAnBSequence', getAnBSequence)

module.exports = andarBahars;
