import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function seedKey() {
  const kid = process.env.PRIVATE_KEY_KID!;
  const publicKey = fs.readFileSync(
    path.join(__dirname, "../keys/public.pem"),
    "utf-8"
  );

  await prisma.publicKey.upsert({
    where: { kid },
    update: {},
    create: {
      kid,
      publicKey,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    },
  });

  console.log("Public key seeded");
  process.exit(0);
}

seedKey().catch((e) => {
  console.error(e);
  process.exit(1);
});
