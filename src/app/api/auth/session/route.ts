// import { NextResponse } from 'next/server';
// import { auth } from '../[...nextauth]/route';

// export async function GET() {
//   try {
//     // Use the auth() helper function from your NextAuth setup
//     const session = await auth();
    
//     if (!session) {
//       // If no session exists, return a null user object
//       return NextResponse.json({ user: null });
//     }
    
//     // Return the session data
//     return NextResponse.json(session);
//   } catch (error) {
//     // Log any errors for debugging
//     console.error('Session fallback error:', error);
    
//     // Return a null user object in case of error
//     // Using status 200 to prevent client-side errors
//     return NextResponse.json({ user: null }, { status: 200 });
//   }
// }