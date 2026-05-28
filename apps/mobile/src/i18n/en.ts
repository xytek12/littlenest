export const en = {
  tabs: { recipes: 'Recipes', home: 'Home', ai: 'AI', growth: 'Growth', settings: 'Settings' },
  storybook: {
    homeSingle: (name: string) => `Once upon a day with ${name}…`,
    homeTwins: (twinA: string, twinB: string) => `Once upon a day with ${twinA} & ${twinB}…`,
    sleep: 'Chapter: Dreamtime ⋆',
    nursing: 'Chapter: Little feasts ⋆',
    growth: 'Chapter: Growing wonders ⋆',
    ai: 'Smart advice ⋆',
    recipes: 'Yummy recipes ⋆',
    settings: 'Chapter: Your nest ⋆',
    foodTasting: 'Chapter: First nibbles ⋆',
    bothTwins: 'Both',
    kickers: {
      sleep: 'sleep',
      nursing: 'nursing',
      bottle: 'bottle',
      whisper: 'whisper',
      allergen: 'tasting',
      growth: 'growth',
      ai: 'AI',
    },
    actions: {
      beginDream: 'begin a dream',
      closeDream: 'close the dream',
      openTimer: 'open timer',
      logFeast: 'log a feast',
      finishFeast: 'finish the feast',
      startTasting: 'start tasting',
      addMeasurement: 'add a note',
      runComparison: 'run comparison',
    },
    status: {
      sleepIdleSingle: (name: string) => `${name}'s nest is quiet — start a dream when sleep begins.`,
      sleepIdleTwins: 'Both nests are quiet — start a dream when sleep begins.',
      sleepRunning: (name: string, duration: string) => `${name} is dreaming · ${duration}`,
      feedIdle: (name: string) => `${name}'s last feast is a tap away.`,
      feedNursingRunning: (left: string, right: string) =>
        `nursing now · left ${left} · right ${right}`,
      allergenIntro: (name: string) =>
        `Each new flavour gets three small tastes for ${name}. Tick them off as you go.`,
      foodTastingIdle: (name: string) =>
        `New flavours are waiting to be tasted for ${name}.`,
    },
  },
  confidence: { low: 'Low', medium: 'Medium', high: 'High' },
  actions: {
    logSleep: 'Log sleep',
    logFeed: 'Log feed',
    askAi: 'Ask AI',
    searchRecipes: 'Search recipes',
  },
  safety: { doctor: 'Follow your doctor for medical concerns or unusual symptoms.' },
  history: {
    last24h: 'Last 24 hours',
    viewAll: 'View all',
    empty24h: 'No entries in the last 24 hours.',
    emptyAll: 'No history yet.',
  },
  groupedHistory: {
    lastWeek: 'Last 7 days',
    last2Years: 'Last 2 years',
    emptyWeek: 'No entries in the last 7 days.',
    emptyYears: 'No measurements in the last 2 years.',
    entriesCount: (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`,
  },
  common: {
    backHome: '← Home',
    backHomeLabel: 'Back to Home',
    cancel: 'Cancel',
    close: 'Close',
    save: 'Save',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    history3Months: 'Last 3 months',
    noHistory: 'No history recorded yet.',
    selected: 'Selected',
    durationSeconds: (n: number) => `${n} ${n === 1 ? 'second' : 'seconds'}`,
    durationMinutes: (n: number) => `${n} ${n === 1 ? 'minute' : 'minutes'}`,
    durationHours: (h: number, m: number) =>
      m === 0
        ? `${h} ${h === 1 ? 'hr' : 'hrs'}`
        : `${h} ${h === 1 ? 'hr' : 'hrs'} ${m} min`,
  },
  home: {
    learningKicker: 'LittleNest is learning',
    suggestionKicker: 'AI suggestion',
    learningTitle: 'Track sleep and feeds for 14 days to unlock smarter guidance.',
    suggestionTitle: 'Predictions are ready for your latest routine.',
    suggestionBody: (name: string) =>
      `${name}'s routine now has enough data for stronger sleep and hunger timing suggestions.`,
    learningBody: (trackedDays: number) =>
      `Right now LittleNest has ${trackedDays} tracked day${trackedDays === 1 ? '' : 's'}. Keep recording sleep and feed patterns so the AI can learn this child's real rhythm.`,
    sleepTitle: 'Sleep',
    sleepSubtitle: 'Start or end a sleep session with a running timer.',
    feedTitle: 'Feed',
    feedSubtitle: 'Bottle or nursing with exact times and totals.',
    foodTastingTitle: 'Food tasting',
    foodTastingSubtitle: 'Track first tastes, allergy checks, and what still needs testing.',
    openSettings: 'Open settings',
    sleepingStatus: (name: string, _sex: 'boy' | 'girl') =>
      `${name} is sleeping peacefully`,
    twinActive: '★ Active',
    twinTapToFocus: 'Tap to focus',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Language, units, family setup, and subscription live here.',
    feedUnit: 'Feed unit',
    language: 'Language',
    familySetup: 'Family setup',
    familySetupText: 'Update child names, child type, and prototype profile.',
    subscription: 'Subscription',
    subscriptionText: 'Monthly and annual family plans will appear here later.',
  },
  familySetup: {
    title: 'Family setup',
    subtitle:
      'Set the child profile first so sleep, feed, recipes, and AI use the right child.',
    childDetails: 'Child details',
    childName: 'Child name',
    secondChildName: 'Second child name',
    girl: 'Girl',
    boy: 'Boy',
    startTesting: 'Start testing LittleNest',
    prototypeNote: 'Prototype note',
    prototypeNoteText:
      'This first build stays admin-only. Your setup is saved on this phone for prototype testing.',
    singleTitle: 'One baby',
    singleSubtitle: 'Choose boy or girl, then test the matching soft color.',
    twinBoysTitle: 'Twin boys',
    twinBoysSubtitle: 'Both children use light blue accents.',
    twinGirlsTitle: 'Twin girls',
    twinGirlsSubtitle: 'Both children use light pink accents.',
    twinBoyGirlTitle: 'Twins, boy + girl',
    twinBoyGirlSubtitle: 'Split the interface between light blue and light pink.',
  },
  recipes: {
    title: 'Recipe ideas',
    subtitle:
      'AI-suggested recipes with direct source links, matched to your child. Refresh swaps the daily set.',
    searchLabel: 'Search trusted sources first',
    queryPlaceholder: 'real food recipe ideas',
    searching: 'Searching...',
    refresh: 'Refresh recipe ideas',
    helper: (name: string, ageLabel: string) => `Ideas for ${name}, ${ageLabel} old.`,
    resultsHeader: 'Daily recipe picks',
    dailyLabel: "Today's idea",
    openSource: 'Open recipe source',
    loading: 'Finding fresh recipes for your child...',
    empty: 'No recipes to show yet. Try refreshing.',
    error: 'Could not load recipes right now. Showing saved ideas instead.',
    limitReached: 'Daily refresh limit reached. New ideas are ready again tomorrow.',
    offlineNote: 'Showing saved recipe ideas (offline).',
  },
  ai: {
    title: 'AI',
    subtitle:
      'Admin mode compares provider answers side by side while the parent-facing app can still show one final recommendation.',
    compareTitle: 'Compare Gemini + OpenAI',
    compareSubtitle: 'Run a live comparison for the latest prompt.',
    checking: 'Checking both providers...',
    currentPrompt: (name: string) =>
      `Current test prompt: sleep window and likely next need for ${name}.`,
    sleepPrediction: 'Sleep prediction',
    sleepPredictionSubtitle: 'Compare Gemini and OpenAI in admin mode.',
    confidence: 'Confidence',
    feedback: ['Good', 'Okay', 'Bad'],
  },
  growth: {
    title: 'Growth',
    metric: 'Metric',
    imperial: 'Imperial',
    weight: 'Weight',
    weightSubtitle: 'Add a new weight entry.',
    height: 'Height',
    heightSubtitle: 'Track height changes over time.',
    head: 'Head circumference',
    headSubtitle: 'Track changes over time.',
    entryTitle: (label: string, unit: string) => `${label} (${unit})`,
    save: 'Save measurement',
    latest: 'Growth history',
    empty: 'No growth measurement recorded yet.',
    placeholder: '0',
    history: {
      title: 'Growth history',
      weightRow: (date: string, time: string, value: string) =>
        `${date}, ${time}  ·  Weight  ·  ${value}`,
      heightRow: (date: string, time: string, value: string) =>
        `${date}, ${time}  ·  Height  ·  ${value}`,
      headRow: (date: string, time: string, value: string, child: string) =>
        `${date}, ${time}  ·  Head  ·  ${value}  ·  ${child}`,
      weightRowInDay: (time: string, value: string) => `${time}  ·  Weight  ·  ${value}`,
      heightRowInDay: (time: string, value: string) => `${time}  ·  Height  ·  ${value}`,
      headRowInDay: (time: string, value: string, child: string) =>
        `${time}  ·  Head  ·  ${value}${child ? `  ·  ${child}` : ''}`,
    },
  },
  sleep: {
    title: 'Sleep',
    subtitle: (name: string) => `Track exact start and end times for ${name}'s naps and night sleep.`,
    start: 'Start sleep',
    running: 'Sleep is running',
    startSubtitle: 'Begin the timer when sleep starts.',
    runningSubtitle: (startedAt: string, duration: string) =>
      `Started at ${startedAt} and running for ${duration}.`,
    end: 'End sleep',
    endSubtitle: 'Save total sleep and wake count for this session.',
    timerTitle: 'Sleep timer',
    timerRunning: (duration: string) => `Running for ${duration}`,
    timerPaused: 'Paused',
    pause: 'Pause',
    resume: 'Resume',
    wakePrompt: 'How many times did the child wake up?',
    save: 'Save sleep session',
    latest: 'Sleep history',
    empty: 'No sleep session recorded yet.',
    logLine: (start: string, end: string, duration: string, wakes: number) =>
      `${start}-${end} | ${duration} | wakes ${wakes}`,
    editTitle: 'Edit sleep session',
    editStartLabel: 'Start time (HH:MM)',
    editEndLabel: 'End time (HH:MM)',
    editWakesLabel: 'Times woken up',
    editSave: 'Save changes',
    history: {
      title: 'Sleep history',
      row: (date: string, time: string, duration: string, wakeCount: number) =>
        `${date}, ${time}  ·  ${duration}  ·  ${wakeCount} wakes`,
      rowPrimary: (date: string, time: string, duration: string) =>
        `${date}, ${time}  ·  ${duration}`,
      rowWakes: (wakeCount: number) =>
        `${wakeCount} ${wakeCount === 1 ? 'wake' : 'wakes'}`,
      rowInDay: (time: string, duration: string, wakeCount: number) =>
        `${time}  ·  ${duration}  ·  ${wakeCount} ${wakeCount === 1 ? 'wake' : 'wakes'}`,
    },
  },
  feed: {
    title: 'Feed',
    subtitle: (name: string) => `Quick feed tracking for ${name}.`,
    actionTitle: 'Bottle / nursing',
    actionSubtitle: 'Choose the type, then record amount or side timing.',
    sheetTitle: 'Choose feed type',
    bottle: 'Bottle',
    nursing: 'Nursing',
    bottleAmount: (unit: string) => `Bottle amount (${unit})`,
    customAmount: 'Custom amount',
    saveBottle: 'Save bottle feed',
    nursingSession: 'Nursing session',
    leftBreast: 'Left breast',
    rightBreast: 'Right breast',
    savedDuration: (duration: string) => `${duration} saved`,
    startLeft: 'Start left',
    stopLeft: 'Stop left',
    startRight: 'Start right',
    stopRight: 'Stop right',
    finishNursing: 'Finish nursing session',
    latest: 'Feed history',
    empty: 'No feed note recorded yet.',
    bottleHistory: (time: string, amount: number, unit: string) => `${time} | bottle ${amount} ${unit}`,
    nursingHistory: (time: string, total: string, left: string, right: string) =>
      `${time} | nursing ${total} total (${left}/${right})`,
    history: {
      title: 'Feed history',
      bottleRow: (date: string, time: string, amount: number, unit: string) =>
        `${date}, ${time}  ·  Bottle  ·  ${amount} ${unit}`,
      nursingRow: (date: string, time: string, total: string, left: string, right: string) =>
        `${date}, ${time}  ·  Nursing  ·  ${total} (L ${left} / R ${right})`,
      nursingRowPrimary: (date: string, time: string) => `${date}, ${time}  ·  Nursing`,
      nursingRowSides: (left: string, right: string) => `left: ${left}   right: ${right}`,
      bottleRowPrimary: (date: string, time: string) => `${date}, ${time}  ·  Bottle`,
      bottleRowAmount: (amount: number, unit: string) => `${amount} ${unit}`,
      bottleRowInDay: (time: string, amount: number, unit: string) =>
        `${time}  ·  Bottle  ·  ${amount} ${unit}`,
      nursingRowInDay: (time: string, total: string, left: string, right: string) =>
        `${time}  ·  Nursing  ·  ${total} (L ${left} / R ${right})`,
    },
    // --- FEED REDESIGN KEYS ---
    feed_redesign_lastLabel: 'LAST FEED',
    feed_redesign_noneLabel: 'NO FEED YET',
    feed_redesign_noFeedYet: 'No feed recorded yet',
    feed_redesign_viewHistory: 'View feed history ›',
  },
  foodTasting: {
    title: 'Food tasting',
    subtitle: (name: string) =>
      `Track first tastes three times and see what still needs allergy testing for ${name}.`,
    notStarted: 'Still needs testing',
    complete: 'All checks complete',
    progress: (count: number) => `${count}/3 allergy checks complete`,
    footer: 'Reference list loads from Supabase when the app is connected.',
  },

  // ── NEW: Nara-card UI strings (Home + Sleep redesign) ──────────────────────
  naraCard: {
    viewHistory: 'View history ›',
    stopSleep: 'Stop',
    sleepBannerTitle: 'Sleep',
    feedBannerTitle: 'Feed',
    foodBannerTitle: 'Food tasting',
    sleepLastSession: 'Last session',
    sleepNoSession: 'No session yet',
    sleepStartedSince: (dateStr: string) => `Started ${dateStr}`,
  },

  // --- TASTINGS REDESIGN KEYS ---
  tastingsRedesign: {
    whisperHint: (name: string) =>
      `Each allergen gets three small tastes for ${name}. Tap a pill to record a taste.`,
    viewAll: 'View all ›',
    sectionEmpty: 'No allergens in this category yet.',
  },

  // --- HOME/SLEEP REDESIGN ---
  homeSleep: {
    /** SectionCard banner title */
    sectionSleep: 'Sleep',
    sectionFeed: 'Feed',
    sectionFood: 'Food tasting',
    /** Active sleep card */
    activeSleepLabel: 'NOW SLEEPING',
    activeSleepStopButton: 'Stop',
    activeSleepSince: (dateStr: string) => `Since ${dateStr}`,
    /** Idle sleep card */
    idleSleepLabel: 'LAST SESSION',
    noSessionYet: 'No session recorded yet',
    /** View history footer */
    viewHistory: 'View History ›',
    /** Sleep history screen heading */
    sleepHistoryTitle: 'Sleep History',
  },
};
