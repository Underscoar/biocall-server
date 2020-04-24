const http = require('http').createServer(); // A listening server (for Socket.io) on http
const io = require('socket.io')(http); // The Socket.io server
const { Server } = require('node-osc'); // The OSC server for receiving eSense data
const net = require('net'); // The net server for receiving Facereader data

const host = '127.0.0.1';
const oscPort = 4559;
const faceReaderPort = 8052;
const httpPort = 4001;

console.log('Starting biocall server');


/* Socket for connecting to webinterfaces for front-end */
// Create Socket.io Socket and listen for data
io.on('connection', client => {
  client.on('event', data => { console.log(data); });
  client.on('disconnect', () => { /* … */ });
});

// Start the Socket.io Socket Server
http.listen(httpPort, function(){
  /* ... */
  console.log('Listening for HTTP requests for Socket.io on port ' + httpPort);
});
/* ---------------------------------------------------------- */


/* eSense */
// Start the OSC server and listen for eSense data
var oscServer = new Server(oscPort, host);
console.log('Listening for OSC data on port ' + oscPort);
oscServer.on('message', function (msg) {
  if (msg[0] != '/time') {
    //emits the OSC data in the io Socket to the front-end
    io.emit('eSenseData', msg);
  }
});
/* ---------------------------------------------------------- */


/* Facereader */
// Facereader connects to a middleman: Facereader client. Facereader client connects to Facreader itself and relays the data
var faceReaderClient = null;
faceReaderClient = new net.Socket();

// Connect to the FaceReader client
faceReaderClient.connect(faceReaderPort, host, function() {
  console.log('Connection to FaceReader client opened successfully!');
});

faceReaderClient.on('error', function(err) {
  // faceReaderClient.destroy();
  // faceReaderClient = null;
  console.log("ERROR: Connection could not be openend. Msg: %s", err.message);
});

faceReaderClient.on('data', function(data) {
  console.log("Received: %s", data);
  io.emit('faceReaderData', JSON.parse(data));
});
/* ---------------------------------------------------------- */
