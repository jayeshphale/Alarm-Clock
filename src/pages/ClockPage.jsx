import React, { useEffect, useState } from 'react'
import { pad } from '../utils/timeUtils'

export default function ClockPage({ onNavigate }) {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const hh = pad(now.getHours() % 12 === 0 ? 12 : now.getHours() % 12)
  const mm = pad(now.getMinutes())
  const ss = pad(now.getSeconds())
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM'
  const date = now.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

  return (
    <section className="wrap" id="clock">
      <div className="navbar">
        <h1>Clock</h1>
      </div>
      <div className="page">
        <div className="clock">
          {hh}:{mm}:{ss}
          <small>{date}</small>
        </div>
      </div>
      <div className="toolbar">
        <div className="toolbar-inner">
          <a href="#" className="link" onClick={e => { e.preventDefault(); onNavigate('clock') }}>Clock</a>
          <a href="#" className="link" onClick={e => { e.preventDefault(); onNavigate('alarms') }}>Alarm</a>
        </div>
      </div>
    </section>
  )
}
