import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import logger from 'redux-logger'

const defaultState = {
  library: {
    status: 'ready',
    data: null
  },
  settings: {
    status: 'ready',
    library: null
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
    default:
      return state
  }
}

const store = createStore(
  reducer,
  applyMiddleware(logger)
)
export const StoreProvider = ({ children }) => (
  <Provider store={store}>
    {children}
  </Provider>
)
