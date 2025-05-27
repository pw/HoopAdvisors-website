// Helper function to get formatted date
function getFormattedDate() {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('date')) {
    return urlParams.get('date');
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

// WebSocket helper functions
function createWebSocket(store) {
  const wsUrl = window.location.hostname === 'localhost'
    ? 'wss://hoopadvisors-website.pw3.workers.dev/connect'
    : `${window.location.origin.replace('http', 'ws')}/connect`;

  const socket = new WebSocket(`${wsUrl}?date=${store.formattedDate}`);

  socket.addEventListener('open', (event) => {
    console.log('WebSocket connected');
    socket.send(JSON.stringify({ type: 'initial' }));
  });

  socket.addEventListener('message', (event) => {
    console.log('message', event);
    const data = JSON.parse(event.data);
    
    if (data.type === 'initial') {
      data.games.forEach(game => {
        store.update(game);
      });
    } else if (data.type === 'final') {
      store.update(data);
      if (!data.qualified) {
        store.deleteGame(data.gameId);
      }
    } else if (data.type === 'update') {
      store.update(data);
    }
  });

  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed, attempting to reconnect...');
    setTimeout(() => createWebSocket(store), 1000);
  });

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });

  return socket;
}

// Initialize Alpine store and register functions
document.addEventListener('alpine:init', () => {
  const formattedDate = getFormattedDate();

  // Initialize the store
  Alpine.store('games', {
    all: [],
    formattedDate: formattedDate,
    hiddenGames: new Set(JSON.parse(localStorage.getItem('hiddenGames') || '[]')),
    
    hideGame(gameId) {
      this.hiddenGames.add(gameId);
      localStorage.setItem('hiddenGames', JSON.stringify([...this.hiddenGames]));
    },
    
    unhideGame(gameId) {
      this.hiddenGames.delete(gameId);
      localStorage.setItem('hiddenGames', JSON.stringify([...this.hiddenGames]));
    },
    
    unhideAllGames() {
      this.hiddenGames.clear();
      localStorage.setItem('hiddenGames', JSON.stringify([]));
    },
    
    isHidden(gameId) {
      return this.hiddenGames.has(gameId);
    },
    
    sortGames() {
      this.all.sort((a, b) => {
        // First, push disqualified games to the bottom
        if (a.disqualified && !b.disqualified) return 1;
        if (!a.disqualified && b.disqualified) return -1;
        
        // Then sort by qualification status
        const aQualified = a.qualified && !a.disqualified;
        const bQualified = b.qualified && !b.disqualified;
        if (aQualified && !bQualified) return -1;
        if (!aQualified && bQualified) return 1;
        
        // Finally sort by qualifier score
        return b.qualifierSort - a.qualifierSort;
      });
    },
    
    deleteGame(gameId) {
      const index = this.all.findIndex(game => game.gameId === gameId);
      if (index !== -1) {
        this.all.splice(index, 1);
      }
    },
    
    update(game_update) {
      const existingIndex = this.all.findIndex(game => game.gameId === game_update.gameId);
      if (existingIndex !== -1) {
        this.all[existingIndex] = game_update;
      } else {
        this.all.push(game_update);
      }
      this.sortGames();
    }
  });

  // Register global functions that need access to Alpine
  window.getGameData = async function() {
    try {
      const response = await fetch('/api/get-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date: Alpine.store('games').formattedDate })
      });
      
      const result = await response.json();
      if (result.success) {
        alert('Data loading');
      } else {
        alert('Cannot load data');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('error!');
    }
  };
  
  window.rescrapeGame = async function(gameId, date) {
    try {
      const response = await fetch('/api/rescrape-game', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gameId, date })
      });
      
      const result = await response.json();
      if (result.success) {
        alert(`Re-scraping game ${gameId}...`);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error re-scraping game:', error);
      alert('Failed to re-scrape game');
    }
  };
});

// Initialize WebSocket after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Start WebSocket connection
  let socket = createWebSocket(Alpine.store('games'));
  
  // Add CSS for pulse animation and swipe functionality
  const style = document.createElement('style');
  style.textContent = `
    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.6; }
      100% { opacity: 1; }
    }

    .pulse-animation {
      animation: pulse 1.5s infinite ease-in-out;
      font-size: 0.85rem;
      padding: 6px 8px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }

    /* Larger spread pill and value */
    .larger-spread-pill {
      font-size: 1rem !important;
      padding: 6px 10px !important;
      font-weight: 700 !important;
      letter-spacing: 0.7px !important;
      background-color: #ADFF2F !important; /* Highlighter green */
      color: black !important;
    }

    .larger-spread-value {
      font-size: 1rem !important;
      padding: 6px 10px !important;
      font-weight: 700 !important;
      background-color: #ADFF2F !important; /* Highlighter green */
      color: black !important;
    }
    
    /* Swipe animation styles */
    .relative-position {
      position: relative;
      touch-action: pan-y;
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      user-select: none;
    }
    
    .swipe-animation {
      will-change: transform;
    }
    
    .hidden-game {
      opacity: 0.7;
      border-left: 4px solid #dc3545 !important;
    }
    
    /* Swipe container setup - completely different approach */
    .swipe-container {
      position: relative;
      overflow: hidden;
      margin-bottom: -1px; /* Fix border overlap issue */
    }
    
    /* Unified background panel with dynamic coloring */
    .swipe-background {
      position: absolute;
      top: 0;
      bottom: 0;
      width: 100%;
      display: flex;
      align-items: center;
      z-index: 0;
    }
    
    /* Position icons within the background */
    .hide-icon {
      margin-left: auto;
      margin-right: 20px;
    }
    
    .unhide-icon {
      margin-right: auto;
      margin-left: 20px;
    }
    
    /* The sliding content */
    .swipe-content {
      position: relative;
      z-index: 1;
      margin-bottom: 0; /* Override list group margin */
      background-color: white; /* Ensure it covers background */
    }
    
    /* Style the action icon that appears in the background */
    .swipe-action-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: white;
      font-weight: bold;
      padding: 0 20px;
    }
    
    .swipe-action-icon i {
      font-size: 1.5rem;
      margin-bottom: 5px;
    }
    
    /* Override background for qualified/disqualified items */
    .bg-success-subtle.swipe-content {
      background-color: rgba(25, 135, 84, 0.1); /* Match Bootstrap success-subtle */
    }
    
    .bg-danger-subtle.swipe-content {
      background-color: rgba(220, 53, 69, 0.1); /* Match Bootstrap danger-subtle */
    }
    
    /* Hidden game styling - used by filter system */
    .hidden-game {
      opacity: 0.7;
      border-left: 4px solid #dc3545 !important;
    }
    
    /* Add swipe hint indicator for mobile - subtle indicator that swiping is available */
    @media (max-width: 768px) {
      .list-group-item:after {
        content: "";
        position: absolute;
        top: 50%;
        right: 10px;
        width: 6px;
        height: 6px;
        border-top: 2px solid rgba(0,0,0,0.2);
        border-right: 2px solid rgba(0,0,0,0.2);
        transform: translateY(-50%) rotate(45deg);
      }
    }
  `;
  document.head.appendChild(style);
}); 