import { html } from 'hono/html'
import { raw } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const gamePage = (data) => {
  const lastPlay = data[data.length - 1] || {}
  
  // Helper function to create progress bar
  const createMomentumBar = (value, target, label, timePeriod, actualTime) => {
    const absValue = Math.abs(value)
    const percentage = Math.min((absValue / target) * 100, 100)
    const barColor = value > 0 ? 'bg-primary' : 'bg-warning'
    
    return html`
      <div class="momentum-metric mb-2">
        <div class="d-flex justify-content-between mb-1">
          <small>+${label} (${timePeriod}): ${absValue}/${target}${actualTime ? ` @ ${actualTime}` : ''}</small>
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
                    <h6 class="mb-0 ${lastPlay.segmentOneDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentOneDiff > 0 ? '+' : ''}${lastPlay.segmentOneDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[1] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[1] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">15:00-10:00 1H</small>
                    <h6 class="mb-0 ${lastPlay.segmentTwoDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentTwoDiff > 0 ? '+' : ''}${lastPlay.segmentTwoDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[2] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[2] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">10:00-5:00 1H</small>
                    <h6 class="mb-0 ${lastPlay.segmentThreeDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentThreeDiff > 0 ? '+' : ''}${lastPlay.segmentThreeDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[3] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[3] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">5:00-0:00 1H</small>
                    <h6 class="mb-0 ${lastPlay.segmentFourDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentFourDiff > 0 ? '+' : ''}${lastPlay.segmentFourDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[4] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[4] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Second Half -->
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">20:00-15:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentFiveDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentFiveDiff > 0 ? '+' : ''}${lastPlay.segmentFiveDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[5] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[5] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">15:00-10:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentSixDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentSixDiff > 0 ? '+' : ''}${lastPlay.segmentSixDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[6] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[6] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">10:00-5:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentSevenDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentSevenDiff > 0 ? '+' : ''}${lastPlay.segmentSevenDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[7] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[7] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card h-100">
                  <div class="card-body p-2">
                    <small class="text-muted">5:00-0:00 2H</small>
                    <h6 class="mb-0 ${lastPlay.segmentEightDiff > 0 ? 'text-primary' : 'text-warning'}">
                      ${lastPlay.segmentEightDiff > 0 ? '+' : ''}${lastPlay.segmentEightDiff}
                    </h6>
                    <div class="d-flex justify-content-between">
                      <small class="text-warning">${lastPlay.awaySegmentPoints[8] || 0}</small>
                      <small class="text-primary">${lastPlay.homeSegmentPoints[8] || 0}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Momentum Metrics -->
          <div class="col-md-4">
            <h5 class="mb-3">Momentum Metrics</h5>
            <div class="momentum-metrics">              
              ${createMomentumBar(lastPlay.plusSeventeen, 17, '17', '20:00 to 10:00', lastPlay.plusSeventeenTime)}
              ${createMomentumBar(lastPlay.plusFifteen, 15, '15', '15:00 to 5:00', lastPlay.plusFifteenTime)}
              ${createMomentumBar(lastPlay.plusTwelve, 12, '12', '10:00 to HALF', lastPlay.plusTwelveTime)}
              ${createMomentumBar(lastPlay.plusTwelve1_2, 12, '12₁_₂', '20:00 to 10:00', lastPlay.plusTwelve1_2Time)}
              ${createMomentumBar(lastPlay.plusTwelve2_2, 12, '12₂_₂', '15:00 to 5:00', lastPlay.plusTwelve2_2Time)}
            </div>

            <!-- Two-sided Segments Progress Bar -->
            <div class="mt-3 mb-2">
              <small class="text-muted mb-1 d-block">Segments Progress (Target: 3)</small>
              <div class="position-relative" style="height: 20px;">
                <!-- Away Team (Left Side) -->
                <div class="position-absolute top-0 end-50 w-50">
                  <div class="progress" style="height: 20px; transform: rotate(180deg);">
                    <div class="bg-warning" role="progressbar" 
                         style="width: ${(Math.min(lastPlay.awaySegmentsPoints, 3) / 3) * 100}%" 
                         aria-valuenow="${lastPlay.awaySegmentsPoints}" 
                         aria-valuemin="0" 
                         aria-valuemax="3">
                    </div>
                  </div>
                </div>
                <!-- Home Team (Right Side) -->
                <div class="position-absolute top-0 start-50 w-50">
                  <div class="progress" style="height: 20px;">
                    <div class="bg-primary" role="progressbar" 
                         style="width: ${(Math.min(lastPlay.homeSegmentsPoints, 3) / 3) * 100}%" 
                         aria-valuenow="${lastPlay.homeSegmentsPoints}" 
                         aria-valuemin="0" 
                         aria-valuemax="3">
                    </div>
                  </div>
                </div>
                <!-- Center Line -->
                <div class="position-absolute top-0 start-50 translate-middle-x" 
                     style="width: 2px; height: 20px; background-color: #dee2e6;">
                </div>
              </div>
              <div class="d-flex justify-content-between mt-1">
                <small class="text-warning">${lastPlay.awaySegmentsPoints}</small>
                <small class="text-primary">${lastPlay.homeSegmentsPoints}</small>
              </div>
            </div>

            <div class="mt-2">
              ${lastPlay.plusSeventeenStop ? html`
                <div class="mb-1">
                  <small class="text-muted">+17: 
                    <i class="bi bi-octagon-fill text-danger" title="Stop"></i>
                  </small>
                </div>
              ` : ''}
              <small class="text-muted">Overall Diff: 
                <span class="${lastPlay.overallDiff > 0 ? 'text-primary' : 'text-warning'}">
                  ${lastPlay.overallDiff > 0 ? '+' : ''}${lastPlay.overallDiff}
                </span>
              </small>
              ${lastPlay.qualified ? html`
                <div class="mt-2">
                  <i class="bi bi-check-circle-fill me-2 ${lastPlay.qualifiedTeam === 'home' ? 'text-primary' : 'text-warning'}"
                     title="${lastPlay.qualifiedTeam === 'home' ? 'Home Team Qualified' : 'Away Team Qualified'}"></i>
                  <small>
                    <span>${lastPlay.qualifiedBy}</span>
                    <span class="ms-2">${lastPlay.qualifiedTime}</span>
                    <span class="ms-1 text-muted">
                      (${lastPlay.qualifiedGameTime})
                    </span>
                  </small>
                </div>
              ` : ''}
              ${lastPlay.disqualified ? html`
                <div class="mt-2">
                  <i class="bi bi-x-circle-fill me-2 text-dark" 
                     title="Disqualified"></i>
                  <small>
                    <span>${lastPlay.disqualifiedBy}</span>
                    <span class="ms-2">${lastPlay.disqualifiedTime}</span>
                    <span class="ms-1 text-muted">
                      (${lastPlay.disqualifiedGameTime})
                    </span>
                  </small>
                </div>
              ` : ''}
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
              <th class="text-nowrap text-end" style="width: 1%">Away Seg.</th>
              <th class="text-nowrap text-end" style="width: 1%">Home Seg.</th>
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
                  ${play.playScoreDiff > 0 ? `<span class="text-primary">+${play.playScoreDiff}</span>` : 
                    play.playScoreDiff < 0 ? `<span class="text-warning">${play.playScoreDiff}</span>` : 
                    play.playScoreDiff}
                </td>
                <td class="text-nowrap text-end" style="width: 1%">${play.awaySegmentsPoints}</td>
                <td class="text-nowrap text-end" style="width: 1%">${play.homeSegmentsPoints}</td>
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