class Timer {
  /**
   * Tick tick tick.
   * 
   * @param {Number} initial - Starting time.
   * @param {Function} end - Function to run when timer ends.
   */
  constructor(initial, end) {
    this.time = initial;
    this.initial = initial;
    this.paused = false;
    this.interval = undefined;
    this.increment = 0;
    this.end = end;
    this.start();
  }

  /**
   * Sets the mode of the timer. (Only modes in game are in switch case and have to do with timer)
   * 
   * @param {String} mode - Mode to turn button into.
   */
  setMode(mode) {
    clearInterval(this.interval);
    switch (mode) {
      case 'Normal':
        this.initial = 90;
        this.increment = 0;
        this.start();
        break;
      case 'Unlimited':
        this.initial = 999;
        this.increment = 0;
        break;
      case '90+10':
        this.initial = 90;
        this.increment = 10;
        this.start();
        break;
      case '180+5':
        this.initial = 180;
        this.increment = 5;
        this.start();
        break;
      default:
        break;
    }
    document.getElementById('timer').textContent = this.time;
  }

  /**
   * Increment timer by set time increment.
   */
  incrementTime() {
    this.time += this.increment;
    document.getElementById('timer').textContent = this.time;
  }

  /**
   * Create a new interval to countdown timer.
   */
  start() {
    this.interval = setInterval(() => {
      if (this.time > 0) {
        this.time--;
        document.getElementById('timer').textContent = this.time;
      } else {
        clearInterval(this.interval);
        this.end();
      }
    }, 1000);
  }

  /**
   * Pause/unpause timer and calls end/start respectively.
   */
  pause() {
    this.paused = !this.paused;
    if (this.paused) {
      this.stop();
      document.getElementById('pauseButton').textContent = 'Resume';
    } else {
      this.start();
      document.getElementById('pauseButton').textContent = 'Pause';
    }
  }

  /**
   * Stops timer by removing interval.
   */
  stop() {
    clearInterval(this.interval);
  }

  /**
   * Resets timer to initial state.
   */
  restart() {
    this.time = this.initial;
    document.getElementById('timer').textContent = this.time;
  }
}


class Card {
  /**
   * Individual set game card.
   * 
   * @param {String} color 
   * @param {String} shape 
   * @param {String} shade 
   * @param {Number} number 
   */
  constructor (color, shape, shade, number) {
    this.color = color;
    this.shape = shape;
    this.shade = shade;
    this.number = number;
    this.id = `${this.color}-${this.shade}-${this.shape}-${this.number}`;
    
  }

  /**
   * Formats card into its html display.
   * 
   * @returns {String} - Resulting card table element
   */
  display() {
    let result = `<td id="${this.id}" class="card card-${this.shade}" style="--color: ${this.color};">`;

    for (let i = 0; i < this.number; i++) {
      result += `<img class="card-shape" src="assets/${this.shape}.png" alt="${this.shape}">`;
    }
    
    return result + '</td>';
  }
}


class Set {
  /**
   * Set card game class.
   */
  constructor() {
    this.deck = [];
    this.board = [];
    this.hand = [];
    this.end = false;
    this.timer = new Timer(90, this.endGame);
    this.setEvents();
    this.restartGame();
  }

  /**
   * Initialize all events and listeners.
   */
  setEvents() {
    // Set shuffle button
    document.querySelectorAll('.modeButton').forEach(modeButton => {
      modeButton.addEventListener('click', () => {
        this.timer.setMode(modeButton.textContent);
        this.restartGame();
      });
    });
    // Set pause button
    document.getElementById('pauseButton').addEventListener('click', () => {
      this.timer.pause();
    });
    // Set shuffle button
    document.getElementById('shuffleButton').addEventListener('click', () => {
      this.deck.push(...this.board);
      this.board = [];
      this.setBoard();
      this.displayBoard();
    });
    // Set restart button
    document.getElementById('restartButton').addEventListener('click', () => {
      this.restartGame();
      this.restartGame();
    });
    // Set hint button
    document.getElementById('hintButton').addEventListener('click', () => {
      if (this.end || this.timer.paused) return;
      this.showHint();
    });
    // Set cards event listener
    document.getElementById('cards').addEventListener('click', event => {
      if (this.end || this.timer.paused) return;

      const target = event.target.closest('td');
      if (target) {
        const clickedCard = this.board.find(card => card.id === target.id);
        if (clickedCard)
          this.handleCardSelection(clickedCard, target);
      }
    });
  }

  /**
   * Restarts game from initial state (randomized).
   */
  restartGame() {
    this.timer.restart();
    this.setDeck();
    this.board = [];
    this.hand = [];
    this.end = false;
    this.setBoard();
    this.displayBoard();

    // Reset HTML elements
    document.getElementById('gameOver').style.display = 'none';
    document.getElementById('score').textContent = 0;
    document.getElementById('remain').textContent = 81;
  }

  /**
   * Sets game end state, display game over, and stop timer.
   */
  endGame() {
    document.getElementById('gameOver').style.display = 'block';
    this.end = true;
    this.timer.stop();
  }

  /**
   * Creates the complete set deck.
   */
  setDeck() {
    const colors = ["green", "blue", "red"];
    const shapes = ["diamond", "squiggle", "oval"];
    const shades = ["fill", "stripe", "open"];
    const numbers = [1, 2, 3];
    this.deck = [];

    colors.forEach(color => {
      shapes.forEach(shape => {
        shades.forEach(shade => {
          numbers.forEach(number => {
            this.deck.push(new Card(color, shape, shade, number));
          });
        });
      });
    });
  }

  /**
   * Stores the initial 12 random cards.
   * 
   * @param {Number} size - Size to make the board.
   */
  setBoard(size=12) {
    // End game if no more cards
    if (this.deck.length === 0) {
      this.endGame();
      return;
    }
    
    // removes 'size' random cards from the deck and stores it in another array
    for (let i = 0; i < size && this.deck.length > 0; i++) {
      // Skip if card is already defined
      if (this.board[i] !== undefined) continue;

      // randomly generates an integer within the full deck length
      let randIndex = Math.floor(Math.random() * this.deck.length);

      // removes a card stored at random index from deck and adds it to a new array
      this.board[i] = this.deck.splice(randIndex, 1)[0];
    }

    // Check if valid board, if not then increase board size by 3
    if (this.deck.length !== 0 && this.checkBoard().length === 0)
      this.setBoard(size + 3);
  }

  /**
   * Sets the HTML for board display.
   */
  displayBoard() {
    // Assuming each row has the same number of cards (add 3 cards every time theres not a set?)
    const cards = document.getElementById('cards');
    cards.innerHTML = '';
    let columns = this.board.length / 3;
    
    for (let i = 0; i < 3; i++) {
      let row = "<tr>";
      for (let j = 0; j < columns; j++) {
        let index = i * columns + j;
        row += '<td>'
        if (this.board[index] !== undefined && index < this.board.length)
          row += `${this.board[index]?.display()}`;
        row += '</td>';
      }
      cards.innerHTML += row + "</tr>";
    }
  }

  /**
   * Checks current board for any valid pairs.
   */
  checkBoard() {
    // Iterate through board in n^3 time :skull: (there might be a better way but array will never be too big anyways)
    const n = this.board.length;

    for (let i = 0; i < n - 2; i++) {
      for (let j = i + 1; j < n - 1; j++) {
        for (let k = j + 1; k < n; k++) {
          if (this.board[k] === undefined) return [];
          else if (this.verifySet(this.board[i], this.board[j], this.board[k]))
            return [this.board[i], this.board[j], this.board[k]];
        }
      }
    }

    return [];
  }

  /**
   * Verify if user's set is valid or not.
   *
   * @param {Card} card1
   * @param {Card} card2
   * @param {Card} card3
   * @return {Boolean} True if player's set is valid, otherwise False
   */
  verifySet(card1, card2, card3) {
    let attributes = Object.keys(card1);

    for (let i=0; i < attributes.length; i++) {
      let attr = attributes[i];
      let a1 = card1[attr];
      let a2 = card2[attr];
      let a3 = card3[attr];

      // Verifies all attributes are either all the same or all different.
      // If not then return false since this must be true for all attributes;
      if ((a1 !== a2 || a1 !== a3) && ((a1 === a2 ) || (a1 === a3) || (a2 === a3)))
        return false;
    }
    
    return true;
  }

  /**
   * Highlights 1 card of a valid set.
   */
  showHint() {
    const validSet = this.checkBoard();

    if (validSet.length > 0) {
      // Set as 3 for now for testing purposes
      for (let i = 0; i < 3; i++) {
        document.getElementById(validSet[i].id).classList.add('card-glow');
      }
    }
  }

  /**
   * Triggers whenever player adds or removes a card from hand. Tracks player hand status and how to handle it.
   * 
   * @param {Card[]} card - Card that was selected.
   * @param {HTMLBodyElement} cardElement - HTML element that is assoiciated with the card.
   */
  handleCardSelection(card, cardElement) {
    // Toggle a class that indicates the card is selected
    cardElement.classList.toggle('selected');
    
    // Add or remove the card from the hand
    if (cardElement.classList.contains('selected')) {
      // Add card to hand
      this.hand.push(card);
      cardElement.classList.add('card-select');
    } else {
      // Remove card from hand
      for (let i = 0; i < 3; i++) {
        if (this.hand[i] == card) {
          this.hand.splice(i,1);
        }
      }
      cardElement.classList.remove('card-select');
    }

    // Check if valid set, if so then remove from board. Will always reset hand to 0.
    if (this.hand.length == 3) {
      let toastNotif = '';

      if (this.verifySet(this.hand[0], this.hand[1], this.hand[2])) {
        //this logic makes the card elements dissapear if they are a valid set.
        this.board.filter(card => this.hand.find(item => item.id === card.id));
        for (let i = this.board.length - 1; i >= 0; i--) {
          if (this.hand.some(card => card.id === this.board[i].id)) {
            if (this.board.length > 12) this.board.splice(i, 1);
            else this.board[i] = undefined;
          }
        }

        // Reset board and add to score
        this.setBoard();
        document.getElementById('score').textContent++;
        document.getElementById('remain').textContent -= 3;
        toastNotif = 'Valid set, added 1 to score!';
        this.timer.incrementTime();
      } else {
        document.getElementById('score').textContent--;
        toastNotif = 'Invalid set, loss 1 point...';
      }

      // Toast notification (source: https://www.w3schools.com/howto/howto_js_snackbar.asp)
      const toast = document.getElementById('toast');
      toast.innerHTML = toastNotif;
      if (!toast.classList.contains('show')) {
        toast.className = 'show';
        setTimeout(() => {
          toast.className = toast.className.replace('show', '');
        }, 1500);
      }

      this.displayBoard();
      this.hand.length = 0;
    }
  }
}

const game = new Set();

