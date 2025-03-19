// API İletişim Servisi
export class ApiService {
  constructor() {
    this.baseUrl = window.location.origin;
  }

  // Sistem durumunu ve pin bilgilerini al
  async getPins() {
    try {
      const response = await fetch(`${this.baseUrl}/api/pins`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error("API hatası (getPins):", error);
      throw error;
    }
  }

  // Pin durumunu değiştir
  async setPin(pin, state) {
    try {
      const response = await fetch(
        `${this.baseUrl}/api/pin/${pin}?state=${state}`,
        {
          method: "GET", // ESP8266 için GET kullanıyoruz
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(
        `API hatası (setPin - pin: ${pin}, state: ${state}):`,
        error
      );
      throw error;
    }
  }

  // WiFi ayarlarını kaydet (bu fonksiyon henüz backend tarafında uygulanmadı)
  async saveWifiSettings(settings) {
    try {
      const response = await fetch(`${this.baseUrl}/api/settings/wifi`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API hatası (saveWifiSettings):", error);
      throw error;
    }
  }

  // Cihaz ayarlarını kaydet (bu fonksiyon henüz backend tarafında uygulanmadı)
  async saveDeviceSettings(settings) {
    try {
      const response = await fetch(`${this.baseUrl}/api/settings/device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("API hatası (saveDeviceSettings):", error);
      throw error;
    }
  }
}
