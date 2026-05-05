// ===== Fixed resolution =====
const BASE_W = 3840;
const BASE_H = 2400;

let scaleFactor, offsetX, offsetY;


// ===== Scene =====
let scene = "menu";


// ===== Main Story =====
let images = [];

let sounds = [];

let currentIndex = 0;

let hasSound = [true,true,true,true,true,true,true,false];

let canClick = false;


// ===== Sub Scenes =====
let subScenes = [];

let subSounds = [];

let currentSub = -1;

let subIndex = 0;

let subCanClick = false;

let subFinished = [false,false,false];


// ===== Game Objects =====
let player;
let foods=[];
let enemies=[];

let score = 0;

let timeLeft = 30;

let lives = 5;

let lastTime = 0;



// ===== UI =====
let startBtn = {x:0,y:0,w:0,h:0};



// ===== Game Assets =====
let bgImg, pacmanImg, foodImg, enemyImg;

let winImg, loseImg, transitionImg, endingImg;

let winSound, loseSound, transitionSound;



// ===== Background Music =====
let bgm;
let bgmStarted = false;



// ==========================
function preload(){
  bgImg = loadImage('background.png');

  for (let i=1;i<=8;i++){
    images.push(loadImage(i+'.png'));
  }

  let names=['A','B','C','D','E','F','G'];
  for (let i=0;i<7;i++){
    sounds.push(loadSound(names[i]+'.mp3'));
  }
  sounds.push(null);

  for (let i=1;i<=3;i++){
    let group=[];
    for (let j=1;j<=3;j++){
      group.push(loadImage(`sub${i}_${j}.png`));
    }
    subScenes.push(group);
    subSounds.push(loadSound(`sub${i}.mp3`));
  }

  
  
  // objects
  pacmanImg = loadImage("pacman.png");
  
  foodImg = loadImage("food.png");
  
  enemyImg = loadImage("enemy.png");

  winImg = loadImage("win.png");
  
  loseImg = loadImage("lose.png");
  
  transitionImg = loadImage("transition.png");
  
  endingImg = loadImage("ending.png");
  
  winSound = loadSound("win.mp3");
  
  loseSound = loadSound("lose.mp3");
  
  transitionSound = loadSound("transition.mp3");
  
  bgm = loadSound("bgm.mp3");
}



//sizes for game objects
const PLAYER_SIZE = 500;

const FOOD_SIZE = 250;

const ENEMY_SIZE = 400;



// ==========================
function setup(){
  createCanvas(windowWidth, windowHeight);
  player = {x:1920,y:1200,size:PLAYER_SIZE};
}



// ==========================
function draw(){
  background(0);

  scaleFactor = min(width/BASE_W, height/BASE_H);
  
  offsetX = (width-BASE_W*scaleFactor)/2;
  
  offsetY = (height-BASE_H*scaleFactor)/2;

  push();
  translate(offsetX, offsetY);
  scale(scaleFactor);

  if (scene==="menu") drawMenu();
  
  else if (scene==="play") drawStory();
  
  else if (scene==="subScene") drawSub();
  
  else if (scene==="level1") drawLevel1();
  
  else if (scene==="transition") drawTransition();
  
  else if (scene==="level2") drawLevel2();
  
  else if (scene==="win") image(winImg,0,0,BASE_W,BASE_H);
  
  else if (scene==="lose") image(loseImg,0,0,BASE_W,BASE_H);
  
  else if (scene==="ending") image(endingImg,0,0,BASE_W,BASE_H);

  pop();
}



// ==========================
function drawMenu(){
  image(bgImg,0,0,BASE_W,BASE_H);

  
  startBtn.w = 300;
  
  startBtn.h = 120;
  
  startBtn.x = BASE_W - startBtn.w - 660;
  
  startBtn.y = BASE_H - startBtn.h - 660;

  fill(0);
  
  rect(startBtn.x,startBtn.y,startBtn.w,startBtn.h,20);

  fill(255);
  
  textAlign(CENTER,CENTER);
  
  textSize(50);
  
  text("START", startBtn.x+startBtn.w/2, startBtn.y+startBtn.h/2);
}



// ==========================
function drawStory(){
  image(images[currentIndex],0,0,BASE_W,BASE_H);

  if (currentIndex===7){
    let zones = getZones();
    fill(255,0,0,80);
    for (let z of zones){
      rect(z.x,z.y,z.w,z.h);
    }
  }
}



// ==========================
function drawSub(){
  image(subScenes[currentSub][subIndex],0,0,BASE_W,BASE_H);
}



// ==========================
//Level1
function drawLevel1(){

  movePlayer();
  image(pacmanImg,player.x,player.y,player.size,player.size);

  for (let f of foods){
    image(foodImg,f.x,f.y,FOOD_SIZE,FOOD_SIZE);

    if (dist(player.x,player.y,f.x,f.y)<player.size/2){
      score++;
      f.x=random(BASE_W);
      f.y=random(BASE_H);
    }
  }

  timer();

  drawUI(false);

  if (score>=10){
    scene="transition";
    transitionSound.play();
  }
}



// ==========================
//transition
function drawTransition(){
  image(transitionImg,0,0,BASE_W,BASE_H);
}



// ==========================
//Level2
function drawLevel2(){

  movePlayer();
  image(pacmanImg,player.x,player.y,100,100);

  for (let f of foods){
    image(foodImg,f.x,f.y,50,50);

    if (dist(player.x,player.y,f.x,f.y)<60){
      score++;
      f.x=random(BASE_W);
      f.y=random(BASE_H);
    }
  }

  
  
  // enemies move
  for (let e of enemies){
    e.x += e.speed;

    if (e.x<0 || e.x>BASE_W-ENEMY_SIZE) e.speed*=-1;

    image(enemyImg,e.x,e.y,ENEMY_SIZE,ENEMY_SIZE);

    if (dist(player.x,player.y,e.x,e.y)<player.size/2){
      lives--;
      player.x=1920;
      player.y=1200;
    }
  }

  drawUI(true);

  if (lives<=0){
    scene="lose";
    loseSound.play();
  }

  if (score>=20){
    scene="win";
    winSound.play();
  }
}



// ==========================
function drawUI(showLife){
  fill(255);
  
  textSize(40);
  
  text("Score: "+score,80,80);
  
  text("Time: "+timeLeft,80,140);

  if (showLife){
    text("Lives: "+lives,80,200);
  }
}



// ==========================
function timer(){
  if (millis()-lastTime>1000){
    timeLeft--;
    lastTime=millis();

    if (timeLeft<=0){
      scene="lose";
      loseSound.play();
    }
  }
}


// ==========================
function mousePressed(){

  userStartAudio();

  
  let mx = (mouseX-offsetX)/scaleFactor;
  let my = (mouseY-offsetY)/scaleFactor;

  
  if (scene==="menu"){
    if (inRect(mx,my,startBtn)){
      startBGM();
      scene="play";
      playSound();
    }
  }

  
  else if (scene==="play"){

    if (currentIndex===7){
      let zones = getZones();

      for (let i=0;i<3;i++){
        if (inRect(mx,my,zones[i])){
          currentSub=i;
          subIndex=0;
          scene="subScene";

          subCanClick=false;
          let s=subSounds[i];

          if (s){
            s.play();
            s.onended(()=>subCanClick=true);
          } else subCanClick=true;

          return;
        }
      }
    }

    if (canClick){
      currentIndex++;
      if (currentIndex>=8) currentIndex=7;
      playSound();
    }
  }

  else if (scene==="subScene"){

    if (subIndex===0 && !subCanClick) return;

    subIndex++;

    if (subIndex>=3){
      subFinished[currentSub]=true;

      if (subFinished.every(v=>v)){
        initLevel1();
      } else {
        scene="play";
      }
    }
  }

  else if (scene==="transition"){
    scene="level2";
    initLevel2();
  }
  
  // ending
  else if (scene==="win" || scene==="lose"){
    scene="ending";
  }

}


// ==========================
function initLevel1(){
  scene="level1";
  score=0;
  timeLeft=30;
  foods=[];

  for (let i=0;i<10;i++){
    foods.push({x:random(BASE_W),y:random(BASE_H)});
  }
}


// =========================
function initLevel2(){
  score=0;
  lives=5;
  foods=[];
  enemies=[];

  for (let i=0;i<20;i++){
    foods.push({x:random(BASE_W),y:random(BASE_H)});
  }

  for (let i=0;i<5;i++){
    enemies.push({
      x:random(BASE_W),
      y:random(BASE_H),
      speed:random(5,10)
    });
  }
}



// ==========================
//Player Movement
function movePlayer(){
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) player.x-=15;
  
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) player.x+=15;
  
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) player.y-=15;
  
  if (keyIsDown(DOWN_ARROW) || keyIsDown(83)) player.y+=15;
}


// ==========================
function playSound(){
  canClick=false;
  let s=sounds[currentIndex];
  if (s){
    s.play();
    s.onended(()=>canClick=true);
  } else canClick=true;
}

// ==========================
function getZones(){
  return [
    
    {x:800,y:1400,w:300,h:300},
    
    {x:1600,y:1400,w:300,h:300},
    
    {x:2400,y:1400,w:300,h:300}
  ];
}

function inRect(mx,my,r){
  return mx>r.x && mx<r.x+r.w &&
         my>r.y && my<r.y+r.h;
}

function startBGM(){
  if (!bgmStarted && bgm && bgm.isLoaded()){
    bgm.setLoop(true);
    bgm.setVolume(0.5);
    bgm.play();
    bgmStarted = true;
  }
}