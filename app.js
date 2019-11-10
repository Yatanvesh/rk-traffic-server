let app = require('express')();
let server = require('http').Server(app);
let io = require('socket.io')(server);
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3002;

const ioListeners = require('./ioListeners');

server.listen(PORT, () => console.log("server started at ", PORT));
const fs = require('fs');

let vehicle_data =  JSON.parse(fs.readFileSync('fcd_output.json'));
let light_data =  JSON.parse(fs.readFileSync('signal_output.json'));
ioListeners.setSimData(vehicle_data, light_data);
app.use(bodyParser.json())

io.on('connection', (socket) => {
  console.log('A client just joined on', socket.id);

  ioListeners.clientLocationBroadcaster(socket);
  ioListeners.multiLocationBroadcaster(socket);
  ioListeners.requestSimulationData(socket);
  ioListeners.setSimulationHandler(socket);

  socket.on('disconnect', function () {
    console.log('disconnected', this.id);
  });
});



var stdin = process.openStdin();


stdin.addListener("data", function (data) {
  const value = data.toString().trim()
  switch (value) {
    case "1":
        ioListeners.showState()
      break;
    case '2':
        ioListeners.resetSimulation()
      break;
    case '3':
        ioListeners.startSimulation()
        ioListeners.showState()
      break;
    case '4': 
      // ioListeners.fetchSimulationData();
      break;
    case '5':
        ioListeners.pauseSimulation();
        break;
  
    default:
        console.log("\n Enter proper state:");
        break;
  }
});