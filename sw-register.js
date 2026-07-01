// ==================== SERVICE WORKER REGISTRATION ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('✅ Service Worker registered successfully');
        console.log('Scope:', registration.scope);
        
        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          console.log('🔄 Service Worker update found!');
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 New content available! Please refresh.');
              // Optional: Show update notification
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}

// ==================== UPDATE NOTIFICATION ====================
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #1a73e8;
    color: white;
    padding: 12px;
    text-align: center;
    z-index: 10001;
    font-size: 0.9rem;
    cursor: pointer;
  `;
  updateBanner.innerHTML = '🔄 New version available! <strong>Click to refresh</strong>';
  updateBanner.onclick = () => {
    window.location.reload();
  };
  document.body.appendChild(updateBanner);
}

// ==================== PWA INSTALL PROMPT ====================
let deferredPrompt;
let installBannerShown = false;

// Create install banner
const installBanner = document.createElement('div');
installBanner.id = 'installBanner';
installBanner.style.cssText = `
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  padding: 14px 16px;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.15);
  z-index: 10000;
  display: none;
  text-align: center;
  border-radius: 20px 20px 0 0;
  animation: slideUp 0.3s ease;
`;

installBanner.innerHTML = `
  <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;max-width:500px;margin:0 auto;flex-wrap:wrap;">
    <div style="display:flex;align-items:center;gap:10px;">
      <img src="https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2&mode=admin" 
           style="width:48px;height:48px;border-radius:12px;" 
           alt="HAS" 
           onerror="this.style.display='none'">
      <div style="text-align:left;">
        <strong style="font-size:0.9rem;color:#1c1b1f;">HAS Field System</strong>
        <p style="font-size:0.75rem;color:#666;margin:0;">Install for quick access</p>
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;">
      <button id="installBtn" style="background:#1a73e8;color:white;border:none;padding:10px 20px;border-radius:20px;font-weight:600;cursor:pointer;font-size:0.85rem;">
        <i class="fas fa-download"></i> Install
      </button>
      <button id="dismissBtn" style="background:transparent;border:none;color:#666;cursor:pointer;font-size:1.2rem;padding:5px;">
        ✕
      </button>
    </div>
  </div>
`;

// Add animation style
const style = document.createElement('style');
style.textContent = `
  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }
`;
document.head.appendChild(style);
document.body.appendChild(installBanner);

// Listen for install prompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('📲 Install prompt available');
  e.preventDefault();
  deferredPrompt = e;
  
  if (!installBannerShown) {
    installBanner.style.display = 'block';
    installBannerShown = true;
  }
});

// Handle install button click
document.addEventListener('click', (e) => {
  if (e.target.id === 'installBtn' || e.target.closest('#installBtn')) {
    installBanner.style.display = 'none';
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('✅ User accepted install');
        } else {
          console.log('❌ User dismissed install');
        }
        deferredPrompt = null;
      });
    }
  }
  
  if (e.target.id === 'dismissBtn' || e.target.closest('#dismissBtn')) {
    installBanner.style.display = 'none';
  }
});

// Hide banner when app is installed
window.addEventListener('appinstalled', () => {
  console.log('🎉 App installed successfully!');
  installBanner.style.display = 'none';
  deferredPrompt = null;
});

// ==================== OFFLINE DETECTION ====================
window.addEventListener('online', () => {
  console.log('🌐 Back online');
  showToast('Back online! Syncing data...');
});

window.addEventListener('offline', () => {
  console.log('📡 Offline mode');
  showToast('You are offline. Changes will sync when connected.');
});

function showToast(message) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 80px;
    right: 16px;
    padding: 10px 18px;
    background: #1a73e8;
    color: white;
    border-radius: 22px;
    z-index: 10001;
    font-size: 0.85rem;
    animation: slideUp 0.3s ease;
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==================== BACKGROUND SYNC REGISTRATION ====================
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then(registration => {
    // Register sync for attendance
    registration.sync.register('sync-attendance')
      .then(() => console.log('✅ Attendance sync registered'))
      .catch(err => console.log('Sync registration failed:', err));
    
    // Register sync for entries
    registration.sync.register('sync-entries')
      .then(() => console.log('✅ Entries sync registered'))
      .catch(err => console.log('Sync registration failed:', err));
  });
}

console.log('🚀 HAS Field System - PWA Ready');
