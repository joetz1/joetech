const LOGO_URL = 'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2';
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').then(r=>console.log('SW registered')).catch(e=>console.log('SW failed',e));});}
let deferredPrompt;
const banner=document.createElement('div');
banner.style.cssText='position:fixed;bottom:0;left:0;right:0;background:#fff;padding:14px;box-shadow:0 -4px 20px rgba(0,0,0,0.15);z-index:10000;display:none;text-align:center;border-radius:20px 20px 0 0;';
banner.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;max-width:500px;margin:0 auto;"><div style="display:flex;align-items:center;gap:10px;"><img src="${LOGO_URL}" style="width:48px;height:48px;border-radius:12px;" alt="HAS"><div style="text-align:left;"><strong>HAS Field System</strong><p style="font-size:0.75rem;color:#666;">Install for quick access</p></div></div><div style="display:flex;gap:8px;"><button id="installBtn" style="background:#2563eb;color:white;border:none;padding:10px 20px;border-radius:20px;font-weight:600;cursor:pointer;">Install</button><button id="dismissBtn" style="background:transparent;border:none;color:#333;cursor:pointer;font-size:1.2rem;">✕</button></div></div>`;
document.body.appendChild(banner);
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;banner.style.display='block';});
document.addEventListener('click',e=>{if(e.target.id==='installBtn'){banner.style.display='none';deferredPrompt.prompt();deferredPrompt.userChoice.then(r=>{if(r.outcome==='accepted')console.log('Installed');deferredPrompt=null;});}if(e.target.id==='dismissBtn')banner.style.display='none';});
window.addEventListener('appinstalled',()=>{banner.style.display='none';});
