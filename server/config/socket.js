const axios = require("axios");
require("dotenv").config();

const connectSocket = (io) => {
  io.on("connection", (socket) => {
    const getClients = (room) => io.sockets.adapter.rooms.get(room);

    const randomNumberArray = (size, push, type) => {
      const array = [];
      while (array.length < size) {
        let r = Math.floor(
          Math.random() * (type === "turn" ? size : push.length)
        );
        console.log(r);
        if (array.indexOf(push[r]) === -1) array.push(push[r]);
      }

      return array;
    };

    const getTurnsOrder = async (room, rounds) => {
      const clientsList = [];
      const sockets = await io.in(room).fetchSockets();

      for (const clientSocket of sockets) {
        clientsList.push(clientSocket.id);
      }

      let randomizedClientsList = randomNumberArray(
        clientsList.length,
        clientsList,
        "turn"
      );

      while (Math.abs(rounds - randomizedClientsList.length) > 0) {
        let additionalClient =
          clientsList[Math.floor(Math.random() * clientsList.length)];

        while (
          additionalClient ===
          randomizedClientsList[randomizedClientsList.length - 1]
        ) {
          additionalClient =
            clientsList[Math.floor(Math.random() * clientsList.length)];
        }
        randomizedClientsList = [...randomizedClientsList, additionalClient];
      }
      return randomizedClientsList;
    };

    const getRoundWords = async (rounds) => {
      try {
        const res = await axios.get(
          process.env.ENV === "PRODUCTION"
            ? "https://guesswhat-drawing.herokuapp.com/api/words"
            : "http://192.168.68.107:3001/api/words"
        );
        const allWords = res.data;

        return randomNumberArray(rounds, allWords, "words");
      } catch (err) {
        console.log(err);
      }
    };

    const updatePlayerList = async (room, removeSelf = false) => {
      const clients = getClients(room);
      const clientsList = [];
      const sockets = await io.in(room).fetchSockets();

      for (const clientSocket of sockets) {
        const clientObj = {
          id: clientSocket.id,
          username: clientSocket.data.username,
        };

        if (removeSelf) {
          if (clientSocket.id !== socket.id) {
            clientsList.push(clientObj);
          }
        } else {
          clientsList.push(clientObj);
        }
      }

      io.in(room).emit("get_room_clients", {
        total: clients?.size || 0,
        clients: clientsList,
      });
    };

    const setCreator = (room) => {
      const roomData = getClients(room);
      if (roomData.creator) {
        socket.emit("receive_creator", roomData.creator);
      } else {
        roomData.creator = socket.id;
      }
    };

    console.log("connected ", socket.id);

    // Join/Leave Rooms ---------------------------
    socket.on("join_room_check", (room) => {
      socket.emit(
        "room_exists",
        io.sockets.adapter.rooms.has(room)
        // socket.rooms.has(user)
      );
    });

    socket.on("join_room", async (joinRoomData) => {
      // const sockets = await io.fetchSockets();

      socket.join(joinRoomData.room);
      updatePlayerList(joinRoomData.room);

      if (joinRoomData.room !== "lobby") {
        setCreator(joinRoomData.room);

        io.in(joinRoomData.room).emit(
          "update_player_count",
          getClients(joinRoomData.room).size
        );

        if (!socket.data.username) {
          socket.data.username = joinRoomData.user;
        }
      }

      console.log(`User ${socket.id} joined ${joinRoomData.room}`);
    });

    socket.on("leave_room", (room) => {
      // socket.to(room).emit("left_room");
      socket.leave(room);
      updatePlayerList(room);
      io.in(room).emit("update_player_count", getClients(room)?.size);
      console.log(`User ${socket.id} left ${room}`);
    });

    // Game Logic ---------------------------------
    socket.on("get_players", (room) => {
      updatePlayerList(room);
    });

    socket.on("send_start_game", (gameData) => {
      socket.to(gameData.room).emit("receive_start_game", gameData);
    });

    socket.on("send_stop_game", (room) => {
      socket.to(room).emit("receive_stop_game");
    });

    socket.on("send_start_rounds", async (startRoundsData) => {
      const order = await getTurnsOrder(
        startRoundsData.room,
        startRoundsData.totalRounds
      );
      const words = await getRoundWords(startRoundsData.totalRounds);

      console.log(order);
      console.log(words);

      io.in(startRoundsData.room).emit("receive_start_rounds", {
        room: startRoundsData.room,
        order,
        words,
      });
    });

    // End of Round Types --------------------------
    socket.on("matched_word", (matchedWordData) => {
      io.in(matchedWordData.room).emit("end_of_round", matchedWordData);
    });

    socket.on("player_left", (playerData) => {
      io.in(playerData.room).emit("end_of_round", playerData);
    });

    // Canvas Drawing -------------------------------
    socket.on("send_startDrawing", (drawingData) => {
      socket.to(drawingData.room).emit("receive_startDrawing", drawingData);
    });

    socket.on("send_drawing", (drawingData) => {
      socket.to(drawingData.room).emit("receive_drawing", drawingData);
    });

    socket.on("send_finishDrawing", (drawingData) => {
      socket.to(drawingData.room).emit("receive_finishDrawing", drawingData);
    });

    socket.on("send_canvasRef", (canvasData) => {
      socket.to(canvasData.room).emit("receive_canvasRef", canvasData);
    });

    // Chat -----------------------------------------
    socket.on("send_chat", (messageData) => {
      socket.to(messageData.room).emit("receive_chat", messageData);
    });

    socket.on("send_guess", (messageData) => {
      socket.to(messageData.room).emit("receive_guess", messageData);
    });

    // Disconnecting ---------------------------------
    socket.on("disconnecting", (reason) => {
      console.log(`${socket.id} is disconnecting. Reason: `, reason);

      for (const room of socket.rooms) {
        updatePlayerList(room, true);
        io.in(room).emit("update_player_count", getClients(room)?.size - 1);
      }
    });

    socket.on("disconnect", () => {
      console.log("disconnected ", socket.id);
    });
  });
};

module.exports = connectSocket;
