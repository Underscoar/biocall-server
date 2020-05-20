const http = require('http').createServer(); // A listening server (for Socket.io) on http
const io = require('socket.io')(http); // The Socket.io server
const { Server } = require('node-osc'); // The OSC server for receiving eSense data
const net = require('net'); // The net server for receiving Facereader data

const ConnectedClient = require('./ConnectedClient');

const host = '127.0.0.1';
const oscPort = 4559;
const faceReaderPort = 8052;
const httpPort = 4001;

var clientData = [];

console.log('Starting biocall server');


/* Socket for connecting to webinterfaces for front-end */
// Create Socket.io Socket and listen for data
io.on('connection', client => {
  console.log('Socket.io: Client connected on port ' + httpPort);
  console.log('Client id:' + client.id);

  // Testroom for now. TODO: Host should make a room where Client can join and data is sent to only those two.
  let clientRoom = 'testRoom';
  client.join(clientRoom);

  client.on('event', data => { console.log(data); });

  client.on('disconnect', () => {
    console.log('Socket.io: Client disconnected on port ' + httpPort);
    delete clientData[client.id];
  });

  client.on('connectFaceReader', data => { connectToFaceReader(data); });
  // client.on('spoofBorder', data => { spoofBorder(data) });
  // client.on('spoofValue', data => { spoofValue(data) });
  clientData[clientRoom] = new ConnectedClient(client.id, clientRoom, {});
  console.log(clientData);
  sendDataToFrontEnd(clientRoom, client);
});

function spoofBorder(bool) {
  io.emit('spoofBorder', bool);
  console.log('Started spoofing: ' + bool);
}

function spoofValue(data) {
  io.emit('spoofValue', data);
}

function sendDataToFrontEnd(room, client) {
  if (client.connected) {
    // console.log(client.id);
    io.to(room).emit('bioData', clientData[room].getBioData());
    setTimeout(sendDataToFrontEnd, 1000, room, client);
  }
}

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
    // io.emit('eSenseData', msg);
    console.log(msg);
    clientData['testRoom'].setBioData({gsr: msg[1]});
  }
});
/* ---------------------------------------------------------- */


/* Facereader */
// Facereader connects to a middleman: Facereader client. Facereader client connects to Facreader itself and relays the data
var faceReaderClient = null;

function connectToFaceReader(clientIdOfzo) {
  faceReaderClient = new net.Socket();
  faceReaderClient.connect(faceReaderPort, host, function() {
    console.log('Connection to FaceReader client opened successfully! Listening for FaceReader data on port ' + faceReaderPort);
  });

  faceReaderClient.on('error', function(err) {
    faceReaderClient.destroy();
    faceReaderClient = null;
    console.log("ERROR: Connection could not be openend/reset. Msg: %s", err.message + ' -> trying again');
    io.emit(clientIdOfzo, "ERROR: Connection could not be openend/reset. Msg: %s" + err.message + ' -> trying again');
    setTimeout(connectToFaceReader, 3000, clientIdOfzo);
  });

  faceReaderClient.on('data', function(data) {
    console.log("Received: %s", data);
    io.emit('faceReaderData', JSON.parse(data));
  });
}

// connectToFaceReader();
/* ---------------------------------------------------------- */
