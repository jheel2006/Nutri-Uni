# Nutri-UnI – Dining Hall Nutrition Recommender
## Software Engineering, Spring 2025

Nutri-UnI is a full-stack web application that helps university students make informed dining choices. It personalizes meal recommendations based on dietary preferences, health scores, and user favorites.


## 🧰 Tech Stack

### Frontend
- React.js (with Vite)
- Tailwind CSS
- Lucide Icons
- Clerk (for authentication)
- Axios

### Backend
- Express.js
- Supabase (PostgreSQL, Storage)
- Multer (for image uploads)
- Vitest + Supertest (for testing)
- dotenv

### Dev Tools
- Vite (Frontend Dev Server)
- Vitest (Testing)
- Nodemon (for backend dev)



## 🗂️ Project Structure

```
.
├── backend/             # Express.js backend with Supabase integration
├── frontend/            # React.js frontend built with Vite
```


## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/nutri-uni.git
cd Nutri-unI
```



## 🔧 Backend Setup (`/backend`)

```bash
cd backend
npm install
```

### Start the server
```bash
node server.js
```

> Make sure to configure your Supabase credentials via environment variables.



## 💻 Frontend Setup (`/frontend`)

```bash
cd frontend
npm install
```

### Run the development server
```bash
npm run dev
```

The app should now be running at `http://localhost:5173`.



## 🧪 Running Unit Tests

From the root directory (or within `/frontend` or `/backend`):

```bash
npx vitest
```

To run tests with coverage:

```bash
npx vitest run --coverage
```

Coverage will be displayed in the terminal and saved in a `coverage/` folder.



## 🔐 Environment Variables

Create a `.env` file and include:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
```

If Clerk is enabled:

```env
CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```



## 🤝 Contributions

Contributions are welcome! Please open a PR or submit issues if you'd like to help improve Nutri-UnI.



## 

Built by **Grace Chang, Jheel Thanki, Lujain Elmallah and Keya Shah**

A heartfelt thank you to Professor João Paulo Fernandes for his guidance, support, and for making this course an engaging learning experience. Your thoughtful feedback and practical insights have been invaluable throughout this project.

Special thanks to our TA, Sara Mumtaz, for always being available and answering questions patiently. Your support made a big difference.
