const express = require("express");
const luckySeven = express.Router();

const getLucky7Games = require("../controllers/getLucky7Games");
const setLucky7Bets = require("../controllers/setLucky7Bets");
const getLucky7Results = require("../controllers/getLucky7Results");
const getLucky7Sequence = require("../controllers/getLucky7Sequence");

luckySeven.get("/getLucky7Games", getLucky7Games);
luckySeven.post("/setLucky7Bets", setLucky7Bets);
luckySeven.post("/getLucky7Results", getLucky7Results);
luckySeven.get('/getLucky7Sequence', getLucky7Sequence);

module.exports = luckySeven;
