//bulletexplosionfactory
function BulletExplosionFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Bullet.Event.DESTROYED]);
  
  this._explosionSize = Globals.UNIT_SIZE;
}

BulletExplosionFactory.prototype.setExplosionSize = function (size) {
  this._explosionSize = size;
};

BulletExplosionFactory.prototype.getExplosionSize = function () {
  return this._explosionSize;
};

BulletExplosionFactory.prototype.notify = function (event) {
  if (event.name == Bullet.Event.DESTROYED && event.bullet.shouldExplode()) {
    this.create(event.bullet);
  }
};

BulletExplosionFactory.prototype.create = function (bullet) {
  var explosion = new BulletExplosion(this._eventManager);
  var bulletCenter = bullet.getCenter();
  explosion.setRect(new Rect(
    bulletCenter.getX() - this._explosionSize / 2,
    bulletCenter.getY() - this._explosionSize / 2,
    this._explosionSize,
    this._explosionSize));
  return explosion;
};

//explosion
function Explosion(eventManager) {
  Sprite.call(this, eventManager);
  this._animation = new Animation();
}

Explosion.subclass(Sprite);

Explosion.prototype.setFrames = function (frames) {
  this._animation.setFrames(frames);
};

Explosion.prototype.updateHook = function () {
  if (this._pauseListener.isPaused()) {
    return;
  }
  if (this._animation.isCompleted()) {
    this.destroy();
    return;
  }
  this._animation.update();
};

Explosion.prototype.draw = function (ctx) {
  ctx.drawImage(ImageManager.getImage(this.getImage()), this._x, this._y);
};

//BulletExplosion
function BulletExplosion(eventManager) {
  Explosion.call(this, eventManager);
  this._animation = new Animation([1,2,3]);
}

BulletExplosion.subclass(Explosion);

BulletExplosion.prototype.getImage = function () {
  return 'bullet_explosion_' + this._animation.getFrame();
};

//TankExplosionFactory
function TankExplosionFactory(eventManager) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Tank.Event.DESTROYED]);
  this._explosionSize = Globals.UNIT_SIZE * 2;
}

TankExplosionFactory.prototype.setExplosionSize = function (size) {
  this._explosionSize = size;
};

TankExplosionFactory.prototype.getExplosionSize = function () {
  return this._explosionSize;
};

TankExplosionFactory.prototype.notify = function (event) {
  if (event.name == Tank.Event.DESTROYED) {
    this.create(event.tank);
  }
};

TankExplosionFactory.prototype.create = function (tank) {
  var explosion = new TankExplosion(this._eventManager, tank);
  var tankCenter = tank.getCenter();
  explosion.setRect(new Rect(
    tankCenter.getX() - this._explosionSize / 2,
    tankCenter.getY() - this._explosionSize / 2,
    this._explosionSize,
    this._explosionSize));
  
  SoundManager.play("explosion_1");
 
  return explosion;
};

//TankExplosion
function TankExplosion(eventManager, tank) {
  Explosion.call(this, eventManager);
  this._tank = tank;
  this._animation = new Animation([1,2,3,4,5,3], 3);
}

TankExplosion.subclass(Explosion);

TankExplosion.Event = {};
TankExplosion.Event.DESTROYED = 'TankExplosion.Event.DESTROYED';

TankExplosion.prototype.getImage = function () {
  return 'big_explosion_' + this._animation.getFrame();
};

TankExplosion.prototype.destroyHook = function () {
  this._eventManager.fireEvent({'name': TankExplosion.Event.DESTROYED, 'explosion': this});
};

TankExplosion.prototype.getTank = function () {
  return this._tank;
};
