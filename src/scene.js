//界面管理
function SceneManager(eventManager) {
  this._eventManager = eventManager;
  this._scene = null;
}

SceneManager.prototype.setScene = function (scene) {
  this._scene = scene;
};

SceneManager.prototype.getScene = function () {
  return this._scene;
};

SceneManager.prototype.toMainMenuScene = function (arrived) {
  this._eventManager.removeAllSubscribers();
  this._scene = new MainMenuScene(this);
  
  if (arrived) {
    this._scene.nextMenuItem();
    this._scene.arrived();
  }
};

SceneManager.prototype.toGameScene = function (stage, player) {
  this._eventManager.removeAllSubscribers();
  this._scene = new GameScene(this, stage, player);
};


SceneManager.prototype.toStageStatisticsScene = function (stage, player, gameOver) {
  this._eventManager.removeAllSubscribers();
  this._scene = new StageStatisticsScene(this, stage, player, gameOver);
};


SceneManager.prototype.update = function () {
  this._scene.update();
};

SceneManager.prototype.draw = function (ctx) {
  this._scene.draw(ctx);
};

SceneManager.prototype.getEventManager = function () {
  return this._eventManager;
};

//主界面
function MainMenuScene(sceneManager) {
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  
  this._y = Globals.CANVAS_HEIGHT;
  this._speed = 3;
  
  this._mainMenu = new MainMenu();
  this._mainMenu.setItems([
      new SelectEasyDegreeMenuItem(this._sceneManager),
      new SelectNormalDegreeMenuItem(this._sceneManager),
      new SelectHardDegreeMenuItem(this._sceneManager)
  ]);
  
  this._mainMenuController = new MainMenuController(this._eventManager, this._mainMenu);
  this._mainMenuController.deactivate();
  
  this._cursor = new MainMenuCursor();
  this._cursorView = new MainMenuCursorView(this._cursor);
  this._mainMenuView = new MainMenuView(this._mainMenu, this._cursorView);
}

MainMenuScene.prototype.setY = function (y) {
  this._y = y;
};

MainMenuScene.prototype.getY = function () {
  return this._y;
};

MainMenuScene.prototype.setSpeed = function (speed) {
  this._speed = speed;
};

MainMenuScene.prototype.updatePosition = function () {
  if (this._y == 0) {
    this._mainMenuController.activate();
    return;
  }
  this._y -= this._speed;
  if (this._y <= 0) {
    this.arrived();
  }
};

MainMenuScene.prototype.arrived = function () {
  this._y = 0;
  this._cursor.makeVisible();
};

MainMenuScene.prototype.update = function () {
  this.updatePosition();
  this._cursor.update();
};

MainMenuScene.prototype.draw = function (ctx) {
  this._clearCanvas(ctx);
  ctx.drawImage(ImageManager.getImage('battle_city'), 56, this._y + 80);
  
  ctx.fillStyle = "#ffffff";
  
  ctx.drawImage(ImageManager.getImage('roman_one_white'), 36, this._y + 32);
  ctx.fillText("-    00", 50, this._y + 46);
  
  ctx.fillText("HI- 20000", 178, this._y + 46);
  
  
  ctx.drawImage(ImageManager.getImage('copyright'), 64, this._y + 384);
  ctx.fillText("1980 1985 NAMCO LTD.", 98, this._y + 398);
  ctx.fillText("ALL RIGHTS RESERVED", 98, this._y + 430);
  
  this._mainMenuView.draw(ctx, this._y);
};

MainMenuScene.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

MainMenuScene.prototype.keyPressed = function (key) {
  if (key == Keyboard.Key.START || key == Keyboard.Key.SELECT) {
    this.arrived();
  }
};

MainMenuScene.prototype.setCursor = function (cursor) {
  this._cursor = cursor;
};

MainMenuScene.prototype.setMainMenuController = function (mainMenuController) {
  this._mainMenuController = mainMenuController;
};

MainMenuScene.prototype.nextMenuItem = function () {
  this._mainMenu.nextItem();
};

MainMenuScene.prototype._clearCanvas = function (ctx) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

//主界面场景
function MainMenuItem(sceneManager) {
  this._sceneManager = sceneManager;
  this._name = '';
}

MainMenuItem.prototype.setName = function (name) {
  this._name = name;
};

MainMenuItem.prototype.getName = function () {
  return this._name;
};

MainMenuItem.prototype.execute = function () {
  
};





//主界面
function MainMenu() {
  this._items = [];
  this._item = 0;
}

MainMenu.prototype.setItems = function (items) {
  this._items = items;
};

MainMenu.prototype.getCurrentItem = function () {
  //获取现在的item
  return this._items[this._item];
};

MainMenu.prototype.isCurrent = function (item) {
  return item === this.getCurrentItem();
};

MainMenu.prototype.nextItem = function () {
  this._item++;
  if (this._item >= this._items.length) {
    this._item = 0;
  }
};

MainMenu.prototype.executeCurrentItem = function () {
  this.getCurrentItem().execute();
};

MainMenu.prototype.getItemsInfo = function () {
  var result = [];
  
  this._items.forEach(function (item) {
    var info = {};
    info['name'] = item.getName();
    info['isCurrent'] = this.isCurrent(item);
    result.push(info);
  }, this);
  
  return result;
};

//mainMenuController
function MainMenuController(eventManager, mainMenu) {
  this._eventManager = eventManager;
  this._eventManager.addSubscriber(this, [Keyboard.Event.KEY_PRESSED]);
  this._menu = mainMenu;
  this._active = true;
}

MainMenuController.prototype.notify = function (event) {
  if (event.name == Keyboard.Event.KEY_PRESSED) {
    this.keyPressed(event.key);
  }
};

MainMenuController.prototype.keyPressed = function (key) {
  if (!this._active) {
    return;
  }
  
  if (key == Keyboard.Key.SELECT) {
    this._menu.nextItem();
  }
  else if (key == Keyboard.Key.START) {
    this._menu.executeCurrentItem();
  }
};

MainMenuController.prototype.activate = function () {
  this._active = true;
};

MainMenuController.prototype.deactivate = function () {
  this._active = false;
};

//MainMenuView
function MainMenuView(mainMenu, cursorView) {
  this._menu = mainMenu;
  this._cursorView = cursorView;
}

MainMenuView.prototype.draw = function (ctx, baseY) {
  ctx.fillStyle = "#ffffff";
  
  var items = this._menu.getItemsInfo();
  for (var i = 0; i < items.length; ++i) {
    var y = baseY + 270 + 32 * i;
    ctx.fillText(items[i].name, 178, y);
    if (items[i].isCurrent) {
      this._cursorView.draw(ctx, 128, y - 23);
    }
  }
};

//MainMenuCursor
function MainMenuCursor() {
  this._trackAnimation = new Animation([1,2], 2, true);
  this._visible = false;
}

MainMenuCursor.prototype.getTrackFrame = function () {
  return this._trackAnimation.getFrame();
};

MainMenuCursor.prototype.update = function () {
  this._trackAnimation.update();
};

MainMenuCursor.prototype.makeVisible = function () {
  this._visible = true;
};

MainMenuCursor.prototype.isVisible = function () {
  return this._visible;
};

//MainMenuCursorView
function MainMenuCursorView(cursor) {
  this._cursor = cursor;
}

MainMenuCursorView.prototype.draw = function (ctx, x, y) {
  if (!this._cursor.isVisible()) {
    return;
  }
  ctx.drawImage(ImageManager.getImage(this.getImage()), x, y);
};

MainMenuCursorView.prototype.getImage = function () {
  return 'tank_player1_right_c0_t' + this._cursor.getTrackFrame();
};


//选择难度
function SelectEasyDegreeMenuItem(sceneManager) {
    MainMenuItem.call(this,sceneManager);
    this.setName("Easy");
}
SelectEasyDegreeMenuItem.subclass(MainMenuItem);
SelectEasyDegreeMenuItem.prototype.execute = function () {
    this._sceneManager.toGameScene();
}


function SelectNormalDegreeMenuItem(sceneManager) {
    MainMenuItem.call(this,sceneManager);
    this.setName("Normal");
}
SelectNormalDegreeMenuItem.subclass(MainMenuItem);
SelectNormalDegreeMenuItem.prototype.execute = function () {
    this._sceneManager.toGameScene();
}


function SelectHardDegreeMenuItem(sceneManager) {
    MainMenuItem.call(this,sceneManager);
    this.setName("Hard");
}
SelectHardDegreeMenuItem.subclass(MainMenuItem);
SelectHardDegreeMenuItem.prototype.execute = function () {
    this._sceneManager.toGameScene();
}


//整个游戏场景
function Gamefield(sceneManager) {
  Rect.call(this);
  
  this._sceneManager = sceneManager;
  this._eventManager = this._sceneManager.getEventManager();
  
  this._x = Globals.UNIT_SIZE;
  this._y = Globals.TILE_SIZE;
  this._w = 13 * Globals.UNIT_SIZE;
  this._h = 13 * Globals.UNIT_SIZE;
  
  this._spriteContainer = new SpriteContainer(this._eventManager);
  this._painter = new Painter(this._spriteContainer);
  this._updater = new Updater(this._spriteContainer);
  
  var bounds = new Rect(this._x, this._y, this._w, this._h);
  new CollisionDetector(this._eventManager, bounds, this._spriteContainer);
}

Gamefield.subclass(Rect);

Gamefield.prototype.update = function () {
  this._updater.update();
};

Gamefield.prototype.draw = function (ctx) {
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  ctx.fillStyle = "black";
  ctx.fillRect(this._x, this._y, this._w, this._h);
        
  this._painter.draw(ctx);
};


//游戏界面
function GameScene(sceneManager, stage, player) {
  var self = this;
  this._sceneManager = sceneManager;
  this._stage = stage === undefined ? 1 : stage;
  this._stageMessage = new StageMessage(this._stage);
  this._level = new Level(sceneManager, this._stage, player);
  
  this._script = new Script();
  this._script.enqueue({execute: function () {
    self._stageMessage.show();
    SoundManager.play("stage_start");
  }});
  this._script.enqueue(new Delay(this._script, 60));
  this._script.enqueue({execute: function () {
    self._stageMessage.hide();
    self._level.show();
  }});
  this._script.enqueue(this._level);
}

GameScene.prototype.update = function () {
  this._script.update();
};

GameScene.prototype.draw = function (ctx) {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  this._level.draw(ctx);
  this._stageMessage.draw(ctx);
};
