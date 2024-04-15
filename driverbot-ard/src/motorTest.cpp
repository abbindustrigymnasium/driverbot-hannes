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