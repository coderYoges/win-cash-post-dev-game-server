const express = require("express");
const users = express.Router();

const validateUser = require('../controllers/validateUser');
const getBalance = require("../controllers/getBalance");
const updateBalance = require("../controllers/updateBalance");
const getUser = require("../controllers/getUser");
const updateUserPassword = require('../controllers/updateUserPassword');

users.post('/validateUser',validateUser);
users.post('/getBalance', getBalance)
users.post('/updateBalance', updateBalance)
users.post('/getUser',getUser);
users.post('/updateUserPassword', updateUserPassword);

module.exports = users;
