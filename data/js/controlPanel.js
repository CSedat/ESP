// Kontrol Paneli Modülü
export class ControlPanel {
  constructor(apiService) {
    this.api = apiService;
    this.controlsContainer = document.getElementById("controls-container");
    this.controlElements = {};
    this.pinStates = {};
  }

  // Kontrol panelini yükle
  async loadControls() {
    try {
      const data = await this.api.getPins();
      this.renderControls(data);
    } catch (error) {
      console.error("Kontroller yüklenirken hata oluştu:", error);
      this.showError(
        "Kontroller yüklenemedi. Lütfen bağlantınızı kontrol edin."
      );
    }
  }

  // Kontrolleri güncelle
  async updateControls() {
    try {
      const data = await this.api.getPins();
      this.updateControlStates(data);
    } catch (error) {
      console.error("Kontroller güncellenirken hata oluştu:", error);
    }
  }

  // Kontrolleri oluştur
  renderControls(data) {
    if (!this.controlsContainer) return;

    // Kontrol konteynırını temizle
    this.controlsContainer.innerHTML = "";

    // Çıkış pinlerini ekle (Switch kontrolü)
    if (data.outputs && data.outputs.length > 0) {
      const outputsTitle = document.createElement("h4");
      outputsTitle.textContent = "Dijital Çıkışlar";
      outputsTitle.className = "mb-3";
      this.controlsContainer.appendChild(outputsTitle);

      data.outputs.forEach((output) => {
        const controlId = `control-pin-${output.pin}`;

        // Kontrol grubu oluştur
        const controlGroup = document.createElement("div");
        controlGroup.className = "control-group";

        // Etiket oluştur
        const label = document.createElement("span");
        label.className = "control-label";
        label.textContent = output.name || `Pin ${output.pin}`;

        // Switch oluştur
        const switchLabel = document.createElement("label");
        switchLabel.className = "switch";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = controlId;
        checkbox.checked = output.state === 1;

        // Pin durumunu kaydet
        this.pinStates[output.pin] = output.state;

        // Slider oluştur
        const slider = document.createElement("span");
        slider.className = "slider";

        // Switch'e olayları ekle
        checkbox.addEventListener("change", () =>
          this.handlePinToggle(output.pin, checkbox.checked ? 1 : 0)
        );

        // Elementleri bir araya getir
        switchLabel.appendChild(checkbox);
        switchLabel.appendChild(slider);

        controlGroup.appendChild(label);
        controlGroup.appendChild(switchLabel);

        // DOM referansını sakla
        this.controlElements[output.pin] = checkbox;

        // Kontrol konteynırına ekle
        this.controlsContainer.appendChild(controlGroup);
      });
    }

    // Giriş pinlerini ekle (Gauge kontrolü)
    if (data.inputs && data.inputs.length > 0) {
      const inputTitle = document.createElement("h4");
      inputTitle.textContent = "Analog Girişler";
      inputTitle.className = "mb-3 mt-4";
      this.controlsContainer.appendChild(inputTitle);

      data.inputs.forEach((input) => {
        const gaugeId = `gauge-pin-${input.pin}`;

        // Kontrol grubu oluştur
        const gaugeGroup = document.createElement("div");
        gaugeGroup.className = "gauge mt-3";

        // Gauge başlığı
        const gaugeLabel = document.createElement("div");
        gaugeLabel.className = "gauge-label";
        gaugeLabel.textContent = input.name || `Pin ${input.pin}`;

        // Gauge konteynırı
        const gaugeContainer = document.createElement("div");
        gaugeContainer.className = "gauge-container";

        // Gauge arkaplanı
        const gaugeBackground = document.createElement("div");
        gaugeBackground.className = "gauge-background";

        // Gauge dolgusu
        const gaugeFill = document.createElement("div");
        gaugeFill.className = "gauge-fill";
        gaugeFill.id = gaugeId;

        // 0-1023 aralığındaki değeri 0-180 derece aralığına dönüştür (ESP8266 ADC için)
        const percentage = Math.min(input.value / 1023, 1);
        const degrees = percentage * 180;
        gaugeFill.style.transform = `rotate(${degrees}deg)`;

        // Gauge merkezi
        const gaugeCenter = document.createElement("div");
        gaugeCenter.className = "gauge-center";

        // Gauge değeri
        const gaugeValue = document.createElement("div");
        gaugeValue.className = "gauge-value";
        gaugeValue.id = `${gaugeId}-value`;
        gaugeValue.textContent = input.value;

        // Elementleri bir araya getir
        gaugeContainer.appendChild(gaugeBackground);
        gaugeContainer.appendChild(gaugeFill);
        gaugeContainer.appendChild(gaugeCenter);
        gaugeContainer.appendChild(gaugeValue);

        gaugeGroup.appendChild(gaugeContainer);
        gaugeGroup.appendChild(gaugeLabel);

        // DOM referansını sakla
        this.controlElements[`${input.pin}-gauge`] = gaugeFill;
        this.controlElements[`${input.pin}-value`] = gaugeValue;

        // Kontrol konteynırına ekle
        this.controlsContainer.appendChild(gaugeGroup);
      });
    }

    // Hiç kontrol yoksa bilgi ver
    if (!data.outputs?.length && !data.inputs?.length) {
      const noControls = document.createElement("p");
      noControls.textContent = "Yapılandırılmış kontrol yok.";
      this.controlsContainer.appendChild(noControls);
    }
  }

  // Kontrolleri güncelle
  updateControlStates(data) {
    // Çıkış pinleri
    if (data.outputs) {
      data.outputs.forEach((output) => {
        const checkbox = this.controlElements[output.pin];
        if (checkbox && this.pinStates[output.pin] !== output.state) {
          checkbox.checked = output.state === 1;
          this.pinStates[output.pin] = output.state;
        }
      });
    }

    // Giriş pinleri
    if (data.inputs) {
      data.inputs.forEach((input) => {
        const gauge = this.controlElements[`${input.pin}-gauge`];
        const valueElement = this.controlElements[`${input.pin}-value`];

        if (gauge) {
          // 0-1023 aralığındaki değeri 0-180 derece aralığına dönüştür
          const percentage = Math.min(input.value / 1023, 1);
          const degrees = percentage * 180;
          gauge.style.transform = `rotate(${degrees}deg)`;
        }

        if (valueElement) {
          valueElement.textContent = input.value;
        }
      });
    }
  }

  // Pin değişikliklerini işle
  async handlePinToggle(pin, state) {
    try {
      // UI hemen güncelle (daha hızlı yanıt vermek için)
      const checkbox = this.controlElements[pin];
      if (checkbox) {
        checkbox.disabled = true; // İşlem sırasında devre dışı bırak
      }

      // API çağrısını yap
      await this.api.setPin(pin, state);

      // İşlem başarılı, durumu kaydet
      this.pinStates[pin] = state;

      // Checkbox'ı etkinleştir
      if (checkbox) {
        checkbox.disabled = false;
      }
    } catch (error) {
      console.error(`Pin ${pin} durumu değiştirilirken hata oluştu:`, error);

      // Hata durumunda eski değere döndür
      if (checkbox) {
        checkbox.checked = this.pinStates[pin] === 1;
        checkbox.disabled = false;
      }

      // Hata mesajı göster
      this.showError(
        `Pin ${pin} durumu değiştirilemedi. Lütfen tekrar deneyin.`
      );
    }
  }

  // Hata mesajı göster
  showError(message) {
    if (!this.controlsContainer) return;

    const errorAlert = document.createElement("div");
    errorAlert.className = "alert alert-danger";
    errorAlert.textContent = message;

    // Varolan hata mesajlarını temizle
    const existingErrors =
      this.controlsContainer.querySelectorAll(".alert-danger");
    existingErrors.forEach((error) => error.remove());

    // Yeni hata mesajını ekle
    this.controlsContainer.prepend(errorAlert);

    // 5 saniye sonra hata mesajını kaldır
    setTimeout(() => {
      errorAlert.remove();
    }, 5000);
  }
}
