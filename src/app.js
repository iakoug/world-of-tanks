//基地
function Base(eventManager) {
  Sprite.call(this, eventManager);
  
  this._eventManager.addSubscriber(this, [CollisionDetector.Event.COLLISION]);
  
  this._w = Globals.UNIT_SIZE;
  this._h = Globals.UNIT_SIZE;
  
  this._hit = false;
}

Base.subclass(Sprite);

Base.Event = {};
Base.Event.HIT = 'Base.Event.HIT';

Base.prototype.getClassName = function () {
  return 'Base';
};

Base.prototype.draw = function (ctx) {
  ctx.drawImage(ImageManager.getImage(this.getImage()), this._x, this._y);
};

Base.prototype.getImage = function () {
  var image = 'base';
  if (this._hit) {
    image += '_destroyed';
  }
  return image;
};


Base.prototype.notify = function (event) {
  if (this._isHitByBullet(event)) {
    this.hit();
  }
};

Base.prototype.hit = function () {
  if (this._hit) {
    return;
  }
  this._hit = true;
  this._eventManager.fireEvent({'name': Base.Event.HIT, 'base': this});
};

Base.prototype.isHit = function () {
  return this._hit;
};

Base.prototype._isHitByBullet = function (event) {
  return event.name == CollisionDetector.Event.COLLISION &&
         event.initiator instanceof Bullet &&
         event.sprite === this
};

//不停的产生坦克
function TankStateAppearing(tank) {
  this._tank = tank;
  this._eventManager = this._tank.getEventManager();
}

TankStateAppearing.Event = {};
TankStateAppearing.Event.END = 'TankStateAppearing.Event.END';


TankStateAppearing.prototype.update = function () {
  if (this._tank.isPaused()) {
    return;
  }
  

    this._eventManager.fireEvent({'name': TankStateAppearing.Event.END, 'tank': this._tank});
};

TankStateAppearing.prototype.draw = function (ctx) {
  ctx.drawImage(ImageManager.getImage(this.getImage()), this._tank.getX(), this._tank.getY());
};

TankStateAppearing.prototype.canMove = function () {
  return false;
};

TankStateAppearing.prototype.canShoot = function () {
  return false;
};

TankStateAppearing.prototype.canBeDestroyed = function () {
  return false;
};

TankStateAppearing.prototype.isCollidable = function () {
  return false;
};

TankStateAppearing.prototype.setFrames = function (frames) {
  this._animation.setFrames(frames);
};

TankStateAppearing.prototype.setFrameDuration = function (duration) {
  this._animation.setFrameDuration(duration);
};

//TankStateNormal
function TankStateNormal(tank) {
  this._tank = tank;
  this._trackAnimation = new Animation([1,2], this._tank.getTrackAnimationDuration(), true);
  
  this._flashDuration = 7;
  this._flashTimer = 0;
  this._flashed = true;
}

TankStateNormal.prototype.getImage = function () {
  var image = 'tank_' + this._tank.getType() + '_'  + this._tank.getDirection() + '_c' + this._tank.getColorValue() + '_t' + this._trackAnimation.getFrame();
  if (this._tank.isFlashing() && this._flashed && this._tank.isNotHit()) {
    image += '_f';
  }
  if (this._tank.getUpgradeLevel()) {
    image += '_s' + this._tank.getUpgradeLevel();
  }
  return image;
};

TankStateNormal.prototype.update = function () {
  if (!this._tank.isPaused()) {
    this.updateTrackAnimation();
  }
  this.updateFlash();
  this._tank.updateColor();
};

TankStateNormal.prototype.updateTrackAnimation = function () {
  if (this._tank.getSpeed() == 0) {
    return;
  }
  this._trackAnimation.update()
};

TankStateNormal.prototype.draw = function (ctx) {
  ctx.drawImage(ImageManager.getImage(this.getImage()), this._tank.getX(), this._tank.getY());
};

TankStateNormal.prototype.canMove = function () {
  return true;
};

TankStateNormal.prototype.canShoot = function () {
  return true;
};

TankStateNormal.prototype.canBeDestroyed = function () {
  return true;
};

TankStateNormal.prototype.isCollidable = function () {
  return true;
};

TankStateNormal.prototype.getTrackFrame = function () {
  return this._trackAnimation.getFrame();
};

TankStateNormal.prototype.setFlashDuration = function (duration) {
  this._flashDuration = duration;
};

TankStateNormal.prototype.isFlashed = function () {
  return this._flashed;
};

TankStateNormal.prototype.setFlashed = function (value) {
  this._flashed = value;
};

TankStateNormal.prototype.updateFlash = function () {
  this._flashTimer++;
  if (this._flashTimer >= this._flashDuration) {
    this._flashTimer = 0;
    this._flashed = !this._flashed;
  }
};

//坦克无敌状态
function TankStateInvincible(tank) {
  TankStateNormal.call(this, tank);
  
  this._eventManager = this._tank.getEventManager();
  
  this._shieldAnimation = new Animation([1,2], 2, true);
  
  this._stateDuration = 110;
  this._stateTimer = 0;
}

TankStateInvincible.subclass(TankStateNormal);

TankStateInvincible.Event = {};
TankStateInvincible.Event.END = 'TankStateInvincible.Event.END';

TankStateInvincible.prototype.update = function () {
  TankStateNormal.prototype.update.call(this);
  this._shieldAnimation.update();
  if (!this._tank.isPaused()) {
    this.updateStateTimer();
  }
};

TankStateInvincible.prototype.draw = function (ctx) {
  TankStateNormal.prototype.draw.call(this, ctx);
  ctx.drawImage(ImageManager.getImage(this.getShieldImage()), this._tank.getX(), this._tank.getY() + 1);
};

TankStateInvincible.prototype.getShieldImage = function () {
  return 'shield_' + this._shieldAnimation.getFrame();
};

TankStateInvincible.prototype.updateStateTimer = function () {
  this._stateTimer++;
  if (this._stateTimer > this._stateDuration) {
    this._eventManager.fireEvent({'name': TankStateInvincible.Event.END, 'tank': this._tank});
  }
};

TankStateInvincible.prototype.setStateDuration = function (duration) {
  this._stateDuration = duration;
};

TankStateInvincible.prototype.getStateDuration = function () {
  return this._stateDuration;
};

TankStateInvincible.prototype.setShieldFrameDuration = function (duration) {
  this._shieldAnimation.setFrameDuration(duration);
};

TankStateInvincible.prototype.canBeDestroyed = function () {
  return false;
};



//EnemyFactory
function EnemyFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Points.Event.DESTROYED, TankExplosion.Event.DESTROYED]);
  
  this._pauseListener = new PauseListener(this._eventManager);
  
  this._positions = [];
  this._position = 0;
  
  this._flashingTanks = [4, 11, 18];
  
  this._interval = 150;
  this._timer = this._interval;
  
  this._enemies = [];
  this._enemy = 0;
  this._enemyCount = 0;
  this._enemyCountLimit = 4;
}

EnemyFactory.Event = {};
EnemyFactory.Event.ENEMY_CREATED = 'EnemyFactory.Event.ENEMY_CREATED';
EnemyFactory.Event.LAST_ENEMY_DESTROYED = 'EnemyFactory.Event.LAST_ENEMY_DESTROYED';

EnemyFactory.prototype.setEnemies = function (enemies) {
  this._enemies = enemies;
};

EnemyFactory.prototype.setPositions = function (positions) {
  this._positions = positions;
};

EnemyFactory.prototype.update = function () {
  if (this._pauseListener.isPaused()) {
    return;
  }
  
  this._timer++;
  if (this._timer > this._interval) {
    this.create();
  }
};

EnemyFactory.prototype.getNextPosition = function () {
  return this._positions[this._position];
};

EnemyFactory.prototype.nextPosition = function () {
  this._position++;
  if (this._position >= this._positions.length) {
    this._position = 0;
  }
};

EnemyFactory.prototype.create = function () {
  if (this._noMoreEnemies() || this._enemyCountLimitReached()) {
    return;
  }
  this._timer = 0;
  this.createNextEnemy();
};

EnemyFactory.prototype.setInterval = function (interval) {
  this._interval = interval;
  this._timer = this._interval;
};

EnemyFactory.prototype.setFlashingTanks = function (tanks) {
  this._flashingTanks = tanks;
};

EnemyFactory.prototype.createNextEnemy = function () {
  var tank = this.createEnemy(this.getNextEnemy(), this.getNextPosition());
  this.nextEnemy();
  this.nextPosition();
  return tank;
};

EnemyFactory.prototype.createEnemy = function (type, position) {
  var tank = new Tank(this._eventManager);
  tank.makeEnemy();
  tank.setType(type);
  tank.setPosition(position);
  tank.setState(new TankStateAppearing(tank));
  
  if (type == Tank.Type.BASIC) {
    tank.setMoveFrequency(2);
    tank.setTrackAnimationDuration(4);
    tank.setValue(100);
  }
  else if (type == Tank.Type.FAST) {
    tank.setNormalSpeed(3);
    tank.setValue(200);
  }
  else if (type == Tank.Type.POWER) {
    tank.setBulletSpeed(Bullet.Speed.FAST);
    tank.setValue(300);
  }
  else if (type == Tank.Type.ARMOR) {
    tank.setMoveFrequency(2);
    tank.setTrackAnimationDuration(4);
    tank.setHitLimit(4);
    tank.setColorValues([[0,1],[0,2],[1,2],[0,0]]);
    tank.setValue(400);
  }
  
  if (arrayContains(this._flashingTanks, this._enemy + 1)) {
    tank.startFlashing();
  }
  
  this._eventManager.fireEvent({'name': EnemyFactory.Event.ENEMY_CREATED, 'enemy': tank});
  this._enemyCount++;
  
  return tank;
};

EnemyFactory.prototype.getNextEnemy = function () {
  return this._enemies[this._enemy];
};

EnemyFactory.prototype.nextEnemy = function () {
  this._enemy++;
};

EnemyFactory.prototype.getEnemyCount = function () {
  return this._enemyCount;
};

EnemyFactory.prototype.getEnemiesToCreateCount = function () {
  return this._enemies.length - this._enemy;
};

EnemyFactory.prototype.notify = function (event) {
  if (event.name == TankExplosion.Event.DESTROYED) {
    if (event.explosion.getTank().isEnemy()) {
      this._enemyCount--;
    }
    if (event.explosion.getTank().isEnemy() && this._enemyCount <= 0 && this.getEnemiesToCreateCount() == 0) {
      this._eventManager.fireEvent({'name': EnemyFactory.Event.LAST_ENEMY_DESTROYED});
    }
  }
};

EnemyFactory.prototype.setEnemyCountLimit = function (limit) {
  this._enemyCountLimit = limit;
};

EnemyFactory.prototype._noMoreEnemies = function () {
  return this._enemy >= this._enemies.length;
};

EnemyFactory.prototype._enemyCountLimitReached = function () {
  return this._enemyCount >= this._enemyCountLimit;
};

//Animation
function Animation(frames, frameDuration, loop) {
  this._frames = frames !== undefined ? frames : [];
  this._frameDuration = frameDuration !== undefined ? frameDuration : 1;
  this._loop = loop !== undefined ? loop : false;
  this._frame = 0;
  this._timer = 0;
  this._completed = false;
  this._active = true;
}

Animation.prototype.setActive = function (active) {
  this._active = active;
};

Animation.prototype.update = function () {
  if (!this._active || this._completed) {
    return;
  }
  
  this._timer++;
  if (this._timer >= this._frameDuration) {
    this._timer = 0;
    this._frame++;
    if (this._frame >= this._frames.length) {
      if (this._loop) {
        this._frame = 0;
      }
      else {
        this._frame = this._frames.length - 1;
        this._completed = true;
      }
    }
  }
};

Animation.prototype.getFrame = function () {
  return this._frames[this._frame];
};

Animation.prototype.setFrames = function (frames) {
  this._frames = frames;
};

Animation.prototype.setFrameDuration = function (duration) {
  this._frameDuration = duration;
};

Animation.prototype.isCompleted = function () {
  return this._completed;
};


//PointsFactory
function PointsFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [TankExplosion.Event.DESTROYED]);
  this._pointsSize = Globals.UNIT_SIZE;
}

PointsFactory.Event = {};
PointsFactory.Event.POINTS_CREATED = 'PointsFactory.Event.POINTS_CREATED';

PointsFactory.prototype.notify = function (event) {
  if (this._enemyTankExplosionEnd(event)) {
    var explosion = event.explosion;
    var tank = explosion.getTank();
    this.create(explosion.getCenter(), tank.getValue(), Points.Type.TANK);
  }
};

PointsFactory.prototype.create = function (center, value, type) {
  var points = new Points(this._eventManager);
  points.setValue(value);
  points.setRect(new Rect(
    center.getX() - this._pointsSize / 2,
    center.getY() - this._pointsSize / 2,
    this._pointsSize,
    this._pointsSize));
  points.setType(type);
  this._eventManager.fireEvent({'name': PointsFactory.Event.POINTS_CREATED, 'points': points});
  return points;
};

PointsFactory.prototype.setPointsSize = function (size) {
  this._pointsSize = size;
};

PointsFactory.prototype._enemyTankExplosionEnd = function (event) {
  if (event.name != TankExplosion.Event.DESTROYED) {
    return false;
  }
  var tank = event.explosion.getTank();
  if (!tank.isEnemy()) {
    return false;
  }
  if (tank.getValue() <= 0) {
    return false;
  }
  return true;
};

//points
function Points(eventManager) {
  Sprite.call(this, eventManager);
  this._value = 0;
  this._duration = 20;
  this._timer = 0;
  this._type = Points.Type.TANK;
}

Points.subclass(Sprite);

Points.Type = {};
Points.Type.TANK = 'Points.Type.TANK';

Points.Event = {};
Points.Event.DESTROYED = 'Points.Event.DESTROYED';

Points.prototype.setValue = function (value) {
  this._value = value;
};

Points.prototype.getValue = function () {
  return this._value;
};

Points.prototype.setDuration = function (duration) {
  this._duration = duration;
};

Points.prototype.setType = function (type) {
  this._type = type;
};

Points.prototype.getType = function () {
  return this._type;
};

Points.prototype.updateTimer = function () {
  this._timer++;
  if (this._timer > this._duration) {
    this.destroy();
  }
};

Points.prototype.updateHook = function () {
  if (this._pauseListener.isPaused()) {
    return;
  }
  this.updateTimer();
};

Points.prototype.getImage = function () {
  return 'points_' + this._value;
};

Points.prototype.draw = function (ctx) {
  ctx.drawImage(ImageManager.getImage(this.getImage()), this._x, this._y);
};

Points.prototype.destroyHook = function () {
  this._eventManager.fireEvent({'name': Points.Event.DESTROYED, 'points': this});
};


//PlayerTankFactory
function PlayerTankFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [TankExplosion.Event.DESTROYED]);
  this._appearPosition = new Point(0, 0);
  this._active = true;
}

PlayerTankFactory.Event = {};
PlayerTankFactory.Event.PLAYER_TANK_CREATED = 'PlayerTankFactory.Event.PLAYER_TANK_CREATED';

PlayerTankFactory.prototype.notify = function (event) {
  if (!this._active) {
    return;
  }
  if (this._tankExplosionDestroyed(event)) {
    this.create();
  }
};

PlayerTankFactory.prototype.setAppearPosition = function (position) {
  this._appearPosition = position;
};

PlayerTankFactory.prototype.create = function () {
  var tank = new Tank(this._eventManager);
  tank.setPosition(this._appearPosition);
  tank.setState(new TankStateAppearing(tank));
  this._eventManager.fireEvent({'name': PlayerTankFactory.Event.PLAYER_TANK_CREATED, 'tank': tank});
  return tank;
};

PlayerTankFactory.prototype.setActive = function (active) {
  this._active = active;
};

PlayerTankFactory.prototype._tankExplosionDestroyed = function (event) {
  if (event.name != TankExplosion.Event.DESTROYED) {
    return false;
  }
  var tank = event.explosion.getTank();
  if (!tank.isPlayer()) {
    return false;
  }
  return true;
};

//PlayerTankControllerFactory
function PlayerTankControllerFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [PlayerTankFactory.Event.PLAYER_TANK_CREATED]);
}

PlayerTankControllerFactory.prototype.notify = function (event) {
  if (event.name == PlayerTankFactory.Event.PLAYER_TANK_CREATED) {
    this.create(event.tank);
  }
};

PlayerTankControllerFactory.prototype.create = function (tank) {
  var controller = new TankController(this._eventManager, tank);
  return controller;
};


//BaseWallBuilder
function BaseWallBuilder() {
  this._positions = [];
  this._factory = null;
  this._spriteContainer = null
}

BaseWallBuilder.prototype.setWallPositions = function (positions) {
  this._positions = positions;
};

BaseWallBuilder.prototype.setWallFactory = function (factory) {
  this._factory = factory;
};

BaseWallBuilder.prototype.setSpriteContainer = function (container) {
  this._spriteContainer = container;
};

BaseWallBuilder.prototype.buildWall = function () {
  this._positions.forEach(function (position) {
    var wall = this._factory.create();
    wall.setPosition(position);
  }, this);
};

BaseWallBuilder.prototype.destroyWall = function () {
  this._spriteContainer.getWalls().forEach(function (wall) {
    for (var i = 0; i < this._positions.length; ++i) {
      var position = this._positions[i];
      if (wall.getX() == position.getX() && wall.getY() == position.getY()) {
        wall.destroy();
        break;
      }
    } 
  }, this);
};


//Pause
function Pause(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  this._pause = false;
  this._active = true;
}

Pause.Event = {};
Pause.Event.START = 'Pause.Event.START';
Pause.Event.END = 'Pause.Event.END';

Pause.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

Pause.prototype.keyPressed = function (key) {
  if (!this._active) {
    return;
  }
  if (key == Keyboard.Key.START) {
    this._pause = !this._pause;
    
    if (this._pause) {
      SoundManager.play("pause");
      this._eventManager.fireEvent({'name': Pause.Event.START});
    }
    else {
      this._eventManager.fireEvent({'name': Pause.Event.END});
    }
  }
};

Pause.prototype.update = function () {
  if (!this._pause) {
    return;
  }
};

Pause.prototype.draw = function (ctx) {
  if (!this._pause) {
    return;
  }
  ctx.fillStyle = "#e44437";
  ctx.fillText("PAUSE", 202, 240);
};

Pause.prototype.setActive = function (active) {
  this._active = active;
};

//PauseListener
function PauseListener(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Pause.Event.START, Pause.Event.END]);
  this._pause = false;
}

PauseListener.prototype.notify = function (event) {
  if (event.name == Pause.Event.START) {
    this.pause();
  }
  else if (event.name == Pause.Event.END) {
    this.unpause();
  }
};

PauseListener.prototype.pause = function () {
  this._pause = true;
}

PauseListener.prototype.unpause = function () {
  this._pause = false;
}

PauseListener.prototype.isPaused = function () {
  return this._pause;
}

PauseListener.prototype.destroy = function () {
  this._eventManager.removeSubscriber(this);
}

//BaseExplosionFactory
function BaseExplosionFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Base.Event.HIT]);
  this._explosionSize = Globals.UNIT_SIZE * 2;
}

BaseExplosionFactory.prototype.setExplosionSize = function (size) {
  this._explosionSize = size;
};

BaseExplosionFactory.prototype.getExplosionSize = function () {
  return this._explosionSize;
};

BaseExplosionFactory.prototype.notify = function (event) {
  if (event.name == Base.Event.HIT) {
    this.create(event.base);
  }
};

BaseExplosionFactory.prototype.create = function (base) {
  var explosion = new BaseExplosion(this._eventManager);
  var baseCenter = base.getCenter();
  explosion.setRect(new Rect(
    baseCenter.getX() - this._explosionSize / 2,
    baseCenter.getY() - this._explosionSize / 2,
    this._explosionSize,
    this._explosionSize));
    
  SoundManager.play("explosion_2");
  
  return explosion;
};

//BaseExplosion
function BaseExplosion(eventManager) {
  Explosion.call(this, eventManager);
  this._animation = new Animation([1,2,3,4,5,3], 3);
}

BaseExplosion.subclass(Explosion);

BaseExplosion.Event = {};
BaseExplosion.Event.DESTROYED = 'BaseExplosion.Event.DESTROYED';

BaseExplosion.prototype.getImage = function () {
  return 'big_explosion_' + this._animation.getFrame();
};

BaseExplosion.prototype.destroyHook = function () {
  this._eventManager.fireEvent({'name': BaseExplosion.Event.DESTROYED, 'explosion': this});
};

//TankColor
function TankColor() {
  this._colors = [[0,0]];
  this._hit = 0;
  this._color = 0;
}

TankColor.prototype.setColors = function (colors) {
  this._colors = colors;
};

TankColor.prototype.getColor = function () {
  return this._colors[this._hit][this._color];
};

TankColor.prototype.update = function () {
  this._color = this._color == 0 ? 1 : 0;
};

TankColor.prototype.hit = function () {
  this._hit++;
  if (this._hit >= this._colors.length) {
    this._hit = this._colors.length - 1;
  }
};




//Level
function Level(sceneManager, stageNumber, player) {
  Gamefield.call(this, sceneManager);
  
  var self = this;
  
  this._eventManager.addSubscriber(this, [
    BaseExplosion.Event.DESTROYED,
    Player.Event.OUT_OF_LIVES,
    EnemyFactory.Event.LAST_ENEMY_DESTROYED
  ]);
  
  this._visible = false;
  this._stage = stageNumber;
  
  new PlayerTankControllerFactory(this._eventManager);
  
  this._playerTankFactory = new PlayerTankFactory(this._eventManager);
  this._playerTankFactory.setAppearPosition(new Point(this._x + 4 * Globals.UNIT_SIZE, this._y + 12 * Globals.UNIT_SIZE));
  this._playerTankFactory.create();

  new BulletFactory(this._eventManager);
  new BulletExplosionFactory(this._eventManager);
  new TankExplosionFactory(this._eventManager);
  new BaseExplosionFactory(this._eventManager);
  new PointsFactory(this._eventManager);
  
  this._aiControllersContainer = new AITankControllerContainer(this._eventManager);
  this._aiTankControllerFactory = new AITankControllerFactory(this._eventManager, this._spriteContainer);

  this._enemyFactory = new EnemyFactory(this._eventManager);
  this._enemyFactory.setPositions([
    new Point(this._x + 6 * Globals.UNIT_SIZE, this._y),
    new Point(this._x + 12 * Globals.UNIT_SIZE, this._y),
    new Point(this._x, this._y),
  ]);
  
  this._enemyFactoryView = new EnemyFactoryView(this._enemyFactory);
  
  
  var baseWallBuilder = new BaseWallBuilder();
  baseWallBuilder.setWallPositions([
    new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 25 * Globals.TILE_SIZE),
    new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 24 * Globals.TILE_SIZE),
    new Point(this._x + 11 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 12 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 13 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 23 * Globals.TILE_SIZE),
    new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 24 * Globals.TILE_SIZE),
    new Point(this._x + 14 * Globals.TILE_SIZE, this._y + 25 * Globals.TILE_SIZE),
  ]);
  baseWallBuilder.setSpriteContainer(this._spriteContainer);
  
  this._pause = new Pause(this._eventManager);
  
  this._player = player === undefined ? new Player() : player;
  this._player.setEventManager(this._eventManager);
  
  this._livesView = new LivesView(this._player);
  
  
  this._gameOverScript = new Script();
  this._gameOverScript.setActive(false);
  this._gameOverScript.enqueue(new Delay(this._gameOverScript, 50));
  this._gameOverScript.enqueue({execute: function () { sceneManager.toStageStatisticsScene(stageNumber, self._player, true); }});
  
  this._levelTransitionScript = new Script();
  this._levelTransitionScript.setActive(false);
  this._levelTransitionScript.enqueue(new Delay(this._levelTransitionScript, 200));
  this._levelTransitionScript.enqueue({execute: function () { sceneManager.toStageStatisticsScene(stageNumber, self._player, false); }});
  
  this._loadStage(this._stage);
}

Level.subclass(Gamefield);

Level.prototype.update = function () {
  Gamefield.prototype.update.call(this);
  this._enemyFactory.update();
  this._aiControllersContainer.update();
  this._pause.update();
  this._gameOverScript.update();
  this._levelTransitionScript.update();
};

Level.prototype.draw = function (ctx) {
  if (!this._visible) {
    return;
  }
  Gamefield.prototype.draw.call(this, ctx);
  this._enemyFactoryView.draw(ctx);
  this._pause.draw(ctx);
  this._livesView.draw(ctx);
  this._drawFlag(ctx);
};

Level.prototype.show = function () {
  this._visible = true;
};

Level.prototype.notify = function (event) {
  if (event.name == BaseExplosion.Event.DESTROYED) {
    this._gameOverScript.setActive(true);
    this._pause.setActive(false);
  }
  else if (event.name == Player.Event.OUT_OF_LIVES) {
    this._gameOverScript.setActive(true);
    this._pause.setActive(false);
    this._playerTankFactory.setActive(false);
  }
  else if (event.name == EnemyFactory.Event.LAST_ENEMY_DESTROYED) {
    this._levelTransitionScript.setActive(true);
  }
};

Level.prototype._loadStage = function (stageNumber) {
  var stage = Globals.stages[(stageNumber - 1) % Globals.stages.length];
  
  var serializer = new SpriteSerializer(this._eventManager);
  serializer.unserializeSprites(stage.map);
  
  this._enemyFactory.setEnemies(stage.tanks);
};



Level.prototype._drawFlag = function (ctx) {
  ctx.drawImage(ImageManager.getImage('flag'), 464, 352);
  
  ctx.fillStyle = "black";
  ctx.fillText(("" + this._stage).lpad(" ", 2), 466, 398);
};

//显示敌人的个数
function EnemyFactoryView(enemyFactory) {
  this._enemyFactory = enemyFactory;
}

EnemyFactoryView.prototype.draw = function (ctx) {
  for (var i = 0; i < this._enemyFactory.getEnemiesToCreateCount(); ++i) {
    var x = 465 + Globals.TILE_SIZE * (i % 2);
    var y = 34 + Globals.TILE_SIZE * Math.floor(i / 2);
    ctx.drawImage(ImageManager.getImage('enemy'), x, y);
  }
};

//命数 :)
function LivesView(player) {
  this._player = player;
}

LivesView.prototype.draw = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.font = "16px prstart"
  
  ctx.drawImage(ImageManager.getImage('roman_one'), 468, 256);
  
  ctx.fillText("P", 482, 286 - 16);
  ctx.fillText(this._player.getLives(), 482, 286);
  
  ctx.drawImage(ImageManager.getImage('lives'), 465, 272);
};

//脚本队列
function Script() {
  //执行队列
  this._nodes = [];
  this._active = true;
}

Script.prototype.enqueue = function (node) {
  this._nodes.push(node);
};

Script.prototype.update = function () {
  //执行队列内的任务
  if (!this._active) {
    return;
  }
  while (true) {
    if (this._nodes.length == 0) {
      return;
    }
    if (this._nodes[0].update !== undefined) {
      break;
    }
    this._nodes[0].execute();
    this._nodes.shift();
  }
  
  this._nodes[0].update();
};

Script.prototype.actionCompleted = function () {
  //执行完成
  this._nodes.shift();
};

Script.prototype.setActive = function (active) {
  //将任务设置为启用
  this._active = active;
};

//延时函数，每次间隔为 1s/FPS/20
function Delay(script, duration) {
  this._script = script;
  this._duration = duration;
  this._timer = 0;
}

Delay.prototype.update = function () {
  this._timer++;
  if (this._timer > this._duration) {
    this._script.actionCompleted();
  }
};


