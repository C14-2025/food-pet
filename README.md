### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
- [npm](https://www.npmjs.com/)

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   - Copy `.env.example` to `.env` and adjust as needed.

3. **Start the database with Docker**

   ```bash
   docker-compose up -d
   ```
4. **Generate Prisma client**

   ```bash
   npx prisma generate
   ```
5. **Run database migrations**

   ```bash
   npx prisma migrate dev --name init
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```