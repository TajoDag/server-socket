// const express = require("express");
// const http = require("http");
// const { Server } = require("socket.io");
// require("dotenv").config();

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

// let onlineUsers = [];
// let onlineAdmins = [];
// let forceLogoutUserId = null;

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// io.on("connection", (socket) => {
//   console.log("New client connected", socket.id);

//   socket.on("addNewUser", (user) => {
//     if (user) {
//       const { userId, role } = user;
//       if (role === "admin" || role === "Super Admin") {
//         if (!onlineAdmins.some((admin) => admin.userId === userId)) {
//           onlineAdmins.push({ userId, socketId: socket.id });
//         }
//         io.emit("getOnlineAdmins", onlineAdmins);
//       } else {
//         if (!onlineUsers.some((u) => u.userId === userId)) {
//           onlineUsers.push({ userId, socketId: socket.id });
//         }
//         io.emit("getOnlineUsers", onlineUsers);
//       }
//       console.log("onlineUsers after addNewUser:", onlineUsers);
//       console.log("onlineAdmins after addNewUser:", onlineAdmins);
//     }
//   });

//   socket.on("sendMessage", (message) => {
//     const { senderId, recipientId, role } = message;

//     if (role === "admin" || role === "Super Admin") {
//       const user = onlineUsers.find((u) => u.userId === recipientId);
//       if (user) {
//         io.to(user.socketId).emit("getMessage", message);
//         io.to(user.socketId).emit("getNotification", {
//           senderId: message.senderId,
//           isRead: false,
//           date: new Date(),
//         });
//       }
//     } else {
//       onlineAdmins.forEach((admin) => {
//         io.to(admin.socketId).emit("getMessage", message);
//         io.to(admin.socketId).emit("getNotification", {
//           senderId: message.senderId,
//           isRead: false,
//           date: new Date(),
//         });
//       });
//     }
//   });

//   socket.on("forceLogout", ({ userId }) => {
//     forceLogoutUserId = userId; // Lưu userId vào biến toàn cục
//     const userSocket = onlineUsers.find((user) => user.userId === userId);
//     console.log("forceLogout userId:", userId);
//     console.log("forceLogout userSocket:", userSocket);
//     if (userSocket) {
//       io.to(userSocket.socketId).emit("forceLogout");
//     }
//   });

//   socket.on("getForceLogoutUserId", () => {
//     socket.emit("receiveForceLogoutUserId", { userId: forceLogoutUserId });
//   });

//   socket.on("disconnect", () => {
//     onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
//     onlineAdmins = onlineAdmins.filter((admin) => admin.socketId !== socket.id);
//     io.emit("getOnlineUsers", onlineUsers);
//     io.emit("getOnlineAdmins", onlineAdmins);
//     console.log("User disconnected", socket.id);
//     console.log("onlineUsers after disconnect:", onlineUsers);
//     console.log("onlineAdmins after disconnect:", onlineAdmins);
//   });
// });

// const PORT = process.env.PORT || 3000;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const CLIENT_PORT = process.env.CLIENT_PORT;
const ADMIN_PORT = process.env.ADMIN_PORT;

const io = new Server(server, {
  cors: {
    origin: [CLIENT_PORT, ADMIN_PORT],
    methods: ["GET", "POST"],
  },
});

let onlineUsers = [];
let onlineAdmins = [];
let forceLogoutUserId = null;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

io.on("connection", (socket) => {
  console.log("New client connected", socket.id);

  socket.on("addNewUser", (user) => {
    if (user) {
      const { userId, role } = user;
      if (role === "admin" || role === "Super Admin") {
        if (!onlineAdmins.some((admin) => admin.userId === userId)) {
          onlineAdmins.push({ userId, socketId: socket.id });
        }
        io.emit("getOnlineAdmins", onlineAdmins);
      } else {
        if (!onlineUsers.some((u) => u.userId === userId)) {
          onlineUsers.push({ userId, socketId: socket.id });
        }
        io.emit("getOnlineUsers", onlineUsers);
      }
      console.log("onlineUsers after addNewUser:", onlineUsers);
      console.log("onlineAdmins after addNewUser:", onlineAdmins);
    }
  });

  socket.on("sendMessage", (message) => {
    const { senderId, recipientId, role } = message;

    if (role === "admin" || role === "Super Admin") {
      const user = onlineUsers.find((u) => u.userId === recipientId);
      if (user) {
        io.to(user.socketId).emit("getMessage", message);
        io.to(user.socketId).emit("getNotification", {
          senderId: message.senderId,
          isRead: false,
          date: new Date(),
        });
      }
    } else {
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

  socket.on("forceLogout", ({ userId }) => {
    forceLogoutUserId = userId; // Lưu userId vào biến toàn cục
    const userSockets = onlineUsers.filter((user) => user.userId === userId);
    console.log("forceLogout userId:", userId);
    console.log("forceLogout userSockets:", userSockets);
    if (userSockets.length > 0) {
      userSockets.forEach((userSocket) => {
        io.to(userSocket.socketId).emit("forceLogout");
      });
    }
  });

  socket.on("getForceLogoutUserId", () => {
    socket.emit("receiveForceLogoutUserId", { userId: forceLogoutUserId });
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    onlineAdmins = onlineAdmins.filter((admin) => admin.socketId !== socket.id);
    io.emit("getOnlineUsers", onlineUsers);
    io.emit("getOnlineAdmins", onlineAdmins);
    console.log("User disconnected", socket.id);
    console.log("onlineUsers after disconnect:", onlineUsers);
    console.log("onlineAdmins after disconnect:", onlineAdmins);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
