//      Menu

const menuHitbox = document.querySelector("nav");
const menuOverlay = document.querySelector(".menu-overlay");
const closeIcon = document.querySelector(".close-icon");

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

function switchTheme() {
    if (darkModeToggle.checked == true) {
        console.log("Switching to dark theme");
        cssRoot.style.setProperty("--bg-color", "#0F0F0F");
        cssRoot.style.setProperty("--main-text-color", "#EDEDED");

        // Generated filter using https://isotropic.co/tool/hex-color-to-css-filter/
        menuIcon.style.filter = "invert(99%) sepia(1%) saturate(2039%) hue-rotate(37deg) brightness(119%) contrast(86%)";
        closeIcon.style.filter = "invert(99%) sepia(1%) saturate(2039%) hue-rotate(37deg) brightness(119%) contrast(86%)";
    } else {
        console.log("Switching back to light theme");
        cssRoot.style.setProperty("--bg-color", "#EDEDED");
        cssRoot.style.setProperty("--main-text-color", "#0F0F0F");

        menuIcon.style.filter = "unset";
        closeIcon.style.filter = "unset";
    }
}

//      MQTT connection

const connectForm = document.querySelector(".connect-form");

const clientIDInput = document.getElementById("clientId");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");

function hideConnectForm() {
    connectForm.style.display = "none";
}

function connect() {
    const clientID = clientIDInput.value.toString();
    const username = usernameInput.value.toString();
    const password = passwordInput.value.toString();

    //      Socket IO

    // Connect to the Socket.IO server
    const socket = io('http://localhost:3000');

    // Emit the values to the server
    socket.emit('connectValues', { clientID, username, password });

    // When all done, hide form
    //hideConnectForm();
}