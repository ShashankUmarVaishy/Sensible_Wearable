import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export interface MedicationAlarm {
  medicationId: string;
  medicationName: string;
  time: string;
  dosage: string;
  notificationId?: string;
}

// Configure notification handler for medication alarms
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class MedicationAlarmService {
  private static instance: MedicationAlarmService;
  
  public static getInstance(): MedicationAlarmService {
    if (!MedicationAlarmService.instance) {
      MedicationAlarmService.instance = new MedicationAlarmService();
    }
    return MedicationAlarmService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('medication-reminders', {
        name: 'Medication Reminders',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        enableVibrate: true,
        enableLights: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
    
    return finalStatus === 'granted';
  }

  async scheduleAlarm(alarm: MedicationAlarm): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Parse the time string (e.g., "08:00")
      const [hours, minutes] = alarm.time.split(':').map(Number);

      // For daily repeating notifications
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '💊 Medication Reminder',
          body: `Time to take ${alarm.medicationName}${alarm.dosage ? ` - ${alarm.dosage}` : ''}`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'medication-reminder',
          data: {
            medicationId: alarm.medicationId,
            medicationName: alarm.medicationName,
            dosage: alarm.dosage,
            time: alarm.time,
          },
        },
        trigger: {
          hour: hours,
          minute: minutes,
          repeats: true,
        },
      });

      console.log(`Scheduled daily alarm for ${alarm.medicationName} at ${alarm.time} with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling medication alarm:', error);
      return null;
    }
  }

  async scheduleTestAlarm(alarm: MedicationAlarm, delaySeconds: number = 5): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Notification permissions not granted');
      }

      // Schedule a one-time notification for testing
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🔔 Test Medication Reminder',
          body: `TEST: Time to take ${alarm.medicationName}${alarm.dosage ? ` - ${alarm.dosage}` : ''}`,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          categoryIdentifier: 'medication-reminder-test',
          data: {
            medicationId: alarm.medicationId,
            medicationName: alarm.medicationName,
            dosage: alarm.dosage,
            time: alarm.time,
            isTest: true,
          },
        },
        trigger: {
          seconds: delaySeconds,
        },
      });

      console.log(`Scheduled test alarm for ${alarm.medicationName} in ${delaySeconds} seconds with ID: ${notificationId}`);
      return notificationId;
    } catch (error) {
      console.error('Error scheduling test alarm:', error);
      return null;
    }
  }

  async cancelAlarm(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      console.log(`Cancelled alarm with ID: ${notificationId}`);
    } catch (error) {
      console.error('Error cancelling medication alarm:', error);
    }
  }

  async cancelAllAlarmsForMedication(medicationId: string): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      const medicationNotifications = scheduledNotifications.filter(
        notification => notification.content.data?.medicationId === medicationId
      );

      for (const notification of medicationNotifications) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
      
      console.log(`Cancelled ${medicationNotifications.length} alarms for medication ID: ${medicationId}`);
    } catch (error) {
      console.error('Error cancelling medication alarms:', error);
    }
  }

  async getAllScheduledAlarms(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled alarms:', error);
      return [];
    }
  }

  async rescheduleAlarm(alarm: MedicationAlarm, oldNotificationId?: string): Promise<string | null> {
    if (oldNotificationId) {
      await this.cancelAlarm(oldNotificationId);
    }
    return await this.scheduleAlarm(alarm);
  }

  // Helper method to create multiple alarms for a medication with multiple time intervals
  async scheduleMultipleAlarms(
    medicationId: string,
    medicationName: string,
    dosage: string,
    timeIntervals: string[]
  ): Promise<string[]> {
    const notificationIds: string[] = [];
    
    for (const time of timeIntervals) {
      const alarm: MedicationAlarm = {
        medicationId,
        medicationName,
        time,
        dosage,
      };
      
      const notificationId = await this.scheduleAlarm(alarm);
      if (notificationId) {
        notificationIds.push(notificationId);
      }
    }
    
    return notificationIds;
  }

  // Method to handle notification responses (when user taps on notification)
  setupNotificationResponseHandler() {
    Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Medication reminder notification tapped:', data);
      
      // You can add custom logic here, such as:
      // - Navigate to medication details
      // - Mark medication as taken
      // - Show a confirmation dialog
    });
  }
}

export default MedicationAlarmService.getInstance();