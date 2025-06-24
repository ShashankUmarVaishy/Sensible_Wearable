import { BACKEND_URL } from '@env';
export async function addPatientByEmail(userToken: string, patientEmail: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/addpatientbyemail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, patientEmail }),
    });

    return await response.json();
  } catch (error) {
    console.error('Add patient by email error:', error);
    throw error;
  }
}
