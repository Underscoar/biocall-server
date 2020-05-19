class ConnectedClient {
  constructor(clientId, room, bioData) {
    this.clientId = clientId;
    this.room = room;
    this.bioData = bioData;
  }

  setBioData(obj) {
    this.bioData = obj;
  }

  getBioData() {
    return this.bioData;
  }
}

module.exports = ConnectedClient;
