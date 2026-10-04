# Bitácora de Ingeniería Inversa: Tira LED "Miracles Star"
*(Fabricante: ShenZhen Lenze Technology Co., Ltd.)*

---

## 1. Fase Inicial: Análisis Documental y Deducción Lógica
La investigación comenzó sin interactuar con el dispositivo, partiendo estrictamente de la evidencia física (caja y manual).
* **Descubrimientos Base:** Tira LED de 3 metros, 15W, alimentada por USB (5V), "Dream color RGB".
* **Métodos de Control:** Botón físico, Control remoto IR (24 teclas), y la aplicación oficial **"Miracles Star"**.
* **Hipótesis Inicial:** Basado en el ecosistema actual del mercado, se planteó la hipótesis de que el dispositivo utilizaba un chip genérico de Bluetooth Low Energy (BLE) y que se podía interactuar con él eludiendo la aplicación oficial.

---

## 2. Construcción de Herramientas: LED-BLE Analyzer AI
Para garantizar una observación controlada y evitar el "código cerrado" de aplicaciones de terceros, se desarrolló una herramienta propia basada en **Web Bluetooth API** (`HTML`/`JS`/`CSS`).
* **Ventaja:** Permitió evadir las restricciones de emparejamiento del sistema operativo Windows.
* **Funcionalidades:** Motor de conexión, filtro de dispositivos, lectura del árbol GATT (Servicios y Características), inyección de código Hexadecimal (TX) y suscripción a respuestas (RX).
* **Mejora Crítica:** Se le incorporó un módulo de **Auto-Fuzzing** para probar automáticamente los 10 idiomas/protocolos de iluminación comercial más comunes del mundo (Triones, Zengge, Lotus, iDeal, etc.).

---

## 3. Fase 2: Descubrimiento BLE y Árbol GATT
El uso del *Analyzer* permitió descubrir la topología interna del dispositivo.
* **Nombre del Controlador:** `GATT--DEMO`.
* **Confirmación Absoluta:** Se cruzó la información con la app oficial en iOS, confirmando que la aplicación "Miracles Star" se conecta exactamente a ese dispositivo `GATT--DEMO`.
* **Topología (El canal de comunicación):**
  * **Servicio Principal:** `0000fff0`
  * **Canal de Escritura (TX):** `0000fff3` (Acepta `WRITE` y `WRITE_WITHOUT_RESPONSE`).
  * **Canal de Recepción (RX):** `0000fff4` (Canal de Notificaciones `NOTIFY`).

---

## 4. Fase 3: Fuzzing y la Barrera Criptográfica
Se procedió a la inyección masiva de los 10 comandos más comunes directamente al chip (canal `fff3`).
* **Resultado:** La capa Bluetooth aceptó los paquetes, pero el controlador ignoró absolutamente todos ellos. La tira LED no reaccionó y no devolvió ningún mensaje de estado en el canal de lectura.
* **Diagnóstico:** Se identificó a la empresa desarrolladora (**ShenZhen Lenze Technology Co., Ltd.**). Esto explicó el fallo del fuzzing: Lenze Technology utiliza microcontroladores (familia ST17H66) que aplican una **validación estricta de paquetes**. No admiten comandos crudos; requieren un algoritmo matemático de validación (Checksum, CRC, o cifrado simple por XOR) en cada envío. Si la matemática falla, el chip descarta el paquete en silencio.

---

## 5. El Desbloqueo: Cómo Hackearemos la Tira LED (Plan Futuro)
Dado que es imposible adivinar matemáticamente el algoritmo de validación de Lenze mediante fuerza bruta, el desbloqueo final requerirá la "Piedra Rosetta" de la comunicación: **un archivo de intercepción real**.

Así es como procederemos para realizar el desbloqueo final:

### Paso A: Extracción del Paquete Real (HCI Snoop)
Se utilizará un dispositivo Android (dado que iOS no lo permite sin hardware de pago) para espiar el Bluetooth a nivel de kernel.
1. Se activan las "Opciones de Desarrollador" en el Android.
2. Se activa el **Registro de espionaje Bluetooth (HCI Snoop Log)**.
3. Se abre la app *Miracles Star*, se conecta la tira y se hace una sola acción pura: Poner la tira en **Color Rojo**.
4. Se exporta el archivo `btsnoop_hci.log`.

### Paso B: Análisis Forense del Log
La Inteligencia Artificial (LED-BLE Research AI) analizará ese archivo con herramientas como *Wireshark*.
1. **Aislamiento:** Filtraremos todo el "ruido" de Android hasta encontrar la línea exacta donde la app le escribe al canal `fff3`.
2. **Desmontaje:** Veremos la trama hexadecimal cruda real (Ejemplo inventado: `0F 5A 02 FF 00 00 A4`).

### Paso C: Ingeniería Inversa del Algoritmo (Crackeo)
Compararemos el código lógico (Rojo = `FF 00 00`) con el resto de bytes "basura" del paquete para descubrir la fórmula.
* *Ejemplo de pensamiento lógico de la IA:* Si el último byte es `A4`, y la suma de `0F+5A+02+FF` da `1A4`, entonces sabemos que el algoritmo de Lenze es simplemente sumar todos los bytes anteriores y enviar los últimos dos dígitos.

### Paso D: Creación del Controlador Propio
Una vez descubierta la fórmula de Lenze:
1. Actualizaremos el `app.js` de nuestro Analyzer.
2. Escribiremos una función de JavaScript que tome el color que queramos, aplique la fórmula matemática secreta descubierta, y envíe el paquete validado a la tira.
3. **Resultado:** Control total, legítimo y absoluto sobre el dispositivo `GATT--DEMO` sin necesidad de la aplicación oficial.
