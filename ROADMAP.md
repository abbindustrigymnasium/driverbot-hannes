# ROADMAP

### Functions

- Basic requirements - forward/backward + right/left, control via webpage
- Speed control, control with slider, visualize
- Perhaps an estimation of the speed?
- If possible, position? Visualize the driverbot's position relative to the starting position on the webpage
- Extra time? GSAP animations

### Structure (so far)

- Web
    - index.html    Skelton
    - main.js    Handling connection between web and MQTT broker, controls all web interactivity
    - style.css    Styling
- Arduino
    - driverbot.cpp    All driverbot functions, connection between ESP8266 and MQTT broker

**`webbsite (publisher)`** → **`webbinput`** → **`MQTT broker`** → **`ESP (subscriber)`** → **`driverbot`**

### Website

Suggestions for the stearing:

- WASD?
- Speedslider, from 0 to 100%

### UI

A general basic layout for the website, will probably change during the process.

![drivetbot_Webpage_Layout](https://github.com/abbindustrigymnasium/driverbot-hannes/assets/144680867/dc2f6852-f120-48ca-9fbd-bf44f43c1257)

### Timeplan

| Sofie | Andreas | Week |
| --- | --- | --- |
| Connect MQTT | Motorcase | 16 |
| MQTT + Arduino | Lego | 17 |
| Lego | Lego | 18 |
| Motorfunctions | Servo, ESP | 19 |
| Webcontrols | Servo, ESP | 20 |
| … | … | 21 |
| Done | Done | 22 |
