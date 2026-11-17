// AgriGrow website — hash router + views (vanilla JS)
const app = document.getElementById('app');

const STATUS_LABEL = { paid:'Paid', scheduled:'Scheduled', out_for_delivery:'Out for delivery', delivered:'Delivered' };

// ---------- helpers ----------
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate = s => new Date(s).toLocaleDateString();
const fmtDT = s => new Date(s).toLocaleString();
function go(hash){ window.location.hash = hash; }
function parseRoute(){
  const raw = (location.hash || '#/').slice(1);
  const [path, query=''] = raw.split('?');
  const params = Object.fromEntries(new URLSearchParams(query));
  return { path, params };
}

// ---------- inline SVG icon set (lucide-style) ----------
const I = {
  sprout:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 20h10"/><path d="M10 20c5.5-2.5.8-6.4 3-10"/><path d="M9.5 9.4c1.1.8 1.8 2.2 2.3 3.7-2 .4-3.5.4-4.8-.3-1.2-.6-2.3-1.9-3-4.2 2.8-.5 4.4 0 5.5.8z"/><path d="M14.1 6a7 7 0 0 0-1.1 4c1.9-.1 3.3-.6 4.3-1.4 1-1 1.6-2.3 1.7-4.6-2.7.1-4 1-4.9 2z"/></svg>`,
  home:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  scan:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><line x1="3" y1="12" x2="21" y2="12"/></svg>`,
  package:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  search:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`,
  logout:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  tractor:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h9l1 7H4z"/><circle cx="7" cy="17" r="3"/><circle cx="17" cy="17" r="4"/><path d="M13 11h4l3 4"/></svg>`,
  cart:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>`,
  check:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  shield:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
  qr:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zM21 14v3M14 21h3M21 21v.01"/></svg>`,
  leaf:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>`,
  trash:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
  plus:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  camera:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  arrow:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  arrowLeft:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>`,
  pin:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 7-8 13-8 13s-8-6-8-13a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  calendar:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  wallet:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 12V8H6a2 2 0 0 1 0-4h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>`,
  zap:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
  x:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};
const icon = (name, cls='') => `<span class="ic ${cls}">${I[name]||''}</span>`;

// ---------- shell with top header + nav tabs ----------
function withShell(html, activeTab){
  const u = Store.getUser();
  const home = u?.role === 'farmer' ? '#/farmer' : '#/consumer';
  const tabs = u ? [
    {key:'home', label:'Home', icon:'home', href:home},
    {key:'trace', label:'Trace', icon:'scan', href:'#/trace'},
    {key:'orders', label:'Orders', icon:'package', href:'#/orders'},
  ] : [];
  return `
    <header class="topbar">
      <div class="topbar-inner">
        <a class="brand" href="${u?home:'#/'}">
          <span class="logo">${I.sprout}</span>
          <span>AgriGrow</span>
        </a>
        ${u ? `<nav class="nav-tabs">
          ${tabs.map(t => `<a class="tab ${t.key===activeTab?'active':''}" href="${t.href}">${icon(t.icon)}<span>${t.label}</span></a>`).join('')}
        </nav>` : ''}
        <div class="nav-spacer"></div>
        ${u ? `
          <div class="nav-user">
            <div class="avatar">${esc(u.name.trim()[0]||'A')}</div>
            <button class="btn ghost" style="padding:9px 14px;font-size:13px" onclick="signOut()">${icon('logout')}<span>Sign out</span></button>
          </div>
        ` : `<a class="btn sign-in-cta" href="#/login">Sign in</a>`}
      </div>
    </header>
    <main class="shell">${html}</main>
  `;
}
function signOut(){ Store.logout(); render(); }

// ---------- views ----------
function viewLanding(){
  return `
    <main class="field-home">
      <section class="field-card">
        <header class="field-header">
          <a class="field-brand" href="#/" aria-label="AgriGrow home">AgriGrow<span class="field-brand-leaf">✦</span></a>
          <a class="field-signup" href="#/login">Sign up</a>
        </header>
        <section class="field-hero">
          <div class="field-copy">
            <h1>Good Food.<br/>From Farm to<br/>Your Door.</h1>
            <p>Shop fresh produce straight from local farmers. Pay simply<br class="desktop-break"/> with QR and follow every order from harvest to home.</p>
            <div class="field-actions"><a class="field-button primary" href="#/consumer">Explore Produce</a><a class="field-button" href="#/trace">How It Works</a></div>
          </div>
          <div class="field-gallery" aria-label="Fresh organic produce and farm">
            <div class="field-produce-ground" aria-hidden="true"></div>
            <img class="field-produce" src="https://adst.mp.pl/img/articles/zdrowe_diety/healthy-food-1323802-1279x828.jpg" alt="Fresh red tomatoes, yellow bell pepper, and parsley" />
          </div>
          <div class="field-wave" aria-hidden="true"><svg viewBox="0 0 920 80" preserveAspectRatio="none"><path d="M0 13 Q25 0 50 13T100 13T150 13T200 13T250 13T300 13T350 13T400 13T450 13T500 13T550 13T600 13T650 13T700 13T750 13T800 13T850 13T900 13T950 13"/><path d="M0 24 Q25 11 50 24T100 24T150 24T200 24T250 24T300 24T350 24T400 24T450 24T500 24T550 24T600 24T650 24T700 24T750 24T800 24T850 24T900 24T950 24"/><path d="M0 35 Q25 22 50 35T100 35T150 35T200 35T250 35T300 35T350 35T400 35T450 35T500 35T550 35T600 35T650 35T700 35T750 35T800 35T850 35T900 35T950 35"/><path d="M0 46 Q25 33 50 46T100 46T150 46T200 46T250 46T300 46T350 46T400 46T450 46T500 46T550 46T600 46T650 46T700 46T750 46T800 46T850 46T900 46T950 46"/><path d="M0 57 Q25 44 50 57T100 57T150 57T200 57T250 57T300 57T350 57T400 57T450 57T500 57T550 57T600 57T650 57T700 57T750 57T800 57T850 57T900 57T950 57"/><path d="M0 68 Q25 55 50 68T100 68T150 68T200 68T250 68T300 68T350 68T400 68T450 68T500 68T550 68T600 68T650 68T700 68T750 68T800 68T850 68T900 68T950 68"/></svg></div>
        </section>
      </section>
    </main>`;
}

function viewLogin(){
  return withShell(`
    <div class="login-wrap">
      <a class="login-brand" href="#/" aria-label="AgriGrow home">AgriGrow<span class="field-brand-leaf">✦</span></a>
      <a class="login-back" href="#/" aria-label="Back to homepage">${icon('arrowLeft')}<span>Back to home</span></a>
      <section class="login-promo">
        <img src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=85" alt="Rows of crops growing on a local farm" />
        <div class="login-promo-copy"><span>FROM FARM TO YOUR DOOR</span><h1>Good food starts<br/>with a <em>closer connection.</em></h1><p>Meet local farmers, shop their fresh harvests, and follow your food’s journey home.</p></div>
      </section>
      <section class="login-panel">
        <div class="login-panel-heading"><span class="section-eyebrow">WELCOME TO AGRIGROW</span><h2>Your farm-fresh<br/>journey starts here.</h2><p>Create an account or sign in to continue.</p></div>
        <form id="loginForm" class="email-login-form">
          <div><label class="label" for="loginEmail">Email address</label><input class="input" id="loginEmail" name="email" type="email" autocomplete="email" required placeholder="you@example.com" /></div>
          <div><label class="label" for="loginPassword">Password</label><input class="input" id="loginPassword" name="password" type="password" autocomplete="current-password" required placeholder="Enter your password" /></div>
          <fieldset class="role-field"><legend class="label">I’m signing in as</legend><div class="role-options">
            <label class="role-option"><input type="radio" name="role" value="farmer" required /><span class="role-option-card"><span class="role-choice-icon">${I.tractor}</span><span>Farmer</span></span></label>
            <label class="role-option"><input type="radio" name="role" value="consumer" checked /><span class="role-option-card"><span class="role-choice-icon">${I.cart}</span><span>Consumer</span></span></label>
          </div></fieldset>
          <button class="btn block lg" type="submit">Continue ${icon('arrow')}</button>
        </form>
      </section>
    </div>
  `, null);
}
function bindLogin(){
  const form = document.getElementById('loginForm');
  form.onsubmit = e =>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const u = Store.loginOrSignupEmail(fd.get('email').trim(), fd.get('role'));
    go(u.role === 'farmer' ? '#/farmer' : '#/consumer');
  };
}

function viewConsumer(){
  const u = Store.getUser();
  return withShell(`
    <div class="consumer-dashboard">
      <section class="consumer-panel">
        <header class="consumer-masthead">
          <a href="#/consumer" class="consumer-mark" aria-label="AgriGrow shop"><span class="consumer-menu-mark">☰</span><span class="consumer-leaf">${I.sprout}</span><b>AgriGrow</b></a>
          <label class="consumer-search">${I.search}<input id="q" placeholder="Search produce, farmers, villages…" /></label>
          <div class="consumer-account"><span>${esc(u.name.trim()[0]||'A')}</span><button onclick="signOut()" aria-label="Sign out" title="Sign out">${I.logout}</button></div>
        </header>
        <section class="consumer-hero">
          <div class="consumer-hero-copy"><span class="consumer-eyebrow">FRESH FROM LOCAL FARMS</span><h1>Freshness at<br/>your doorstep.</h1><p>Meet the farmers behind your food. Shop fresh harvests, pay simply, and trace every order from farm to home.</p><a href="#product-shelf" class="consumer-shop-button">Shop the harvest <span>↗</span></a></div>
          <div class="consumer-hero-art"><img src="https://images.unsplash.com/photo-1657288089316-c0350003ca49?auto=format&fit=crop&w=1200&q=85" alt="A basket of freshly harvested vegetables" /><span>${I.leaf} Harvested nearby</span></div>
        </section>
        <section class="consumer-products" id="product-shelf">
          <div class="consumer-products-heading"><div><span class="consumer-eyebrow">TODAY’S HARVEST</span><h2>Fresh picks from local farms</h2></div><a href="#/trace">Track an order ${I.arrow}</a></div>
          <div class="consumer-filters tags" id="filters">
            <span class="t active" data-f="all">All produce</span><span class="t" data-f="organic">${I.leaf}Organic</span><span class="t" data-f="veg">Vegetables</span><span class="t" data-f="fruit">Fruits</span><span class="t" data-f="grain">Grains</span>
          </div>
          <div id="grid" class="consumer-product-grid"></div>
        </section>
      </section>
      <footer class="consumer-footer"><span>Good food, closer to home.</span><span>Fair prices · QR payments · Farm-to-door traceability</span></footer>
    </div>
  `, 'home');
}
function bindConsumer(){
  const grid = document.getElementById('grid');
  const q = document.getElementById('q');
  let filter = 'all';
  function classify(p){
    const v = p.toLowerCase();
    if(/(rice|wheat|grain|millet|pulse|dal)/.test(v)) return 'grain';
    if(/(mango|apple|banana|orange|grape|fruit|berry)/.test(v)) return 'fruit';
    return 'veg';
  }
  function productPhoto(p){
    const v = p.toLowerCase();
    if(v.includes('carrot')) return 'https://images.unsplash.com/photo-1741515043161-e97d05e5cfcc?auto=format&fit=crop&w=700&q=80';
    if(/(spinach|leaf|greens)/.test(v)) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=700&q=80';
    if(/(tomato|chili|pepper)/.test(v)) return 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&w=700&q=80';
    if(/(onion|radish|beet)/.test(v)) return 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=700&q=80';
    if(/(mango|apple|fruit)/.test(v)) return 'https://images.unsplash.com/photo-1757281096599-b9165ba74008?auto=format&fit=crop&w=700&q=80';
    if(/(rice|wheat|grain|millet|pulse|dal)/.test(v)) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=700&q=80';
    return 'https://images.unsplash.com/photo-1657288089316-c0350003ca49?auto=format&fit=crop&w=700&q=80';
  }
  function paint(){
    const term = q.value.trim().toLowerCase();
    const items = Store.getListings().filter(l=>{
      if(term && !l.product.toLowerCase().includes(term) && !l.farmerName.toLowerCase().includes(term)) return false;
      if(filter==='organic' && !l.organic) return false;
      if(['veg','fruit','grain'].includes(filter) && classify(l.product)!==filter) return false;
      return true;
    });
    if(!items.length){ grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${I.search}<div>No produce matched your search.</div></div>`; return; }
    grid.innerHTML = items.map((l,i) => `
      <a class="consumer-product-card" href="#/listing?id=${l.id}">
        <div class="consumer-product-image tone-${i%4}">
          <img src="${l.image || productPhoto(l.product)}" alt="Fresh ${esc(l.product)} from ${esc(l.farmerName)}" />
          ${l.organic?`<span class="consumer-organic">${I.leaf} Organic</span>`:''}
        </div>
        <div class="consumer-product-info"><div class="consumer-product-top"><h3>${esc(l.product)}</h3><span class="consumer-stock">${l.stockKg} kg</span></div>
          <p>${esc(l.farmerName)} · ${esc(l.village)}</p>
          <div class="consumer-product-price"><strong>₹${l.pricePerKg}<small>/kg</small></strong><del>₹${l.marketPricePerKg}</del><span>${Math.max(0,Math.round((1-l.pricePerKg/l.marketPricePerKg)*100))}% less</span></div>
        </div>
      </a>
    `).join('');
  }
  q.oninput = paint;
  document.querySelectorAll('#filters .t').forEach(t=>{
    t.onclick = ()=>{ filter = t.dataset.f; document.querySelectorAll('#filters .t').forEach(x=>x.classList.toggle('active', x===t)); paint(); };
  });
  paint();
}

function viewFarmer(){
  const u = Store.getUser();
  const mine = Store.getListings().filter(l => l.farmerId === u.id || l.farmerId === 'f-demo');
  const orderCount = Store.getOrders().filter(o => mine.some(l=>l.id===o.listingId)).length;
  return withShell(`
    <div class="page-head">
      <div>
        <div class="h1 serif">Namaste, ${esc(u.name.split(' ')[0])}</div>
        <p class="muted" style="margin-top:6px">${mine.length} active listing${mine.length===1?'':'s'} · ${orderCount} order${orderCount===1?'':'s'}</p>
      </div>
      <button class="btn lg" onclick="openListingDialog()">${icon('plus')}<span>Add new produce</span></button>
    </div>
    <div class="grid-listings">
      ${mine.length ? mine.map(l => `
        <div class="listing-card">
          <div class="img">${l.image?`<img src="${l.image}" alt="${esc(l.product)}" />`:esc(l.emoji)}</div>
          <div class="body">
            <div style="display:flex;align-items:center;gap:6px"><div style="font-weight:800">${esc(l.product)}</div>${l.organic?`<span class="chip">${I.leaf}Organic</span>`:''}</div>
            <div class="muted" style="font-size:12px;margin-top:2px">₹${l.pricePerKg}/kg · ${l.stockKg} kg in stock</div>
            <div class="muted" style="font-size:11px">Harvested ${fmtDate(l.harvestedOn)}</div>
            <div style="margin-top:10px;display:flex;gap:6px">
              <button class="btn outline" style="flex:1;padding:8px;font-size:12px" onclick="go('#/listing?id=${l.id}')">View</button>
              <button class="btn danger" style="padding:8px 12px;font-size:12px" onclick="removeListing('${l.id}')">${icon('trash')}</button>
            </div>
          </div>
        </div>
      `).join('') : `<div class="empty" style="grid-column:1/-1">${I.sprout}<div style="margin-top:10px">You haven't listed any produce yet.</div></div>`}
    </div>
  `, 'home');
}
function removeListing(id){
  if(!confirm('Remove this listing? This cannot be undone.')) return;
  Store.removeListing(id); render();
}

function openListingDialog(){
  const back = document.createElement('div');
  back.className = 'modal-backdrop';
  back.innerHTML = `
    <div class="modal" onclick="event.stopPropagation()">
      <div style="display:flex;justify-content:space-between;align-items:center"><div class="h2 serif">Add produce</div><button onclick="this.closest('.modal-backdrop').remove()" style="width:32px;height:32px;border-radius:50%;background:var(--muted);display:grid;place-items:center">${I.x}</button></div>
      <form id="listForm" style="margin-top:18px;display:grid;gap:14px">
        <div>
          <label class="label">Photos of your produce</label>
          <div id="photos" style="display:flex;gap:8px;flex-wrap:wrap"></div>
          <input id="photoInput" type="file" accept="image/*" capture="environment" multiple style="display:none" />
        </div>
        <div class="row">
          <div><label class="label">Product</label><input class="input" name="product" required placeholder="Tomato" /></div>
          <div><label class="label">Emoji tag</label><input class="input" name="emoji" maxlength="2" value="🥦" required /></div>
        </div>
        <div class="row">
          <div><label class="label">Price ₹/kg</label><input class="input" name="price" type="number" min="1" required /></div>
          <div><label class="label">Mandi ₹/kg</label><input class="input" name="mandi" type="number" min="1" required /></div>
        </div>
        <div class="row">
          <div><label class="label">Stock (kg)</label><input class="input" name="stock" type="number" min="1" required /></div>
          <div><label class="label">Harvested on</label><input class="input" name="harvested" type="date" required /></div>
        </div>
        <label style="display:flex;gap:8px;align-items:center;font-size:13px"><input type="checkbox" name="organic" /> Certified organic</label>
        <button class="btn block lg" type="submit">Publish listing</button>
      </form>
    </div>`;
  back.onclick = ()=>back.remove();
  document.body.appendChild(back);

  let photos = [];
  function paintPhotos(){
    const wrap = back.querySelector('#photos');
    wrap.innerHTML = photos.map((p,i)=>`<div class="photo-thumb"><img src="${p}" /><div class="x" data-i="${i}">${I.x}</div></div>`).join('') +
      `<div class="photo-empty" id="addPhoto">${I.camera}<span>Add photo</span></div>`;
    wrap.querySelectorAll('.x').forEach(x => x.onclick = ()=>{ photos.splice(+x.dataset.i,1); paintPhotos(); });
    wrap.querySelector('#addPhoto').onclick = ()=> back.querySelector('#photoInput').click();
  }
  back.querySelector('#photoInput').onchange = e=>{
    [...e.target.files].forEach(f=>{
      const r = new FileReader();
      r.onload = ev=>{ photos.push(ev.target.result); paintPhotos(); };
      r.readAsDataURL(f);
    });
  };
  paintPhotos();

  back.querySelector('#listForm').onsubmit = e=>{
    e.preventDefault();
    const fd = new FormData(e.target);
    const u = Store.getUser();
    Store.addListing({
      farmerId: u.id, farmerName: u.name, village: u.village || 'Unknown',
      product: fd.get('product'), emoji: fd.get('emoji') || '🥦',
      pricePerKg: +fd.get('price'), marketPricePerKg: +fd.get('mandi'),
      stockKg: +fd.get('stock'), harvestedOn: fd.get('harvested'),
      organic: fd.get('organic') === 'on',
      image: photos[0] || undefined
    });
    back.remove(); render();
  };
}

function viewListing(id){
  const l = Store.getListings().find(x => x.id === id);
  if(!l) return withShell(`<div class="empty">Listing not found.</div>`, null);
  return withShell(`
    <a href="javascript:history.back()" class="muted" style="display:inline-flex;align-items:center;gap:6px;margin-bottom:18px">${I.arrowLeft}<span>Back</span></a>
    <div class="detail-grid">
      <div class="detail-img">
        ${l.image?`<img src="${l.image}" alt="${esc(l.product)}" />`:esc(l.emoji)}
      </div>
      <div>
        <div style="display:flex;gap:10px;align-items:center"><h1 class="h1">${esc(l.product)}</h1>${l.organic?`<span class="chip">${I.leaf}Organic</span>`:''}</div>
        <div class="muted" style="margin-top:8px;display:flex;align-items:center;gap:6px">${I.pin}${esc(l.farmerName)} · ${esc(l.village)}</div>
        <div class="muted" style="display:flex;align-items:center;gap:6px;margin-top:4px">${I.calendar}Harvested ${fmtDate(l.harvestedOn)}</div>

        <div class="card" style="margin-top:18px">
          <div style="display:flex;align-items:baseline;gap:8px">
            <div style="font-size:34px;font-weight:800;color:var(--primary)">₹${l.pricePerKg}</div>
            <div class="muted">/kg</div>
            <div class="strike" style="margin-left:auto">Mandi ₹${l.marketPricePerKg}</div>
          </div>
          <div style="margin-top:18px;display:flex;justify-content:space-between;align-items:center">
            <span class="muted">Quantity (kg)</span>
            <div class="qty">
              <button id="dec">−</button>
              <span id="qty" style="font-weight:800;width:28px;text-align:center">1</span>
              <button id="inc">+</button>
            </div>
          </div>
          <div class="row" style="margin-top:14px">
            <div class="card" style="padding:12px;background:var(--muted);box-shadow:none;border:none"><div class="muted">Total</div><div id="total" style="font-weight:800;font-size:20px">₹${l.pricePerKg}</div></div>
            <div class="card" style="padding:12px;background:rgba(78,169,104,.1);color:var(--leaf);box-shadow:none;border:none"><div style="opacity:.85;font-size:12px">You save</div><div id="save" style="font-weight:800;font-size:20px">₹${l.marketPricePerKg - l.pricePerKg}</div></div>
          </div>
        </div>

        <div class="card" style="margin-top:12px;display:flex;align-items:center;gap:10px;font-size:13px">${I.shield}<span>Verified farmer · ID #${esc(l.farmerId)}</span></div>
        <a class="card" href="#/trace?id=${l.id}" style="margin-top:10px;display:flex;align-items:center;gap:10px;font-size:13px">${I.scan}<span>View QR traceability</span></a>
        <button id="buy" class="btn block lg" style="margin-top:20px">${icon('qr')}<span>Pay with QR · ₹<span id="totalBtn">${l.pricePerKg}</span></span></button>
      </div>
    </div>
  `, null);
}
function bindListing(id){
  const l = Store.getListings().find(x => x.id === id);
  if(!l) return;
  let qty = 1;
  const upd = ()=>{
    document.getElementById('qty').textContent = qty;
    document.getElementById('total').textContent = '₹' + (qty * l.pricePerKg);
    document.getElementById('totalBtn').textContent = qty * l.pricePerKg;
    document.getElementById('save').textContent = '₹' + (qty * (l.marketPricePerKg - l.pricePerKg));
  };
  document.getElementById('dec').onclick = ()=>{ qty = Math.max(1, qty-1); upd(); };
  document.getElementById('inc').onclick = ()=>{ qty = Math.min(l.stockKg, qty+1); upd(); };
  document.getElementById('buy').onclick = ()=>{
    if(!Store.getUser()) return go('#/login');
    go(`#/checkout?id=${l.id}&qty=${qty}`);
  };
}

function viewCheckout(id, qty){
  const l = Store.getListings().find(x => x.id === id);
  const u = Store.getUser();
  if(!l || !u) return withShell(`<div class="empty">Listing not found.</div>`, null);
  qty = Math.max(1, +qty || 1);
  const total = qty * l.pricePerKg;
  const upi = `upi://pay?pa=agrigrow@upi&pn=AgriGrow&am=${total}&cu=INR&tn=Order-${l.id}`;
  return withShell(`
    <div class="page-head"><div><div class="h1 serif">Pay with QR</div><p class="muted" style="margin-top:6px">${esc(l.product)} · ${qty} kg · from ${esc(l.farmerName)}</p></div></div>
    <div class="qr-wrap">
      <canvas id="qr"></canvas>
      <div style="margin-top:12px;font-weight:800;font-size:26px">₹${total}</div>
      <div class="muted">Scan with any UPI app — GPay, PhonePe, Paytm</div>
      <div class="divider"></div>
      <div style="font-family:monospace;font-size:11px;word-break:break-all;color:var(--muted-fg)">${esc(upi)}</div>
      <button id="confirm" class="btn block lg" style="margin-top:18px">${icon('check')}<span>I've paid — confirm order</span></button>
    </div>
  `, null);
}
function bindCheckout(id, qty){
  const l = Store.getListings().find(x => x.id === id);
  const u = Store.getUser();
  qty = Math.max(1, +qty || 1);
  const total = qty * l.pricePerKg;
  const upi = `upi://pay?pa=agrigrow@upi&pn=AgriGrow&am=${total}&cu=INR&tn=Order-${l.id}`;
  if(window.QRCode){
    QRCode.toCanvas(document.getElementById('qr'), upi, { width: 240, margin: 2, color:{ dark:'#1d2a22', light:'#ffffff' } });
  }
  document.getElementById('confirm').onclick = ()=>{
    const order = Store.placeOrder(u, l, qty);
    go(`#/trace?id=${order.id}`);
  };
}

function viewOrders(){
  const u = Store.getUser();
  const all = Store.getOrders();
  let orders;
  if(u.role === 'farmer'){
    const myIds = new Set(Store.getListings().filter(l => l.farmerId === u.id || l.farmerId === 'f-demo').map(l => l.id));
    orders = all.filter(o => myIds.has(o.listingId));
  } else {
    orders = all.filter(o => o.consumerId === u.id);
  }
  if(!orders.length){
    return withShell(`<div class="empty">${I.package}<div style="margin-top:10px;font-weight:700;color:var(--fg)">No orders yet</div><div class="muted">Place your first farm-direct order.</div><a class="btn" style="margin-top:14px;display:inline-flex" href="#/consumer">Open marketplace${icon('arrow')}</a></div>`, 'orders');
  }
  return withShell(`
    <div class="page-head">
      <div>
        <div class="h1 serif">${u.role==='farmer'?'Incoming orders':'Your orders'}</div>
        ${u.role==='farmer'?`<p class="muted" style="margin-top:6px;display:flex;align-items:center;gap:6px">${I.shield}<span>Only you (the farmer) can update traceability — keeps the chain tamper-proof.</span></p>`:''}
      </div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:14px">
      ${orders.map(o => `
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:center;gap:10px">
            <div style="font-weight:800">${esc(o.product)} · ${o.qtyKg} kg</div>
            <span class="status-pill status-${o.status}">${STATUS_LABEL[o.status]}</span>
          </div>
          <div class="muted" style="margin-top:4px">₹${o.total} · ${fmtDT(o.placedAt)}</div>
          <div style="margin-top:12px;display:flex;gap:8px">
            <a class="btn ghost" style="flex:1;padding:10px;font-size:13px" href="#/trace?id=${o.id}">${icon('scan')}<span>Track</span></a>
            ${u.role==='farmer' && o.status!=='delivered' ? `<button class="btn" style="flex:1;padding:10px;font-size:13px" onclick="advance('${o.id}')">${icon('zap')}<span>Advance</span></button>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `, 'orders');
}
function advance(id){ Store.advanceOrder(id); render(); }

function viewTrace(prefilledId){
  const id = prefilledId || '';
  const order = id ? Store.getOrders().find(o => o.id === id) : null;
  const listing = !order && id ? Store.getListings().find(l => l.id === id) : null;
  let body = '';
  if(order){
    body = `
      <div class="card">
        <div style="font-weight:800;font-size:16px">${esc(order.product)} · ${order.qtyKg} kg</div>
        <div class="muted">Order #${esc(order.id)} · <span class="status-pill status-${order.status}">${STATUS_LABEL[order.status]}</span></div>
        <div class="divider"></div>
        <div class="timeline">
          ${order.trace.map((t,i)=>`<div class="timeline-item ${i<order.trace.length?'done':''}"><div style="font-weight:700;font-size:14px">${esc(t.stage)}</div><div class="muted">${fmtDT(t.at)}</div></div>`).join('')}
        </div>
      </div>`;
  } else if(listing){
    body = `
      <div class="card">
        <div style="font-weight:800;font-size:16px">${esc(listing.product)}</div>
        <div class="muted">From ${esc(listing.farmerName)} · ${esc(listing.village)}</div>
        <div class="divider"></div>
        <div class="timeline">
          <div class="timeline-item done"><div style="font-weight:700;font-size:14px">Harvested by ${esc(listing.farmerName)}</div><div class="muted">${fmtDate(listing.harvestedOn)}</div></div>
          <div class="timeline-item done"><div style="font-weight:700;font-size:14px">Listed on AgriGrow</div><div class="muted">${fmtDate(listing.harvestedOn)}</div></div>
          <div class="timeline-item"><div style="font-weight:700;font-size:14px">Awaiting purchase</div><div class="muted">—</div></div>
        </div>
      </div>`;
  } else if(id){
    body = `<div class="empty">No record found for ID <b>${esc(id)}</b>.</div>`;
  }
  return withShell(`
    <div class="page-head"><div><div class="h1 serif">Traceability</div><p class="muted" style="margin-top:6px">Enter an order ID or listing ID to see its full chain — harvest to delivery.</p></div></div>
    <form id="traceForm" class="search" style="margin-bottom:18px">${I.search}<input id="tid" placeholder="o-... or l-..." value="${esc(id)}" /><button class="btn" style="padding:9px 16px">Lookup</button></form>
    ${body}
  `, 'trace');
}
function bindTrace(){
  document.getElementById('traceForm').onsubmit = e=>{
    e.preventDefault();
    go('#/trace?id=' + encodeURIComponent(document.getElementById('tid').value.trim()));
  };
}

// ---------- router ----------
function render(){
  const { path, params } = parseRoute();
  const u = Store.getUser();
  let html = '', tab = null, after = ()=>{};
  if(path === '/' || path === ''){
    if(u){ go(u.role === 'farmer' ? '#/farmer' : '#/consumer'); return; }
    html = viewLanding();
  } else if(path === '/login'){ html = viewLogin(); after = bindLogin; }
  else if(!u && path !== '/login'){ go('#/login'); return; }
  else if(path === '/farmer'){
    if(u.role !== 'farmer'){ go('#/consumer'); return; }
    html = viewFarmer(); tab = 'home';
  }
  else if(path === '/consumer'){ html = viewConsumer(); tab='home'; after = bindConsumer; }
  else if(path === '/listing'){ html = viewListing(params.id); after = ()=>bindListing(params.id); }
  else if(path === '/checkout'){ html = viewCheckout(params.id, params.qty); after = ()=>bindCheckout(params.id, params.qty); }
  else if(path === '/orders'){ html = viewOrders(); tab='orders'; }
  else if(path === '/trace'){ html = viewTrace(params.id); tab='trace'; after = bindTrace; }
  else { html = withShell(`<div class="empty">404 — page not found. <a href="#/">Go home</a></div>`, null); }

  app.innerHTML = html;
  window.scrollTo(0,0);
  after();
}

window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', render);
window.go = go; window.signOut = signOut; window.openListingDialog = openListingDialog;
window.removeListing = removeListing; window.advance = advance;
