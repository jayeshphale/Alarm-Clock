import React from 'react'

export default function HeaderTabs({ route, onChange }) {
  return (
    <div className="toolbar">
      <div className="toolbar-inner">
        <a href="#" className="link" onClick={e => { e.preventDefault(); onChange('clock') }}>Clock</a>
        <a href="#" className="link" onClick={e => { e.preventDefault(); onChange('alarms') }}>Alarm</a>
      </div>
    </div>
  )
}
