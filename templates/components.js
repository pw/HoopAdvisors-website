import { html } from 'hono/html'

export const Layout = ({ children, title }) => html`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body>
  ${children}
</body>
</html>
` 

export const Navbar = () => html`
  <header>
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">HoopAdvisors 🏀🏀🏀</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="/" onclick="this.classList.add('active')" 
                 :class="{ active: window.location.pathname === '/' }">
                Slide Rule
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/qualifiers" onclick="this.classList.add('active')"
                 :class="{ active: window.location.pathname === '/qualifiers' }">
                Qualifiers
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
`
export const LayoutWithNavbar = ({ children, title }) => html`
  ${Navbar()}
  ${Layout({ children, title })}
`