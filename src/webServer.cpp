#include "webServer.h"
#include "apiHandlers.h"
#include "wifiManager.h"
#include "config.h"  // ap_ssid değişkeni için bu satırı ekledim

// Web sunucusu
ESP8266WebServer server(80);

// Web sunucusunu başlat
void setupWebServer() {
  // API rotalarını ayarla
  setupApiRoutes();

  // Web server'ı başlat
  server.begin();
  Serial.println("HTTP server başlatıldı");
  Serial.println("-----------------------------");
  Serial.println("Erişim bilgileri:");
  Serial.print("* AP modu: ");
  Serial.print(ap_ssid);
  Serial.println(" / 12345678");
  Serial.print("  AP IP: http://");
  Serial.println(getApIP());

  if (isStaConnected()) {
    Serial.print("* STA modu: ");
    Serial.print("  STA IP: http://");
    Serial.println(getStaIP());
  }
}

// Server nesnesini döndür
ESP8266WebServer& getServer() {
  return server;
}
