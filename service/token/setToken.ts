import { BACKEND_URL } from '@env';
export async function setToken(userToken: string, token: string) {
  if (!userToken ||!token) {
    throw new Error('User token and token are required');
  }
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/notification/token`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, token }),
    });
    
    return await response.json();
  } catch (error) {
    console.error('Set token error:', error);
    throw error;
  }
}