/* ספריית הכושר — יומן אימונים (AppNest)
   מודול: אחסון, אימונים, אימון חי, בית, התקדמות, מנהל חלונות.
   נטען לפני הסקריפט הראשי של index.html. משתמש ב-T, state, LANG ושאר
   הגלובליים של הסקריפט הראשי — רק בזמן ריצה, לא בטעינה.
   בכל שינוי: להעלות ?v= בתגית ב-index.html וגם FITLOG ב-sw.js (שניהם יחד), ואת VERSION. */
  // ═══════════════════════════════════════════════════════════
  //  v2.0 — אחסון, אימונים, יומן, בית, התקדמות
  //  (כתוב מאפס עבור AppNest. רעיונות המוצר נבדקו מול אפליקציות
  //   כושר קיימות; שום קוד לא הועתק.)
  // ═══════════════════════════════════════════════════════════
  const WO_KEY   = 'appnest-workouts';
  const HIST_KEY = 'appnest-history';
  const FAV_KEY  = 'appnest-favs';
  const SESS_KEY = 'appnest-session';
  const VIEW_KEY = 'appnest-libview';
  const APP_VERSION = '2.2.0';
  let pendingExId = null;

  // Storage shim — כשל שמירה מקבל הודעה ברורה (דרישות AppNest, חלק א׳)
  const store = {
    get(k, def) { try { const v = localStorage.getItem(k); return v == null ? def : JSON.parse(v); } catch { return def; } },
    set(k, v) {
      try { localStorage.setItem(k, JSON.stringify(v)); return true; }
      catch { toast(LANG === 'he' ? '⚠️ השמירה נכשלה — אין מקום פנוי במכשיר' : '⚠️ Saving failed — device storage is full'); return false; }
    },
  };
  const loadWo   = () => { const a = store.get(WO_KEY, []); return Array.isArray(a) ? a : []; };
  let remSyncT = 0;
  const saveWo   = ws => {
    const ok = store.set(WO_KEY, ws);
    // התזכורת "לפי התוכנית" נגזרת מהימים של האימונים — מסנכרנים אחרי כל שינוי
    clearTimeout(remSyncT); remSyncT = setTimeout(() => { try { typeof remRefresh === 'function' && remRefresh(); } catch {} }, 400);
    return ok;
  };
  const loadHist = () => { const a = store.get(HIST_KEY, []); return Array.isArray(a) ? a : []; };
  const saveHist = h => { store.set(HIST_KEY, h); invalidateStats(); };
  const loadFavs = () => { const a = store.get(FAV_KEY, []); return Array.isArray(a) ? a : []; };
  const saveFavs = f => store.set(FAV_KEY, f);
  const isFav    = id => loadFavs().includes(id);
  const exById   = id => EX_BY_ID[id];
  let EX_BY_ID = {};

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const isBW = ex => !!ex && /body weight|assisted|band|roller|stability ball|bosu ball/.test(ex.equipment);
  const fmtKg = n => (Math.round(n * 10) / 10).toLocaleString();
  const fmtVol = kg => kg >= 10000 ? `${(kg / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}<small>${T('tons')}</small>`
                                    : `${Math.round(kg).toLocaleString()}<small>${T('kg')}</small>`;
  const fmtDur = ms => { const m = Math.max(1, Math.round(ms / 60000)); return m >= 60 ? `${Math.floor(m / 60)} ${T('hoursShort')} ${m % 60} ${T('minShort')}` : `${m} ${T('minShort')}`; };
  const dayKey = t => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
  const startOfDay = t => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const startOfWeek = t => { const d = new Date(startOfDay(t)); d.setDate(d.getDate() - d.getDay()); return d.getTime(); }; // שבוע מתחיל ביום ראשון
  const e1rm = (w, r) => w > 0 ? w * (1 + Math.min(r, 12) / 30) : 0;     // Epley, מוגבל ל-12 חזרות
  const exThumb = ex => ex ? ex.image : '';

  // ══════════ סוגי רישום (2.1): חזרות · זמן · קרדיו ══════════
  //  wr     — משקל × חזרות        { w, r }
  //  time   — שניות (+משקל אופציונלי) { t, w }   פלאנק, החזקות, מתיחות
  //  cardio — דקות + ק״מ           { t (בשניות), d }  הליכון, אופניים, אליפטיקל
  const CARDIO_EQ = /elliptical|stationary bike|stepmill|skierg|ergometer/;
  const CARDIO_NAME = /\b(walk|walking|run|running|jog|sprint|treadmill|bike|cycling|rope jumping|jump rope|stair climb|cross trainer)\b/;
  const CARDIO_NOT = /lunge|push to|wheel|knees/;
  const TIME_NAME = /plank|stretch|\bpose\b|isometric|wall sit|\bl-sit|\bv-sit|\bhold\b|dead hang|planche|\bflag\b|handstand|superman/;
  const TIME_NOT = /push-up|raise|row|curl|crunch|press|tap|jack|climber|twist|jump|lift|pull|walk|kick|fly|adduction|abduction|wipers/;
  function autoMode(ex) {
    if (!ex) return 'wr';
    if (ex.mode) return ex.mode;                 // תרגיל משלי — הסוג שהמשתמש בחר
    const n = ex.name.toLowerCase();
    if (CARDIO_EQ.test(ex.equipment) || (ex.category === 'cardio' && CARDIO_NAME.test(n) && !CARDIO_NOT.test(n))) return 'cardio';
    if (TIME_NAME.test(n) && !TIME_NOT.test(n)) return 'time';
    return 'wr';
  }
  const itemMode = (it, ex) => (it && it.mode) || autoMode(ex || exById(it && it.exId));
  const MODE_DEF = { wr: { sets: 3, reps: 10 }, time: { sets: 3, reps: 30 }, cardio: { sets: 1, reps: 20 } };
  const fmtSec = t => { t = Math.round(+t || 0); return t < 60 ? `${t}″` : `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
  const fmtKm = d => (Math.round((+d || 0) * 100) / 100).toLocaleString();
  function setLabel(ex, s, mode) {
    mode = mode || (s.t != null && s.r == null ? (s.d != null ? 'cardio' : 'time') : 'wr');
    if (mode === 'time') return `${fmtSec(s.t)}${s.w > 0 ? ` +${fmtKg(s.w)}` : ''}`;
    if (mode === 'cardio') return `${Math.round((s.t || 0) / 60)}′${s.d > 0 ? ` · ${fmtKm(s.d)}km` : ''}`;
    return s.w > 0 ? `${fmtKg(s.w)}×${s.r}` : `${s.r} ${LANG === 'he' ? 'חז׳' : 'reps'}`;
  }
  // ציון לסט: [ראשי, משני]. שיא = ראשי גבוה יותר, או שניהם 0 והמשני גבוה יותר.
  function setScore(mode, s) {
    if (mode === 'time') return [+s.t || 0, +s.w || 0];
    if (mode === 'cardio') return [+s.d || 0, +s.t || 0];
    return [e1rm(+s.w || 0, +s.r || 0), +s.r || 0];
  }
  const beats = (a, b) => a[0] > b[0] + 1e-9 || (a[0] === 0 && b[0] === 0 && a[1] > b[1]);
  const setValid = (mode, s) => mode === 'wr' ? +s.r > 0 : +s.t > 0 || (mode === 'cardio' && +s.d > 0);

  // ── אישור בתוך האפליקציה (במקום confirm של הדפדפן) ──
  function appConfirm(text, yesLabel, danger) {
    return new Promise(resolve => {
      const ov = document.getElementById('confirm-overlay');
      const yes = document.getElementById('confirm-yes');
      const no = document.getElementById('confirm-no');
      document.getElementById('confirm-title').textContent = T('confirmT');
      document.getElementById('confirm-text').textContent = text;
      yes.textContent = yesLabel || T('yes');
      yes.classList.toggle('danger', !!danger);
      yes.classList.toggle('primary', !danger);
      const done = v => { ov.classList.remove('open'); yes.onclick = no.onclick = null; ov._resolve = null; resolve(v); };
      yes.onclick = () => done(true);
      no.onclick = () => done(false);
      ov._resolve = () => done(false);          // סגירה בחזרה / Escape / רקע = "לא"
      ov.classList.add('open');
    });
  }

  // ══════════ סטטיסטיקה (נגזרת מההיסטוריה, עם מטמון) ══════════
  let STATS = null;
  function invalidateStats() { STATS = null; }
  function stats() {
    if (STATS) return STATS;
    const hist = loadHist().slice().sort((a, b) => a.start - b.start);
    const best = {};       // exId → { w, r, e, at, reps (לתרגילי משקל גוף) }
    const last = {};       // exId → { at, sets }
    const count = {};      // exId → מספר אימונים
    const prsByEntry = {}; // entryId → [{exId, label}]
    const series = {};     // exId → [{ at, v }] — הערך הטוב ביותר בכל אימון, לגרף
    hist.forEach(h => {
      (h.items || []).forEach(it => {
        const mode = it.mode || 'wr';
        const sets = (it.sets || []).filter(s => setValid(mode, s));
        if (!sets.length) return;
        count[it.exId] = (count[it.exId] || 0) + 1;
        last[it.exId] = { at: h.start, sets, mode };
        let top = [0, 0];
        sets.forEach(s => {
          const sc = setScore(mode, s);
          if (beats(sc, top)) top = sc;
          const b = best[it.exId];
          if (!b) { best[it.exId] = { ...s, mode, e: sc[0], sc, at: h.start, firstHid: h.id }; return; }
          if (beats(sc, b.sc)) {
            best[it.exId] = { ...s, mode, e: sc[0], sc, at: h.start, firstHid: b.firstHid };
            // באימון הראשון בתרגיל אין "שיא" — רק קובעים בסיס
            if (h.id !== b.firstHid) (prsByEntry[h.id] = prsByEntry[h.id] || []).push({ exId: it.exId, mode, ...s });
          }
        });
        (series[it.exId] = series[it.exId] || []).push({ at: h.start, v: top[0] || top[1], mode, kind: top[0] ? 0 : 1 });
      });
    });
    STATS = { hist, best, last, count, prsByEntry, series };
    return STATS;
  }
  const histVolume = h => (h.items || []).reduce((v, it) => v + ((it.mode || 'wr') !== 'wr' ? 0 : (it.sets || []).reduce((a, s) => a + (s.w > 0 ? s.w * s.r : 0), 0)), 0);
  const histSets   = h => (h.items || []).reduce((v, it) => v + (it.sets || []).length, 0);

  function weekStreak(hist) {
    const weeks = new Set(hist.map(h => startOfWeek(h.start)));
    let w = startOfWeek(Date.now());
    if (!weeks.has(w)) w -= 7 * 864e5;          // השבוע עוד לא נגמר — לא שובר את הרצף
    let n = 0;
    while (weeks.has(w)) { n++; const d = new Date(w); d.setDate(d.getDate() - 7); w = d.getTime(); }
    return n;
  }

  // ══════════ ניווט בין המסכים ══════════
  let VIEW = 'home';
  function showView(v, opts = {}) {
    if (!['home', 'lib', 'wo', 'prog'].includes(v)) v = 'home';
    const prev = VIEW;
    VIEW = v;
    document.body.dataset.view = v;
    document.querySelectorAll('[data-view]').forEach(b => {
      if (b.tagName === 'BUTTON') b.classList.toggle('active', b.dataset.view === v);
    });
    document.getElementById('home-view').hidden = v !== 'home';
    document.getElementById('workouts-view').hidden = v !== 'wo';
    document.getElementById('prog-view').hidden = v !== 'prog';
    if (v === 'home') renderHome();
    if (v === 'wo') renderWorkouts();
    if (v === 'prog') renderProgress();
    document.querySelector('.main-content').scrollTop = 0;
    if (!opts.fromPop && prev !== v) {
      if (prev === 'home' && v !== 'home') history.pushState({ an: 'view', v }, '');
      else if (v === 'home' && history.state && history.state.an === 'view') { navSkipPop = true; history.back(); }
      else history.replaceState({ an: 'view', v }, '');
    }
  }
  let navSkipPop = false;

  // ══════════ בית ══════════
  function plannedFor(day) { return loadWo().filter(w => (w.days || []).includes(day) && w.items.length); }

  function renderHome() {
    const now = new Date();
    const h = now.getHours();
    const name = (localStorage.getItem('appnest-username') || '').trim();
    const hi = h < 5 ? T('helloNight') : h < 12 ? T('helloMorning') : h < 17 ? T('helloNoon') : h < 22 ? T('helloEvening') : T('helloNight');
    document.getElementById('home-hello').innerHTML = esc(hi) + (name ? `, <span>${esc(name)}</span>` : '');
    document.getElementById('home-date').textContent = now.toLocaleDateString(LANG === 'he' ? 'he-IL' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

    const { hist } = stats();
    const ws = loadWo();

    // המשך אימון פתוח
    const resume = document.getElementById('home-resume');
    const saved = sessFromSaved(store.get(SESS_KEY, null));
    if (saved && saved.items && !document.getElementById('session-overlay').classList.contains('open')) {
      const d = saved.items.reduce((a, it) => a + (it.sets || []).filter(s => s.done).length, 0);
      const mins = Math.max(1, Math.round((Date.now() - saved.startedAt) / 60000));
      resume.innerHTML = `<div class="hcard accent"><div class="today-row">
        <div class="today-ic">⏱</div>
        <div class="today-txt"><div class="today-lbl">${esc(T('resumeT'))}</div>
        <div class="today-name">${esc(saved.name)}</div><div class="today-sub">${esc(T('resumeS')(d, mins))}</div></div>
        <button class="big-btn" id="home-resume-btn">${esc(T('resumeBtn'))}</button></div></div>`;
      document.getElementById('home-resume-btn').onclick = () => resumeSession();
    } else resume.innerHTML = '';

    // פס השבוע
    const wk = startOfWeek(Date.now());
    const doneDays = new Set(hist.filter(x => x.start >= wk).map(x => new Date(x.start).getDay()));
    const planDays = new Set(); ws.forEach(w => w.items.length && (w.days || []).forEach(d => planDays.add(d)));
    let cells = '';
    for (let i = 0; i < 7; i++) {
      const d = new Date(wk); d.setDate(d.getDate() + i);
      const cls = ['wd', doneDays.has(i) ? 'done' : '', planDays.has(i) ? 'plan' : '', i === now.getDay() ? 'today' : ''].join(' ');
      cells += `<div class="${cls}"><span class="wd-n">${T('dayShort')[i]}</span><span class="wd-d">${d.getDate()}</span><span class="wd-dot"></span></div>`;
    }
    document.getElementById('home-week').innerHTML = `<div class="hcard-h"><span>${esc(T('thisWeek'))}</span><span>${planDays.size ? doneDays.size + '/' + planDays.size : ''}</span></div><div class="week">${cells}</div>`;

    // האימון של היום
    const today = document.getElementById('home-today');
    const todays = plannedFor(now.getDay());
    if (!ws.length) {
      today.innerHTML = `<div class="hcard"><div class="cta-row">
        <button class="cta wide accent" id="cta-build"><span class="ic">🎯</span><b>${esc(T('ctaBuildT'))}</b><small>${esc(T('ctaBuildS'))}</small></button>
        <button class="cta" id="cta-plans"><span class="ic">📋</span><b>${esc(T('ctaPlansT'))}</b><small>${esc(T('ctaPlansS'))}</small></button>
        <button class="cta" id="cta-own"><span class="ic">✏️</span><b>${esc(T('ctaOwnT'))}</b><small>${esc(T('ctaOwnS'))}</small></button>
      </div></div>`;
      document.getElementById('cta-plans').onclick = openPlans;
      document.getElementById('cta-build').onclick = openBuilder;
      document.getElementById('cta-own').onclick = () => { newWorkout(); showView('wo'); };
    } else if (todays.length) {
      const doneToday = new Set(hist.filter(x => startOfDay(x.start) === startOfDay(Date.now())).map(x => x.woId));
      today.innerHTML = todays.map(w => `<div class="hcard ${doneToday.has(w.id) ? '' : 'accent'}"><div class="today-row">
        <div class="today-ic">${doneToday.has(w.id) ? '✓' : '🏋️'}</div>
        <div class="today-txt"><div class="today-lbl">${esc(T('todayWorkout'))}</div>
        <div class="today-name">${esc(w.name)}</div><div class="today-sub">${esc(T('woExercises')(w.items.length))}${w.rest ? ' · ' + esc(T('restSec')) + ' ' + w.rest + ' ' + T('secShort') : ''}</div></div>
        <button class="big-btn" data-start="${w.id}">${esc(T('startNow'))}</button></div></div>`).join('');
    } else {
      // יום מנוחה — האימון המתוכנן הבא
      let next = null;
      for (let i = 1; i <= 7 && !next; i++) {
        const day = (now.getDay() + i) % 7;
        const p = plannedFor(day);
        if (p.length) next = { w: p[0], day };
      }
      today.innerHTML = `<div class="hcard"><div class="today-row">
        <div class="today-ic" style="background:var(--bg-elevated);color:var(--text-primary)">😌</div>
        <div class="today-txt"><div class="today-name">${esc(T('restDay'))}</div>
        <div class="today-sub">${next ? esc(T('nextIs')(next.w.name, T('dayLong')[next.day])) : esc(T('noPlanYet'))}</div></div>
        <button class="an-btn" id="home-anyway">${esc(T('trainAnyway'))}</button></div></div>`;
      document.getElementById('home-anyway').onclick = () => showView('wo');
    }
    today.querySelectorAll('[data-start]').forEach(b => b.onclick = () => startSession(b.dataset.start));

    // אריחים
    const weekHist = hist.filter(x => x.start >= wk);
    document.getElementById('home-tiles').innerHTML = [
      [T('tWeek'), `${weekHist.length}${planDays.size ? `<small>/ ${planDays.size}</small>` : ''}`],
      [T('tStreak'), weekStreak(hist)],
      [T('tTotal'), hist.length],
      [T('tVolWeek'), fmtVol(weekHist.reduce((a, x) => a + histVolume(x), 0))],
    ].map(([l, v], i) => `<div class="tile"><div class="tile-l">${esc(l)}</div><div class="tile-v ${i === 1 ? 'acc' : ''}">${v}</div></div>`).join('');

    // האימון האחרון
    const lastEl = document.getElementById('home-last');
    const lh = hist[hist.length - 1];
    lastEl.innerHTML = lh ? `<div class="hcard"><div class="hcard-h"><span>${esc(T('lastWorkout'))}</span></div>${histRow(lh)}</div>` : '';
    lastEl.querySelectorAll('[data-hist]').forEach(b => b.onclick = () => openHist(b.dataset.hist));

    // מועדפים
    const favs = loadFavs().map(exById).filter(Boolean);
    document.getElementById('home-favs').innerHTML = `<div class="hcard-h"><span>${esc(T('favsTitle'))}</span></div>` +
      (favs.length ? `<div class="fav-strip">${favs.map(ex => `<button class="fav-it" data-ex="${ex.id}"><img src="${exThumb(ex)}" alt="" loading="lazy"><span>${esc(exName(ex))}</span></button>`).join('')}</div>`
                   : `<div class="empty-mini">${esc(T('favsEmpty'))}</div>`);
    document.querySelectorAll('#home-favs [data-ex]').forEach(b => b.onclick = () => openModal(b.dataset.ex));
  }

  function histRow(h) {
    const d = new Date(h.start);
    const prs = (stats().prsByEntry[h.id] || []).length;
    return `<button class="hrow" data-hist="${h.id}">
      <span class="hrow-date"><b>${d.getDate()}</b><small>${d.toLocaleDateString(LANG === 'he' ? 'he-IL' : 'en-GB', { month: 'short' })}</small></span>
      <span class="hrow-mid"><b>${esc(h.name)}</b><small>${esc(T('setsN')(histSets(h)))} · ${fmtDur(h.end - h.start)}${histVolume(h) ? ' · ' + Math.round(histVolume(h)).toLocaleString() + ' ' + T('kg') : ''}</small></span>
      ${prs ? `<span class="hrow-pr">${esc(T('prBadge')(prs))}</span>` : ''}
      <span class="hrow-go">‹</span></button>`;
  }

  // ══════════ התקדמות ══════════
  let progDays = 7;
  function renderProgress() {
    const { hist, best, prsByEntry } = stats();
    const now = Date.now();
    const m0 = new Date(); m0.setDate(1); m0.setHours(0, 0, 0, 0);
    const month = hist.filter(h => h.start >= m0.getTime());
    const totalMs = hist.reduce((a, h) => a + (h.end - h.start), 0);
    document.getElementById('prog-tiles').innerHTML = [
      [T('tTotal'), hist.length], [T('tMonth'), month.length], [T('tStreak'), weekStreak(hist)],
      [T('tTime'), totalMs ? fmtDur(totalMs) : '0'],
    ].map(([l, v], i) => `<div class="tile"><div class="tile-l">${esc(l)}</div><div class="tile-v ${i === 2 ? 'acc' : ''}">${v}</div></div>`).join('');

    // מפת חום — 18 שבועות, עמודה לכל שבוע, שורה לכל יום
    const perDay = {};
    hist.forEach(h => { const k = dayKey(h.start); perDay[k] = (perDay[k] || 0) + histSets(h); });
    const first = new Date(startOfWeek(now)); first.setDate(first.getDate() - 17 * 7);
    let cells = '';
    for (let i = 0; i < 18 * 7; i++) {
      const d = new Date(first); d.setDate(d.getDate() + i);
      const n = perDay[dayKey(d)] || 0;
      const lvl = n === 0 ? 'l0' : n < 8 ? 'l1' : n < 16 ? 'l2' : 'l3';
      const fut = d.getTime() > now;
      cells += `<i class="${lvl}${fut ? ' fut' : ''}${dayKey(d) === dayKey(now) ? ' now' : ''}" title="${d.toLocaleDateString()}${n ? ' · ' + n : ''}"></i>`;
    }
    document.getElementById('prog-heat').innerHTML = cells;

    // סטים לפי אזור גוף
    const since = now - progDays * 864e5;
    const per = {};
    hist.filter(h => h.start >= since).forEach(h => (h.items || []).forEach(it => {
      const ex = exById(it.exId); if (!ex) return;
      per[ex.category] = (per[ex.category] || 0) + (it.sets || []).length;
    }));
    const rows = Object.entries(per).sort((a, b) => b[1] - a[1]);
    const max = rows.length ? rows[0][1] : 1;
    document.getElementById('prog-muscles').innerHTML = rows.length
      ? rows.map(([c, n]) => `<div class="mbar"><span>${esc(tv(c))}</span><div class="mbar-t"><div class="mbar-f" style="width:${Math.max(4, n / max * 100)}%"></div></div><span class="mbar-n">${n}</span></div>`).join('')
      : `<div class="empty-mini">${esc(T('musclesEmpty'))}</div>`;
    document.querySelectorAll('#prog-range button').forEach(b => b.classList.toggle('active', +b.dataset.days === progDays));
    renderBodyCard();
    renderProgMap();

    // שיאים — לפי תאריך השיא, החדשים קודם
    const prs = Object.entries(best).sort((a, b) => b[1].at - a[1].at).slice(0, 15);
    document.getElementById('prog-prs').innerHTML = prs.length
      ? prs.map(([id, b]) => { const ex = exById(id); if (!ex) return '';
          const val = b.mode !== 'wr' ? `<bdi dir="ltr">${setLabel(ex, b, b.mode)}</bdi>`
            : b.w > 0 ? `<bdi dir="ltr">${fmtKg(b.w)}×${b.r}</bdi> <small>${T('kg')}</small>` : `${b.r} <small>${LANG === 'he' ? 'חזרות' : 'reps'}</small>`;
          return `<button class="pr-row" data-ex="${id}"><img src="${exThumb(ex)}" alt="" loading="lazy"><span class="n">${esc(exName(ex))}<small>${new Date(b.at).toLocaleDateString()}${b.mode === 'wr' && b.w > 0 ? ' · ' + esc(T('e1rm')) + ' ≈ ' + fmtKg(b.e) + ' ' + T('kg') : ''}</small></span><span class="v">${val}</span></button>`; }).join('')
      : `<div class="empty-mini">${esc(T('prsEmpty'))}</div>`;
    document.querySelectorAll('#prog-prs [data-ex]').forEach(b => b.onclick = () => openModal(b.dataset.ex));

    // היסטוריה
    const list = hist.slice().reverse().slice(0, 60);
    document.getElementById('prog-history').innerHTML = list.length ? list.map(histRow).join('') : `<div class="empty-mini">${esc(T('historyEmpty'))}</div>`;
    document.querySelectorAll('#prog-history [data-hist]').forEach(b => b.onclick = () => openHist(b.dataset.hist));
  }

  function histActions(btns) {
    const bar = document.getElementById('hist-actions');
    bar.innerHTML = '';
    btns.forEach(b => {
      if (b === '|') { const sp = document.createElement('span'); sp.style.flex = '1'; bar.appendChild(sp); return; }
      const el = document.createElement('button');
      el.className = 'an-btn' + (b.cls ? ' ' + b.cls : '');
      el.textContent = b.label; el.onclick = b.fn;
      bar.appendChild(el);
    });
  }

  function openHist(id) {
    const h = loadHist().find(x => x.id === id);
    if (!h) return;
    const prs = stats().prsByEntry[h.id] || [];
    const isPr = (exId, s) => prs.some(p => p.exId === exId && p.w === s.w && p.r === s.r && p.t === s.t && p.d === s.d);
    document.getElementById('hist-title').textContent = h.name;
    const d = new Date(h.start);
    document.getElementById('hist-sub').textContent =
      `${d.toLocaleDateString(LANG === 'he' ? 'he-IL' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · ${fmtDur(h.end - h.start).replace(/<[^>]+>/g, '')}${h.manual ? ' · ' + T('manualTag') : ''}`;
    document.getElementById('hist-body').innerHTML =
      `<div class="tiles small"><div class="tile"><div class="tile-l">${esc(T('tSets'))}</div><div class="tile-v">${histSets(h)}</div></div>
       <div class="tile"><div class="tile-l">${esc(T('tVolume'))}</div><div class="tile-v">${fmtVol(histVolume(h))}</div></div>
       <div class="tile"><div class="tile-l">🏆</div><div class="tile-v acc">${prs.length}</div></div></div>` +
      (h.items || []).map(it => { const ex = exById(it.exId);
        return `<div class="hx"><b>${esc(ex ? exName(ex) : it.exId)}</b><div class="hx-sets">${(it.sets || []).map(s => `<span class="${isPr(it.exId, s) ? 'pr' : ''}">${setLabel(ex, s, it.mode || 'wr')}</span>`).join('')}</div></div>`; }).join('');
    const ov = document.getElementById('hist-overlay');
    histActions([
      { label: T('histDelete'), cls: 'danger', fn: async () => {
        if (!await appConfirm(T('histDelConfirm'), T('deleteBtn'), true)) return;
        saveHist(loadHist().filter(x => x.id !== id));
        ov.classList.remove('open');
        refreshViews();
      } },
      '|',
      { label: T('histEdit'), fn: () => openHistEditor(JSON.parse(JSON.stringify(h)), false) },
      { label: '📤', fn: () => openShare(h.id) },
      { label: T('close'), cls: 'primary', fn: () => ov.classList.remove('open') },
    ]);
    if (!ov.classList.contains('open')) ov.classList.add('open');
  }

  // ── עריכת אימון שנשמר / רישום אימון ידני ──
  const toLocalInput = t => { const d = new Date(t); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };
  function openManualLog() {
    const now = Date.now();
    const draft = { id: uid(), woId: null, name: T('manualName'), start: now - 60 * 60000, end: now, items: [], manual: true };
    openHistEditor(draft, true);
  }

  function openHistEditor(h, isNew) {
    const ov = document.getElementById('hist-overlay');
    document.getElementById('hist-title').textContent = isNew ? T('manualTitle') : T('histEditTitle');
    document.getElementById('hist-sub').textContent = isNew ? T('manualSub') : h.name;
    const body = document.getElementById('hist-body');
    const durMin = () => Math.max(1, Math.round((h.end - h.start) / 60000));

    function draw() {
      const wos = loadWo().filter(w => w.items.length);
      body.innerHTML = `
        <div class="he-grid">
          <label>${esc(T('heName'))}<input class="an-input" id="he-name" maxlength="40" value="${esc(h.name)}"></label>
          <label>${esc(T('heWhen'))}<input class="an-input" id="he-when" type="datetime-local" value="${toLocalInput(h.start)}" max="${toLocalInput(Date.now())}"></label>
          <label>${esc(T('heDur'))}<input class="an-input" id="he-dur" type="number" inputmode="numeric" min="1" max="600" value="${durMin()}"></label>
          ${isNew && wos.length && !h.items.length ? `<label>${esc(T('heFromWo'))}<select class="an-input" id="he-from"><option value="">—</option>${wos.map(w => `<option value="${w.id}">${esc(w.name)}</option>`).join('')}</select></label>` : ''}
        </div>
        <div id="he-items"></div>
        <div class="he-add">
          <input class="an-input" id="he-search" type="search" autocomplete="off" placeholder="${esc(T('heAddPh'))}">
          <div id="he-results"></div>
        </div>`;
      const sync = () => {
        h.name = document.getElementById('he-name').value.trim() || h.name;
        const t = new Date(document.getElementById('he-when').value).getTime();
        if (!isNaN(t)) { const dm = durMin(); h.start = Math.min(t, Date.now()); h.end = h.start + dm * 60000; }
        const dm = Math.max(1, Math.min(600, +document.getElementById('he-dur').value || durMin()));
        h.end = h.start + dm * 60000;
      };
      ['he-name', 'he-when', 'he-dur'].forEach(i => document.getElementById(i).addEventListener('change', sync));
      const from = document.getElementById('he-from');
      if (from) from.addEventListener('change', () => {
        const w = loadWo().find(x => x.id === from.value); if (!w) return;
        sync();
        const { last } = stats();
        h.woId = w.id; h.name = w.name;
        h.items = w.items.filter(i => exById(i.exId)).map(i => {
          const ex = exById(i.exId), mode = itemMode(i, ex), l = last[i.exId] && last[i.exId].mode === mode ? last[i.exId].sets : [];
          return { exId: i.exId, mode, sets: Array.from({ length: +i.sets || 1 }, (_, k) => {
            const p = l[k] || l[l.length - 1];
            return mode === 'time' ? { t: p ? p.t : +i.reps, w: p ? p.w : 0 } : mode === 'cardio' ? { t: p ? p.t : +i.reps * 60, d: p ? p.d : 0 } : { w: p ? p.w : 0, r: p ? p.r : +i.reps };
          }) };
        });
        draw();
      });
      drawItems();
      const search = document.getElementById('he-search'), res = document.getElementById('he-results');
      search.addEventListener('input', () => {
        const q = search.value.toLowerCase().trim();
        if (q.length < 2) { res.innerHTML = ''; return; }
        const hits = state.exercises.filter(e => e._idx.includes(q)).slice(0, 8);
        res.innerHTML = hits.map(e => `<button class="swap-row" data-id="${e.id}"><img src="${e.image}" alt="" loading="lazy"><span>${esc(exName(e))}<small>${esc(tv(e.equipment))}</small></span></button>`).join('');
        res.querySelectorAll('[data-id]').forEach(b => b.onclick = () => {
          sync();
          const ex = exById(b.dataset.id), mode = autoMode(ex), d = MODE_DEF[mode];
          h.items.push({ exId: ex.id, mode, sets: [mode === 'time' ? { t: d.reps, w: 0 } : mode === 'cardio' ? { t: d.reps * 60, d: 0 } : { w: 0, r: d.reps }] });
          search.value = ''; res.innerHTML = '';
          drawItems();
        });
      });
    }

    function drawItems() {
      const box = document.getElementById('he-items');
      if (!h.items.length) { box.innerHTML = `<div class="empty-mini">${esc(T('heEmpty'))}</div>`; return; }
      box.innerHTML = '';
      h.items.forEach((it, ii) => {
        const ex = exById(it.exId); if (!ex) return;
        const mode = it.mode || 'wr';
        const keys = mode === 'time' ? [['t', T('colSec'), 1, 1], ['w', T('colKg'), 1, 0.5]] : mode === 'cardio' ? [['t', T('colMin'), 1 / 60, 0.1], ['d', T('colKm'), 1, 0.1]] : [['w', T('colKg'), 1, 0.5], ['r', T('colReps'), 1, 1]];
        const card = document.createElement('div');
        card.className = 'he-ex';
        card.innerHTML = `<div class="he-ex-h"><b>${esc(exName(ex))}</b><button class="wo-item-btn" data-rmex title="${esc(T('removeBtn'))}">×</button></div>
          <table class="set-tbl"><thead><tr><th>${esc(T('colSet'))}</th><th>${esc(keys[0][1])}</th><th>${esc(keys[1][1])}</th><th></th></tr></thead><tbody>${
          it.sets.map((s, si) => `<tr><td><span class="set-n">${si + 1}</span></td>${keys.map(([k, , mul, step]) =>
            `<td><input class="set-in" type="number" inputmode="decimal" min="0" step="${step}" data-si="${si}" data-k="${k}" value="${s[k] ? Math.round(s[k] * mul * 10) / 10 : ''}" placeholder="0"></td>`).join('')}
            <td>${it.sets.length > 1 ? `<button class="set-x" data-rms="${si}">×</button>` : ''}</td></tr>`).join('')}</tbody></table>
          <button class="sess-add-set" data-adds>${esc(T('addSet'))}</button>`;
        card.querySelectorAll('.set-in').forEach(inp => inp.addEventListener('change', () => {
          const k = inp.dataset.k, mul = keys.find(x => x[0] === k)[2];
          it.sets[+inp.dataset.si][k] = Math.max(0, (+inp.value || 0) / mul);
          if (k === 'r') it.sets[+inp.dataset.si][k] = Math.round(it.sets[+inp.dataset.si][k]);
        }));
        card.querySelector('[data-rmex]').onclick = () => { h.items.splice(ii, 1); drawItems(); };
        card.querySelectorAll('[data-rms]').forEach(b => b.onclick = () => { it.sets.splice(+b.dataset.rms, 1); drawItems(); });
        card.querySelector('[data-adds]').onclick = () => { it.sets.push({ ...it.sets[it.sets.length - 1] }); drawItems(); };
        box.appendChild(card);
      });
    }

    draw();
    histActions([
      { label: T('cancel'), fn: () => isNew ? ov.classList.remove('open') : openHist(h.id) },
      '|',
      { label: T('save'), cls: 'primary', fn: () => {
        // שמירה: רק סטים עם ערך, רק תרגילים עם סטים
        document.querySelectorAll('#he-name,#he-when,#he-dur').forEach(el => el.dispatchEvent(new Event('change')));
        h.items = h.items.map(it => ({ ...it, sets: it.sets.filter(s => setValid(it.mode || 'wr', s)) })).filter(it => it.sets.length);
        if (!h.items.length) { toast(T('heNeedSet')); return; }
        const all = loadHist();
        const i = all.findIndex(x => x.id === h.id);
        if (i >= 0) all[i] = h; else all.push(h);
        saveHist(all);
        toast(isNew ? T('manualSaved') : T('histSaved'));
        refreshViews();
        openHist(h.id);
      } },
    ]);
    if (!ov.classList.contains('open')) ov.classList.add('open');
  }

  function exportCsv() {
    const hist = stats().hist;
    if (!hist.length) { toast(T('csvEmpty')); return; }
    const q = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
    const rows = [['date', 'time', 'workout', 'exercise', 'exercise_he', 'type', 'set', 'weight_kg', 'reps', 'seconds', 'distance_km', 'workout_min'].join(',')];
    hist.forEach(h => {
      const d = new Date(h.start);
      (h.items || []).forEach(it => { const ex = exById(it.exId);
        (it.sets || []).forEach((s, i) => rows.push([
          d.toISOString().slice(0, 10), d.toTimeString().slice(0, 5), h.name, ex ? ex.name : it.exId, ex ? heName(ex) : '',
          it.mode || 'wr', i + 1, s.w || 0, s.r == null ? '' : s.r, s.t == null ? '' : s.t, s.d == null ? '' : s.d, Math.round((h.end - h.start) / 60000)].map(q).join(',')));
      });
    });
    const user = (localStorage.getItem('appnest-username') || '').trim();
    rows.unshift(q(`AppNest · ${LANG === 'he' ? 'ספריית הכושר' : 'Exercise Library'}${user ? ' · ' + user : ''} · ${new Date().toLocaleDateString()}`));
    downloadFile('﻿' + rows.join('\r\n'), `fitness-history-${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv;charset=utf-8');
  }

  function downloadFile(text, name, type) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }


  // ══════════ גרף התקדמות לתרגיל (SVG, סדרה אחת, צבע הערכה) ══════════
  function exChartHtml(exId) {
    const ser = (stats().series[exId] || []);
    if (ser.length < 2) return '';
    const last = ser[ser.length - 1];
    const pts = ser.filter(p => p.mode === last.mode && p.kind === last.kind).slice(-24);
    if (pts.length < 2) return '';
    const ex = exById(exId);
    const unit = last.mode === 'time' ? 'sec' : last.mode === 'cardio' ? (last.kind === 0 ? 'km' : 'sec') : last.kind === 0 ? 'kg' : 'reps';
    const fmtV = v => unit === 'sec' ? fmtSec(v) : unit === 'km' ? fmtKm(v) + ' km' : unit === 'kg' ? fmtKg(v) + ' ' + T('kg') : v + ' ' + (LANG === 'he' ? 'חז׳' : 'reps');
    const title = unit === 'kg' ? T('chartE1rm') : unit === 'reps' ? T('chartReps') : unit === 'sec' ? T('chartTime') : T('chartDist');
    const W = 320, H = 132, L = 8, R = 8, Tp = 16, B = 22;
    const vs = pts.map(p => p.v), lo = Math.min(...vs), hi = Math.max(...vs);
    const pad = (hi - lo) * 0.15 || Math.max(1, hi * 0.1);
    const y0 = Math.max(0, lo - pad), y1 = hi + pad;
    const t0 = pts[0].at, t1 = pts[pts.length - 1].at;
    const X = t => L + (t1 === t0 ? 0.5 : (t - t0) / (t1 - t0)) * (W - L - R);
    const Y = v => Tp + (1 - (v - y0) / (y1 - y0)) * (H - Tp - B);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.at).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
    const area = `${d} L${X(t1).toFixed(1)},${H - B} L${X(t0).toFixed(1)},${H - B} Z`;
    const first = pts[0].v, delta = last.v - first;
    const fmtD = t => new Date(t).toLocaleDateString(LANG === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short' });
    const dots = pts.map((p, i) => `<circle class="xc-dot" cx="${X(p.at).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${i === pts.length - 1 ? 4.5 : 3}" data-i="${i}"></circle>
      <rect class="xc-hit" x="${(X(p.at) - 14).toFixed(1)}" y="0" width="28" height="${H}" data-i="${i}"></rect>`).join('');
    const grid = [0.25, 0.5, 0.75].map(f => `<line class="xc-grid" x1="${L}" x2="${W - R}" y1="${(Tp + f * (H - Tp - B)).toFixed(1)}" y2="${(Tp + f * (H - Tp - B)).toFixed(1)}"></line>`).join('');
    const data = esc(JSON.stringify(pts.map(p => [fmtD(p.at), fmtV(p.v)])));
    return `<div class="xchart" data-pts="${data}">
      <div class="xc-head"><b>${esc(title)}</b><span class="${delta > 0 ? 'xc-up' : ''}" dir="ltr">${delta > 0 ? '▲ ' : delta < 0 ? '▼ ' : ''}${esc(fmtV(Math.abs(delta)))}</span></div>
      <svg viewBox="0 0 ${W} ${H}" class="xc-svg" role="img" aria-label="${esc(title)}: ${esc(fmtV(first))} → ${esc(fmtV(last.v))}" style="direction:ltr">
        ${grid}<line class="xc-axis" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"></line>
        <path class="xc-area" d="${area}"></path><path class="xc-line" d="${d}"></path>${dots}
        <text class="xc-lbl" x="${L}" y="${H - 6}" text-anchor="start">${esc(fmtD(t0))}</text>
        <text class="xc-lbl" x="${W - R}" y="${H - 6}" text-anchor="end">${esc(fmtD(t1))}</text>
      </svg>
      <div class="xc-read" aria-live="polite">${esc(fmtD(t1))} · <b>${esc(fmtV(last.v))}</b></div>
    </div>`;
  }
  // נגיעה / ריחוף על נקודה מציגים את הערך שלה
  document.addEventListener('pointerover', xcRead);
  document.addEventListener('click', xcRead);
  function xcRead(e) {
    const h = e.target.closest && e.target.closest('.xc-hit');
    if (!h) return;
    const box = h.closest('.xchart'), pts = JSON.parse(box.dataset.pts), i = +h.dataset.i;
    box.querySelectorAll('.xc-dot').forEach((c, k) => c.classList.toggle('on', k === i));
    box.querySelector('.xc-read').innerHTML = `${esc(pts[i][0])} · <b>${esc(pts[i][1])}</b>`;
  }

  // ══════════ גיבוי מלא ══════════
  const BACKUP_KEYS = ['appnest-workouts', 'appnest-history', 'appnest-favs', 'appnest-reminder', 'appnest-username', 'appnest-palette', 'appnest-mode', 'appnest-lang', 'appnest-libview', 'appnest-autoprog',
    'appnest-profile', 'appnest-custom-ex', 'appnest-body', 'appnest-bodytrack', 'appnest-plates', 'appnest-asst'];   // מפתח ה-AI לא נכנס לגיבוי
  function exportBackup() {
    const data = {};
    BACKUP_KEYS.forEach(k => { const v = localStorage.getItem(k); if (v != null) data[k] = v; });
    const user = (localStorage.getItem('appnest-username') || '').trim();
    const payload = { app: 'appnest-fitness-library', version: APP_VERSION, exportedAt: new Date().toISOString(), user, data };
    const slug = user ? '-' + user.replace(/[^\w֐-׿-]+/g, '_') : '';
    downloadFile(JSON.stringify(payload, null, 2), `fitness-backup${slug}-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  }
  async function importBackup(file) {
    let obj;
    try { obj = JSON.parse(await file.text()); } catch { toast(T('importErr')); return; }
    let data = null;
    if (Array.isArray(obj)) data = { 'appnest-workouts': JSON.stringify(obj) };               // גיבוי ישן (1.x)
    else if (obj && obj.data && typeof obj.data === 'object') data = obj.data;
    if (!data || !Object.keys(data).length) { toast(T('importErr')); return; }
    if (!await appConfirm(T('importConfirm'), T('importReplace'), true)) return;
    BACKUP_KEYS.forEach(k => { if (k !== 'appnest-lang' && k !== 'appnest-palette' && k !== 'appnest-mode') localStorage.removeItem(k); });
    Object.entries(data).forEach(([k, v]) => { if (BACKUP_KEYS.includes(k) && typeof v === 'string') localStorage.setItem(k, v); });
    toast(T('importOk'));
    setTimeout(() => location.reload(), 700);
  }

  // ══════════ מועדפים ══════════
  function toggleFav(id) {
    const f = loadFavs();
    const i = f.indexOf(id);
    if (i >= 0) f.splice(i, 1); else f.unshift(id);
    saveFavs(f);
    toast(i >= 0 ? T('favRemoved') : T('favAdded'));
    syncFavUI(id);
  }
  function syncFavUI(id) {
    const on = isFav(id);
    const mf = document.getElementById('modal-fav');
    if (mf && modalGif.dataset.exId === id) { mf.textContent = on ? '★' : '☆'; mf.classList.toggle('on', on); }
    document.querySelectorAll(`.exercise-card[data-id="${id}"] .card-star`).forEach(s => s.hidden = !on);
    if (state.favOnly) applyFilters();
    if (VIEW === 'home') renderHome();
  }

  // ══════════ האימונים שלי ══════════
  function newWorkout(name) {
    const ws = loadWo();
    const w = { id: uid(), name: name || T('woDefaultName'), items: [], days: [], rest: 90 };
    ws.push(w); saveWo(ws);
    return w;
  }

  function initWorkouts() {
    document.getElementById('wo-new').addEventListener('click', () => { newWorkout(); renderWorkouts(); });
    document.getElementById('open-plans').addEventListener('click', openPlans);

    document.getElementById('wo-export').addEventListener('click', exportBackup);
    const importFile = document.getElementById('wo-import-file');
    document.getElementById('wo-import').addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', async () => {
      const f = importFile.files[0]; importFile.value = '';
      if (f) importBackup(f);
    });
    document.getElementById('csv-export').addEventListener('click', exportCsv);
    document.getElementById('manual-log').addEventListener('click', openManualLog);
    const ap = document.getElementById('autoprog-toggle');
    const paintAp = () => { ap.classList.toggle('on', autoProgOn()); ap.setAttribute('aria-checked', String(autoProgOn())); };
    ap.addEventListener('click', () => { try { localStorage.setItem(AUTOPROG_KEY, autoProgOn() ? '0' : '1'); } catch {} paintAp(); });
    paintAp();
    document.querySelectorAll('#prog-range button').forEach(b => b.addEventListener('click', () => { progDays = +b.dataset.days; renderProgress(); }));

    // הוספה מחלון התרגיל
    document.getElementById('modal-add-workout').addEventListener('click', () => openPicker(modalGif.dataset.exId));
    document.getElementById('wo-picker-close').addEventListener('click', () => document.getElementById('wo-picker').classList.remove('open'));
    document.getElementById('wo-picker-create').addEventListener('click', () => {
      const nameEl = document.getElementById('wo-picker-new');
      const w = newWorkout(nameEl.value.trim());
      nameEl.value = '';
      addToWorkout(w.id);
    });
  }

  function openPicker(exId) {
    pendingExId = exId;
    const list = document.getElementById('wo-picker-list');
    list.innerHTML = '';
    loadWo().forEach(w => {
      const b = document.createElement('button');
      b.className = 'wo-picker-item';
      const has = w.items.some(i => i.exId === exId);
      b.textContent = `${has ? '✓ ' : ''}${w.name} · ${T('woExercises')(w.items.length)}`;
      b.addEventListener('click', () => addToWorkout(w.id));
      list.appendChild(b);
    });
    document.getElementById('wo-picker').classList.add('open');
  }

  function addToWorkout(woId) {
    const ws = loadWo();
    const w = ws.find(x => x.id === woId);
    if (w && pendingExId && !w.items.some(i => i.exId === pendingExId)) {
      const ex = exById(pendingExId);
      const d = MODE_DEF[autoMode(ex)];
      w.items.push({ exId: pendingExId, sets: d.sets, reps: d.reps });
    }
    saveWo(ws);
    document.getElementById('wo-picker').classList.remove('open');
    toast(`${T('woAdded')} · ${w ? w.name : ''}`);
    const btn = document.getElementById('modal-add-workout');
    if (modalOverlay.classList.contains('open')) {
      const orig = btn.innerHTML;
      btn.innerHTML = T('woAdded');
      setTimeout(() => { btn.innerHTML = orig; applyStaticI18n(); }, 1200);
    }
    if (VIEW === 'wo') renderWorkouts();
  }

  function updateWo(id, fn) { const ws = loadWo(); const w = ws.find(x => x.id === id); if (w) { fn(w); saveWo(ws); } return w; }

  function renderWorkouts() {
    const listEl = document.getElementById('wo-list');
    listEl.innerHTML = '';
    const ws = loadWo();
    if (ws.length === 0) {
      listEl.innerHTML = `<div class="hcard"><div class="wo-empty" style="padding:20px 0 14px">${esc(T('woEmpty'))}</div>
        <div class="cta-row"><button class="cta wide accent" id="wo-cta-build"><span class="ic">🎯</span><b>${esc(T('ctaBuildT'))}</b><small>${esc(T('ctaBuildS'))}</small></button><button class="cta" id="wo-cta-plans"><span class="ic">📋</span><b>${esc(T('ctaPlansT'))}</b><small>${esc(T('ctaPlansS'))}</small></button>
        <button class="cta" id="wo-cta-own"><span class="ic">✏️</span><b>${esc(T('ctaOwnT'))}</b><small>${esc(T('ctaOwnS'))}</small></button></div></div>`;
      document.getElementById('wo-cta-plans').onclick = openPlans;
      document.getElementById('wo-cta-build').onclick = openBuilder;
      document.getElementById('wo-cta-own').onclick = () => { newWorkout(); renderWorkouts(); };
      return;
    }
    ws.forEach(w => {
      const card = document.createElement('div');
      card.className = 'wo-card';
      const items = w.items.filter(i => exById(i.exId));
      const SS = ssInfo(items);

      const head = document.createElement('div');
      head.className = 'wo-head';
      const nameIn = document.createElement('input');
      nameIn.className = 'an-input wo-name';
      nameIn.value = w.name;
      nameIn.addEventListener('change', () => updateWo(w.id, x => { x.name = nameIn.value.trim() || T('woDefaultName'); }));
      const start = document.createElement('button');
      start.className = 'wo-start';
      start.textContent = T('woStart');
      start.disabled = items.length === 0;
      if (!items.length) start.style.opacity = 0.4;
      start.addEventListener('click', () => startSession(w.id));
      const del = document.createElement('button');
      del.className = 'wo-del'; del.textContent = '🗑'; del.title = T('deleteBtn');
      del.addEventListener('click', async () => {
        if (!await appConfirm(T('woDeleteConfirm'), T('deleteBtn'), true)) return;
        saveWo(loadWo().filter(x => x.id !== w.id)); renderWorkouts();
      });
      head.append(nameIn, start, del);
      card.appendChild(head);

      // ימים בשבוע + מנוחה
      const meta = document.createElement('div');
      meta.className = 'wo-meta';
      const dl = document.createElement('span'); dl.className = 'wo-meta-l'; dl.textContent = T('planDays');
      const days = document.createElement('div'); days.className = 'wo-days';
      for (let d = 0; d < 7; d++) {
        const b = document.createElement('button');
        b.textContent = T('dayShort')[d]; b.title = T('dayLong')[d];
        b.classList.toggle('on', (w.days || []).includes(d));
        b.addEventListener('click', () => {
          const x = updateWo(w.id, x => { x.days = x.days || []; const i = x.days.indexOf(d); if (i >= 0) x.days.splice(i, 1); else x.days.push(d); x.days.sort(); });
          b.classList.toggle('on', x.days.includes(d));
        });
        days.appendChild(b);
      }
      const rl = document.createElement('span'); rl.className = 'wo-meta-l'; rl.textContent = T('restSec');
      const rest = document.createElement('select'); rest.className = 'wo-rest';
      [30, 45, 60, 90, 120, 150, 180, 240].forEach(sec => { const o = document.createElement('option'); o.value = sec; o.textContent = sec >= 60 ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : `${sec}${T('secShort')}`; rest.appendChild(o); });
      rest.value = w.rest || 90;
      rest.addEventListener('change', () => updateWo(w.id, x => { x.rest = +rest.value; }));
      const cnt = document.createElement('span'); cnt.className = 'wo-count'; cnt.style.marginInlineStart = 'auto'; cnt.textContent = T('woExercises')(items.length);
      meta.append(dl, days, rl, rest, cnt);
      card.appendChild(meta);

      if (!items.length) {
        const p = document.createElement('div');
        p.className = 'wo-empty'; p.style.padding = '10px 0';
        p.textContent = T('woNoItems');
        card.appendChild(p);
      }

      items.forEach((item, idx) => {
        const ex = exById(item.exId);
        const row = document.createElement('div');
        const ssi = SS[idx];
        row.className = 'wo-item' + (ssi ? ' ss' + (ssi.first ? ' ss-first' : '') + (ssi.last ? ' ss-last' : '') : '');
        const img = document.createElement('img');
        img.src = ex.image; img.loading = 'lazy'; img.alt = '';
        const nm = document.createElement('div');
        nm.className = 'wo-item-name';
        nm.innerHTML = `${esc(exName(ex))}<small>${ssi ? `<span class="ss-tag">🔗 ${esc(ssi.g)}${ssi.n}</span> ` : ''}${esc(tv(ex.target))} · ${esc(tv(ex.equipment))}</small>`;
        nm.style.cursor = 'pointer';
        nm.addEventListener('click', () => openModal(ex.id));
        img.style.cursor = 'pointer'; img.addEventListener('click', () => openModal(ex.id));

        const mode = itemMode(item, ex);
        const mkNum = (val, key) => {
          const wrap = document.createElement('span');
          wrap.className = 'wo-sr';
          const inp = document.createElement('input');
          const max = key === 'sets' ? 20 : mode === 'time' ? 600 : mode === 'cardio' ? 240 : 99;
          inp.type = 'number'; inp.inputMode = 'numeric'; inp.min = 1; inp.max = max; inp.value = val;
          inp.addEventListener('change', () => updateWo(w.id, x => { const it = x.items.find(i => i.exId === item.exId); if (it) it[key] = Math.min(max, Math.max(1, +inp.value || 1)); }));
          const lbl = document.createElement('span');
          lbl.textContent = key === 'sets' ? T('sets') : T(mode === 'time' ? 'unitSec' : mode === 'cardio' ? 'unitMin' : 'reps');
          wrap.append(inp, lbl);
          return wrap;
        };
        // סוג רישום: חזרות / זמן / קרדיו — אוטומטי לפי התרגיל, ואפשר לשנות
        const modeSel = document.createElement('select');
        modeSel.className = 'wo-rest wo-mode'; modeSel.title = T('modeLabel2');
        ['wr', 'time', 'cardio'].forEach(m => { const o = document.createElement('option'); o.value = m; o.textContent = T('mode_' + m); modeSel.appendChild(o); });
        modeSel.value = mode;
        modeSel.addEventListener('change', () => {
          const m = modeSel.value, d = MODE_DEF[m];
          updateWo(w.id, x => { const it = x.items.find(i => i.exId === item.exId); if (it) { it.mode = m === autoMode(ex) ? undefined : m; it.reps = d.reps; it.sets = d.sets; } });
          renderWorkouts();
        });
        const mkBtn = (txt, title, fn) => { const b = document.createElement('button'); b.className = 'wo-item-btn'; b.textContent = txt; b.title = title; b.addEventListener('click', fn); return b; };
        const up = mkBtn('↑', T('moveUp'), () => {
          if (idx === 0) return;
          updateWo(w.id, x => { const i = x.items.findIndex(i => i.exId === item.exId); if (i > 0) [x.items[i - 1], x.items[i]] = [x.items[i], x.items[i - 1]]; });
          renderWorkouts();
        });
        if (idx === 0) up.style.visibility = 'hidden';
        const swap = mkBtn('⇄', T('swapBtn'), () => openSwap(w.id, item.exId));
        const link = mkBtn('🔗', T('ssLink'), () => {
          updateWo(w.id, x => { const it = x.items.find(i => i.exId === item.exId); if (it) { if (it.link) delete it.link; else it.link = true; } });
          renderWorkouts();
        });
        link.classList.add('wo-link'); link.classList.toggle('on', !!item.link);
        if (idx === items.length - 1) link.style.visibility = 'hidden';
        const rm = mkBtn('×', T('removeBtn'), () => { updateWo(w.id, x => { x.items = x.items.filter(i => i.exId !== item.exId); }); renderWorkouts(); });
        rm.classList.add('wo-item-remove');
        const ctrl = document.createElement('div'); ctrl.className = 'wo-ctrl';
        ctrl.append(modeSel, mkNum(item.sets, 'sets'), mkNum(item.reps, 'reps'), up, link, swap, rm);
        row.append(img, nm, ctrl);
        card.appendChild(row);
      });

      const add = document.createElement('button');
      add.className = 'wo-addex'; add.textContent = T('woAddEx');
      add.addEventListener('click', () => { showView('lib'); toast(T('woAddHint')); });
      card.appendChild(add);
      listEl.appendChild(card);
    });
  }

  // ── החלפת תרגיל: אותו שריר מטרה, עדיפות לאותו ציוד ──
  function openSwap(woId, exId) {
    const ex = exById(exId); if (!ex) return;
    const w = loadWo().find(x => x.id === woId);
    const inWo = new Set(w ? w.items.map(i => i.exId) : []);
    const favs = new Set(loadFavs());
    let pool = state.exercises.filter(e => e.target === ex.target && e.id !== ex.id && !inWo.has(e.id) && !e.hidden);
    if (eqLimited()) { const mine = pool.filter(e => hasEq(e)); if (mine.length >= 3) pool = mine; }
    const cands = pool
      .map(e => ({ e, s: (favs.has(e.id) ? 4 : 0) + (e.equipment === ex.equipment ? 2 : 0) + (e.category === ex.category ? 1 : 0) - (/\bv\. ?\d|pov|\(male\)|\(female\)/i.test(e.name) ? 1 : 0) }))
      .sort((a, b) => b.s - a.s).slice(0, 14).map(x => x.e);
    document.getElementById('swap-sub').textContent = T('swapSub')(exName(ex));
    const list = document.getElementById('swap-list');
    list.innerHTML = cands.map(e => `<button class="swap-row" data-id="${e.id}"><img src="${e.image}" alt="" loading="lazy"><span>${esc(exName(e))}<small>${esc(tv(e.equipment))}${favs.has(e.id) ? ' · ⭐' : ''}</small></span></button>`).join('')
      || `<div class="empty-mini">—</div>`;
    list.querySelectorAll('[data-id]').forEach(b => b.onclick = () => {
      updateWo(woId, x => { const it = x.items.find(i => i.exId === exId); if (it) it.exId = b.dataset.id; });
      document.getElementById('swap-overlay').classList.remove('open');
      toast(T('swapDone'));
      renderWorkouts();
    });
    document.getElementById('swap-overlay').classList.add('open');
  }

  // ── תוכניות מוכנות (מזהים מתוך המאגר) ──
  const PLANS = [
    { id: 'fb', he: 'גוף מלא למתחילים', en: 'Full Body — Beginner', ic: '🌱',
      dhe: 'שלושה אימונים בשבוע, כל אחד עובד על כל הגוף. הבסיס הכי טוב למי שמתחיל בחדר כושר.',
      den: 'Three sessions a week, each working the whole body. The best foundation for gym beginners.',
      tags: ['gym', 3], wos: [
        { he: 'גוף מלא', en: 'Full Body', days: [0, 2, 4], rest: 90, items: [['0043', 3, 8], ['0025', 3, 8], ['0861', 3, 10], ['0405', 3, 10], ['0586', 3, 12], ['0274', 3, 15]] }] },
    { id: 'ppl', he: 'דחיפה · משיכה · רגליים', en: 'Push · Pull · Legs', ic: '🔁',
      dhe: 'החלוקה הקלאסית: יום חזה-כתפיים-יד אחורית, יום גב-יד קדמית ויום רגליים. 5–6 אימונים בשבוע.',
      den: 'The classic split: chest-shoulders-triceps, back-biceps, and legs. 5–6 sessions a week.',
      tags: ['gym', 5], wos: [
        { he: 'דחיפה', en: 'Push', days: [0, 3], rest: 120, items: [['0025', 4, 8], ['0314', 3, 10], ['0405', 3, 10], ['0334', 3, 12], ['0201', 3, 12]] },
        { he: 'משיכה', en: 'Pull', days: [1, 4], rest: 120, items: [['0032', 3, 5], ['0198', 3, 10], ['0027', 3, 8], ['0031', 3, 10], ['0313', 3, 12]] },
        { he: 'רגליים', en: 'Legs', days: [2], rest: 120, items: [['0043', 4, 8], ['0739', 3, 10], ['0085', 3, 10], ['0585', 3, 12], ['0594', 4, 15]] }] },
    { id: 'ul', he: 'עליון / תחתון', en: 'Upper / Lower', ic: '↕️',
      dhe: 'ארבעה אימונים בשבוע: פלג גוף עליון ותחתון לסירוגין. איזון טוב בין עומס למנוחה.',
      den: 'Four sessions a week alternating upper and lower body. A good balance of load and rest.',
      tags: ['gym', 4], wos: [
        { he: 'פלג גוף עליון', en: 'Upper Body', days: [0, 3], rest: 90, items: [['0025', 4, 8], ['0027', 4, 8], ['0426', 3, 10], ['0198', 3, 10], ['0294', 3, 12], ['0201', 3, 12]] },
        { he: 'פלג גוף תחתון', en: 'Lower Body', days: [1, 4], rest: 120, items: [['0043', 4, 8], ['0085', 3, 10], ['0739', 3, 12], ['0586', 3, 12], ['1372', 4, 15], ['0472', 3, 10]] }] },
    { id: 'home', he: 'בבית בלי ציוד', en: 'Home — No Equipment', ic: '🏠',
      dhe: 'משקל גוף בלבד, צריך רק כיסא יציב ומקום על הרצפה. מתאים לימים בלי חדר כושר.',
      den: 'Bodyweight only — all you need is a sturdy chair and some floor space.',
      tags: ['home', 3], wos: [
        { he: 'בית — משקל גוף', en: 'Home — Bodyweight', days: [0, 2, 4], rest: 60, items: [['0662', 3, 10], ['1460', 3, 10], ['0129', 3, 10], ['3561', 3, 12], ['0630', 3, 20], ['0276', 3, 12], ['1160', 3, 8]] }] },
    { id: 'db', he: 'משקולות יד בבית', en: 'Home — Dumbbells', ic: '🏋️',
      dhe: 'זוג משקולות יד מספיק לאימון גוף מלא אפקטיבי. שלוש פעמים בשבוע.',
      den: 'A pair of dumbbells is enough for an effective full-body workout. Three times a week.',
      tags: ['home', 3], wos: [
        { he: 'משקולות יד — גוף מלא', en: 'Dumbbells — Full Body', days: [0, 2, 4], rest: 75, items: [['1760', 3, 10], ['0293', 3, 10], ['0426', 3, 10], ['1459', 3, 10], ['0381', 3, 10], ['0294', 3, 12], ['0334', 3, 12]] }] },
  ];

  function openPlans() {
    const box = document.getElementById('plans-list');
    const fits = p => p.wos.every(w => w.items.every(([id]) => hasEq(exById(id))));
    const list = eqLimited() ? PLANS.slice().sort((a, b) => fits(b) - fits(a)) : PLANS;
    box.innerHTML = `<button class="plan-card plan-build" id="plans-build"><h3>🎯 ${esc(T('ctaBuildT'))}</h3><p>${esc(T('ctaBuildS'))}</p></button>` + list.map(p => {
      const n = p.wos.reduce((a, w) => a + w.items.length, 0);
      const eqTag = eqLimited() ? `<span class="${fits(p) ? 'fit' : 'miss'}">${esc(T(fits(p) ? 'eqFits' : 'eqMissing'))}</span>` : '';
      return `<div class="plan-card"><h3>${p.ic} ${esc(LANG === 'he' ? p.he : p.en)}</h3><p>${esc(LANG === 'he' ? p.dhe : p.den)}</p>
        <div class="plan-tags"><span>${p.tags[0] === 'gym' ? (LANG === 'he' ? 'חדר כושר' : 'Gym') : (LANG === 'he' ? 'בבית' : 'Home')}</span><span>${esc(T('perWeek')(p.tags[1]))}</span><span>${esc(T('woExercises')(n))}</span>${eqTag}</div>
        <button class="an-btn primary small" data-plan="${p.id}">${esc(T('planAdd'))}</button></div>`;
    }).join('');
    box.querySelectorAll('[data-plan]').forEach(b => b.onclick = () => addPlan(b.dataset.plan));
    document.getElementById('plans-build').onclick = () => { document.getElementById('plans-overlay').classList.remove('open'); openBuilder(); };
    document.getElementById('plans-overlay').classList.add('open');
  }

  function addPlan(pid) {
    const p = PLANS.find(x => x.id === pid); if (!p) return;
    const ws = loadWo();
    p.wos.forEach(w => ws.push({
      id: uid(), name: LANG === 'he' ? w.he : w.en, days: w.days.slice(), rest: w.rest,
      items: w.items.filter(([id]) => exById(id)).map(([exId, sets, reps]) => ({ exId, sets, reps })),
    }));
    saveWo(ws);
    document.getElementById('plans-overlay').classList.remove('open');
    toast(T('planAdded')(p.wos.length));
    showView('wo');
  }

  // ══════════ אימון חי ══════════
  let sess = null, restIv = null, clockIv = null, wakeLock = null;

  function sessFromSaved(saved) {
    // המרה משמירה של גרסה 1.x (done[] בלבד) לגרסה 2
    if (saved && saved.items && saved.items[0] && Array.isArray(saved.items[0].done)) {
      saved.items = saved.items.map(it => ({ exId: it.exId, sets: it.done.map(d => ({ w: '', r: it.reps, done: d })) }));
    }
    // גרסה 2.0 → 2.1: לכל תרגיל סוג רישום ויעד
    if (saved && saved.items) saved.items.forEach(it => {
      if (!it.mode) it.mode = 'wr';
      if (it.target == null) it.target = (it.sets[0] && +it.sets[0].r) || 10;
    });
    return saved;
  }

  // ── הצעה להיום (התקדמות כפולה): כל הסטים הגיעו ליעד ← מעלים; אחרת נשארים ──
  const AUTOPROG_KEY = 'appnest-autoprog';
  const autoProgOn = () => localStorage.getItem(AUTOPROG_KEY) !== '0';
  function incFor(ex) {
    const e = ex ? ex.equipment : '';
    if (/kettlebell/.test(e)) return 4;
    if (/leverage machine|sled machine/.test(e)) return 5;
    if (/dumbbell/.test(e)) return 2;
    return 2.5;
  }
  function suggestFor(item, ex, mode, last) {
    if (!last || last.mode !== mode || !last.sets.length) return null;
    const target = +item.reps || MODE_DEF[mode].reps;
    const sets = last.sets;
    if (mode === 'wr') {
      const w = Math.max(...sets.map(s => +s.w || 0));
      const atTop = sets.filter(s => (+s.w || 0) === w);
      const allHit = sets.length >= (+item.sets || 1) && atTop.every(s => +s.r >= target);
      if (w > 0) {
        if (allHit) { const inc = incFor(ex); return { kind: 'up', w: w + inc, r: target, inc }; }
        return { kind: 'stay', w, r: target };
      }
      if (allHit) return { kind: 'repup', w: 0, r: Math.max(...sets.map(s => +s.r)) + 1 };
      return null;
    }
    if (mode === 'time') {
      const t = Math.max(...sets.map(s => +s.t || 0));
      if (sets.length >= (+item.sets || 1) && sets.every(s => +s.t >= target)) return { kind: 'timeup', t: Math.max(t, target) + 5 };
      return null;
    }
    return null;
  }

  function startSession(woId) {
    const w = loadWo().find(x => x.id === woId);
    const saved = sessFromSaved(store.get(SESS_KEY, null));
    if (saved && saved.woId === woId) { sess = saved; return openSession(); }
    if (!w || !w.items.some(i => exById(i.exId))) return;
    const { last } = stats();
    const prog = autoProgOn();
    sess = {
      v: 3, woId, name: w.name, startedAt: Date.now(), rest: w.rest || 90, prs: [],
      items: w.items.filter(i => exById(i.exId)).map(i => {
        const ex = exById(i.exId), mode = itemMode(i, ex);
        const l = last[i.exId] && last[i.exId].mode === mode ? last[i.exId] : null;
        const prev = l ? l.sets : [];
        const target = +i.reps || MODE_DEF[mode].reps;
        const sug = prog ? suggestFor(i, ex, mode, l) : null;
        const n = +i.sets || MODE_DEF[mode].sets;
        const sets = Array.from({ length: n }, (_, k) => {
          const p = prev[k] || prev[prev.length - 1];
          if (mode === 'time') return { w: p && p.w > 0 ? p.w : '', t: sug && sug.t ? sug.t : (p ? p.t : target), done: false };
          if (mode === 'cardio') return { t: p ? p.t : target * 60, d: p && p.d > 0 ? p.d : '', done: false };
          if (sug && sug.kind === 'up') return { w: sug.w, r: sug.r, done: false };
          if (sug && sug.kind === 'repup') return { w: '', r: sug.r, done: false };
          return { w: p && p.w > 0 ? p.w : '', r: p ? (sug && sug.kind === 'stay' ? Math.max(+p.r, 0) : p.r) : target, done: false };
        });
        return { exId: i.exId, mode, target, sug, sets, link: !!i.link };
      }),
    };
    persistSess();
    openSession();
  }
  function resumeSession() {
    const saved = sessFromSaved(store.get(SESS_KEY, null));
    if (!saved) return;
    sess = saved; openSession();
  }
  // כפתור ▶ בניווט התחתון: אימון פתוח ← אימון של היום ← מסך האימונים
  function quickStart() {
    if (store.get(SESS_KEY, null)) return resumeSession();
    const t = plannedFor(new Date().getDay());
    if (t.length === 1) return startSession(t[0].id);
    showView(loadWo().length ? 'wo' : 'home');
    if (!loadWo().length) openPlans();
  }

  function openSession() {
    persistSess();                       // שומר גם המרה מפורמט 1.x
    document.getElementById('sess-finish').hidden = true;
    document.getElementById('sess-body').hidden = false;
    renderSession();
    document.getElementById('session-overlay').classList.add('open');
    clearInterval(clockIv);
    clockIv = setInterval(updateClock, 1000);
    updateClock();
    requestWake();
    document.getElementById('bn-start').classList.add('live');
  }
  function minimizeSession() {
    stopSetTimer(false);
    stopRest();
    clearInterval(clockIv);
    releaseWake();
    document.getElementById('session-overlay').classList.remove('open');
    refreshViews();
  }

  const persistSess = () => { if (sess) store.set(SESS_KEY, sess); };

  function updateClock() {
    if (!sess) return;
    const s = Math.floor((Date.now() - sess.startedAt) / 1000);
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60;
    document.getElementById('sess-clock').textContent = (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s % 60).padStart(2, '0');
  }
  function sessTotals() {
    let done = 0, total = 0;
    sess.items.forEach(it => { it.sets.forEach(s => { total++; if (s.done) done++; }); });
    return { done, total };
  }
  function paintProgress() {
    const { done, total } = sessTotals();
    document.getElementById('sess-fill').style.width = (total ? (done / total) * 100 : 0) + '%';
    document.getElementById('sess-count').textContent = T('sessCount')(done, total);
  }

  function sugLine(it, ex) {
    const s = it.sug;
    if (!s) return '';
    if (s.kind === 'up') return `<div class="sess-sug up">📈 ${esc(T('sugUp')(fmtKg(s.w), fmtKg(s.inc), s.r))}</div>`;
    if (s.kind === 'stay') return `<div class="sess-sug">🎯 ${esc(T('sugStay')(fmtKg(s.w), s.r))}</div>`;
    if (s.kind === 'repup') return `<div class="sess-sug up">📈 ${esc(T('sugRep')(s.r))}</div>`;
    if (s.kind === 'timeup') return `<div class="sess-sug up">📈 ${esc(T('sugTime')(fmtSec(s.t)))}</div>`;
    return '';
  }

  function renderSession() {
    document.getElementById('sess-title').textContent = sess.name;
    const list = document.getElementById('sess-list');
    list.innerHTML = '';
    const { best, last } = stats();

    const SS = ssInfo(sess.items);
    sess.items.forEach((it, ei) => {
      const ex = exById(it.exId);
      if (!ex) return;
      const mode = it.mode || 'wr';
      const bw = mode === 'wr' && isBW(ex);
      const ssi = SS[ei];
      const box = document.createElement('div');
      box.className = 'sess-ex' + (it.sets.length && it.sets.every(s => s.done) ? ' done' : '') + (ssi ? ' ss' + (ssi.first ? ' ss-first' : '') + (ssi.last ? ' ss-last' : '') : '');
      box.dataset.ei = ei;

      const head = document.createElement('div');
      head.className = 'sess-ex-head';
      const img = document.createElement('img');
      img.src = ex.gif_url; img.loading = 'lazy'; img.alt = '';
      img.style.cursor = 'pointer'; img.addEventListener('click', () => openModal(ex.id));
      const nm = document.createElement('div');
      nm.className = 'sess-ex-name';
      nm.innerHTML = `${esc(exName(ex))}<small>${ssi ? `<span class="ss-tag">🔗 ${esc(T('ssLabel')(ssi.g + ssi.n))}</span> ` : ''}${esc(tv(ex.target))} · ${esc(tv(ex.equipment))}${mode !== 'wr' ? ' · ' + esc(T('mode_' + mode)) : ''}</small>`;
      nm.style.cursor = 'pointer'; nm.addEventListener('click', () => openModal(ex.id));
      head.append(img, nm);
      box.appendChild(head);

      const info = document.createElement('div');
      info.className = 'sess-last';
      const l = last[it.exId] && last[it.exId].mode === mode ? last[it.exId] : null;
      const b = best[it.exId] && best[it.exId].mode === mode ? best[it.exId] : null;
      info.innerHTML = l
        ? `<b>${esc(T('lastTime'))}</b> <span dir="ltr">${l.sets.map(s => setLabel(ex, s, mode)).join(' · ')}</span>${b ? ` &nbsp;·&nbsp; <b>${esc(T('bestEver'))}</b> <span dir="ltr">${setLabel(ex, b, mode)}</span>` : ''}`
        : esc(T('firstTime'));
      box.appendChild(info);
      if (it.sug && !it.sets.some(s => s.done)) box.insertAdjacentHTML('beforeend', sugLine(it, ex));
      if (mode === 'wr' && isBarbell(ex)) {
        const pb = document.createElement('button');
        pb.className = 'sess-mini'; pb.textContent = T('plBtn');
        pb.addEventListener('click', () => {
          const s0 = it.sets.find(x => !x.done) || it.sets[it.sets.length - 1] || {};
          openPlates(+s0.w || 0, ex, v => { it.sets.forEach(x => { if (!x.done) x.w = v; }); persistSess(); renderSession(); });
        });
        head.appendChild(pb);
      }

      const cols = mode === 'time' ? [T('colSec'), T('colKg') + ' (+)'] : mode === 'cardio' ? [T('colMin'), T('colKm')] : [bw ? T('colKg') + ' (+)' : T('colKg'), T('colReps')];
      const tbl = document.createElement('table');
      tbl.className = 'set-tbl';
      tbl.innerHTML = `<thead><tr><th>${esc(T('colSet'))}</th><th>${esc(cols[0])}</th><th>${esc(cols[1])}</th><th></th><th></th></tr></thead>`;
      const tb = document.createElement('tbody');
      // שדות לפי סוג: [מפתח, ממיר-לתצוגה, ממיר-לשמירה, מקלדת, צעד]
      const F = mode === 'time'
        ? [['t', v => v, v => Math.round(v), 'numeric', '5'], ['w', v => v, v => v, 'decimal', '0.5']]
        : mode === 'cardio'
          ? [['t', v => v === '' ? '' : Math.round(v / 60 * 10) / 10, v => Math.round(v * 60), 'decimal', '1'], ['d', v => v, v => Math.round(v * 100) / 100, 'decimal', '0.1']]
          : [['w', v => v, v => v, 'decimal', '0.5'], ['r', v => v, v => Math.round(v), 'numeric', '1']];
      it.sets.forEach((s, si) => {
        const tr = document.createElement('tr');
        const isPr = (sess.prs || []).some(p => p.ei === ei && p.si === si);
        tr.className = (s.done ? 'set-done' : '') + (isPr ? ' set-pr' : '');
        const num = document.createElement('td'); num.innerHTML = `<span class="set-n">${isPr ? '🏆' : si + 1}</span>`;
        const mkIn = (fi, ph) => {
          const [key, show, store_, im, step] = F[fi];
          const td = document.createElement('td');
          const inp = document.createElement('input');
          inp.className = 'set-in'; inp.type = 'number'; inp.inputMode = im;
          inp.min = 0; inp.step = step; inp.placeholder = ph;
          inp.value = s[key] === '' || s[key] == null ? '' : show(s[key]);
          inp.dataset.k = key;
          inp.addEventListener('change', () => {
            const v = inp.value === '' ? '' : store_(Math.max(0, +inp.value));
            s[key] = v;
            // סטים הבאים שעוד לא בוצעו מקבלים את אותו ערך (חוסך הקלדה)
            for (let k = si + 1; k < it.sets.length; k++) if (!it.sets[k].done) it.sets[k][key] = v;
            persistSess();
            tb.querySelectorAll('tr').forEach((row, k) => {
              if (k > si && !it.sets[k].done) { const x = row.querySelector(`.set-in[data-k="${key}"]`); if (x) x.value = v === '' ? '' : show(v); }
            });
          });
          inp.addEventListener('focus', () => inp.select());
          td.appendChild(inp); return td;
        };
        const ok = document.createElement('td');
        const okb = document.createElement('button');
        okb.className = 'set-ok' + (s.done ? ' on' : ''); okb.textContent = '✓';
        okb.setAttribute('aria-label', '✓');
        okb.addEventListener('click', () => toggleSet(ei, si));
        ok.appendChild(okb);
        const x = document.createElement('td');
        if (mode === 'time' && !s.done) {
          const tb_ = document.createElement('button');
          const running = setTimer && setTimer.ei === ei && setTimer.si === si;
          tb_.className = 'set-timer' + (running ? ' on' : ''); tb_.textContent = running ? '■' : '▶';
          tb_.title = T('timerStart');
          tb_.addEventListener('click', () => running ? stopSetTimer(true) : startSetTimer(ei, si));
          x.appendChild(tb_);
        } else if (it.sets.length > 1 && !s.done) {
          const xb = document.createElement('button'); xb.className = 'set-x'; xb.textContent = '×';
          xb.addEventListener('click', () => { it.sets.splice(si, 1); persistSess(); renderSession(); });
          x.appendChild(xb);
        }
        const ph0 = bw ? '—' : '0';
        tr.append(num, mkIn(0, ph0), mkIn(1, mode === 'wr' ? '0' : '—'), ok, x);
        tb.appendChild(tr);
      });
      tbl.appendChild(tb);
      box.appendChild(tbl);

      const add = document.createElement('button');
      add.className = 'sess-add-set'; add.textContent = T('addSet');
      add.addEventListener('click', () => {
        const p = it.sets[it.sets.length - 1] || {};
        const n = { done: false };
        F.forEach(([k]) => { n[k] = p[k] == null ? '' : p[k]; });
        it.sets.push(n); persistSess(); renderSession();
      });
      box.appendChild(add);
      list.appendChild(box);
    });
    paintProgress();
  }

  // ── טיימר לסט של זמן (פלאנק וכו׳): סופר אחורה ומסמן ✓ בסוף ──
  let setTimer = null;
  function startSetTimer(ei, si) {
    stopSetTimer(false);
    const s = sess.items[ei].sets[si];
    const secs = Math.max(1, +s.t || sess.items[ei].target || 30);
    s.t = secs;
    setTimer = { ei, si, end: Date.now() + secs * 1000, iv: null };
    stopRest();
    renderSession();
    setTimer.iv = setInterval(() => {
      if (!setTimer) return;
      const left = Math.max(0, Math.ceil((setTimer.end - Date.now()) / 1000));
      const row = document.querySelectorAll('#sess-list .sess-ex')[ei];
      const inp = row && row.querySelectorAll('tbody tr')[si] && row.querySelectorAll('tbody tr')[si].querySelector('.set-in[data-k="t"]');
      if (inp) inp.value = left;
      if (left <= 3 && left > 0) buzz(40);
      if (left <= 0) { const t = setTimer; stopSetTimer(false); buzz([200, 100, 200]); beep(); toggleSet(t.ei, t.si); }
    }, 200);
  }
  function stopSetTimer(rerender) {
    if (!setTimer) return;
    clearInterval(setTimer.iv);
    if (rerender) {
      // עצירה ידנית: שומרים את הזמן שבוצע בפועל
      const s = sess.items[setTimer.ei].sets[setTimer.si];
      const done = Math.round(s.t - Math.max(0, (setTimer.end - Date.now()) / 1000));
      s.t = Math.max(1, done);
    }
    setTimer = null;
    persistSess();
    if (rerender) renderSession();
  }

  let ssJump = null;
  function toggleSet(ei, si) {
    const it = sess.items[ei], s = it.sets[si];
    const ex = exById(it.exId);
    const mode = it.mode || 'wr';
    if (setTimer && setTimer.ei === ei && setTimer.si === si) stopSetTimer(false);
    s.done = !s.done;
    if (s.done) {
      if (mode === 'wr') { if (!(+s.r > 0)) s.r = 1; s.w = s.w === '' ? '' : +s.w; s.r = +s.r; }
      else if (mode === 'time') { if (!(+s.t > 0)) s.t = it.target || 30; s.t = +s.t; s.w = s.w === '' ? '' : +s.w; }
      else { if (!(+s.t > 0) && !(+s.d > 0)) s.t = (it.target || 20) * 60; s.t = +s.t || 0; s.d = s.d === '' ? '' : +s.d; }
      // שיא חדש? מול כל ההיסטוריה ומול הסטים שכבר בוצעו היום. בפעם הראשונה בתרגיל — אין שיא.
      const b = stats().best[it.exId];
      const sc = setScore(mode, s);
      let top = b && b.mode === mode ? b.sc : null;
      if (top) it.sets.forEach((x, k) => { if (k !== si && x.done) { const o = setScore(mode, x); if (beats(o, top)) top = o; } });
      const isPr = !!top && beats(sc, top);
      sess.prs = sess.prs || [];
      if (isPr) { sess.prs.push({ ei, si, exId: it.exId }); toast(T('newPR')(exName(ex))); buzz([60, 40, 60, 40, 120]); }
      const ssi = ssInfo(sess.items)[ei], nxt = ssi && !ssi.last ? sess.items[ei + 1] : null;
      if (nxt && nxt.sets.some(x => !x.done)) { stopRest(); ssJump = ei + 1; if (!isPr) toast(T('ssNext')(exName(exById(nxt.exId)))); }
      else startRest(sess.rest || 90);
    } else {
      sess.prs = (sess.prs || []).filter(p => !(p.ei === ei && p.si === si));
    }
    persistSess();
    renderSession();
    if (ssJump != null) { const el = document.querySelector(`#sess-list .sess-ex[data-ei="${ssJump}"]`); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); ssJump = null; }
    const { done, total } = sessTotals();
    if (done === total) { stopRest(); setTimeout(finishSession, 350); }
  }

  async function finishSession(force) {
    const { done, total } = sessTotals();
    if (!force) {
      if (done === 0) {
        if (await appConfirm(T('sessNothing'), T('sessCloseNoSave'), true)) discardSession(true);
        return;
      }
      if (done < total && !await appConfirm(T('sessFinishEarly')(done, total), T('sessFinishAnyway'))) return;
    }
    stopSetTimer(false); stopRest(); clearInterval(clockIv); releaseWake();
    const clean = (mode, s) => mode === 'time' ? { t: +s.t || 0, w: +s.w || 0 }
                            : mode === 'cardio' ? { t: +s.t || 0, d: +s.d || 0 }
                            : { w: +s.w || 0, r: +s.r || 0 };
    const entry = {
      id: uid(), woId: sess.woId, name: sess.name, start: sess.startedAt, end: Date.now(),
      items: sess.items.map(it => ({ exId: it.exId, mode: it.mode || 'wr', sets: it.sets.filter(s => s.done).map(s => clean(it.mode || 'wr', s)) }))
        .filter(it => it.sets.length),
    };
    const hist = loadHist(); hist.push(entry); saveHist(hist);
    localStorage.removeItem(SESS_KEY);
    document.getElementById('bn-start').classList.remove('live');
    // סיכום
    const prs = stats().prsByEntry[entry.id] || [];
    document.getElementById('sess-sum-tiles').innerHTML = [
      [T('tDuration'), fmtDur(entry.end - entry.start)], [T('tSets'), histSets(entry)], [T('tVolume'), fmtVol(histVolume(entry))],
    ].map(([l, v]) => `<div class="tile"><div class="tile-l">${esc(l)}</div><div class="tile-v">${v}</div></div>`).join('');
    document.getElementById('sess-prs').innerHTML = prs.length ? `<div class="sess-pr-list">${prs.map(p => { const ex = exById(p.exId);
      return `<div>${esc(T('prLine')(exName(ex), ''))}<span dir="ltr">${setLabel(ex, p, p.mode)}</span></div>`; }).join('')}</div>` : '';
    document.getElementById('sess-body').hidden = true;
    document.getElementById('sess-finish').hidden = false;
    sess = null;
    buzz([100, 60, 100]);
  }

  async function discardSession(skipAsk) {
    if (!skipAsk && sessTotals().done > 0 && !await appConfirm(T('sessDiscardConfirm'), T('sessCloseNoSave'), true)) return;
    stopSetTimer(false); stopRest(); clearInterval(clockIv); releaseWake();
    localStorage.removeItem(SESS_KEY);
    sess = null;
    document.getElementById('bn-start').classList.remove('live');
    document.getElementById('session-overlay').classList.remove('open');
    refreshViews();
  }

  // ── טיימר מנוחה (מבוסס זמן אמיתי — לא נעצר כשהמסך כבה) ──
  let restEnd = 0;
  function startRest(seconds) {
    stopRest();
    restEnd = Date.now() + seconds * 1000;
    document.getElementById('rest-bar').classList.add('on');
    paintRest();
    restIv = setInterval(() => {
      if (Date.now() >= restEnd) { stopRest(); toast(T('restDone')); buzz([200, 100, 200]); beep(); return; }
      paintRest();
    }, 250);
  }
  function paintRest() {
    const left = Math.max(0, Math.ceil((restEnd - Date.now()) / 1000));
    document.getElementById('rest-time').textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  }
  function stopRest() {
    clearInterval(restIv); restIv = null;
    document.getElementById('rest-bar').classList.remove('on');
  }
  const buzz = p => { try { navigator.vibrate && navigator.vibrate(p); } catch {} };
  let audioCtx = null;
  function beep() {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      [0, 0.18].forEach(t => {
        const o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.frequency.value = 880; o.connect(g); g.connect(audioCtx.destination);
        g.gain.setValueAtTime(0.0001, audioCtx.currentTime + t);
        g.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + t + 0.14);
        o.start(audioCtx.currentTime + t); o.stop(audioCtx.currentTime + t + 0.15);
      });
    } catch {}
  }

  // ── המסך נשאר דולק באימון ──
  async function requestWake() {
    try { if ('wakeLock' in navigator && !wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } } catch {}
  }
  function releaseWake() { try { wakeLock && wakeLock.release(); } catch {} wakeLock = null; }
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && document.getElementById('session-overlay').classList.contains('open') && sess) { requestWake(); paintRest(); }
  });

  function wireSession() {
    document.getElementById('rest-skip').addEventListener('click', stopRest);
    document.getElementById('rest-add').addEventListener('click', () => { restEnd += 15000; paintRest(); });
    document.getElementById('rest-sub').addEventListener('click', () => { restEnd = Math.max(Date.now() + 1000, restEnd - 15000); paintRest(); });
    document.getElementById('sess-min').addEventListener('click', minimizeSession);
    document.getElementById('sess-done').addEventListener('click', () => finishSession(false));
    document.getElementById('sess-close').addEventListener('click', () => discardSession(false));
    document.getElementById('sess-finish-close').addEventListener('click', () => {
      document.getElementById('session-overlay').classList.remove('open');
      refreshViews();
    });
    document.getElementById('bn-start').addEventListener('click', quickStart);
    if (store.get(SESS_KEY, null)) document.getElementById('bn-start').classList.add('live');
  }

  function refreshViews() {
    if (VIEW === 'home') renderHome();
    else if (VIEW === 'wo') renderWorkouts();
    else if (VIEW === 'prog') renderProgress();
  }

  function closeModal() {
    modalOverlay.classList.remove('open');
    document.body.style.overflow = '';
    modalGif.src = '';
  }

  // ══════════ מנהל חלונות: קליק רפאים · כפתור חזרה · Escape (חלק ל״א) ══════════
  const OV_STACK = [];
  let ghostUntil = 0, ghostOv = null, ovClosingByPop = false, ovSkipPop = 0;
  const NO_BACK = new Set(['consent-overlay']);
  function topOverlay() { return OV_STACK[OV_STACK.length - 1] || null; }
  function closeOverlay(el) {
    if (!el) return;
    if (el.id === 'modal-overlay') return closeModal();
    if (el.id === 'session-overlay') {
      if (!document.getElementById('sess-finish').hidden) { el.classList.remove('open'); refreshViews(); return; }
      return minimizeSession();
    }
    if (el.id === 'db-overlay') return closeDbSetup();
    if (el._resolve) return el._resolve();
    el.classList.remove('open');
  }
  function watchOverlays() {
    const els = document.querySelectorAll('.an-overlay, .modal-overlay, .db-overlay');
    const mo = new MutationObserver(muts => muts.forEach(m => {
      const el = m.target, open = el.classList.contains('open'), idx = OV_STACK.indexOf(el);
      if (open && idx < 0) {
        OV_STACK.push(el); document.body.classList.add('ov-open');
        ghostUntil = Date.now() + 450; ghostOv = el;           // בולע את ה"קליק" המאוחר של המגע
        if (!NO_BACK.has(el.id)) history.pushState({ an: 'ov', id: el.id }, '');
      } else if (!open && idx >= 0) {
        OV_STACK.splice(idx, 1); document.body.classList.toggle('ov-open', OV_STACK.length > 0);
        if (!ovClosingByPop && !NO_BACK.has(el.id) && history.state && history.state.an === 'ov') { ovSkipPop++; history.back(); }
      }
    }));
    els.forEach(el => mo.observe(el, { attributes: true, attributeFilter: ['class'] }));
    document.addEventListener('click', e => {
      if (Date.now() < ghostUntil && ghostOv && ghostOv.contains(e.target)) { e.preventDefault(); e.stopPropagation(); }
    }, true);
    window.addEventListener('popstate', () => {
      if (ovSkipPop > 0) { ovSkipPop--; return; }
      if (navSkipPop) { navSkipPop = false; return; }
      const top = topOverlay();
      if (top && !NO_BACK.has(top.id)) { ovClosingByPop = true; closeOverlay(top); ovClosingByPop = false; return; }
      if (VIEW !== 'home') showView('home', { fromPop: true });
    });
    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      const top = topOverlay();
      if (top && !NO_BACK.has(top.id)) { e.preventDefault(); closeOverlay(top); }
    });
    // [data-close] וסגירה בלחיצה על הרקע — לכל החלונות החדשים
    ['plans-overlay', 'swap-overlay', 'hist-overlay', 'wo-picker', 'confirm-overlay'].forEach(id => {
      const ov = document.getElementById(id);
      ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) closeOverlay(ov); });
    });
  }

  // ── בקשת אחסון מתמשך (חלק י״ב) ──
  function askPersist() {
    try { navigator.storage && navigator.storage.persist && navigator.storage.persisted().then(p => p || navigator.storage.persist()); } catch {}
  }

