// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// require("dotenv").config();

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     // origin: [process.env.CLIENT_PORT, process.env.ADMIN_PORT],
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// let onlineUsers = [];
// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });
// io.on("connection", (socket) => {
//   // console.log("New client connected", socket.id);

//   socket.on("addNewUser", (userId) => {
//     !onlineUsers.some((user) => user.userId === userId) &&
//       onlineUsers.push({
//         userId,
//         socketId: socket.id,
//       });

//     // console.log("onlineUsers", onlineUsers);
//     io.emit("getOnlineUsers", onlineUsers);
//   });

//   // add message
//   socket.on("sendMessage", (message) => {
//     // console.log("Message sent", message);
//     const user = onlineUsers.find(
//       (user) => user.userId === message.recipientId
//     );

//     if (user) {
//       io.to(user.socketId).emit("getMessage", message);
//       io.to(user.socketId).emit("getNotification", {
//         senderId: message.senderId,
//         isRead: false,
//         date: new Date(),
//       });
//     }
//   });

//   socket.on("disconnect", () => {
//     onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
//     io.emit("getOnlineUsers", onlineUsers);
//   });
// });

// const PORT = process.env.PORT || 3000;

// // io.listen(PORT);
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];
let onlineAdmins = []; // Danh sách quản lý các admin trực tuyến

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket) => {
  socket.on("addNewUser", (user) => {
    const { userId, role } = user;
    if (role === "admin" || role === "Super Admin") {
      !onlineAdmins.some((admin) => admin.userId === userId) &&
        onlineAdmins.push({ userId, socketId: socket.id });
      io.emit("getOnlineAdmins", onlineAdmins);
    } else {
      !onlineUsers.some((user) => user.userId === userId) &&
        onlineUsers.push({ userId, socketId: socket.id });
      io.emit("getOnlineUsers", onlineUsers);
    }
  });

  socket.on("sendMessage", (message) => {
    const { senderId, recipientId, role } = message;
    
    if (role === "admin" || role === "Super Admin") {
      // Gửi tin nhắn từ admin đến người dùng
      const user = onlineUsers.find((user) => user.userId === recipientId);
      if (user) {
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        });
      }
    } else {
      // Gửi tin nhắn từ người dùng đến tất cả admin
      onlineAdmins.forEach((admin) => {
        io.to(admin.socketId).emit("getMessage", message);
        io.to(admin.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        });
      });
    }
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    onlineAdmins = onlineAdmins.filter((admin) => admin.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
    io.emit("getOnlineAdmins", onlineAdmins);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

