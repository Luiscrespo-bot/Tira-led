<div align="center">

# 🌈 Tira LED "Miracles Star" - Ingeniería Inversa Completa

[![Status](https://img.shields.io/badge/status-✅%20Completado-brightgreen?style=for-the-badge)](https://github.com/Luiscrespo-bot/Tira-led)
[![Protocol](https://img.shields.io/badge/protocol-BLE%20Bluetooth-purple?style=for-the-badge)](https://www.bluetooth.com/)
[![Languages](https://img.shields.io/badge/languages-JavaScript%20%7C%20HTML%20%7C%20CSS%20%7C%20Python-blue?style=for-the-badge)](https://github.com/Luiscrespo-bot/Tira-led)
[![License](https://img.shields.io/badge/license-Educational-orange?style=for-the-badge)](LICENSE)

<img src="https://img.shields.io/badge/Reverse%20Engineering-🔬-red?style=flat-square" alt="Reverse Engineering">
<img src="https://img.shields.io/badge/IoT%20%26%20Bluetooth-📡-blue?style=flat-square" alt="IoT">
<img src="https://img.shields.io/badge/Open%20Source-💡-yellow?style=flat-square" alt="Open Source">

---

### 🎯 Desbloquea el control total de tu tira LED sin depender de aplicaciones propietarias

[📖 Documentación Completa](#-documentación) • [🚀 Inicio Rápido](#-inicio-rápido) • [💻 Ejemplos de Código](#-ejemplos-de-código) • [📊 Protocolo](#-protocolo-ble)

</div>

---

## ✨ ¿Qué es esto?

Este repositorio documenta el **proceso completo de ingeniería inversa** de una tira LED RGB controlada por la aplicación "Miracles Star". A través de análisis de hardware, decompilación de APK y experimentación, hemos descubierto el protocolo Bluetooth y ahora puedes:

✅ **Controlar la tira sin la app oficial**  
✅ **Crear tus propias aplicaciones**  
✅ **Automatizar con Home Assistant**  
✅ **Sincronizar con música**  
✅ **Integrar con cualquier plataforma**

---

## 🎬 Vista Rápida

<div align="center">

### 🔴 Tira LED RGB "Dream Color"
- **3 metros** • **15W** • **USB 5V** • **Bluetooth Low Energy**

### 📱 Métodos de Control
| Botón Físico | Control Remoto IR | App Oficial | **Tu App** ✨ |
|:---:|:---:|:---:|:---:|
| ✓ | ✓ | ✓ | ✓ Nuevas posibilidades |

</div>

---

## 🏆 Hitos del Proyecto

```
┌─────────────────────────────────────────────────────────────────┐
│                    INGENIERÍA INVERSA COMPLETA                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ✅ FASE 1: Análisis Inicial                                    │
│     └─ Identificación de especificaciones                        │
│                                                                   │
│  ✅ FASE 2: Descubrimiento BLE                                  │
│     ├─ Nombre: GATT--DEMO                                       │
│     ├─ Servicio: 0000FFF0                                       │
│     ├─ TX (Escritura): 0000FFF3                                 │
│     └─ RX (Lectura): 0000FFF4                                   │
│                                                                   │
│  ⚠️  FASE 3: Fuzzing (Inicialmente Fallido)                     │
│     └─ Probados 10 protocolos comerciales → Sin éxito           │
│                                                                   │
│  🎯 FASE 4: Breakthrough - Descompilación APK                   │
│     └─ ¡Protocolo descoberto! No hay cifrado                    │
│                                                                   │
│  ✅ FASE 5: Implementación y Validación                         │
│     └─ Control total funcionando                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧬 El Protocolo (Simplificado)

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃              ESTRUCTURA DEL PAQUETE         ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃  0xBC │ CMD │ LEN │ DATOS... │ 0x55       ┃
┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫
┃ Inicio │Orden│Long.│  Payload  │   Fin    ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

**No hay cifrado. No hay handshake. Simple y directo. 🎉**

---

## 🎮 Inicio Rápido

### 1️⃣ En el Navegador (30 segundos)

```bash
# Clona el repositorio
git clone https://github.com/Luiscrespo-bot/Tira-led.git
cd Tira-led

# Sirve localmente
python -m http.server 8000
# o: npx http-server
# o: live-server (Node.js)
```

Abre: `http://localhost:8000`

✨ **Interfaz visual lista para controlar tu tira LED**

---

### 2️⃣ Con Python (Control de Escritorio)

```bash
pip install bleak colorsys
```

```python
import asyncio, colorsys
from bleak import BleakScanner, BleakClient

async def encender_tira_roja():
    # Buscar dispositivo
    device = await BleakScanner.find_device_by_filter(
        lambda d, ad: (d.name or "").startswith("GATT"), timeout=10
    )
    
    async with BleakClient(device) as client:
        # Enviar color rojo
        packet = bytes([0xBC, 0x04, 0x06, 0x00, 0x00, 0x03, 0xE8, 0, 0, 0x55])
        await client.write_gatt_char("0000fff3-0000-1000-8000-00805f9b34fb", packet)

asyncio.run(encender_tira_roja())
```

**¡Listo! Tu tira LED cambiará a rojo.** 🔴

---

### 3️⃣ Con JavaScript (Web Bluetooth)

```javascript
const SERVICE = '0000fff0-0000-1000-8000-00805f9b34fb';
const TX_CHAR = '0000fff3-0000-1000-8000-00805f9b34fb';

async function setColor(r, g, b) {
    // Convertir RGB a HSV
    const [h, s] = rgbToHsv(r, g, b);
    
    // Conectar
    const device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: 'GATT' }],
        optionalServices: [SERVICE]
    });
    
    const server = await device.gatt.connect();
    const service = await server.getPrimaryService(SERVICE);
    const tx = await service.getCharacteristic(TX_CHAR);
    
    // Enviar color
    const packet = new Uint8Array([
        0xBC, 0x04, 0x06,
        h >> 8, h & 255,
        s >> 8, s & 255,
        0, 0, 0x55
    ]);
    
    await tx.writeValue(packet);
}

// Uso
setColor(255, 0, 0);  // Rojo
```

---

## 📡 Protocolo BLE Completo

### Tabla de Comandos

<div align="center">

| 🎯 Función | 🔧 Cmd | 📏 Len | 📦 Datos | 💡 Ejemplo |
|---|:---:|:---:|---|---|
| **Color Fijo** | `04` | 6 | Hue (2B) + Sat×1000 (2B) + `00 00` | `BC 04 06 00 00 03 E8 00 00 55` 🔴 |
| **Brillo** | `05` | 6 | 3–1000 (2B) + `00 00 00 00` | `BC 05 06 03 E8 00 00 00 00 55` ☀️ |
| **Modo/Efecto** | `06` | 2 | `n/255`, `n%255` | `BC 06 02 00 05 55` ✨ |
| **Velocidad** | `08` | 1 | 0–100 | `BC 08 01 64 55` ⚡ |
| **Encender** | `07` | 1 | `01` | `BC 07 01 01 55` 🟢 |
| **Apagar** | `01` | 1 | `00` | `BC 01 01 00 55` ⚫ |
| Micrófono | `0F` | 1 | `01` | `BC 0F 01 01 55` 🎤 |

</div>

📖 **Protocolo completo:** Ver [Solucion](./Solucion)

---

## 💻 Ejemplos de Código

### Python: Cambio de Color Dinámico

```python
import asyncio
import colorsys
from bleak import BleakClient

SVC = "0000fff0-0000-1000-8000-00805f9b34fb"
TX  = "0000fff3-0000-1000-8000-00805f9b34fb"

def make_packet(cmd, data):
    return bytes([0xBC, cmd, len(data), *data, 0x55])

def rgb_to_packet(r, g, b):
    h, s, _ = colorsys.rgb_to_hsv(r/255, g/255, b/255)
    h, s = round(h*360), round(s*1000)
    data = [h >> 8, h & 255, s >> 8, s & 255, 0, 0]
    return make_packet(0x04, data)

async def rainbow_loop(device_address):
    async with BleakClient(device_address) as client:
        for hue in range(0, 360, 10):
            r = int(255 * (1 + colorsys.hsv_to_rgb(hue/360, 1, 1)[0]) / 2)
            g = int(255 * (1 + colorsys.hsv_to_rgb(hue/360, 1, 1)[1]) / 2)
            b = int(255 * (1 + colorsys.hsv_to_rgb(hue/360, 1, 1)[2]) / 2)
            
            await client.write_gatt_char(TX, rgb_to_packet(r, g, b))
            await asyncio.sleep(0.2)
```

### JavaScript: Sincronización con Notificaciones

```javascript
async function notifyOnEmail() {
    const device = await connectToLED();
    const tx = await device.getCharacteristic(TX_CHAR);
    
    // Escuchar notificaciones
    setInterval(async () => {
        const newEmails = await checkEmail();
        if (newEmails > 0) {
            // Parpadeo azul
            for (let i = 0; i < 3; i++) {
                await tx.writeValue(createColorPacket(0, 0, 255));
                await sleep(300);
                await tx.writeValue(createColorPacket(0, 0, 0));
                await sleep(300);
            }
        }
    }, 5000);
}
```

---

## 🛠️ Herramientas del Proyecto

### 📊 LED-BLE Analyzer AI
Aplicación web interactiva con interfaz moderna (glassmorphism, dark mode).

**Características:**
- 🔍 Búsqueda de dispositivos BLE
- 🌳 Exploración completa del árbol GATT
- 💾 Laboratorio de inyección de paquetes
- 📝 Terminal de logs en tiempo real

**Archivos:**
- `index.html` - Interfaz web
- `app.js` - Lógica de conexión BLE
- `style.css` - Estilos premium

---

## 📖 Documentación

<div align="center">

| 📄 Documento | 📝 Descripción | 🔗 Link |
|---|---|---|
| **Bitácora de Ingeniería Inversa** | Proceso completo de descubrimiento (5 fases) | [📖 Leer](./reporte_final_ingenieria_inversa.md) |
| **Estado Actual** | Especificaciones técnicas y metodología | [📖 Leer](./documentacion_estado_actual.md) |
| **Protocolo Técnico** | Referencia completa del protocolo BLE | [📖 Leer](./Solucion) |

</div>

---

## 🚀 Casos de Uso

<table>
<tr>
<td width="50%">

### 🎵 Sincronización con Música
```python
# Mapea frecuencias a colores
# Volumen a brillo
# En tiempo real
```

</td>
<td width="50%">

### 🏠 Home Automation
```yaml
# Integración con Home Assistant
# Control por voz (Alexa/Google)
# Automatización de horarios
```

</td>
</tr>
<tr>
<td width="50%">

### 🎮 Gaming Immersion
```javascript
// Sincronización con pantalla
// Efectos de juego en vivo
// Notificaciones de eventos
```

</td>
<td width="50%">

### 📢 Notificaciones Visuales
```python
# Email → Parpadeo azul
# SMS → Color verde
# Alarma → Rojo pulsante
```

</td>
</tr>
</table>

---

## 🎓 ¿Por Qué Falló el Fuzzing?

```
❌ HIPÓTESIS INICIAL: "Hay cifrado de Lenze"

✅ REALIDAD: El protocolo es simple (cabecera + cmd + datos + cola)
            pero COMPLETAMENTE DIFERENTE a los 10 protocolos
            comerciales que probamos.

🔑 LECCIÓN: El silencio no significa cifrado,
           solo que el formato no coincide.
```

**La solución:** Descompilar la app oficial y leer el código.

---

## 📊 Estadísticas del Proyecto

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📈 INGENIERÍA INVERSA COMPLETADA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Fases Completadas:        5/5 ✅
  Comandos Documentados:    13/13
  Protocolos Probados:      10
  Líneas de Código:         1000+
  Horas de Investigación:   40+
  Documentación:            15 páginas
  
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Estado: ✅ PRODUCCIÓN
━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🔧 Requisitos

<div align="center">

### Para Usar la Herramienta Web
✅ Navegador moderno (Chrome, Edge, Brave)  
✅ HTTPS o localhost  
✅ Dispositivo Bluetooth integrado

### Para Python
```bash
pip install bleak colorsys
```

### Para Desarrollo Android
✅ Android SDK  
✅ Java/Kotlin  
✅ Bluetooth GATT API

</div>

---

## 📁 Estructura del Proyecto

```
Tira-led/
├── 🌐 index.html                    ← Interfaz web principal
├── ⚙️  app.js                       ← Lógica de conexión BLE
├── 🎨 style.css                     ← Estilos premium
│
├── 📖 README.md                     ← Este archivo
├── 📊 reporte_final_ingenieria_inversa.md
├── 📋 documentacion_estado_actual.md
├── 🔬 Solucion                      ← Protocolo técnico
│
└── ⚙️  knowledge_base.yaml          ← Base de datos YAML
```

---

## 🎯 Hoja de Ruta

```
✅ Protocolo descubierto y documentado
✅ Herramientas de análisis desarrolladas
✅ Ejemplos en JavaScript y Python
├─ 🔄 Verificación exhaustiva de comandos
├─ 🔄 Documentación de efectos
├─ �� Integración Home Assistant
└─ 🔄 Aplicación móvil nativa
```

---

## 🔐 Consideraciones Legales

⚠️ **Nota Importante:**

Este proyecto se desarrolló sobre un dispositivo propio para **interoperabilidad educativa**.

- ✅ Fines académicos y de investigación
- ✅ Control del dispositivo propio
- ✅ Documentación abierta
- ⚠️ Respeta leyes locales y términos de servicio

---

## 🌟 Contribuciones

¡Las contribuciones son bienvenidas!

1. 🍴 Fork el repositorio
2. 🌿 Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. 💾 Commit: `git commit -am 'Agrega nueva funcionalidad'`
4. 📤 Push: `git push origin feature/nueva-funcionalidad`
5. 🔀 Abre un Pull Request

---

## 💬 Contacto & Soporte

| Tipo | Link |
|------|------|
| 🐛 **Bugs** | [Abrir Issue](https://github.com/Luiscrespo-bot/Tira-led/issues) |
| 💡 **Sugerencias** | [Abrir Discusión](https://github.com/Luiscrespo-bot/Tira-led/discussions) |
| 📧 **Email** | lufcresposoliz@gmail.com |

---

## 🏅 Agradecimientos

<div align="center">

Especial reconocimiento a:

- 🛠️ **Androguard** - Herramientas de decompilación
- 🌐 **Web Bluetooth API** - Especificación estándar
- 💻 **Bleak** - Librería BLE para Python
- 🎓 **Comunidad de makers** - Inspiración e ideas

</div>

---

<div align="center">

### ⭐ ¿Te fue útil? Dale una estrella al repositorio

[![GitHub Stars](https://img.shields.io/github/stars/Luiscrespo-bot/Tira-led?style=social)](https://github.com/Luiscrespo-bot/Tira-led)

---

## 🌐 Redes sociales

- Instagram: [@luchx_crespoo](https://instagram.com/luchx_crespoo)
- GitHub: [Luiscrespo-bot](https://github.com/Luiscrespo-bot)

**Última actualización:** Octubre 2026  
**Estado del Proyecto:** ✅ Completado y Funcional  
**Licencia:** Educativa y de Investigación

Made with 💚 by [Luis Crespo](https://github.com/Luiscrespo-bot)

</div>
