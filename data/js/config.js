// Çıkış pinlerini tanımla - ESP8266 pin numaraları
const outputPins = [5, 4, 0, 2, 14]; // D1, D2, D3, D4, D5
// Giriş pinlerini tanımla - ESP8266'da sadece A0
const inputPins = [17]; // A0

// Pin isimlerini tanımla
const pinNames = {
  5: "D1",
  4: "D2",
  0: "D3",
  2: "D4",
  14: "D5",
  17: "A0",
};

// Sistem güncelleme ayarları
const REFRESH_INTERVAL = 1000; // 1 saniye
