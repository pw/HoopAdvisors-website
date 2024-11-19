import { html } from 'hono/html'
import { Layout } from './components.js'

export const slideRulePage = (data) => {
  const content = html`
  <header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">HoopAdvisors 🏀🏀🏀</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link active" aria-current="page" href="#">Home</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Games</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#">Teams</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
  
  <main x-data class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Home Team Slide Rule</h5>
      </div>
      <div class="card-body p-0">
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
                          :style="{ width: (((10 - game.maxHomeLead) / 8) * 100) + '%' }" 
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
                  <span class="badge bg-info">
                    <span x-text="game.spread"></span>
                  </span>
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

  return Layout({
    title: 'HoopAdvisors',
    children: content
  })
}