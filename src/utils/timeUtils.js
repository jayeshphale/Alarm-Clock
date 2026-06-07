export function pad(n) {
  return n.toString().padStart(2, '0')
}

export function formatTime(hour, minute, second) {
  return `${pad(hour)}:${pad(minute)}${second !== undefined ? ':' + pad(second) : ''}`
}

export function to24Hour(hour, minute, ampm) {
  let h = parseInt(hour, 10)
  const m = parseInt(minute, 10)
  if ((ampm || '').toLowerCase() === 'pm' && h < 12) h += 12
  if ((ampm || '').toLowerCase() === 'am' && h === 12) h = 0
  return { hour: h, minute: m }
}

export const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
