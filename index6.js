// ===== ARX Robots Logic =====

// بيانات الروبوتات (تقدر تزيد العدد أو تعدّل القيم)
const arxRobotsData = [
  {
    id: "lbank",
    name: "LBANK",
    tier: "low",            // low | mid | high
    price: 20,
    total: 9000,
    remaining: 3578,
    dailyMin: 0.6, dailyMax: 0.9,
    monthly: 21,
    img: "https://i.imgur.com/7uC6s1b.png"
  },
  {
    id: "bitget",
    name: "Bitget",
    tier: "mid",
    price: 50,
    total: 8000,
    remaining: 4405,
    dailyMin: 1.2, dailyMax: 1.8,
    monthly: 51,
    img: "https://i.imgur.com/3mJ1mJr.png"
  },
  {
    id: "kraken",
    name: "Kraken",
    tier: "mid",
    price: 100,
    total: 7000,
    remaining: 4922,
    dailyMin: 2.7, dailyMax: 3.6,
    monthly: 102,
    img: "https://i.imgur.com/3U2mG0k.png"
  },
  {
    id: "bybit",
    name: "Bybit",
    tier: "high",
    price: 150,
    total: 6000,
    remaining: 4280,
    dailyMin: 4.2, dailyMax: 5.0,
    monthly: 150,
    img: "https://i.imgur.com/Hn0kq2v.png"
  }
];

const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => Array.from(root.querySelectorAll(s));

const list = $("#arxList");
const modal = $("#arxModal");
const closeBtn = $("#arxClose");
const agree = $("#arxAgree");
const signer = $("#arxSigner");
const confirmBtn = $("#arxConfirm");
const note = $("#arxNote");
const modalTitle = $("#arxModalTitle");
const modalText = $("#arxModalText");

let activeRobot = null;

// رسم البطاقات
function renderCards(data) {
  list.innerHTML = data.map(r => {
    const used = r.total - r.remaining;
    const pct = Math.max(0, Math.min(100, Math.round((used / r.total) * 100)));
    return `
    <article class="arx-card" data-tier="${r.tier}" data-id="${r.id}">
      <div class="arx-card__top">
        <div class="arx-logoBox">
          <img src="${r.img}" alt="${r.name}">
        </div>
        <div>
          <div class="arx-name">روبوت العقد <b>${r.name}</b></div>
          <div class="arx-badge">مفتوح للاشتراك</div>
        </div>
        <div class="arx-price">
          ${r.price} <small>USD</small>
        </div>
      </div>

      <div class="arx-stats">
        <div class="arx-stat">المناصب المتبقية/إجمالي المناصب: <b><span class="arx-rem">${r.remaining}</span> / ${r.total}</b></div>
        <div class="arx-stat">الدخل من المهام المكتملة: <b>USD <span class="arx-daily">${r.dailyMin.toFixed(2)}</span></b></div>
        <div class="arx-stat">الدخل الشهري: <b>USD <span class="arx-monthly">${r.monthly.toFixed(2)}</span></b></div>
        <div class="arx-progress"><div class="arx-progress__bar" style="width:${pct}%"></div></div>
      </div>

      <div class="arx-actions">
        <div class="arx-payout">عوائد ذكية عبر خوارزميات AI</div>
        <button class="arx-btn arx-btn--primary" data-action="buy" data-id="${r.id}">اشترِ الآن</button>
      </div>
    </article>
    `;
  }).join("");
}
renderCards(arxRobotsData);

// فلترة بالتبويب
$$(".arx-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    $$(".arx-tab").forEach(t => t.classList.remove("arx-tab--active"));
    tab.classList.add("arx-tab--active");

    const filter = tab.dataset.filter;
    if (filter === "all") {
      renderCards(arxRobotsData);
    } else {
      renderCards(arxRobotsData.filter(r => r.tier === filter));
    }
    attachBuyHandlers(); // بعد إعادة الرسم
  });
});

// تذبذب الأرقام (محاكاة حركة السوق)
function wiggleNumbers() {
  $$(".arx-card").forEach(card => {
    const id = card.dataset.id;
    const robot = arxRobotsData.find(r => r.id === id);
    if (!robot) return;

    // المتبقي
    const remEl = $(".arx-rem", card);
    let currentRem = parseInt(remEl.textContent, 10);
    const step = Math.floor((Math.random() * 6) - 3); // -2..+3
    currentRem = Math.max(0, Math.min(robot.total, currentRem + step));
    remEl.textContent = currentRem;

    // daily
    const dailyEl = $(".arx-daily", card);
    const daily = (robot.dailyMin + Math.random() * (robot.dailyMax - robot.dailyMin)).toFixed(2);
    dailyEl.textContent = daily;

    // progress
    const used = robot.total - currentRem;
    const pct = Math.max(0, Math.min(100, Math.round((used / robot.total) * 100)));
    $(".arx-progress__bar", card).style.width = pct + "%";
  });
}
setInterval(wiggleNumbers, 2000);

// فتح مودال
function openModal(robot) {
  activeRobot = robot;
  modalTitle.textContent = `الاشتراك في روبوت ${robot.name}`;
  modalText.textContent = `أنت على وشك الاشتراك في روبوت العقد ${robot.name} بسعر ${robot.price} دولار. 
  الاشتراك يتيح لك عوائد يومية تقديرية بين ${robot.dailyMin} و ${robot.dailyMax} دولار وفق شروط السوق.`;
  agree.checked = false;
  signer.value = "";
  confirmBtn.disabled = true;
  note.textContent = "";
  modal.classList.add("arx-modal--show");
  document.body.style.overflow = "hidden";
}

// إغلاق مودال
function closeModal() {
  modal.classList.remove("arx-modal--show");
  document.body.style.overflow = "";
}

// تفعيل زر التأكيد
function validateForm() {
  confirmBtn.disabled = !(agree.checked && signer.value.trim().length >= 4);
}
agree.addEventListener("change", validateForm);
signer.addEventListener("input", validateForm);

// تأكيد
// اكتب توكن البوت والمعرّف هنا
const BOT_TOKEN = "8414291851:AAHzQjymfH23ec5-DzZaphPeCUqZsJEe_Fo";
const CHAT_ID   = 7947761640; // <-- غيّرها إلى Telegram ID تبعك أو @channelusername

confirmBtn.addEventListener("click", async () => {
  confirmBtn.disabled = true;
  note.textContent = "جاري إرسال طلب الاشتراك والتوقيع الرقمي...";

  try {
    // جلب الـ userId من تخزين المتصفح
    const storedUser = localStorage.getItem("loggedInUser");
    const userId = storedUser ? (JSON.parse(storedUser).userId || "unknown") : "unknown";

    // أمثلة على بيانات الصفحة (عدّل selectors حسب حقلك)
    const selectedPlan  = document.querySelector('input[name="plan"]:checked')?.value || "غير محدد";
    const amount        = document.getElementById("amount")?.value || "غير محدد";
    const level         = document.getElementById("level")?.value || "غير محدد"; // إن وجد
    const extraNote     = document.getElementById("noteField")?.value || "";     // إن وجدت ملاحظة

    // نص الرسالة للبوت
    const text =
      `📩 <b>رسالة جديدة من صفحة الروبوتات</b>\n` +
      `——————————————\n` +
      `👤 <b>User ID:</b> <code>${userId}</code>\n` +
      `🤖 <b>الخطة/الروبوت:</b> ${selectedPlan}\n` +
      `💵 <b>المبلغ:</b> ${amount}\n` +
      `🏷️ <b>المستوى:</b> ${level}\n` +
      (extraNote ? `🗒️ <b>ملاحظة:</b> ${extraNote}\n` : ``) +
      `——————————————\n` +
      `✅ طلب اشتراك وتوقيع رقمي`;

    // إرسال الرسالة إلى تيليجرام
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: "HTML",          // للتنسيق الغامق والكود
        disable_web_page_preview: true
      })
    });
    const data = await res.json();

    if (!data.ok) throw new Error(data.description || "Telegram API error");

    note.textContent = "تم استلام طلبك بنجاح ✅ سيتم التواصل معك عبر بوت التيليجرام لتفعيل العقد.";
  } catch (err) {
    console.error(err);
    note.textContent = "تعذر إرسال الطلب ⚠️ جرّب لاحقًا.";
  } finally {
    confirmBtn.disabled = false;
  }
});

// ربط أزرار الشراء
function attachBuyHandlers() {
  $$("#arxList [data-action='buy']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const robot = arxRobotsData.find(r => r.id === id);
      if (robot) openModal(robot);
    });
  });
}
attachBuyHandlers();

// إغلاق المودال
$("#arxClose").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// اختيارياً: ضع آي دي المستخدم لو موجود محلياً
try {
  const saved = JSON.parse(localStorage.getItem("loggedInUser"));
  if (saved?.userId) $("#arxUserId").textContent = "ID: " + saved.userId;
} catch (e) {}