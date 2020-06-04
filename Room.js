class Room {
  constructor(room, bioData) {
    this.room = room;
    this.bioData = bioData;
    this.spoofGSR = false;
    this.spoofedValue = 1;
    this.NoOfConnectedUsers = 0;
    this.connectedClients = [];
    this.connectedDataSources = [];
  }

  setGSRData(val) {
    if (this.spoofGSR === false) {
      this.bioData.gsr = val;
      let num = parseFloat(val);
      let maxVal = this.bioData.gsrHistory.maxVal;
      // console.log('Maxval: ' + maxVal + ' num: ' + num);
      if (num > maxVal) {
        this.bioData.gsrHistory.maxVal = num;
      }
    }
  }

  toggleSpoofGSR(bool) {
    this.spoofGSR = bool;
  }

  spoofGSRData(val) {
    if (this.spoofGSR === true) {
      // this.spoofedValue = val;
      let num = parseFloat(val);
      let maxVal = this.bioData.gsrHistory.maxVal;
      console.log('Maxval: ' + maxVal + ' num: ' + num);
      if (num > maxVal) {
        this.bioData.gsrHistory.maxVal = num;
      }
    }
  }

  spoofHRData(val) {
    if (this.spoofGSR === true) {
      // this.spoofedValue = val;
      let num = parseFloat(val);
      let maxVal = this.bioData.faceReaderHRHistory.maxVal;
      // console.log('Maxval: ' + maxVal + ' num: ' + num);
      if (num > maxVal) {
        this.bioData.faceReaderHRHistory.maxVal = num;
      }
    }
  }

  spoofHRVData(val) {
    if (this.spoofGSR === true) {
      // this.spoofedValue = val;
      let num = parseFloat(val);
      let maxVal = this.bioData.faceReaderHRVHistory.maxVal;
      // console.log('Maxval: ' + maxVal + ' num: ' + num);
      if (num > maxVal) {
        this.bioData.faceReaderHRVHistory.maxVal = num;
      }
    }
  }

  setActionUnit(actionUnit, val) {
    if (this.spoofGSR === true) {
      this.bioData.faceReader[actionUnit] = val;
      if (val != 'NotActive') {
        setTimeout(this.setActionUnit, 2000, actionUnit, 'NotActive');
      }
    }
  }

  setGSRSpoofValue(val) {
    if (this.spoofGSR === true) {
      this.spoofedValue = val;
    }
  }

  setFaceReaderData(val) {
    if (this.spoofGSR === false) {
      if (val['Neutral'] != undefined) {
        console.log(val);
        // this.bioData.faceReader = val;
        if (val['Heart Rate'] != 'Unknown') {
          this.bioData.faceReader['Heart Rate'] = val['Heart Rate'];
        }
        this.bioData.faceReader['Neutral'] = val['Neutral'];
        this.bioData.faceReader['Happy'] = val['Happy'];
        this.bioData.faceReader['Sad'] = val['Sad'];
        this.bioData.faceReader['Angry'] = val['Angry'];
        this.bioData.faceReader['Surprised'] = val['Surprised'];
        this.bioData.faceReader['Scared'] = val['Scared'];
        this.bioData.faceReader['Disgusted'] = val['Disgusted'];
        this.bioData.faceReader['Action Unit 04 - Brow Lowerer'] = val['Action Unit 04 - Brow Lowerer'];
        this.bioData.faceReader['Action Unit 23 - Lip Tightener'] = val['Action Unit 23 - Lip Tightener'];
        this.bioData.faceReader['Action Unit 24 - Lip Pressor'] = val['Action Unit 24 - Lip Pressor'];
      }
    }
  }

  getBioData() {
    return this.bioData;
  }

  joinAsClient(clientId) {
    this.NoOfConnectedUsers++;
    this.connectedClients.push(clientId);
  }

  leaveAsClient(clientId) {
    this.NoOfConnectedUsers--;
    let clientNo = this.connectedClients.indexOf(clientId);
    this.connectedClients.splice(clientNo, 1);
  }

  joinAsDataSource(clientId) {
    this.NoOfConnectedUsers++;
    this.connectedDataSources.push(clientId);
  }

  leaveAsDataSource(clientId) {
    this.NoOfConnectedUsers--;
    let clientNo = this.connectedDataSources.indexOf(clientId);
    this.connectedDataSources.splice(clientNo, 1);
  }

  AddConnectedUser() {
    // Do something once a user is connected
  }
}

module.exports = Room;
