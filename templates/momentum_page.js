import { html } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const momentumPage = (data) => {
  const content = html`
  <main x-data="{ 
    debug: new URLSearchParams(window.location.search).has('debug'),
    showFinished: true,
    showAll: false,
    date: new URLSearchParams(window.location.search).get('date') || (() => {
      const now = new Date();
      return now.getFullYear() + 
             String(now.getMonth() + 1).padStart(2, '0') + 
             String(now.getDate()).padStart(2, '0');
    })(),
    selectedDate: null,
    applyDate() {
      if (!this.selectedDate) return;
      const newDate = this.selectedDate.replace(/-/g, '');
      window.location.href = '/qualifiers?date=' + newDate + 
        (this.showAll ? '&debug=true' : '');
    }
  }" class="container mt-4">
    <!-- Controls Toolbar -->
    <div class="card shadow mb-3">
      <div class="card-body">
        <div class="row row-cols-1 row-cols-md-3 g-3">
          <!-- Date Selector -->
          <div class="col">
            <div class="d-flex align-items-center gap-2">
              <div class="flex-grow-1">
                <label for="dateSelect" class="form-label mb-1">Date:</label>
                <div class="input-group">
                  <input 
                    type="date" 
                    class="form-control" 
                    id="dateSelect"
                    :value="date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')"
                    @change="selectedDate = $event.target.value"
                  >
                  <button 
                    class="btn btn-primary d-md-none" 
                    type="button"
                    @click="applyDate()"
                    :disabled="!selectedDate"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
          <!-- Show All Metrics Toggle -->
          <div class="col">
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
          </div>
          <!-- Show Finished Games Toggle -->
          <div class="col">
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
          <template x-for="game in $store.games.all.filter(g => showFinished || g.type !== 'final')" :key="game.gameId">
            <li class="list-group-item" :class="{'bg-success-subtle': game.qualified}">
              <div class="row align-items-center g-3">
                <!-- Left Section: Links and Teams -->
                <div class="col-12 col-sm-3">
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
                
                <!-- Middle Section: Progress Bars -->
                <div class="col-12 col-sm-7">
                  <!-- +15 Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusFifteen')">
                    <div class="mb-2">
                      <small class="text-muted">+15:</small>
                      <div class="progress">
                        <div class="progress-bar" 
                             :class="game.plusFifteen > 0 ? 'bg-success' : 'bg-danger'"
                             :style="{ width: (Math.min(Math.abs(game.plusFifteen) / 15 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusFifteen)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- +12 Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusTwelve')">
                    <div class="mb-2">
                      <small class="text-muted">+12:</small>
                      <div class="progress">
                        <div class="progress-bar"
                             :class="game.plusTwelve > 0 ? 'bg-success' : 'bg-danger'"
                             :style="{ width: (Math.min(Math.abs(game.plusTwelve) / 12 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusTwelve)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- +12₁_₂ Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusTwelve1_2')">
                    <div class="mb-2">
                      <small class="text-muted">+12₁_₂:</small>
                      <div class="progress">
                        <div class="progress-bar"
                             :class="game.plusTwelve1_2 > 0 ? 'bg-success' : 'bg-danger'"
                             :style="{ width: (Math.min(Math.abs(game.plusTwelve1_2) / 12 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusTwelve1_2)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- +12₂_₂ Progress Bar -->
                  <template x-if="showAll || game.activeQualifiers.includes('plusTwelve2_2')">
                    <div class="mb-2">
                      <small class="text-muted">+12₂_₂:</small>
                      <div class="progress">
                        <div class="progress-bar"
                             :class="game.plusTwelve2_2 > 0 ? 'bg-success' : 'bg-danger'"
                             :style="{ width: (Math.min(Math.abs(game.plusTwelve2_2) / 12 * 100, 100)) + '%' }"
                             x-text="Math.abs(game.plusTwelve2_2)">
                        </div>
                      </div>
                    </div>
                  </template>

                  <!-- Qualified Status -->
                  <template x-if="game.qualified">
                    <div class="mt-2">
                      <i class="bi bi-check-circle-fill text-success me-2" title="Qualified"></i>
                      <small>
                        <span x-text="game.qualifiedTime"></span>
                        <span class="ms-2 text-muted" x-text="game.qualifiedBy"></span>
                      </small>
                    </div>
                  </template>
                </div>

                <!-- Right Section: Scores -->
                <div class="col-12 col-sm-2 text-end">
                  <template x-if="game.spread">
                    <span class="badge bg-info me-1">
                      <span x-text="game.spread"></span>
                    </span>
                  </template>
                  <span class="badge bg-secondary">
                    <span x-text="game.awayScore"></span> - <span x-text="game.homeScore"></span>
                  </span>
                  <template x-if="game.type === 'final'">
                    <span class="ms-1">𝐅</span>
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