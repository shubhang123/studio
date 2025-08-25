import type { NextApiRequest, NextApiResponse } from 'next';
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ uid: string; name: string; email: string } | { message: string } | null>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { email } = req.query;

  if (typeof email !== 'string') {
    return res.status(400).json({ message: 'Email query parameter is required' });
  }

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userData = querySnapshot.docs[0].data();
    const user = {
      uid: querySnapshot.docs[0].id,
      name: userData.name,
      email: userData.email,
    };
    res.status(200).json(user);
  } catch (error) {
    console.error("Error finding user by email:", error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
