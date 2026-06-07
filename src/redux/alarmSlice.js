import { createSlice } from '@reduxjs/toolkit'

const saved = (() => {
  try {
    const raw = localStorage.getItem('paperplane:alarms')
    return raw ? JSON.parse(raw) : null
  } catch (e) {
    return null
  }
})()

const initialState = saved || {
  items: [],
  activeAlarm: null
}

const alarmSlice = createSlice({
  name: 'alarms',
  initialState,
  reducers: {
    addAlarm(state, action) {
      state.items.push(action.payload)
    },
    updateAlarm(state, action) {
      const idx = state.items.findIndex(a => a.id === action.payload.id)
      if (idx !== -1) state.items[idx] = { ...state.items[idx], ...action.payload }
    },
    deleteAlarm(state, action) {
      state.items = state.items.filter(a => a.id !== action.payload)
    },
    toggleAlarm(state, action) {
      const a = state.items.find(x => x.id === action.payload)
      if (a) a.enabled = !a.enabled
    },
    triggerAlarm(state, action) {
      const id = action.payload
      const alarm = state.items.find(a => a.id === id)
      if (!alarm) return
      state.activeAlarm = { ...alarm, triggeredAt: Date.now() }
      // mark lastTriggeredDate to avoid repeated triggers in same minute
      alarm.lastTriggeredAt = Date.now()
    },
    stopAlarm(state, action) {
      state.activeAlarm = null
    },
    snoozeAlarm(state, action) {
      const { id, until } = action.payload
      const alarm = state.items.find(a => a.id === id)
      if (alarm) alarm.snoozedUntil = until
      state.activeAlarm = null
    }
  }
})

export const { addAlarm, updateAlarm, deleteAlarm, toggleAlarm, triggerAlarm, stopAlarm, snoozeAlarm } = alarmSlice.actions

export default alarmSlice.reducer
