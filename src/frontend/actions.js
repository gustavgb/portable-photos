export const setSettings = (settings) => ({
  type: 'SET_SETTINGS',
  settings
})

export const setLibraryData = (libraryData) => ({
  type: 'SET_LIBRARY_DATA',
  libraryData
})

export const resetLibraryData = () => ({
  type: 'RESET_LIBRARY_DATA'
})

export const setStatus = (value) => ({
  type: 'SET_STATUS',
  value
})

export const setLightboxSelected = (selected) => ({
  type: 'LIGHTBOX_SET_SELECTED',
  selected
})

export const moveLightboxSelected = (movement) => ({
  type: 'LIGHTBOX_MOVE_SELECTED',
  movement
})

export const toggleSelected = (index) => ({ type: 'TOGGLE_SELECTED', index })

export const toggleMultiple = (selectStart, selectEnd) => ({ type: 'TOGGLE_MULTIPLE', from: selectStart, to: selectEnd })

export const clearSelected = () => ({ type: 'CLEAR_SELECTED' })

export const selectAll = () => ({ type: 'SELECT_ALL' })

export const setCurrentAlbum = (id) => ({ type: 'VIEW_SET_CURRENT_ALBUM', id })
