import { useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { triggerAlarm } from '../redux/alarmSlice'
import { to24Hour } from '../utils/timeUtils'

export default function useAlarmEngine() {
  const dispatch = useDispatch()
  const alarms = useSelector(s => s.alarms.items)
  const lastCheckRef = useRef(0)

  useEffect(() => {
    const id = setInterval(() => {
      const now = new Date()
      const nowSeconds = Math.floor(now.getTime() / 1000)
      if (nowSeconds === lastCheckRef.current) return
      lastCheckRef.current = nowSeconds

      const hours = now.getHours()
      const minutes = now.getMinutes()
      const day = now.toLocaleDateString(undefined, { weekday: 'long' })

      alarms.forEach(alarm => {
        if (!alarm.enabled) return

        // check snooze
        if (alarm.snoozedUntil && Date.now() < alarm.snoozedUntil) return

        const { hour: aHour24, minute: aMin } = to24Hour(alarm.hour, alarm.minute, alarm.ampm)
        if (aHour24 === hours && aMin === minutes && now.getSeconds() === 0) {
          // check repeat
          if (alarm.repeatDays && alarm.repeatDays.length > 0) {
            if (!alarm.repeatDays.includes(day)) return
          } else {
            // one-time: allow if lastTriggeredAt not today
            const last = alarm.lastTriggeredAt || 0
            const lastDate = new Date(last)
            if (last && lastDate.toDateString() === now.toDateString()) return
          }

          // avoid repeated triggers within same minute
          const last = alarm.lastTriggeredAt || 0
          if (last) {
            const diff = Math.abs(Date.now() - last)
            if (diff < 60 * 1000) return
          }

          dispatch(triggerAlarm(alarm.id))
        }
      })
    }, 1000)

    return () => clearInterval(id)
  }, [alarms, dispatch])
}
