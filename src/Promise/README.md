# 从零一步一步实现一个完整版的Promise

> Promise A+ 规范 <br>
[中文翻译版地址](https://malcolmyu.github.io/2015/06/12/Promises-A-Plus/) <br>
[英文原版地址](https://promisesaplus.com/)

### Promise标准解读

#### 1. promise相当于一个状态机

拥有三种状态：

- pending

- fulfilled

- rejected

(1) promise 对象初始化状态为 pending

(2) 当调用resolve(成功)，会由pending => fulfilled

(3) 当调用reject(失败)，会由pending => rejected


#### 2. promise对象方法

1. 标准中只有一个then方法，没有catch，race，all等方法，甚至没有构造函数
  Promise标准中仅指定了Promise对象的then方法的行为，其它一切我们常见的方法/函数都并没有指定，包括catch，race，all等常用方法，甚至也没有指定该如何构造出一个Promise对象，另外then也没有一般实现中（Q, $q等）所支持的第三个参数，一般称onProgress
  
2. then方法返回一个新的Promise
  Promise的then方法返回一个新的Promise，而不是返回this，此处在下文会有更多解释
    ```js
    promise2 = promise1.then(alert)
    promise2 != promise1 // true
    ```
    
3. 不同Promise的实现需要可以相互调用(interoperable)

4. Promise的初始状态为pending，它可以由此状态转换为fulfilled或者rejected，一旦状态确定，就不可以再次转换为其它状态，状态确定的过程称为settle

#### 3. Promise的其他方法

除了上文中说的then方法，本文实现的Promise会在基于标准之上，新增catch，race，all，resolve，reject方法

1. Promise.prototype.catch，在链式写法中可以捕获前面的异常
    ```js
    promise.catch(onRejected)
    // 相当于
    promise.then(null, onRrejected);

    // 注意
    // onRejected 不能捕获当前onFulfilled中的异常
    promise.then(onFulfilled, onRrejected); 

    // 可以写成：
    promise.then(onFulfilled)
          .catch(onRrejected); 
    ```

2. Promise.resolve，返回一个fulfilled状态的promise对象
    ```js
    Promise.resolve('hello').then(function(value){
      console.log(value);
    });

    Promise.resolve('hello');
    // 相当于
    const promise = new Promise(resolve => {
      resolve('hello');
    });
    ```

3. Promise.reject，返回一个rejected状态的promise对象
    ```js
    Promise.reject(24);
    new Promise((resolve, reject) => {
      reject(24);
    });
    ```

4. Promise.all，接收一个promise对象数组为参数
  只有全部 promise 进入 fulfilled 状态才会resolve 通常会用来处理 多个并行异步操作
    ```js
    const p1 = new Promise((resolve, reject) => {
        resolve(1);
    });

    const p2 = new Promise((resolve, reject) => {
        resolve(2);
    });

    const p3 = new Promise((resolve, reject) => {
        resolve(3);
    });

    Promise.all([p1, p2, p3]).then(data => { 
        console.log(data); // [1, 2, 3] 结果顺序和promise实例数组顺序是一致的
    }, err => {
        console.log(err);
    });
    ```

5. Promise.race，接收一个promise对象数组为参数
  Promise.race 只要有一个promise对象进入 fulfilled 或者 rejected 状态的话，就会继续进行后面的处理
    ```js
    function timerPromisefy(delay) {
      return new Promise(function (resolve, reject) {
          setTimeout(function () {
              resolve(delay);
          }, delay);
      });
    }
    var startDate = Date.now();

    Promise.race([
        timerPromisefy(10),
        timerPromisefy(20),
        timerPromisefy(30)
    ]).then(function (values) {
        console.log(values); // 10
    });
    ```

### 一步一步实现一个Promise

下面我们就来一步一步实现一个Promise

#### 构造函数

因为标准并没有指定如何构造一个Promise对象，所以我们同样以目前一般Promise实现中通用的方法来构造一个Promise对象，也是ES6原生Promise里所使用的方式，即：

```js
// Promise构造函数接收一个executor函数，executor函数执行完同步或异步操作后，调用它的两个参数resolve和reject
var promise = new Promise(function(resolve, reject) {
  /*
    如果操作成功，调用resolve并传入value
    如果操作失败，调用reject并传入reason
  */
})
```

我们先实现构造函数的框架如下：

```js
function Promise(executor) {
  var self = this
  self.status = 'pending' // Promise当前的状态
  self.data = undefined  // Promise的值
  self.onResolvedCallback = [] // Promise resolve时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面
  self.onRejectedCallback = [] // Promise reject时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面

  executor(resolve, reject) // 执行executor并传入相应的参数
}
```

上面的代码基本实现了Promise构造函数的主体，但目前还有两个问题：

1. 我们给executor函数传了两个参数：resolve和reject，这两个参数目前还没有定义

2. executor有可能会出错（throw），类似下面这样，而如果executor出错，Promise应该被其throw出的值reject：

    ```js
    new Promise(function(resolve, reject) {
      throw 2
    })
    ```

所以我们需要在构造函数里定义resolve和reject这两个函数：

```js
function Promise(executor) {
  var self = this
  self.status = 'pending' // Promise当前的状态
  self.data = undefined  // Promise的值
  self.onResolvedCallback = [] // Promise resolve时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面
  self.onRejectedCallback = [] // Promise reject时的回调函数集，因为在Promise结束之前有可能有多个回调添加到它上面

  function resolve(value) {
    // TODO
  }

  function reject(reason) {
    // TODO
  }

  try { // 考虑到执行executor的过程中有可能出错，所以我们用try/catch块给包起来，并且在出错后以catch到的值reject掉这个Promise
    executor(resolve, reject) // 执行executor
  } catch(e) {
    reject(e)
  }
}
```

接下来，我们实现resolve和reject这两个函数

```js
function Promise(executor) {
  // ...

  function resolve(value) {
    if (self.status === 'pending') {
      self.status = 'fulfilled'
      self.data = value
      //执行resolve的回调函数，将value传递到callback中
      self.onResolvedCallback.forEach(callback => callback(value))
    }
  }

  function reject(reason) {
    if (self.status === 'pending') {
      self.status = 'rejected'
      self.data = reason
      //执行reject的回调函数，将reason传递到callback中
      self.onRejectedCallback.forEach(callback => callback(reason))
    }
  }

  // ...
}

```

基本上就是在判断状态为pending之后把状态改为相应的值，并把对应的value和reason存在self的data属性上面，之后执行相应的回调函数，逻辑很简单，这里就不多解释了。

#### then方法

Promise对象有一个then方法，用来注册在这个Promise状态确定后的回调，很明显，then方法需要写在原型链上。then方法会返回一个Promise，关于这一点，Promise/A+标准并没有要求返回的这个Promise是一个新的对象，但在Promise/A标准中，明确规定了then要返回一个新的对象，目前的Promise实现中then几乎都是返回一个新的Promise对象，所以在我们的实现中，也让then返回一个新的Promise对象。

关于这一点，我认为标准中是有一点矛盾的：

[标准中说](https://promisesaplus.com/#point-49)，如果promise2 = promise1.then(onResolved, onRejected)里的onResolved/onRejected返回一个Promise，则promise2直接取这个Promise的状态和值为己用，但考虑如下代码：

```js
promise2 = promise1.then(function foo(value) {
  return Promise.reject(3)
})
```

此处如果foo运行了，则promise1的状态必然已经确定且为resolved，如果then返回了this（即promise2 === promise1），说明promise2和promise1是同一个对象，而此时promise1/2的状态已经确定，没有办法再取Promise.reject(3)的状态和结果为己用，因为Promise的状态确定后就不可再转换为其它状态。

另外每个Promise对象都可以在其上多次调用then方法，而每次调用then返回的Promise的状态取决于那一次调用then时传入参数的返回值，所以then不能返回this，因为then每次返回的Promise的结果都有可能不同。

下面我们来实现then方法：

```js
// then方法接收两个参数，onResolved，onRejected，分别为Promise成功或失败后的回调
Promise.prototype.then = function (onResolve, onReject) {
  let self = this
  let promise2

  // 根据标准，如果then的参数不是function，则我们需要忽略它，此处以如下方式处理
  onResolve = typeof onResolve==='function' ? onResolve : function(value){}
  onReject = typeof onReject==='function' ? onReject : function(reason){}
  
  if (self.status === 'pending') {
     return promise2 = new Promise(function(resolve, reject){

    })
  }

  if (self.status === 'fulfilled') {
    return promise2 = new Promise(function(resolve, reject){

    })
  }

  if (self.status === 'rejected') {
    return promise2 = new Promise(function(resolve, reject){

    })
  }
}
```

Promise总共有三种可能的状态，我们分三个if块来处理，在里面分别都返回一个new Promise。

根据标准，我们知道，对于如下代码，promise2的值取决于then里面函数的返回值：

```js
promise2 = promise1.then(function(value) {
  return 4
}, function(reason) {
  throw new Error('sth went wrong')
})
```

如果promise1被resolve了，promise2的将被4 resolve，如果promise1被reject了，promise2将被new Error('sth went wrong') reject，更多复杂的情况不再详述。

所以，我们需要在then里面执行onResolved或者onRejected，并根据返回值(标准中记为x)来确定promise2的结果，并且，如果onResolved/onRejected返回的是一个Promise，promise2将直接取这个Promise的结果：

```js
// then方法接收两个参数，onResolved，onRejected，分别为Promise成功或失败后的回调
Promise.prototype.then = function (onResolve, onReject) {
  let self = this
  let promise2

  // 根据标准，如果then的参数不是function，则我们需要忽略它，此处以如下方式处理
  onResolve = typeof onResolve==='function' ? onResolve : function(value){}
  onReject = typeof onReject==='function' ? onReject : function(reason){}
  
  if (self.status === 'fulfilled') {
    // 如果promise1(此处即为this/self)的状态已经确定并且是fulfilled，我们调用onResolved
    // 因为考虑到有可能throw，所以我们将其包在try/catch块里
    return promise2 = new Promise(function(resolve, reject){
      try {
        var x = onResolved(self.data)
        if (x instanceof Promise) { // 如果onResolved的返回值是一个Promise对象，直接取它的结果做为promise2的结果
          x.then(resolve, reject)
        } else {
          resolve(x) // 否则，以它的返回值做为promise2的结果
        }
      } catch (e) {
        reject(e) // 如果出错，以捕获到的错误做为promise2的结果
      }
    })
  }

  // 此处与前一个if块的逻辑几乎相同，区别在于所调用的是onRejected函数，就不再做过多解释
  if (self.status === 'rejected') {
    return promise2 = new Promise(function(resolve, reject){
      try {
        var x = onRejected(self.data)
        if (x instanceof Promise) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  if (self.status === 'pending') {
    // 如果当前的Promise还处于pending状态，我们并不能确定调用onResolved还是onRejected，
    // 只能等到Promise的状态确定后，才能确实如何处理。
    // 所以我们需要把我们的 两种情况 的处理逻辑做为callback放入promise1(此处即this/self)的回调数组里
    // 逻辑本身跟第一个if块内的几乎一致，此处不做过多解释
    return promise2 = new Promise(function(resolve, reject){
      self.onResolvedCallback.push(function(value) {
        try {
          var x = onResolved(self.data)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          } else {
            resolve(x)
          }
        } catch (e) {
          reject(e)
        }
      })

      self.onRejectedCallback.push(function(reason) {
        try {
          var x = onRejected(self.data)
          if (x instanceof Promise) {
            x.then(resolve, reject)
          } else {
            resolve(x)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  }

}

// 为了下文方便，我们顺便实现一个catch方法
Promise.prototype.catch = function(onRejected) {
  return this.then(null, onRejected)
}
```

至此，我们基本实现了Promise标准中所涉及到的内容，但还有几个问题：

1. 不同的Promise实现之间需要无缝的可交互，即Q的Promise，ES6的Promise，和我们实现的Promise之间以及其它的Promise实现，应该并且是有必要无缝相互调用的，比如：
    ```js
    // 此处用MyPromise来代表我们实现的Promise
    new MyPromise(function(resolve, reject) { // 我们实现的Promise
      setTimeout(function() {
        resolve(42)
      }, 2000)
    }).then(function() {
      return new Promise.reject(2) // ES6的Promise
    }).then(function() {
      return Q.all([ // Q的Promise
        new MyPromise(resolve=>resolve(8)), // 我们实现的Promise
        new Promise.resolve(9), // ES6的Promise
        Q.resolve(9) // Q的Promise
      ])
    })
    ```
    我们前面实现的代码并没有处理这样的逻辑，我们只判断了onResolved/onRejected的返回值是否为我们实现的Promise的实例，并没有做任何其它的判断，所以上面这样的代码目前是没有办法在我们的Promise里正确运行的。
2. 下面这样的代码目前也是没办法处理的：
    ```js
    new Promise(resolve=>resolve(8))
      .then()
      .then()
      .then(function foo(value) {
        alert(value)
      })
    ```
    正确的行为应该是alert出8，而如果拿我们的Promise，运行上述代码，将会alert出undefined。这种行为称为穿透，即8这个值会穿透两个then(说Promise更为准确)到达最后一个then里的foo函数里，成为它的实参，最终将会alert出8。

#### 下面我们首先处理简单的情况，值的穿透

##### Promise值的穿透

通过观察，会发现我们希望下面这段代码

```js
new Promise(resolve=>resolve(8))
  .then()
  .catch()
  .then(function(value) {
    alert(value)
  })
```

跟下面这段代码的行为是一样的

```js
new Promise(resolve=>resolve(8))
  .then(function(value){
    return value
  })
  .catch(function(reason){
    throw reason
  })
  .then(function(value) {
    alert(value)
  })
```

所以如果想要把then的实参留空且让值可以穿透到后面，意味着then的两个参数的默认值分别为```function(value) {return value}，function(reason) {throw reason}```。

所以我们只需要把then里判断onResolved和onRejected的部分改成如下即可：

```js
onResolved = typeof onResolved === 'function' ? onResolved : function(value) {return value}
onRejected = typeof onRejected === 'function' ? onRejected : function(reason) {throw reason}
```

##### 于是Promise神奇的值的穿透也没有那么黑魔法，只不过是then默认参数就是把值往后传或者抛

##### 不同Promise的交互

关于不同Promise间的交互，其实标准里是有说明的，其中详细指定了如何通过then的实参返回的值来决定promise2的状态，我们只需要按照标准把标准的内容转成代码即可。

这里简单解释一下标准：

即我们要把onResolved/onRejected的返回值，x，当成一个可能是Promise的对象，也即标准里所说的thenable，并以最保险的方式调用x上的then方法，如果大家都按照标准实现，那么不同的Promise之间就可以交互了。而标准为了保险起见，即使x返回了一个带有then属性但并不遵循Promise标准的对象（比如说这个x把它then里的两个参数都调用了，同步或者异步调用（PS，原则上then的两个参数需要异步调用，下文会讲到），或者是出错后又调用了它们，或者then根本不是一个函数），也能尽可能正确处理。

关于为何需要不同的Promise实现能够相互交互，我想原因应该是显然的，Promise并不是JS一早就有的标准，不同第三方的实现之间是并不相互知晓的，如果你使用的某一个库中封装了一个Promise实现，想象一下如果它不能跟你自己使用的Promise实现交互的场景。。。

建议各位对照着标准阅读以下代码，因为标准对此说明的非常详细，所以你应该能够在任意一个Promise实现中找到类似的代码：

```js
/*
resolvePromise函数即为根据x的值来决定promise2的状态的函数
也即标准中的[Promise Resolution Procedure](https://promisesaplus.com/#point-47)
x为`promise2 = promise1.then(onResolved, onRejected)`里`onResolved/onRejected`的返回值
`resolve`和`reject`实际上是`promise2`的`executor`的两个实参，因为很难挂在其它的地方，所以一并传进来。
相信各位一定可以对照标准把标准转换成代码，这里就只标出代码在标准中对应的位置，只在必要的地方做一些解释
*/
function resolvePromise (promise2, x, resolve, reject) {

  let then 
  let thenCalledOrThrow = false

  if (promise2 === x) { // 对应标准2.3.1节
    // 这里可能有童鞋会问，什么时候会触发promise2 === x这个条件，首先我们对标准2.3.1节中的promise2===x在做下解释
    // 条件promise === x ，相当于promise.then之后return了自己，因为then会等待return后的promise，导致自己等待自己，一直处于等待。
    /** 
      比如:
        let p1 = new Promise(function(resolve, reject) {
          setTimeout(() => {reject(1.1)}, 1000)
        })
        let p1then = p1.then(function (value) {
          return p1then
        }, function (err) {
          return p1then
        })
        
        p1then.then(value => {
          console.log('value:', value)
        }, err => {
          console.log('err:', err)
        })
      这段代码就会触发promise2 === x的判断，我们为了promise不一直处于等待状态，根据标准规范，
      这里我们需要抛出'Chaining cycle detected for promise'，即‘循环引用’的错误信息
    */
    reject(new TypeError('Chaining cycle detected for promise!'))
    return
  }

  if (x instanceof Promise) { // 对应标准2.3.2节
    // 如果x的状态还没有确定，那么它是有可能被一个thenable决定最终状态和值的
    // 所以这里需要做一下处理，而不能一概的以为它会被一个“正常”的值resolve
    if (x.status === 'pending') {
      x.then(value => {
        resolvePromise(promise2, value, resolve, reject)
      }, err => {
        reject(err)
      })
    }  else { // 但如果这个Promise的状态已经确定了，那么它肯定有一个“正常”的值，而不是一个thenable，所以这里直接取它的状态
      x.then(resolve, reject)
    }
    return
  }

  if ((x !== null) && ((typeof x === 'function') || (typeof x === 'object'))) {
    try {
      // 2.3.3.1 因为x.then有可能是一个getter，这种情况下多次读取就有可能产生副作用
      // 即要判断它的类型，又要调用它，这就是两次读取
      then = x.then //because x.then could be a getter
      if (typeof then === 'function') { // 2.3.3.3
        then.call(x, value => { // 2.3.3.3.1
          if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
          thenCalledOrThrow = true
          resolvePromise(promise2, value, resolve, reject) // 2.3.3.3.1
          return
        }, err => { // 2.3.3.3.2
          if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
          thenCalledOrThrow = true
          reject(err)
          return
        })
      } else { // 2.3.3.4
        resolve(x)
      }
    } catch (e) { // 2.3.3.2
      if (thenCalledOrThrow) return // 2.3.3.3.3 即这三处谁选执行就以谁的结果为准
      thenCalledOrThrow = true
      reject(e)
      return
    }
  } else { // 2.3.4
    resolve(x)
  }

}
```

然后我们使用这个函数的调用替换then里几处判断x是否为Promise对象的位置即可，见下方完整代码。

最后，我们刚刚说到，原则上，promise.then(onResolved, onRejected)里的这两个函数需要异步调用，关于这一点，标准里也有说明：

> In practice, this requirement ensures that onFulfilled and onRejected execute asynchronously, after the event loop turn in which then is called, and with a fresh stack.

所以我们需要对我们的代码做一点变动，即在四个地方加上setTimeout(fn, 0)

> Tip: 我们这里增加setTimeout，涉及到js执行栈以及js单线程和eventLoop相关的知识，各位对js的执行栈、js单线程、eventLoop不太了解的，可以谷歌查阅下相关资料，后边我有空也会写一篇js执行栈、js的单线程、eventloop的讲解文章。下面的代码中，我也会简单写一些加入setTimeout的原因分析。

```js
function Promise (executor) {
  let self = this
  self.status = 'pending' //Promise当前状态
  self.data = undefined //当前Promise的值
  self.onResolvedCallback = [] //Promise resolve时的回调函数集合
  self.onRejectedCallback = [] //Promise reject时的回调函数集合

  function resolve (value) { // value成功态时接收的终值
    if (value instanceof Promise) {
      value.then(resolve, reject)
      return
    }

    // 为什么resolve 加setTimeout?
    // 2.2.4规范 onFulfilled 和 onRejected 只允许在 execution context 栈仅包含平台代码时运行.
    // 注1 这里的平台代码指的是引擎、环境以及 promise 的实施代码。实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。
    setTimeout(function(){
      // 调用resolve 回调对应onFulfilled函数
      if (self.status === 'pending') {
        // 只能由pending状态 => fulfilled状态 (避免调用多次resolve reject)
        self.status = 'fulfilled'
        self.data = value
        //执行resolve的回调函数，将value传递到callback中
        self.onResolvedCallback.forEach(callback => callback(value))
      }
    })
  }

  function reject (reason) { // reason失败态时接收的拒因
    setTimeout(function(){
      // 调用reject 回调对应onRejected函数
      if (self.status === 'pending') {
        // 只能由pending状态 => rejected状态 (避免调用多次resolve reject)
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

/**
 * [注册fulfilled状态/rejected状态对应的回调函数]
 * @param  {function} onFulfilled fulfilled状态时 执行的函数
 * @param  {function} onRejected  rejected状态时 执行的函数
 * @return {function} newPromsie  返回一个新的promise对象
 */
Promise.prototype.then = function (onResolve, onReject) {
  let self = this
  let promise2

  // 处理参数默认值 保证参数后续能够继续执行
  onResolve = typeof onResolve==='function' ? onResolve : function(value){return value}
  onReject = typeof onReject==='function' ? onReject : function(reason){throw reason}
  
  if (self.status === 'pending') { // 等待态
     return promise2 = new Promise(function(resolve, reject){
      
      // 当异步调用resolve/rejected时 将onFulfilled/onRejected收集暂存到集合中
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

  // then里面的FULFILLED/REJECTED状态时 为什么要加setTimeout ?
  // 原因:
  // 其一 2.2.4规范 要确保 onFulfilled 和 onRejected 方法异步执行(且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行) 所以要在resolve里加上setTimeout
  // 其二 2.2.6规范 对于一个promise，它的then方法可以调用多次.（当在其他程序中多次调用同一个promise的then时 由于之前状态已经为FULFILLED/REJECTED状态，则会走的下面逻辑),所以要确保为FULFILLED/REJECTED状态后 也要异步执行onFulfilled/onRejected

  // 其二 2.2.6规范 也是resolve函数里加setTimeout的原因
  // 总之都是 让then方法异步执行 也就是确保onFulfilled/onRejected异步执行

  // 如下面这种情景 多次调用p1.then
  // p1.then((value) => { // 此时p1.status 由pending状态 => fulfilled状态
  //     console.log(value); // resolve
  //     // console.log(p1.status); // fulfilled
  //     p1.then(value => { // 再次p1.then 这时已经为fulfilled状态 走的是fulfilled状态判断里的逻辑 所以我们也要确保判断里面onFuilled异步执行
  //         console.log(value); // 'resolve'
  //     });
  //     console.log('当前执行栈中同步代码');
  // })
  // console.log('全局执行栈中同步代码');
  //
  if (self.status === 'fulfilled') { // 成功态
    return promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        try {
          let x = onResolve(self.data)
          resolvePromise(promise2, x, resolve, reject) // 新的promise resolve 上一个onFulfilled的返回值
        } catch (e) {
          reject(e) // 捕获前面onFulfilled中抛出的异常 then(onFulfilled, onRejected);
        }
      },0)
    })
  }

  if (self.status === 'rejected') { // 失败态
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
```

#### 其他Promise的方法

##### Promise.prototype.catch,

功能是 在链式写法中可以捕获前面的异常

实现原理类似于then的第二个参数

比如这样：

```js
// 用于promise方法链时 捕获前面onFulfilled/onRejected抛出的异常
Promise.prototype.catch = function (onReject) {
  return this.then(null, onReject)
}
```

##### Promise.resolve

返回一个fulfilled状态的promise对象

```js
// 返回一个fulfilled状态的promise对象
Promise.resolve = function (value) {
  return new Promise(function(resolve, reject){resolve(value)})
}
```

##### Promise.reject

返回一个rejected状态的promise对象

```js
// 返回一个rejected状态的promise对象
Promise.reject = function (reason) {
  return new Promise(function(resolve, reject){reject(reason)})
}
```

##### Promise.all

接收一个promise对象数组为参数 只有全部 promise 进入 fulfilled 状态才会继续后面的处理 通常会用来处理 多个并行异步操作

```js
/**
 * Promise.all Promise进行并行处理
 * 参数: promise对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 当这个数组里的所有promise对象全部进入FulFilled状态的时候，才会resolve。
 */
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
```

##### Promise.race

接收一个promise对象数组为参数 Promise.race 只要有一个promise对象进入 fulfilled 或者 rejected 状态的话，就会继续进行后面的处理

```js
/**
 * Promise.race
 * 参数: 接收 promise对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，就会继续进行后面的处理(取决于哪一个更快)
 */
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
         promise.then(resolve, reject);
      });
  });
}
```

##### 至此，我们就实现了一个的Promise，完整代码如下：

```js
function Promise (executor) {
  let self = this
  self.status = 'pending' //Promise当前状态
  self.data = undefined //当前Promise的值
  self.onResolvedCallback = [] //Promise resolve时的回调函数集合
  self.onRejectedCallback = [] //Promise reject时的回调函数集合

  function resolve (value) { // value成功态时接收的终值
    if (value instanceof Promise) {
      value.then(resolve, reject)
      return
    }

    // 为什么resolve 加setTimeout?
    // 2.2.4规范 onFulfilled 和 onRejected 只允许在 execution context 栈仅包含平台代码时运行.
    // 注1 这里的平台代码指的是引擎、环境以及 promise 的实施代码。实践中要确保 onFulfilled 和 onRejected 方法异步执行，且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行。
    setTimeout(function(){
      // 调用resolve 回调对应onFulfilled函数
      if (self.status === 'pending') {
        // 只能由pending状态 => fulfilled状态 (避免调用多次resolve reject)
        self.status = 'fulfilled'
        self.data = value
        //执行resolve的回调函数，将value传递到callback中
        self.onResolvedCallback.forEach(callback => callback(value))
      }
    })
  }

  function reject (reason) { // reason失败态时接收的拒因
    setTimeout(function(){
      // 调用reject 回调对应onRejected函数
      if (self.status === 'pending') {
        // 只能由pending状态 => rejected状态 (避免调用多次resolve reject)
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

/**
 * resolve中的值几种情况：
 * 1.普通值
 * 2.promise对象
 * 3.thenable对象/函数
 */

/**
 * 对resolve 进行改造增强 针对resolve中不同值情况 进行处理
 * @param  {promise} promise2 promise1.then方法返回的新的promise对象
 * @param  {[type]} x         promise1中onFulfilled的返回值
 * @param  {[type]} resolve   promise2的resolve方法
 * @param  {[type]} reject    promise2的reject方法
 */
function resolvePromise (promise2, x, resolve, reject) {

  let then 
  let thenCalledOrThrow = false // 避免多次调用

  if (promise2 === x) { // 如果从onFulfilled中返回的x 就是promise2 就会导致循环引用报错
    reject(new TypeError('Chaining cycle detected for promise!'))
    return
  }

  // 如果x是一个我们自己写的promise对象 
  if (x instanceof Promise) {
    if (x.status === 'pending') { // 如果为等待态需等待直至 x 被执行或拒绝 并解析value值
      x.then(value => {
        resolvePromise(promise2, value, resolve, reject)
      }, err => {
        reject(err)
      })
    }  else { // 如果 x 已经处于执行态/拒绝态(值已经被解析为普通值)，用相同的值执行传递下去 promise
      x.then(resolve, reject)
    }
    return
  }

  // 如果 x 为对象或者函数
  if ((x !== null) && ((typeof x === 'function') || (typeof x === 'object'))) {
    try {
      then = x.then //because x.then could be a getter
      if (typeof then === 'function') { // 是否是thenable对象（具有then方法的对象/函数）
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
      } else { // 说明是一个普通对象/函数
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

/**
 * [注册fulfilled状态/rejected状态对应的回调函数]
 * @param  {function} onFulfilled fulfilled状态时 执行的函数
 * @param  {function} onRejected  rejected状态时 执行的函数
 * @return {function} newPromsie  返回一个新的promise对象
 */
Promise.prototype.then = function (onResolve, onReject) {
  let self = this
  let promise2

  // 处理参数默认值 保证参数后续能够继续执行
  onResolve = typeof onResolve==='function' ? onResolve : function(value){return value}
  onReject = typeof onReject==='function' ? onReject : function(reason){throw reason}
  
  if (self.status === 'pending') { // 等待态
     return promise2 = new Promise(function(resolve, reject){
      
      // 当异步调用resolve/rejected时 将onFulfilled/onRejected收集暂存到集合中
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

  // then里面的FULFILLED/REJECTED状态时 为什么要加setTimeout ?
  // 原因:
  // 其一 2.2.4规范 要确保 onFulfilled 和 onRejected 方法异步执行(且应该在 then 方法被调用的那一轮事件循环之后的新执行栈中执行) 所以要在resolve里加上setTimeout
  // 其二 2.2.6规范 对于一个promise，它的then方法可以调用多次.（当在其他程序中多次调用同一个promise的then时 由于之前状态已经为FULFILLED/REJECTED状态，则会走的下面逻辑),所以要确保为FULFILLED/REJECTED状态后 也要异步执行onFulfilled/onRejected

  // 其二 2.2.6规范 也是resolve函数里加setTimeout的原因
  // 总之都是 让then方法异步执行 也就是确保onFulfilled/onRejected异步执行

  // 如下面这种情景 多次调用p1.then
  // p1.then((value) => { // 此时p1.status 由pending状态 => fulfilled状态
  //     console.log(value); // resolve
  //     // console.log(p1.status); // fulfilled
  //     p1.then(value => { // 再次p1.then 这时已经为fulfilled状态 走的是fulfilled状态判断里的逻辑 所以我们也要确保判断里面onFuilled异步执行
  //         console.log(value); // 'resolve'
  //     });
  //     console.log('当前执行栈中同步代码');
  // })
  // console.log('全局执行栈中同步代码');
  //
  if (self.status === 'fulfilled') { // 成功态
    return promise2 = new Promise(function(resolve, reject){
      setTimeout(function(){
        try {
          let x = onResolve(self.data)
          resolvePromise(promise2, x, resolve, reject) // 新的promise resolve 上一个onFulfilled的返回值
        } catch (e) {
          reject(e) // 捕获前面onFulfilled中抛出的异常 then(onFulfilled, onRejected);
        }
      },0)
    })
  }

  if (self.status === 'rejected') { // 失败态
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

/**
 * Promise.all Promise进行并行处理
 * 参数: promise对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 当这个数组里的所有promise对象全部进入FulFilled状态的时候，才会resolve。
 */
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

/**
 * Promise.race
 * 参数: 接收 promise对象组成的数组作为参数
 * 返回值: 返回一个Promise实例
 * 只要有一个promise对象进入 FulFilled 或者 Rejected 状态的话，就会继续进行后面的处理(取决于哪一个更快)
 */
Promise.race = function (promises) {
  return new Promise((resolve, reject) => {
      promises.forEach((promise) => {
         promise.then(resolve, reject);
      });
  });
}

// 用于promise方法链时 捕获前面onFulfilled/onRejected抛出的异常
Promise.prototype.catch = function (onReject) {
  return this.then(null, onReject)
}

// 返回一个fulfilled状态的promise对象
Promise.resolve = function (value) {
  return new Promise(function(resolve, reject){resolve(value)})
}

// 返回一个rejected状态的promise对象
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

// Promise核心内容完整测试方法
let promisesAplusTests =  require("promises-aplus-tests")
promisesAplusTests(Promise, function(err){
  console.log('err:', err);
  //全部完成;输出在控制台中。或者检查`err`表示失败次数。 
})
```

> Tip: [完整代码+测试demo文件地址](https://github.com/legend-li/MyBlog/blob/master/src/Promise/Promise.js)

#### 测试

如何确定我们实现的Promise符合标准呢？Promise有一个配套的[测试脚本](https://github.com/promises-aplus/promises-tests)，只需要我们在一个CommonJS的模块中暴露一个deferred方法（即exports.deferred方法），就可以了，代码见上述代码的最后。然后执行如下代码即可执行测试：

```js
npm i promises-aplus-tests
node ./Promise.js
```

#### 相关知识参考资料

[Promises/A+规范-英文](https://promisesaplus.com/)

[Promises/A+规范-翻译-推荐](https://malcolmyu.github.io/2015/06/12/Promises-A-Plus/)

[剖析Promise内部结构](https://github.com/xieranmaya/blog/issues/3)
