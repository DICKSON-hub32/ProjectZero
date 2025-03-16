#include <LiquidCrystal_I2C.h>

#include <ESP8266WiFi.h>
#include <ArduinoJson.h>

//const char* email = "brianndesa262@gmail.com";
const char* ssid = "Hillary";
const char* password = "12345678";
const char* serverAddress = "192.168.43.139";  // The domain address or IP address of the server
const int serverPort = 8000;                      // port number the server listens on
const String endpoint = "http://192.168.43.139:8000/receive_data/";                // URL where you want to send the JSON data

WiFiClient client;  // WiFiClient object is created to establish a connection to the server


#include "DHT.h"


#define DPIN 2       //Pin to connect DHT sensor (GPIO number) D2
#define DTYPE DHT11  // Define DHT 11 or DHT22 sensor type
#define soil_moisture_pin A0
#define relay_pin 0
LiquidCrystal_I2C lcd(0x27, 16, 2);  // set the LCD address to 0x3F for a 16 chars and 2 line display


DHT dht(DPIN, DTYPE);

bool pmp = false;

void setup() {
  Serial.begin(115200);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.println("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.println("WiFi connected");

  Serial.begin(9600);
  dht.begin();

  lcd.init();
  lcd.clear();
  lcd.backlight();  // Make sure backlight is on

  // Print a message on both lines of the LCD.
  lcd.setCursor(0, 0);  //Set cursor to character 0 on line 0
  lcd.print("   ROBOX-FARM");

  lcd.setCursor(3, 1);  //Move cursor to character 3 on line 1
  lcd.print("PROJECT");
  pinMode(relay_pin, OUTPUT);
}

void loop() {
  delay(2000);

  float tc = dht.readTemperature(false);          //Read temperature in C
  float tf = dht.readTemperature(true);           //Read Temperature in F
  float hu = dht.readHumidity();                  //Read Humidity
  int soilValue = analogRead(soil_moisture_pin);  // Read moisture level
  int S_value = map(soilValue, 0, 1023, 100, 0);  // put moisture level value in form of percentage

  // Create a JSON document
  StaticJsonDocument<200> doc;
  doc["temperature"] = tc;
  doc["humidity"] = hu;
  doc["moisture"] = S_value;
  //doc["email"] = email;
  //doc["pumpstatus"] = pmp;

  // Serialize the JSON document to a string
  String jsonStr;
  serializeJson(doc, jsonStr);
if (client.connect(serverAddress, serverPort)) {
    Serial.println("Connected to server");
    // Make an HTTP POST request
    client.println("POST " + endpoint.substring(endpoint.indexOf("/", 7)) + " HTTP/1.1");
    client.println("Host: " + String(serverAddress) + ":" + serverPort);
    client.println("Content-Type: application/json");
    client.print("Content-Length: ");
    client.println(jsonStr.length());
    client.println();
    client.println(jsonStr);

    // Read and print server response
    Serial.println("Server response:");
    while (client.available()) {
      String line = client.readStringUntil('\r');
      Serial.print(line);
    }
    client.stop();
} else {
    Serial.println("Failed to connect to server");
}

  // Print a message on both lines of the LCD.
  lcd.clear();
  lcd.setCursor(0, 0);  //Set cursor to character 0 on line 0
  lcd.print("Temp:");
  lcd.print(tc);
  lcd.print("C");

  Serial.print("Temp: ");
  Serial.print(tc);
  Serial.print(" C, ");
  Serial.print(tf);

  lcd.setCursor(0, 1);  //Move cursor to character 0 on line 1
  lcd.print("Hum:");
  lcd.print(hu);
  lcd.print("%");

  Serial.print(" F, Hum: ");
  Serial.print(hu);
  Serial.println("%");

  delay(3000);  // Send data every 3 seconds

  // Set pump off/on
  if (S_value < 35) {
    digitalWrite(relay_pin, HIGH);
    Serial.println("RELAY - ON");
    pmp = true;
  } else {
    digitalWrite(relay_pin, LOW);
    Serial.println("RELAY - OFF");
    pmp = false;
  }




  // Print a message on both lines of the LCD.
  lcd.clear();
  lcd.setCursor(0, 0);  //Set cursor to character 0 on line 0
  lcd.print("Moisture:");
  lcd.print(S_value);
  lcd.print("%");


  lcd.setCursor(0, 1);  //Move cursor to character 0 on line 1
  lcd.print("Pump:");
  if (pmp = false) {
    lcd.print("OFF");
  } else {
    lcd.print("ON");
  }

  Serial.print("Moisture amount: ");
  Serial.print(S_value);
  Serial.println("%");

  Serial.print("Pump:");
  if (pmp = false) {
    Serial.println("OFF");
  } else {
    Serial.println("ON");
  }

  delay(500);
}