import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import AlarmItem from '../components/AlarmItem'
import { toggleAlarm, deleteAlarm } from '../redux/alarmSlice'

export default function AlarmListPage({ onNavigate, onEdit, onAdd }) {
  const alarms = useSelector(s => s.alarms.items)
  const dispatch = useDispatch()

  const upcoming = [...alarms].sort((a,b) => {
    if (a.enabled !== b.enabled) return a.enabled ? -1 : 1
    const ta = (a.hour%12) * 60 + a.minute + (a.ampm === 'PM' ? 12*60 : 0)
    const tb = (b.hour%12) * 60 + b.minute + (b.ampm === 'PM' ? 12*60 : 0)
    return ta - tb
  })

  return (
    <section className="wrap" id="clock">
      <div className="navbar">
        <a className="pills left editAlarms">Edit</a>
        <h1>Alarm</h1>
        <a className="pills right addAlarm" onClick={e => { e.preventDefault(); onAdd() }}>Add</a>
      </div>
      <div className="page">
        {alarms.length === 0 ? (
          <div className="clock"><p>No Alarms set</p></div>
        ) : (
          <ul className="list">
            {upcoming.map(a => (
              <AlarmItem key={a.id} alarm={a} onToggle={(id)=>dispatch(toggleAlarm(id))} onEdit={onEdit} onDelete={(id)=>dispatch(deleteAlarm(id))} />
            ))}
          </ul>
        )}
      </div>
      <div className="toolbar">
        <div className="toolbar-inner">
          <a href="#" className="link" onClick={e => { e.preventDefault(); onNavigate('clock') }}>Clock</a>
        </div>
      </div>
    </section>
  )
}
