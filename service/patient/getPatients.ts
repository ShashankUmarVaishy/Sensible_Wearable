import { BACKEND_URL } from '@env';
export async function getPatients(userToken: string) {
  console.log('getPatients called with token:', userToken);
  
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/getpatients`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data=await response.json();
    console.log('Received patients:', data);
    return data;
  } catch (error) {
    console.error('Get patients error:', error);
    throw error;
  }
}