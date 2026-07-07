// '0' Points Quiz System - Application Logic

// --- Application State ---
let gameState = {
  teams: [], // Array of { id, name, members: [], score: 1000 }
  activeTeamIndex: 0,
  resolvedCards: [], // Array of "category-points" strings (e.g., ["tech-20"])
  gameStarted: false,
  
  // Active Question Modal State
  activeQuestion: null, // { category, points, questionText, answerText }
  originalActiveTeamIndex: 0,
  attemptTeamIndex: 0,
  passChain: [], // Array of team IDs that have touched this question
  
  // Track which question index we are on for each category-points slot
  questionUsage: {} // e.g. { "tech-20": 0 }
};

const LOCAL_STORAGE_KEY = 'zero_points_quiz_game_state';

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  loadGameState();
  initEventListeners();
  renderApp();
});

// --- Local Storage Management ---
function saveGameState() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(gameState));
}

function loadGameState() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      gameState = JSON.parse(saved);
      // Ensure arrays/sets are reconstructed if needed
    } catch (e) {
      console.error("Error parsing saved game state:", e);
    }
  }
}

function initEventListeners() {
  // Global backdrop click
  document.getElementById('modal-backdrop').addEventListener('click', closeActiveOverlays);

  // Keyboard navigation support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeActiveOverlays();
    }
  });
}

// --- View Toggles ---
function handleToggleRegisterView(show) {
  const setupView = document.getElementById('setup-view');
  if (show) {
    setupView.classList.add('active');
  } else {
    setupView.classList.remove('active');
  }
}

function toggleAdminDrawer(show) {
  const drawer = document.getElementById('admin-drawer');
  const backdrop = document.getElementById('modal-backdrop');
  if (show) {
    populateAdminDropdowns();
    renderAdminTeamsList();
    drawer.classList.add('active');
    backdrop.classList.add('active');
  } else {
    drawer.classList.remove('active');
    if (!document.getElementById('question-modal').classList.contains('active')) {
      backdrop.classList.remove('active');
    }
  }
}

function closeActiveOverlays() {
  toggleAdminDrawer(false);
  closeQuestionModal();
}

// --- Team Management & Registration ---
function handleRegisterTeam(event) {
  event.preventDefault();
  const nameInput = document.getElementById('reg-team-name');
  const membersInput = document.getElementById('reg-members');
  
  const name = nameInput.value.trim();
  const membersRaw = membersInput.value;
  
  if (!name) return;
  
  const members = membersRaw.split(',')
    .map(m => m.trim())
    .filter(m => m.length > 0);
    
  if (members.length < 1) {
    showToast("Please enter at least one member", "error");
    return;
  }

  // Create new team
  const newTeam = {
    id: 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name,
    members: members,
    score: 1000
  };

  gameState.teams.push(newTeam);
  saveGameState();
  
  nameInput.value = '';
  membersInput.value = '';
  
  showToast(`Team "${name}" registered successfully!`, "success");
  renderSetupTeamsList();
  updateSetupStartButton();
  renderLeaderboard();
  populateAdminDropdowns();
}

function handleAutoRegister() {
  const demoTeams = [
    { name: "Caffeine Coders", members: ["Alvin", "Biju", "Chacko", "Devi"] },
    { name: "Sporty Sparks", members: ["Elsa", "Faisal", "Gireesh"] },
    { name: "Rajagiri Royals", members: ["Hari", "Irene", "Jibin", "Kavya"] },
    { name: "Cinephiles", members: ["Lijo", "Meera", "Nandu"] }
  ];

  demoTeams.forEach(t => {
    gameState.teams.push({
      id: 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      name: t.name,
      members: t.members,
      score: 1000
    });
  });

  saveGameState();
  showToast("Loaded 4 demo teams!", "success");
  renderSetupTeamsList();
  updateSetupStartButton();
  renderLeaderboard();
  populateAdminDropdowns();
}

function handleRemoveTeam(teamId) {
  const teamIndex = gameState.teams.findIndex(t => t.id === teamId);
  if (teamIndex !== -1) {
    const name = gameState.teams[teamIndex].name;
    gameState.teams.splice(teamIndex, 1);
    
    // Adjust activeIndex if out of bounds
    if (gameState.activeTeamIndex >= gameState.teams.length) {
      gameState.activeTeamIndex = 0;
    }
    
    saveGameState();
    showToast(`Removed team "${name}"`, "warning");
    
    renderSetupTeamsList();
    renderAdminTeamsList();
    updateSetupStartButton();
    renderLeaderboard();
    populateAdminDropdowns();
  }
}

function updateSetupStartButton() {
  const startBtn = document.getElementById('start-game-btn');
  const count = gameState.teams.length;
  document.getElementById('registered-count').innerText = count;
  
  if (count >= 2) {
    startBtn.removeAttribute('disabled');
  } else {
    startBtn.setAttribute('disabled', 'true');
  }
}

// --- Start Game ---
function startGame() {
  if (gameState.teams.length < 2) {
    showToast("Please register at least 2 teams to start.", "error");
    return;
  }
  gameState.gameStarted = true;
  saveGameState();
  handleToggleRegisterView(false);
  renderApp();
  showToast("Quiz Game Started! Good luck reaching 0 Points!", "success");
}

// --- Quiz Mechanics & Pass Flow ---
function openQuestion(category, points) {
  const cardId = `card-${category}-${points}`;
  if (gameState.resolvedCards.includes(`${category}-${points}`)) {
    return; // Already solved
  }

  // Get question list
  const categoryQuestions = window.QUIZ_QUESTIONS[category]?.[points];
  if (!categoryQuestions || categoryQuestions.length === 0) {
    showToast("No questions available for this category and point tier.", "error");
    return;
  }

  // Determine which question index we are on
  const key = `${category}-${points}`;
  if (gameState.questionUsage[key] === undefined) {
    gameState.questionUsage[key] = 0;
  }
  
  const questionIndex = gameState.questionUsage[key] % categoryQuestions.length;
  const qObj = categoryQuestions[questionIndex];

  // Set Modal States
  gameState.activeQuestion = {
    category: category,
    points: points,
    questionText: qObj.question,
    answerText: qObj.answer,
    cardId: cardId
  };
  
  gameState.originalActiveTeamIndex = gameState.activeTeamIndex;
  gameState.attemptTeamIndex = gameState.activeTeamIndex;
  gameState.passChain = [gameState.teams[gameState.activeTeamIndex].id];

  saveGameState();
  updateQuestionModalUI();
  
  // Show Modal and backdrop
  const modal = document.getElementById('question-modal');
  const backdrop = document.getElementById('modal-backdrop');
  
  // Remove existing themes
  modal.className = 'question-modal';
  modal.classList.add(`${category}-theme`);
  modal.classList.add('active');
  backdrop.classList.add('active');

  // Hide answer box by default
  document.getElementById('modal-answer-box').classList.remove('visible');
  document.getElementById('reveal-answer-btn').innerHTML = '<i class="fa-solid fa-eye"></i> Show Correct Answer';
}

function closeQuestionModal() {
  const modal = document.getElementById('question-modal');
  const backdrop = document.getElementById('modal-backdrop');
  
  modal.classList.remove('active');
  if (!document.getElementById('admin-drawer').classList.contains('active')) {
    backdrop.classList.remove('active');
  }
  
  gameState.activeQuestion = null;
  saveGameState();
}

function updateQuestionModalUI() {
  if (!gameState.activeQuestion) return;
  
  const q = gameState.activeQuestion;
  document.getElementById('modal-category').innerText = q.category;
  document.getElementById('modal-points').innerText = `${q.points} Points`;
  document.getElementById('modal-question-text').innerText = q.questionText;
  document.getElementById('modal-answer-text').innerText = q.answerText;
  
  const attemptTeam = gameState.teams[gameState.attemptTeamIndex];
  document.getElementById('modal-active-team').innerText = attemptTeam.name;

  // Build pass chain display text
  const passChainElement = document.getElementById('modal-pass-chain');
  if (gameState.passChain.length > 1) {
    const passedTeamNames = gameState.passChain.slice(0, -1).map(id => {
      const t = gameState.teams.find(team => team.id === id);
      return t ? t.name : "Unknown";
    });
    passChainElement.innerHTML = `&nbsp;(Passed from: ${passedTeamNames.join(' ➔ ')})`;
  } else {
    passChainElement.innerText = '';
  }

  // Adjust disabled state of Pass button if everyone has passed
  const passBtn = document.getElementById('modal-pass-btn');
  const unattemptedTeams = gameState.teams.filter(t => !gameState.passChain.includes(t.id));
  
  if (unattemptedTeams.length === 0) {
    passBtn.setAttribute('disabled', 'true');
    passBtn.innerHTML = '<i class="fa-solid fa-right-long"></i> No Teams Left to Pass';
  } else {
    passBtn.removeAttribute('disabled');
    passBtn.innerHTML = '<i class="fa-solid fa-right-long"></i> Pass Question';
  }
}

function toggleRevealAnswer() {
  const answerBox = document.getElementById('modal-answer-box');
  const revealBtn = document.getElementById('reveal-answer-btn');
  
  if (answerBox.classList.contains('visible')) {
    answerBox.classList.remove('visible');
    revealBtn.innerHTML = '<i class="fa-solid fa-eye"></i> Show Correct Answer';
  } else {
    answerBox.classList.add('visible');
    revealBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> Hide Correct Answer';
  }
}

function handlePassQuestion() {
  if (!gameState.activeQuestion) return;

  // Find next team that hasn't attempted yet
  let nextIndex = gameState.attemptTeamIndex;
  let found = false;

  for (let i = 0; i < gameState.teams.length; i++) {
    nextIndex = (nextIndex + 1) % gameState.teams.length;
    const teamId = gameState.teams[nextIndex].id;
    if (!gameState.passChain.includes(teamId)) {
      gameState.attemptTeamIndex = nextIndex;
      gameState.passChain.push(teamId);
      found = true;
      break;
    }
  }

  if (found) {
    saveGameState();
    updateQuestionModalUI();
    showToast(`Passed to ${gameState.teams[gameState.attemptTeamIndex].name}`, "info");
  } else {
    showToast("All teams have already attempted or passed this question!", "warning");
  }
}

/**
 * Resolves the question score and advances turn.
 * @param {boolean|null} isCorrect - true if correct, false if incorrect, null if discarded/no-point lock
 */
function resolveQuestionResult(isCorrect) {
  if (!gameState.activeQuestion) return;

  const points = parseInt(gameState.activeQuestion.points);
  const currentTeam = gameState.teams[gameState.attemptTeamIndex];
  const originalTeam = gameState.teams[gameState.originalActiveTeamIndex];
  const key = `${gameState.activeQuestion.category}-${gameState.activeQuestion.points}`;

  if (isCorrect === true) {
    // Score subtraction (correct)
    const oldScore = currentTeam.score;
    currentTeam.score = Math.max(0, currentTeam.score - points); // Don't let scores drop below zero if that's a rule, or allow it? Standard: 0 is the floor or exact target. Let's allow negative or floor at 0. Floor at 0 is safe, but let's just subtract (e.g. 20 - 40 = -20). Let's allow arbitrary scores.
    currentTeam.score = oldScore - points;
    
    showToast(`CORRECT! ${currentTeam.name} score decreased by ${points} pts (${oldScore} ➔ ${currentTeam.score})`, "success");
    
    // Mark card resolved
    gameState.resolvedCards.push(key);
    // Increment question index so next time this card has another question
    gameState.questionUsage[key] = (gameState.questionUsage[key] || 0) + 1;
    
    // Advance game turn to the next in sequence from the ORIGINAL picker
    gameState.activeTeamIndex = (gameState.originalActiveTeamIndex + 1) % gameState.teams.length;
    
    closeQuestionModal();
    renderApp();
  } 
  else if (isCorrect === false) {
    // Score addition (incorrect)
    const oldScore = currentTeam.score;
    currentTeam.score = oldScore + points;
    
    showToast(`INCORRECT! ${currentTeam.name} score increased by ${points} pts (${oldScore} ➔ ${currentTeam.score})`, "error");
    
    // Check if the coordinator wants to keep the question open for passes or lock it
    // We update UI so the current team is shown as wrong. The pass list now blocks them.
    updateQuestionModalUI();
    renderLeaderboard();
    saveGameState();
    
    // If all teams have attempted, we can automatically lock the cell
    const unattempted = gameState.teams.filter(t => !gameState.passChain.includes(t.id));
    if (unattempted.length === 0) {
      showToast("All teams have attempted. Locking question card.", "warning");
      resolveQuestionResult(null); // Discards and closes
    }
  } 
  else {
    // Discard/Lock cell (no points changed)
    gameState.resolvedCards.push(key);
    gameState.questionUsage[key] = (gameState.questionUsage[key] || 0) + 1;
    
    // Advance game turn to next in sequence from original
    gameState.activeTeamIndex = (gameState.originalActiveTeamIndex + 1) % gameState.teams.length;
    
    showToast(`Question locked. Moving to next turn.`, "warning");
    closeQuestionModal();
    renderApp();
  }
}

// --- Admin Panel Actions ---
function populateAdminDropdowns() {
  const activeSelect = document.getElementById('admin-select-turn');
  const teamSelect = document.getElementById('admin-select-team');
  
  if (!activeSelect || !teamSelect) return;
  
  activeSelect.innerHTML = '';
  teamSelect.innerHTML = '';
  
  gameState.teams.forEach((team, index) => {
    // Active Select Option
    const optActive = document.createElement('option');
    optActive.value = index;
    optActive.innerText = `${team.name} (${gameState.activeTeamIndex === index ? 'ACTIVE' : 'Idle'})`;
    optActive.selected = gameState.activeTeamIndex === index;
    activeSelect.appendChild(optActive);

    // Team Edit Select Option
    const optTeam = document.createElement('option');
    optTeam.value = team.id;
    optTeam.innerText = `${team.name} (${team.score} pts)`;
    teamSelect.appendChild(optTeam);
  });
}

function renderAdminTeamsList() {
  const container = document.getElementById('admin-teams-list');
  if (!container) return;
  
  if (gameState.teams.length === 0) {
    container.innerHTML = '<div class="empty-state">No teams registered.</div>';
    return;
  }

  container.innerHTML = '';
  gameState.teams.forEach(team => {
    const div = document.createElement('div');
    div.className = 'registered-item';
    div.innerHTML = `
      <div class="reg-team-info">
        <span class="reg-team-name">${team.name}</span>
        <span class="reg-team-members">${team.members.join(', ')}</span>
      </div>
      <button class="btn-remove-team" onclick="handleRemoveTeam('${team.id}')" title="Remove Team">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    container.appendChild(div);
  });
}

function handleOverrideTurn() {
  const select = document.getElementById('admin-select-turn');
  const index = parseInt(select.value);
  if (!isNaN(index) && index >= 0 && index < gameState.teams.length) {
    gameState.activeTeamIndex = index;
    saveGameState();
    renderApp();
    showToast(`Turn manually overridden to: ${gameState.teams[index].name}`, "info");
    toggleAdminDrawer(false);
  }
}

function handleAdjustScore(operation) {
  const select = document.getElementById('admin-select-team');
  const pointsVal = parseInt(document.getElementById('admin-points-val').value);
  
  if (isNaN(pointsVal) || pointsVal <= 0) {
    showToast("Invalid points value", "error");
    return;
  }
  
  const teamId = select.value;
  const team = gameState.teams.find(t => t.id === teamId);
  if (!team) {
    showToast("Select a team first", "error");
    return;
  }

  const oldScore = team.score;
  if (operation === 'sub') {
    team.score = oldScore - pointsVal;
    showToast(`Admin: Subtracted ${pointsVal} pts from ${team.name} (${oldScore} ➔ ${team.score})`, "success");
  } else {
    team.score = oldScore + pointsVal;
    showToast(`Admin: Added ${pointsVal} pts to ${team.name} (${oldScore} ➔ ${team.score})`, "warning");
  }

  saveGameState();
  renderApp();
  populateAdminDropdowns();
}

function handleAdminAddTeam(event) {
  event.preventDefault();
  const nameInput = document.getElementById('admin-team-name');
  const membersInput = document.getElementById('admin-team-members');
  
  const name = nameInput.value.trim();
  const membersRaw = membersInput.value;
  
  if (!name) return;
  const members = membersRaw.split(',').map(m => m.trim()).filter(m => m.length > 0);
  
  const newTeam = {
    id: 'team_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: name,
    members: members,
    score: 1000
  };

  gameState.teams.push(newTeam);
  saveGameState();
  
  nameInput.value = '';
  membersInput.value = '';
  
  showToast(`Admin: Registered new team "${name}"`, "success");
  
  renderApp();
  renderAdminTeamsList();
  populateAdminDropdowns();
}

function handleResetGame() {
  if (confirm("Are you sure you want to completely RESET the game? This will wipe all teams, scores, and board history!")) {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    gameState = {
      teams: [],
      activeTeamIndex: 0,
      resolvedCards: [],
      gameStarted: false,
      activeQuestion: null,
      originalActiveTeamIndex: 0,
      attemptTeamIndex: 0,
      passChain: [],
      questionUsage: {}
    };
    showToast("Game fully reset to setup screen", "warning");
    closeActiveOverlays();
    handleToggleRegisterView(true);
    renderApp();
  }
}

// --- Render Updates ---
function renderApp() {
  // If game is not started, force show setup overlay
  if (!gameState.gameStarted) {
    handleToggleRegisterView(true);
    renderSetupTeamsList();
    updateSetupStartButton();
  } else {
    handleToggleRegisterView(false);
  }

  renderBoard();
  renderLeaderboard();
  updateHeaderActiveTurn();
}

function renderSetupTeamsList() {
  const container = document.getElementById('registered-teams-list');
  if (!container) return;
  
  if (gameState.teams.length === 0) {
    container.innerHTML = '<div class="empty-state">No teams registered yet.</div>';
    return;
  }

  container.innerHTML = '';
  gameState.teams.forEach(team => {
    const item = document.createElement('div');
    item.className = 'registered-item';
    item.innerHTML = `
      <div class="reg-team-info">
        <span class="reg-team-name">${team.name}</span>
        <span class="reg-team-members">${team.members.join(', ')}</span>
      </div>
      <button class="btn-remove-team" onclick="handleRemoveTeam('${team.id}')" title="Remove Team">
        <i class="fa-solid fa-trash"></i>
      </button>
    `;
    container.appendChild(item);
  });
}

function renderBoard() {
  // Select all grid cards and update their classes based on solved status
  const cards = document.querySelectorAll('.grid-card');
  cards.forEach(card => {
    const category = card.dataset.category;
    const points = card.dataset.points;
    const key = `${category}-${points}`;
    
    if (gameState.resolvedCards.includes(key)) {
      card.classList.add('done');
    } else {
      card.classList.remove('done');
    }
  });
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboard-list');
  if (!container) return;

  if (gameState.teams.length === 0) {
    container.innerHTML = '<div class="empty-state">No registered teams.</div>';
    return;
  }

  // Create a copy and sort by score ASCENDING ('0' points goal!)
  const sortedTeams = [...gameState.teams].sort((a, b) => a.score - b.score);

  container.innerHTML = '';
  sortedTeams.forEach((team, index) => {
    // Find index in original array to see if active turn
    const originalIndex = gameState.teams.findIndex(t => t.id === team.id);
    const isActiveTurn = gameState.gameStarted && (originalIndex === gameState.activeTeamIndex);
    
    const item = document.createElement('div');
    item.className = 'leaderboard-item';
    if (isActiveTurn) {
      item.classList.add('active-turn');
    }
    
    // Choose score badge class based on progress
    let scoreClass = 'high';
    if (team.score <= 400) {
      scoreClass = 'excellent'; // Close to 0!
    } else if (team.score > 1200) {
      scoreClass = 'poor'; // Accumulating too many points
    }

    item.innerHTML = `
      <div class="rank-badge">${index + 1}</div>
      <div class="team-info">
        <div class="team-title-row">
          <span class="team-name">${team.name}</span>
          ${isActiveTurn ? '<span class="active-badge">Active Turn</span>' : ''}
        </div>
        <div class="team-members">${team.members.join(', ')}</div>
      </div>
      <div class="score-badge">
        <div class="score-value ${scoreClass}">${team.score}</div>
      </div>
    `;
    container.appendChild(item);
  });
}

function updateHeaderActiveTurn() {
  const headerActive = document.getElementById('header-active-team');
  if (!headerActive) return;

  if (!gameState.gameStarted || gameState.teams.length === 0) {
    headerActive.innerText = "Game Setup Mode";
    headerActive.style.textShadow = 'none';
    headerActive.style.color = 'var(--text-muted)';
    return;
  }

  const team = gameState.teams[gameState.activeTeamIndex];
  if (team) {
    headerActive.innerText = team.name;
    headerActive.style.color = 'var(--color-tech)';
    headerActive.style.textShadow = '0 0 8px rgba(0, 229, 255, 0.4)';
  } else {
    headerActive.innerText = "No active team";
  }
}

// --- Toast System ---
function showToast(message, type = "info") {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconClass = 'fa-circle-info';
  if (type === 'success') iconClass = 'fa-circle-check';
  if (type === 'error') iconClass = 'fa-circle-xmark';
  if (type === 'warning') iconClass = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${iconClass}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);

  // Trigger Slideout and cleanup after 4s
  setTimeout(() => {
    toast.classList.add('toast-fadeout');
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 4000);
}
