
function Promise (executor) {
  let self = this
  self.status = 'pending' //Promise当前状态
  self.data = undefined //当前Promise的值
  self.onResolvedCallback = [] //Promise resolve时的回调函数集合
  self.onRejectedCallback = [] //Promise reject时的回调函数集合

  function resolve (value) {
    if (value instanceof Promise) {
      value.then(resolve, reject)
      return
    }
    setTimeout(function(){
      if (self.status === 'pending') {
        self.status = 'fulfilled'
        self.data = value
        //执行resolve的回调函数，将value传递到callback中
        self.onResolvedCallback.forEach(callback => callback(value))
      }
    })
  }

  function reject (reason) {
    setTimeout(function(){
      if (self.status === 'pending') {
        self.status = 'rejected'
        self.data = reason
        //执行reject的回调函数，将reason传递到callback中
        self.onRejectedCallback.forEach(callback => callback(reason))
      }
    })
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
  
}

function resolvePromise (promise2, x, resolve, reject) {

  let then 
  let thenCalledOrThrow = false

  if (promise2 === x) {
    reject(new TypeError('Chaining cycle detected for promise!'))
    return
  }

  if (x instanceof Promise) {
    if (x.status === 'pending') {
      x.then(value => {
        resolvePromise(promise2, value, resolve, reject)
      }, err => {
        reject(err)
      })
    }  else {
      x.then(resolve, reject)
    }
    return
  }

  if ((x !== null) && ((typeof x === 'function') || (typeof x === 'object'))) {
    try {
      then = x.then //because x.then could be a getter
      if (typeof then === 'function') {
        then.call(x, value => {
          if (thenCalledOrThrow) return
          thenCalledOrThrow = true
          resolvePromise(promise2, value, resolve, reject)
          return
        }, err => {
          if (thenCalledOrThrow) return
          thenCalledOrThrow = true
          reject(err)
          return
        })
      } else {
        resolve(x)
      }
    } catch (e) {
      if (thenCalledOrThrow) return
      thenCalledOrThrow = true
      reject(e)
      return
    }
  } else {
    resolve(x)
  }

}

Promise.prototype.then = function (onResolve, onReject) {
  let self = this
  let promise2
  onResolve = typeof onResolve==='function' ? onResolve : function(value){return value}
  onReject = typeof onReject==='function' ? onReject : function(reason){throw reason}
  
  if (self.status === 'pending') {
     return promise2 = new Promise(function(resolve, reject){
      self.onResolvedCallback.push(function(value){
        try {
          let x = onResolve(value)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })

      self.onRejectedCallback.push(function(reason){
        try {
          let x = onReject(reason)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  if (self.status === 'fulfilled') {
    return promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        try {
          let x = onResolve(self.data)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      },0)
    })
  }

  if (self.status === 'rejected') {
    return promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        try {
          let x = onReject(self.data)
          resolvePromise(promise2, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      },0)
    })
  }
}

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let values = []
    let count = 0
    promises.forEach((promise, index) => {
      promise.then(value => {
        console.log('value:', value, 'index:', index)
        values[index] = value
        count++
        if (count === promises.length) {
          resolve(values)
        }
      }, reject)
    })
  })
}

Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
         promise.then(resolve, reject);
      });
  });
}

Promise.prototype.catch = function (onReject) {
  return this.then(null, onReject)
}

Promise.resolve = function (value) {
  return new Promise(function(resolve, reject){resolve(value)})
}

Promise.reject = function (reason) {
  return new Promise(function(resolve, reject){reject(reason)})
}

Promise.deferred = Promise.defer = function() {
  var defer = {}
  defer.promise = new Promise(function(resolve, reject) {
    defer.resolve = resolve
    defer.reject = reject
  })
  return defer
}

try {
  module.exports = Promise
} catch (e) {
}



// 小部分测试demo
// // Promise构造函数接收一个executor函数，executor函数执行完同步或异步操作后，调用它的两个参数resolve和reject
// var promiseObj = new Promise(function(resolve, reject) {
//   // resolve(new Promise(function(resolve, reject){resolve('0.1')}))
//   reject(1.2)
// })
// promiseObj.then(val => {
//   console.log('val:', val)
//   return new Promise(function(resolve, reject){resolve('2.1')})
// }, err => {
//   console.log('err:', err)
//   return new Promise(function(resolve, reject){reject('2.2')})
// }).then(val => {
//   console.log('val:', val)
// }, err => {
//   console.log('err:', err)
// })

console.time('promiseAll')
let p1 = new Promise(function(resolve, reject) {
  // resolve(new Promise(function(resolve, reject){
  //   setTimeout(() => {
  //     resolve('0.1')
  //   }, 1000)
  // }))
  setTimeout(() => {reject(1.1)}, 1000)
})

let p2 = new Promise(function(resolve, reject) {
  // resolve(new Promise(function(resolve, reject){
  //   setTimeout(() => {
  //     resolve('0.2')
  //   }, 2000)
  // }))
  setTimeout(() => {reject(1.2)}, 100)
})
Promise.all([p1, p2]).then(res => {
  console.timeEnd('promiseAll')
  console.log('res:', res)
}, err => {
  console.timeEnd('promiseAll')
  console.log('err:', err)
})


// Promise核心内容完整测试方法
// let promisesAplusTests =  require("promises-aplus-tests")
// promisesAplusTests(Promise, function(err){
//   console.log('err:', err);
//   //全部完成;输出在控制台中。或者检查`err`表示失败次数。 
// })