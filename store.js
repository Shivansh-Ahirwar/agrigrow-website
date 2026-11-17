// localStorage-backed store (mock backend) — .
const K = { user:'agrigrow.user', users:'agrigrow.users', listings:'agrigrow.listings', orders:'agrigrow.orders' };

const seedListings = [
  { id:'l1', farmerId:'f-demo', farmerName:'Ramesh Patel', village:'Anand, GJ', product:'Tomato', emoji:'🍅', pricePerKg:28, marketPricePerKg:42, stockKg:120, harvestedOn:'2026-05-09', organic:true },
  { id:'l2', farmerId:'f-demo', farmerName:'Ramesh Patel', village:'Anand, GJ', product:'Spinach', emoji:'🥬', pricePerKg:35, marketPricePerKg:50, stockKg:40, harvestedOn:'2026-05-10', organic:true },
  { id:'l3', farmerId:'f-2', farmerName:'Lakshmi Devi', village:'Mysuru, KA', product:'Carrot', emoji:'🥕', pricePerKg:32, marketPricePerKg:45, stockKg:80, harvestedOn:'2026-05-08', organic:false },
  { id:'l4', farmerId:'f-3', farmerName:'Arjun Singh', village:'Nashik, MH', product:'Mango (Alphonso)', emoji:'🥭', pricePerKg:220, marketPricePerKg:320, stockKg:60, harvestedOn:'2026-05-07', organic:true },
  { id:'l5', farmerId:'f-2', farmerName:'Lakshmi Devi', village:'Mysuru, KA', product:'Green Chili', emoji:'🌶️', pricePerKg:60, marketPricePerKg:90, stockKg:25, harvestedOn:'2026-05-10', organic:true },
  { id:'l6', farmerId:'f-4', farmerName:'Sita Kumari', village:'Patna, BR', product:'Basmati Rice', emoji:'🌾', pricePerKg:75, marketPricePerKg:110, stockKg:500, harvestedOn:'2026-04-20', organic:false }
];

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
    const cur = read(K.listings, null);
    if(cur && cur.length) return cur;
    write(K.listings, seedListings); return seedListings;
  },
  saveListings(l){ write(K.listings, l); },
  addListing(l){ const all = Store.getListings(); const next = { ...l, id:`l-${Date.now()}` }; Store.saveListings([next, ...all]); return next; },
  removeListing(id){ Store.saveListings(Store.getListings().filter(l => l.id !== id)); },
  getOrders(){ return read(K.orders, []); },
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
