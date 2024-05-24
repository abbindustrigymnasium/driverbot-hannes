//  THIS FILE IS ENSURING A CONNECTION BETWEEN THE ESP8266 AND THE MQTT BROKER, ALSO HANDLING CALLING OF MOTORFUNCTIONS.

//#include <Arduino.h> // This is not always necessary
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <time.h>
#include <TZ.h>
#include <FS.h>
#include <LittleFS.h>
#include <CertStoreBearSSL.h>
#include <ArduinoJson.h>
#include <Servo.h>

// Network credentials
//const char* ssid = "ABB_Gym_IOT";
//const char* password = "Welcome2abb";

const char* ssid = "Hanness iPhone";
const char* password = "11223344";

// MQTT cluster URL
const char* mqtt_server = "24481123c0884e459cd76ccc6ca6d326.s1.eu.hivemq.cloud";

// A single, global CertStore which can be used by all connections.
// Needs to stay live the entire time any of the WiFiClientBearSSLs are present.
BearSSL::CertStore certStore;

// Global declerations
WiFiClientSecure espClient;
PubSubClient * client;
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (500)
char msg[MSG_BUFFER_SIZE];
int value = 0;

void setupWifi() {
    delay(10);
    // We start by connecting to a WiFi network
    Serial.println();
    Serial.print("Connecting to ");
    Serial.println(ssid);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);

    // Dots print
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }

    // If random is implementad later, use random seed
    //randomSeed(micros());

    Serial.println("");
    Serial.println("WiFi connected");
    Serial.println("IP address: ");
    Serial.println(WiFi.localIP());
}

void setDateTime() {
    // You can use your own timezone, but the exact time is not used at all.
    // Only the date is needed for validating the certificates.
    configTime(TZ_Europe_Stockholm, "pool.ntp.org", "time.nist.gov");

    Serial.print("Waiting for NTP time sync: ");
    time_t now = time(nullptr);
    while (now < 8 * 3600 * 2) {
        delay(100);
        Serial.print(".");
        now = time(nullptr);
    }
    Serial.println();

    struct tm timeinfo;
    gmtime_r(&now, &timeinfo);
    Serial.printf("%s %s", tzname[0], asctime(&timeinfo));
}

// Init JSON field variables for userData
int forward;
int left;
int backwards;
int right;
int speedPercentage;
int steerAngle;
int targetX; // Start with no target position
int targetY;

String espStatus = "";

// Motor variables
int maxMotorSpeed = 255;
#define motorPinRightDir 0   //D3 (GPIO 3)
#define motorPinRightSpeed 5    //D1 (GPIO 5)

// Servo
Servo servo;
#define servoPin 4   //D2 (GPIO 4)

// Position
int currentX = 0; // Start position is (0, 0)
int currentY = 0;
unsigned long lastTime = 0;
unsigned long currentTime = 0;
const float speedInCmPerSec = 3.0; // Calibrated speed in cm/s
const float timeToTurn90Degrees = 1.0; // Time to turn 90 degrees in seconds

const float baseSpeedInCmPerSec = 5.0; // Base speed in cm/s at maximum drive speed (255)

float calculateCurrentSpeed(int driveSpeed) {
    return baseSpeedInCmPerSec * (driveSpeed / 255.0);
}

void sendEspData() {
    StaticJsonDocument<200> doc;
    doc["status"] = espStatus;
    doc["currentX"] = currentX;
    doc["currentY"] = currentY;

    char buffer[256];
    size_t n = serializeJson(doc, buffer);
    buffer[n] = '\0';  // Null-terminate the buffer
    client->publish("espData", buffer, n);
}

void driveForward(int speed) {
    Serial.print("Driving forward with the speed of ");
    Serial.print(speed);

    if (forward == 1 && backwards == 0) {
        digitalWrite(motorPinRightDir, 0);
        analogWrite(motorPinRightSpeed, speed);

        // Calculate the elapsed time
        currentTime = millis();
        float elapsedTime = (currentTime - lastTime) / 1000.0; // Convert milliseconds to seconds
        lastTime = currentTime;

        // Calculate the distance traveled
        float currentSpeed = calculateCurrentSpeed(speed);
        float distance = currentSpeed * elapsedTime;
        currentY += distance; // Assuming forward movement increases Y-coordinate

        sendEspData();
    }
}

void driveBackward(int speed) {
    Serial.print("Driving backward with the speed of ");
    Serial.print(speed);

    if (backwards == 1 && forward == 0) {
        digitalWrite(motorPinRightDir, 1);
        analogWrite(motorPinRightSpeed, speed);

        // Calculate the elapsed time
        currentTime = millis();
        float elapsedTime = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;

        // Calculate the distance traveled
        float currentSpeed = calculateCurrentSpeed(speed);
        float distance = currentSpeed * elapsedTime;
        currentY -= distance; // Assuming backward movement decreases Y-coordinate

        sendEspData();
    }
}

void stopDriving() {
    digitalWrite(motorPinRightDir, 0);
    analogWrite(motorPinRightSpeed, 0);
}

void steerRight(int angle, int speed) {
    Serial.print("Steering right with ");
    Serial.print(angle);
    Serial.print("° angle");

    // Make sure only right is hold down
    if (right == 1 && left == 0) {
        servo.write(90 + angle);

        // Calculate the elapsed time
        currentTime = millis();
        float elapsedTime = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;

        // Calculate the distance traveled while turning
        float currentSpeed = calculateCurrentSpeed(speed);
        float distance = currentSpeed * elapsedTime;
        // Assuming right turn increases X-coordinate and decreases Y-coordinate
        currentX += distance * cos(angle * PI / 180.0);
        currentY -= distance * sin(angle * PI / 180.0);

        sendEspData();
    }
}

void steerLeft(int angle, int speed) {
    Serial.print("Steering left with ");
    Serial.print(angle);
    Serial.print("° angle");

    // Make sure only left is hold down
    if (left == 1 && right == 0) {
        servo.write(90 - angle);

        // Calculate the elapsed time
        currentTime = millis();
        float elapsedTime = (currentTime - lastTime) / 1000.0;
        lastTime = currentTime;

        // Calculate the distance traveled while turning
        float currentSpeed = calculateCurrentSpeed(speed);
        float distance = currentSpeed * elapsedTime;
        // Assuming right turn increases X-coordinate and decreases Y-coordinate
        currentX += distance * cos(angle * PI / 180.0);
        currentY -= distance * sin(angle * PI / 180.0);

        sendEspData();
    }
}

// Reset steering if you steered right
void resetSteering() {
   servo.write(90);
}

void moveToTarget(int x, int y) {
    Serial.print("Moving to: " + '(' + x + ',' + y + ')');
}

// Recieving a message from the broker
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");

    // Parse the JSON payload
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload, length);

    // Access the JSON fields for userData
    forward = doc["forward"];
    left = doc["left"]; 
    backwards = doc["backwards"];
    right = doc["right"];
    speedPercentage = doc["speed"];
    steerAngle = doc["steerAngle"];
    targetX = doc["targetX"];
    targetY = doc["targetY"];

    // Print the received JSON data
    Serial.print("Received JSON: ");
    serializeJson(doc, Serial);
    Serial.println();

    // Calculate driveSpeed
    int driveSpeed = (speedPercentage*maxMotorSpeed)/100;

    // Check if the topic is "userData"
    if (strcmp(topic, "userData") == 0) {
        // Check for different user inputs
        if (forward == 1) {
            driveForward(driveSpeed);
        } else if (backwards == 1) {
            driveBackward(driveSpeed);
        } else if (forward == 0 && backwards == 0) {
            stopDriving();
        }

        if (right == 1) {
            steerRight(steerAngle, driveSpeed);
        } else if (left == 1) {
            steerLeft(steerAngle, driveSpeed);
        } else if (right == 0 && left == 0) {
            resetSteering();
        }

        // Move only if the target position is a different location from the current one
        if (currentX != targetX && currentY != targetY) {
            moveToTarget(targetX, targetY);
        }
    }
}

// Connect to MQTT function
void reconnect() {
    // Loop until we’re reconnected
    while (!client->connected()) {
        Serial.print("Attempting MQTT connection…");
        String clientId = "ESP8266Client - MyClient";

        // Attempt to connect
        if (client->connect(clientId.c_str(), "Hannes_Gingby", "!xfdq4.g6XM2!vh")) {
            Serial.println("connected");

            // Once connected, publish that the esp is connected
            espStatus = "connected";
            sendEspData();

            // Subscribe to the user inputs topic
            client->subscribe("userData");
        } else {
            Serial.print("failed, rc = ");
            Serial.print(client->state());
            Serial.println(" try again in 5 seconds");
            // Wait 5 seconds before retrying
            delay(5000);
        }
    }
}

void setup() {
    // Setup, running once

    delay(500);
    Serial.begin(115200);
    delay(500);

    LittleFS.begin();
    setupWifi();
    setDateTime();

    // Initialize the LED_BUILTIN pin as an output
    pinMode(LED_BUILTIN, OUTPUT);

    // Motor setup
    pinMode(motorPinRightDir, OUTPUT);
    pinMode(motorPinRightSpeed, OUTPUT);

    // Servo setup
    // servo.write(0);
    servo.attach(servoPin);

    // You can use the insecure mode, when you want to avoid the certificates
    //espClient.setInsecure();

    int numCerts = certStore.initCertStore(LittleFS, PSTR("/certs.idx"), PSTR("/certs.ar"));
    Serial.printf("Number of CA certs read: %d\n", numCerts);
    if (numCerts == 0) {
        Serial.printf("No certs found. Did you run certs-from-mozilla.py and upload the LittleFS directory before running?\n");
        return; // Can't connect to anything w/o certs!
    }

    BearSSL::WiFiClientSecure *bear = new BearSSL::WiFiClientSecure();
    // Integrate the cert store with this connection
    bear->setCertStore(&certStore);

    client = new PubSubClient(*bear);

    client->setServer(mqtt_server, 8883);
    client->setCallback(callback);
}

void loop() {
    // If not connected, try to connect.
    if (!client->connected()) {
        reconnect();
    }
    client->loop();
}

/*
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");
    for (unsigned int i = 0; i < length; i++) {
        Serial.print((char)payload[i]);
    }
    Serial.println();

    // Switch on the LED if the first character is present
    // if ((char)payload[0] != NULL) {
    if (payload[0] != 0) {
        digitalWrite(LED_BUILTIN, LOW); // Turn the LED on (Note that LOW is the voltage level but actually the LED is on; this is because it is active low on the ESP-01)
        delay(500);
        digitalWrite(LED_BUILTIN, HIGH); // Turn the LED off by making the voltage HIGH
    } else {
        digitalWrite(LED_BUILTIN, HIGH); // Turn the LED off by making the voltage HIGH
    }
}
*/

// For testing: publish 'hello world' message every 2 seconds.
    /*
    unsigned long now = millis();
    if (now - lastMsg > 2000) {
        lastMsg = now;
        ++value;
        //snprintf (msg, MSG_BUFFER_SIZE, "hello world #%ld", value);
        snprintf (msg, MSG_BUFFER_SIZE, "hello world #%d", value);
        Serial.print("Publish message: ");
        Serial.println(msg);
        client->publish("userData", msg);
    }
    */