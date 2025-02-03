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
        <div class="d-flex flex-column flex-md-row gap-4">
          <!-- Date Selector -->
          <div class="d-flex flex-column gap-2">
            <div class="d-flex align-items-start gap-2">
              <label for="dateSelect" class="form-label mb-0">Date:</label>
              <div class="input-group">
                <input 
                  type="date" 
                  class="form-control" 
                  id="dateSelect"
                  :value="date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')"
                  @change="selectedDate = $event.target.value"
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
            <button 
              class="btn btn-primary" 
              type="button"
              @click="getGameData()"
            >
              Get Data
            </button>
          </div>

          <!-- Toggles Container -->
          <div class="d-flex flex-column d-md-flex flex-md-row flex-grow-1 justify-content-start gap-3 gap-md-5">
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
              <!-- Show Disqualified Games Toggle -->
              <div class="form-check form-switch">
                <input 
                  class="form-check-input" 
                  type="checkbox" 
                  role="switch" 
                  id="showDisqualifiedSwitch"
                  x-model="showDisqualified"
                >
                <label class="form-check-label" for="showDisqualifiedSwitch">Show Disqualified Games</label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Card -->
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Momentum Qualifiers - <span x-text="formattedDate"></span></h5>
      </div>
      <div class="card-body p-0">
        <ul class="list-group list-group-flush">
          <template x-for="game in $store.games.all.filter(g => 
            (showFinished || g.type !== 'final') && 
            (showDisqualified || !g.disqualified) &&
            (!g.plusSeventeenStop || showUnderReview) &&
            (!hideQualified || !g.qualified)
          )" :key="game.gameId">
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
                  <!-- Disqualified Status -->
                  <template x-if="game.disqualified">
                    <div class="mt-2">
                      <i class="bi bi-x-circle-fill me-2 text-dark" 
                         title="Disqualified"></i>
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
                    <ass="mt-2">
                      <small class="text-muted">+17: 
                        <i class="bi bi-octagon-fill text-danger" title="Stop"></i>
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