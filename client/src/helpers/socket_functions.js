import { LOBBY } from "../styles/_constants";

const joinRoom = (socket, room, user = "") => {
  if ((user !== "" && room !== "") || room === LOBBY) {
    socket.emit("join_room", { room, user });
  }
  // if (user === "") console.log("no user name");
};

const leaveRoom = (socket, room) => {
  socket.emit("leave_room", room);
};

export { joinRoom, leaveRoom };
