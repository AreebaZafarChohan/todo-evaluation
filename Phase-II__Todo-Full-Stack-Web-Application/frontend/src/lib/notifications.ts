// T028, T029, T030, T031: Browser notification and sound alert handling

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
}

/**
 * T028: Request browser notification permissions
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}

/**
 * T029: Display browser notification for task reminders
 */
export function showNotification(options: NotificationOptions): Notification | null {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return null;
  }

  // T031: Handle denied permissions gracefully
  if (Notification.permission === 'denied') {
    console.info('Notifications are blocked. User has denied permission.');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.info('Notifications are not granted yet');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/favicon.ico',
      tag: options.tag || 'todo-reminder',
      requireInteraction: false,
      silent: false,
    });

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
    return null;
  }
}

/**
 * T030: Play default system notification sound
 */
export function playNotificationSound(): void {
  try {
    // Create audio context for notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    // Create oscillator for a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure sound: 800Hz frequency, sine wave
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    // Volume control: start at 0.3, fade out
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    // Play the sound for 300ms
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);

    // Clean up after sound finishes
    setTimeout(() => {
      audioContext.close();
    }, 500);
  } catch (error) {
    console.error('Failed to play notification sound:', error);
  }
}

/**
 * Combined function: show notification with sound
 */
export function notifyWithSound(options: NotificationOptions): void {
  const notification = showNotification(options);

  if (notification) {
    playNotificationSound();
  } else {
    // T031: Still play sound even if visual notification is blocked
    console.info('Showing fallback sound-only notification');
    playNotificationSound();
  }
}

/**
 * Check if notifications are supported and get current permission status
 */
export function getNotificationStatus(): {
  supported: boolean;
  permission: NotificationPermission | 'not-supported';
} {
  if (!('Notification' in window)) {
    return {
      supported: false,
      permission: 'not-supported',
    };
  }

  return {
    supported: true,
    permission: Notification.permission,
  };
}
