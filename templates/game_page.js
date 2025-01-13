import { html } from 'hono/html'
import { raw } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const gamePage = (data) => {
  const lastPlay = data[data.length - 1] || {}
  
  // Helper function to create progress bar
  const createMomentumBar = (value, target, label) => {
    const absValue = Math.abs(value)
    const percentage = Math.min((absValue / target) * 100, 100)
    const barColor = value > 0 ? 'bg-success' : 'bg-danger'
    
    return html`
      <div class="momentum-metric mb-2">
        <div class="d-flex justify-content-between mb-1">
          <small>+${label}: ${absValue}/${target}</small>
        </div>
        <div class="progress" style="height: 10px;">
          <div class="${barColor}" role="progressbar" style="width: ${percentage}%" 
               aria-valuenow="${absValue}" aria-valuemin="0" aria-valuemax="${target}"></div>
        </div>
      </div>
    `
  }

  const content = html`
  <main class="container mt-4">
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h3 class="mb-0">
            ${lastPlay.awayTeam}@${lastPlay.homeTeam}
          </h3>
          <div class="text-muted">
            ${lastPlay.date}
          </div>
        </div>
        
        <div class="row g-3">
          <!-- Segment Differentials -->
          <div class="col-md-8">
            <h5 class="mb-3">5-Minute Segment Differentials</h5>
            <div class="row g-2">
              <!-- First Half -->
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">20:00-15:00 1H</small>
                    <h6 class="mb-0 ${lastPlay.segmentOneDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentOneDiff > 0 ? '+' : ''}${lastPlay.segmentOneDiff}
                    </h6>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">15:00-10:00 1H</small>
                    <h6 class="mb-0 ${lastPlay.segmentTwoDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentTwoDiff > 0 ? '+' : ''}${lastPlay.segmentTwoDiff}
                    </h6>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">10:00-5:00 1H</small>
                    <h6 class="mb-0 ${lastPlay.segmentThreeDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentThreeDiff > 0 ? '+' : ''}${lastPlay.segmentThreeDiff}
                    </h6>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">5:00-0:00 1H</small>
                    <h6 class="mb-0 ${lastPlay.segmentFourDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentFourDiff > 0 ? '+' : ''}${lastPlay.segmentFourDiff}
                    </h6>
                  </div>
                </div>
              </div>
              
              <!-- Second Half -->
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">20:00-15:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentFiveDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentFiveDiff > 0 ? '+' : ''}${lastPlay.segmentFiveDiff}
                    </h6>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">15:00-10:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentSixDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentSixDiff > 0 ? '+' : ''}${lastPlay.segmentSixDiff}
                    </h6>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">10:00-5:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentSevenDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentSevenDiff > 0 ? '+' : ''}${lastPlay.segmentSevenDiff}
                    </h6>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">5:00-0:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentEightDiff > 0 ? 'text-success' : 'text-danger'}">
                      ${lastPlay.segmentEightDiff > 0 ? '+' : ''}${lastPlay.segmentEightDiff}
                    </h6>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Momentum Metrics -->
          <div class="col-md-4">
            <h5 class="mb-3">Momentum Metrics</h5>
            <div class="momentum-metrics">
              ${createMomentumBar(lastPlay.plusTwelve, 12, '12')}
              ${createMomentumBar(lastPlay.plusFifteen, 15, '15')}
              ${createMomentumBar(lastPlay.plusSeventeen, 17, '17')}
              ${createMomentumBar(lastPlay.plusTwelve1_2, 12, '12₁_₂')}
              ${createMomentumBar(lastPlay.plusTwelve2_2, 12, '12₂_₂')}
            </div>
            <div class="mt-2">
              <small class="text-muted">Overall Diff: 
                <span class="${lastPlay.overallDiff > 0 ? 'text-success' : 'text-danger'}">
                  ${lastPlay.overallDiff > 0 ? '+' : ''}${lastPlay.overallDiff}
                </span>
              </small>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th class="text-nowrap" style="width: 1%">Time</th>
              <th class="text-nowrap" style="width: 1%">${lastPlay.awayTeam}</th>
              <th class="text-nowrap" style="width: 1%">${lastPlay.homeTeam}</th>              
              <th>Play</th>
              <th class="text-nowrap" style="width: 1%">${lastPlay.awayTeam}</th>
              <th class="text-nowrap" style="width: 1%">${lastPlay.homeTeam}</th> 
              <th class="text-nowrap text-end" style="width: 1%">Diff</th>
            </tr>
          </thead>
          <tbody>
            ${raw(data.map(play => `
              <tr>
                <td class="text-nowrap" style="width: 1%">${play.timestamp}</td>
                <td class="text-nowrap" style="width: 1%">${play.awayScore}</td>
                <td class="text-nowrap" style="width: 1%">${play.homeScore}</td>
                <td>${play.playOwner} - ${play.playDescription}</td>
                <td class="text-nowrap" style="width: 1%">${play.awayPlayScore}</td>
                <td class="text-nowrap" style="width: 1%">${play.homePlayScore}</td>
                <td class="text-nowrap text-end" style="width: 1%">
                  ${play.playScoreDiff > 0 ? `<span class="text-success">+${play.playScoreDiff}</span>` : 
                    play.playScoreDiff < 0 ? `<span class="text-danger">${play.playScoreDiff}</span>` : 
                    play.playScoreDiff}
                </td>
              </tr>
            `).join(''))}
          </tbody>
        </table>
      </div>
    </div>
  </main>
  `
  return LayoutWithNavbar({
    title: 'Game Details - HoopAdvisors',
    children: content
  })
}