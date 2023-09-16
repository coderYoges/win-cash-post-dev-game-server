function generateRandomCardList(systemCard, listLength) {
  let randomArray = [];
  const randomNoGenerator = () => {
    const randomNo = "card" + (Math.floor(Math.random() * 9) + 1);
    if (randomNo !== systemCard && !randomArray.includes(randomNo)) {
      randomArray.push(randomNo);
    }
    if (randomArray.length < listLength) randomNoGenerator();
  };
  randomNoGenerator();
  return randomArray;
}

function generateDragonTiger(winnerOption) {
  let dragonCard = "";
  let tigerCard = "";
  const randomSmallNo = "card" + (Math.floor(Math.random() * 4) + 1);
  const randomLargeNo = "card" + (Math.floor(Math.random() * 4) + 5);
  const randomNo = "card" + (Math.floor(Math.random() * 9) + 1);
  if (winnerOption === "TIGER") {
    tigerCard = randomLargeNo;
    dragonCard = randomSmallNo;
  } else if (winnerOption === "DRAGON") {
    tigerCard = randomSmallNo;
    dragonCard = randomLargeNo;
  } else {
    dragonCard = tigerCard = randomNo;
  }

  return {
    dragonCard,
    tigerCard,
  };
}

function generateLuckySevenCard(winnerOption) {
  if (winnerOption === "UP") {
    return "card" + (Math.floor(Math.random() * 5) + 8);
  } else if (winnerOption === "DOWN") {
    return "card" + (Math.floor(Math.random() * 5) + 1);
  } else {
    return "card7";
  }
}

module.exports = {
  randomCardList: generateRandomCardList,
  dragonTigerCards: generateDragonTiger,
  luckySevenCard: generateLuckySevenCard
};
