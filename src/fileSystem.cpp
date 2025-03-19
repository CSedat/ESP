#include "fileSystem.h"
#include "webServer.h"

// Dosya sistemini yükle ve içeriği kontrol et
void setupFileSystem() {
  if (!LittleFS.begin()) {
    Serial.println("HATA: Dosya sistemi başlatılamadı!");
    Serial.println("Dosya sistemini formatlamayı deniyorum...");
    if (LittleFS.format()) {
      Serial.println("Dosya sistemi başarıyla formatlandı");
      if (!LittleFS.begin()) {
        Serial.println("Formatlama işe yaramadı, yükleme gerekli");
        return;
      }
    } else {
      Serial.println("Formatlama başarısız oldu, yükleme gerekli");
      return;
    }
  }

  Serial.println("Dosya sistemi başarıyla başlatıldı");

  // Dosya sistemi içeriğini listele
  Serial.println("\nDosya sistemi içeriği:");
  Dir dir = LittleFS.openDir("/");
  bool anyFiles = false;
  while (dir.next()) {
    anyFiles = true;
    String fileName = dir.fileName();
    size_t fileSize = dir.fileSize();
    Serial.printf("  %s, %u bytes\n", fileName.c_str(), fileSize);
  }

  if (!anyFiles) {
    Serial.println("  UYARI: Hiç dosya bulunamadı!");
    Serial.println("  Dosya sistemine veri yüklemeniz gerekiyor: pio run --target uploadfs");
  }
}

// Dosya türüne göre MIME tipini döndür
String getContentType(String filename) {
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".css")) return "text/css";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".json")) return "application/json";
  else if (filename.endsWith(".ico")) return "image/x-icon";
  else if (filename.endsWith(".png")) return "image/png";
  else if (filename.endsWith(".jpg")) return "image/jpeg";
  else if (filename.endsWith(".svg")) return "image/svg+xml";
  else if (filename.endsWith(".ttf")) return "application/x-font-ttf";
  else if (filename.endsWith(".woff")) return "application/font-woff";
  else if (filename.endsWith(".woff2")) return "application/font-woff2";
  return "text/plain";
}

// Dosya sistemi üzerinden dosya gönderme
bool handleFileRead(String path) {
  Serial.println("Dosya isteniyor: " + path);

  // Kök dizin için index.html'i varsayılan olarak kullan
  if (path.endsWith("/"))
    path += "index.html";

  // Dosya türünü belirle
  String contentType = getContentType(path);

  // LittleFS formatındaki yolu düzelt (başında / varsa sil)
  String fsPath = path;
  if (fsPath.startsWith("/")) {
    fsPath = fsPath.substring(1);
  }

  // Dosya var mı kontrol et ve gönder
  if (LittleFS.exists(fsPath)) {
    File file = LittleFS.open(fsPath, "r");
    if (!file) {
      Serial.println("Dosya açılamadı!");
      return false;
    }
    getServer().streamFile(file, contentType);
    file.close();
    return true;
  } else {
    Serial.println("Dosya bulunamadı: " + fsPath);
    return false;
  }
}
