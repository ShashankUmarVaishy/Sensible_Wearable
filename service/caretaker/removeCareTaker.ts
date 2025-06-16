import { BACKEND_URL } from '@env';
export async function removeCaretaker(userToken: string, caretakerId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/removecaretaker`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, caretakerId }),
    });

    return await response.json();
  } catch (error) {
    console.error('Remove caretaker error:', error);
    throw error;
  }
}