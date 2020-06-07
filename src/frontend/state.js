import React from 'react'
import { createStore } from 'redux'
import { Provider } from 'react-redux'

const defaultState = {
  library: {
    status: 'ready',
    albums: [],
    lastUpdate: 0
  },
  settings: {
    status: 'ready',
    library: null
  },
  status: {
    message: '',
    cancelId: null
  },
  lightbox: {
    selected: -1
  },
  view: {
    currentAlbum: 'all'
  },
  keys: {}
}

const encodePath = (path) => {
  return encodeURI(path).replace(/\)/g, 'CLOSING_PAREN').replace(/\(/g, 'OPEN_PAREN')
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
          albums: action.libraryData.albums.map(album => {
            return {
              ...album,
              media: album.media.map((image, index) => ({
                ...image,
                index,
                originalPath: image.path,
                originalThumbPath: image.thumbPath,
                path: `http://localhost:3001${encodePath(image.path)}`,
                thumbPath: `http://localhost:3001${encodePath(image.thumbPath)}`,
                isSelected: false
              }))
            }
          }),
          lastUpdate: Date.now()
        }
      }
    case 'TOGGLE_SELECTED':
      return {
        ...state,
        library: {
          ...state.library,
          lastUpdate: Date.now(),
          albums: state.library.albums.map(album =>
            album.id === state.view.currentAlbum
              ? ({
                ...album,
                media: state.library.media.map((image) => image.index === action.index ? ({
                  ...image,
                  isSelected: !image.isSelected
                }) : image)
              })
              : album
          )
        }
      }
    case 'TOGGLE_MULTIPLE':
      return {
        ...state,
        library: {
          ...state.library,
          lastUpdate: Date.now(),
          albums: state.library.albums.map(album =>
            album.id === state.view.currentAlbum
              ? ({
                ...album,
                media: state.library.media.map((image) => (image.index <= action.to && image.index >= action.from) ? ({
                  ...image,
                  isSelected: true
                }) : image)
              })
              : album
          )
        }
      }
    case 'CLEAR_SELECTED':
      return {
        ...state,
        library: {
          ...state.library,
          lastUpdate: Date.now(),
          albums: state.library.albums.map(album =>
            album.id === state.view.currentAlbum
              ? ({
                ...album,
                media: state.library.media.map(item => ({
                  ...item,
                  isSelected: false
                }))
              })
              : album
          )
        }
      }
    case 'RESET_LIBRARY_DATA':
      return {
        ...state,
        library: defaultState.library,
        view: {
          ...state.view,
          currentAlbum: 'all'
        }
      }
    case 'SET_STATUS':
      return {
        ...state,
        status: action.value
      }
    case 'KEY_DOWN':
      return {
        ...state,
        keys: {
          ...state.keys,
          [action.key]: true
        }
      }
    case 'KEY_UP':
      return {
        ...state,
        keys: {
          ...state.keys,
          [action.key]: false
        }
      }
    case 'RESET_KEYS':
      return {
        ...state,
        keys: {}
      }
    case 'LIGHTBOX_SET_SELECTED':
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          selected: action.selected
        }
      }
    case 'LIGHTBOX_MOVE_SELECTED':
      return {
        ...state,
        lightbox: {
          ...state.lightbox,
          selected: state.lightbox.selected + action.movement
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
