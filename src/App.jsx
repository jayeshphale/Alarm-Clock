import React, { useState } from 'react'
import ClockPage from './pages/ClockPage'
import AlarmListPage from './pages/AlarmListPage'
import AddEditAlarmPage from './pages/AddEditAlarmPage'
import AlarmPlayingPage from './pages/AlarmPlayingPage'
import useAlarmEngine from './hooks/useAlarmEngine'
import { useSelector } from 'react-redux'

export default function App() {
  const [route, setRoute] = useState('clock')
  const [editingAlarmId, setEditingAlarmId] = useState(null)
  useAlarmEngine()

  const activeAlarm = useSelector(state => state.alarms.activeAlarm)

  if (activeAlarm) {
    return <AlarmPlayingPage />
  }

  return (
    <section className="main ui container main-container">
      <h1 className="ui header">Alarm Clock</h1>
      {route === 'clock' && <ClockPage onNavigate={setRoute} />}
      {route === 'alarms' && (
        <AlarmListPage onNavigate={setRoute} onEdit={id => { setEditingAlarmId(id); setRoute('edit') }} onAdd={() => setRoute('add')} />
      )}
      {route === 'add' && <AddEditAlarmPage onDone={() => setRoute('alarms')} />}
      {route === 'edit' && <AddEditAlarmPage alarmId={editingAlarmId} onDone={() => setRoute('alarms')} />}
      <footer>
        Javascript assignment by <a href="https://www.paperplane.net/">Paperplane</a>
      </footer>
    </section>
  )
}
