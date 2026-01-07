Here is the raw Markdown code. You can copy the block below and paste it directly into a `README.md` file.

```markdown
# ⚔️ CodeBattle Arena (CBA)

![Status](https://img.shields.io/badge/Status-In--Development-yellow)
![License](https://img.shields.io/badge/License-MIT-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-green)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)

**CodeBattle Arena** is a real-time competitive coding platform designed to gamify Data Structures & Algorithms (DSA) preparation. It emphasizes not just correctness, but speed, memory optimization, and peer collaboration through 1v1 Duels and Squad Wars.

---

## 🚀 Key Features

- **1v1 Duels:** Real-time battles with ELO-based matchmaking or private room invites.
- **Squad Wars:** Team up with up to 5 friends. The team score is the **average** of all members, forcing stronger players to mentor weaker ones.
- **Real-Time Collaboration:** Built-in Audio/Video calls and Whiteboard support.
- **Performance Scoring:** Points awarded for execution speed and optimization, not just passing test cases.
- **Secure Execution:** Code runs in isolated Docker containers via Judge0.

---

## 🛠️ Technical Architecture

### Tech Stack
| Component | Technology | Reasoning |
| :--- | :--- | :--- |
| **Frontend** | Vite + React (TypeScript) | Fast build times & superior SPA performance. |
| **Styling** | Tailwind CSS | Rapid UI development. |
| **Backend** | Node.js + Express (TypeScript) | Event-driven architecture. |
| **Real-Time** | Socket.io | Bi-directional game state sync. |
| **Database** | MongoDB + Redis | Hybrid storage for persistence and speed. |
| **Execution** | Judge0 (Dockerized) | Sandboxed remote code execution. |
| **Collab** | WebRTC / PeerJS | In-game video/audio bubbles. |

### Database Strategy
* **Redis (Hot Storage):** Used for live game state (timers, scores), matchmaking queues, and real-time leaderboards.
* **MongoDB (Cold Storage):** Used for persistent user profiles, match history logs, and the problem bank.

---

## 🎮 Game Modes

### 1. 1v1 Duel
* **Matchmaking:** Random (Elo Rating) or Friend Invite.
* **Gameplay:** Simultaneous solving.
* **Analysis:** Whiteboard unlocks *after* the match.

### 2. Squad Wars
* **Team Size:** Lobby of up to 5 players.
* **Environment:** Individual editors (no shared code).
* **Whiteboard:** Available **DURING** the match for strategy.
* **Scoring Logic:**
    > Team Score = Average(Score P1 + Score P2 + ... + Score Pn)
    *If one player fails, the team ranking drops.*

---

## 📊 Scoring Algorithm

Total Score (100%) is calculated based on:

1.  **Correctness (60%):** Hidden test cases passed.
2.  **Time Efficiency (20%):** Speed of submission relative to allowed time.
3.  **Optimization (20%):** Based on the "Bucketing Method":
    * *Full Points:* Execution Time < Ideal Threshold (e.g., 0.5s).
    * *Partial Points:* Between Threshold and Limit.
    * *Zero Points:* TLE or Memory Limit Exceeded.

---

## 🛡️ Security

* **Sandboxing:** All code executes in isolated Docker containers (Judge0).
* **Blur Detection:** Monitors tab/window switching during active matches to discourage cheating.

---

## 🗺️ Roadmap (MVP)

- [ ] **Setup:** Repo init (Vite+Express), Docker setup for Judge0 & Redis.
- [ ] **Auth:** Login via GitHub/Google.
- [ ] **Lobby:** Socket.io room creation and joining.
- [ ] **Game Loop:** Fetch Problem -> Timer -> Judge0 Submission -> Scoring.
- [ ] **Squads:** Implement "Average Score" logic.
- [ ] **UI:** Split-screen interface (Problem/Editor/Opponent).

---

## 📦 Local Installation

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/your-username/codebattle-arena.git](https://github.com/your-username/codebattle-arena.git)
    cd codebattle-arena
    ```

2.  **Start Infrastructure (Docker)**
    *Ensure Docker Desktop is running.*
    ```bash
    docker-compose up -d
    ```

3.  **Install Dependencies**
    ```bash
    # Server
    cd server && npm install
    
    # Client
    cd ../client && npm install
    ```

4.  **Run Development**
    ```bash
    # Run both client and server
    npm run dev
    ```

```