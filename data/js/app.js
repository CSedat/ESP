// Ana uygulama modülü
import { ApiService } from "./api.js";
import { UiController } from "./ui.js";
import { SystemInfo } from "./systemInfo.js";
import { ControlPanel } from "./controlPanel.js";

// Dialog fonksiyonlarını global alanda tanımla
window.openPinInfoDialog = function() {
  document.getElementById("pinInfoDialog").style.display = "block";
  document.body.style.overflow = "hidden"; // Sayfanın kaydırılmasını engelle
};

window.closePinInfoDialog = function() {
  document.getElementById("pinInfoDialog").style.display = "none";
  document.body.style.overflow = ""; // Sayfanın kaydırılmasına izin ver
};

window.openHelpDialog = function() {
  document.getElementById("helpDialog").style.display = "block";
  document.body.style.overflow = "hidden";
};

window.closeHelpDialog = function() {
  document.getElementById("helpDialog").style.display = "none";
  document.body.style.overflow = "";
};

// Uygulama sınıfı
class App {
  constructor() {
    this.api = new ApiService();
    this.ui = new UiController();
    this.systemInfo = new SystemInfo(this.api);
    this.controlPanel = new ControlPanel(this.api);

    this.init();
  }

  init() {
    console.log("IoT Dashboard başlatılıyor...");

    // Sayfa gezinimini yönetme
    this.ui.setupNavigation();

    // Tema değiştirme ve dialog işlevlerini ayarla
    this.setupThemeAndDialogs();

    // Sistem bilgilerini yükleme
    this.systemInfo.loadSystemInfo();

    // Kontrol panelini yükleme
    this.controlPanel.loadControls();

    // Düzenli veri güncelleme döngüsü
    this.startUpdateCycle();
  }

  setupThemeAndDialogs() {
    // Tema değiştirme
    setupThemeToggle();

    // Dialog işlevlerini ayarla
    setupDialogListeners();
    setupTabListeners();
  }

  startUpdateCycle() {
    // Her 5 saniyede bir verileri güncelle
    setInterval(() => {
      this.systemInfo.updateSystemInfo();
      this.controlPanel.updateControls();
    }, 1000);
  }
}

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

// Dialog kontrol fonksiyonlarını ayarla
function setupDialogListeners() {
  // Pin bilgileri dialog işleyicisi
  const pinInfoDialog = document.getElementById("pinInfoDialog");
  if (pinInfoDialog) {
    pinInfoDialog.addEventListener("click", function (event) {
      if (event.target === this) window.closePinInfoDialog();
    });
  }

  // Yardım dialog işleyicisi
  const helpDialog = document.getElementById("helpDialog");
  if (helpDialog) {
    helpDialog.addEventListener("click", function (event) {
      if (event.target === this) window.closeHelpDialog();
    });
  }

  // ESC tuşu ile dialog kapatma
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (
        pinInfoDialog &&
        getComputedStyle(pinInfoDialog).display === "block"
      ) {
        window.closePinInfoDialog();
      }
      if (helpDialog && getComputedStyle(helpDialog).display === "block") {
        window.closeHelpDialog();
      }
    }
  });
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
      dialog.querySelector(`#${tabContentId}`).classList.add("active");
    });
  });
}

// Sayfa yüklendiğinde uygulamayı başlat
document.addEventListener("DOMContentLoaded", () => {
  window.app = new App();
});
