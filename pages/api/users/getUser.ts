// pages/api/users/getUser.ts

import prisma from "../../../lib/prisma";

export default async function handle(
  req: {
    query: {
      email: string;
    };
  },
  res: any
) {
  try {
    const { email } = req.query;
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    return res.json(user);
  } catch (e) {
    console.log(e);
  }
}
