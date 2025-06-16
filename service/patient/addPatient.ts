import { BACKEND_URL } from '@env';
export async function addPatient(userToken: string, patientId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/addpatient`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, patientId }),
    });

    return await response.json();
  } catch (error) {
    console.error('Add patient error:', error);
    throw error;
  }
}
