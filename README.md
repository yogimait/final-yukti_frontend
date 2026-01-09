# ⚔️ CodeBattle Arena (Yukti)

![Status](https://img.shields.io/badge/Status-In--Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-green)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)

**CodeBattle Arena (Yukti)** is a cutting-edge, real-time competitive coding platform designed to revolutionize how developers prepare for technical interviews and improve their Data Structures & Algorithms (DSA) skills. Unlike traditional platforms, it gamifies the experience with high-stakes 1v1 Duels, collaborative Squad Wars, and a focus on code optimization (time & memory) rather than just correctness.

---

## 🚀 Key Features

### 🎮 Competitive Game Modes
*   **1v1 Duels:** Challenge opponents in real-time battles. Matchmaking is powered by an ELO rating system to ensure fair play, or invite friends directly via private rooms.
*   **Squad Wars:** Form a team of up to 5 friends. The unique scoring system averages the team's performance, encouraging stronger players to mentor and support their teammates during the battle.

### ⚡ Advanced Code Execution
*   **Judge0 Integration:** Secure, sandboxed remote code execution supporting multiple languages.
*   **Performance Metrics:** Detailed analysis of execution time and memory usage.
*   **Optimization Scoring:** "Bucketing Method" awards points not just for passing test cases, but for writing efficient code (e.g., O(n) vs O(n²)).

### 🤝 Real-Time Collaboration
*   **Collaborative Environment:** Built-in whiteboard for strategizing before or during Squad Wars.
*   **Communication:** Integrated audio/video calls to discuss approaches in real-time.
*   **Live Updates:** Socket.io ensures instantaneous synchronization of game state, scores, and code changes.

### 📊 Progress & Analytics
*   **Comprehensive Dashboard:** Track your ELO, win/loss ratio, and recent match history.
*   **Leaderboards:** Global and friend-based rankings to fuel competition.
*   **Heatmaps:** Visual activity tracking similar to GitHub contributions.

---

## 🛠️ Technical Architecture

The project is built as a monorepo with a distinct client-server architecture, fully typed with TypeScript.

### Tech Stack

| Domain | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | MongoDB (Persistence), Redis (Caching & Real-time Game State) |
| **Real-Time** | Socket.io |
| **Execution** | Judge0 (Dockerized) |
| **DevOps** | Docker, Docker Compose |

### Project Structure

```
final-yukti_frontend/
├── client/                 # React Frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application views (Landing, Battle, Dashboard)
│   │   ├── store/          # Redux state management
│   │   └── socket/         # Socket.io client handlers
│   └── ...
├── server/                 # Express Backend application
│   ├── src/
│   │   ├── controllers/    # Route logic (Auth, Submission, Battle)
│   │   ├── models/         # Mongoose schemas
│   │   ├── services/       # External services (Judge0, Redis)
│   │   └── socket/         # Socket.io server events
│   └── ...
└── docker-compose.yml      # Infrastructure setup (Redis, etc.)
```

---

## 📦 Installation & Setup

Follow these steps to get the project running locally.

### Prerequisites
*   Node.js (v18+)
*   Docker & Docker Compose (for Redis and Judge0)
*   Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd final-yukti_frontend
```

### 2. Start Infrastructure
Start the required services (Redis, etc.) using Docker.
```bash
docker-compose up -d
```
*Note: Ensure you have a Judge0 instance running locally or configured to point to a public API in your environment variables.*

### 3. Backend Setup
Navigate to the server directory, install dependencies, and start the development server.

```bash
cd server
npm install

# Create a .env file based on .env.example (ensure MONGO_URI, REDIS_URL, etc. are set)
# Start the server
npm run dev
```

### 4. Frontend Setup
Open a new terminal, navigate to the client directory, and start the React application.

```bash
cd client
npm install

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to view the application.

---

## 🛡️ Security & Integrity

*   **Sandboxed Execution:** User code runs in isolated Docker containers via Judge0 to prevent malicious activities.
*   **Anti-Cheat Mechanisms:** Blur detection monitors tab switching to discourage external help during competitive matches.
*   **Secure Auth:** JWT-based authentication for secure session management.

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.