import { BACKEND_URL } from '@env';
export async function addCaretakerByEmail(userToken: string, caretakerEmail: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/addcaretakerbyemail`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, caretakerEmail }),
    });
    return await response.json();
  } catch (error) {
    console.error('Add caretaker error:', error);
    throw error;
  }
}
