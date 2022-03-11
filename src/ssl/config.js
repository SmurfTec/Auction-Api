let path = require('path');
let fs = require('fs');

// exports.keyssl = ;
exports.certssl = 'sdasd';
exports.keyssl = fs
  .readFileSync(path.join(__dirname, './generated-private-key.txt'), 'utf8')
  .toString();
exports.certssl = fs
  .readFileSync(path.join(__dirname, './ssl.crt'), 'utf8')
  .toString();

// * you have to read ssl file using module fs(file system) using utf-8
// ==============================================================================================

// Then use this secure https server with socket:
// ---------------------------------------------

// ->  const server = require('https').Server(sslKeys, app);
//     const io = require('socket.io')(server);
