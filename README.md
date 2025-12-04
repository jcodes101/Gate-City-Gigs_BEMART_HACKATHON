=====================================================================
FRONTEND
=====================================================================

**React + Vite Application**

- **Framework**: React 19 with Vite for fast development and builds
- **Styling**: Tailwind CSS 4 for modern, responsive UI design
- **Routing**: React Router DOM for client-side routing
- **State Management**: Context API for global state management
- **Maps Integration**: Mapbox GL for interactive job location mapping
- **UI Components**: Custom components with gradient overlays and animations
- **Authentication**: Google OAuth integration for seamless user login
- **Speech Features**: Speech-to-Text and Text-to-Speech capabilities
- **PDF Generation**: jsPDF for contract generation and downloads

**Key Features:**
- Interactive Map Dashboard with job markers and geocoding
- Job Search with AI-powered ranking and filtering
- Real-time Chatbot with AWS Bedrock AI integration
- User Profile Management
- Job Contract Generation (PDF downloads)
- Responsive Design for mobile and desktop
- Protected Routes with authentication middleware

=====================================================================
BACKEND
=====================================================================

**Node.js Express Server**

- **Runtime**: Node.js with Express 5
- **Process Management**: PM2 for production process management and auto-restart
- **Authentication**: JWT tokens with Google OAuth verification
- **File Upload**: Multer for handling file uploads
- **Caching**: Redis for improved performance and session management
- **Database**: MySQL2 with connection pooling
- **Security**: bcrypt for password hashing, CORS enabled

**Key Features:**
- RESTful API endpoints for gigs, users, and authentication
- AWS Bedrock AI integration for intelligent responses
- File upload to AWS S3 with presigned URLs
- Redis caching for optimized database queries
- Protected routes with JWT middleware
- Error handling and logging

=====================================================================
DATABASE
=====================================================================

**AWS RDS MySQL**

- Managed MySQL database on AWS RDS
- Connection pooling for optimal performance
- Support for IAM authentication
- SSL connection support
- Environment-based configuration

=====================================================================
AWS SERVICES & INFRASTRUCTURE
=====================================================================

**Deployment: AWS EC2**
- EC2 instance hosting the application
- PM2 process manager for keeping the server running
- Automatic restarts and log management
- Production-ready deployment scripts

**AWS Bedrock**
- AI-powered chatbot using Claude 3 Haiku model
- Knowledge base integration support
- Intelligent job matching and recommendations
- Natural language processing for user queries

**AWS S3**
- File storage for user uploads
- Presigned URLs for secure file access
- Image and document storage

**AWS RDS**
- Managed MySQL database
- Automated backups and scaling
- High availability configuration

**Redis Caching**
- Session management
- Query result caching
- Improved application performance

=====================================================================
KEY FEATURES
=====================================================================

**🗺️ Interactive Map Dashboard**
- Mapbox GL integration with 3D buildings
- Real-time job location mapping
- Geocoding for address-to-coordinates conversion
- Interactive markers with job details popups
- Search and filter jobs by location, tags, and keywords

**🤖 AI-Powered Chatbot**
- AWS Bedrock integration for intelligent responses
- Speech-to-Text for voice input
- Text-to-Speech for audio responses
- Context-aware conversations
- Pre-written responses for common queries

**📄 Contract Generation**
- PDF contract generation using jsPDF
- Automated contract creation with job details
- User and employer information integration
- Downloadable contracts for job acceptance

**🔐 Authentication & Security**
- Google OAuth integration
- JWT token-based authentication
- Protected routes and API endpoints
- Secure password hashing with bcrypt

**💼 Job/Gig Management**
- Create and manage job postings
- Search and filter jobs
- Job acceptance workflow
- User profile management
- Contact information management

**🚀 Deployment & DevOps**
- PM2 process management
- Automated deployment scripts
- Environment-based configuration
- Production-ready build processes
- EC2 deployment automation

=====================================================================
TECHNOLOGY STACK
=====================================================================

**Frontend:**
- React 19
- Vite
- Tailwind CSS 4
- Mapbox GL
- React Router DOM
- jsPDF
- Google OAuth

**Backend:**
- Node.js
- Express 5
- MySQL2
- Redis
- AWS SDK (Bedrock, S3, RDS)
- JWT
- Multer
- PM2

**Infrastructure:**
- AWS EC2
- AWS RDS (MySQL)
- AWS S3
- AWS Bedrock
- Redis

=====================================================================
SETUP & INSTALLATION
=====================================================================

See individual setup guides in the project:
- `be-smart/markdown_guides/HOW_TO_RUN.md` - Frontend setup
- `be-smart/markdown_guides/GOOGLE_AUTH_SETUP.md` - Authentication setup
- `be-smart/markdown_guides/QUICK_START.md` - Quick start guide

=====================================================================
DEPLOYMENT
=====================================================================

The application is deployed on AWS EC2 with PM2 process management.

**Deployment Features:**
- Automated build scripts
- PM2 ecosystem configuration
- Environment variable management
- Production optimizations
- Log management

For deployment instructions, see the deployment scripts in the project root.

=====================================================================
