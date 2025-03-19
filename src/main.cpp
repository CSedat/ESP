#include <Arduino.h>
#include "config.h"
#include "fileSystem.h"
#include "wifiManager.h"
#include "pins.h"
#include "webServer.h"

void setup() {
  Serial.begin(9600);
  delay(500);
  Serial.println("\n\nESP8266 IoT Dashboard başlatılıyor...");

  // Dosya sistemini başlat
  setupFileSystem();

  // Pinleri ayarla
  setupPins();

  // WiFi bağlantısını kur (hem AP hem STA modunda)
  setupWiFi();

  // Web server'ı başlat
  setupWebServer();
}

void loop() {
  getServer().handleClient();
  checkWiFiConnection(); // WiFi bağlantı durumunu kontrol et
}
