# JWT Authentication System

A complete JWT authentication system built with Node.js, Express, React, and PostgreSQL. This project demonstrates secure authentication flow with access tokens, refresh tokens, and database integration.

## Project Structure

```
JWT-Authentication/
├── backend/                 # Backend services
│   ├── server.js           # Posts API server (Port 3001)
│   ├── authServer.js       # Authentication server (Port 4000)
│   ├── database.js         # PostgreSQL database operations
│   └── swagger.js          # API documentation configuration
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   └── context/        # Authentication context
│   └── public/
├── vercel.json             # Vercel deployment configuration
└── package.json            # Project dependencies and scripts
```

## Features

- **JWT Authentication**: Access tokens (30s expiry) + Refresh tokens (7 days)
- **PostgreSQL Database**: Persistent token storage and user management
- **React Frontend**: Modern UI with automatic token refresh
- **Security Middleware**: Helmet, CORS, Rate limiting, Input validation
- **API Documentation**: Swagger/OpenAPI documentation
- **Production Ready**: Vercel deployment configuration

## Installation & Setup

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd JWT-Authentication
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/database_name"

# Server Ports
AUTH_PORT=4000
PORT=3001

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173

# Environment
NODE_ENV=development

# JWT Secrets (generate secure keys)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
```

### 3. Generate JWT Secrets

```bash
# Generate secure secrets
node -e "console.log('ACCESS_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Database Setup

**Option A: PostgreSQL (Recommended)**

- Install PostgreSQL locally or use cloud service (Neon, Supabase)
- Create database and update `DATABASE_URL` in `.env`

**Option B: SQLite (Development)**

```env
DATABASE_URL=sqlite://./dev.db
```

### 5. Run the Application

```bash
# Start both backend servers
npm run dev

# Or start individually
npm run devStart      # Posts API server
npm run devStartAuth  # Authentication server

# Start frontend (in separate terminal)
cd frontend
npm start
```

## API Endpoints

### Authentication Server (Port 4000)

| Method | Endpoint  | Description          | Auth Required |
| ------ | --------- | -------------------- | ------------- |
| POST   | `/login`  | User login           | No            |
| POST   | `/token`  | Refresh access token | No            |
| DELETE | `/logout` | User logout          | No            |

### Posts Server (Port 3001)

| Method | Endpoint | Description    | Auth Required      |
| ------ | -------- | -------------- | ------------------ |
| GET    | `/posts` | Get user posts | Yes (Bearer token) |

### API Documentation

- **Swagger UI**: http://localhost:4000/api-docs (Auth server)
- **Swagger UI**: http://localhost:3001/api-docs (Posts server)

## Frontend Application

The React frontend provides:

- **Login Component**: User authentication form
- **Posts Component**: Display user-specific posts
- **Navigation**: User info and logout functionality
- **Automatic Token Refresh**: Seamless token renewal
- **Protected Routes**: Route-based authentication

**Frontend URL**: http://localhost:3002

## Testing

### Manual Testing

1. **Login**: POST to http://localhost:4000/login

```json
{
  "username": "Tamara"
}
```

2. **Get Posts**: GET to http://localhost:3001/posts

```
Authorization: Bearer <access_token>
```

3. **Refresh Token**: POST to http://localhost:4000/token

```json
{
  "token": "<refresh_token>"
}
```

### Using requests.rest

Use the provided `requests.rest` file for API testing with REST Client extension.

## Production Deployment

### Vercel Deployment

1. **Database Setup**:

   - Create PostgreSQL database (Neon, Supabase, etc.)
   - Get connection string

2. **Environment Variables**:

   - Add all `.env` variables to Vercel dashboard
   - Update `DATABASE_URL` with production connection string
   - Set `NODE_ENV=production`

3. **Deploy**:

   - Connect GitHub repository to Vercel
   - Deploy automatically on push

4. **Custom Domain**:
   - Configure DNS settings
   - Add domain to Vercel project

### Production URLs

- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api/*
- **Auth**: https://yourdomain.com/api/auth/*

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API abuse prevention
- **Input Validation**: Joi schema validation
- **Token Expiration**: Short-lived access tokens
- **Database Security**: Parameterized queries

## Development

### Project Scripts

```bash
npm run dev              # Start both servers
npm run devStart         # Start posts server only
npm run devStartAuth     # Start auth server only
```

### Database Operations

The system automatically:

- Creates required tables on startup
- Inserts demo users and posts
- Cleans up expired tokens hourly
- Handles graceful shutdown

## Troubleshooting

### Common Issues

1. **Port Already in Use**:

   ```bash
   # Kill processes on ports
   netstat -ano | findstr :3001
   taskkill /F /PID <process_id>
   ```

2. **Database Connection Error**:

   - Verify `DATABASE_URL` format
   - Check database credentials
   - Ensure database server is running

3. **CORS Errors**:
   - Update `ALLOWED_ORIGINS` in `.env`
   - Restart servers after changes

## License

This project is for educational purposes.

---

# JWT ავტენტიფიკაციის სისტემა

Node.js, Express, React და PostgreSQL-ით აშენებული სრული JWT ავტენტიფიკაციის სისტემა. ეს პროექტი აჩვენებს უსაფრთხო ავტენტიფიკაციის ნაკადს access token-ებით, refresh token-ებით და ბაზის ინტეგრაციით.

## პროექტის სტრუქტურა

```
JWT-Authentication/
├── backend/                 # ბექენდის სერვისები
│   ├── server.js           # Posts API სერვერი (პორტი 3001)
│   ├── authServer.js       # ავტენტიფიკაციის სერვერი (პორტი 4000)
│   ├── database.js         # PostgreSQL ბაზის ოპერაციები
│   └── swagger.js          # API დოკუმენტაციის კონფიგურაცია
├── frontend/               # React frontend აპლიკაცია
│   ├── src/
│   │   ├── components/     # React კომპონენტები
│   │   ├── services/       # API სერვისის ფენა
│   │   └── context/        # ავტენტიფიკაციის კონტექსტი
│   └── public/
├── vercel.json             # Vercel deployment კონფიგურაცია
└── package.json            # პროექტის დამოკიდებულებები და სკრიპტები
```

## ფუნქციები

- **JWT ავტენტიფიკაცია**: Access token-ები (30წმ ვადა) + Refresh token-ები (7 დღე)
- **PostgreSQL ბაზა**: მუდმივი token-ების შენახვა და მომხმარებლების მართვა
- **React Frontend**: თანამედროვე UI ავტომატური token-ის განახლებით
- **უსაფრთხოების Middleware**: Helmet, CORS, Rate limiting, Input validation
- **API დოკუმენტაცია**: Swagger/OpenAPI დოკუმენტაცია
- **Production Ready**: Vercel deployment კონფიგურაცია

## დაყენება და კონფიგურაცია

### 1. Clone და დამოკიდებულებების დაყენება

```bash
git clone <repository-url>
cd JWT-Authentication
npm install
```

### 2. Environment კონფიგურაცია

შექმენი `.env` ფაილი root დირექტორიაში:

```env
# ბაზის კონფიგურაცია
DATABASE_URL="postgresql://postgres:password@localhost:5432/database_name"

# სერვერის პორტები
AUTH_PORT=4000
PORT=3001

# CORS Origins (მძიმით გამოყოფილი)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:5173

# Environment
NODE_ENV=development

# JWT Secrets (შექმენი უსაფრთხო გასაღებები)
ACCESS_TOKEN_SECRET=your_access_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
```

### 3. JWT Secrets-ის გენერაცია

```bash
# შექმენი უსაფრთხო secrets
node -e "console.log('ACCESS_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'))"
```

### 4. ბაზის დაყენება

**ვარიანტი A: PostgreSQL (რეკომენდირებული)**

- დააინსტალირე PostgreSQL ლოკალურად ან გამოიყენე cloud სერვისი (Neon, Supabase)
- შექმენი ბაზა და განაახლე `DATABASE_URL` `.env`-ში

**ვარიანტი B: SQLite (Development)**

```env
DATABASE_URL=sqlite://./dev.db
```

### 5. აპლიკაციის გაშვება

```bash
# ორივე ბექენდის სერვერის გაშვება
npm run dev

# ან ცალ-ცალკე
npm run devStart      # Posts API სერვერი
npm run devStartAuth  # ავტენტიფიკაციის სერვერი

# Frontend-ის გაშვება (ცალკე ტერმინალში)
cd frontend
npm start
```

## API Endpoints

### ავტენტიფიკაციის სერვერი (პორტი 4000)

| მეთოდი | Endpoint  | აღწერა                    | ავტორიზაცია საჭიროა |
| ------ | --------- | ------------------------- | ------------------- |
| POST   | `/login`  | მომხმარებლის შესვლა       | არა                 |
| POST   | `/token`  | Access token-ის განახლება | არა                 |
| DELETE | `/logout` | მომხმარებლის გამოსვლა     | არა                 |

### Posts სერვერი (პორტი 3001)

| მეთოდი | Endpoint | აღწერა                       | ავტორიზაცია საჭიროა |
| ------ | -------- | ---------------------------- | ------------------- |
| GET    | `/posts` | მომხმარებლის პოსტების მიღება | კი (Bearer token)   |

### API დოკუმენტაცია

- **Swagger UI**: http://localhost:4000/api-docs (Auth სერვერი)
- **Swagger UI**: http://localhost:3001/api-docs (Posts სერვერი)

## Frontend აპლიკაცია

React frontend-ი გთავაზობს:

- **Login კომპონენტი**: მომხმარებლის ავტენტიფიკაციის ფორმა
- **Posts კომპონენტი**: მომხმარებლის სპეციფიკური პოსტების ჩვენება
- **ნავიგაცია**: მომხმარებლის ინფო და გამოსვლის ფუნქციონალი
- **ავტომატური Token განახლება**: უწყვეტი token-ის განახლება
- **დაცული მარშრუტები**: მარშრუტის ბაზაზე ავტენტიფიკაცია

**Frontend URL**: http://localhost:3002

## ტესტირება

### ხელით ტესტირება

1. **Login**: POST to http://localhost:4000/login

```json
{
  "username": "Tamara"
}
```

2. **Posts-ის მიღება**: GET to http://localhost:3001/posts

```
Authorization: Bearer <access_token>
```

3. **Token-ის განახლება**: POST to http://localhost:4000/token

```json
{
  "token": "<refresh_token>"
}
```

### requests.rest-ის გამოყენება

გამოიყენე მოწოდებული `requests.rest` ფაილი API-ის ტესტირებისთვის REST Client extension-ით.

## Production Deployment

### Vercel Deployment

1. **ბაზის დაყენება**:

   - შექმენი PostgreSQL ბაზა (Neon, Supabase, etc.)
   - აიღე connection string

2. **Environment Variables**:

   - დაამატე ყველა `.env` ცვლადი Vercel dashboard-ში
   - განაახლე `DATABASE_URL` production connection string-ით
   - დააყენე `NODE_ENV=production`

3. **Deploy**:

   - დააკავშირე GitHub repository Vercel-თან
   - Deploy ავტომატურად push-ზე

4. **Custom Domain**:
   - კონფიგურირე DNS settings
   - დაამატე domain Vercel პროექტში

### Production URLs

- **Frontend**: https://yourdomain.com
- **API**: https://yourdomain.com/api/*
- **Auth**: https://yourdomain.com/api/auth/*

## უსაფრთხოების ფუნქციები

- **Helmet**: უსაფრთხოების headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: API abuse-ის პრევენცია
- **Input Validation**: Joi schema validation
- **Token Expiration**: მოკლევადიანი access token-ები
- **Database Security**: parameterized queries

## Development

### პროექტის სკრიპტები

```bash
npm run dev              # ორივე სერვერის გაშვება
npm run devStart         # მხოლოდ posts სერვერის გაშვება
npm run devStartAuth     # მხოლოდ auth სერვერის გაშვება
```

### ბაზის ოპერაციები

სისტემა ავტომატურად:

- ქმნის საჭირო ცხრილებს startup-ზე
- ამატებს demo მომხმარებლებს და პოსტებს
- ასუფთავებს ვადაგასულ token-ებს საათობრივად
- მართავს graceful shutdown-ს

## Troubleshooting

### ხშირი პრობლემები

1. **პორტი უკვე გამოიყენება**:

   ```bash
   # პროცესების მოკვლა პორტებზე
   netstat -ano | findstr :3001
   taskkill /F /PID <process_id>
   ```

2. **ბაზის კავშირის შეცდომა**:

   - შეამოწმე `DATABASE_URL` ფორმატი
   - შეამოწმე ბაზის credentials
   - დარწმუნდი რომ ბაზის სერვერი მუშაობს

3. **CORS შეცდომები**:
   - განაახლე `ALLOWED_ORIGINS` `.env`-ში
   - რესტარტი სერვერები ცვლილებების შემდეგ

## ლიცენზია

ეს პროექტი საგანმანათლებლო მიზნებისთვისაა.
