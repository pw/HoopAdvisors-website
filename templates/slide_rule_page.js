import { html } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const slideRulePage = (data) => {
  const content = html`
  <main x-data="{ 
    showControls: false,
    selectedDate: null,
    selectedEndDate: null,
    isDateRange: false,
    formatDateForInput(date) {
      return date.replace(/(\\d{4})(\\d{2})(\\d{2})/, '$1-$2-$3');
    },
    formatDateForStore(date) {
      return date.replace(/-/g, '');
    },
    init() {
      this.selectedDate = this.formatDateForInput($store.games.formattedDate);
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
                class="btn btn-primary" 
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
            <!-- Get Data Button -->
            <div class="mb-3">
              <button 
                class="btn btn-primary" 
                type="button"
                @click="getGameData()"
              >
                Get Data
              </button>
            </div>
            
            <!-- Empty space for future controls -->
            <div class="d-flex flex-column d-lg-flex flex-lg-row flex-grow-1 justify-content-start gap-3 gap-lg-5">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">10 Point Lead Tracker</h5>
      </div>
      <div class="card-body p-0">
        <template x-if="$store.games.isLoading">
          <div class="p-4 text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 mb-0">Loading games...</p>
          </div>
        </template>
        <ul class="list-group list-group-flush">
          <template x-for="game in $store.games.all" :key="game.gameId">
            <li class="list-group-item" 
                :class="{'bg-success-subtle': game.awayLeadBy10OrMore && game.hasComeback}">
              <div class="row align-items-center">
                <!-- Left Section: Link-out icon and team names -->
                <div class="col-5 col-sm-2">
                  <div class="d-flex align-items-center">
                    <a :href="game.url" target="_blank" class="me-2" aria-label="View Game Details">
                      <i class="bi bi-box-arrow-up-right"></i>
                    </a>          
                    <a :href="'/game?id=' + game.gameId" target="_blank" class="me-2" aria-label="View Game Details">
                      <i class="bi bi-box-arrow-up-right"></i>
                    </a>                            
                    <strong x-text="game.awayTeam + ' @ ' + game.homeTeam" class="text-truncate"></strong>
                  </div>
                </div>
                
                <!-- Middle Section: Progress Bars and Conditional Icons -->
                <div class="col-4 col-sm-8">
                  <div class="d-flex align-items-center">
                    <template x-if="!game.awayLeadBy10OrMore">
                      <div class="progress me-3" style="width: 100px;">
                        <div 
                          class="progress-bar bg-dark" 
                          role="progressbar" 
                          :style="{ width: (game.maxAwayLead * 10) + '%' }" 
                          aria-valuenow="game.maxAwayLead" 
                          aria-valuemin="0" 
                          aria-valuemax="100">
                        </div>
                      </div>
                    </template>
                    <template x-if="game.awayLeadBy10OrMore">
                      <i class="bi bi-check-circle-fill text-success me-3" title="Away lead achieved"></i>
                    </template>

                    <template x-if="game.awayLeadBy10OrMore && !game.hasComeback">
                      <div class="progress me-3" style="width: 100px;">
                        <div 
                          class="progress-bar bg-success" 
                          role="progressbar" 
                          :style="{ width: (((game.maxHomeLead + 10) / 8) * 100) + '%' }" 
                          aria-valuenow="game.maxHomeLead" 
                          aria-valuemin="0" 
                          aria-valuemax="100">
                        </div>
                      </div>
                    </template>
                    <template x-if="game.hasComeback">
                      <i class="bi bi-check-circle-fill text-success me-3" title="Comeback achieved"></i>
                    </template>
                    <template x-if="game.hasComeback">
                      <i class="bi bi-fire text-danger me-3" title="Explosion!"></i>
                    </template>
                    <template x-if="game.hasComeback && game.type !== 'final'">
                      <span x-text="game.comebackTime"></span>
                    </template>  
                    <template x-if="game.type === 'final'">
                      <span>𝐅</span>
                    </template>
                  </div>
                </div>

                <!-- Right Section: Scores -->
                <div class="col-3 col-sm-2 text-end">
                  <template x-if="game.spread">
                    <span class="badge bg-info">
                      <span x-text="game.spread"></span>
                    </span>
                  </template>
                  <span class="badge bg-secondary">
                    <span x-text="game.awayScore"></span> - <span x-text="game.homeScore"></span>
                  </span>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </main>
  <script src="/slide_rule.js"></script>
  `

  return LayoutWithNavbar({
    title: 'HoopAdvisors',
    children: content
  })
}