# Supabase Setup Guide

## Steps to Connect the Extension to Supabase

### 1. Create a Supabase Project
- Go to [supabase.com](https://supabase.com) and sign up/login
- Create a new project
- Wait for the project to be initialized

### 2. Get Your Credentials
- In the Supabase dashboard, go to **Project Settings** → **API**
- Copy your:
  - **Project URL** (e.g., `https://your-project.supabase.co`)
  - **Anon Public Key** (the public API key, NOT the secret key)

### 3. Set Environment Variables
- Copy `.env.example` to `.env.local`:
  ```bash
  cp .env.example .env.local
  ```
- Edit `.env.local` and replace with your credentials:
  ```
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_KEY=your_anon_key_here
  ```
- If you use different table names, update these too:
  ```
  VITE_SUPABASE_USERS_TABLE=usuarios
  VITE_SUPABASE_PRODUCTS_TABLE=productos
  VITE_SUPABASE_OFFERS_TABLE=ofertas
  VITE_SUPABASE_TRANSACTIONS_TABLE=transacciones
  ```

### 4. Create Database Tables

In the Supabase SQL Editor, run the following queries:

#### Users Table
```sql
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo TEXT UNIQUE NOT NULL,
  nombre TEXT,
  apellido TEXT,
  telefono TEXT,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Products Table
```sql
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  precio DECIMAL(10, 2) NOT NULL,
  url TEXT,
  tienda TEXT DEFAULT 'Amazon',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Offers Table
```sql
CREATE TABLE ofertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  meses_sin_interes INTEGER,
  tasa_interes DECIMAL(5, 2),
  monto_max DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (correo) REFERENCES usuarios(correo) ON DELETE CASCADE
);
```

#### Transactions Table
```sql
CREATE TABLE transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  correo TEXT NOT NULL,
  monto DECIMAL(10, 2),
  estado TEXT DEFAULT 'pendiente',
  producto_id UUID REFERENCES productos(id),
  fecha TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (correo) REFERENCES usuarios(correo) ON DELETE CASCADE
);
```

### 5. Enable Row Level Security (RLS) - Optional
For production, enable RLS on tables:
```sql
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ofertas ENABLE ROW LEVEL SECURITY;
ALTER TABLE transacciones ENABLE ROW LEVEL SECURITY;
```

### 6. Build & Test
```bash
npm run build
```

The extension will:
- Attempt to connect to Supabase on startup
- Fall back to mock data if connection fails
- Log connection status in the browser console

## Available Functions

The extension provides these Supabase functions in `src/mock/data.ts`:

- `getSupabase()` - Get the Supabase client
- `fetchUserProfile(correo)` - Fetch user by email
- `fetchAmazonProducts()` - Get all available products
- `fetchOffers(correo)` - Get offers for a user
- `saveTransaction(transactionData)` - Save a transaction

Example usage:
```typescript
import { fetchUserProfile, saveTransaction } from '../mock/data';

const user = await fetchUserProfile('user@example.com');
await saveTransaction({ correo: 'user@example.com', monto: 1299 });
```

## Troubleshooting

**"Missing Supabase environment variables"** - Check `.env.local` is created with correct values

**"CORS errors"** - Supabase must have your extension URL in allowed origins (Settings → CORS)

**Connection timeouts** - Verify your credentials and that Supabase project is running

**Still using mock data?** - Check browser console for connection logs
