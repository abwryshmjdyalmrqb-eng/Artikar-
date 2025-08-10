// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBcgBaXfoQazccxSYF538PmpaL5fUH-RoA",
  authDomain: "trading-4b0aa.firebaseapp.com",
  databaseURL: "https://trading-4b0aa-default-rtdb.firebaseio.com",
  projectId: "trading-4b0aa",
  storageBucket: "trading-4b0aa.appspot.com",
  messagingSenderId: "738549332722",
  appId: "1:738549332722:web:6e407e8312dd0600842e6b",
  measurementId: "G-4MMPM6LMN4"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// جلب بيانات المستخدم من localStorage
const storedUser = localStorage.getItem('loggedInUser');

if (!storedUser) {
  window.location.href = 'index.html'; // لو ما فيه مستخدم مسجل، يرجعه لتسجيل الدخول
} else {
  const userData = JSON.parse(storedUser);
  const userId = userData.userId || 'fallback_id';
  
  // ✅ عرض الـ ID في البطاقة (تم التعديل هنا فقط)
  document.getElementById("userIdDisplay").textContent = `ID: ${userId}`;
  
  const userRef = database.ref("users/" + userId);
  
  // إنشاء بيانات المستخدم إذا غير موجودة
  userRef.once("value", (snapshot) => {
    if (!snapshot.exists()) {
      userRef.set({
        profit: 0,
        deal: 0,
        today: 0,
        yesterday: 0,
        month: 0,
        total: 0
      });
    }
  });
  
  // عرض بيانات المستخدم على الصفحة
  userRef.on("value", (snapshot) => {
    const data = snapshot.val();
    
    document.querySelector(".profit-amount").textContent = (data.totalProfit || 0).toFixed(1);
    document.querySelector(".deal-amount").textContent = "مبلغ الصفقة: " + (data.deal || 0).toFixed(1);
    
    const stats = document.querySelectorAll(".stat-value");
    stats[0].textContent = (data.profit || 0).toFixed(1);
    stats[1].textContent = (data.yesterday || 0).toFixed(1);
    stats[2].textContent = (data.month || 0).toFixed(1);
    stats[3].textContent = (data.totalProfit || 0).toFixed(1);

    // ✅ تحديث بطاقة المستوى + حفظ آخر قيمة deal
    window.__lastDeal = Number(data.deal) || 0;
    const vipEl1 = document.getElementById('vipLevel');
    if (vipEl1) vipEl1.textContent = getVIPLevelFromDeal(window.__lastDeal);
  });
  
  // عرض بيانات المستخدم على الصفحة (كما هو لديك)
  userRef.on("value", (snapshot) => {
    const data = snapshot.val();
    
    document.querySelector(".profit-amount").textContent = (data.totalProfit || 0).toFixed(1);
    document.querySelector(".deal-amount").textContent = "مبلغ الصفقة: " + (data.deal || 0).toFixed(1);
    
    const stats = document.querySelectorAll(".stat-value");
    stats[0].textContent = (data.profit || 0).toFixed(1);
    stats[1].textContent = (data.yesterday || 0).toFixed(1);
    stats[2].textContent = (data.month || 0).toFixed(1);
    stats[3].textContent = (data.totalProfit || 0).toFixed(1);

    // ✅ تحديث بطاقة المستوى + حفظ آخر قيمة deal (نفسها للاحتياط)
    window.__lastDeal = Number(data.deal) || 0;
    const vipEl1b = document.getElementById('vipLevel');
    if (vipEl1b) vipEl1b.textContent = getVIPLevelFromDeal(window.__lastDeal);
  });
  
  // عرض الصفحة الرئيسية عند تسجيل الدخول
  showHome();

  // ✅ زر عائم صغير على اليمين (استدعاء أولي)
  forceFloatButton();
  // متابعة دائمة لإعادة الحقن لو اختفى
  startFloatButtonGuardian();

  // ✅ بدء فحص الرسائل كل 3 ثواني + حقن CSS للاهتزاز
  injectMsgCSS();
  startMessagePolling();
}

// ✅ دالة حساب مستوى VIP من مبلغ الصفقة
function getVIPLevelFromDeal(deal){
  if (deal >= 30000) return 'VIP7';
  if (deal >= 10000) return 'VIP6';
  if (deal >= 3000)  return 'VIP5';
  if (deal >= 1000)  return 'VIP4';
  if (deal >= 300)   return 'VIP3';
  if (deal >= 50)    return 'VIP2';
  return 'VIP1';
}

// فتح صفحة الشارة المستقلة (تقدر تبدلها بـ levels.html لو تبغى)
function openVipPage(e){
  if (e) e.preventDefault();
  let uid=''; try{ uid=(JSON.parse(localStorage.getItem('loggedInUser')||'{}').userId)||'' }catch{}
  if (!uid){ alert('لا يوجد مستخدم مسجّل.'); return; }
  window.location.href = `vip.html?uid=${encodeURIComponent(uid)}`;
}

// متغير لحفظ آخر قيمة deal
window.__lastDeal = 0;

// دالة الدعم
function contactSupport(e) {
  if (e) e.preventDefault();
  const tg = "tg://resolve?domain=artikarbot";
  window.location.href = tg;
  setTimeout(() => {
    window.location.href = "https://t.me/artikarbot";
  }, 500);
}

// دالة لتحديث أزرار التنقل السفلية
userRef.on("value", (snapshot) => {
  const data = snapshot.val();

  // ✅ تحديث بطاقة المستوى + حفظ آخر قيمة deal (لو البطاقة موجودة حالياً)
  window.__lastDeal = Number(data.deal) || 0;
  const vipEl2 = document.getElementById('vipLevel');
  if (vipEl2) vipEl2.textContent = getVIPLevelFromDeal(window.__lastDeal);

  document.getElementById("totalProfit").textContent = (data.totalProfit || 0).toFixed(1);
  document.getElementById("dealAmount").textContent = "مبلغ الصفقة: " + (data.deal || 0).toFixed(1);
  document.getElementById("todayProfit").textContent = (data.profit || 0).toFixed(1);
  document.getElementById("yesterdayProfit").textContent = (data.yesterday || 0).toFixed(1);
  document.getElementById("monthProfit").textContent = (data.month || 0).toFixed(1);
  document.getElementById("allProfit").textContent = (data.totalProfit || 0).toFixed(1);
});

// --------- [ تعديل السلايدر: تعريف موحّد + دالة تشغيل ] ---------
const images = ["img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg"];
let currentIndex = 0;
let sliderTimer = null;

function startSlider() {
  const el = document.getElementById("slider-img"); // تأكد أن الصورة id="slider-img"
  if (!el) return;
  currentIndex = 0;
  el.src = images[currentIndex];
  if (sliderTimer) clearInterval(sliderTimer);
  sliderTimer = setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    const img = document.getElementById("slider-img");
    if (img) img.src = images[currentIndex];
  }, 10000);
}
// ------------------------------------------------------------------

// عرض الصفحة الرئيسية
function showHome(e) {
  if (e) e.preventDefault?.();
  document.getElementById("mainContent").innerHTML = `
    <div class="profit-section slide-in">
      <div class="profit-title">الأرباح</div>
      <div class="profit-amount" id="totalProfit"><div class="loader-sm"></div></div>
      <div class="deal-amount" id="dealAmount">مبلغ الصفقة: <div class="loader-sm"></div></div>
    </div>

    <div class="stats-grid">
      <div class="stat-card"><div class="stat-title">أرباح اليوم</div><div class="stat-value" id="todayProfit"><div class="loader-sm"></div></div></div>
      <div class="stat-card"><div class="stat-title">تداول التارجح</div><div class="stat-value" id="yesterdayProfit"><div class="loader-sm"></div></div></div>
      <div class="stat-card"><div class="stat-title">تداول الزخم</div><div class="stat-value" id="monthProfit"><div class="loader-sm"></div></div></div>
      <div class="stat-card"><div class="stat-title">إجمالي الأرباح</div><div class="stat-value" id="allProfit"><div class="loader-sm"></div></div></div>
    </div>

    <div class="slide-in" style="
    width:calc(100% - 10px);
    margin:12px auto 15px;
    background:#fff;
    border-radius:16px;
    padding:6px;
    box-shadow:0 8px 22px rgba(0,0,0,.08);
    text-align:center;">
      <div style="font-size:10px;color:#6b6b6b;letter-spacing:.2px;">المستوى</div>
      <div id="vipLevel" style="
          margin-top:6px;
          font-weight:800;
          font-size:22px;
          color:#FFC107;"> 
        <div class="loader-sm"></div>
      </div>
    </div>

    <div class="action-section slide-in">
      <div class="action-title">العمليات</div>
      <div class="action-buttons">
        <button class="action-btn" onclick="showReports()">
          <i class="material-icons">description</i> التقارير
        </button>
        <button class="action-btn" onclick="showWallets()">
          <i class="material-icons">account_balance_wallet</i> المحافظ
        </button>
        <button class="action-btn" onclick="showWithdraw()">
          <i class="material-icons">call_made</i> سحب
        </button>
        <button class="action-btn" onclick="showDeposit()">
          <i class="material-icons">call_received</i> إيداع
        </button>
      </div>
    </div>

    <div class="ai-section slide-in">
      <div class="ai-text">ترقيةالمستوى VIP</div>
      <button class="ai-btn" onclick="openAITrading(event)">فتح</button>
    </div>
  `;

  updateNavButtons("home");

  // ✅ عَبّي قيمة المستوى فوراً من آخر deal معروف
  const vipElNow = document.getElementById('vipLevel');
  if (vipElNow && typeof getVIPLevelFromDeal === 'function') {
    vipElNow.textContent = getVIPLevelFromDeal(window.__lastDeal || 0);
  }

  // ✅ تأكيد الزر العائم بعد إعادة بناء الصفحة
  setTimeout(forceFloatButton, 10);
}


// الصفحات الأخرى
function showAccount(e) {
  if (e) e.preventDefault();
  document.getElementById("mainContent").innerHTML = `<div class="profit-section slide-in"><div class="profit-title">معلومات الحساب</div></div>`;
  updateNavButtons("account");
}

function showTrading(event) {
  if (event) event.preventDefault();
  
  // إخفاء كل العناصر داخل main-content
  const main = document.getElementById('mainContent');
  main.innerHTML = ''; // نحذف كل المحتوى
  
  // نضيف واجهة التداول
  const tradingSection = document.getElementById('tradingSection');
  main.appendChild(tradingSection);
  tradingSection.style.display = 'block';
}

function showReports() {
  window.location.href = "index11.html"; // تفتح صفحة التقارير
}

function showWallets() {
  window.location.href = "index9.html"; // تفتح صفحة المحافظ
}

function showWithdraw() {
  window.location.href = "index8.html"; // تفتح صفحة السحب
}

function showDeposit() {
  window.location.href = "index10.html"; // تفتح صفحة الإيداع
}

function showAITrading(event) {
  if (event) event.preventDefault();

  // إلغاء التفعيل من جميع الأزرار
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  if (event && event.currentTarget) event.currentTarget.classList.add("active");

  // عرض صفحة الروبوتات داخل iframe
  document.getElementById("mainContent").innerHTML = `
    <iframe src="index3.html"
      style="width:100%;height:calc(100vh - 140px);border:none;"
      frameborder="0"></iframe>
  `;

  // تأكيد الزر العائم
  setTimeout(forceFloatButton, 10);
}

function showTrading(event) {
  event.preventDefault();
  
  // إلغاء التفعيل من جميع الأزرار
  document.querySelectorAll(".nav-btn").forEach(btn => btn.classList.remove("active"));
  event.currentTarget.classList.add("active");
  
  // تحميل محتوى التداول
  fetch("index6.html")
    .then(response => response.text())
    .then(html => {
      // عرض المحتوى داخل mainContent
      document.getElementById("mainContent").innerHTML = html;

      // ✨ تشغيل السلايدر بعد إدراج الصفحة
      startSlider();

      // تأكيد الزر العائم
      setTimeout(forceFloatButton, 10);
    })
    .catch(error => {
      console.error("فشل تحميل صفحة التداول:", error);
    });
}

function openAITrading(e) {
  // مهم: امنع أي handlers أبوية (مثل showAITrading على عناصر خارجية)
  if (e) { e.preventDefault(); e.stopPropagation(); }

  // (اختياري) مرّر userId للصفحة الجديدة
  let uid = "";
  try { uid = (JSON.parse(localStorage.getItem('loggedInUser') || '{}').userId) || ""; } catch {}

  // افتح كصفحة جديدة كاملة (ليس داخل mainContent)
  window.location.href = `index13.html?uid=${encodeURIComponent(uid)}`;
}

// ملاحظة: (تم توحيد السلايدر عبر startSlider) لا نستخدم interval آخر هنا

function showMaintenance() {
  Swal.fire({
    icon: 'info',
    title: '🚧 تحت الصيانة',
    text: 'هذه الخدمة غير متاحة حالياً. يرجى المحاولة لاحقاً.',
    confirmButtonText: 'تم',
    confirmButtonColor: '#9d50bb',
    backdrop: `
      rgba(0,0,0,0.5)
      url("https://i.gifer.com/ZZ5H.gif")
      center
      no-repeat
    `
  });
}

function showMomentumAlert() {
  Swal.fire({
    icon: 'info',
    title: '🚧 تحت الصيانة',
    text: 'خدمة تداول الزخم غير متاحة حالياً. نعمل على تحسينها!',
    confirmButtonText: 'تم',
    confirmButtonColor: '#9d50bb',
    backdrop: `
      rgba(0,0,0,0.5)
      url("https://i.gifer.com/ZZ5H.gif")
      center
      no-repeat
    `
  });
}

function showStocksAlert() {
  Swal.fire({
    icon: 'info',
    title: '🚧 تحت الصيانة',
    text: 'خدمة تداول الأسهم غير متاحة حالياً. يرجى المحاولة لاحقًا.',
    confirmButtonText: 'حسنًا',
    confirmButtonColor: '#9d50bb',
    backdrop: `
      rgba(0,0,0,0.5)
      url("https://i.gifer.com/ZZ5H.gif")
      center
      no-repeat
    `
  });
}

function exitWithSlide() {
  // إضافة تأثير اهتزاز قبل الخروج
  document.getElementById('slideExitBtn').style.animation = "shake 0.5s";
  
  // تأثير انزلاق الصفحة
  document.body.style.transform = "translateX(100%)";
  document.body.style.opacity = "0";
  document.body.style.transition = "all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55)";
  
  setTimeout(() => {
    window.location.href = "index.html";
  }, 500);
}

/* ====== 1) زر العائم: افتح نافذة الرسائل بدل contactSupport ====== */
function forceFloatButton(){
  try{
    if (document.getElementById('floatMsgBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'floatMsgBtn';
    btn.type = 'button';
    btn.style.cssText = [
      'position:fixed','right:16px','bottom:250px','z-index:2147483647',
      'width:30px','height:30px','border:none','border-radius:50%',
      'background:#7a4fd3','color:#fff','display:flex','align-items:center',
      'justify-content:center','box-shadow:0 10px 24px rgba(0,0,0,.35)',
      'font-size:13px','cursor:pointer','outline:none','user-select:none',
      'transition:transform .2s'
    ].join(';');
    btn.innerHTML = '✉️';
    btn.title = 'الرسائل / الدعم';

    // بادج صغيرة (تظهر عند وجود رسالة جديدة)
    const badge = document.createElement('span');
    badge.className = 'msg-badge';
    badge.style.cssText = 'position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#ff3b30;border:2px solid #7a4fd3;display:none;';
    btn.style.position = 'relative';
    btn.appendChild(badge);

    // ⬅️ افتح نافذة الرسائل داخل التطبيق
    btn.addEventListener('click', openInboxOverlay);

    document.body.appendChild(btn);
    setTimeout(()=>{ btn.style.zIndex = '2147483647'; }, 0);
  }catch(err){ console.error('[floatBtn] failed', err); }
}

/* ====== 2) نافذة الرسائل (Bottom Sheet) ====== */
function openInboxOverlay(){
  if (document.getElementById('inboxOverlay')) {
    document.getElementById('inboxOverlay').style.display = 'block';

    // اعتبر آخر رسالة مقروءة وأخفِ البادج
    markLatestAsSeenAndHideBadge();
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'inboxOverlay';
  overlay.style.cssText = [
    'position:fixed','left:0','right:0','bottom:0','top:0','z-index:2147483646',
    'background:rgba(0,0,0,.35)','display:block'
  ].join(';');

  const sheet = document.createElement('div');
  sheet.style.cssText = [
    'position:absolute','left:0','right:0','bottom:0',
    'background:#121122','border-top-left-radius:18px','border-top-right-radius:18px',
    'box-shadow:0 -10px 30px rgba(0,0,0,.35)','padding:14px',
    'max-height:70vh','overflow:auto','color:#fff'
  ].join(';');

  sheet.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="font-weight:800;font-size:18px;">الرسائل</div>
      <button id="inboxClose" style="
        background:transparent;border:none;color:#fff;font-size:22px;cursor:pointer;">×</button>
    </div>
    <div id="inboxList" style="margin-top:10px;border-radius:12px;background:#191936;padding:10px;min-height:120px;">
      <div style="opacity:.7">جاري جلب الرسائل...</div>
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;">
      <button id="tgBtn" style="
        flex:1;background:linear-gradient(135deg,#6e8efb,#9d50bb);
        border:none;color:#fff;padding:12px;border-radius:12px;font-weight:700;cursor:pointer;">
        تواصل عبر تيليجرام
      </button>
    </div>
  `;
  overlay.appendChild(sheet);
  document.body.appendChild(overlay);

  // إغلاق
  sheet.querySelector('#inboxClose').onclick = ()=>{ overlay.style.display='none'; };

  // زر تيليجرام آمن للمتصفح
  sheet.querySelector('#tgBtn').onclick = openTelegramSafe;

  // اشترك في رسائل المستخدم
  subscribeToUserMessages();

  // اعتبر آخر رسالة مقروءة وأخفِ البادج
}

/* ====== 3) الاشتراك في رسائل Firebase وعرضها ====== */
function subscribeToUserMessages(){
  let uid = '';
  try{ uid=(JSON.parse(localStorage.getItem('loggedInUser')||'{}').userId)||''; }catch{}
  if (!uid){ document.getElementById('inboxList').innerHTML = '<div>لم يتم العثور على المستخدم.</div>'; return; }

  const ref = firebase.database().ref('messages/'+uid).limitToLast(50);
  ref.off(); // تنظيف أي مستمع قديم
  ref.on('value', snap=>{
    const list = document.getElementById('inboxList');
    const data = snap.val();
    if (!data){
      list.innerHTML = '<div style="opacity:.7">لا توجد رسائل حالياً.</div>';
      return;
    }
    // رندر بسيط
    const items = Object.values(data).sort((a,b)=>(a.timestamp||0)-(b.timestamp||0));
    list.innerHTML = items.map(m=>`
      <div style="
        background:#1f1f3b;margin:6px 0;padding:10px;border-radius:10px;">
        <div style="font-size:12px;opacity:.7;margin-bottom:4px;">
          ${m.from==='admin'?'المدير':'النظام'} • ${new Date(m.timestamp||Date.now()).toLocaleString()}
        </div>
        <div style="font-size:14px;line-height:1.6">${(m.text||'').replace(/</g,'&lt;')}</div>
      </div>
    `).join('');
  });
}

/* ====== 4) فتح تيليجرام بأمان (https أولاً، ثم نحاول التطبيق) ====== */
function openTelegramSafe(){
  const httpsUrl = 'https://t.me/artikarbot';
  // افتح في تبويب جديد (يعمل في كل المتصفحات)
  window.open(httpsUrl, '_blank');

  // محاولة لاحقة لفتح التطبيق لمن يدعم intent (أندرويد كروم)
  try{
    const isAndroid = /Android/i.test(navigator.userAgent);
    if (isAndroid) {
      setTimeout(()=>{
        const intent = 'intent://resolve?domain=artikarbot#Intent;scheme=tg;package=org.telegram.messenger;end';
        window.location.href = intent;
      }, 250);
    }
  }catch(e){}
}

/* ====== 5) حارس يعيد زر العائم لو اختفى ====== */
let __floatGuardTimer = null;
function startFloatButtonGuardian(){
  if (__floatGuardTimer) return;
  __floatGuardTimer = setInterval(()=>{
    if (!document.getElementById('floatMsgBtn')) forceFloatButton();
  }, 800);
}

/* ====== 6) (جديد) CSS للاهتزاز + أدوات البادج ====== */
function injectMsgCSS(){
  if (document.getElementById('msgShakeCSS')) return;
  const style = document.createElement('style');
  style.id = 'msgShakeCSS';
  style.textContent = `
    @keyframes shakeAnim{0%{transform:translate(0,0)}25%{transform:translate(-2px,0)}50%{transform:translate(2px,0)}75%{transform:translate(-2px,0)}100%{transform:translate(0,0)}}
    #floatMsgBtn.shake{ animation:shakeAnim .5s }
  `;
  document.head.appendChild(style);
}

function getSeenKey(){
  let uid = '';
  try{ uid=(JSON.parse(localStorage.getItem('loggedInUser')||'{}').userId)||'' }catch{}
  return 'lastSeenMsgTs:'+uid;
}

function getFloatBadge(){
  const btn = document.getElementById('floatMsgBtn');
  if (!btn) return null;
  let b = btn.querySelector('.msg-badge');
  if (!b){
    const nb = document.createElement('span');
    nb.className = 'msg-badge';
    nb.style.cssText = 'position:absolute;top:-4px;right:-4px;width:12px;height:12px;border-radius:50%;background:#ff3b30;border:2px solid #7a4fd3;display:none;';
    btn.style.position = 'relative';
    btn.appendChild(nb);
    b = nb;
  }
  return b;
}

function shakeFloatBtn(){
  const btn = document.getElementById('floatMsgBtn');
  if (!btn) return;
  btn.classList.add('shake');
  setTimeout(()=>btn.classList.remove('shake'), 500);
}

async function fetchLatestMsgTs(){
  let uid = '';
  try{ uid=(JSON.parse(localStorage.getItem('loggedInUser')||'{}').userId)||'' }catch{}
  if (!uid) return 0;
  try{
    const snap = await firebase.database()
      .ref('messages/'+uid)
      .limitToLast(1)
      .get();
    let ts = 0;
    if (snap.exists()){
      snap.forEach(ch=>{
        const m = ch.val()||{};
        ts = Math.max(ts, Number(m.timestamp||0));
      });
    }
    return ts;
  }catch{ return 0; }
}

async function markLatestAsSeenAndHideBadge(){
  const latestTs = await fetchLatestMsgTs();
  if (latestTs>0){
    localStorage.setItem(getSeenKey(), String(latestTs));
  }
  const badge = getFloatBadge();
  if (badge) badge.style.display = 'none';
}

let __msgPollTimer = null;
function startMessagePolling(){
  if (__msgPollTimer) return;
  const tick = async ()=>{
    const btn = document.getElementById('floatMsgBtn');
    if (!btn){ forceFloatButton(); return; }
    const latestTs = await fetchLatestMsgTs();
    const lastSeen = Number(localStorage.getItem(getSeenKey())||0);
    const badge = getFloatBadge();
    if (latestTs>0 && latestTs>lastSeen){
      if (badge) badge.style.display = 'block';
      shakeFloatBtn();
    }else{
      if (badge) badge.style.display = 'none';
    }
  };
  // أول فحص فوراً ثم كل 3 ثواني
  tick();
  __msgPollTimer = setInterval(tick, 3000);
}