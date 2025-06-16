import { BACKEND_URL } from '@env';
export async function signup(name: string, email: string, password: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (!response.ok) {
      throw new Error('Failed to sign up');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error during signup:', error);
    throw error;
  }
}
