// Tema değiştirme
function setupThemeToggle() {
  const themeSwitch = document.getElementById("theme-switch");
  if (!themeSwitch) return;

  themeSwitch.addEventListener("change", function () {
    if (this.checked) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  });

  // Kaydedilmiş tema tercihini kontrol et
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    themeSwitch.checked = true;
  }
}

// Pin bilgileri diyalog fonksiyonları
function openPinInfoDialog() {
  document.getElementById("pinInfoDialog").style.display = "block";
  document.body.style.overflow = "hidden"; // Sayfanın kaydırılmasını engelle
}

function closePinInfoDialog() {
  document.getElementById("pinInfoDialog").style.display = "none";
  document.body.style.overflow = ""; // Sayfanın kaydırılmasına izin ver
}

// Yardım Dialog fonksiyonları
function openHelpDialog() {
  document.getElementById("helpDialog").style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeHelpDialog() {
  document.getElementById("helpDialog").style.display = "none";
  document.body.style.overflow = "";
}

// Tab kontrol fonksiyonlarını ayarla
function setupTabListeners() {
  document.querySelectorAll(".tab-btn").forEach((button) => {
    button.addEventListener("click", function () {
      // İlgili sekme içeriğini bul
      const tabContentId = this.getAttribute("data-tab");

      // Butona bağlı dialog'u bul
      const dialog = this.closest(".dialog");

      if (!dialog) return; // Dialog bulunamazsa çık

      // Dialog içindeki tüm tab butonları ve içeriklerini seç
      const tabButtons = dialog.querySelectorAll(".tab-btn");
      const tabContents = dialog.querySelectorAll(".tab-content");

      // Tüm aktif sınıfları kaldır
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Tıklanan tab ve içerik için aktif sınıfı ekle
      this.classList.add("active");
      const contentElement = dialog.querySelector(`#${tabContentId}`);
      if (contentElement) {
        contentElement.classList.add("active");
      }
    });
  });
}

// Dialog kontrol fonksiyonlarını ayarla
function setupDialogListeners() {
  // Pin bilgileri dialog işleyicisi
  const pinInfoDialog = document.getElementById("pinInfoDialog");
  if (pinInfoDialog) {
    pinInfoDialog.addEventListener("click", function (event) {
      if (event.target === this) closePinInfoDialog();
    });
  }

  // Yardım dialog işleyicisi
  const helpDialog = document.getElementById("helpDialog");
  if (helpDialog) {
    helpDialog.addEventListener("click", function (event) {
      if (event.target === this) closeHelpDialog();
    });
  }

  // ESC tuşu ile dialog kapatma
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (
        pinInfoDialog &&
        getComputedStyle(pinInfoDialog).display === "block"
      ) {
        closePinInfoDialog();
      }
      if (helpDialog && getComputedStyle(helpDialog).display === "block") {
        closeHelpDialog();
      }
    }
  });
}

// UI Kontrol Modülü
export class UiController {
  constructor() {
    this.navLinks = document.querySelectorAll(".nav-link");
    this.pages = document.querySelectorAll(".page");

    // Form referansları
    this.wifiSettingsForm = document.getElementById("wifi-settings");
    this.deviceSettingsForm = document.getElementById("device-settings");

    this.setupEventListeners();
  }

  // Sayfa geçişlerini ve formları ayarla
  setupEventListeners() {
    // Sayfa gezinimini kurma
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const targetPageId = link.getAttribute("data-page");
        this.showPage(targetPageId);
      });
    });

    // Form gönderimlerini ayarlama
    if (this.wifiSettingsForm) {
      this.wifiSettingsForm.addEventListener(
        "submit",
        this.handleWifiFormSubmit.bind(this)
      );
    }

    if (this.deviceSettingsForm) {
      this.deviceSettingsForm.addEventListener(
        "submit",
        this.handleDeviceFormSubmit.bind(this)
      );
    }
  }

  // Sayfa geçişi
  setupNavigation() {
    // URL'de belirtilen sayfayı görüntüleme
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.showPage(hash);
    }

    // Hash değişikliklerini dinle
    window.addEventListener("hashchange", () => {
      const newHash = window.location.hash.substring(1);
      if (newHash) {
        this.showPage(newHash);
      }
    });
  }

  // Belirtilen sayfayı göster
  showPage(pageId) {
    // Tüm sayfaları gizle
    this.pages.forEach((page) => {
      page.classList.remove("active");
    });

    // Tüm nav linklerinden active sınıfını kaldır
    this.navLinks.forEach((link) => {
      link.classList.remove("active");
    });

    // İstenen sayfayı göster
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add("active");

      // İlgili nav linkini aktif et
      const activeNavLink = document.querySelector(
        `.nav-link[data-page="${pageId}"]`
      );
      if (activeNavLink) {
        activeNavLink.classList.add("active");
      }

      // URL'yi güncelle
      window.location.hash = pageId;
    }
  }

  // Form gönderimi işleyicileri
  handleWifiFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.wifiSettingsForm);
    const settings = {
      sta_ssid: formData.get("sta_ssid"),
      sta_password: formData.get("sta_password"),
    };

    // API service ile gönder
    if (window.app && window.app.api) {
      window.app.api
        .saveWifiSettings(settings)
        .then((response) => {
          this.showNotification(
            "WiFi ayarları başarıyla kaydedildi.",
            "success"
          );
        })
        .catch((error) => {
          this.showNotification(
            "WiFi ayarları kaydedilemedi: " + error.message,
            "danger"
          );
        });
    }
  }

  handleDeviceFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(this.deviceSettingsForm);
    const settings = {
      device_name: formData.get("device_name"),
      ap_ssid: formData.get("ap_ssid"),
      ap_password: formData.get("ap_password"),
    };

    // API service ile gönder
    if (window.app && window.app.api) {
      window.app.api
        .saveDeviceSettings(settings)
        .then((response) => {
          this.showNotification(
            "Cihaz ayarları başarıyla kaydedildi.",
            "success"
          );
        })
        .catch((error) => {
          this.showNotification(
            "Cihaz ayarları kaydedilemedi: " + error.message,
            "danger"
          );
        });
    }
  }

  // Bildirim gösterme
  showNotification(message, type = "info") {
    // Bildirim görüntüleme
    const container = document.querySelector(".container");
    const notification = document.createElement("div");
    notification.className = `alert alert-${type}`;
    notification.textContent = message;

    // Önceki bildirimleri temizle
    const existingAlerts = document.querySelectorAll(".alert");
    existingAlerts.forEach((alert) => alert.remove());

    // Yeni bildirimi ekle
    container.insertBefore(notification, container.firstChild);

    // 5 saniye sonra bildirimi otomatik kapat
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}
