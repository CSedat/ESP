#ifndef API_HANDLERS_H
#define API_HANDLERS_H

#include <Arduino.h>

// API route işleyicileri
void setupApiRoutes();

// API - Pin durumlarını al
void handleGetPins();

// API - Pin durumunu değiştir
void handleSetPin();

#endif // API_HANDLERS_H
