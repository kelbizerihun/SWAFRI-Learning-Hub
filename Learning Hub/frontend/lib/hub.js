/* Learning Hub client app.
   Rendering is the original prototype's (unchanged markup and CSS). Data now comes from the
   Express API: see "Store: server-backed" below. Loaded once by components/LearningHub.jsx. */
import qrcode from 'qrcode-generator';
import jsQR from 'jsqr';
import { verifyMessage } from 'ethers';

const IMG={"hero": "/img/hero.webp", "register": "/img/register.webp", "laptop": "/img/laptop.webp", "courseHero": "/img/courseHero.webp", "design": "/img/design.webp", "dev": "/img/dev.webp", "data": "/img/data.webp", "ai": "/img/ai.webp", "web3": "/img/web3.webp", "sql": "/img/sql.webp"};

/* ---- icons.js ---- */
const P = {
  book:'<path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z"/><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z"/>',
  cap:'<path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c3 2 9 2 12 0v-5"/>',
  grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  bot:'<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 4v4M9 14h.01M15 14h.01M2 13v3M22 13v3"/>',
  brief:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18"/>',
  cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17h.01"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6"/>',
  chat:'<path d="M4 5h12a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><path d="M18 9h2a2 2 0 0 1 2 2v7l-3-2h-6"/>',
  arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  arrowL:'<path d="M19 12H5M11 6l-6 6 6 6"/>',
  ne:'<path d="M7 17 17 7M8 7h9v9"/>',
  star:'<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z" fill="currentColor"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M6 18l2-2M16 8l2-2"/>',
  sparkles:'<path d="m10 3 1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z"/><path d="m18 14 .8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/>',
  shieldck:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  shield:'<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  check:'<path d="m5 12 5 5L20 7"/>',
  checkc:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  x:'<path d="M6 6l12 12M18 6 6 18"/>',
  alert:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5h.01"/>',
  user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff:'<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6C3.8 8.4 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.4M9.9 9.9a3 3 0 0 0 4.2 4.2"/>',
  badge:'<rect x="5" y="3" width="14" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M8.5 17a4 4 0 0 1 7 0"/>',
  building:'<path d="M3 21h18M5 21V8l7-5 7 5v13M9 21v-5h6v5M9 11h.01M15 11h.01"/>',
  map:'<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  pin:'<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  chev:'<path d="m6 9 6 6 6-6"/>',
  chevR:'<path d="m9 6 6 6-6 6"/>',
  search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8M10 20a2 2 0 0 0 4 0"/>',
  play:'<path d="M7 4v16l13-8z" fill="currentColor"/>',
  playc:'<circle cx="12" cy="12" r="9"/><path d="m10 8.5 5 3.5-5 3.5z"/>',
  pause:'<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>',
  replay:'<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>',
  vol:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/>',
  mute:'<path d="M11 5 6 9H3v6h3l5 4z"/><path d="m16 9 5 6M21 9l-5 6"/>',
  cc:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M10 10a2 2 0 1 0 0 4M17 10a2 2 0 1 0 0 4"/>',
  gear:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  full:'<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  focus:'<path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4"/>',
  note:'<path d="M4 4h12l4 4v12H4z"/><path d="M8 12h8M8 16h5"/>',
  bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',
  bookmarkf:'<path d="M6 3h12v18l-6-4-6 4z" fill="currentColor"/>',
  file:'<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>',
  layout:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/>',
  download:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  pencil:'<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m14 6 4 4"/>',
  list:'<path d="M9 6h12M9 12h12M9 18h12M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
  video:'<rect x="2" y="6" width="14" height="12" rx="2"/><path d="m16 10 6-3v10l-6-3z"/>',
  award:'<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>',
  infinity:'<path d="M18 8a4 4 0 1 1 0 8c-2.5 0-4-2-6-4s-3.5-4-6-4a4 4 0 1 0 0 8c2.5 0 4-2 6-4s3.5-4 6-4z"/>',
  tools:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
  cup:'<path d="M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2"/>',
  chart:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  barchart:'<path d="M6 20v-6M12 20V8M18 20v-10"/>',
  compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  bookopen:'<path d="M3 5h6a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3zM21 5h-6a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h7z"/><path d="m14 11 2 2 3-3"/>',
  fire:'<path d="M12 21c4 0 7-2.7 7-6.8 0-4.7-4-6.6-5-11.2-1.6 2-2.6 3.7-2.6 6.3C9.3 8.6 8.7 7.6 8.5 6.5 6.7 8.1 5 10.5 5 14.2 5 18.3 8 21 12 21z"/>',
  bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  trophy:'<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
  sunrise:'<path d="M12 3v4M4.9 10.9l1.4 1.4M2 18h20M19.1 10.9l-1.4 1.4M7 18a5 5 0 0 1 10 0M4 22h16"/>',
  trend:'<path d="m3 17 6-6 4 4 8-8M15 7h6v6"/>',
  logout:'<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l-5-5 5-5M5 12h12"/>',
  moon:'<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  trash:'<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  up:'<path d="m6 15 6-6 6 6"/>',
  down:'<path d="m6 9 6 6 6-6"/>',
  send:'<path d="M12 19V5M5 12l7-7 7 7"/>',
  link:'<path d="M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/>',
  copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
  cube:'<path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
  chain:'<rect x="2" y="8" width="8" height="8" rx="2"/><rect x="14" y="8" width="8" height="8" rx="2"/><path d="M10 12h4"/>',
  key:'<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.3-9.3M17 6l3 3M14 9l2 2"/>',
  qr:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 17h4v4h-4"/>',
  wallet:'<path d="M3 7a2 2 0 0 1 2-2h13v4"/><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M16 13.5h.01"/>',
  upload:'<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
  ban:'<circle cx="12" cy="12" r="9"/><path d="m5.6 5.6 12.8 12.8"/>',
  sidebar:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M18 9l-1.5 1.5L18 12"/>',
  cloud:'<path d="M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19.5 10 4 4 0 0 1 18 18z"/><path d="m9.5 13.5 2 2 3.5-3.5"/>',
  hex:'<path d="M12 2 21 7v10l-9 5-9-5V7z"/>',
  refresh:'<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
  filter:'<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
  li:'<path d="M4 9h3v11H4zM5.5 4.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM10 9h3v1.6c.6-1 1.8-1.8 3.5-1.8 3 0 3.5 2 3.5 4.6V20h-3v-5.6c0-1.4-.2-2.6-1.8-2.6s-2.2 1.2-2.2 2.6V20h-3z" fill="currentColor" stroke="none"/>',
  ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
  yt:'<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>',
  fb:'<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5z"/>',
  google:'<path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3z" fill="#4285F4" stroke="none"/><path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22z" fill="#34A853" stroke="none"/><path d="M6.4 14c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2V7.4H3.1A10 10 0 0 0 2 12c0 1.6.4 3.1 1.1 4.6z" fill="#FBBC05" stroke="none"/><path d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.4L6.4 10C7.2 7.7 9.4 6 12 6z" fill="#EA4335" stroke="none"/>',
};
const ic = (n, cls='') => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]||''}</svg>`;

/* ---- data.js ---- */
const CATS = {design:['Design','p-design'],dev:['Development','p-dev'],data:['Data science','p-data'],ai:['Artificial intelligence','p-ai'],web3:['Web3','p-web3']};

const FAQS = [
  ['How do blockchain certificates work?','When you finish every lesson and pass each quiz, Learning Hub creates a certificate record (ID, learner, course, date and score), computes its SHA-256 fingerprint, signs it with the issuer’s key and records the fingerprint in a new block on our ledger. Anyone can recompute the fingerprint and check the signature and block—no need to contact us.'],
  ['How can an employer verify my certificate?','Share the certificate link or QR code. The Verify page checks four things in seconds: the record’s fingerprint, the issuer signature, the on-chain anchor and whether the certificate has been revoked.'],
  ['What is the Digital Achievement Wallet?','A public profile that shows your certificates, badges and skills. You control whether it’s visible and can share its link anywhere.'],
  ['Can a certificate be revoked?','Yes. Admins can revoke a certificate that was issued in error. Revocation is recorded as a new transaction, so the history stays transparent.'],
  ['Do I need a crypto wallet?','No. Every learner gets a wallet address automatically when they register. There’s nothing to buy and no fees.'],
  ['How do I become an instructor?','Choose “Instructor” when you register. You can build courses, lessons and quizzes and track your students’ progress.'],
];
const UNIVERSITIES = [
  ['Addis Ababa University','Addis Ababa, Ethiopia'],['Kotebe University of Education','Addis Ababa, Ethiopia'],['Addis Ababa Science and Technology University','Addis Ababa, Ethiopia'],
  ['Bahir Dar University','Bahir Dar, Ethiopia'],['Jimma University','Jimma, Ethiopia'],['Mekelle University','Mekelle, Ethiopia'],['Hawassa University','Hawassa, Ethiopia'],
  ['University of Gondar','Gondar, Ethiopia'],['Haramaya University','Harar, Ethiopia'],['Arba Minch University','Arba Minch, Ethiopia'],['Adama Science and Technology University','Adama, Ethiopia'],
  ['University of Nairobi','Nairobi, Kenya'],['Makerere University','Kampala, Uganda'],['University of Rwanda','Kigali, Rwanda'],['Other / Not listed','']
];
const REGIONS = {'Addis Ababa':['Addis Ababa'],'Amhara':['Bahir Dar','Gondar','Dessie','Debre Birhan'],'Oromia':['Adama','Jimma','Bishoftu','Shashamane'],'Tigray':['Mekelle','Adigrat','Axum'],'Sidama':['Hawassa'],'Dire Dawa':['Dire Dawa'],'Harari':['Harar'],'Southern Ethiopia':['Arba Minch','Wolaita Sodo'],'Somali':['Jigjiga'],'Afar':['Semera'],'Other':['Other']};
const STATUSES = ['Freshman','Sophomore','Junior','Senior','Graduate','Master’s','PhD','Alumni'];
const FIELDS = ['Computer Science','Computer Engineering','Comparative Literature','Information Systems','Software Engineering','Electrical Engineering','Data Science','Business Administration','Economics','Graphic Design','Mathematics','Statistics','Medicine','Law','Other'];

/* ---- core.js ---- */
/* ================= Utilities ================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid = (p='id') => p + '_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
const initials = n => String(n||'?').replace(/^Dr\.?\s+/,'').split(/\s+/).filter(Boolean).slice(0,2).map(w=>w[0].toUpperCase()).join('');
const avClass = s => 'av-' + ((String(s).split('').reduce((a,c)=>a+c.charCodeAt(0),0) % 3) + 1);
const avatar = (u, size='') => u?.avatarUrl ? `<span class="avatar ${size}" aria-hidden="true" style="padding:0;overflow:hidden"><img src="${esc(u.avatarUrl)}" alt="" style="width:100%;height:100%;object-fit:cover"></span>` : `<span class="avatar ${size} ${avClass(u?.id||u?.name||'')}" aria-hidden="true">${esc(initials(u?.name))}</span>`;
const dayKey = (d = new Date()) => { const x = new Date(d); return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`; };
const fmtDate = (d, o={day:'numeric',month:'short',year:'numeric'}) => new Date(d).toLocaleDateString('en-US', o);
const fmtDT = d => new Date(d).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'});
const fmtMin = m => m >= 60 ? `${Math.floor(m/60)} hr${m%60 ? ' ' + (m%60) + ' min' : ''}` : `${m} min`;
const fmtClock = s => { s = Math.max(0, Math.floor(s)); return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; };
const hoursLabel = m => { const h = m/60; return (h >= 10 ? Math.round(h) : Math.round(h*2)/2) + ' hours'; };
const short = (h, n=10) => h ? `${h.slice(0, n)}…${h.slice(-6)}` : '';
const plural = (n, w, p) => `${n} ${n === 1 ? w : (p || w + 's')}`;
const daysAgo = n => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

/* ================= SHA-256 (sync, for mining & hashing) ================= */
const sha256 = (() => {
  const K = new Uint32Array([0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2]);
  const enc = new TextEncoder(); const W = new Uint32Array(64);
  return str => {
    const msg = enc.encode(str); const l = msg.length; const nb = ((l + 9 + 63) >> 6) << 6;
    const buf = new Uint8Array(nb); buf.set(msg); buf[l] = 0x80;
    const dv = new DataView(buf.buffer); dv.setUint32(nb - 4, (l * 8) >>> 0); dv.setUint32(nb - 8, Math.floor(l / 0x20000000));
    let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
    for (let o = 0; o < nb; o += 64) {
      for (let i = 0; i < 16; i++) W[i] = dv.getUint32(o + i*4);
      for (let i = 16; i < 64; i++) {
        const a = W[i-15], b = W[i-2];
        const s0 = ((a>>>7)|(a<<25)) ^ ((a>>>18)|(a<<14)) ^ (a>>>3);
        const s1 = ((b>>>17)|(b<<15)) ^ ((b>>>19)|(b<<13)) ^ (b>>>10);
        W[i] = (W[i-16] + s0 + W[i-7] + s1) | 0;
      }
      let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
      for (let i = 0; i < 64; i++) {
        const S1 = ((e>>>6)|(e<<26)) ^ ((e>>>11)|(e<<21)) ^ ((e>>>25)|(e<<7));
        const t1 = (h + S1 + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0;
        const S0 = ((a>>>2)|(a<<30)) ^ ((a>>>13)|(a<<19)) ^ ((a>>>22)|(a<<10));
        const t2 = (S0 + ((a & b) ^ (a & c) ^ (b & c))) | 0;
        h=g; g=f; f=e; e=(d + t1)|0; d=c; c=b; b=a; a=(t1 + t2)|0;
      }
      h0=(h0+a)|0;h1=(h1+b)|0;h2=(h2+c)|0;h3=(h3+d)|0;h4=(h4+e)|0;h5=(h5+f)|0;h6=(h6+g)|0;h7=(h7+h)|0;
    }
    return [h0,h1,h2,h3,h4,h5,h6,h7].map(x => (x>>>0).toString(16).padStart(8,'0')).join('');
  };
})();
const canonical = o => {
  if (o === null || typeof o !== 'object') return JSON.stringify(o);
  if (Array.isArray(o)) return '[' + o.map(canonical).join(',') + ']';
  return '{' + Object.keys(o).sort().map(k => JSON.stringify(k) + ':' + canonical(o[k])).join(',') + '}';
};
/* ================= Store: server-backed =================
   The Express API is the source of truth. `S` is a read-only snapshot of what this viewer
   may see (GET /api/state); every change goes through an API call, then re-syncs. */
const SESSION_KEY = 'learninghub-token', THEME_KEY = 'learninghub-theme';
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api').replace(/\/$/, '');
let S = null; let memStore = {};
const ls = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return memStore[k] ?? null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { memStore[k] = v; } },
  del(k) { try { localStorage.removeItem(k); } catch (e) { delete memStore[k]; } }
};

async function api(method, path, body) {
  const headers = {'Content-Type':'application/json'}; const t = ls.get(SESSION_KEY); if (t) headers.Authorization = 'Bearer ' + t;
  let r;
  try { r = await fetch(API_BASE + path, {method, headers, body:body === undefined ? undefined : JSON.stringify(body)}); }
  catch (e) { const er = new Error('Can’t reach the Learning Hub server. Check that the API is running.'); er.status = 0; throw er; }
  const data = await r.json().catch(() => null);
  if (!r.ok) { const er = new Error(data?.error || `Request failed (${r.status}).`); er.status = r.status; er.data = data; if (r.status === 401 && t) ls.del(SESSION_KEY); throw er; }
  return data;
}
async function sync() { S = await api('GET', '/state'); if (ls.get(SESSION_KEY) && !S.meId) ls.del(SESSION_KEY); return S; }
/** Runs a change on the server and refreshes the snapshot. Returns the response, or null after showing the error. */
async function mutate(method, path, body, {resync = true} = {}) {
  try { const r = await api(method, path, body); if (resync) await sync(); return r || {}; }
  catch (e) { toast(e.message, 'err'); if (e.status !== 0) { try { await sync(); } catch (x) {} render(); } return null; }
}
/** Fire-and-forget for background progress (watch %, study minutes, last lesson). */
const fire = (method, path, body) => api(method, path, body).catch(e => console.warn('[sync]', e.message));
const WQ = {};
function queueWatch(e, lid) { const k = e.courseId + '|' + lid; clearTimeout(WQ[k]); WQ[k] = setTimeout(() => fire('PATCH', `/enrollments/${e.courseId}/watch`, {lessonId:lid, pct:e.watch[lid] || 0}), 2500); }
function save() {}
async function saveCourse(c) {
  const body = {title:c.title, tagline:c.tagline, cat:c.cat, level:c.level, img:c.img, about:c.about, outcomes:c.outcomes, includes:c.includes, before:c.before, project:c.project, skills:c.skills, passMark:c.passMark, price:c.price || 0, published:c.published, modules:c.modules};
  const r = await mutate('PUT', '/courses/' + c.id, body, {resync:false}); if (!r) return null;
  const i = S.courses.findIndex(x => x.id === c.id); if (i >= 0) S.courses[i] = r.course;
  return r;
}
async function resetDemo() { await mutate('POST', '/demo/reset', undefined, {resync:false}); ls.del(SESSION_KEY); await sync(); }

const me = () => S?.meId ? S.users.find(u => u.id === S.meId) || null : null;
const userById = id => S.users.find(u => u.id === id);
const courseById = id => S.courses.find(c => c.id === id);
const lessonsOf = c => c.modules.flatMap(m => m.lessons.map(l => ({...l, moduleId:m.id, moduleTitle:m.title})));
const courseMinutes = c => lessonsOf(c).reduce((a, l) => a + (+l.min || 0), 0);
const enrollmentOf = (userId, courseId) => S.enrollments.find(e => e.userId === userId && e.courseId === courseId);
const progressOf = e => { if (!e) return 0; const c = courseById(e.courseId); if (!c) return 0; const n = lessonsOf(c).length; return n ? Math.round(Object.keys(e.done).filter(id => lessonsOf(c).some(l => l.id === id)).length / n * 100) : 0; };
const doneCount = e => { const c = courseById(e.courseId); return c ? lessonsOf(c).filter(l => e.done[l.id]).length : 0; };
function autoSummary(t, ct) { return `In this lesson you’ll work through “${t}” step by step, with practical examples you can apply right away in ${ct}.`; }
function autoPoints(t) { return [`Why “${t.replace(/^Practice:\s*|^Project:\s*|^Capstone:\s*|^Lab:\s*/,'')}” matters`, 'Worked example, start to finish', 'Common mistakes and how to avoid them', 'A quick recap to lock it in']; }

/* ================= Ledger checks (read-only; blocks are mined on the server) ================= */
const DIFFICULTY = 3;
const txHash = tx => sha256(canonical(tx));
function merkleRoot(hashes) {
  if (!hashes.length) return sha256('');
  let level = hashes.slice();
  while (level.length > 1) { const next = []; for (let i = 0; i < level.length; i += 2) next.push(sha256(level[i] + (level[i+1] ?? level[i]))); level = next; }
  return level[0];
}
const headerStr = b => `${b.index}|${b.timestamp}|${b.prevHash}|${b.merkleRoot}|${b.nonce}`;
function checkBlock(b, prev) {
  const issues = [];
  if (sha256(headerStr(b)) !== b.hash) issues.push('Block hash doesn’t match its contents');
  if (!b.hash.startsWith('0'.repeat(DIFFICULTY))) issues.push('Proof of work is missing');
  if (merkleRoot(b.txs.map(txHash)) !== b.merkleRoot) issues.push('Transactions were altered (Merkle root mismatch)');
  if (prev && b.prevHash !== prev.hash) issues.push('Link to previous block is broken');
  return issues;
}
function validateChain() {
  for (let i = 0; i < S.chain.length; i++) { const issues = checkBlock(S.chain[i], S.chain[i-1]); if (issues.length) return {ok:false, at:i, issues}; }
  return {ok:true, blocks:S.chain.length};
}
const findTx = (pred) => { for (const b of S.chain) for (const t of b.txs) if (pred(t)) return {block:b, tx:t}; return null; };

/* ================= Certificates: independent in-browser verification ================= */
function certPayload(c) { return {id:c.id, studentName:c.studentName, studentWallet:c.studentWallet, courseId:c.courseId, courseTitle:c.courseTitle, instructorName:c.instructorName, issuedAt:c.issuedAt, score:c.score, skills:c.skills, issuer:c.issuer}; }

/* Recomputes the fingerprint and recovers the signer here in the browser, checks the ledger
   block, and compares with the CertificateRegistry contract record. Returns {verdict, steps[]} */
async function verifyRecord(rec, opts = {}) {
  const steps = [];
  const recomputed = sha256(canonical(certPayload(rec)));
  const hashOk = recomputed === rec.hash;
  steps.push({k:'hash', ok:hashOk, title:'Certificate fingerprint matches', detail:hashOk ? `SHA-256 ${rec.hash}` : `Expected ${rec.hash.slice(0,24)}… but the record now hashes to ${recomputed.slice(0,24)}…. The details were changed after issue.`});
  const iss = S.issuer; let signer = null; try { signer = verifyMessage(rec.hash, rec.signature); } catch (e) {}
  const sigOk = !!signer && signer.toLowerCase() === iss.address.toLowerCase() && rec.issuer?.did === iss.did;
  steps.push({k:'sig', ok:sigOk, title:'Signed by a trusted issuer', detail:sigOk ? `${rec.issuer?.name} · ${short(iss.address, 10)} · ECDSA secp256k1` : `The signature doesn’t come from the Learning Hub issuer${signer ? ` (signed by ${short(signer, 10)})` : ''}.`});
  const block = opts.block ? (S.chain.find(b => b.index === opts.block.index && b.hash === opts.block.hash) || opts.block) : S.chain.find(b => b.index === rec.blockIndex && b.hash === rec.blockHash);
  let anchorOk = false, anchorDetail = 'No block on the ledger contains this certificate’s fingerprint.';
  if (block) {
    const tx = block.txs.find(t => t.type === 'MINT_CERTIFICATE' && t.certId === rec.id);
    const issues = checkBlock(block, S.chain[block.index - 1]);
    anchorOk = !!tx && tx.certHash === recomputed && !issues.length;
    anchorDetail = anchorOk ? `Block #${block.index} · ${short(block.hash, 14)} · mined ${fmtDT(block.timestamp)}` : (issues[0] || (tx ? 'The on-chain fingerprint differs from this record.' : 'The block doesn’t contain this certificate.'));
  }
  steps.push({k:'chain', ok:anchorOk, title:'Anchored on the Learning Hub ledger', detail:anchorDetail});
  let evmOk = null, evmRev = false; const oc = opts.onchain;
  if (oc?.configured) {
    const a = oc.anchor, live = oc.live;
    if (!a || a.status !== 'confirmed') steps.push({k:'evm', ok:null, title:'EVM anchor pending', detail:a?.status === 'failed' ? (a.error || 'Anchoring will be retried.') : `Waiting for ${oc.network || 'the network'} to confirm the transaction.`});
    else if (!live || live.error) steps.push({k:'evm', ok:null, title:`Recorded on ${a.network || 'the EVM chain'}`, detail:`Tx ${short(a.txHash || '', 12)} · the network couldn’t be re-read right now.`});
    else {
      evmOk = live.exists && live.certHash === recomputed; evmRev = !!live.revokedAt;
      const tx = oc.explorerUrl && a.txHash ? ` · <a href="${esc(oc.explorerUrl.replace(/\/$/, ''))}/tx/${esc(a.txHash)}" target="_blank" rel="noopener">view on explorer</a>` : '';
      steps.push({k:'evm', ok:evmOk, html:true, title:`Anchored on ${a.network} smart contract`, detail:evmOk ? `Contract ${esc(short(oc.contract, 10))} · tx ${esc(short(a.txHash || '', 12))} · block ${a.blockNumber}${tx}` : live.exists ? 'The fingerprint stored on-chain differs from this record.' : 'The contract has no record of this certificate.'});
    }
  }
  const rev = opts.revocation || (findTx(t => t.type === 'REVOKE_CERTIFICATE' && t.certId === rec.id)?.tx) || (rec.status === 'revoked' ? {reason:rec.revokeReason, at:rec.revokedAt} : null);
  steps.push({k:'rev', ok:!rev && !evmRev, title:'Not revoked', detail:rev ? `Revoked ${fmtDate(rev.at)} · ${rev.reason || 'No reason given'}` : evmRev ? 'The smart contract marks this certificate as revoked.' : 'No revocation transaction found.'});
  const verdict = !hashOk || !sigOk || !anchorOk || evmOk === false ? 'invalid' : (rev || evmRev) ? 'revoked' : 'valid';
  return {verdict, steps, recomputed};
}

/* ================= Activity, streaks, badges ================= */
function logMinutes(userId, mins) { S.activity[userId] = S.activity[userId] || {}; const k = dayKey(); S.activity[userId][k] = (S.activity[userId][k] || 0) + mins; fire('POST', '/me/activity', {minutes:mins}); }

function weekData(userId, offset = 0) {
  const a = S.activity[userId] || {}; const out = [];
  for (let i = 6; i >= 0; i--) { const d = daysAgo(i + offset * 7); out.push({d, key:dayKey(d), min:a[dayKey(d)] || 0}); }
  return out;
}
function streakOf(userId) { const a = S.activity[userId] || {}; let n = 0; let i = a[dayKey()] ? 0 : 1; while (a[dayKey(daysAgo(i))]) { n++; i++; } return n; }
function lessonsThisWeek(userId) { const since = daysAgo(6); since.setHours(0,0,0,0); let n = 0; S.enrollments.filter(e => e.userId === userId).forEach(e => Object.values(e.done).forEach(t => { if (new Date(t) >= since) n++; })); return n; }

const BADGES = [
  {id:'first', icon:'trophy', tone:'h-amber', title:'First finish', desc:'Complete your first course', test:u => S.enrollments.some(e => e.userId === u.id && e.completedAt)},
  {id:'chain', icon:'cube', tone:'h-teal', title:'On-chain', desc:'Earn a blockchain certificate', test:u => S.certs.some(c => c.studentId === u.id && c.status === 'valid')},
  {id:'data', icon:'trend', tone:'h-blue', title:'Data explorer', desc:'Complete a data course', test:u => S.enrollments.some(e => e.userId === u.id && e.completedAt && courseById(e.courseId)?.cat === 'data')},
  {id:'early', icon:'sunrise', tone:'h-purple', title:'Early bird', desc:'Finish a lesson before 9 AM', test:u => S.enrollments.some(e => e.userId === u.id && Object.values(e.done).some(t => new Date(t).getHours() < 9))},
  {id:'ace', icon:'target', tone:'h-pink', title:'Quiz ace', desc:'Score 100% on a quiz', test:u => S.enrollments.some(e => e.userId === u.id && Object.values(e.quiz).some(q => q.best === 100))},
  {id:'streak', icon:'fire', tone:'h-green', title:'Consistency', desc:'Keep a 14-day streak', test:u => streakOf(u.id) >= 14},
];
const badgesOf = u => BADGES.map(b => ({...b, earned:u.earnedBadges ? u.earnedBadges.includes(b.id) : !!b.test(u)}));
function skillsOf(u) {
  const m = {}; S.certs.filter(c => c.studentId === u.id && c.status === 'valid').forEach(c => (c.skills||[]).forEach(s => m[s] = (m[s]||0) + 1));
  return Object.entries(m).sort((a,b) => b[1]-a[1]);
}
/* ---- app.js ---- */
/* ================= UI state, mount hooks, actions ================= */
const UI = {q:'', cat:'all', level:'all', openMods:{}, tab:{}, chatOpen:false, chat:[], chatBusy:false, lastRoute:'', after:[]};
const onMount = fn => UI.after.push(fn);
const ACT = {}; const FORMS = {};
const go = h => { if (location.hash.slice(1) === h) render(); else location.hash = h; };

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]');
  if (el && ACT[el.dataset.act]) { if (el.tagName !== 'INPUT') e.preventDefault(); ACT[el.dataset.act](el, e); return; }
  if (!e.target.closest('.dropdown,[data-dd]')) $$('.dropdown[data-auto]').forEach(d => d.remove());
  if (!e.target.closest('.combo')) $$('.combo-pop').forEach(p => p.remove());
});
document.addEventListener('submit', e => { const f = e.target.closest('form[data-form]'); if (f && FORMS[f.dataset.form]) { e.preventDefault(); FORMS[f.dataset.form](f, e); } });
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { const s = $('#gsearch'); if (s) { e.preventDefault(); s.focus(); } }
  if (e.key === 'Escape') { closeModal(); $$('.dropdown[data-auto]').forEach(d => d.remove()); }
});

/* ================= Toasts & modals ================= */
function toast(msg, kind = 'ok') {
  let box = $('.toasts'); if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role','status'); document.body.appendChild(box); }
  const t = document.createElement('div'); t.className = 'toast';
  t.innerHTML = ic(kind === 'err' ? 'alert' : kind === 'info' ? 'sparkles' : 'checkc') + `<span>${esc(msg)}</span>`;
  box.appendChild(t); setTimeout(() => t.remove(), 3600);
}
function openModal({title, body, foot = '', wide = false, onClose}) {
  closeModal();
  const bg = document.createElement('div'); bg.className = 'modal-bg'; bg.id = 'modal';
  bg.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="modal-h"><h3>${esc(title)}</h3><button class="iconbtn" data-act="closeModal" aria-label="Close">${ic('x')}</button></div>
    <div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ''}</div>`;
  bg.addEventListener('mousedown', e => { if (e.target === bg) closeModal(); });
  document.body.appendChild(bg); UI.modalClose = onClose;
  setTimeout(() => { const f = bg.querySelector('input,textarea,select'); f && f.focus(); }, 30);
  return bg;
}
function closeModal() { const m = $('#modal'); if (m) { m.remove(); const cb = UI.modalClose; UI.modalClose = null; cb && cb(); } }
ACT.closeModal = closeModal;
function confirmBox(title, text, okLabel, fn, danger = false) {
  openModal({title, body:`<p class="muted">${esc(text)}</p>`, foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="cfm">${esc(okLabel)}</button>`});
  $('#cfm').onclick = () => { closeModal(); fn(); };
}

/* ================= Theme ================= */
function applyTheme() { const t = ls.get(THEME_KEY); if (t) document.documentElement.dataset.theme = t; else delete document.documentElement.dataset.theme; }
const isDark = () => document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
ACT.theme = () => { ls.set(THEME_KEY, isDark() ? 'light' : 'dark'); applyTheme(); render(); };

/* ================= Shared components ================= */
const brand = (href = 'home', alt = false) => `<a class="brand" href="#${href}"><span class="brand-mark">${ic(alt ? 'cap' : 'book')}</span>${alt ? '<span>Learning<span style="color:var(--primary-text)">Hub</span></span>' : 'Learning Hub'}</a>`;
const priceOf = c => c?.price > 0 ? '$' + (c.price / 100).toFixed(c.price % 100 ? 2 : 0) : '';
const catPill = cat => { const c = CATS[cat] || ['Course','p-gray']; return `<span class="pill ${c[1]}">${esc(c[0])}</span>`; };
const stars = r => `<span class="star" aria-label="${r} out of 5">★</span>`;
const imgOf = c => IMG[c.img] || IMG.design;

function userMenuDropdown(u) {
  const links = u.role === 'student' ? [['dashboard','grid','Dashboard'],['my-learning','book','My learning'],['certificates','award','My certificates'],['wallet-' + u.handle,'wallet','Achievement wallet']]
    : u.role === 'instructor' ? [['instructor','grid','Instructor dashboard'],['instructor-courses','book','My courses'],['instructor-students','users','Student progress']]
    : [['admin','grid','Admin overview'],['admin-users','users','Users'],['admin-certs','award','Certificates'],['admin-chain','cube','Ledger explorer']];
  return `<div class="dropdown" data-auto>
    <div class="row" style="padding:8px 10px 10px">${avatar(u)}<div><b style="font-size:14px">${esc(u.name)}</b><div class="xs muted">${esc(u.email)}</div></div></div><hr>
    ${links.map(([h, i, t]) => `<a href="#${h}">${ic(i)}${t}</a>`).join('')}
    <a href="#verify">${ic('shieldck')}Verify a certificate</a>
    <a href="#account">${ic('gear')}Account</a>
    <button class="dd" data-act="theme">${ic(isDark() ? 'sun' : 'moon')}${isDark() ? 'Light mode' : 'Dark mode'}</button><hr>
    <button class="dd" data-act="logout">${ic('logout')}Log out</button></div>`;
}
ACT.userMenu = el => { const ex = el.parentElement.querySelector('.dropdown'); if (ex) { ex.remove(); return; } el.insertAdjacentHTML('afterend', userMenuDropdown(me())); };
ACT.logout = async () => { ls.del(SESSION_KEY); UI.chat = []; await sync().catch(() => {}); toast('You’ve logged out.'); go('home'); };

function publicHeader(active) {
  const u = me();
  const nav = [['home','Home'],['courses','Courses'],...(u ? [['dashboard','Dashboard']] : []),['careers','Careers'],['events','Events'],['faq','FAQ'],['about','About Us'],['contact','Contact Us']];
  return `<header class="site-header"><div class="wrap">
    ${brand()}
    <nav class="mainnav" id="mainnav" aria-label="Main">${nav.map(([h, t]) => `<a href="#${h}" class="${active === h ? 'on' : ''}">${t}</a>`).join('')}</nav>
    <div class="hdr-actions">
      <a class="btn btn-ghost btn-sm" href="#verify" title="Verify a certificate">${ic('shieldck')}<span class="hide-sm">Verify</span></a>
      ${u ? `<div class="usermenu"><button class="avbtn" data-act="userMenu" data-dd aria-label="Account menu">${avatar(u)}</button></div>`
          : `<a class="btn btn-outline" href="#login">Login</a><a class="btn btn-primary" href="#register">Register</a>`}
      <button class="iconbtn menu-toggle" data-act="navToggle" aria-label="Open menu">${ic('menu')}</button>
    </div></div></header>`;
}
ACT.navToggle = () => $('#mainnav')?.classList.toggle('open');

function footer() {
  return `<footer class="site-footer"><div class="wrap">
    <div class="fgrid">
      <div>${brand()}<p style="margin-top:18px;max-width:260px">A world of learning. A future of possibilities. Build yours with us.</p>
        <div class="socials"><span>${ic('li')}</span><span>${ic('ig')}</span><span>${ic('yt')}</span><span>${ic('fb')}</span></div></div>
      <div><h4>Explore</h4><a href="#courses">Courses</a>${me() ? '<a href="#dashboard">Dashboard</a>' : ''}<a href="#careers">Careers</a><a href="#events">Events</a></div>
      <div><h4>Learning Hub</h4><a href="#about">About Us</a><a href="#contact">Contact Us</a><a href="#faq">FAQ</a><a href="#verify">Verify a certificate</a></div>
      <div><h4 style="font-size:20px">Keep your curiosity growing.</h4><p style="font-size:14px;margin-bottom:16px">New courses, live events, and fresh opportunities. A little inspiration in your inbox.</p>
        <form class="subscribe" data-form="subscribe"><label class="sr" for="submail">Email address</label><input id="submail" type="email" required placeholder="Your email address"><button class="btn btn-primary btn-sm">Subscribe</button></form>
        <p class="xs" style="margin-top:10px">No spam. Just possibility. Unsubscribe anytime.</p></div>
    </div>
    <div class="fbottom"><span>© 2026 Learning Hub. All rights reserved.</span><span style="display:flex;gap:24px"><a href="#faq" style="margin:0">Privacy Policy</a><a href="#faq" style="margin:0">Terms of Service</a></span></div>
  </div></footer>`;
}
FORMS.subscribe = async f => { const v = f.querySelector('input').value.trim(); if (!(await mutate('POST', '/subscribe', {email:v}, {resync:false}))) return; f.reset(); toast('Subscribed. Watch your inbox for new courses and events.'); };
const publicPage = (active, body) => publicHeader(active) + `<main id="main">${body}</main>` + footer();

/* course card */
function courseCard(c) {
  const u = me(); const e = u && enrollmentOf(u.id, c.id); const p = progressOf(e); const ins = userById(c.instructor);
  const label = !e ? (c.price > 0 ? `Enroll · ${priceOf(c)}` : 'Enroll Now') : e.completedAt ? 'View certificate' : p ? 'Continue' : 'Start learning';
  return `<article class="card course-card">
    <div class="cc-img" data-act="openCourse" data-id="${c.id}"><img src="${imgOf(c)}" alt="" loading="lazy">${catPill(c.cat)}</div>
    <div class="cc-body">
      <h3 data-act="openCourse" data-id="${c.id}">${esc(c.title)}</h3>
      <div class="small muted">By ${esc(ins?.name || 'Instructor')}</div>
      <div class="cc-meta"><span>${stars()} <b style="color:var(--ink)">${c.rating}</b> (${c.reviews})</span><span class="row" style="gap:4px">${ic('clock').replace('<svg','<svg style="width:14px;height:14px"')} ${hoursLabel(courseMinutes(c))}</span></div>
      <div class="row between xs muted"><span>Your progress</span><b style="color:var(--primary-text)">${p}%</b></div>
      <div class="bar"><span style="width:${p}%"></span></div>
      <button class="btn btn-soft btn-block" style="margin-top:6px" data-act="${!e ? 'enroll' : e.completedAt ? 'viewCert' : 'resume'}" data-id="${c.id}" ${e?.certId ? `data-cert="${e.certId}"` : ''}>${label} ${ic('arrow')}</button>
    </div></article>`;
}
ACT.openCourse = el => go('course-' + el.dataset.id);
ACT.viewCert = el => go('cert-' + el.dataset.cert);
ACT.enroll = el => enroll(el.dataset.id);
ACT.resume = el => resumeCourse(el.dataset.id);

async function enroll(courseId, startNow = false) {
  const u = me();
  if (!u) { UI.pending = 'course-' + courseId; toast('Create an account or log in to enroll.', 'info'); go('register'); return; }
  if (u.role !== 'student') { toast('Enrollment is for student accounts. Log in as a student to enroll.', 'info'); return; }
  const course = courseById(courseId);
  if (!enrollmentOf(u.id, courseId) && course.price > 0) return startCheckout(course);
  if (!enrollmentOf(u.id, courseId)) {
    if (!(await mutate('POST', `/courses/${courseId}/enroll`))) return;
    toast(`Enrolled in ${courseById(courseId).title}.`);
  }
  if (startNow) resumeCourse(courseId); else render();
}
/* Paid courses: hand off to Stripe's hosted checkout page; enrollment happens after Stripe confirms payment. */
async function startCheckout(c) {
  if (!S.payEnabled) { toast('Payments aren’t set up on this server yet.', 'err'); return; }
  openModal({title:'Secure checkout', body:`<div class="celebrate"><div class="big"><span class="spin" style="width:36px;height:36px;border-width:3px"></span></div><h3>Taking you to Stripe…</h3><p class="muted" style="margin-top:6px">${esc(c.title)} · ${priceOf(c)}. You’ll pay on Stripe’s secure page and come straight back to your course.</p></div>`});
  const r = await mutate('POST', '/payments/checkout', {courseId:c.id}, {resync:false});
  if (!r?.url) { closeModal(); return; }
  location.href = r.url;
}
function resumeCourse(courseId) {
  const u = me(); const e = u && enrollmentOf(u.id, courseId); const c = courseById(courseId);
  if (!e) return enroll(courseId, true);
  const ls_ = lessonsOf(c); const next = ls_.find(l => !e.done[l.id]) || (e.last && ls_.find(l => l.id === e.last.lessonId)) || ls_[0];
  go(`learn-${courseId}-${next.id}`);
}

function emptyState(icon, title, text, cta = '') { return `<div class="empty"><div class="ic ic-blue">${ic(icon)}</div><h3>${esc(title)}</h3><p>${esc(text)}</p>${cta ? `<div style="margin-top:16px">${cta}</div>` : ''}</div>`; }

/* ================= App shell (signed-in workspace) ================= */
function sideNav(u, active) {
  const S_ = (h, i, t, cnt) => `<a href="#${h}" class="${active === h ? 'on' : ''}">${ic(i)}${t}${cnt ? `<span class="cnt">${cnt}</span>` : ''}</a>`;
  let main = '', more = '';
  if (u.role === 'student') {
    const act = S.enrollments.filter(e => e.userId === u.id && !e.completedAt).length;
    main = S_('dashboard','grid','Overview') + S_('my-learning','book','My learning', act ? String(act).padStart(2,'0') : '') + S_('courses','compass','Explore courses') + S_('certificates','award','My certificates') + S_('wallet-' + u.handle,'wallet','Achievement wallet') + S_('goals','target','Learning goals') + S_('events','users','Community');
    more = `<h6>LEARN BETTER</h6>` + S_('companion','sparkles','AI study companion') + S_('saved','bookmark','Saved resources') + S_('verify','shieldck','Verify a certificate');
  } else if (u.role === 'instructor') {
    main = S_('instructor','grid','Overview') + S_('instructor-courses','book','My courses') + S_('instructor-new','plus','Create a course') + S_('instructor-students','users','Student progress');
    more = `<h6>PLATFORM</h6>` + S_('courses','compass','Course catalog') + S_('verify','shieldck','Verify a certificate');
  } else {
    main = S_('admin','grid','Overview') + S_('admin-users','users','Users') + S_('admin-courses','book','Courses') + S_('admin-certs','award','Certificates') + S_('admin-chain','cube','Ledger explorer');
    more = `<h6>PLATFORM</h6>` + S_('verify','shieldck','Verify portal') + S_('admin-inbox','mail','Messages') + S_('home','compass','Public site');
  }
  return `<aside class="side" id="side">
    ${brand('home', true)}
    <h6>YOUR WORKSPACE</h6><nav>${main}</nav><nav>${more}</nav>
    ${u.role === 'student' ? `<div class="side-promo">${ic('sparkles').replace('<svg','<svg style="width:22px;height:22px;color:var(--purple)"')}<b>A little help. A big leap.</b><p>Turn a tricky topic into your next breakthrough.</p><a class="link" href="#companion" style="color:var(--purple)">Meet your AI companion ${ic('ne')}</a></div>` : `<div style="margin-top:auto"></div>`}
    <nav style="margin-top:14px">${S_('account','gear','Settings')}<a href="#faq">${ic('help')}Help & support</a></nav>
    <div class="side-user">${avatar(u)}<div style="min-width:0"><b>${esc(u.name)}</b><small>${u.role === 'student' ? 'Personal account' : u.role === 'instructor' ? 'Instructor' : 'Administrator'}</small></div></div>
  </aside>`;
}
function appShell(active, crumbs, body) {
  const u = me(); const unread = S.notifs.filter(n => n.userId === u.id && !n.read).length;
  return `<div class="app">${sideNav(u, active)}
    <div style="min-width:0"><div class="topbar">
      <button class="iconbtn menu-toggle side-toggle" data-act="sideToggle" aria-label="Open menu">${ic('menu')}</button>
      <div class="crumbs">${crumbs.map((c, i) => i < crumbs.length - 1 ? `<span>${esc(c)}</span><span>/</span>` : `<b>${esc(c)}</b>`).join('')}</div>
      <form class="search" data-form="gsearch" role="search">${ic('search')}<label class="sr" for="gsearch">Search courses</label><input id="gsearch" placeholder="Search your learning" value="${esc(UI.q)}"><span class="kbd">⌘ K</span></form>
      <button class="iconbtn" data-act="notifs" data-dd aria-label="Notifications">${ic('bell')}${unread ? '<span class="dot"></span>' : ''}</button>
      <div class="usermenu"><button class="avbtn" data-act="userMenu" data-dd aria-label="Account menu">${avatar(u)}</button></div>
    </div><main class="page" id="main">${body}</main></div></div>`;
}
ACT.sideToggle = () => $('#side')?.classList.toggle('open');
FORMS.gsearch = f => { UI.q = f.querySelector('input').value.trim(); go('courses'); };
ACT.notifs = el => {
  const ex = el.parentElement.querySelector('.dropdown'); if (ex) { ex.remove(); return; }
  const u = me(); const list = S.notifs.filter(n => n.userId === u.id).slice(0, 8);
  el.insertAdjacentHTML('afterend', `<div class="dropdown" data-auto style="width:340px;right:60px;top:60px;position:absolute"><div class="row between" style="padding:8px 10px"><b>Notifications</b><button class="link small" data-act="readAll">Mark all read</button></div><hr>
    ${list.length ? list.map(n => `<a href="#${esc(n.link || 'dashboard')}" style="align-items:flex-start">${n.read ? ic('bell') : ic('sparkles').replace('<svg','<svg style="color:var(--primary-text)"')}<span><span style="display:block;color:var(--ink)">${esc(n.text)}</span><span class="xs muted">${fmtDT(n.at)}</span></span></a>`).join('') : '<p class="muted small" style="padding:10px">You’re all caught up.</p>'}</div>`);
  el.parentElement.style.position = 'relative';
};
ACT.readAll = async () => { if (await mutate('POST', '/me/notifications/read-all')) render(); };

/* ================= Combobox (searchable select) ================= */
function combo({id, label, icon, value, placeholder, options, searchable = false, required = true, hint = ''}) {
  return `<div class="field combo" data-combo="${id}"><label for="${id}-btn">${esc(label)}${required ? ' <span class="req">*</span>' : ''}</label>
    <div class="input" id="${id}-wrap">${ic(icon)}<input id="${id}-btn" readonly data-act="comboOpen" data-id="${id}" value="${esc(value || '')}" placeholder="${esc(placeholder || 'Select')}" style="cursor:pointer" aria-haspopup="listbox"><span class="tail">${ic('chev')}</span></div>
    <input type="hidden" name="${id}" value="${esc(value || '')}">
    <div class="hint" id="${id}-hint">${esc(hint)}</div></div>`;
}
const COMBO = {};
ACT.comboOpen = el => {
  const id = el.dataset.id; const box = el.closest('.combo'); const ex = box.querySelector('.combo-pop'); $$('.combo-pop').forEach(p => p.remove()); if (ex) return;
  const cfg = COMBO[id]; if (!cfg) return; const opts = cfg.options(); const cur = box.querySelector(`input[name="${id}"]`).value;
  const pop = document.createElement('div'); pop.className = 'combo-pop'; pop.setAttribute('role', 'listbox');
  const draw = q => {
    const f = opts.filter(o => !q || (o[0] + ' ' + (o[1] || '')).toLowerCase().includes(q.toLowerCase()));
    pop.querySelector('.olist').innerHTML = (cfg.searchable ? `<div class="xs muted" style="padding:2px 6px 6px">${plural(f.length, cfg.noun || 'result')} found</div>` : '') +
      (f.length ? f.map(o => `<div class="opt ${o[0] === cur ? 'sel' : ''}" role="option" data-v="${esc(o[0])}"><span>${esc(o[0])}${o[1] ? `<small>${esc(o[1])}</small>` : ''}</span>${o[0] === cur ? ic('check') : ''}</div>`).join('') : '<div class="muted small" style="padding:8px">No matches. Try a different spelling.</div>');
  };
  pop.innerHTML = (cfg.searchable ? `<div class="combo-search">${ic('search')}<input placeholder="Search" aria-label="Search ${esc(cfg.noun || '')}"><button type="button" class="link" aria-label="Clear">${ic('x')}</button></div>` : '') + '<div class="olist"></div>';
  box.appendChild(pop); draw('');
  const s = pop.querySelector('.combo-search input'); if (s) { s.focus(); s.oninput = () => draw(s.value); pop.querySelector('.combo-search button').onclick = () => { s.value = ''; draw(''); s.focus(); }; }
  pop.addEventListener('click', ev => { const o = ev.target.closest('.opt'); if (!o) return; setCombo(id, o.dataset.v); pop.remove(); cfg.onChange && cfg.onChange(o.dataset.v); });
};
function setCombo(id, v) { const box = $(`[data-combo="${id}"]`); if (!box) return; box.querySelector(`input[name="${id}"]`).value = v; box.querySelector(`#${id}-btn`).value = v; box.querySelector('.input').classList.remove('err'); const h = box.querySelector('.hint'); if (h.classList.contains('err')) { h.textContent = ''; h.className = 'hint'; } }

/* ================= AI study companion (uses Claude when the viewer allows it) ================= */
let SAMPLE; const getSample = async () => { if (SAMPLE !== undefined) return SAMPLE; try { SAMPLE = window.claude?.use ? await window.claude.use('sample') : null; } catch (e) { SAMPLE = null; } return SAMPLE; };
function catalogBrief() { return S.courses.filter(c => c.published).map(c => `- ${c.title} (${CATS[c.cat]?.[0]}, ${c.level}, ${hoursLabel(courseMinutes(c))}) by ${userById(c.instructor)?.name}: ${c.tagline}`).join('\n'); }
function localAnswer(q) {
  const t = q.toLowerCase(); const c = S.courses.find(c => t.includes(c.title.toLowerCase().split(' ')[0].toLowerCase()) || t.includes(c.cat));
  if (/verif|certif|blockchain|hash|qr/.test(t)) return 'Every certificate gets a SHA-256 fingerprint that’s signed by Learning Hub’s issuer key and recorded in a block on our ledger. To check one, open Verify, paste the certificate ID or upload its QR code, and you’ll see the fingerprint, signature, block and revocation checks.';
  if (/course|learn|recommend|next|start/.test(t)) { const pick = c || S.courses.find(c => c.featured); return `A good next step is “${pick.title}” (${pick.level}, ${hoursLabel(courseMinutes(pick))}). ${pick.tagline} You can enroll from the Courses page.`; }
  if (/quiz|pass|score/.test(t)) return 'Each module ends with a short quiz. You need 70% to pass, and you can retry as many times as you like—your best score counts toward your certificate.';
  if (/wallet|badge|skill/.test(t)) return 'Your Achievement wallet is a public page with your certificates, badges and skills. Share its link with employers—they can verify each certificate in one click.';
  return 'Great question. Break it into one small step you can try today, then check your understanding with a quick example. If you tell me which course you’re on, I can point you to the right lesson.';
}
async function askAssistant(text) {
  UI.chat.push({me:true, text}); UI.chatBusy = true; drawChat();
  let answer = '';
  try { const r = await api('POST', '/assistant', {messages:UI.chat.slice(-8).map(m => ({role:m.me ? 'user' : 'assistant', content:m.text}))}); answer = r?.text || localAnswer(text); }
  catch (e) { answer = localAnswer(text); }
  if (answer) UI.chat.push({me:false, text:answer});
  UI.chatBusy = false; drawChat();
}
function chatBody() {
  return (UI.chat.length ? '' : `<div class="bubble">Hi! I’m your AI Learning Assistant. How can I help you today?</div>
    <div class="chips"><button data-act="chatChip">Find my next course</button><button data-act="chatChip">Explain a concept</button><button data-act="chatChip">How do certificates get verified?</button></div>`) +
    UI.chat.map(m => `<div class="bubble ${m.me ? 'me' : ''}">${esc(m.text)}</div>`).join('') + (UI.chatBusy && UI.chat[UI.chat.length-1]?.me ? '<div class="bubble"><span class="spin"></span></div>' : '');
}
function drawChat() { $$('.chat-log').forEach(l => { l.innerHTML = chatBody(); l.scrollTop = l.scrollHeight; }); }
ACT.chatChip = el => askAssistant(el.textContent.trim());
FORMS.chat = f => { const i = f.querySelector('input'); const v = i.value.trim(); if (!v || UI.chatBusy) return; i.value = ''; askAssistant(v); };
ACT.chatToggle = () => { UI.chatOpen = !UI.chatOpen; drawFab(); };
function drawFab() {
  $('.chat-panel')?.remove(); let fab = $('.chat-fab');
  if (UI.noFab) { fab?.remove(); return; }
  if (!fab) { fab = document.createElement('button'); fab.className = 'chat-fab no-print'; fab.dataset.act = 'chatToggle'; fab.setAttribute('aria-label', 'AI Learning Assistant'); document.body.appendChild(fab); }
  fab.innerHTML = ic(UI.chatOpen ? 'x' : 'chat');
  if (UI.chatOpen) {
    document.body.insertAdjacentHTML('beforeend', `<section class="chat-panel no-print" aria-label="AI Learning Assistant">
      <div class="row" style="padding:14px 16px;border-bottom:1px solid var(--line)"><span class="ic ic-blue">${ic('bot')}</span><div><b>AI Learning Assistant</b><div class="xs" style="color:var(--green)">● Online · Here to help you grow</div></div></div>
      <div class="chat-log"></div>
      <form class="chat-in" data-form="chat"><label class="sr" for="chatq">Message</label><input id="chatq" placeholder="Ask me anything about learning…" autocomplete="off"><button class="btn btn-primary btn-sm" aria-label="Send" style="width:42px;height:42px;padding:0">${ic('send')}</button></form></section>`);
    drawChat(); $('#chatq')?.focus();
  }
}

/* ================= Router ================= */
const ROUTES = [];
const route = (re, fn) => ROUTES.push([re, fn]);
function need(roles) {
  const u = me();
  if (!u) { UI.pending = location.hash.slice(1); return publicPage('', `<section class="section"><div class="wrap" style="max-width:520px">${emptyState('lock', 'Log in to continue', 'This page is part of your personal workspace.', '<a class="btn btn-primary" href="#login">Log in</a> <a class="btn btn-outline" href="#register">Create an account</a>')}</div></section>`); }
  if (roles && !roles.includes(u.role)) return appShell('', ['Workspace', 'Not available'], emptyState('ban', 'This area isn’t available for your role', `You’re signed in as ${u.role === 'admin' ? 'an administrator' : 'a ' + u.role}.`, `<a class="btn btn-primary" href="#dashboard">Go to your dashboard</a>`));
  return null;
}
function render() {
  if (!S) return;
  if (UI.stopPlayer) { UI.stopPlayer(); UI.stopPlayer = null; }
  const h = decodeURIComponent(location.hash.slice(1)) || 'home';
  UI.after = []; UI.noFab = false; closeModal();
  let html = null;
  for (const [re, fn] of ROUTES) { const m = h.match(re); if (m) { html = fn(...m.slice(1)); break; } }
  if (html === null) html = publicPage('', `<section class="section"><div class="wrap">${emptyState('compass', 'We couldn’t find that page', 'The link may be out of date.', '<a class="btn btn-primary" href="#home">Back to home</a>')}</div></section>`);
  const root = $('#root'); root.innerHTML = html;
  document.body.classList.toggle('has-sticky', !!$('.site-header,.topbar,.lp-hdr'));
  if (UI.lastRoute !== h) window.scrollTo(0, 0);
  UI.lastRoute = h;
  UI.after.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  drawFab();
  const t = $('h1')?.textContent; document.title = (t ? t.replace(/\s+/g, ' ').trim() + ' · ' : '') + 'Learning Hub';
}
window.addEventListener('hashchange', render);

/* ================= Stripe Checkout return pages ================= */
route(/^payment-(cs_\w+)$/, sid => {
  const g = need(['student']); if (g) return g;
  onMount(async () => {
    const r = await mutate('POST', '/payments/confirm', {sessionId:sid});
    if (!r) { go('my-learning'); return; }
    if (r.status === 'paid') { const c = courseById(r.courseId); toast(`Payment received. You’re enrolled in ${c?.title || 'your course'}!`); history.replaceState(null, '', '#course-' + r.courseId); render(); }
    else { const box = $('#paybox'); if (box) box.innerHTML = emptyState('clock', 'Payment is still processing', 'Stripe hasn’t confirmed this payment yet. Refresh in a minute; you’ll be enrolled automatically once it clears.', `<a class="btn btn-primary" href="#payment-${esc(sid)}">Check again</a>`); }
  });
  return appShell('my-learning', ['My workspace', 'Payment'], `<section class="card card-pad" id="paybox" style="min-height:320px;display:grid;place-items:center"><div class="row"><span class="spin"></span><span class="muted">Confirming your payment with Stripe…</span></div></section>`);
});
route(/^payment-cancel-(\w+)$/, cid => { setTimeout(() => { history.replaceState(null, '', '#course-' + cid); render(); toast('Checkout canceled. You haven’t been charged.', 'info'); }); return ''; });

/* ---- public.js ---- */
/* ================= Home ================= */
route(/^home$/, () => {
  onMount(drawChat);
  const feats = [['courses','book','ic-blue','Courses','Build in-demand skills with expert-led, hands-on courses.'],['dashboard','grid','ic-purple','Dashboard','See your progress and celebrate every learning milestone.'],['companion','bot','ic-green','AI Chatbot','Get a little guidance, whenever inspiration strikes.'],['careers','brief','ic-amber','Careers','Turn your new skills into your next big opportunity.'],
    ['events','cal','ic-pink','Events','Learn live, meet your people, and make something great.'],['faq','help','ic-teal','FAQ','Find clear answers and keep your learning moving.'],['verify','shieldck','ic-amber','Verify a certificate','Check any Learning Hub credential in seconds, on-chain.'],['contact','chat','ic-purple','Contact Us','A real team, ready to help you take the next step.']];
  const top = S.courses.filter(c => c.published).sort((a, b) => (b.featured - a.featured) || b.students - a.students).slice(0, 4);
  const students = S.users.filter(u => u.role === 'student').length;
  return publicPage('home', `
  <section class="hero"><div class="wrap hero-grid">
    <div>
      <span class="badge-chip">${ic('sparkles').replace('<svg','<svg style="width:15px;height:15px"')}BIG AMBITIONS. YOUR NEXT STEP.</span>
      <h1>Learn New Skills.<span class="l2">Build Your Future.</span></h1>
      <p class="lead">Access high-quality courses, AI-powered learning, career opportunities, and live events in one platform—with certificates anyone can verify on-chain.</p>
      <div class="row wrapf" style="margin:30px 0 28px"><a class="btn btn-primary btn-lg" href="#${me() ? 'dashboard' : 'register'}">Start E-Learning ${ic('arrow')}</a><a class="btn btn-outline btn-lg" href="#courses">Explore Courses</a></div>
      <div class="row"><div class="avatars"><span class="avatar av-1">AL</span><span class="avatar av-2">JM</span><span class="avatar av-3">SK</span></div>
        <div class="small"><span class="star">★★★★★</span> <b>4.9/5 from our community</b><div class="muted">Join 10,000+ curious minds learning every day</div></div></div>
    </div>
    <div class="hero-art"><img src="${IMG.hero}" alt="Two learners studying with a friendly AI robot">
      <div class="float" style="top:20px;right:24px;color:var(--purple);font-weight:600">${ic('sparkles').replace('<svg','<svg style="width:16px;height:16px"')}AI-powered learning</div>
      <div class="float" style="left:-6px;bottom:44px"><span class="ic ic-green" style="width:34px;height:34px">${ic('shieldck')}</span><div><b>A little progress. A big future.</b><small>Learn at your pace. Earn verifiable skills.</small></div></div>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="eyebrow">ONE PLATFORM. ENDLESS POSSIBILITIES.</div>
    <div class="sec-head" style="margin-bottom:24px"><div><h2>Everything you need to move forward.</h2><p class="muted" style="font-size:16px">From your first lesson to your next career move. Make it happen here.</p></div></div>
    <div class="grid g4">${feats.map(([h, i, t, n, d]) => `<a class="card feat" href="#${h}"><div class="row"><span class="ic ${t}">${ic(i)}</span><h3>${n}</h3>${ic('ne').replace('<svg','<svg style="width:16px;height:16px;color:var(--muted)"')}</div><p>${d}</p></a>`).join('')}</div>
  </div></section>

  <section class="section alt"><div class="wrap">
    <div class="eyebrow">LEARN SOMETHING THAT MATTERS</div>
    <div class="sec-head"><div><h2>Small steps. Powerful skills.</h2><p class="muted" style="font-size:16px">Explore community favorites, taught by people who do it every day.</p></div><a class="btn btn-outline" href="#courses">View all courses ${ic('arrow')}</a></div>
    <div class="grid g4">${top.map(courseCard).join('')}</div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="ai-band">
      <div><div class="eyebrow purple">${ic('sparkles').replace('<svg','<svg style="width:14px;height:14px;vertical-align:-2px"')} A LITTLE HELP. A LOT OF POSSIBILITY.</div>
        <h2 style="font-size:clamp(28px,3.4vw,38px);font-weight:800;margin:14px 0">Big questions?<br>Meet your learning sidekick.</h2>
        <p class="muted" style="font-size:16px;max-width:520px">Get unstuck, explore new ideas, and find your next course. Your AI Learning Assistant is here for you, 24/7.</p>
        <div class="row" style="margin-top:24px"><button class="btn btn-primary btn-lg" data-act="chatToggle">Chat Now ${ic('chat')}</button><span class="small muted">Always ready. Always encouraging.</span></div></div>
      <div class="chatcard"><div class="row between" style="margin-bottom:12px"><div class="row"><span class="ic ic-blue">${ic('bot')}</span><div><b>AI Learning Assistant</b><div class="xs" style="color:var(--green)">● Online · Here to help you grow</div></div></div></div>
        <div class="chat-log" style="padding:0;max-height:260px;min-height:120px"></div>
        <form class="chat-in" data-form="chat" style="padding:12px 0 0;border:0"><label class="sr" for="homeq">Message</label><input id="homeq" placeholder="Ask me anything about learning…" autocomplete="off"><button class="btn btn-primary btn-sm" aria-label="Send" style="width:42px;height:42px;padding:0">${ic('send')}</button></form></div>
    </div>
    <div class="stats-band"><div><b>${(10000 + students).toLocaleString()}+</b><span>Students</span></div><div><b>500+</b><span>Courses</span></div><div><b>${(S.certs.filter(c => c.status === 'valid').length + 4800).toLocaleString()}</b><span>Certificates on-chain</span></div><div><b>95%</b><span>Completion Rate</span></div></div>
  </div></section>

  <section class="section" style="padding-top:20px"><div class="wrap">
    <div class="eyebrow">PUT SOMETHING GOOD ON YOUR CALENDAR</div>
    <div class="sec-head"><div><h2>Learn together. Go further.</h2><p class="muted" style="font-size:16px">Fresh ideas, real connections, and a community that cheers you on.</p></div><a class="link" href="#events">View all events ${ic('arrow')}</a></div>
    <div class="grid g3">${S.events.slice(0, 3).map(eventCard).join('')}</div>
  </div></section>

  <section class="section alt"><div class="wrap" style="display:grid;grid-template-columns:minmax(0,.8fr) minmax(0,1.3fr);gap:48px;align-items:center" id="careerband">
    <div><div class="eyebrow">LEARN IT. LIVE IT.</div><h2 style="font-size:clamp(30px,3.6vw,42px);font-weight:800;margin:14px 0">Your skills.<br>Your next opportunity.</h2><p class="muted" style="font-size:16px">Take your learning into the real world. Discover internships, remote jobs, and certifications that open doors.</p><a class="btn btn-primary btn-lg" style="margin-top:24px" href="#careers">View Careers ${ic('arrow')}</a></div>
    <div class="stack">${S.careers.slice(0, 3).map(jobRow).join('')}</div>
  </div></section>`);
});
function eventCard(ev) {
  const d = new Date(ev.date + 'T12:00:00'); const u = me(); const reg = u && S.eventRegs.some(r => r.userId === u.id && r.eventId === ev.id);
  const tone = {purple:['var(--purple-soft)','var(--purple)','p-purple'], blue:['var(--primary-soft)','var(--primary-text)','p-blue'], green:['var(--green-soft)','var(--green)','p-green']}[ev.tone];
  const taken = S.eventRegs.filter(r => r.eventId === ev.id).length;
  return `<article class="card event-card"><div class="row between" style="align-items:flex-start"><div class="date-tile" style="background:${tone[0]};color:${tone[1]}"><small>${d.toLocaleString('en-US',{month:'short'}).toUpperCase()}</small><b>${d.getDate()}</b></div><span class="pill ${tone[2]}">${esc(ev.type)}</span></div>
    <h3>${esc(ev.title)}</h3><div class="small muted">${esc(ev.host)}</div><div class="small muted row" style="gap:6px">${ic('video').replace('<svg','<svg style="width:15px;height:15px"')}${esc(ev.when)}</div>
    <div class="foot"><span class="xs muted">${esc(ev.note)}${ev.spots ? ` · ${Math.max(0, ev.spots - taken)} spots left` : ''}</span>
    ${reg ? `<button class="btn btn-sm btn-soft" data-act="eventReg" data-id="${ev.id}">${ic('check')} Registered</button>` : `<button class="btn btn-sm btn-outline" data-act="eventReg" data-id="${ev.id}">Register ${ic('arrow')}</button>`}</div></article>`;
}
ACT.eventReg = async el => {
  const u = me(); if (!u) { UI.pending = 'events'; toast('Log in to register for events.', 'info'); go('login'); return; }
  const r = await mutate('POST', `/events/${el.dataset.id}/register`); if (!r) return;
  toast(r.registered ? 'You’re registered. We’ll send a reminder before it starts.' : 'Registration canceled.', r.registered ? 'ok' : 'info'); render();
};
function jobRow(j) {
  const tone = {purple:'ic-purple', blue:'ic-blue', green:'ic-green', teal:'ic-teal'}[j.tone];
  return `<button class="card job" style="width:100%;text-align:left;cursor:pointer;border:1px solid var(--line)" data-act="job" data-id="${j.id}"><span class="ic ${tone}" style="width:46px;height:46px">${ic(j.icon)}</span><div style="flex:1;min-width:0"><h3>${esc(j.title)}</h3><div class="small muted">${esc(j.org)} · ${esc(j.meta)}</div></div><span class="pill ${j.ptone}">${esc(j.type)}</span>${ic('ne').replace('<svg','<svg style="width:18px;height:18px;color:var(--muted)"')}</button>`;
}
ACT.job = el => {
  const j = S.careers.find(x => x.id === el.dataset.id); const u = me();
  const have = u ? skillsOf(u).map(s => s[0]) : []; const applied = u && S.applications.some(a => a.userId === u.id && a.jobId === j.id);
  openModal({title:j.title, body:`<p class="muted">${esc(j.org)} · ${esc(j.meta)}</p>
    <h4 style="margin:18px 0 8px">Skills they’re looking for</h4><div>${j.skills.map(s => `<span class="skill">${have.includes(s) ? ic('checkc').replace('<svg','<svg style="width:14px;height:14px;color:var(--green)"') : ''}${esc(s)}</span>`).join('')}</div>
    <div class="note blue" style="margin-top:16px">${ic('shieldck')}Applications include a link to your Achievement wallet, so recruiters can verify your certificates instantly.</div>`,
    foot:applied ? `<span class="pill p-green">${ic('check')} Applied</span>` : `<button class="btn btn-plain" data-act="closeModal">Close</button><button class="btn btn-primary" id="applyJob">Apply with my wallet</button>`});
  const b = $('#applyJob'); if (b) b.onclick = async () => { if (!u) { closeModal(); UI.pending = 'careers'; go('login'); return; } if (!(await mutate('POST', `/careers/${j.id}/apply`))) return; closeModal(); toast('Application sent with your wallet link.'); };
};

/* ================= Catalog ================= */
route(/^courses$/, () => {
  const q = UI.q.toLowerCase();
  const list = S.courses.filter(c => c.published && (UI.cat === 'all' || c.cat === UI.cat) && (UI.level === 'all' || c.level === UI.level) &&
    (!q || [c.title, c.tagline, userById(c.instructor)?.name, ...c.skills].join(' ').toLowerCase().includes(q)));
  const body = `<div class="filters" role="group" aria-label="Category">${[['all','All'], ...Object.entries(CATS).map(([k, v]) => [k, v[0]])].map(([k, t]) => `<button class="${UI.cat === k ? 'on' : ''}" data-act="cat" data-v="${k}">${t}</button>`).join('')}
      <span style="flex:1"></span><select class="ti" style="width:auto" aria-label="Level" data-ui="level">${['all','Beginner','Intermediate','Advanced'].map(l => `<option value="${l}" ${UI.level === l ? 'selected' : ''}>${l === 'all' ? 'All levels' : l}</option>`).join('')}</select></div>
    <form data-form="csearch" class="input" style="margin-bottom:22px;max-width:520px">${ic('search')}<label class="sr" for="csq">Search courses</label><input id="csq" placeholder="Search courses, skills or instructors" value="${esc(UI.q)}">${UI.q ? `<span class="tail"><button type="button" data-act="clearQ" aria-label="Clear search">${ic('x')}</button></span>` : ''}</form>
    <p class="small muted" style="margin-bottom:14px">${plural(list.length, 'course')}${UI.q ? ` matching “${esc(UI.q)}”` : ''}</p>
    ${list.length ? `<div class="grid g4" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">${list.map(courseCard).join('')}</div>` : emptyState('search', 'No courses match those filters', 'Try a broader search or another category.', '<button class="btn btn-outline" data-act="clearQ">Clear filters</button>')}`;
  const u = me();
  if (u) return appShell('courses', ['My workspace', 'Explore courses'], `<div class="page-h"><div><h1>Explore courses</h1><p>Every course ends with a certificate recorded on the Learning Hub ledger.</p></div></div>` + body);
  return publicPage('courses', `<section class="hero" style="padding:44px 0"><div class="wrap"><div class="eyebrow">COURSE CATALOG</div><h1 style="font-size:clamp(32px,4vw,46px);font-weight:800;margin:10px 0">Find your next skill.</h1><p class="muted" style="font-size:17px">Expert-led courses with verifiable blockchain certificates.</p></div></section><section class="section" style="padding-top:32px"><div class="wrap">${body}</div></section>`);
});
ACT.cat = el => { UI.cat = el.dataset.v; render(); };
ACT.clearQ = () => { UI.q = ''; UI.cat = 'all'; UI.level = 'all'; render(); };
ACT.noop = () => {};
FORMS.csearch = f => { UI.q = f.querySelector('input').value.trim(); render(); };

/* ================= Course details ================= */
route(/^course-(\w+)$/, id => {
  const c = courseById(id); if (!c || (!c.published && me()?.id !== c.instructor && me()?.role !== 'admin')) return null;
  const ins = userById(c.instructor); const u = me(); const e = u && enrollmentOf(u.id, c.id); const mins = courseMinutes(c); const nLessons = lessonsOf(c).length;
  const open = UI.openMods[c.id] || (UI.openMods[c.id] = {m1:true});
  const typeIc = {v:'playc', r:'file', p:'pencil', q:'list'};
  const cta = !e ? [c.price > 0 ? `Buy course · ${priceOf(c)}` : 'Start Learning', 'startCourse'] : e.completedAt ? ['View certificate', 'viewCert'] : [progressOf(e) ? 'Continue learning' : 'Start Learning', 'resume'];
  const instCourses = S.courses.filter(x => x.instructor === c.instructor);
  return publicPage('courses', `
  <section class="cd-hero"><div class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="#home">Home</a>${ic('chevR')}<a href="#courses">Courses</a>${ic('chevR')}<b>${esc(CATS[c.cat]?.[0])}</b></nav>
    <div class="cd-grid">
      <div><div class="row">${catPill(c.cat)}${c.featured ? `<span class="pill p-blue">${ic('sparkles')}Community favorite</span>` : ''}${!c.published ? '<span class="pill p-amber">Draft</span>' : ''}</div>
        <h1>${esc(c.title)}</h1><p class="muted" style="font-size:17px;max-width:540px">${esc(c.tagline)}</p>
        <div class="row" style="margin:18px 0 12px">${avatar(ins, 'sm')}<span class="small muted">Created by <b style="color:var(--ink)">${esc(ins?.name)}</b></span></div>
        <div class="row small"><span class="star">★★★★★</span><b style="font-size:16px">${c.rating}</b><span class="muted">(${c.reviews} reviews)</span></div>
        ${e ? `<div style="margin-top:18px;max-width:420px"><div class="row between small"><span class="muted">Your progress</span><b style="color:var(--primary-text)">${progressOf(e)}%</b></div><div class="bar" style="margin-top:6px"><span style="width:${progressOf(e)}%"></span></div></div>` : ''}
      </div>
      <div class="cd-art"><img src="${IMG[c.hero] || imgOf(c)}" alt=""><button class="pv" data-act="preview" data-id="${c.id}">${ic('playc')}Preview course · 1:42</button></div>
    </div>
    <div class="card facts">
      <div class="fact"><span class="ic ic-blue">${ic('clock')}</span><div><b>${hoursLabel(mins)}</b><small>On-demand learning</small></div></div>
      <div class="fact"><span class="ic ic-blue">${ic('barchart')}</span><div><b>${esc(c.level)}</b><small>${c.level === 'Beginner' ? 'No experience needed' : 'Some experience helps'}</small></div></div>
      <div class="fact"><span class="ic ic-blue">${ic('users')}</span><div><b>${c.students.toLocaleString()} students</b><small>Learning alongside you</small></div></div>
      <div class="fact"><span class="ic ic-blue">${ic('award')}</span><div><b>On-chain certificate</b><small>Verifiable anywhere, instantly</small></div></div>
    </div>
  </div></section>
  <div class="wrap cd-body">
    <div class="stack" style="--g:24px">
      <section class="card card-pad"><h2 style="font-size:24px;font-weight:800;margin-bottom:14px">A strong foundation. A more confident you.</h2>${c.about.map(p => `<p class="muted" style="margin-bottom:12px">${esc(p)}</p>`).join('')}</section>
      ${c.outcomes.length ? `<section class="card card-pad"><h2 style="font-size:24px;font-weight:800">What you’ll learn</h2><p class="muted small">Practical skills you can put to work from day one.</p><div class="outcomes">${c.outcomes.map(([t, d]) => `<div>${ic('checkc')}<span><b>${esc(t)}</b><small>${esc(d)}</small></span></div>`).join('')}</div></section>` : ''}
      <section class="card card-pad"><div class="row between"><div><h2 style="font-size:24px;font-weight:800">Your learning journey</h2><p class="muted small">${plural(c.modules.length, 'module')} · ${plural(nLessons, 'lesson')} · ${hoursLabel(mins)} total</p></div><button class="link small" data-act="expandAll" data-id="${c.id}">${c.modules.every(m => open[m.id]) ? 'Collapse all modules' : 'Expand all modules'}</button></div>
        ${c.modules.map((m, i) => `<div class="mod ${open[m.id] ? 'open' : ''}"><button class="mod-h" data-act="toggleMod" data-c="${c.id}" data-m="${m.id}" aria-expanded="${!!open[m.id]}"><span class="n">${String(i+1).padStart(2,'0')}</span><span><b>${esc(m.title)}</b><small>${plural(m.lessons.length, 'lesson')} · ${fmtMin(m.lessons.reduce((a, l) => a + l.min, 0))}</small></span>${ic('chev', 'chev')}</button>
          ${open[m.id] ? `<div class="mod-l">${m.lessons.map((l, li) => `<div class="les ${e?.done[l.id] ? 'done' : ''}">${e?.done[l.id] ? ic('checkc', 'st') : ic(typeIc[l.type])}<span class="t">${e ? `<a href="#learn-${c.id}-${l.id}" style="color:inherit">${esc(l.title)}</a>` : esc(l.title)}</span>${i === 0 && li === 0 && !e ? `<button class="link xs" data-act="preview" data-id="${c.id}">Preview</button>` : ''}<span class="d">${fmtClock(l.min * 60)}</span></div>`).join('')}</div>` : ''}</div>`).join('')}
        <p class="small muted row" style="margin-top:16px;gap:8px">${ic('cup').replace('<svg','<svg style="width:16px;height:16px"')}Small lessons. Real progress. Learn at a pace that works for you.</p></section>
    </div>
    <aside class="stack">
      <section class="card card-pad"><h3>Meet your instructor</h3><div class="row" style="margin:16px 0">${avatar(ins, 'lg')}<div><b style="font-size:17px">${esc(ins?.name)}</b><div class="small muted">${esc(ins?.title || 'Instructor')}</div></div></div>
        <p class="small muted">${esc(ins?.bio || '')}</p><div class="row" style="gap:28px;margin:14px 0"><div><b style="font-size:18px">${ins?.irating || 4.8} / 5</b><div class="xs muted">Instructor rating</div></div><div><b style="font-size:18px">${(ins?.taught || 1000).toLocaleString()}+</b><div class="xs muted">Students taught</div></div></div>
        <button class="link small" data-act="instructorProfile" data-id="${ins?.id}">View instructor profile ${ic('ne')}</button></section>
      <section class="card card-pad"><h3>Everything you need to grow</h3><ul class="incl">${[[`${nLessons} bite-sized lessons`, 'video'], ...c.includes.slice(1).map(t => [t, /cert/i.test(t) ? 'award' : /lifetime/i.test(t) ? 'infinity' : /exerc|lab|practice/i.test(t) ? 'tools' : 'layout'])].map(([t, i]) => `<li>${ic(i)}${esc(t)}</li>`).join('')}</ul>
        <div style="border-top:1px solid var(--line);padding-top:14px"><b class="small">Before you begin</b><p class="small muted" style="margin-top:4px">${esc(c.before)}</p></div></section>
      ${c.project ? `<section class="card card-pad" style="background:var(--purple-soft);border-color:transparent"><div class="eyebrow purple">${ic('layers').replace('<svg','<svg style="width:15px;height:15px;vertical-align:-3px"')} LEARN IT. MAKE IT.</div><h3 style="font-size:22px;font-weight:800;margin:12px 0">${esc(c.project.title)}</h3><p class="small muted">${esc(c.project.text)}</p><div class="row wrapf" style="margin-top:14px;gap:8px">${c.project.tags.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div></section>` : ''}
      <button class="card card-pad" style="text-align:left;cursor:pointer;width:100%" data-act="chatToggle"><div class="row"><span class="ic ic-green">${ic('bot')}</span><h3 style="flex:1">A little help along the way</h3>${ic('ne').replace('<svg','<svg style="width:16px;height:16px;color:var(--muted)"')}</div><p class="small muted" style="margin-top:12px">Get unstuck and explore new ideas with your AI Learning Assistant, available 24/7.</p></button>
    </aside>
  </div>
  <div class="sticky-cta"><div class="wrap"><span class="ic ic-blue" style="width:48px;height:48px">${ic('book')}</span><div style="flex:1;min-width:0"><b style="font-size:16px">${esc(c.title)}</b><div class="small muted">${c.price > 0 ? `<b style="color:var(--ink)">${priceOf(c)}</b> · ` : ''}${esc(c.level)}-friendly · ${hoursLabel(mins)} · Learn at your own pace</div></div>
    <span class="small muted row ctahint" style="gap:8px">${ic('checkc').replace('<svg','<svg style="width:16px;height:16px;color:var(--green)"')}Your next chapter starts here.</span>
    <button class="btn btn-primary btn-lg" style="min-width:220px" data-act="${cta[1]}" data-id="${c.id}" ${e?.certId ? `data-cert="${e.certId}"` : ''}>${cta[0]} ${ic('arrow')}</button></div></div>`);
});
ACT.startCourse = el => enroll(el.dataset.id, true);
ACT.toggleMod = el => { const o = UI.openMods[el.dataset.c] = UI.openMods[el.dataset.c] || {}; o[el.dataset.m] = !o[el.dataset.m]; render(); };
ACT.expandAll = el => { const c = courseById(el.dataset.id); const o = UI.openMods[c.id] = UI.openMods[c.id] || {}; const all = c.modules.every(m => o[m.id]); c.modules.forEach(m => o[m.id] = !all); render(); };
ACT.instructorProfile = el => {
  const ins = userById(el.dataset.id); const cs = S.courses.filter(c => c.instructor === ins.id && c.published);
  openModal({title:ins.name, body:`<div class="row" style="margin-bottom:14px">${avatar(ins, 'lg')}<div><b>${esc(ins.title || 'Instructor')}</b><div class="small muted">${ins.years || 5}+ years of experience</div></div></div><p class="muted">${esc(ins.bio || '')}</p><h4 style="margin:18px 0 8px">Courses</h4>${cs.map(c => `<a href="#course-${c.id}" class="row" style="padding:8px 0;color:inherit">${catPill(c.cat)}<span>${esc(c.title)}</span></a>`).join('')}`});
};
ACT.preview = el => {
  const c = courseById(el.dataset.id); const l = lessonsOf(c)[0];
  openModal({title:'Course preview', wide:true, body:`<div class="video" style="aspect-ratio:16/8"><img class="bgimg" src="${IMG[c.hero] || imgOf(c)}" alt=""><div class="shade"></div><div class="copy"><div class="k">${esc(c.title.toUpperCase())}</div><div class="mk">PREVIEW</div><h2>${esc(l.title)}</h2><p>${esc(l.summary || c.tagline)}</p><p style="margin-top:18px">with ${esc(userById(c.instructor)?.name)}</p></div></div>
    <ul class="incl" style="margin-top:18px">${(l.points || []).map(p => `<li>${ic('checkc')}${esc(p)}</li>`).join('')}</ul>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Close</button><button class="btn btn-primary" data-act="startCourse" data-id="${c.id}">Start Learning ${ic('arrow')}</button>`});
};

/* ================= Events, careers, FAQ, about, contact ================= */
route(/^events$/, () => {
  const body = `<div class="grid g3">${S.events.map(eventCard).join('')}</div>`;
  if (me()?.role === 'student') return appShell('events', ['My workspace', 'Community & events'], `<div class="page-h"><div><h1>Learn together. Go further.</h1><p>Workshops, webinars and hackathons from the Learning Hub community.</p></div></div>` + body);
  return publicPage('events', `<section class="hero" style="padding:44px 0"><div class="wrap"><div class="eyebrow">PUT SOMETHING GOOD ON YOUR CALENDAR</div><h1 style="font-size:clamp(32px,4vw,46px);font-weight:800;margin:10px 0">Learn together. Go further.</h1><p class="muted" style="font-size:17px">Fresh ideas, real connections, and a community that cheers you on.</p></div></section><section class="section" style="padding-top:32px"><div class="wrap">${body}</div></section>`);
});
route(/^careers$/, () => publicPage('careers', `<section class="hero" style="padding:44px 0"><div class="wrap"><div class="eyebrow">LEARN IT. LIVE IT.</div><h1 style="font-size:clamp(32px,4vw,46px);font-weight:800;margin:10px 0">Your skills. Your next opportunity.</h1><p class="muted" style="font-size:17px;max-width:620px">Internships, remote jobs and certifications. Skills you’ve earned on Learning Hub are highlighted automatically.</p></div></section>
  <section class="section" style="padding-top:32px"><div class="wrap" style="max-width:900px"><div class="stack">${S.careers.map(jobRow).join('')}</div></div></section>`));
route(/^faq$/, () => publicPage('faq', `<section class="hero" style="padding:44px 0"><div class="wrap"><div class="eyebrow">FAQ</div><h1 style="font-size:clamp(32px,4vw,46px);font-weight:800;margin:10px 0">Clear answers. Keep learning.</h1></div></section>
  <section class="section" style="padding-top:20px"><div class="wrap" style="max-width:820px">${FAQS.map(([q, a], i) => `<div class="acc-item"><button data-act="faq" data-i="${i}" aria-expanded="${UI.faq === i}">${esc(q)}${ic(UI.faq === i ? 'up' : 'down').replace('<svg','<svg style="width:18px;height:18px;flex:none"')}</button>${UI.faq === i ? `<div>${esc(a)}</div>` : ''}</div>`).join('')}
  <div class="note blue" style="margin-top:28px">${ic('help')}Still curious? <a href="#contact" style="font-weight:600">Contact our team</a> or ask the AI Learning Assistant.</div></div></section>`));
ACT.faq = el => { UI.faq = UI.faq === +el.dataset.i ? null : +el.dataset.i; render(); };
route(/^about$/, () => publicPage('about', `<section class="hero" style="padding:56px 0"><div class="wrap hero-grid"><div><div class="eyebrow">ABOUT US</div><h1 style="font-size:clamp(32px,4.6vw,52px)">Quality learning, open to everyone.</h1><p class="lead">Learning Hub combines expert-led courses with Web3 credentials, so every skill you earn can be verified anywhere in the world—without a phone call to the institution.</p></div><div class="hero-art"><img src="${IMG.register}" alt=""></div></div></section>
  <section class="section"><div class="wrap grid g3">${[['shieldck','ic-green','Tamper-proof credentials','Every certificate’s fingerprint is signed and anchored on our ledger. Change one letter and verification fails.'],['wallet','ic-blue','Learner-owned profiles','Your Achievement wallet shows certificates, badges and skills—shareable with a single link.'],['building','ic-purple','Built for institutions','Universities, training centers and professional bodies can issue credentials anyone can check.']].map(([i, t, h, d]) => `<div class="card card-pad"><span class="ic ${t}">${ic(i)}</span><h3 style="margin:14px 0 8px">${h}</h3><p class="muted">${d}</p></div>`).join('')}</div></section>`));
route(/^contact$/, () => publicPage('contact', `<section class="section"><div class="wrap" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:48px">
  <div><div class="eyebrow">CONTACT US</div><h1 style="font-size:clamp(32px,4vw,46px);font-weight:800;margin:10px 0">A real team, ready to help.</h1><p class="muted" style="font-size:17px">Questions about courses, certificates or partnerships? Send a message and we’ll reply within one business day.</p>
    <div class="stack" style="margin-top:28px"><div class="row">${'<span class="ic ic-blue">' + ic('mail') + '</span>'}<span>hello@learninghub.io</span></div><div class="row"><span class="ic ic-blue">${ic('pin')}</span><span>Bole, Addis Ababa, Ethiopia</span></div></div></div>
  <form class="form-card stack" data-form="contact"><div class="field"><label for="cn">Full name</label><input class="ti" id="cn" name="name" required value="${esc(me()?.name || '')}"></div><div class="field"><label for="ce">Email</label><input class="ti" id="ce" type="email" name="email" required value="${esc(me()?.email || '')}"></div>
    <div class="field"><label for="ct">Topic</label><select class="ti" id="ct" name="topic"><option>Courses</option><option>Certificates & verification</option><option>Institution partnership</option><option>Technical support</option></select></div><div class="field"><label for="cm">Message</label><textarea class="ta" id="cm" name="msg" required></textarea></div><button class="btn btn-primary btn-lg btn-block">Send message</button></form></div></section>`));
FORMS.contact = async f => { const d = Object.fromEntries(new FormData(f)); if (!(await mutate('POST', '/contact', d, {resync:false}))) return; f.reset(); toast('Message sent. We’ll reply within one business day.'); };

/* ================= Auth ================= */
const authHeader = () => `<header class="wrap auth-hdr">${brand('home', true)}<span class="small muted">Need a hand? <a href="#contact" style="font-weight:600">Contact support ${ic('ne').replace('<svg','<svg style="width:13px;height:13px;vertical-align:-2px"')}</a></span></header>`;
const authLeft = (title1, title2, sub) => `<div class="auth-left"><span class="badge-chip" style="color:var(--purple);background:var(--purple-soft);border:0">${ic('sparkles').replace('<svg','<svg style="width:14px;height:14px"')}A WORLD OF POSSIBILITIES</span>
  <h1>${title1}<span>${title2}</span></h1><p class="muted" style="font-size:17px">${sub}</p>
  <div class="auth-art auth-left-art"><img src="${IMG.register}" alt="Two learners studying together with an AI helper"></div>
  <div class="grid g3 auth-left-art" style="gap:14px">${[['book','Learn your way','Courses that fit you'],['sparkles','Go further with AI','Your study companion'],['brief','Build your future','Real opportunities']].map(([i, t, d]) => `<div>${ic(i).replace('<svg','<svg style="width:22px;height:22px;color:var(--primary-text)"')}<b style="display:block;font-size:14px;margin-top:8px">${t}</b><small class="muted">${d}</small></div>`).join('')}</div>
  <div class="row auth-left-art" style="border-top:1px solid var(--line);margin-top:24px;padding-top:20px"><div class="avatars"><span class="avatar av-1">AM</span><span class="avatar av-2">JL</span><span class="avatar av-3">SK</span></div><div><b class="small">Your next chapter starts with us.</b><div class="xs muted">A community of learners, educators & innovators.</div></div></div></div>`;
const authFoot = `<div class="wrap row between xs muted" style="padding:20px 24px 28px;flex-wrap:wrap"><span>© 2026 Learning Hub. All rights reserved.</span><span>Built for curious minds. Designed for your future.</span></div>`;

route(/^login$/, () => { UI.noFab = true; if (me()) { setTimeout(() => go('dashboard')); return ''; } return authHeader() + `<main class="wrap auth-grid" id="main">${authLeft('Welcome back to', 'Learning Hub.', 'Pick up right where you left off.')}
  <form class="form-card" data-form="login" novalidate><h2>Log in</h2><p class="muted" style="margin:6px 0 20px">Good to see you again.</p>
    <div class="stack"><div class="field"><label for="le">Email Address <span class="req">*</span></label><div class="input">${ic('mail')}<input id="le" name="email" type="email" autocomplete="email" placeholder="you@university.edu" required></div></div>
    <div class="field"><label for="lp">Password <span class="req">*</span></label><div class="input">${ic('lock')}<input id="lp" name="password" type="password" autocomplete="current-password" required><span class="tail"><button type="button" data-act="pwToggle" data-for="lp" aria-label="Show password">${ic('eye')}</button></span></div><div class="hint" id="lerr"></div></div>
    <button class="btn btn-primary btn-lg btn-block">Log in ${ic('arrow')}</button></div>
    <div class="divider">or try a demo account</div>
    <div class="demo-accts">${[['misgana@learninghub.io','Learn#2026','Student','Misgana'],['solomon@learninghub.io','Teach#2026','Instructor','Dr. Solomon'],['admin@learninghub.io','Admin#2026','Admin','Hana']].map(([e, p, r, n]) => `<button type="button" data-act="demo" data-e="${e}" data-p="${p}"><b>${r}</b>${n}</button>`).join('')}</div>
    <button type="button" class="btn btn-plain btn-lg btn-block" style="margin-top:14px" data-act="google">${ic('google')}Sign in with Google</button>
    <p class="muted" style="text-align:center;margin-top:18px">New to Learning Hub? <a href="#register" style="font-weight:600">Create an account</a></p></form></main>` + authFoot; });
ACT.demo = el => { $('#le').value = el.dataset.e; $('#lp').value = el.dataset.p; FORMS.login($('form[data-form="login"]')); };
ACT.google = () => toast('Google sign-in needs OAuth credentials in production. Use email or a demo account for this prototype.', 'info');
ACT.pwToggle = el => { const i = $('#' + el.dataset.for); const show = i.type === 'password'; i.type = show ? 'text' : 'password'; el.innerHTML = ic(show ? 'eyeoff' : 'eye'); el.setAttribute('aria-label', show ? 'Hide password' : 'Show password'); };
FORMS.login = async f => {
  const email = f.email.value.trim().toLowerCase(); const pw = f.password.value; const err = $('#lerr');
  let r; try { r = await api('POST', '/auth/login', {email, password:pw}); }
  catch (e) { err.className = 'hint err'; err.textContent = e.message; if (e.status === 401) f.querySelectorAll('.input').forEach(i => i.classList.add('err')); return; }
  ls.set(SESSION_KEY, r.token); await sync();
  toast(`Welcome back, ${r.user.name.replace(/^Dr\.\s*/, '').split(' ')[0]}.`);
  const p = UI.pending; UI.pending = null; go(p && !/^(login|register)$/.test(p) ? p : 'dashboard');
};

route(/^register$/, () => {
  UI.noFab = true; if (me()) { setTimeout(() => go('dashboard')); return ''; }
  COMBO.role = {options:() => [['Student'], ['Instructor']]};
  COMBO.univ = {options:() => UNIVERSITIES, searchable:true, noun:'university'};
  COMBO.region = {options:() => Object.keys(REGIONS).map(r => [r]), onChange:() => setCombo('city', '')};
  COMBO.city = {options:() => (REGIONS[$('input[name="region"]')?.value] || Object.values(REGIONS).flat()).map(c => [c])};
  COMBO.status = {options:() => STATUSES.map(s => [s])};
  COMBO.field = {options:() => FIELDS.map(s => [s]), searchable:true, noun:'field'};
  onMount(() => {
    const pw = $('#rp'), pc = $('#rpc'), em = $('#re');
    const strength = v => [v.length >= 8, /\d/.test(v), /[^A-Za-z0-9]/.test(v), /[a-z]/.test(v) && /[A-Z]/.test(v)].filter(Boolean).length;
    pw.oninput = () => { const s = strength(pw.value); const col = ['var(--line)', 'var(--red)', 'var(--amber)', 'var(--green)', 'var(--green)'][s];
      $$('.strength i').forEach((b, i) => b.style.background = i < s ? col : 'var(--line)');
      const h = $('#rph'); h.className = 'hint'; h.innerHTML = pw.value ? `<b style="color:${col}">${['Too weak', 'Weak password', 'Fair password', 'Strong password', 'Strong password'][s]}</b> · 8+ characters, a number & a symbol` : '8+ characters, a number & a symbol'; pc.oninput(); };
    pc.oninput = () => { const h = $('#rpch'); const w = pc.closest('.input'); if (!pc.value) { h.textContent = ''; w.classList.remove('err', 'ok'); $('#pcok').innerHTML = ''; return; } const m = pc.value === pw.value;
      h.className = 'hint ' + (m ? 'ok' : 'err'); h.textContent = m ? 'Passwords match.' : 'Passwords don’t match. Please try again.'; w.classList.toggle('err', !m); w.classList.toggle('ok', m); $('#pcok').innerHTML = m ? ic('checkc', 'ok-ic') : ic('alert').replace('<svg', '<svg style="color:var(--red)"'); };
    em.onblur = async () => { const v = em.value.trim(); if (!v) return; const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); const dup = ok && (await api('GET', '/auth/email-available?email=' + encodeURIComponent(v)).then(r => !r.available).catch(() => false));
      const h = $('#reh'); const w = em.closest('.input'); h.className = 'hint ' + (ok && !dup ? 'ok' : 'err'); h.textContent = !ok ? 'Enter a valid email, like maya@example.com.' : dup ? 'An account with this email already exists. Log in instead.' : 'Email looks good.'; w.classList.toggle('err', !(ok && !dup)); w.classList.toggle('ok', ok && !dup); $('#emok').innerHTML = ok && !dup ? ic('checkc', 'ok-ic') : ic('alert').replace('<svg', '<svg style="color:var(--red)"'); };
  });
  const f2 = (a, b) => `<div class="grid g2" style="gap:16px 20px">${a}${b}</div>`;
  return authHeader() + `<main class="wrap auth-grid" id="main">${authLeft('Join Learning Hub', 'Today!', 'Create your account to access courses, AI learning, events, and career opportunities.')}
  <form class="form-card" data-form="register" novalidate><h2>Create Your Account</h2><p class="muted" style="margin-top:6px">One account. A whole world of learning.</p><p class="xs muted" style="margin-top:4px">All fields marked * are required.</p>
    <div class="sect-label"><em>01</em>Account details</div>
    ${f2(`<div class="field"><label for="rn">Full Name <span class="req">*</span></label><div class="input">${ic('user')}<input id="rn" name="name" autocomplete="name" placeholder="Enter your full name" required></div><div class="hint" id="rnh">Use the name you’d like on your certificates.</div></div>`,
    `<div class="field"><label for="re">Email Address <span class="req">*</span></label><div class="input">${ic('mail')}<input id="re" name="email" type="email" autocomplete="email" placeholder="you@university.edu" required><span class="tail" id="emok"></span></div><div class="hint" id="reh">A university or personal email works.</div></div>`)}
    <div style="height:16px"></div>
    ${f2(`<div class="field"><label for="rp">Password <span class="req">*</span></label><div class="input">${ic('lock')}<input id="rp" name="password" type="password" autocomplete="new-password" required><span class="tail"><button type="button" data-act="pwToggle" data-for="rp" aria-label="Show password">${ic('eye')}</button></span></div><div class="strength" aria-hidden="true"><i></i><i></i><i></i><i></i></div><div class="hint" id="rph">8+ characters, a number & a symbol</div></div>`,
    `<div class="field"><label for="rpc">Confirm Password <span class="req">*</span></label><div class="input">${ic('lock')}<input id="rpc" name="confirm" type="password" autocomplete="new-password" required><span class="tail"><span id="pcok"></span><button type="button" data-act="pwToggle" data-for="rpc" aria-label="Show password">${ic('eye')}</button></span></div><div class="hint" id="rpch"></div></div>`)}
    <div class="sect-label"><em>02</em>Your learning profile</div>
    ${f2(combo({id:'role', label:'User Role', icon:'badge', value:'Student'}), combo({id:'univ', label:'University', icon:'building', placeholder:'Search your university'}))}
    <div style="height:16px"></div>${f2(combo({id:'region', label:'Region', icon:'map', placeholder:'Select region'}), combo({id:'city', label:'City', icon:'pin', placeholder:'Select city'}))}
    <div style="height:16px"></div>${f2(combo({id:'status', label:'Academic Status', icon:'cap', placeholder:'Select status'}), combo({id:'field', label:'Field of Study', icon:'book', placeholder:'Search fields'}))}
    <label class="check" style="margin:22px 0 18px"><input type="checkbox" name="agree" id="ragree"> I agree to the <a href="#faq" style="font-weight:600">Terms & Privacy Policy</a></label><div class="hint err" id="ragh" style="margin:-10px 0 12px"></div>
    <button class="btn btn-primary btn-lg btn-block" id="regbtn">Register ${ic('arrow')}</button>
    <div class="divider">or continue with</div>
    <button type="button" class="btn btn-plain btn-lg btn-block" data-act="google">${ic('google')}Sign in with Google</button>
    <p class="muted" style="text-align:center;margin-top:18px">Already have an account? <a href="#login" style="font-weight:600">Login</a></p>
    <p class="xs muted row" style="justify-content:center;margin-top:10px;gap:6px">${ic('shield').replace('<svg','<svg style="width:14px;height:14px"')}Your information is safe and secure.</p></form></main>` + authFoot;
});
FORMS.register = async f => {
  const v = n => (f.querySelector(`[name="${n}"]`)?.value || '').trim();
  const errs = [];
  const mark = (inputSel, hintSel, msg) => { const i = $(inputSel); i?.closest('.input')?.classList.add('err'); const h = $(hintSel); if (h) { h.className = 'hint err'; h.textContent = msg; } errs.push(inputSel); };
  if (v('name').length < 3) mark('#rn', '#rnh', 'Enter your full name as it should appear on certificates.');
  const em = v('email'); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) mark('#re', '#reh', 'Enter a valid email, like maya@example.com.');
  const pw = $('#rp').value; if (!(pw.length >= 8 && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw))) mark('#rp', '#rph', 'Use 8+ characters with at least one number and one symbol.');
  if ($('#rpc').value !== pw || !pw) mark('#rpc', '#rpch', 'Passwords don’t match. Please try again.');
  [['role', 'Choose a role.'], ['univ', 'Choose your university.'], ['region', 'Choose your region.'], ['city', 'Choose your city.'], ['status', 'Choose your academic status.'], ['field', 'Choose your field of study.']].forEach(([k, m]) => { if (!v(k)) mark(`#${k}-btn`, `#${k}-hint`, m); });
  if (!$('#ragree').checked) { $('#ragh').textContent = 'Please agree to the Terms & Privacy Policy to continue.'; errs.push('#ragree'); } else $('#ragh').textContent = '';
  if (errs.length) { $(errs[0])?.focus(); toast('Check the highlighted fields.', 'err'); return; }
  const btn = $('#regbtn'); btn.disabled = true; btn.innerHTML = '<span class="spin"></span> Creating your account…';
  let r; try { r = await api('POST', '/auth/register', {name:v('name'), email:em, password:pw, role:v('role').toLowerCase(), university:v('univ'), region:v('region'), city:v('city'), academic:v('status'), field:v('field')}); }
  catch (e) { btn.disabled = false; btn.innerHTML = `Register ${ic('arrow')}`; if (e.data?.field === 'email') mark('#re', '#reh', e.message); toast(e.message, 'err'); return; }
  ls.set(SESSION_KEY, r.token); await sync(); toast('Account created. Welcome to Learning Hub!');
  const p = UI.pending; UI.pending = null; go(p && /^course-/.test(p) ? p : r.user.role === 'instructor' ? 'instructor' : 'dashboard');
};

/* ---- learn.js ---- */
/* ================= Lesson player ================= */
const SPEEDS = [1, 1.5, 2, 4, 8];
route(/^learn-(\w+)-(\w+)$/, (cid, lid) => {
  const g = need(); if (g) return g;
  const u = me(); const c = courseById(cid); if (!c) return null;
  const all = lessonsOf(c); const idx = all.findIndex(l => l.id === lid); if (idx < 0) return null;
  const l = all[idx]; const e = enrollmentOf(u.id, cid); const preview = u.role !== 'student';
  if (!e && !preview) { setTimeout(() => go('course-' + cid)); toast('Enroll to start this course.', 'info'); return ''; }
  UI.noFab = !!UI.focus;
  if (e && e.last?.lessonId !== l.id) { e.last = {lessonId:l.id, at:new Date().toISOString()}; fire('POST', `/enrollments/${cid}/last`, {lessonId:l.id}); }
  const mi = c.modules.findIndex(m => m.id === l.moduleId); const mod = c.modules[mi];
  const done = e ? doneCount(e) : 0; const pct = e ? progressOf(e) : 0;
  const open = UI.openMods['p' + cid] || (UI.openMods['p' + cid] = {[l.moduleId]:true});
  const ins = userById(c.instructor);
  const saved = S.saved.some(s => s.userId === u.id && s.courseId === cid && s.lessonId === lid);
  const watched = e?.watch[l.id] || 0; const isDone = !!e?.done[l.id];
  const typeLabel = {v:'video', r:'reading', p:'practice', q:'quiz'}[l.type];
  const prev = all[idx - 1], next = all[idx + 1];

  let stage = '';
  if (l.type === 'v') {
    onMount(() => mountPlayer(c, l, e));
    stage = `<div class="video" id="vid" tabindex="0" aria-label="Lesson video player. Space to play or pause.">
      <img class="bgimg" src="${IMG[c.hero] || imgOf(c)}" alt=""><div class="shade"></div>
      <div id="vslide"><div class="copy"><div class="k">${esc(c.title.toUpperCase())}</div><div class="mk">${String(mi+1).padStart(2,'0')} / ${esc(mod.title.toUpperCase())}</div><h2>${esc(l.title)}</h2><p>${esc((l.summary || '').split('. ')[0])}.</p><p style="margin-top:20px;font-size:13px">with ${esc(ins?.name)}</p></div></div>
      <button class="bigplay" id="vbig" aria-label="Play">${ic('play')}</button>
      <div class="cc hidden" id="vcc"></div>
      <div class="ctrls"><div class="track" id="vtrack" role="slider" aria-label="Seek" aria-valuemin="0" aria-valuemax="100" tabindex="0"><div class="buf" style="width:${watched}%"></div><div class="pos" style="width:0%"></div><div class="knob" style="left:0%"></div></div>
        <div class="row"><button id="vplay" aria-label="Play">${ic('play')}</button><button id="vback" aria-label="Back 10 seconds">${ic('replay')}</button><button id="vmute" aria-label="Mute">${ic('vol')}</button><span class="tm" id="vtm">00:00 / ${fmtClock(l.min * 60)}</span>
          <span style="flex:1"></span><button id="vspeed" aria-label="Playback speed">1×</button><button id="vcap" aria-label="Captions">${ic('cc')}</button><span class="tm">1080p</span><button aria-label="Settings" data-act="vsettings">${ic('gear')}</button><button id="vfull" aria-label="Full screen">${ic('full')}</button></div></div></div>`;
  } else if (l.type === 'q') {
    stage = quizStage(c, l, e);
  } else {
    stage = `<div class="card card-pad"><div class="row" style="margin-bottom:14px"><span class="ic ${l.type === 'p' ? 'ic-purple' : 'ic-blue'}">${ic(l.type === 'p' ? 'pencil' : 'file')}</span><div><b>${l.type === 'p' ? 'Hands-on practice' : 'Reading'}</b><div class="xs muted">${fmtMin(l.min)} · ${String(mi+1).padStart(2,'0')} / ${esc(mod.title)}</div></div></div>
      <div class="reading"><p>${esc(l.summary)}</p><h3>${l.type === 'p' ? 'Your steps' : 'Key ideas'}</h3>
      ${l.type === 'p' ? (l.points || []).map((p, i) => `<label class="check" style="padding:8px 0"><input type="checkbox" data-act="pstep" ${e?.watch[l.id] > i * (100 / (l.points.length)) ? 'checked' : ''}> ${esc(p)}</label>`).join('') : `<ul>${(l.points || []).map(p => `<li>${esc(p)}</li>`).join('')}</ul>`}</div></div>`;
  }
  const label = l.type === 'q' ? '' : isDone ? `<span class="pill p-green">${ic('check')} Completed</span>` : '';
  return `<header class="lp-hdr"><div class="in">${brand()}<a class="back" href="#course-${c.id}">${ic('arrowL')}<span><b>${esc(c.title)}</b><small>Back to course overview</small></span></a><span style="flex:1"></span>
      <button class="btn btn-ghost" data-act="focusMode">${ic('focus')}${UI.focus ? 'Exit focus' : 'Focus mode'}</button><div class="usermenu"><button class="avbtn" data-act="userMenu" data-dd aria-label="Account menu">${avatar(u)}</button></div></div></header>
  <div class="lp ${UI.focus ? 'focus' : ''}" id="main">
    <div style="min-width:0">
      ${preview ? `<div class="note amber" style="margin-bottom:14px">${ic('eye')}Preview mode. Progress isn’t recorded for ${u.role} accounts.</div>` : ''}
      ${stage}
      <div class="row between" style="margin-top:22px"><span class="eyebrow purple">MODULE ${String(mi+1).padStart(2,'0')} · LESSON ${String(idx+1).padStart(2,'0')} OF ${all.length}</span><span class="small muted">${l.min} min ${typeLabel}</span></div>
      <h1 style="font-size:clamp(24px,3vw,34px);font-weight:800;margin:10px 0 14px">${esc(l.title)}</h1>
      <div class="row between wrapf"><div class="row">${avatar(ins, 'sm')}<span class="small muted">${esc(ins?.name)}</span>${label}</div>
        <div class="row"><button class="btn btn-plain" data-act="notes" data-c="${cid}" data-l="${lid}">${ic('note')}Notes</button><button class="btn btn-plain" data-act="bookmark" data-c="${cid}" data-l="${lid}" aria-pressed="${saved}">${ic(saved ? 'bookmarkf' : 'bookmark')}${saved ? 'Saved' : 'Bookmark'}</button></div></div>
      ${l.type === 'v' ? `<div style="margin-top:18px"><div class="row between small"><span class="muted">Your lesson progress</span><b style="color:var(--primary-text)" id="wpct">${isDone ? 100 : watched}% watched</b></div><div class="bar" style="margin-top:8px"><span id="wbar" style="width:${isDone ? 100 : watched}%"></span></div></div>` : ''}
      ${l.type !== 'q' ? `<h3 style="margin:24px 0 8px">About this lesson</h3><p class="muted">${esc(l.summary)}</p>
      <h3 style="margin:24px 0 12px">Downloadable resources <span class="muted small">(2)</span></h3>
      <div class="grid g2" style="gap:14px"><div class="card res"><span class="ic ic-blue">${ic('file')}</span><div style="flex:1"><b>${esc(l.title.replace(/^(Practice|Project|Lab|Capstone):\s*/,''))} checklist</b><small class="muted">Markdown · 2 KB</small></div><button class="iconbtn" style="border:0" data-act="dlRes" data-c="${cid}" data-l="${lid}" data-k="checklist" aria-label="Download checklist">${ic('download')}</button></div>
        <div class="card res"><span class="ic ic-purple">${ic('layout')}</span><div style="flex:1"><b>Lesson summary notes</b><small class="muted">Text file · 1 KB</small></div><button class="iconbtn" style="border:0" data-act="dlRes" data-c="${cid}" data-l="${lid}" data-k="notes" aria-label="Download summary notes">${ic('download')}</button></div></div>` : ''}
      <div class="lp-nav">${prev ? `<a class="btn btn-plain" href="#learn-${cid}-${prev.id}">${ic('arrowL')}Previous lesson</a>` : ''}${next ? `<a class="link" href="#learn-${cid}-${next.id}">Next lesson ${ic('arrow')}</a>` : ''}<span style="flex:1"></span>
        ${l.type !== 'q' && !preview ? `<button class="btn btn-primary btn-lg" data-act="complete" data-c="${cid}" data-l="${lid}">${isDone ? (next ? 'Go to next lesson' : 'Back to course') : 'Complete Lesson'} ${ic('arrow')}</button>` : ''}</div>
    </div>
    <aside class="journey card" aria-label="Course outline">
      <div class="jh"><div class="row between"><h3>Your learning journey</h3><button class="iconbtn" style="border:0" data-act="focusMode" aria-label="Hide outline">${ic('sidebar')}</button></div>
        <p class="xs muted" style="margin:6px 0 12px">${plural(c.modules.length, 'module')} · ${plural(all.length, 'lesson')} · ${hoursLabel(courseMinutes(c))}</p>
        <div class="row between xs"><span class="muted">${done} of ${all.length} lessons complete</span><b style="color:var(--primary-text)">${pct}%</b></div><div class="bar" style="margin-top:6px"><span style="width:${pct}%"></span></div></div>
      <div class="jscroll">${c.modules.map((m, i) => `<div class="mod ${open[m.id] ? 'open' : ''}"><button class="mod-h" data-act="jmod" data-c="${cid}" data-m="${m.id}" aria-expanded="${!!open[m.id]}"><span class="n">${String(i+1).padStart(2,'0')}</span><span><b style="font-size:14px">${esc(m.title)}</b><small>${plural(m.lessons.length, 'lesson')} · ${fmtMin(m.lessons.reduce((a, x) => a + x.min, 0))}</small></span>${ic('chev', 'chev')}</button>
        ${open[m.id] ? `<div style="padding:4px 0 8px">${m.lessons.map(x => { const d = e?.done[x.id]; const cur = x.id === lid;
          return `<a class="jl ${d ? 'done' : ''} ${cur ? 'cur' : ''}" href="#learn-${cid}-${x.id}"><span class="s">${d && !cur ? ic('check') : cur ? ic('play') : ic({v:'playc', r:'file', p:'pencil', q:'list'}[x.type])}</span><span style="min-width:0"><b>${esc(x.title)}</b><small>${fmtClock(x.min * 60)}${x.type === 'q' && e?.quiz[x.id] ? ` · Best ${e.quiz[x.id].best}%` : ''}</small></span>${cur && !d ? '<span class="ip">IN PROGRESS</span>' : ''}</a>`; }).join('')}</div>` : ''}</div>`).join('')}</div>
    </aside>
  </div>
  <p class="xs muted row" style="max-width:1300px;margin:0 auto;padding:0 32px 30px;gap:6px">${ic('cloud').replace('<svg','<svg style="width:15px;height:15px"')}Your progress is saved automatically.</p>`;
});
ACT.focusMode = () => { UI.focus = !UI.focus; render(); };
ACT.jmod = el => { const o = UI.openMods['p' + el.dataset.c]; o[el.dataset.m] = !o[el.dataset.m]; render(); };
ACT.vsettings = () => toast('Quality is fixed at 1080p in this prototype.', 'info');
ACT.pstep = el => { const boxes = $$('input[data-act="pstep"]'); const n = boxes.filter(b => b.checked).length; const u = me(); const [, cid, lid] = location.hash.match(/learn-(\w+)-(\w+)/) || []; const e = u && enrollmentOf(u.id, cid); if (e) { e.watch[lid] = Math.round(n / boxes.length * 100); fire('PATCH', `/enrollments/${cid}/watch`, {lessonId:lid, pct:e.watch[lid], exact:true}); } };

function mountPlayer(c, l, e) {
  const dur = l.min * 60; let t = 0, playing = false, speed = 1, cap = false, last = performance.now(), raf, muted = false;
  if (e && e.watch[l.id] && e.watch[l.id] < 100) t = dur * e.watch[l.id] / 100;
  const slides = [null, ...(l.points || [])];
  const el = $('#vid'); if (!el) return;
  const draw = () => {
    const p = t / dur * 100;
    $('.pos', el).style.width = p + '%'; $('.knob', el).style.left = p + '%';
    $('#vtm').textContent = `${fmtClock(t)} / ${fmtClock(dur)}`;
    const si = Math.min(slides.length - 1, Math.floor(t / dur * slides.length));
    const vs = $('#vslide');
    if (vs.dataset.si !== String(si)) {
      vs.dataset.si = si;
      if (si > 0) vs.innerHTML = `<div class="slide"><div class="eyebrow" style="color:#B9A6FF">KEY IDEA ${si} OF ${slides.length - 1}</div><h3 style="margin-top:12px">${esc(slides[si])}</h3><ul>${slides.slice(1, si).map(s => `<li style="opacity:.6">${esc(s)}</li>`).join('')}</ul></div>`;
      else vs.innerHTML = `<div class="copy"><div class="k">${esc(c.title.toUpperCase())}</div><h2 style="margin-top:12%">${esc(l.title)}</h2><p>${esc((l.summary || '').split('. ')[0])}.</p></div>`;
    }
    const cc = $('#vcc'); cc.classList.toggle('hidden', !cap || !playing); if (cap) cc.textContent = si > 0 ? slides[si] : l.summary.split('. ')[0];
    if (e && !e.done[l.id]) { const w = Math.max(e.watch[l.id] || 0, Math.round(p)); if (w !== e.watch[l.id]) { e.watch[l.id] = w; $('.buf', el).style.width = w + '%'; const wp = $('#wpct'); if (wp) { wp.textContent = w + '% watched'; $('#wbar').style.width = w + '%'; } queueWatch(e, l.id); } }
  };
  const tick = now => { const dt = (now - last) / 1000; last = now; if (playing) { t = Math.min(dur, t + dt * speed); if (t >= dur) { setPlay(false); toast('Video finished. Select Complete Lesson to continue.'); } draw(); } raf = requestAnimationFrame(tick); };
  const setPlay = v => { playing = v; last = performance.now(); $('#vplay').innerHTML = ic(v ? 'pause' : 'play'); $('#vplay').setAttribute('aria-label', v ? 'Pause' : 'Play'); $('#vbig').classList.toggle('hidden', v); if (v && t >= dur) t = 0; draw(); };
  $('#vbig').onclick = () => setPlay(true); $('#vplay').onclick = () => setPlay(!playing);
  $('#vback').onclick = () => { t = Math.max(0, t - 10); draw(); };
  $('#vmute').onclick = () => { muted = !muted; $('#vmute').innerHTML = ic(muted ? 'mute' : 'vol'); };
  $('#vspeed').onclick = () => { speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]; $('#vspeed').textContent = speed + '×'; };
  $('#vcap').onclick = () => { cap = !cap; $('#vcap').style.color = cap ? '#8EA6FF' : '#fff'; draw(); };
  $('#vfull').onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : el.requestFullscreen(); } catch (x) { toast('Full screen isn’t available here.', 'info'); } };
  const tr = $('#vtrack'); tr.onclick = ev => { const r = tr.getBoundingClientRect(); t = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * dur; draw(); };
  tr.onkeydown = ev => { if (ev.key === 'ArrowRight') { t = Math.min(dur, t + 10); draw(); } if (ev.key === 'ArrowLeft') { t = Math.max(0, t - 10); draw(); } };
  el.onkeydown = ev => { if (ev.key === ' ' && ev.target === el) { ev.preventDefault(); setPlay(!playing); } };
  draw(); raf = requestAnimationFrame(tick);
  let acc = 0; const iv = setInterval(() => { if (playing && e) { acc += 15 * speed; if (acc >= 60) { logMinutes(e.userId, 1); acc -= 60; } } }, 15000);
  UI.stopPlayer = () => { cancelAnimationFrame(raf); clearInterval(iv); };
}

ACT.complete = async el => {
  const u = me(); const {c: cid, l: lid} = el.dataset; const c = courseById(cid); const e = enrollmentOf(u.id, cid);
  const all = lessonsOf(c); const idx = all.findIndex(x => x.id === lid); const next = all[idx + 1];
  if (!e.done[lid]) {
    el.disabled = true;
    const last = !e.completedAt && all.every(x => x.id === lid || e.done[x.id]);
    if (last) showIssuing();
    const r = await mutate('POST', `/enrollments/${cid}/lessons/${lid}/complete`); if (!r) { closeModal(); return; }
    toast('Lesson complete. Nice work!');
    if (r.cert) { await new Promise(x => setTimeout(x, 500)); showCertDone(r.cert, c, u); return; }
  }
  if (next) go(`learn-${cid}-${next.id}`); else go('course-' + cid);
};
function showIssuing() {
  openModal({title:'Issuing your certificate', body:`<div class="celebrate"><div class="big"><span class="spin" style="width:36px;height:36px;border-width:3px"></span></div><h3>Recording on the ledger…</h3><p class="muted" style="margin-top:6px">Hashing your certificate, signing it with the issuer key, mining a new block and anchoring it in the smart contract.</p></div>`});
}
function showCertDone(cert, c, u) {
  openModal({title:'Course complete', body:`<div class="celebrate"><div class="big">${ic('award')}</div><h2 style="font-size:26px;font-weight:800">You did it, ${esc(u.name.split(' ')[0])}!</h2>
    <p class="muted" style="margin:8px 0 18px">You finished <b>${esc(c.title)}</b> with an average quiz score of ${cert.score}%. Your certificate is now on-chain.</p>
    <div class="stack" style="text-align:left"><div class="hashbox"><small>CERTIFICATE ID</small><span class="mono">${cert.id}</span></div><div class="hashbox"><small>SHA-256 FINGERPRINT</small><span class="mono">${cert.hash}</span></div><div class="hashbox"><small>BLOCK</small><span class="mono">#${cert.blockIndex} · ${cert.blockHash}</span></div></div></div>`,
    foot:`<a class="btn btn-plain" href="#wallet-${u.handle}">Open my wallet</a><a class="btn btn-primary" href="#cert-${cert.id}">View certificate ${ic('arrow')}</a>`});
}

/* notes, bookmarks, resources */
ACT.notes = el => {
  const u = me(); const k = `${u.id}|${el.dataset.c}|${el.dataset.l}`; const l = lessonsOf(courseById(el.dataset.c)).find(x => x.id === el.dataset.l);
  openModal({title:'My notes', body:`<p class="small muted" style="margin-bottom:10px">${esc(l.title)}</p><label class="sr" for="notetxt">Notes</label><textarea class="ta" id="notetxt" style="min-height:200px" placeholder="Write what you want to remember…">${esc(S.notes[k] || '')}</textarea>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-primary" id="savenote">Save notes</button>`});
  $('#savenote').onclick = async () => { const v = $('#notetxt').value; if (!(await mutate('PUT', `/me/notes/${el.dataset.c}/${el.dataset.l}`, {text:v}))) return; closeModal(); toast('Notes saved.'); };
};
ACT.bookmark = async el => {
  const u = me(); const {c, l} = el.dataset; const i = S.saved.findIndex(s => s.userId === u.id && s.courseId === c && s.lessonId === l);
  const r = await mutate('POST', '/me/saved/toggle', {courseId:c, lessonId:l}); if (!r) return;
  toast(r.saved ? 'Saved to your resources.' : 'Removed from saved resources.', r.saved ? 'ok' : 'info'); render();
};
let DL; const getDownloads = async () => { if (DL !== undefined) return DL; try { DL = window.claude?.use ? await window.claude.use('downloads') : null; } catch (e) { DL = null; } return DL; };
async function offerFile(filename, data, mime = 'text/plain') {
  try {
    const url = URL.createObjectURL(new Blob([data], {type:mime})); const a = document.createElement('a');
    a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 2000); toast('Download started.');
  } catch (e) { toast('Download failed. Try again.', 'err'); }
}
ACT.dlRes = el => {
  const c = courseById(el.dataset.c); const l = lessonsOf(c).find(x => x.id === el.dataset.l);
  const md = el.dataset.k === 'checklist'
    ? `# ${l.title} — checklist\n\nCourse: ${c.title}\n\n${(l.points || []).map(p => `- [ ] ${p}`).join('\n')}\n\nLearning Hub · learninghub.io`
    : `${l.title}\n${'='.repeat(l.title.length)}\n\n${l.summary}\n\nKey ideas:\n${(l.points || []).map(p => ` • ${p}`).join('\n')}\n`;
  offerFile(`${l.title.replace(/[^\w]+/g, '-').toLowerCase()}-${el.dataset.k}.${el.dataset.k === 'checklist' ? 'md' : 'txt'}`, md, el.dataset.k === 'checklist' ? 'text/markdown' : 'text/plain');
};

/* ================= Quiz ================= */
function quizStage(c, l, e) {
  const st = UI.quiz && UI.quiz.lid === l.id && UI.quiz.cid === c.id ? UI.quiz : (UI.quiz = {cid:c.id, lid:l.id, ans:{}, submitted:false});
  const best = e?.quiz[l.id]; const pass = c.passMark || 70;
  const cor = i => st.result ? st.result.correct[i] : l.quiz[i].correct; const exp = i => st.result ? st.result.explain[i] : l.quiz[i].explain;
  const head = `<div class="card card-pad" style="background:var(--primary-soft);border-color:transparent"><div class="row between wrapf"><div class="row"><span class="ic ic-blue" style="background:var(--surface)">${ic('list')}</span><div><b style="font-size:17px">${esc(l.title)}</b><div class="small muted">${plural(l.quiz.length, 'question')} · Pass mark ${pass}% · Unlimited attempts</div></div></div>
    ${best ? `<span class="pill ${best.best >= pass ? 'p-green' : 'p-amber'}">Best score ${best.best}% · ${plural(best.attempts, 'attempt')}</span>` : ''}</div></div>`;
  const qs = l.quiz.map((q, qi) => `<fieldset class="card quiz-q" style="border:1px solid var(--line)"><legend class="sr">Question ${qi + 1}</legend><h4>${qi + 1}. ${esc(q.q)}</h4>
    ${q.opts.map((o, oi) => { const sel = st.ans[qi] === oi; let cls = sel ? 'sel' : ''; if (st.submitted) { if (oi === cor(qi)) cls = 'right'; else if (sel) cls = 'wrong'; }
      return `<label class="opt ${cls}"><input type="radio" name="q${qi}" ${sel ? 'checked' : ''} ${st.submitted ? 'disabled' : ''} data-act="qpick" data-q="${qi}" data-o="${oi}">${esc(o)}${st.submitted && oi === cor(qi) ? ic('checkc').replace('<svg','<svg style="width:18px;height:18px;margin-left:auto;color:var(--green)"') : ''}</label>`; }).join('')}
    ${st.submitted ? `<p class="explain">${ic(st.ans[qi] === cor(qi) ? 'checkc' : 'alert').replace('<svg','<svg style="width:14px;height:14px;vertical-align:-2px"')} ${esc(exp(qi))}</p>` : ''}</fieldset>`).join('');
  let result = '';
  if (st.submitted) {
    const score = st.score; const ok = score >= pass;
    result = `<div class="verdict ${ok ? 'v-ok' : 'v-warn'}" style="margin-top:16px"><span class="ic" style="background:var(--surface)">${ic(ok ? 'trophy' : 'refresh')}</span><div style="flex:1"><h3>${ok ? 'Passed' : 'Not quite yet'} · ${score}%</h3><p class="small">${ok ? 'Great work. This quiz counts toward your certificate.' : `You need ${pass}% to pass. Review the explanations and try again.`}</p></div>
      ${ok ? (e ? `<button class="btn btn-primary" data-act="quizNext" data-c="${c.id}" data-l="${l.id}">Continue ${ic('arrow')}</button>` : '') : `<button class="btn btn-primary" data-act="quizRetry">Try again</button>`}</div>`;
  }
  return head + qs + (st.submitted ? result : `<div class="row" style="margin-top:16px;justify-content:flex-end"><span class="small muted" style="margin-right:auto">${Object.keys(st.ans).length} of ${l.quiz.length} answered</span><button class="btn btn-primary btn-lg" data-act="quizSubmit" data-c="${c.id}" data-l="${l.id}" ${Object.keys(st.ans).length < l.quiz.length ? 'disabled' : ''}>Submit answers</button></div>`);
}
ACT.qpick = el => { UI.quiz.ans[+el.dataset.q] = +el.dataset.o; const y = window.scrollY; render(); window.scrollTo(0, y); };
ACT.quizRetry = () => { UI.quiz.ans = {}; UI.quiz.submitted = false; UI.quiz.result = null; render(); };
ACT.quizSubmit = async el => {
  const u = me(); const c = courseById(el.dataset.c); const l = lessonsOf(c).find(x => x.id === el.dataset.l); const st = UI.quiz;
  const e = enrollmentOf(u.id, c.id); const y = window.scrollY;
  if (!e) { // instructor/admin preview: graded locally from the answer key they own
    if (!l.quiz.every(q => q.correct !== undefined)) { toast('Preview mode: answers aren’t graded.', 'info'); return; }
    st.result = null; st.score = Math.round(l.quiz.filter((q, i) => st.ans[i] === q.correct).length / l.quiz.length * 100); st.submitted = true;
    render(); window.scrollTo(0, y); return;
  }
  el.disabled = true;
  const r = await mutate('POST', `/enrollments/${c.id}/quizzes/${l.id}/submit`, {answers:l.quiz.map((q, i) => st.ans[i])}); if (!r) return;
  st.score = r.score; st.submitted = true; st.result = {correct:r.correct, explain:r.explain};
  render(); window.scrollTo(0, y);
  if (r.cert) { showIssuing(); await new Promise(x => setTimeout(x, 700)); showCertDone(r.cert, c, u); }
};
ACT.quizNext = el => { const c = courseById(el.dataset.c); const all = lessonsOf(c); const i = all.findIndex(x => x.id === el.dataset.l); UI.quiz = null; const e = enrollmentOf(me().id, c.id); if (e?.certId && i === all.length - 1) go('cert-' + e.certId); else if (all[i + 1]) go(`learn-${c.id}-${all[i + 1].id}`); else go('course-' + c.id); };

/* ---- student.js ---- */
/* ================= Dashboard (role-aware) ================= */
route(/^dashboard$/, () => {
  const g = need(); if (g) return g;
  const u = me();
  if (u.role === 'instructor') return viewInstructorHome();
  if (u.role === 'admin') return viewAdminHome();
  const ens = S.enrollments.filter(e => e.userId === u.id);
  const active = ens.filter(e => !e.completedAt).sort((a, b) => new Date(b.last?.at || b.enrolledAt) - new Date(a.last?.at || a.enrolledAt));
  const cur = active[0]; const c = cur && courseById(cur.courseId);
  const week = weekData(u.id), prevWeek = weekData(u.id, 1);
  const wkMin = week.reduce((a, d) => a + d.min, 0), pwMin = prevWeek.reduce((a, d) => a + d.min, 0);
  const max = Math.max(120, ...week.map(d => d.min)); const maxH = Math.ceil(max / 60);
  const certs = S.certs.filter(x => x.studentId === u.id && x.status === 'valid');
  const completed = ens.filter(e => e.completedAt);
  const monthDone = completed.filter(e => new Date(e.completedAt) > daysAgo(30)).length;
  const streak = streakOf(u.id); const badges = badgesOf(u);
  const earned = badges.filter(b => b.earned);
  const nextLesson = cur && lessonsOf(c).find(l => !cur.done[l.id]);
  const nextMod = nextLesson && c.modules.findIndex(m => m.id === nextLesson.moduleId);
  const ringPct = cur ? progressOf(cur) : 0; const R = 54, C = 2 * Math.PI * R;
  const goals = S.goals.filter(x => x.userId === u.id).slice(0, 4);
  const diff = pwMin ? Math.round((wkMin - pwMin) / pwMin * 100) : 0;
  const recentCert = certs.slice().sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))[0];
  const first = u.name.replace(/^Dr\.\s*/, '').split(' ')[0];
  return appShell('dashboard', ['My workspace', 'Overview'], `
  <div class="page-h"><div><h1>Small steps. Real progress, ${esc(first)}.</h1><p>${wkMin ? 'You’re building momentum. Here’s how your learning is coming along.' : 'Pick a course and take your first step today.'}</p></div>
    <span class="btn btn-plain" style="cursor:default">${ic('cal')}${fmtDate(daysAgo(6), {month:'short', day:'numeric'})} – ${daysAgo(6).getMonth() === new Date().getMonth() ? new Date().getDate() + ', ' + new Date().getFullYear() : fmtDate(new Date())}</span></div>
  <div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr)" id="dg1">
    ${cur ? `<section class="resume"><div><div class="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h2>${esc(c.title)}</h2>
      <p class="muted small">Up next: ${esc(nextLesson.title)}</p><p class="muted small">Module ${nextMod + 1} of ${c.modules.length} · Lesson ${lessonsOf(c).findIndex(l => l.id === nextLesson.id) + 1} · ${nextLesson.min} min</p>
      <button class="btn btn-primary" style="margin-top:18px" data-act="resume" data-id="${c.id}">Continue learning ${ic('arrow')}</button></div><div class="art"><img src="${c.id === 'c3' ? IMG.laptop : imgOf(c)}" alt=""></div></section>`
      : `<section class="resume"><div><div class="eyebrow">START SOMETHING NEW</div><h2>Find your next course</h2><p class="muted small">Every course ends with a certificate recorded on the ledger.</p><a class="btn btn-primary" style="margin-top:18px" href="#courses">Explore courses ${ic('arrow')}</a></div><div class="art"><img src="${IMG.laptop}" alt=""></div></section>`}
    <section class="card card-pad"><div class="row between"><h3>Course completion</h3>${cur ? `<span class="xs" style="color:var(--green);font-weight:700">${ringPct >= 50 ? 'On track' : 'Keep going'}</span>` : ''}</div>
      <div class="row" style="gap:20px;margin-top:14px"><div class="ring"><svg viewBox="0 0 132 132"><circle cx="66" cy="66" r="${R}" stroke="var(--primary-soft)" stroke-width="14" fill="none"/><circle cx="66" cy="66" r="${R}" stroke="var(--primary)" stroke-width="14" fill="none" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - ringPct / 100)}"/></svg><div class="v"><div><b>${ringPct}%</b><small>complete</small></div></div></div>
      <div>${cur ? `<b style="font-size:22px">${doneCount(cur)}</b> <span class="muted">of ${lessonsOf(c).length} lessons</span><p class="small muted" style="margin:6px 0 10px">Just ${lessonsOf(c).length - doneCount(cur)} lessons to your next certificate. You’ve got this.</p><a class="link small" href="#course-${c.id}">View course details ${ic('arrow')}</a>` : '<p class="small muted">No active course yet.</p>'}</div></div></section>
  </div>
  <div class="grid g4" style="margin-top:20px">
    ${[['clock', 'Study hours this week', (Math.round(wkMin / 6) / 10) + ' hrs', `${wkMin >= pwMin ? '↑' : '↓'} ${Math.abs(Math.round((wkMin - pwMin) / 6) / 10)} hrs vs. last week`], ['bookopen', 'Lessons this week', lessonsThisWeek(u.id), `Across ${plural(active.length, 'active course')}`], ['checkc', 'Completed courses', completed.length, `${monthDone} completed this month`], ['award', 'Certificates earned', certs.length, 'Your skills, recorded on-chain']]
      .map(([i, t, v, s], k) => `<div class="card kpi"><span class="ic ${k === 3 ? 'ic-purple' : 'ic-blue'}">${ic(i)}</span><div><small>${t}</small><b>${v}</b><span class="s">${s}</span></div></div>`).join('')}
  </div>
  <div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);margin-top:20px" id="dg2">
    <section class="card card-pad"><div class="row between"><div><h3>Your week in learning</h3><p class="small muted">A little consistency adds up to a lot.</p></div><span class="xs muted row" style="gap:6px"><i style="width:8px;height:8px;border-radius:2px;background:var(--primary);display:inline-block"></i>Study hours</span></div>
      <div class="chart"><div class="yax">${Array.from({length:3}, (_, i) => `<span>${(maxH * (2 - i) / 2).toFixed(maxH % 2 ? 1 : 0).replace('.0', '')}h</span>`).join('')}</div>
        <div class="bars" role="img" aria-label="Study hours per day this week">${week.map((d, i) => `<div class="b ${i === 6 ? 'on' : ''}"><span>${d.min ? (Math.round(d.min / 30) / 2) + 'h' : ''}</span><i style="height:${d.min / (maxH * 60) * 100}%"></i></div>`).join('')}</div>
        <div class="xax">${week.map((d, i) => `<span class="${i === 6 ? 'on' : ''}">${d.d.toLocaleDateString('en-US', {weekday:'short'})}</span>`).join('')}</div></div>
      <p class="small muted row" style="margin-top:16px;gap:6px">${ic('trend').replace('<svg','<svg style="width:16px;height:16px;color:var(--green)"')}${pwMin ? `<b style="color:var(--green)">${Math.abs(diff)}% ${diff >= 0 ? 'more' : 'less'} time learning</b> than last week’s ${Math.round(pwMin / 6) / 10} hours.` : 'Your first week—every minute counts.'}</p></section>
    <section class="card card-pad"><div class="row between"><h3>Keep the spark alive</h3><span class="ic ic-amber" style="width:34px;height:34px">${ic('fire')}</span></div>
      <div class="row" style="margin-top:14px"><b style="font-size:40px;font-weight:800;line-height:1">${streak}</b><div><b>day learning streak</b><div class="xs muted">${streak >= 7 ? 'Your longest streak yet. Keep going!' : 'Learn a little every day to grow it.'}</div></div></div>
      <div class="streak">${week.map((d, i) => `<div><i class="${i === 6 ? (d.min ? 'today' : 'off') : d.min ? '' : 'off'}">${d.min ? ic('check') : ''}</i>${d.d.toLocaleDateString('en-US', {weekday:'narrow'})}</div>`).join('')}</div>
      <div class="note">${ic('bolt')}${streak >= 14 ? 'Consistency badge unlocked!' : `<span><b>${14 - streak} more days</b> to unlock the Consistency badge.</span>`}</div></section>
  </div>
  <div class="grid" style="grid-template-columns:minmax(0,2fr) minmax(0,1fr);margin-top:20px" id="dg3">
    <section class="card card-pad"><div class="row between"><div class="row"><h3>Milestones worth celebrating</h3><span class="small muted">${earned.length} earned</span></div><a class="link small" href="#wallet-${u.handle}">View all ${ic('arrow')}</a></div>
      <div class="miles" style="margin:22px 0">${badges.slice(0, 4).map(b => `<div><div class="hex ${b.earned ? b.tone : 'h-lock'}">${ic(b.earned ? b.icon : 'lock')}</div><b>${b.title}</b><small>${b.earned ? b.desc : 'Next up · ' + b.desc}</small></div>`).join('')}</div>
      ${recentCert ? `<div class="row" style="background:var(--surface-2);border-radius:12px;padding:14px 16px"><span class="ic ic-purple" style="width:34px;height:34px">${ic('shieldck')}</span><div style="flex:1;min-width:0"><b class="small">${esc(recentCert.courseTitle)} · Course completed</b><div class="xs muted">Certificate earned ${fmtDate(recentCert.issuedAt)} · Block #${recentCert.blockIndex}</div></div><a class="link small" href="#cert-${recentCert.id}">View certificate ${ic('ne')}</a></div>` : ''}</section>
    <section class="card card-pad"><div class="row between"><h3>Upcoming learning goals</h3><a class="link small" href="#goals">Edit goals</a></div>
      ${goals.length ? goals.map(goalRow).join('') : `<p class="small muted" style="margin-top:12px">Set a goal to stay on track.</p><a class="btn btn-soft btn-sm" style="margin-top:12px" href="#goals">Add a goal</a>`}</section>
  </div>
  <div class="row between xs muted" style="margin-top:22px;flex-wrap:wrap"><span>Every lesson is an investment in your future.</span><span>All learning activity shown in your local time</span></div>`);
});
function goalState(gl) {
  const u = userById(gl.userId);
  if (gl.kind === 'hours') { const h = weekData(u.id).reduce((a, d) => a + d.min, 0) / 60; return {cur:Math.round(h * 10) / 10, target:gl.target, label:`${Math.round(h * 10) / 10} of ${gl.target} hrs · ${h >= gl.target ? 'Goal reached!' : `Just ${Math.round((gl.target - h) * 10) / 10} hours to go`}`}; }
  if (gl.kind === 'lessons') { const n = lessonsThisWeek(u.id); return {cur:n, target:gl.target, label:`${n} of ${gl.target} lessons this week`}; }
  const e = enrollmentOf(u.id, gl.courseId); const c = courseById(gl.courseId);
  if (gl.kind === 'module' && e) { const m = c.modules.find(m => m.lessons.some(l => !e.done[l.id])) || c.modules[c.modules.length - 1]; const d = m.lessons.filter(l => e.done[l.id]).length; return {cur:d, target:m.lessons.length, label:`${d} of ${m.lessons.length} lessons completed`}; }
  if (e) return {cur:doneCount(e), target:lessonsOf(c).length, label:`${doneCount(e)} of ${lessonsOf(c).length} lessons completed`};
  return {cur:0, target:1, label:'Not enrolled yet'};
}
function goalRow(gl) { const s = goalState(gl); const p = Math.min(100, Math.round(s.cur / Math.max(1, s.target) * 100));
  return `<div class="goal"><span class="ic ic-blue" style="width:32px;height:32px">${ic('target')}</span><div style="flex:1;min-width:0"><div class="row between"><b>${esc(gl.title)}</b><span class="xs muted">${fmtDate(gl.due, {month:'short', day:'numeric'})}</span></div><div class="bar" style="margin:8px 0 6px"><span style="width:${p}%"></span></div><span class="xs muted">${esc(s.label)}</span></div></div>`; }

/* ================= My learning ================= */
route(/^my-learning$/, () => {
  const g = need(['student']); if (g) return g;
  const u = me(); const tab = UI.tab.ml || 'active';
  const ens = S.enrollments.filter(e => e.userId === u.id);
  const list = ens.filter(e => tab === 'active' ? !e.completedAt : e.completedAt);
  return appShell('my-learning', ['My workspace', 'My learning'], `<div class="page-h"><div><h1>My learning</h1><p>${plural(ens.length, 'course')} enrolled · ${ens.filter(e => e.completedAt).length} completed</p></div><a class="btn btn-primary" href="#courses">${ic('plus')}Find a course</a></div>
  <div class="tabs" role="tablist"><button class="${tab === 'active' ? 'on' : ''}" data-act="tab" data-k="ml" data-v="active" role="tab">In progress (${ens.filter(e => !e.completedAt).length})</button><button class="${tab === 'done' ? 'on' : ''}" data-act="tab" data-k="ml" data-v="done" role="tab">Completed (${ens.filter(e => e.completedAt).length})</button></div>
  ${list.length ? `<div class="stack">${list.map(e => { const c = courseById(e.courseId); const p = progressOf(e); const quizzes = lessonsOf(c).filter(l => l.type === 'q'); const passed = quizzes.filter(q => e.done[q.id]).length;
    return `<article class="card" style="display:grid;grid-template-columns:180px minmax(0,1fr) auto;gap:20px;align-items:center;padding:16px" id="mlrow"><img src="${imgOf(c)}" alt="" style="border-radius:12px;aspect-ratio:1.7;object-fit:cover;width:100%">
      <div><div class="row">${catPill(c.cat)}<span class="xs muted">Enrolled ${fmtDate(e.enrolledAt)}</span></div><h3 style="margin:8px 0 6px;font-size:18px"><a href="#course-${c.id}" style="color:inherit">${esc(c.title)}</a></h3>
        <div class="row small muted wrapf"><span>${doneCount(e)} of ${lessonsOf(c).length} lessons</span><span>· Quizzes passed ${passed}/${quizzes.length}</span>${e.last ? `<span>· Last active ${fmtDate(e.last.at)}</span>` : ''}</div>
        <div class="bar ${e.completedAt ? 'green' : ''}" style="margin-top:10px;max-width:460px"><span style="width:${p}%"></span></div></div>
      <div>${e.completedAt ? `<a class="btn btn-soft" href="#cert-${e.certId}">${ic('award')}Certificate</a>` : `<button class="btn btn-primary" data-act="resume" data-id="${c.id}">${p ? 'Continue' : 'Start'} ${ic('arrow')}</button>`}</div></article>`; }).join('')}</div>`
    : emptyState(tab === 'active' ? 'book' : 'award', tab === 'active' ? 'No courses in progress' : 'No completed courses yet', tab === 'active' ? 'Enroll in a course to start learning.' : 'Finish every lesson and quiz in a course to earn an on-chain certificate.', '<a class="btn btn-primary" href="#courses">Explore courses</a>')}`);
});
ACT.tab = el => { UI.tab[el.dataset.k] = el.dataset.v; render(); };

/* ================= Goals ================= */
route(/^goals$/, () => {
  const g = need(['student']); if (g) return g;
  const u = me(); const goals = S.goals.filter(x => x.userId === u.id);
  return appShell('goals', ['My workspace', 'Learning goals'], `<div class="page-h"><div><h1>Learning goals</h1><p>Small, specific goals keep you moving.</p></div><button class="btn btn-primary" data-act="goalNew">${ic('plus')}Add a goal</button></div>
  <section class="card card-pad">${goals.length ? goals.map(gl => `<div class="row">${goalRow(gl).replace('class="goal"', 'class="goal" style="flex:1"')}<button class="iconbtn" data-act="goalDel" data-id="${gl.id}" aria-label="Delete goal">${ic('trash')}</button></div>`).join('') : emptyState('target', 'No goals yet', 'Add a weekly hours goal or pick a course to finish.')}</section>`);
});
ACT.goalNew = () => {
  const u = me(); const ens = S.enrollments.filter(e => e.userId === u.id && !e.completedAt);
  openModal({title:'Add a learning goal', body:`<form class="stack" id="goalf"><div class="field"><label for="gk">Goal type</label><select class="ti" id="gk"><option value="hours">Study hours this week</option><option value="lessons">Lessons this week</option><option value="module">Finish the current module of a course</option><option value="course">Finish a course</option></select></div>
    <div class="field" id="gtw"><label for="gt">Target</label><input class="ti" id="gt" type="number" min="1" value="5"></div>
    <div class="field hidden" id="gcw"><label for="gc">Course</label><select class="ti" id="gc">${ens.map(e => `<option value="${e.courseId}">${esc(courseById(e.courseId).title)}</option>`).join('')}</select></div>
    <div class="field"><label for="gd">Due date</label><input class="ti" id="gd" type="date" value="${dayKey(daysAgo(-7))}" required></div></form>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-primary" id="gsave">Add goal</button>`});
  const sync = () => { const k = $('#gk').value; $('#gtw').classList.toggle('hidden', !['hours', 'lessons'].includes(k)); $('#gcw').classList.toggle('hidden', ['hours', 'lessons'].includes(k)); };
  $('#gk').onchange = sync;
  $('#gsave').onclick = async () => { const k = $('#gk').value; const t = +$('#gt').value; const cid = $('#gc').value; const c = courseById(cid);
    if (['module', 'course'].includes(k) && !c) { toast('Enroll in a course first.', 'err'); return; }
    const title = k === 'hours' ? `Reach ${t} study hours this week` : k === 'lessons' ? `Complete ${t} lessons this week` : k === 'module' ? `Finish the current module of ${c.title}` : `Earn your ${c.title} certificate`;
    if (!$('#gd').value) { toast('Choose a due date.', 'err'); return; } if (!(await mutate('POST', '/me/goals', {title, kind:k, target:t || 0, courseId:['module', 'course'].includes(k) ? cid : null, due:new Date($('#gd').value + 'T12:00:00').toISOString()}))) return; closeModal(); toast('Goal added.'); render(); };
};
ACT.goalDel = async el => { if (await mutate('DELETE', '/me/goals/' + el.dataset.id)) render(); };

/* ================= Saved resources ================= */
route(/^saved$/, () => {
  const g = need(['student']); if (g) return g;
  const u = me(); const list = S.saved.filter(s => s.userId === u.id); const notes = Object.entries(S.notes).filter(([k]) => k.startsWith(u.id + '|'));
  return appShell('saved', ['My workspace', 'Saved resources'], `<div class="page-h"><div><h1>Saved resources</h1><p>Bookmarked lessons and your notes in one place.</p></div></div>
  <div class="grid g2"><section class="card card-pad"><h3 style="margin-bottom:10px">Bookmarked lessons</h3>${list.length ? list.map(s => { const c = courseById(s.courseId); const l = lessonsOf(c).find(x => x.id === s.lessonId); return `<a class="row" style="padding:12px 0;border-top:1px solid var(--line);color:inherit" href="#learn-${c.id}-${l.id}"><span class="ic ic-blue" style="width:34px;height:34px">${ic('bookmarkf')}</span><span style="flex:1"><b class="small">${esc(l.title)}</b><span class="xs muted" style="display:block">${esc(c.title)}</span></span>${ic('chevR').replace('<svg','<svg style="width:16px;height:16px;color:var(--muted)"')}</a>`; }).join('') : '<p class="small muted">Use Bookmark in any lesson to save it here.</p>'}</section>
  <section class="card card-pad"><h3 style="margin-bottom:10px">My notes</h3>${notes.length ? notes.map(([k, v]) => { const [, cid, lid] = k.split('|'); const c = courseById(cid); const l = c && lessonsOf(c).find(x => x.id === lid); return l ? `<div style="padding:12px 0;border-top:1px solid var(--line)"><a href="#learn-${cid}-${lid}" class="small" style="font-weight:600">${esc(l.title)}</a><p class="small muted" style="white-space:pre-wrap;margin-top:4px">${esc(v.slice(0, 280))}</p></div>` : ''; }).join('') : '<p class="small muted">Notes you write in lessons appear here.</p>'}</section></div>`);
});

/* ================= AI companion page ================= */
route(/^companion$/, () => {
  const g = need(); if (g) return g;
  UI.noFab = true; onMount(drawChat);
  return appShell('companion', ['My workspace', 'AI study companion'], `<div class="page-h"><div><h1>AI study companion</h1><p>Ask about any concept, get a study plan, or find your next course.</p></div></div>
  <section class="card" style="display:flex;flex-direction:column;height:min(640px,calc(100vh - 220px))"><div class="row" style="padding:16px 20px;border-bottom:1px solid var(--line)"><span class="ic ic-blue">${ic('bot')}</span><div><b>AI Learning Assistant</b><div class="xs" style="color:var(--green)">● Online · Here to help you grow</div></div></div>
    <div class="chat-log" style="flex:1"></div><form class="chat-in" data-form="chat"><label class="sr" for="cpq">Message</label><input id="cpq" placeholder="Ask me anything about learning…" autocomplete="off"><button class="btn btn-primary" aria-label="Send">${ic('send')}</button></form></section>`);
});

/* ================= Account ================= */
route(/^account$/, () => {
  const g = need(); if (g) return g;
  const u = me();
  return appShell('account', ['My workspace', 'Account'], `<div class="page-h"><div><h1>Account</h1><p>Your profile, wallet and preferences.</p></div></div>
  <div class="grid g2"><form class="card card-pad stack" data-form="profile"><h3>Profile</h3>
    <div class="field"><label for="pn">Full name (as on certificates)</label><input class="ti" id="pn" name="name" value="${esc(u.name)}" required></div>
    <div class="field"><label for="pe">Email</label><input class="ti" id="pe" value="${esc(u.email)}" disabled></div>
    ${u.role !== 'admin' ? `<div class="field"><label for="pu">University</label><select class="ti" id="pu" name="university">${UNIVERSITIES.map(([n]) => `<option ${u.university === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>
    <div class="field"><label for="pf">Field of study</label><select class="ti" id="pf" name="field">${FIELDS.map(n => `<option ${u.field === n ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select></div>` : ''}
    ${u.role === 'instructor' ? `<div class="field"><label for="pt">Title</label><input class="ti" id="pt" name="title" value="${esc(u.title || '')}"></div><div class="field"><label for="pb">Bio</label><textarea class="ta" id="pb" name="bio">${esc(u.bio || '')}</textarea></div>` : ''}
    <button class="btn btn-primary" style="align-self:flex-start">Save profile</button><p class="xs muted">Name changes apply to new certificates. Issued certificates keep the name they were signed with.</p></form>
  <div class="stack"><section class="card card-pad"><h3>Wallet</h3><p class="small muted" style="margin:6px 0 12px">Created automatically for you. Certificates are minted to this address.</p><div class="hashbox"><small>WALLET ADDRESS</small><span class="mono">${u.wallet}</span></div>
    ${u.role === 'student' ? `<label class="check" style="margin-top:14px"><input type="checkbox" data-act="walletPub" ${u.walletPublic ? 'checked' : ''}> Show my Achievement wallet publicly</label><a class="link small" style="margin-top:10px" href="#wallet-${u.handle}">Open my wallet ${ic('arrow')}</a>` : ''}</section>
    <section class="card card-pad"><h3>Appearance</h3><div class="row" style="margin-top:12px"><button class="btn btn-plain" data-act="theme">${ic(isDark() ? 'sun' : 'moon')}Switch to ${isDark() ? 'light' : 'dark'} mode</button></div></section>
    <section class="card card-pad"><h3>Demo data</h3><p class="small muted" style="margin:6px 0 12px">Reset the prototype to its original courses, accounts and ledger. This signs you out.</p><button class="btn btn-danger" data-act="resetDemo">${ic('refresh')}Reset demo data</button></section></div></div>`);
});
FORMS.profile = async f => { const u = me(); const d = Object.fromEntries(new FormData(f)); if (!d.name || d.name.trim().length < 3) { toast('Enter your full name.', 'err'); return; } if (!(await mutate('PATCH', '/me/profile', {...d, name:d.name.trim()}))) return; toast('Profile saved.'); render(); };
ACT.walletPub = async el => { if (!(await mutate('PATCH', '/me/wallet', {walletPublic:el.checked}))) return; toast(el.checked ? 'Your wallet is public.' : 'Your wallet is now private.'); };
ACT.resetDemo = () => confirmBox('Reset demo data?', 'All accounts, progress and certificates on this server will be replaced by the original demo data, and the certificates re-anchored on-chain.', 'Reset', async () => { $('#root').innerHTML = '<div class="splash"><span class="spin"></span></div>'; await resetDemo(); toast('Demo data reset.'); go('home'); render(); }, true);

/* ---- web3.js ---- */
/* ================= QR helpers ================= */
const verifyUrl = id => location.origin + '/verify/' + id;
function qrSvg(text, cell = 4) {
  if (typeof qrcode !== 'function') return `<div class="mono" style="width:132px;height:132px;display:grid;place-items:center;text-align:center;color:#333">${esc(text.split('#').pop())}</div>`;
  const q = qrcode(0, 'M'); q.addData(text); q.make(); const n = q.getModuleCount(); let d = '';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c},${r}h1v1h-1z`;
  return `<svg viewBox="-2 -2 ${n + 4} ${n + 4}" role="img" aria-label="QR code for certificate verification" shape-rendering="crispEdges"><rect x="-2" y="-2" width="${n + 4}" height="${n + 4}" fill="#fff"/><path d="${d}" fill="#111"/></svg>`;
}
async function decodeQrFile(file) {
  const bmp = await createImageBitmap(file);
  if ('BarcodeDetector' in window) { try { const r = await new BarcodeDetector({formats:['qr_code']}).detect(bmp); if (r[0]) return r[0].rawValue; } catch (e) {} }
  if (typeof jsQR === 'function') { const cv = document.createElement('canvas'); const s = Math.min(1, 1200 / Math.max(bmp.width, bmp.height)); cv.width = bmp.width * s; cv.height = bmp.height * s; const x = cv.getContext('2d'); x.drawImage(bmp, 0, 0, cv.width, cv.height); const d = x.getImageData(0, 0, cv.width, cv.height); const r = jsQR(d.data, cv.width, cv.height); if (r) return r.data; }
  return null;
}

/* ================= Certificate visual ================= */
function certVisual(cert) {
  return `<div class="cert" id="certcard">
    <div class="row between" style="align-items:flex-start;gap:20px;flex-wrap:wrap">
      <div>${brand()}<div class="eyebrow" style="margin-top:28px">CERTIFICATE OF COMPLETION</div>
        <p class="muted" style="margin-top:14px">This certifies that</p><div class="name">${esc(cert.studentName)}</div>
        <p class="muted">has successfully completed</p><h2>${esc(cert.courseTitle)}</h2>
        <p class="small muted" style="margin-top:10px">Taught by ${esc(cert.instructorName)} · Final score ${cert.score}% · Issued ${fmtDate(cert.issuedAt, {month:'long', day:'numeric', year:'numeric'})}</p>
        <div style="margin-top:14px">${(cert.skills || []).map(s => `<span class="skill">${esc(s)}</span>`).join('')}</div></div>
      <div style="text-align:center"><div class="qr">${qrSvg(verifyUrl(cert.id))}</div><div class="xs muted" style="margin-top:8px">Scan to verify</div></div>
    </div>
    <div class="grid g3" style="margin-top:26px;gap:12px">
      <div class="hashbox"><small>CERTIFICATE ID</small><span class="mono">${cert.id}</span></div>
      <div class="hashbox"><small>ISSUER</small><span class="small">${esc(cert.issuer?.name)}</span></div>
      <div class="hashbox"><small>ON-CHAIN</small><span class="mono">Block #${cert.blockIndex} · ${short(cert.blockHash, 8)}</span></div>
    </div>
    <div class="hashbox" style="margin-top:12px"><small>SHA-256 FINGERPRINT</small><span class="mono">${cert.hash}</span></div>
    ${cert.status === 'revoked' ? `<div class="note red" style="margin-top:12px">${ic('ban')}Revoked ${fmtDate(cert.revokedAt)} · ${esc(cert.revokeReason || '')}</div>` : ''}
  </div>`;
}
function certSvgFile(cert) {
  const x = s => esc(s);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="990" viewBox="0 0 1400 990" font-family="Inter, Helvetica, Arial, sans-serif">
<rect width="1400" height="990" fill="#F7F8FC"/><rect x="40" y="40" width="1320" height="910" rx="28" fill="#fff" stroke="#E4E7EF"/><rect x="60" y="60" width="1280" height="870" rx="20" fill="none" stroke="#EEF2FF" stroke-width="3"/>
<rect x="110" y="110" width="56" height="56" rx="14" fill="#3157D5"/><text x="186" y="149" font-size="30" font-weight="700" fill="#16213E">Learning Hub</text>
<text x="110" y="250" font-size="20" font-weight="700" fill="#3157D5" letter-spacing="2">CERTIFICATE OF COMPLETION</text>
<text x="110" y="315" font-size="24" fill="#64748B">This certifies that</text><text x="110" y="395" font-size="64" font-weight="800" fill="#3157D5">${x(cert.studentName)}</text>
<text x="110" y="455" font-size="24" fill="#64748B">has successfully completed</text><text x="110" y="520" font-size="44" font-weight="800" fill="#16213E">${x(cert.courseTitle)}</text>
<text x="110" y="575" font-size="20" fill="#64748B">Taught by ${x(cert.instructorName)} · Final score ${cert.score}% · Issued ${x(fmtDate(cert.issuedAt, {month:'long', day:'numeric', year:'numeric'}))}</text>
<text x="110" y="700" font-size="16" fill="#64748B">CERTIFICATE ID</text><text x="110" y="728" font-size="22" font-family="monospace" fill="#16213E">${cert.id}</text>
<text x="110" y="780" font-size="16" fill="#64748B">SHA-256 FINGERPRINT</text><text x="110" y="808" font-size="17" font-family="monospace" fill="#16213E">${cert.hash}</text>
<text x="110" y="860" font-size="16" fill="#64748B">Issuer ${x(cert.issuer?.name)} · ${x(cert.issuer?.did)} · Block #${cert.blockIndex}</text>
${qrSvg(verifyUrl(cert.id)).replace(/^<svg /, '<svg x="1040" y="110" width="224" height="224" ')}
<text x="1152" y="370" font-size="16" fill="#64748B" text-anchor="middle">Scan to verify</text></svg>`;
}

/* ================= My certificates ================= */
route(/^certificates$/, () => {
  const g = need(['student']); if (g) return g;
  const u = me(); const list = S.certs.filter(c => c.studentId === u.id).sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  return appShell('certificates', ['My workspace', 'My certificates'], `<div class="page-h"><div><h1>My certificates</h1><p>Each certificate is signed by the issuer and anchored on the Learning Hub ledger.</p></div><a class="btn btn-outline" href="#wallet-${u.handle}">${ic('wallet')}Open my wallet</a></div>
  ${list.length ? `<div class="grid g2">${list.map(c => `<article class="card card-pad"><div class="row between"><span class="ic ic-purple">${ic('award')}</span>${c.status === 'valid' ? `<span class="pill p-green">${ic('shieldck')}Verified on-chain</span>` : '<span class="pill p-red">Revoked</span>'}</div>
    <h3 style="margin:14px 0 4px;font-size:19px">${esc(c.courseTitle)}</h3><p class="small muted">Issued ${fmtDate(c.issuedAt)} · Score ${c.score}% · Block #${c.blockIndex}</p>
    <div class="hashbox" style="margin:14px 0"><small>CERTIFICATE ID</small><span class="mono">${c.id}</span></div>
    <div class="row wrapf"><a class="btn btn-primary btn-sm" href="#cert-${c.id}">View certificate</a><a class="btn btn-plain btn-sm" href="#verify-${c.id}">${ic('shieldck')}Verify</a><button class="btn btn-ghost btn-sm" data-act="copyLink" data-id="${c.id}">${ic('link')}Copy link</button></div></article>`).join('')}</div>`
    : emptyState('award', 'No certificates yet', 'Complete every lesson and pass each quiz in a course to earn your first on-chain certificate.', '<a class="btn btn-primary" href="#my-learning">Continue learning</a>')}`);
});
ACT.copyLink = el => { const t = verifyUrl(el.dataset.id); navigator.clipboard?.writeText(t).then(() => toast('Verification link copied.')).catch(() => openModal({title:'Verification link', body:`<input class="ti mono" readonly value="${esc(t)}">`})); };

/* ================= Certificate detail (public) ================= */
route(/^cert-([A-Z0-9-]+)$/, id => {
  const cert = S.certs.find(c => c.id === id);
  if (!cert) { setTimeout(() => go('verify-' + id)); return ''; }
  const u = me(); const own = u && u.id === cert.studentId;
  const body = `<div class="page-h"><div><div class="row">${cert.status === 'valid' ? `<span class="pill p-green">${ic('shieldck')}Verified on-chain</span>` : '<span class="pill p-red">Revoked</span>'}<span class="pill p-gray">Block #${cert.blockIndex}</span></div><h1 style="margin-top:10px">${esc(cert.courseTitle)}</h1><p>Certificate ${cert.id}</p></div>
    <div class="row wrapf"><a class="btn btn-primary" href="#verify-${cert.id}">${ic('shieldck')}Verify now</a><button class="btn btn-plain" data-act="dlCert" data-id="${cert.id}">${ic('download')}Download</button><button class="btn btn-plain" data-act="copyLink" data-id="${cert.id}">${ic('link')}Copy link</button></div></div>
    ${certVisual(cert)}
    <section class="card card-pad" style="margin-top:20px"><h3>On-chain record</h3><div class="grid g2" style="margin-top:14px;gap:12px">
      <div class="hashbox"><small>TRANSACTION HASH</small><span class="mono">${cert.txHash}</span></div><div class="hashbox"><small>BLOCK HASH</small><span class="mono">${cert.blockHash}</span></div>
      <div class="hashbox"><small>RECIPIENT WALLET</small><span class="mono">${cert.studentWallet}</span></div><div class="hashbox"><small>ISSUER DID</small><span class="mono">${esc(cert.issuer?.did)}</span></div></div>
      <div class="hashbox" style="margin-top:12px"><small>ISSUER SIGNATURE (ECDSA P-256)</small><span class="mono">${cert.signature}</span></div></section>`;
  if (own) return appShell('certificates', ['My certificates', cert.id], body);
  return publicPage('', `<section class="section" style="padding-top:36px"><div class="wrap" style="max-width:1000px">${body}<p class="small muted" style="margin-top:16px">Held by <a href="#wallet-${esc(cert.studentHandle)}">${esc(cert.studentName)}</a></p></div></section>`);
});
ACT.dlCert = el => { const c = S.certs.find(x => x.id === el.dataset.id); offerFile(`${c.id}.svg`, certSvgFile(c), 'image/svg+xml'); };

/* ================= Verification portal (public) ================= */
route(/^verify(?:-([A-Z0-9-]+))?$/, id => {
  if (id) onMount(() => runVerify(id));
  const samples = S.certs.slice(-4).reverse();
  const u = me();
  const inner = `<div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:28px;align-items:start" id="vgrid">
    <div class="stack"><section class="card card-pad"><h3>Check a certificate</h3><p class="small muted" style="margin:6px 0 16px">Enter the certificate ID printed on the certificate, or upload a photo of its QR code.</p>
      <form data-form="verify" class="stack"><div class="input">${ic('search')}<label class="sr" for="vid">Certificate ID</label><input id="vid" placeholder="LH-2026-XXXXXX" value="${esc(id || '')}" autocomplete="off" style="text-transform:uppercase"></div>
        <button class="btn btn-primary btn-lg btn-block">${ic('shieldck')}Verify certificate</button></form>
      <div class="divider">or</div>
      <label class="btn btn-plain btn-lg btn-block" style="cursor:pointer">${ic('qr')}Upload QR code image<input type="file" accept="image/*" id="qrfile" class="sr"></label></section>
      <section class="card card-pad"><h3 style="font-size:16px">Recently issued</h3><p class="xs muted" style="margin:4px 0 10px">Try one of these to see verification in action.</p>${samples.map(c => `<a href="#verify-${c.id}" class="row" style="padding:9px 0;border-top:1px solid var(--line);color:inherit"><span class="mono" style="flex:none">${c.id}</span><span class="small muted" style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(c.courseTitle)}</span>${c.status === 'revoked' ? '<span class="pill p-red">Revoked</span>' : ''}</a>`).join('')}</section>
      <section class="card card-pad"><h3 style="font-size:16px">How verification works</h3><ol class="small muted" style="padding-left:18px;margin:10px 0 0;line-height:1.8"><li>Recompute the certificate’s SHA-256 fingerprint from its details.</li><li>Check the issuer’s ECDSA (secp256k1) signature on that fingerprint.</li><li>Confirm the fingerprint is in a valid block on the ledger.</li><li>Compare it with the CertificateRegistry smart contract.</li><li>Check that no revocation was recorded.</li></ol></section></div>
    <div id="vresult">${id ? '' : `<section class="card card-pad" style="min-height:380px;display:grid;place-items:center">${emptyState('shieldck', 'Results appear here', 'Verification runs entirely in your browser—no need to contact the issuing institution.')}</section>`}</div></div>`;
  onMount(() => { const f = $('#qrfile'); if (f) f.onchange = async () => { const file = f.files[0]; if (!file) return; toast('Reading QR code…', 'info'); const t = await decodeQrFile(file); const m = t && t.match(/LH-\d{4}-[A-Z0-9]{6}/); if (m) go('verify-' + m[0]); else toast('We couldn’t read a Learning Hub QR code in that image. Try a sharper photo or type the ID.', 'err'); f.value = ''; }; });
  const head = `<div class="page-h"><div><h1>Verify a certificate</h1><p>Instant, independent verification for employers, universities and anyone else.</p></div></div>`;
  if (u) return appShell('verify', ['Verification', 'Verify a certificate'], head + inner);
  return publicPage('', `<section class="hero" style="padding:40px 0"><div class="wrap"><span class="badge-chip">${ic('shieldck').replace('<svg','<svg style="width:15px;height:15px"')}TRUSTED BY EMPLOYERS</span><h1 style="font-size:clamp(32px,4vw,46px);font-weight:800;margin:14px 0 8px">Verify a certificate</h1><p class="muted" style="font-size:17px;max-width:620px">Every Learning Hub certificate can be checked in seconds—no phone calls, no emails, no waiting.</p></div></section><section class="section" style="padding-top:28px"><div class="wrap">${inner}</div></section>`);
});
FORMS.verify = f => { const v = $('#vid').value.trim().toUpperCase(); if (!/^LH-\d{4}-[A-Z0-9]{6}$/.test(v)) { toast('Certificate IDs look like LH-2026-AB12CD.', 'err'); return; } go('verify-' + v); };

async function runVerify(id, tampered) {
  const box = $('#vresult'); if (!box) return;
  box.innerHTML = `<section class="card card-pad"><div class="row"><span class="spin"></span><span class="muted">Looking up ${esc(id)} in the registry…</span></div></section>`;
  let srv = null;
  try { srv = await api('GET', '/verify/' + encodeURIComponent(id)); }
  catch (e) { if (e.status !== 404) { box.innerHTML = `<section class="verdict v-warn"><span class="ic" style="background:var(--surface)">${ic('alert')}</span><div><h3>Verification service unavailable</h3><p class="small">${esc(e.message)}</p></div></section>`; return; } }
  if (!$('#vresult')) return;
  const rec = srv?.record || null, block = srv?.block || null, revocation = srv?.revocation || null, onchain = srv?.onchain || null;
  const source = onchain?.configured ? `ledger + ${onchain.network || 'EVM chain'}` : 'Learning Hub ledger';
  if (!rec) { box.innerHTML = `<section class="verdict v-bad">${'<span class="ic" style="background:var(--surface)">' + ic('x') + '</span>'}<div><h3>Certificate not found</h3><p class="small">No certificate with ID ${esc(id)} exists on the Learning Hub ledger. Check the ID for typos—a forged certificate also shows this result.</p></div></section>`; return; }
  const subject = tampered || rec;
  const cards = ['Recompute fingerprint', 'Check issuer signature', 'Find block on ledger', ...(onchain?.configured ? ['Read smart contract'] : []), 'Check revocation'];
  box.innerHTML = `<section class="card card-pad"><div class="row between"><h3>${tampered ? 'Tamper test' : 'Verification'} · <span class="mono">${esc(id)}</span></h3><span class="xs muted">Source: ${source}</span></div><div class="checklist" id="cks" style="margin-top:8px">${cards.map(t => `<div class="ck run"><span class="st"><span class="spin" style="width:13px;height:13px"></span></span><div><b>${t}</b><small>Checking…</small></div></div>`).join('')}</div></section>`;
  const res = await verifyRecord(subject, {block, revocation, onchain});
  const els = $$('#cks .ck');
  for (let i = 0; i < res.steps.length; i++) {
    await new Promise(r => setTimeout(r, 380)); const s = res.steps[i]; if (!els[i]) return;
    els[i].className = 'ck ' + (s.ok === null ? 'run' : s.ok ? 'ok' : 'bad'); els[i].innerHTML = `<span class="st">${ic(s.ok === null ? 'clock' : s.ok ? 'check' : 'x')}</span><div><b>${esc(s.title)}</b><small>${s.html ? s.detail : esc(s.detail)}</small></div>`;
  }
  await new Promise(r => setTimeout(r, 250)); if (!$('#vresult')) return;
  const V = {valid:['v-ok', 'shieldck', 'Authentic certificate', `Issued by ${rec.issuer?.name} to ${subject.studentName} for completing ${subject.courseTitle} on ${fmtDate(rec.issuedAt)}.`],
    revoked:['v-warn', 'ban', 'Certificate revoked', 'This certificate was genuine but the issuer has revoked it. It should not be accepted.'],
    invalid:['v-bad', 'alert', tampered ? 'Tampering detected' : 'Verification failed', tampered ? 'The edited details no longer match the fingerprint that was signed and recorded on-chain. A forged copy can’t pass.' : 'This record doesn’t match what was signed and recorded on-chain. Don’t accept it.']}[res.verdict];
  box.insertAdjacentHTML('afterbegin', `<section class="verdict ${V[0]}" style="margin-bottom:16px"><span class="ic" style="background:var(--surface)">${ic(V[1])}</span><div style="flex:1"><h3>${V[2]}</h3><p class="small">${esc(V[3])}</p></div></section>`);
  box.insertAdjacentHTML('beforeend', `<section class="card card-pad" style="margin-top:16px"><div class="grid g2" style="gap:12px"><div><small class="muted xs">LEARNER</small><div><b>${esc(subject.studentName)}</b></div></div><div><small class="muted xs">COURSE</small><div><b>${esc(subject.courseTitle)}</b></div></div><div><small class="muted xs">ISSUED</small><div>${fmtDate(subject.issuedAt)}</div></div><div><small class="muted xs">SCORE</small><div>${subject.score}%</div></div></div>
    <div class="row wrapf" style="margin-top:18px">${!tampered ? `<button class="btn btn-plain btn-sm" data-act="tamper" data-id="${esc(id)}">${ic('pencil')}Run a tamper test</button>` : `<button class="btn btn-plain btn-sm" data-act="reverify" data-id="${esc(id)}">${ic('refresh')}Verify the original</button>`}${S.certs.some(c => c.id === id) ? `<a class="btn btn-ghost btn-sm" href="#cert-${esc(id)}">View certificate</a>` : ''}${rec.studentHandle && S.users.some(u => u.handle === rec.studentHandle) ? `<a class="btn btn-ghost btn-sm" href="#wallet-${esc(rec.studentHandle)}">Learner’s wallet</a>` : ''}</div></section>`);
}
ACT.reverify = el => runVerify(el.dataset.id);
ACT.tamper = el => {
  const rec = S.certs.find(c => c.id === el.dataset.id) || null; if (!rec) { toast('Tamper tests run on certificates in this ledger.', 'info'); return; }
  openModal({title:'Tamper test', body:`<p class="small muted" style="margin-bottom:14px">Edit any detail to simulate a forged copy. Nothing is saved—we’ll just re-run verification on your edited version.</p>
    <div class="stack"><div class="field"><label for="tn">Learner name</label><input class="ti" id="tn" value="${esc(rec.studentName)}"></div><div class="field"><label for="tc">Course title</label><input class="ti" id="tc" value="${esc(rec.courseTitle)}"></div><div class="field"><label for="ts">Score (%)</label><input class="ti" id="ts" type="number" value="${rec.score}"></div></div>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-primary" id="trun">Verify edited copy</button>`});
  $('#trun').onclick = () => { const t = {...rec, studentName:$('#tn').value, courseTitle:$('#tc').value, score:+$('#ts').value}; closeModal(); runVerify(rec.id, t); };
};

/* ================= Digital Achievement Wallet (public) ================= */
route(/^wallet-([a-z0-9-]+)$/, handle => {
  const w = S.users.find(u => u.handle === handle); const viewer = me(); const own = viewer && w && viewer.id === w.id;
  if (!w || w.role !== 'student') return publicPage('', `<section class="section"><div class="wrap" style="max-width:560px">${emptyState('wallet', 'Wallet not found', 'Check the link and try again.', '<a class="btn btn-primary" href="#verify">Verify a certificate</a>')}</div></section>`);
  if (!w.walletPublic && !own && viewer?.role !== 'admin') return publicPage('', `<section class="section"><div class="wrap" style="max-width:560px">${emptyState('lock', 'This wallet is private', 'The learner has chosen not to share it publicly. Ask them for a certificate link instead.')}</div></section>`);
  const certs = S.certs.filter(c => c.studentId === w.id).sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  const valid = certs.filter(c => c.status === 'valid'); const badges = badgesOf(w); const skills = skillsOf(w);
  const ens = S.enrollments.filter(e => e.userId === w.id); const lessons = w.lessonsDone ?? ens.reduce((a, e) => a + doneCount(e), 0);
  const body = `<section class="wallet-hero">${avatar(w, 'xl')}<div style="flex:1;min-width:240px"><div class="xs" style="opacity:.8;letter-spacing:.06em">DIGITAL ACHIEVEMENT WALLET</div><h1 style="margin:6px 0">${esc(w.name)}</h1><p style="opacity:.9">${esc([w.academic, w.field, w.university].filter(Boolean).join(' · '))}</p>
      <div class="row wrapf" style="margin-top:14px"><span class="addr">${ic('wallet').replace('<svg','<svg style="width:14px;height:14px"')}<span class="mono" style="color:#fff">${short(w.wallet, 12)}</span></span><span class="addr">${ic('pin').replace('<svg','<svg style="width:14px;height:14px"')}${esc(w.city || 'Ethiopia')}</span></div></div>
      <div class="row" style="gap:28px;text-align:center"><div><b style="font-size:30px;display:block">${valid.length}</b><span class="xs">Certificates</span></div><div><b style="font-size:30px;display:block">${badges.filter(b => b.earned).length}</b><span class="xs">Badges</span></div><div><b style="font-size:30px;display:block">${lessons}</b><span class="xs">Lessons</span></div></div></section>
    ${own ? `<div class="note blue" style="margin-top:16px">${ic('link')}<span style="flex:1">This is your public wallet${w.walletPublic ? '' : ' (currently private)'}. Share the link with employers—every certificate can be verified in one click.</span><button class="btn btn-sm btn-primary" data-act="copyWallet">Copy wallet link</button></div>` : ''}
    <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);margin-top:20px" id="wgrid">
      <section class="card card-pad"><div class="row between"><h3>Certificates</h3><span class="small muted">${plural(valid.length, 'verified credential')}</span></div>
        ${certs.length ? certs.map(c => `<div class="row" style="padding:14px 0;border-top:1px solid var(--line);margin-top:10px"><span class="ic ${c.status === 'valid' ? 'ic-purple' : 'ic-pink'}">${ic('award')}</span><div style="flex:1;min-width:0"><b>${esc(c.courseTitle)}</b><div class="xs muted">${fmtDate(c.issuedAt)} · Score ${c.score}% · <span class="mono">${c.id}</span></div></div>${c.status === 'valid' ? `<a class="btn btn-sm btn-soft" href="#verify-${c.id}">${ic('shieldck')}Verify</a>` : '<span class="pill p-red">Revoked</span>'}</div>`).join('') : '<p class="small muted" style="margin-top:12px">No certificates yet.</p>'}</section>
      <div class="stack"><section class="card card-pad"><h3>Badges</h3><div class="miles" style="grid-template-columns:repeat(3,1fr);margin-top:16px;row-gap:18px">${badges.map(b => `<div title="${esc(b.desc)}"><div class="hex ${b.earned ? b.tone : 'h-lock'}" style="width:52px;height:56px">${ic(b.earned ? b.icon : 'lock')}</div><b style="font-size:12px">${b.title}</b></div>`).join('')}</div></section>
        <section class="card card-pad"><h3>Verified skills</h3><div style="margin-top:14px">${skills.length ? skills.map(([s, n]) => `<span class="skill">${esc(s)}${n > 1 ? `<b>×${n}</b>` : ''}</span>`).join('') : '<p class="small muted">Skills appear here as certificates are earned.</p>'}</div></section></div></div>`;
  if (own) return appShell('wallet-' + handle, ['My workspace', 'Achievement wallet'], body);
  return publicPage('', `<section class="section" style="padding-top:36px"><div class="wrap">${body}</div></section>`);
});
ACT.copyWallet = () => { const t = location.href; navigator.clipboard?.writeText(t).then(() => toast('Wallet link copied.')).catch(() => toast('Copy the link from the address bar.', 'info')); };

/* ---- instructor.js ---- */
/* ================= Shared chart helper ================= */
function barChart(data, {height = 160, unit = '', highlightLast = false} = {}) {
  const max = Math.max(1, ...data.map(d => d.value));
  return `<div style="margin-top:16px"><div class="bars" style="height:${height}px" role="img" aria-label="Bar chart">${data.map((d, i) => `<div class="b ${highlightLast && i === data.length - 1 ? 'on' : ''}" title="${esc(d.label)}: ${d.value}${unit}"><span>${d.value}${unit}</span><i style="height:${d.value / max * 85}%"></i></div>`).join('')}</div>
    <div class="xax" style="grid-column:auto">${data.map(d => `<span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(d.label)}</span>`).join('')}</div></div>`;
}
const kpi = (icon, label, value, sub, tone = 'ic-blue') => `<div class="card kpi"><span class="ic ${tone}">${ic(icon)}</span><div><small>${label}</small><b>${value}</b><span class="s">${sub}</span></div></div>`;
function weeklyCounts(dates, weeks = 8) {
  const out = []; for (let w = weeks - 1; w >= 0; w--) { const end = daysAgo(w * 7), start = daysAgo(w * 7 + 7); out.push({label:fmtDate(start, {month:'short', day:'numeric'}), value:dates.filter(d => new Date(d) > start && new Date(d) <= end).length}); } return out;
}

/* ================= Instructor overview ================= */
function viewInstructorHome() {
  const u = me(); const cs = S.courses.filter(c => c.instructor === u.id); const ids = cs.map(c => c.id);
  const ens = S.enrollments.filter(e => ids.includes(e.courseId)); const certs = S.certs.filter(c => ids.includes(c.courseId));
  const avg = ens.length ? Math.round(ens.reduce((a, e) => a + progressOf(e), 0) / ens.length) : 0;
  const recent = ens.flatMap(e => Object.entries(e.done).map(([lid, t]) => ({e, lid, t}))).sort((a, b) => new Date(b.t) - new Date(a.t)).slice(0, 7);
  const quizAvg = (() => { const s = ens.flatMap(e => Object.values(e.quiz).map(q => q.best)); return s.length ? Math.round(s.reduce((a, b) => a + b, 0) / s.length) : 0; })();
  return appShell('instructor', ['Instructor', 'Overview'], `<div class="page-h"><div><h1>Welcome back, ${esc(u.name.replace(/^Dr\.\s*/, '').split(' ')[0])}.</h1><p>Here’s how your learners are doing.</p></div><a class="btn btn-primary" href="#instructor-new">${ic('plus')}Create a course</a></div>
  <div class="grid g4">${kpi('book', 'Your courses', cs.length, `${cs.filter(c => c.published).length} published`)}${kpi('users', 'Enrolled learners', ens.length, `${new Set(ens.map(e => e.userId)).size} unique students`)}${kpi('trend', 'Average progress', avg + '%', `Quiz average ${quizAvg}%`, 'ic-green')}${kpi('award', 'Certificates issued', certs.length, 'Recorded on-chain', 'ic-purple')}</div>
  <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);margin-top:20px" id="ig">
    <section class="card card-pad"><h3>New enrollments</h3><p class="small muted">Last 8 weeks across your courses</p>${barChart(weeklyCounts(ens.map(e => e.enrolledAt)), {highlightLast:true})}</section>
    <section class="card card-pad"><h3>Recent learner activity</h3>${recent.length ? recent.map(({e, lid, t}) => { const s = userById(e.userId); const c = courseById(e.courseId); const l = lessonsOf(c).find(x => x.id === lid); return `<div class="row" style="padding:10px 0;border-top:1px solid var(--line);margin-top:8px">${avatar(s, 'sm')}<div style="min-width:0;flex:1"><div class="small"><b>${esc(s?.name)}</b> completed ${esc(l?.title || 'a lesson')}</div><div class="xs muted">${esc(c.title)} · ${fmtDT(t)}</div></div></div>`; }).join('') : '<p class="small muted" style="margin-top:12px">No activity yet.</p>'}</section></div>
  <section class="card card-pad" style="margin-top:20px"><div class="row between"><h3>Your courses</h3><a class="link small" href="#instructor-courses">Manage courses ${ic('arrow')}</a></div>${courseTable(cs)}</section>`);
}
route(/^instructor$/, () => need(['instructor']) || viewInstructorHome());
function courseTable(cs, admin = false) {
  if (!cs.length) return emptyState('book', 'No courses yet', 'Create your first course to get started.', '<a class="btn btn-primary" href="#instructor-new">Create a course</a>');
  return `<div class="tablewrap" style="margin-top:12px"><table class="table"><thead><tr><th>Course</th>${admin ? '<th>Instructor</th>' : ''}<th>Status</th><th>Lessons</th><th>Learners</th><th>Avg. progress</th><th>Certificates</th><th></th></tr></thead><tbody>
    ${cs.map(c => { const ens = S.enrollments.filter(e => e.courseId === c.id); const avg = ens.length ? Math.round(ens.reduce((a, e) => a + progressOf(e), 0) / ens.length) : 0;
      return `<tr><td><div class="row"><img src="${imgOf(c)}" alt="" style="width:56px;height:36px;object-fit:cover;border-radius:6px"><div><b>${esc(c.title)}</b><div class="xs muted">${esc(CATS[c.cat]?.[0])} · ${esc(c.level)}</div></div></div></td>${admin ? `<td class="small">${esc(userById(c.instructor)?.name)}</td>` : ''}
        <td>${c.published ? '<span class="pill p-green">Published</span>' : '<span class="pill p-amber">Draft</span>'}${c.featured && admin ? ' <span class="pill p-blue">Featured</span>' : ''}</td><td>${lessonsOf(c).length}</td><td>${ens.length}</td>
        <td style="min-width:120px"><div class="bar"><span style="width:${avg}%"></span></div><span class="xs muted">${avg}%</span></td><td>${S.certs.filter(x => x.courseId === c.id).length}</td>
        <td style="white-space:nowrap">${admin ? `<button class="btn btn-sm btn-plain" data-act="adminPub" data-id="${c.id}">${c.published ? 'Unpublish' : 'Publish'}</button> <button class="btn btn-sm btn-plain" data-act="adminFeat" data-id="${c.id}">${c.featured ? 'Unfeature' : 'Feature'}</button> <button class="btn btn-sm btn-danger" data-act="courseDel" data-id="${c.id}" aria-label="Delete course">${ic('trash')}</button>` : `<a class="btn btn-sm btn-soft" href="#instructor-edit-${c.id}">Edit</a> <a class="btn btn-sm btn-plain" href="#course-${c.id}">View</a>`}</td></tr>`; }).join('')}</tbody></table></div>`;
}
route(/^instructor-courses$/, () => need(['instructor']) || appShell('instructor-courses', ['Instructor', 'My courses'], `<div class="page-h"><div><h1>My courses</h1><p>Create, edit and publish your courses.</p></div><a class="btn btn-primary" href="#instructor-new">${ic('plus')}Create a course</a></div><section class="card card-pad">${courseTable(S.courses.filter(c => c.instructor === me().id))}</section>`));
route(/^instructor-new$/, () => {
  const g = need(['instructor', 'admin']); if (g) return g;
  if (!UI.creating) { UI.creating = true; mutate('POST', '/courses').then(r => { UI.creating = false; if (!r) return; history.replaceState(null, '', '#instructor-edit-' + r.course.id); UI.tab.ed = 'details'; render(); toast('Draft course created. Add details and lessons, then publish.'); }); }
  return appShell('instructor-new', ['Instructor', 'Create a course'], `<section class="card card-pad" style="min-height:300px;display:grid;place-items:center"><div class="row"><span class="spin"></span><span class="muted">Creating your draft course…</span></div></section>`);
});

/* ================= Course editor ================= */
route(/^instructor-edit-(\w+)$/, id => {
  const g = need(['instructor', 'admin']); if (g) return g;
  const c = courseById(id); const u = me(); if (!c || (u.role !== 'admin' && c.instructor !== u.id)) return null;
  const tab = UI.tab.ed || 'details';
  const ens = S.enrollments.filter(e => e.courseId === c.id);
  let body = '';
  if (tab === 'details') body = `<form class="grid" style="grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)" data-form="courseDetails" data-id="${c.id}" id="edgrid">
    <section class="card card-pad stack"><div class="field"><label for="ft">Course title</label><input class="ti" id="ft" name="title" value="${esc(c.title)}" required maxlength="80"></div>
      <div class="field"><label for="fg">Short description</label><textarea class="ta" id="fg" name="tagline" style="min-height:70px" maxlength="220">${esc(c.tagline)}</textarea></div>
      <div class="grid g2" style="gap:14px"><div class="field"><label for="fc">Category</label><select class="ti" id="fc" name="cat">${Object.entries(CATS).map(([k, v]) => `<option value="${k}" ${c.cat === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select></div>
        <div class="field"><label for="fl">Level</label><select class="ti" id="fl" name="level">${['Beginner', 'Intermediate', 'Advanced'].map(l => `<option ${c.level === l ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
      <div class="field"><label for="fa">About this course</label><textarea class="ta" id="fa" name="about" style="min-height:120px" placeholder="One paragraph per line">${esc(c.about.join('\n'))}</textarea></div>
      <div class="field"><label for="fo">What learners will learn</label><textarea class="ta" id="fo" name="outcomes" placeholder="One per line: Outcome — short description">${esc(c.outcomes.map(o => o.join(' — ')).join('\n'))}</textarea></div>
      <div class="field"><label for="fs">Skills recorded on the certificate</label><input class="ti" id="fs" name="skills" value="${esc(c.skills.join(', '))}" placeholder="Comma separated, e.g. Figma, Typography"></div>
      <div class="field"><label for="fb">Before you begin</label><input class="ti" id="fb" name="before" value="${esc(c.before)}"></div></section>
    <div class="stack"><section class="card card-pad"><h3>Publishing</h3><label class="row" style="margin-top:14px;justify-content:space-between"><span><b class="small">Published</b><span class="xs muted" style="display:block">Visible in the catalog and open for enrollment</span></span><span class="sw"><input type="checkbox" name="published" ${c.published ? 'checked' : ''}><span></span></span></label>
      <div class="field" style="margin-top:16px"><label for="fpr">Price in USD (0 = free)</label><input class="ti" id="fpr" name="price" type="number" min="0" max="1000" step="0.01" value="${((c.price || 0) / 100).toFixed(2)}"><span class="hint">Paid courses use Stripe Checkout. Minimum $0.50.</span></div>
      <div class="field" style="margin-top:16px"><label for="fp">Quiz pass mark (%)</label><input class="ti" id="fp" name="passMark" type="number" min="40" max="100" value="${c.passMark}"></div></section>
      <section class="card card-pad"><h3>Cover image</h3><div class="grid" style="grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px">${['design', 'dev', 'data', 'ai', 'web3', 'sql'].map(k => `<label style="cursor:pointer;position:relative"><input type="radio" name="img" value="${k}" ${c.img === k ? 'checked' : ''} class="sr"><img src="${IMG[k]}" alt="${k} cover" style="border-radius:8px;aspect-ratio:1.7;object-fit:cover;outline:${c.img === k ? '3px solid var(--primary)' : '1px solid var(--line)'}" data-act="pickImg" data-k="${k}"></label>`).join('')}</div></section>
      <button class="btn btn-primary btn-lg">Save details</button></div></form>`;
  else if (tab === 'curriculum') body = `<div class="row between" style="margin-bottom:14px"><p class="muted small">${plural(c.modules.length, 'module')} · ${plural(lessonsOf(c).length, 'lesson')} · ${hoursLabel(courseMinutes(c))}. Learners earn the certificate after completing every lesson and passing every quiz.</p><button class="btn btn-primary" data-act="modAdd" data-c="${c.id}">${ic('plus')}Add module</button></div>
    ${c.modules.map((m, mi) => `<section class="card card-pad" style="margin-bottom:14px"><div class="row"><span class="eyebrow">MODULE ${mi + 1}</span><input class="ti" style="flex:1;font-weight:600" value="${esc(m.title)}" aria-label="Module title" data-change="modTitle" data-c="${c.id}" data-m="${m.id}">
      <button class="iconbtn" data-act="modMove" data-c="${c.id}" data-m="${m.id}" data-d="-1" aria-label="Move module up" ${mi === 0 ? 'disabled' : ''}>${ic('up')}</button><button class="iconbtn" data-act="modMove" data-c="${c.id}" data-m="${m.id}" data-d="1" aria-label="Move module down" ${mi === c.modules.length - 1 ? 'disabled' : ''}>${ic('down')}</button><button class="iconbtn" data-act="modDel" data-c="${c.id}" data-m="${m.id}" aria-label="Delete module">${ic('trash')}</button></div>
      ${m.lessons.map((l, li) => `<div class="builder-l"><span class="ic ${l.type === 'q' ? 'ic-amber' : l.type === 'p' ? 'ic-purple' : 'ic-blue'}" style="width:32px;height:32px">${ic({v:'video', r:'file', p:'pencil', q:'list'}[l.type])}</span><span class="t"><b>${esc(l.title)}</b><span class="xs muted" style="display:block">${{v:'Video', r:'Reading', p:'Practice', q:`Quiz · ${plural(l.quiz?.length || 0, 'question')}`}[l.type]} · ${l.min} min</span></span>
        <button class="iconbtn" data-act="lesMove" data-c="${c.id}" data-m="${m.id}" data-l="${l.id}" data-d="-1" aria-label="Move up" ${li === 0 ? 'disabled' : ''}>${ic('up')}</button><button class="iconbtn" data-act="lesMove" data-c="${c.id}" data-m="${m.id}" data-l="${l.id}" data-d="1" aria-label="Move down" ${li === m.lessons.length - 1 ? 'disabled' : ''}>${ic('down')}</button>
        <button class="btn btn-sm btn-soft" data-act="lesEdit" data-c="${c.id}" data-m="${m.id}" data-l="${l.id}">${l.type === 'q' ? 'Edit quiz' : 'Edit'}</button><button class="iconbtn" data-act="lesDel" data-c="${c.id}" data-m="${m.id}" data-l="${l.id}" aria-label="Delete lesson">${ic('trash')}</button></div>`).join('')}
      <div class="row" style="margin-top:12px"><button class="btn btn-sm btn-plain" data-act="lesAdd" data-c="${c.id}" data-m="${m.id}" data-t="v">${ic('plus')}Lesson</button><button class="btn btn-sm btn-plain" data-act="lesAdd" data-c="${c.id}" data-m="${m.id}" data-t="q">${ic('plus')}Quiz</button></div></section>`).join('')}`;
  else body = `<section class="card card-pad">${progressTable(ens)}</section>`;
  return appShell('instructor-courses', ['Instructor', 'My courses', c.title], `<div class="page-h"><div><div class="row">${c.published ? '<span class="pill p-green">Published</span>' : '<span class="pill p-amber">Draft</span>'}</div><h1 style="margin-top:8px">${esc(c.title)}</h1></div><div class="row"><a class="btn btn-plain" href="#course-${c.id}">${ic('eye')}Preview</a>${!c.published ? `<button class="btn btn-primary" data-act="quickPub" data-id="${c.id}">Publish course</button>` : ''}</div></div>
    <div class="tabs" role="tablist">${[['details', 'Details'], ['curriculum', 'Curriculum & quizzes'], ['students', `Students (${ens.length})`]].map(([k, t]) => `<button role="tab" class="${tab === k ? 'on' : ''}" data-act="tab" data-k="ed" data-v="${k}">${t}</button>`).join('')}</div>${body}`);
});
ACT.pickImg = el => { $$('input[name="img"]').forEach(i => { i.checked = i.value === el.dataset.k; i.nextElementSibling.style.outline = i.checked ? '3px solid var(--primary)' : '1px solid var(--line)'; }); };
FORMS.courseDetails = async f => {
  const c = courseById(f.dataset.id); const d = new FormData(f);
  const title = (d.get('title') || '').trim(); if (title.length < 3) { toast('Add a course title.', 'err'); return; }
  Object.assign(c, {title, tagline:d.get('tagline').trim(), cat:d.get('cat'), level:d.get('level'), before:d.get('before').trim(), passMark:Math.min(100, Math.max(40, +d.get('passMark') || 70)), price:Math.round(Math.max(0, +d.get('price') || 0) * 100), img:d.get('img') || c.img,
    about:d.get('about').split('\n').map(s => s.trim()).filter(Boolean), outcomes:d.get('outcomes').split('\n').map(s => s.trim()).filter(Boolean).map(s => { const [a, ...b] = s.split(/\s+[—–-]\s+/); return [a, b.join(' — ')]; }),
    skills:d.get('skills').split(',').map(s => s.trim()).filter(Boolean)});
  c.hero = c.img === 'design' ? 'courseHero' : c.img;
  const pub = !!d.get('published'); if (pub && !c.published && !canPublish(c)) return; c.published = pub;
  if (await saveCourse(c)) { toast('Course details saved.'); render(); }
};
function canPublish(c) {
  if (!lessonsOf(c).length) { toast('Add at least one lesson before publishing.', 'err'); return false; }
  const bad = lessonsOf(c).find(l => l.type === 'q' && !(l.quiz || []).length); if (bad) { toast(`Add questions to “${bad.title}” before publishing.`, 'err'); return false; }
  return true;
}
ACT.quickPub = async el => { const c = courseById(el.dataset.id); if (!canPublish(c)) return; if (!(await mutate('POST', `/courses/${c.id}/publish`, {published:true}))) return; toast('Course published. It’s now in the catalog.'); render(); };
document.addEventListener('change', e => {
  const el = e.target.closest('[data-change]'); if (!el) return;
  if (el.dataset.change === 'modTitle') { const m = courseById(el.dataset.c).modules.find(x => x.id === el.dataset.m); m.title = el.value.trim() || m.title; saveCourse(courseById(el.dataset.c)).then(r => r && toast('Module renamed.')); }
});
const findMod = el => courseById(el.dataset.c).modules.find(m => m.id === el.dataset.m);
const move = (arr, i, d) => { const j = i + d; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; };
ACT.modAdd = el => { const c = courseById(el.dataset.c); c.modules.push({id:uid('m'), title:'New module', lessons:[]}); render(); saveCourse(c); };
ACT.modMove = el => { const c = courseById(el.dataset.c); move(c.modules, c.modules.findIndex(m => m.id === el.dataset.m), +el.dataset.d); render(); saveCourse(c); };
ACT.modDel = el => { const c = courseById(el.dataset.c); const m = findMod(el); confirmBox('Delete module?', `“${m.title}” and its ${plural(m.lessons.length, 'lesson')} will be removed. Learner progress on those lessons is kept in their history.`, 'Delete module', () => { c.modules = c.modules.filter(x => x.id !== m.id); render(); saveCourse(c); }, true); };
ACT.lesMove = el => { const m = findMod(el); move(m.lessons, m.lessons.findIndex(l => l.id === el.dataset.l), +el.dataset.d); render(); saveCourse(courseById(el.dataset.c)); };
ACT.lesDel = el => { const m = findMod(el); const l = m.lessons.find(x => x.id === el.dataset.l); confirmBox('Delete lesson?', `“${l.title}” will be removed from the course.`, 'Delete lesson', () => { m.lessons = m.lessons.filter(x => x.id !== l.id); render(); saveCourse(courseById(el.dataset.c)); }, true); };
ACT.lesAdd = el => {
  const m = findMod(el); const q = el.dataset.t === 'q';
  const l = q ? {id:uid('l'), type:'q', title:'Check your understanding', min:8, quiz:[{q:'', opts:['', '', '', ''], correct:0, explain:''}]} : {id:uid('l'), type:'v', title:'New lesson', min:10, summary:'', points:[]};
  m.lessons.push(l); saveCourse(courseById(el.dataset.c)); render(); ACT.lesEdit({dataset:{c:el.dataset.c, m:m.id, l:l.id}});
};
ACT.lesEdit = el => {
  const c = courseById(el.dataset.c); const m = findMod(el); const l = m.lessons.find(x => x.id === el.dataset.l);
  if (l.type === 'q') return quizBuilder(c, m, l);
  openModal({title:'Edit lesson', wide:true, body:`<div class="stack"><div class="grid" style="grid-template-columns:2fr 1fr 1fr;gap:14px"><div class="field"><label for="lt">Title</label><input class="ti" id="lt" value="${esc(l.title)}"></div>
    <div class="field"><label for="ly">Type</label><select class="ti" id="ly">${[['v', 'Video'], ['r', 'Reading'], ['p', 'Practice']].map(([k, t]) => `<option value="${k}" ${l.type === k ? 'selected' : ''}>${t}</option>`).join('')}</select></div><div class="field"><label for="lm">Minutes</label><input class="ti" id="lm" type="number" min="1" max="240" value="${l.min}"></div></div>
    <div class="field"><label for="ls">Summary</label><textarea class="ta" id="ls">${esc(l.summary || '')}</textarea></div>
    <div class="field"><label for="lp">Key points or practice steps</label><textarea class="ta" id="lp" placeholder="One per line">${esc((l.points || []).join('\n'))}</textarea><span class="hint">Video lessons show these as slides; practice lessons show them as a checklist.</span></div></div>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-primary" id="lsave">Save lesson</button>`});
  $('#lsave').onclick = async () => { const t = $('#lt').value.trim(); if (!t) { toast('Add a lesson title.', 'err'); return; }
    Object.assign(l, {title:t, type:$('#ly').value, min:Math.max(1, +$('#lm').value || 5), summary:$('#ls').value.trim() || autoSummary(t, c.title), points:$('#lp').value.split('\n').map(s => s.trim()).filter(Boolean)});
    if (!l.points.length) l.points = autoPoints(t); closeModal(); if (await saveCourse(c)) { toast('Lesson saved.'); render(); } };
};
function quizBuilder(c, m, l) {
  let draft = JSON.parse(JSON.stringify(l.quiz || []));
  const draw = () => {
    $('#qb').innerHTML = draft.map((q, i) => `<fieldset class="card" style="padding:16px;margin-bottom:12px;border:1px solid var(--line)"><legend class="sr">Question ${i + 1}</legend><div class="row between"><b>Question ${i + 1}</b><button type="button" class="iconbtn" data-qdel="${i}" aria-label="Remove question">${ic('trash')}</button></div>
      <input class="ti" style="margin:10px 0" placeholder="Question" value="${esc(q.q)}" data-qf="q" data-i="${i}" aria-label="Question ${i + 1} text">
      ${q.opts.map((o, oi) => `<div class="row" style="margin-top:6px"><input type="radio" name="cor${i}" ${q.correct === oi ? 'checked' : ''} data-qc="${i}" data-o="${oi}" aria-label="Mark option ${oi + 1} correct" style="accent-color:var(--green);width:18px;height:18px"><input class="ti" placeholder="Option ${oi + 1}" value="${esc(o)}" data-qf="o" data-i="${i}" data-o="${oi}" aria-label="Option ${oi + 1}"></div>`).join('')}
      <input class="ti" style="margin-top:10px" placeholder="Explanation shown after answering" value="${esc(q.explain)}" data-qf="e" data-i="${i}" aria-label="Explanation"></fieldset>`).join('') || '<p class="muted small">No questions yet.</p>';
  };
  openModal({title:'Quiz builder', wide:true, body:`<div class="grid" style="grid-template-columns:2fr 1fr;gap:14px;margin-bottom:16px"><div class="field"><label for="qt">Quiz title</label><input class="ti" id="qt" value="${esc(l.title)}"></div><div class="field"><label for="qm">Minutes</label><input class="ti" id="qm" type="number" min="1" value="${l.min}"></div></div>
    <p class="xs muted" style="margin-bottom:12px">Select the radio button next to the correct answer. Learners need ${c.passMark}% to pass.</p><div id="qb"></div><button type="button" class="btn btn-plain btn-sm" id="qadd">${ic('plus')}Add question</button>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-primary" id="qsave">Save quiz</button>`});
  draw();
  const qb = $('#qb');
  qb.addEventListener('input', e => { const t = e.target; const i = +t.dataset.i; if (t.dataset.qf === 'q') draft[i].q = t.value; if (t.dataset.qf === 'o') draft[i].opts[+t.dataset.o] = t.value; if (t.dataset.qf === 'e') draft[i].explain = t.value; });
  qb.addEventListener('change', e => { const t = e.target; if (t.dataset.qc !== undefined) draft[+t.dataset.qc].correct = +t.dataset.o; });
  qb.addEventListener('click', e => { const b = e.target.closest('[data-qdel]'); if (b) { draft.splice(+b.dataset.qdel, 1); draw(); } });
  $('#qadd').onclick = () => { draft.push({q:'', opts:['', '', '', ''], correct:0, explain:''}); draw(); };
  $('#qsave').onclick = async () => {
    const clean = draft.map(q => ({...q, q:q.q.trim(), opts:q.opts.map(o => o.trim())}));
    const bad = clean.findIndex(q => !q.q || q.opts.filter(Boolean).length < 2 || !q.opts[q.correct]);
    if (!clean.length) { toast('Add at least one question.', 'err'); return; }
    if (bad >= 0) { toast(`Question ${bad + 1} needs text, at least two options and a correct answer that isn’t blank.`, 'err'); return; }
    clean.forEach(q => { const keep = q.opts.map((o, i) => [o, i]).filter(([o]) => o); q.correct = keep.findIndex(([, i]) => i === q.correct); q.opts = keep.map(([o]) => o); q.explain = q.explain || 'Review this lesson for details.'; });
    Object.assign(l, {title:$('#qt').value.trim() || 'Quiz', min:Math.max(1, +$('#qm').value || 5), quiz:clean}); closeModal(); if (await saveCourse(c)) { toast('Quiz saved.'); render(); }
  };
}

/* ================= Student progress tracking ================= */
function progressTable(ens) {
  if (!ens.length) return emptyState('users', 'No learners yet', 'Once students enroll, their progress shows up here.');
  return `<div class="tablewrap"><table class="table"><thead><tr><th>Student</th><th>Course</th><th>Progress</th><th>Lessons</th><th>Quiz average</th><th>Last active</th><th>Status</th></tr></thead><tbody>
    ${ens.slice().sort((a, b) => progressOf(b) - progressOf(a)).map(e => { const s = userById(e.userId); const c = courseById(e.courseId); const qs = Object.values(e.quiz); const qa = qs.length ? Math.round(qs.reduce((a, q) => a + q.best, 0) / qs.length) : null;
      return `<tr><td><div class="row">${avatar(s, 'sm')}<div><b class="small">${esc(s?.name)}</b><div class="xs muted">${esc(s?.university || '')}</div></div></div></td><td class="small">${esc(c.title)}</td>
        <td style="min-width:130px"><div class="bar ${e.completedAt ? 'green' : ''}"><span style="width:${progressOf(e)}%"></span></div><span class="xs muted">${progressOf(e)}%</span></td><td>${doneCount(e)}/${lessonsOf(c).length}</td>
        <td>${qa === null ? '<span class="muted">—</span>' : `<span class="pill ${qa >= c.passMark ? 'p-green' : 'p-amber'}">${qa}%</span>`}</td><td class="small muted">${e.last ? fmtDate(e.last.at) : '—'}</td>
        <td>${e.certId ? `<a class="pill p-purple" href="#verify-${e.certId}">${ic('award')}Certified</a>` : progressOf(e) ? '<span class="pill p-blue">In progress</span>' : '<span class="pill p-gray">Not started</span>'}</td></tr>`; }).join('')}</tbody></table></div>`;
}
route(/^instructor-students$/, () => {
  const g = need(['instructor']); if (g) return g;
  const cs = S.courses.filter(c => c.instructor === me().id); const f = UI.tab.isc || 'all';
  const ens = S.enrollments.filter(e => cs.some(c => c.id === e.courseId) && (f === 'all' || e.courseId === f));
  return appShell('instructor-students', ['Instructor', 'Student progress'], `<div class="page-h"><div><h1>Student progress</h1><p>Track every learner’s lessons, quiz scores and certificates.</p></div>
    <select class="ti" style="width:auto" aria-label="Filter by course" data-change2="isc">${[['all', 'All courses'], ...cs.map(c => [c.id, c.title])].map(([k, t]) => `<option value="${k}" ${f === k ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select></div>
    <div class="grid g4" style="margin-bottom:20px">${kpi('users', 'Learners', ens.length, 'In this view')}${kpi('trend', 'Average progress', (ens.length ? Math.round(ens.reduce((a, e) => a + progressOf(e), 0) / ens.length) : 0) + '%', 'Across lessons')}${kpi('clock', 'Active this week', ens.filter(e => e.last && new Date(e.last.at) > daysAgo(7)).length, 'Opened a lesson', 'ic-green')}${kpi('award', 'Certified', ens.filter(e => e.certId).length, 'Completed and on-chain', 'ic-purple')}</div>
    <section class="card card-pad">${progressTable(ens)}</section>`);
});
document.addEventListener('change', e => { const el = e.target.closest('[data-change2]'); if (el) { UI.tab[el.dataset.change2] = el.value; render(); } });

/* ---- admin.js ---- */
/* ================= Admin overview & analytics ================= */
function viewAdminHome() {
  const students = S.users.filter(u => u.role === 'student'), instructors = S.users.filter(u => u.role === 'instructor');
  const valid = S.certs.filter(c => c.status === 'valid').length; const chain = validateChain();
  const ens = S.enrollments; const done = ens.filter(e => e.completedAt).length;
  const byCourse = S.courses.map(c => ({label:c.title.split(' ').slice(0, 2).join(' '), value:ens.filter(e => e.courseId === c.id).length}));
  const funnel = [['Enrolled', ens.length], ['Started', ens.filter(e => doneCount(e) > 0).length], ['Halfway', ens.filter(e => progressOf(e) >= 50).length], ['Completed', done], ['Certified', ens.filter(e => e.certId).length]];
  const regions = {}; students.forEach(u => regions[u.region || 'Other'] = (regions[u.region || 'Other'] || 0) + 1);
  return appShell('admin', ['Admin', 'Overview'], `<div class="page-h"><div><h1>Platform overview</h1><p>Users, learning activity and credential health at a glance.</p></div><a class="btn btn-plain" href="#admin-chain">${ic('cube')}Ledger explorer</a></div>
  <div class="grid g4">${kpi('users', 'Total users', S.users.length, `${students.length} students · ${instructors.length} instructors`)}${kpi('book', 'Courses', S.courses.length, `${S.courses.filter(c => c.published).length} published`)}${kpi('trend', 'Enrollments', ens.length, `${Math.round(done / Math.max(1, ens.length) * 100)}% completion rate`, 'ic-green')}${kpi('award', 'Certificates', valid, `${S.certs.length - valid} revoked`, 'ic-purple')}</div>
  <div class="grid" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);margin-top:20px" id="ag1">
    <section class="card card-pad"><h3>Enrollments by course</h3><p class="small muted">All time</p>${barChart(byCourse)}</section>
    <section class="card card-pad"><div class="row between"><h3>Ledger health</h3>${chain.ok ? '<span class="pill p-green">Valid</span>' : '<span class="pill p-red">Broken</span>'}</div>
      <div class="stack" style="margin-top:14px"><div class="row between small"><span class="muted">Blocks</span><b>${S.chain.length}</b></div><div class="row between small"><span class="muted">Transactions</span><b>${S.chain.reduce((a, b) => a + b.txs.length, 0)}</b></div><div class="row between small"><span class="muted">Difficulty</span><b>${DIFFICULTY} leading zeros</b></div><div class="row between small"><span class="muted">Latest block</span><span class="mono">${short(S.chain[S.chain.length - 1].hash, 10)}</span></div><div class="row between small"><span class="muted">Issuer</span><span class="mono">${esc(S.issuer.did.slice(0, 22))}…</span></div></div>
      ${!chain.ok ? `<div class="note red" style="margin-top:14px">${ic('alert')}Block #${chain.at}: ${esc(chain.issues[0])}</div>` : ''}</section></div>
  <div class="grid" style="grid-template-columns:minmax(0,1fr) minmax(0,1fr);margin-top:20px" id="ag2">
    <section class="card card-pad"><h3>Completion funnel</h3>${funnel.map(([t, v]) => `<div style="margin-top:14px"><div class="row between small"><span>${t}</span><b>${v}</b></div><div class="bar" style="height:10px;margin-top:6px"><span style="width:${v / Math.max(1, funnel[0][1]) * 100}%"></span></div></div>`).join('')}</section>
    <section class="card card-pad"><h3>New sign-ups</h3><p class="small muted">Last 8 weeks</p>${barChart(weeklyCounts(S.users.map(u => u.createdAt)), {highlightLast:true, height:130})}
      <h3 style="margin-top:22px;font-size:15px">Students by region</h3><div style="margin-top:8px">${Object.entries(regions).sort((a, b) => b[1] - a[1]).map(([r, n]) => `<span class="skill">${esc(r)} <b>${n}</b></span>`).join('')}</div></section></div>`);
}
route(/^admin$/, () => need(['admin']) || viewAdminHome());

/* ================= Users ================= */
route(/^admin-users$/, () => {
  const g = need(['admin']); if (g) return g;
  const f = UI.tab.ur || 'all'; const q = (UI.uq || '').toLowerCase();
  const list = S.users.filter(u => (f === 'all' || u.role === f) && (!q || (u.name + ' ' + u.email + ' ' + (u.university || '')).toLowerCase().includes(q)));
  return appShell('admin-users', ['Admin', 'Users'], `<div class="page-h"><div><h1>Users</h1><p>${plural(S.users.length, 'account')}. Change roles, suspend access or remove accounts.</p></div><button class="btn btn-primary" data-act="userNew">${ic('plus')}Add user</button></div>
  <div class="row wrapf" style="margin-bottom:16px"><div class="filters" style="margin:0">${[['all', 'All'], ['student', 'Students'], ['instructor', 'Instructors'], ['admin', 'Admins']].map(([k, t]) => `<button class="${f === k ? 'on' : ''}" data-act="tab" data-k="ur" data-v="${k}">${t}</button>`).join('')}</div><span style="flex:1"></span>
    <form data-form="uq" class="search" style="margin:0">${ic('search')}<label class="sr" for="uqi">Search users</label><input id="uqi" placeholder="Search name, email or university" value="${esc(UI.uq || '')}"></form></div>
  <section class="card"><div class="tablewrap"><table class="table"><thead><tr><th>User</th><th>Role</th><th>University</th><th>Courses</th><th>Certificates</th><th>Joined</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.map(u => `<tr><td><div class="row">${avatar(u, 'sm')}<div><b class="small">${esc(u.name)}</b><div class="xs muted">${esc(u.email)}</div></div></div></td>
      <td><select class="ti" style="height:34px;width:auto" aria-label="Role for ${esc(u.name)}" data-change3="role" data-id="${u.id}" ${u.id === me().id ? 'disabled' : ''}>${['student', 'instructor', 'admin'].map(r => `<option value="${r}" ${u.role === r ? 'selected' : ''}>${r[0].toUpperCase() + r.slice(1)}</option>`).join('')}</select></td>
      <td class="small">${esc(u.university || '—')}</td><td>${u.role === 'instructor' ? S.courses.filter(c => c.instructor === u.id).length : S.enrollments.filter(e => e.userId === u.id).length}</td><td>${S.certs.filter(c => c.studentId === u.id).length}</td><td class="small muted">${fmtDate(u.createdAt)}</td>
      <td>${u.status === 'suspended' ? '<span class="pill p-red">Suspended</span>' : '<span class="pill p-green">Active</span>'}</td>
      <td style="white-space:nowrap">${u.id === me().id ? '<span class="xs muted">You</span>' : `<button class="btn btn-sm btn-plain" data-act="userSusp" data-id="${u.id}">${u.status === 'suspended' ? 'Reactivate' : 'Suspend'}</button> <button class="btn btn-sm btn-danger" data-act="userDel" data-id="${u.id}" aria-label="Delete ${esc(u.name)}">${ic('trash')}</button>`}</td></tr>`).join('')}</tbody></table></div>
    ${list.length ? '' : emptyState('users', 'No users match', 'Try a different search or filter.')}</section>`);
});
FORMS.uq = f => { UI.uq = f.querySelector('input').value.trim(); render(); };
document.addEventListener('change', e => { const el = e.target.closest('[data-change3]'); if (!el) return; const u = userById(el.dataset.id); mutate('PATCH', '/admin/users/' + u.id, {role:el.value}).then(r => { if (r) { toast(`${u.name} is now ${el.value === 'admin' ? 'an admin' : 'a ' + el.value}.`); render(); } }); });
ACT.userSusp = async el => { const u = userById(el.dataset.id); const ns = u.status === 'suspended' ? 'active' : 'suspended'; if (!(await mutate('PATCH', '/admin/users/' + u.id, {status:ns}))) return; toast(ns === 'suspended' ? `${u.name} is suspended and can’t log in.` : `${u.name} is active again.`); render(); };
ACT.userDel = el => { const u = userById(el.dataset.id); confirmBox(`Delete ${u.name}?`, 'Their account, enrollments and notes are removed. Certificates already on the ledger stay verifiable—revoke them separately if needed.', 'Delete account', () => { mutate('DELETE', '/admin/users/' + u.id).then(r => { if (r) { toast('Account deleted.'); render(); } }); }, true); };
ACT.userNew = () => {
  openModal({title:'Add user', body:`<form class="stack" id="nuf"><div class="field"><label for="nun">Full name</label><input class="ti" id="nun" required></div><div class="field"><label for="nue">Email</label><input class="ti" id="nue" type="email" required></div><div class="field"><label for="nur">Role</label><select class="ti" id="nur"><option value="student">Student</option><option value="instructor">Instructor</option><option value="admin">Admin</option></select></div><div class="field"><label for="nup">Temporary password</label><input class="ti" id="nup" value="Welcome#2026"></div></form>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-primary" id="nus">Add user</button>`});
  $('#nus').onclick = async () => { const n = $('#nun').value.trim(), em = $('#nue').value.trim(); if (n.length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { toast('Enter a name and a valid email.', 'err'); return; } 
    if (!(await mutate('POST', '/admin/users', {name:n, email:em, role:$('#nur').value, password:$('#nup').value}))) return; closeModal(); toast(`${n} added.`); render(); };
};

/* ================= Courses ================= */
route(/^admin-courses$/, () => need(['admin']) || appShell('admin-courses', ['Admin', 'Courses'], `<div class="page-h"><div><h1>Courses</h1><p>Publish, feature or remove courses across the platform.</p></div><a class="btn btn-primary" href="#instructor-new">${ic('plus')}Create a course</a></div><section class="card card-pad">${courseTable(S.courses, true)}</section>`));
ACT.adminPub = async el => { const c = courseById(el.dataset.id); if (!c.published && !canPublish(c)) return; const np = !c.published; if (!(await mutate('POST', `/courses/${c.id}/publish`, {published:np}))) return; toast(np ? 'Course published.' : 'Course unpublished. Enrolled learners keep access.'); render(); };
ACT.adminFeat = async el => { if (await mutate('POST', `/courses/${el.dataset.id}/feature`)) render(); };
ACT.courseDel = el => { const c = courseById(el.dataset.id); const n = S.enrollments.filter(e => e.courseId === c.id).length; confirmBox(`Delete ${c.title}?`, `${plural(n, 'enrollment')} will be removed. Issued certificates remain on the ledger.`, 'Delete course', () => { mutate('DELETE', '/courses/' + c.id).then(r => { if (r) { toast('Course deleted.'); render(); } }); }, true); };

/* ================= Certificates ================= */
route(/^admin-certs$/, () => {
  const g = need(['admin']); if (g) return g;
  const list = S.certs.slice().sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
  return appShell('admin-certs', ['Admin', 'Certificates'], `<div class="page-h"><div><h1>Certificate management</h1><p>Every certificate is SHA-256 hashed, ECDSA-signed, mined into a ledger block and anchored in the CertificateRegistry smart contract.</p></div><button class="btn btn-primary" data-act="issueManual">${ic('award')}Issue certificate</button></div>
  <div class="grid g3" style="margin-bottom:20px"><section class="card card-pad"><div class="row"><span class="ic ic-purple">${ic('key')}</span><div><b>Issuer key</b><div class="xs muted">ECDSA secp256k1 · Ethereum account</div></div></div><div class="hashbox" style="margin-top:14px"><small>DID</small><span class="mono">${esc(S.issuer.did)}</span></div><div class="hashbox" style="margin-top:8px"><small>ISSUER ADDRESS</small><span class="mono">${esc(S.issuer.address)}</span></div><div class="hashbox" style="margin-top:8px"><small>SMART CONTRACT · ${esc((S.web3.network || S.web3.mode).toUpperCase())}</small><span class="mono">${esc(S.web3.contract || (S.web3.mode === 'ledger-only' ? 'Ledger-only mode: set CHAIN_RPC_URL to anchor on an EVM chain' : 'Connecting to ' + (S.web3.error || 'the network') + '…'))}</span></div></section>
    ${kpi('shieldck', 'Valid certificates', S.certs.filter(c => c.status === 'valid').length, 'Pass every verification check', 'ic-green')}${kpi('ban', 'Revoked', S.certs.filter(c => c.status === 'revoked').length, 'Recorded with a reason on-chain', 'ic-pink')}</div>
  <section class="card"><div class="tablewrap"><table class="table"><thead><tr><th>Certificate</th><th>Learner</th><th>Course</th><th>Issued</th><th>Block</th><th>Status</th><th></th></tr></thead><tbody>
    ${list.map(c => `<tr><td class="mono">${c.id}</td><td class="small"><b>${esc(c.studentName)}</b></td><td class="small">${esc(c.courseTitle)}</td><td class="small muted">${fmtDate(c.issuedAt)}</td><td class="mono">#${c.blockIndex}</td>
      <td>${c.status === 'valid' ? '<span class="pill p-green">Valid</span>' : `<span class="pill p-red" title="${esc(c.revokeReason || '')}">Revoked</span>`}</td>
      <td style="white-space:nowrap"><a class="btn btn-sm btn-plain" href="#verify-${c.id}">Verify</a> ${c.status === 'valid' ? `<button class="btn btn-sm btn-danger" data-act="revoke" data-id="${c.id}">Revoke</button>` : ''}</td></tr>`).join('')}</tbody></table></div></section>`);
});
ACT.revoke = el => {
  const c = S.certs.find(x => x.id === el.dataset.id);
  openModal({title:'Revoke certificate', body:`<p class="muted small">Revoking ${c.id} (${esc(c.studentName)}, ${esc(c.courseTitle)}) mines a new block with a revocation transaction. The original record stays on the ledger, so the history remains transparent.</p><div class="field" style="margin-top:14px"><label for="rvr">Reason</label><select class="ti" id="rvr"><option>Issued in error</option><option>Academic integrity violation</option><option>Learner request</option><option>Superseded by a newer certificate</option></select></div>`,
    foot:`<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-danger" id="rvgo">Revoke certificate</button>`});
  $('#rvgo').onclick = async () => { const r = $('#rvr').value; $('#rvgo').innerHTML = '<span class="spin"></span> Mining block…'; const res = await mutate('POST', `/admin/certificates/${c.id}/revoke`, {reason:r}); if (!res) return; closeModal(); toast('Certificate revoked on-chain.'); render(); };
};
ACT.issueManual = () => {
  const eligible = S.enrollments.filter(e => !e.certId && userById(e.userId));
  openModal({title:'Issue a certificate', body:`<p class="small muted" style="margin-bottom:14px">Issue a certificate for learners who completed coursework outside the platform (for example, a recognized prior course). Their enrollment is marked complete.</p>${eligible.length ? `<div class="field"><label for="ime">Learner and course</label><select class="ti" id="ime">${eligible.map(e => `<option value="${e.id}">${esc(userById(e.userId).name)} — ${esc(courseById(e.courseId)?.title)} (${progressOf(e)}%)</option>`).join('')}</select></div>` : '<p class="muted">Every enrollment already has a certificate.</p>'}`,
    foot:eligible.length ? `<button class="btn btn-plain" data-act="closeModal">Cancel</button><button class="btn btn-primary" id="imgo">Issue on-chain</button>` : ''});
  const b = $('#imgo'); if (b) b.onclick = async () => { const r = await mutate('POST', '/admin/certificates/issue', {enrollmentId:$('#ime').value}); if (!r) return; closeModal(); toast(`Issued ${r.cert.id} in block #${r.cert.blockIndex}.`); render(); };
};

/* ================= Ledger explorer ================= */
route(/^admin-chain$/, () => {
  const g = need(['admin']); if (g) return g;
  const chain = validateChain(); const blocks = S.chain.slice().reverse();
  return appShell('admin-chain', ['Admin', 'Ledger explorer'], `<div class="page-h"><div><h1>Ledger explorer</h1><p>Every block links to the one before it. Change anything and the chain breaks.</p></div>
    <div class="row wrapf"><button class="btn btn-plain" data-act="validate">${ic('refresh')}Validate chain</button>${S.tamperBackup ? `<button class="btn btn-primary" data-act="restoreChain">${ic('shieldck')}Restore original block</button>` : `<button class="btn btn-danger" data-act="attack">${ic('alert')}Simulate tampering</button>`}</div></div>
  <div class="verdict ${chain.ok ? 'v-ok' : 'v-bad'}" style="margin-bottom:20px"><span class="ic" style="background:var(--surface)">${ic(chain.ok ? 'shieldck' : 'alert')}</span><div><h3>${chain.ok ? `Chain valid · ${S.chain.length} blocks` : `Chain broken at block #${chain.at}`}</h3><p class="small">${chain.ok ? 'All block hashes, Merkle roots, proof of work and links check out.' : esc(chain.issues.join('. ')) + '. Certificates in this block will fail verification until it’s restored.'}</p></div></div>
  <section class="card">${blocks.map(b => { const bad = !chain.ok && b.index >= chain.at && checkBlock(b, S.chain[b.index - 1]).length; return `<div class="block"><div class="idx" style="${bad ? 'background:var(--red-soft);color:var(--red)' : ''}">#${b.index}</div><div style="min-width:0">
    <div class="row wrapf small"><b>${b.txs.map(t => t.type.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase())).join(', ')}</b><span class="muted">${fmtDT(b.timestamp)}</span><span class="muted">Nonce ${b.nonce}</span>${bad ? '<span class="pill p-red">Invalid</span>' : ''}</div>
    <div class="grid g2" style="gap:8px;margin-top:8px"><div class="hashbox"><small>HASH</small><span class="mono">${b.hash}</span></div><div class="hashbox"><small>PREVIOUS HASH</small><span class="mono">${b.prevHash}</span></div></div>
    ${b.txs.map(t => `<div class="xs muted" style="margin-top:6px">${t.certId ? `Certificate <a class="mono" href="#verify-${t.certId}">${t.certId}</a> · ` : ''}${t.certHash ? `<span class="mono">${short(t.certHash, 14)}</span>` : esc(t.note || '')}${t.reason ? ` · ${esc(t.reason)}` : ''}${t.to ? ` → <span class="mono">${short(t.to, 8)}</span>` : ''}</div>`).join('')}</div></div>`; }).join('')}</section>`);
});
ACT.validate = () => { const r = validateChain(); toast(r.ok ? `Chain valid: ${r.blocks} blocks checked.` : `Chain broken at block #${r.at}.`, r.ok ? 'ok' : 'err'); render(); };
ACT.attack = () => {
  const target = S.chain.find(b => b.txs[0]?.type === 'MINT_CERTIFICATE'); if (!target) return;
  confirmBox('Simulate tampering?', `This edits the certificate fingerprint stored in block #${target.index}, as an attacker might. You can restore it afterwards.`, 'Tamper with block', () => {
    mutate('POST', '/admin/chain/tamper').then(r => { if (r) { toast(`Block #${r.index} was altered. Try verifying ${r.certId}.`, 'err'); render(); } });
  }, true);
};
ACT.restoreChain = async () => { if (await mutate('POST', '/admin/chain/restore')) { toast('Original block restored. Chain is valid again.'); render(); } };

/* ================= Messages ================= */
route(/^admin-inbox$/, () => {
  const g = need(['admin']); if (g) return g; if (S.messages.some(m => !m.read)) { S.messages.forEach(m => m.read = true); fire('POST', '/admin/messages/read'); }
  return appShell('admin-inbox', ['Admin', 'Messages'], `<div class="page-h"><div><h1>Messages</h1><p>From the Contact Us form.</p></div></div><section class="card card-pad">${S.messages.length ? S.messages.map(m => `<div style="padding:14px 0;border-top:1px solid var(--line)"><div class="row between"><b>${esc(m.name)} <span class="muted small">· ${esc(m.email)}</span></b><span class="xs muted">${fmtDT(m.at)}</span></div><span class="pill p-blue" style="margin:6px 0">${esc(m.topic)}</span><p class="small" style="white-space:pre-wrap">${esc(m.msg)}</p></div>`).join('') : emptyState('mail', 'No messages yet', 'Messages sent from the Contact Us page appear here.')}</section>`);
});

/* ---- main.js ---- */
/* ================= Boot ================= */
document.addEventListener('change', e => { const el = e.target.closest('[data-ui]'); if (el) { UI[el.dataset.ui] = el.value; render(); } });
(async () => {
  applyTheme();
  const root = $('#root');
  root.innerHTML = '<div class="splash"><div style="text-align:center"><span class="brand-mark" style="margin:0 auto 16px;width:52px;height:52px">' + ic('book') + '</span><div class="row" style="justify-content:center"><span class="spin"></span><span id="bootmsg">Loading Learning Hub…</span></div></div></div>';
  try { await sync(); }
  catch (e) { console.error(e); root.innerHTML = `<div class="splash"><div style="max-width:440px;text-align:center"><h2>Learning Hub couldn’t start</h2><p class="muted" style="margin:10px 0 16px">${esc(e.message)}</p><button class="btn btn-primary" onclick="location.reload()">Try again</button></div></div>`; return; }
  render();
})();

