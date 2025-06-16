import { BACKEND_URL } from '@env';

export async function notificationToGroupFromPatient(userToken: string, title: string, body : string) {
    try {
    const response = await fetch(`${BACKEND_URL}/api/notification/sendtogroupfrompatients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, title, body }),
    });

    return await response.json();
  } catch (error) {
    console.error('Add caretaker error:', error);
    throw error;
  }
}