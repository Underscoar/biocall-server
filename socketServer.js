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
  client.on('spoofGSR', data => { spoofGSR(data, client) });
  client.on('changeGSR', data => { changeGSR(data, client) });
  client.on('spoofActionUnit', data => { spoofActionUnit(data, client) });
  client.on('setActionUnitsWrap', data => { setActionUnitsWrap(data, client) });



  client.on('showToClientBorder', data => {setClientShowing('Border', data, client)})
  client.on('showToClientStress', data => {setClientShowing('Stress', data, client)})
  client.on('showToClientHR', data => {setClientShowing('HR', data, client)})




  client.on('roomRequest', roomRequest => {
    if (roomRequest.endsWith('-data')) {
      // DataSource is trying to connect
      let room = roomRequest.replace('-data', '');
      if (roomData[room] == undefined) {
        createRoom(room);
      }
      roomData[room].joinAsDataSource(client.id);
      roomData[room].AddConnectedUser();

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
      if (roomData[room].connectedClients.length == 1) {
        sendData(room, client);
      }
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
    // console.log(data);
    let room = Object.keys(client.rooms)[1].replace('-data', '');
    roomData[room].setFaceReaderData(data);
  })

  client.on('disconnecting', () => {
    let room;
    //TODO delete room when empty
    //Code below needs fixing, works 99% of the time, but sometimes crashes when client disconnects. For now commented
    try {
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
    }
    catch(err) {
      console.log(err);
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

function spoofGSR(bool, client) {
  console.log('Spoofing GSR data: ' + bool);
  let room = Object.keys(client.rooms)[1];
  roomData[room].toggleSpoofGSR(bool);
}

function changeGSR(data, client) {
  let room = Object.keys(client.rooms)[1];
  roomData[room].setGSRSpoofValue(parseFloat(data));
}

function setActionUnitsWrap(data,client) {
  console.log('DISPLAY ACTION UNITS: ' + data);
  let room = Object.keys(client.rooms)[1];
  io.to(room).emit('setActionUnitsWrap', data);
}

function spoofActionUnit(data, client) {
  let room = Object.keys(client.rooms)[1];
  // let actionUnit;
  // if (data == '4') {
  //   actionUnit = 'Action Unit 04 - Brow Lowerer';
  //   roomData[room].setActionUnit(actionUnit, 'A');
  // }
  // roomData[room]
  io.to(room).emit('spoofActionUnit', data);
}
//-------------------------------------------------



function setClientShowing(element, value, client) {
  let room = Object.keys(client.rooms)[1];
  io.to(room).emit('showToClient' + element, value);
}




function createRoom(room) {
  roomData[room] = new Room(room, {
    gsr: '0',
    gsrHistory: {
      minVal:0,
      maxVal:1
    },
    faceReaderHRHistory: {
      minVal: 0,
      maxVal: 60
    },
    faceReaderHRVHistory: {
      minVal: 0,
      maxVal: 0.200
    },
    faceReader:{
      "Heart Rate": 60,
      "Heart Rate Var": 0.180,
      "Neutral": 0,
      "Happy": 0,
      "Sad": 0,
      "Angry": 0,
      "Surprised": 0,
      "Disgusted": 0,
      "Scared": 0,
      "Action Unit 04 - Brow Lowerer": "NotActive",
      "Action Unit 23 - Lip Tightener": "NotActive",
      "Action Unit 24 - Lip Pressor": "NotActive"
    }
  });
}

function sendData(room, client) {
  if (client.connected) {
    let bioData = roomData[room].getBioData();
    if (roomData[room].spoofGSR === false) {
      io.to(room).emit('bioData', bioData);
    }
    else {
      let spoofedInput = roomData[room].spoofedValue;
      let maxTop = spoofedInput+0.1;
      let minTop = spoofedInput-0.1;
      let randVal = Math.random() * (maxTop - minTop) + minTop;
      bioData.gsr = randVal.toFixed(2);
      roomData[room].spoofGSRData((parseFloat(bioData.gsr)));

      // Heart Rate spoofing
      // let spoofedHR = roomData[room].spoofedValue*5;
      // spoofedHR = spoofedHR+60;
      // let maxTopHR = spoofedHR+2;
      // let minTopHR = spoofedHR-2;
      // let randValHR = Math.random() * (maxTopHR - minTopHR) + minTopHR;
      // bioData.faceReader['Heart Rate'] = randValHR.toFixed(2);
      // roomData[room].spoofHRData((parseFloat(bioData.faceReader['Heart Rate'])));

      // Heart Rate Variability spoofing
      let minHRV = 0.02;
      let maxHRV = 0.2;
      // fx = x/20+0.02
      let spoofedHRV = (6 - roomData[room].spoofedValue)/20;
      let maxTopHRV = spoofedHRV+0.01;
      let minTopHRV = spoofedHRV-0.01;
      let randValHRV = Math.random() * (maxTopHRV - minTopHRV) + minTopHRV;
      bioData.faceReader['Heart Rate Var'] = randValHRV.toFixed(3);
      roomData[room].spoofHRVData((parseFloat(bioData.faceReader['Heart Rate Var'])));
      // console.log(spoofedHRV);

      io.to(room).emit('bioData', bioData);
    }
    if (roomData[room].NoOfConnectedUsers > 0) {
      setTimeout(sendData, 1000, room, client)
    }
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


process.on('uncaughtException', function (err) {
  console.error(err);
});
