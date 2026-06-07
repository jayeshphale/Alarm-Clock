import React from 'react'
import { DAY_NAMES } from '../utils/timeUtils'

function repeatLabel(repeatDays) {
  if (!repeatDays || repeatDays.length === 0) return 'Once'
  if (repeatDays.length === 7) return 'Everyday'
  const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday']
  const weekend = ['Saturday','Sunday']
  if (repeatDays.length === 5 && weekdays.every(d => repeatDays.includes(d))) return 'Weekdays'
  if (repeatDays.length === 2 && weekend.every(d => repeatDays.includes(d))) return 'Weekend'
  return repeatDays.join(', ')
}

export default function AlarmItem({ alarm, onToggle, onEdit, onDelete }) {
  const cls = 'item' + (alarm.enabled ? '' : ' off')
  const repeat = repeatLabel(alarm.repeatDays)
  return (
    <li className={cls}>
      <label className="item-link item-content">
        <a href="#" className="remove" onClick={e => { e.preventDefault(); onDelete(alarm.id) }}>X</a>
        <input type="checkbox" checked={alarm.enabled} onChange={() => onToggle(alarm.id)} />
        <strong>{String(alarm.hour).padStart(2,'0')}:{String(alarm.minute).padStart(2,'0')} <sub>{alarm.ampm}</sub></strong>
        <small>{alarm.label || 'Alarm'}, {repeat}</small>
        <a href="#" className="button small" onClick={e => { e.preventDefault(); onEdit(alarm.id) }}>Edit</a>
      </label>
    </li>
  )
}
