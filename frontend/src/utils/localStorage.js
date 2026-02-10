// Initialize default data
export const initializeData = () => {
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      {
        id: '1',
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        isBlocked: false,
        createdAt: new Date().toISOString(),
        lastLogin: null
      },
      {
        id: '2',
        username: 'user',
        password: 'user123',
        role: 'user',
        isBlocked: false,
        createdAt: new Date().toISOString(),
        lastLogin: null
      }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem('gameScores')) {
    localStorage.setItem('gameScores', JSON.stringify([]));
  }

  if (!localStorage.getItem('matchHistory')) {
    localStorage.setItem('matchHistory', JSON.stringify([]));
  }
};

// User Management
export const getUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const getUserById = (id) => {
  const users = getUsers();
  return users.find(u => u.id === id);
};

export const getUserByUsername = (username) => {
  const users = getUsers();
  return users.find(u => u.username === username);
};

export const createUser = (userData) => {
  const users = getUsers();
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    isBlocked: false,
    createdAt: new Date().toISOString(),
    lastLogin: null
  };
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  return newUser;
};

export const updateUser = (id, updates) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index] = { ...users[index], ...updates };
    localStorage.setItem('users', JSON.stringify(users));
    return users[index];
  }
  return null;
};

export const deleteUser = (id) => {
  const users = getUsers();
  const filtered = users.filter(u => u.id !== id);
  localStorage.setItem('users', JSON.stringify(filtered));
};

export const updateUserLastLogin = (id) => {
  updateUser(id, { lastLogin: new Date().toISOString() });
};

export const toggleBlockUser = (id) => {
  const user = getUserById(id);
  if (user) {
    updateUser(id, { isBlocked: !user.isBlocked });
  }
};

// Game Scores
export const getGameScores = () => {
  const scores = localStorage.getItem('gameScores');
  return scores ? JSON.parse(scores) : [];
};

export const addGameScore = (scoreData) => {
  const scores = getGameScores();
  const newScore = {
    id: Date.now().toString(),
    ...scoreData,
    timestamp: new Date().toISOString()
  };
  scores.push(newScore);
  localStorage.setItem('gameScores', JSON.stringify(scores));
  return newScore;
};

export const getUserScores = (userId) => {
  const scores = getGameScores();
  return scores.filter(s => s.userId === userId);
};

export const getTopScores = (limit = 10) => {
  const scores = getGameScores();
  return scores.sort((a, b) => b.score - a.score).slice(0, limit);
};

// Match History
export const getMatchHistory = () => {
  const history = localStorage.getItem('matchHistory');
  return history ? JSON.parse(history) : [];
};

export const addMatchHistory = (matchData) => {
  const history = getMatchHistory();
  const newMatch = {
    id: Date.now().toString(),
    ...matchData,
    timestamp: new Date().toISOString()
  };
  history.push(newMatch);
  localStorage.setItem('matchHistory', JSON.stringify(history));
  return newMatch;
};

export const getUserMatchHistory = (userId) => {
  const history = getMatchHistory();
  return history.filter(h => h.userId === userId);
};