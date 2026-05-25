type NotificationsModule = typeof import('expo-notifications');

function getNotificationsModule(): NotificationsModule | null {
  if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID) {
    return null;
  }

  return require('expo-notifications') as NotificationsModule;
}

const notifications = getNotificationsModule();

if (notifications) {
  notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function requestReminderPermission() {
  if (!notifications) {
    return false;
  }

  const existing = await notifications.getPermissionsAsync();
  if (existing.granted) {
    return true;
  }

  const next = await notifications.requestPermissionsAsync();
  return next.granted;
}

export async function schedulePrototypeReminder(input: {
  title: string;
  body: string;
  secondsFromNow: number;
}) {
  if (!notifications) {
    return null;
  }

  const allowed = await requestReminderPermission();
  if (!allowed) {
    return null;
  }

  return notifications.scheduleNotificationAsync({
    content: {
      title: input.title,
      body: input.body,
    },
    trigger: {
      type: notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: input.secondsFromNow,
    },
  });
}
