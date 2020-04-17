var http = require('http').createServer();
var io = require('socket.io')(http);
const { Server } = require('node-osc');

// Create Socket.io Socket and listen for data
io.on('connection', client => {
  client.on('event', data => { console.log(data); });
  client.on('disconnect', () => { /* … */ });
});

// Start the Socket.io Socket Server
http.listen(4001, function(){
  console.log('listening on *:4001');
});



// Start the OSC server and listen for data
var oscServer = new Server(4559, '127.0.0.1');
oscServer.on('message', function (msg) {
  if (msg[0] != '/time') {
    io.emit('eSenseData', msg);
  }
});
