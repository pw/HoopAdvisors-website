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
      if (!data.hasComeback) {
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
    isLoading: false,
    
    async fetchHistoricalGames(startDate, endDate) {
      this.isLoading = true;
      try {
        const response = await fetch(
          `/api/historical-games?start_date=${startDate}${endDate ? `&end_date=${endDate}` : ''}`
        );
        const data = await response.json();
        if (data.success) {
          // Replace all games with historical data
          this.all = data.games;
          this.sortGames();
        } else {
          console.error('Failed to fetch historical games');
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        this.isLoading = false;
      }
    },
    
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
    },

    applyDate() {
      if (!this.selectedDate) return;
      
      if (this.isDateRange && this.selectedEndDate) {
        // For date ranges, use the API endpoint
        $store.games.fetchHistoricalGames(
          this.formatDateForStore(this.selectedDate),
          this.formatDateForStore(this.selectedEndDate)
        );
      } else {
        // For single date, use WebSocket (existing behavior)
        window.location.href = '/lead_tracker?date=' + this.formatDateForStore(this.selectedDate);
      }
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
});

// Initialize WebSocket after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Start WebSocket connection
  let socket = createWebSocket(Alpine.store('games'));
});