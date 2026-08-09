# Virtual Clothing Try-On SaaS Platform

A comprehensive multi-tenant SaaS platform that enables clothing stores to offer virtual try-on experiences to their customers through AI-powered body analysis and clothing simulation.

## 🚀 Features

### For Customers (Mobile App)
- **Virtual Try-On**: AI-powered clothing simulation using body landmarks
- **Body Profile**: Create detailed body measurements and shape analysis
- **Barcode Scanning**: Instantly try on clothes by scanning product barcodes
- **Size Recommendations**: AI-driven size suggestions based on body measurements
- **Social Sharing**: Share virtual outfits with friends and social media
- **Favorites & Outfits**: Save and organize preferred clothing combinations

### For Shop Owners (Admin Dashboard)
- **Multi-Tenant Management**: Each shop operates independently with isolated data
- **Product Management**: Upload and manage clothing inventory with 3D models
- **Customer Analytics**: Track user engagement and try-on success rates
- **Inventory Integration**: Sync with existing inventory management systems
- **Performance Metrics**: Monitor AI accuracy and customer satisfaction

### AI-Powered Features
- **Body Landmark Detection**: MediaPipe-based pose estimation
- **Body Shape Classification**: Automatic categorization (pear, apple, hourglass, etc.)
- **Virtual Clothing Overlay**: Realistic clothing simulation on user photos
- **Size Prediction**: ML-based size recommendations with confidence scores
- **Style Recommendations**: Personalized clothing suggestions

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │  Admin Dashboard│    │   AI Services   │
│   (Flutter)     │    │   (React)       │    │   (Python)      │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴───────────┐
                    │   Spring Boot Backend   │
                    │   (Multi-tenant Core)   │
                    └─────────────┬───────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
    ┌─────┴─────┐         ┌───────┴───────┐       ┌───────┴───────┐
    │PostgreSQL │         │   Redis Cache │       │   AWS S3      │
    │ Database  │         │   (Sessions)  │       │  (Media)      │
    └───────────┘         └───────────────┘       └───────────────┘
```

## 🛠️ Tech Stack

### Backend
- **Framework**: Spring Boot 3.2 with Java 17
- **Database**: PostgreSQL with Row Level Security for multi-tenancy
- **Cache**: Redis for session management and caching
- **Authentication**: JWT with tenant isolation
- **Storage**: AWS S3 for images and 3D models
- **Documentation**: OpenAPI 3.0 (Swagger)

### Mobile App
- **Framework**: Flutter 3.x
- **State Management**: Provider pattern
- **HTTP Client**: Dio with interceptors
- **Local Storage**: Secure storage for tokens
- **Camera**: Native camera integration
- **Barcode**: Mobile scanner for product lookup

### Admin Dashboard
- **Framework**: React 18 with Material-UI
- **State Management**: React Query + Context API
- **Charts**: Recharts for analytics visualization
- **Forms**: React Hook Form with validation
- **File Upload**: Drag-and-drop interface

### AI Services
- **Framework**: FastAPI with Python 3.11
- **Computer Vision**: OpenCV + MediaPipe
- **Machine Learning**: PyTorch/TensorFlow
- **Image Processing**: PIL/Pillow
- **Task Queue**: Celery with Redis

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for admin dashboard)
- Flutter SDK 3.x (for mobile app)
- Python 3.11+ (for AI services)
- PostgreSQL 15+

### 1. Clone Repository
```bash
git clone https://github.com/your-org/virtual-tryon-platform.git
cd virtual-tryon-platform
```

### 2. Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit environment variables
nano .env
```

### 3. Start with Docker Compose
```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps
```

### 4. Initialize Database
```bash
# Run database migrations
docker-compose exec backend ./mvnw flyway:migrate

# Seed initial data
docker-compose exec backend java -jar app.jar --seed-data
```

### 5. Access Applications
- **Admin Dashboard**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **AI Services**: http://localhost:8000
- **API Documentation**: http://localhost:8080/swagger-ui.html

## 📱 Mobile App Development

### Setup Flutter Environment
```bash
cd mobile_app

# Install dependencies
flutter pub get

# Generate code (for JSON serialization)
flutter packages pub run build_runner build

# Run on device/emulator
flutter run
```

### Build for Production
```bash
# Android
flutter build apk --release

# iOS
flutter build ios --release
```

## 🔧 Development

### Backend Development
```bash
cd backend

# Run locally
./mvnw spring-boot:run

# Run tests
./mvnw test

# Build JAR
./mvnw clean package
```

### Admin Dashboard Development
```bash
cd admin_dashboard

# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### AI Services Development
```bash
cd ai_services

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 🗄️ Database Schema

The platform uses a multi-tenant PostgreSQL database with the following key tables:

- **tenants**: Shop information and configuration
- **users**: Customer accounts with tenant isolation
- **body_profiles**: User body measurements and AI analysis
- **products**: Clothing inventory with variants and media
- **try_on_sessions**: Virtual try-on results and analytics
- **size_recommendations**: AI-generated size suggestions

See [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) for complete schema.

## 🔐 Security

### Multi-Tenant Isolation
- Row Level Security (RLS) in PostgreSQL
- Tenant context in all API calls
- JWT tokens contain tenant information
- Separate S3 bucket organization per tenant

### Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (customer, admin, super-admin)
- API rate limiting per tenant
- Secure password hashing with bcrypt

## 📊 Monitoring & Analytics

### Application Metrics
- Spring Boot Actuator endpoints
- Custom business metrics
- Performance monitoring
- Error tracking and alerting

### Business Analytics
- User engagement tracking
- Try-on success rates
- Size recommendation accuracy
- Tenant usage statistics

## 🚀 Deployment

### Production Deployment
```bash
# Build all services
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Scale services
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### AWS Deployment
- ECS/EKS for container orchestration
- RDS for PostgreSQL database
- ElastiCache for Redis
- S3 for media storage
- CloudFront for CDN
- Application Load Balancer

## 📈 Roadmap

See [DEVELOPMENT_ROADMAP.md](DEVELOPMENT_ROADMAP.md) for detailed development phases and milestones.

### Phase 1 (Weeks 1-4): Foundation & Backend
- ✅ Multi-tenant architecture
- ✅ Authentication system
- ✅ Product management
- 🔄 Admin dashboard

### Phase 2 (Weeks 5-9): Mobile App
- 🔄 Flutter app development
- 📋 Barcode scanning
- 📋 User profiles
- 📋 Product browsing

### Phase 3 (Weeks 10-12): AI Integration
- ✅ Body analysis service
- 📋 Virtual try-on engine
- 📋 Size recommendations
- 📋 Mobile AI integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-org/virtual-tryon-platform/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-org/virtual-tryon-platform/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/virtual-tryon-platform/discussions)
- **Email**: support@virtualtryon.com

## 🙏 Acknowledgments

- MediaPipe team for pose estimation technology
- Spring Boot community for excellent documentation
- Flutter team for cross-platform mobile development
- Open source contributors and maintainers