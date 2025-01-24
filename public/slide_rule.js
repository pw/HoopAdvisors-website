// Initialize the store first
document.addEventListener('alpine:init', () => {
  Alpine.store('games', {
    all: [],
    
    sortGames() {
      this.all.sort((a, b) => {
        if (a.hasComeback && !b.hasComeback) return -1;
        if (!a.hasComeback && b.hasComeback) return 1;
        
        if (a.awayLeadBy10OrMore && b.awayLeadBy10OrMore && !a.hasComeback && !b.hasComeback) {
          return b.maxHomeLead - a.maxHomeLead;
        }
        
        if (a.awayLeadBy10OrMore && !b.awayLeadBy10OrMore) return -1;
        if (!a.awayLeadBy10OrMore && b.awayLeadBy10OrMore) return 1;
        
        if (!a.awayLeadBy10OrMore && !b.awayLeadBy10OrMore) {
          return b.maxAwayLead - a.maxAwayLead;
        }
        
        return 0;
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
});

let formattedDate;
// get formatted date from query params if available
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.has('date')) {
  formattedDate = urlParams.get('date');
} else {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  formattedDate = `${year}${month}${day}`;
}

// Use production WebSocket URL if running locally
const wsUrl = window.location.hostname === 'localhost' 
  ? 'wss://hoopadvisors.pw3.workers.dev/connect'  // Production URL
  : `${window.location.origin.replace('http', 'ws')}/connect`;

let socket = null;

function connectWebSocket() {
  socket = new WebSocket(`${wsUrl}?date=${formattedDate}`);

  socket.addEventListener('open', (event) => {
    console.log('WebSocket connected');
    socket.send(JSON.stringify({ type: 'initial' }));
  });

  socket.addEventListener('message', (event) => {
    console.log('message', event);
    const data = JSON.parse(event.data);
    
    // Handle initial connection message with multiple games
    if (data.type === 'initial') {
      data.games.forEach(game => {
        Alpine.store('games').update(game);
      });
    } else if (data.type === 'final') {
      Alpine.store('games').update(data);
      if (!data.hasComeback) {
        Alpine.store('games').deleteGame(data.gameId);
      }
    } else if (data.type === 'update') {
      // Handle regular single-game updates
      Alpine.store('games').update(data);
    }
  });

  socket.addEventListener('close', (event) => {
    console.log('WebSocket connection closed, attempting to reconnect...');
    connectWebSocket();
  });

  socket.addEventListener('error', (event) => {
    console.error('WebSocket error:', event);
  });
}

// Initial connection
connectWebSocket();