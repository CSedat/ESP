#include "config.h"

// WiFi ağ bilgileri - Access Point (AP) modu
const char *ap_ssid = "ESP_Dashboard";
const char *ap_password = "12345678";

// WiFi ağ bilgileri - Station (STA) modu
const char *wifi_ssid = "CSedat iPhone";  // WiFi ağınızın adı
const char *wifi_password = "Sadoqwe..";  // WiFi şifreniz
const int max_connection_attempts = 20;   // Maksimum bağlantı deneme sayısı

// Pin tanımlamaları - ESP8266 için uygun pinler
const int outputPins[] = {D1, D2, D3, D4, D5}; // Kontrol edilebilen çıkış pinleri
const int inputPins[] = {A0};                  // ESP8266'da yalnızca A0 analog pin
const int numOutputs = sizeof(outputPins) / sizeof(outputPins[0]);
const int numInputs = sizeof(inputPins) / sizeof(inputPins[0]);
