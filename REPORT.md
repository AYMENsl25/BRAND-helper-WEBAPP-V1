📘 BELIS Project Report
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
AI-Powered Brand Identity & Startup Validation Platform
1. Project Overview
BELIS is a full-stack web application designed to help entrepreneurs and startup founders build and validate their ideas using AI. The platform allows users to:

Generated SWOT analysis using AI
Created a full brand identity (mission, personality, voice)
Generated AI-based logos
Build and export a professional brand kit PDF
Analyze market data and competitors
The system follows a modern SaaS architecture with a strong focus on performance, scalability, and user experience.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
2. Technologies Used & How They Were Applied
🔹 Frontend Technologies
1. React + Vite
Used to build the entire user interface
React handles component-based architecture
Vite provides fast development and hot reload
Pages like Dashboard, Lab, ProjectDetail are built as React components
UI updates dynamically based on API responses
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
3. React Router DOM
Handles client-side navigation
👉 Usage:
Navigation between pages like:
/dashboard
/lab
/project/:id
Protected routes ensure only logged-in users access private pages
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
4. Axios
Used for API communication
👉 Usage:
Sends requests to FastAPI backend
Uses interceptors to automatically attach JWT tokens
Example:
Login → sends credentials
Dashboard → fetches projects
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
5. jsPDF
Used for generating downloadable PDFs
👉 Usage:
Converts:
Logo
Color palette
Typography
Business card
into a brand kit PDF
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
6. react-simple-maps
Used for interactive world map
👉 Usage:
Highlights target markets based on AI analysis
Countries change color dynamically based on brand data
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
7. prop-types
Ensures component validation
Required dependency for react-simple-maps
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
🔹 Backend Technologies
1. FastAPI
Main backend framework for building REST APIs
👉 Usage:
Handles:
Authentication
Projects CRUD
AI requests
Feedback system
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
2. SQLModel
ORM combining SQLAlchemy + Pydantic
👉 Usage:
Defines database models (tables)
Handles data validation and queries
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
3. MySQL
Relational database
👉 Usage:
Stores:
Users
Projects
SWOT data
Competitors
Brand assets
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
4. PyJWT
Handles authentication using JWT tokens
👉 Usage:
Login → generates token
Requests → validated using token
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
5. Uvicorn
ASGI server for running FastAPI
👉 Usage:
Runs backend locally on port 8000
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
6. httpx
Async HTTP client
👉 Usage:
Sends requests to external AI APIs:
Gemini
HuggingFace
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
7. python-dotenv
Loads environment variables
👉 Usage:
Stores:
API keys
DB credentials
JWT secrets

-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
🔹 AI & External Services
1. Google Gemini (gemini-2.5-flash-lite)
Used for text generation
👉 Usage:
Generates:
SWOT analysis
Brand identity
Competitor insights
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
2. HuggingFace FLUX.1-schnell
Used for image generation
👉 Usage:
Generates AI logos
Backend saves images in /static
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
3. System Architecture
The project follows a full-stack architecture:
Frontend (React) → sends requests via Axios
Backend (FastAPI) → processes logic
Database (MySQL) → stores data
AI APIs → generate content
This creates a scalable and modular system.
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
4. GitHub Workflow & Branching Strategy
We used a branch-based collaboration system, which is a professional industry approach.

🔹 Branch Structure
main → final stable version
frontend branch → frontend development
backend branch → backend development
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
🔹 Team Responsibilities
Frontend Developer
Works only on the frontend branch
Builds UI, pages, and user interactions
Backend Developer
Works only on the backend branch
Builds APIs, database logic, and AI integration
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
🔹 Workflow Process
Each developer works on their own branch
Changes are tested independently
When features are ready:
They are merged into the main branch
Main branch always contains:
The stable and working version
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
🔹 Why This Workflow is Efficient
This workflow provides:

✅ Separation of concerns
→ Frontend and backend don’t interfere with each other
✅ Faster development
→ Multiple people work simultaneously
✅ Safer code management
→ Bugs don’t affect the main branch
✅ Easier debugging
→ Issues can be traced to specific branches
✅ Better collaboration
→ Clear responsibilities for each team member
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
5. Key Features Implemented
JWT Authentication system
AI-powered SWOT & branding
Interactive dashboard with filters
5-step brand identity wizard
Real-time validation in forms
3D UI effects (logo & business card)
PDF export system
Interactive world map
Feedback & rating system
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
6. Team Collaboration & Contribution System
The team followed a structured collaboration model:

Frontend and backend work separated
Pull requests used for merging
Conflicts resolved before merging
Features tested before pushing to main

Additional responsibilities included:

Presentation Design → handled by Amr & Ayman
Documentation & Report Updates → handled by Omar
GitHub Management → Handled by Omar
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
7. Conclusion
The BELIS project demonstrates a complete full-stack AI-powered system combining:

Modern frontend development
Scalable backend architecture
Database design
AI integration
Team collaboration practices

The use of branch-based development, AI services, and modular architecture makes this project:

👉 Technically strong
👉 Scalable
👉 Professionally structured
