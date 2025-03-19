// Sistem Bilgileri Modülü
export class SystemInfo {
  constructor(apiService) {
    this.api = apiService;

    // DOM elementlerine referanslar
    this.elements = {
      connectionStatus: document
        .getElementById("connection-status")
        .querySelector(".status-value"),
      ipAddress: document
        .getElementById("ip-address")
        .querySelector(".status-value"),
      uptime: document.getElementById("uptime").querySelector(".status-value"),
      deviceName: document.getElementById("device-name"),
      apSsid: document.getElementById("ap-ssid"),
      apIp: document.getElementById("ap-ip"),
      staSsid: document.getElementById("sta-ssid"),
      staIp: document.getElementById("sta-ip"),
      wifiSignal: document.getElementById("wifi-signal"),
      freeHeap: document.getElementById("free-heap"),
      chipId: document.getElementById("chip-id"),
    };
  }

  // İlk yükleme
  async loadSystemInfo() {
    try {
      const data = await this.api.getPins();
      this.updateDisplay(data);
    } catch (error) {
      console.error("Sistem bilgileri yüklenirken hata oluştu:", error);
      this.setErrorState();
    }
  }

  // Düzenli güncelleme
  async updateSystemInfo() {
    try {
      const data = await this.api.getPins();
      this.updateDisplay(data);
    } catch (error) {
      console.error("Sistem bilgileri güncellenirken hata oluştu:", error);
      this.setErrorState();
    }
  }

  // Verileri ekranda güncelleme
  updateDisplay(data) {
    // Status bar güncelleme
    if (data.sta_connected) {
      this.elements.connectionStatus.textContent = "Bağlı (WiFi)";
      this.elements.connectionStatus.classList.add("text-success");
      this.elements.ipAddress.textContent = data.sta_ip;
    } else {
      this.elements.connectionStatus.textContent = "AP Modu";
      this.elements.connectionStatus.classList.remove("text-success");
      this.elements.ipAddress.textContent = data.ap_ip;
    }

    // Çalışma süresini formatlama
    const uptime = this.formatUptime(data.uptime);
    this.elements.uptime.textContent = uptime;

    // Sistem bilgilerini güncelleme
    this.elements.deviceName.textContent = data.device;
    this.elements.apSsid.textContent = data.ap_ssid;
    this.elements.apIp.textContent = data.ap_ip;

    if (data.sta_connected) {
      this.elements.staSsid.textContent = data.sta_ssid;
      this.elements.staIp.textContent = data.sta_ip;
      this.elements.wifiSignal.textContent = `${data.rssi} dBm`;
    } else {
      this.elements.staSsid.textContent = "Bağlı değil";
      this.elements.staIp.textContent = "-";
      this.elements.wifiSignal.textContent = "-";
    }

    // Bellek ve Chip ID bilgileri
    this.elements.freeHeap.textContent = `${this.formatBytes(data.heap)}`;
    this.elements.chipId.textContent = data.chipId;
  }

  // Çalışma süresini formatlama
  formatUptime(seconds) {
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= 24 * 3600;
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds %= 60;

    let result = "";
    if (days > 0) result += `${days} gün `;
    if (hours > 0) result += `${hours} saat `;
    if (minutes > 0) result += `${minutes} dakika `;
    result += `${seconds} saniye`;

    return result;
  }

  // Bayt formatını düzenleme
  formatBytes(bytes) {
    if (bytes < 1024) return bytes + " byte";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  }

  // Hata durumunda gösterge
  setErrorState() {
    this.elements.connectionStatus.textContent = "Bağlantı hatası";
    this.elements.connectionStatus.classList.add("text-danger");

    // Diğer elementleri "-" ile işaretle
    for (const key in this.elements) {
      if (key !== "connectionStatus" && this.elements[key]) {
        this.elements[key].textContent = "-";
      }
    }
  }
}
