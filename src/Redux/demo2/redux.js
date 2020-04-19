const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
  // 如果有 rewriteCreateStoreFunc，那就生成新的 createStore
  if(rewriteCreateStoreFunc){
      const newCreateStore =  rewriteCreateStoreFunc(createStore);
      return newCreateStore(reducer, initState);
  }
  

  // 以下为旧 createStore 逻辑
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

  // 注意：Symbol() 不跟任何值相等，所以 type 为 Symbol()，则 reducer 不匹配任何 type，走 default 逻辑，返回初始化 state 值，这样就达到了初始化 state 的效果。
  dispatch({ type: Symbol() })

  return {
    getState,
    dispatch,
    subscribe,
  }
}

const applyMiddleware = (...middlewares) => (oldCreateStore) => (reducer, initState) => {
  // 生成 store
  let store = oldCreateStore(reducer, initState)
  // 给每个 middleware 传递进去 store，相当于 loggerMiddleware(store)
  // 为了防止中间件修改 store 的其他方法，我们只报漏 store 的 getState 方法
  // 执行结果相当于 chain = [logger, updateTime, exception]
  let chain = middlewares.map(middleware => middleware({ getState: store.getState }))
  // 获取 store 的 dispatch 方法
  let next = store.dispatch
  // 实现 exception(updateTime(logger(next)))
  chain.reverse().map(middleware => {
    next = middleware(next)
  })
  // 替换 store 的 dispatch 方法
  store.dispatch = next
  // 返回新的 store
  return store
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
  applyMiddleware,
  combineReducers,
}