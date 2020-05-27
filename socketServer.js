const http = require('http').createServer(); // A listening server (for Socket.io) on http
const io = require('socket.io')(http); // The Socket.io server

const ConnectedClient = require('./ConnectedClient');
const ConnectedDataSource = require('./ConnectedDataSource');
const Room = require('./Room');

const host = '127.0.0.1';
const httpPort = 4001;

var roomData = [];

console.log('Starting biocall server');

/* Socket for connecting to webinterfaces for front-end */
// Create Socket.io Socket and listen for data
io.on('connection', client => {
  console.log('Socket.io: Client connected on port ' + httpPort);
  console.log('Client id: ' + client.id);






  client.on('spoofBorder', data => { spoofBorder(data) });
  client.on('spoofValue', data => { spoofValue(data) });






  client.on('roomRequest', roomRequest => {
    if (roomRequest.endsWith('-data')) {
      // DataSource is trying to connect
      let room = roomRequest.replace('-data', '');
      if (roomData[room] == undefined) {
        createRoom(room);
      }
      roomData[room].joinAsDataSource(client.id);

      client.join(roomRequest);
      console.log('DataSource connected');
    }
    else {
      // Front-end client is trying to connect
      let room = roomRequest;
      if (roomData[room] == undefined) {
        createRoom(room);
      }
      roomData[room].joinAsClient(client.id);

      client.join(roomRequest);
      console.log('Front-end client connected');
      sendData(room, client);
    }
    console.log(roomData);
    io.to(roomRequest).emit('message', 'Connected to room: ' + roomRequest);
  });

  client.on('eSenseData', data => {
     console.log(data);
     let room = Object.keys(client.rooms)[1].replace('-data', '');
     roomData[room].setGSRData(data);
  });

  client.on('faceReaderData', data => {
    console.log(data);
    let room = Object.keys(client.rooms)[1].replace('-data', '');
    roomData[room].setFaceReaderData(data);
  })

  client.on('disconnecting', () => {
    let room;
    //TODO delete room when empty
    console.log(client.rooms);
    let curRoom = Object.keys(client.rooms)[1];
    if (curRoom.endsWith('-data')) {
      room = curRoom.replace('-data', '');
      roomData[room].leaveAsDataSource(client.id);
    }

    else {
      room = curRoom;
      roomData[room].leaveAsClient(client.id);
    }
    checkRoom(room);
    console.log('Socket.io: Client disconnected on port ' + httpPort);
    console.log(roomData);
  });
});






// ------------ SPOOFING ---------------
function spoofBorder(bool) {
  io.emit('spoofBorder', bool);
  console.log('Started spoofing: ' + bool);
}

function spoofValue(data) {
  io.emit('spoofValue', data);
}
//-------------------------------------------------








function createRoom(room) {
  roomData[room] = new Room(room, {gsr: '0', gsrHistory: {minVal:0, maxVal:1}, facereader:{}});
}

function sendData(room, client) {
  if (client.connected) {
    io.to(room).emit('bioData', roomData[room].getBioData());
    setTimeout(sendData, 1000, room, client);
  }
}

function checkRoom(room) {
  if (roomData[room].connectedClients.length==0 && roomData[room].connectedDataSources.length==0) {
    delete roomData[room];
  }
}

// Start the Socket.io Socket Server
http.listen(httpPort, function(){
  console.log('Listening for HTTP requests for Socket.io on port ' + httpPort);
});
