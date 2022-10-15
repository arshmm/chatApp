const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  getRoomUsers,
  userLeave,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);
//Static Folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "BOT";
// Run when client connects
io.on("connection", (socket) => {
  console.log("new connection");
  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    //ON joining
    socket.emit(
      "message",
      formatMessage(botName, `Welcome to ${user.room} room :D`)
    );

    //ON new connection
    socket.broadcast
      .to(user.room)
      .emit("message", formatMessage(botName, `${user.username} entered :) `));

    // SEND  user and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //listen for chat message
  socket.on("chatMessage", (msg) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  });

  //ON disconnection
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} left :(`)
      );
      // SEND  user and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = 3000 || process.env.PORT;
server.listen(PORT, () => {
  console.log(`App running on port ${PORT}`);
});
