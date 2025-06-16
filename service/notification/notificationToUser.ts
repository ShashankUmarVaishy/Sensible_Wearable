import { BACKEND_URL } from '@env';

export async function notificationToUser(userToken: string, recieverId: string, title: string, body : string) {
    try {
    console.log("notification to user",userToken,recieverId,title,body, BACKEND_URL);
    const response = await fetch(`${BACKEND_URL}/api/notification/sendtouser`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken,recieverId, title, body }),
    });

    return await response.json();
  } catch (error) {
    console.error('Add caretaker error:', error);
    throw error;
  }
}