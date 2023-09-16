const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const { client } = require("./src/config/client");

const app = express();
const port = process.env.port || 25272;

const initializeGame = require("./src/utils/initializeGame");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

initializeGame();

const usersRouter = require("./src/routes/users");
const andarBahars = require("./src/routes/andarBahar");
const dragonTigers = require('./src/routes/dragonTiger');
const luckySevens = require('./src/routes/luckySeven');

app.get("/api/v1", (_, res) => {
  res.send({ message: "Game server version 1.0 API's are available" });
});

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/andarbahar", andarBahars);
app.use("/api/v1/dragontiger", dragonTigers);
app.use('/api/v1/luckyseven', luckySevens);

const privateKey = fs.readFileSync("privkey.pem", "utf8");
const certificate = fs.readFileSync("cert.pem", "utf8");

const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, () => {
  console.log(`Win cash game servers listening on port ${port}`);
});
