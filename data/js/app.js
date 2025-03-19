// Sayfa yüklendiğinde
document.addEventListener("DOMContentLoaded", function () {
  // Tema değişikliği için hazırlık
  setupThemeToggle();

  // Tab ve dialog işleyicilerini kur
  setupTabListeners();
  setupDialogListeners();

  // Çıkış pinleri için kartları oluştur
  renderOutputPins([]);

  // İlk veri yüklemesi
  refreshDashboard();

  // Düzenli aralıklarla dashboard'u yenile
  setInterval(refreshDashboard, REFRESH_INTERVAL);
});

// Sayfa tamamen yüklendiğinde
window.onload = function () {
  // Çıkış kontrolleri oluştur (eski yöntem için yedek)
  const outputControls = document.getElementById("outputControls");
  if (outputControls) {
    outputPins.forEach((pin) => {
      const pinControl = document.createElement("div");
      pinControl.className = "pin-control";
      pinControl.innerHTML = `
              <h3>${pinNames[pin] || `Pin ${pin}`}</h3>
              <label class="switch">
                  <input type="checkbox" onchange="togglePin(${pin}, this.checked)">
                  <span class="slider"></span>
              </label>
          `;
      outputControls.appendChild(pinControl);
    });
  }

  // Giriş kontrolleri oluştur
  createInputControls();

  // Mevcut pin durumlarını al
  getPinStates();
};
