# CareSlot

CareSlot helps patients find doctors, view available appointment times, and book hospital visits online.

## Stack

- Next.js 16
- Prisma 7
- Neon Postgres
- Tailwind CSS
- shadcn/ui

## Setup

1. Install dependencies:

	```bash
	npm install
	```

2. Copy the environment template and configure your Neon database URL and a secure authentication secret:

	```bash
	cp .env.example .env
	```

3. Apply database migrations:

	```bash
	npx prisma migrate dev
	```

4. Seed the database:

	```bash
	npx prisma db seed
	```

5. Start the development server:

	```bash
	npm run dev
	```
