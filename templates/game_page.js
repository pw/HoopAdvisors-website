import { html } from 'hono/html'
import { raw } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const gamePage = (data) => {
  const firstPlay = data[0] || {}
  const content = html`
  <main class="container mt-4">
    <div class="card">
      <div class="card-header">
        <div class="d-flex justify-content-between align-items-center">
          <h3 class="mb-0">
            ${firstPlay.awayTeam}@${firstPlay.homeTeam}
          </h3>
          <div class="text-muted">
            ${firstPlay.date}
          </div>
        </div>
      </div>
      <div class="card-body p-0">
        <table class="table table-hover mb-0">
          <thead class="table-light">
            <tr>
              <th class="text-nowrap" style="width: 1%">Time</th>
              <th class="text-nowrap" style="width: 1%">${firstPlay.awayTeam}</th>
              <th class="text-nowrap" style="width: 1%">${firstPlay.homeTeam}</th>              
              <th>Play</th>
              <th class="text-nowrap" style="width: 1%">${firstPlay.awayTeam}</th>
              <th class="text-nowrap" style="width: 1%">${firstPlay.homeTeam}</th> 
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