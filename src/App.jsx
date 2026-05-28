import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const initialGreetings = [
  'Lima despierta con sintetizadores',
  'Alguien brinda desde Miraflores',
  'Rock de carretera en la barra',
  'Techno suave para cerrar la noche',
  'Mesa compartida, volumen perfecto',
]

const randomUnit = () => Math.random()

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function App() {
  const audioRef = useRef(null)
  const audioContextRef = useRef(null)
  const analyserRef = useRef(null)
  const ambientRef = useRef(null)
  const fxTimerRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const hideHudRef = useRef(null)
  const tracksRef = useRef([])

  const [tracks, setTracks] = useState([])
  const [currentTrack, setCurrentTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hudVisible, setHudVisible] = useState(true)
  const [musicVolume, setMusicVolume] = useState(0.82)
  const [ambientVolume, setAmbientVolume] = useState(0.28)
  const [fxVolume, setFxVolume] = useState(0.45)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [greetings, setGreetings] = useState(initialGreetings)
  const [draftGreeting, setDraftGreeting] = useState('')
  const [toast, setToast] = useState('La barra esta lista')
  const [presence, setPresence] = useState(37)

  const activeTrack = tracks[currentTrack]
  const tickerText = useMemo(
    () => greetings.map((item) => `// ${item}`).join('     '),
    [greetings],
  )

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = musicVolume
  }, [musicVolume])

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.gain.gain.setTargetAtTime(
        ambientVolume,
        ambientRef.current.context.currentTime,
        0.08,
      )
    }
  }, [ambientVolume])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setPresence((value) => {
        const drift = Math.floor(randomUnit() * 5) - 2
        return Math.max(18, Math.min(86, value + drift))
      })
    }, 3800)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    return () => {
      window.clearTimeout(hideHudRef.current)
      window.clearTimeout(fxTimerRef.current)
      window.cancelAnimationFrame(rafRef.current)
      tracksRef.current.forEach((track) => URL.revokeObjectURL(track.url))
      audioContextRef.current?.close()
    }
  }, [])

  const ensureAudioGraph = () => {
    if (audioContextRef.current || !audioRef.current) return

    const AudioContext = window.AudioContext || window.webkitAudioContext
    const context = new AudioContext()
    const analyser = context.createAnalyser()
    const source = context.createMediaElementSource(audioRef.current)

    analyser.fftSize = 128
    source.connect(analyser)
    analyser.connect(context.destination)

    audioContextRef.current = context
    analyserRef.current = analyser
    createAmbientLayer(context)
    drawVisualizer()
    scheduleFx()
  }

  const createNoiseBuffer = (context, seconds = 1) => {
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * seconds))
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate)
    const data = buffer.getChannelData(0)

    let previous = 0
    for (let index = 0; index < bufferSize; index += 1) {
      const white = randomUnit() * 2 - 1
      previous = previous * 0.72 + white * 0.28
      data[index] = previous
    }

    return buffer
  }

  const createAmbientLayer = (context) => {
    const master = context.createGain()
    const sources = []
    master.gain.value = ambientVolume
    master.connect(context.destination)

    const voices = [
      { frequency: 170, q: 0.55, gain: 0.34, pan: -0.45, speed: 0.07 },
      { frequency: 310, q: 0.7, gain: 0.26, pan: 0.35, speed: 0.11 },
      { frequency: 620, q: 1.1, gain: 0.13, pan: 0.08, speed: 0.05 },
    ]

    voices.forEach((voice) => {
      const source = context.createBufferSource()
      const filter = context.createBiquadFilter()
      const voiceGain = context.createGain()
      const lfo = context.createOscillator()
      const lfoDepth = context.createGain()
      const pan = context.createStereoPanner?.()

      source.buffer = createNoiseBuffer(context, 3)
      source.loop = true
      filter.type = 'bandpass'
      filter.frequency.value = voice.frequency
      filter.Q.value = voice.q
      voiceGain.gain.value = voice.gain
      lfo.frequency.value = voice.speed
      lfoDepth.gain.value = voice.gain * 0.35

      lfo.connect(lfoDepth)
      lfoDepth.connect(voiceGain.gain)
      source.connect(filter)
      filter.connect(voiceGain)

      if (pan) {
        pan.pan.value = voice.pan
        voiceGain.connect(pan)
        pan.connect(master)
      } else {
        voiceGain.connect(master)
      }

      source.start()
      lfo.start()
      sources.push(source, lfo)
    })

    ambientRef.current = { context, gain: master, sources }
  }

  const drawVisualizer = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const context = canvas.getContext('2d')
    const data = new Uint8Array(analyser.frequencyBinCount)
    const pixelRatio = window.devicePixelRatio || 1
    const width = canvas.clientWidth * pixelRatio
    const height = canvas.clientHeight * pixelRatio

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width
      canvas.height = height
    }

    analyser.getByteFrequencyData(data)
    context.clearRect(0, 0, width, height)

    const centerY = height / 2
    const barWidth = width / data.length

    data.forEach((value, index) => {
      const strength = value / 255
      const barHeight = Math.max(10, strength * height * 0.72)
      const x = index * barWidth
      const hue = index % 2 === 0 ? '185, 255, 255' : '255, 65, 214'

      context.fillStyle = `rgba(${hue}, ${0.26 + strength * 0.74})`
      context.shadowBlur = 24 + strength * 32
      context.shadowColor = `rgba(${hue}, 0.8)`
      context.fillRect(x, centerY - barHeight / 2, barWidth * 0.48, barHeight)
    })

    rafRef.current = window.requestAnimationFrame(drawVisualizer)
  }

  const scheduleFx = () => {
    window.clearTimeout(fxTimerRef.current)
    const delay = 45000 + randomUnit() * 15000

    fxTimerRef.current = window.setTimeout(() => {
      playRandomRoomFx()
      scheduleFx()
    }, delay)
  }

  const playNoiseHit = ({
    start = 0,
    duration = 0.12,
    frequency = 1800,
    q = 8,
    peak = 0.35,
    filterType = 'bandpass',
    pan = 0,
  }) => {
    const context = audioContextRef.current
    if (!context) return

    const now = context.currentTime + start
    const source = context.createBufferSource()
    const filter = context.createBiquadFilter()
    const gain = context.createGain()
    const panner = context.createStereoPanner?.()

    source.buffer = createNoiseBuffer(context, duration)
    filter.type = filterType
    filter.frequency.value = frequency
    filter.Q.value = q
    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(Math.max(0.002, peak * fxVolume), now + 0.006)
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration)

    source.connect(filter)
    filter.connect(gain)

    if (panner) {
      panner.pan.value = pan
      gain.connect(panner)
      panner.connect(context.destination)
    } else {
      gain.connect(context.destination)
    }

    source.start(now)
    source.stop(now + duration + 0.02)
  }

  const playGlassClink = () => {
    const context = audioContextRef.current
    if (!context) return

    playNoiseHit({ duration: 0.08, frequency: 3600, q: 14, peak: 0.34, pan: -0.12 })
    playNoiseHit({ start: 0.045, duration: 0.12, frequency: 5200, q: 18, peak: 0.22, pan: 0.16 })

    ;[2450, 3180, 3920].forEach((frequency, index) => {
      const now = context.currentTime + index * 0.035
      const oscillator = context.createOscillator()
      const gain = context.createGain()
      const filter = context.createBiquadFilter()

      oscillator.type = 'sine'
      oscillator.frequency.setValueAtTime(frequency + randomUnit() * 120, now)
      filter.type = 'highpass'
      filter.frequency.value = 1800
      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(fxVolume * 0.12, now + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18 + index * 0.03)

      oscillator.connect(filter)
      filter.connect(gain)
      gain.connect(context.destination)
      oscillator.start(now)
      oscillator.stop(now + 0.24)
    })
  }

  const playBottlePop = () => {
    playNoiseHit({ duration: 0.16, frequency: 190, q: 1.1, peak: 0.42, filterType: 'lowpass' })
    playNoiseHit({ start: 0.08, duration: 0.2, frequency: 1300, q: 2.4, peak: 0.2, pan: 0.22 })
  }

  const playApplause = () => {
    const hits = 12 + Math.floor(randomUnit() * 8)

    for (let index = 0; index < hits; index += 1) {
      playNoiseHit({
        start: index * 0.035 + randomUnit() * 0.05,
        duration: 0.045 + randomUnit() * 0.05,
        frequency: 850 + randomUnit() * 2400,
        q: 2.5 + randomUnit() * 4,
        peak: 0.08 + randomUnit() * 0.14,
        pan: randomUnit() * 1.4 - 0.7,
      })
    }
  }

  const playRandomRoomFx = () => {
    const effect = randomUnit()

    if (effect > 0.72) {
      playApplause()
      setToast('Aplausos al fondo de la barra')
      return
    }

    if (effect > 0.42) {
      playBottlePop()
      setToast('Una botella se abre cerca de la mesa')
      return
    }

    playGlassClink()
    setToast('Copas cruzando la noche')
  }

  const handleFiles = (event) => {
    const files = Array.from(event.target.files || [])
      .filter((file) => file.type === 'audio/mpeg' || file.name.endsWith('.mp3'))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((file) => ({
        name: file.name.replace(/\.mp3$/i, ''),
        url: URL.createObjectURL(file),
      }))

    tracksRef.current.forEach((track) => URL.revokeObjectURL(track.url))
    tracksRef.current = files
    setTracks(files)
    setCurrentTrack(0)
    setIsPlaying(false)
    setProgress(0)
    setDuration(0)
    setToast(files.length ? `${files.length} canciones cargadas` : 'No encontre MP3')
  }

  const togglePlayback = async () => {
    if (!activeTrack || !audioRef.current) {
      setToast('Carga una carpeta con MP3 primero')
      return
    }

    ensureAudioGraph()
    await audioContextRef.current?.resume()

    if (audioRef.current.paused) {
      await audioRef.current.play()
      setIsPlaying(true)
      setToast('La noche empieza a sonar')
    } else {
      audioRef.current.pause()
      setIsPlaying(false)
      setToast('Pausa suave en la barra')
    }
  }

  const selectTrack = async (index) => {
    setCurrentTrack(index)
    setProgress(0)

    window.setTimeout(async () => {
      if (isPlaying && audioRef.current) {
        ensureAudioGraph()
        await audioContextRef.current?.resume()
        await audioRef.current.play()
      }
    }, 0)
  }

  const sendGreeting = () => {
    const message = draftGreeting.trim()
    if (!message) return

    setGreetings((items) => [message, ...items].slice(0, 10))
    setDraftGreeting('')
    setToast(`Mensaje enviado: ${message}`)
  }

  const toastCheers = () => {
    ensureAudioGraph()
    audioContextRef.current?.resume()
    playGlassClink()
    setToast('SALUD recibido en toda la barra')
    setGreetings((items) => ['Brindis virtual cruzando la ciudad', ...items].slice(0, 10))
  }

  const revealHud = () => {
    setHudVisible(true)
    window.clearTimeout(hideHudRef.current)
    hideHudRef.current = window.setTimeout(() => setHudVisible(false), 4200)
  }

  return (
    <main className="bar-app" onMouseMove={revealHud} onFocus={revealHud}>
      <audio
        ref={audioRef}
        src={activeTrack?.url}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setProgress(event.currentTarget.currentTime)}
        onEnded={() => {
          if (tracks.length > 1) selectTrack((currentTrack + 1) % tracks.length)
        }}
      />

      <div className="ticker ticker-top" aria-hidden="true">
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>

      <section className="stage" aria-label="La Barra Retro">
        <div className="presence">
          <span></span>
          {presence} en la barra
        </div>

        <div className="sign">
          <p>80s / 90s Rock & Techno</p>
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

        <div className="toast" role="status">
          {toast}
        </div>
      </section>

      <aside className={`hud ${hudVisible ? 'is-visible' : ''}`} aria-label="Controles">
        <label className="file-picker">
          <input type="file" accept="audio/mp3,audio/mpeg" webkitdirectory="true" multiple onChange={handleFiles} />
          Cargar carpeta MP3
        </label>

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
            onChange={(event) => {
              if (audioRef.current) audioRef.current.currentTime = Number(event.target.value)
            }}
          />
        </div>

        <div className="mixers">
          <label>
            Musica
            <input type="range" min="0" max="1" step="0.01" value={musicVolume} onChange={(event) => setMusicVolume(Number(event.target.value))} />
          </label>
          <label>
            Murmullo
            <input type="range" min="0" max="1" step="0.01" value={ambientVolume} onChange={(event) => setAmbientVolume(Number(event.target.value))} />
          </label>
          <label>
            Copas
            <input type="range" min="0" max="1" step="0.01" value={fxVolume} onChange={(event) => setFxVolume(Number(event.target.value))} />
          </label>
        </div>

        <form
          className="greeting-form"
          onSubmit={(event) => {
            event.preventDefault()
            sendGreeting()
          }}
        >
          <input
            type="text"
            maxLength="72"
            placeholder="Enviar saludo a la marquesina"
            value={draftGreeting}
            onChange={(event) => setDraftGreeting(event.target.value)}
          />
          <button type="submit">Enviar</button>
        </form>

        <div className="playlist">
          {tracks.length === 0 ? (
            <p>Selecciona una carpeta local. El audio no se sube al servidor.</p>
          ) : (
            tracks.slice(0, 7).map((track, index) => (
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

      <div className="ticker ticker-bottom" aria-hidden="true">
        <span>{tickerText}</span>
        <span>{tickerText}</span>
      </div>
    </main>
  )
}

export default App
