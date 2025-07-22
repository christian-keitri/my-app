// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    await prisma.organization.createMany({
        data: [
            {
                name: 'Keitri Corp',
                notes: 'Main dev organization',
                isEnabled: true,
            },
            {
                name: 'Beta Testing Ltd',
                notes: 'QA org',
                isEnabled: false,
            },
        ]
    });
}

main()
    .catch((e) => console.error(e))
    .finally(() => prisma.$disconnect());
