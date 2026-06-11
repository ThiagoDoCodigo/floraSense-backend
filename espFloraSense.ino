#include <WiFi.h>
#include <HTTPClient.h>
#include <WebSocketsClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>
#include <DHT.h>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#define DHTPIN 4
#define DHTTYPE DHT11
#define MOISTURE_PIN 34 
#define BOOT_BUTTON 0   

#define SERVICE_UUID              "4fa2c001-1234-4b2a-bf36-542194689400"
#define CHARACTERISTIC_UUID       "4fa2c002-1234-4b2a-bf36-542194689400"
#define STATUS_CHARACTERISTIC_UUID "4fa2c003-1234-4b2a-bf36-542194689400"

const int AirValue = 3100;   
const int WaterValue = 1300; 

DHT dht(DHTPIN, DHTTYPE);
Preferences preferences;
WebSocketsClient webSocket;

bool isProvisioned = false;
String wifi_ssid = "";
String wifi_password = "";
String plantId = "";
String userId = "";
String macAddress = "";

BLECharacteristic *pStatusCharacteristic;
bool startWifiTest = false;
bool isTestingWiFi = false;
unsigned long wifiTestStartTime = 0;
String temp_ssid = "";
String temp_pass = "";
String temp_plantId = "";
String temp_userId = "";
String temp_mac = "";

bool pendingReboot = false;
unsigned long rebootTimer = 0;

bool isFirstBoot = true;
unsigned long bootDelayTimer = 0;

unsigned long lastTelemetryTime = 0;
unsigned long telemetryIntervalMs = 28800000;

unsigned long lastWifiCheckTime = 0;

String backend_url = "https://florasense-backend.onrender.com/api/v1"; 
String ws_host = "florasense-backend.onrender.com";
int ws_port = 443;

void sendTelemetry();

class ProvisioningCallbacks: public BLECharacteristicCallbacks {
    void onWrite(BLECharacteristic *pCharacteristic) {
        String value = String(pCharacteristic->getValue().c_str());
        if (value.length() > 0) {
            StaticJsonDocument<512> doc;
            DeserializationError error = deserializeJson(doc, value);
            if (!error) {
                temp_ssid = doc["ssid"].as<String>();
                temp_pass = doc["password"].as<String>();
                temp_plantId = doc["plantId"].as<String>();
                temp_userId = doc["userId"].as<String>();
                temp_mac = doc["macAddress"].as<String>();

                startWifiTest = true;
                if(pStatusCharacteristic) pStatusCharacteristic->setValue("TESTING");
                
                Serial.println("Credenciais recebidas via BLE. Testando conexão Wi-Fi...");
            } else {
                Serial.println("Falha ao decodificar pacote BLE.");
            }
        }
    }
};

void startBLEProvisioning() {
    BLEDevice::init("FloraSense-ESP32");
    BLEDevice::setMTU(512); 
    
    BLEServer *pServer = BLEDevice::createServer();
    BLEService *pService = pServer->createService(SERVICE_UUID);
    
    BLECharacteristic *pCharacteristic = pService->createCharacteristic(
        CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_WRITE | BLECharacteristic::PROPERTY_WRITE_NR
    );
    pCharacteristic->setCallbacks(new ProvisioningCallbacks());

    pStatusCharacteristic = pService->createCharacteristic(
        STATUS_CHARACTERISTIC_UUID,
        BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY
    );
    pStatusCharacteristic->setValue("WAITING");
    
    pService->start();
    BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
    pAdvertising->addServiceUUID(SERVICE_UUID);
    pAdvertising->setScanResponse(true);
    BLEDevice::startAdvertising();
    Serial.println("Modo BLE Ativo. Aguardando conexão do App...");
}

void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    if (type == WStype_DISCONNECTED) {
        Serial.println("[WebSocket] Desconectado. O dispositivo está Offline.");
    } 
    else if (type == WStype_CONNECTED) {
        Serial.println("[WebSocket] CONECTADO COM SUCESSO! Módulo Online para comandos manuais.");
    }
    else if (type == WStype_TEXT) {
        Serial.printf("[WebSocket] Comando Recebido: %s\n", payload); 
        
        StaticJsonDocument<256> doc;
        DeserializationError error = deserializeJson(doc, payload);
        if (!error) {
            if (doc.containsKey("readingIntervalMinutes")) {
                long minutes = doc["readingIntervalMinutes"].as<long>();
                if (minutes >= 15) {
                    telemetryIntervalMs = minutes * 60 * 1000;
                    preferences.begin("florasense", false);
                    preferences.putLong("interval", telemetryIntervalMs);
                    preferences.end();
                    Serial.printf("Novo ciclo de leitura: %ld min\n", minutes);
                }
            }
            if (doc.containsKey("command")) {
                String cmd = doc["command"].as<String>();
                if (cmd == "force_reading") {
                    Serial.println("Comando: Forçar Leitura.");
                    sendTelemetry();
                } else if (cmd == "disconnect") {
                    Serial.println("Comando: Desvincular. Formatando...");
                    preferences.begin("florasense", false);
                    preferences.clear();
                    preferences.end();
                    delay(1000);
                    ESP.restart(); 
                }
            }
        } else {
            Serial.println("[WebSocket] Erro ao decodificar JSON.");
        }
    }
}

void sendTelemetry() {
    if (WiFi.status() != WL_CONNECTED) {
        Serial.println("Erro: WiFi não conectado. Ignorando telemetria.");
        return;
    }

    float t = dht.readTemperature();
    float h = dht.readHumidity();

    if (isnan(t)) t = 25.0; 
    if (isnan(h)) h = 50.0; 

    int rawMoisture = analogRead(MOISTURE_PIN);
    int moisturePercentage = map(rawMoisture, AirValue, WaterValue, 0, 100);
    moisturePercentage = constrain(moisturePercentage, 0, 100);

    int mockNitrogen = random(7, 15);
    int mockPhosphorus = random(7, 15);
    int mockPotassium = random(7, 15);

    WiFiClientSecure *client = new WiFiClientSecure;
    if(client) {
      client->setInsecure();
      HTTPClient http;
      
      if (http.begin(*client, backend_url + "/sensor-readings")) {
          http.addHeader("Content-Type", "application/json");

          StaticJsonDocument<512> doc;
          doc["userId"] = userId;
          doc["plantId"] = plantId;
          doc["macAddress"] = macAddress;
          doc["soilMoisture"] = moisturePercentage;
          doc["temperature"] = t;
          doc["airHumidity"] = h;
          doc["nitrogen"] = mockNitrogen;
          doc["phosphorus"] = mockPhosphorus;
          doc["potassium"] = mockPotassium;

          String jsonPayload;
          serializeJson(doc, jsonPayload);
          
          Serial.println("\nEnviando Telemetria para a API...");
          int httpResponseCode = http.POST(jsonPayload);
          
          if (httpResponseCode > 0) {
              String response = http.getString();
              Serial.printf("Status Code: %d\n", httpResponseCode);
              Serial.println("Resposta: " + response);

              if (httpResponseCode == 403 && response.indexOf("não possui um dispositivo IoT conectado no momento") >= 0) {
                  Serial.println("\n[CRÍTICO] Acesso negado pela nuvem (Dispositivo desvinculado)!");
                  Serial.println("Limpando a memória Flash do ESP32 e retornando ao estado de fábrica...");
                  
                  preferences.begin("florasense", false);
                  preferences.clear();
                  preferences.end();
                  
                  delay(1500);
                  ESP.restart();
              }

          } else {
              Serial.printf("Falha no HTTP POST. Erro: %s\n", http.errorToString(httpResponseCode).c_str());
          }
          http.end();
      }
      delete client;
    }
}

void setup() {
    Serial.begin(115200);
    dht.begin();
    analogSetAttenuation(ADC_11db);

    pinMode(BOOT_BUTTON, INPUT_PULLUP);
    Serial.println("\n[SISTEMA] Pressione e segure o botão BOOT por 3 segundos se quiser formatar a placa...");
    delay(3000); 
    
    if (digitalRead(BOOT_BUTTON) == LOW) {
        Serial.println("\n[ALERTA] Apagando credenciais de fábrica...");
        preferences.begin("florasense", false);
        preferences.clear();
        preferences.end();
        Serial.println("Memória limpa. Reiniciando limpo...");
        delay(1000);
        ESP.restart();
    }

    preferences.begin("florasense", true);
    wifi_ssid = preferences.getString("ssid", "");
    wifi_password = preferences.getString("pass", "");
    plantId = preferences.getString("plantId", "");
    userId = preferences.getString("userId", "");
    macAddress = preferences.getString("macAddress", "");
    telemetryIntervalMs = preferences.getLong("interval", 28800000);
    preferences.end();

    if (wifi_ssid == "" || plantId == "") {
        isProvisioned = false;
        startBLEProvisioning();
    } else {
        isProvisioned = true;
        
        WiFi.setAutoReconnect(true);
        WiFi.begin(wifi_ssid.c_str(), wifi_password.c_str());
        
        String ws_url = "/api/v1/plants/ws/device?plantId=" + plantId;
        webSocket.beginSSL(ws_host, ws_port, ws_url, "", ""); 
        webSocket.onEvent(webSocketEvent);
        webSocket.setReconnectInterval(5000);
        webSocket.enableHeartbeat(15000, 3000, 2);

        int attempts = 0;
        Serial.print("Conectando ao WiFi");
        while (WiFi.status() != WL_CONNECTED && attempts < 20) {
            delay(500);
            attempts++;
            Serial.print(".");
        }
        Serial.println();
        
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("WiFi Conectado!");
            Serial.println("Aguardando 20s para o Backend validar o pareamento...");
        } else {
            Serial.println("Falha ao conectar no WiFi. Entrando em modo de reconexao em background.");
        }
        
        bootDelayTimer = millis();
        isFirstBoot = true;
    }
}

void loop() {
    if (startWifiTest && !isProvisioned) {
        WiFi.disconnect();
        WiFi.mode(WIFI_STA);
        WiFi.begin(temp_ssid.c_str(), temp_pass.c_str());
        wifiTestStartTime = millis();
        isTestingWiFi = true;
        startWifiTest = false;
        Serial.printf("Iniciando conexão com %s...\n", temp_ssid.c_str());
    }

    if (isTestingWiFi && !isProvisioned) {
        if (WiFi.status() == WL_CONNECTED) {
            Serial.println("Teste de Wi-Fi BEM-SUCEDIDO! Confirmando com o App e salvando na Flash...");
            
            if(pStatusCharacteristic) {
                pStatusCharacteristic->setValue("WIFI_OK");
                pStatusCharacteristic->notify();
            }

            preferences.begin("florasense", false);
            preferences.putString("ssid", temp_ssid);
            preferences.putString("pass", temp_pass);
            preferences.putString("plantId", temp_plantId);
            preferences.putString("userId", temp_userId);
            preferences.putString("macAddress", temp_mac);
            preferences.putLong("interval", 28800000); 
            preferences.end();
            
            isTestingWiFi = false;
            pendingReboot = true;
            rebootTimer = millis() + 2500; 
            
        } else if (millis() - wifiTestStartTime > 15000) {
            Serial.println("Falha no teste de Wi-Fi! Senha incorreta ou rede instável.");
            WiFi.disconnect();
            
            if(pStatusCharacteristic) {
                pStatusCharacteristic->setValue("WIFI_FAIL");
                pStatusCharacteristic->notify();
            }
            isTestingWiFi = false;
        }
    }

    if (pendingReboot && millis() > rebootTimer) {
        Serial.println("Reiniciando a placa para aplicar modo de rotina...");
        ESP.restart();
    }

    if (isProvisioned && !pendingReboot) {
        unsigned long currentMillis = millis();

        if (WiFi.status() != WL_CONNECTED) {
            if (currentMillis - lastWifiCheckTime >= 10000) {
                Serial.println("[Aviso] Wi-Fi desconectado. Forçando tentativa de reconexão...");
                WiFi.reconnect(); 
                lastWifiCheckTime = currentMillis;
            }
        } else {
            webSocket.loop();
            
            if (currentMillis < lastTelemetryTime) lastTelemetryTime = currentMillis; 
            
            if (isFirstBoot && (currentMillis - bootDelayTimer >= 20000)) {
                Serial.println("Tempo de carência concluído! Disparando primeira leitura...");
                sendTelemetry();
                lastTelemetryTime = currentMillis;
                isFirstBoot = false; 
            }
            
            if (!isFirstBoot && (currentMillis - lastTelemetryTime >= telemetryIntervalMs)) {
                lastTelemetryTime = currentMillis;
                sendTelemetry();
            }
        }
    }
}