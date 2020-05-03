# js函数式编程——入门篇

### 函数式编程的好处

#### 纯函数
> 大多数函数式编程的好处来自于纯函数。

在程序设计中，若一个函数符合以下要求，则它可能被认为是纯函数：

- 此函数在相同的输入值时，需产生相同的输出。函数的输出和输入值以外的其他隐藏信息或状态无关，也和由I/O设备产生的外部输出无关。

- 该函数不能有语义上可观察的函数副作用，诸如“触发事件”，使输出设备输出，或更改输出值以外物件的内容等。

举个例子：
``` js
const add1 = (x) => x+1
```
函数```add1```就是一个纯函数，因为它的输入和他的输出永远是相对应的，比如：
``` js
add1(1) === 2 // add1(1) 永远恒等于2
```
##### 纯函数利于代码测试
我们来用不纯的函数举个例子：
``` js
let a = 1
const sum = (b) => a+b //依赖外部变量a
```
函数```sum```不是纯函数，因为```sum```函数内部依赖```a```变量。尽管函数可以正常运行，但是很难进行测试！原因如下，假设我们对```sum```函数运行测试：
``` js
sum(2) === 3 // >> true
```
这样是没问题的，假如我们还有一个其他的逻辑修改了```a```变量呢？
``` js
// 其他的逻辑可能修改了外部变量list
let tab = 1
if (tab = 1) {
  a = 0
}
```
这时候就再运行```sum(2) === 3```就不对了。
所以说此时的```sum```函数很难测试。如果我们用纯函数思维来改造下```sum```函数：
``` js
const sum = (a, b) => a+b // sum为纯函数，不依赖任何外部变量，只依赖函数自己的输入
```
这时，```sum(1, 2) === 3```永远为```true```，现在可以顺畅的测试```sum```函数了。

##### 并发代码
纯函数可以让我们并发的去执行代码，提高代码执行速度。比如：
``` js
const sum = (...args) => {
  let total = 0
  for (arg of args)
    total = total + arg
  return total
}

const multiply = (...args) => {
  let total = 1
  for (arg of args)
    total = total * arg
  return total
}

console.log(sum(1,2))
console.log(multiply(1,2,3))
```
由于```sum```和```multiply```都是纯函数，都只依赖函数的输入，不依赖任何的外部变量，所以可以把函数```sum```和函数```multiply```分别放在不同的线程中执行，这样多线程运行代码，对于在处理复杂耗时的逻辑计算时，是一种很好的提高代码执行时长的方法。

##### 可缓存
既然纯函数总是为给定的输入返回相同的输出，那么我们就可以缓存函数的输出，这样在复杂的处理函数中，就可以节省函数执行时间，不用为相同的输入，频繁的重新计算输入对应的逻辑，可以直接从缓存中取出输入对应的输出返回出去。
举个例子：
``` js
const createMemoSquare = () => {
  let cache = {}
  return (num) => num in cache ? cache[num] : num*num
}
const memoSquare = createMemoSquare()

memoSquare(1) === 1 // >> true
memoSquare(2) === 4 // >> true
memoSquare(3) === 9 // >> true
```
```createMemoSquare```函数创建了一个```memoSquare```函数，```memoSquare```每次执行时，先判断```cache```中是否已经存储了当前输入的```num```的值，如果存储了，则直接从```cache```中读取参数```num```对应的值并返回出去。
> 提示：这里用到了闭包的思想，后面会深入讲解闭包

#### 柯里化和组合
柯里化可以帮助我们把一个多参数函数编程多个单参数函数，以便于我们基于柯里化后来抽离通用功能函数。节省代码量，同时代码更加优雅、易读、易于维护；

在函数式编程中，我们可以使用组合方法来把多个单一功能的函数组合成功能更强大的函数；

本小节只是简单的介绍柯里化和组合，后面章节会详细讲解柯里化的用法和具体好处，以及如何用组合编写更加优雅、利于维护的代码。

函数式编程还有更多的好处，只要深入研究学习就能发现。。。

### 高阶函数
高阶函数是至少满足下列一个条件的函数：

- 接受一个或多个函数作为输入
- 输出一个函数

javascript允许我们像存储```number```类型数据一样来存储函数，比如：
``` js
const fn = () => {} // 存储了一个匿名函数的引用到fn变量中 
```

既然函数可以像其他类型数据一样存储在变量中，那么也就可以把函数作为参数传递给另一个函数了，当然也可以把函数作为变量从一个函数中返回出来，比如：
``` js
// 判断接受的参数是否为number类型
const isNumber = (val) => typeof val === 'number'

// 处理数据，如果val是number类型数据则返回val值，如果不是，则返回undefined
const dealVal = (fn, val) => {
  let res = undefined
  if (typeof fn === 'function') {
    const valType = fn(val)
    res = valType ? val : undefined 
  }
  return res
}

dealVal(isNumber, 1) // >> 1

// number类型数据处理函数
const numberTransfrom = (val) => val+1

// string类型数据处理函数
stringTransfrom = (val) => `HOC-${val}`

// 根据数据类型获取对应的数据处理函数
const getDataTransfrom = (data, numberTransfrom, stringTransfrom) => {
  const type = typeof data
  switch (type) {
    case 'number': 
      return numberTransfrom
    case 'string':
      return stringTransfrom
  }
}

getDataTransfrom(1, numberTransfrom, stringTransfrom) // >> numberTransfrom
getDataTransfrom('fun', numberTransfrom, stringTransfrom) // >> numberTransfrom
```

现在知道了什么是高阶函数，并且知道怎么创建和使用高阶函数。那么高阶函数可以用来做什么呢？可以解决什么问题呢？

通常高阶函数用于抽象通用的代码逻辑，抽象出通用的问题。换句话说，高阶函数就是定义抽象。

维基百科中对抽象的定义：
在计算机科学中，抽象化（英语：Abstraction）是将数据与程序，以它的语义来呈现出它的外观，但是隐藏起它的实现细节。抽象化是用来减少程序的复杂度，使得程序员可以专注在处理少数重要的部分。

说白了，就是把实现细节隐藏起来，只报漏抽象出来的使用API。让程序员可以专注在处理少数重要的部分。不用关注底层实现逻辑。提高开发效率，降低开发难度。

#### 简单的抽象
在业务开发中，经常会用到```forEach```函数来遍历数组，并且在遍历时，针对每个遍历到的值做处理。下面我们用高阶函数来抽象出一个```forEach```函数:
``` js
const forEach = (fn, arr) => {
  let i = 0
  for (const val of arr) {
    fn(val, i++, arr)
  }
}

let arr = [1,2,3,4,5,6,7,8,9,0]

forEach((val, i, arr) => {
  console.log(`HOC: ${val}-${i}-${arr.join('、')}`)
}, arr)
```
```forEach```函数我们抽象出了遍历数组的问题，让使用```forEach```函数的用户不用关注怎么去实现遍历。

> 对 for...of 不熟悉的，可以看看MDN上的用法文档：[https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Statements/for...of)

既然实现了一个遍历数组的函数，那么对象的遍历不妨也用高阶函数来抽象一个出来：
``` js
const forEachObj = (fn, obj) => {
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn(obj[key])
    }
  }
}

let obj = {
  name: '混沌传奇',
  like: 'coding',
}

forEachObj((val) => {
  console.log(val)
}, obj)
```
```forEach```和```forEachObj```都是高阶函数，都专注于任务处理（通过传递函数到```forEach```内），抽象出来的是遍历的部分。

下面以抽象的方式实现对流程控制的处理。

创建一个```unless```函数，函数接受两个参数，第一个参数为条件，第二个参数为处理逻辑。如果第一个参数的值为```false```，则执行第二个参数（第二个参数为回调处理函数）。```unless```函数实现如下：
``` js
const unless = (predicate, fn) => {
  !predicate ? fn() : undefined
}

forEach(val => {
  unless(val%2, () => console.log(val))
}, [1,2,3,4,5,6])
// > 2
// > 4
// > 6
```
上面这段代码会从数组中取出偶数，然后打印出偶数的值。```unless```实现了流程控制的抽象，只有第一个参数为```false```时，才执行回调处理逻辑。

再看下```forEach```这段代码，如果我们要循环0-1000的数字呢，用```forEach```就不太合适了，构造一个0-1000的数字组成的数组，太大，而且也比较占内存。下面我们实现一个```times```函数来解决这个问题：
``` js
const times = (fn, times) => {
  for (let i = 1; i <= times; i++) {
    fn(i)
  }
}

times((val) => {
  unless(val%100, () => console.log(val))
}, 1000)
```

#### 稍微复杂点的抽象
在开发中，经常会遇到需要判断一个数组的每一项是否都满足某些特定条件，如果满足则执行一些逻辑处理。

// 写作中。。。

### 闭包与闭包的用处
写作中。。。

### 数组的函数式编程
写作中。。。

### 函数柯里化与偏函数
写作中。。。

### 函数组合
写作中。。。

### 函子
写作中。。。