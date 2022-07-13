const fs = require("fs");
const cors = require("cors");
const https = require("https");
const path = require("path");
const { Server } = require("socket.io");
const express = require("express");
const fileUpload = require("express-fileupload");

require("dotenv").config();

const serverHost = process.env.IP_HOST;
const clientPort = process.env.CLIENT_PORT;
const serverPort = process.env.SERVER_PORT || 4000;
const key = process.env.SSL_KEY_FILE;
const crt = process.env.SSL_CRT_FILE;

const app = express();
const options = {
  key: fs.readFileSync(__dirname + "/" + key),
  cert: fs.readFileSync(__dirname + "/" + crt),
};
const socketOptions = {
  cors: {
    origin: `*`,
  },
};

app.use(cors());
app.use(express.json());
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: "/temp/",
  })
);

app.get("/", (req, res) => {
  res.send("test");
});

app.post("/api/filesave", (req, res) => {
  let uploadPath = "";
  let file = req.files.test;
  uploadPath = __dirname + "/temp/" + req.files.test.name;

  file.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);
    res.send("file uploaded!");
  });

  // res.json({
  //   done: true,
  // });
});

app.post("/api/transfer/export", (req, res) => {
  let uploadPath = "";
  let file = req.files.test;
  uploadPath = __dirname + "/temp/" + req.files.test.name;

  file.mv(uploadPath, function (err) {
    if (err) return res.status(500).send(err);
    res.send("file uploaded!");
  });
});

//
const server =
  process.env.NODE_ENV === "production"
    ? https.createServer(app)
    : https.createServer(options, app);

server.listen(serverPort, () =>
  console.log(`listening on https://${serverHost}:${serverPort}`)
);

// socket server
const io = new Server(server, socketOptions);

io.on("connection", (socket) => {
  socket.on("message", (message) => {});
});
