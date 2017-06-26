/*
	* $lazy 懒加载
	* @container {Object} dom 对象
	* @opts {Object} 配置文件
  * utile {object} 助手方法
	* return {null}
	* Sample: lazy(dom, {
	*   elems: 'img .block',
	*   ondataload: function(dom){
	* 		do some thing ...
	*   }
	* })
	*/
try {
  Aotoo.wrapEx('scroll', function(container, _opts, utile){
    function isWindow(c){
      return c==window||c==document||c==null||!c.tagName||/body|html/i.test(c.tagName);/*判断容器是否是window*/
    }

    /*getElementById
    * @param {String} id ID值
    */
    function $id(c){
      if (isWindow(c) ) return document.documentElement;
      if(/string|object/.test(typeof c)) {
        return typeof c == 'string' ? document.getElementById(c) : c.nodeType ? c : ''
      }
    }

    function currentStyle(element){
      return element.currentStyle || document.defaultView.getComputedStyle(element, null);
    }

    function scrollView(ele){
      var isWin = isWindow((ele||window))
      if (isWin){
        var top  = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0,
          left = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0,
          height = document.documentElement.scrollHeight || document.body.scrollHeight || 0,
          width = document.documentElement.scrollWidth || document.body.scrollWidth || 0;
        
        var visualWidth = window.innerHeight||document.documentElement.offsetHeight||document.body.clientHieght
        var visualHeight = window.innerWidth||document.documentElement.offsetWidth||document.body.clientWidth

        return { scrolltop: top, scrollleft: left, scrollwidth: width, scrollheight: height, range: {
          width: visualWidth,
          height: visualHeight
        }}
      }
      else{
        var _ele = typeof ele == 'string' ? document.getElementById(ele) : ele.nodeType ? ele : false
        if (_ele){
          var curStyle = currentStyle(_ele)
          return { scrolltop: _ele.scrollTop, scrollleft: _ele.scrollleft, scrollwidth: _ele.scrollWidth, scrollheight: _ele.scrollHeight, range: {
            width: curStyle.width,
            height: curStyle.height
          }}
        }
      }
    }

    /*根据className获取dom集合
    * @node {Object} dom 对象
    * @classname {String} 选择对象，基于className
    * demo: var elements = getElementsByClassName(document, className)
    */
    function getElementsByClassName(node, classname) {
      if (node.getElementsByClassName) { // use native implementation if available
        return node.getElementsByClassName(classname);
      } else {
        return (function getElementsByClass(searchClass,node) {
            if ( node == null ) node = document;
            var classElements = [],
                els = node.getElementsByTagName("*"),
                elsLen = els.length,
                pattern = new RegExp("(^|\\s)"+searchClass+"(\\s|$)"), i, j;
            for (i = 0, j = 0; i < elsLen; i++) {
              if ( pattern.test(els[i].className) ) {
                  classElements[j] = els[i];
                  j++;
              }
            }
            return classElements;
        })(classname, node);
      }
    }

    /*获取互不为子的元素集合
    * @node {Object} dom对象
    * @select {String} 选择器
    * Sample: getSiblingElements(doument, '.aaa #bbb img div')
    */
    function getSiblingElements(node, select){
      if (isWindow(node) ) node = document.documentElement;
      var targets = []
      var temp = []
      if (!select) return 
      if (typeof select == 'string') {
        temp = select.split(' ')
      }
      temp.forEach( function(item){
        var char0 = item.charAt(0)
        if (char0 == '#') {
          targets = targets.concat(document.getElementById(item.substring(1)))
        } else 
        if (char0 == '.') {
          targets = targets.concat(utile.toArray( getElementsByClassName(node, item.substring(1))) )
        } else  {
          targets = targets.concat(utile.toArray( node.getElementsByTagName(item)) )
        }
      })
      if (targets.length) return targets
    }

    /*注销事件
    * @param {Object} oTarget 对象
    * @param {String} sEventType 事件类型
    * @param {Function} fnHandler 事件方法
    */
    var removeEventHandler = function(oTarget, sEventType, fnHandler) {
      if(oTarget.listeners && oTarget.listeners[sEventType]){
        var listeners = oTarget.listeners[sEventType];
        for(var i = listeners.length-1;i >= 0 && fnHandler;i--){
          if(listeners[i] == fnHandler){
            listeners.splice(i,1);
          }
        }
        if((!listeners.length || !fnHandler) && listeners["_handler"]){
          oTarget.removeEventListener ? oTarget.removeEventListener(sEventType, listeners["_handler"], false) : oTarget.detachEvent('on' + sEventType, listeners["_handler"]);		
          delete oTarget.listeners[sEventType];
        }
      }	
    }
    /*添加事件
    * @param {Object} oTarget 对象
    * @param {String} sEventType 事件类型
    * @param {Function} fnHandler 事件方法
    */
    var addEventHandler = function(oTarget, sEventType, fnHandler) {
      oTarget.listeners = oTarget.listeners || {};
      var listeners = oTarget.listeners[sEventType] = oTarget.listeners[sEventType] || [];
      listeners.push(fnHandler);
      if(!listeners["_handler"]){
        listeners["_handler"] = function(e){
          var e = e || window.event;
          for(var i = 0,fn;fn = listeners[i++];){
            fn.call(oTarget,e)
          }
        }
        oTarget.addEventListener ? oTarget.addEventListener(sEventType, listeners["_handler"], false) : oTarget.attachEvent('on' + sEventType, listeners["_handler"]);
      }	
    }


    // JavaScript Document
    /*Lazyload v1.2*/
    /*written by Lecaf*/
    /*update by 2011.4.8*/
    function LazyloadClass(options){
      this._init(options);/*初始化*/
      this._doLoad();/*第一次加载*/
      if(!this.elems.length)this._release();/*如果加载元素为空，释放*/
    }

    LazyloadClass.prototype={
      /*初始化参数*/
      _init:function(options){
        this.binder=null; /*加载容器对象*/
        this.range={}; /*加载容器显示范围*/
        this.elems=[];/*加载对象队列*/
        this.container=null;
        this.mode="";
        this.lock=false;/*加载容器锁定*/
        this.elock=false;/*加载元素锁定*/
        this.timer=null;/*_doLoad计时器*/
        this.options={ /*定制参数*/
          container:window,/*加载容器*/
          elems:null,/*加载数据集合*/
          mode:"v",/*加载模式 v(垂直加载) h(水平加载) c(交叉加载) 默认v*/
          ondataload:null,/*数据加载方式*/
          ondataend:function(){}/*数据加载完毕*/
        }
        this.options = utile.merge(this.options,options||{});
        this.elems=utile.toArray(this.options.elems);/*加载对象转换成数组*/
        this.mode=this.options.mode;
        this._onDataLoad=this.options.ondataload || function(){this.elock = false}
        this._onDataEnd=this.options.ondataend; /*所有内容加载完执行*/
        this._initContainer(this.options.container);/*初始化容器*/
      },
      /*初始化容器*/
      _initContainer:function(c){
        var doc=document;
        var _this=this;
        var isWin = isWindow(c)
        if (isWin) c = document.documentElement;
        
        this.container=c;
        /*获取容器显示范围方法*/
        var _getContainerRange=isWin&&window.innerWidth?function(){
          return {top:0,left:0,right:window.innerWidth,bottom:window.innerHeight}
        }:function(){
          return _this._getRect(c);
        }
        this._refreshRange=function(){
          _this.range=_getContainerRange();
        }
        this._refreshRange();
        this._scrollload=function(){
          if(!isWin){_this._refreshRange();}
          _this._doLoad();
        }
        this._resizeload=function(){
          _this._refreshRange();
          _this._doLoad();
        }
        this.binder = isWin ? window : c;
        addEventHandler(this.binder,"scroll",this._scrollload);
        addEventHandler(this.binder,"resize",this._resizeload);
        
        this._noWinScroll=function(){ /*解决刷新时window滚动条定位后造成range错误bug*/
          _this.range=_getContainerRange();
          removeEventHandler(window,"scroll",_this._noWinScroll);
        }
        if(!isWin)addEventHandler(window,"scroll",this._noWinScroll);
      },
      /*获取元素位置参数*/
      _getRect:function(elem){
        var r=elem.getBoundingClientRect();/*元素到窗口左上角距离*/
        return {top:r.top,left:r.left,bottom:r.bottom,right:r.right}
      },
      /**
       * 监控滚动方法
       */
      _scroll: function(scroll){
        this.options.onscroll(scroll)
      },
      /*加载判断，防止多次调用
      @lock锁定，加载过程中锁定。如果为false，执行加载；如果为true，延迟递归
      */
      _doLoad:function(){
        var _this=this;
        if(!this.lock){
          this.lock=true;
          setTimeout(function(){_this._loadRun()}, 100);
        }else{
          clearTimeout(_this.timer);
          _this.timer=setTimeout(function(){ _this.___doLoad() }, 100); 
        }

        if (typeof this.options.onscroll == 'function') {
          var curViewPosition = scrollView(this.container)
          var toBottom = curViewPosition.scrollheight - (curViewPosition.scrolltop+curViewPosition.range.height)
          curViewPosition.toBottom = toBottom
          this._scroll(curViewPosition)
        }
      },
      // 弃用callee的用法
      ___doLoad: function(){
        this._doLoad()
      },
      /*加载运行*/
      _loadRun:function(){
        var elems=this.elems;
        if(elems.length){
          for(var i=0;i<elems.length;i++){
            var rect=this._getRect(elems[i]);
            var side=this._isRange(this._inRange(rect));
            if(side&&side!=0){
              if(side==1&&!this.elock){
                this.elock=true;
                this._onDataLoad(elems[i]);
                elems.splice(i--,1);/*加载完之后将该对象从队列中删除*/
              }else{break;}
            }
          }
          if(!elems.length){
            this._release();
          }
        }
        this.lock=false;
      },
      /*判断对象相对容器位置*/
      _inRange:function(rect){
        var range=this.range;
        var side={
          v : rect.top<=range.bottom ? rect.bottom>=range.top ? "in" : "" : "bottom",/*垂直位置*/
          h : rect.left<=range.right ? rect.right>=range.left ? "in" : "" : "right" /*水平位置*/
        };
        return side;
      },
      _isRange:function(side){
        /*1：加载 -1：跳出循环 0：不加载执行下一个*/
        return {
          v:side.v ? side.v=="in"?1:-1 : 0,  // 0 表示 top
          h:side.h ? side.h=="in"?1:-1 : 0,  // 0 表示 left
          c:side.v&&side.h ? side.v=="in"&&side.h=="in"? 1:side.v!="in"?-1:0 : 0
        }[this.mode||"c"]
      },
      /*释放*/
      _release:function(){
        if (!this.options.onscroll) {
          removeEventHandler(this.binder,"scroll",this._scrollload);
          removeEventHandler(this.binder,"resize",this._resizeload);
        } 
        this._onDataEnd();
      }
    }


    /*
    * $lazy 懒加载
    * @container {Object} dom 对象
    * @opts {Object} 配置文件
    * return {null}
    * Sample: lazy(dom, {
    *   elems: 'img .block',
    *   ondataload: function(dom){
    * 		do some thing ...
    *   }
    * })
    */
    function noop(cb) {
      return function (elem) {
        if (typeof cb == 'function') {
          cb.call(this, elem);
        }
        this.elock = false;
      };
    }

    var _container = $id(_opts.container || container)
    var def = {
      container: _container,
      elements: '',
      mode: 'v',
      onscroll: '',
      oninrange: noop(_opts.oninrange),
      onloaded: noop(_opts.onloaded)
    };
    var _options = utile.merge(def, _opts || {});

    if (typeof _options.elements == 'string') {
      _options.elems = getSiblingElements(_container, _options.elements) || _container.getElementsByTagName('img')
    }
    _options.ondataload = _options.oninrange
    _options.ondataend = _options.onloaded
    new LazyloadClass(_options);
  })

  module.exports = {}
} catch (error) {
  console.error('依赖全局变量Aotoo，请参考 https://github.com/webkixi/aotoo');
}

