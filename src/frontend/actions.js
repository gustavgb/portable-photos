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

export const setInitProgress = (progress) => ({
  type: 'SET_INIT_PROGRESS',
  progress
})

export const setInitializing = (value) => ({
  type: 'SET_INIT_BOOLEAN',
  value
})
