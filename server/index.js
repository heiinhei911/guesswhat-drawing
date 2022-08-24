const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
app.use(cors());
const server = http.createServer(app);
const config = require("dotenv").config();
const port = process.env.PORT || 3001;
const connectDB = require("./config/db");
const connectSocket = require("./config/socket");
const words = require("./routes/words");

const io = new Server(server, {
  cors: {
    origin: "*",
    // process.env.ENV === "PRODUCTION"
    //   ? "https://guesswhat-drawing.herokuapp.com/*"
    //   : "http://100.65.192.240:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept"],
    // credentials: true,
  },
});

app.get("/", (req, res) => res.send("Hello world"));

app.use("/api/words", words);

server.listen(port, () => {
  console.log(`Server running on ${port}`);
});

connectDB();
connectSocket(io);
