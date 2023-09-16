const express = require("express");
const dragonTigers = express.Router();

const getDnTGames = require("../controllers/getDnTGames");
const setDnTBets = require("../controllers/setDnTBets");
const getDnTResults = require("../controllers/getDnTResults");
const getDnTSequence = require("../controllers/getDnTSequence");

dragonTigers.get("/getDnTGames", getDnTGames);
dragonTigers.post("/setDnTBets", setDnTBets);
dragonTigers.post("/getDnTResults", getDnTResults);
dragonTigers.get('/getDnTSequence', getDnTSequence);

module.exports = dragonTigers;
