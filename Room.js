class Room {
  constructor(room, bioData) {
    this.room = room;
    this.bioData = bioData;
    this.connectedClients = [];
    this.connectedDataSources = [];
  }

  setGSRData(val) {
    this.bioData.gsr = val;
    let num = parseFloat(val);
    let maxVal = this.bioData.gsrHistory.maxVal;
    console.log('Maxval: ' + maxVal + ' num: ' + num);
    if (num > maxVal) {
      this.bioData.gsrHistory.maxVal = num;
    }
  }

  setFaceReaderData(val) {
    this.bioData.faceReader = val;
  }

  getBioData() {
    return this.bioData;
  }

  joinAsClient(clientId) {
    this.connectedClients.push(clientId);
  }

  leaveAsClient(clientId) {
    let clientNo = this.connectedClients.indexOf(clientId);
    this.connectedClients.splice(clientNo, 1);
  }

  joinAsDataSource(clientId) {
    this.connectedDataSources.push(clientId);
  }

  leaveAsDataSource(clientId) {
    let clientNo = this.connectedDataSources.indexOf(clientId);
    this.connectedDataSources.splice(clientNo, 1);
  }
}

module.exports = Room;
