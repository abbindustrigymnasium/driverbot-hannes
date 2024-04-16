# PLANERING

### Funktioner

- Grundkrav - framåt/bakåt + höger/vänster, kontroll med webbsida
- Hastighetskontroll, kontroll med slider, visualisera
- Kanske en estimering av hastigheten?
- Om möjligt, position? Visualisera driverbotens position relativt till startposition på webbsidan
- Tid över? GSAP animationer

### Struktur

- Web
    - index.html
    - main.js
    - style.css
- Arduino
    - driverbot.cpp

**`webbsida (publisher)`** → **`webbinput`** → **`MQTT broker`** → **`ESP (subscriber)`** → **`driverbot`**

### Webbsida

Förslag till styrningen:

- WASD?
- Hastigehtsslider, från 0 till 100%

### UI

En generell layout för webbsidan, kommer förmodligen ändras en hel del under arbetsgången.

![drivetbot_Webpage_Layout](https://github.com/abbindustrigymnasium/driverbot-hannes/assets/144680867/dc2f6852-f120-48ca-9fbd-bf44f43c1257)

### Tidsplan
Inte spikat.

| Sofie | Andreas | Vecka |
| --- | --- | --- |
| Koppla MQTT | Motorhållare | 16 |
| MQTT och Arduino | Lego | 17 |
| Lego | Lego | 18 |
| Motorfunktioner | Servo, ESP | 19 |
| Webbkontroll | Servo, ESP | 20 |
| … | … | 21 |
| Klart | Klart | 22 |
