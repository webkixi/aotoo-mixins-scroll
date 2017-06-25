# FKP-SAX
SAX mean "store and action X"

```
// install
npm install fkp-sax --save
```
It contains three parts, as fellow
| namespace       | data         | actions  |
| :-------------: | :-----------:| :--------:|
| uniqueId {String}  |{Json} | {Function} |


## Instance/实例化
```
import SAX from 'fkp-sax'
const saxer = SAX('uniqueName')
```

## API
#### Instance section
| API           | 描述           | 例子  |
| :-------------: |-------------| -----|
| bind         | 绑定CONTEXT     |  saxer.bind(context) |
| has          | 是否包含某指定namespace     |  saxer.has(id) |
> bind: 设置所有actions的方法执行的上下文

#### Data section

| API           | 描述           | 例子  |
| :-------------: |-------------| -----|
| data         | 数据     |  saxer.data |
| set          | 设置数据     |  saxer.set({Json}) |
| append       | 追加数据  |  saxer.append({}) |

#### Actions section

| API           | 描述           | 例子  |
| :-------------: |-------------| -----|
| on               | mount     |  saxer.on(key, callback) |
| off              | unmout     |  saxer.off(key) |
| emmit            | run  |  saxer.emmit(key, {Json}) |
| trigger       | multi-run  |  saxer.trigger() |
| setActions       | multi-mount  |  saxer.setActions({Json}) |

> 
- key: {String}
- callback: {Function}  


## 作为内存数据库
as a simple data library in memery      
SAX可以作为简易的内存数据库，来存储页面中的变量  
```
import SAX from 'fkp-sax'
const saxer = SAX('uniqueName')
saxer.append({
  aaa: 'i am',
  bbb: 'the king'
})
console.log(saxer.data.aaa)   // i am
console.log(saxer.data.bbb)   // the king

delete saxer.data.aaa
console.log(saxer.data.aaa)   // undefined
console.log(saxer.data.bbb)   // 'the king'
```

## Hooks  
as a trigger to performance some predefine method, with ajax or delay data, it's Very useful   
SAX可以作为触发器，触发预定义的方法，配合ajax或者延时数据使用  

```
saxer.append({
  hello: '你好'
})
saxer.on('fight', function(){console.log('===== 111')})
saxer.on('fight', function(){console.log('===== 222')})

saxer.on('gogogo', function(data){console.log(data.hello)})

saxer.emmit('fighter')  // 111,  222
saxer.emmit('gogogo', {hello: 'world'})  // world

saxer.trigger()  // 111,  222,  你好
```
