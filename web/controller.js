import { DataReportMode, IRDataType, IRSensitivity } from "./wiimote/const.js";
import WIIMote from "./wiimote/wiimote.js"

let requestButton = document.getElementById("request-hid-device");

var wiimote = undefined;

let controllerCenterSteering = 120;
let lastControllerSteer = null;
let controllerSteer = null;

let lastControllerDir = null;
let controllerDir = null;

let lastControllerSpeed = null;
let controllerSpeed = null;
let incrementInterval;
let decrementInterval;

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
        console.log("No device was selected.");
    } else {
        console.log(`HID: ${device.productName}`);

        initCanvas()
    }
});

function initButtons() {
     // Settings buttons
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

function initCanvas() {
    var canvas = document.getElementById("IRcanvas");
    let ctx = canvas.getContext("2d");

    wiimote.BtnListener = (buttons) => {
        var buttonJSON = JSON.stringify(buttons, null, 2);

        if (document.getElementById('buttons').innerHTML != buttonJSON) {
            document.getElementById('buttons').innerHTML = buttonJSON
        }

        if (buttons.TWO === true) {
            controllerDir = "forward";
        } else if (buttons.ONE === true) {
            controllerDir = "backward";
        } else {
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

                    //console.log('Speed:', speed);
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
                    //console.log('Speed:', speed);
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
        } else if (y < (controllerCenterSteering - 5)) {
            controllerSteer = "right";
        } else if (y < ((controllerCenterSteering + 5)) && (y > (controllerCenterSteering - 5))) {
            controllerSteer = "";
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

    wiimote.IrListener = (pos) => {
        if (pos.length < 1) {
            return;
        }

        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'white';

        pos.forEach( cPos => {
            if (cPos != undefined) {
                ctx.fillRect(cPos.x/(1024/ctx.canvas.width), ctx.canvas.height-(cPos.y/(760/ctx.canvas.height)), 5, 5);
            }
        })

        document.getElementById("IRdebug").innerHTML = JSON.stringify(pos, null, true);
    }
}

initButtons();


















/* UUIDs found from device manager:
    -   {3464f7a4-2444-40b1-980a-e0903cb6d912} [10]
    -   {670245f9-6e25-4179-85c1-981c33b9d3b7} [4 & 5]
    -   {80497100-8c73-48b9-aad9-ce387e19c56e} [6]
    -   {83da6326-97a6-4088-9453-a1923f573b29} [17]
    -   {a8b865dd-2e3d-4094-ad97-e593a70c75d6} [26]
    -   {259abffc-50a7-47ce-af08-68c9a7d73366} [14] (showed date)
    -   {6a3433f4-5626-40e8-a9b9-dbd9ecd2884b} [4 & 6]
        {e0cbf06c-cd8b-4647-bb8a-263b43f974}
    -   Class Guid: {e0cbf06c-cd8b-4647-bb8a-263b43f974} (NOT CORRECT)
    -   

    -   Container ID:   {8f3b997e-38dc-597e-ae14-dd77a43e45b8}

    -   Endpoint adress: d8:6b:f7:50:63:18
    -   Bluetooth device address: D86BF7506318


*/

/* Previous code

const UUID = '8f3b997e-38dc-597e-ae14-dd77a43e45b8';

async function connectToWiiMotionPlus() {
    try {
        const device = await navigator.bluetooth.requestDevice({
            acceptAllDevices: true
        });

        const server = await device.gatt.connect();
        const service = await server.getPrimaryService(UUID); // Example UUID, replace with actual

        const characteristic = await service.getCharacteristic(UUID); // Example UUID, replace with actual

        characteristic.addEventListener('characteristicvaluechanged', handleMotionData);
        await characteristic.startNotifications();
        console.log('Connected and listening for motion data');
    } catch (error) {
        console.error('Error connecting to Wii MotionPlus: ', error);
    }
}

function handleMotionData(event) {
    const value = event.target.value;
    const x = value.getInt16(0, true);
    const y = value.getInt16(2, true);
    const z = value.getInt16(4, true);

    // Custom event or logic based on motion data
    const motionEvent = new CustomEvent('motionData', { detail: { x, y, z } });
    document.dispatchEvent(motionEvent);

    // Example: Log data
    console.log(`Motion Data - X: ${x}, Y: ${y}, Z: ${z}`);
}

document.addEventListener('motionData', (event) => {
    const { x, y, z } = event.detail;
    // Update the webpage or perform actions based on the motion data
    console.log(`Received motion data: X=${x}, Y=${y}, Z=${z}`);
});

*/