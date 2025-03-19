#include "wifiManager.h"
#include "config.h"

// STA modu bağlantı durumu
bool sta_connected = false;

// WiFi bağlantısını kurma (STA modu)
void setupWiFi() {
  // AP modunu başlat (her zaman çalışır)
  WiFi.softAP(ap_ssid, ap_password);
  IPAddress AP_IP = WiFi.softAPIP();
  Serial.print("AP IP adresi: ");
  Serial.println(AP_IP);
  Serial.println("AP modu başlatıldı");

  // STA modunu başlat (WiFi ağına bağlan)
  Serial.println("WiFi ağına bağlanılıyor...");
  WiFi.mode(WIFI_AP_STA); // Hem AP hem STA modunu etkinleştir
  WiFi.begin(wifi_ssid, wifi_password);

  // İlk kurulumda kısa bir bekleme yapalım
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 10) {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    sta_connected = true;
    Serial.println("");
    Serial.print("WiFi ağına bağlandı: ");
    Serial.println(wifi_ssid);
    Serial.print("IP adresi: ");
    Serial.println(WiFi.localIP());
  } else {
    sta_connected = false;
    Serial.println("");
    Serial.println("İlk bağlantı denemesi başarısız, arka planda yeniden denenecek...");
    Serial.println("Şu an sadece AP modunda çalışılıyor.");
  }

  // AP modunun bağlantı bilgilerini göster (her zaman mevcut)
  Serial.println("-----------------------------");
  Serial.println("Bağlantı Bilgileri:");
  Serial.print("* AP Modu: ");
  Serial.print(ap_ssid);
  Serial.print(" (");
  Serial.print(WiFi.softAPIP());
  Serial.println(")");

  if (sta_connected) {
    Serial.print("* STA Modu: ");
    Serial.print(wifi_ssid);
    Serial.print(" (");
    Serial.print(WiFi.localIP());
    Serial.println(")");
  }
}

// WiFi bağlantı durumunu düzenli olarak kontrol et
void checkWiFiConnection() {
  static unsigned long lastCheck = 0;
  unsigned long currentMillis = millis();

  // Bağlantı kontrolü için daha kısa süre - her 10 saniyede bir
  if (currentMillis - lastCheck >= 10000) {
    lastCheck = currentMillis;

    if (WiFi.status() != WL_CONNECTED) {
      if (sta_connected) {
        Serial.println("WiFi bağlantısı kesildi! Yeniden bağlanmaya çalışılıyor...");
        sta_connected = false;
      } else {
        // Daha önce bağlantı yoksa sessizce yeniden dene
        static unsigned long reconnectCounter = 0;
        reconnectCounter++;
        
        // Her 6 denemede bir log yazdır (yaklaşık 1 dakikada bir)
        if (reconnectCounter % 6 == 0) {
          Serial.print("WiFi bağlantısı yeniden deneniyor (deneme ");
          Serial.print(reconnectCounter);
          Serial.println(")");
        }
      }

      // Yeniden bağlanmayı dene
      WiFi.begin(wifi_ssid, wifi_password);

      // Kısa süre bekle (500ms) - bu süre loop'un çalışmasını engellemeyecek kadar kısa
      delay(500);

      // Bağlantı durumunu kontrol et
      if (WiFi.status() == WL_CONNECTED) {
        sta_connected = true;
        Serial.println("WiFi ağına bağlandı!");
        Serial.print("IP adresi: ");
        Serial.println(WiFi.localIP());
      }
    } else if (!sta_connected) {
      // Bağlantı varsa ama sta_connected değişkeni false ise güncelle
      // (Bu durum nadiren oluşabilir)
      sta_connected = true;
      Serial.println("WiFi bağlantısı tespit edildi!");
      Serial.print("IP adresi: ");
      Serial.println(WiFi.localIP());
    }
  }
}

// Bağlantı durumunu döndür
bool isStaConnected() {
  return sta_connected;
}

// Ağ bilgilerini döndür
IPAddress getStaIP() {
  return WiFi.localIP();
}

IPAddress getApIP() {
  return WiFi.softAPIP();
}
