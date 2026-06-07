import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import store from './redux/store'
import App from './App'

import '../Paperplane/Paperplane_files/style.css'
import '../Paperplane/Paperplane_files/semantic.css'
import '../Paperplane/Paperplane_files/LevelAccess-AST.css'
import './styles.css'

const root = createRoot(document.getElementById('root'))
root.render(
  <Provider store={store}>
    <App />
  </Provider>
)
