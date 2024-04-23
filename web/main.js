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
    }
}

//      MQTT connection

const connectForm = document.querySelector(".connect-form");
const monitorSection = document.querySelector(".monitor-section");

const clientIDInput = document.getElementById("clientId");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

const infoCluster = document.querySelector(".info-cluster");
const infoPort = document.querySelector(".info-port");
const infoProtocol = document.querySelector(".info-protocol");
const infoUsername = document.querySelector(".info-username");
const infoPassword = document.querySelector(".info-password");
const infoTime = document.querySelector(".info-time");

function hideConnectForm() {
    connectForm.style.display = "none";
}

function showDashboard() {
    monitorSection.style.display = "flex";
}

function connect() {
    const clientID = clientIDInput.value.toString();
    const username = usernameInput.value.toString();
    const password = passwordInput.value.toString();

    clientIDInput.value = "";
    usernameInput.value = "";
    passwordInput.value = "";

    //      Socket IO

    // Connect to the Socket.IO server
    const socket = io('http://localhost:3000');

    // Emit the values to the server
    socket.emit('connectValues', { clientID, username, password });

    // Show connection info
    infoUsername.innerHTML = "Username: " + username;
    infoPassword.innerHTML = "Password: " + "*".repeat(password.length);

    // Get connection info
    socket.emit('getConnectionInfo');

    socket.on('connectionInfoResponse', (connectionInfo) => {
        console.log(connectionInfo.clusterURL + "   " + connectionInfo.port + "   " + connectionInfo.protocol);

        infoCluster.innerHTML = "Cluster URL: " + connectionInfo.clusterURL;
        infoPort.innerHTML = "Port: " + connectionInfo.port;
        infoProtocol.innerHTML = "Protocol: " + connectionInfo.protocol;
    });

    // When all done, hide form + show the other dashboard sections
    hideConnectForm();
    showDashboard();
}