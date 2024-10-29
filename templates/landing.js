import { html } from 'hono/html'
import { Layout } from './components.js'

export const landing = () => {
  const content = html`
  <style>
    .hero-container {
      position: relative;
      height: 60vh;
      overflow: hidden;
      background-color: rgba(0, 0, 0, 0.7);
    }
    
    .hero-video {
      position: absolute;
      top: 50%;
      left: 50%;
      min-width: 100%;
      min-height: 100%;
      width: auto;
      height: auto;
      transform: translateX(-50%) translateY(-50%);
      z-index: -1;
      object-fit: cover;
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: white;
      text-align: center;
      padding: 1rem;
    }

    .access-card {
      background-color: rgba(255, 255, 255, 0.95);
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-top: -100px;
      position: relative;
      z-index: 2;
      overflow: hidden;
    }

    .access-card .card-header {
      margin: -1px -1px 0 -1px;
      border: none;
    }
  </style>
  
  <div class="hero-container">
    <video class="hero-video" autoplay muted loop playsinline>
      <source src="/hero-video.mp4" type="video/mp4">
      Your browser does not support the video tag.
    </video>
    <div class="hero-content">
      <h1 class="display-4 fw-bold mb-4">HoopAdvisors 🏀</h1>
      <p class="lead mb-4">Advanced basketball analytics and insights</p>
    </div>
  </div>

  <main x-data="accessForm" class="container">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card access-card">
          <div class="card-header bg-primary text-white py-3">
            <h5 class="mb-0 text-center">Enter Access Code</h5>
          </div>
          <div class="card-body p-4">
            <form @submit.prevent="validateCode()">
              <div class="mb-4">
                <label for="accessCode" class="form-label">Access Code</label>
                <input 
                  type="text" 
                  class="form-control form-control-lg" 
                  id="accessCode" 
                  x-model="code"
                  :class="{ 'is-invalid': error }"
                  placeholder="Enter your access code"
                  required
                >
                <div class="invalid-feedback" x-text="error"></div>
              </div>
              <button type="submit" class="btn btn-primary btn-lg w-100">
                Access Dashboard
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </main>

  <script>
    document.addEventListener('alpine:init', () => {
      Alpine.data('accessForm', () => ({
        code: '',
        error: '',
        async validateCode() {
          const response = await fetch('/validate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: this.code })
          });

          if (response.ok) {
            window.location.href = '/';
          } else {
            this.error = 'Invalid access code';
          }
        }
      }));
    });
  </script>
  `
  
  return Layout({ 
    title: 'HoopAdvisors - Access Required',
    children: content 
  })
}