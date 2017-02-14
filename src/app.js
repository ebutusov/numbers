if (module.hot) {
  module.hot.accept();
}

import './style.css';
import {GWindow} from "./gwindow.js";

(function game(document, window) {

const gwindows = [];
const board = document.querySelector('#game');
const ctlinput = document.querySelector('#ctlinput');
const pointsDiv = document.querySelector("#points");
const livesDiv = document.querySelector("#lives");
const hitsDiv = document.querySelector("#hits");
const levelDiv = document.querySelector("#level");
const gameOverDiv = document.querySelector("#gameover");
const gameWonDiv = document.querySelector("#gamewon");
const greetDiv = document.querySelector("#greet");
const trainDiv = document.querySelector("#training");

// XXX move to game class
let points = 0;
let hits = 0;
let lives = 1;
let level = 0;
let chars = 0;

let training = false;

const TIMEOUT = 15 + 1 + 1; // 1 extra second for transition and 1 for initial tick
const WWIDTH = 150;
const WHEIGHT = 30;

const levThresholds = [
  {p:0, c:0},
  {p:0, c:2},
  {p:200, c:3},
  {p:400, c:4},
  {p:600, c:5},
  {p:800, c:6}, // last level 5!
  {p:1000, c:6}
];

document.documentElement.style.setProperty("--w-height", WHEIGHT+"px");
document.documentElement.style.setProperty("--w-width", WWIDTH+"px");

function random(min, max) {
  return Math.floor(Math.random() * (max-min)) + min;  
}

function isOverlapRect(ax, ay, bx, by)
{
  ax -= 5;
  ay -= 5;
  bx -= 5;
  by -= 5;
  const ax2 = ax + WWIDTH + 5;
  const ay2 = ay + WHEIGHT + 5;
  const bx2 = bx + WWIDTH + 5;
  const by2 = by + WHEIGHT + 5;

  if (ax < bx2 && ax2 > bx &&
      ay < by2 && ay2 > by) return true;
  return false;
}

function textGenerator(n) {
  return ""+random(Math.pow(10,n-1),Math.pow(10,n)-1);
}

function addWindow(section) {
  var itry = 5;
  var rx = 0, ry = 0;
  do 
  {
    var rx = random(0,section.offsetWidth-WWIDTH-30);
    var ry = random(0,section.offsetHeight-WHEIGHT - 30);
    var overlaps = gwindows.filter(it => isOverlapRect(rx, ry, it.x, it.y));
  } while (overlaps.length > 0 && itry-- > 0);

  var win = new GWindow(textGenerator(chars), rx, ry, TIMEOUT);

  win.addToDoc(section);
  gwindows.push(win);
  checkHilight();
}

function tick() {
  gwindows.forEach(it=> {
    it.tick();
    if (it.timeout == 0) {
      it.kill();
      if(!training) lives--;
    }
  });

  // remove dead windows
  var idx = gwindows.findIndex(it=>it.el == null);
  while(idx > -1)
  {
    gwindows.splice(idx, 1)
    idx = gwindows.findIndex(it=>it.el == null);
  }
  updateScore();

  if (lives <= 0)
    gameOver();
}

function spawn() {
  if (gwindows.length < 10)
    addWindow(board);
}

function checkHilight() {
  const val = ctlinput.value;
  const re = new RegExp('^'+val);
  // find windows with matching text
  gwindows.forEach(it=>{
    if (it.el == null) return;
    const m = re.exec(it.text);
    if (m != null)
    {
      const hilight = it.text.replace(re, `<span class="hilight">${val}</span>`);
      it.setHilight(hilight);
    }
  });
}


function checkLevel()
{
  if (training) return;
  const nextTh = levThresholds[level+1].p;
  if (points > nextTh)
    levelUp();
}

function checkHit() {
  const val = ctlinput.value;
  const re = new RegExp('^'+val+'$');
  let gotHit = false;
  gwindows.forEach(it=>{
    if (re.test(it.text))
    {
      it.hit();
      points += it.points;
      it.kill();
      gotHit = true;
      hits++;
    }
  });
  ctlinput.value = "";
  if (gotHit)
  {
    checkLevel();
    updateScore();
    checkHilight();
  }
}

function updateScore() {
    pointsDiv.innerText = points;
    hitsDiv.innerText = hits;
    livesDiv.innerText = lives;
    levelDiv.innerText = level;

}

function onInputKey(e) {
  checkHilight();
  if (e.keyCode == 13)
    checkHit();
}

let interTick = null;
let interSpawn = null;

function gameOver() {
  clearBoard();
  gameOverDiv.style.display = "block";
  gameOverDiv.querySelector("#gameover-result-points").innerText = points;
  // gameOverDiv.querySelector("button").focus();
}

function gameWon() {
  clearBoard();
  gameWonDiv.style.display = "block";
  gameWonDiv.querySelector("#gamewon-result-points").innerText = points;
}

function greet() {
  clearBoard();
  training = false;
  points = 0;
  lives = 3;
  level = 0;
  hits = 0;
  updateScore();
  greetDiv.style.display = "block";
}

function train() {
  clearBoard();
  trainDiv.style.display = "block";
}

function goTrain() {
  training = true;
  chars = parseInt(document.querySelector('#rngnumbers').value);
  newGame();
}

function removeWindows() {
  // in case any of these are displayed
  gameOverDiv.style.display = 
    greetDiv.style.display = 
      gameWonDiv.style.display = 
        trainDiv.style.display = "none";
}

function levelUp()
{
  if (training) return;
  if (level == 5)
  {
    gameOver();
    return;
  }
  level++;
  if (level > 1)
    lives++;
  chars = levThresholds[level].c;
}

function clearBoard() {
  removeWindows();
  if (interTick) clearInterval(interTick);
  if (interSpawn) clearInterval(interSpawn);
  ctlinput.removeEventListener('onkeyup', onInputKey);
  ctlinput.value = '';
  ctlinput.style.display = "none";
  ctlinput.disabled = true;
  gwindows.forEach(it=>it.kill());
  gwindows.splice(0, gwindows.length); // clear array
}

function newGame() {
  clearBoard();
  points = 0;
  lives = 3;
  level = 0;
  hits = 0;
  levelUp();
  ctlinput.style.display = "block";
  ctlinput.addEventListener('keyup', onInputKey);
  interTick = setInterval(tick, 1000);
  interSpawn = setInterval(spawn, 2000);
  updateScore();
  ctlinput.disabled = false;
  ctlinput.focus();
}

document.querySelectorAll(".btstart").forEach(b=>b.addEventListener("click", newGame));
document.querySelector(".btstarttrain").addEventListener("click", train);
document.querySelector(".bttrain").addEventListener("click", goTrain);
document.querySelector('#btnewgame').addEventListener("click", greet);

greet();
}(document, window));