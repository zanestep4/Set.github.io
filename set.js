"use strict";

(function() {

  let timerId;
  let remainingSeconds;
  let totalCards;
  let index;
  let called;
  let cardDupes = new Set();  // store the generated cards

window.addEventListener("load", init);

function init() {
  let startButton = id("start-btn");
  startButton.addEventListener("click", toggleView);
  startButton.addEventListener("click", generateRandomAttributes);
  startButton.addEventListener("click", generateUniqueCard);
  startButton.addEventListener("click", startTimer);

  let backButton = id("back-btn");
  backButton.addEventListener("click", toggleView);
  backButton.addEventListener("click", clearBoard);
  backButton.addEventListener("click", enableBtn);
  backButton.addEventListener("click", toggleCalled);

  let refreshButton = id("refresh-btn");
  refreshButton.addEventListener("click", clearBoard);
  refreshButton.addEventListener("click", toggleCalled);
  refreshButton.addEventListener("click", generateRandomAttributes);
  refreshButton.addEventListener("click", generateUniqueCard);
  refreshButton.addEventListener("click", restartTimer);
  refreshButton.addEventListener("click", startTimer);
}

function toggleView() {
  let game = qs("#game-view");
  let menu = qs("#menu-view");
  
  game.classList.toggle("hidden");
  menu.classList.toggle("hidden");
}

function generateRandomAttributes(isEasy) {
  var COLOR = ['red', 'green', 'purple'];
  var FILL = ['solid', 'outline', 'striped'];
  var SHAPE = ['oval', 'diamond', 'squiggle'];
  var COUNT = ['1', '2', '3'];

  if (document.getElementById('easy-radio').checked) {
    isEasy = true;
  } else if (document.getElementById('standard-radio').checked) {
    isEasy = false;
  }

  if (isEasy) {
    totalCards = 9;

    let randColor = (Math.floor(Math.random()*3));
    let randFill = 0;
    let randShape = (Math.floor(Math.random()*3));
    let randCount = (Math.floor(Math.random()*3));
    
    let cardEasy = [
      COLOR[randColor],
      FILL[randFill],
      SHAPE[randShape],
      COUNT[randCount]
    ];

    return cardEasy;
    
    } else {
    totalCards = 12;

    let randColor = (Math.floor(Math.random()*3));
    let randFill = (Math.floor(Math.random()*3));
    let randShape = (Math.floor(Math.random()*3));
    let randCount = (Math.floor(Math.random()*3));
  
    let cardStandard = [
      COLOR[randColor],
      FILL[randFill],
      SHAPE[randShape],
      COUNT[randCount]
    ];

    return cardStandard;
  }
}

function generateUniqueCard(isEasy) {
  let board = id("board");

  if (totalCards == 9) {
    index = 9;
  } else if (totalCards == 12) {
    index = 12;
  }
  if (called) {
    index = 1;
  }

  for (let i = 1; i <= index; i++) {
    let card = generateRandomAttributes(isEasy);
    let cardS = card.join("-");


    while (cardDupes.has(cardS)) {
      card = generateRandomAttributes(isEasy);
      cardS = card.join("-");
    }

    cardDupes.add(cardS);

    let count = card.pop();
    
    let cardDiv = document.createElement("div");
    cardDiv.className = 'card';
    cardDiv.id = cardS;

    let newCard = document.createElement("img");
    newCard.alt = cardS;
    let cardSrc = cardS.replace(/-1|-2|-3/gi, ".png");
    newCard.src = ("img/" + cardSrc);

    board.appendChild(cardDiv);

    for (let j = 0; j < count; j++) {
      cardDiv.appendChild(newCard.cloneNode(true));
    }

    var uniqueCard = id(cardS);
    uniqueCard.addEventListener("click", cardSelected, true);
  }
  return uniqueCard;
}

function cardSelected() {
  called = false;
  let board = id("board");
  this.classList.toggle("selected");
  let selectedCards = document.getElementsByClassName("selected");
  
  if (selectedCards.length === 3) {
    let selected = [];
    let newPara = [];
    for (let i = 0; i < selectedCards.length; i++) {
      selected.push(selectedCards[i]);
      newPara[i] = document.createElement("p");
      selected[i].removeEventListener("click", cardSelected, true);
    }

    if (totalCards == 9) {
      var isEasy = true;
    } else {
      var isEasy = false;
    }

    let isSet = isASet(selected);

    if (isSet) {
      called = true;
      remainingSeconds += 15;
      id("set-count").textContent = parseInt(id("set-count").textContent) + 1;

      for (let i = 0; i < selected.length; i++) {
        newPara[i].textContent = "SET!";
        selected[i].appendChild(newPara[i]);
  
        selected[i].classList.add("hide-imgs");
      }

      for (let i = 0; i < selected.length; i++) {
        selected[i].classList.remove("selected");
      }
      
      window.setTimeout(() => {
        for (let i = 0; i < selected.length; i++) {
          selected[i].classList.remove("hide-imgs");
          selected[i].removeChild(newPara[i]);
          selected[i].classList.add("replace");

          replaceCard();

          let newCard = generateUniqueCard(isEasy);

          if (newCard != selected[i]) {
            board.replaceChild(newCard, selected[i]);
          } else if (newCard == selected[i]) {
            board.removeChild(board.lastElementChild);
          }

          selected[i].classList.remove("replace");
        }
      }, 1000);
      
    } else {
      remainingSeconds -= 15;
      for (let i = 0; i < selected.length; i++) {
        newPara[i].textContent = "Not a Set :(";
        selected[i].appendChild(newPara[i]);

        selected[i].classList.add("hide-imgs");
      }

      for (let i = 0; i < selected.length; i++) {
        selected[i].classList.remove("selected");
      }

      window.setTimeout(() => {
        for (let i = 0; i < selected.length; i++) {
          selected[i].removeChild(newPara[i]);
          selected[i].classList.remove("hide-imgs");
          selected[i].addEventListener("click", cardSelected, true);
        }
      }, 1000);
    }
  }
}

function replaceCard() {
  let replace = qs(".replace").id;
  cardDupes.delete(replace);
}

function toggleCalled() {
  called = false;
}

function clearBoard() {
  let board = id("board");
  id("set-count").textContent = "0";

  while (board.firstChild) {
    board.removeChild(board.firstChild);
  }

  cardDupes.clear();
}

function isASet(selected) {
    let attributes = [];
    for (let i = 0; i < selected.length; i++) {
      attributes.push(selected[i].id.split("-"));
    }
    for (let i = 0; i < attributes[0].length; i++) {
      let allSame = attributes[0][i] === attributes[1][i] &&
                    attributes[1][i] === attributes[2][i];
      let allDiff = attributes[0][i] !== attributes[1][i] &&
                    attributes[1][i] !== attributes[2][i] &&
                    attributes[0][i] !== attributes[2][i];
      if (!(allDiff || allSame)) {
        return false;
      }
    }
    return true;
}

function startTimer() {
  timerId = window.setInterval(advanceTimer, 1000);

  let option1 = document.getElementById("60");
  let option2 = document.getElementById("180");
  let option3 = document.getElementById("300");

  if (option1.selected) {
    remainingSeconds = option1.value;
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;

    id("time").textContent = (minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0"));

  } else if (option2.selected) {
    remainingSeconds = option2.value;
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;

    id("time").textContent = (minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0"));

  } else if (option3.selected) {
    remainingSeconds = option3.value;
    let minutes = Math.floor(remainingSeconds / 60);
    let seconds = remainingSeconds % 60;

    id("time").textContent = (minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0"));
  }
}

function advanceTimer() {
  remainingSeconds--;

  if (remainingSeconds <= 0) {
    remainingSeconds = 0;
    id("time").textContent = "00:00";
    window.clearInterval(timerId);
    endGame();
  }

  let minutes = Math.floor(remainingSeconds / 60);
  let seconds = remainingSeconds % 60;
  id("time").textContent = (minutes.toString().padStart(2, "0") + ":" + seconds.toString().padStart(2, "0"));

  let backButton = id("back-btn");
  backButton.addEventListener("click", restartTimer);
}

function endGame() {
  let selected = [];
  let selectedCards = document.getElementsByClassName("selected");

  for (let i = 0; i < selectedCards.length; i++) {
    selected.push(selectedCards[i]);
  }

  id("refresh-btn").disabled = true;

  if (selectedCards.length > 0) {
    for (let i = 0; i <= selectedCards.length; i++) {
      selected[i].classList.remove("selected");
    }
  }

  let cards = document.getElementsByClassName("card");
  for (let i = 0; i < totalCards; i++) {
    cards[i].removeEventListener("click", cardSelected, true);
  }
}

function enableBtn () {
  id("refresh-btn").disabled = false;
}

function restartTimer() {
  window.clearInterval(timerId);
}

/////////////////////////////////////////////////////////////////////
// Helper functions
function id(id) {
    return document.getElementById(id);
}
  
function qs(selector) {
    return document.querySelector(selector);
}
  
function qsa(selector) {
    return document.querySelectorAll(selector);
}
})();
