#include "apiHandlers.h"
#include "webServer.h"
#include "config.h"
#include "pins.h"
#include "wifiManager.h"
#include "fileSystem.h"
#include <ArduinoJson.h>
#include <ESP8266WiFi.h>

// API - Pin durumlarını al
void handleGetPins() {
  DynamicJsonDocument doc(1024);

  JsonArray outputs = doc.createNestedArray("outputs");
  for (int i = 0; i < numOutputs; i++) {
    JsonObject pinObj = outputs.createNestedObject();
    pinObj["pin"] = outputPins[i];
    pinObj["state"] = getPinState(outputPins[i]);
    pinObj["name"] = String("D") + String(i + 1); // D1, D2, vs.
  }

  JsonArray inputs = doc.createNestedArray("inputs");
  for (int i = 0; i < numInputs; i++) {
    JsonObject pinObj = inputs.createNestedObject();
    pinObj["pin"] = inputPins[i];
    pinObj["value"] = getAnalogValue(inputPins[i]);
    pinObj["name"] = "A0";
  }

  // ESP bilgilerini ekleyelim
  doc["device"] = "ESP8266";
  doc["ap_ip"] = getApIP().toString();
  doc["ap_ssid"] = ap_ssid;

  // STA modu bilgileri
  doc["sta_connected"] = isStaConnected();
  if (isStaConnected()) {
    doc["sta_ip"] = getStaIP().toString();
    doc["sta_ssid"] = wifi_ssid;
    doc["rssi"] = WiFi.RSSI(); // Sinyal gücü
  }

  doc["uptime"] = millis() / 1000; // Çalışma süresi (saniye)
  doc["heap"] = ESP.getFreeHeap(); // Boş bellek
  doc["chipId"] = ESP.getChipId(); // ESP chip ID

  String response;
  serializeJson(doc, response);
  getServer().send(200, "application/json", response);
}

// API - Pin durumunu değiştir
void handleSetPin() {
  ESP8266WebServer& server = getServer();
  
  if (!server.hasArg("state")) {
    server.send(400, "text/plain", "State parameter missing");
    return;
  }

  int pin = atoi(server.uri().substring(9).c_str());
  int state = server.arg("state").toInt();

  // Pin kontrolü ve değiştirme
  if (!isValidOutputPin(pin)) {
    server.send(400, "text/plain", "Invalid pin");
    return;
  }

  setPinState(pin, state);

  DynamicJsonDocument doc(128);
  doc["pin"] = pin;
  doc["state"] = state;
  doc["success"] = true;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

// API rotalarını ayarla
void setupApiRoutes() {
  ESP8266WebServer& server = getServer();
  
  // Ana sayfa ve API endpoint'lerini tanımla
  server.on("/api/pins", HTTP_GET, handleGetPins);

  // /api/pin/X formatındaki tüm istekleri yakalamak için
  server.onNotFound([]() {
    String path = getServer().uri();
    if (path.indexOf("/api/pin/") == 0 && path.length() > 9) {
      handleSetPin();
    } else if (!handleFileRead(path)) {
      getServer().send(404, "text/plain", "Dosya bulunamadı: " + path);
    }
  });
}
