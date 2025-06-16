import { BACKEND_URL } from '@env';
export async function removePatient(userToken: string, patientId: string) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/removepatient`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userToken, patientId }),
    });

    return await response.json();
  } catch (error) {
    console.error('Remove patient error:', error);
    throw error;
  }
}