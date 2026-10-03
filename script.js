// --- Core Game Logic ---

const getComputerChoice = () => { 
  const randomNumber = Math.floor(Math.random() * 3);
  switch (randomNumber) {
    case 0: return "rock";
    case 1: return "paper";
    case 2: return "scissors";
  }
};

const determineWinner = (userChoice, computerChoice) => {
  if (userChoice === computerChoice) {
    return "The game is a tie!";
  }

  if (userChoice === "rock") {
    return computerChoice === "paper" ? "The computer won!" : "The user won!";
  }

  if (userChoice === "paper") {
    return computerChoice === "scissors" ? "The computer won!" : "The user won!";
  }

  if (userChoice === "scissors") {
    return computerChoice === "rock" ? "The computer won!" : "The user won!";
  }
};

// --- DOM Interaction ---


const buttons = document.querySelectorAll('.choice-btn');
const userDisplay = document.getElementById('user-display');
const computerDisplay = document.getElementById('computer-display');
const winnerText = document.getElementById('winner-text');

const playGame = (userChoice) => {
    const computerChoice = getComputerChoice();
    
    // Update text
    userDisplay.textContent = `User: ${userChoice}`;
    computerDisplay.textContent = `CPU: ${computerChoice}`;
    
    // Determine winner
    const result = determineWinner(userChoice, computerChoice);
    winnerText.textContent = result;
};

// Listen for clicks
buttons.forEach(button => {
    button.addEventListener('click', () => {
        // This picks up the ID: "rock", "paper", or "scissors"
        playGame(button.id);
    });
});