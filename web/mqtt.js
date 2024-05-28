//      THIS FILE IS HANDLING MQTT RELATED THINGS

//      MQTT connection

const connectForm = document.querySelector(".connect-form");
const mainDashboard = document.querySelector(".main-dashboard-wrapper");

const clientIDInput = document.getElementById("clientId");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const infoCluster = document.querySelector(".info-cluster");
const infoPort = document.querySelector(".info-port");
const infoConnectionType = document.querySelector(".info-connection-type");
const infoUsername = document.querySelector(".info-username");
const infoPassword = document.querySelector(".info-password");
const infoTime = document.querySelector(".info-time");
const infoESP = document.querySelector(".esp-info");

let connectionTimeoutId;

function hideConnectForm() {
    connectForm.style.display = "none";
}

function showConnectForm() {
    connectForm.style.display = "flex";
}

function hideDashboard() {
    mainDashboard.style.display = "none";
}

function showDashboard() {
    mainDashboard.style.display = "block";
}

let clientID;
let username;
let password;

// Global client variable
let client;

// User data set, changes on different user events
let userData = {
    "direction": direction,
    "steer": steer,
    "speed": speed,
    "steerAngle": steerAngle,  // This is the steer angle
    "targetX": undefined,
    "targetY": undefined
};

let espStatus = "disconnected";

// JSON of the user data set
let jsonUserData;

// Connect to the broker
function connect() {
    console.log("Connecting...");

    clientID = clientIDInput.value.toString();
    username = usernameInput.value.toString();
    password = passwordInput.value.toString();

    // Generate a random clientID if the user does not input one
    if (clientID == "") {
        clientID = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
        console.log("Generated clientID: " + clientID);
    }

    // Reset the inputs
    clientIDInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";

    //      MQTT

    const clusterURL = 'wss://a8900a9a.ala.eu-central-1.emqxsl.com:8084/mqtt';
    //const clusterURL = 'wss://24481123c0884e459cd76ccc6ca6d326.s1.eu.hivemq.cloud:8884/mqtt';

    // Initialize the MQTT client
    client = mqtt.connect(clusterURL, {
        username: username,
        password: password,
        clientId: clientID,
        keepalive: 60,
        protocolId: 'MQTT',
        protocolVersion: 4,
        clean: true,
        reconnectPeriod: 1000,
        connectTimeout: 30 * 1000
    });

    //      Callbacks

    // Ones connected
    client.on('connect', function () {
        console.log('Connected to the broker.');
        connectionTime = new Date();
        updateConnectionTime();
    });

    // When disconnected
    client.on('close', function() {
        console.log("Disconnected from the broker.");
    });

    client.on('error', function (error) {
        console.log(error);
    });

    // Called each time a message is received

    client.on('message', function (topic, message) {
        // For testing: Log userData changes
        if (topic == "userData") {
            // Parse JSON data
            let recievedUserData = JSON.parse(message);
            
            // Log received data
            console.log("User data: ", topic, recievedUserData);   
        }

        if (topic == "espData") {
            // Parse JSON data
            let recievedEspData = JSON.parse(message);
            //infoESP.innerHTML = "ESP Status: " + recievedEspData.status;

            console.log("Esp Data: ", recievedEspData);
        }

        if (topic == "ping") {
            if (message == "1") {
                espStatus = "connected";
            }
        }
    });

    client.subscribe('userData');
    client.subscribe('espData');
    client.subscribe('ping');

    sendUserData();

    // Show connection info
    infoCluster.innerHTML = "Cluster URL: " + clusterURL;
    infoPort.innerHTML = "Port: 8884";
    infoConnectionType.innerHTML = "Connection Type: WSS (WebSocket Secure)";
    infoUsername.innerHTML = "Username: " + username;
    infoPassword.innerHTML = "Password: " + "*".repeat(password.length);

    // When all done, hide form + show the other dashboard sections
    hideConnectForm();
    showDashboard();

    // Start listening for WASD key presses
    startWASD();

    

    // Set an interval for continuesly checking every 5 seconds if the ESP is connected or not, like a ping
    setInterval(() => {
        client.publish('ping', 0);

        console.log(espStatus);

        // If the ping has not changed in 5 seconds, then the esp is disconnected (or has troubles)
        if (espStatus == "connected") {
            espStatus = "disconnected";
        }
    }, 5000);


    //      Connection time

    // Update connection time every second
    function updateConnectionTime() {
        let now = new Date();
        let elapsedTime = now - connectionTime;
        // Display connection time
        infoTime.innerHTML = "Connected for " + formatTime(elapsedTime);
        connectionTimeoutId = setTimeout(updateConnectionTime, 1000);
    }

    // Format time as hours:minutes:seconds
    function formatTime(time) {
        let hours = Math.floor(time / 3600000);
        let minutes = Math.floor((time % 3600000) / 60000);
        let seconds = Math.floor((time % 60000) / 1000);
        return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    }

    // Add leading zero if single digit
    function pad(num) {
        return (num < 10 ? '0' : '') + num;
    }
}

// Update and publish the data
function sendUserData() {
    jsonUserData = JSON.stringify(userData);
    client.publish('userData', jsonUserData);
}

// Disconnect from the broker
function disconnect() {
    console.log("Disconnecting...");

    client.end();

    // When all done, show connect form again + reset connection time
    clearTimeout(connectionTimeoutId);
    showConnectForm();
    hideDashboard();

    // Stop listening for WASD key presses
    removeWASD();
}

infoESP.innerHTML = "ESP Status: " + espStatus;