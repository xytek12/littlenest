import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AppLanguage, ChildProfile, ChildSex, FamilyMode, TwinType } from '../types/domain';

const STORAGE_KEY = 'littlenest.prototype.state.v3';

export type FeedUnit = 'mL' | 'oz';
export type NursingSide = 'left' | 'right';

export type PrototypeFamilyConfig = {
  configured: boolean;
  mode: FamilyMode;
  twinType?: TwinType;
  language: AppLanguage;
  children: ChildProfile[];
};

export type PrototypeSettings = {
  feedUnit: FeedUnit;
};

export type PrototypeLog = {
  id: string;
  type: 'sleep' | 'feed' | 'system';
  title: string;
  timestamp: string;
  note: string;
};

export type PrototypeSleepSession = {
  id: string;
  childId: string;
  startedAt: string;
  endedAt: string;
  durationSeconds: number;
  durationMinutes: number;
  wakeCount: number;
  note?: string;
};

export type PrototypeBottleFeedEntry = {
  id: string;
  childId: string;
  kind: 'bottle';
  timestamp: string;
  amount: number;
  unit: FeedUnit;
  note?: string;
};

export type PrototypeNursingFeedEntry = {
  id: string;
  childId: string;
  kind: 'nursing';
  timestamp: string;
  leftSeconds: number;
  rightSeconds: number;
  totalSeconds: number;
  leftMinutes: number;
  rightMinutes: number;
  totalMinutes: number;
  note?: string;
};

export type PrototypeFeedEntry = PrototypeBottleFeedEntry | PrototypeNursingFeedEntry;

export type ActiveNursingSession = {
  leftStartedAt: string | null;
  rightStartedAt: string | null;
  leftSeconds: number;
  rightSeconds: number;
};

export type PrototypeAllergenExposures = Record<string, Record<string, number>>;

export type PrototypeGrowthKind = 'weight' | 'height' | 'head';
export type PrototypeGrowthUnitSystem = 'metric' | 'imperial';

export type PrototypeGrowthEntry = {
  id: string;
  childId: string;
  kind: PrototypeGrowthKind;
  value: number;
  unit: string;
  unitSystem: PrototypeGrowthUnitSystem;
  recordedAt: string;
};

type EndSleepInput = {
  wakeCount: number;
  note?: string;
};

type EditSleepSessionInput = {
  id: string;
  startedAt: string;
  endedAt: string;
  wakeCount: number;
};

type RecordBottleFeedInput = {
  amount: number;
  note?: string;
};

type EditBottleFeedInput = {
  id: string;
  amount: number;
};

type SaveGrowthEntryInput = {
  kind: PrototypeGrowthKind;
  value: number;
  unit: string;
  unitSystem: PrototypeGrowthUnitSystem;
};

type PrototypeStateValue = {
  loading: boolean;
  family: PrototypeFamilyConfig;
  settings: PrototypeSettings;
  activeChild: ChildProfile;
  selectedChildId: string;
  selectChild: (childId: string) => void;
  activeSleepStartedAt: string | null;
  activeNursingSession: ActiveNursingSession;
  sleepSessions: PrototypeSleepSession[];
  feedEntries: PrototypeFeedEntry[];
  growthEntries: PrototypeGrowthEntry[];
  allergenExposures: PrototypeAllergenExposures;
  logs: PrototypeLog[];
  configureFamily: (input: ConfigureFamilyInput) => void;
  editFamily: () => void;
  updateLanguage: (language: AppLanguage) => void;
  updateFeedUnit: (unit: FeedUnit) => void;
  startSleep: () => void;
  endSleep: (input: EndSleepInput) => void;
  editSleepSession: (input: EditSleepSessionInput) => void;
  recordBottleFeed: (input: RecordBottleFeedInput) => void;
  editBottleFeedAmount: (input: EditBottleFeedInput) => void;
  startNursing: (side: NursingSide) => void;
  stopNursing: (side: NursingSide) => void;
  finishNursingSession: (note?: string) => void;
  saveGrowthEntry: (input: SaveGrowthEntryInput) => void;
  markAllergenExposure: (allergenId: string, checks: number) => void;
};

export type ConfigureFamilyInput = {
  mode: FamilyMode;
  twinType?: TwinType;
  childName: string;
  childSex: ChildSex;
  secondChildName?: string;
  secondChildSex?: ChildSex;
  dateOfBirth: string;
};

const defaultChild: ChildProfile = {
  id: 'child-demo',
  familyId: 'family-demo',
  displayName: 'Maya',
  sex: 'girl',
  dateOfBirth: '2025-09-22',
};

const defaultFamily: PrototypeFamilyConfig = {
  configured: false,
  mode: 'single',
  language: 'en',
  children: [defaultChild],
};

const defaultSettings: PrototypeSettings = {
  feedUnit: 'mL',
};

const emptyNursingSession: ActiveNursingSession = {
  leftStartedAt: null,
  rightStartedAt: null,
  leftSeconds: 0,
  rightSeconds: 0,
};

const PrototypeStateContext = createContext<PrototypeStateValue | null>(null);

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 10000)}`;
}

function createChildren(input: ConfigureFamilyInput): ChildProfile[] {
  const firstName = input.childName.trim() || 'Baby';
  const firstChild: ChildProfile = {
    id: 'child-1',
    familyId: 'family-demo',
    displayName: firstName,
    sex: input.childSex,
    dateOfBirth: input.dateOfBirth,
  };

  if (input.mode === 'single') {
    return [firstChild];
  }

  return [
    firstChild,
    {
      id: 'child-2',
      familyId: 'family-demo',
      displayName: input.secondChildName?.trim() || 'Baby 2',
      sex: input.secondChildSex ?? (input.twinType === 'girl_girl' ? 'girl' : 'boy'),
      dateOfBirth: input.dateOfBirth,
    },
  ];
}

function diffSeconds(startedAt: string, endedAt: string) {
  return Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 1000));
}

function diffMinutes(startedAt: string, endedAt: string) {
  return Math.floor(diffSeconds(startedAt, endedAt) / 60);
}

function clampAllergenChecks(checks: number) {
  return Math.min(3, Math.max(0, Math.round(checks)));
}

function stopSide(
  session: ActiveNursingSession,
  side: NursingSide,
  stoppedAt: string,
): ActiveNursingSession {
  const startedAt = side === 'left' ? session.leftStartedAt : session.rightStartedAt;

  if (!startedAt) {
    return session;
  }

  const seconds = diffSeconds(startedAt, stoppedAt);

  return side === 'left'
    ? {
        ...session,
        leftStartedAt: null,
        leftSeconds: session.leftSeconds + seconds,
      }
    : {
        ...session,
        rightStartedAt: null,
        rightSeconds: session.rightSeconds + seconds,
      };
}

export function PrototypeStateProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(process.env.NODE_ENV !== 'test');
  const [family, setFamily] = useState<PrototypeFamilyConfig>(defaultFamily);
  const [settings, setSettings] = useState<PrototypeSettings>(defaultSettings);
  const [activeSleepStartedAt, setActiveSleepStartedAt] = useState<string | null>(null);
  const [activeNursingSession, setActiveNursingSession] =
    useState<ActiveNursingSession>(emptyNursingSession);
  const [sleepSessions, setSleepSessions] = useState<PrototypeSleepSession[]>([]);
  const [feedEntries, setFeedEntries] = useState<PrototypeFeedEntry[]>([]);
  const [growthEntries, setGrowthEntries] = useState<PrototypeGrowthEntry[]>([]);
  const [allergenExposures, setAllergenExposures] = useState<PrototypeAllergenExposures>({});
  const [logs, setLogs] = useState<PrototypeLog[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>(defaultChild.id);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (!stored) {
          return;
        }

        const parsed = JSON.parse(stored) as {
          family?: PrototypeFamilyConfig;
          settings?: PrototypeSettings;
          activeSleepStartedAt?: string | null;
          activeNursingSession?: ActiveNursingSession;
          sleepSessions?: PrototypeSleepSession[];
          feedEntries?: PrototypeFeedEntry[];
          growthEntries?: PrototypeGrowthEntry[];
          allergenExposures?: PrototypeAllergenExposures;
          logs?: PrototypeLog[];
        };

        if (parsed.family?.children?.length) {
          setFamily(parsed.family);
          setSettings(parsed.settings ?? defaultSettings);
          setActiveSleepStartedAt(parsed.activeSleepStartedAt ?? null);
          setActiveNursingSession(parsed.activeNursingSession ?? emptyNursingSession);
          setSleepSessions(parsed.sleepSessions ?? []);
          setFeedEntries(parsed.feedEntries ?? []);
          setGrowthEntries(parsed.growthEntries ?? []);
          setAllergenExposures(parsed.allergenExposures ?? {});
          setLogs(parsed.logs ?? []);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading) {
      return;
    }

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        family,
        settings,
        activeSleepStartedAt,
        activeNursingSession,
        sleepSessions,
        feedEntries,
        growthEntries,
        allergenExposures,
        logs,
      }),
    ).catch(() => undefined);
  }, [
    allergenExposures,
    activeNursingSession,
    activeSleepStartedAt,
    family,
    feedEntries,
    growthEntries,
    loading,
    logs,
    settings,
    sleepSessions,
  ]);

  const activeChild =
    family.children.find((child) => child.id === selectedChildId) ??
    family.children[0] ??
    defaultChild;

  const value = useMemo<PrototypeStateValue>(
    () => ({
      loading,
      family,
      settings,
      activeChild,
      selectedChildId: activeChild.id,
      selectChild(childId: string) {
        if (family.children.some((child) => child.id === childId)) {
          setSelectedChildId(childId);
        }
      },
      activeSleepStartedAt,
      activeNursingSession,
      sleepSessions,
      feedEntries,
      growthEntries,
      allergenExposures,
      logs,
      configureFamily(input) {
        const children = createChildren(input);
        const nextLanguage = family.language;
        setFamily({
          configured: true,
          mode: input.mode,
          twinType: input.twinType,
          language: nextLanguage,
          children,
        });
        setSelectedChildId(children[0].id);
        setActiveSleepStartedAt(null);
        setActiveNursingSession(emptyNursingSession);
        setSleepSessions([]);
        setFeedEntries([]);
        setGrowthEntries([]);
        setAllergenExposures({});
        setLogs([
          {
            id: makeId('setup'),
            type: 'system',
            title: 'Family configured',
            timestamp: new Date().toISOString(),
            note:
              input.mode === 'twins'
                ? 'Twins dashboard is ready for testing.'
                : `${children[0].displayName} is ready for testing.`,
          },
        ]);
      },
      editFamily() {
        setFamily((current) => ({ ...current, configured: false }));
      },
      updateLanguage(language) {
        setFamily((current) => ({ ...current, language }));
      },
      updateFeedUnit(unit) {
        setSettings((current) => ({ ...current, feedUnit: unit }));
      },
      startSleep() {
        if (activeSleepStartedAt) {
          return;
        }

        const startedAt = new Date().toISOString();
        setActiveSleepStartedAt(startedAt);
        setLogs((current) => [
          {
            id: makeId('sleep-start'),
            type: 'sleep',
            title: 'Sleep started',
            timestamp: startedAt,
            note: `${activeChild.displayName} started sleeping.`,
          },
          ...current,
        ]);
      },
      endSleep({ wakeCount, note }) {
        if (!activeSleepStartedAt) {
          return;
        }

        const endedAt = new Date().toISOString();
        const durationSeconds = diffSeconds(activeSleepStartedAt, endedAt);
        const durationMinutes = diffMinutes(activeSleepStartedAt, endedAt);
        const session: PrototypeSleepSession = {
          id: makeId('sleep-session'),
          childId: activeChild.id,
          startedAt: activeSleepStartedAt,
          endedAt,
          durationSeconds,
          durationMinutes,
          wakeCount,
          note,
        };

        setActiveSleepStartedAt(null);
        setSleepSessions((current) => [session, ...current]);
        setLogs((current) => [
          {
            id: makeId('sleep-end'),
            type: 'sleep',
            title: 'Sleep ended',
            timestamp: endedAt,
            note: `${activeChild.displayName} slept ${durationMinutes} minutes and woke ${wakeCount} times.`,
          },
          ...current,
        ]);
      },
      editSleepSession({ id, startedAt, endedAt, wakeCount }) {
        setSleepSessions((current) =>
          current.map((session) => {
            if (session.id !== id) return session;
            const durationSeconds = diffSeconds(startedAt, endedAt);
            const durationMinutes = diffMinutes(startedAt, endedAt);
            return { ...session, startedAt, endedAt, durationSeconds, durationMinutes, wakeCount };
          }),
        );
      },
      recordBottleFeed({ amount, note }) {
        const timestamp = new Date().toISOString();
        const entry: PrototypeBottleFeedEntry = {
          id: makeId('bottle-feed'),
          childId: activeChild.id,
          kind: 'bottle',
          timestamp,
          amount,
          unit: settings.feedUnit,
          note,
        };

        setFeedEntries((current) => [entry, ...current]);
        setLogs((current) => [
          {
            id: makeId('feed-log'),
            type: 'feed',
            title: 'Bottle feed',
            timestamp,
            note: `${activeChild.displayName} drank ${amount} ${settings.feedUnit}.`,
          },
          ...current,
        ]);
      },
      editBottleFeedAmount({ id, amount }) {
        setFeedEntries((current) =>
          current.map((entry) => {
            if (entry.id !== id || entry.kind !== 'bottle') return entry;
            return { ...entry, amount };
          }),
        );
      },
      startNursing(side) {
        const startedAt = new Date().toISOString();
        setActiveNursingSession((current) =>
          side === 'left'
            ? { ...current, leftStartedAt: startedAt }
            : { ...current, rightStartedAt: startedAt },
        );
      },
      stopNursing(side) {
        const stoppedAt = new Date().toISOString();
        setActiveNursingSession((current) => stopSide(current, side, stoppedAt));
      },
      finishNursingSession(note) {
        const finishedAt = new Date().toISOString();
        const finalSession = stopSide(
          stopSide(activeNursingSession, 'left', finishedAt),
          'right',
          finishedAt,
        );
        const totalSeconds = finalSession.leftSeconds + finalSession.rightSeconds;
        const totalMinutes = Math.floor(totalSeconds / 60);

        if (totalSeconds <= 0) {
          setActiveNursingSession(emptyNursingSession);
          return;
        }

        const entry: PrototypeNursingFeedEntry = {
          id: makeId('nursing-feed'),
          childId: activeChild.id,
          kind: 'nursing',
          timestamp: finishedAt,
          leftSeconds: finalSession.leftSeconds,
          rightSeconds: finalSession.rightSeconds,
          totalSeconds,
          leftMinutes: Math.floor(finalSession.leftSeconds / 60),
          rightMinutes: Math.floor(finalSession.rightSeconds / 60),
          totalMinutes,
          note,
        };

        setFeedEntries((current) => [entry, ...current]);
        setActiveNursingSession(emptyNursingSession);
        setLogs((current) => [
          {
            id: makeId('nursing-log'),
            type: 'feed',
            title: 'Nursing session',
            timestamp: finishedAt,
            note: `${activeChild.displayName} nursed for ${totalMinutes} minutes total.`,
          },
          ...current,
        ]);
      },
      saveGrowthEntry({ kind, value, unit, unitSystem }) {
        if (!Number.isFinite(value)) {
          return;
        }

        setGrowthEntries((current) => [
          {
            id: makeId('growth-entry'),
            childId: activeChild.id,
            kind,
            value,
            unit,
            unitSystem,
            recordedAt: new Date().toISOString(),
          },
          ...current,
        ]);
      },
      markAllergenExposure(allergenId, checks) {
        const safeChecks = clampAllergenChecks(checks);

        setAllergenExposures((current) => ({
          ...current,
          [activeChild.id]: {
            ...current[activeChild.id],
            [allergenId]: safeChecks,
          },
        }));
      },
    }),
    [
      activeChild,
      allergenExposures,
      activeNursingSession,
      activeSleepStartedAt,
      family,
      feedEntries,
      growthEntries,
      loading,
      logs,
      selectedChildId,
      settings,
      sleepSessions,
    ],
  );

  return (
    <PrototypeStateContext.Provider value={value}>
      {children}
    </PrototypeStateContext.Provider>
  );
}

export function usePrototypeState() {
  const value = useContext(PrototypeStateContext);

  if (!value) {
    throw new Error('usePrototypeState must be used inside PrototypeStateProvider');
  }

  return value;
}
