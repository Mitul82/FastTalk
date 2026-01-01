# Fast-Talk

Fast-Talk is a high-performance, real-time communication platform engineered for low-latency data exchange and high concurrency. It leverages modern web technologies to provide a seamless peer-to-peer experience within a fully containerized environment.

# Key Features:
  - WebRTC Integration: Peer-to-peer voice and video calling with low-latency screen sharing.
  - Instant Messaging: Real-time chat powered by Socket.io for instantaneous message delivery.
  - Secure Auth: Robust user authentication implemented via JWT (JSON Web Tokens).
  - Full Containerization: Entire stack (Frontend, Backend, DB) is Dockerized for "one-command" deployment.
  - Database Management: Includes Mongo-Express as a built-in GUI for real-time data monitoring.

# Tech Stack:
  -Frontend: React, TailwindCSS, Vite
  -Backend: Node.js, Express.js
  -Real-Time: WebRTC (P2P Video/Audio), Socket.io (WebSockets)
  -Database: MongoDB (Data), Cloudinary (Media)
  -DevOps: Docker, Docker Compose, Nginx

# System Architecture:
The application is architected to ensure environment parity and data persistence:
  - Orchestration: Docker Compose manages four distinct services (Frontend, API, DB, Admin UI).
  - Persistence: Utilizes Docker Volumes to ensure MongoDB data survives container restarts.
  - Signaling: The Node.js backend acts as a signaling server to coordinate WebRTC handshakes via WebSockets.

# Installation & Setup:
  - Prerequisites:
    - Node.js(v18+)
    - Docker Desktop

  1. Clone the Repository:
  ```bash
  git clone https://github.com/Mitul82/FastTalk.git
  cd FastTalk
  ```

  2. Configure Environment Variables
  Create a .env file in the root directory. You can use the provided template:
  ```bash
  cp .env.example .env
  ```
  3. Launch with Docker
  This project is optimized to run with a single command. Docker will handle dependency installation and service linking:
  ```bash
  docker-compose up --build
  ```

  - Frontend: http://localhost:80
  - Backend API: http://localhost:3000
  - Database GUI (Mongo-Express): http://localhost:8081

# Contributing:
Contributions make the open-source community an amazing place to learn and create.
  - Fork the Project
  - Create your Feature Branch (git checkout -b feature/AmazingFeature)
  - Commit your Changes (git commit -m 'Add some AmazingFeature')
  - Push to the Branch (git push origin feature/AmazingFeature)
  - Open a Pull Request

# Connect with me at:
  [Linkedin](https://www.linkedin.com/in/mitul82/)