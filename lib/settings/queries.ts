import { getSession } from "@/lib/authSession";
import { myPrisma } from "@/lib/prisma";

type getUserInfoType = {
  userProfile: {
    id: string;
    username: string | null;
    displayname: string;
    language: string;
    createdAt: Date;
    intent: string | null;
    occupation: string | null;
  };
  user: {
    email: string;
  };
} | null;

export async function getUserInfo(): Promise<getUserInfoType> {
  const session = await getSession();

  const [userProfile, user] = await Promise.all([
    myPrisma.userProfile.findUnique({
      where: { userId: session?.user.id },
      select: {
        id: true,
        username: true,
        displayname: true,
        language: true,
        createdAt: true,
        intent: true,
        occupation: true,
      },
    }),

    myPrisma.user.findUnique({
      where: { id: session?.user.id },
      select: { email: true },
    }),
  ]);

  if (!user || !userProfile) {
    return null;
  }

  return { userProfile, user };
}
