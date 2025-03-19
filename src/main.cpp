#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ArduinoJson.h>
#include <LittleFS.h>

// WiFi ağ bilgileri - Access Point (AP) modu
const char *ap_ssid = "ESP_Dashboard";
const char *ap_password = "12345678";

// WiFi ağ bilgileri - Station (STA) modu
// BURAYA AĞINIZIN BİLGİLERİNİ GİRİN
const char *wifi_ssid = "CSedat iPhone";  // WiFi ağınızın adı
const char *wifi_password = "Sadoqwe.."; // WiFi şifreniz
const int max_connection_attempts = 20;     // Maksimum bağlantı deneme sayısı

// Pin tanımlamaları - ESP8266 için uygun pinler
const int outputPins[] = {D1, D2, D3, D4, D5}; // Kontrol edilebilen çıkış pinleri
const int inputPins[] = {A0};                  // ESP8266'da yalnızca A0 analog pin
const int numOutputs = sizeof(outputPins) / sizeof(outputPins[0]);
const int numInputs = sizeof(inputPins) / sizeof(inputPins[0]);

// Web sunucusu başlat (ESP8266 için)
ESP8266WebServer server(80);

// STA modu bağlantı durumu
bool sta_connected = false;

// Dosya türüne göre MIME tipini döndür
String getContentType(String filename)
{
  if (filename.endsWith(".html"))
    return "text/html";
  else if (filename.endsWith(".css"))
    return "text/css";
  else if (filename.endsWith(".js"))
    return "application/javascript";
  else if (filename.endsWith(".json"))
    return "application/json";
  else if (filename.endsWith(".ico"))
    return "image/x-icon";
  else if (filename.endsWith(".png"))
    return "image/png";
  else if (filename.endsWith(".jpg"))
    return "image/jpeg";
  else if (filename.endsWith(".svg"))
    return "image/svg+xml";
  else if (filename.endsWith(".ttf"))
    return "application/x-font-ttf";
  else if (filename.endsWith(".woff"))
    return "application/font-woff";
  else if (filename.endsWith(".woff2"))
    return "application/font-woff2";
  return "text/plain";
}

// Dosya sistemi üzerinden dosya gönderme
bool handleFileRead(String path)
{
  Serial.println("Dosya isteniyor: " + path);

  // Kök dizin için index.html'i varsayılan olarak kullan
  if (path.endsWith("/"))
    path += "index.html";

  // Dosya türünü belirle
  String contentType = getContentType(path);

  // LittleFS formatındaki yolu düzelt (başında / varsa sil)
  String fsPath = path;
  if (fsPath.startsWith("/"))
  {
    fsPath = fsPath.substring(1);
  }

  // Dosya var mı kontrol et ve gönder
  if (LittleFS.exists(fsPath))
  {
    File file = LittleFS.open(fsPath, "r");
    if (!file)
    {
      Serial.println("Dosya açılamadı!");
      return false;
    }
    size_t sent = server.streamFile(file, contentType);
    file.close();
    return true;
  }
  else
  {
    Serial.println("Dosya bulunamadı: " + fsPath);
    return false;
  }
}

// API - Pin durumlarını al
void handleGetPins()
{
  DynamicJsonDocument doc(1024);

  JsonArray outputs = doc.createNestedArray("outputs");
  for (int i = 0; i < numOutputs; i++)
  {
    JsonObject pinObj = outputs.createNestedObject();
    pinObj["pin"] = outputPins[i];
    pinObj["state"] = digitalRead(outputPins[i]);
    pinObj["name"] = String("D") + String(i + 1); // D1, D2, vs.
  }

  JsonArray inputs = doc.createNestedArray("inputs");
  for (int i = 0; i < numInputs; i++)
  {
    JsonObject pinObj = inputs.createNestedObject();
    pinObj["pin"] = inputPins[i];
    pinObj["value"] = analogRead(inputPins[i]);
    pinObj["name"] = "A0";
  }

  // ESP bilgilerini ekleyelim
  doc["device"] = "ESP8266";
  doc["ap_ip"] = WiFi.softAPIP().toString();
  doc["ap_ssid"] = ap_ssid;

  // STA modu bilgileri
  doc["sta_connected"] = sta_connected;
  if (sta_connected)
  {
    doc["sta_ip"] = WiFi.localIP().toString();
    doc["sta_ssid"] = wifi_ssid;
    doc["rssi"] = WiFi.RSSI(); // Sinyal gücü
  }

  doc["uptime"] = millis() / 1000; // Çalışma süresi (saniye)
  doc["heap"] = ESP.getFreeHeap(); // Boş bellek
  doc["chipId"] = ESP.getChipId(); // ESP chip ID

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

// API - Pin durumunu değiştir
void handleSetPin()
{
  if (!server.hasArg("state"))
  {
    server.send(400, "text/plain", "State parameter missing");
    return;
  }

  int pin = atoi(server.uri().substring(9).c_str());
  int state = server.arg("state").toInt();

  // Pin kontrolü
  boolean validPin = false;
  for (int i = 0; i < numOutputs; i++)
  {
    if (outputPins[i] == pin)
    {
      validPin = true;
      break;
    }
  }

  if (!validPin)
  {
    server.send(400, "text/plain", "Invalid pin");
    return;
  }

  digitalWrite(pin, state);

  DynamicJsonDocument doc(128);
  doc["pin"] = pin;
  doc["state"] = state;
  doc["success"] = true;

  String response;
  serializeJson(doc, response);
  server.send(200, "application/json", response);
}

// Dosya sistemini yükle ve içeriği kontrol et
void setupFileSystem()
{
  if (!LittleFS.begin())
  {
    Serial.println("HATA: Dosya sistemi başlatılamadı!");
    Serial.println("Dosya sistemini formatlamayı deniyorum...");
    if (LittleFS.format())
    {
      Serial.println("Dosya sistemi başarıyla formatlandı");
      if (!LittleFS.begin())
      {
        Serial.println("Formatlama işe yaramadı, yükleme gerekli");
        return;
      }
    }
    else
    {
      Serial.println("Formatlama başarısız oldu, yükleme gerekli");
      return;
    }
  }

  Serial.println("Dosya sistemi başarıyla başlatıldı");

  // Dosya sistemi içeriğini listele
  Serial.println("\nDosya sistemi içeriği:");
  Dir dir = LittleFS.openDir("/");
  bool anyFiles = false;
  while (dir.next())
  {
    anyFiles = true;
    String fileName = dir.fileName();
    size_t fileSize = dir.fileSize();
    Serial.printf("  %s, %u bytes\n", fileName.c_str(), fileSize);
  }

  if (!anyFiles)
  {
    Serial.println("  UYARI: Hiç dosya bulunamadı!");
    Serial.println("  Dosya sistemine veri yüklemeniz gerekiyor: pio run --target uploadfs");
  }
}

// WiFi bağlantısını kurma (STA modu)
void setupWiFi()
{
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

  // Bağlantı için bekle
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < max_connection_attempts)
  {
    delay(500);
    Serial.print(".");
    attempts++;
  }

  if (WiFi.status() == WL_CONNECTED)
  {
    sta_connected = true;
    Serial.println("");
    Serial.print("WiFi ağına bağlandı: ");
    Serial.println(wifi_ssid);
    Serial.print("IP adresi: ");
    Serial.println(WiFi.localIP());
  }
  else
  {
    sta_connected = false;
    Serial.println("");
    Serial.println("WiFi ağına bağlantı başarısız!");
    Serial.println("Sadece AP modunda çalışılıyor.");
  }

  Serial.println("-----------------------------");
  Serial.println("Bağlantı Bilgileri:");
  Serial.print("* AP Modu: ");
  Serial.print(ap_ssid);
  Serial.print(" (");
  Serial.print(WiFi.softAPIP());
  Serial.println(")");

  if (sta_connected)
  {
    Serial.print("* STA Modu: ");
    Serial.print(wifi_ssid);
    Serial.print(" (");
    Serial.print(WiFi.localIP());
    Serial.println(")");
  }
}

// WiFi bağlantı durumunu düzenli olarak kontrol et
void checkWiFiConnection()
{
  static unsigned long lastCheck = 0;
  unsigned long currentMillis = millis();

  // Her 30 saniyede bir kontrol et
  if (currentMillis - lastCheck >= 30000)
  {
    lastCheck = currentMillis;

    if (WiFi.status() != WL_CONNECTED)
    {
      if (sta_connected)
      {
        Serial.println("WiFi bağlantısı kesildi! Yeniden bağlanmaya çalışılıyor...");
        sta_connected = false;
      }

      // Yeniden bağlanmayı dene
      WiFi.begin(wifi_ssid, wifi_password);

      // Kısa süre bekle
      delay(5000);

      // Bağlantı durumunu kontrol et
      if (WiFi.status() == WL_CONNECTED)
      {
        sta_connected = true;
        Serial.println("WiFi ağına yeniden bağlandı.");
        Serial.print("IP adresi: ");
        Serial.println(WiFi.localIP());
      }
    }
  }
}

void setup()
{
  Serial.begin(9600);
  delay(500);
  Serial.println("\n\nESP8266 IoT Dashboard başlatılıyor...");

  // Dosya sistemini başlat
  setupFileSystem();

  // Pinleri ayarla
  for (int i = 0; i < numOutputs; i++)
  {
    pinMode(outputPins[i], OUTPUT);
    digitalWrite(outputPins[i], LOW);
  }

  for (int i = 0; i < numInputs; i++)
  {
    pinMode(inputPins[i], INPUT);
  }

  // WiFi bağlantısını kur (hem AP hem STA modunda)
  setupWiFi();

  // Ana sayfa ve API endpoint'lerini tanımla
  server.on("/api/pins", HTTP_GET, handleGetPins);

  // /api/pin/X formatındaki tüm istekleri yakalamak için
  server.onNotFound([]()
                    {
    String path = server.uri();
    if (path.indexOf("/api/pin/") == 0 && path.length() > 9) {
      handleSetPin();
    } else if (!handleFileRead(path)) {
      server.send(404, "text/plain", "Dosya bulunamadı: " + path);
    } });

  // Web server'ı başlat
  server.begin();
  Serial.println("HTTP server başlatıldı");
  Serial.println("-----------------------------");
  Serial.println("Erişim bilgileri:");
  Serial.print("* AP modu: ");
  Serial.print(ap_ssid);
  Serial.println(" / 12345678");
  Serial.print("  AP IP: http://");
  Serial.println(WiFi.softAPIP());

  if (sta_connected)
  {
    Serial.print("* STA modu: ");
    Serial.print("  STA IP: http://");
    Serial.println(WiFi.localIP());
  }
}

void loop()
{
  server.handleClient();
  checkWiFiConnection(); // WiFi bağlantı durumunu kontrol et
}
