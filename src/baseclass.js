//继承base的prototype
Function.prototype.subclass = function(base) {
  var c = Function.prototype.subclass.nonconstructor;
  c.prototype = base.prototype;
  this.prototype = new c();
};
Function.prototype.subclass.nonconstructor = function() {};

//获取object的大小
Object.size = function(obj) {
  var size = 0, key;
  for (key in obj) {
    if (obj.hasOwnProperty(key)) size++;
  }
  return size;
};

//封装随机函数
function Random() {}

Random.prototype.getNumber = function () {
  return Math.random();
};


//对象是否在对象数组中
function arrayContains(arr, obj) {
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) {
      return true;
    }
  }
  return false;
};

//从对象数组中删除对象
function arrayRemove(arr, obj) {
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === obj) {
      arr.splice(i, 1);
    }
  }
}

//在数组中插入随机元素
function arrayRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

//填充字符串
String.prototype.lpad = function(padString, length) {
  var str = this;
  while (str.length < length)
    str = padString + str;
  return str;
}


//定位类
function Point(x, y) {
  this._x = x === undefined ? 0 : x;
  this._y = y === undefined ? 0 : y;
}

Point.prototype.getX = function () {
  return this._x;
};

Point.prototype.setX = function (x) {
  this._x = x;
};
  
Point.prototype.getY = function () {
  return this._y;
};
  
Point.prototype.setY = function (y) {
  this._y = y;
};

Point.prototype.getPosition = function () {
  return new Point(this._x, this._y);
};

Point.prototype.setPosition = function (position) {
  this._x = position.getX();
  this._y = position.getY();
};

Point.prototype.setXY = function (x, y) {
  this._x = x;
  this._y = y;
};

//类似canvas中rect()方法,绘制矩形起点x y 和 矩形的宽和高
function Rect(x, y, w, h) {
  Point.call(this, x, y);
  this._w = w || 1;
  this._h = h || 1;
}

Rect.subclass(Point);

Rect.prototype.setRect = function (rect) {
  this._x = rect.getX();
  this._y = rect.getY();
  this._w = rect.getWidth();
  this._h = rect.getHeight();
};

Rect.prototype.getRect = function () {
  return new Rect(this._x, this._y, this._w, this._h);
};

Rect.prototype.setWidth = function (width) {
  this._w = width;
};

Rect.prototype.getWidth = function () {
  return this._w;
};

Rect.prototype.setHeight = function (height) {
  this._h = height;
};

Rect.prototype.getHeight = function () {
  return this._h;
};

//设置尺寸
Rect.prototype.setDimensions = function (width, height) {
  this._w = width;
  this._h = height;
};

Rect.prototype.getLeft = function () {
  return this._x;
};
  
Rect.prototype.getRight = function () {
  return this._x + this._w - 1;
};
  
Rect.prototype.getTop = function () {
  return this._y;
};
  
Rect.prototype.getBottom = function () {
  return this._y + this._h - 1;
};

Rect.prototype.getCenter = function () {
  return new Point(this._x + this._w / 2, this._y + this._h / 2);
};

//判断矩形是否相交  
Rect.prototype.intersects = function (other) {
  return !(this.getLeft() > other.getRight() ||
    this.getRight() < other.getLeft() ||
    this.getTop() > other.getBottom() ||
    this.getBottom() < other.getTop());
};

//判断other是否在里面
Rect.prototype.containsWhole = function (other) {
  return other.getLeft() >= this.getLeft() &&
    other.getRight() <= this.getRight() &&
    other.getBottom() <= this.getBottom() &&
    other.getTop() >= this.getTop();
};


function Painter(spriteContainer) {
  this._spriteContainer = spriteContainer;
}

Painter.prototype.draw = function (ctx) {
  var sprites = this._spriteContainer.getSprites();
  sprites.forEach(function (sprite) {
    sprite.draw(ctx);
  });
};


function Updater(spriteContainer) {
  this._spriteContainer = spriteContainer;
}

Updater.prototype.update = function () {
  var sprites = this._spriteContainer.getSprites();
  sprites.forEach(function (sprite) {
    sprite.update();
  });
};
