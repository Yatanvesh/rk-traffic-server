const {CHANNELS,SIMULATION_STATES, INITIAL_STATE} = require('./constants');
const {getDistance} = require('./API');
const state = INITIAL_STATE;

let currentSocket = null;

const clientLocationBroadcaster = (socket) => { 
    socket.on(CHANNELS.CLIENT_LOCATION, (data) => {
        console.log("Received client LOCATION", data);
        let prevLocation = state.clients[data.id] && state.clients[data.id].coords;
        handleClientData(data);
        let newLocation = data.coords;
        if(prevLocation){
            console.log("Distance", getDistance( 
                prevLocation.lat, prevLocation.lng, 
                newLocation.lat, newLocation.lng
                )
                );
        }
        

        //get previous location

        // Object.keys(state.clients).map(id => {
            // socket.broadcast.emit(CHANNELS.CLIENT_LOCATION, state.clients[id]);
        // })
      });
}

const handleClientData = data => {
    state.clients[data.id] = data;
}

const multiLocationBroadcaster = (socket) => {
    let testData = {
        "time": "3710.00",
        "vehicles": [
            {
                "id": "veh241",
                "lat": 52.52273496495127,
                "lng": 13.405524592365191,
                "angle": "52.32"
            },
            {
                "id": "veh243",
                "lat": 52.52473228277264,
                "lng": 13.404934108112956,
                "angle": "51.45"
            }
        ]
    };
    //Get data from db

    setInterval(() => {
        switch(state.state){
            case SIMULATION_STATES.OFF:
                break;
            case SIMULATION_STATES.PAUSED:
                break;
            case SIMULATION_STATES.READY:
                break;
            case SIMULATION_STATES.RUNNING:
                 if(state.time>state.vehicle_data.length){
                    state.state= SIMULATION_STATES.OFF;
                    console.log("Simulation Ended");
                } else broadcastSimulationData(socket);
                
                break;
            default:break;
        }
        
    }, 5000);
    
}

const requestSimulationData = (socket) =>{
    // currentSocket= socket;
    // fetchSimulationData(socket);

    // socket.on(CHANNELS.MODEL, (message) => {
    //     console.log("Received MODEL, data length:", message.type);
    //     switch(message.type){
    //         case MODEL_REQUESTS.REQUEST_VEHICLES:
    //             state.vehicle_data = message.data;
    //             break;
    //         case MODEL_REQUESTS.REQUEST_SIGNALS:
    //             state.signal_data = message.data;
    //             break;
    //         default:console.log("invalid data");
    //             break;
    //     }
    //     if(state.vehicle_data!=0 && state.signal_data!=0){
    //         state.state=SIMULATION_STATES.READY;
    //         console.log('ready to start simulation');
    //     }
        

    // });
}

const setSimulationHandler = (socket) =>{
    socket.on(CHANNELS.CONTROL, (message) => {
        console.log("Received CONTROL", message);
        switch(message){
            case 'start':
                startSimulation();
                break;
            case 'reset':
                resetSimulation();
                break;
            case 'pause':
                pauseSimulation();
                break;
            // case 'fetch':fetchSimulationData();
                // break;
            default:
                break;
        }
      });
}

const startSimulation=()=>{
    // if(state.state==SIMULATION_STATES.READY || state.state == SIMULATION_STATES.PAUSED)
        state.state = SIMULATION_STATES.RUNNING;
    // else console.log("NOT READY");
}

const resetSimulation = () =>{
    state.state = SIMULATION_STATES.OFF;
    // state.vehicle_data  = [];
    // state.signal_data = [];
    state.time = 0;
}

const showState = ()=>{
    console.log("Simulation state",
        state.state,
        state.vehicle_data.length,
        state.signal_data.length,
        state.time,
        Object.keys(state.clients).length,
        state.clients);
}

// const fetchSimulationData = (socket = currentSocket) =>{
    // socket.emit(CHANNELS.MODEL, MODEL_REQUESTS.REQUEST_VEHICLES)
    // socket.emit(CHANNELS.MODEL, MODEL_REQUESTS.REQUEST_SIGNALS)
// }

const broadcastSimulationData = (socket)=>{
    // console.log("Broadcasting simulation to", socket.id,   state.time);
    socket.emit(CHANNELS.LOCATIONS, state.vehicle_data[state.time]);
    socket.emit(CHANNELS.SIGNALS, state.signal_data[state.time]);
}

const pauseSimulation = ()=> {
    state.state = SIMULATION_STATES.PAUSED;
}

const setTimer = () =>{
    setInterval(()=>{
        if(state.state==SIMULATION_STATES.RUNNING)
            state.time++;
    },5000)
}

const setSimData = (vehicle,light)=>{
    state.signal_data=light;
    state.vehicle_data = vehicle;
}
setTimer();

module.exports = {
    clientLocationBroadcaster,
    multiLocationBroadcaster,
    requestSimulationData,
    setSimulationHandler, 
    state,
    resetSimulation,
    startSimulation,
    showState,
    // fetchSimulationData,
    pauseSimulation,
    setSimData
}