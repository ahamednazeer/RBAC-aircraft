# AeroOps AI - Airbase Operations Management System

A full-stack airbase operations management system with role-based access control (RBAC), real-time dashboards, and specialized interfaces for 7 distinct user roles.

## Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with dark tactical theme
- **Icons**: Lucide React
- **Charts**: Recharts
- **Real-time**: Socket.io Client

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Real-time**: Socket.io

## Features

- ✅ JWT Authentication with role-based access control
- ✅ 7 User Roles: Pilot, Technician, Commander, Admin, Trainee, Emergency, Family
- ✅ Aircraft Management (CRUD with RBAC)
- ✅ Maintenance Logs Tracking
- ✅ Emergency Response System with Timeline
- ✅ Dark Tactical UI Theme
- ✅ Reusable Components (StatusChip, DashboardCard, DataTable)
- 🚧 Role-specific Dashboards (in progress)
- 🚧 WebSocket Real-time Updates (planned)
- 🚧 AI Chatbot Integration (planned)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and update the `DATABASE_URL` with your PostgreSQL connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/aeroops?schema=public"
```

4. Run Prisma migrations:
```bash
npx prisma migrate dev --name init
```

5. Seed the database with test data:
```bash
npm run prisma:seed
```

6. Start the backend server:
```bash
npm run start:dev
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Test Credentials

After seeding the database, you can login with these credentials:

| Role | Username | Password |
|------|----------|----------|
| Pilot | pilot1 | pilot123 |
| Technician | tech1 | tech123 |
| Commander | commander | cmd123 |
| Admin | admin | admin123 |
| Trainee | trainee1 | trainee123 |
| Emergency | emergency1 | emer123 |
| Family | family1 | family123 |

## API Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

### Aircraft (Protected)
- `GET /aircraft` - List all aircraft
- `GET /aircraft/stats` - Get aircraft statistics
- `GET /aircraft/:id` - Get aircraft details
- `POST /aircraft` - Create aircraft (Admin only)
- `PATCH /aircraft/:id` - Update aircraft (Technician, Admin)
- `DELETE /aircraft/:id` - Delete aircraft (Admin only)

### Maintenance (Protected)
- `GET /maintenance` - List maintenance logs
- `GET /maintenance/:id` - Get log details
- `POST /maintenance` - Create log (Technician, Admin)
- `PATCH /maintenance/:id` - Update log (Technician, Admin)
- `DELETE /maintenance/:id` - Delete log (Admin only)

### Emergencies (Protected)
- `GET /emergencies` - List emergencies
- `GET /emergencies/active-count` - Get active emergency count
- `GET /emergencies/:id` - Get emergency details
- `POST /emergencies` - Create emergency (Emergency, Commander, Admin)
- `PATCH /emergencies/:id/status` - Update status
- `POST /emergencies/:id/assign` - Assign team member

## Project Structure

```
aircraft/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/          # Authentication
│   │   │   ├── aircraft/      # Aircraft management
│   │   │   ├── maintenance/   # Maintenance logs
│   │   │   └── emergency/     # Emergency response
│   │   ├── guards/            # RBAC guards
│   │   ├── decorators/        # Custom decorators
│   │   ├── prisma.service.ts  # Prisma client
│   │   └── main.ts            # App entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/               # Next.js pages
│   │   ├── components/        # Reusable components
│   │   ├── lib/               # API client
│   │   └── types/             # TypeScript types
│   └── package.json
└── README.md
```

## Development

### Backend Development
```bash
cd backend
npm run start:dev  # Watch mode
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload
```

### Database Management
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio
```

## Role-Based Access Control

Each role has specific permissions:

- **Pilot**: View aircraft, weather, emergencies (read-only)
- **Technician**: Manage maintenance logs, update aircraft status
- **Commander**: Full operational visibility, manage emergencies
- **Admin**: Full system access, user management
- **Trainee**: Access training modules, limited operations view
- **Emergency**: Manage emergency responses, assign teams
- **Family**: Access family portal, welfare information

## Next Steps

- [ ] Implement role-specific dashboards
- [ ] Add WebSocket for real-time updates
- [ ] Integrate AI chatbot with role-aware context
- [ ] Add weather/runway status module
- [ ] Implement fatigue tracking
- [ ] Add training/quiz modules
- [ ] Set up file storage for manuals
- [ ] Add email notifications
- [ ] Implement map integrations

## License

Private - All Rights Reserved
