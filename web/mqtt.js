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

// Initialize a mqtt variable globally
console.log(mqtt);

// Global client variable
let client;

// User data set, changes on different user events
let userData = {
    "forward": 0,
    "left": 0,
    "backwards": 0,
    "right": 0,
    "speed": speedData,
    "steerAngle": steerData  // This is the steer angle
};

// JSON of the user data set
let jsonUserData;

// Connect to the broker
function connect() {
    console.log("Connecting...");

    clientID = clientIDInput.value.toString();
    username = usernameInput.value.toString();
    password = passwordInput.value.toString();

    clientIDInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";

    //      MQTT

    const clusterURL = 'wss://24481123c0884e459cd76ccc6ca6d326.s1.eu.hivemq.cloud:8884/mqtt';

    // Initialize the MQTT client
    client = mqtt.connect(clusterURL, {
        username: username,
        password: password,
        clientId: clientID
    });

    //      Callbacks

    client.on('connect', function () {
        console.log('Connected to the broker.');
        connectionTime = new Date();
        updateConnectionTime();

        // Subscribe to topics after the connection is established
        //client.subscribe('userData');
        //sendData();
        //client.subscribe('espData');
    });

    // Log when disconnected
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
            let recievedData = JSON.parse(message);
            
            // Process received data
            console.log("User data: ", topic, recievedData);   
        }

        if (topic == "espData") {
            console.log("Message from esp: ", message);
        }
    });

    client.subscribe('userData');
    client.subscribe('espData');

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
}

// Update and publish the data
function sendData() {
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