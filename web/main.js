//      THIS FILE IS MAINLY HANDLING EVENTS ON THE PAGE

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
        closeIcon.removeEventListener('mouseout', mouseoutHandlerDarkMode);

        // Add new one
        closeIcon.addEventListener('mouseout', mouseoutHandlerLightMode);

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

// Set to dark mode at startup
darkModeToggle.checked = true;
switchTheme();

//      Hide/show password with the icon

let hiddenPassword = true;

// Null check becasue this element is not in the about page
if (passwordIcon) {
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

//      Driving controls

// Create an object to store the state of each key
let keyPressed = {};

const wButton = document.querySelector(".w-button");
const aButton = document.querySelector(".a-button");
const sButton = document.querySelector(".s-button");
const dButton = document.querySelector(".d-button");

// Function to handle key events
function handleKeyEvent(event) {
    // Check if the key is not already pressed
    if (!keyPressed[event.key]) {
        // Set the flag to true for the pressed key
        keyPressed[event.key] = true;

        // Check for WASD press
        if (event.key === 'w') {
            userData.forward = 1;
            sendUserData();
            wButton.style.backgroundColor = "var(--alt-text-color)";
        } else if (event.key === 'a') {
            userData.left = 1;
            sendUserData();
            aButton.style.backgroundColor = "var(--alt-text-color)";
        } else if (event.key === 's') {
            userData.backwards = 1;
            sendUserData();
            sButton.style.backgroundColor = "var(--alt-text-color)";
        } else if (event.key === 'd') {
            userData.right = 1;
            sendUserData();
            dButton.style.backgroundColor = "var(--alt-text-color)";
        }
    }
}

// Function to handle key release events
function handleKeyReleaseEvent(event) {
    // Reset the flag when the key is released
    keyPressed[event.key] = false;
    
    // Check for WASD release
    if (event.key === 'w') {
        userData.forward = 0;
        sendUserData();
        wButton.style.backgroundColor = "var(--main-text-color)";
    } else if (event.key === 'a') {
        userData.left = 0;
        sendUserData();
        aButton.style.backgroundColor = "var(--main-text-color)";
    } else if (event.key === 's') {
        userData.backwards = 0;
        sendUserData();
        sButton.style.backgroundColor = "var(--main-text-color)";
    } else if (event.key === 'd') {
        userData.right = 0;
        sendUserData();
        dButton.style.backgroundColor = "var(--main-text-color)";
    }
}

//      Simulate keypresses for mouseclicks

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

// Remove WASD listeners
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

//      Sliders

const speedSlider = document.getElementById("speed-slider");
const speedNumber = document.getElementById("speed-number");
let speedData = 100; // 100 is defualt

// Null check becasue this element is not in the about page
if (speedSlider) {
    speedSlider.oninput = function() {
        speedData = Math.round((this.value/parseInt(speedSlider.getAttribute("max"))) * 100);
        speedNumber.innerHTML = "Speed: " + speedData + "%";
        
        // Update speed value in user dataset
        userData.speed = speedData;
    
        sendUserData();
    }
}

const steerSlider = document.getElementById("steer-slider");
const steerNumber = document.getElementById("steer-number");
let steerData = 55; // 55 is the default

// Null check becasue this element is not in the about page
if (steerSlider) {
    steerSlider.oninput = function() {
        steerData = this.value;
        steerNumber.innerHTML = "Steer: " + steerData + "°";
        
        // Update steer angle value in user dataset
        userData.steerAngle = steerData;
    
        sendUserData();
    }
}

//      Position map

const positionMap = document.querySelector(".position-map")

const crosshairHorizontal = document.getElementById("crosshair-horizontal");
const crosshairVertical = document.getElementById("crosshair-vertical");
const positionCrosshairInfo = document.querySelector(".position-crosshair-info");
const positionDot = document.querySelector(".position-dot");
const positionTarget = document.querySelector(".position-target");

let mouseX;
let mouseY;

//let currentX ;
//let currentY;

let targetX;
let targetY;

function clearTarget() {
    //positionTarget.style.display = "none";
}

// Null check becasue this element is not in the about page
if (positionMap) {
    positionMap.addEventListener('mousemove', function(e) {
        const boxRect = positionMap.getBoundingClientRect();
        // Note: 200 is half the width of the position map
        mouseX = Math.round((e.clientX - boxRect.left) - 200);
        mouseY = Math.round(((e.clientY - boxRect.top) - 200)/-1);
    
        crosshairVertical.style.left = e.clientX - boxRect.left + "px";
        crosshairHorizontal.style.top = e.clientY - boxRect.top + "px";

        positionCrosshairInfo.innerHTML = "x: " + mouseX + "y: " + mouseY;
    });

    positionMap.onclick = function() {
        targetX = mouseX;
        targetY = mouseY;

        console.log("Repositioning dot, " + "calc(50% - 6px + " + targetX + "px " + ")" + " " + "calc(50% - 6px - " + targetY + "px" + ")");
        positionTarget.style.left = "calc(50% - 6px + " + targetX + "px" + ")";
        positionTarget.style.top = "calc(50% - 6px - " + targetY + "px" + ")";
        positionTarget.style.display = "block";

        userData.targetX = targetX;
        userData.targetY = targetY;
        sendUserData();
    }
}

//      Open/close bottom bar

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