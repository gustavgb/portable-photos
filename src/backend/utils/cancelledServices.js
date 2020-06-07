const state = {
  counter: 0,
  cancelled: {}
}

exports.isCancelled = (id) => state.cancelled[id]

exports.cancel = (id) => {
  state.cancelled[id] = true
}

exports.getId = () => state.counter++
