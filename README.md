# JWT Authentication Project

JWT აუთენტიფიკაციის სისტემა Node.js-ით და Express-ით.

## პროექტის სტრუქტურა

- `server.js` - მთავარი სერვერი (პორტი 3000)
- `authServer.js` - აუთენტიფიკაციის სერვერი (პორტი 4000)

## დასაყენებელი ელემენტები

1. **Environment Variables** - შექმენი `.env` ფაილი:

```
ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
PORT=3000
AUTH_PORT=4000
```

2. **დააინსტალირე დამოკიდებულებები:**

```bash
npm install
```

3. **გაუშვი სერვერები:**

```bash
# მთავარი სერვერი
npm run devStart

# აუთენტიფიკაციის სერვერი
npm run devStartAuth
```

## API Endpoints

- `POST /login` - ავტორიზაცია
- `POST /token` - ტოკენის განახლება
- `DELETE /logout` - გამოსვლა
- `GET /posts` - პოსტების მიღება (ავტორიზაცია საჭირო)

## ტესტირება

გამოიყენე `requests.rest` ფაილი API-ის ტესტირებისთვის.
