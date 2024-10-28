const socket = new WebSocket(`${window.location.origin.replace('http', 'ws')}/connect`);

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
  } else {
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

document.addEventListener('alpine:init', () => {
  Alpine.store('games', {
    all: [],
    
    // Add sorting method
    sortGames() {
      this.all.sort((a, b) => {
        // First priority: hasComeback games go first
        if (a.hasComeback && !b.hasComeback) return -1;
        if (!a.hasComeback && b.hasComeback) return 1;
        
        // Second priority: games with awayLeadBy10OrMore but no comeback
        // sorted by closestHomeLead (lowest to highest)
        if (a.awayLeadBy10OrMore && b.awayLeadBy10OrMore && !a.hasComeback && !b.hasComeback) {
          return a.closestHomeLead - b.closestHomeLead;
        }
        
        // If one game has awayLeadBy10OrMore and the other doesn't,
        // the one with awayLeadBy10OrMore goes first
        if (a.awayLeadBy10OrMore && !b.awayLeadBy10OrMore) return -1;
        if (!a.awayLeadBy10OrMore && b.awayLeadBy10OrMore) return 1;
        
        // Last priority: remaining games sorted by maxAwayLead (highest to lowest)
        if (!a.awayLeadBy10OrMore && !b.awayLeadBy10OrMore) {
          return b.maxAwayLead - a.maxAwayLead;
        }
        
        return 0;
      });
    },
    
    // Modified update method to include sorting
    update(game_update) {
      const existingIndex = this.all.findIndex(game => game.gameId === game_update.gameId);
      if (existingIndex !== -1) {
        this.all[existingIndex] = game_update;
      } else {
        this.all.push(game_update);
      }
      this.sortGames(); // Sort after every update
    },
  });
});