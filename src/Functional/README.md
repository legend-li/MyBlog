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

##### froEach函数
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

##### forEachObj函数
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

##### unless函数
下面以抽象的方式实现对流程控制的处理。

创建一个```unless```函数，函数接受两个参数，第一个参数为条件，第二个参数为处理逻辑。如果第一个参数的值为```false```，则执行第二个参数（第二个参数为回调处理函数）。```unless```函数实现如下：
``` js
const unless = (predicate, fn) => {
  !predicate ? fn() : undefined
}

forEach(val => {
  unless(val%2, () => console.log(val))
}, [1,2,3,4,5,6])
// >> 2
// >> 4
// >> 6
```
上面这段代码会从数组中取出偶数，然后打印出偶数的值。```unless```实现了流程控制的抽象，只有第一个参数为```false```时，才执行回调处理逻辑。

##### times函数
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

##### every函数
在开发中，经常会遇到需要判断一个数组的每一项是否都满足某些特定条件，如果满足则执行一些逻辑处理。下面用高阶函数抽象一个```every```函数来解决这个问题。
``` js
const every = (fn, arr) => {
  let i = 0, res = true
  for (const val of arr) {
    res = res && !!fn(val, i++, arr)
    if (!res) break
  }
  return res
}

let arr = [0,1,2,3,4,5,6]
every(val => {
    return val < 3 ? true : false
}, arr) // >> false
```

##### some函数
相反，有时候，需要判断数组中是否包含某个值。把这种应用场景抽象为```some```函数，如下：
``` js
const some = (fn, arr) => {
  let i = 0, res = false
  for (const val of arr) {
    res = res || !!fn(val, i++, arr)
    if (res) break
  }
  return res
}

let arr = [0,1,2,3,4,5,6]
some((val, i) => {
    return val > 3 ? true : false
}, arr) // >> true
```

##### sort函数
javascript 的数组数据在原型上提供了```sort```函数，用来对数组进行排序。

语法为：arr.sort([compareFunction])

参数```compareFunction```可选，用来指定按某种顺序进行排列的函数。如果省略，元素按照转换为的字符串的各个字符的Unicode位点进行排序。

```compareFunction```接收两个参数：```firstEl```第一个用于比较的元素，```secondEl```第二个用于比较的元素。

```sort```返回值：排序后的数组。请注意，数组已原地排序，并且不进行复制。
用法示例：
``` js
const months = ['March', 'Jan', 'Feb', 'Dec'];
months.sort();
console.log(months);
// expected output: Array ["Dec", "Feb", "Jan", "March"]
```
假设，我们要对一个对象数组排序，比如：
``` js
let items = [
  { name: 'Edward', value: 21 },
  { name: 'Sharpe', value: 37 },
  { name: 'And', value: 45 },
  { name: 'The', value: -12 },
  { name: 'Magnetic' },
  { name: 'Zeros', value: 37 }
]

// sort by value
items.sort(function (a, b) {
  return (a.value - b.value)
})

// sort by name
items.sort(function(a, b) {
  var nameA = a.name.toUpperCase(); // ignore upper and lowercase
  var nameB = b.name.toUpperCase(); // ignore upper and lowercase
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  // names must be equal
  return 0;
})
```
可以看到，在对```items```这个对象数组进行排序的时候，我们基于```value```和```name```进行的排序逻辑，都需要写单独的排序比较函数```compareFunction```，这样明显是一种重复的工作，完全可以用高阶函数来把这个比较函数抽象成通用的```sortBy```函数。
比如：
``` js
const sortBy = (property, fn) => {
  return (a, b) => {
    if (typeof fn === 'function') {
      return fn(a[property]) < fn(b[property]) ? -1 : fn(a[property]) > fn(b[property]) ? 1 : 0
    } else {
      return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
    }
  }
}

let items = [
  { name: 'Edward', value: 21 },
  { name: 'Sharpe', value: 37 },
  { name: 'And', value: 45 },
  { name: 'The', value: -12 },
  { name: 'Magnetic' },
  { name: 'Zeros', value: 37 }
]

// sort by value
items.sort(sortBy('value'))

// sort by name
items.sort(sortBy('name'), name => name.toUpperCase())
```
这样把比较函数抽象为一个```sortBy```函数后，是不是使用更加简便，代码量更少，更利于阅读和后期代码维护？

### 闭包与闭包的用处
什么是闭包？
通常来说，闭包是指有权访问另一个函数作用域中的变量的函数。举个例子：
``` js
const outer = (props) => {
  const inner = () => {
    console.log(props)
  }
  return inner
}

const fn = outer('outer function')
fn() // >> 'outer function'
```
这段代码，在```outer```函数内部创建了一个```inner```函数，然后把```inner```函数返回出去了，```inner```拥有了```outer```函数的作用域的访问权限，即使```inner```在```outer```函数外部被执行，也拥有```outer```函数作用域的访问权限，比如```fn```函数执行时，会输出```'outer function'```，就说明```inner```函数对```outer```函数的参数```props```的引用依然存在，这就是闭包的一种代码表现。

简言之，闭包就是拥有另一个函数作用域中变量的访问权限的函数。比如```inner```函数。

另外，闭包有3个可访问的作用域：
1. 在自身声明之内声明的变量
2. 对全局变量的访问
3. 对包含它的外部函数的变量的访问

举例如下：
``` js
const global = 'global'
const outer = (props) => {
  const inner = (val) => {
    console.log(`props: ${props}, val: ${val}, global: ${global}`)
  }
  return inner
}

const fn = outer('name')
fn('混沌传奇') // >> 'props: name, val: 混沌传奇, global: global'
```
```fn('混沌传奇')```在执行时，```inner```函数访问了```val```的值、```props```的值和```global```的值，```val```属于```inner```自身的形参变量，```props```属于```outer```的形参变量，```global```属于全局变量。

也可以理解为闭包```inner```记住了它的上下文。

你可能会问闭包有什么用？

其实前面已经使用过闭包了。比如```sortBy```函数。
``` js
const sortBy = (property, fn) => {
  return (a, b) => {
    if (typeof fn === 'function') {
      return fn(a[property]) < fn(b[property]) ? -1 : fn(a[property]) > fn(b[property]) ? 1 : 0
    } else {
      return a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0
    }
  }
}
```
```sortBy```函数接受两个参数，并返回一个匿名函数，匿名函数接收两个参数：a和b，返回的这个匿名函数持有了```sortBy```函数的两个形参```property```、```fn```的引用，这个匿名函数其实就形成了闭包。

下面用闭包和高阶函数来封装一些常用函数。

##### once函数
在一些时候，我们可能想要我们的函数只执行一次之后，就不再执行了。比如，在浏览器页面中，我只想设置一次第三方库，或者初始化一些全局配置等。
我们来编写一个```once```函数来解决这个问题。
``` js
const once = (fn) => {
  let done = false
  return (...args) => {
    return done ? undefined : (done = true, fn.apply(this, args))
  }
}

const printNameVal = once((name, like) => console.log(`name:${name}, like:${like}`))

printNameVal('混沌传奇', 'Coding')
printNameVal('小宝贝', 'Reading')

// >> name:混沌传奇, like:Coding
```
通过执行```once```返回了一个函数存储在变量```printNameVal```中，执行了两次```printNameVal```， 最终打印了```name:混沌传奇, like:Coding```，```name:小宝贝, like:Reading```并没有被打印出来，说明传递给```once```的匿名函数```(name, like) => console.log(`name:${name}, like:${like}`)```只被执行了一次。基本实现了对```once```函数的诉求。

##### memoized函数
这一章节的最后，我要再给大家介绍一个函数```memoized```，从函数名字可以看出这个函数跟缓存有关系。下面我来介绍下这个函数解决的是什么问题，是用来干嘛的。

在编程开发中，我们有时候需要处理一些复杂耗时的逻辑计算逻辑，比如计算一个数组所有元素相加的结果。我们可能会这么写：
``` js
const square = val => val*val

let arr = [1,2,31,2,1,2,32,1,6,6,6,3,2,1]
let total = 0
forEach(val => {
  total = total + square(val)
}, arr)
console.log(`total: ${total}`)
```
这么写其实也没问题，但是相当于数组每一次遍历都会调用```square```，执行```val*val```，我们完全可以利于闭包的和高阶函数来把优化下。比如，我么可以把```square```函数输入的参数和输出的值缓存起来。下次调用```square```函数时，如果缓存中已经存储了相同的输入参数，则从缓存中取出输入参数对应的结果直接返回出去，这样省去了```val*val```计算的时间。

代码实现如下：
``` js
const memoized = (fn) => {
  let cache = []
  return (arg) => {
    if (!(arg in cache)) {
      cache[arg] = fn.apply(this, [arg])
    }
    return cache[arg]
  }
}

const square = memoized(val => val*val)

let arr = [1,2,31,2,1,2,32,1,6,6,6,3,2,1]
let total = 0
forEach(val => {
  total = total + square(val)
}, arr)
console.log(`total: ${total}`)
```

最后，这个```memoized```函数只是考虑了单参数输入的情况，实际开发中，可能不会这么单一的只考虑单参数情况，多参数该怎么处理呢？哈哈，这个答案希望读到这里的朋友可以自己思考下，可以参考下```underscore```的```memoized```函数实现。

### 数组的函数式编程
> 本章节所讲解的所有函数都是投影函数。把函数作用于一个值并创建一个新值的过程成为投影。

##### map函数
在业务开发中，有时，我们需要对数组的每一个元素做一些处理，然后返回一个新元素，最终会返回一个每个元素都处理后的新数组。
``` js
const map = (fn, arr) => {
  let newArr = []
  for (const val of arr) {
    newArr.push(fn(val))
  }
  return newArr
}

let arr = [1, 2, 3, 4, 5, 6]

let newArr = map(val => val+1, arr)
console.log('newArr:', newArr) // >> [2, 3, 4, 5, 6, 7]
```

##### filter函数
假如我想从一个数组中筛选出我想要的数组，该怎么办？```filter```函数就是解决这种问题的。
``` js
const filter = (fn, arr) => {
  let newArr = []
  for (const val of arr) {
    if (fn(val)) {
      newArr.push(val)
    }
  }
  return newArr
}

let arr = [1, 2, 3, 4, 5, 6]

let newArr = filter(val => val>5, arr)
console.log('newArr:', newArr) // >> [6]
```

##### 链接操作
为了达到某个目的，有时需要链接多个函数才能搞定，比如，有一个数组```bookStore```，数据如下：
``` js
let bookStore = [
  { id: '1232adad123dda12ga', name: '红楼梦', rating: 7.2 },
  { id: '1232adad12663822gb', name: '精通html', rating: 3.2 },
  { id: '1232adad12263582ga', name: '移动端布局', rating: 2 },
  { id: '1232adad1fvahag2ga', name: '东游记', rating: 5 },
  { id: '1232ad78896kll12ga', name: '西游记', rating: 7.9 },
  { id: '1232adad12lmcx12ga', name: 'js函数式编程', rating: 8 },
  { id: '1232adad120kouy7ga', name: '数据结构与算法', rating: 7.3 },
  { id: '1232adad123vmzliea', name: 'css权威指南', rating: 6 },
]
```
我想取出评分大于```7```的书籍，并且只返回书籍的```id```，通过前面编写的```filter```函数来过滤出评分大于```7```的书籍，然后再通过```map```函数来返回书籍```id```组成的新数组，这里用链接方式来编写实现代码，如下：
``` js
let bookIds = map(book => book.id, filter(book => book.rating > 7, bookStore))
console.log('bookIds:', bookIds)
```
这段代码是把```filter(book => book.rating > 7, bookStore)```的结果作为```map```函数的数据源，然后```map```再遍历过滤后的这个数据源，返回```book.id```组成的新数组，这样就达到了“取出评分大于```7```的书籍，并且只返回书籍的```id```”的目的。这种连接方式，代码量会少很多。不过，大家有没有发现代码好像看起来不是那么直观，比较丑。放心，这个我们后面会继续优化的。

> 后面会用组合来优化这种连接方式，让代码更易读。

##### 数组扁平化（concatAll函数）
假如我把上面的```bookStore```数据改成这样：
``` js
let bookStore = [
  [
    { id: '1232adad123dda12ga', name: '红楼梦', rating: 7.2, type: '小说类' },
    { id: '1232adad1fvahag2ga', name: '东游记', rating: 5, type: '小说类' },
    { id: '1232ad78896kll12ga', name: '西游记', rating: 7.9, type: '小说类' },
  ],
  [
    { id: '1232adad12663822gb', name: '精通html', rating: 3.2, type: '前端技术类' },
    { id: '1232adad12263582ga', name: '移动端布局', rating: 2, type: '前端技术类' },
    { id: '1232adad12lmcx12ga', name: 'js函数式编程', rating: 8, type: '前端技术类' },
    { id: '1232adad120kouy7ga', name: '数据结构与算法', rating: 7.3, type: '前端技术类' },
    { id: '1232adad123vmzliea', name: 'css权威指南', rating: 6, type: '前端技术类' },
  ]
]
```
然后，我再要求“取出评分大于```7```的书籍，并且只返回书籍的```id```”，是不是就不能像上面那样直接来通过```filter```和```map```函数来处理了。

因为```bookStore```变成了二维数组，那么怎么办呢？

这就用到了另一个常用函数，```concatAll```，也就是数组扁平化函数，俗称：数组拍平，通常指把多纬度数组变为一维度数组。毕竟一维数组更加方便处理。

下面实现下```concatAll```：
``` js
const concatAll = (arr) => {
  let newArr = []
  for (val of arr) {
    newArr.push.apply(newArr, val)
  }
  return newArr
}
```
现在我们先用```concatAll```函数把数组拍平后，再取出评分大于```7```的书籍，并且只返回书籍的```id```，就简单了，代码逻辑如下：
``` js
let bookIds = map(book => book.id, filter(book => book.rating > 7, concatAll(bookStore)))
console.log('bookIds:', bookIds)
```

如果需要拍平一个三维甚至四维数组，我们可以这么修改下```concatAll```函数：
``` js
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
```

> 提示：这里用到了递归函数的思想，如果对递归函数不了解的，可以看我这篇文章：[逐步学习什么是递归？通过使用场景来深入认识递归。](https://juejin.im/post/5a94d6476fb9a06348538871)

##### reduce函数
```reduce```函数对数组中的每个元素执行一个由您提供的```reducer```函数(升序执行)，将其结果汇总为单个返回值。

有什么用处呢？

比如我像计算数组的所有项相加的总数是多少，这时就可以用```reduce```函数来处理。

```reduce```函数实现如下：
``` js
const reduce = (fn, arr, init) => {
  let total, i = 0
  for (val of arr) {
    if (i === 0) {
      total = init === undefined ? arr[0] : init
    } else {
      total = fn(total, val)
    }
    i++
  }
  return total
}
```
如果我想计算出```bookStore```下面的所有前端技术类书籍的评分之和。可以这样：
``` js
let bookStore = [
  [
    { id: '1232adad123dda12ga', name: '红楼梦', rating: 7.2, type: '小说类' },
    { id: '1232adad1fvahag2ga', name: '东游记', rating: 5, type: '小说类' },
    { id: '1232ad78896kll12ga', name: '西游记', rating: 7.9, type: '小说类' },
  ],
  [
    { id: '1232adad12663822gb', name: '精通html', rating: 3.2, type: '前端技术类' },
    { id: '1232adad12263582ga', name: '移动端布局', rating: 2, type: '前端技术类' },
    { id: '1232adad12lmcx12ga', name: 'js函数式编程', rating: 8, type: '前端技术类' },
    { id: '1232adad120kouy7ga', name: '数据结构与算法', rating: 7.3, type: '前端技术类' },
    { id: '1232adad123vmzliea', name: 'css权威指南', rating: 6, type: '前端技术类' },
  ]
]

let totalRating = reduce((total, book) => total + book.rating, filter(book => book.type === '前端技术类', concatAll(bookStore)), 0)
console.log('totalRating:', totalRating)
```

##### 数组合并（zip函数）

### 函数柯里化与偏函数
写作中。。。

### 函数组合
写作中。。。

### 函子
写作中。。。