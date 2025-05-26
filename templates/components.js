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
  <style>
    /* Matt's requested color changes */
    :root {
      --custom-text-color: rgb(49, 206, 128);
    }
    
    /* White background for page body */
    body {
      background-color: #fff !important;
    }
    
    /* Black background for navbar */
    .navbar-dark.bg-primary {
      background-color: #000 !important;
    }
    
    /* Text color for navbar and headers */
    .navbar-dark.bg-primary,
    .nav-link, .navbar-brand {
      color: rgb(49, 206, 128) !important;
    }
    
    /* Card header with black bg */
    .card-header.bg-primary.text-white {
      background-color: #000 !important;
      color: rgb(49, 206, 128) !important;
    }
    
    /* Section headers for cards */
    .card-header {
      background-color: #000 !important;
    }
    
    .card-header h5 {
      color: rgb(49, 206, 128) !important;
    }
    
    /* Home team bar color (green) with black text */
    .progress-bar.bg-primary, div[role="progressbar"].bg-primary {
      background-color: rgb(49, 206, 128) !important;
      color: #000 !important;
    }
    
    /* Make all progress bars have a light green background by default */
    .progress {
      background-color: rgba(49, 206, 128, 0.2) !important;
    }
    
    /* Away team bar color (white with black text) */
    .progress-bar.bg-warning, div[role="progressbar"].bg-warning {
      background-color: #fff !important;
      color: #000 !important;
    }
    
    /* Team badges - match the progress bar colors */
    /* Home team badges (green with black text) */
    .badge.bg-primary, .home-adjusted-spread, .card .badge.bg-primary {
      background-color: rgb(49, 206, 128) !important;
      color: #000 !important;
    }
    
    /* Ensure score numbers in badges are black */
    .badge.bg-primary span.fw-bold,
    .badge.bg-warning span.fw-bold {
      color: #000 !important;
      font-weight: 700 !important;
    }
    
    /* Force all text in team badges to be black */
    .badge.bg-primary span,
    .badge.bg-warning span {
      color: #000 !important;
    }
    
    /* Ensure all elements inside the home spread have black text */
    .home-adjusted-spread * {
      color: #000 !important;
    }
    
    /* Away team badges (white with black text) */
    .badge.bg-warning, .card .badge.bg-warning {
      background-color: #fff !important;
      color: #000 !important;
      border: 1px solid #ccc !important;
    }
    
    /* Away adjusted spread - white bg with black text */
    .away-adjusted-spread {
      background-color: #fff !important;
      color: #000 !important;
    }
    
    /* Ensure text elements inside away spread are black */
    .away-adjusted-spread * {
      color: #000 !important;
    }
    
    /* Buttons */
    .btn-primary {
      background-color: rgb(49, 206, 128) !important;
      border-color: rgb(49, 206, 128) !important;
      color: #000 !important;
    }
    
    /* Green success buttons with black text */
    .btn-outline-success.bg-success,
    .btn-success {
      background-color: rgb(49, 206, 128) !important;
      border-color: rgb(49, 206, 128) !important;
      color: #000 !important;
    }
    
    /* Ensure all text inside green buttons is black */
    .btn-outline-success.bg-success span,
    .btn-success span,
    .bg-success.border-success span {
      color: #000 !important;
    }
    
    /* Score box - white background with black text */
    .badge.bg-secondary {
      background-color: #fff !important;
      color: #000 !important;
    }
    
    /* Ensure all elements inside the score box have black text */
    .badge.bg-secondary * {
      color: #000 !important;
    }
    
    /* 2-min wait notification with red background and black text */
    .two-minute-wait,
    .badge:has(.bi-hourglass-split) {
      background-color: #dc3545 !important; /* Red */
      color: #000 !important;
    }
    
    /* Ensure all text elements within the 2-min wait badge have black text */
    .two-minute-wait *,
    .two-minute-wait span,
    .two-minute-wait small,
    .two-minute-wait i,
    .badge.bg-warning.text-dark.mb-1.two-minute-wait span,
    span.two-minute-wait span,
    span.two-minute-wait small,
    span.two-minute-wait i,
    .two-minute-wait-time,
    .two-minute-wait-time *,
    .two-minute-wait small.text-dark {
      color: #000 !important;
    }
    
    /* Force all text content to be black, including parentheses */
    .two-minute-wait small.ms-1,
    .two-minute-wait-time,
    .two-minute-wait .paren,
    .two-minute-wait span.paren {
      color: #000 !important;
    }
    
    /* Important override for ALL elements inside two-minute-wait */
    .two-minute-wait *,
    .two-minute-wait > *,
    .two-minute-wait > * > *,
    .two-minute-wait-time *,
    .two-minute-wait-time > *,
    .two-minute-wait span,
    .two-minute-wait i,
    span.two-minute-wait-time span {
      color: #000 !important;
    }
    
    /* Pins and arrows in the game list should be white and moderately larger */
    .list-group-item .bi-pin, 
    .list-group-item .bi-pin-fill, 
    .list-group-item .bi-box-arrow-up-right {
      color: white !important;
      font-size: 1.5rem !important; /* Moderately larger icon size */
    }
    
    /* Normal button spacing with current icon size */
    .list-group-item .btn-link,
    .list-group-item a[aria-label="View Game Details"] {
      padding: 0 !important; /* No padding */
      margin-right: 0.4rem !important; /* Normal spacing */
      display: inline-block !important;
    }
    
    /* Responsive adjustments for mobile */
    @media (max-width: 768px) {
      /* Add more vertical space in the game rows for mobile */
      .list-group-item {
        padding-top: 1rem !important;
        padding-bottom: 1rem !important;
      }
      
      /* Ensure the team name has enough space */
      .list-group-item .text-truncate {
        max-width: 150px !important;
        display: inline-block !important;
      }
      
      /* Stack the icons on very small screens if needed */
      @media (max-width: 400px) {
        .list-group-item .d-flex.align-items-center {
          flex-wrap: wrap !important;
        }
        
        .list-group-item .btn-link,
        .list-group-item a[aria-label="View Game Details"] {
          margin-bottom: 0.25rem !important;
          margin-right: 0.25rem !important; /* Keep normal spacing */
        }
      }
    }
    
    /* Fix swipe actions display */
    .swipe-background {
      background-color: transparent !important;
    }
    
    /* Hide swipe action icons until actually swiping */
    .swipe-action-icon {
      opacity: 0;
      transition: opacity 0.3s ease;
    }
    
    /* Only show the swipe action icons when actively swiping */
    .swipe-container[style*="translateX"] .swipe-action-icon {
      opacity: 1;
    }
    
    /* Game time info should be white in list items */
    .list-group-item .swipe-content small.text-muted,
    .list-group-item small.text-muted {
      color: white !important;
    }
    
    /* Cards should normally have white backgrounds */
    .card {
      background-color: #fff !important;
      border-color: rgb(49, 206, 128) !important;
    }
    
    /* Specifically target the main Momentum Qualifiers card to have black background */
    .card-header + .card-body {
      background-color: #000 !important;
    }
    
    /* List items styling - black background for all game rows */
    .list-group-item {
      background-color: #000 !important;
      color: rgb(49, 206, 128) !important;
      border-color: rgba(49, 206, 128, 0.3) !important;
    }
    
    /* Team names and text in game items */
    .list-group-item strong {
      color: rgb(49, 206, 128) !important;
    }
    
    /* All list group items have the same styling */
    
    /* Leave form controls with default styling */
    /* Specifically reset the date picker and controls */
    .input-group .form-control, .input-group .input-group-text, 
    .input-group .btn-primary, .input-group .btn-outline-secondary {
      background-color: initial !important;
      color: initial !important;
      border-color: initial !important;
    }
    
    /* Reset Apply button */
    .input-group .btn-primary {
      background-color: #0d6efd !important;
      color: #fff !important;
      border-color: #0d6efd !important;
    }
    
    /* Make text more visible on black background */
    .text-dark {
      color: #000 !important;
    }
    
    /* General text color */
    p, span, div, h1, h2, h3, h4, h5, h6, a {
      color: rgb(49, 206, 128) !important;
    }
    
    /* Spread to take buttons */
    .badge.bg-success,
    .btn-success,
    .badge.pulse-animation,
    .bg-success {
      background-color: rgb(49, 206, 128) !important;
      color: white !important;
    }

    /* For the spread to take display */
    .badge.bg-light.text-dark.spread-to-take-value,
    .spread-to-take-value {
      background-color: #ADFF2F !important; /* Highlighter green */
      color: black !important;
      font-size: 1.2rem !important;
      padding: 8px 12px !important;
      font-weight: 700 !important;
    }

    /* Make sure all text inside the spread-to-take-value is black */
    .spread-to-take-value *,
    .spread-to-take-value span {
      color: black !important;
    }

    /* Spread to Take label */
    .badge.bg-success.pulse-animation,
    .larger-spread-pill {
      background-color: #ADFF2F !important; /* Highlighter green */
      color: black !important;
      font-size: 1.2rem !important;
      padding: 8px 12px !important;
      font-weight: 700 !important;
      letter-spacing: 0.8px !important;
    }
    
    /* Keep qualified and disqualified backgrounds with proper contrast */
    .bg-success-subtle {
      background-color: rgba(49, 206, 128, 0.2) !important;
    }
    
    .bg-danger-subtle {
      background-color: rgba(220, 53, 69, 0.2) !important;
    }
    
    /* F marker for finished games should be white */
    .text-muted {
      color: #fff !important;
    }
    
    /* Unadjusted spread should have white background and black text */
    .badge.bg-info, .unadjusted-spread {
      background-color: white !important;
      color: #000 !important;
    }
    
    /* Ensure all elements inside the unadjusted spread have black text */
    .unadjusted-spread *, 
    .badge.bg-info * {
      color: #000 !important;
    }
    
    /* Fix potentially conflicting styles */
    .text-truncate {
      color: rgb(49, 206, 128) !important;
    }
    
    /* Keep some buttons readable */
    .btn-outline-secondary {
      border-color: rgb(49, 206, 128) !important;
      color: rgb(49, 206, 128) !important;
    }
    
    /* Body specific text colors - green only for navbar */
    .navbar strong, .navbar a, .navbar span:not(.badge) {
      color: rgb(49, 206, 128) !important;
    }
    
    /* Game page segment point counts */
    .d-flex.justify-content-between.mt-1 small.text-primary {
      color: rgb(49, 206, 128) !important;
    }
    
    .d-flex.justify-content-between.mt-1 small.text-warning {
      color: white !important;
    }
    
    /* Form check labels */
    .form-check-label {
      color: #000 !important;
    }
    
    /* Switch toggles */
    .form-check-input:checked {
      background-color: rgb(49, 206, 128) !important;
      border-color: rgb(49, 206, 128) !important;
    }
    
    /* Team qualified indicators - just the checkmark icons */
    .list-group-item .text-primary,
    .card-body .text-primary,
    .momentum-metrics .text-primary,
    .card .text-primary {
      color: rgb(49, 206, 128) !important;
    }
    
    .list-group-item .text-warning,
    .card-body .text-warning,
    .momentum-metrics .text-warning,
    .card .text-warning {
      color: white !important;
    }
    
    /* Make all qualified status text white except for the icon */
    .list-group-item div.mt-2 small,
    .list-group-item div.mt-2 small span {
      color: white !important;
    }
    
    /* Warning/danger indicators - only the icons */
    .list-group-item .text-danger, 
    .list-group-item .bi-exclamation-triangle-fill,
    .list-group-item .bi-octagon-fill {
      color: #dc3545 !important;
    }
    
    /* Make all the status text white except for specific elements */
    .list-group-item div.mt-2 small,
    .list-group-item div.mt-2 small span:not(.final-indicator),
    .list-group-item .bi-check-circle-fill + small,
    .list-group-item .bi-check-circle-fill + small *,
    .list-group-item .checkmark-row span,
    .list-group-item .segment-info {
      color: white !important;
    }
    
    /* Game page specific segment differential styling */
    /* Change segment differential boxes to have dark background */
    .col-md-3 .card {
      background-color: #000 !important;
    }
    
    .col-md-3 .card-body {
      background-color: #000 !important;
    }
    
    .col-md-3 .card-body small.text-primary {
      color: rgb(49, 206, 128) !important;
    }
    
    .col-md-3 .card-body small.text-warning {
      color: white !important;
    }
    
    .col-md-3 .card-body h6.text-primary {
      color: rgb(49, 206, 128) !important;
    }
    
    .col-md-3 .card-body h6.text-warning {
      color: white !important;
    }
    
    /* Make segment time labels (20:00-15:00 1H) white instead of muted gray */
    .col-md-3 .card-body small.text-muted {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    /* Make momentum metrics labels white with slight transparency */
    .momentum-metric small {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    /* Style the "Segments Progress" label */
    .card-header .col-md-4 small.text-muted {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    /* Style the other text in the momentum metrics area */
    .card-header .col-md-4 .mt-2 small.text-muted,
    .card-header .col-md-4 .mt-3 small.text-muted {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    /* Style the date indicator in upper right */
    .card-header .text-muted {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    /* All text in the list-group-item should be white by default */
    .list-group-item span:not(.badge span):not(.unadjusted-spread span):not(.away-adjusted-spread span):not(.home-adjusted-spread span):not(.final-indicator):not(.two-minute-wait span),
    .list-group-item i.bi-check-circle-fill ~ span {
      color: white !important;
    }
    
    /* Specifically target segment text lines */
    .bi-check-circle-fill ~ span,
    .list-group-item .bi.bi-check-circle-fill ~ span,
    .list-group-item .row span.ms-2 {
      color: white !important;
    }
    
    /* Make the timestamps white */
    .list-group-item .text-muted {
      color: white !important;
    }
    
    /* Make the F (final) indicator white */
    .final-indicator {
      color: white !important;
    }
    
    /* Adjusted Lines box styling */
    .bg-light.p-2.rounded {
      background-color: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(49, 206, 128, 0.3) !important;
    }
    
    /* Adjusted Lines header and subtitle */
    .bg-light.p-2.rounded h6 {
      color: rgb(49, 206, 128) !important;
    }
    
    .bg-light.p-2.rounded small.text-muted {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    /* Ensure all badge text inside adjusted lines is black */
    .bg-light .badge.bg-primary span,
    .bg-light .badge.bg-warning span,
    .bg-light .badge span {
      color: #000 !important;
    }
  </style>
</head>
<body>
  ${children}
</body>
</html>
` 

export const Navbar = () => html`
  <header>
    <nav x-data="{ currentPath: window.location.pathname }" class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">HoopAdvisors</a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav">
            <li class="nav-item">
              <a class="nav-link" href="/qualifiers" 
                 :class="{ 'active': currentPath === '/qualifiers' || currentPath === '/' }">
                Qualifiers
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="/lead_tracker" 
                 :class="{ 'active': currentPath === '/lead_tracker' }">
                Lead Tracker
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