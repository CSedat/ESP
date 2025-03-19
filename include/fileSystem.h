#ifndef FILE_SYSTEM_H
#define FILE_SYSTEM_H

#include <Arduino.h>
#include <LittleFS.h>

// Dosya sistemi başlatma ve kontrol
void setupFileSystem();

// Dosya türüne göre MIME tipini döndürme
String getContentType(String filename);

// Dosya sistemi üzerinden dosya gönderme
bool handleFileRead(String path);

#endif // FILE_SYSTEM_H
