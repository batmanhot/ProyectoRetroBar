import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

/* ══════════════════════════════════════════════════════════════════════════
   CONSTANTES
══════════════════════════════════════════════════════════════════════════ */
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
const randomUnit    = () => Math.random()

/* ══════════════════════════════════════════════════════════════════════════
   UTILIDADES
══════════════════════════════════════════════════════════════════════════ */
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

/* ── Hook: localStorage persistente ── */
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored !== null ? JSON.parse(stored) : initial
    } catch { return initial }
  })
  const set = useCallback((v) => {
    setValue((prev) => {
      const next = typeof v === 'function' ? v(prev) : v
      try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* cuota */ }
      return next
    })
  }, [key])
  return [value, set]
}

/* ══════════════════════════════════════════════════════════════════════════
   ÍCONOS SVG INLINE
══════════════════════════════════════════════════════════════════════════ */
const IconSettings = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
)

const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

const IconChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
)

const IconShuffle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
    <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
    <line x1="4" y1="4" x2="9" y2="9"/>
  </svg>
)

const IconRepeat = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
  </svg>
)

const IconRepeatOne = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/>
    <polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/>
    <text x="11" y="14" fontSize="7" fontWeight="bold" fill="currentColor" stroke="none">1</text>
  </svg>
)

const IconFullscreen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
  </svg>
)

const IconExitFullscreen = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
  </svg>
)

const IconMusic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
)

/* ══════════════════════════════════════════════════════════════════════════
   MODAL DE CONFIGURACIÓN
══════════════════════════════════════════════════════════════════════════ */
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
        <div className="cfg-header">
          <div className="cfg-header-left">
            <span className="cfg-dot"/><span className="cfg-dot"/><span className="cfg-dot"/>
          </div>
          <p className="cfg-title">CONFIGURAR EFECTOS</p>
          <button type="button" className="cfg-close" onClick={onClose} aria-label="Cerrar">
            <IconClose/>
          </button>
        </div>
        <p className="cfg-subtitle">Selecciona el audio para cada canal de ambiente</p>
        <div className="cfg-sections">
          {sections.map(({ key, label, icon }) => (
            <div key={key} className="cfg-row">
              <div className="cfg-row-label">
                <span className="cfg-row-icon">{icon}</span>
                <span>{label}</span>
              </div>
              <div className="cfg-select-wrap">
                <select className="cfg-select" value={audioConfig[key]}
                  onChange={(e) => onChangeConfig(key, e.target.value)}>
                  {effectOptions[key].map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span className="cfg-chevron"><IconChevronDown/></span>
              </div>
            </div>
          ))}
        </div>
        <p className="cfg-hint">Los cambios se aplican en el próximo efecto aleatorio</p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   TOAST CON AUTO-DISMISS
══════════════════════════════════════════════════════════════════════════ */
function Toast({ message }) {
  const [visible, setVisible]   = useState(true)
  const [progress, setProgress] = useState(100)
  const timerRef  = useRef(null)
  const rafRef    = useRef(null)
  const startRef  = useRef(null)
  const DURATION  = 4200

  useEffect(() => {
    setVisible(true)
    setProgress(100)
    startRef.current = performance.now()

    const tick = (now) => {
      const elapsed = now - startRef.current
      const pct     = Math.max(0, 100 - (elapsed / DURATION) * 100)
      setProgress(pct)
      if (pct > 0) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }
    rafRef.current = requestAnimationFrame(tick)

    timerRef.current = setTimeout(() => setVisible(false), DURATION)

    return () => {
      cancelAnimationFrame(rafRef.current)
      clearTimeout(timerRef.current)
    }
  }, [message])

  return (
    <div className={`toast ${visible ? 'toast-visible' : 'toast-hidden'}`} role="status">
      <span>{message}</span>
      <div className="toast-bar" style={{ width: `${progress}%` }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   COMPONENTE PRINCIPAL
══════════════════════════════════════════════════════════════════════════ */
function App() {
  /* ── Refs de audio ── */
  const audioRef        = useRef(null)
  const ambientAudioRef = useRef(null)
  const fxPoolRef       = useRef([])
  const analyserRef     = useRef(null)
  const audioCtxRef     = useRef(null)
  const sourceRef       = useRef(null)

  /* ── Refs de UI/timers ── */
  const fxTimerRef    = useRef(null)
  const canvasRef     = useRef(null)
  const rafRef        = useRef(null)
  const hideHudRef    = useRef(null)
  const tracksRef     = useRef([])
  const visualTimeRef = useRef(0)
  const draftRef      = useRef(null)
  const peakDataRef   = useRef(null)
  const isPlayingRef  = useRef(false)   // ref paralelo para evitar closure stale en rAF

  /* ── Estado de audio (persistido) ── */
  const [musicVolume,   setMusicVolume]   = useLocalStorage('brv_musicVol',   0.82)
  const [ambientVolume, setAmbientVolume] = useLocalStorage('brv_ambientVol', 0.28)
  const [fxVolume,      setFxVolume]      = useLocalStorage('brv_fxVol',      0.45)
  const [audioConfig,   setAudioConfig]   = useLocalStorage('brv_audioConfig', {
    ambient:  'Efecto Murmullo de Ambiente en bar.mp3',
    glass:    'Efecto Copas chocando.mp3',
    bottle:   'Efecto DESTAPAR CERVEZA.mp3',
    applause: 'Efecto aplauso-medio_.mp3',
  })

  /* ── Estado de reproducción ── */
  const [tracks,        setTracks]        = useState([])
  const [currentTrack,  setCurrentTrack]  = useState(0)
  const [isPlaying,     setIsPlaying]     = useState(false)
  const [shuffleMode,   setShuffleMode]   = useLocalStorage('brv_shuffle', false)
  const [repeatMode,    setRepeatMode]    = useLocalStorage('brv_repeat',  'none') // 'none' | 'all' | 'one'
  const [duration,      setDuration]      = useState(0)
  const [progress,      setProgress]      = useState(0)

  /* ── Estado de UI ── */
  const [hudVisible,    setHudVisible]    = useState(true)
  const [configOpen,    setConfigOpen]    = useState(false)
  const [isFullscreen,  setIsFullscreen]  = useState(false)
  const [greetings,     setGreetings]     = useState(initialGreetings)
  const [toastMsg,      setToastMsg]      = useState('La barra está lista')
  const [toastKey,      setToastKey]      = useState(0)
  const [presence,      setPresence]      = useState(37)
  const [trackFading,   setTrackFading]   = useState(false)
  const [hudPinned,     setHudPinned]     = useState(false)

  const activeTrack = tracks[currentTrack]

  const tickerText = useMemo(
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

  /* ── Helper: mostrar toast ── */
  const showToast = useCallback((msg) => {
    setToastMsg(msg)
    setToastKey((k) => k + 1)
  }, [])

  /* ══════════════════════════════
     EFECTOS DE VOLUMEN
  ══════════════════════════════ */
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume
  }, [musicVolume])

  useEffect(() => {
    if (ambientAudioRef.current) ambientAudioRef.current.volume = ambientVolume
  }, [ambientVolume])

  useEffect(() => {
    fxPoolRef.current.forEach((a) => { a.volume = fxVolume })
  }, [fxVolume])

  /* ══════════════════════════════
     PRESENCIA SIMULADA
  ══════════════════════════════ */
  useEffect(() => {
    const id = window.setInterval(() => {
      setPresence((v) => Math.max(18, Math.min(86, v + Math.floor(randomUnit() * 5) - 2)))
    }, 3800)
    return () => window.clearInterval(id)
  }, [])

  /* ══════════════════════════════
     CLEANUP GLOBAL
  ══════════════════════════════ */
  useEffect(() => {
    return () => {
      window.clearTimeout(hideHudRef.current)
      window.clearTimeout(fxTimerRef.current)
      window.cancelAnimationFrame(rafRef.current)
      tracksRef.current.forEach((t) => URL.revokeObjectURL(t.url))
      if (ambientAudioRef.current) { ambientAudioRef.current.pause(); ambientAudioRef.current.src = '' }
      fxPoolRef.current.forEach((a) => { a.pause(); a.src = '' })
      fxPoolRef.current = []
      if (audioCtxRef.current) audioCtxRef.current.close()
    }
  }, [])

  /* ══════════════════════════════
     AMBIENTE AL CAMBIAR FUENTE
  ══════════════════════════════ */
  useEffect(() => {
    if (!ambientAudioRef.current) return
    ambientAudioRef.current.load()
    if (isPlaying) {
      ambientAudioRef.current.currentTime = 0
      ambientAudioRef.current.play().catch(() => {})
    }
  }, [ambientSrc, isPlaying])

  /* ══════════════════════════════
     FULLSCREEN LISTENER
  ══════════════════════════════ */
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  /* ══════════════════════════════
     ATAJOS DE TECLADO
  ══════════════════════════════ */
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlayback()
          break
        case 'ArrowRight':
          e.preventDefault()
          nextTrack()
          break
        case 'ArrowLeft':
          e.preventDefault()
          prevTrack()
          break
        case 'KeyM':
          setMusicVolume((v) => v > 0 ? 0 : 0.82)
          showToast(musicVolume > 0 ? 'Música silenciada' : 'Música restaurada')
          break
        case 'KeyF':
          toggleFullscreen()
          break
        default:
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, tracks, currentTrack, shuffleMode, repeatMode, musicVolume])

  /* ══════════════════════════════
     WEB AUDIO API — ANALYSER
  ══════════════════════════════ */
  const setupAnalyser = useCallback(() => {
    if (!audioRef.current) return
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      if (!sourceRef.current) {
        sourceRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current)
        analyserRef.current = audioCtxRef.current.createAnalyser()
        analyserRef.current.fftSize                = 2048
        analyserRef.current.smoothingTimeConstant  = 0.75
        sourceRef.current.connect(analyserRef.current)
        analyserRef.current.connect(audioCtxRef.current.destination)
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume()
      }
    } catch { /* ya conectado o no soportado */ }
  }, [])

  /* ══════════════════════════════
     VISUALIZADOR CANVAS (real + fallback sintético)
     Lee isPlayingRef (no el state) para evitar el closure stale del loop rAF.
  ══════════════════════════════ */
  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const w   = canvas.clientWidth  * dpr
    const h   = canvas.clientHeight * dpr
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h }
    ctx.clearRect(0, 0, w, h)

    const playing = isPlayingRef.current
    const bars    = 64
    const centerY = h / 2
    const barW    = w / bars

    let freqData = null
    if (analyserRef.current && playing) {
      freqData = new Uint8Array(analyserRef.current.frequencyBinCount)
      analyserRef.current.getByteFrequencyData(freqData)
    }

    visualTimeRef.current += playing ? 0.04 : 0.015
    const time = visualTimeRef.current

    /* Mapeo logarítmico precalculado — igual distribución en todo el ancho */
    const nyq    = audioCtxRef.current ? audioCtxRef.current.sampleRate / 2 : 22050
    const logMin = Math.log10(30)
    const logMax = Math.log10(16000)

    for (let i = 0; i < bars; i++) {
      let strength

      if (freqData) {
        /* Log mapping: 30 Hz (izq) → 16 kHz (der), igual que el oído humano */
        const freq   = Math.pow(10, logMin + (i / bars) * (logMax - logMin))
        const binIdx = Math.max(0, Math.min(freqData.length - 1, Math.round(freq / nyq * freqData.length)))
        strength = Math.max(0.04, freqData[binIdx] / 255)
        if (i < 15) strength = Math.min(1, strength * 1.5)   // punch en graves
      } else {
        const wave  = Math.sin(time + i * 0.35) * 0.5 + 0.5
        const noise = Math.sin(time * 0.8 + i * 1.3) * 0.5 + 0.5
        strength    = Math.max(0.04, (wave * 0.65 + noise * 0.35) * (playing ? 0.7 : 0.2))
      }

      const barH = Math.max(6, strength * h * 0.88)
      const x    = i * barW

      /* Color: cyan → verde-cian (centro) → magenta */
      const t    = i / bars
      const mid  = Math.sin(t * Math.PI)  // pico en t=0.5
      const r    = Math.round(5   + t * 250)
      const g    = Math.round(238 - t * 130 + mid * 50)
      const b    = Math.round(255 - t * 60  - mid * 50)
      const hue  = `${r}, ${g}, ${b}`

      ctx.fillStyle   = `rgba(${hue}, ${0.35 + strength * 0.65})`
      ctx.shadowBlur  = 22 + strength * 42
      ctx.shadowColor = `rgba(${hue}, 0.95)`
      ctx.fillRect(x, centerY - barH / 2, barW * 0.55, barH)
    }

    rafRef.current = window.requestAnimationFrame(drawVisualizer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* ══════════════════════════════
     FX POOL — SIN MODIFICAR
  ══════════════════════════════ */
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
    if (r > 0.72) { playApplause();   showToast('Aplausos al fondo de la barra'); return }
    if (r > 0.42) { playBottlePop();  showToast('Una botella se abre cerca de la mesa'); return }
    if (r > 0.20) { playGlassClink(); showToast('Copas cruzando la noche'); return }
    playFxFile(roomEffects[Math.floor(randomUnit() * roomEffects.length)])
    showToast('Efecto de ambiente activado')
  }

  const scheduleFx = useCallback(() => {
    window.clearTimeout(fxTimerRef.current)
    fxTimerRef.current = window.setTimeout(() => {
      if (isPlaying) playRandomRoomFx()
      scheduleFx()
    }, 18000 + randomUnit() * 12000)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, audioConfig, fxVolume])

  useEffect(() => {
    scheduleFx()
    return () => window.clearTimeout(fxTimerRef.current)
  }, [scheduleFx])

  /* ══════════════════════════════
     NAVEGACIÓN DE PLAYLIST
  ══════════════════════════════ */
  const getNextIndex = useCallback((current, total) => {
    if (shuffleMode) {
      let next
      do { next = Math.floor(randomUnit() * total) } while (total > 1 && next === current)
      return next
    }
    return (current + 1) % total
  }, [shuffleMode])

  const getPrevIndex = useCallback((current, total) => {
    if (shuffleMode) return Math.floor(randomUnit() * total)
    return (current - 1 + total) % total
  }, [shuffleMode])

  /* ── Seleccionar pista con animación de fade ── */
  const selectTrack = useCallback((index) => {
    setTrackFading(true)
    setTimeout(() => {
      setCurrentTrack(index)
      setProgress(0)
      setTrackFading(false)
      window.setTimeout(async () => {
        if (isPlaying && audioRef.current) {
          try { await audioRef.current.play() } catch { /* bloqueado */ }
        }
      }, 50)
    }, 280)
  }, [isPlaying])

  const nextTrack = useCallback(() => {
    if (!tracks.length) return
    selectTrack(getNextIndex(currentTrack, tracks.length))
  }, [tracks, currentTrack, getNextIndex, selectTrack])

  const prevTrack = useCallback(() => {
    if (!tracks.length) return
    // Si lleva más de 3 s reproducidos, vuelve al inicio de la pista
    if (progress > 3 && audioRef.current) {
      audioRef.current.currentTime = 0
      return
    }
    selectTrack(getPrevIndex(currentTrack, tracks.length))
  }, [tracks, currentTrack, progress, getPrevIndex, selectTrack])

  /* ══════════════════════════════
     HANDLERS PRINCIPALES
  ══════════════════════════════ */
  const handleFiles = (event) => {
    const files = Array.from(event.target.files || [])
      .filter((f) => f.type === 'audio/mpeg' || f.name.endsWith('.mp3'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ name: f.name.replace(/\.mp3$/i, ''), url: URL.createObjectURL(f) }))
    tracksRef.current.forEach((t) => URL.revokeObjectURL(t.url))
    tracksRef.current = files
    setTracks(files)
    setCurrentTrack(0)
    isPlayingRef.current = false
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    showToast(files.length ? `${files.length} canciones cargadas` : 'No encontré MP3')
  }

  const startAmbient = async () => {
    if (!ambientAudioRef.current) return
    ambientAudioRef.current.volume = ambientVolume
    ambientAudioRef.current.loop   = true
    try { await ambientAudioRef.current.play() } catch { /* bloqueado */ }
  }

  const togglePlayback = useCallback(async () => {
    if (!activeTrack || !audioRef.current) { showToast('Carga una carpeta con MP3 primero'); return }

    /* Inicializar Web Audio una sola vez tras gesto de usuario */
    setupAnalyser()

    /* Arrancar / pausar rAF */
    if (audioRef.current.paused) {
      if (!rafRef.current) drawVisualizer()
      try {
        await audioRef.current.play()
        await startAmbient()
        isPlayingRef.current = true
        setIsPlaying(true)
        showToast('La noche empieza a sonar')
      } catch { showToast('Error al reproducir — intenta de nuevo') }
    } else {
      audioRef.current.pause()
      if (ambientAudioRef.current) ambientAudioRef.current.pause()
      window.cancelAnimationFrame(rafRef.current)
      rafRef.current = null
      isPlayingRef.current = false
      setIsPlaying(false)
      showToast('Pausa suave en la barra')
      drawVisualizer()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTrack, drawVisualizer, setupAnalyser])

  /* ── onEnded: respeta repeatMode y shuffleMode ── */
  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one') {
      if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play().catch(() => {}) }
      return
    }
    if (repeatMode === 'all' || tracks.length > 1) {
      selectTrack(getNextIndex(currentTrack, tracks.length))
    }
  }, [repeatMode, tracks, currentTrack, getNextIndex, selectTrack])

  /* ── Error en audio: skip automático ── */
  const handleAudioError = useCallback(() => {
    showToast('Error al cargar este MP3 — pasando a la siguiente pista')
    if (tracks.length > 1) {
      selectTrack(getNextIndex(currentTrack, tracks.length))
    }
  }, [tracks, currentTrack, getNextIndex, selectTrack, showToast])

  /* ── Saludos y brindis ── */
  const sendGreeting = () => {
    const msg = draftRef.current?.value.trim()
    if (!msg) return
    setGreetings((items) => [msg, ...items].slice(0, 10))
    if (draftRef.current) draftRef.current.value = ''
    showToast(`Mensaje enviado: ${msg}`)
  }

  const toastCheers = () => {
    playGlassClink()
    showToast('¡SALUD! recibido en toda la barra')
    setGreetings((items) => ['Brindis virtual cruzando la ciudad', ...items].slice(0, 10))
  }

  /* ── HUD reveal ── */
  const revealHud = () => {
    if (configOpen) return
    setHudVisible(true)
    window.clearTimeout(hideHudRef.current)
    hideHudRef.current = window.setTimeout(() => setHudVisible(false), 4200)
  }

  /* ── Config modal ── */
  const handleAudioConfigChange = (key, value) => {
    setAudioConfig((prev) => ({ ...prev, [key]: value }))
    showToast(`Canal actualizado · ${value.replace(/^Efecto\s*/i, '').replace(/\.mp3$/i, '')}`)
  }

  const openConfig = () => {
    setConfigOpen(true)
    setHudVisible(true)
    window.clearTimeout(hideHudRef.current)
  }

  const closeConfig = () => {
    setConfigOpen(false)
    hideHudRef.current = window.setTimeout(() => setHudVisible(false), 4200)
  }

  /* ── Fullscreen ── */
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        showToast('Modo pantalla completa · Esc para salir')
      } else {
        await document.exitFullscreen()
        showToast('Pantalla completa desactivada')
      }
    } catch { showToast('Pantalla completa no disponible') }
  }

  /* ── Ciclo de repeatMode ── */
  const cycleRepeat = () => {
    const next = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none'
    setRepeatMode(next)
    const labels = { none: 'Repetición desactivada', all: 'Repetir toda la lista', one: 'Repetir esta pista' }
    showToast(labels[next])
  }

  /* ══════════════════════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════════════════════ */
  return (
    <main className="bar-app" onMouseMove={revealHud} onFocus={revealHud}>
      {/* Elementos de audio */}
      <audio
        ref={audioRef}
        src={activeTrack?.url}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onTimeUpdate={(e)      => setProgress(e.currentTarget.currentTime)}
        onEnded={handleTrackEnded}
        onError={handleAudioError}
      />
      <audio ref={ambientAudioRef} src={ambientSrc} loop preload="auto" />

      {/* ── Ticker superior ── */}
      <div className="ticker ticker-top" aria-hidden="true">
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>

      {/* ── Escenario ── */}
      <section className="stage" aria-label="La Barra Retro">
        <div className="presence">
          <span className="presence-dot"></span>
          {presence} en la barra
        </div>

        {/* Partículas decorativas de ambiente */}
        <div className="particles" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="particle" style={{
              left:            `${5 + (i * 5.5) % 90}%`,
              animationDelay:  `${(i * 0.7) % 6}s`,
              animationDuration:`${4 + (i * 0.4) % 5}s`,
              width:           `${2 + (i % 3)}px`,
              height:          `${2 + (i % 3)}px`,
            }}/>
          ))}
        </div>

        <div className="sign">
          <p>80s / 90s Rock &amp; Techno</p>
          <h1>La Barra Retro</h1>
          <strong className={trackFading ? 'track-fade-out' : 'track-fade-in'}>
            {activeTrack ? activeTrack.name : 'Carga tus MP3 para abrir la noche'}
          </strong>
        </div>

        <div className="visual-shell">
          <canvas ref={canvasRef} className="visualizer" aria-hidden="true" />
          <div className="orbital orbital-one"></div>
          <div className="orbital orbital-two"></div>
          <button type="button" className="cheers" onClick={toastCheers}
            aria-label="Brindar con todos en la barra">
            Salud
          </button>
        </div>
      </section>

      {/* ── Toast con auto-dismiss ── */}
      <Toast key={toastKey} message={toastMsg} />

      {/* ── HUD ── */}
      <aside className={`hud ${(hudVisible || hudPinned) ? 'is-visible' : ''}`} aria-label="Controles">

        {/* Fila superior */}
        <div className="hud-topbar">
          <label className="file-picker">
            <input type="file" accept="audio/mp3,audio/mpeg" webkitdirectory="true" multiple onChange={handleFiles} />
            Cargar carpeta MP3
          </label>
          <button type="button" className="cfg-trigger" onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}>
            {isFullscreen ? <IconExitFullscreen/> : <IconFullscreen/>}
          </button>
          <button type="button" className="cfg-trigger" onClick={openConfig}
            aria-label="Configurar efectos" title="Configurar efectos">
            <IconSettings/>
          </button>
        </div>

        {/* Transport */}
        <div className="transport">
          <div className="transport-controls">
            <button type="button" className="transport-prev" onClick={prevTrack}
              aria-label="Pista anterior" title="← Anterior">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg>
            </button>
            <button type="button" className="transport-play" onClick={togglePlayback}
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}>
              {isPlaying
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              }
            </button>
            <button type="button" className="transport-next" onClick={nextTrack}
              aria-label="Siguiente pista" title="→ Siguiente">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>
            </button>
          </div>

          <div className="transport-mode">
            <button type="button"
              className={`mode-btn ${shuffleMode ? 'mode-active' : ''}`}
              onClick={() => { setShuffleMode((v) => !v); showToast(shuffleMode ? 'Shuffle desactivado' : 'Shuffle activado') }}
              aria-label="Modo aleatorio" title="Shuffle">
              <IconShuffle/>
            </button>
            <button type="button"
              className={`mode-btn ${repeatMode !== 'none' ? 'mode-active' : ''}`}
              onClick={cycleRepeat}
              aria-label="Modo repetición" title="Repetir">
              {repeatMode === 'one' ? <IconRepeatOne/> : <IconRepeat/>}
            </button>
          </div>

          <div className="time">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <input
            type="range" min="0" max={duration || 0} step="1" value={progress}
            onChange={(e) => { if (audioRef.current) audioRef.current.currentTime = Number(e.target.value) }}
            aria-label="Progreso de la pista"
          />
        </div>

        {/* Mezcladores */}
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
        <form className="greeting-form" onSubmit={(e) => { e.preventDefault(); sendGreeting() }}>
          <input
            ref={draftRef}
            type="text" maxLength="72"
            placeholder="Enviar saludo a la marquesina"
            defaultValue=""
          />
          <button type="submit">Enviar</button>
        </form>

        {/* Playlist */}
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
                {index === currentTrack && isPlaying && <span className="playing-dot"/>}
                {track.name}
              </button>
            ))
          )}
        </div>

        {/* Hint de atajos */}
        <p className="kbd-hint" aria-label="Atajos de teclado">
          <kbd>Space</kbd> play · <kbd>←→</kbd> pistas · <kbd>M</kbd> mute · <kbd>F</kbd> fullscreen
        </p>
      </aside>

      {/* ── Modal de configuración ── */}
      {configOpen && (
        <ConfigModal
          audioConfig={audioConfig}
          effectOptions={effectOptions}
          onClose={closeConfig}
          onChangeConfig={handleAudioConfigChange}
        />
      )}

      {/* ── Botón toggle HUD (solo móvil) ── */}
      <button
        type="button"
        className={`hud-toggle-btn ${hudPinned ? 'is-active' : ''}`}
        aria-label={hudPinned ? 'Cerrar panel de controles' : 'Abrir panel de controles'}
        onClick={() => setHudPinned((v) => !v)}
      >
        {hudPinned ? <IconClose/> : <IconMusic/>}
      </button>

      {/* ── Ticker inferior ── */}
      <div className="ticker ticker-bottom" aria-hidden="true">
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>
    </main>
  )
}

export default App
