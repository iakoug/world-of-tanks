//加载所有的图片资源
var ImageManager = (function() {
  var images = {
    tank_player1_down_c0_t1: null,
    tank_player1_down_c0_t2: null,
    tank_player1_left_c0_t1: null,
    tank_player1_left_c0_t2: null,
    tank_player1_right_c0_t1: null,
    tank_player1_right_c0_t2: null,
    tank_player1_up_c0_t1: null,
    tank_player1_up_c0_t2: null,
    
    tank_player1_down_c0_t1_s1: null,
    tank_player1_down_c0_t2_s1: null,
    tank_player1_left_c0_t1_s1: null,
    tank_player1_left_c0_t2_s1: null,
    tank_player1_right_c0_t1_s1: null,
    tank_player1_right_c0_t2_s1: null,
    tank_player1_up_c0_t1_s1: null,
    tank_player1_up_c0_t2_s1: null,
    
    tank_player1_down_c0_t1_s2: null,
    tank_player1_down_c0_t2_s2: null,
    tank_player1_left_c0_t1_s2: null,
    tank_player1_left_c0_t2_s2: null,
    tank_player1_right_c0_t1_s2: null,
    tank_player1_right_c0_t2_s2: null,
    tank_player1_up_c0_t1_s2: null,
    tank_player1_up_c0_t2_s2: null,
    
    tank_player1_down_c0_t1_s3: null,
    tank_player1_down_c0_t2_s3: null,
    tank_player1_left_c0_t1_s3: null,
    tank_player1_left_c0_t2_s3: null,
    tank_player1_right_c0_t1_s3: null,
    tank_player1_right_c0_t2_s3: null,
    tank_player1_up_c0_t1_s3: null,
    tank_player1_up_c0_t2_s3: null,
    
    tank_basic_down_c0_t1: null,
    tank_basic_down_c0_t2: null,
    tank_basic_left_c0_t1: null,
    tank_basic_left_c0_t2: null,
    tank_basic_right_c0_t1: null,
    tank_basic_right_c0_t2: null,
    tank_basic_up_c0_t1: null,
    tank_basic_up_c0_t2: null,
    
    tank_basic_down_c0_t1_f: null,
    tank_basic_down_c0_t2_f: null,
    tank_basic_left_c0_t1_f: null,
    tank_basic_left_c0_t2_f: null,
    tank_basic_right_c0_t1_f: null,
    tank_basic_right_c0_t2_f: null,
    tank_basic_up_c0_t1_f: null,
    tank_basic_up_c0_t2_f: null,
    
    appear_1: null,
    appear_2: null,
    appear_3: null,
    appear_4: null,
    
    big_explosion_1: null,
    big_explosion_2: null,
    big_explosion_3: null,
    big_explosion_4: null,
    big_explosion_5: null,
    
    shield_1: null,
    shield_2: null,
    
    bullet_up: null,
    bullet_down: null,
    bullet_left: null,
    bullet_right: null,
    
    bullet_explosion_1: null,
    bullet_explosion_2: null,
    bullet_explosion_3: null,
    
    wall_brick: null,
    wall_steel: null,
    trees: null,
    water_1: null,
    water_2: null,
    
    base: null,
    base_destroyed: null,
    
    enemy: null,
    lives: null,
    flag: null,
    
    roman_one: null,
    roman_one_white: null,
    roman_one_red: null,
    
    points_100: null,
    points_200: null,
    points_300: null,
    points_400: null,
    points_500: null,
    
    battle_city: null,
    namcot: null,
    copyright: null,
    white_line: null,
    arrow: null,
    game_over: null,
  };
  
  var imagesCount = Object.size(images);;
  var imagesLoaded = 0;
  
  for (var i in images) {
    var img = new Image();
    img.src = 'images/' + i + '.png';
    img.onload = function () { ++imagesLoaded; };
    images[i] = img;
  }
  
  return {
    getImage: function (name) {
      return images[name];
    },
    getLoadingProgress: function () {
      return Math.floor((imagesLoaded / imagesCount) * 100);
    }
  };
})();


//立即函数，加载声音资源
var SoundManager = (function() {
  var sounds = {
    stage_start: null,
    game_over: null,
    bullet_shot: null,
    bullet_hit_1: null,
    bullet_hit_2: null,
    explosion_1: null,
    explosion_2: null,
    pause: null,
    statistics_1: null,
  };
  
  for (var i in sounds) {
    var snd = new Audio("sound/" + i + ".ogg");
    sounds[i] = snd;
  }
  
  return {
    play: function (sound) {
      sounds[sound].play();
    },
  };
})();