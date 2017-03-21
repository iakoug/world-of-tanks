//基本元素
function Sprite(eventManager) {
  Rect.call(this);
  
  this._eventManager = eventManager;
  this._prevDirection = Sprite.Direction.RIGHT;
  this._direction = Sprite.Direction.RIGHT;
  this._normalSpeed = 0;
  this._speed = 0;
  this._destroyed = false;
  this._turn = false;
  this._zIndex = 0;
  this._pauseListener = new PauseListener(this._eventManager);
  this._moveFrequency = 1;
  this._moveTimer = 0;
  
  this._eventManager.fireEvent({'name': Sprite.Event.CREATED, 'sprite': this});
}

Sprite.subclass(Rect);

Sprite.Direction = {
  RIGHT: 'right',
  LEFT: 'left',
  UP: 'up',
  DOWN: 'down',
};

Sprite.Event = {};
Sprite.Event.MOVED = 'Sprite.Event.MOVED';
Sprite.Event.CREATED = 'Sprite.Event.CREATED';
Sprite.Event.DESTROYED = 'Sprite.Event.DESTROYED';

Sprite.prototype.getDirection = function () {
  return this._direction;
};

Sprite.prototype.setDirection = function (direction) {
  if (direction == this._direction) {
    return;
  }
  this._prevDirection = this._direction;
  this._direction = direction;
  this._turn = true;
};

Sprite.prototype.getPrevDirection = function () {
  return this._prevDirection;
};

Sprite.prototype.isTurn = function () {
  return this._turn;
};

Sprite.prototype.getSpeed = function () {
  return this._speed;
};
  
Sprite.prototype.setSpeed = function (speed) {
  this._speed = speed;
};

Sprite.prototype.getNormalSpeed = function () {
  return this._normalSpeed;
};

Sprite.prototype.setNormalSpeed = function (speed) {
  this._normalSpeed = speed;
};

Sprite.prototype.toNormalSpeed = function () {
  this._speed = this._normalSpeed;
};

Sprite.prototype.setMoveFrequency = function (moveFrequencty) {
  this._moveFrequency = moveFrequencty;
};

Sprite.prototype.stop = function () {
  this._speed = 0;
};
  
Sprite.prototype.move = function () {
  this._moveTimer++;
  if (this._moveTimer < this._moveFrequency || this._speed == 0) {
    return;
  }
  this._moveTimer = 0;
  this.doMove();
};

Sprite.prototype.doMove = function () {
  this._x = this._getNewX();
  this._y = this._getNewY();
  this._turn = false;
  this._eventManager.fireEvent({'name': Sprite.Event.MOVED, 'sprite': this});
  this.moveHook();
};

Sprite.prototype.moveHook = function () {
  //钩子函数
};

Sprite.prototype.destroyHook = function () {
  //钩子函数
};


Sprite.prototype.update = function () {
  if (this._destroyed) {
    this.doDestroy();
    return;
  }
  
  if (!this.isPaused()) {
    this.move();
  }
  
  this.updateHook();
};


Sprite.prototype.updateHook = function () {
  
};

Sprite.prototype.destroy = function () {
  this._destroyed = true;
};

Sprite.prototype.isDestroyed = function () {
  return this._destroyed;
};


Sprite.prototype.doDestroy = function () {
  this._pauseListener.destroy();
  this._eventManager.removeSubscriber(this);
  this._eventManager.fireEvent({'name': Sprite.Event.DESTROYED, 'sprite': this});
  this.destroyHook();
};


Sprite.prototype.resolveOutOfBounds = function (bounds) {
  if (this._direction == Sprite.Direction.RIGHT) {
    this._x = bounds.getRight() - this._w + 1;
  }
  else if (this._direction == Sprite.Direction.LEFT) {
    this._x = bounds.getLeft();
  }
  else if (this._direction == Sprite.Direction.UP) {
    this._y = bounds.getTop();
  }
  else if (this._direction == Sprite.Direction.DOWN) {
    this._y = bounds.getBottom() - this._h + 1;
  }
};

Sprite.prototype.setZIndex = function (zIndex) {
  this._zIndex = zIndex;
};

Sprite.prototype.getZIndex = function () {
  return this._zIndex;
};

Sprite.prototype.isPaused = function () {
  return this._pauseListener.isPaused();
};

Sprite.prototype.setPauseListener = function (listener) {
  this._pauseListener.destroy();
  this._pauseListener = listener;
};

Sprite.prototype._getNewX = function () {
  var result = this._x;
      
  if (this._direction == Sprite.Direction.RIGHT) {
    result += this._speed;
  }
  else if (this._direction == Sprite.Direction.LEFT) {
    result -= this._speed;
  }
    
  return result;
};
  
Sprite.prototype._getNewY = function () {
  var result = this._y;
      
  if (this._direction == Sprite.Direction.UP) {
    result -= this._speed;
  }
  else if (this._direction == Sprite.Direction.DOWN) {
    result += this._speed;
  }
    
  return result;
};


//spritecontainer
function SpriteContainer(eventManager) {
  this._eventManager = eventManager;
  eventManager.addSubscriber(this, [Sprite.Event.CREATED, Sprite.Event.DESTROYED]);
  this._sprites = [];
}

SpriteContainer.prototype.addSprite = function (sprite) {
  this._sprites.push(sprite);
  this._sortSpritesByZIndex();
};

SpriteContainer.prototype.removeSprite = function (sprite) {
  arrayRemove(this._sprites, sprite);
};

SpriteContainer.prototype.containsSprite = function (sprite) {
  return arrayContains(this._sprites, sprite);
};

SpriteContainer.prototype.getSprites = function () {
  return this._sprites;
};

SpriteContainer.prototype.getEnemyTanks = function () {
  return this._sprites.filter(function (sprite) {
    return sprite instanceof Tank && sprite.isEnemy();
  });
};

SpriteContainer.prototype.getWalls = function () {
  return this._sprites.filter(function (sprite) {
    return sprite instanceof Wall;
  });
};

SpriteContainer.prototype.getBase = function () {
  for (var i = 0; i < this._sprites.length; ++i) {
    if (this._sprites[i] instanceof Base) {
      return this._sprites[i];
    }
  }
  return null;
};

SpriteContainer.prototype.notify = function (event) {
  if (event.name == Sprite.Event.CREATED) {
    this.addSprite(event.sprite);
  }
  else if (event.name == Sprite.Event.DESTROYED) {
    this.removeSprite(event.sprite);
  }
};

SpriteContainer.prototype._sortSpritesByZIndex = function () {
  this._sprites.sort(function (a, b) {
    if (a.getZIndex() < b.getZIndex()) {
      return -1;
    }
    if (a.getZIndex() > b.getZIndex()) {
      return 1;
    }
    return 0;
  });
};


//CollisionDetector
function CollisionDetector(eventManager, bounds, spriteContainer) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Sprite.Event.MOVED]);
  this._bounds = bounds;
  this._spriteContainer = spriteContainer;
}

CollisionDetector.Event = {};
CollisionDetector.Event.COLLISION = 'CollisionDetector.Event.COLLISION';
CollisionDetector.Event.OUT_OF_BOUNDS = 'CollisionDetector.Event.OUT_OF_BOUNDS';

CollisionDetector.prototype.notify = function (event) {
  SpriteContainer.prototype.notify.call(this, event);
  
  if (event.name == Sprite.Event.MOVED) {
    this._detectCollisionsForSprite(event.sprite);
    this._detectOutOfBoundsForSprite(event.sprite);
  }
};

CollisionDetector.prototype._detectCollisionsForSprite = function (sprite) {
  var sprites = this._spriteContainer.getSprites();
  sprites.forEach(function (other) {
    if (sprite === other) {
      return;
    }
    if (sprite.intersects(other)) {
      this._eventManager.fireEvent({
        'name': CollisionDetector.Event.COLLISION,
        'initiator': sprite,
        'sprite': other});
    }
  }, this);
};

CollisionDetector.prototype._detectOutOfBoundsForSprite = function (sprite) {
  if (!this._bounds.containsWhole(sprite)) {
    this._eventManager.fireEvent({
        'name': CollisionDetector.Event.OUT_OF_BOUNDS,
        'sprite': sprite,
        'bounds': this._bounds});
  }
};

//spriteController
function SpriteController(eventManager, sprite) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED, Keyboard.Event.KEY_RELEASED]);
  this._sprite = sprite;
  this._pauseListener = new PauseListener(this._eventManager);
}

SpriteController.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED && !this._pauseListener.isPaused()) {
    this.keyPressed(event.key);
  }
  else if (event.name == Keyboard.Event.KEY_RELEASED) {
    this.keyReleased(event.key);
  }
};

SpriteController.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.LEFT) {
    this._sprite.setDirection(Sprite.Direction.LEFT);
    this._sprite.toNormalSpeed();
  }
  else if (key == Keyboard.Key.RIGHT) {
    this._sprite.setDirection(Sprite.Direction.RIGHT);
    this._sprite.toNormalSpeed();
  }
  else if (key == Keyboard.Key.UP) {
    this._sprite.setDirection(Sprite.Direction.UP);
    this._sprite.toNormalSpeed();
  }
  else if (key == Keyboard.Key.DOWN) {
    this._sprite.setDirection(Sprite.Direction.DOWN);
    this._sprite.toNormalSpeed();
  }
};

SpriteController.prototype.keyReleased = function (key) {
  if (this._sprite.getDirection() == Sprite.Direction.LEFT && key == Keyboard.Key.LEFT ||
      this._sprite.getDirection() == Sprite.Direction.RIGHT && key == Keyboard.Key.RIGHT ||
      this._sprite.getDirection() == Sprite.Direction.UP && key == Keyboard.Key.UP ||
      this._sprite.getDirection() == Sprite.Direction.DOWN && key == Keyboard.Key.DOWN) {
    this._sprite.stop();
  }
};

//SpriteSerializerController
function SpriteSerializerController(eventManager, structureManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_RELEASED]);
  this._structureManager = structureManager;
  this._spriteSerializer = new SpriteSerializer(this._eventManager);
  this._createTextArea();
}

SpriteSerializerController.prototype._createTextArea = function () {
  this._textarea = $('<textarea />');
  this._textarea.css('width', Globals.CANVAS_WIDTH - 6);
  this._div = $('<div id="serialize" />');
  this._div.append(this._textarea);
  $('#main').prepend(this._div);
};

SpriteSerializerController.prototype.destroy = function () {
  $('#serialize').remove();
};

SpriteSerializerController.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_RELEASED) {
    this.keyReleased(event.key);
  }
};

SpriteSerializerController.prototype.keyReleased = function (key) {
  if (key == Keyboard.Key.S) {
    this._output();
  }
};

SpriteSerializerController.prototype._output = function () {
  var sprites = this._structureManager.getSprites();
  var str = this._spriteSerializer.serializeSprites(sprites);
  this._textarea.text(str);
};


function SpriteSerializer(eventManager) {
  this._eventManager = eventManager;
}

//分号
SpriteSerializer.SEPARATOR = ';';

SpriteSerializer.prototype.serializeSprite = function (sprite) {
  return sprite.getClassName() + '(' + sprite.getX() + ',' + sprite.getY() + ')';
};

//序列化
SpriteSerializer.prototype.serializeSprites = function (sprites) {
  var result = [];
  sprites.forEach(function (sprite) {
    result.push(this.serializeSprite(sprite));
  }, this);
  return result.join(SpriteSerializer.SEPARATOR);
};

//反序列化
SpriteSerializer.prototype.unserializeSprites = function (text) {
  var result = [];
  var strings = text.split(SpriteSerializer.SEPARATOR);
  strings.forEach(function (str) {
    var matches = str.match(/(\w+)\((\d+),(\d+)\)/);
    var className = matches[1];
    var x = parseInt(matches[2]);
    var y = parseInt(matches[3]);
    var sprite = new window[className](this._eventManager);
    sprite.setPosition(new Point(x, y));
    result.push(sprite);
  }, this);
  return result;
};