import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("superadmin", 10);

  const superAdmin = await prisma.user.upsert({
    where: { phone: "0900000000" },
    update: {},
    create: {
      fullName: "Super Admin",
      phone: "0900000000",
      password: password,
      role: "SUPER_ADMIN",
      approved: true,
    },
  });

  console.log({ superAdmin });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
  });
