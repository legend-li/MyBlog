# 从零一步一步实现一个完整版的Redux

### 前言
  redux是什么？
  redux是一个状态管理器

### 简单的状态管理器
redux是一个状态管理器，那么状态是什么？状态就是数据，状态管理器也就是数据管理器。那么我们来实现一个简单的状态管理器吧。
1. 状态管理器得有一个存储状态的地方吧，我们既然叫状态管理器，那就定义一个state变量吧，作为存储状态的地方。
``` js
let state = {
  name: '混沌传奇',
}
//使用下状态
console.log(state.name)
```
2. 有了存储状态的地方，那么得有修改状态的方法，我们就起名为updateState吧。
``` js
let state = {
  name: '混沌传奇',
}
//使用下状态
console.log(state.name) // 输出:'混沌传奇'

const updateState = (newName) => {
  state.name = newName
}
//更新下状态
updateState('混沌传奇2')
//再打印下状态
console.log(state.name) //输出:'混沌传奇2'
```
3. 有了存储状态的地方和修改状态的方法，感觉还缺点什么东西。我们思考下，状态修改了后，如果使用状态的地方不知道状态已经变化了，那么使用的状态的地方实际上使用的还是旧状态，我们目前没有办法告知使用状态的地方状态已经更新了。
好，问题有了，那么我们就解决问题，我们可以使用发布-订阅模式来解决这个问题。
```js
let listeners = []
let state = {
  name: '混沌传奇',
}
//使用下状态
console.log(state.name) // 输出:'混沌传奇'

const updateState = (newName) => {
  state.name = newName
  listeners.forEach(listerner => listerner())
}

const subscribe = (listener) => {
  listeners.push(listener)
}

//订阅下状态
subscribe(() => {
  //在state更新的时候，打印下state.name
  console.log(`最新的name是：${state.name}`) //输出:'最新的name是：混沌传奇2'
})

//更新下状态
updateState('混沌传奇2')
//再打印下状态
console.log(state.name) //输出:'混沌传奇2'
```
4. 解决了```state```数据的订阅问题，我们再看下已经实现的这个简单的状态管理器，是不是更新状态的```updateState```方法只能更新```state.name```，我们期望更新状态的```updateState```方法可以更新```state```中存储的所有数据，不只是```name```。我们来解决下这个问题。
```js
let listeners = []
let state = {
  name: '',
  like: '',
}
const updateState = (newState) => {
  state = newState
  listeners.forEach(listerner => listerner())
}

const subscribe = (listener) => {
  listeners.push(listener)
}
```
好了，我们升级了下```updateState```方法，我们试用下我们新的状态管理器
```js
let listeners = []
let state = {
  name: '',
  like: '',
}
const updateState = (newState) => {
  state = newState
  listeners.forEach(listerner => listerner())
}

const subscribe = (listener) => {
  listeners.push(listener)
}

subscribe(() => {
  //在state更新的时候，打印下state
  console.log(state)
})
updateState({
  ...state,
  name: '混沌传奇'
})
updateState({
  ...state,
  like: '打乒乓球'
})
```
输出依次为：
``` js
> {name: "混沌传奇", like: ""}

> {name: "混沌传奇", like: "打乒乓球"}
```
5. 升级了```updateState```方法之后，我们把我们的状态管理器再封装一下吧，现在的```listeners```和```state```都报漏在外面，容易被别人更改
``` js
const createStore = (initState) => {
  let listeners = []
  let state = initState || {}

  const getState = () => state

  const updateState = (newState) => {
    state = newState
    listeners.forEach(listerner => listerner())
  }

  const subscribe = (listener) => {
    listeners.push(listener)
  }

  return {
    getState,
    updateState,
    subscribe,
  }
}
```
我们来使用这个状态管理器来管理下更多的数据试试：
``` js
const createStore = (initState) => {
  let listeners = []
  let state = initState || {}

  const getState = () => state

  const updateState = (newState) => {
    state = newState
    listeners.forEach(listerner => listerner())
  }

  const subscribe = (listener) => {
    listeners.push(listener)
  }

  return {
    getState,
    updateState,
    subscribe,
  }
}


let initState = {
  name: '',
  sex: '',
  age: '',
  like: '',
  friend: '',
}
let { getState, updateState, subscribe } = createStore(initState)

subscribe(() => {
  console.log(getState())
})

updateState({
  ...getState(),
  name: '混沌传奇',
})

updateState({
  ...getState(),
  sex: '男',
})

updateState({
  ...getState(),
  age: '25',
})

updateState({
  ...getState(),
  like: '打羽毛球',
})

updateState({
  ...getState(),
  friend: '阿龙',
})
```
运行代码，输出依次为：
```js
> {name: "混沌传奇", sex: "", age: "", like: "", friend: ""}

> {name: "混沌传奇", sex: "男", age: "", like: "", friend: ""}

> {name: "混沌传奇", sex: "男", age: "25", like: "", friend: ""}

> {name: "混沌传奇", sex: "男", age: "25", like: "打羽毛球", friend: ""}

> {name: "混沌传奇", sex: "男", age: "25", like: "打羽毛球", friend: "阿龙"}
```
到这里我们完成了一个简单的状态管理器。
当然离真正的redux还差很远，下面我们继续完善我们的状态管理器。

### 有计划的状态管理器

我们用上面我们实现的状态管理器来实现一个自增自减程序吧，期望```count```是一个自增|自减的```number```类型的数值：
``` js
const createStore = (initState) => {
  let listeners = []
  let state = initState || {}

  const getState = () => state

  const updateState = (newState) => {
    state = newState
    listeners.forEach(listerner => listerner())
  }

  const subscribe = (listener) => {
    listeners.push(listener)
  }

  return {
    getState,
    updateState,
    subscribe,
  }
}



let initState = {
  count: 0
}
let { getState, updateState, subscribe } = createStore(initState)

console.log(getState())

subscribe(() => {
  console.log(getState())
})

//自增
updateState({
  ...getState(),
  count: getState().count+1,
})

//自减
updateState({
  ...getState(),
  count: getState().count-1,
})

//随便改下
updateState({
  ...getState(),
  count: '傻了吧',
})
```
运行程序，输出依次为：
``` js
> {count: 0}

> {count: 1}

> {count: 0}

> {count: "傻了吧"}
```
从输出我们可以看出，```count```被修改成了我们字符串，我们期望是```count```是```number```类型，解决这个问题的办法就是，我们修改状态的时候，来按照期望来修改状态。
怎么让修改状态的时候，按照我们期望来修改呢？
我们可以这样：

1. 我们定义一个状态修改行为（```action```）
2. 我们制定一个状态修改计划（```reducer```），```reducer```会接收上次更新后的```state```和```updateState```传递进来的最新的```action```，```reducer```根据```action```来修改```state```，修改完后，返回最新的```state```给```updateState```
3. ```updateState```方法接收```action```，把```action```告诉```reducer```......

根据这3点，我们来修改下我们的状态管理器
``` js
const createStore = (reducer, initState) => {
  let listeners = []
  let state = initState || {}

  const getState = () => state

  const updateState = (action) => {
    state = reducer(state, action)
    listeners.forEach(listerner => listerner())
  }

  const subscribe = (listener) => {
    listeners.push(listener)
  }

  return {
    getState,
    updateState,
    subscribe,
  }
}
```
我们来尝试使用下新的 状态管理器 来实现自增和自减
``` js
const createStore = (reducer, initState) => {
  let listeners = []
  let state = initState || {}

  const getState = () => state

  const updateState = (action) => {
    state = reducer(state, action)
    listeners.forEach(listerner => listerner())
  }

  const subscribe = (listener) => {
    listeners.push(listener)
  }

  return {
    getState,
    updateState,
    subscribe,
  }
}



let initState = {
  count: 0
}
let reducer = (state, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count+1,
      }
    case 'DECREMENT':
      return {
        ...state,
        count: state.count-1,
      }
    default:
      return state
  }
}
let { getState, updateState, subscribe } = createStore(reducer, initState)

console.log(getState())

subscribe(() => {
  console.log(getState())
})

//自增
updateState({
  type: 'INCREMENT',
})

//自减
updateState({
  type: 'DECREMENT',
})

//随便改下
updateState({
  count: '傻了吧',
})
```
运行程序，输出依次为：
``` js
> {count: 0}

> {count: 1}

> {count: 0}

> {count: 0}
```
我们可以看到，打印输出没有了```{count: "傻了吧"}```，改为了```{count: 0}```

为了更加像真正的```redux```，我们再改下我们的状态管理器，我们把```updateState```改为```dispatch```：
``` js
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

  return {
    getState,
    dispatch,
    subscribe,
  }
}
```

到这里为止，我们已经实现了一个有计划的状态管理器！

### 能够支撑大量数据管理的状态管理器
写作中。。。