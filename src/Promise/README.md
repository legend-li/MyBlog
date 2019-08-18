# 从零一步一步实现一个完整版的Promise

> Promise A+ 规范 
[中文翻译版地址](https://malcolmyu.github.io/2015/06/12/Promises-A-Plus/) 
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

1. 标准中只有一个then方法，没有catch，race，all等方法，甚至没有构造函数<br/>
  Promise标准中仅指定了Promise对象的then方法的行为，其它一切我们常见的方法/函数都并没有指定，包括catch，race，all等常用方法，甚至也没有指定该如何构造出一个Promise对象，另外then也没有一般实现中（Q, $q等）所支持的第三个参数，一般称onProgress
  <br/>
2. then方法返回一个新的Promise
  Promise的then方法返回一个新的Promise，而不是返回this，此处在下文会有更多解释
  <br/>
    ```js
    promise2 = promise1.then(alert)
    promise2 != promise1 // true
    ```
3. 不同Promise的实现需要可以相互调用(interoperable)
  <br/>
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
  只有全部 promise 进入 fulfilled 状态才会继续后面的处理 通常会用来处理 多个并行异步操作
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