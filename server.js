const mongoose = require('mongoose');
const dotenv = require('dotenv').config({ path: './config.env' });
const colors = require('colors');
const socketIo = require('socket.io');
const DBConnect = require('./src/utils/dbConnect');
const { handleNewMessage } = require('./src/controllers/socketController');

const { keyssl, certssl } = require('./src/ssl/config');

process.on('uncaughtException', (error) => {
  // using uncaughtException event
  console.log(' uncaught Exception => shutting down..... ');
  console.log(error.name, error.message);
  process.exit(1); //  emidiatly exists all from all the requests
});

const app = require('./app');

// database connection
DBConnect();

// server
const port = process.env.PORT || 7000;
const server = require('https').Server(
  {
    key: keyssl,
    cert: certssl,
  },
  app
);
server.listen(port, () => {
  console.log(`App is running on port ${port}`.yellow.bold);
});
// const server = app.listen(port, () => {
//   console.log(`App is running on port ${port}`.yellow.bold);
// });
const io = socketIo(server);

io.on('connection', (socket) => {
  console.log(`Connection created with socket ${socket.id}`);

  socket.on('newMessage', (data) => {
    handleNewMessage(io, data);
  });
});
// handle Globaly  the unhandle Rejection Error which is  outside the express
module.exports = { io };

// e.g database connection
process.on('unhandledRejection', (error) => {
  // it uses unhandledRejection event
  // using unhandledRejection event
  console.log(' Unhandled Rejection => shutting down..... ');
  console.log(error.name, error.message);
  server.close(() => {
    process.exit(1); //  emidiatly exists all from all the requests sending OR pending
  });
});
