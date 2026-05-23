import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { ChildProfile, ChildSex, FamilyMode, TwinType } from '../types/domain';

const STORAGE_KEY = 'littlenest.prototype.state.v1';

export type PrototypeFamilyConfig = {
  configured: boolean;
  mode: FamilyMode;
  twinType?: TwinType;
  language: 'en' | 'he' | 'ru';
  children: ChildProfile[];
};

export type PrototypeLog = {
  id: string;
  type: 'sleep' | 'feed';
  title: string;
  timestamp: string;
  note: string;
};

type PrototypeStateValue = {
  loading: boolean;
  family: PrototypeFamilyConfig;
  activeChild: ChildProfile;
  activeSleepStartedAt: string | null;
  logs: PrototypeLog[];
  configureFamily: (input: ConfigureFamilyInput) => void;
  editFamily: () => void;
  startSleep: () => void;
  endSleep: (note?: string) => void;
  recordFeed: (note?: string) => void;
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

export function PrototypeStateProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(process.env.NODE_ENV !== 'test');
  const [family, setFamily] = useState<PrototypeFamilyConfig>(defaultFamily);
  const [activeSleepStartedAt, setActiveSleepStartedAt] = useState<string | null>(null);
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
          activeSleepStartedAt?: string | null;
          logs?: PrototypeLog[];
        };

        if (parsed.family?.children?.length) {
          setFamily(parsed.family);
          setActiveSleepStartedAt(parsed.activeSleepStartedAt ?? null);
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
      JSON.stringify({ family, activeSleepStartedAt, logs }),
    ).catch(() => undefined);
  }, [activeSleepStartedAt, family, loading, logs]);

  const activeChild = family.children[0] ?? defaultChild;

  const value = useMemo<PrototypeStateValue>(
    () => ({
      loading,
      family,
      activeChild,
      activeSleepStartedAt,
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
            type: 'feed',
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
      startSleep() {
        const startedAt = new Date().toISOString();
        setActiveSleepStartedAt(startedAt);
        setLogs((current) => [
          {
            id: makeId('sleep-start'),
            type: 'sleep',
            title: 'Sleep started',
            timestamp: startedAt,
            note: `${activeChild.displayName} started a sleep session.`,
          },
          ...current,
        ]);
      },
      endSleep(note = 'Woke up calmly') {
        const endedAt = new Date().toISOString();
        setActiveSleepStartedAt(null);
        setLogs((current) => [
          {
            id: makeId('sleep-end'),
            type: 'sleep',
            title: 'Sleep ended',
            timestamp: endedAt,
            note: activeSleepStartedAt
              ? `${activeChild.displayName} woke up. ${note}.`
              : `No active sleep was running, but a wake-up note was saved. ${note}.`,
          },
          ...current,
        ]);
      },
      recordFeed(note = 'Bottle / nursing recorded') {
        const timestamp = new Date().toISOString();
        setLogs((current) => [
          {
            id: makeId('feed'),
            type: 'feed',
            title: 'Feed recorded',
            timestamp,
            note: `${activeChild.displayName}: ${note}.`,
          },
          ...current,
        ]);
      },
    }),
    [activeChild, activeSleepStartedAt, family, loading, logs],
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
