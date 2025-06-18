import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
//what are we going to return from here (very important )
//a) Notification itself
//b) the expo-push-token (needs debugging)

export interface PushNotificationState {
  notification?: Notifications.Notification;
  expoPushToken?: Notifications.ExpoPushToken;
}

//creating a hook

export const usePushNotification = (): PushNotificationState => {
     let token;
    useEffect(()=>{
    
    },[token])
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldShowAlert: true,
      shouldSetBadge: false,
      shouldShowBanner: true, // ✅ required in SDK 49+
      shouldShowList: true, // ✅ required in SDK 49+
    }),
  });

  const [expoPushToken, setExpoPushToken] = useState<
    Notifications.ExpoPushToken | undefined
  >();
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  async function registerForPushNotificationssAsync() {
    console.log("registering for push notifications async");
    if (Device.isDevice) {
        
      //permission status
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        Alert.alert(
          "Failed to get push token, make sure your app is registered in the Expo dashboard."
        );
      }
      

      try {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  

  token = await Notifications.getExpoPushTokenAsync({ projectId });

  console.log("Token in the usePushNotification:", token?.data);
} catch (error) {
  console.error("❌ Failed to get Expo push token:", error);
}
    //   console.log("Permission granted Getting token");
    //   const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    //   console.log("Project ID is:", projectId);
    //   token = await Notifications.getExpoPushTokenAsync({projectId});          
    //   console.log('Token in the use Push Notification :  ',token);
      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
      return token;
    } else {
      console.log("Running on simulator. Skipping token registration.");
      return undefined;
    }
  }
  //registration function is done and ready to go

  //now we are about to set up listeners and push token and all

  useEffect(() => {
    registerForPushNotificationssAsync().then((token) => {
      setExpoPushToken(token);
      
      //push to setToken
      
    });
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
        setNotification(notification);
      });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification responded:", response);
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
