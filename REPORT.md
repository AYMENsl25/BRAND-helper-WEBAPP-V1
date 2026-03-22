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
-----------------------------------------------------------------------------------------------------------------------------------------------------------------------
Throughout the development of BELIS, we placed strong emphasis on advanced prompt engineering, carefully designing and refining every prompt used across the system. Each prompt was engineered with precision to ensure high-quality, consistent, and context-aware outputs from AI services.

Prompt :- 

    # BELIS — AI-Powered Brand Identity & Startup Validation Platform
    ## Full Stack Project Prompt (Complete Build Guide)

    ---

    ## Project Overview

    Build a full-stack web application called **BELIS** (meaning "You make beauty" in Latin) — an AI-powered brand identity and startup validation platform. The slogan is **"Building the core of your brand."**

    BELIS helps entrepreneurs and startup founders:
    - Validate their business idea using AI-powered SWOT analysis
    - Generate a complete brand identity (tagline, voice, personality, mission)
    - Create an AI-generated logo using image generation models
    - Build and download a professional brand kit PDF
    - Explore market intelligence and competitor analysis

    The application uses a **dark mode aurora aesthetic** — deep purple/black backgrounds with glowing purple accents — inspired by premium SaaS design systems.

    ---

    ## Tech Stack

    ### Frontend
    - **React + Vite** — fast modern UI framework
    - **React Router DOM** — client-side routing
    - **Axios** — HTTP client for API calls with automatic Bearer token injection via interceptors
    - **react-simple-maps** — interactive SVG world map with country highlighting
    - **jsPDF** — client-side PDF generation for brand kit export
    - **prop-types** — required peer dependency for react-simple-maps

    ### Backend
    - **FastAPI** — Python REST API framework
    - **SQLModel** — ORM combining SQLAlchemy and Pydantic
    - **MySQL** — relational database running as MySQL80 Windows Service
    - **PyJWT** — JSON Web Token authentication
    - **Uvicorn** — ASGI server for running FastAPI
    - **httpx** — async HTTP client for calling external AI APIs
    - **python-dotenv** — loads environment variables from .env file

    ### AI & External Services
    - **Google Gemini** (`gemini-2.5-flash-lite`) — generates SWOT analysis and brand identity; free tier allows 500 requests per day
    - **HuggingFace FLUX.1-schnell** — generates AI logo images via the HuggingFace inference API

    ---

    ## PHASE 1 — MySQL Database Design

    Design a normalized relational database (4NF) with **15 tables**, InnoDB engine, full foreign key constraints, 3 triggers, and 3 views.

    ### Tables:
    - `users` — stores registered user accounts with hashed passwords and profile info
    - `projects` — stores startup ideas with title, description, industry, stage, and is_favourite flag
    - `project_tags` — stores multiple tags per project (many-to-one with projects)
    - `analyses` — stores AI-generated analysis results linked to a project
    - `swot_items` — stores individual SWOT entries (strength/weakness/opportunity/threat) linked to an analysis
    - `competitors` — stores AI-identified competitors with name, description, website, and country
    - `brand_assets` — stores tagline, brand voice, personality type, and mission statement per project
    - `color_palettes` — stores primary, secondary, accent, and background hex colors linked to brand assets
    - `logo_prompts` — stores the AI prompt text, generated image URL, style, and is_selected flag
    - `feedback` — stores star ratings (1–5) and optional comments per project per user
    - `resources` — stores saved links with title, URL, and notes per user and project

    ### Key Design Decisions:
    - Every table uses an auto-increment integer primary key named `id`
    - All foreign keys use ON DELETE CASCADE so child records are cleaned up automatically
    - The `is_favourite` boolean field on projects enables sorting favourites to the top of the dashboard
    - The `is_selected` boolean field on logo_prompts tracks which logo the user has chosen
    - Column existence must be checked via `information_schema` before altering tables — older MySQL versions do not support the `ADD COLUMN IF NOT EXISTS` syntax and will throw a syntax error

    ---

    ## PHASE 2 — FastAPI Backend

    ### Project Structure:
    - `main.py` — application entry point that registers all routers, CORS middleware, and static file serving
    - `database.py` — handles database connection, table creation on startup, and safe column migrations
    - `core/config.py` — reads all settings from the .env file using Pydantic BaseSettings
    - `models/` — SQLModel table model definitions (one file per domain)
    - `schemas/` — Pydantic request and response schemas for validation and serialization
    - `routers/auth.py` — register, login, get current user, update profile endpoints
    - `routers/projects.py` — full CRUD with search, stage/industry filters, pagination, and favourite toggle
    - `routers/analysis.py` — triggers Gemini AI to generate SWOT analysis and competitor list
    - `routers/brand.py` — triggers Gemini for brand identity then HuggingFace for logo image generation
    - `routers/feedback.py` — submit and retrieve star ratings and comments per project
    - `routers/resources.py` — save and list useful links per user
    - `static/` — folder where AI-generated logo images are saved and served publicly

    ### Backend Configuration:
    - CORS middleware is configured to allow requests from the Vite dev server running on port 5173
    - Static files are mounted so AI-generated logos are accessible at a public URL like `/static/logo_abc123.jpg`
    - JWT tokens are required for all protected endpoints using a FastAPI Depends dependency
    - All secrets and API keys are stored in a `.env` file and never hardcoded

    ### Key Endpoints:
    - `POST /auth/register` — creates a new user account with a hashed password
    - `POST /auth/login` — validates credentials and returns a JWT access token
    - `GET /auth/me` — returns the currently authenticated user's profile
    - `GET /projects/` — returns paginated projects with optional search, stage, and industry query parameters; response includes total count, current page, and total pages
    - `PATCH /projects/{id}/favourite` — toggles the is_favourite boolean and returns the updated value
    - `POST /analysis/{id}/analyze` — sends project data to Gemini and stores the SWOT, viability score, market size, target region, and competitors
    - `POST /brand/{id}/generate` — sends project data to Gemini for brand identity then sends the logo prompt to HuggingFace; saves the logo image to the static folder
    - `POST /feedback/` — submits a star rating and optional comment for a project
    - `GET /resources/` — returns saved links for the authenticated user

    ### Environment Variables Required:
    - Database connection settings: host, port, user, password, database name
    - JWT settings: secret key, hashing algorithm, token expiry in minutes
    - Gemini API key (get from Google AI Studio)
    - HuggingFace API key (get from HuggingFace settings)
    - App name and version for the FastAPI title

    ---

    ## PHASE 3 — React Frontend

    ### Project Structure:
    - `src/api/client.js` — Axios instance with a request interceptor that automatically attaches the Bearer token from localStorage to every outgoing request
    - `src/context/AuthContext.jsx` — provides login, logout, loading state, and current user to the entire app via React Context
    - `src/components/ProtectedRoute.jsx` — wraps private pages; redirects unauthenticated users to the login page
    - `src/components/Toast.jsx` — reusable notification system for success and error messages
    - `src/pages/Home.jsx` — aurora landing page with animated star field, glowing beam, and floating dust particles
    - `src/pages/Login.jsx` — login form with real-time field validation; BELIS logo click navigates back to the landing page
    - `src/pages/Register.jsx` — registration form with validation
    - `src/pages/Dashboard.jsx` — projects grid with search, stage and industry filters, pagination, favourites sorting, and delete confirmation
    - `src/pages/Lab.jsx` — 5-step brand identity wizard that calls Gemini and HuggingFace
    - `src/pages/ProjectDetail.jsx` — tabbed project detail page with Analysis, Market, Brand Identity & Kit, and Competitors tabs
    - `src/pages/Profile.jsx` — user profile settings page
    - `src/pages/Resources.jsx` — saved links library

    ### AuthContext Important Detail:
    - The loading state must be set to true before calling fetchUser inside the login function
    - Without this step, ProtectedRoute evaluates the auth state before the user data has loaded and incorrectly redirects to the login page

    ### Dashboard Features:
    - Search input with a 300ms debounce to avoid firing on every keystroke
    - Stage filter buttons dynamically generated (All / idea / mvp / launched)
    - Industry filter buttons dynamically built from the industries present in the API response
    - Pagination with previous, next, and numbered page buttons; shows only when total pages exceed one
    - Total project count displayed as "X ideas in your vault" using the total field from the paginated API response
    - Star button on each card to toggle favourites; starred projects are sorted to the top of the grid
    - Delete button triggers a "Sure? Yes / No" inline confirmation before actually deleting
    - A red error banner appears at the top of the page if a delete operation fails
    - Skeleton shimmer cards are shown while data is loading

    ### Lab (5-Step Wizard):
    - Step 1 — business description textarea with a live character counter; shows a red error message if the input is under 21 characters
    - Step 2 — brand personality selection grid (Minimal / Bold / Playful / Luxury)
    - Step 3 — industry selection tags; choosing "Other" reveals a custom text input whose typed value is sent directly to the AI prompt
    - Step 4 — stage selection cards (idea / mvp / launched)
    - Step 5 — project name input with a full identity summary showing all previous choices before final submission
    - Full-screen loading overlay with animated step indicators showing Create Project → Analyze → Generate Brand progress

    ### ProjectDetail — Four Tabs:

    #### Analysis Tab:
    - Summary paragraph generated by Gemini AI
    - Four SWOT cards for Strengths, Weaknesses, Opportunities, and Threats
    - Each card has a colored border, background tint, and icon (↑ ↓ ◎ ⚡)
    - Glassmorphism style using backdrop-filter blur and semi-transparent borders

    #### Market Tab:
    - Three metric cards showing TAM (Total Addressable Market), SAM (Serviceable Addressable Market), and Target Demographic parsed from the AI response text
    - Interactive world map built with react-simple-maps that highlights countries in the brand's primary color based on the project's industry
    - Market growth trend chart built with inline SVG showing a glowing animated line with data points

    #### Brand Identity & Kit Tab:
    - Tagline, brand voice, and personality type cards
    - Mission statement card with italic styling
    - 3D Logo Studio with a floating animation and mouse-hover tilt effect using CSS perspective transform
    - Three logo variant buttons — Primary (full color), Minimal (grayscale filter), Inverted (invert filter on dark background)
    - Logo download button that applies the selected CSS filter via the Canvas API before saving the PNG file
    - Color palette section with a harmony generator offering Original, Complementary, Analogous, and Triadic options
    - 60-30-10 Rule visual bar showing color distribution as a proportional horizontal band
    - Live Type Scale showing all five font options at Bold, Medium, and Regular weights with the brand's primary color on the active selection
    - 3D Business Card with mouse-tilt perspective effect and a customization panel for name, job title, email, phone, and card background color
    - Prominent Export Brand Kit PDF button that generates a multi-page PDF with the real AI logo, color swatches, typography samples, and business card layout

    #### Competitors Tab:
    - List of AI-identified competitors with name, description, country, and clickable website links

    ---

    ## PHASE 4 — Key Technical Implementations

    ### 3D Tilt Effect (Pure CSS + JavaScript):
    - Tracks the mouse position relative to the element using getBoundingClientRect
    - Calculates X and Y rotation angles based on how far the mouse is from the element's center
    - Applies a CSS perspective transform to create a realistic 3D tilt
    - Dynamically shifts the box shadow direction to match the tilt for a realistic lighting effect
    - A shine overlay gradient rotates with the tilt angle to simulate a reflective surface
    - Resets smoothly to flat on mouse leave
    - Applied to both the Logo Studio display and the Business Card preview
    - No external 3D library required — pure CSS transforms are hardware-accelerated

    ### Logo Download with Variant Style Applied:
    - Creates an offscreen HTML canvas element sized at 800×800 pixels
    - Fills the background with white or black depending on the selected variant
    - Applies a CSS filter (grayscale or invert) to the canvas 2D context before drawing the image
    - Draws the logo image centered and scaled to fit within the canvas
    - Triggers a PNG download using a dynamically created anchor element
    - The downloaded file reflects the selected visual style, not just the on-screen preview

    ### Color Harmony Generation (Pure JavaScript):
    - Converts a hex color to HSL (Hue, Saturation, Lightness) format
    - Rotates the hue angle by fixed amounts to generate harmonically related colors
    - Complementary palette uses a 180-degree hue rotation
    - Analogous palette uses 30-degree rotations on each side of the base color
    - Triadic palette uses 120-degree rotations creating three evenly spaced hues
    - Converts all results back to hex format for display and use in the card customization

    ### Interactive World Map (react-simple-maps):
    - Maps each industry category to a list of relevant world regions
    - Maps each region to a list of country ISO numeric codes matching the world-atlas GeoJSON format
    - Highlighted countries render in the brand's primary color with a drop shadow glow
    - Non-highlighted countries render in a subtle purple-tinted neutral tone
    - Country ISO numeric codes are used because world-atlas identifies countries by three-digit numeric ID, not by name or two-letter code

    ### PDF Generation (jsPDF):
    - Loads the AI-generated logo via a CORS-enabled image fetch
    - Draws the image onto a canvas to convert it to a PNG data URL
    - Embeds the PNG into the PDF using jsPDF's addImage method to include the real AI logo
    - Adds color swatches with hex codes, typography samples across all five font options, and a full business card layout across multiple PDF pages
    - Business card uses the user's customized name, title, email, phone, and chosen card color
    - The PDF is saved to the user's device with the project name included in the filename

    ---

    ## PHASE 5 — Team Collaboration (Git Workflow)

    ### Branch Strategy:
    - `main` — stable production-ready branch; never pushed to directly
    - `dev---Aymen-for-test` — Aymen's primary integration and development branch
    - `Frontend-design-v1` — teammate's feature development branch

    ### Workflow:
    - Teammate opens a Pull Request from their branch targeting the dev branch on GitHub
    - Conflicts are identified in the GitHub PR diff view
    - Conflicts are resolved locally by pulling the merged branch and fixing markers
    - All features from both branches are preserved during conflict resolution
    - Tested locally before pushing the resolved merge back

    ### Features Added by Teammate:
    - Real-time field validation in the Login form with error states and touched/focused tracking
    - Profile page and Resources page with saved links functionality
    - Toast notification component used across all pages
    - Dashboard skeleton loading cards with shimmer animation
    - Feedback submission and display system in ProjectDetail
    - Kit Maker section with typography selector, business card preview, and PDF export
    - Favourite star button, delete confirmation dialog, and error banner on Dashboard

    ### Common Conflict Patterns and Solutions:
    - State variable conflicts — always keep ALL state variables from both branches; never discard one side's state
    - Navigation route conflicts — keep the teammate's updated route paths (e.g. `/dashboard?from=kit-maker`)
    - Delete handler conflicts — merge all patterns together: confirmation dialog, loading spinner, toast notification, and error banner
    - Backend startup conflicts — keep all new database migrations and field additions from both branches

    ### Commit Message Convention Used:
    - `feat:` for new features and functionality
    - `fix:` for bug fixes including merge conflict resolutions
    - `docs:` for README and documentation updates
    - `chore:` for package installs and configuration changes

    ---

    ## PHASE 6 — Design System

    ### Color Palette:
    - Background: deep space black (#030005)
    - Primary accent: aurora purple light (#C084FC)
    - Secondary accent: aurora purple (#9333EA)
    - Body text: pure white (#FFFFFF)
    - Muted text: slate gray (#94A3B8)
    - Subtle text: dark slate (#64748B)

    ### Card Style (Glassmorphism):
    - Semi-transparent white background at very low opacity (0.03)
    - Thin white border at low opacity (0.08)
    - backdrop-filter blur of 10px for the frosted glass appearance
    - Subtle border radius on all cards

    ### Animations Used:
    - `fadeInUp` — content slides up from 16px below and fades in when switching tabs
    - `shimmer` — horizontal gradient sweep across skeleton loading cards
    - `float` — gentle 10px vertical bob applied to the logo in the hero header
    - `logo-glow` — pulsing box shadow on the 3D logo display in Logo Studio
    - `pulse-dot` — scale pulse on colored status indicator dots
    - `glow-line` — drop shadow pulse on the market growth chart line
    - `hero-pulse` — slow opacity breathe on the aurora background orbs

    ---

    ## PHASE 7 — Running the Project

    ### Backend:
    - Create and activate a Python virtual environment
    - Install all dependencies from requirements.txt
    - Create a `.env` file with all required environment variables
    - Start the server with Uvicorn on port 8000 with auto-reload enabled
    - API documentation is available at `/docs` (Swagger UI)

    ### Frontend:
    - Install packages using npm install with the `--legacy-peer-deps` flag to avoid peer dependency conflicts
    - Start the Vite dev server on port 5173

    ### Database:
    - Start the MySQL80 Windows service
    - Create a database named `brandforge`
    - Import the SQL schema file exported from the dev branch

    ---

    ## EXPECTED RESULTS

    After completing all phases you should have:

    - A landing page with an aurora beam animation, animated star field, and floating dust particles
    - JWT-protected routes that redirect unauthenticated users to the login page
    - A 5-step brand identity wizard that calls Gemini AI and HuggingFace FLUX for logo generation
    - A dashboard with search, stage and industry filters, pagination, favourites sorting, and inline delete confirmation with error handling
    - A project detail page with four tabs — Analysis, Market, Brand Identity & Kit, and Competitors
    - An interactive world map highlighting target regions based on the project's industry category
    - A 3D logo studio with variant switching and a canvas-based styled download
    - A 3D business card with a live customization panel and mouse-tilt perspective effect
    - A downloadable brand kit PDF containing the real AI logo, color palette, typography samples, and business card layout
    - A complete team collaboration history using GitHub branches, pull requests, and conflict resolution

    ---

    ## IMPORTANT NOTES

    - Use functional components only — no class components
    - Use React hooks throughout: useState, useEffect, useMemo, useRef, useCallback
    - Always use `--legacy-peer-deps` when installing npm packages to avoid peer dependency version conflicts
    - Gemini free tier allows 500 requests per day — if the daily limit is reached the server returns HTTP 429; the app should fall back to mock brand data automatically and retry the next day
    - MySQL does not support `ADD COLUMN IF NOT EXISTS` on older versions — always query `information_schema` to check if a column exists before running an ALTER TABLE statement
    - The static folder must be created on startup and mounted in main.py for generated logo images to be accessible via public URL
    - The loading state in AuthContext must be set to true before calling fetchUser inside the login function — without this ProtectedRoute evaluates auth state too early and incorrectly redirects

    ---

    *Built with ❤️ — BELIS: "You make beauty. Building the core of your brand."*
