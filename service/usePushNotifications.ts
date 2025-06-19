// import Constants from "expo-constants";
// import * as Device from "expo-device";
// import * as Notifications from "expo-notifications";
// import { useEffect, useRef, useState } from "react";
// import { Alert, Platform } from "react-native";
// //what are we going to return from here (very important )
// //a) Notification itself
// //b) the expo-push-token (needs debugging)

// export interface PushNotificationState {
//   notification?: Notifications.Notification;
//   expoPushToken?: Notifications.ExpoPushToken;
// }

// //creating a hook

// export const usePushNotification = (): PushNotificationState => {
//   let token;
//   useEffect(() => {}, [token]);
//   Notifications.setNotificationHandler({
//     handleNotification: async () => ({
//       shouldPlaySound: false,
//       shouldShowAlert: true,
//       shouldSetBadge: false,
//       shouldShowBanner: true, // ✅ required in SDK 49+
//       shouldShowList: true, // ✅ required in SDK 49+
//     }),
//   });

//   const [expoPushToken, setExpoPushToken] = useState<
//     Notifications.ExpoPushToken | undefined
//   >();
//   const [notification, setNotification] = useState<
//     Notifications.Notification | undefined
//   >();

//   const notificationListener = useRef<Notifications.EventSubscription | null>(null);
//   const responseListener = useRef<Notifications.EventSubscription | null>(null);

//   async function registerForPushNotificationssAsync() {
//     console.log("registering for push notifications async");
//     if (Device.isDevice) {
//       //permission status
//       const { status: existingStatus } =
//         await Notifications.getPermissionsAsync();
//       let finalStatus = existingStatus;
//       if (existingStatus !== "granted") {
//         const { status } = await Notifications.requestPermissionsAsync();
//         finalStatus = status;
//       }
//       if (finalStatus !== "granted") {
//         Alert.alert(
//           "Failed to get push token, make sure your app is registered in the Expo dashboard."
//         );
//       }

//       try {
//         const projectId = Constants.expoConfig?.extra?.eas?.projectId;

//         token = await Notifications.getExpoPushTokenAsync({ projectId });
//         setExpoPushToken(token);

//         console.log("Token in the usePushNotification:", token?.data);
//       } catch (error) {
//         console.error("❌ Failed to get Expo push token:", error);
//       }
      
//       if (Platform.OS === "android") {
//         Notifications.setNotificationChannelAsync("default", {
//           name: "default",
//           importance: Notifications.AndroidImportance.MAX,
//           vibrationPattern: [0, 250, 250, 250],
//           lightColor: "#FF231F7C",
//         });
//       }
//       return token;
//     } else {
//       console.log("Running on simulator. Skipping token registration.");
//       return undefined;
//     }
//   }
//   //registration function is done and ready to go

//   //now we are about to set up listeners and push token and all

//   useEffect(() => {
//     registerForPushNotificationssAsync()
//     notificationListener.current =
//       Notifications.addNotificationReceivedListener((notification) => {
//         console.log("Notification received:", notification);
//         setNotification(notification);
//       });
//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener((response) => {
//         console.log("Notification responded:", response);
//       });
//     return () => {
//       notificationListener.current?.remove();
//       responseListener.current?.remove();
//     };
//   }, []);

//   return {
//     expoPushToken,
//     notification,
//   };
// };
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
}

export const usePushNotification = (): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<Notifications.ExpoPushToken | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  async function registerForPushNotificationsAsync() {
    if (!Device.isDevice) {
      console.log("❌ Not a real device — push notifications won't work.");
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Failed to get push token for push notification!");
      return;
    }

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      console.log("✅ Got Expo Push Token:", token.data);
      setExpoPushToken(token);
    } catch (err) {
      console.error("❌ Error fetching Expo Push Token:", err);
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
  }

  useEffect(() => {
    (async () => {
      await registerForPushNotificationsAsync();
    })();

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("📩 Notification received:", notification);
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log("🔁 Notification response received:", response);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return {
    expoPushToken,
    notification,
  };
};
