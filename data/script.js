/*
 * Bu dosya yeni modüler yapı için yönlendirme yapar
 * Tüm işlevsellik artık aşağıdaki dosyalara taşınmıştır:
 * - js/config.js: Konfigürasyon değişkenleri
 * - js/utils.js: Yardımcı fonksiyonlar
 * - js/ui.js: Kullanıcı arayüzü işlemleri
 * - js/dashboard.js: Dashboard ve pin kontrolü
 * - js/app.js: Ana uygulama başlangıcı
 */

// Eski tarayıcılarda uyumluluğu korumak için
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", function() {
    console.log("Dashboard yeni modüler yapıya taşındı. js/ klasöründeki dosyaları kullanıyor.");
  });
}
