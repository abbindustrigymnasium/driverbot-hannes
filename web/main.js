//      Menu

const menuHitbox = document.querySelector("nav");
const menuOverlay = document.querySelector(".menu-overlay");
const closeIcon = document.querySelector(".close-icon");

//  Display menu when hitbox is clicked
menuHitbox.onclick = function() {
    console.log("Opened menu");

    menuOverlay.style.display = "block";
}

closeIcon.onclick = function() {
    console.log("Closed menu");

    menuOverlay.style.display = "none";
}

//      Dark mode

const darkModeToggle = document.getElementById("darkModeToggle");
const cssRoot = document.querySelector(":root");
const menuIcon = document.querySelector(".menu-icon");
const tooltipsIcon = document.querySelector(".tooltips-icon");

// Defualt
const hoverHandler = () => {
    closeIcon.style.filter = "invert(34%) sepia(77%) saturate(1199%) hue-rotate(321deg) brightness(86%) contrast(82%)";
};

const mouseoutHandlerLightMode = () => {
    closeIcon.style.filter = "invert(0%) sepia(39%) saturate(5179%) hue-rotate(36deg) brightness(87%) contrast(88%)";
};

const mouseoutHandlerDarkMode = () => {
    closeIcon.style.filter = "invert(99%) sepia(1%) saturate(2039%) hue-rotate(37deg) brightness(119%) contrast(86%)";
};

closeIcon.addEventListener('mouseover', hoverHandler);
closeIcon.addEventListener('mouseout', mouseoutHandlerLightMode);

//  Switch between light and dark mode
// Note: generated CSS filters using https://isotropic.co/tool/hex-color-to-css-filter/
function switchTheme() {
    if (darkModeToggle.checked == true) {
        console.log("Switching to dark theme");
        cssRoot.style.setProperty("--bg-color", "#0F0F0F");
        cssRoot.style.setProperty("--main-text-color", "#EDEDED");

        // Remove close icon light mode color
        closeIcon.removeEventListener('mouseout', mouseoutHandlerLightMode);

        // Add new one
        closeIcon.addEventListener('mouseout', mouseoutHandlerDarkMode);

        menuIcon.style.filter = "invert(99%) sepia(1%) saturate(2039%) hue-rotate(37deg) brightness(119%) contrast(86%)";
        closeIcon.style.filter = "invert(99%) sepia(1%) saturate(2039%) hue-rotate(37deg) brightness(119%) contrast(86%)";
        tooltipsIcon.style.filter = "invert(99%) sepia(1%) saturate(2039%) hue-rotate(37deg) brightness(119%) contrast(86%)";
    } else {
        console.log("Switching back to light theme");
        cssRoot.style.setProperty("--bg-color", "#EDEDED");
        cssRoot.style.setProperty("--main-text-color", "#0F0F0F");

        // Remove close icon dark mode color
        closeIcon.removeEventListener('mouseout', mouseoutHandlerDarkMode);

        // Add new one
        closeIcon.addEventListener('mouseout', mouseoutHandlerLightMode);

        menuIcon.style.filter = "unset";
        closeIcon.style.filter = "unset";
        tooltipsIcon.style.filter = "unset";
    }
}

//      MQTT connection

const connectForm = document.querySelector(".connect-form");
const monitorSection = document.querySelector(".monitor-section");
const driveSection = document.querySelector(".drive-section");

const clientIDInput = document.getElementById("clientId");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const infoCluster = document.querySelector(".info-cluster");
const infoPort = document.querySelector(".info-port");
const infoConnectionType = document.querySelector(".info-connection-type");
const infoUsername = document.querySelector(".info-username");
const infoPassword = document.querySelector(".info-password");
const infoTime = document.querySelector(".info-time");

const passwordIcon = document.querySelector(".password-icon");

function hideConnectForm() {
    connectForm.style.display = "none";
}

function showDashboard() {
    monitorSection.style.display = "flex";
    driveSection.style.display = "flex";
}

let clientID;
let username;
let password;

// Initialize a mqtt variable globally
console.log(mqtt);

function connect() {
    clientID = clientIDInput.value.toString();
    username = usernameInput.value.toString();
    password = passwordInput.value.toString();

    clientIDInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";

    //      MQTT

    const clusterURL = 'wss://24481123c0884e459cd76ccc6ca6d326.s1.eu.hivemq.cloud:8884/mqtt';

    // Initialize the MQTT client
    var client = mqtt.connect(clusterURL, {
        username: username,
        password: password
    });

    //      Callbacks

    client.on('connect', function () {
        console.log('Connected');
        connectionTime = new Date();
        updateConnectionTime();
    });

    client.on('error', function (error) {
        console.log(error);
    });

    client.on('message', function (topic, message) {
        // Called each time a message is received
        console.log('Received message:', topic, message.toString());
    });

    //      Connection time

    // Update connection time every second
    function updateConnectionTime() {
        var now = new Date();
        var elapsedTime = now - connectionTime;
        // Display connection time
        infoTime.innerHTML = "Connected for " + formatTime(elapsedTime);
        setTimeout(updateConnectionTime, 1000);
    }

    // Format time as hours:minutes:seconds
    function formatTime(time) {
        var hours = Math.floor(time / 3600000);
        var minutes = Math.floor((time % 3600000) / 60000);
        var seconds = Math.floor((time % 60000) / 1000);
        return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
    }

    // Add leading zero if single digit
    function pad(num) {
        return (num < 10 ? '0' : '') + num;
    }

    client.subscribe('testTopic');
    client.publish('testTopic', 'Hello');

    // Show connection info
    infoCluster.innerHTML = "Cluster URL: " + clusterURL;
    infoPort.innerHTML = "Port: 8884";
    infoConnectionType.innerHTML = "Connection Type: WSS (WebSocket Secure)";
    infoUsername.innerHTML = "Username: " + username;
    infoPassword.innerHTML = "Password: " + "*".repeat(password.length);

    // When all done, hide form + show the other dashboard sections
    hideConnectForm();
    showDashboard();
}

// Hide/show password with the icon

let hiddenPassword = true;

passwordIcon.onclick = function() {
    if (hiddenPassword) {
        infoPassword.innerHTML = "Password: " + password;
        passwordIcon.src = "./assets/show-icon.svg";
        passwordIcon.alt = "password visible, hide it"
        hiddenPassword = false;
    } else {
        infoPassword.innerHTML = "Password: " + "*".repeat(password.length);
        passwordIcon.src = "./assets/hide-icon.svg";
        passwordIcon.alt = "password hidden, show it"
        hiddenPassword = true;
    }
}

//      Driving

// Create an object to store the state of each key
var keyPressed = {};

const wButton = document.querySelector(".w-button");
const aButton = document.querySelector(".a-button");
const sButton = document.querySelector(".s-button");
const dButton = document.querySelector(".d-button");

startWASD();

function startWASD() {
    // Create an object to store the state of each key
    var keyPressed = {};

    // Get references to the button elements

    // Function to handle key events
    function handleKeyEvent(event) {
        // Check if the key is not already pressed
        if (!keyPressed[event.key]) {
            // Set the flag to true for the pressed key
            keyPressed[event.key] = true;

            // Check for WASD
            if (event.key === 'w') {
                console.log("'w' pressed");
                wButton.style.backgroundColor = "var(--alt-text-color)";
            } else if (event.key === 'a') {
                console.log("'a' pressed");
                aButton.style.backgroundColor = "var(--alt-text-color)";
            } else if (event.key === 's') {
                console.log("'s' pressed");
                sButton.style.backgroundColor = "var(--alt-text-color)";
            } else if (event.key === 'd') {
                console.log("'d' pressed");
                dButton.style.backgroundColor = "var(--alt-text-color)";
            }
        }
    }

    // Function to handle key release events
    function handleKeyReleaseEvent(event) {
        // Reset the flag when the key is released
        keyPressed[event.key] = false;
        
        if (event.key === 'w') {
            console.log("'" + event.key + "' released");
            wButton.style.backgroundColor = "var(--main-text-color)";
        } else if (event.key === 'a') {
            console.log("'" + event.key + "' released");
            aButton.style.backgroundColor = "var(--main-text-color)";
        } else if (event.key === 's') {
            console.log("'" + event.key + "' released");
            sButton.style.backgroundColor = "var(--main-text-color)";
        } else if (event.key === 'd') {
            console.log("'" + event.key + "' released");
            dButton.style.backgroundColor = "var(--main-text-color)";
        }
    }

    // Add event listeners for keydown and keyup events
    document.addEventListener('keydown', handleKeyEvent);
    document.addEventListener('keyup', handleKeyReleaseEvent);

    // Add event listeners for mouse down events on buttons
    wButton.addEventListener('mousedown', function() {
        // Simulate 'w' key press
        handleKeyEvent({ key: 'w' });
    });

    aButton.addEventListener('mousedown', function() {
        // Simulate 'a' key press
        handleKeyEvent({ key: 'a' });
    });

    sButton.addEventListener('mousedown', function() {
        // Simulate 's' key press
        handleKeyEvent({ key: 's' });
    });

    dButton.addEventListener('mousedown', function() {
        // Simulate 'd' key press
        handleKeyEvent({ key: 'd' });
    });

    // Add event listeners for mouse up events on buttons to revert back to default state
    wButton.addEventListener('mouseup', function() {
        // Simulate 'w' key release
        handleKeyReleaseEvent({ key: 'w' });
    });

    aButton.addEventListener('mouseup', function() {
        // Simulate 'a' key release
        handleKeyReleaseEvent({ key: 'a' });
    });

    sButton.addEventListener('mouseup', function() {
        // Simulate 's' key release
        handleKeyReleaseEvent({ key: 's' });
    });

    dButton.addEventListener('mouseup', function() {
        // Simulate 'd' key release
        handleKeyReleaseEvent({ key: 'd' });
    });
}

// Speed control

const speedSlider = document.querySelector(".speed-slider");
const speedNumber = document.querySelector(".speed-number");

speedSlider.oninput = function() {
    //speedNumber.innerHTML = "Speed: " + this.value;
    speedNumber.innerHTML = "Speed: " + Math.round((this.value/parseInt(speedSlider.getAttribute("max"))) * 100) + "%";
}