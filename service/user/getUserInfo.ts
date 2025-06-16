import { BACKEND_URL } from '@env';

export async function getUserInfo(userToken: string) {
  try {
    console.log('Getting user info with token:', userToken);
    console.log('Backend URL:', BACKEND_URL);
    
    const response = await fetch(`${BACKEND_URL}/api/auth/userinfo`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
    });

    console.log('User info response status:', response.status);
    
    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const data = await response.json();
    console.log('User info data:', data);
    return data;
  } catch (error) {
    console.error('Get user info error:', error);
    return { success: false, message: 'Failed to fetch user info' };
  }
}