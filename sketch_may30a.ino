#include <Preferences.h>

void setup() {
  Serial.begin(115200);
  delay(1000);
  
  Preferences preferences;
  Serial.println("Iniciando formatação...");
  
  // Abre a memória e apaga tudo que tem a etiqueta "florasense"
  preferences.begin("florasense", false);
  preferences.clear(); 
  preferences.end();
  
  Serial.println("TUDO ZERADO! A placa esqueceu todas as credenciais.");
}

void loop() {
  // Fica parado aqui, não faz mais nada.
}