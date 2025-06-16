import { BACKEND_URL } from '@env';
export async function getCaretakers(userToken: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/getcaretakers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userToken}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Get caretakers error:', error);
    throw error;
  }
}
