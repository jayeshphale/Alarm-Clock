import React, { useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AlarmForm from '../components/AlarmForm'
import { addAlarm, updateAlarm, deleteAlarm } from '../redux/alarmSlice'

function makeId() { return Date.now().toString(36) }

export default function AddEditAlarmPage({ alarmId, onDone }) {
  const dispatch = useDispatch()
  const alarms = useSelector(s => s.alarms.items)
  const alarm = useSelector(s => s.alarms.items.find(a => a.id === alarmId))
  const formRef = useRef(null)

  function sameRepeat(a, b) {
    if (a.length !== b.length) return false
    const sortedA = [...a].sort()
    const sortedB = [...b].sort()
    return sortedA.every((day, index) => day === sortedB[index])
  }

  function handleSubmit(data) {
    const duplicate = alarms.find(a => a.id !== alarm?.id && a.hour === data.hour && a.minute === data.minute && a.ampm === data.ampm && sameRepeat(a.repeatDays || [], data.repeatDays || []))
    if (duplicate) {
      return alert('Duplicate alarm exists with same time and repeat days.')
    }

    if (alarm) {
      dispatch(updateAlarm({ ...alarm, ...data }))
    } else {
      const payload = { id: makeId(), ...data }
      dispatch(addAlarm(payload))
    }
    onDone && onDone()
  }

  function handleDelete() {
    if (alarm) dispatch(deleteAlarm(alarm.id))
    onDone && onDone()
  }

  return (
    <section className="wrap add-edit-wrap" id="AddEdit">
      <div className="page-header">
        <a className="button secondary small" href="#" onClick={e => { e.preventDefault(); onDone() }}>Cancel</a>
        <div>
          <div className="page-label">Alarm settings</div>
          <h1>{alarm ? 'Edit Alarm' : 'Add Alarm'}</h1>
        </div>
        <a className="button primary small" href="#" onClick={e => { e.preventDefault(); formRef.current?.requestSubmit() }}>Save</a>
      </div>

      <div className="page-content">
        <div className="content-block-title">Alarm details</div>
        <div className="content-card edit-alarm-panel">
          <AlarmForm ref={formRef} initial={alarm || {}} onSubmit={handleSubmit} />

          <div className="action action-row">
            <a href="#" className="button primary" onClick={e => { e.preventDefault(); formRef.current?.requestSubmit() }}>Save Alarm</a>
            {alarm && <a href="#" className="button danger" onClick={e => { e.preventDefault(); handleDelete() }}>Delete Alarm</a>}
          </div>
        </div>
      </div>
    </section>
  )
}
