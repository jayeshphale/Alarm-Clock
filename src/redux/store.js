import { configureStore } from '@reduxjs/toolkit'
import alarmReducer from './alarmSlice'

const store = configureStore({
  reducer: {
    alarms: alarmReducer
  }
})

// Persist alarms to localStorage whenever state changes
store.subscribe(() => {
  try {
    const state = store.getState().alarms
    localStorage.setItem('paperplane:alarms', JSON.stringify(state))
  } catch (e) {
    // ignore
  }
})

export default store
