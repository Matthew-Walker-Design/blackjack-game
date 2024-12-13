let deckId = "";
let playerHand = [];
let dealerHand = [];
const message = document.getElementById("message");

document.getElementById("hit-btn").addEventListener("click", async () => {
  const newCard = await drawCards(deckId, 1);
  playerHand.push(...newCard);
  displayHand(playerHand, "player");

  const playerScore = calculateScore(playerHand);

  if (playerScore > 21) {
    disableButtons();
    playerLostGame("Player busts!");
  }
});

document.getElementById("stand-btn").addEventListener("click", async () => {
  message.textContent = "Dealer's turn...";
  disableButtons();
  while (calculateScore(dealerHand) < 17) {
    const newCard = await drawCards(deckId, 1);
    dealerHand.push(...newCard);
    displayHand(dealerHand, "dealer");
  }

  displayHand(dealerHand, "dealer", true);

  const playerScore = calculateScore(playerHand);
  const dealerScore = calculateScore(dealerHand);

  if (dealerScore > 21) {
    playerWinGame("Dealer busts! Player wins!");
  } else if (playerScore > dealerScore) {
    playerWinGame("Player wins!");
  } else if (playerScore < dealerScore) {
    playerLostGame("Dealer wins!");
  } else {
    playerLostGame("It's a tie, and you still lose your money!");
  }
});

async function getShuffledDeck() {
  const response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  const data = await response.json();
  message.textContent = "Deck shuffled! Ready to play!";
  return data.deck_id;
}

function displayHand(hand, name, reveal) {
  const handElement = document.getElementById(`${name.toLowerCase()}-hand`);
  handElement.innerHTML = "";

  hand.forEach((card, index) => {
    const cardDiv = document.createElement("div");
    cardDiv.classList.add("card");

    if (name === "dealer" && index > 0 && dealerHand.length === 2 && !reveal) {
      cardDiv.style.backgroundImage =
        'url("https://via.placeholder.com/80x120/000000/FFFFFF?text=Hidden")';
    } else {
      cardDiv.style.backgroundImage = `url(${card.image})`;
    }

    cardDiv.style.backgroundSize = "cover";
    handElement.appendChild(cardDiv);
  });

  message.textContent = `${
    name === "dealer"
      ? "Dealer's first card is revealed!"
      : "Player's hand is ready!"
  }`;
}

async function drawCards(deckId, count = 1) {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=${count}`
  );
  const data = await response.json();
  return data.cards;
}

function calculateScore(hand) {
  let score = 0;
  let aces = 0;

  hand.forEach((card) => {
    const value = card.value;
    if (["KING", "QUEEN", "JACK"].includes(value)) {
      score += 10;
    } else if (value === "ACE") {
      aces += 1;
      score += 11;
    } else {
      score += parseInt(card.value);
    }
  });

  while (score > 21 && aces > 0) {
    score -= 10;
    aces -= 1;
  }

  return score;
}

function disableButtons() {
  document.getElementById("hit-btn").disabled = true;
  document.getElementById("stand-btn").disabled = true;
}

function playerLostGame(ctx) {
  document.body.classList.remove("win");
  document.body.classList.add("loss");
  document.getElementById("game").classList.add("loss");
  document.getElementById("game").classList.remove("win");
  message.textContent = ctx;
}

function playerWinGame(ctx) {
  document.body.classList.remove("loss");
  document.body.classList.add("win");
  document.getElementById("game").classList.add("win");
  document.getElementById("game").classList.remove("loss");
  message.textContent = ctx;
}

async function playGame() {
  deckId = await getShuffledDeck();

  playerHand = await drawCards(deckId, 2);
  dealerHand = await drawCards(deckId, 2);

  displayHand(playerHand, "player");
  displayHand(dealerHand, "dealer");
}

playGame();