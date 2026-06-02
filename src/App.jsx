import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const initialGreetings = [
  'Lima despierta con sintetizadores',
  'Alguien brinda desde Miraflores',
  'Rock de carretera en la barra',
  'Techno suave para cerrar la noche',
  'Mesa compartida, volumen perfecto',
]

const roomEffects = [
  'Efecto Copas chocando.mp3',
  'Efecto DESTAPAR CERVEZA.mp3',
  'Efecto aplauso-medio_.mp3',
  'Efecto Chicas Alegres en Fiesta.mp3',
  'Efecto se-vierte-cerveza-en-una-copa-burbujeo-de-la-botella-silbido-de-la-espuma.mp3',
]

const audioBasePath = `${import.meta.env.BASE_URL}assets/efecttos/`
const randomUnit = () => Math.random()

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

/* ─── Íconos SVG inline (sin dependencias externas) ─────────────────────── */
function IconSettings() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function IconChevronDown() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

/* ─── Modal de configuración de efectos ─────────────────────────────────── */
function ConfigModal({ audioConfig, effectOptions, onClose, onChangeConfig }) {
  const sections = [
    { key: 'ambient',  label: 'Murmullo de ambiente', icon: '〜' },
    { key: 'glass',    label: 'Choque de copas',       icon: '🥂' },
    { key: 'bottle',   label: 'Destape de botella',    icon: '🍺' },
    { key: 'applause', label: 'Aplausos',               icon: '👏' },
  ]

  return (
    <div className="cfg-overlay" role="dialog" aria-modal="true" aria-label="Configuración de efectos">
      <div className="cfg-modal">
        {/* Header */}
        <div className="cfg-header">
          <div className="cfg-header-left">
            <span className="cfg-dot" />
            <span className="cfg-dot" />
            <span className="cfg-dot" />
          </div>
          <p className="cfg-title">CONFIGURAR EFECTOS</p>
          <button type="button" className="cfg-close" onClick={onClose} aria-label="Cerrar">
            <IconClose />
          </button>
        </div>

        {/* Subtitle */}
        <p className="cfg-subtitle">
          Selecciona el archivo de audio para cada canal de ambiente
        </p>

        {/* Sections */}
        <div className="cfg-sections">
          {sections.map(({ key, label, icon }) => (
            <div key={key} className="cfg-row">
              <div className="cfg-row-label">
                <span className="cfg-row-icon">{icon}</span>
                <span>{label}</span>
              </div>
              <div className="cfg-select-wrap">
                <select
                  className="cfg-select"
                  value={audioConfig[key]}
                  onChange={(e) => onChangeConfig(key, e.target.value)}
                >
                  {effectOptions[key].map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="cfg-chevron"><IconChevronDown /></span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer hint */}
        <p className="cfg-hint">Los cambios se aplican en el próximo efecto aleatorio</p>
      </div>
    </div>
  )
}

/* ─── Componente principal ───────────────────────────────────────────────── */
function App() {
  const audioRef         = useRef(null)
  const ambientAudioRef  = useRef(null)
  const fxPoolRef        = useRef([])
  const fxTimerRef       = useRef(null)
  const canvasRef        = useRef(null)
  const rafRef           = useRef(null)
  const hideHudRef       = useRef(null)
  const tracksRef        = useRef([])
  const visualTimeRef    = useRef(0)

  const [tracks, setTracks]               = useState([])
  const [currentTrack, setCurrentTrack]   = useState(0)
  const [isPlaying, setIsPlaying]         = useState(false)
  const [hudVisible, setHudVisible]       = useState(true)
  const [configOpen, setConfigOpen]       = useState(false)
  const [musicVolume, setMusicVolume]     = useState(0.82)
  const [ambientVolume, setAmbientVolume] = useState(0.28)
  const [fxVolume, setFxVolume]           = useState(0.45)
  const [duration, setDuration]           = useState(0)
  const [progress, setProgress]           = useState(0)
  const [greetings, setGreetings]         = useState(initialGreetings)
  const [draftGreeting, setDraftGreeting] = useState('')
  const [toast, setToast]                 = useState('La barra esta lista')
  const [presence, setPresence]           = useState(37)
  const [audioConfig, setAudioConfig]     = useState({
    ambient:  'Efecto Murmullo de Ambiente en bar.mp3',
    glass:    'Efecto Copas chocando.mp3',
    bottle:   'Efecto DESTAPAR CERVEZA.mp3',
    applause: 'Efecto aplauso-medio_.mp3',
  })

  const activeTrack = tracks[currentTrack]
  const tickerText  = useMemo(
    () => greetings.map((item) => `// ${item}`).join('     '),
    [greetings],
  )

  const effectOptions = useMemo(() => {
    const mapOption = (file) => ({ value: file, label: file.replace(/^Efecto\s*/i, '') })
    return {
      ambient: [
        'Efecto Murmullo de Ambiente en bar.mp3',
        'Efecto Gente Hablando en una Fiesta Efecto de Sonido SIN COPYRIGHT (HD) [2020].mp3',
        'Efecto multitud-en-una-fiesta_.mp3',
        'Efecto sala-de-conciertos-multitud-de-fiesta-y-conversacion_.mp3',
        'Efecto Chicas Alegres en Fiesta.mp3',
      ].map(mapOption),
      glass: [
        'Efecto Copas chocando.mp3',
        'Efecto Verter-el-vino-en-una-copa.mp3',
        'Efecto se-vierte-cerveza-en-una-copa-burbujeo-de-la-botella-silbido-de-la-espuma.mp3',
      ].map(mapOption),
      bottle: [
        'Efecto DESTAPAR CERVEZA.mp3',
        'Efecto de Sonido - Destape Chelas.mp3',
        'Efecto Cayendo la chapa de la Cervez.mp3',
      ].map(mapOption),
      applause: [
        'Efecto aplauso-medio_.mp3',
        'Efecto gritos-de-aplauso-en-una-gran-sala-de-conciertos_.mp3',
        'Efecto multitud_de_hombres_emocionados_vitoreando,_gritando_y_celebrando.mp3',
      ].map(mapOption),
    }
  }, [])

  const ambientSrc = useMemo(
    () => `${audioBasePath}${encodeURIComponent(audioConfig.ambient)}`,
    [audioConfig.ambient],
  )

  /* ── Efectos de volumen ── */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume
  }, [musicVolume])

  useEffect(() => {
    if (ambientAudioRef.current) ambientAudioRef.current.volume = ambientVolume
  }, [ambientVolume])

  useEffect(() => {
    fxPoolRef.current.forEach((audio) => { audio.volume = fxVolume })
  }, [fxVolume])

  /* ── Presencia simulada ── */
  useEffect(() => {
    const interval = window.setInterval(() => {
      setPresence((v) => {
        const drift = Math.floor(randomUnit() * 5) - 2
        return Math.max(18, Math.min(86, v + drift))
      })
    }, 3800)
    return () => window.clearInterval(interval)
  }, [])

  /* ── Cleanup global ── */
  useEffect(() => {
    return () => {
      window.clearTimeout(hideHudRef.current)
      window.clearTimeout(fxTimerRef.current)
      window.cancelAnimationFrame(rafRef.current)
      tracksRef.current.forEach((t) => URL.revokeObjectURL(t.url))
      if (ambientAudioRef.current) {
        ambientAudioRef.current.pause()
        ambientAudioRef.current.src = ''
      }
      fxPoolRef.current.forEach((a) => { a.pause(); a.src = '' })
      fxPoolRef.current = []
    }
  }, [])

  /* ── Recarga de ambiente al cambiar fuente ── */
  useEffect(() => {
    if (ambientAudioRef.current) {
      ambientAudioRef.current.load()
      if (isPlaying) {
        ambientAudioRef.current.currentTime = 0
        ambientAudioRef.current.play().catch(() => {})
      }
    }
  }, [ambientSrc, isPlaying])

  /* ── Visualizador canvas ── */
  const drawVisualizer = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w   = canvas.clientWidth  * dpr
    const h   = canvas.clientHeight * dpr
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
    ctx.clearRect(0, 0, w, h)
    const bars    = 48
    const centerY = h / 2
    const barW    = w / bars
    const energy  = isPlaying ? 1 : 0.35
    visualTimeRef.current += 0.05
    const time = visualTimeRef.current
    for (let i = 0; i < bars; i++) {
      const wave     = Math.sin(time + i * 0.35) * 0.5 + 0.5
      const noise    = Math.sin(time * 0.8 + i * 1.3) * 0.5 + 0.5
      const strength = Math.max(0.08, (wave * 0.65 + noise * 0.35) * energy)
      const barH     = Math.max(10, strength * h * 0.72)
      const hue      = i % 2 === 0 ? '185, 255, 255' : '255, 65, 214'
      ctx.fillStyle  = `rgba(${hue}, ${0.26 + strength * 0.74})`
      ctx.shadowBlur = 24 + strength * 32
      ctx.shadowColor = `rgba(${hue}, 0.8)`
      ctx.fillRect(i * barW, centerY - barH / 2, barW * 0.48, barH)
    }
    rafRef.current = window.requestAnimationFrame(drawVisualizer)
  }

  /* ── FX pool ── */
  const playFxFile = async (fileName) => {
    if (!fileName) return
    const audio = new Audio(`${audioBasePath}${encodeURIComponent(fileName)}`)
    audio.volume = fxVolume
    audio.preload = 'auto'
    fxPoolRef.current.push(audio)
    audio.addEventListener('ended', () => {
      fxPoolRef.current = fxPoolRef.current.filter((a) => a !== audio)
    }, { once: true })
    try { await audio.play() } catch { /* autoplay bloqueado */ }
  }

  const playGlassClink = () => playFxFile(audioConfig.glass)
  const playBottlePop  = () => playFxFile(audioConfig.bottle)
  const playApplause   = () => playFxFile(audioConfig.applause)

  const playRandomRoomFx = () => {
    const r = randomUnit()
    if (r > 0.72) { playApplause();  setToast('Aplausos al fondo de la barra'); return }
    if (r > 0.42) { playBottlePop(); setToast('Una botella se abre cerca de la mesa'); return }
    if (r > 0.20) { playGlassClink(); setToast('Copas cruzando la noche'); return }
    playFxFile(roomEffects[Math.floor(randomUnit() * roomEffects.length)])
    setToast('Efecto de ambiente activado')
  }

  const scheduleFx = () => {
    window.clearTimeout(fxTimerRef.current)
    fxTimerRef.current = window.setTimeout(() => {
      if (isPlaying) playRandomRoomFx()
      scheduleFx()
    }, 18000 + randomUnit() * 12000)
  }

  useEffect(() => {
    scheduleFx()
    return () => window.clearTimeout(fxTimerRef.current)
  }, [isPlaying, audioConfig])

  /* ── Handlers ── */
  const handleFiles = (event) => {
    const files = Array.from(event.target.files || [])
      .filter((f) => f.type === 'audio/mpeg' || f.name.endsWith('.mp3'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ name: f.name.replace(/\.mp3$/i, ''), url: URL.createObjectURL(f) }))
    tracksRef.current.forEach((t) => URL.revokeObjectURL(t.url))
    tracksRef.current = files
    setTracks(files)
    setCurrentTrack(0)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setToast(files.length ? `${files.length} canciones cargadas` : 'No encontré MP3')
  }

  const startAmbient = async () => {
    if (!ambientAudioRef.current) return
    ambientAudioRef.current.volume = ambientVolume
    ambientAudioRef.current.loop   = true
    try { await ambientAudioRef.current.play() } catch { /* bloqueado */ }
  }

  const togglePlayback = async () => {
    if (!activeTrack || !audioRef.current) { setToast('Carga una carpeta con MP3 primero'); return }
    if (!rafRef.current) drawVisualizer()
    if (audioRef.current.paused) {
      await audioRef.current.play()
      await startAmbient()
      setIsPlaying(true)
      setToast('La noche empieza a sonar')
    } else {
      audioRef.current.pause()
      if (ambientAudioRef.current) ambientAudioRef.current.pause()
      setIsPlaying(false)
      setToast('Pausa suave en la barra')
    }
  }

  const selectTrack = (index) => {
    setCurrentTrack(index)
    setProgress(0)
    window.setTimeout(async () => {
      if (isPlaying && audioRef.current) await audioRef.current.play()
    }, 0)
  }

  const sendGreeting = () => {
    const msg = draftGreeting.trim()
    if (!msg) return
    setGreetings((items) => [msg, ...items].slice(0, 10))
    setDraftGreeting('')
    setToast(`Mensaje enviado: ${msg}`)
  }

  const toastCheers = () => {
    playGlassClink()
    setToast('SALUD recibido en toda la barra')
    setGreetings((items) => ['Brindis virtual cruzando la ciudad', ...items].slice(0, 10))
  }

  const revealHud = () => {
    if (configOpen) return           // no auto-ocultar si el modal está abierto
    setHudVisible(true)
    window.clearTimeout(hideHudRef.current)
    hideHudRef.current = window.setTimeout(() => setHudVisible(false), 4200)
  }

  const handleAudioConfigChange = (key, value) => {
    setAudioConfig((prev) => ({ ...prev, [key]: value }))
    setToast(`Canal actualizado · ${value.replace(/^Efecto\s*/i, '').replace(/\.mp3$/i, '')}`)
  }

  const openConfig = () => {
    setConfigOpen(true)
    setHudVisible(true)
    window.clearTimeout(hideHudRef.current)
  }

  const closeConfig = () => {
    setConfigOpen(false)
    // reinicia el timer de ocultado del HUD
    hideHudRef.current = window.setTimeout(() => setHudVisible(false), 4200)
  }

  /* ─── Render ─────────────────────────────────────────────────────────── */
  return (
    <main className="bar-app" onMouseMove={revealHud} onFocus={revealHud}>
      <audio
        ref={audioRef}
        src={activeTrack?.url}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e)      => setProgress(e.currentTarget.currentTime)}
        onEnded={() => { if (tracks.length > 1) selectTrack((currentTrack + 1) % tracks.length) }}
      />
      <audio ref={ambientAudioRef} src={ambientSrc} loop preload="auto" />

      {/* ── Tickers ── */}
      <div className="ticker ticker-top" aria-hidden="true">
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>

      {/* ── Escenario principal ── */}
      <section className="stage" aria-label="La Barra Retro">
        <div className="presence">
          <span></span>
          {presence} en la barra
        </div>

        <div className="sign">
          <p>80s / 90s Rock &amp; Techno</p>
          <h1>La Barra Retro</h1>
          <strong>{activeTrack ? activeTrack.name : 'Carga tus MP3 para abrir la noche'}</strong>
        </div>

        <div className="visual-shell">
          <canvas ref={canvasRef} className="visualizer" aria-hidden="true" />
          <div className="orbital orbital-one"></div>
          <div className="orbital orbital-two"></div>
          <button type="button" className="cheers" onClick={toastCheers}>
            Salud
          </button>
        </div>

        <div className="toast" role="status">{toast}</div>
      </section>

      {/* ── HUD ── */}
      <aside className={`hud ${hudVisible ? 'is-visible' : ''}`} aria-label="Controles">

        {/* Fila superior: cargar + botón config */}
        <div className="hud-topbar">
          <label className="file-picker">
            <input type="file" accept="audio/mp3,audio/mpeg" webkitdirectory="true" multiple onChange={handleFiles} />
            Cargar carpeta MP3
          </label>
          <button
            type="button"
            className="cfg-trigger"
            onClick={openConfig}
            aria-label="Configurar efectos de sonido"
            title="Configurar efectos"
          >
            <IconSettings />
          </button>
        </div>

        {/* Transport */}
        <div className="transport">
          <button type="button" onClick={togglePlayback}>
            {isPlaying ? 'Pausa' : 'Play'}
          </button>
          <div className="time">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range"
            min="0"
            max={duration || 0}
            step="1"
            value={progress}
            onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value) }}
          />
        </div>

        {/* Mezcladores de volumen */}
        <div className="mixers">
          <label>
            Música
            <input type="range" min="0" max="1" step="0.01" value={musicVolume}
              onChange={(e) => setMusicVolume(Number(e.target.value))} />
          </label>
          <label>
            Murmullo
            <input type="range" min="0" max="1" step="0.01" value={ambientVolume}
              onChange={(e) => setAmbientVolume(Number(e.target.value))} />
          </label>
          <label>
            Copas
            <input type="range" min="0" max="1" step="0.01" value={fxVolume}
              onChange={(e) => setFxVolume(Number(e.target.value))} />
          </label>
        </div>

        {/* Saludo marquesina */}
        <form
          className="greeting-form"
          onSubmit={(e) => { e.preventDefault(); sendGreeting() }}
        >
          <input
            type="text"
            maxLength="72"
            placeholder="Enviar saludo a la marquesina"
            value={draftGreeting}
            onChange={(e) => setDraftGreeting(e.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>

        {/* Playlist (sin límite de pistas) */}
        <div className="playlist">
          {tracks.length === 0 ? (
            <p>Selecciona una carpeta local. El audio no se sube al servidor.</p>
          ) : (
            tracks.map((track, index) => (
              <button
                type="button"
                className={index === currentTrack ? 'active' : ''}
                key={track.url}
                onClick={() => selectTrack(index)}
              >
                {track.name}
              </button>
            ))
          )}
        </div>
      </aside>

      {/* ── Modal de configuración de efectos ── */}
      {configOpen && (
        <ConfigModal
          audioConfig={audioConfig}
          effectOptions={effectOptions}
          onClose={closeConfig}
          onChangeConfig={handleAudioConfigChange}
        />
      )}

      {/* ── Ticker inferior ── */}
      <div className="ticker ticker-bottom" aria-hidden="true">
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>
    </main>
  )
}

export default App
