# Member Feed App

A lightweight version of a Member Profiles + Feed application that allows users to create profiles, share updates, and interact with other members.

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm (v8 or higher)

### Frontend Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```
   The API server will run on `http://localhost:3000`

## Architectural Decisions

The application is built using a modern tech stack that prioritizes developer experience and application performance. The frontend utilizes React with Vite for rapid development and optimized builds, along with Material-UI (MUI) for a consistent and responsive user interface. The backend is implemented using Express.js with SQLite database, providing a lightweight yet robust solution for data persistence. This architecture allows for easy deployment and maintenance while ensuring good performance and scalability for a medium-sized user base.

## Key Assumptions

- **Authentication**: The system uses JWT-based authentication with tokens stored in localStorage for session management.
- **User Profiles**: Each user can maintain a single profile with basic information (name, headline, bio) and a list of interests.
- **Profile Photos**: Profile photos can be managed through either URL links or direct file uploads, providing users with flexible options for their profile images.
- **Data Persistence**: SQLite is sufficient for the current scale of the application, assuming a moderate user base and data volume.
- **API Security**: All API endpoints (except authentication) require valid JWT tokens for access.
