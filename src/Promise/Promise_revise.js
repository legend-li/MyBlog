function Promise (executor) {
  this.status = 'pending'
  this.data = undefined
  this.onResolvedCallback = []
  this.onRejectedCallback = []

  const resolve = (value) => {
    if (this === value) {
      reject(new TypeError('Chaining cycle detected for promise!'))
      return
    }

    if ( (value !== null ) && (typeof value === 'function' || typeof value === 'object') ) {
      let then
      var thenCalledOrThrow = false
      try {
        then = value.then
        if (typeof then === 'function') {
          then.call(value, val => {
            if (thenCalledOrThrow) return
            thenCalledOrThrow = true
            resolve(val)
          }, err => {
            if (thenCalledOrThrow) return
            thenCalledOrThrow = true
            reject(err)
          })
          return
        }
      } catch (e) {
        if (thenCalledOrThrow) return
        thenCalledOrThrow = true
        reject(e)
        return
      }
    }

    setTimeout(() => {
      if (this.status === 'pending') {
        this.status = 'fulfilled'
        this.data = value
        this.onResolvedCallback.forEach(onResolve => onResolve(value))
      }
    })
  }

  const reject = (reason) => {
    setTimeout(() => {
      if (this.status === 'pending') {
        this.status = 'rejected'
        this.data = reason
        this.onRejectedCallback.forEach(onReject => onReject(reason))
      }
    })
  }

  try {
    executor(resolve, reject)
  } catch (e) {
    reject(e)
  }
}

Promise.prototype.then = function (onResolve, onReject) {
  
  onResolve = typeof onResolve !== 'function' ? value => value : onResolve
  onReject = typeof onReject !== 'function' ? reason => {throw reason} : onReject

  if (this.status === 'pending') {
    return new Promise((resolve, reject) => {
      this.onResolvedCallback.push(value => {
        try {
          let x = onResolve(value)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
      
      this.onRejectedCallback.push(reason => {
        try {
          let x = onReject(reason)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  if (this.status === 'fulfilled') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onResolve(this.data)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

  if (this.status === 'rejected') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          let x = onReject(this.data)
          resolve(x)
        } catch (e) {
          reject(e)
        }
      })
    })
  }

}

Promise.all = function (promises) {
  return new Promise((resolve, reject) => {
    let values = []
    let count = 0
    promises.forEach((promise, index) => {
      promise.then(value => {
        values[index] = value
        count++
        if (count === promises.length) {
          resolve(values)
        }
      }, reject)
    })
  })
}

Promise.race = promises => new Promise((resolve, reject) => {
  promises.forEach((promise) => {
     promise.then(resolve, reject);
  });
})

Promise.prototype.catch = function (onReject) {
  return this.then(null, onReject)
}

Promise.resolve = value => new Promise((resolve, reject) => resolve(value))

Promise.reject = reason => new Promise((resolve, reject) => reject(reason))

Promise.deferred = Promise.defer = function() {
  var defer = {}
  defer.promise = new Promise(function(resolve, reject) {
    defer.resolve = resolve
    defer.reject = reject
  })
  return defer
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

// console.time('promiseAll')
// let p1 = new Promise(function(resolve, reject) {
//   // resolve(new Promise(function(resolve, reject){
//   //   setTimeout(() => {
//   //     resolve('0.1')
//   //   }, 1000)
//   // }))
//   setTimeout(() => {reject(1.1)}, 1000)
// })

// let p2 = new Promise(function(resolve, reject) {
//   // resolve(new Promise(function(resolve, reject){
//   //   setTimeout(() => {
//   //     resolve('0.2')
//   //   }, 2000)
//   // }))
//   setTimeout(() => {reject(1.2)}, 100)
// })
// Promise.all([p1, p2]).then(res => {
//   console.timeEnd('promiseAll')
//   console.log('res:', res)
// }, err => {
//   console.timeEnd('promiseAll')
//   console.log('err:', err)
// })

// 测试promise2 === x
// let p1then = p1.then(function (value) {
//   return p1then
// }, function (err) {
//   return p1then
// })

// p1then.then(value => {
//   console.log('value:', value)
// }, err => {
//   console.log('err:', err)
// })


// let p = new Promise((resolve, reject) => {
//   setTimeout(() => reject('reject'), 100)
// }).then().then(val => {
//   console.log('val2:', val)
// }, err => {
//   console.log('err2:', err)
// })

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

// Promise核心内容完整测试方法
// let promisesAplusTests =  require("promises-aplus-tests")
// promisesAplusTests(Promise, function(err){
//   console.log('err:', err);
//   //全部完成;输出在控制台中。或者检查`err`表示失败次数。 
// })