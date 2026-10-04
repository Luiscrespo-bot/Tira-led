# Reporte de Investigación LED-BLE: Estado Actual

## 1. Identidad y Misión del Proyecto
Este proyecto tiene como objetivo comprender experimentalmente cómo funciona el controlador Bluetooth de una tira LED RGB (asociada a la app "Miracles Star") para desarrollar una aplicación propia compatible. Todo avance se basa estrictamente en el ciclo: **OBSERVAR → MEDIR → COMPARAR → FORMULAR HIPÓTESIS → EXPERIMENTAR → VERIFICAR → DOCUMENTAR**.

---

## 2. Fase 1: Identificación del Dispositivo (Completada)
Se ha llevado a cabo el análisis exhaustivo de la evidencia documental (embalaje y manual del producto).

### 2.1 Especificaciones de Hardware Confirmadas
* **Producto:** Tira LED RGB "Dream color".
* **Longitud:** 3 metros.
* **Potencia Nominal:** 15 W.
* **Alimentación:** USB a 5 V (Corriente teórica de ~3 A).
* **Vida útil:** 15.000 horas.
* **Distancia de control inalámbrico:** 5 m.

### 2.2 Métodos de Control Identificados
1. **Botón físico en la tira:**
   * Pulsación corta: Cambia modo luminoso.
   * Pulsación larga (~3s): Enciende/Apaga.
2. **Control Remoto Infrarrojo (24 teclas):**
   * Encendido/Apagado, RGB (y selector multicolor), Modos (M1 a M8), Temporizadores (2H, 4H, 6H, 8H), Velocidad (M+, M-), Modos Musicales (1 y 2).
3. **Aplicación Móvil:**
   * **Nombre oficial:** *Miracles Star*.
   * **Conectividad:** Bluetooth.
   * **Controles mostrados:** ON/OFF, selector de color, corrección del orden RGB, decenas de modos/efectos dinámicos, ajuste de brillo, ajuste de velocidad, modo micrófono (con sensibilidad), configuración de cantidad de LEDs (Píxeles), e indicador de conexión Bluetooth (0/1).

### 2.3 Comportamiento Base Confirmado
* Al conectar la alimentación, la tira se enciende por defecto en un ciclo de cambio de 7 colores.

### 2.4 Estado de los Protocolos y Criptografía
* **Protocolo BLE:** Parcialmente descubierto (Capa GATT identificada).
* **UUIDs (Service & Characteristic):** Confirmados (Ver Sección 4).
* **Estructura de paquetes / Comandos Hexadecimales:** `DESCONOCIDOS`.
* **Seguridad (Autenticación/Cifrado):** `PROBABLE` (Evidencia empírica indica validación estricta de paquetes, posible ofuscación de Lenze Technology).

---

## 3. Desarrollo de Herramientas (En curso)
Para evitar depender de aplicaciones de terceros opacas y mantener un control estricto de la observación, se desarrolló una herramienta web a medida: **LED-BLE Analyzer AI**.

### 3.1 Componentes del LED-BLE Analyzer
* **`index.html`**: Estructura de la aplicación web tipo dashboard.
* **`style.css`**: Estilización premium (modo oscuro, glassmorphism, tipografías modernas) para crear una estación de ingeniería inversa agradable y funcional.
* **`app.js`**: Lógica de interacción usando la API nativa **Web Bluetooth**.

### 3.2 Funcionalidades Integradas
1. **Motor de Búsqueda y Conexión:**
   * Implementación de un campo de **Filtro de Nombre (Prefijo)** para evitar saturar la lista de dispositivos con televisores o auriculares cercanos.
   * Campo de **Servicios Opcionales** con UUIDs predefinidos comunes en LEDs (0000fff0, 0000ffe5, etc.) para eludir las restricciones de seguridad de Web BLE.
2. **Exploración GATT (Fase 2):**
   * Capacidad de conectarse al servidor GATT del dispositivo.
   * Descubrimiento automático de Servicios Primarios.
   * Enumeración de *Characteristics* y sus propiedades (READ, WRITE, WRITE_WITHOUT_RESPONSE, NOTIFY).
3. **Laboratorio de Paquetes (Inyección TX/RX):**
   * Interfaz para escribir cargas útiles (payloads) en Hexadecimal hacia características `WRITE`.
   * Botón de suscripción para escuchar respuestas de la tira hacia el navegador (`NOTIFY`).
4. **Terminal de Logs:**
   * Registro con marcas de tiempo (timestamps) de todas las conexiones, errores y paquetes recibidos para facilitar el análisis comparativo.

---

## 4. Fase 2: Descubrimiento BLE (Completada)
Mediante el uso del **LED-BLE Analyzer AI**, se logró conectar exitosamente a la tira LED.

### 4.1 Identificación Exacta
* **Nombre del Dispositivo:** `GATT--DEMO`
* **Confirmación Cruzada:** Una captura de la app oficial "Miracles Star" en iOS confirmó que se conecta exactamente al mismo dispositivo `GATT--DEMO`.

### 4.2 Árbol GATT Descubierto
* **Servicio Primario:** `0000fff0-0000-1000-8000-00805f9b34fb`
* **Característica de Transmisión (TX):** `0000fff3-0000-1000-8000-00805f9b34fb`
  * Propiedades: `WRITE`, `WRITE_WITHOUT_RESPONSE`
* **Característica de Recepción (RX):** `0000fff4-0000-1000-8000-00805f9b34fb`
  * Propiedades: `NOTIFY`

---

## 5. Fase 3: Descubrimiento de Comandos (Fuzzing Fallido)
Se ejecutó un proceso de **Fuzzing Guiado** automático enviando 10 de los protocolos de tiras LED comerciales más comunes (Triones, Zengge, HappyLighting, iDeal, Lotus, etc.) hacia la característica de escritura (`fff3`).

### Resultados Empíricos:
* **Transmisión:** La capa BLE (GATT) aceptó todos los paquetes sin arrojar error.
* **Recepción (RX):** La característica `fff4` (Notify) no devolvió ningún acuse de recibo o mensaje de error.
* **Reacción Física:** La tira LED no presentó **ningún tipo de reacción** a los comandos enviados. Ignoró todos los paquetes de forma silenciosa.

---

## 6. Identidad del Fabricante y Bloqueo de Protocolo
Una inspección cruzada confirmó que el desarrollador oficial de la aplicación "Miracles Star" en la App Store es **ShenZhen Lenze Technology Co., Ltd.**

### 6.1 Análisis Criptográfico (Hipótesis Fuerte)
* Lenze Technology es un conocido fabricante de microcontroladores BLE (ej. familia ST17H66) que implementa mecanismos de seguridad y validación de protocolos ofuscados.
* El descarte silencioso de los 10 paquetes enviados confirma que el controlador exige un Handshake inicial o una **Suma de Verificación (Checksum/CRC) / Cifrado básico** estricto en cada trama.

### 6.2 Plan de Acción Actual (Estado: Bloqueado)
Intentar descifrar el algoritmo matemático de Lenze mediante fuerza bruta a ciegas es estadísticamente inviable en este momento.

**Siguiente paso forzoso:** 
* El sistema requiere capturar un log de interceptación Bluetooth (**HCI Snoop Log**) utilizando un dispositivo Android, para extraer un paquete válido real generado por la app Miracles Star y usarlo como "Piedra Rosetta" para descifrar el algoritmo.
