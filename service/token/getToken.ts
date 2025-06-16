import { BACKEND_URL } from '@env';
export async function getToken(userToken: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/notification/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken }),
    });

    return await response.json();
  } catch (error) {
    console.error('Get token error:', error);
    throw error;
  }
}