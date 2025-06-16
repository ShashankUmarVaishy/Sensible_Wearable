import { BACKEND_URL } from '@env';
export async function login(email: string, password: string) {
  try {
    const body=JSON.stringify({ email, password })
    console.log('Login request body:', body);
    console.log('Backend URL:',BACKEND_URL);
    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
    'Content-Type': 'application/json', 
  },
      body:JSON.stringify({ email, password })
    });
    console.log('Login request sent to:', `${BACKEND_URL}/api/auth/login`);
    console.log(body);
    console.log('Login response :', response);
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    const res=await response.json();
    console.log('Login response data:', res);
    return res
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}