// This file is handling the Wii controller

import { DataReportMode, IRDataType, IRSensitivity } from "./wiimote/const.js";
import WIIMote from "./wiimote/wiimote.js"

let requestButton = document.getElementById("request-hid-device");

var wiimote = undefined;

let controllerCenterSteering = 120;

// Flag variables since listeners are continues
let lastControllerSteer = null;
let controllerSteer = null;
let lastControllerDir = null;
let controllerDir = null;

let lastControllerSpeed = null;
let controllerSpeed = null;
let incrementInterval;
let decrementInterval;

const controllerVisualSettings = document.querySelector(".wii-controller-settings");

// Function for setting an action to a button on the page
function setButton(elementId, action) {
    document.getElementById(elementId).addEventListener("click", async () => {
        action()
    })
}

requestButton.addEventListener("click", async () => {
    let device;
    try {
        const devices = await navigator.hid.requestDevice({
            filters: [{ vendorId: 0x057e }],
        });
        
        device = devices[0];
        wiimote = new WIIMote(device)
    } catch (error) {
        console.log("An error occurred.", error);
    }

    if (!device) {
        // Cancelled selection of the controller
        console.log("No device was selected.");
    } else {
        // When connected the controller
        console.log(`HID: ${device.productName}`);

        initListeners();

        // Show settings elements
        controllerVisualSettings.style.display = "flex";
    }
});

function initButtons() {
    // Set button actions
    setButton("rumble",
        () => wiimote.toggleRumble()
    )

    setButton("irextended",
        () => wiimote.initiateIR(IRDataType.EXTENDED)
    )

    setButton("irbasic",
        () => wiimote.initiateIR(IRDataType.BASIC)
    )

    setButton("irfull",
        () => wiimote.initiateIR(IRDataType.FULL)
    )

    setButton("coreBtns",
        () => wiimote.setDataTracking(DataReportMode.CORE_BUTTONS)
    )

    setButton("coreBtnsACC",
        () => wiimote.setDataTracking(DataReportMode.CORE_BUTTONS_AND_ACCEL)
    )

    setButton("coreBtnsACCIR",
        () => wiimote.setDataTracking(DataReportMode.CORE_BUTTONS_ACCEL_IR)
    )

    // LED buttons
    document.getElementById("led1").onclick = () => wiimote.toggleLed(0);
    document.getElementById("led2").onclick = () => wiimote.toggleLed(1);
    document.getElementById("led3").onclick = () => wiimote.toggleLed(2);
    document.getElementById("led4").onclick = () => wiimote.toggleLed(3);
}

function initListeners() {
    wiimote.BtnListener = (buttons) => {
        var buttonJSON = JSON.stringify(buttons, null, 2);

        if (document.getElementById('buttons-status').innerHTML != buttonJSON) {
            document.getElementById('buttons-status').innerHTML = buttonJSON
        }

        if (buttons.TWO === true) {
            controllerDir = "forward";

            // Turn on if off
            if (wiimote.ledStatus[0] === false) {
                wiimote.toggleLed(0); // LED 1
            }
        } else if (buttons.TWO === false) {
            // Turn off if on
            if (wiimote.ledStatus[0] === true) {
                wiimote.toggleLed(0); // LED 1
            }
        }
        
        if (buttons.ONE === true) {
            controllerDir = "backward";

            // Turn on if off
            if (wiimote.ledStatus[1] === false) {
                wiimote.toggleLed(1); // LED 2
            }
        } else if (buttons.ONE === false) {
            // Turn off if on
            if (wiimote.ledStatus[1] === true) {
                wiimote.toggleLed(1); // LED 2
            }
        }
        
        if (buttons.TWO === false && buttons.ONE === false) {
            controllerDir = "";
        }

        // Check if the direction has changed
        if (controllerDir !== lastControllerDir) {
            userData.direction = controllerDir;
            sendUserData();

            // Update the last direction
            lastControllerDir = controllerDir;
        }

        // Note: DPAD_RIGHT is upwards ween holding the controller horizontally
        if (buttons.DPAD_RIGHT === true) {
            controllerSpeed = "activeIncrement";
        } else if (buttons.DPAD_LEFT === true) {
            controllerSpeed = "activeDecrement";
        } else {
            controllerSpeed = "";
        }

        if (controllerSpeed !== lastControllerSpeed) {
            if (controllerSpeed == "activeIncrement") {
                incrementInterval = setInterval(() => {
                    speed++;
                    // Ensure speed is not going under 0 and over 100
                    if (speed >= 100) {
                        speed = 100;
                    } else if (speed <= 0) {
                        speed = 0;
                    }

                    userData.speed = speed;
                    sendUserData();
                }, 90);
            } else if (controllerSpeed == "activeDecrement") {
                decrementInterval = setInterval(() => {
                    speed--;
                    // Ensure speed is not going under 0 and over 100
                    if (speed >= 100) {
                        speed = 100;
                    } else if (speed <= 0) {
                        speed = 0;
                    }

                    userData.speed = speed;
                    sendUserData();
                }, 90);
            } else {
                clearInterval(incrementInterval);
                incrementInterval = null;
                clearInterval(decrementInterval);
                decrementInterval = null;
            }

            // Update the last direction
            lastControllerSpeed = controllerSpeed;
        }
    }

    wiimote.AccListener = (x, y, z) => {
        // Handle x, y and z controller changes
        document.getElementById('accX').innerHTML = x;
        document.getElementById('accY').innerHTML = y;
        document.getElementById('accZ').innerHTML = z;

        if (y > (controllerCenterSteering + 5)) {
            controllerSteer = "left";

            // Turn on if off
            if (wiimote.ledStatus[2] === false) {
                wiimote.toggleLed(2); // LED 3
            }
        } else if (y < (controllerCenterSteering - 5)) {
            controllerSteer = "right";

            // Turn on if off
            if (wiimote.ledStatus[3] === false) {
                wiimote.toggleLed(3); // LED 4
            }
        } else if (y < ((controllerCenterSteering + 5)) && (y > (controllerCenterSteering - 5))) {
            controllerSteer = "";

            // Turn off if on
            if (wiimote.ledStatus[2] === true) {
                wiimote.toggleLed(2); // LED 3
            }
            if (wiimote.ledStatus[3] === true) {
                wiimote.toggleLed(3); // LED 4
            }
        }

        // Check if the steer has changed
        if (controllerSteer !== lastControllerSteer) {
            //console.log("Controller direction: " + controllerSteer);
            userData.steer = controllerSteer;
            sendUserData();

            // Update the last steer
            lastControllerSteer = controllerSteer;
        }
    }
}

initButtons();
