# TODO · La Barra Retro — Registro de sesiones y estado del proyecto

---

## ✅ SESIÓN 1 — Efectos de sonido y base inicial
- [x] Estructura base React 19 + Vite 8 — reproductor MP3 local
- [x] Motor de audio de 3 capas: música / murmullo ambiente / FX aleatorios
- [x] Pool de FX con 14 archivos de audio en `/assets/efecttos/`
- [x] `scheduleFx()` con temporizador 18–30 s y probabilidades ponderadas
- [x] Visualizador canvas (48 barras, animación sintética)
- [x] HUD ocultable con mixers de volumen independientes
- [x] Tickers marquesina superior e inferior
- [x] Botón SALUD con FX de copas
- [x] Eliminar duplicado de `scheduleFx` en App.jsx
- [x] Validación `npm run build` exitosa

---

## ✅ SESIÓN 2 — Limpieza visual y modal de configuración
- [x] Extracción del bloque `audio-config` del HUD a componente `<ConfigModal>`
- [x] Modal con estética cyber-retro: dots macOS, borde degradado neón, selects custom
- [x] `hud-topbar`: botón cargar MP3 + botón engranaje ⚙ en fila compacta
- [x] Playlist sin límite (eliminado `slice(0, 7)`)
- [x] Scrollbar cyan personalizada en playlist
- [x] Responsive mobile para el modal (columna simple)
- [x] `revealHud()` no auto-oculta el HUD mientras el modal está abierto

---

## ✅ SESIÓN 3 — Alto impacto visual y Bar Social (frontend completo)

### Audio
- [x] **Web Audio API AnalyserNode real** — barras reaccionan a frecuencias de la música
  - 64 barras (antes 48), gradiente cyan → magenta por frecuencia
  - Boost visual en graves (primeras 20 barras × 1.4)
  - Fallback sintético si el browser bloquea el AudioContext
- [x] **rAF cancelado en pausa** — cero CPU desperdiciada; idle suave activo
- [x] `onError` en `<audio>` — skip automático + toast si un MP3 falla

### Reproducción
- [x] **Shuffle** — orden aleatorio, sin repetir pista actual
- [x] **Repeat** — ciclo: off → toda la lista → una pista
- [x] Botones **Prev / Next** independientes en transport
- [x] `prevTrack` inteligente: < 3 s → pista anterior; ≥ 3 s → vuelve al inicio
- [x] `handleTrackEnded` respeta repeatMode y shuffleMode

### Atajos de teclado
- [x] `Space`   — play / pausa
- [x] `←` / `→` — pista anterior / siguiente
- [x] `M`        — mute/restore música
- [x] `F`        — toggle fullscreen
- [x] Ignorados si el foco está en INPUT / TEXTAREA / SELECT

### Persistencia
- [x] Hook `useLocalStorage` — persiste entre sesiones:
  - `brv_musicVol`, `brv_ambientVol`, `brv_fxVol`
  - `brv_audioConfig` (efectos seleccionados)
  - `brv_shuffle`, `brv_repeat`

### UX y feedback
- [x] **Toast auto-dismiss** — componente `<Toast>` con barra de progreso animada (4.2 s)
- [x] Fade animado del título de pista al cambiar (`track-fade-out / track-fade-in`)
- [x] Punto pulsante verde junto a la pista activa en playlist
- [x] Hint de atajos de teclado con `<kbd>` al pie del HUD
- [x] **Fullscreen API** — botón dedicado en HUD; tickers se ocultan en pantalla completa

### Visual de alto impacto
- [x] **Partículas de ambiente** — 18 puntos cyan/magenta/verde flotando en loop
- [x] Fondo con 3 radial-gradients + scanlines CRT reforzadas
- [x] `neon-pulse` en h1 — respira entre intensidades
- [x] `ring-breathe` en el anillo del visualizador
- [x] `cheers-glow` continuo en botón SALUD
- [x] `pulse-dot` en indicador de presencia
- [x] `flicker-text` sutil en subtítulo (efecto neón real)

---

## 🔲 PRÓXIMA SESIÓN — Fase 2: Bar Social (Backend)

### Prioridad Alta
- [ ] Servidor **Node.js + Express** base
- [ ] **Socket.io** — eventos: `greeting:send`, `cheers:broadcast`, `presence:update`
- [ ] Saludos de marquesina en tiempo real entre usuarios distintos
- [ ] Botón SALUD dispara animación/FX en TODAS las pantallas conectadas
- [ ] Contador de presencia real (sockets activos)

### Prioridad Media
- [ ] **Redis** — historial últimos 50 saludos (LPUSH/LTRIM)
  - Al conectar un usuario nuevo: recibe el historial y la marquesina no arranca vacía
- [ ] Nickname de sesión — asignado aleatoriamente al conectar (estilo bar: "El de la mesa 7")
- [ ] Sala de chat lateral colapsable — conversación entre usuarios conectados

### Prioridad Baja / Escalabilidad
- [ ] Salas temáticas con URL propia: `/bar80s`, `/disco90s`, `/pub`
- [ ] Cada sala: ambiente acústico diferente + presencia independiente
- [ ] Sistema Freemium: salas premium con más efectos
- [ ] Despliegue: frontend → Vercel, backend → Railway

### Deuda técnica pendiente
- [ ] Refactor `App.jsx` → hooks custom: `useAudioEngine`, `useFxScheduler`, `useVisualizer`
- [ ] Migración a **Tailwind v4** (opcional — alinea con stack CallSysPRO / POS)
- [ ] `useCallback` en `revealHud` (dependencia estable)
- [ ] Waveform scrubber visual sobre el range de progreso

---

## 📁 Estructura actual del proyecto

```
barra/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── assets/
│   └── efecttos/          ← 14 archivos MP3 de efectos (NO MODIFICAR)
│       ├── Efecto Murmullo de Ambiente en bar.mp3
│       ├── Efecto Copas chocando.mp3
│       ├── Efecto DESTAPAR CERVEZA.mp3
│       ├── Efecto aplauso-medio_.mp3
│       └── ... (10 más)
├── src/
│   ├── App.jsx            ← Lógica principal (hooks, audio, UI, estado)
│   ├── App.css            ← Estilos completos con variables CSS retro
│   ├── index.css          ← Reset global + variables de tipografía
│   └── main.jsx           ← Bootstrap React
├── package.json
├── vite.config.js
├── README.md
└── TODO.md                ← Este archivo
```

## 🔑 Keys de localStorage
| Key               | Valor             | Descripción                        |
|-------------------|-------------------|------------------------------------|
| `brv_musicVol`    | number 0–1        | Volumen de música                  |
| `brv_ambientVol`  | number 0–1        | Volumen de murmullo                |
| `brv_fxVol`       | number 0–1        | Volumen de efectos FX              |
| `brv_audioConfig` | object {4 keys}   | Efectos seleccionados por canal    |
| `brv_shuffle`     | boolean           | Modo aleatorio                     |
| `brv_repeat`      | 'none'/'all'/'one'| Modo de repetición                 |

## ⌨️ Atajos de teclado activos
| Tecla    | Acción                          |
|----------|---------------------------------|
| `Space`  | Play / Pausa                    |
| `←`      | Pista anterior (o reinicio)     |
| `→`      | Siguiente pista                 |
| `M`      | Mute / Restore música           |
| `F`      | Toggle pantalla completa        |

> **Nota:** Los atajos se desactivan automáticamente cuando el foco
> está en un INPUT, TEXTAREA o SELECT.

## ⚠️ Reglas de arquitectura establecidas
1. **Efectos de sonido intocables** — `playFxFile`, `scheduleFx`,
   `playRandomRoomFx` y los 14 archivos MP3 NO se modifican.
2. El audio se procesa 100% en el cliente — ningún archivo se sube al servidor.
3. El AnalyserNode se crea una sola vez por sesión tras el primer gesto del usuario.
4. El rAF del visualizador se cancela al pausar y se relanza al reproducir.
5. Todos los valores de usuario se persisten con el prefijo `brv_` en localStorage.
