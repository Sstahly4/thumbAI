import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Assuming @/ is mapped to the root in tsconfig.json

const handler = NextAuth(authOptions);
 
export { handler as GET, handler as POST }; 