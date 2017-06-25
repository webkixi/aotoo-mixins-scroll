# aotoo-mixins-scroll
mixin scroll, about Listen to the scroll event and lazyload something"

## Dependencies

Pls install `aotoo` first, and make `aotoo` as a global variable with the variable name `Aotoo`
```js
npm install aotoo  or
yarn add aotoo

------------ some js file

import aotoo from aotoo
window.Aotoo = aotoo
require('aotoo-mixins-scroll')
...
```

## Install
```
// install
npm install aotoo-mixins-scroll --save
```

## Usage 
```js
// it is a plugin of aotoo
import treex from 'aotoo-react-treex'

/*
 I. treeTest.render() is a jsx  
 
 II. treeTest.render(id) will mount jsx into the dom about that id, like React.render(...)  
 
 III. treeTest.render(id, callback)  callback will be executed after jsx be mounted into the dom about that id  
*/
const treeTest = treex({
  props: { 
    data: [
      {title: '1111'},
      {title: '2222'},
      {title: '1111'},
      {title: '2222'},
      {title: '1111'},
      {title: '2222'},
      {title: '1111'},
      {title: '2222'},
      {title: '1111'},
      {title: '2222'},
      {title: '1111'},
      {title: '2222'},
      {title: <div className="img">abcdefg</div>},
      {title: '2222'},
      {title: '1111'},
      {title: '2222'},
      {title: '3333'} 
    ]
  }
})

const LazyList = Aotoo.scroll(treeTest.render(), {
  // Specify the container
  container: window,

  // Specify the lazy elements
  elements: '.img',

  // Callback of the listening scroll event 
  onscroll: function(pos){
	console.log(pos.scrolltop);
	console.log(pos.scrollleft);
  },

  // Callback of the listening scroll event, when the element enters the visible area 
  oninrange: function(dom) {
    console.log(dom);
  }
})


Aotoo.render(<LazyList />, 'test')
```

