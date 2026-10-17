/* ספריית הכושר 2.2 — מאמן (AppNest)
   מודול: פרופיל וציוד · בונה תוכנית · תרגיל משלי · מפת שרירים · משקל ומדידות ·
   סופר-סטים · מחשבון צלחות · כרטיס סיכום לשיתוף · חיבור AI + עוזר AppNest.
   נטען אחרי fitlog.js ולפני הסקריפט הראשי. כמו fitlog.js — רק הגדרות ברמה העליונה;
   T, state, LANG ושאר הגלובליים של הסקריפט הראשי משמשים רק בזמן ריצה.
   ⚠️ בכל שינוי: להעלות ?v= בתגית ב-index.html וגם COACH ב-sw.js (שניהם יחד). */

  // ══════════ מחרוזות 2.2 (מתמזגות ל-UI בסקריפט הראשי) ══════════
  const UI22 = {
    he: {
      // בונה תוכנית
      bldBtn: '🎯 בונה תוכנית', bldTitle: '🎯 תוכנית מותאמת אישית', bldSub: 'ארבע שאלות קצרות, ותוכנית שבועית מוכנה. אפשר לערוך הכול אחר כך.',
      bldQGoal: 'מה המטרה העיקרית?', bldQDays: 'כמה ימים בשבוע נוח לך להתאמן?', bldQLevel: 'מה הניסיון שלך באימוני כוח?',
      bldQEq: 'איזה ציוד יש לך?', bldQSex: 'איך להציג את מפת השרירים?', bldPreview: 'התוכנית שלך',
      goal_muscle: 'בניית שריר', goal_muscleS: 'נפח ומראה — 8–12 חזרות',
      goal_strength: 'כוח', goal_strengthS: 'להרים יותר — 5 חזרות בתרגילים הגדולים',
      goal_fit: 'כושר כללי ובריאות', goal_fitS: 'גוף חזק ונייד — 12 חזרות, מנוחות קצרות',
      goal_burn: 'כושר ושריפת קלוריות', goal_burnS: 'קצב גבוה, סופר-סטים וקרדיו בסוף',
      lvl_beg: 'מתחיל/ה', lvl_begS: 'פחות מחצי שנה של אימונים',
      lvl_int: 'בינוני', lvl_intS: 'חצי שנה עד שנתיים',
      lvl_adv: 'מתקדם/ת', lvl_advS: 'יותר משנתיים, טכניקה טובה',
      daysN: n => `${n} ימים`, daysHint: { 2: 'גוף מלא A/B', 3: 'גוף מלא או דחיפה/משיכה/רגליים', 4: 'עליון / תחתון', 5: 'דחיפה/משיכה/רגליים + עליון/תחתון', 6: 'דחיפה/משיכה/רגליים פעמיים' },
      eqPresetGym: '🏢 חדר כושר מלא', eqPresetBw: '🏠 בית, בלי ציוד', eqPresetDb: '🏠 בית + משקולות יד', eqPresetCustom: '✏️ בחירה ידנית',
      eqHint: 'משקל גוף תמיד כלול. אפשר לשנות אחר כך בהגדרות.',
      sex_m: '🧍‍♂️ גבר', sex_f: '🧍‍♀️ אישה', sexHint: 'משמש רק לציור מפת השרירים.',
      bldNext: 'הבא ←', bldBack: '→ חזרה', bldAdd: '✓ הוספה לאימונים שלי',
      bldReplace: 'להחליף את האימונים הקיימים (ההיסטוריה נשמרת)',
      bldAdded: n => `התוכנית נוספה — ${n} אימונים ✓`, bldEdit: 'אפשר לשנות תרגילים, סטים וימים במסך "האימונים שלי".',
      bldDays: 'ימים', bldWoLine: (n, s) => `${n} תרגילים · ~${s} דק׳`,
      ctaBuildT: 'תוכנית מותאמת אישית', ctaBuildS: '4 שאלות ותוכנית שבועית מוכנה',
      onbBuild: '🎯 בנו לי תוכנית', onbLater: 'אחר כך', onbSub: 'כמה דברים ששווה להכיר:',
      onb6: '<strong>חדש ב-2.2</strong> — בונה תוכנית אישית, מפת שרירים, מעקב משקל, סופר-סטים, מחשבון צלחות ומאמן AI 🪄.',
      // ציוד
      eqLabel: 'הציוד שלי', eqOnly: 'הציוד שלי', eqAllShort: 'הכול',
      eq_bw: 'משקל גוף', eq_db: 'משקולות יד', eq_bb: 'מוט ופלטות', eq_kb: 'קטלבל', eq_band: 'גומיות',
      eq_machine: 'מכונות ופולי', eq_ball: 'כדורים', eq_cardio: 'מכשירי קרדיו', eq_other: 'אחר (גלגל, חבל…)',
      eqFits: '✓ מתאים לציוד שלך', eqMissing: 'דורש ציוד נוסף', eqSaved: 'הציוד נשמר ✓',
      bmSexLabel: 'מפת השרירים',
      // תרגיל משלי
      cxBtn: '＋ תרגיל משלי', cxTitle: 'תרגיל משלי', cxEditTitle: 'עריכת תרגיל', cxName: 'שם התרגיל', cxNamePh: 'למשל: לחיצת כתפיים במכונה של המכון',
      cxCat: 'אזור גוף', cxTarget: 'שריר מטרה', cxEquip: 'ציוד', cxMode: 'סוג רישום', cxPhoto: 'תמונה (לא חובה)',
      cxPhotoBtn: '📷 צילום / בחירת תמונה', cxPhotoRm: 'הסרת תמונה', cxSteps: 'הוראות ביצוע (שורה לכל שלב, לא חובה)',
      cxNeedName: 'צריך שם לתרגיל', cxSaved: 'התרגיל נשמר ✓', cxDeleted: 'התרגיל נמחק',
      cxDelConfirm: 'למחוק את התרגיל? הוא יוסר מהאימונים, וההיסטוריה שלו תישמר.', cxBadge: 'שלי', cxEdit: '✏️ עריכת התרגיל',
      // מפת שרירים
      bmTitle: '🧍 מפת שרירים', bmFront: 'מלפנים', bmBack: 'מאחור', bmTap: 'לחצו על שריר כדי לראות כמה סטים עשיתם.',
      bmSets: (n, s) => `${n} · ${s} סטים`, bmNone: n => `${n} · לא עבד בטווח הזה`, bmPick: '🧍 לפי שריר',
      bmPickTitle: '🧍 בחירה לפי שריר', bmPickSub: 'לחצו על שריר כדי לראות את התרגילים שלו.', bmPicked: (n, c) => `${n} · ${c} תרגילים`,
      bmNoEx: 'אין תרגילים לשריר הזה במאגר', bmLoading: 'טוען את מפת הגוף…', bmClear: 'ניקוי בחירה',
      mus: { chest: 'חזה', abs: 'בטן', obliques: 'אלכסוני בטן', biceps: 'יד קדמית', triceps: 'יד אחורית', deltoids: 'כתפיים',
        forearm: 'אמות', quadriceps: 'ירך קדמית', calves: 'שוקיים', tibialis: 'שוק קדמית', adductors: 'מקרבי ירך', trapezius: 'טרפזים',
        upperBack: 'גב עליון ורחב', rhomboids: 'מעוינים', lowerBack: 'גב תחתון', gluteal: 'ישבן', hamstring: 'ירך אחורית',
        serratus: 'משוננים', neck: 'צוואר', hipFlexors: 'מכופפי ירך', rotatorCuff: 'שרוול מסובב' },
      // משקל ומדידות
      bdTitle: '⚖️ משקל ומדידות', bdAdd: '+ רישום', bdEmpty: 'רישום משקל פעם בשבוע מספיק כדי לראות מגמה.',
      bdChange30: 'שינוי ב-30 יום', bdGoal: 'יעד', bdGoalLeft: v => `${v} ק״ג עד היעד`, bdGoalHit: 'הגעת ליעד שהגדרת',
      bdLogTitle: '⚖️ רישום משקל ומדידות', bdDate: 'תאריך', bdWeight: 'משקל (ק״ג)', bdMeasures: 'מדידות בס״מ (לא חובה)',
      bdWaist: 'מותניים', bdChest: 'חזה', bdHips: 'ירכיים', bdArm: 'זרוע', bdThigh: 'ירך',
      bdGoalLabel: 'משקל יעד (לא חובה)', bdGoalPh: 'ריק = בלי יעד', bdSave: 'שמירה', bdSaved: 'נרשם ✓', bdNeed: 'צריך משקל או לפחות מדידה אחת',
      bdRecent: 'רישומים אחרונים', bdNote: 'המשקל משתנה מיום ליום (מים, מלח, שעה). כדאי להסתכל על המגמה לאורך שבועות.',
      bdTrackLabel: 'מעקב משקל ומדידות', bdTrackSub: 'כרטיס במסך ההתקדמות. אפשר לכבות אם לא מתאים לך.',
      bdChart: 'משקל', bdDel: 'למחוק את הרישום?',
      // סופר-סט
      ssLink: 'חיבור לסופר-סט עם התרגיל הבא', ssLabel: g => `סופר-סט ${g}`, ssNext: n => `🔗 סופר-סט — עכשיו: ${n}`,
      ssHint: 'סופר-סט: עושים סט מכל תרגיל ברצף, ורק אז מנוחה.',
      // צלחות
      plBtn: '🏋 צלחות', plTitle: '🏋 מחשבון צלחות', plTotal: 'משקל כולל (ק״ג)', plBar: 'מוט', plNoBar: 'בלי',
      plHave: 'הצלחות שיש לי', plPerSide: 'בכל צד:', plOnlyBar: 'רק המוט', plClosest: v => `לא מדויק עם הצלחות שיש — הכי קרוב: ${v} ק״ג`,
      plUse: 'שימוש במשקל הזה', plToolsBtn: '🧮 מחשבון צלחות', plUsed: 'המשקל עודכן ✓',
      // שיתוף
      shBtn: '📤 שיתוף הסיכום', shTitle: '📤 כרטיס סיכום', shShare: 'שיתוף', shSave: '⬇️ שמירת תמונה', shPrs: n => `🏆 ${n} שיאים`,
      shMore: n => `ועוד ${n} תרגילים`, shDone: 'התמונה נשמרה ✓',
      // AI
      aiLabel: 'מאמן AI 🪄', aiSub: 'שאלו את המאמן על התוכנית, על תרגיל או על ההתקדמות — הוא רואה את האימונים שלכם.',
      aiOn: p => `מחובר: ${p}`, aiOff: 'לא מחובר', aiSetupBtn: '🔌 חיבור / ניהול', aiBtnShow: 'כפתור המאמן במסך',
      aiTitle: '🪄 חיבור מאמן AI', aiIntro: 'המאמן עובד עם מפתח AI שלכם (BYOK). המפתח נשמר במכשיר הזה בלבד ונשלח רק לספק שבחרתם.',
      aiPrivacy: 'כשאתם שואלים את המאמן, נשלח לספק סיכום קצר של האימונים, השיאים והציוד שלכם — כדי שהתשובה תתאים לכם. בלי שם ובלי פרטים מזהים.',
      aiKey: 'מפתח API', aiUrl: 'כתובת', aiSave: 'שמירה וחיבור', aiTest: '🔌 בדיקת חיבור', aiTesting: 'בודק…', aiTestOk: '✓ החיבור עובד',
      aiTestFail: e => `✗ ${e}`, aiDisconnect: 'ניתוק', aiSaved: 'המאמן מחובר ✓', aiNeedKey: 'צריך להדביק מפתח',
      aiPick: 'בחרו ספק:', aiFree: 'חינם', aiRec: 'מומלץ',
      aiGeminiSteps: 'נכנסים ל-aistudio.google.com ← Get API key ← Create API key ← מעתיקים (מתחיל ב-AIza).',
      aiClaudeSteps: 'console.anthropic.com ← API Keys ← Create Key. בתשלום לפי שימוש.',
      aiOpenaiSteps: 'platform.openai.com ← API keys ← Create. בתשלום לפי שימוש.',
      aiDeviceSteps: 'Ollama או LM Studio שרץ על אותו מכשיר / רשת.', aiCustomSteps: 'כל כתובת שתואמת ל-OpenAI.',
      aiNoKeyMsg: 'כדי לדבר עם המאמן צריך קודם לחבר מפתח AI (יש אפשרות חינמית).',
    },
    en: {
      bldBtn: '🎯 Plan builder', bldTitle: '🎯 Your personal plan', bldSub: 'Four quick questions and a weekly plan is ready. You can edit everything later.',
      bldQGoal: "What's your main goal?", bldQDays: 'How many days a week suit you?', bldQLevel: 'How much strength-training experience do you have?',
      bldQEq: 'What equipment do you have?', bldQSex: 'How should the muscle map look?', bldPreview: 'Your plan',
      goal_muscle: 'Build muscle', goal_muscleS: 'Size and shape — 8–12 reps',
      goal_strength: 'Strength', goal_strengthS: 'Lift more — 5 reps on the big lifts',
      goal_fit: 'General fitness & health', goal_fitS: 'Strong and mobile — 12 reps, short rests',
      goal_burn: 'Conditioning & calorie burn', goal_burnS: 'Higher pace, supersets and a cardio finisher',
      lvl_beg: 'Beginner', lvl_begS: 'Less than six months of training',
      lvl_int: 'Intermediate', lvl_intS: 'Six months to two years',
      lvl_adv: 'Advanced', lvl_advS: 'Over two years, solid technique',
      daysN: n => `${n} days`, daysHint: { 2: 'Full body A/B', 3: 'Full body or push/pull/legs', 4: 'Upper / lower', 5: 'Push/pull/legs + upper/lower', 6: 'Push/pull/legs twice' },
      eqPresetGym: '🏢 Full gym', eqPresetBw: '🏠 Home, no equipment', eqPresetDb: '🏠 Home + dumbbells', eqPresetCustom: '✏️ Pick manually',
      eqHint: 'Bodyweight is always included. You can change this later in Settings.',
      sex_m: '🧍‍♂️ Male', sex_f: '🧍‍♀️ Female', sexHint: 'Only used to draw the muscle map.',
      bldNext: 'Next →', bldBack: '← Back', bldAdd: '✓ Add to my workouts',
      bldReplace: 'Replace my existing workouts (history is kept)',
      bldAdded: n => `Plan added — ${n} workouts ✓`, bldEdit: 'You can change exercises, sets and days in "My Workouts".',
      bldDays: 'Days', bldWoLine: (n, s) => `${n} exercises · ~${s} min`,
      ctaBuildT: 'Personal plan', ctaBuildS: '4 questions and a ready weekly plan',
      onbBuild: '🎯 Build me a plan', onbLater: 'Later', onbSub: 'A few things worth knowing:',
      onb6: '<strong>New in 2.2</strong> — personal plan builder, muscle map, weight tracking, supersets, plate calculator and an AI coach 🪄.',
      eqLabel: 'My equipment', eqOnly: 'My equipment', eqAllShort: 'All',
      eq_bw: 'Bodyweight', eq_db: 'Dumbbells', eq_bb: 'Barbell & plates', eq_kb: 'Kettlebell', eq_band: 'Bands',
      eq_machine: 'Machines & cables', eq_ball: 'Balls', eq_cardio: 'Cardio machines', eq_other: 'Other (wheel, rope…)',
      eqFits: '✓ Fits your equipment', eqMissing: 'Needs more equipment', eqSaved: 'Equipment saved ✓',
      bmSexLabel: 'Muscle map',
      cxBtn: '＋ My exercise', cxTitle: 'My own exercise', cxEditTitle: 'Edit exercise', cxName: 'Exercise name', cxNamePh: "e.g. My gym's shoulder press machine",
      cxCat: 'Body part', cxTarget: 'Target muscle', cxEquip: 'Equipment', cxMode: 'Logging type', cxPhoto: 'Photo (optional)',
      cxPhotoBtn: '📷 Take / choose a photo', cxPhotoRm: 'Remove photo', cxSteps: 'Instructions (one step per line, optional)',
      cxNeedName: 'The exercise needs a name', cxSaved: 'Exercise saved ✓', cxDeleted: 'Exercise deleted',
      cxDelConfirm: 'Delete this exercise? It is removed from workouts; its history is kept.', cxBadge: 'Mine', cxEdit: '✏️ Edit exercise',
      bmTitle: '🧍 Muscle map', bmFront: 'Front', bmBack: 'Back', bmTap: 'Tap a muscle to see how many sets you did.',
      bmSets: (n, s) => `${n} · ${s} sets`, bmNone: n => `${n} · not trained in this range`, bmPick: '🧍 By muscle',
      bmPickTitle: '🧍 Pick by muscle', bmPickSub: 'Tap a muscle to see its exercises.', bmPicked: (n, c) => `${n} · ${c} exercises`,
      bmNoEx: 'No exercises for this muscle in the library', bmLoading: 'Loading the body map…', bmClear: 'Clear selection',
      mus: { chest: 'Chest', abs: 'Abs', obliques: 'Obliques', biceps: 'Biceps', triceps: 'Triceps', deltoids: 'Shoulders',
        forearm: 'Forearms', quadriceps: 'Quads', calves: 'Calves', tibialis: 'Shins', adductors: 'Adductors', trapezius: 'Traps',
        upperBack: 'Upper back & lats', rhomboids: 'Rhomboids', lowerBack: 'Lower back', gluteal: 'Glutes', hamstring: 'Hamstrings',
        serratus: 'Serratus', neck: 'Neck', hipFlexors: 'Hip flexors', rotatorCuff: 'Rotator cuff' },
      bdTitle: '⚖️ Weight & measurements', bdAdd: '+ Log', bdEmpty: 'Logging your weight once a week is enough to see a trend.',
      bdChange30: 'Change over 30 days', bdGoal: 'Goal', bdGoalLeft: v => `${v} kg to your goal`, bdGoalHit: "You've reached the goal you set",
      bdLogTitle: '⚖️ Log weight & measurements', bdDate: 'Date', bdWeight: 'Weight (kg)', bdMeasures: 'Measurements in cm (optional)',
      bdWaist: 'Waist', bdChest: 'Chest', bdHips: 'Hips', bdArm: 'Arm', bdThigh: 'Thigh',
      bdGoalLabel: 'Goal weight (optional)', bdGoalPh: 'Empty = no goal', bdSave: 'Save', bdSaved: 'Logged ✓', bdNeed: 'Enter a weight or at least one measurement',
      bdRecent: 'Recent entries', bdNote: 'Weight shifts day to day (water, salt, time of day). Look at the trend over weeks.',
      bdTrackLabel: 'Weight & measurements tracking', bdTrackSub: 'A card on the Progress screen. Turn it off if it is not for you.',
      bdChart: 'Weight', bdDel: 'Delete this entry?',
      ssLink: 'Superset with the next exercise', ssLabel: g => `Superset ${g}`, ssNext: n => `🔗 Superset — now: ${n}`,
      ssHint: 'Superset: one set of each exercise back to back, then rest.',
      plBtn: '🏋 Plates', plTitle: '🏋 Plate calculator', plTotal: 'Total weight (kg)', plBar: 'Bar', plNoBar: 'None',
      plHave: 'Plates I have', plPerSide: 'Each side:', plOnlyBar: 'Just the bar', plClosest: v => `Not exact with your plates — closest: ${v} kg`,
      plUse: 'Use this weight', plToolsBtn: '🧮 Plate calculator', plUsed: 'Weight updated ✓',
      shBtn: '📤 Share summary', shTitle: '📤 Summary card', shShare: 'Share', shSave: '⬇️ Save image', shPrs: n => `🏆 ${n} records`,
      shMore: n => `+${n} more exercises`, shDone: 'Image saved ✓',
      aiLabel: 'AI coach 🪄', aiSub: 'Ask the coach about your plan, an exercise or your progress — it sees your workouts.',
      aiOn: p => `Connected: ${p}`, aiOff: 'Not connected', aiSetupBtn: '🔌 Connect / manage', aiBtnShow: 'Coach button on screen',
      aiTitle: '🪄 Connect the AI coach', aiIntro: 'The coach runs on your own AI key (BYOK). The key stays on this device and is only sent to the provider you choose.',
      aiPrivacy: 'When you ask the coach, a short summary of your workouts, records and equipment is sent to the provider so answers fit you. No name or identifying details.',
      aiKey: 'API key', aiUrl: 'URL', aiSave: 'Save & connect', aiTest: '🔌 Test connection', aiTesting: 'Testing…', aiTestOk: '✓ Connection works',
      aiTestFail: e => `✗ ${e}`, aiDisconnect: 'Disconnect', aiSaved: 'Coach connected ✓', aiNeedKey: 'Paste a key first',
      aiPick: 'Pick a provider:', aiFree: 'Free', aiRec: 'Recommended',
      aiGeminiSteps: 'Go to aistudio.google.com → Get API key → Create API key → copy (starts with AIza).',
      aiClaudeSteps: 'console.anthropic.com → API Keys → Create Key. Pay per use.',
      aiOpenaiSteps: 'platform.openai.com → API keys → Create. Pay per use.',
      aiDeviceSteps: 'Ollama or LM Studio running on this device / network.', aiCustomSteps: 'Any OpenAI-compatible URL.',
      aiNoKeyMsg: 'To chat with the coach, connect an AI key first (there is a free option).',
    },
  };
  const mus = slug => (T('mus') || {})[slug] || slug;

  // ══════════ 1. פרופיל וציוד ══════════
  const PROFILE_KEY = 'appnest-profile';
  const loadProfile = () => { const p = store.get(PROFILE_KEY, null); return p && typeof p === 'object' ? p : {}; };
  const saveProfile = p => store.set(PROFILE_KEY, p);
  const EQ_KEYS = ['bw', 'db', 'bb', 'kb', 'band', 'machine', 'ball', 'cardio', 'other'];
  const EQ_ICON = { bw: '🤸', db: '🏋️', bb: '🏋', kb: '🫖', band: '🎗️', machine: '⚙️', ball: '⚽', cardio: '🚴', other: '🧰' };
  const EQ_MAP = {
    'body weight': 'bw', 'weighted': 'db', 'dumbbell': 'db',
    'barbell': 'bb', 'ez barbell': 'bb', 'olympic barbell': 'bb', 'trap bar': 'bb',
    'kettlebell': 'kb', 'band': 'band', 'resistance band': 'band',
    'cable': 'machine', 'leverage machine': 'machine', 'sled machine': 'machine', 'smith machine': 'machine', 'assisted': 'machine',
    'stability ball': 'ball', 'medicine ball': 'ball', 'bosu ball': 'ball',
    'elliptical machine': 'cardio', 'stationary bike': 'cardio', 'stepmill machine': 'cardio', 'skierg machine': 'cardio', 'upper body ergometer': 'cardio',
  };
  const eqGroup = equip => EQ_MAP[equip] || 'other';
  const EQ_PRESETS = { gym: null, bw: ['bw'], db: ['bw', 'db'] };
  // null = הכול (חדר כושר מלא). אחרת — רשימת קבוצות.
  const myEq = () => { const p = loadProfile(); return Array.isArray(p.eq) ? p.eq : null; };
  const eqLimited = () => !!myEq();
  function hasEq(ex, eq) {
    eq = eq === undefined ? myEq() : eq;
    if (!eq || !ex) return true;
    const g = eqGroup(ex.equipment);
    return g === 'bw' || eq.includes(g);
  }

  // ══════════ 2. בונה תוכנית ══════════
  // משבצות: רשימת מזהים לפי סדר עדיפות (חדר כושר ← בית). הבונה בוחר את הראשון שמתאים לציוד ולרמה.
  const SLOTS = {
    squat:   ['0043', '0739', '1760', '0534', '0413', '1004', '2368', '1685'],
    hinge:   ['0085', '0032', '1459', '0549', '0432', '1009', '3561'],
    lunge:   ['0336', '0381', '0054', '0431', '1001', '1460', '2368'],
    hamcurl: ['0586', '0599', '1459', '1009', '3561'],
    quadiso: ['0585', '1489', '1760', '2368'],
    calves:  ['0605', '1372', '0417', '0727', '1373', '1490'],
    glute:   ['1409', '3561', '3013'],
    hpush:   ['0025', '0289', '0577', '1254', '0662', '0493'],
    ipush:   ['0047', '0314', '0171', '0989', '0493', '0662'],
    vpush:   ['0426', '0405', '0091', '0603', '0553', '0997', '0662'],
    lateral: ['0334', '0178', '0584', '0977'],
    hpull:   ['0027', '0293', '0861', '1350', '0541', '0988', '0499', '2300', '3167'],
    vpull:   ['0198', '0150', '0652', '1326', '0974', '1013', '0499'],
    rear:    ['0383', '0602', '0203', '0993', '2470'],
    biceps:  ['0031', '0294', '0868', '0447', '0575', '0968'],
    hammer:  ['0313', '1678', '0976', '0294'],
    triceps: ['0201', '0200', '0351', '0333', '0998', '0283', '0129'],
    triceps2:['0194', '2188', '0814', '0129', '0998', '0283'],
    fly:     ['0308', '0596', '0188', '0989', '0493'],
    core:    ['0472', '0276', '0274', '0175', '0979', '0687'],
    core2:   ['3544', '0872', '0687', '0212', '1015', '0276'],
    cardio:  ['3666', '2141', '0798', '2311', '2612', '0685'],
  };
  // תרגילים שמתחילים לא מקבלים כשיש חלופה
  const HARD = new Set(['0032', '0652', '1326', '0472', '0814', '0043', '0085', '0027']);
  // דורשים מוט מתח / מקבילים — רק בחדר כושר, או כשסימנו "מכונות" / "אחר"
  const NEEDS_BAR = new Set(['0652', '1326', '0472', '0814', '0499', '2300']);
  const barOk = eq => !eq || eq.includes('machine') || eq.includes('other');
  // משקל גוף קשה — תקרת חזרות, גם כשהמטרה היא 15
  const REP_CAP = { '0652': 8, '1326': 8, '0814': 10, '0472': 12 };
  // סלוט עם ":1" = הבחירה השנייה (גיוון בין אימון A ל-B)
  const TPL = {
    fbA:   { he: 'גוף מלא A', en: 'Full Body A', s: ['squat', 'hpush', 'hpull', 'vpush', 'hamcurl', 'core', 'biceps'] },
    fbB:   { he: 'גוף מלא B', en: 'Full Body B', s: ['hinge', 'ipush', 'vpull', 'lunge', 'lateral', 'core2', 'triceps'] },
    push:  { he: 'דחיפה', en: 'Push', s: ['hpush', 'vpush', 'ipush', 'lateral', 'triceps', 'fly', 'triceps2'] },
    pull:  { he: 'משיכה', en: 'Pull', s: ['vpull', 'hpull', 'rear', 'biceps', 'hammer', 'hpull:1', 'core'] },
    legs:  { he: 'רגליים', en: 'Legs', s: ['squat', 'hinge', 'lunge', 'hamcurl', 'calves', 'quadiso', 'core2'] },
    upA:   { he: 'פלג גוף עליון A', en: 'Upper A', s: ['hpush', 'hpull', 'vpush', 'vpull', 'biceps', 'triceps', 'lateral'] },
    upB:   { he: 'פלג גוף עליון B', en: 'Upper B', s: ['ipush', 'vpull:1', 'lateral', 'hpull:1', 'hammer', 'triceps2', 'rear'] },
    loA:   { he: 'פלג גוף תחתון A', en: 'Lower A', s: ['squat', 'hinge', 'lunge', 'hamcurl', 'calves', 'core'] },
    loB:   { he: 'פלג גוף תחתון B', en: 'Lower B', s: ['hinge:1', 'squat:1', 'glute', 'quadiso', 'calves', 'core2'] },
  };
  function splitFor(days, level) {
    if (days <= 2) return [['fbA', [0]], ['fbB', [3]]];
    if (days === 3) return level === 'beg' ? [['fbA', [0, 4]], ['fbB', [2]]] : [['push', [0]], ['pull', [2]], ['legs', [4]]];
    if (days === 4) return [['upA', [0]], ['loA', [1]], ['upB', [3]], ['loB', [4]]];
    if (days === 5) return [['push', [0]], ['pull', [1]], ['legs', [2]], ['upA', [4]], ['loA', [5]]];
    return [['push', [0, 3]], ['pull', [1, 4]], ['legs', [2, 5]]];
  }
  // מעט ציוד (למשל משקל גוף בלבד) — אין מספיק תרגילים לפיצול; גוף מלא A/B בכל הימים
  const FB_DAYS = { 2: [[0], [3]], 3: [[0, 4], [2]], 4: [[0, 3], [1, 4]], 5: [[0, 2, 4], [1, 5]], 6: [[0, 2, 4], [1, 3, 5]] };
  const fullBodySplit = days => [['fbA', FB_DAYS[days][0]], ['fbB', FB_DAYS[days][1]]];
  function pickSlot(spec, eq, level, used) {
    const [name, alt] = spec.split(':');
    const ids = (SLOTS[name] || []).filter(id => { const ex = exById(id); return ex && hasEq(ex, eq) && !used.has(id) && (barOk(eq) || !NEEDS_BAR.has(id)); });
    let pool = level === 'beg' ? ids.filter(id => !HARD.has(id)) : ids;
    if (!pool.length) pool = ids;
    return pool[Math.min(+alt || 0, pool.length - 1)] || null;
  }
  // יעד → סטים, חזרות, מנוחה. "ראשי" = שני התרגילים הראשונים באימון.
  const GOAL = {
    strength: { main: [4, 5], acc: [3, 8], rest: 150 },
    muscle:   { main: [4, 8], acc: [3, 12], rest: 90 },
    fit:      { main: [3, 12], acc: [3, 12], rest: 60 },
    burn:     { main: [3, 12], acc: [3, 15], rest: 45, ss: true, cardio: 15 },
  };
  function buildPlan(p) {
    const goal = GOAL[p.goal] || GOAL.muscle, level = p.level || 'beg';
    const eq = Array.isArray(p.eq) ? p.eq : null;
    const n = level === 'beg' ? 5 : level === 'int' ? 6 : 7;
    const days = Math.max(2, Math.min(6, +p.days || 3));
    const make = split => split.map(([key, wdays]) => {
      const tpl = TPL[key], used = new Set();
      const items = [];
      for (const spec of tpl.s) {
        if (items.length >= n) break;
        const id = pickSlot(spec, eq, level, used);
        if (!id) continue;
        used.add(id);
        const ex = exById(id), mode = autoMode(ex);
        const [sets, reps] = items.length < 2 ? goal.main : goal.acc;
        items.push(mode === 'wr' ? { exId: id, sets: level === 'adv' && items.length < 2 ? sets + 1 : sets, reps: Math.min(reps, REP_CAP[id] || 99) }
                                 : { exId: id, sets: 3, reps: MODE_DEF[mode].reps });
      }
      // שריפה: תרגילי העזר בזוגות (סופר-סט) — חוסך זמן ומעלה דופק
      if (goal.ss) for (let i = 2; i + 1 < items.length; i += 2) items[i].link = true;
      if (goal.cardio) {
        const c = pickSlot('cardio', eq, level, used);
        if (c) { const m = autoMode(exById(c)); items.push(m === 'cardio' ? { exId: c, sets: 1, reps: goal.cardio } : { exId: c, sets: 3, reps: 30 }); }
      }
      return { name: LANG === 'he' ? tpl.he : tpl.en, days: wdays.slice(), rest: goal.rest, items };
    });
    const plan = make(splitFor(days, level));
    const thin = plan.some(w => w.items.filter(i => itemMode(i) !== 'cardio').length < 4);
    return thin ? make(fullBodySplit(days)) : plan;
  }
  const woMinutes = w => Math.round(w.items.reduce((a, it) => {
    const m = itemMode(it), sets = +it.sets || 1;
    return a + (m === 'cardio' ? +it.reps : sets * ((m === 'time' ? +it.reps : (+it.reps || 10) * 3.5) + (w.rest || 90)) / 60);
  }, 0) / 5) * 5;

  // ── שאלון (חלון אחד, כמה שלבים) ──
  let BLD = null;
  function openBuilder() {
    const p = loadProfile();
    BLD = { step: 0, goal: p.goal || 'muscle', days: p.days || 3, level: p.level || 'beg', eq: Array.isArray(p.eq) ? p.eq.slice() : null,
            preset: p.eqPreset || (Array.isArray(p.eq) ? 'custom' : 'gym'), sex: p.sex || 'm', replace: false };
    drawBuilder();
    document.getElementById('bld-overlay').classList.add('open');
  }
  const optCard = (on, ic, t, s, attrs) => `<button class="opt-card${on ? ' on' : ''}" ${attrs}><span class="ic">${ic}</span><span class="tx"><b>${esc(t)}</b>${s ? `<small>${esc(s)}</small>` : ''}</span></button>`;
  function eqChipsHtml(eq, attr) {
    return `<div class="eq-chips">${EQ_KEYS.map(k => {
      const on = k === 'bw' || !eq || eq.includes(k);
      return `<button class="chip${on ? ' active' : ''}${k === 'bw' ? ' locked' : ''}" ${attr}="${k}">${EQ_ICON[k]} ${esc(T('eq_' + k))}</button>`;
    }).join('')}</div>`;
  }
  function drawBuilder() {
    const b = BLD, body = document.getElementById('bld-body'), STEPS = 6;
    const dots = `<div class="bld-dots">${Array.from({ length: STEPS }, (_, i) => `<i class="${i === b.step ? 'on' : i < b.step ? 'done' : ''}"></i>`).join('')}</div>`;
    let h = '';
    if (b.step === 0) {
      h = `<h3 class="bld-q">${esc(T('bldQGoal'))}</h3><div class="opt-list">` +
        [['muscle', '💪'], ['strength', '🏋️'], ['fit', '❤️'], ['burn', '🔥']].map(([k, ic]) =>
          optCard(b.goal === k, ic, T('goal_' + k), T('goal_' + k + 'S'), `data-goal="${k}"`)).join('') + '</div>';
    } else if (b.step === 1) {
      h = `<h3 class="bld-q">${esc(T('bldQDays'))}</h3><div class="an-seg bld-days">${[2, 3, 4, 5, 6].map(n =>
        `<button class="${b.days === n ? 'active' : ''}" data-days="${n}">${n}</button>`).join('')}</div>
        <div class="an-card-hint" style="text-align:center">${esc(T('daysN')(b.days))} · ${esc(T('daysHint')[b.days] || '')}</div>`;
    } else if (b.step === 2) {
      h = `<h3 class="bld-q">${esc(T('bldQLevel'))}</h3><div class="opt-list">` +
        [['beg', '🌱'], ['int', '📈'], ['adv', '🔥']].map(([k, ic]) => optCard(b.level === k, ic, T('lvl_' + k), T('lvl_' + k + 'S'), `data-level="${k}"`)).join('') + '</div>';
    } else if (b.step === 3) {
      h = `<h3 class="bld-q">${esc(T('bldQEq'))}</h3><div class="opt-list">` +
        [['gym', T('eqPresetGym')], ['bw', T('eqPresetBw')], ['db', T('eqPresetDb')], ['custom', T('eqPresetCustom')]].map(([k, t]) =>
          optCard(b.preset === k, '', t, '', `data-preset="${k}"`)).join('') + '</div>' +
        (b.preset === 'custom' ? eqChipsHtml(b.eq, 'data-eq') : '') + `<div class="an-card-hint">${esc(T('eqHint'))}</div>`;
    } else if (b.step === 4) {
      h = `<h3 class="bld-q">${esc(T('bldQSex'))}</h3><div class="opt-list two">` +
        optCard(b.sex === 'm', '', T('sex_m'), '', 'data-sex="m"') + optCard(b.sex === 'f', '', T('sex_f'), '', 'data-sex="f"') +
        `</div><div class="an-card-hint">${esc(T('sexHint'))}</div>`;
    } else {
      b.plan = buildPlan(b);
      const hasWo = loadWo().length > 0;
      h = `<h3 class="bld-q">${esc(T('bldPreview'))}</h3>` + b.plan.map(w => `<div class="plan-card bld-wo">
          <h3>${esc(w.name)} <small>${w.days.map(d => T('dayLong')[d]).join(' · ')}</small></h3>
          <p>${esc(T('bldWoLine')(w.items.length, woMinutes(w)))} · ${esc(T('restSec'))} ${w.rest} ${esc(T('secShort'))}</p>
          <ol>${(() => { const SS = ssInfo(w.items); return w.items.map((it, i) => { const ex = exById(it.exId), m = itemMode(it, ex), q = SS[i];
            return `<li${q ? ` class="ss${q.last ? ' ss-last' : ''}"` : ''}><span>${q ? `<i class="ss-tag">${q.g}${q.n}</i> ` : ''}${esc(exName(ex))}</span><b dir="ltr">${it.sets}×${it.reps}${m === 'time' ? '″' : m === 'cardio' ? '′' : ''}</b></li>`; }).join(''); })()}</ol></div>`).join('') +
        (b.plan.some(w => w.items.some(i => i.link)) ? `<div class="an-card-hint">🔗 ${esc(T('ssHint'))}</div>` : '') +
        `<div class="an-card-hint">${esc(T('bldEdit'))}</div>` +
        (hasWo ? `<label class="gd-agree" style="margin-top:10px"><input type="checkbox" id="bld-replace"${b.replace ? ' checked' : ''}><span>${esc(T('bldReplace'))}</span></label>` : '');
    }
    body.innerHTML = dots + h;
    const sel = (attr, fn) => body.querySelectorAll(`[${attr}]`).forEach(x => x.onclick = () => { fn(x.getAttribute(attr)); drawBuilder(); });
    sel('data-goal', v => { b.goal = v; });
    sel('data-days', v => { b.days = +v; });
    sel('data-level', v => { b.level = v; });
    sel('data-sex', v => { b.sex = v; });
    sel('data-preset', v => { b.preset = v; b.eq = v === 'custom' ? (b.eq || ['bw', 'db']) : EQ_PRESETS[v] ? EQ_PRESETS[v].slice() : null; });
    sel('data-eq', v => {
      if (v === 'bw') return;
      const s = new Set(b.eq || EQ_KEYS); s.has(v) ? s.delete(v) : s.add(v); s.add('bw');
      b.eq = EQ_KEYS.filter(k => s.has(k));
    });
    const rp = document.getElementById('bld-replace'); if (rp) rp.onchange = () => { b.replace = rp.checked; };
    const back = document.getElementById('bld-back'), next = document.getElementById('bld-next');
    back.style.visibility = b.step ? 'visible' : 'hidden';
    next.textContent = b.step === STEPS - 1 ? T('bldAdd') : T('bldNext');
    back.onclick = () => { b.step = Math.max(0, b.step - 1); drawBuilder(); };
    next.onclick = () => {
      if (b.step < STEPS - 1) {
        b.step++;
        if (b.step === STEPS - 1) saveProfile({ ...loadProfile(), goal: b.goal, days: b.days, level: b.level, eq: b.eq, eqPreset: b.preset, sex: b.sex, at: Date.now() });
        drawBuilder(); body.scrollTop = 0; return;
      }
      applyPlan(b.plan, b.replace);
    };
  }
  function applyPlan(plan, replace) {
    const ws = replace ? [] : loadWo();
    plan.forEach(w => ws.push({ id: uid(), name: w.name, days: w.days, rest: w.rest, items: w.items.map(i => ({ ...i })) }));
    saveWo(ws);
    document.getElementById('bld-overlay').classList.remove('open');
    toast(T('bldAdded')(plan.length));
    showView('wo');
  }

  // ══════════ 3. תרגיל משלי ══════════
  const CUSTOM_KEY = 'appnest-custom-ex';
  const loadCustom = () => { const a = store.get(CUSTOM_KEY, []); return Array.isArray(a) ? a : []; };
  const cxPlaceholder = name => 'data:image/svg+xml,' + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240"><rect width="320" height="240" fill="#1d1d1f"/><text x="160" y="118" font-size="64" text-anchor="middle">🏋️</text><text x="160" y="182" font-size="22" fill="#a1a1aa" text-anchor="middle" font-family="sans-serif">${esc((name || '').slice(0, 24))}</text></svg>`);
  function cxNormalize(c) {
    const img = c.photo || cxPlaceholder(c.name);
    const steps = (c.steps || []).filter(Boolean);
    return { id: c.id, name: c.name, category: c.category, body_part: c.category, equipment: c.equipment, target: c.target,
      muscle_group: c.target, secondary_muscles: [], image: img, gif_url: img, instruction_steps: { [LANG === 'he' ? 'he' : 'en']: steps },
      custom: true, hidden: !!c.hidden, mode: c.mode || undefined };
  }
  // נקרא מ-init() לפני בניית המסננים
  function mergeCustom() {
    const list = loadCustom().map(cxNormalize);
    state.exercises = EXERCISES.filter(e => !e.custom).concat(list);
    list.forEach(e => { EX_BY_ID[e.id] = e; });
    return list;
  }
  function refreshCustom() {
    mergeCustom();
    state.exercises.forEach(ex => { if (!ex._idx) ex._idx = `${ex.name} ${ex.category} ${ex.target} ${ex.equipment} ${VAL_HE[ex.category] || ''} ${VAL_HE[ex.target] || ''} ${VAL_HE[ex.equipment] || ''}`.toLowerCase(); });
    applyFilters();
    refreshViews();
  }
  function resizeImage(file, max) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file), im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL('image/jpeg', 0.72));
      };
      im.onerror = () => { URL.revokeObjectURL(url); reject(new Error('img')); };
      im.src = url;
    });
  }
  function openCustomForm(id) {
    const list = loadCustom(), cur = list.find(c => c.id === id);
    const c = cur ? { ...cur } : { id: 'c' + uid(), name: '', category: 'chest', target: 'pectorals', equipment: 'dumbbell', mode: '', photo: '', steps: [] };
    const base = EXERCISES.filter(e => !e.custom);
    const opts = (vals, curV) => uniqueSorted(vals).map(v => `<option value="${esc(v)}"${v === curV ? ' selected' : ''}>${esc(tv(v))}</option>`).join('');
    document.getElementById('cx-title').textContent = cur ? T('cxEditTitle') : T('cxTitle');
    const body = document.getElementById('cx-body');
    body.innerHTML = `
      <label class="fld">${esc(T('cxName'))}<input class="an-input" id="cx-name" maxlength="60" value="${esc(c.name)}" placeholder="${esc(T('cxNamePh'))}"></label>
      <div class="fld-row">
        <label class="fld">${esc(T('cxCat'))}<select class="an-input" id="cx-cat">${opts(base.map(e => e.category), c.category)}</select></label>
        <label class="fld">${esc(T('cxTarget'))}<select class="an-input" id="cx-target">${opts(base.map(e => e.target), c.target)}</select></label>
      </div>
      <div class="fld-row">
        <label class="fld">${esc(T('cxEquip'))}<select class="an-input" id="cx-equip">${opts(base.map(e => e.equipment), c.equipment)}</select></label>
        <label class="fld">${esc(T('cxMode'))}<select class="an-input" id="cx-mode"><option value="">${esc(T('mode_wr'))}</option>
          <option value="time"${c.mode === 'time' ? ' selected' : ''}>${esc(T('mode_time'))}</option>
          <option value="cardio"${c.mode === 'cardio' ? ' selected' : ''}>${esc(T('mode_cardio'))}</option></select></label>
      </div>
      <div class="fld">${esc(T('cxPhoto'))}
        <div class="cx-photo"><img id="cx-img" alt="" src="${esc(c.photo || cxPlaceholder(c.name))}">
          <div><button class="an-btn small" id="cx-pick">${esc(T('cxPhotoBtn'))}</button>
          <button class="an-btn small" id="cx-rm"${c.photo ? '' : ' hidden'}>${esc(T('cxPhotoRm'))}</button></div></div>
        <input type="file" id="cx-file" accept="image/*" hidden></div>
      <label class="fld">${esc(T('cxSteps'))}<textarea class="an-input" id="cx-steps" rows="4" maxlength="1200">${esc((c.steps || []).join('\n'))}</textarea></label>`;
    const file = document.getElementById('cx-file'), img = document.getElementById('cx-img'), rm = document.getElementById('cx-rm');
    document.getElementById('cx-pick').onclick = () => file.click();
    file.onchange = async () => {
      const f = file.files[0]; file.value = ''; if (!f) return;
      try { c.photo = await resizeImage(f, 480); img.src = c.photo; rm.hidden = false; } catch { toast(T('importErr')); }
    };
    rm.onclick = () => { c.photo = ''; img.src = cxPlaceholder(document.getElementById('cx-name').value); rm.hidden = true; };
    const acts = document.getElementById('cx-actions');
    acts.innerHTML = '';
    const mk = (label, cls, fn) => { const b = document.createElement('button'); b.className = 'an-btn' + (cls ? ' ' + cls : ''); b.textContent = label; b.onclick = fn; acts.appendChild(b); return b; };
    if (cur) mk(T('deleteBtn'), 'danger', async () => {
      if (!await appConfirm(T('cxDelConfirm'), T('deleteBtn'), true)) return;
      const used = loadHist().some(h => (h.items || []).some(i => i.exId === c.id));
      const all = loadCustom();
      const i = all.findIndex(x => x.id === c.id);
      if (used) all[i].hidden = true; else all.splice(i, 1);     // עם היסטוריה — מוסתר, כדי שהיומן ימשיך להציג את השם
      store.set(CUSTOM_KEY, all);
      saveWo(loadWo().map(w => ({ ...w, items: w.items.filter(it => it.exId !== c.id) })));
      document.getElementById('cx-overlay').classList.remove('open');
      if (modalOverlay.classList.contains('open')) closeModal();
      toast(T('cxDeleted')); refreshCustom();
    });
    const sp = document.createElement('span'); sp.style.flex = '1'; acts.appendChild(sp);
    mk(T('cancel'), '', () => document.getElementById('cx-overlay').classList.remove('open'));
    mk(T('save'), 'primary', () => {
      const name = document.getElementById('cx-name').value.trim();
      if (!name) { toast(T('cxNeedName')); document.getElementById('cx-name').focus(); return; }
      Object.assign(c, { name, category: document.getElementById('cx-cat').value, target: document.getElementById('cx-target').value,
        equipment: document.getElementById('cx-equip').value, mode: document.getElementById('cx-mode').value,
        steps: document.getElementById('cx-steps').value.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 20) });
      const all = loadCustom(), i = all.findIndex(x => x.id === c.id);
      if (i >= 0) all[i] = c; else all.push(c);
      if (!store.set(CUSTOM_KEY, all)) return;
      document.getElementById('cx-overlay').classList.remove('open');
      toast(T('cxSaved'));
      refreshCustom();
      if (modalOverlay.classList.contains('open') && modalGif.dataset.exId === c.id) openModal(c.id);
    });
    document.getElementById('cx-overlay').classList.add('open');
  }

  // ══════════ 4. מפת שרירים (נתוני MuscleMap, MIT — bodymap.js נטען בעצלות) ══════════
  let BM_PROMISE = null;
  function needBodymap() {
    if (window.BODYMAP) return Promise.resolve(window.BODYMAP);
    if (!BM_PROMISE) BM_PROMISE = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = BODYMAP_SRC; s.onload = () => resolve(window.BODYMAP); s.onerror = () => { BM_PROMISE = null; reject(new Error('bodymap')); };
      document.head.appendChild(s);
    });
    return BM_PROMISE;
  }
  const BODYMAP_SRC = 'bodymap.js?v=22';
  const BM_INERT = new Set(['hair', 'head', 'hands', 'feet', 'knees', 'ankles']);
  // שריר במאגר → אזור במפה
  const MUS_SLUG = {
    'abs': ['abs'], 'abdominals': ['abs'], 'lower abs': ['abs'], 'core': ['abs', 'obliques'], 'obliques': ['obliques'],
    'quads': ['quadriceps'], 'quadriceps': ['quadriceps'], 'lats': ['upperBack'], 'latissimus dorsi': ['upperBack'],
    'upper back': ['upperBack', 'rhomboids'], 'back': ['upperBack'], 'rhomboids': ['rhomboids'],
    'calves': ['calves'], 'soleus': ['calves'], 'shins': ['tibialis'], 'pectorals': ['chest'], 'chest': ['chest'], 'upper chest': ['chest'],
    'glutes': ['gluteal'], 'abductors': ['gluteal'], 'hamstrings': ['hamstring'], 'adductors': ['adductors'], 'groin': ['adductors'], 'inner thighs': ['adductors'],
    'triceps': ['triceps'], 'biceps': ['biceps'], 'brachialis': ['biceps'], 'spine': ['lowerBack'], 'lower back': ['lowerBack'],
    'delts': ['deltoids'], 'deltoids': ['deltoids'], 'shoulders': ['deltoids'], 'rear deltoids': ['deltoids'], 'rotator cuff': ['rotatorCuff'],
    'forearms': ['forearm'], 'wrists': ['forearm'], 'wrist flexors': ['forearm'], 'wrist extensors': ['forearm'], 'grip muscles': ['forearm'], 'hands': ['forearm'],
    'traps': ['trapezius'], 'trapezius': ['trapezius'], 'serratus anterior': ['serratus'], 'levator scapulae': ['neck'], 'sternocleidomastoid': ['neck'],
    'hip flexors': ['hipFlexors'],
  };
  // אזור במפה → שרירי מטרה במאגר (לסינון הספרייה)
  const SLUG_TARGETS = {
    chest: ['pectorals'], abs: ['abs'], obliques: ['abs'], biceps: ['biceps'], triceps: ['triceps'], deltoids: ['delts'],
    forearm: ['forearms'], quadriceps: ['quads'], calves: ['calves'], tibialis: ['calves'], adductors: ['adductors'],
    trapezius: ['traps'], upperBack: ['lats', 'upper back'], rhomboids: ['upper back'], rotatorCuff: ['upper back'], lowerBack: ['spine'],
    gluteal: ['glutes', 'abductors'], hamstring: ['hamstrings'], serratus: ['serratus anterior'], neck: ['levator scapulae'], hipFlexors: [],
  };
  // עומס לכל אזור: שריר מטרה = 1 לסט, שרירים משניים = 0.5
  function exSlugs(ex) {
    const out = {};
    if (!ex) return out;
    (MUS_SLUG[ex.target] || []).forEach(s => { out[s] = 1; });
    (ex.secondary_muscles || []).forEach(m => (MUS_SLUG[m] || []).forEach(s => { if (!out[s]) out[s] = 0.5; }));
    return out;
  }
  function muscleLoad(days) {
    const since = Date.now() - days * 864e5, load = {};
    stats().hist.filter(h => h.start >= since).forEach(h => (h.items || []).forEach(it => {
      const n = (it.sets || []).length, sl = exSlugs(exById(it.exId));
      Object.entries(sl).forEach(([s, k]) => { load[s] = (load[s] || 0) + n * k; });
    }));
    return load;
  }
  // heat: { slug: 0..1 } · opts: { sel: Set, cls }
  function bodySvg(view, heat, opts = {}) {
    const B = window.BODYMAP, sex = loadProfile().sex === 'f' ? 'f' : 'm', v = B[sex + view];
    let h = `<svg class="bm-svg ${opts.cls || ''}" viewBox="${v.vb}" role="img" aria-label="${esc(T(view === 'f' ? 'bmFront' : 'bmBack'))}">`;
    for (const [slug, paths] of Object.entries(v.p)) {
      if (BM_INERT.has(slug)) { h += paths.map(d => `<path class="bm-inert" d="${d}"/>`).join(''); continue; }
      const lv = heat[slug] || 0, sel = opts.sel && opts.sel.has(slug);
      const st = lv > 0 ? ` style="fill-opacity:${(0.2 + 0.8 * Math.min(1, lv)).toFixed(2)}"` : '';
      h += `<g class="bm-m${lv > 0 ? ' hot' : ''}${sel ? ' sel' : ''}" data-slug="${slug}"${st}>${paths.map(d => `<path d="${d}"/>`).join('')}</g>`;
    }
    return h + '</svg>';
  }
  function bodyPairHtml(heat, opts) {
    return `<div class="bm-pair"><figure>${bodySvg('f', heat, opts)}<figcaption>${esc(T('bmFront'))}</figcaption></figure>` +
      `<figure>${bodySvg('b', heat, opts)}<figcaption>${esc(T('bmBack'))}</figcaption></figure></div>`;
  }
  // מסך התקדמות: עומס לפי שריר בטווח שנבחר (7/30 יום)
  function renderProgMap() {
    const box = document.getElementById('prog-map');
    if (!box) return;
    if (!window.BODYMAP) { box.innerHTML = `<div class="empty-mini">${esc(T('bmLoading'))}</div>`; needBodymap().then(renderProgMap).catch(() => {}); return; }
    const load = muscleLoad(progDays), max = Math.max(0, ...Object.values(load));
    const heat = {}; Object.entries(load).forEach(([s, v]) => { heat[s] = max ? v / max : 0; });
    box.innerHTML = bodyPairHtml(heat) + `<div class="bm-read" aria-live="polite">${esc(max ? T('bmTap') : T('musclesEmpty'))}</div>`;
    box.querySelectorAll('.bm-m').forEach(g => g.addEventListener('click', () => {
      box.querySelectorAll('.bm-m.sel').forEach(x => x.classList.remove('sel'));
      box.querySelectorAll(`.bm-m[data-slug="${g.dataset.slug}"]`).forEach(x => x.classList.add('sel'));
      const v = load[g.dataset.slug] || 0, n = mus(g.dataset.slug);
      box.querySelector('.bm-read').textContent = v ? T('bmSets')(n, Math.round(v * 10) / 10) : T('bmNone')(n);
    }));
  }
  // חלון התרגיל: שריר מטרה מלא, משניים חלשים
  function modalBodyHtml(ex) {
    const sl = exSlugs(ex);
    if (!Object.keys(sl).length) return '';
    if (!window.BODYMAP) { needBodymap().then(() => { const el = document.getElementById('modal-bm'); if (el && modalGif.dataset.exId === ex.id) el.outerHTML = modalBodyHtml(ex); }).catch(() => {}); return '<div id="modal-bm" class="bm-mini"></div>'; }
    const heat = {}; Object.entries(sl).forEach(([s, k]) => { heat[s] = k === 1 ? 1 : 0.3; });
    return `<div id="modal-bm" class="bm-mini">${bodyPairHtml(heat, { cls: 'mini' })}</div>`;
  }
  // הספרייה: בחירת שריר מתוך המפה
  function openBodyPick() {
    const ov = document.getElementById('bmp-overlay'), box = document.getElementById('bmp-body');
    ov.classList.add('open');
    const sel = new Set(Object.keys(SLUG_TARGETS).filter(s => SLUG_TARGETS[s].length && SLUG_TARGETS[s].every(t => state.filters.target.has(t))));
    if (!window.BODYMAP) { box.innerHTML = `<div class="empty-mini">${esc(T('bmLoading'))}</div>`; needBodymap().then(openBodyPick).catch(() => {}); return; }
    box.innerHTML = bodyPairHtml({}, { sel, cls: 'pick' }) + `<div class="bm-read">${esc(T('bmPickSub'))}</div>`;
    box.querySelectorAll('.bm-m').forEach(g => g.addEventListener('click', () => {
      const slug = g.dataset.slug, targets = (SLUG_TARGETS[slug] || []).filter(t => state.exercises.some(e => e.target === t));
      if (!targets.length) { box.querySelector('.bm-read').textContent = `${mus(slug)} · ${T('bmNoEx')}`; return; }
      state.filters.target.clear();
      targets.forEach(t => state.filters.target.add(t));
      document.querySelectorAll('.chip[data-filter="target"]').forEach(c => c.classList.toggle('active', state.filters.target.has(c.dataset.value)));
      applyFilters();
      ov.classList.remove('open');
      showView('lib');
      toast(T('bmPicked')(mus(slug), state.filtered.length));
    }));
  }

  // ══════════ 5. משקל ומדידות ══════════
  const BODY_KEY = 'appnest-body', BODYTRACK_KEY = 'appnest-bodytrack';
  const bodyTrackOn = () => localStorage.getItem(BODYTRACK_KEY) !== '0';
  const loadBody = () => { const b = store.get(BODY_KEY, null); return b && Array.isArray(b.entries) ? b : { entries: [], goal: null }; };
  const saveBody = b => { b.entries.sort((a, c) => a.at - c.at); return store.set(BODY_KEY, b); };
  const MEAS = ['waist', 'chest', 'hips', 'arm', 'thigh'];
  const MEAS_T = { waist: 'bdWaist', chest: 'bdChest', hips: 'bdHips', arm: 'bdArm', thigh: 'bdThigh' };
  function lineChartHtml(pts, title, fmtV) {
    if (pts.length < 2) return '';
    const W = 320, H = 120, L = 8, R = 8, Tp = 14, B = 22;
    const vs = pts.map(p => p.v), lo = Math.min(...vs), hi = Math.max(...vs);
    const pad = (hi - lo) * 0.2 || Math.max(0.5, hi * 0.02);
    const y0 = lo - pad, y1 = hi + pad, t0 = pts[0].at, t1 = pts[pts.length - 1].at;
    const X = t => L + (t1 === t0 ? 0.5 : (t - t0) / (t1 - t0)) * (W - L - R);
    const Y = v => Tp + (1 - (v - y0) / (y1 - y0)) * (H - Tp - B);
    const d = pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.at).toFixed(1)},${Y(p.v).toFixed(1)}`).join(' ');
    const fmtD = t => new Date(t).toLocaleDateString(LANG === 'he' ? 'he-IL' : 'en-GB', { day: 'numeric', month: 'short' });
    const dots = pts.map((p, i) => `<circle class="xc-dot" cx="${X(p.at).toFixed(1)}" cy="${Y(p.v).toFixed(1)}" r="${i === pts.length - 1 ? 4.5 : 2.6}"></circle>
      <rect class="xc-hit" x="${(X(p.at) - 12).toFixed(1)}" y="0" width="24" height="${H}" data-i="${i}"></rect>`).join('');
    const data = esc(JSON.stringify(pts.map(p => [fmtD(p.at), fmtV(p.v)])));
    const last = pts[pts.length - 1];
    return `<div class="xchart" data-pts="${data}">
      <svg viewBox="0 0 ${W} ${H}" class="xc-svg" role="img" aria-label="${esc(title)}" style="direction:ltr">
        ${[0.33, 0.66].map(f => `<line class="xc-grid" x1="${L}" x2="${W - R}" y1="${(Tp + f * (H - Tp - B)).toFixed(1)}" y2="${(Tp + f * (H - Tp - B)).toFixed(1)}"></line>`).join('')}
        <line class="xc-axis" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"></line>
        <path class="xc-line" d="${d}"></path>${dots}
        <text class="xc-lbl" x="${L}" y="${H - 6}" text-anchor="start">${esc(fmtD(t0))}</text>
        <text class="xc-lbl" x="${W - R}" y="${H - 6}" text-anchor="end">${esc(fmtD(t1))}</text>
      </svg><div class="xc-read" aria-live="polite">${esc(fmtD(last.at))} · <b>${esc(fmtV(last.v))}</b></div></div>`;
  }
  function renderBodyCard() {
    const card = document.getElementById('prog-body');
    if (!card) return;
    card.hidden = !bodyTrackOn();
    if (card.hidden) return;
    const b = loadBody(), ws = b.entries.filter(e => e.w > 0);
    const head = `<div class="hcard-h"><span>${esc(T('bdTitle'))}</span><button class="an-btn small" id="bd-add">${esc(T('bdAdd'))}</button></div>`;
    if (!b.entries.length) { card.innerHTML = head + `<div class="empty-mini">${esc(T('bdEmpty'))}</div>`; }
    else {
      const last = ws[ws.length - 1];
      const ago = ws.filter(e => e.at <= Date.now() - 30 * 864e5).pop() || ws[0];
      const ch = last && ago && last !== ago ? Math.round((last.w - ago.w) * 10) / 10 : null;
      const goal = b.goal > 0 ? b.goal : null;
      const left = goal && last ? Math.round(Math.abs(last.w - goal) * 10) / 10 : null;
      const lm = b.entries.slice().reverse().find(e => MEAS.some(k => e[k] > 0));
      card.innerHTML = head + `<div class="bd-top">
          ${last ? `<div class="tile"><div class="tile-l">${esc(T('bdWeight'))}</div><div class="tile-v">${fmtKg(last.w)}<small>${esc(T('kg'))}</small></div></div>` : ''}
          ${ch != null ? `<div class="tile"><div class="tile-l">${esc(T('bdChange30'))}</div><div class="tile-v" dir="ltr">${ch > 0 ? '+' : ''}${fmtKg(ch)}</div></div>` : ''}
          ${goal ? `<div class="tile"><div class="tile-l">${esc(T('bdGoal'))} · ${fmtKg(goal)}</div><div class="tile-v small">${esc(left < 0.25 ? T('bdGoalHit') : T('bdGoalLeft')(fmtKg(left)))}</div></div>` : ''}
        </div>` +
        lineChartHtml(ws.slice(-30).map(e => ({ at: e.at, v: e.w })), T('bdChart'), v => fmtKg(v) + ' ' + T('kg')) +
        (lm ? `<div class="bd-meas">${MEAS.filter(k => lm[k] > 0).map(k => `<span>${esc(T(MEAS_T[k]))} <b>${fmtKg(lm[k])}</b></span>`).join('')}</div>` : '');
    }
    document.getElementById('bd-add').onclick = openBodyLog;
  }
  function openBodyLog() {
    const b = loadBody(), last = b.entries[b.entries.length - 1] || {};
    const today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    const box = document.getElementById('bdl-body');
    box.innerHTML = `<div class="fld-row">
        <label class="fld">${esc(T('bdDate'))}<input class="an-input" type="date" id="bdl-date" value="${today.toISOString().slice(0, 10)}" max="${today.toISOString().slice(0, 10)}"></label>
        <label class="fld">${esc(T('bdWeight'))}<input class="an-input" type="number" inputmode="decimal" step="0.1" min="20" max="400" id="bdl-w" placeholder="${last.w ? fmtKg(last.w) : ''}"></label>
      </div>
      <details class="bdl-more"><summary>${esc(T('bdMeasures'))} ▾</summary><div class="fld-grid">
        ${MEAS.map(k => `<label class="fld">${esc(T(MEAS_T[k]))}<input class="an-input" type="number" inputmode="decimal" step="0.5" min="0" max="300" data-m="${k}" placeholder="${last[k] ? fmtKg(last[k]) : ''}"></label>`).join('')}
      </div></details>
      <label class="fld">${esc(T('bdGoalLabel'))}<input class="an-input" type="number" inputmode="decimal" step="0.5" min="20" max="400" id="bdl-goal" value="${b.goal > 0 ? b.goal : ''}" placeholder="${esc(T('bdGoalPh'))}"></label>
      <div class="an-card-hint">${esc(T('bdNote'))}</div>
      ${b.entries.length ? `<div class="an-card-label" style="margin-top:14px">${esc(T('bdRecent'))}</div><div class="bdl-list">${b.entries.slice(-8).reverse().map(e =>
        `<div class="bdl-row"><span>${new Date(e.at).toLocaleDateString()}</span><b>${e.w > 0 ? fmtKg(e.w) + ' ' + esc(T('kg')) : '—'}</b><small>${MEAS.filter(k => e[k] > 0).map(k => esc(T(MEAS_T[k])) + ' ' + fmtKg(e[k])).join(' · ')}</small><button class="set-x" data-del="${e.at}">×</button></div>`).join('')}</div>` : ''}`;
    box.querySelectorAll('[data-del]').forEach(x => x.onclick = async () => {
      if (!await appConfirm(T('bdDel'), T('deleteBtn'), true)) return;
      const bb = loadBody(); bb.entries = bb.entries.filter(e => e.at !== +x.dataset.del); saveBody(bb); openBodyLog(); renderBodyCard();
    });
    document.getElementById('bdl-save').onclick = () => {
      const bb = loadBody();
      const g = +document.getElementById('bdl-goal').value; bb.goal = g > 0 ? g : null;
      const w = +document.getElementById('bdl-w').value;
      const e = { at: new Date(document.getElementById('bdl-date').value + 'T12:00').getTime() || Date.now() };
      if (w > 0) e.w = Math.round(w * 10) / 10;
      box.querySelectorAll('[data-m]').forEach(i => { if (+i.value > 0) e[i.dataset.m] = Math.round(+i.value * 10) / 10; });
      const changedGoal = (loadBody().goal || null) !== bb.goal;
      if (Object.keys(e).length > 1) {
        bb.entries = bb.entries.filter(x => dayKey(x.at) !== dayKey(e.at));   // רישום אחד ליום — האחרון קובע
        bb.entries.push(e);
      } else if (!changedGoal) { toast(T('bdNeed')); return; }
      saveBody(bb);
      document.getElementById('bdl-overlay').classList.remove('open');
      toast(T('bdSaved'));
      if (VIEW === 'prog') renderBodyCard();
    };
    document.getElementById('bdl-overlay').classList.add('open');
  }

  // ══════════ 6. סופר-סטים ══════════
  // item.link = true ← מחובר לתרגיל שאחריו. מחזיר לכל מקום {g:'A', n:1, first, last} או null.
  function ssInfo(items) {
    const out = items.map(() => null);
    let g = 0, i = 0;
    while (i < items.length) {
      if (items[i].link && i + 1 < items.length) {
        let j = i; while (j < items.length - 1 && items[j].link) j++;
        const L = String.fromCharCode(65 + g++);
        for (let k = i; k <= j; k++) out[k] = { g: L, n: k - i + 1, first: k === i, last: k === j };
        i = j + 1;
      } else i++;
    }
    return out;
  }

  // ══════════ 7. מחשבון צלחות ══════════
  const PLATES_KEY = 'appnest-plates';
  const ALL_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];
  const loadPlates = () => ({ bar: 20, have: ALL_PLATES.slice(), ...(store.get(PLATES_KEY, {}) || {}) });
  function platesFor(total, bar, have) {
    let side = (total - bar) / 2;
    if (side <= 0) return { list: [], rest: 0 };
    const list = [];
    have.slice().sort((a, b) => b - a).forEach(p => { while (side >= p - 1e-9) { list.push(p); side -= p; } });
    return { list, rest: Math.round(side * 2 * 100) / 100 };
  }
  let PL_CB = null;
  function openPlates(weight, ex, cb) {
    const P = loadPlates();
    if (ex && /ez barbell/.test(ex.equipment) && P.bar === 20) P.bar = 10;
    PL_CB = cb || null;
    const box = document.getElementById('pl-body');
    box.innerHTML = `<label class="fld">${esc(T('plTotal'))}<input class="an-input pl-total" type="number" inputmode="decimal" step="0.5" min="0" max="500" id="pl-total" value="${weight > 0 ? weight : 60}"></label>
      <div class="an-card-label">${esc(T('plBar'))}</div>
      <div class="an-seg pl-bar">${[20, 15, 10, 0].map(v => `<button data-bar="${v}" class="${P.bar === v ? 'active' : ''}">${v ? v + ' ' + esc(T('kg')) : esc(T('plNoBar'))}</button>`).join('')}</div>
      <div id="pl-out"></div>
      <div class="an-card-label" style="margin-top:14px">${esc(T('plHave'))}</div>
      <div class="pl-have">${ALL_PLATES.map(p => `<button class="chip${P.have.includes(p) ? ' active' : ''}" data-have="${p}">${p}</button>`).join('')}</div>`;
    const draw = () => {
      const tot = +document.getElementById('pl-total').value || 0, r = platesFor(tot, P.bar, P.have);
      const cnt = {}; r.list.forEach(p => { cnt[p] = (cnt[p] || 0) + 1; });
      const txt = r.list.length ? Object.entries(cnt).sort((a, b) => b[0] - a[0]).map(([p, n]) => n > 1 ? `${n}×${p}` : p).join(' + ') : T('plOnlyBar');
      document.getElementById('pl-out').innerHTML = `<div class="pl-vis" dir="ltr"><span class="pl-sleeve"></span>${r.list.map(p =>
          `<span class="pl-plate p${String(p).replace('.', '_')}" style="height:${30 + p * 3.2}px">${p}</span>`).join('')}<span class="pl-collar"></span></div>
        <div class="pl-txt"><b>${esc(T('plPerSide'))}</b> <span dir="ltr">${esc(txt)}</span></div>
        ${r.rest > 0 ? `<div class="an-card-hint warn">${esc(T('plClosest')(fmtKg(tot - r.rest)))}</div>` : ''}`;
      store.set(PLATES_KEY, { bar: P.bar, have: P.have });
    };
    document.getElementById('pl-total').oninput = draw;
    box.querySelectorAll('[data-bar]').forEach(x => x.onclick = () => { P.bar = +x.dataset.bar; box.querySelectorAll('[data-bar]').forEach(y => y.classList.toggle('active', y === x)); draw(); });
    box.querySelectorAll('[data-have]').forEach(x => x.onclick = () => {
      const p = +x.dataset.have, i = P.have.indexOf(p);
      if (i >= 0) P.have.splice(i, 1); else P.have.push(p);
      x.classList.toggle('active', i < 0); draw();
    });
    const use = document.getElementById('pl-use');
    use.hidden = !PL_CB;
    use.onclick = () => { const v = +document.getElementById('pl-total').value; if (PL_CB && v >= 0) PL_CB(v); document.getElementById('pl-overlay').classList.remove('open'); toast(T('plUsed')); };
    draw();
    document.getElementById('pl-overlay').classList.add('open');
  }
  const isBarbell = ex => !!ex && /barbell|trap bar|smith/.test(ex.equipment);

  // ══════════ 8. כרטיס סיכום לשיתוף (Canvas) ══════════
  let SHARE_FILE = null;
  function drawShareCard(h) {
    const W = 1080, H = 1350, c = document.createElement('canvas'); c.width = W; c.height = H;
    const x = c.getContext('2d'), cs = getComputedStyle(document.documentElement);
    const acc = (cs.getPropertyValue('--accent') || '#d4a437').trim(), rtl = LANG === 'he';
    const F = (w, s) => `${w} ${s}px -apple-system, "Segoe UI", Roboto, "Noto Sans Hebrew", Arial, sans-serif`;
    const g = x.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#17171a'); g.addColorStop(1, '#0a0a0a');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = acc; x.fillRect(0, 0, W, 14);
    x.direction = rtl ? 'rtl' : 'ltr'; x.textAlign = rtl ? 'right' : 'left';
    const X0 = rtl ? W - 80 : 80, line = (txt, y, font, color, max) => { x.font = font; x.fillStyle = color; x.fillText(txt, X0, y, max || W - 160); };
    line(T('appTitle').replace(/<[^>]+>/g, ''), 110, F(700, 34), acc);
    line(h.name, 200, F(800, 68), '#f5f5f4');
    line(new Date(h.start).toLocaleDateString(rtl ? 'he-IL' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }), 262, F(500, 32), '#a1a1aa');
    // אריחים
    const prs = stats().prsByEntry[h.id] || [];
    const tiles = [[T('tDuration'), fmtDur(h.end - h.start)], [T('tSets'), String(histSets(h))],
      [T('tVolume'), histVolume(h) ? Math.round(histVolume(h)).toLocaleString() + ' ' + T('kg') : '—']];
    const tw = (W - 160 - 2 * 24) / 3;
    tiles.forEach(([l, v], i) => {
      const tx = rtl ? W - 80 - (i + 1) * tw - i * 24 : 80 + i * (tw + 24);
      x.fillStyle = '#1d1d1f'; x.beginPath(); x.roundRect ? x.roundRect(tx, 320, tw, 170, 26) : x.rect(tx, 320, tw, 170); x.fill();
      x.textAlign = 'center'; x.fillStyle = '#a1a1aa'; x.font = F(600, 28); x.fillText(l, tx + tw / 2, 375, tw - 20);
      x.fillStyle = '#f5f5f4'; x.font = F(800, 52); x.fillText(String(v).replace(/<[^>]+>/g, ''), tx + tw / 2, 450, tw - 20);
    });
    x.textAlign = rtl ? 'right' : 'left';
    let y = 580;
    if (prs.length) {
      line(T('shPrs')(prs.length), y, F(800, 40), acc); y += 58;
      prs.slice(0, 3).forEach(p => { const ex = exById(p.exId); line(`${ex ? exName(ex) : p.exId} · ${setLabel(ex, p, p.mode)}`, y, F(600, 32), '#f5f5f4'); y += 48; });
      y += 24;
    }
    const items = h.items || [], maxRows = prs.length ? 6 : 9;
    items.slice(0, maxRows).forEach(it => {
      const ex = exById(it.exId), mode = it.mode || 'wr';
      let top = it.sets[0]; it.sets.forEach(s => { if (beats(setScore(mode, s), setScore(mode, top))) top = s; });
      x.fillStyle = acc; x.beginPath(); x.arc(rtl ? W - 92 : 92, y - 11, 7, 0, 7); x.fill();
      x.font = F(600, 34); x.fillStyle = '#f5f5f4';
      x.fillText(ex ? exName(ex) : it.exId, rtl ? W - 116 : 116, y, W - 480);
      x.textAlign = rtl ? 'left' : 'right'; x.fillStyle = '#a1a1aa'; x.font = F(600, 32);
      x.fillText(`${it.sets.length} × ${top ? setLabel(ex, top, mode) : ''}`, rtl ? 80 : W - 80, y, 320);
      x.textAlign = rtl ? 'right' : 'left';
      y += 62;
    });
    if (items.length > maxRows) line(T('shMore')(items.length - maxRows), y, F(500, 30), '#71717a');
    x.fillStyle = '#2a2a2e'; x.fillRect(80, H - 130, W - 160, 2);
    x.textAlign = 'center'; x.fillStyle = '#71717a'; x.font = F(600, 28);
    x.fillText('AppNest · exercisesapp.pages.dev', W / 2, H - 72);
    return c;
  }
  function openShare(histId) {
    const h = loadHist().find(x => x.id === histId); if (!h) return;
    const c = drawShareCard(h), img = document.getElementById('sh-img');
    img.src = c.toDataURL('image/png');
    SHARE_FILE = null;
    c.toBlob(b => { SHARE_FILE = new File([b], `workout-${new Date(h.start).toISOString().slice(0, 10)}.png`, { type: 'image/png' }); }, 'image/png');
    const btn = document.getElementById('sh-share');
    btn.hidden = !(navigator.canShare && navigator.canShare({ files: [new File([''], 'x.png', { type: 'image/png' })] }));
    btn.onclick = async () => { if (!SHARE_FILE) return; try { await navigator.share({ files: [SHARE_FILE], title: h.name }); } catch {} };
    document.getElementById('sh-save').onclick = () => {
      const a = document.createElement('a'); a.href = img.src; a.download = SHARE_FILE ? SHARE_FILE.name : 'workout.png';
      document.body.appendChild(a); a.click(); a.remove(); toast(T('shDone'));
    };
    document.getElementById('sh-overlay').classList.add('open');
  }

  // ══════════ 9. מאמן AI — הגדרות BYOK + עוזר AppNest ══════════
  // הפורמט {provider, keys:{...}} זהה לברירת המחדל של המנוע — המנוע קורא ישר מהמפתח הזה (aiConfigKey).
  const AI_KEY = 'appnest-fit-ai', ASST_KEY = 'appnest-asst';
  const AI_PROV = [
    { id: 'gemini', nm: 'Gemini (Google)', key: 'gemini', ph: 'AIza…', steps: 'aiGeminiSteps', free: true },
    { id: 'claude', nm: 'Claude (Anthropic)', key: 'claude', ph: 'sk-ant-…', steps: 'aiClaudeSteps' },
    { id: 'openai', nm: 'ChatGPT (OpenAI)', key: 'openai', ph: 'sk-…', steps: 'aiOpenaiSteps' },
    { id: 'device', nm: 'Ollama / LM Studio', key: 'deviceUrl', ph: 'http://localhost:11434/v1', steps: 'aiDeviceSteps', url: true },
    { id: 'custom', nm: 'Custom (OpenAI-compatible)', key: 'customUrl', ph: 'https://…/v1/chat/completions', steps: 'aiCustomSteps', url: true },
  ];
  const aiCfg = () => { const c = store.get(AI_KEY, null); return c && c.provider ? c : null; };
  function aiConnected() {
    const c = aiCfg(); if (!c) return false;
    const p = AI_PROV.find(x => x.id === c.provider);
    return !!(p && c.keys && String(c.keys[p.key] || '').trim());
  }
  const asstOn = () => localStorage.getItem(ASST_KEY) !== '0';
  let AI_SEL = null;
  function openAiSetup() {
    const c = aiCfg() || { provider: null, keys: {} };
    AI_SEL = AI_SEL || c.provider || 'gemini';
    const box = document.getElementById('ai-body');
    box.innerHTML = `<div class="an-note" style="margin-bottom:12px"><div class="an-note-b">🔐 ${esc(T('aiIntro'))}</div></div>
      <div class="an-card-label">${esc(T('aiPick'))}</div>` +
      AI_PROV.map(p => {
        const on = AI_SEL === p.id, v = (c.keys || {})[p.key] || '';
        return `<div class="ai-opt${on ? ' on' : ''}"><button class="ai-opt-h" data-prov="${p.id}"><b>${esc(p.nm)}</b>${p.free ? `<span class="ai-badge">${esc(T('aiFree'))} · ${esc(T('aiRec'))}</span>` : ''}${c.provider === p.id && aiConnected() ? '<span class="ai-dot"></span>' : ''}</button>
          ${on ? `<div class="ai-opt-b"><label class="fld">${esc(p.url ? T('aiUrl') : T('aiKey'))}<input class="an-input" id="ai-in" type="${p.url ? 'url' : 'password'}" autocomplete="off" spellcheck="false" dir="ltr" placeholder="${esc(p.ph)}" value="${esc(v)}"></label>
            ${p.id === 'custom' ? `<label class="fld">${esc(T('aiKey'))}<input class="an-input" id="ai-in2" type="password" autocomplete="off" dir="ltr" value="${esc((c.keys || {}).customKey || '')}"></label>` : ''}
            <div class="an-card-hint">${esc(T(p.steps))}</div></div>` : ''}</div>`;
      }).join('') +
      `<div class="an-card-hint" style="margin-top:10px">${esc(T('aiPrivacy'))}</div><div class="ai-status" id="ai-status"></div>`;
    box.querySelectorAll('[data-prov]').forEach(b => b.onclick = () => { AI_SEL = b.dataset.prov; openAiSetup(); });
    const acts = document.getElementById('ai-actions'); acts.innerHTML = '';
    const mk = (label, cls, fn, id) => { const b = document.createElement('button'); b.className = 'an-btn' + (cls ? ' ' + cls : ''); b.textContent = label; b.onclick = fn; if (id) b.id = id; acts.appendChild(b); return b; };
    if (aiConnected()) mk(T('aiDisconnect'), 'danger', () => { localStorage.removeItem(AI_KEY); AI_SEL = null; openAiSetup(); paintAiCard(); });
    const sp = document.createElement('span'); sp.style.flex = '1'; acts.appendChild(sp);
    mk(T('aiTest'), '', aiTestUi, 'ai-test');
    mk(T('aiSave'), 'primary', () => {
      if (!aiSaveSel()) return;
      toast(T('aiSaved')); paintAiCard();
      document.getElementById('ai-overlay').classList.remove('open');
      if (asstOn()) loadAssistant();
    });
    document.getElementById('ai-overlay').classList.add('open');
  }
  function aiSaveSel() {
    const p = AI_PROV.find(x => x.id === AI_SEL), inp = document.getElementById('ai-in');
    const v = inp ? inp.value.trim() : '';
    if (!v) { toast(T('aiNeedKey')); inp && inp.focus(); return false; }
    const c = aiCfg() || { keys: {} };
    c.provider = p.id; c.keys = c.keys || {}; c.keys[p.key] = v;
    if (p.id === 'custom') { const k2 = document.getElementById('ai-in2'); c.keys.customKey = k2 ? k2.value.trim() : ''; }
    return store.set(AI_KEY, c);
  }
  async function aiTestUi() {
    const st = document.getElementById('ai-status'), btn = document.getElementById('ai-test');
    if (!aiSaveSel()) return;
    btn.disabled = true; st.className = 'ai-status'; st.textContent = T('aiTesting');
    try { await aiPing(aiCfg()); st.className = 'ai-status ok'; st.textContent = T('aiTestOk'); paintAiCard(); }
    catch (e) { st.className = 'ai-status bad'; st.textContent = T('aiTestFail')(String(e.message || e).slice(0, 140)); }
    btn.disabled = false;
  }
  // בדיקת חיבור קצרה (אותם קצוות כמו המנוע; תשובה של מילה אחת)
  async function aiPing(c) {
    const k = c.keys || {}, first = s => String(s || '').split(/[\n,;]+/).map(x => x.trim()).filter(Boolean)[0] || '';
    const err = async r => { const j = await r.json().catch(() => ({})); return new Error((j.error && (j.error.message || j.error)) || 'HTTP ' + r.status); };
    const prompt = 'Reply with exactly: OK';
    if (c.provider === 'gemini') {
      let last = null;
      for (const m of ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-2.0-flash']) {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${encodeURIComponent(first(k.gemini))}`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        if (r.ok) return true;
        last = await err(r);
        if (![404, 429, 500, 503].includes(r.status)) throw last;
      }
      throw last;
    }
    if (c.provider === 'claude') {
      const r = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': first(k.claude), 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 8, messages: [{ role: 'user', content: prompt }] }) });
      if (!r.ok) throw await err(r); return true;
    }
    const url = c.provider === 'openai' ? 'https://api.openai.com/v1/chat/completions' : c.provider === 'device' ? String(k.deviceUrl || '').replace(/\/+$/, '') + '/chat/completions' : k.customUrl;
    const key = c.provider === 'openai' ? first(k.openai) : c.provider === 'custom' ? first(k.customKey) : '';
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(key ? { Authorization: 'Bearer ' + key } : {}) },
      body: JSON.stringify({ model: c.provider === 'device' ? 'llama3' : 'gpt-4o-mini', max_tokens: 8, messages: [{ role: 'user', content: prompt }] }) });
    if (!r.ok) throw await err(r); return true;
  }
  function paintAiCard() {
    const st = document.getElementById('ai-card-status');
    if (st) { const c = aiCfg(), p = c && AI_PROV.find(x => x.id === c.provider); st.textContent = aiConnected() ? T('aiOn')(p.nm) : T('aiOff'); st.classList.toggle('on', aiConnected()); }
    const sw = document.getElementById('asst-toggle');
    if (sw) { sw.classList.toggle('on', asstOn()); sw.setAttribute('aria-checked', String(asstOn())); }
  }

  // ── עוזר AppNest: המנוע (appnest-assistant.js) לא משתנה; כאן רק "המפה" של אפליקציית הכושר ──
  const ASST_NAV = {
    home: () => showView('home'), lib: () => showView('lib'), wo: () => showView('wo'), prog: () => showView('prog'),
    settings: () => document.getElementById('open-settings').click(), plans: () => openPlans(), builder: () => openBuilder(),
    plates: () => openPlates(0), bodymap: () => openBodyPick(), body: () => openBodyLog(), custom: () => openCustomForm(),
  };
  function asstState() {
    const p = loadProfile(), { hist, best } = stats(), out = [];
    const DL = UI.he.dayLong;
    out.push(`מסך נוכחי: ${({ home: 'בית', lib: 'תרגילים', wo: 'האימונים שלי', prog: 'התקדמות' })[VIEW] || VIEW}`);
    if (p.goal) out.push(`פרופיל: מטרה=${UI22.he['goal_' + p.goal] || p.goal}, ${p.days || '?'} ימים בשבוע, רמה=${UI22.he['lvl_' + p.level] || p.level || '?'}`);
    out.push(`ציוד: ${myEq() ? myEq().map(k => UI22.he['eq_' + k]).join(', ') : 'חדר כושר מלא'}`);
    const ws = loadWo();
    out.push(ws.length ? 'האימונים השמורים:' : 'אין עדיין אימונים שמורים.');
    ws.slice(0, 8).forEach(w => {
      const ss = ssInfo(w.items);
      out.push(`• ${w.name} (${(w.days || []).map(d => DL[d]).join('/') || 'בלי ימים'}, מנוחה ${w.rest || 90} שנ׳): ` +
        w.items.map((it, i) => { const ex = exById(it.exId); return ex ? `${heName(ex) || ex.name} ${it.sets}×${it.reps}${ss[i] ? ' [סופר-סט ' + ss[i].g + ']' : ''}` : ''; }).filter(Boolean).join('; '));
    });
    const wk = startOfWeek(Date.now());
    out.push(`אימונים השבוע: ${hist.filter(h => h.start >= wk).length} · סה״כ: ${hist.length} · רצף שבועות: ${weekStreak(hist)}`);
    hist.slice(-6).reverse().forEach(h => out.push(`- ${new Date(h.start).toLocaleDateString('he-IL')} ${h.name}: ` +
      (h.items || []).map(it => { const ex = exById(it.exId); return `${ex ? heName(ex) || ex.name : it.exId} ${it.sets.map(s => setLabel(ex, s, it.mode || 'wr')).join(',')}`; }).join('; ')));
    const top = Object.entries(best).sort((a, b) => b[1].at - a[1].at).slice(0, 10);
    if (top.length) out.push('שיאים: ' + top.map(([id, b]) => { const ex = exById(id); return `${ex ? heName(ex) || ex.name : id} ${setLabel(ex, b, b.mode)}`; }).join('; '));
    if (bodyTrackOn()) { const b = loadBody(), l = b.entries.filter(e => e.w > 0).pop(); if (l) out.push(`משקל גוף אחרון: ${l.w} ק״ג${b.goal ? ', יעד ' + b.goal : ''}`); }
    if (store.get(SESS_KEY, null)) out.push('יש כרגע אימון פתוח.');
    return out.join('\n').slice(0, 3800);
  }
  window.APPNEST_ASSISTANT_CONFIG = {
    appName: 'ספריית הכושר',
    aiConfigKey: AI_KEY,
    appDescription:
      'ספריית הכושר היא אפליקציית אימונים: 1,324 תרגילים עם אנימציה, בניית אימונים ושיבוץ לימים, אימון חי עם רישום סטים, ' +
      'הצעה למשקל הבא, שיאים, מפת שרירים, מעקב משקל ומדידות. אתה המאמן של המשתמש: ענה בקצרה ובענייניות על תוכנית, טכניקה, ' +
      'בחירת תרגילים, סטים/חזרות/מנוחה והתקדמות, והתבסס על "מצב האפליקציה" (האימונים, ההיסטוריה והשיאים שלו). ' +
      'כדי להראות תרגילים: כתוב מילת חיפוש (בעברית או באנגלית, למשל "סקוואט" או "row") לשדה "חיפוש תרגילים" ואז נווט ל"תרגילים". ' +
      'כדי לבנות תוכנית אישית — הפעל את הפעולה buildPlan (שאלון קצר). ' +
      'חשוב: אתה נותן מידע כללי בלבד, לא ייעוץ רפואי. על כאב, פציעה, הריון או מצב רפואי — המלץ לפנות לרופא או לפיזיותרפיסט ואל תיתן תוכנית שיקום. ' +
      'דבר על גוף ומשקל בשפה ניטרלית ומכבדת, בלי שיפוט, ואל תמליץ על דיאטות קיצוניות, צום ממושך או ירידה מהירה במשקל.',
    navigate: s => { (ASST_NAV[s] || (() => {}))(); },
    tabs: [
      { name: 'בית', screen: 'home' }, { name: 'תרגילים', screen: 'lib' }, { name: 'האימונים שלי', screen: 'wo' },
      { name: 'התקדמות', screen: 'prog' }, { name: 'הגדרות', screen: 'settings' }, { name: 'תוכניות מוכנות', screen: 'plans' },
      { name: 'בונה תוכנית', screen: 'builder' }, { name: 'מחשבון צלחות', screen: 'plates' }, { name: 'מפת שרירים', screen: 'bodymap' },
      { name: 'רישום משקל', screen: 'body' }, { name: 'תרגיל משלי', screen: 'custom' },
    ],
    fields: [{ name: 'חיפוש תרגילים', label: 'שדה החיפוש בספריית התרגילים', selector: '#search' }],
    readState: asstState,
    actions: {
      buildPlan: { desc: 'פותח את השאלון שבונה תוכנית אימונים אישית לפי מטרה, ימים, רמה וציוד', run: () => openBuilder(), done: 'פתחתי את בונה התוכנית 🎯' },
      startWorkout: { desc: 'מתחיל את האימון של היום (או ממשיך אימון פתוח)', run: () => quickStart(), done: 'יאללה, מתחילים 💪' },
      logWeight: { desc: 'פותח את חלון רישום המשקל והמדידות', run: () => openBodyLog(), done: 'פתחתי את רישום המשקל' },
      exportCsv: { desc: 'מוריד קובץ CSV עם כל היסטוריית האימונים', run: () => exportCsv(), done: 'הקובץ ירד ✓' },
    },
    suggestions: ['בנה לי תוכנית אימונים', 'מה כדאי לאמן היום?', 'איך אני מתקדם?', 'תראה לי תרגילי גב לבית'],
  };
  let ASST_LOADED = false;
  function loadAssistant() {
    if (ASST_LOADED) { const b = document.getElementById('appnest-assistant-btn'); if (b) b.hidden = !asstOn(); return; }
    if (!asstOn()) return;
    ASST_LOADED = true;
    const mo = new MutationObserver(() => {
      const b = document.getElementById('appnest-assistant-btn');
      if (b && !b.classList.contains('asst-fab')) {
        b.classList.add('asst-fab'); b.textContent = '🪄'; b.title = T('aiLabel'); b.setAttribute('aria-label', T('aiLabel'));
        // בלי מפתח — במקום הודעת שגיאה בצ'אט, פותחים ישר את מסך החיבור
        b.addEventListener('click', e => { if (!aiConnected()) { e.stopImmediatePropagation(); e.preventDefault(); toast(T('aiNoKeyMsg')); openAiSetup(); } }, true);
      }
      [...document.body.children].forEach(el => {
        if (el.tagName === 'DIV' && !el.id && el.style.zIndex === '100000') el.id = 'asst-panel';
      });
    });
    mo.observe(document.body, { childList: true });
    const s = document.createElement('script'); s.src = 'appnest-assistant.js?v=22'; document.body.appendChild(s);
  }
  function setAsst(on) {
    try { localStorage.setItem(ASST_KEY, on ? '1' : '0'); } catch {}
    const b = document.getElementById('appnest-assistant-btn'), p = document.getElementById('asst-panel');
    if (b) b.hidden = !on;
    if (!on && p) p.style.display = 'none';
    if (on) loadAssistant();
    paintAiCard();
  }

  // ══════════ חיווט (נקרא מ-init) ══════════
  function initCoach() {
    const on = (id, fn) => { const el = document.getElementById(id); if (el) el.addEventListener('click', fn); };
    on('bld-close', () => document.getElementById('bld-overlay').classList.remove('open'));
    on('wo-build', openBuilder);
    on('wo-plates', () => openPlates(0));
    on('cx-new', () => openCustomForm());
    on('body-pick', openBodyPick);
    on('bmp-clear', () => {
      state.filters.target.clear();
      document.querySelectorAll('.chip[data-filter="target"].active').forEach(c => c.classList.remove('active'));
      applyFilters(); document.getElementById('bmp-overlay').classList.remove('open');
    });
    on('ai-setup', openAiSetup);
    on('asst-toggle', () => setAsst(!asstOn()));
    on('bdtrack-toggle', () => { try { localStorage.setItem(BODYTRACK_KEY, bodyTrackOn() ? '0' : '1'); } catch {} paintSettings22(); if (VIEW === 'prog') renderProgress(); });
    on('sess-share', () => { const h = loadHist(); if (h.length) openShare(h[h.length - 1].id); });
    // הציוד שלי — בהגדרות
    document.getElementById('set-eq').addEventListener('click', e => {
      const b = e.target.closest('[data-seq]'); if (!b || b.dataset.seq === 'bw') return;
      const p = loadProfile(), s = new Set(Array.isArray(p.eq) ? p.eq : EQ_KEYS);
      s.has(b.dataset.seq) ? s.delete(b.dataset.seq) : s.add(b.dataset.seq); s.add('bw');
      p.eq = s.size === EQ_KEYS.length ? null : EQ_KEYS.filter(k => s.has(k)); p.eqPreset = p.eq ? 'custom' : 'gym';
      saveProfile(p); paintSettings22(); syncEqChip(); toast(T('eqSaved'));
    });
    document.querySelectorAll('[data-bmsex]').forEach(b => b.addEventListener('click', () => {
      const p = loadProfile(); p.sex = b.dataset.bmsex; saveProfile(p); paintSettings22();
      if (VIEW === 'prog') renderProgMap();
    }));
    // הספרייה: "הציוד שלי"
    const eqc = document.getElementById('eq-only');
    eqc.addEventListener('click', () => { state.eqOnly = !state.eqOnly; eqc.classList.toggle('active', state.eqOnly); applyFilters(); });
    syncEqChip();
    ['bld-overlay', 'cx-overlay', 'bmp-overlay', 'bdl-overlay', 'pl-overlay', 'sh-overlay', 'ai-overlay'].forEach(id => {
      const ov = document.getElementById(id);
      ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-close]')) closeOverlay(ov); });
    });
    loadAssistant();
  }
  function syncEqChip() {
    const eqc = document.getElementById('eq-only');
    eqc.hidden = !eqLimited();
    if (!eqLimited()) { state.eqOnly = false; eqc.classList.remove('active'); }
  }
  function paintSettings22() {
    const p = loadProfile(), eq = Array.isArray(p.eq) ? p.eq : null;
    document.getElementById('set-eq').innerHTML = EQ_KEYS.map(k => `<button class="chip${k === 'bw' || !eq || eq.includes(k) ? ' active' : ''}${k === 'bw' ? ' locked' : ''}" data-seq="${k}">${EQ_ICON[k]} ${esc(T('eq_' + k))}</button>`).join('');
    document.querySelectorAll('[data-bmsex]').forEach(b => b.classList.toggle('active', (p.sex || 'm') === b.dataset.bmsex));
    const bt = document.getElementById('bdtrack-toggle');
    bt.classList.toggle('on', bodyTrackOn()); bt.setAttribute('aria-checked', String(bodyTrackOn()));
    paintAiCard();
  }
