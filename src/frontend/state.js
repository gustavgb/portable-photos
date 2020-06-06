import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

const defaultState = {
  library: {
    status: 'ready',
    data: null
  },
  settings: {
    status: 'ready',
    library: null
  },
  init: {
    isInitializing: false,
    progress: null
  }
}

const reducer = (state = { ...defaultState }, action) => {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        settings: {
          ...action.settings,
          status: 'loaded'
        }
      }
    case 'SET_LIBRARY_DATA':
      return {
        ...state,
        library: {
          status: 'loaded',
          data: action.libraryData
        }
      }
    case 'SET_INIT_PROGRESS':
      return {
        ...state,
        init: {
          ...state.init,
          progress: action.progress,
          isInitializing: true
        }
      }
    case 'SET_INIT_BOOLEAN':
      return {
        ...state,
        init: {
          ...state.init,
          isInitializing: action.value
        }
      }
    default:
      return state
  }
}

const store = window.store = createStore(
  reducer
)
export const StoreProvider = ({ children }) => (
  <Provider store={store}>
    {children}
  </Provider>
)
