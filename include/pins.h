#ifndef PINS_H
#define PINS_H

#include <Arduino.h>

// Pinleri ayarla
void setupPins();

// Pin durumunu değiştir
bool setPinState(int pin, int state);

// Pin durumunu oku
int getPinState(int pin);

// Analog değeri oku
int getAnalogValue(int pin);

// Pin geçerliliğini kontrol et
bool isValidOutputPin(int pin);

#endif // PINS_H
