# Backend (Hospital management system)

This is a minimal example backend that demonstrates how to fetch environment variables for PORT, MONGO_URI and JWT_SECRET.

## Setup

1. Copy the example environment file into `.env` and edit the values:

```powershell
cd backend
copy .env.example .env
# then edit .env with your values
```

2. Install dependencies

```powershell
npm install
```

3. Run development server:

```powershell
npm run dev
```

## Environment variables

- `PORT` - port where the server listens (defaults to 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - secret used for signing JWT tokens (use a long random string in production)

## Security

Never commit `.env` to version control. Use a secrets manager or environment variables in production.
