# 编写js代码时，不写分号需要注意的地方

##### 1. 以括号开头的语句
##### 2. 以数组开头的语句（即：以方括号开头的语句）
##### 3. 以正则表达式的斜杠开头的语句
##### 4. 以 Template 开头的语句（即：反引号开头的语句，比如`nihao`）
##### 5. 加号开头的语句
##### 6. 减号开头的语句

以上6中情况需在前面加上分号（;）

例如括号开头：
``` js
;(function (a) { 
  console.log(a)
})()
```

方括号开头：
``` js
;[3, 2, 1, 0].forEach(e => console.log(e))
```

正则表达式的斜杠开头：
``` js
;/(a)/g.test("abc")
```

反引号开头：
``` js
let txt = 'world'
let fn = () => console.log(txt)
let f = fn
;`hello ${txt}`.match(/(a)/)
```
