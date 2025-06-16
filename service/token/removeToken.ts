import { BACKEND_URL } from '@env';
export async function removeToken(userToken: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/notification/token`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken }),
    });

    return await response.json();
  } catch (error) {
    console.error('Remove token error:', error);
    throw error;
  }
}
