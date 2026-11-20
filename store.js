// localStorage-backed store (mock backend) — .
const K = { user:'agrigrow.user', users:'agrigrow.users', listings:'agrigrow.listings', orders:'agrigrow.orders' };

const SAMPLE_LISTING_IDS = new Set(['l1', 'l2', 'l3', 'l4', 'l5', 'l6']);
const SAMPLE_FARMER_IDS = new Set(['f-demo', 'f-2', 'f-3', 'f-4']);

function read(k, fb){ try{ const v = localStorage.getItem(k); return v?JSON.parse(v):fb; }catch{return fb;} }
function write(k, v){ localStorage.setItem(k, JSON.stringify(v)); }

const Store = {
  getUser(){ return read(K.user, null); },
  setUser(u){ write(K.user, u); },
  logout(){ localStorage.removeItem(K.user); },
  loginOrSignup(name, phone, role, village){
    const users = read(K.users, []);
    let u = users.find(x => x.phone === phone && x.role === role);
    if(!u){ u = { id:`${role[0]}-${Date.now()}`, name, phone, role, village }; users.push(u); write(K.users, users); }
    Store.setUser(u); return u;
  },
  loginOrSignupEmail(email, role){
    const users = read(K.users, []);
    const normalizedEmail = email.trim().toLowerCase();
    let u = users.find(x => x.email?.toLowerCase() === normalizedEmail && x.role === role);
    if(!u){
      const name = normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      u = { id:`${role[0]}-${Date.now()}`, name, email:normalizedEmail, phone:'', role, village:'' };
      users.push(u);
      write(K.users, users);
    }
    Store.setUser(u); return u;
  },
  getListings(){
    const listings = read(K.listings, []);
    const realListings = listings.filter(l => !SAMPLE_LISTING_IDS.has(l.id) && !SAMPLE_FARMER_IDS.has(l.farmerId));
    if(realListings.length !== listings.length) write(K.listings, realListings);
    const orders = read(K.orders, []);
    const realOrders = orders.filter(o => !SAMPLE_LISTING_IDS.has(o.listingId));
    if(realOrders.length !== orders.length) write(K.orders, realOrders);
    return realListings;
  },
  saveListings(l){ write(K.listings, l); },
  addListing(l){ const all = Store.getListings(); const next = { ...l, id:`l-${Date.now()}` }; Store.saveListings([next, ...all]); return next; },
  removeListing(id){ Store.saveListings(Store.getListings().filter(l => l.id !== id)); },
  getOrders(){
    const orders = read(K.orders, []);
    const realOrders = orders.filter(o => !SAMPLE_LISTING_IDS.has(o.listingId));
    if(realOrders.length !== orders.length) write(K.orders, realOrders);
    return realOrders;
  },
  saveOrders(o){ write(K.orders, o); },
  placeOrder(consumer, listing, qtyKg){
    const orders = Store.getOrders();
    const now = new Date().toISOString();
    const order = {
      id:`o-${Date.now()}`, consumerId:consumer.id, consumerName:consumer.name,
      listingId:listing.id, product:listing.product, qtyKg,
      total: Math.round(qtyKg * listing.pricePerKg),
      status:'paid', placedAt: now,
      trace:[
        { stage:`Harvested by ${listing.farmerName} (${listing.village})`, at: listing.harvestedOn },
        { stage:'Listed on AgriGrow', at: listing.harvestedOn },
        { stage:'Payment received via UPI/QR', at: now },
        { stage:'Delivery scheduled', at: now }
      ]
    };
    Store.saveOrders([order, ...orders]);
    const listings = Store.getListings().map(l => l.id === listing.id ? { ...l, stockKg: Math.max(0, l.stockKg - qtyKg) } : l);
    Store.saveListings(listings);
    return order;
  },
  advanceOrder(id){
    const flow = ['paid','scheduled','out_for_delivery','delivered'];
    const stageMap = { paid:'Payment received', scheduled:'Delivery scheduled', out_for_delivery:'Out for delivery', delivered:'Delivered to consumer' };
    const next = Store.getOrders().map(o => {
      if(o.id !== id) return o;
      const idx = flow.indexOf(o.status);
      if(idx >= flow.length - 1) return o;
      const status = flow[idx + 1];
      return { ...o, status, trace:[...o.trace, { stage: stageMap[status], at: new Date().toISOString() }] };
    });
    Store.saveOrders(next);
    return next.find(o => o.id === id) || null;
  }
};
