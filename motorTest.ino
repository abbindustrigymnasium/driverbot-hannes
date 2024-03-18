#define motorPinRightDir  0//D2
#define motorPinRightSpeed 5//D1

void setup() {
  // put your setup code here, to run once:
  pinMode(motorPinRightDir, OUTPUT);
  pinMode(motorPinRightSpeed, OUTPUT);

  Serial.begin(115200);
}

void loop() {
  int speed = 1024;
  int dir = 0;

  delay(2200);
  digitalWrite(motorPinRightDir, dir);
  analogWrite(motorPinRightSpeed, speed);
      delay(2200);      
  digitalWrite(motorPinRightDir, 1);
  analogWrite(motorPinRightSpeed, speed);
}
