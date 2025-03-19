#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// WiFi ağ bilgileri - Access Point (AP) modu
extern const char *ap_ssid;
extern const char *ap_password;

// WiFi ağ bilgileri - Station (STA) modu
extern const char *wifi_ssid;
extern const char *wifi_password;
extern const int max_connection_attempts;

// Pin tanımlamaları
extern const int outputPins[];
extern const int inputPins[];
extern const int numOutputs;
extern const int numInputs;

#endif // CONFIG_H
