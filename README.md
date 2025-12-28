# Fast-Talk

FastTalk is built as a scalable, real-time chat platform. Its primary technical focus is on low latency and high concurrency, ensuring that messages and data are exchanged almost instantaneously even under heavy loads.

# Key Features:
  - webRTC for realtime peer to peer voice calling, video calling and screen sharing
  - webSockets implemented with the help of socket.io to facilitate close to instantaneous messages
  - Dockerized application with the data base located on the localhost to facilitate easy deployment

# Tech Stack:
  - Frontend: React, TailwindCSS, React Router
  - Backend: Node.js, Express.js
  - Databases: MongoDB, cloudinary
  - others: Docker for creating easy to deploy docker containers

# Installation:
  - Prerequisites:
        - Node.js
        - NPM
        - Docker

  - Local setup:
    1. **Clone the Repository:**
          ```bash
          git clone https://github.com/Mitul82/FastTalk.git
          ```

    2. **Install Dependencies:**
         ```bash
         cd backend
         npm install
         cd frontend
         npm install
        ```
         
    3. **Create a Docker compose file in the root of the project directory:**
        ```
        
        version: "3.8"
        
        services:
          backend:
            build:
              context: ./backend
              dockerfile: Dockerfile
            ports:
              - "3000:3000"
            environment:
              MONGO_URI: ${MONGO_URI}
              JWT_SECRET: ${JWT_SECRET}
              JWT_LIFETIME: ${JWT_LIFETIME}
              CLOUDINARY_CLOUD_NAME: ${ CLOUDINARY_CLOUD_NAME}
              CLOUDINARY_API_KEY: ${CLOUDINARY_API_KEY}
              CLOUDINARY_API_SECRET: ${CLOUDINARY_API_SECRET}
          PORT: ${POST_NUMBER}
          FRONTEND_URL: ${FRONTEND_URL}
        depends_on:
          - mongodb
        restart: unless-stopped
        networks:
          - fasttalk-network
          
        frontend:
          build:
            context: ./frontend
            dockerfile: Dockerfile
            args:
              VITE_BACKEND_URL: ${VITE_BACKEND_URL}
            ports:
              - "80:80"
            environment:
              VITE_BACKEND_URL: ${VITE_BACKEND_URL}
            depends_on:
              - backend
            restart: unless-stopped
            networks:
              - fasttalk-network
              
        mongodb:
          image: mongo:8
          ports:
            - "27017:27017"
          environment:
            MONGO_INITDB_ROOT_USERNAME: ${MONGO_INITDB_ROOT_USERNAME}
            MONGO_INITDB_ROOT_PASSWORD: ${ MONGO_INITDB_ROOT_PASSWORD}
          volumes:
            - ${DIRECTORY_FOR_DATA_VOLUMES}
          restart: unless-stopped
          networks:
            - fasttalk-network
            
        mongo-express:
          image: mongo-express:latest
          ports:
            - "8081:8081"
          environment:
            ME_CONFIG_MONGODB_ADMINUSERNAME: ${MONGODB_ADMINUSERNAME}
            ME_CONFIG_MONGODB_ADMINPASSWORD: ${MONGODB_ADMINPASSWORD}
            ME_CONFIG_MONGODB_URL: ${_MONGODB_URL}
          depends_on:
            - mongodb
          restart: unless-stopped
          networks:
            - fasttalk-network
            
        volumes:
          mongodb_data:
          
        networks:
          fasttalk-network:

        driver: bridge    
    ```

  4. **Run the command in CMD:**
     ```
     docker-compose up --build
     ```

You can now visit the frontend on the address "http://localhost:80"

# Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

# Connect with me at:
  [Linkedin](https://www.linkedin.com/in/mitul82/)

