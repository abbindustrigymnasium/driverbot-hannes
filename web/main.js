// FOR LATER: Split this into different files

//      Menu

const menuHitbox = document.querySelector("nav");
const menuOverlay = document.querySelector(".menu-overlay");
const closeIcon = document.querySelector(".close-icon");
const body = document.querySelector("body");

//  Display menu when hitbox is clicked
menuHitbox.onclick = function() {
    console.log("Opened menu");

    menuOverlay.style.display = "block";
    body.style.overflow = "hidden";
}

closeIcon.onclick = function() {
    console.log("Closed menu");

    menuOverlay.style.display = "none";
    body.style.overflow = "unset";
}

//      Color themes

const darkModeToggle = document.getElementById("darkModeToggle");
const cssRoot = document.querySelector(":root");
const menuIcon = document.querySelector(".menu-icon");
const tooltipsIcon = document.querySelector(".tooltips-icon");
const logo = document.querySelector(".logo");
const githubMark = document.querySelector(".github-mark");
const passwordIcon = document.querySelector(".password-icon");
const openCloseIcon = document.querySelector(".open-close-icon");

// Close icon color on different events

// Hover
const hoverHandler = () => {
    closeIcon.style.filter = "invert(34%) sepia(77%) saturate(1199%) hue-rotate(321deg) brightness(86%) contrast(82%)";
};

// Defualt state, light mode
const mouseoutHandlerLightMode = () => {
    closeIcon.style.filter = "invert(0%) sepia(39%) saturate(5179%) hue-rotate(36deg) brightness(87%) contrast(88%)";
};

// Defualt state, dark mode
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
        cssRoot.style.setProperty("--alt-text-color", "#9E9C84");
        cssRoot.style.setProperty("--main-text-color", "#FFFCE1");
        cssRoot.style.setProperty("--grey", "#42403C");
        cssRoot.style.setProperty("--highlight-grey", "#252422");

        logo.classList.add("logo-tinted");

        // Remove close icon light mode color
        closeIcon.removeEventListener('mouseout', mouseoutHandlerLightMode);

        // Add new one
        closeIcon.addEventListener('mouseout', mouseoutHandlerDarkMode);

        // Changing colours of icons
        openCloseIcon.src = "./assets/open-close-arrow-tinted.svg";
        menuIcon.style.filter = "invert(95%) sepia(29%) saturate(309%) hue-rotate(339deg) brightness(108%) contrast(104%)";
        closeIcon.style.filter = "invert(95%) sepia(29%) saturate(309%) hue-rotate(339deg) brightness(108%) contrast(104%)";
        tooltipsIcon.style.filter = "invert(95%) sepia(29%) saturate(309%) hue-rotate(339deg) brightness(108%) contrast(104%)";
        githubMark.style.filter = "invert(67%) sepia(8%) saturate(503%) hue-rotate(18deg) brightness(92%) contrast(85%)";
        passwordIcon.style.filter = "invert(66%) sepia(10%) saturate(540%) hue-rotate(18deg) brightness(90%) contrast(93%)";
    } else {
        console.log("Switching back to light theme");
        cssRoot.style.setProperty("--bg-color", "#EDEDED");
        cssRoot.style.setProperty("--alt-text-color", "#9A9A9A");
        cssRoot.style.setProperty("--main-text-color", "#0F0F0F");
        cssRoot.style.setProperty("--grey", "#b8b8b8");
        cssRoot.style.setProperty("--highlight-grey", "#dfdfdf");

        logo.classList.remove("logo-tinted");

        // Remove close icon dark mode color
        closeIcon.removeEventListener('mouseout', mouseoutHandlerDarkMode);

        // Add new one
        closeIcon.addEventListener('mouseout', mouseoutHandlerLightMode);

        // Changing colors of icons
        openCloseIcon.src = "./assets/open-close-arrow.svg";
        menuIcon.style.filter = "unset";
        closeIcon.style.filter = "unset";
        tooltipsIcon.style.filter = "unset";
        githubMark.style.filter = "invert(70%) sepia(7%) saturate(0%) hue-rotate(139deg) brightness(88%) contrast(84%)";
        passwordIcon.style.filter = "unset";
    }
}

// Set to dark mode at startup
darkModeToggle.checked = true;
switchTheme();

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

    // Start listening for WASD key presses
    startWASD();
}

// Disconnect from the broker
function disconnect() {
    console.log("Disconnecting...");

    client.end();

    // Log when disconnected
    client.on('close', function() {
        console.log("Disconnected from the broker.");
    });

    // When all done, show connect form again + reset connection time
    clearTimeout(connectionTimeoutId);
    showConnectForm();
    hideDashboard();
}

// Hide/show password with the icon

let hiddenPassword = true;

passwordIcon.onclick = function() {
    if (hiddenPassword) {
        infoPassword.innerHTML = "Password: " + password;
        passwordIcon.src = "./assets/show-icon.svg";
        passwordIcon.alt = "password is visible, hide it"
        hiddenPassword = false;
    } else {
        infoPassword.innerHTML = "Password: " + "*".repeat(password.length);
        passwordIcon.src = "./assets/hide-icon.svg";
        passwordIcon.alt = "password is hidden, show it"
        hiddenPassword = true;
    }
}

//      Driving controls

// Create an object to store the state of each key
var keyPressed = {};

const wButton = document.querySelector(".w-button");
const aButton = document.querySelector(".a-button");
const sButton = document.querySelector(".s-button");
const dButton = document.querySelector(".d-button");

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
        handleKeyEvent({ key: 'w' });
    });

    aButton.addEventListener('mousedown', function() {
        handleKeyEvent({ key: 'a' });
    });

    sButton.addEventListener('mousedown', function() {
        handleKeyEvent({ key: 's' });
    });

    dButton.addEventListener('mousedown', function() {
        handleKeyEvent({ key: 'd' });
    });

    // Add event listeners for mouse up events on buttons to revert back to default state
    wButton.addEventListener('mouseup', function() {
        handleKeyReleaseEvent({ key: 'w' });
    });

    aButton.addEventListener('mouseup', function() {
        handleKeyReleaseEvent({ key: 'a' });
    });

    sButton.addEventListener('mouseup', function() {
        handleKeyReleaseEvent({ key: 's' });
    });

    dButton.addEventListener('mouseup', function() {
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

// Position map

const positionMap = document.querySelector(".position-map")

const crosshairHorizontal = document.getElementById("crosshair-horizontal");
const crosshairVertical = document.getElementById("crosshair-vertical");
const positionCrosshairInfo = document.querySelector(".position-crosshair-info");

positionMap.addEventListener('mousemove', function(e) {
    const boxRect = positionMap.getBoundingClientRect();
    const mouseX = e.clientX - boxRect.left;
    const mouseY = e.clientY - boxRect.top;

    crosshairVertical.style.left = mouseX + 'px';
    crosshairHorizontal.style.top = mouseY + 'px';

    // Note: 200 is half the width of the position map
    positionCrosshairInfo.innerHTML = "x: " + Math.round(mouseX - 200) + "y: " + Math.round((mouseY - 200)/-1);
});

// Open/close bottom bar

const footerGroup = document.querySelectorAll(".footer-group");
const creditNotice = document.querySelector(".credit-notice");

openCloseIcon.onclick = function() {
    if (creditNotice.style.display != "none") {
        for (let i = 0; i < footerGroup.length; i++) {
            footerGroup[i].style.display = "none";
        }
        creditNotice.style.display = "none";
        openCloseIcon.classList.add("open-close-icon180");
    } else {
        for (let i = 0; i < footerGroup.length; i++) {
            footerGroup[i].style.display = "flex";
        }
        creditNotice.style.display = "flex";
        openCloseIcon.classList.remove("open-close-icon180");
    }
}