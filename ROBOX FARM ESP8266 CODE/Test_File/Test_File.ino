#include <LiquidCrystal_I2C.h>

LiquidCrystal_I2C lcd(0x27, 16, 2);

void setup() {
  // put your setup code here, to run once:
  lcd.init();
  lcd.clear();
  lcd.backlight();  // Make sure backlight is on

  // Print a message on both lines of the LCD.
  lcd.setCursor(0, 0);  //Set cursor to character 0 on line 0
  lcd.print("   ROBOX-FARM");
}

void loop() {
  // put your main code here, to run repeatedly:
}
