#ifndef WIFI_MANAGER_H
#define WIFI_MANAGER_H

#include <Arduino.h>
#include <ESP8266WiFi.h>

// WiFi bağlantısını kur ve yönet
void setupWiFi();

// WiFi bağlantı durumunu kontrol et
void checkWiFiConnection();

// Bağlantı durumunu döndür
bool isStaConnected();

// Ağ bilgilerini döndür
IPAddress getStaIP();
IPAddress getApIP();

#endif // WIFI_MANAGER_H
