class ConnectedDataSource {
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

module.exports = ConnectedDataSource;
