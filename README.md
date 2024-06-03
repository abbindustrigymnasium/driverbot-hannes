# Driverbot

This project is a school assignment that began in March 2024, aimed at creating a small-scale Lego-based car. The project integrates MQTT technology, the ESP8266 microcontroller, motor, servo, and CAD-modeled parts.

## Table of Contents

- [About Driverbot](#driverbot)
- [Requirements](#requirements)
- [Features](#features)
- [Showcase](#showcase)
- [Installation](#installation)

## Requirements

We were given the following requirements for the project:

- Driving and steering forward, backward, left, and right.
- Controlled via a web interface.
- Maintained within a maximum size of 15x15x15 centimeters.

## Features

- **Remote Control**: Operate the car using a web-based interface. You can also control the car using a WiiMote controller if you have one.
- **Compact Design**: The car's size does not exceed 15x15x15 centimeters.
- **Full Motion**: Capable of moving in all directions, forward, backward, left and right. You can also control the drive speed and steer angle.
- **Position Track**: On the web interface you can view the estimate of were the driverbot is located (based on user inputs). There is also an option to click on a so-called *position map* and click on a point where it should go to.

## Showcase

-Will publish a video or something here soon-

## Installation

1. Clone this repository:
    ```bash
    git clone https://github.com/abbindustrigymnasium/driverbot-hannes.git
    ```

2. Navigate to the project directory:
    ```bash
    cd driverbot-hannes
    ```
3. Set up the ESP8266 microcontroller with the required firmware.

4. If you are using Visual Studio Code together with Platform IO, you will to make sure you have the right compiler. You can also use the Arduino IDE if you want. In that case, you will only need to grab the driverbot.ini I've created for you located in /ini/driverbot.ini. You will also need to install the necessary libraries via the Arduino IDE.

5. Locate the COM port for the ESP when it is connected to your computer. Modify the upload port setting in the platformio.ini file to **your** COM port. If you're using the Arduino IDE, set your upload COM port in the Arduino IDE.

6. Build and upload to the ESP.
