// Giriş kontrollerini oluştur
function createInputControls() {
  const inputReadings = document.getElementById("inputReadings");
  if (!inputReadings) return;
  
  inputReadings.innerHTML = "";

  inputPins.forEach((pin) => {
    const pinReading = document.createElement("div");
    pinReading.className = "pin-control";
    pinReading.innerHTML = `
            <h3>${pinNames[pin] || `Pin ${pin}`}</h3>
            <div class="readings">
                <div id="value-${pin}" class="reading-value">Yükleniyor...</div>
            </div>
        `;
    inputReadings.appendChild(pinReading);
  });
}

// Pin durumunu değiştir
function togglePin(pin, state) {
  fetch(`/api/pin/${pin}?state=${state ? 1 : 0}`)
    .then((response) => response.json())
    .then((data) => {
      console.log(
        `${pinNames[pin] || `Pin ${pin}`} set to ${state ? "ON" : "OFF"}`
      );
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Mevcut pin durumlarını al
function getPinStates() {
  fetch("/api/pins")
    .then((response) => response.json())
    .then((data) => {
      // Çıkış pinleri durumlarını güncelle
      data.outputs.forEach((item) => {
        const pin = item.pin;
        const state = item.state === 1;
        const checkbox = document.querySelector(
          `input[type="checkbox"][onchange*="togglePin(${pin}"]`
        );
        if (checkbox) {
          checkbox.checked = state;
        }
      });

      // Giriş pinleri değerlerini güncelle
      data.inputs.forEach((item) => {
        const pin = item.pin;
        const value = item.value;
        const valueElement = document.getElementById(`value-${pin}`);
        if (valueElement) {
          valueElement.textContent = `Değer: ${value}`;
        }
      });
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// Dashboard'u yenile
function refreshDashboard() {
  const refreshButton = document.querySelector(".refresh-btn i");
  if (refreshButton) {
    refreshButton.classList.add("rotating");
  }

  fetch("/api/pins")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      updateDeviceInfo(data);
      updateSystemInfo(data);
      renderOutputPins(data.outputs);
      updateInputPins(data.inputs);
      updateConnectionStatus(true);
    })
    .catch((error) => {
      console.error("Veri alma hatası:", error);
      updateConnectionStatus(false);
    })
    .finally(() => {
      // Döndürme animasyonunu durdur
      setTimeout(() => {
        if (refreshButton) {
          refreshButton.classList.remove("rotating");
        }
      }, 500);
    });
}

// Bağlantı durumunu güncelle
function updateConnectionStatus(isConnected) {
  const statusDot = document.getElementById("status-dot");
  const statusText = document.getElementById("status-text");

  if (!statusDot || !statusText) return;

  if (isConnected) {
    statusDot.classList.add("online");
    statusText.textContent = "Çevrimiçi";
  } else {
    statusDot.classList.remove("online");
    statusText.textContent = "Bağlantı bekleniyor...";
  }
}

// Cihaz bilgilerini güncelle
function updateDeviceInfo(data) {
  const deviceName = document.getElementById("device-name");
  const deviceIP = document.getElementById("device-ip");

  if (!deviceName || !deviceIP) return;

  if (data.device) {
    deviceName.textContent = data.device;
  }

  // IP adresini göster (STA bağlıysa STA IP'sini, değilse AP IP'sini göster)
  if (data.sta_connected && data.sta_ip) {
    deviceIP.textContent = `${data.sta_ip} (WiFi) / ${data.ap_ip} (AP)`;
  } else if (data.ap_ip) {
    deviceIP.textContent = `${data.ap_ip} (AP)`;
  }
}

// Sistem bilgilerini güncelle
function updateSystemInfo(data) {
  // Çalışma süresi
  const uptimeElement = document.getElementById("uptime");
  if (uptimeElement && data.uptime !== undefined) {
    uptimeElement.textContent = formatUptime(data.uptime);
  }

  // Boş bellek
  const memoryElement = document.getElementById("free-memory");
  if (memoryElement && data.heap !== undefined) {
    memoryElement.textContent = formatBytes(data.heap);
  }

  // WiFi adı - STA bağlıysa STA WiFi adını, değilse AP adını göster
  const wifiElement = document.getElementById("wifi-ssid");
  if (wifiElement) {
    if (data.sta_connected && data.sta_ssid) {
      wifiElement.textContent = `${data.sta_ssid} (WiFi) / ${data.ap_ssid} (AP)`;

      // WiFi sinyal gücünü göster (varsa)
      if (data.rssi) {
        wifiElement.textContent += ` [${data.rssi} dBm]`;
      }
    } else if (data.ap_ssid) {
      wifiElement.textContent = `${data.ap_ssid} (AP)`;
    }
  }

  // Chip ID
  const chipIdElement = document.getElementById("chip-id");
  if (chipIdElement && data.chipId !== undefined) {
    chipIdElement.textContent = data.chipId;
  }
}

// Çıkış pinlerini göster
function renderOutputPins(outputs) {
  const outputContainer = document.getElementById("outputPins");
  
  if (!outputContainer) {
    console.error("outputPins elemanı bulunamadı!");
    return;
  }

  // İlk defa çağrıldıysa, pinleri oluştur
  if (outputContainer.children.length === 0) {
    // Henüz API'den veri alamadıysak, en azından temel pin listesini kullan
    const pinsToRender = outputs.length > 0 ? outputs : outputPins.map(pin => ({
      pin: pin,
      name: pinNames[pin] || `Pin ${pin}`,
      state: 0
    }));
    
    pinsToRender.forEach((output) => {
      const pin = output.pin;
      const name = output.name || pinNames[pin] || `Pin ${pin}`;

      const pinCard = document.createElement("div");
      pinCard.className = "pin-card";
      pinCard.innerHTML = `
        <div class="pin-card-header">
          <h3>${name}</h3>
          <span class="pin-number">Pin ${pin}</span>
        </div>
        <div class="pin-card-body">
          <label class="pin-switch">
            <input type="checkbox" data-pin="${pin}" onchange="togglePin(${pin}, this.checked)">
            <span class="pin-slider"></span>
          </label>
        </div>
      `;
      outputContainer.appendChild(pinCard);
    });
  }

  // Pin durumlarını güncelle - outputs dizisi boş değilse
  if (outputs.length > 0) {
    outputs.forEach((output) => {
      const pin = output.pin;
      const state = output.state === 1;
      const checkbox = document.querySelector(`input[data-pin="${pin}"]`);
      if (checkbox) {
        checkbox.checked = state;
      }
    });
  }
}

// Giriş pinlerini güncelle
function updateInputPins(inputs) {
  inputs.forEach((input) => {
    const pin = input.pin;
    const value = input.value;
    const valueElement = document.getElementById(`value-${pin}`);

    if (valueElement) {
      valueElement.textContent = `Değer: ${value}`;
    }

    // Analog pin için değer çubuğunu güncelle
    if (pin === 17) {
      // A0 pin
      const meterElement = document.getElementById("analog-meter");
      if (meterElement) {
        // ESP8266 ADC 0-1023 arasında değer üretir
        const percentage = (value / 1023) * 100;
        meterElement.style.width = `${percentage}%`;
      }
    }
  });
}
