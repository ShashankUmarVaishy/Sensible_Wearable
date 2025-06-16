import { BACKEND_URL } from '@env';
export async function addCaretaker(userToken: string, caretakerId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/addcaretaker`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, caretakerId }),
    });

    return await response.json();
  } catch (error) {
    console.error('Add caretaker error:', error);
    throw error;
  }
}
