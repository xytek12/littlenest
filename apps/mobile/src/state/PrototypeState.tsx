import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { AppLanguage, ChildProfile, ChildSex, FamilyMode, TwinType } from '../types/domain';

const STORAGE_KEY = 'littlenest.prototype.state.v2';

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
  leftMinutes: number;
  rightMinutes: number;
  totalMinutes: number;
  note?: string;
};

export type PrototypeFeedEntry = PrototypeBottleFeedEntry | PrototypeNursingFeedEntry;

export type ActiveNursingSession = {
  leftStartedAt: string | null;
  rightStartedAt: string | null;
  leftMinutes: number;
  rightMinutes: number;
};

type EndSleepInput = {
  wakeCount: number;
  note?: string;
};

type RecordBottleFeedInput = {
  amount: number;
  note?: string;
};

type PrototypeStateValue = {
  loading: boolean;
  family: PrototypeFamilyConfig;
  settings: PrototypeSettings;
  activeChild: ChildProfile;
  activeSleepStartedAt: string | null;
  activeNursingSession: ActiveNursingSession;
  sleepSessions: PrototypeSleepSession[];
  feedEntries: PrototypeFeedEntry[];
  logs: PrototypeLog[];
  configureFamily: (input: ConfigureFamilyInput) => void;
  editFamily: () => void;
  updateLanguage: (language: AppLanguage) => void;
  updateFeedUnit: (unit: FeedUnit) => void;
  startSleep: () => void;
  endSleep: (input: EndSleepInput) => void;
  recordBottleFeed: (input: RecordBottleFeedInput) => void;
  startNursing: (side: NursingSide) => void;
  stopNursing: (side: NursingSide) => void;
  finishNursingSession: (note?: string) => void;
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
  leftMinutes: 0,
  rightMinutes: 0,
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

function diffMinutes(startedAt: string, endedAt: string) {
  return Math.max(0, Math.round((Date.parse(endedAt) - Date.parse(startedAt)) / 60000));
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

  const minutes = diffMinutes(startedAt, stoppedAt);

  return side === 'left'
    ? {
        ...session,
        leftStartedAt: null,
        leftMinutes: session.leftMinutes + minutes,
      }
    : {
        ...session,
        rightStartedAt: null,
        rightMinutes: session.rightMinutes + minutes,
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
  const [logs, setLogs] = useState<PrototypeLog[]>([]);

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
          logs?: PrototypeLog[];
        };

        if (parsed.family?.children?.length) {
          setFamily(parsed.family);
          setSettings(parsed.settings ?? defaultSettings);
          setActiveSleepStartedAt(parsed.activeSleepStartedAt ?? null);
          setActiveNursingSession(parsed.activeNursingSession ?? emptyNursingSession);
          setSleepSessions(parsed.sleepSessions ?? []);
          setFeedEntries(parsed.feedEntries ?? []);
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
        logs,
      }),
    ).catch(() => undefined);
  }, [
    activeNursingSession,
    activeSleepStartedAt,
    family,
    feedEntries,
    loading,
    logs,
    settings,
    sleepSessions,
  ]);

  const activeChild = family.children[0] ?? defaultChild;

  const value = useMemo<PrototypeStateValue>(
    () => ({
      loading,
      family,
      settings,
      activeChild,
      activeSleepStartedAt,
      activeNursingSession,
      sleepSessions,
      feedEntries,
      logs,
      configureFamily(input) {
        const children = createChildren(input);
        setFamily({
          configured: true,
          mode: input.mode,
          twinType: input.twinType,
          language: 'en',
          children,
        });
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
        const durationMinutes = diffMinutes(activeSleepStartedAt, endedAt);
        const session: PrototypeSleepSession = {
          id: makeId('sleep-session'),
          childId: activeChild.id,
          startedAt: activeSleepStartedAt,
          endedAt,
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
        const totalMinutes = finalSession.leftMinutes + finalSession.rightMinutes;

        if (totalMinutes <= 0) {
          setActiveNursingSession(emptyNursingSession);
          return;
        }

        const entry: PrototypeNursingFeedEntry = {
          id: makeId('nursing-feed'),
          childId: activeChild.id,
          kind: 'nursing',
          timestamp: finishedAt,
          leftMinutes: finalSession.leftMinutes,
          rightMinutes: finalSession.rightMinutes,
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
    }),
    [
      activeChild,
      activeNursingSession,
      activeSleepStartedAt,
      family,
      feedEntries,
      loading,
      logs,
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
