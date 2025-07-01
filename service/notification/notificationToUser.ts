import { BACKEND_URL } from '@env';

const notificationMap = {
  1: {
    title: "Hungry",
    description: "The patient is feeling hungry and might need food soon.",
  },
  0: {
    title: "Stop",
    description: "The patient is requesting to stop.",
  },
  2: {
    title: "Fall Detected",
    description: "A fall has been detected. Please check on the patient immediately.",
  },
  4: {
    title: "Me",
    description: "The patient is pointing towards himself.",
  },
  3: {
    title: "Washroom",
    description: "The patient needs assistance getting to or using the washroom.",
  },
  5: {
    title: "You",
    description: "The patient is pointing toward you.",
  },
  6: {
    title: "Good",
    description: "Patient says it's good.",
  },
  7: {
    title: "Bad",
    description: "Patient says it's bad.",
  }
};


export async function notificationToUser(userToken: string, userName:string, recieverId: string, message:number) {
    try {
      let {title,description}=notificationMap[message];
      title= userName +' : '+title;
    console.log("notification to user",userToken,recieverId,title,description, BACKEND_URL);
    const response = await fetch(`${BACKEND_URL}/api/notification/sendtouser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken,recieverId, title, body:description }),
    });

    return await response.json();
  } catch (error) {
    console.error('Notification To User Error:', error);
    throw error;
  }
}