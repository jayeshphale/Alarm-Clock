import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { stopAlarm, snoozeAlarm } from '../redux/alarmSlice'

function playBeep(ctx) {
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'sine'; o.frequency.value = 880; g.gain.value = 0.05;
  o.connect(g); g.connect(ctx.destination); o.start();
  return { o, g }
}

function playRadar(ctx) {
  const o = ctx.createOscillator(); const g = ctx.createGain();
  o.type = 'sawtooth'; o.frequency.value = 600; g.gain.value = 0.03;
  o.connect(g); g.connect(ctx.destination); o.start();
  return { o, g }
}

export default function AlarmPlayingPage() {
  const dispatch = useDispatch()
  const active = useSelector(s => s.alarms.activeAlarm)
  const [ctx, setCtx] = useState(null)
  const nodesRef = useRef(null)

  useEffect(() => {
    const c = new (window.AudioContext || window.webkitAudioContext)()
    setCtx(c)
    return () => { if (c) c.close() }
  }, [])

  useEffect(() => {
    if (!ctx || !active) return
    if (active.sound === 'None') return
    if (active.sound === 'Beep') nodesRef.current = playBeep(ctx)
    if (active.sound === 'Radar') nodesRef.current = playRadar(ctx)
    return () => {
      const n = nodesRef.current
      if (n && n.o) { try { n.o.stop() } catch(e){} }
    }
  }, [ctx, active])

  if (!active) return null

  function handleStop() {
    dispatch(stopAlarm())
  }

  function handleSnooze() {
    const until = Date.now() + 5 * 60 * 1000
    dispatch(snoozeAlarm({ id: active.id, until }))
  }

  const now = new Date()
  const timeStr = now.toLocaleTimeString()
  const dateStr = now.toLocaleDateString()

  return (
    <section className="wrap" id="AlarmPLaying">
      <div className="page alarm">
        <div className="clock">
          {timeStr}
          <small>{dateStr}</small>
          <p>{active.label}</p>
        </div>
        <div className="action">
          {active.snooze && <a href="#" className="button open-panel" onClick={e=>{e.preventDefault(); handleSnooze()}}>Snooze</a>}
          <a href="#" className="button small" onClick={e=>{e.preventDefault(); handleStop()}}>Stop</a>
        </div>
      </div>
    </section>
  )
}
