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

// Init JSON field variables
int forward;
int left;
int backwards;
int right;
int speedPercentage;
int steerAngle;

// Motor variables
int maxMotorSpeed = 255;
#define motorPinRightDir 0   //D3 (GPIO 3)
#define motorPinRightSpeed 5    //D1 (GPIO 5)

// Servo
Servo servo;
#define servoPin 4   //D2 (GPIO 4)

void driveForward(int driveSpeed) {
    Serial.print("Driving forward with the speed of ");
    Serial.print(driveSpeed);

    if (forward == 1 && backwards == 0) {
        digitalWrite(motorPinRightDir, 0);
        analogWrite(motorPinRightSpeed, driveSpeed);
    }
}

void driveBackward(int driveSpeed) {
    Serial.print("Driving backward with the speed of ");
    Serial.print(driveSpeed);

    if (backwards == 1 && forward == 0) {
        digitalWrite(motorPinRightDir, 1);
        analogWrite(motorPinRightSpeed, driveSpeed);
    }
}   

void stopDriving() {
    digitalWrite(motorPinRightDir, 0);
    analogWrite(motorPinRightSpeed, 0);
}

void steerRight(int angle) {
    Serial.print("Steering right with ");
    Serial.print(angle);
    Serial.print("° angle");

    // Make sure only right is hold down
    if (right == 1 && left == 0) {
        servo.write(90 + angle);
    }
}

void steerLeft(int angle) {
    Serial.print("Steering left with ");
    Serial.print(angle);
    Serial.print("° angle");

    // Make sure only left is hold down
    if (left == 1 && right == 0) {
        servo.write(90 - angle);
    }
}

// Reset steering if you steered right
void resetSteering() {
   servo.write(90);
}

// Recieving a message from the broker
void callback(char* topic, byte* payload, unsigned int length) {
    Serial.print("Message arrived [");
    Serial.print(topic);
    Serial.print("] ");

    // Parse the JSON payload
    StaticJsonDocument<200> doc;
    deserializeJson(doc, payload, length);

    // Access the JSON fields
    forward = doc["forward"];
    left = doc["left"];
    backwards = doc["backwards"];
    right = doc["right"];
    speedPercentage = doc["speed"];
    steerAngle = doc["steerAngle"];

    // Print the received JSON data
    Serial.print("Received JSON: ");
    serializeJson(doc, Serial);
    Serial.println();

    // Check if the topic is "userData"
    if (strcmp(topic, "userData") == 0) {
        // Check for different user inputs
        if (forward == 1) {
            driveForward((speedPercentage*maxMotorSpeed)/100);
        } else if (backwards == 1) {
            driveBackward((speedPercentage*maxMotorSpeed)/100);
        } else if (forward == 0 && backwards == 0) {
            stopDriving();
        }

        if (right == 1) {
            steerRight(steerAngle);
        } else if (left == 1) {
            steerLeft(steerAngle);
        } else if (right == 0 && left == 0) {
            resetSteering();
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
        if (client->connect(clientId.c_str(), "Hannes Gingby", "!xfdq4.g6XM2!vh")) {
            Serial.println("connected");

            // Once connected, publish that the esp is connected
            client->publish("espData", "ESP8266 is connected");

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

/* // For later
#include <Arduino.h>

#define motorPinRightDir 0   //D2
#define motorPinRightSpeed 5    //D1

int speed = 100;
int dir = 0;
int speedIncrement = 5;
int maxSpeed = 250;

void setup() {
  // put your setup code here, to run once:
  pinMode(motorPinRightDir, OUTPUT);
  pinMode(motorPinRightSpeed, OUTPUT);

  Serial.begin(115200);
}

void setSpeed() {
  // Speed up
  if (speed < maxSpeed)
  {
    speed = speed + speedIncrement;
  }

  // Speed down when reached max speed
  if (speed = maxSpeed)
  {
    if (speed != 0) {
      speed = speed - speedIncrement;
    }
  }
}

void drive(int speed, int direction) {
  digitalWrite(motorPinRightDir, direction);
  analogWrite(motorPinRightSpeed, speed);
}

void loop() {
  setSpeed();

  Serial.println("Speed (RPM): " + String(speed));
  Serial.println("Direction: " + String(dir));

  drive(speed, dir);

  delay(200);
}

*/

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