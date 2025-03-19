// Süreyi formatlı göster
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  let result = "";
  if (days > 0) result += `${days}g `;
  if (hours > 0) result += `${hours}s `;
  if (minutes > 0) result += `${minutes}d `;
  result += `${secs}s`;

  return result;
}

// Byte değerini okunabilir formatta göster
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " KB";
  else return (bytes / 1048576).toFixed(2) + " MB";
}
