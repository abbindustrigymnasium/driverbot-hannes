// This file is handling MQTT related things

// HTML elements
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

// MQTT connection variables
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
};

let espStatus = "disconnected";

// JSON of the user data set
let jsonUserData;

// Connect to the broker
function connect() {
    console.log("Connecting...");

    clientID = clientIDInput.value.trim();
    username = usernameInput.value.trim();
    password = passwordInput.value.trim();

    // Generate a random clientID if the user does not input one
    if (clientID == "") {
        clientID = 'mqttjs_' + Math.random().toString(16).substr(2, 8);
    }

    // Reset the inputs
    clientIDInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";

    // Broker cluster URL
    const clusterURL = 'wss://a8900a9a.ala.eu-central-1.emqxsl.com:8084/mqtt';

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

    // Callbacks

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
        if (topic == "espData") {
            // Parse JSON data
            let recievedEspData = JSON.parse(message);
            console.log("Esp Data: ", recievedEspData);

            currentX = recievedEspData.currentX;
            currentY = recievedEspData.currentY;

            // Resposition the dot representing the current position of the driverbot
            positionDot.style.left = "calc(50% - 6px + " + currentX + "px" + ")";
            positionDot.style.top = "calc(50% - 6px + " + (currentY/-1) + "px" + ")";

            positionInfoText.innerHTML = "x: " + currentX + " y: " + currentY;
        }

        // If a ping is recieved, then the esp is connected
        if (topic === "pingResponse") {
            if (message.toString() === "1") {
                espStatus = "connected";
            }
        }
    });

    client.subscribe('userData');
    client.subscribe('espData');
    client.subscribe('pingResponse');

    sendUserData();

    // Show connection info
    infoCluster.innerHTML = "Cluster URL: " + clusterURL;
    infoPort.innerHTML = "Port: 8884";
    // Use prefix of cluster url to ensure it is correct and display connection type
    if (clusterURL.startsWith("wss://")) {
        infoConnectionType.innerHTML = "Connection Type: WSS (WebSocket Secure)";
    } else {
        infoConnectionType.innerHTML = "Connection Type: Not WebSocket Secure";
    }
    
    infoUsername.innerHTML = "Username: " + username;
    infoPassword.innerHTML = "Password: " + "*".repeat(password.length); // Hide passwrod by default

    // When all done, hide form + show the other dashboard sections
    hideConnectForm();
    showDashboard();

    // Start listening for WASD key presses
    startWASD();

    // Set an interval for continuesly checking every 5 seconds if the ESP is connected or not, like a ping
    setInterval(() => {
        client.publish('ping', 0);
        infoESP.innerHTML = "ESP Status: " + espStatus;

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