# 🎧 La Barra Retro

Aplicación web inmersiva de música retro 80s/90s con experiencia de bar social virtual.
Reproduce MP3 locales del usuario mezclados con capas de murmullo y efectos de ambiente
en tiempo real, sin subir ningún archivo al servidor.

**Stack:** React 19 · Vite 8 · Web Audio API · Canvas 2D · CSS puro · localStorage

---

## ✨ Features implementadas (v0.3 — Sesión 3)

### 🔊 Motor de audio inmersivo
- Reproductor MP3 local con carga de carpeta entera (`webkitdirectory`)
- **3 capas de audio independientes** con volumen ajustable:
  - Canal 1: Música del usuario
  - Canal 2: Murmullo de ambiente (loop continuo)
  - Canal 3: FX aleatorios cada 18–30 s (copas, destapes, aplausos, multitud)
- **14 efectos de sonido** configurables por canal vía modal ⚙
- FX pool con limpieza automática — múltiples efectos superpuestos sin memory leaks

### 🎛️ Reproducción avanzada
- Play / Pausa / Prev / Next
- **Shuffle** — orden aleatorio sin repetir pista actual
- **Repeat** — off / toda la lista / una pista
- `prevTrack` inteligente: < 3 s reproducidos → pista anterior; ≥ 3 s → reinicio
- Skip automático si un MP3 falla al cargar
- Playlist completa con scroll y punto pulsante en pista activa

### 📺 Visualizador real (Web Audio API)
- **AnalyserNode** conectado al audio — 64 barras reaccionan a frecuencias reales
- Gradiente cyan (graves) → magenta (agudos)
- Boost visual en graves × 1.4 para mayor impacto
- Fallback sintético si el browser bloquea el AudioContext
- rAF cancelado en pausa — cero CPU desperdiciada

### 🎨 Experiencia visual de alto impacto
- Fondo con 3 radial-gradients + grid retro + scanlines CRT
- 18 partículas de ambiente (cyan/magenta/verde) flotando en loop
- Animación `neon-pulse` en el título principal
- `ring-breathe` en el anillo orbital del visualizador
- `cheers-glow` en el botón SALUD
- Fade animado del nombre de pista al cambiar
- Indicador de presencia con punto verde pulsante

### 💾 Persistencia de preferencias
Hook `useLocalStorage` — todo se recuerda entre sesiones:

| Key               | Descripción                     |
|-------------------|---------------------------------|
| `brv_musicVol`    | Volumen de música               |
| `brv_ambientVol`  | Volumen de murmullo             |
| `brv_fxVol`       | Volumen de FX                   |
| `brv_audioConfig` | Efectos seleccionados por canal |
| `brv_shuffle`     | Modo aleatorio                  |
| `brv_repeat`      | Modo de repetición              |

### ⌨️ Atajos de teclado
| Tecla   | Acción                       |
|---------|------------------------------|
| `Space` | Play / Pausa                 |
| `←`     | Pista anterior (o reinicio)  |
| `→`     | Siguiente pista              |
| `M`     | Mute / Restore música        |
| `F`     | Toggle pantalla completa     |

> Se desactivan automáticamente cuando el foco está en un campo de texto.

### 💬 Capa social (local — preparada para WebSockets)
- Marquesina de saludos superior e inferior (ticker neón)
- Input para enviar saludos a la marquesina
- Botón **¡SALUD!** con FX de copas y mensaje en marquesina
- Contador de presencia simulado (18–86 personas)

---

## 🛠️ Stack tecnológico

| Capa        | Tecnología          | Función                                      |
|-------------|---------------------|----------------------------------------------|
| Frontend    | React 19            | Componentes, estado, hooks                   |
| Build tool  | Vite 8              | Dev server, HMR, build de producción         |
| Audio       | Web Audio API       | AnalyserNode, AudioContext, FX pool          |
| Visual      | Canvas 2D API       | Visualizador de frecuencias en tiempo real   |
| Estilos     | CSS puro            | Variables, animaciones, responsive, grid     |
| Estado      | useState + useRef   | Reproducción, UI, audio layers               |
| Persistencia| localStorage        | Preferencias de usuario entre sesiones       |

---

## 🚀 Instalación y desarrollo

### Requisitos
- **Node.js** 20.x LTS o superior
- **npm** (incluido con Node.js)

```bash
# Clonar y entrar al directorio
git clone <URL_DEL_REPOSITORIO>
cd barra

# Instalar dependencias
npm install

# Servidor de desarrollo (http://localhost:5173)
npm run dev
```

### Scripts disponibles

| Comando         | Descripción                                    |
|-----------------|------------------------------------------------|
| `npm run dev`   | Inicia servidor de desarrollo con HMR          |
| `npm run build` | Genera build de producción en `/dist`          |
| `npm run lint`  | Análisis estático con ESLint                   |
| `npm run preview` | Sirve la build de producción localmente     |

---

## 📁 Estructura del proyecto

```
barra/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── assets/
│   └── efecttos/              ← 14 MP3 de efectos (NO modificar)
│       ├── Efecto Murmullo de Ambiente en bar.mp3
│       ├── Efecto Copas chocando.mp3
│       ├── Efecto DESTAPAR CERVEZA.mp3
│       ├── Efecto aplauso-medio_.mp3
│       ├── Efecto Chicas Alegres en Fiesta.mp3
│       ├── Efecto Gente Hablando en una Fiesta (...).mp3
│       ├── Efecto DESTAPAR CERVEZA.mp3
│       ├── Efecto de Sonido - Destape Chelas.mp3
│       ├── Efecto Cayendo la chapa de la Cervez.mp3
│       ├── Efecto Verter-el-vino-en-una-copa.mp3
│       ├── Efecto se-vierte-cerveza (...).mp3
│       ├── Efecto multitud-en-una-fiesta_.mp3
│       ├── Efecto sala-de-conciertos (...).mp3
│       ├── Efecto gritos-de-aplauso (...).mp3
│       └── Efecto multitud_de_hombres (...).mp3
├── src/
│   ├── App.jsx                ← Componente principal + toda la lógica
│   ├── App.css                ← Estilos completos (retro / neón / responsive)
│   ├── index.css              ← Reset global + variables de tipografía
│   └── main.jsx               ← Bootstrap de React
├── index.html
├── package.json
├── vite.config.js
├── eslint.config.js
├── README.md
└── TODO.md                    ← Historial de sesiones y próximos pasos
```

---

## 🏗️ Arquitectura de componentes

```
App (principal)
├── useLocalStorage (hook)       ← Persistencia de preferencias
├── <Toast>                      ← Auto-dismiss con barra de progreso
├── <ConfigModal>                ← Modal de efectos de sonido
│   └── <IconChevronDown>
├── IconSettings / IconClose     ← SVG inline sin dependencias
├── IconShuffle / IconRepeat / IconRepeatOne
└── IconFullscreen / IconExitFullscreen
```

### Flujos de audio

```
Archivos MP3 locales
        │
        ▼
  <audio> (audioRef)
        │
        ▼
  AudioContext
        │
  MediaElementSource
        │
  AnalyserNode ──── frequencyData ──── Canvas (visualizer)
        │
  destination (speakers)

  <audio> (ambientAudioRef) ── loop ── murmullo
  Audio() pool ──────────────────────── FX aleatorios
```

---

## ⚠️ Reglas de arquitectura

1. **Efectos de sonido intocables** — `playFxFile`, `scheduleFx`, `playRandomRoomFx`
   y los 14 archivos MP3 en `/assets/efecttos/` **no se modifican**.
2. El audio se procesa 100% en el cliente — ningún archivo se sube al servidor.
3. El `AudioContext` + `AnalyserNode` se crean una sola vez por sesión,
   tras el primer gesto del usuario (requisito del browser).
4. El `rAF` del visualizador se cancela al pausar y se relanza al reproducir.
5. Todas las preferencias de usuario usan el prefijo `brv_` en localStorage.

---

## 🗺️ Roadmap — Fase 2: Bar Social

Ver `TODO.md` para el detalle completo. Resumen:

- **Backend:** Node.js + Express + Socket.io
- **Tiempo real:** saludos multiusuario, SALUD en todas las pantallas, presencia real
- **Base de datos:** Redis — historial últimos 50 saludos
- **Salas temáticas:** `/bar80s`, `/disco90s`, `/pub` — base del modelo Freemium
- **Deploy:** frontend → Vercel · backend → Railway
