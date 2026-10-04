# 🌈 Tira LED "Miracles Star" - Ingeniería Inversa Completa

![Status](https://img.shields.io/badge/status-Completado-brightgreen)
![Language](https://img.shields.io/badge/language-JavaScript%20%7C%20HTML%20%7C%20CSS-blue)
![Protocol](https://img.shields.io/badge/protocol-BLE%20Bluetooth-purple)

## 📋 Descripción General

Este proyecto documenta el proceso **completo de ingeniería inversa** de una tira LED RGB controlada por la aplicación móvil "Miracles Star". El objetivo es comprender el protocolo Bluetooth Low Energy (BLE) utilizado y desarrollar herramientas propias para controlar el dispositivo sin depender de la app oficial.

**Dispositivo:** Tira LED RGB "Dream color"
- 📏 Longitud: 3 metros
- ⚡ Potencia: 15W
- 🔌 Alimentación: USB 5V (~3A)
- 📱 Conectividad: Bluetooth (BLE)
- 🎮 Métodos de control: Botón físico, Control remoto IR, Aplicación Miracles Star

---

## 🎯 Estado del Proyecto

### ✅ Completado

- [x] Identificación del dispositivo y especificaciones
- [x] Descubrimiento del árbol GATT (Servicios y Características BLE)
- [x] Desarrollo de herramienta propia: **LED-BLE Analyzer AI**
- [x] Fuzzing inicial (intentos con 10 protocolos comerciales)
- [x] Descompilación de APK de la app oficial
- [x] **Descubrimiento del protocolo real**
- [x] Documentación del formato de paquetes
- [x] Desarrollo de aplicaciones de control

### 🔄 En Progreso

- [ ] Verificación exhaustiva de todos los comandos
- [ ] Documentación de modos de efectos dinámicos
- [ ] Integración con Home Assistant
- [ ] Sincronización avanzada con música

---

## 📁 Estructura del Proyecto

```
Tira-led/
├── README.md                              # Este archivo (documentación principal)
├── index.html                             # Interfaz web del LED-BLE Analyzer
├── app.js                                 # Lógica de conexión BLE y control
├── style.css                              # Estilos de la aplicación web
├── reporte_final_ingenieria_inversa.md   # Bitácora del proceso de investigación
├── documentacion_estado_actual.md         # Estado actual y metodología
├── Solucion                               # Protocolo descubierto y ejemplos de código
└── knowledge_base.yaml                    # Base de conocimiento YAML
```

---

## 🔍 Resumen del Descubrimiento

### Fase 1: Análisis Inicial ✅

Se comenzó sin interactuar directamente con el dispositivo, analizando la evidencia física (caja y manual).

**Hallazgos:**
- Dispositivo: Tira LED RGB 3m, 15W, USB 5V
- Fabricante: ShenZhen Lenze Technology Co., Ltd.
- Control: Botón físico, Control remoto IR (24 teclas), App "Miracles Star"
- Conectividad: Bluetooth Low Energy (BLE)

### Fase 2: Descubrimiento del Árbol GATT ✅

Con la herramienta **LED-BLE Analyzer AI** se conectó exitosamente:

| Elemento | UUID | Propiedades |
|----------|------|------------|
| **Nombre del Dispositivo** | `GATT--DEMO` | - |
| **Servicio Principal** | `0000fff0-0000-1000-8000-00805f9b34fb` | - |
| **Característica TX (Escritura)** | `0000fff3-0000-1000-8000-00805f9b34fb` | WRITE, WRITE_WITHOUT_RESPONSE |
| **Característica RX (Lectura)** | `0000fff4-0000-1000-8000-00805f9b34fb` | NOTIFY |

### Fase 3: Fuzzing (Inicialmente Fallido) ⚠️

Se probaron 10 protocolos comerciales estándar (Triones, Zengge, HappyLighting, iDeal, Lotus, etc.) sin éxito.

**Conclusión inicial incorrecta:** "El dispositivo usa cifrado propietario de Lenze Technology"

### Fase 4: Descompilación de APK (¡Éxito!) ✅

Se descompilaron las clases de la app oficial con **Androguard** y se descubrió:

1. El protocolo **NO tiene cifrado, ni handshake, ni checksum**
2. La razón del fallo del fuzzing: **El formato era completamente diferente a los 10 protocolos probados**
3. El protocolo real es simple: cabecera fija, comando, longitud, datos y cola fija

**Formato descubierto:**
```
0xBC | comando | longitud | datos... | 0x55
```

---

## 🛠️ Herramientas Desarrolladas

### LED-BLE Analyzer AI

Aplicación web interactiva para análisis y control de tiras LED BLE.

**Archivos:**
- `index.html` - Interfaz web con dashboard premium (glassmorphism, modo oscuro)
- `app.js` - Motor de conexión BLE y lógica de control
- `style.css` - Estilos modernos y responsivos

**Funcionalidades:**

1. **Motor de Búsqueda y Conexión**
   - Filtro de nombre con prefijo personalizable
   - Servicios opcionales predefinidos
   - Soporte para múltiples dispositivos BLE

2. **Exploración GATT (Fase 2)**
   - Conexión automática al servidor GATT
   - Descubrimiento de servicios primarios
   - Enumeración de características y propiedades

3. **Laboratorio de Paquetes (Inyección TX/RX)**
   - Interfaz para enviar payloads hexadecimales
   - Suscripción a notificaciones
   - Visualización de respuestas en tiempo real

4. **Terminal de Logs**
   - Registro con timestamps de todas las operaciones
   - Facilita análisis comparativo y debugging

---

## 📡 Protocolo BLE Descubierto

### Formato General

```
0xBC | CMD | LEN | DATOS... | 0x55
```

**Donde:**
- `0xBC` (188): Byte de inicio (constante)
- `CMD`: Comando específico (1 byte)
- `LEN`: Longitud de datos (1 byte)
- `DATOS`: Payload variable
- `0x55` (85): Byte de fin (constante)

### Tabla de Comandos

| Función | Cmd | Longitud | Datos | Ejemplo |
|---------|-----|----------|-------|---------|
| Orden RGB (selector) | `02` | 1 | índice (1, 2, 3...) | `BC 02 01 01 55` |
| Cantidad de LEDs | `03` | 2 | n (8–300), big-endian | `BC 03 02 00 1E 55` (30 LEDs) |
| **Color Fijo** | `04` | 6 | hue (2B), sat×1000 (2B), `00 00` | `BC 04 06 00 00 03 E8 00 00 55` |
| **Brillo** | `05` | 6 | 3–1000 (2B), `00 00 00 00` | `BC 05 06 03 E8 00 00 00 00 55` |
| **Modo / Efecto** | `06` | 2 | `n/255`, `n%255` | `BC 06 02 00 05 55` (modo 5) |
| Encendido (ON) | `07` | 1 | `01` | `BC 07 01 01 55` |
| Apagado (OFF) | `01` | 1 | `00` | `BC 01 01 00 55` |
| **Velocidad** | `08` | 1 | 0–100 | `BC 08 01 32 55` (50%) |
| Temporizador | `0D` | 6 | [enciende/apaga][activo][bitmask][hora][min] | `BC 0D 06 01 .. .. .. .. .. 55` |
| Modo Micrófono | `0F` | 1 | `01` | `BC 0F 01 01 55` |
| Sensibilidad Micrófono | `12` | 1 | 0–100 | `BC 12 01 50 55` |
| Comando `13` | `13` | 2 | valor 2 bytes | (Módulo de color) |

### Cálculo de Color (RGB → HSV)

```javascript
function colorToPacket(r, g, b) {
    // Convertir RGB [0-255] a HSV
    const h = Math.floor(hue * 360);  // 0-360
    const s = Math.floor(sat * 1000); // 0-1000
    
    const packet = [
        0xBC,                    // Inicio
        0x04,                    // Comando: Color fijo
        0x06,                    // Longitud: 6 bytes
        (h >> 8) & 0xFF,        // Hue alto
        h & 0xFF,               // Hue bajo
        (s >> 8) & 0xFF,        // Saturación alto
        s & 0xFF,               // Saturación bajo
        0x00, 0x00,             // Relleno
        0x55                     // Fin
    ];
    
    return new Uint8Array(packet);
}
```

**Ejemplo Python con `colorsys`:**

```python
import colorsys

def color_packet(r, g, b):
    h, s, v = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    hue = round(h * 360)
    sat = round(s * 1000)
    return bytes([0xBC, 0x04, 0x06, 
                  hue >> 8, hue & 255, 
                  sat >> 8, sat & 255, 
                  0, 0, 0x55])
```

---

## 💻 Cómo Usar la Herramienta

### En el Navegador

1. Abre `index.html` en Chrome, Edge o cualquier navegador basado en Chromium
2. El sitio debe servirse por **HTTPS** o **localhost** (requerimiento de Web Bluetooth)
3. Ingresa un prefijo de nombre (ej: "GATT") en el campo de filtro
4. Haz clic en "Buscar dispositivos"
5. Selecciona el dispositivo `GATT--DEMO`
6. Explora servicios y características
7. Usa el laboratorio de paquetes para enviar comandos

### Ejemplo de Uso Programático

**Web Bluetooth (JavaScript):**

```javascript
const SERVICE = '0000fff0-0000-1000-8000-00805f9b34fb';
const TX_CHAR = '0000fff3-0000-1000-8000-00805f9b34fb';

// Conectar al dispositivo
const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'GATT' }],
    optionalServices: [SERVICE]
});

const server = await device.gatt.connect();
const service = await server.getPrimaryService(SERVICE);
const tx = await service.getCharacteristic(TX_CHAR);

// Enviar color rojo
const packet = new Uint8Array([
    0xBC, 0x04, 0x06,           // Encabezado
    0x00, 0x00, 0x03, 0xE8,     // Rojo (0°, 100% sat)
    0x00, 0x00,                 // Relleno
    0x55                        // Fin
]);

await tx.writeValue(packet);
```

**Python con `bleak`:**

```bash
pip install bleak
```

```python
import asyncio
import colorsys
from bleak import BleakScanner, BleakClient

SERVICE = "0000fff0-0000-1000-8000-00805f9b34fb"
TX_CHAR = "0000fff3-0000-1000-8000-00805f9b34fb"

def make_packet(cmd, data):
    return bytes([0xBC, cmd, len(data), *data, 0x55])

def color_packet(r, g, b):
    h, s, _ = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    h = round(h * 360)
    s = round(s * 1000)
    data = [h >> 8, h & 255, s >> 8, s & 255, 0, 0]
    return make_packet(0x04, data)

async def main():
    # Buscar dispositivo
    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: (d.name or "").startswith("GATT"),
        timeout=10
    )
    
    if not device:
        print("Dispositivo no encontrado")
        return
    
    async with BleakClient(device) as client:
        # Encender
        await client.write_gatt_char(TX_CHAR, make_packet(0x07, [0x01]))
        
        # Color rojo
        await client.write_gatt_char(TX_CHAR, color_packet(255, 0, 0))
        
        # Brillo máximo
        await client.write_gatt_char(TX_CHAR, make_packet(0x05, [0x03, 0xE8, 0, 0, 0, 0]))

asyncio.run(main())
```

---

## 📊 Documentación de Referencia

### 1. **Bitácora de Ingeniería Inversa** (`reporte_final_ingenieria_inversa.md`)

Documento detallado que incluye:
- Fase inicial: Análisis documental
- Construcción de herramientas (LED-BLE Analyzer AI)
- Descubrimiento BLE y árbol GATT
- Fuzzing y análisis de barrera criptográfica
- Plan futuro para desbloqueo de protocolos

**Ver:** [reporte_final_ingenieria_inversa.md](./reporte_final_ingenieria_inversa.md)

### 2. **Documentación de Estado Actual** (`documentacion_estado_actual.md`)

Reporte detallado incluyendo:
- Identidad y misión del proyecto
- Fase 1: Identificación del dispositivo (completada)
- Fase 2: Descubrimiento BLE (completada)
- Fase 3: Fuzzing fallido y análisis
- Especificaciones técnicas confirmadas

**Ver:** [documentacion_estado_actual.md](./documentacion_estado_actual.md)

### 3. **Solución Completa** (`Solucion`)

Documento técnico completo con:
- Resumen del protocolo descubierto
- Análisis de por qué falló el fuzzing inicial
- Método paso a paso de decompilación
- Referencia completa del protocolo
- Ejemplos de código en JavaScript y Python
- Guía para crear aplicaciones propias
- Lecciones aprendidas

**Ver:** [Solucion](./Solucion)

---

## 🎓 Lecciones Aprendidas

### 1. El Silencio No Es Cifrado
Si un dispositivo ignora tus paquetes, lo más probable es que el formato sea diferente, no que haya cifrado.

### 2. La App Oficial Es Documentación
Decompilar es frecuentemente más rápido que adivinar o capturar tráfico Bluetooth.

### 3. Sigue las Referencias
Empieza por lo que ya sabes (UUIDs) y sigue hacia atrás las referencias para llegar a todos los comandos.

### 4. Documenta Cada Hipótesis
Comprueba cada suposición con evidencia. La hipótesis de "cifrado de Lenze" se descartó leyendo el código.

### 5. Protocolos Baratos Son Simples
Las tiras LED económicas suelen usar protocolo simple: cabecera, comando, longitud, datos, cola.

---

## 🔐 Consideraciones de Seguridad

⚠️ **Nota Importante:**
- Este proyecto se desarrolló sobre un dispositivo propio para **interoperabilidad**
- El objetivo es **controlar el dispositivo sin depender de la app oficial**
- Respeta los términos de uso y leyes locales
- La decompilación se realizó con fines académicos y de investigación

---

## 🚀 Casos de Uso

### 1. Control desde Desktop
```bash
python control.py --color ff0000 --brightness 100
```

### 2. Integración con Home Assistant
Control de la tira LED como dispositivo nativo en tu smart home.

### 3. Sincronización con Música
Mapea frecuencias de audio → colores e intensidad en tiempo real.

### 4. Automatización
- Alarmas visuales con cambio de color
- Notificaciones de email
- Integración con eventos del calendario

### 5. Desarrollo de Apps Móviles
Usa los UUID y el protocolo documentado para crear apps Android/iOS alternativas.

---

## 📦 Requisitos

### Para usar la herramienta web:
- Navegador moderno (Chrome, Edge, Brave)
- HTTPS o localhost
- Dispositivo Bluetooth integrado o USB

### Para Python:
```bash
pip install bleak colorsys
```

### Para desarrollo Android:
- SDK de Android
- Java/Kotlin
- Conocimiento de BluetoothGatt

---

## 🔧 Configuración Rápida

1. **Clona el repositorio:**
```bash
git clone https://github.com/Luiscrespo-bot/Tira-led.git
cd Tira-led
```

2. **Sirve la aplicación web:**
```bash
# Opción 1: Python
python -m http.server 8000

# Opción 2: Node.js
npx http-server

# Opción 3: Node.js con live reload
npm install -g live-server
live-server
```

3. **Accede a la aplicación:**
```
http://localhost:8000
```

---

## 📝 Próximos Pasos

- [ ] Verificar semántica exacta de modos (comando `06`)
- [ ] Documentar lista completa de efectos dinámicos
- [ ] Crear aplicación Android nativa
- [ ] Integración con Home Assistant/Alexa
- [ ] Ejemplos de sincronización con música
- [ ] Aplicación de escritorio multiplataforma

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agrega nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📜 Licencia

Este proyecto se distribuye con fines educativos y de investigación.

---

## 📞 Contacto

Para preguntas, sugerencias o reportes de bugs, abre un issue en el repositorio.

---

## 🙏 Agradecimientos

- **ShenZhen Lenze Technology Co., Ltd.** por el dispositivo BLE
- **Androguard** por las herramientas de decompilación
- **Web Bluetooth API** por la especificación estándar
- La comunidad de makers y hackers por la inspiración

---

**Última actualización:** Octubre 2026
**Estado:** ✅ Protocolo completamente documentado y funcional

