const state = {
  mainWindow: null
}

export const setMainWindow = (value) => {
  state.mainWindow = value
}

export const getMainWindow = () => {
  return state.mainWindow
}
