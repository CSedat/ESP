#ifndef WEB_SERVER_H
#define WEB_SERVER_H

#include <Arduino.h>
#include <ESP8266WebServer.h>

// Web sunucu başlatma
void setupWebServer();

// Server nesnesini döndür
ESP8266WebServer& getServer();

#endif // WEB_SERVER_H
