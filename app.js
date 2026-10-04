// Elementos del DOM
const btnConnect = document.getElementById('btn-connect');
const btnDisconnect = document.getElementById('btn-disconnect');
const btnSend = document.getElementById('btn-send');
const btnFuzz = document.getElementById('btn-fuzz');
const btnClearLog = document.getElementById('btn-clear-log');
const terminal = document.getElementById('terminal');
const deviceDetails = document.getElementById('device-details');
const servicesList = document.getElementById('services-list');
const targetUuidInput = document.getElementById('target-uuid');
const hexPayloadInput = document.getElementById('hex-payload');
const optionalServicesInput = document.getElementById('optional-services');
const nameFilterInput = document.getElementById('name-filter');

// Estado Global
let bleDevice = null;
let gattServer = null;
let activeCharacteristics = {}; // Almacena referencias a características seleccionables

// Utilidades de Terminal
function log(msg, type = 'info') {
    const time = new Date().toLocaleTimeString();
    const div = document.createElement('div');
    div.className = `log-${type}`;
    div.innerHTML = `<span style="color:#64748b">[${time}]</span> ${msg}`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
}

btnClearLog.addEventListener('click', () => terminal.innerHTML = '');

// Utilidades Hex / ArrayBuffer
function hexStringToArrayBuffer(hexString) {
    hexString = hexString.replace(/\s+/g, '').replace(/0x/g, '');
    if (hexString.length % 2 !== 0) {
        throw new Error("La longitud hexadecimal debe ser par.");
    }
    const bytes = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < hexString.length; i += 2) {
        bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
    }
    return bytes.buffer;
}

function arrayBufferToHexString(buffer) {
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
}

// Conexión BLE
btnConnect.addEventListener('click', async () => {
    try {
        if (!navigator.bluetooth) {
            log('Tu navegador no soporta Web Bluetooth API. Usa Chrome o Edge.', 'error');
            return;
        }

        const rawServices = optionalServicesInput.value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        const namePrefix = nameFilterInput.value.trim();
        
        log('Solicitando dispositivo Bluetooth...', 'info');
        
        const requestConfig = {};

        if (namePrefix) {
            requestConfig.filters = [{ namePrefix: namePrefix }];
        } else {
            requestConfig.acceptAllDevices = true;
        }

        if (rawServices.length > 0) {
            requestConfig.optionalServices = rawServices;
        }

        bleDevice = await navigator.bluetooth.requestDevice(requestConfig);
        
        log(`Dispositivo seleccionado: ${bleDevice.name || 'Sin nombre'} (${bleDevice.id})`, 'success');
        deviceDetails.innerHTML = `
            <strong>Nombre:</strong> ${bleDevice.name || 'UNKNOWN'}<br>
            <strong>ID:</strong> ${bleDevice.id}
        `;

        bleDevice.addEventListener('gattserverdisconnected', onDisconnected);

        log('Conectando al servidor GATT...', 'info');
        gattServer = await bleDevice.gatt.connect();
        
        log('¡Conectado al servidor GATT!', 'success');
        btnConnect.disabled = true;
        btnDisconnect.disabled = false;
        
        await exploreGattServer();

    } catch (error) {
        log(`Error de conexión: ${error.message}`, 'error');
        console.error(error);
    }
});

function onDisconnected() {
    log('Dispositivo desconectado.', 'warn');
    btnConnect.disabled = false;
    btnDisconnect.disabled = true;
    btnSend.disabled = true;
    hexPayloadInput.disabled = true;
    deviceDetails.innerHTML = 'Desconectado';
    servicesList.innerHTML = '<div class="empty-state">Desconectado</div>';
    targetUuidInput.value = '';
    bleDevice = null;
    gattServer = null;
    activeCharacteristics = {};
}

btnDisconnect.addEventListener('click', () => {
    if (bleDevice && bleDevice.gatt.connected) {
        bleDevice.gatt.disconnect();
    }
});

// Explorar GATT
async function exploreGattServer() {
    try {
        log('Descubriendo servicios primarios...', 'info');
        const services = await gattServer.getPrimaryServices();
        log(`Encontrados ${services.length} servicios declarados.`, 'success');
        document.getElementById('gatt-badge').innerText = services.length;
        
        servicesList.innerHTML = '';

        for (const service of services) {
            log(`Analizando Servicio: ${service.uuid}`, 'info');
            
            const serviceDiv = document.createElement('div');
            serviceDiv.className = 'service-block';
            serviceDiv.innerHTML = `<div class="service-title">Service UUID: ${service.uuid}</div>`;
            
            try {
                const characteristics = await service.getCharacteristics();
                for (const char of characteristics) {
                    activeCharacteristics[char.uuid] = char;
                    
                    const charDiv = document.createElement('div');
                    charDiv.className = 'char-block';
                    
                    let propsHtml = '';
                    let canWrite = false;
                    let canNotify = false;
                    
                    if (char.properties.read) propsHtml += `<span class="prop-badge can-read">READ</span>`;
                    if (char.properties.write) { propsHtml += `<span class="prop-badge can-write">WRITE</span>`; canWrite = true; }
                    if (char.properties.writeWithoutResponse) { propsHtml += `<span class="prop-badge can-write">WRITE_NO_RESP</span>`; canWrite = true; }
                    if (char.properties.notify) { propsHtml += `<span class="prop-badge can-notify">NOTIFY</span>`; canNotify = true; }
                    if (char.properties.indicate) propsHtml += `<span class="prop-badge can-notify">INDICATE</span>`;

                    let actionBtn = '';
                    if (canWrite) {
                        actionBtn += `<button class="select-char-btn" onclick="selectTargetChar('${char.uuid}')">Target Tx</button>`;
                    }
                    if (canNotify) {
                        actionBtn += `<button class="select-char-btn" onclick="subscribeNotify('${char.uuid}')">Sub Rx</button>`;
                    }

                    charDiv.innerHTML = `
                        <div>
                            <div class="char-uuid">${char.uuid}</div>
                            <div class="char-props" style="margin-top: 4px;">${propsHtml}</div>
                        </div>
                        <div>${actionBtn}</div>
                    `;
                    serviceDiv.appendChild(charDiv);
                }
            } catch (err) {
                log(`No se pudieron leer características del servicio ${service.uuid}. Asegúrate de que esté en "Servicios Opcionales".`, 'warn');
                serviceDiv.innerHTML += `<div class="char-block" style="color:var(--danger)">Error: No accesible por Web BLE</div>`;
            }

            servicesList.appendChild(serviceDiv);
        }

    } catch (error) {
        log(`Error al descubrir servicios: ${error.message}`, 'error');
    }
}

// Interacción Experimental
window.selectTargetChar = function(uuid) {
    targetUuidInput.value = uuid;
    hexPayloadInput.disabled = false;
    btnSend.disabled = false;
    btnFuzz.disabled = false;
    log(`Característica objetivo seleccionada para envío (Tx): ${uuid}`, 'info');
};

window.subscribeNotify = async function(uuid) {
    try {
        const char = activeCharacteristics[uuid];
        if (!char) return;
        
        await char.startNotifications();
        char.addEventListener('characteristicvaluechanged', handleNotifications);
        log(`Suscrito a notificaciones (Rx) en: ${uuid}`, 'success');
    } catch (error) {
        log(`Error al suscribir a ${uuid}: ${error.message}`, 'error');
    }
};

function handleNotifications(event) {
    const value = event.target.value;
    const hex = arrayBufferToHexString(value.buffer);
    log(`Notificación recibida [${event.target.uuid}]: <span style="color:#ebcb8b; font-weight:bold">${hex}</span>`, 'data');
}

btnSend.addEventListener('click', async () => {
    const uuid = targetUuidInput.value;
    const hex = hexPayloadInput.value;
    
    if (!uuid || !hex) {
        log('Falta UUID destino o comando HEX', 'error');
        return;
    }

    try {
        const char = activeCharacteristics[uuid];
        if (!char) {
            log('Característica no encontrada en memoria.', 'error');
            return;
        }

        const buffer = hexStringToArrayBuffer(hex);
        log(`Enviando a ${uuid}: ${hex}`, 'info');
        
        if (char.properties.writeWithoutResponse) {
            await char.writeValueWithoutResponse(buffer);
        } else {
            await char.writeValue(buffer);
        }
        
        log(`Paquete enviado con éxito.`, 'success');
    } catch (error) {
        log(`Error enviando paquete: ${error.message}`, 'error');
    }
});

// Auto Fuzzing Array
const payloadsToTry = [
    "FF", // Basic
    "56 FF 00 00 00 F0 AA", // Triones
    "7E 00 04 F0 00 01 FF 00 EF", // Zengge 1
    "7E 04 04 F0 00 01 FF 00 EF", // Zengge 2
    "CC 23 33", // HappyLighting
    "5A 00 01 FF 00 00 00 00 A5", // Generic 5A
    "69 96 05 01 00 00 00", // Magic 69
    "01 01 01 01", // Lotus
    "04 00 00 00 00 00 00 00 04", // iDeal
    "BB 00 01 02 03 04 00 00 00 44" // LED Hue
];

btnFuzz.addEventListener('click', async () => {
    const uuid = targetUuidInput.value;
    const char = activeCharacteristics[uuid];
    if (!char) {
        log('Característica objetivo no seleccionada.', 'error');
        return;
    }
    
    btnFuzz.disabled = true;
    log('--- INICIANDO FUZZING AUTOMÁTICO ---', 'warn');
    
    for (let i = 0; i < payloadsToTry.length; i++) {
        const hex = payloadsToTry[i];
        log(`[${i+1}/${payloadsToTry.length}] Probando: ${hex}`, 'info');
        try {
            const buffer = hexStringToArrayBuffer(hex);
            if (char.properties.writeWithoutResponse) {
                await char.writeValueWithoutResponse(buffer);
            } else {
                await char.writeValue(buffer);
            }
            // Esperar 1.5 segundos entre cada envío para que el usuario pueda ver si hay reacción
            await new Promise(r => setTimeout(r, 1500));
        } catch (e) {
            log(`Error en envío: ${e.message}`, 'error');
        }
    }
    
    log('--- FUZZING COMPLETADO ---', 'success');
    btnFuzz.disabled = false;
});
