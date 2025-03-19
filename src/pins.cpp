#include "pins.h"
#include "config.h"

// Pinleri ayarla
void setupPins() {
  for (int i = 0; i < numOutputs; i++) {
    pinMode(outputPins[i], OUTPUT);
    digitalWrite(outputPins[i], LOW);
  }

  for (int i = 0; i < numInputs; i++) {
    pinMode(inputPins[i], INPUT);
  }
}

// Pin durumunu değiştir
bool setPinState(int pin, int state) {
  if (!isValidOutputPin(pin)) return false;
  
  digitalWrite(pin, state);
  return true;
}

// Pin durumunu oku
int getPinState(int pin) {
  return digitalRead(pin);
}

// Analog değeri oku
int getAnalogValue(int pin) {
  return analogRead(pin);
}

// Pin geçerliliğini kontrol et
bool isValidOutputPin(int pin) {
  for (int i = 0; i < numOutputs; i++) {
    if (outputPins[i] == pin) {
      return true;
    }
  }
  return false;
}
