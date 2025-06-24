import { BACKEND_URL } from '@env';
export async function updateProfile(age:number, phoneNumber:string,userToken:string) {
    console.log("age",age,"phone number",phoneNumber, "user token",userToken, BACKEND_URL);
  try {
    const response = await fetch(`${BACKEND_URL}/api/auth/updateprofile`, {
      method: 'PUT',
      headers: {
    'Content-Type': 'application/json', 
  },
      body:JSON.stringify({ age,phoneNumber,userToken })
    });
    console.log(response);
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    const res=await response.json();
    console.log('update profike response data:', res);
    return res
  } catch (error) {
    console.error('update profile:', error);
    throw error;
  }
}