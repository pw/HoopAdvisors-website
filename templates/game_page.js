import { html } from 'hono/html'
import { LayoutWithNavbar } from './components.js'

export const gamePage = (data) => {
  const content = html`
  <main x-data class="container mt-4">
    <div class="card shadow">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0">Home Team Slide Rule</h5>
      </div>
  `
}