import { html } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const momentumPage = (data) => {
  const content = html`
  <main x-data="{ 
    debug: new URLSearchParams(window.location.search).has('debug'),
    showFinished: true,
    showDisqualified: false,
    showAll: false,
    showUnderReview: false,
    hideQualified: false,
    selectedDate: null,
    teamFilter: '',
    showControls: false,
    pinnedGames: new Set(),
    showHiddenGames: false,
    touchStartX: 0,
    touchEndX: 0,
    activeSwipeGameId: null,
    swipeThreshold: 80, // minimum distance in pixels to trigger swipe
    swipePosition: {}, // tracks current swipe position for each game
    processingOdds: false,
    
    // Format spread for display
    formatSpread(spread) {
      if (spread === 'ML' || spread === null) return 'ML';
      const numSpread = parseFloat(spread);
      return numSpread > 0 ? '+' + numSpread : String(numSpread);
    },
    
    // Process odds data for current date
    async processOdds() {
      this.processingOdds = true;
      try {
        const response = await fetch('/api/process-odds/' + $store.games.formattedDate, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          alert('Success! ' + result.message);
          // Reload the page to see updated results
          window.location.reload();
        } else {
          alert('Error: ' + (result.error || result.message || 'Failed to process odds data'));
        }
      } catch (error) {
        console.error('Error processing odds:', error);
        alert('Failed to process odds data');
      } finally {
        this.processingOdds = false;
      }
    },
    
    togglePin(gameId) {
      if (this.pinnedGames.has(gameId)) {
        this.pinnedGames.delete(gameId);
      } else {
        this.pinnedGames.add(gameId);
      }
    },
    
    // Swipe handlers
    handleTouchStart(e, gameId) {
      this.touchStartX = e.changedTouches[0].screenX;
      this.activeSwipeGameId = gameId;
      
      // Initialize this game's swipe position if it doesn't exist
      if (!this.swipePosition[gameId]) {
        this.swipePosition[gameId] = 0;
      }
    },
    
    handleTouchMove(e, gameId) {
      if (this.activeSwipeGameId !== gameId) return;
      
      const currentX = e.changedTouches[0].screenX;
      const diffX = currentX - this.touchStartX;
      
      // Limit how far we can swipe based on whether the item is hidden
      const isHidden = $store.games.isHidden(gameId);
      
      if (isHidden) {
        // If already hidden, only allow swiping right (to unhide)
        this.swipePosition[gameId] = Math.max(diffX, 0);
        
        // Only set background color if actively swiping
        if (diffX > 10) {
          // Adjust background colors
          document.querySelector('#game-' + gameId + ' .swipe-background').style.backgroundColor = '#198754'; // Green
          document.querySelector('#game-' + gameId + ' .swipe-background').style.color = '#000'; // Black text
          // Show the unhide icon
          document.querySelector('#game-' + gameId + ' .unhide-icon').style.opacity = '1';
        } else {
          // Hide icons when not actively swiping
          document.querySelector('#game-' + gameId + ' .swipe-background').style.backgroundColor = 'transparent';
          document.querySelector('#game-' + gameId + ' .unhide-icon').style.opacity = '0';
        }
      } else {
        // If visible, only allow swiping left (to hide)
        this.swipePosition[gameId] = Math.min(diffX, 0);
        
        // Only set background color if actively swiping
        if (diffX < -10) {
          // Adjust background colors
          document.querySelector('#game-' + gameId + ' .swipe-background').style.backgroundColor = '#dc3545'; // Red
          document.querySelector('#game-' + gameId + ' .swipe-background').style.color = '#000'; // Black text
          // Show the hide icon
          document.querySelector('#game-' + gameId + ' .hide-icon').style.opacity = '1';
        } else {
          // Hide icons when not actively swiping
          document.querySelector('#game-' + gameId + ' .swipe-background').style.backgroundColor = 'transparent';
          document.querySelector('#game-' + gameId + ' .hide-icon').style.opacity = '0';
        }
      }
    },
    
    handleTouchEnd(e, gameId) {
      if (this.activeSwipeGameId !== gameId) return;
      
      this.touchEndX = e.changedTouches[0].screenX;
      const diffX = this.touchEndX - this.touchStartX;
      
      // Determine if we should hide or unhide based on swipe direction and distance
      if (diffX < -this.swipeThreshold && !$store.games.isHidden(gameId)) {
        // Swiped left far enough to hide
        $store.games.hideGame(gameId);
        this.swipePosition[gameId] = -100; // Complete the animation
        
        // Reset position after animation completes
        setTimeout(() => {
          this.swipePosition[gameId] = 0;
        }, 300);
      } else if (diffX > this.swipeThreshold && $store.games.isHidden(gameId)) {
        // Swiped right far enough to unhide
        $store.games.unhideGame(gameId);
        this.swipePosition[gameId] = 0;
      } else {
        // Didn't swipe far enough, reset position
        this.swipePosition[gameId] = 0;
        
        // Reset the background and hide icons
        document.querySelector('#game-' + gameId + ' .swipe-background').style.backgroundColor = 'transparent';
        document.querySelector('#game-' + gameId + ' .hide-icon').style.opacity = '0';
        document.querySelector('#game-' + gameId + ' .unhide-icon').style.opacity = '0';
      }
      
      this.activeSwipeGameId = null;
      
      // After any swipe action, ensure the background is reset
      setTimeout(() => {
        if (!this.activeSwipeGameId) {
          // Reset background color on all items
          document.querySelectorAll('.swipe-background').forEach(el => {
            el.style.backgroundColor = 'transparent';
          });
          
          // Hide all swipe icons
          document.querySelectorAll('.swipe-action-icon').forEach(el => {
            el.style.opacity = '0';
          });
        }
      }, 300);
    },
    
    unhideAllGames() {
      $store.games.unhideAllGames();
    },
    
    sortGames(games) {
      return [...games].sort((a, b) => {
        // First sort by pinned status
        if (this.pinnedGames.has(a.gameId) && !this.pinnedGames.has(b.gameId)) return -1;
        if (!this.pinnedGames.has(a.gameId) && this.pinnedGames.has(b.gameId)) return 1;
        return 0;
      }).filter(game => {
        // Filter out hidden games if showHiddenGames is false
        return this.showHiddenGames || !$store.games.isHidden(game.gameId);
      });
    },
    
    formatDateForInput(date) {
      return date.replace(/(\\d{4})(\\d{2})(\\d{2})/, '$1-$2-$3');
    },
    formatDateForStore(date) {
      return date.replace(/-/g, '');
    },
    init() {
      this.selectedDate = this.formatDateForInput($store.games.formattedDate);
      
      // Load pinned games from localStorage if exists
      const pinnedGamesFromStorage = localStorage.getItem('pinnedGames');
      if (pinnedGamesFromStorage) {
        this.pinnedGames = new Set(JSON.parse(pinnedGamesFromStorage));
      }
      
      // Save pinned games to localStorage when changed
      this.$watch('pinnedGames', value => {
        localStorage.setItem('pinnedGames', JSON.stringify([...value]));
      });
    },
    applyDate() {
      if (!this.selectedDate) return;
      const newDate = this.formatDateForStore(this.selectedDate);
      window.location.href = '/qualifiers?date=' + newDate + 
        (this.showAll ? '&debug=true' : '');
    }
  }" 
  x-init="init()"
  class="container mt-4">
    <!-- Controls Toolbar -->
    <div class="card shadow mb-3">
      <div class="card-body">
        <div class="d-flex flex-column gap-3">
          <!-- Essential Controls Row -->
          <div class="d-flex align-items-center gap-3">
            <button 
              class="btn btn-outline-secondary" 
              @click="showControls = !showControls"
            >
              <i class="bi" :class="showControls ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
            </button>
            <div class="input-group">
              <input 
                type="date" 
                class="form-control" 
                id="dateSelect"
                :value="formatDateForInput(selectedDate)"
                @input="selectedDate = $event.target.value"
              >
              <button 
                class="btn btn-success" 
                type="button"
                @click="applyDate()"
                :disabled="!selectedDate"
              >
                Apply
              </button>
            </div>
          </div>

          <!-- Expanded Controls -->
          <div x-show="showControls" x-collapse>
            <!-- Search Bar -->
            <div class="mb-3">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="bi bi-search"></i>
                </span>
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Filter teams..." 
                  x-model="teamFilter"
                  @keydown.enter="$event.target.blur()"
                >
              </div>
            </div>

            <!-- Data Buttons -->
            <div class="mb-3 d-flex gap-2">
              <button 
                class="btn btn-outline-success bg-success border-success" 
                type="button"
                @click="getGameData()"
                style="color: #000000 !important; font-weight: bold;"
              >
                Get Data
              </button>
              
              <button 
                class="btn btn-outline-success bg-success border-success" 
                type="button"
                @click="processOdds()"
                :disabled="processingOdds"
                style="color: #000000 !important; font-weight: bold;"
              >
                <span x-show="!processingOdds">Process Odds Data</span>
                <span x-show="processingOdds">
                  <span class="spinner-border spinner-border-sm text-dark" role="status" aria-hidden="true"></span>
                  Processing...
                </span>
              </button>
            </div>

            <!-- Toggle Switches -->
            <div class="d-flex flex-column d-lg-flex flex-lg-row flex-grow-1 justify-content-start gap-3 gap-lg-5">
              <!-- Column 1 -->
              <div class="d-flex flex-column gap-3">
                <!-- Show All Metrics Toggle -->
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="showAllSwitch"
                    x-model="showAll"
                    @change="debug = showAll"
                  >
                  <label class="form-check-label" for="showAllSwitch">Show All Metrics</label>
                </div>
                <!-- Show Games Under Review Toggle -->
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="showUnderReviewSwitch"
                    x-model="showUnderReview"
                  >
                  <label class="form-check-label" for="showUnderReviewSwitch">Show Games Under Review</label>
                </div>
              </div>

              <!-- Column 2 -->
              <div class="d-flex flex-column gap-3">
                <!-- Show Finished Games Toggle -->
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="showFinishedSwitch"
                    x-model="showFinished"
                  >
                  <label class="form-check-label" for="showFinishedSwitch">Show Finished Games</label>
                </div>
                <!-- Hide Qualified Games Toggle -->
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="hideQualifiedSwitch"
                    x-model="hideQualified"
                  >
                  <label class="form-check-label" for="hideQualifiedSwitch">Hide Qualified Games</label>
                </div>
              </div>

              <!-- Column 3 -->
              <div class="d-flex flex-column gap-3">
                <!-- Show Higher Risk Picks Toggle -->
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="showDisqualifiedSwitch"
                    x-model="showDisqualified"
                  >
                  <label class="form-check-label" for="showDisqualifiedSwitch">Show Higher Risk Picks</label>
                </div>
                
                <!-- Show Hidden Games Toggle -->
                <div class="form-check form-switch">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    role="switch" 
                    id="showHiddenGamesSwitch"
                    x-model="showHiddenGames"
                  >
                  <label class="form-check-label" for="showHiddenGamesSwitch">Show Hidden Games</label>
                </div>
                
                <!-- Unhide All Games Button -->
                <div>
                  <button 
                    class="btn btn-sm btn-outline-secondary" 
                    @click="unhideAllGames()"
                    :disabled="$store.games.hiddenGames.size === 0"
                  >
                    <i class="bi bi-eye me-1"></i> Unhide All Games
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Momentum Qualifiers</h5>
      </div>
      <div class="card-body p-0">
        <ul class="list-group list-group-flush">
          <template x-for="game in sortGames($store.games.all.filter(g => 
            pinnedGames.has(g.gameId) || (
              (showFinished || g.type !== 'final') && 
              (showDisqualified || !g.disqualified) &&
              (!g.plusSeventeenStop || showUnderReview) &&
              (!hideQualified || !(g.qualified && !g.disqualified)) &&
              (!teamFilter || 
                g.homeTeam.toLowerCase().includes(teamFilter.toLowerCase()) || 
                g.awayTeam.toLowerCase().includes(teamFilter.toLowerCase()))
            )
          ))" :key="game.gameId">
            <!-- Simplified swipe container with a single dynamic background -->
            <div class="swipe-container" :id="'game-' + game.gameId">
              <!-- Background with dynamic color based on swipe direction -->
              <div class="swipe-background">
                <!-- Hide icon (shown when swiping left) -->
                <span class="swipe-action-icon hide-icon" x-show="!$store.games.isHidden(game.gameId)">
                  <i class="bi bi-eye-slash"></i>
                  <span>Hide</span>
                </span>
                
                <!-- Unhide icon (shown when swiping right) -->
                <span class="swipe-action-icon unhide-icon" x-show="$store.games.isHidden(game.gameId)">
                  <i class="bi bi-eye"></i>
                  <span>Unhide</span>
                </span>
              </div>
              
              <!-- The actual game row that will slide -->
              <li class="list-group-item border-bottom swipe-content" 
                :class="{
                  'bg-success-subtle': game.qualified && !game.disqualified,
                  'border-success border-opacity-25': game.qualified && !game.disqualified,
                  'bg-danger-subtle': game.disqualified,
                  'border-danger border-opacity-25': game.disqualified,
                  'hidden-game': $store.games.isHidden(game.gameId) && showHiddenGames
                }"
                :style="{ 
                  transform: 'translateX(' + (swipePosition[game.gameId] || 0) + 'px)',
                  transition: activeSwipeGameId === game.gameId ? 'none' : 'transform 0.3s ease'
                }"
                @touchstart="handleTouchStart($event, game.gameId)"
                @touchmove="handleTouchMove($event, game.gameId)"
                @touchend="handleTouchEnd($event, game.gameId)"
              >
              <div class="row align-items-center g-3">
                <!-- Left Section: Links and Teams -->
                <div class="col-7 col-md-3">
                  <div class="d-flex align-items-center">
                    <button 
                      @click="togglePin(game.gameId)" 
                      class="btn btn-link btn-sm p-0 me-2" 
                      :class="{ 'text-info': pinnedGames.has(game.gameId) }"
                      :title="pinnedGames.has(game.gameId) ? 'Unpin Game' : 'Pin Game'"
                    >
                      <i class="bi" :class="pinnedGames.has(game.gameId) ? 'bi-pin-fill' : 'bi-pin'"></i>
                    </button>
                    <a :href="game.url" target="_blank" class="me-2" aria-label="View Game Details">
                      <i class="bi bi-box-arrow-up-right"></i>
                    </a>          
                    <a :href="'/game?id=' + game.gameId" target="_blank" class="me-2" aria-label="View Game Details">
                      <i class="bi bi-box-arrow-up-right"></i>
                    </a>                            
                    <div class="d-flex align-items-center gap-2">
                      <div class="d-flex align-items-center">
                        <span class="badge bg-warning text-dark me-1" :title="game.awayTeam + ' Score'">
                          <span x-text="game.awayTeam"></span>
                          <span class="ms-1 fw-bold" x-text="game.awayScore"></span>
                        </span>
                      </div>
                      <div>@</div>
                      <div class="d-flex align-items-center">
                        <span class="badge bg-primary me-1" :title="game.homeTeam + ' Score'">
                          <span x-text="game.homeTeam"></span>
                          <span class="ms-1 fw-bold" x-text="game.homeScore"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <!-- Right Section: Original Spread + Final Indicator -->
                <div class="col-5 col-md-2 text-end order-md-last d-flex justify-content-end align-items-center gap-2">
                  <!-- Original Spread (moved from below) -->
                  <template x-if="game.spread">
                    <span class="badge bg-info me-2 unadjusted-spread">
                      <i class="bi bi-arrow-down-up me-1"></i>
                      <span x-text="game.spread"></span>
                    </span>
                  </template>
                  
                  <!-- Show Final indicator if game is over -->
                  <template x-if="game.type === 'final'">
                    <span class="final-indicator">𝐅</span>
                  </template>
                  
                  <!-- Re-scrape button -->
                  <button 
                    class="btn btn-sm btn-outline-secondary ms-2" 
                    @click="rescrapeGame(game.gameId, $store.games.formattedDate)"
                    title="Re-scrape this game"
                  >
                    <i class="bi bi-arrow-clockwise"></i>
                  </button>
                </div>

                <!-- Middle Section: Progress Bars -->
                <div class="col-12 col-md-7 order-md-2">
                  <!-- Original spread has been moved to the top right corner -->
                  <!-- Adjusted Spread Section (moved from above) -->
                  <div class="mb-3 bg-light p-2 rounded" x-show="game.homeAdjustedSpread !== null">
                    <div class="d-flex justify-content-between align-items-center">
                      <h6 class="mb-0">Adjusted Lines</h6>
                      <small class="text-muted">Recommended Spreads</small>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                      <!-- Away Team Adjusted Spread -->
                      <div class="d-flex align-items-center">
                        <span class="badge bg-warning text-dark" :title="game.awayTeam + ' Adjusted Spread'">
                          <span x-text="game.awayTeam"></span>
                          <span x-text="game.awayAdjustedSpread === 'ML' ? ' ML' : 
                            (game.awayAdjustedSpread > 0 ? ' +' + game.awayAdjustedSpread : ' ' + game.awayAdjustedSpread)"></span>
                        </span>
                      </div>
                      <!-- Home Team Adjusted Spread -->
                      <div class="d-flex align-items-center">
                        <span class="badge bg-primary" :title="game.homeTeam + ' Adjusted Spread'">
                          <span x-text="game.homeTeam"></span>
                          <span x-text="game.homeAdjustedSpread === 'ML' ? ' ML' : 
                            (game.homeAdjustedSpread > 0 ? ' +' + game.homeAdjustedSpread : ' ' + game.homeAdjustedSpread)"></span>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- +15 Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusFifteen') || game.plusFifteenTime">
                    <div class="mb-2">
                      <small class="text-muted">+15:</small>
                      <div class="progress">
                        <div class="progress-bar" 
                             :class="game.plusFifteen > 0 ? 'bg-primary' : 'bg-warning'"
                             :style="{ width: (Math.min(Math.abs(game.plusFifteen) / 15 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusFifteen)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- +12 Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusTwelve') || game.plusTwelveTime">
                    <div class="mb-2">
                      <small class="text-muted">+12:</small>
                      <div class="progress">
                        <div class="progress-bar"
                             :class="game.plusTwelve > 0 ? 'bg-primary' : 'bg-warning'"
                             :style="{ width: (Math.min(Math.abs(game.plusTwelve) / 12 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusTwelve)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- +12₁_₂ Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusTwelve1_2') || game.plusTwelve1_2Time">
                    <div class="mb-2">
                      <small class="text-muted">+12₁_₂:</small>
                      <div class="progress">
                        <div class="progress-bar"
                             :class="game.plusTwelve1_2 > 0 ? 'bg-primary' : 'bg-warning'"
                             :style="{ width: (Math.min(Math.abs(game.plusTwelve1_2) / 12 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusTwelve1_2)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- +12₂_₂ Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusTwelve2_2') || game.plusTwelve2_2Time">
                    <div class="mb-2">
                      <small class="text-muted">+12₂_₂:</small>
                      <div class="progress">
                        <div class="progress-bar"
                             :class="game.plusTwelve2_2 > 0 ? 'bg-primary' : 'bg-warning'"
                             :style="{ width: (Math.min(Math.abs(game.plusTwelve2_2) / 12 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusTwelve2_2)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Qualified Status -->
                  <template x-if="game.qualified">
                    <div class="mt-2">
                      <i class="bi bi-check-circle-fill me-2" 
                         :class="game.qualifiedTeam === 'home' ? 'text-primary' : 'text-warning'"
                         :title="game.qualifiedTeam === 'home' ? 'Home Team Qualified' : 'Away Team Qualified'"
                         title="Qualified"></i>
                      <small>
                        <span x-text="game.qualifiedBy"></span>
                        <span class="ms-2" x-text="game.qualifiedTime"></span>
                        <span class="ms-1 text-muted">
                          (<span x-text="game.qualifiedGameTime"></span>)
                        </span>
                      </small>
                    </div>
                  </template>
                  
                  <!-- Live Spread (appears when qualified) -->
                  <template x-if="game.qualified && game.qualifierLiveSpread !== null">
                    <div class="mt-2 d-flex align-items-center flex-wrap">
                      <span class="badge bg-success me-2 mb-1 pulse-animation larger-spread-pill">SPREAD TO TAKE</span>
                      <span class="badge bg-light text-dark border border-success fw-bold me-2 mb-1 spread-to-take-value larger-spread-value">
                        <span x-text="game.qualifiedTeam === 'home' ? game.homeTeam.substring(0, 3) : game.awayTeam.substring(0, 3)"></span>
                        <span x-text="game.qualifierLiveSpread === 'ML' ? ' ML' :
                          (game.qualifierLiveSpread > 0 ? ' +' + game.qualifierLiveSpread : ' ' + game.qualifierLiveSpread)"></span>
                      </span>

                      <!-- Two-minute wait countdown is disabled -->
                    </div>
                  </template>
                  <!-- Higher Risk Pick Status -->
                  <template x-if="game.disqualified">
                    <div class="mt-2">
                      <i class="bi bi-exclamation-triangle-fill me-2 text-danger" 
                         title="Higher Risk Pick"></i>
                      <small>
                        <span x-text="game.disqualifiedBy"></span>
                        <span class="ms-2" x-text="game.disqualifiedTime"></span>
                        <span class="ms-1 text-muted">
                          (<span x-text="game.disqualifiedGameTime"></span>)
                        </span>
                      </small>
                    </div>
                  </template>
                  <!-- +17 Stop Status -->
                  <template x-if="game.plusSeventeenStop">
                    <div class="mt-2">
                      <small class="text-muted">+17: 
                        <i class="bi bi-octagon-fill text-danger" title="Stop"></i>
                      </small>
                    </div>
                  </template>
                  
                  <!-- Odds API Results Display -->
                  <template x-if="game.oddsResult">
                    <div class="mt-2 d-flex align-items-center flex-wrap">
                      <span class="badge me-2"
                        :class="{
                          'bg-success': game.oddsResult.result === 'WINNER',
                          'bg-danger': game.oddsResult.result === 'LOSER',
                          'bg-secondary': game.oddsResult.result === 'NO LINE'
                        }"
                      >
                        <span x-text="game.oddsResult.result"></span>
                      </span>
                      
                      <!-- Show details for matches -->
                      <template x-if="game.oddsResult.matchDetails">
                        <small class="text-muted">
                          <span x-text="game.oddsResult.matchDetails.bookmaker"></span>
                          <span> offered </span>
                          <strong x-text="formatSpread(game.oddsResult.matchDetails.spreadOffered)"></strong>
                          <span> at </span>
                          <span x-text="game.oddsResult.matchDetails.timestamp.slice(11, 16)"></span>
                        </small>
                      </template>
                      
                      <!-- Show reason for NO LINE -->
                      <template x-if="game.oddsResult.result === 'NO LINE' && game.oddsResult.reason">
                        <small class="text-muted ms-1" x-text="game.oddsResult.reason"></small>
                      </template>
                    </div>
                  </template>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </main>
  <script src="/momentum.js"></script>
  `

  return LayoutWithNavbar({
    title: 'Momentum - HoopAdvisors',
    children: content
  })
} 