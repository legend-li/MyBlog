
const forEach = (fn, arr) => {
  let i = 0
  for (const val of arr) {
    fn(val, i++, arr)
  }
}

const forEachObj = (fn, obj) => {
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn(obj[key])
    }
  }
}

const unless = (predicate, fn) => {
  !predicate ? fn() : undefined
}

const times = (fn, times) => {
  for (let i = 1; i <= times; i++) {
    fn(i)
  }
}

const every = (fn, arr) => {
  let i = 0, res = true
  for (const val of arr) {
    res = res && !!fn(val, i++, arr)
    if (!res) break
  }
  return res
}

const some = (fn, arr) => {
  let i = 0, res = false
  for (const val of arr) {
    res = res || !!fn(val, i++, arr)
    if (res) break
  }
  return res
}

const sortBy = (property, fn) => {
  return (a, b) => {
    if (typeof fn === 'function') {
      return fn(a[property]) < fn(b[property]) ? -1 : fn(a[property]) > fn(b[property]) ? 1 : 0
    } else {
      return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
    }
  }
}

const once = (fn) => {
  let done = false
  return (...args) => {
    return done ? undefined : (done = true, fn.apply(this, args))
  }
}

const memoized = (fn) => {
  let cache = []
  return (arg) => {
    if (!(arg in cache)) {
      cache[arg] = fn.apply(this, [arg])
    }
    return cache[arg]
  }
}

const map = (fn, arr) => {
  let newArr = []
  for (const val of arr) {
    newArr.push(fn(val))
  }
  return newArr
}

const filter = (fn, arr) => {
  let newArr = []
  for (const val of arr) {
    if (fn(val)) {
      newArr.push(val)
    }
  }
  return newArr
}

const concatAll = (arr) => {
  let newArr = []
  for (val of arr) {
    if (Array.isArray(val)) {
      newArr.push.apply(newArr, concatAll(val))
    } else {
      newArr.push(val)
    }
  }
  return newArr
}

const reduce = (fn, arr, init) => {
  let total = init
  if (!Array.isArray(arr)) return undefined
  if (total === undefined) {
    total = arr[0]
    arr = arr.slice(1)
  }
  if (arr.length) {
    for (val of arr) {
      total = fn(total, val)
    }
  } else {
    total = fn(arr[0])
  }
  return total
}

const zip = (fn, arr1, arr2) => {
  let minLen = Math.min(arr1.length, arr2.length),
      i = 0,
      arr = []
  for (const val of arr1) {
    if (i < minLen) {
      arr.push(fn(val, arr2[i]))
    } else {
      break
    }
    i++
  }
  return arr
}

const curry = (fn, ...args) => {
  let argLens = fn.length
  return (...args2) => {
    let _args = args.concat(args2)
    if ((argLens > 0 && _args.length < argLens) || (argLens === 0 && args2.length !== 0)) {
      return curry.call(null, fn, ..._args)
    } else {
      return fn.apply(this, _args)
    }
  }
}

const partial = (fn, ...argsInit) => {
  return (..._args) => {
    let index = 0, args = argsInit.slice(0)
    for (arg of args) {
      if (arg === undefined) {
        args[index] = _args[0]
        _args.splice(0, 1)
      }
      index++
    }
    args = _args.length ? args.concat(_args) : args
    return  fn(...args)
  }
}

const compose = (...fns) => {
  return (arg) => {
    let fnArr = fns.reverse(), result = arg
    for (const fn of fnArr) {
      result = fn(result)
    }
    return result
  }
}

const pipe = (...fns) => {
  return (arg) => {
    let result = arg
    for (const fn of fns) {
      result = fn(result)
    }
    return result
  }
}

const tap = (value) =>
  (fn) => (
    typeof(fn) === 'function' && fn(value),
    console.log(value)
  )


module.exports = {
  forEach,
  forEachObj,
  unless,
  times,
  every,
  some,
  sortBy,
  once,
  memoized,
  map,
  filter,
  reduce,
  zip,
  pipe,
  tap,
  curry,
  partial,
  compose,
}