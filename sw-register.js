const LOGO_URL = 'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2';

// Install banner with logo
const installBanner = document.createElement('div');
installBanner.innerHTML = `
  <div style="display:flex;align-items:center;gap:10px;">
    <img src="${LOGO_URL}" style="width:48px;height:48px;border-radius:12px;" alt="HAS" onerror="this.src='data:image/svg+xml,...'">
    <div>
      <strong>HAS Field System</strong>
      <p style="font-size:0.75rem;">Install for quick access</p>
    </div>
  </div>
`;
