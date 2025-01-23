import { html } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const momentumPage = (data) => {
  const content = html`
  <main x-data="{ debug: new URLSearchParams(window.location.search).has('debug') }" class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Momentum Qualifiers</h5>
      </div>
      <div class="card-body p-0">
        <ul class="list-group list-group-flush">
          <template x-for="game in $store.games.all" :key="game.gameId">
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
                  <template x-if="debug || game.activeQualifiers.includes('plusFifteen')">
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
                  <template x-if="debug || game.activeQualifiers.includes('plusTwelve')">
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
                  <template x-if="debug || game.activeQualifiers.includes('plusTwelve1_2')">
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
                  <template x-if="debug || game.activeQualifiers.includes('plusTwelve2_2')">
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