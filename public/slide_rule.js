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

const currentDate = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
}).format(new Date());
const formattedDate = currentDate.replace(/\//g, '');

const socket = new WebSocket(`${window.location.origin.replace('http', 'ws')}/connect?date=${formattedDate}`);

socket.addEventListener('open', (event) => {
  socket.send(JSON.stringify({ type: 'initial' }));
});

socket.addEventListener('message', (event) => {
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
  console.log('WebSocket connection closed');
});

socket.addEventListener('error', (event) => {
  console.error('WebSocket error:', event);
});