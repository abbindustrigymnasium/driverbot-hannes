//  This file is mainly handling events on the page

const menuHitbox = document.querySelector("nav");
const menuOverlay = document.querySelector(".menu-overlay");
const closeIcon = document.querySelector(".close-icon");
const body = document.querySelector("body");

//  Display menu when clicking on the hitbox
menuHitbox.onclick = function() {
    console.log("Opened menu");

    menuOverlay.style.display = "block";
    body.style.overflow = "hidden";
}

// Close menu
closeIcon.onclick = function() {
    console.log("Closed menu");

    menuOverlay.style.display = "none";
    body.style.overflow = "unset";
}

const darkModeToggle = document.getElementById("darkModeToggle");
const cssRoot = document.querySelector(":root");
const menuIcon = document.querySelector(".menu-icon");
const tooltipsIcon = document.querySelector(".tooltips-icon");
const logo = document.querySelector(".logo");
const githubMark = document.querySelector(".github-mark");
const passwordIcon = document.querySelector(".password-icon");
const openCloseIcon = document.querySelector(".open-close-icon");

/*
Change close-icon color on different events
Note: I generated CSS filters using https://isotropic.co/tool/hex-color-to-css-filter/ to get specific colors
*/

// Hover
const closeIconHoverHandler = () => {
    closeIcon.style.filter = "invert(34%) sepia(77%) saturate(1199%) hue-rotate(321deg) brightness(86%) contrast(82%)";
};

// Defualt state, light mode
const closeIconMouseoutHandlerLightMode = () => {
    closeIcon.style.filter = "invert(0%) sepia(39%) saturate(5179%) hue-rotate(36deg) brightness(87%) contrast(88%)";
};

// Defualt state, dark mode
const closeIconMouseoutHandlerDarkMode = () => {
    closeIcon.style.filter = "invert(99%) sepia(1%) saturate(2039%) hue-rotate(37deg) brightness(119%) contrast(86%)";
};

closeIcon.addEventListener('mouseover', closeIconHoverHandler);
closeIcon.addEventListener('mouseout', closeIconMouseoutHandlerLightMode);

// Switch between light & dark mode
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
        closeIcon.removeEventListener('mouseout', closeIconMouseoutHandlerLightMode);
        // Add new one
        closeIcon.addEventListener('mouseout', closeIconMouseoutHandlerDarkMode);

        // Changing colours of icons
        openCloseIcon.src = "./assets/open-close-arrow-tinted.svg";
        menuIcon.style.filter = "invert(95%) sepia(29%) saturate(309%) hue-rotate(339deg) brightness(108%) contrast(104%)";
        closeIcon.style.filter = "invert(95%) sepia(29%) saturate(309%) hue-rotate(339deg) brightness(108%) contrast(104%)";
        githubMark.style.filter = "invert(67%) sepia(8%) saturate(503%) hue-rotate(18deg) brightness(92%) contrast(85%)";
        // Null check becasue this element is not in the about page
        if (tooltipsIcon) {
            tooltipsIcon.style.filter = "invert(95%) sepia(29%) saturate(309%) hue-rotate(339deg) brightness(108%) contrast(104%)";
        }
        if (passwordIcon) {
            passwordIcon.style.filter = "invert(66%) sepia(10%) saturate(540%) hue-rotate(18deg) brightness(90%) contrast(93%)";
        }
    } else {
        console.log("Switching back to light theme");
        cssRoot.style.setProperty("--bg-color", "#EDEDED");
        cssRoot.style.setProperty("--alt-text-color", "#9A9A9A");
        cssRoot.style.setProperty("--main-text-color", "#0F0F0F");
        cssRoot.style.setProperty("--grey", "#b8b8b8");
        cssRoot.style.setProperty("--highlight-grey", "#dfdfdf");
        logo.classList.remove("logo-tinted");

        // Remove close icon dark mode color
        closeIcon.removeEventListener('mouseout', closeIconMouseoutHandlerDarkMode);
        // Add new one
        closeIcon.addEventListener('mouseout', closeIconMouseoutHandlerLightMode);

        // Changing colors of icons
        openCloseIcon.src = "./assets/open-close-arrow.svg";
        menuIcon.style.filter = "unset";
        closeIcon.style.filter = "unset";
        githubMark.style.filter = "invert(70%) sepia(7%) saturate(0%) hue-rotate(139deg) brightness(88%) contrast(84%)";
        // Null check becasue this element is not in the about page
        if (tooltipsIcon) {
            tooltipsIcon.style.filter = "unset";
        }
        if (passwordIcon) {
            passwordIcon.style.filter = "unset";   
        }
    }
}

const footerGroup = document.querySelectorAll(".footer-group");
const creditNotice = document.querySelector(".credit-notice");

// Open/close bottom bar when close icon is pressed
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

// Set to dark mode at startup, delete these 2 lines if you want white mode as default
darkModeToggle.checked = true;
switchTheme();

let hiddenPassword = true;

// Null check becasue this element is not in the about page
if (passwordIcon) {
    // Hide/show password with the icon
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
}

// Variables for userData
let steer = "";
let direction = "";
let keyPressed = {};

// Driving controls
const wButton = document.querySelector(".w-button");
const aButton = document.querySelector(".a-button");
const sButton = document.querySelector(".s-button");
const dButton = document.querySelector(".d-button");

// Recording functionality
let recording = false;
let playback = false;
let recordedEvents = [];

// Function to handle key events
function handleKeyEvent(event) {
    // Check if the key is not already pressed
    if (!keyPressed[event.key]) {
        // Set the flag to true for the pressed key
        keyPressed[event.key] = true;

        // Check for WASD presses
        if (event.key === 'w') {
            userData.direction = "forward";
            sendUserData();
            wButton.style.backgroundColor = "var(--alt-text-color)";
        } else if (event.key === 'a') {
            userData.steer = "left";
            sendUserData();
            aButton.style.backgroundColor = "var(--alt-text-color)";
        } else if (event.key === 's') {
            userData.direction = "backward";
            sendUserData();
            sButton.style.backgroundColor = "var(--alt-text-color)";
        } else if (event.key === 'd') {
            userData.steer = "right";
            sendUserData();
            dButton.style.backgroundColor = "var(--alt-text-color)";
        }

        // If recording, then track & store the events
        if (recording) {
            recordedEvents.push({
                type: 'keydown',
                key: event.key,
                time: Date.now()
            });
        }
    }
}

// Function to handle key release events
function handleKeyReleaseEvent(event) {
    // Reset the flag when the key is released
    keyPressed[event.key] = false;
    
    // Check for WASD release
    if (event.key === 'w') {
        userData.direction = "";
        sendUserData();
        wButton.style.backgroundColor = "var(--main-text-color)";
    } else if (event.key === 'a') {
        userData.steer = "";
        sendUserData();
        aButton.style.backgroundColor = "var(--main-text-color)";
    } else if (event.key === 's') {
        userData.direction = "";
        sendUserData();
        sButton.style.backgroundColor = "var(--main-text-color)";
    } else if (event.key === 'd') {
        userData.steer = "";
        sendUserData();
        dButton.style.backgroundColor = "var(--main-text-color)";
    }

    // If recording, then track & store the events
    if (recording) {
        recordedEvents.push({
            type: 'keyup',
            key: event.key,
            time: Date.now()
        });
    }
}

// Function to play back recorded events
function playbackEvents() {
    if (recordedEvents.length === 0) return;
    
    playback = true;
    let startTime = recordedEvents[0].time;
    
    // Simulate the event for each event, taking timings into account
    recordedEvents.forEach(event => {
        setTimeout(() => {
            if (event.type === 'keydown') {
                handleKeyEvent({ key: event.key });
            } else if (event.type === 'keyup') {
                handleKeyReleaseEvent({ key: event.key });
            }
        }, event.time - startTime);
    });

    setTimeout(() => {
        playback = false;
    }, recordedEvents[recordedEvents.length - 1].time - startTime);
}

function startRecording() {
    recordedEvents = [];
    recording = true;
}

function stopRecording() {
    recording = false;
}

// Simulate keypresses for mouseclicks
function handleWEvent() {
    handleKeyEvent({ key: 'w' });
}

function handleWReleaseEvent() {
    handleKeyReleaseEvent({ key: 'w' });
}

function handleAEvent() {
    handleKeyEvent({ key: 'a' });
}

function handleAReleaseEvent() {
    handleKeyReleaseEvent({ key: 'a' });
}

function handleSEvent() {
    handleKeyEvent({ key: 's' });
}

function handleSReleaseEvent() {
    handleKeyReleaseEvent({ key: 's' });
}

function handleDEvent() {
    handleKeyEvent({ key: 'd' });
}

function handleDReleaseEvent() {
    handleKeyReleaseEvent({ key: 'd' });
}

// Listen and handle WASD events
function startWASD() {
    // Add event listeners for keydown and keyup events
    document.addEventListener('keydown', handleKeyEvent);
    document.addEventListener('keyup', handleKeyReleaseEvent);

    // Add event listeners for mouse down events on buttons
    wButton.addEventListener('mousedown', handleWEvent);
    aButton.addEventListener('mousedown', handleAEvent);
    sButton.addEventListener('mousedown', handleSEvent);
    dButton.addEventListener('mousedown', handleDEvent);

    // Add event listeners for mouse up events to revert back to default state
    wButton.addEventListener('mouseup', handleWReleaseEvent);
    aButton.addEventListener('mouseup', handleAReleaseEvent);
    sButton.addEventListener('mouseup', handleSReleaseEvent);
    dButton.addEventListener('mouseup', handleDReleaseEvent);
}

// Remove WASD event listeners
function removeWASD() {
    // Remove event listeners for keydown and keyup events
    document.removeEventListener('keydown', handleKeyEvent);
    document.removeEventListener('keyup', handleKeyReleaseEvent);

    // Remove event listeners for mouse down events on buttons
    wButton.removeEventListener('mousedown', handleWEvent);
    aButton.removeEventListener('mousedown', handleAEvent);
    sButton.removeEventListener('mousedown', handleSEvent);
    dButton.removeEventListener('mousedown', handleDEvent);

    // Remove event listeners for mouse up events to revert back to default state
    wButton.removeEventListener('mouseup', handleWReleaseEvent);
    aButton.removeEventListener('mouseup', handleAReleaseEvent);
    sButton.removeEventListener('mouseup', handleSReleaseEvent);
    dButton.removeEventListener('mouseup', handleDReleaseEvent);
}

const speedSlider = document.getElementById("speed-slider");
const speedNumber = document.getElementById("speed-number");
let speed = 100; // 100 is defualt

// Null check becasue this element is not in the about page
if (speedSlider) {
    // When slider is changed
    speedSlider.oninput = function() {
        speed = Math.round((this.value/parseInt(speedSlider.getAttribute("max"))) * 100);
        speedNumber.innerHTML = "Speed: " + speed + "%";
        // Update speed value in user dataset
        userData.speed = speed;
    
        sendUserData();
    }
}

const steerSlider = document.getElementById("steer-slider");
const steerNumber = document.getElementById("steer-number");
let steerAngle = 65; // 65 is the default

// Null check becasue this element is not in the about page
if (steerSlider) {
    // When slider is changed
    steerSlider.oninput = function() {
        steerAngle = this.value;
        steerNumber.innerHTML = "Steer: " + steerAngle + "°";
        // Update steer angle value in user dataset
        userData.steerAngle = steerAngle;
    
        sendUserData();
    }
}

// Position map
const positionMap = document.querySelector(".position-map")
const crosshairHorizontal = document.getElementById("crosshair-horizontal");
const crosshairVertical = document.getElementById("crosshair-vertical");
const positionCrosshairInfo = document.querySelector(".position-crosshair-info");
const positionDot = document.querySelector(".position-dot");
const positionTarget = document.querySelector(".position-target");
const positionInfoText = document.querySelector(".position-info-text");

let mouseX;
let mouseY;
let currentX;
let currentY;
let targetX;
let targetY;

// Function for clearing the target
function clearPositionTarget() {
    positionTarget.style.display = "none";
    targetX = undefined;
    targetY = undefined;
}

// Null check becasue this element is not in the about page
if (positionMap) {
    // Track mouse position on the map
    positionMap.addEventListener('mousemove', function(e) {
        const boxRect = positionMap.getBoundingClientRect();
        mouseX = Math.round((e.clientX - boxRect.left) - positionMap.clientWidth/2);
        mouseY = Math.round(((e.clientY - boxRect.top) - (positionMap.clientHeight/2))/-1);
    
        crosshairVertical.style.left = e.clientX - boxRect.left + "px";
        crosshairHorizontal.style.top = e.clientY - boxRect.top + "px";

        positionCrosshairInfo.innerHTML = "x: " + mouseX + "y: " + mouseY;
    });

    // Add target
    positionMap.onclick = function() {
        targetX = mouseX;
        targetY = mouseY;

        positionTarget.style.left = "calc(50% - 6px + " + targetX + "px" + ")";
        positionTarget.style.top = "calc(50% - 6px - " + targetY + "px" + ")";
        positionTarget.style.display = "block";
    }
}