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
