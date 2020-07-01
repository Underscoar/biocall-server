# BioCall-Server

## About
BioCall-Server is een element van het grotere BioCall geheel. Een applicatie waarin biofeedback getoond wordt tijdens een videogesprek. Het bestaat uit drie onderdelen:
- BioCall: Frontend (React) applicatie
- **BioCall-Server: NodeJS server die realtime biofeedback naar de frontend stuurt**
- BioCall-User: Electron applicatie die realtime de biofeedback van eSense en Facereader naar de NodeJS server stuurt

## Installation
### Clone
Clone deze repo `https://github.com/Underscoar/biocall-server`

### Setup
Installeer alle NPM packages
```
npm install
```

Start de applicatie
```
node socketServer.js (of: npm start)
```

## Use
Als deze server gestart is, luistert hij naar http requests voor Socket.IO (op port 4001), zodat in realtime data naar gebruikers gestuurd kan worden. Gebruikers kunnen verschillende rooms joinen (default is BioCallTest).

Zorg dat in ‘BioCall’ dat `state.endpoint` het IP adres + port van deze server is.
