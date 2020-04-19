# 从零一步一步实现一个Redux

### 前言
  ```redux```是什么？

  ```redux```是一个状态管理器

### 简单的状态管理器
```redux```是一个状态管理器，那么状态是什么？

状态就是数据，状态管理器也就是数据管理器。那么我们来实现一个简单的状态管理器吧。
##### 1. 状态管理器得有一个存储状态的地方吧，我们既然叫状态管理器，那就定义一个```state```变量吧，作为存储状态的地方。
``` js
let state = {
  name: '混沌传奇',
}
//使用下状态
console.log(state.name)
```
##### 2. 有了存储状态的地方，那么得有修改状态的方法，我们就起名为```updateState```吧。
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
##### 3. 有了存储状态的地方和修改状态的方法，感觉还缺点什么东西。我们思考下，状态修改了后，如果使用状态的地方不知道状态已经变化了，那么使用的状态的地方实际上使用的还是旧状态，我们目前没有办法告知使用状态的地方状态已经更新了。
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
##### 4. 解决了```state```数据的订阅问题，我们再看下已经实现的这个简单的状态管理器，是不是更新状态的```updateState```方法只能更新```state.name```，我们期望更新状态的```updateState```方法可以更新```state```中存储的所有数据，不只是```name```。我们来解决下这个问题。
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
##### 5. 升级了```updateState```方法之后，我们把我们的状态管理器再封装一下吧，现在的```listeners```和```state```都报露在外面，容易被别人更改
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
从输出我们可以看出，```count```被修改成了字符串类型，我们期望是```count```是```number```类型，解决这个问题的办法就是，我们修改状态的时候，来按照期望来修改状态。

怎么让修改状态的时候，按照我们期望来修改呢？

我们可以这样：

##### 1. 我们定义一个状态修改行为（```action```）
##### 2. 我们制定一个状态修改计划（```reducer```），```reducer```会接收上次更新后的```state```和```updateState```传递进来的最新的```action```，```reducer```根据```action```来修改```state```，修改完后，返回最新的```state```给```updateState```
##### 3. ```updateState```方法接收```action```，把```action```告诉```reducer```......

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

前面我们管理的数据都比较少，我们现在尝试把管理的数据增加一些：
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



let initState = {
  studyPerson: {
    name: '',
    age: '',
    like: [],
    sex: '',
    readedBooks: [],
  },
  playfulPerson: {
    name: '',
    age: '',
    like: [],
    sex: '',
    readedBooks: [],
  },
  books: [],
}
let reducer = (state, action) => {
  switch (action.type) {
    case 'SET_STUDY_PERSON':
      return {
        ...state,
        studyPerson: action.data,
      }
    case 'SET_PLAYFUL_PERSON':
      return {
        ...state,
        playfulPerson: action.data,
      }
    case 'SET_BOOKS':
      return {
        ...state,
        books: action.data,
      }
    default:
      return state
  }
}
let { getState, dispatch, subscribe } = createStore(reducer, initState)
//设置图书馆拥有的图书
dispatch({
  type: 'SET_BOOKS',
  data: [
    {
      id: 1,
      name: 'javascript高级程序设计',
      kind: '计算机编程',
    },
    {
      id: 2,
      name: '图解css3',
      kind: '计算机编程',
    },
    {
      id: 3,
      name: 'javascript函数式编程',
      kind: '计算机编程',
    },
    {
      id: 4,
      name: '三国演义',
      kind: '小说',
    },
    {
      id: 5,
      name: '篮球投篮技巧',
      kind: '运动类',
    },
  ],
})
//设置学习者信息
dispatch({
  type: 'SET_STUDY_PERSON',
  data: {
    name: '混沌传奇',
    age: 25,
    like: ['学习计算机知识', '打羽毛球'],
    sex: '男',
    readedBooks: [1, 2, 3],
  },
})
//设置爱玩者信息
dispatch({
  type: 'SET_PLAYFUL_PERSON',
  data: {
    name: '阿龙',
    age: 28,
    like: ['看综艺', '看小说', '看杂志'],
    sex: '男',
    readedBooks: [4, 5],
  },
})
console.log(getState())
```
从这段代码，我们可以看出，随着管理的数据量的增加，我们在```reducer```中写的逻辑就越来越多，而且，每次```dispatch```执行的时候，传给```dispatch```的```action```内容太多，阅读起来有点麻烦，看到的是一大坨代码。

怎么优化一下呢？

我们可以这样优化：
##### 1. 把```reducer```拆分成多个```reducer```，每个子```state```对应一个```reducer```，```studyPerson```、```playfulPerson```、```books```都是子```state```。
##### 2. 把每个子```state```对应的```reducer```合并成一个```rootReducer```，然后把```rootReducer```传递给```createStore```
##### 3. 每个```action```可以由```actionCreater```生成，把```action```归类到不同的```js```文件中，每个```js```文件```export```出各个```action```对应的```actionCreater```。
``` js
//文件 ./redux.js
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
export {
  createStore,
}

//文件 ./reducers.js
import {
  SET_STUDY_PERSON, 
  SET_PLAYFUL_PERSON, 
  SET_BOOKS,
} from './actions.js'
let studyPersonReducer = (state, action) => {
  switch (action.type) {
    case SET_STUDY_PERSON:
      return action.data
    default:
      return state
  }
}
let playfulPersonReducer = (state, action) => {
  switch (action.type) {
    case SET_PLAYFUL_PERSON:
      return action.data
    default:
      return state
  }
}
let booksReducer = (state, action) => {
  switch (action.type) {
    case SET_BOOKS:
      return action.data
    default:
      return state
  }
}
export {
  studyPersonReducer,
  playfulPersonReducer,
  booksReducer,
}

//文件 ./actions.js
export const SET_STUDY_PERSON = 'SET_STUDY_PERSON'
export const SET_PLAYFUL_PERSON = 'SET_PLAYFUL_PERSON'
export const SET_BOOKS = 'SET_BOOKS'
export const setStudyPerson = (data) => {
  return {
    type: SET_STUDY_PERSON,
    data,
  }
}
export const setPlayfulPerson = (data) => {
  return {
    type: SET_PLAYFUL_PERSON,
    data,
  }
}
export const setBook = (data) => {
  return {
    type: SET_BOOKS,
    data,
  }
}

//文件 ./index.js
import { createStore } from './redux.js'
import {
  studyPersonReducer,
  playfulPersonReducer,
  booksReducer,
} from './reducers.js'
import {
  setStudyPerson,
  setPlayfulPerson,
  setBook,
} from './actions.js'

let initState = {
  studyPerson: {
    name: '',
    age: '',
    like: [],
    sex: '',
    readedBooks: [],
  },
  playfulPerson: {
    name: '',
    age: '',
    like: [],
    sex: '',
    readedBooks: [],
  },
  books: [],
}
let rootReducer = (state, action) => {
  return {
    studyPerson: studyPersonReducer(state.studyPerson, action),
    playfulPerson: playfulPersonReducer(state.playfulPerson, action),
    books: booksReducer(state.books, action),
  }
}
let { getState, dispatch, subscribe } = createStore(rootReducer, initState)
//设置图书馆拥有的图书
dispatch(setBook([
  {
    id: 1,
    name: 'javascript高级程序设计',
    kind: '计算机编程',
  },
  {
    id: 2,
    name: '图解css3',
    kind: '计算机编程',
  },
  {
    id: 3,
    name: 'javascript函数式编程',
    kind: '计算机编程',
  },
  {
    id: 4,
    name: '三国演义',
    kind: '小说',
  },
  {
    id: 5,
    name: '篮球投篮技巧',
    kind: '运动类',
  },
]))
//设置学习者信息
dispatch(setStudyPerson({
  name: '混沌传奇',
  age: 25,
  like: ['学习计算机知识', '打羽毛球'],
  sex: '男',
  readedBooks: [1, 2, 3],
}))
//设置爱玩者信息
dispatch(setPlayfulPerson({
  name: '阿龙',
  age: 28,
  like: ['看综艺', '看小说', '看杂志'],
  sex: '男',
  readedBooks: [4, 5],
}))
console.log(getState())
```
拆分完```reducer```，并且把```action```按类划分到单独的```js```文件中后，我们的```index.js```看起来要稍微简略一些了，但是好像还是有很多代码。我们看看还有可以封装的地方吗？

仔细看我们刚才实现的代码，初始化```state```的代码占用了一大坨区域，合并子```reducer```的代码好像也可以抽离为工具方法

##### 1. 我们先来抽离合并子```reducer```的代码
前面我们实现的合并子```reducer```的代码如下：
``` js
...
let rootReducer = (state, action) => {
  return {
    studyPerson: studyPersonReducer(state.studyPerson, action),
    playfulPerson: playfulPersonReducer(state.playfulPerson, action),
    books: booksReducer(state.books, action)
  }
}
...
```
可以看到我们是定义了一个```rootReducer```函数，函数返回一个```state```对象，对象每个属性的值对应一个子```reducer```的执行，子```reducer```执行完毕返回的就是属性对于的子```state```值。

我们想想一下，我们是否可以实现一个方法（方法就叫```combineReducers```），这个方法只接收子```reducer```，返回一个```rootReducer```，这样我们只需要调用这个方法，就可以生成```rootReducer```了，比如：
``` js
const rootReducer = combineReducers({
    studyPerson: studyPersonReducer,
    playfulPerson: playfulPersonReducer,
    books: booksReducer,
})
```
我们尝试实现下```combineReducers```函数:
``` js
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
```
##### 2. 拆分和合并state
我们把```reducer```拆分为一个一个的子```reducer```，通过 ```combineReducers```合并了起来。但是还有个问题，```state``` 我们还是写在一起的，这样会造成```state```树很庞大，不直观，很难维护。我们需要拆分，一个```state```，一个 ```reducer```写一块。

我们先修改下```reducers.js```:
``` js
//文件 ./reducers.js
import {
  SET_STUDY_PERSON, 
  SET_PLAYFUL_PERSON, 
  SET_BOOKS 
} from './actions.js'

let initStudyPerson = {
  name: '',
  age: '',
  like: [],
  sex: '',
  readedBooks: [],
}
let studyPersonReducer = (state = initStudyPerson, action) => {
  switch (action.type) {
    case SET_STUDY_PERSON:
      return action.data
    default:
      return state
  }
}
let initPlayfulPerson = {
  name: '',
  age: '',
  like: [],
  sex: '',
  readedBooks: [],
}
let playfulPersonReducer = (state = initPlayfulPerson, action) => {
  switch (action.type) {
    case SET_PLAYFUL_PERSON:
      return action.data
    default:
      return state
  }
}
let booksReducer = (state = [], action) => {
  switch (action.type) {
    case SET_BOOKS:
      return action.data
    default:
      return state
  }
}
export {
  studyPersonReducer,
  playfulPersonReducer,
  booksReducer,
}
```
再修改下```redux.js```，```createStore```中增加一行 ```dispatch({ type: Symbol() })```，把```combineReducers```方法放在```redux.js```文件中
``` js
//文件 ./redux.js
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
```
本小节完整源码见 [demo-1](https://github.com/legend-li/MyBlog/tree/master/src/Redux/demo1)

到这里为止，我们的```redux```已经实现的差不多啦！

### 中间件 middleware

什么是```Redux```中间件？

```Redux```的中间件可以理解为是对```dispatch```方法的包装，增强```dispatch```的功能。

##### 1. 尝试包装下dispatch

假如我们需要在每次```redux```修改```state```的时候，打印下修改前的```state```和修改后的```state```以及触发修改```state```的```action```；

我们可以暂时这么包装下```dispatch```：

```js
import { createStore, combineReducers } from './redux.js'

const rootReducer = combineReducers({
    count: countReducer
})

const store = createStore(rootReducer);

const next = store.dispatch;

store.dispatch = (action) => {
  console.log('previous state:', store.getState())
  next(action)
  console.log('next state:', store.getState())
  console.log('action:', action)
}

store.dispatch({
  type: 'INCREMENT'
});
```
我们来运行下代码，输出结果是：
```js
> previous state: {count: 0}

> next state: {count: 0}

> action: {type: "INCREMENT"}
```
从输出结果可以看出，我们实现了对```dispatch```的增强。在改变```state```的时候，正确的打印出了改变```state```前的```state```值，改变后的```state```的值，以及触发```state```改变的```action```。

##### 2. 多中间件组合包装```dispatch```

上面我们实现了一个增强```dispatch```需求，如果现在我们在原有需求的基础上，又有了一个新的增强需求。比如：我想在每次```state```改变的时候，打印下当前时间。

尝试实现下代码：
``` js
const store = createStore(rootReducer);

const next = store.dispatch;

store.dispatch = (action) => {
  console.log('state change time:', new Date().toLocaleString())
  console.log('previous state:', store.getState())
  next(action)
  console.log('next state:', store.getState())
  console.log('action:', action)
}
```
如果我们，现在又有新的增强需求了，要记录每次改变state时出错的原因，我们再改下增强代码:
``` js
const store = createStore(rootReducer);

const next = store.dispatch;

store.dispatch = (action) => {
  try {
    console.log('state change time:', new Date().toLocaleString())
    console.log('previous state:', store.getState())
    next(action)
    console.log('next state:', store.getState())
    console.log('action:', action)
  } catch (e) {
    console.log('错误信息：', e)
  }
}
```
如果又双叒叕有新的增强需求了呢。。。。。。

是不是一直这么该增强代码，很麻烦，到时候dispatch函数会越来越庞大，很难维护。所以这个方式不可取，我们要考虑如何实现扩展性更强的多中间件包装dispatch的方法。

1. 把不同的增强需求，抽离成单个的函数:
``` js
const store = createStore(rootReducer);

const next = store.dispatch;

const loggerMiddleware = (action) => {
  console.log('previous state:', store.getState())
  next(action)
  console.log('next state:', store.getState())
  console.log('action:', action)
}

const updateTimeMiddleware = (action) => {
  console.log('state change time:', new Date().toLocaleString())
  loggerMiddleware(action)
}

const exceptionMiddleware = (action) => {
  try {
    updateTimeMiddleware(action)
  } catch (e) {
    console.log('错误信息：', e)
  }
}

store.dispatch = exceptionMiddleware
```
这样，看起来是把各个增强需求都抽离成单个的函数了，但是都不是纯函数，对外部数据有依赖，这样很不利于扩展。

我们来把这些增强函数都改成纯函数吧。

我们分两步来改造增强函数:
（1）把增强函数内调用的增强函数，都抽离出来，作为参数传递进增强函数：
``` js
const store = createStore(rootReducer);

const next = store.dispatch;

const loggerMiddleware = (next) => (action) => {
  console.log('previous state:', store.getState())
  next(action)
  console.log('next state:', store.getState())
  console.log('action:', action)
}

const updateTimeMiddleware = (next) => (action) => {
  console.log('state change time:', new Date().toLocaleString())
  next(action)
}

const exceptionMiddleware = (next) => (action) => {
  try {
    next(action)
  } catch (e) {
    console.log('错误信息：', e)
  }
}

store.dispatch = exceptionMiddleware(updateTimeMiddleware(loggerMiddleware(next)))
```
（2）把增强函数内对store的调用抽离出来，作为参数传递进增强函数：
``` js
const store = createStore(rootReducer);

const next = store.dispatch;

const loggerMiddleware = (store) => (next) => (action) => {
  console.log('previous state:', store.getState())
  next(action)
  console.log('next state:', store.getState())
  console.log('action:', action)
}

const updateTimeMiddleware = (store) => (next) => (action) => {
  console.log('state change time:', new Date().toLocaleString())
  next(action)
}

const exceptionMiddleware = (store) => (next) => (action) => {
  try {
    next(action)
  } catch (e) {
    console.log('错误信息：', e)
  }
}

const logger = loggerMiddleware(store)
const updateTime = updateTimeMiddleware(store)
const exception = exceptionMiddleware(store)

store.dispatch = exception(updateTime(logger(next)))
```
到这里为止，我们真正的实现了可扩展的、独立的、纯的增强函数（增强函数即```redux```中间件），并且多个增强函数可以很方便的组合使用。

##### 3. 优化中间件的使用方式

我们上面已经实现了可扩展、独立的、纯的中间件，但是我们最后还需要执行
``` js
const logger = loggerMiddleware(store)
const updateTime = updateTimeMiddleware(store)
const exception = exceptionMiddleware(store)
```
来生成```logger```、```updateTime```、```exception```，
并且执行
``` js
store.dispatch = exception(updateTime(logger(next)))
```
来覆盖```store```的```dispatch```方法。

其实我们没必要关心中间件怎么使用，我们只需要知道有三个中间件，剩下的细节都封装起来。

比如，我们可以通过包装```createStore```来把中间件使用细节都封装在包装```createStore```的代码内。

期望的用法：
``` js
/**
 * applyMiddleware 接收中间件，把中间件使用细节包装在了 
 * applyMiddleware 内部，然后返回一个函数，
 * 函数接收旧的 createStore，返回新的 createStore
 */
const newCreateStore = applyMiddleware(exceptionMiddleware, updateTimeMiddleware, loggerMiddleware)(createStore);

// newCreateStore 返回了一个 dispatch 被重写过的 store
const store = newCreateStore(reducer);
```

实现applyMiddleware：
``` js
const applyMiddleware = (...middlewares) => (oldCreateStore) => (reducer, initState) => {
  // 生成 store
  let store = oldCreateStore(reducer, initState)
  // 给每个 middleware 传递进去 store，相当于 loggerMiddleware(store)
  // 为了防止中间件修改 store 的其他方法，我们只报露 store 的 getState 方法
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
```

我们现在包装```createStore```的代码在```createStore```函数外面，为了使用上的方便，我们稍微修改下```createStore```函数，期望用法：
``` js
const rewriteCreateStoreFunc = applyMiddleware(exceptionMiddleware, updateTimeMiddleware, loggerMiddleware)

const store = createStore(reducer, initState, rewriteCreateStoreFunc)
```

```createStore```修改后的代码如下：

``` js
const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
  //如果有 rewriteCreateStoreFunc，那就生成新的 createStore
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

  //注意：Symbol() 不跟任何值相等，所以 type 为 Symbol()，则 reducer 不匹配任何 type，走 default 逻辑，返回初始化 state 值，这样就达到了初始化 state 的效果。
  dispatch({ type: Symbol() })

  return {
    getState,
    dispatch,
    subscribe,
  }
}
```

本小节完整源码见 [demo-2](https://github.com/legend-li/MyBlog/tree/master/src/Redux/demo2)

到这里，我们的```redux```中间件功能全部实现完了。

### redux其他功能

##### 退订

```store.subscribe```是用来订阅```state```变化方法，既然有订阅，那么就存在取消订阅的需求，我们来实现下取消订阅功能。

修改```store.subscribe```的实现如下：
``` js
const subscribe = (listener) => {
  listeners.push(listener)
  return () => {
    const index = listeners.indexOf(listener)
    listeners.splice(index, 1)
  }
}
```

使用方法如下：
``` js
// 订阅
const unsubscribe = store.subscribe(() => {
  let state = store.getState();
  console.log(state);
});
// 退订
unsubscribe();
```

##### createStore函数可以省略initState参数

```createStore```允许省略```initState```参数，比如这样：
``` js
let store = createStore(rootReducer, rewriteCreateStoreFunc)
```
修改下我们的```createStore```方法，兼容省略```initState```参数的用法：
``` js
const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
  // 兼容省略参数 initState
  if (typeof initState === 'function') {
    rewriteCreateStoreFunc = initState
    initState = undefined
  }

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
    return () => {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  // 注意：Symbol() 不跟任何值相等，所以 type 为 Symbol()，则 reducer 不匹配任何 type，走 default 逻辑，返回初始化 state 值，这样就达到了初始化 state 的效果。
  dispatch({ type: Symbol() })

  return {
    getState,
    dispatch,
    subscribe,
  }
}
```

##### replaceReducer方法

有时候，我们的页面做了按需加载，如果想把每个按需加载的页面的组件对应的```reducer```也按需加载，可以通过```replaceReducer```来实现，比如：
``` js
// 初始页面需要的 reducer
const reducer = combineReducers({
  books: booksReducer
});
const store = createStore(reducer);

// 按需加载的页面1需要的 reducer，在页面加载的时候再加载
// 然后，通过 combineReducers 生成新的 reducer
// 最后通过 store.replaceReducer 方法把新的 reducer 替换掉旧的 reducer
const nextReducer = combineReducers({
  playfulPerson: playfulPersonReducer,
  books: booksReducer,
});
store.replaceReducer(nextReducer);

// 按需加载的页面2需要的 reducer，在页面加载的时候再加载
// 然后，通过 combineReducers 生成新的 reducer
// 最后通过 store.replaceReducer 方法把新的 reducer 替换掉旧的 reducer
const nextReducer = combineReducers({
  studyPerson: studyPersonReducer,
  playfulPerson: playfulPersonReducer,
  books: booksReducer,
});
store.replaceReducer(nextReducer);
```

```createStore```函数内部新增```replaceReducer```方法，同时返回的```store```中包含```replaceReducer```方法，代码实现如下：
``` js
const createStore = (reducer, initState, rewriteCreateStoreFunc) => {
  // 兼容省略参数 initState
  if (typeof initState === 'function') {
    rewriteCreateStoreFunc = initState
    initState = undefined
  }

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
    return () => {
      const index = listeners.indexOf(listener)
      listeners.splice(index, 1)
    }
  }

  function replaceReducer(nextReducer) {
    reducer = nextReducer
    // 把新的 reducer 的默认状态更新到 state 树上
    dispatch({ type: Symbol() })
  }

  // 注意：Symbol() 不跟任何值相等，所以 type 为 Symbol()，则 reducer 不匹配任何 type，走 default 逻辑，返回初始化 state 值，这样就达到了初始化 state 的效果。
  dispatch({ type: Symbol() })

  return {
    getState,
    dispatch,
    subscribe,
    replaceReducer,
  }
}
```
至此，我要实现的一个```redux```已经全部实现了，为了缩短篇幅，省略了用的比较少的```bindActionCreators```方法的讲解和实现，同时实现代码中去掉了各种校验代码。

完整的示例源码见 [demo-3](https://github.com/legend-li/MyBlog/tree/master/src/Redux/demo3)

### 最后

文中提到了```纯函数```，那么什么是```纯函数```呢？

简单来说，就是相同的输入，得到的输出永远是一样的，没有任何副作用。

```纯函数```属于函数式编程中的一个概念。

给大家推荐一本js函数式编程指南的书，支持在线浏览[函数式编程指南](https://llh911001.gitbooks.io/mostly-adequate-guide-chinese/content/)