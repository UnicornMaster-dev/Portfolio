// Casino Game Manager
class CasinoGame {
    constructor() {
        this.chips = this.loadChips();
        this.currentGame = null;
        this.upgrades = this.loadUpgrades();
        this.updateChipDisplay();
    }

    loadChips() {
        const saved = localStorage.getItem('casinoChips');
        return saved ? parseInt(saved) : 1000;
    }

    loadUpgrades() {
        const saved = localStorage.getItem('casinoUpgrades');
        return saved ? JSON.parse(saved) : {
            cardCounter: false,
            dealerTell: false,
            luckyCharm: false
        };
    }

    saveChips() {
        localStorage.setItem('casinoChips', this.chips.toString());
        this.updateChipDisplay();
    }

    saveUpgrades() {
        localStorage.setItem('casinoUpgrades', JSON.stringify(this.upgrades));
    }

    updateChipDisplay() {
        const display = document.getElementById('chipAmount');
        if (display) {
            display.textContent = this.chips.toLocaleString();
        }
    }

    addChips(amount) {
        this.chips += amount;
        this.saveChips();
        this.showNotification(`Won ${amount} chips!`, 'success');
    }

    removeChips(amount) {
        this.chips -= amount;
        this.saveChips();
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    showGame(gameId) {
        document.getElementById('gameSelection').style.display = 'none';
        const games = document.querySelectorAll('.game-container');
        games.forEach(game => game.classList.remove('active'));

        const selectedGame = document.getElementById(gameId);
        if (selectedGame) {
            selectedGame.classList.add('active');
        }

        // Hide shop when showing game
        const shop = document.getElementById('shopContainer');
        if (shop) shop.classList.remove('active');
    }

    showGameSelection() {
        document.getElementById('gameSelection').style.display = 'block';
        const games = document.querySelectorAll('.game-container');
        games.forEach(game => game.classList.remove('active'));

        // Hide shop
        const shop = document.getElementById('shopContainer');
        if (shop) shop.classList.remove('active');

        // Reset games
        if (this.currentGame) {
            this.currentGame.reset();
        }
    }

    showShop() {
        document.getElementById('gameSelection').style.display = 'none';
        const games = document.querySelectorAll('.game-container');
        games.forEach(game => game.classList.remove('active'));

        const shop = document.getElementById('shopContainer');
        if (shop) {
            shop.classList.add('active');
            this.updateShopDisplay();
        }
    }

    updateShopDisplay() {
        // Update button states based on owned upgrades
        const cardCounterBtn = document.getElementById('buyCardCounter');
        const dealerTellBtn = document.getElementById('buyDealerTell');
        const luckyCharmBtn = document.getElementById('buyLuckyCharm');

        if (cardCounterBtn) {
            cardCounterBtn.disabled = this.upgrades.cardCounter;
            cardCounterBtn.textContent = this.upgrades.cardCounter ? 'Owned' : 'Buy for 5000 chips';
        }
        if (dealerTellBtn) {
            dealerTellBtn.disabled = this.upgrades.dealerTell;
            dealerTellBtn.textContent = this.upgrades.dealerTell ? 'Owned' : 'Buy for 3000 chips';
        }
        if (luckyCharmBtn) {
            luckyCharmBtn.disabled = this.upgrades.luckyCharm;
            luckyCharmBtn.textContent = this.upgrades.luckyCharm ? 'Owned' : 'Buy for 2000 chips';
        }
    }

    buyUpgrade(upgradeName, cost) {
        if (this.upgrades[upgradeName]) {
            this.showNotification('You already own this upgrade!', 'error');
            return;
        }

        if (this.chips < cost) {
            this.showNotification('Insufficient chips!', 'error');
            return;
        }

        this.chips -= cost;
        this.upgrades[upgradeName] = true;
        this.saveChips();
        this.saveUpgrades();
        this.updateShopDisplay();
        this.showNotification('Upgrade purchased!', 'success');
    }
}

// Blackjack Game
class BlackjackGame {
    constructor(casino) {
        this.casino = casino;
        this.deck = [];
        this.playerHand = [];
        this.dealerHand = [];
        this.bet = 0;
        this.gameActive = false;
        this.dealerRevealed = false;
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];

        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({ value, suit, numValue: this.getCardValue(value) });
            }
        }

        // Shuffle deck
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j] ] = [this.deck[j], this.deck[i]];
        }
    }

    getCardValue(value) {
        if (value === 'A') return 11;
        if (['J', 'Q', 'K'].includes(value)) return 10;
        return parseInt(value);
    }

    calculateHandValue(hand) {
        let value = 0;
        let aces = 0;

        for (let card of hand) {
            value += card.numValue;
            if (card.value === 'A') aces++;
        }

        while (value > 21 && aces > 0) {
            value -= 10;
            aces--;
        }

        return value;
    }

    drawCard() {
        return this.deck.pop();
    }

    placeBet() {
        const betInput = document.getElementById('blackjackBet');
        const betAmount = parseInt(betInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            this.casino.showNotification('Please enter a valid bet amount', 'error');
            return;
        }

        if (betAmount > this.casino.chips) {
            this.casino.showNotification('Insufficient chips!', 'error');
            return;
        }

        this.bet = betAmount;
        this.casino.removeChips(betAmount);
        this.startGame();
    }

    startGame() {
        this.createDeck();
        this.playerHand = [this.drawCard(), this.drawCard()];
        this.dealerHand = [this.drawCard(), this.drawCard()];
        this.gameActive = true;
        this.dealerRevealed = false;

        this.updateDisplay();
        this.updateButtons();

        // Check for natural blackjack
        if (this.calculateHandValue(this.playerHand) === 21) {
            setTimeout(() => this.stand(), 1000);
        }
    }

    hit() {
        if (!this.gameActive) return;

        this.playerHand.push(this.drawCard());
        this.updateDisplay();

        const playerValue = this.calculateHandValue(this.playerHand);
        if (playerValue > 21) {
            this.endGame('bust');
        } else if (playerValue === 21) {
            this.stand();
        }
    }

    stand() {
        if (!this.gameActive) return;

        this.dealerRevealed = true;
        this.playDealer();
    }

    playDealer() {
        const dealerPlay = () => {
            const dealerValue = this.calculateHandValue(this.dealerHand);

            if (dealerValue < 17) {
                this.dealerHand.push(this.drawCard());
                this.updateDisplay();
                setTimeout(dealerPlay, 1000);
            } else {
                this.determineWinner();
            }
        };

        this.updateDisplay();
        setTimeout(dealerPlay, 1000);
    }

    determineWinner() {
        const playerValue = this.calculateHandValue(this.playerHand);
        const dealerValue = this.calculateHandValue(this.dealerHand);

        let result;
        if (dealerValue > 21) {
            result = 'win';
        } else if (playerValue > dealerValue) {
            result = 'win';
        } else if (playerValue < dealerValue) {
            result = 'lose';
        } else {
            result = 'push';
        }

        this.endGame(result);
    }

    endGame(result) {
        this.gameActive = false;
        this.dealerRevealed = true;
        this.updateDisplay();

        const messageEl = document.getElementById('blackjackMessage');
        let winAmount = 0;

        if (result === 'win') {
            const playerValue = this.calculateHandValue(this.playerHand);
            if (playerValue === 21 && this.playerHand.length === 2) {
                winAmount = Math.floor(this.bet * 2.5);
                messageEl.textContent = '🎉 BLACKJACK! You win ' + winAmount + ' chips!';
            } else {
                winAmount = this.bet * 2;
                messageEl.textContent = '🎉 You win ' + winAmount + ' chips!';
            }
            this.casino.addChips(winAmount);
        } else if (result === 'lose') {
            messageEl.textContent = '💔 Dealer wins!';
        } else if (result === 'bust') {
            messageEl.textContent = '💥 Bust! Dealer wins!';
        } else if (result === 'push') {
            winAmount = this.bet;
            messageEl.textContent = '🤝 Push! Bet returned.';
            this.casino.addChips(winAmount);
        }

        this.updateButtons();
    }

    updateDisplay() {
        // Update dealer cards
        const dealerCardsEl = document.getElementById('dealerCards');
        dealerCardsEl.innerHTML = '';

        this.dealerHand.forEach((card, index) => {
            const cardEl = this.createCardElement(card, index === 1 && !this.dealerRevealed);
            dealerCardsEl.appendChild(cardEl);
        });

        // Update dealer value
        const dealerValueEl = document.getElementById('dealerValue');
        if (this.dealerRevealed) {
            dealerValueEl.textContent = 'Value: ' + this.calculateHandValue(this.dealerHand);
        } else {
            dealerValueEl.textContent = 'Value: ?';
        }

        // Update player cards
        const playerCardsEl = document.getElementById('playerCards');
        playerCardsEl.innerHTML = '';

        this.playerHand.forEach(card => {
            const cardEl = this.createCardElement(card, false);
            playerCardsEl.appendChild(cardEl);
        });

        // Update player value
        const playerValueEl = document.getElementById('playerValue');
        playerValueEl.textContent = 'Value: ' + this.calculateHandValue(this.playerHand);
    }

    createCardElement(card, faceDown) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';

        if (faceDown) {
            cardEl.classList.add('back');
        } else {
            const color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
            cardEl.classList.add(color);

            const valueEl = document.createElement('div');
            valueEl.className = 'card-value';
            valueEl.textContent = card.value;

            const suitEl = document.createElement('div');
            suitEl.className = 'card-suit';
            suitEl.textContent = card.suit;

            cardEl.appendChild(valueEl);
            cardEl.appendChild(suitEl);
        }

        return cardEl;
    }

    updateButtons() {
        const dealBtn = document.getElementById('dealBtn');
        const hitBtn = document.getElementById('hitBtn');
        const standBtn = document.getElementById('standBtn');
        const betInput = document.getElementById('blackjackBet');

        if (this.gameActive) {
            dealBtn.disabled = true;
            hitBtn.disabled = false;
            standBtn.disabled = false;
            betInput.disabled = true;
        } else {
            dealBtn.disabled = false;
            hitBtn.disabled = true;
            standBtn.disabled = true;
            betInput.disabled = false;
        }
    }

    reset() {
        this.playerHand = [];
        this.dealerHand = [];
        this.gameActive = false;
        this.dealerRevealed = false;
        this.bet = 0;

        const messageEl = document.getElementById('blackjackMessage');
        if (messageEl) messageEl.textContent = '';

        const dealerCardsEl = document.getElementById('dealerCards');
        const playerCardsEl = document.getElementById('playerCards');
        if (dealerCardsEl) dealerCardsEl.innerHTML = '';
        if (playerCardsEl) playerCardsEl.innerHTML = '';

        const dealerValueEl = document.getElementById('dealerValue');
        const playerValueEl = document.getElementById('playerValue');
        if (dealerValueEl) dealerValueEl.textContent = '';
        if (playerValueEl) playerValueEl.textContent = '';

        this.updateButtons();
    }
}

// Roulette Game
class RouletteGame {
    constructor(casino) {
        this.casino = casino;
        this.selectedBets = [];
        this.bet = 0;
        this.spinning = false;

        this.redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
        this.blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
    }

    selectBet(betType, value) {
        if (this.spinning) return;

        const betIndex = this.selectedBets.findIndex(b => b.type === betType && b.value === value);

        if (betIndex > -1) {
            this.selectedBets.splice(betIndex, 1);
        } else {
            this.selectedBets.push({ type: betType, value: value });
        }

        this.updateBetDisplay();
    }

    updateBetDisplay() {
        // Update selected bet options
        document.querySelectorAll('.bet-option, .number-bet').forEach(el => {
            el.classList.remove('selected');
        });

        this.selectedBets.forEach(bet => {
            const selector = `[data-bet-type="${bet.type}"][data-bet-value="${bet.value}"]`;
            const element = document.querySelector(selector);
            if (element) {
                element.classList.add('selected');
            }
        });
    }

    spin() {
        if (this.spinning) return;
        if (this.selectedBets.length === 0) {
            this.casino.showNotification('Please select at least one bet', 'error');
            return;
        }

        const betInput = document.getElementById('rouletteBet');
        const betAmount = parseInt(betInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            this.casino.showNotification('Please enter a valid bet amount', 'error');
            return;
        }

        const totalBet = betAmount * this.selectedBets.length;

        if (totalBet > this.casino.chips) {
            this.casino.showNotification('Insufficient chips!', 'error');
            return;
        }

        this.bet = betAmount;
        this.casino.removeChips(totalBet);
        this.spinning = true;

        const wheel = document.getElementById('rouletteWheel');
        wheel.classList.add('spinning');

        document.getElementById('rouletteResult').textContent = 'Spinning...';
        document.getElementById('spinBtn').disabled = true;

        setTimeout(() => {
            this.determineResult();
        }, 3000);
    }

    determineResult() {
        const result = Math.floor(Math.random() * 37); // 0-36

        const wheel = document.getElementById('rouletteWheel');
        wheel.classList.remove('spinning');

        let color = 'green';
        if (this.redNumbers.includes(result)) color = 'red';
        else if (this.blackNumbers.includes(result)) color = 'black';

        document.getElementById('rouletteResult').textContent = `Result: ${result} (${color})`;

        let totalWin = 0;

        this.selectedBets.forEach(bet => {
            const win = this.checkWin(bet, result);
            if (win > 0) {
                totalWin += win;
            }
        });

        if (totalWin > 0) {
            this.casino.addChips(totalWin);
            this.casino.showNotification(`Won ${totalWin} chips!`, 'success');
        } else {
            this.casino.showNotification('Better luck next time!', 'error');
        }

        this.spinning = false;
        this.selectedBets = [];
        this.updateBetDisplay();
        document.getElementById('spinBtn').disabled = false;
    }

    checkWin(bet, result) {
        switch (bet.type) {
            case 'number':
                return result === bet.value ? this.bet * 36 : 0;
            case 'color':
                if (bet.value === 'red' && this.redNumbers.includes(result)) return this.bet * 2;
                if (bet.value === 'black' && this.blackNumbers.includes(result)) return this.bet * 2;
                if (bet.value === 'green' && result === 0) return this.bet * 36;
                return 0;
            case 'evenodd':
                if (result === 0) return 0;
                if (bet.value === 'even' && result % 2 === 0) return this.bet * 2;
                if (bet.value === 'odd' && result % 2 === 1) return this.bet * 2;
                return 0;
            case 'range':
                if (result === 0) return 0;
                if (bet.value === 'low' && result >= 1 && result <= 18) return this.bet * 2;
                if (bet.value === 'high' && result >= 19 && result <= 36) return this.bet * 2;
                return 0;
            default:
                return 0;
        }
    }

    reset() {
        this.selectedBets = [];
        this.spinning = false;
        this.updateBetDisplay();

        const resultEl = document.getElementById('rouletteResult');
        if (resultEl) resultEl.textContent = 'Place your bets!';
    }
}

// Slots Game
class SlotsGame {
    constructor(casino) {
        this.casino = casino;
        this.symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣', '⭐'];
        this.reels = [0, 0, 0];
        this.spinning = false;
    }

    spin() {
        if (this.spinning) return;

        const betInput = document.getElementById('slotsBet');
        const betAmount = parseInt(betInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            this.casino.showNotification('Please enter a valid bet amount', 'error');
            return;
        }

        if (betAmount > this.casino.chips) {
            this.casino.showNotification('Insufficient chips!', 'error');
            return;
        }

        this.casino.removeChips(betAmount);
        this.spinning = true;

        document.getElementById('slotsSpinBtn').disabled = true;
        document.getElementById('slotsMessage').textContent = 'Spinning...';

        const reelElements = document.querySelectorAll('.slot-reel');
        reelElements.forEach(reel => reel.classList.add('spinning'));

        // Spin animation
        let spinCount = 0;
        const spinInterval = setInterval(() => {
            this.reels = this.reels.map(() => Math.floor(Math.random() * this.symbols.length));
            this.updateDisplay();
            spinCount++;

            if (spinCount > 20) {
                clearInterval(spinInterval);
                this.determineResult(betAmount);
            }
        }, 100);
    }

    determineResult(betAmount) {
        // Final spin
        this.reels = this.reels.map(() => Math.floor(Math.random() * this.symbols.length));
        this.updateDisplay();

        const reelElements = document.querySelectorAll('.slot-reel');
        reelElements.forEach(reel => reel.classList.remove('spinning'));

        const symbol1 = this.symbols[this.reels[0]];
        const symbol2 = this.symbols[this.reels[1]];
        const symbol3 = this.symbols[this.reels[2]];

        let winMultiplier = 0;
        let message = '';

        // Check for wins
        if (symbol1 === symbol2 && symbol2 === symbol3) {
            // Three of a kind
            if (symbol1 === '7️⃣') {
                winMultiplier = 100;
                message = '🎰 JACKPOT! Triple 7s! ';
            } else if (symbol1 === '💎') {
                winMultiplier = 50;
                message = '💎 Triple Diamonds! ';
            } else if (symbol1 === '⭐') {
                winMultiplier = 25;
                message = '⭐ Triple Stars! ';
            } else {
                winMultiplier = 10;
                message = '🎉 Three of a kind! ';
            }
        } else if (symbol1 === symbol2 || symbol2 === symbol3 || symbol1 === symbol3) {
            // Two of a kind
            winMultiplier = 2;
            message = '😊 Two of a kind! ';
        } else {
            message = '😔 No match. Try again!';
        }

        if (winMultiplier > 0) {
            const winAmount = betAmount * winMultiplier;
            this.casino.addChips(winAmount);
            message += `Won ${winAmount} chips!`;
            this.casino.showNotification(message, 'success');
        }

        document.getElementById('slotsMessage').textContent = message;
        this.spinning = false;
        document.getElementById('slotsSpinBtn').disabled = false;
    }

    updateDisplay() {
        const reelElements = document.querySelectorAll('.slot-reel');
        reelElements.forEach((reel, index) => {
            reel.textContent = this.symbols[this.reels[index]];
        });
    }

    reset() {
        this.reels = [0, 0, 0];
        this.spinning = false;
        this.updateDisplay();

        const messageEl = document.getElementById('slotsMessage');
        if (messageEl) messageEl.textContent = 'Good luck!';
    }
}

// Poker Game (Texas Hold'em vs AI)
class PokerGame {
    constructor(casino) {
        this.casino = casino;
        this.deck = [];
        this.playerHand = [];
        this.aiHand = [];
        this.communityCards = [];
        this.pot = 0;
        this.playerBet = 0;
        this.aiBet = 0;
        this.gameActive = false;
        this.currentBet = 0;
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        this.deck = [];

        for (let suit of suits) {
            for (let i = 0; i < values.length; i++) {
                this.deck.push({ value: values[i], suit, rank: i + 2 });
            }
        }

        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j] ] = [this.deck[j], this.deck[i]];
        }
    }

    startGame() {
        const betInput = document.getElementById('pokerBet');
        const betAmount = parseInt(betInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            this.casino.showNotification('Please enter a valid bet amount', 'error');
            return;
        }

        if (betAmount * 2 > this.casino.chips) {
            this.casino.showNotification('Insufficient chips for ante!', 'error');
            return;
        }

        this.currentBet = betAmount;
        this.pot = betAmount * 2;
        this.casino.removeChips(betAmount * 2); // Player and AI ante

        this.createDeck();
        this.playerHand = [this.deck.pop(), this.deck.pop()];
        this.aiHand = [this.deck.pop(), this.deck.pop()];
        this.communityCards = [];
        this.gameActive = true;

        this.updateDisplay();
        this.updateButtons();

        document.getElementById('pokerMessage').textContent = 'Pre-flop: Check or Bet?';
    }

    dealFlop() {
        if (this.communityCards.length === 0) {
            this.communityCards.push(this.deck.pop(), this.deck.pop(), this.deck.pop());
            this.updateDisplay();
            document.getElementById('pokerMessage').textContent = 'Flop dealt!';
            this.aiAction();
        }
    }

    dealTurn() {
        if (this.communityCards.length === 3) {
            this.communityCards.push(this.deck.pop());
            this.updateDisplay();
            document.getElementById('pokerMessage').textContent = 'Turn dealt!';
            this.aiAction();
        }
    }

    dealRiver() {
        if (this.communityCards.length === 4) {
            this.communityCards.push(this.deck.pop());
            this.updateDisplay();
            document.getElementById('pokerMessage').textContent = 'River dealt!';
            this.aiAction();
        }
    }

    playerCheck() {
        if (!this.gameActive) return;

        if (this.communityCards.length === 0) {
            this.dealFlop();
        } else if (this.communityCards.length === 3) {
            this.dealTurn();
        } else if (this.communityCards.length === 4) {
            this.dealRiver();
        } else {
            this.showdown();
        }
    }

    playerBetAction() {
        if (!this.gameActive) return;

        const betAmount = this.currentBet;

        if (betAmount > this.casino.chips) {
            this.casino.showNotification('Insufficient chips!', 'error');
            return;
        }

        this.casino.removeChips(betAmount);
        this.pot += betAmount;
        this.updateDisplay();

        // AI responds
        setTimeout(() => {
            const aiDecision = Math.random();
            if (aiDecision > 0.3) { // AI calls 70% of the time
                this.pot += betAmount;
                this.casino.showNotification('AI calls your bet', 'success');
                this.playerCheck();
            } else {
                this.casino.showNotification('AI folds. You win!', 'success');
                this.casino.addChips(this.pot);
                this.endGame();
            }
        }, 1000);
    }

    playerFold() {
        if (!this.gameActive) return;

        this.casino.showNotification('You folded. AI wins!', 'error');
        this.endGame();
    }

    aiAction() {
        // Simple AI logic
        const aiStrength = this.evaluateHand(this.aiHand, this.communityCards).rank;

        setTimeout(() => {
            if (aiStrength > 5 || Math.random() > 0.5) {
                this.pot += this.currentBet;
                this.casino.showNotification('AI bets ' + this.currentBet, 'success');
            } else {
                this.casino.showNotification('AI checks', 'success');
            }
            this.updateDisplay();
        }, 1000);
    }

    showdown() {
        this.gameActive = false;

        const playerResult = this.evaluateHand(this.playerHand, this.communityCards);
        const aiResult = this.evaluateHand(this.aiHand, this.communityCards);

        document.getElementById('playerHandRank').textContent = playerResult.name;
        document.getElementById('aiHandRank').textContent = aiResult.name;

        // Show AI cards
        const aiCardsEl = document.getElementById('aiCards');
        aiCardsEl.innerHTML = '';
        this.aiHand.forEach(card => {
            const cardEl = this.createCardElement(card);
            aiCardsEl.appendChild(cardEl);
        });

        let message = '';
        if (playerResult.rank > aiResult.rank) {
            message = `🎉 You win with ${playerResult.name}!`;
            this.casino.addChips(this.pot);
        } else if (aiResult.rank > playerResult.rank) {
            message = `💔 AI wins with ${aiResult.name}!`;
        } else {
            message = `🤝 Tie! ${playerResult.name}`;
            this.casino.addChips(Math.floor(this.pot / 2));
        }

        document.getElementById('pokerMessage').textContent = message;
        this.updateButtons();
    }

    evaluateHand(hand, community) {
        const allCards = [...hand, ...community];

        // Simple hand evaluation (simplified for this demo)
        const values = allCards.map(c => c.rank);
        const suits = allCards.map(c => c.suit);

        // Count occurrences
        const valueCounts = {};
        values.forEach(v => valueCounts[v] = (valueCounts[v] || 0) + 1);
        const counts = Object.values(valueCounts).sort((a, b) => b - a);

        // Check flush
        const suitCounts = {};
        suits.forEach(s => suitCounts[s] = (suitCounts[s] || 0) + 1);
        const hasFlush = Object.values(suitCounts).some(c => c >= 5);

        // Determine hand
        if (counts[0] === 4) return { rank: 7, name: 'Four of a Kind' };
        if (counts[0] === 3 && counts[1] === 2) return { rank: 6, name: 'Full House' };
        if (hasFlush) return { rank: 5, name: 'Flush' };
        if (counts[0] === 3) return { rank: 3, name: 'Three of a Kind' };
        if (counts[0] === 2 && counts[1] === 2) return { rank: 2, name: 'Two Pair' };
        if (counts[0] === 2) return { rank: 1, name: 'Pair' };

        return { rank: 0, name: 'High Card' };
    }

    createCardElement(card) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';

        const color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
        cardEl.classList.add(color);

        const valueEl = document.createElement('div');
        valueEl.className = 'card-value';
        valueEl.textContent = card.value;

        const suitEl = document.createElement('div');
        suitEl.className = 'card-suit';
        suitEl.textContent = card.suit;

        cardEl.appendChild(valueEl);
        cardEl.appendChild(suitEl);

        return cardEl;
    }

    updateDisplay() {
        // Player cards
        const playerCardsEl = document.getElementById('playerCards');
        if (playerCardsEl) {
            playerCardsEl.innerHTML = '';
            this.playerHand.forEach(card => {
                const cardEl = this.createCardElement(card);
                playerCardsEl.appendChild(cardEl);
            });
        }

        // AI cards (hidden until showdown)
        const aiCardsEl = document.getElementById('aiCards');
        if (aiCardsEl && this.gameActive) {
            aiCardsEl.innerHTML = '';
            for (let i = 0; i < 2; i++) {
                const cardEl = document.createElement('div');
                cardEl.className = 'card back';
                aiCardsEl.appendChild(cardEl);
            }
        }

        // Community cards
        const communityCardsEl = document.getElementById('communityCards');
        if (communityCardsEl) {
            communityCardsEl.innerHTML = '';
            this.communityCards.forEach(card => {
                const cardEl = this.createCardElement(card);
                communityCardsEl.appendChild(cardEl);
            });
        }

        // Pot
        const potEl = document.getElementById('potAmount');
        if (potEl) {
            potEl.textContent = `Pot: ${this.pot} chips`;
        }
    }

    updateButtons() {
        const dealBtn = document.getElementById('pokerDealBtn');
        const checkBtn = document.getElementById('pokerCheckBtn');
        const betBtn = document.getElementById('pokerBetBtn');
        const foldBtn = document.getElementById('pokerFoldBtn');

        if (this.gameActive) {
            dealBtn.disabled = true;
            checkBtn.disabled = false;
            betBtn.disabled = false;
            foldBtn.disabled = false;
        } else {
            dealBtn.disabled = false;
            checkBtn.disabled = true;
            betBtn.disabled = true;
            foldBtn.disabled = true;
        }
    }

    reset() {
        this.playerHand = [];
        this.aiHand = [];
        this.communityCards = [];
        this.pot = 0;
        this.gameActive = false;

        const playerCardsEl = document.getElementById('playerCards');
        const aiCardsEl = document.getElementById('aiCards');
        const communityCardsEl = document.getElementById('communityCards');

        if (playerCardsEl) playerCardsEl.innerHTML = '';
        if (aiCardsEl) aiCardsEl.innerHTML = '';
        if (communityCardsEl) communityCardsEl.innerHTML = '';

        const messageEl = document.getElementById('pokerMessage');
        if (messageEl) messageEl.textContent = '';

        const playerRankEl = document.getElementById('playerHandRank');
        const aiRankEl = document.getElementById('aiHandRank');
        if (playerRankEl) playerRankEl.textContent = '';
        if (aiRankEl) aiRankEl.textContent = '';

        this.updateButtons();
    }
}

// Go Fish Game with Gambling
class GoFishGame {
    constructor(casino) {
        this.casino = casino;
        this.deck = [];
        this.playerHand = [];
        this.aiPlayers = [
            { name: '🤖 AI Player 1', hand: [], books: [] },
            { name: '🤖 AI Player 2', hand: [], books: [] },
            { name: '🤖 AI Player 3', hand: [], books: [] }
        ];
        this.playerBooks = [];
        this.pot = 0;
        this.gameActive = false;
        this.currentTurn = 0; // 0 = player, 1-3 = AI
        this.anteBet = 0;
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];

        for (let suit of suits) {
            for (let value of values) {
                this.deck.push({ value, suit });
            }
        }

        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j] ] = [this.deck[j], this.deck[i]];
        }
    }

    startGame() {
        const betInput = document.getElementById('goFishBet');
        const betAmount = parseInt(betInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            this.casino.showNotification('Please enter a valid ante amount', 'error');
            return;
        }

        const totalAnte = betAmount * 4; // All 4 players ante
        if (totalAnte > this.casino.chips) {
            this.casino.showNotification('Insufficient chips!', 'error');
            return;
        }

        this.anteBet = betAmount;
        this.pot = totalAnte;
        this.casino.removeChips(totalAnte);

        this.createDeck();
        this.playerHand = [];
        this.playerBooks = [];
        this.aiPlayers.forEach(ai => {
            ai.hand = [];
            ai.books = [];
        });

        // Deal 7 cards to each player
        for (let i = 0; i < 7; i++) {
            this.playerHand.push(this.deck.pop());
            this.aiPlayers.forEach(ai => ai.hand.push(this.deck.pop()));
        }

        this.checkForBooks(this.playerHand, this.playerBooks);
        this.aiPlayers.forEach(ai => this.checkForBooks(ai.hand, ai.books));

        this.currentTurn = 0;
        this.gameActive = true;

        this.updateDisplay();
        this.updateButtons();
        this.updateMessage('Your turn! Click a card to ask an AI for it.');
    }

    checkForBooks(hand, books) {
        const valueCounts = {};
        hand.forEach(card => {
            valueCounts[card.value] = (valueCounts[card.value] || 0) + 1;
        });

        for (let value in valueCounts) {
            if (valueCounts[value] === 4) {
                books.push(value);
                // Remove all 4 cards from hand
                for (let i = hand.length - 1; i >= 0; i--) {
                    if (hand[i].value === value) {
                        hand.splice(i, 1);
                    }
                }
            }
        }
    }

    askForCard(value) {
        if (!this.gameActive || this.currentTurn !== 0) return;

        // Check if player has this card
        if (!this.playerHand.some(c => c.value === value)) {
            this.casino.showNotification('You must have the card to ask for it!', 'error');
            return;
        }

        // Show selection for which AI to ask
        this.selectedCardValue = value;
        this.showPlayerSelection();
    }

    showPlayerSelection() {
        // Highlight available AI players to ask
        this.aiPlayers.forEach((ai, index) => {
            const aiNameEl = document.getElementById(`ai${index + 1}Name`);
            if (aiNameEl && ai.hand.length > 0) {
                aiNameEl.style.backgroundColor = 'rgba(212, 175, 55, 0.3)';
                aiNameEl.style.cursor = 'pointer';
                aiNameEl.onclick = () => this.askSpecificPlayer(index);
            }
        });
        this.updateMessage(`You selected ${this.selectedCardValue}. Now click an AI player to ask!`);
    }

    askSpecificPlayer(aiIndex) {
        const ai = this.aiPlayers[aiIndex];

        // Remove highlights and click handlers
        this.aiPlayers.forEach((_, index) => {
            const aiNameEl = document.getElementById(`ai${index + 1}Name`);
            if (aiNameEl) {
                aiNameEl.style.backgroundColor = '';
                aiNameEl.style.cursor = 'default';
                aiNameEl.onclick = null;
            }
        });

        const value = this.selectedCardValue;
        const matchingCards = ai.hand.filter(c => c.value === value);

        if (matchingCards.length > 0) {
            // Transfer cards
            matchingCards.forEach(card => {
                const index = ai.hand.indexOf(card);
                ai.hand.splice(index, 1);
                this.playerHand.push(card);
            });
            this.updateMessage(`Got ${matchingCards.length} ${value}(s) from ${ai.name}!`);
            this.checkForBooks(this.playerHand, this.playerBooks);
            this.updateDisplay();
            
            // Check if game over
            if (this.isGameOver()) {
                this.endGame();
                return;
            }
            
            // Player gets another turn
            setTimeout(() => {
                this.updateMessage('Your turn again! Click a card to ask for it.');
            }, 2000);
        } else {
            this.updateMessage(`Go Fish! ${ai.name} doesn't have ${value}.`);
            // Draw a card
            if (this.deck.length > 0) {
                this.playerHand.push(this.deck.pop());
                this.checkForBooks(this.playerHand, this.playerBooks);
            }
            this.updateDisplay();

            // Next player's turn
            setTimeout(() => {
                this.nextTurn();
            }, 2000);
        }
    }

    aiTurn() {
        const aiIndex = this.currentTurn - 1;
        const ai = this.aiPlayers[aiIndex];

        if (ai.hand.length === 0) {
            this.nextTurn();
            return;
        }

        // AI picks a random card from their hand to ask for
        const randomCard = ai.hand[Math.floor(Math.random() * ai.hand.length)];
        const value = randomCard.value;

        // Get list of players with cards (not dead players)
        const availableTargets = [];
        if (this.playerHand.length > 0) availableTargets.push(0);
        this.aiPlayers.forEach((targetAI, idx) => {
            if (idx !== aiIndex && targetAI.hand.length > 0) {
                availableTargets.push(idx + 1);
            }
        });

        if (availableTargets.length === 0) {
            this.nextTurn();
            return;
        }

        // Choose random available target
        const targetIndex = availableTargets[Math.floor(Math.random() * availableTargets.length)];
        let targetHand, targetName;

        if (targetIndex === 0) {
            targetHand = this.playerHand;
            targetName = 'You';
        } else {
            const targetAI = this.aiPlayers[targetIndex - 1];
            targetHand = targetAI.hand;
            targetName = targetAI.name;
        }

        const matchingCards = targetHand.filter(c => c.value === value);

        if (matchingCards.length > 0) {
            matchingCards.forEach(card => {
                const index = targetHand.indexOf(card);
                targetHand.splice(index, 1);
                ai.hand.push(card);
            });
            this.updateMessage(`${ai.name} got ${matchingCards.length} ${value}(s) from ${targetName}!`);
            this.checkForBooks(ai.hand, ai.books);
            this.updateDisplay();

            if (this.isGameOver()) {
                this.endGame();
                return;
            }

            // AI gets another turn
            setTimeout(() => this.aiTurn(), 2000);
        } else {
            this.updateMessage(`${ai.name} asked ${targetName} for ${value}. Go Fish!`);
            if (this.deck.length > 0) {
                ai.hand.push(this.deck.pop());
                this.checkForBooks(ai.hand, ai.books);
            }
            this.updateDisplay();

            setTimeout(() => this.nextTurn(), 2000);
        }
    }

    nextTurn() {
        this.currentTurn = (this.currentTurn + 1) % 4;

        if (this.currentTurn === 0) {
            if (this.playerHand.length === 0 && this.deck.length > 0) {
                this.playerHand.push(this.deck.pop());
            }
            this.updateMessage('Your turn! Click a card to ask for it.');
            this.updateDisplay();
        } else {
            const ai = this.aiPlayers[this.currentTurn - 1];
            if (ai.hand.length === 0 && this.deck.length > 0) {
                ai.hand.push(this.deck.pop());
            }
            this.updateMessage(`${ai.name}'s turn...`);
            this.updateDisplay();
            setTimeout(() => this.aiTurn(), 1500);
        }
    }

    isGameOver() {
        // Game ends when all books are collected or no more cards
        const totalBooks = this.playerBooks.length + 
                          this.aiPlayers.reduce((sum, ai) => sum + ai.books.length, 0);
        return totalBooks === 13 || (this.deck.length === 0 && 
               this.playerHand.length === 0 && 
               this.aiPlayers.every(ai => ai.hand.length === 0));
    }

    endGame() {
        this.gameActive = false;
        
        const scores = [
            { name: 'You', books: this.playerBooks.length },
            ...this.aiPlayers.map(ai => ({ name: ai.name, books: ai.books.length }))
        ];

        scores.sort((a, b) => b.books - a.books);

        let message = 'Game Over! Final Scores:\n';
        scores.forEach((s, i) => {
            message += `${i + 1}. ${s.name}: ${s.books} books\n`;
        });

        if (scores[0].name === 'You') {
            const winAmount = this.pot;
            this.casino.addChips(winAmount);
            message = `🎉 You Win! ${scores[0].books} books!\nWon ${winAmount} chips!`;
        } else {
            message = `💔 ${scores[0].name} wins with ${scores[0].books} books!`;
        }

        this.updateMessage(message);
        this.updateButtons();
    }

    updateMessage(text) {
        const messageEl = document.getElementById('goFishMessage');
        if (messageEl) {
            messageEl.textContent = text;
        }
    }

    updateDisplay() {
        // Player hand
        const playerCardsEl = document.getElementById('goFishPlayerCards');
        if (playerCardsEl) {
            playerCardsEl.innerHTML = '';
            this.playerHand.forEach(card => {
                const cardEl = this.createCardElement(card, false);
                if (this.currentTurn === 0 && this.gameActive) {
                    cardEl.style.cursor = 'pointer';
                    cardEl.onclick = () => this.askForCard(card.value);
                }
                playerCardsEl.appendChild(cardEl);
            });
        }

        // Player books
        const playerBooksEl = document.getElementById('playerBooksCount');
        if (playerBooksEl) {
            playerBooksEl.textContent = `Books: ${this.playerBooks.join(', ') || 'None'}`;
        }

        // AI players
        this.aiPlayers.forEach((ai, index) => {
            const aiCardsEl = document.getElementById(`ai${index + 1}Cards`);
            const aiBooksEl = document.getElementById(`ai${index + 1}Books`);
            const aiNameEl = document.getElementById(`ai${index + 1}Name`);

            if (aiNameEl) {
                aiNameEl.textContent = ai.name;
                if (this.currentTurn === index + 1) {
                    aiNameEl.style.color = 'var(--accent-gold)';
                } else {
                    aiNameEl.style.color = 'white';
                }
            }

            if (aiCardsEl) {
                aiCardsEl.innerHTML = '';
                for (let i = 0; i < ai.hand.length; i++) {
                    const cardEl = this.createCardElement(null, true);
                    aiCardsEl.appendChild(cardEl);
                }
            }

            if (aiBooksEl) {
                aiBooksEl.textContent = `Books: ${ai.books.length}`;
            }
        });

        // Pot and deck
        const potEl = document.getElementById('goFishPot');
        if (potEl) {
            potEl.textContent = `Pot: ${this.pot} chips`;
        }

        const deckEl = document.getElementById('goFishDeck');
        if (deckEl) {
            deckEl.textContent = `Deck: ${this.deck.length} cards`;
        }
    }

    createCardElement(card, faceDown) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card';

        if (faceDown) {
            cardEl.classList.add('back');
        } else {
            const color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
            cardEl.classList.add(color);

            const valueEl = document.createElement('div');
            valueEl.className = 'card-value';
            valueEl.textContent = card.value;

            const suitEl = document.createElement('div');
            suitEl.className = 'card-suit';
            suitEl.textContent = card.suit;

            cardEl.appendChild(valueEl);
            cardEl.appendChild(suitEl);
        }

        return cardEl;
    }

    updateButtons() {
        const startBtn = document.getElementById('goFishStartBtn');
        if (startBtn) {
            startBtn.disabled = this.gameActive;
        }
    }

    reset() {
        this.playerHand = [];
        this.playerBooks = [];
        this.aiPlayers.forEach(ai => {
            ai.hand = [];
            ai.books = [];
        });
        this.pot = 0;
        this.gameActive = false;
        this.currentTurn = 0;

        this.updateDisplay();
        this.updateButtons();
        this.updateMessage('Place your ante to start!');
    }
}

// Solitaire Game with Betting
class SolitaireGame {
    constructor(casino) {
        this.casino = casino;
        this.deck = [];
        this.foundation = [[], [], [], []]; // 4 foundation piles (Ace to King)
        this.tableau = [[], [], [], [], [], [], []]; // 7 tableau columns
        this.waste = [];
        this.stock = [];
        this.selectedCard = null;
        this.selectedPile = null;
        this.bet = 0;
        this.gameActive = false;
        this.moves = 0;
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        this.deck = [];

        for (let suit of suits) {
            for (let i = 0; i < values.length; i++) {
                this.deck.push({
                    value: values[i],
                    suit,
                    rank: i + 1,
                    color: (suit === '♥' || suit === '♦') ? 'red' : 'black',
                    faceUp: false
                });
            }
        }

        // Shuffle
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    startGame() {
        const betInput = document.getElementById('solitaireBet');
        const betAmount = parseInt(betInput.value);

        if (isNaN(betAmount) || betAmount <= 0) {
            this.casino.showNotification('Please enter a valid bet amount', 'error');
            return;
        }

        if (betAmount > this.casino.chips) {
            this.casino.showNotification('Insufficient chips!', 'error');
            return;
        }

        this.bet = betAmount;
        this.casino.removeChips(betAmount);
        this.moves = 0;

        this.createDeck();
        this.foundation = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.waste = [];
        this.stock = [];

        // Deal tableau
        for (let col = 0; col < 7; col++) {
            for (let row = 0; row <= col; row++) {
                const card = this.deck.pop();
                card.faceUp = (row === col);
                this.tableau[col].push(card);
            }
        }

        // Remaining cards go to stock
        this.stock = this.deck;

        this.gameActive = true;
        this.updateDisplay();
        this.updateButtons();
        document.getElementById('solitaireMessage').textContent = `Bet: ${this.bet} chips | Moves: 0`;
    }

    drawFromStock() {
        if (this.stock.length > 0) {
            const card = this.stock.pop();
            card.faceUp = true;
            this.waste.push(card);
            this.moves++;
        } else if (this.waste.length > 0) {
            // Reset stock from waste
            this.stock = this.waste.reverse();
            this.stock.forEach(c => c.faceUp = false);
            this.waste = [];
        }
        this.updateDisplay();
        document.getElementById('solitaireMessage').textContent = `Bet: ${this.bet} chips | Moves: ${this.moves}`;
    }

    checkWin() {
        return this.foundation.every(pile => pile.length === 13);
    }

    endGame() {
        this.gameActive = false;
        const cardsInFoundation = this.foundation.reduce((sum, pile) => sum + pile.length, 0);

        // Win if all cards in foundation
        if (cardsInFoundation === 52) {
            const winAmount = this.bet * 3; // 3x payout for winning
            this.casino.addChips(winAmount);
            this.casino.showNotification(`Solitaire Won! ${winAmount} chips!`, 'success');
            document.getElementById('solitaireMessage').textContent = `🎉 You Won ${winAmount} chips!`;
        } else {
            // Partial payout based on cards in foundation
            const partialWin = Math.floor(this.bet * (cardsInFoundation / 52));
            if (partialWin > 0) {
                this.casino.addChips(partialWin);
                document.getElementById('solitaireMessage').textContent = `${cardsInFoundation} cards placed. Returned ${partialWin} chips.`;
            } else {
                document.getElementById('solitaireMessage').textContent = `Game Over. Lost ${this.bet} chips.`;
            }
        }
        this.updateButtons();
    }

    updateDisplay() {
        // Show card counter if upgrade owned
        const deckInfo = document.getElementById('solitaireDeckInfo');
        if (deckInfo && this.casino.upgrades.cardCounter) {
            const remainingCards = {};
            const allRemainingCards = [...this.stock, ...this.waste, ...this.tableau.flat()];
            allRemainingCards.forEach(card => {
                const key = card.value;
                remainingCards[key] = (remainingCards[key] || 0) + 1;
            });
            deckInfo.textContent = `Cards left: Stock(${this.stock.length}) Waste(${this.waste.length})`;
            deckInfo.style.display = 'block';
        } else if (deckInfo) {
            deckInfo.textContent = `Stock: ${this.stock.length} | Waste: ${this.waste.length}`;
        }

        // Update foundation piles
        for (let i = 0; i < 4; i++) {
            const foundationEl = document.getElementById(`foundation${i}`);
            if (foundationEl) {
                foundationEl.innerHTML = '';
                const pile = this.foundation[i];
                if (pile.length > 0) {
                    const topCard = pile[pile.length - 1];
                    foundationEl.appendChild(this.createCardElement(topCard));
                } else {
                    foundationEl.innerHTML = '<div class="empty-pile">A</div>';
                }
            }
        }

        // Update tableau
        for (let col = 0; col < 7; col++) {
            const tableauEl = document.getElementById(`tableau${col}`);
            if (tableauEl) {
                tableauEl.innerHTML = '';
                const pile = this.tableau[col];
                if (pile.length === 0) {
                    tableauEl.innerHTML = '<div class="empty-pile">K</div>';
                } else {
                    pile.forEach((card, index) => {
                        const cardEl = this.createCardElement(card, !card.faceUp);
                        cardEl.style.marginTop = (index * 25) + 'px';
                        cardEl.onclick = () => this.selectCard(col, index);
                        tableauEl.appendChild(cardEl);
                    });
                }
            }
        }

        // Update waste pile
        const wasteEl = document.getElementById('solitaireWaste');
        if (wasteEl) {
            wasteEl.innerHTML = '';
            if (this.waste.length > 0) {
                const topCard = this.waste[this.waste.length - 1];
                const cardEl = this.createCardElement(topCard);
                cardEl.onclick = () => this.selectWasteCard();
                wasteEl.appendChild(cardEl);
            }
        }
    }

    selectCard(col, index) {
        if (!this.gameActive) return;
        // Simple implementation - just try to move to foundation
        const card = this.tableau[col][index];
        if (card && card.faceUp && index === this.tableau[col].length - 1) {
            this.tryMoveToFoundation(col, 'tableau');
        }
    }

    selectWasteCard() {
        if (!this.gameActive || this.waste.length === 0) return;
        this.tryMoveToFoundation(-1, 'waste');
    }

    tryMoveToFoundation(sourceIndex, sourceType) {
        let card;
        if (sourceType === 'waste') {
            card = this.waste[this.waste.length - 1];
        } else {
            card = this.tableau[sourceIndex][this.tableau[sourceIndex].length - 1];
        }

        // Find appropriate foundation pile
        for (let i = 0; i < 4; i++) {
            const foundation = this.foundation[i];
            if (foundation.length === 0 && card.rank === 1) {
                // Can place Ace on empty foundation
                if (sourceType === 'waste') {
                    this.waste.pop();
                } else {
                    this.tableau[sourceIndex].pop();
                    this.flipTopCard(sourceIndex);
                }
                this.foundation[i].push(card);
                this.moves++;
                this.updateDisplay();
                if (this.checkWin()) this.endGame();
                return;
            } else if (foundation.length > 0) {
                const topCard = foundation[foundation.length - 1];
                if (topCard.suit === card.suit && topCard.rank + 1 === card.rank) {
                    // Can place card on foundation
                    if (sourceType === 'waste') {
                        this.waste.pop();
                    } else {
                        this.tableau[sourceIndex].pop();
                        this.flipTopCard(sourceIndex);
                    }
                    this.foundation[i].push(card);
                    this.moves++;
                    this.updateDisplay();
                    if (this.checkWin()) this.endGame();
                    return;
                }
            }
        }

        this.casino.showNotification('Cannot move card there', 'error');
    }

    flipTopCard(col) {
        if (this.tableau[col].length > 0) {
            this.tableau[col][this.tableau[col].length - 1].faceUp = true;
        }
    }

    createCardElement(card, faceDown = false) {
        const cardEl = document.createElement('div');
        cardEl.className = 'card solitaire-card';

        if (faceDown) {
            cardEl.classList.add('back');
        } else {
            cardEl.classList.add(card.color);

            const valueEl = document.createElement('div');
            valueEl.className = 'card-value';
            valueEl.textContent = card.value;

            const suitEl = document.createElement('div');
            suitEl.className = 'card-suit';
            suitEl.textContent = card.suit;

            cardEl.appendChild(valueEl);
            cardEl.appendChild(suitEl);
        }

        return cardEl;
    }

    updateButtons() {
        const startBtn = document.getElementById('solitaireStartBtn');
        const drawBtn = document.getElementById('solitaireDrawBtn');
        const giveUpBtn = document.getElementById('solitaireGiveUpBtn');

        if (this.gameActive) {
            if (startBtn) startBtn.disabled = true;
            if (drawBtn) drawBtn.disabled = false;
            if (giveUpBtn) giveUpBtn.disabled = false;
        } else {
            if (startBtn) startBtn.disabled = false;
            if (drawBtn) drawBtn.disabled = true;
            if (giveUpBtn) giveUpBtn.disabled = true;
        }
    }

    reset() {
        this.gameActive = false;
        this.foundation = [[], [], [], []];
        this.tableau = [[], [], [], [], [], [], []];
        this.waste = [];
        this.stock = [];
        this.moves = 0;
        this.updateButtons();
    }
}

// Maze Game for earning chips
class MazeGame {
    constructor(casino) {
        this.casino = casino;
        this.maze = [];
        this.playerPos = { x: 0, y: 0 };
        this.exitPos = { x: 0, y: 0 };
        this.size = 10;
        this.difficulty = 'medium';
        this.gameActive = false;
        this.startTime = 0;
    }

    generateMaze(size) {
        this.size = size;
        this.maze = [];

        // Initialize grid with all walls
        for (let y = 0; y < size; y++) {
            this.maze[y] = [];
            for (let x = 0; x < size; x++) {
                this.maze[y][x] = 1; // 1 = wall, 0 = path
            }
        }

        // Recursive backtracker algorithm
        const stack = [];
        const start = { x: 0, y: 0 };
        this.maze[0][0] = 0;
        stack.push(start);

        const directions = [
            { dx: 0, dy: -2 }, // up
            { dx: 2, dy: 0 },  // right
            { dx: 0, dy: 2 },  // down
            { dx: -2, dy: 0 }  // left
        ];

        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = [];

            // Find unvisited neighbors
            for (let dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;

                if (nx >= 0 && nx < size && ny >= 0 && ny < size && this.maze[ny][nx] === 1) {
                    neighbors.push({ x: nx, y: ny, dx: dir.dx, dy: dir.dy });
                }
            }

            if (neighbors.length > 0) {
                const next = neighbors[Math.floor(Math.random() * neighbors.length)];

                // Remove wall between current and next
                this.maze[current.y + next.dy / 2][current.x + next.dx / 2] = 0;
                this.maze[next.y][next.x] = 0;

                stack.push({ x: next.x, y: next.y });
            } else {
                stack.pop();
            }
        }

        this.playerPos = { x: 0, y: 0 };
        this.exitPos = { x: size - 1, y: size - 1 };
        this.maze[this.exitPos.y][this.exitPos.x] = 0;
    }

    startGame(difficulty) {
        this.difficulty = difficulty;
        let size;

        switch(difficulty) {
            case 'easy':
                size = 10;
                break;
            case 'medium':
                size = 15;
                break;
            case 'hard':
                size = 20;
                break;
            case 'expert':
                size = 25;
                break;
            default:
                size = 10;
        }

        this.generateMaze(size);
        this.gameActive = true;
        this.startTime = Date.now();
        this.updateDisplay();
        document.getElementById('mazeMessage').textContent = `Find the exit! Size: ${size}x${size}`;
    }

    move(direction) {
        if (!this.gameActive) return;

        let newX = this.playerPos.x;
        let newY = this.playerPos.y;

        switch(direction) {
            case 'up': newY--; break;
            case 'down': newY++; break;
            case 'left': newX--; break;
            case 'right': newX++; break;
        }

        // Check bounds and walls
        if (newX >= 0 && newX < this.size && newY >= 0 && newY < this.size && this.maze[newY][newX] === 0) {
            this.playerPos.x = newX;
            this.playerPos.y = newY;

            // Check if reached exit
            if (newX === this.exitPos.x && newY === this.exitPos.y) {
                this.winGame();
            }

            this.updateDisplay();
        }
    }

    winGame() {
        this.gameActive = false;
        const timeTaken = Math.floor((Date.now() - this.startTime) / 1000);

        // Calculate reward based on difficulty and time
        let baseReward;
        switch(this.difficulty) {
            case 'easy': baseReward = 50; break;
            case 'medium': baseReward = 150; break;
            case 'hard': baseReward = 300; break;
            case 'expert': baseReward = 500; break;
            default: baseReward = 50;
        }

        // Bonus for completing quickly
        const timeBonus = Math.max(0, Math.floor(baseReward * (1 - timeTaken / 300)));
        const totalReward = baseReward + timeBonus;

        this.casino.chips += totalReward;
        this.casino.saveChips();
        this.casino.showNotification(`Maze completed! Won ${totalReward} chips!`, 'success');
        document.getElementById('mazeMessage').textContent = `🎉 Completed in ${timeTaken}s! Won ${totalReward} chips!`;
    }

    updateDisplay() {
        const mazeEl = document.getElementById('mazeGrid');
        if (!mazeEl) return;

        mazeEl.innerHTML = '';
        mazeEl.style.gridTemplateColumns = `repeat(${this.size}, 20px)`;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const cell = document.createElement('div');
                cell.className = 'maze-cell';

                if (this.maze[y][x] === 1) {
                    cell.classList.add('wall');
                } else {
                    cell.classList.add('path');
                }

                if (x === this.playerPos.x && y === this.playerPos.y) {
                    cell.classList.add('player');
                    cell.textContent = '👤';
                } else if (x === this.exitPos.x && y === this.exitPos.y) {
                    cell.classList.add('exit');
                    cell.textContent = '🚪';
                }

                mazeEl.appendChild(cell);
            }
        }
    }

    reset() {
        this.gameActive = false;
        this.maze = [];
        const mazeEl = document.getElementById('mazeGrid');
        if (mazeEl) mazeEl.innerHTML = '';
        const messageEl = document.getElementById('mazeMessage');
        if (messageEl) messageEl.textContent = 'Choose difficulty to start!';
    }
}

// Initialize
let casino;
let blackjack;
let roulette;
let slots;
let poker;
let goFish;
let solitaire;
let maze;

window.addEventListener('DOMContentLoaded', () => {
    casino = new CasinoGame();
    blackjack = new BlackjackGame(casino);
    roulette = new RouletteGame(casino);
    slots = new SlotsGame(casino);
    poker = new PokerGame(casino);
    goFish = new GoFishGame(casino);
    solitaire = new SolitaireGame(casino);
    maze = new MazeGame(casino);

    casino.currentGame = { reset: () => {} };
});
