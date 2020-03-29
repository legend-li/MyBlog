const createStore = (reducer, initState) => {
  let listeners = []
  let state = initState || {}

  const getState = () => state

  const dispatch = (action) => {
    state = reducer(state, action)
    listeners.forEach(listerner => listerner())
  }

  const subscribe = (listener) => {
    listeners.push(listener)
  }

  //注意：Symbol() 不跟任何值相等，所以 type 为 Symbol()，则 reducer 不匹配任何 type，走 default 逻辑，返回初始化 state 值，这样就达到了初始化 state 的效果。
  dispatch({ type: Symbol() })

  return {
    getState,
    dispatch,
    subscribe,
  }
}

const combineReducers = (reducers) => {
  const reducerKeys = Object.keys(reducers)
  return (state, action) => {
    let newState = {}
    reducerKeys.forEach(key => {
      newState[key] = reducers[key](state[key], action)
    })
    return newState
  }
}

export {
  createStore,
  combineReducers,
}