const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: " CardsMatched",
  GameFinished: "GameFinished",
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];

const view = {
  // 卡片正面或反面
  getCardElement(index) {
    return `
      <div class="card back" data-index="${index}">
      </div>
      `;
  },
  // 卡片內容：數字、花色
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1);
    const symbol = Symbols[Math.floor(index / 13)];
    return `
        <p>${number}</p>
        <img
          src="${symbol}"
        />
        <p>${number}</p>
      `;
  },
  // 將1與11~13轉換為撲克牌上的英文字
  transformNumber(number) {
    switch (number) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return number;
    }
  },
  // 渲染頁面
  displayCards(indexes) {
    const rootElement = document.querySelector("#cards");
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join("");
  },
  flipCards(...cards) {
    //如果點擊時，卡片是背面。
    cards.map((card) => {
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
        return;
      }
      // 如果點擊時，卡片是正面。
      card.classList.add("back");
      card.innerHTML = null;
    });
  },
  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (event) => event.target.classList.remove("wrong"),
        { once: true }
      );
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
      <p >Complete!<p>
      <p>Score: ${model.score}<p>
      <p>You've tried: ${model.triedTimes} times<p>
      <Button id="playAgain">Play Again</Button>
    `;
    const header = document.querySelector("#header");
    header.before(div);
    const playAgainButton = document.querySelector("#playAgain");
    playAgainButton.addEventListener("click", (event) => {
      location.reload();
    });
  },
};

const utility = {
  // 使用 Fisher-Yates Shuffle 洗牌演算法
  getRandomNumberArray(count) {
    number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};

const model = {
  revealedCards: [],
  isRevealedCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
};

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52));
  },
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.renderTriedTimes(++model.triedTimes);
        view.flipCards(card);
        model.revealedCards.push(card);
        this.currentState = GAME_STATE.SecondCardAwaits;
        break;
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card);
        model.revealedCards.push(card);
        // 判斷是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.CardsMatched;
          view.pairCards(...model.revealedCards);
          model.revealedCards = [];
          this.currentState = GAME_STATE.FirstCardAwaits;
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed;
          view.appendWrongAnimation(...model.revealedCards);
          setTimeout(this.resetCards, 1000);
        }
    }
  },
  resetCards() {
    view.flipCards(...model.revealedCards);
    model.revealedCards = [];
    controller.currentState = GAME_STATE.FirstCardAwaits;
  },
};

controller.generateCards();

document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) => {
    controller.dispatchCardAction(card);
  });
});
