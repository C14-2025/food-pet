# Food Pet — Development Setup

## 🛠️ Prerequisites

- **Node.js** v18+
- **npm**
- **Docker** & **Docker Compose**

---

## 🚀 Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

- Copy `.env.example` → `.env`
- Update values as needed

### 3. Build and start services (Docker)

```bash
docker-compose build --no-cache
docker-compose up -d
```

### 4. Generate Prisma client

```bash
npm run db:generate
```

### 5. Run database migrations

```bash
npm run db:migrate
```

### 6. Initialize database for development

```bash
npm run db:mount
```

### 7. Start development server

```bash
npm run dev
```
