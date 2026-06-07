import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import { DAY_NAMES } from '../utils/timeUtils'

const hours = Array.from({ length: 12 }, (_, i) => i + 1)
const minutes = Array.from({ length: 60 }, (_, i) => i)

const AlarmForm = forwardRef(function AlarmForm({ initial = {}, onSubmit }, ref) {
  const [hour, setHour] = useState(initial.hour || 12)
  const [minute, setMinute] = useState(initial.minute || 0)
  const [ampm, setAmpm] = useState(initial.ampm || 'AM')
  const [label, setLabel] = useState(initial.label || '')
  const [repeatDays, setRepeatDays] = useState(initial.repeatDays || [])
  const [sound, setSound] = useState(initial.sound || 'Beep')
  const [snooze, setSnooze] = useState(initial.snooze || false)
  const [enabled, setEnabled] = useState(initial.enabled ?? true)

  useEffect(() => {
    setHour(initial.hour ?? 12)
    setMinute(initial.minute ?? 0)
    setAmpm(initial.ampm || 'AM')
    setLabel(initial.label || '')
    setRepeatDays(initial.repeatDays || [])
    setSound(initial.sound || 'Beep')
    setSnooze(initial.snooze || false)
    setEnabled(initial.enabled ?? true)
  }, [initial])

  function toggleDay(day) {
    if (repeatDays.includes(day)) setRepeatDays(repeatDays.filter(d => d !== day))
    else setRepeatDays([...repeatDays, day])
  }

  function submit(e) {
    e && e.preventDefault()
    const h = parseInt(hour, 10)
    const m = parseInt(minute, 10)
    if (isNaN(h) || h < 1 || h > 12) return alert('Invalid hour')
    if (isNaN(m) || m < 0 || m > 59) return alert('Invalid minute')
    onSubmit({ hour: h, minute: m, ampm, label, repeatDays, sound, snooze, enabled })
  }

  useImperativeHandle(ref, () => ({
    requestSubmit: () => submit()
  }))

  return (
    <form className="alarm-form" ref={ref} onSubmit={submit}>
      <div className="form-panel">
        <div className="field-row">
          <div className="field-block">
            <label>Hour</label>
            <select value={hour} onChange={e => setHour(e.target.value)}>
              {hours.map(h => <option key={h} value={h}>{String(h).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div className="field-block">
            <label>Minute</label>
            <select value={minute} onChange={e => setMinute(e.target.value)}>
              {minutes.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
            </select>
          </div>
          <div className="field-block">
            <label>AM/PM</label>
            <select value={ampm} onChange={e => setAmpm(e.target.value)}>
              <option>AM</option>
              <option>PM</option>
            </select>
          </div>
        </div>

        <div className="toggle-row">
          <label className="toggle-field">
            <span>Snooze</span>
            <input type="checkbox" checked={snooze} onChange={e => setSnooze(e.target.checked)} />
          </label>
          <label className="toggle-field">
            <span>Enabled</span>
            <input type="checkbox" checked={enabled} onChange={e => setEnabled(e.target.checked)} />
          </label>
        </div>

        <div className="field-block full-width">
          <label>Label</label>
          <input type="text" value={label} onChange={e => setLabel(e.target.value)} placeholder="Enter alarm label" />
        </div>
      </div>

      <div className="content-block-title">Repeat</div>
      <ul className="list">
        {DAY_NAMES.map(d => (
          <li key={d} className="item select selected">
            <label>
              <input type="checkbox" checked={repeatDays.includes(d)} onChange={() => toggleDay(d)} />
              <span>{d}</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="content-block-title">Sound</div>
      <ul className="list">
        {['None', 'Radar', 'Beep'].map(option => (
          <li key={option} className="item select selected">
            <label>
              <input type="radio" name="sound" checked={sound === option} onChange={() => setSound(option)} />
              <span>{option}</span>
            </label>
          </li>
        ))}
      </ul>
    </form>
  )
})

export default AlarmForm
