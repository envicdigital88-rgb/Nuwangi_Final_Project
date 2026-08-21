# 🔐 Admin Panel Credentials

## Super Admin Account (Full Access)

**Login URL:** http://localhost:3002

### Super Admin
- **Email:** `superadmin@virtualtry.com`
- **Password:** `SuperAdmin@123`
- **Role:** Super Admin
- **Permissions:** Full access to all features
  - Manage all admins
  - Manage all users
  - Manage all products
  - Manage system settings
  - Full database access

---

## Regular Admin Account

### Admin User
- **Email:** `admin@virtualtry.com`
- **Password:** `SuperAdmin@123`
- **Role:** Admin
- **Permissions:** Standard admin access
  - Manage users
  - Manage products
  - View analytics

---

## 🌐 All Platform URLs

| Platform | URL | Purpose |
|----------|-----|---------|
| **Admin Panel** | http://localhost:3002 | Admin dashboard for managing platform |
| **Customer Store** | http://localhost:3001 | Customer-facing shop with virtual try-on |
| **Backend API** | http://localhost:8082 | REST API endpoints |
| **Swagger UI** | http://localhost:8082/swagger-ui/index.html | Interactive API documentation |
| **OpenAPI Docs** | http://localhost:8082/v3/api-docs | API specification (JSON) |
| **AI Training UI** | http://localhost:5001 | ML model training interface |

---

## 📝 Notes

1. **First Login:** Use the super admin credentials to log into the admin panel
2. **Security:** Change the default passwords after first login in production
3. **Database:** All admin accounts are stored in the `admins` table in MySQL
4. **Password Hash:** Passwords are encrypted using BCrypt algorithm
5. **Token:** JWT tokens are used for authentication across all platforms

---

## 🚀 Quick Start

1. Open Admin Panel: http://localhost:3002
2. Enter Super Admin credentials:
   - Email: `superadmin@virtualtry.com`
   - Password: `SuperAdmin@123`
3. You're now logged in with full administrative privileges!

---

## 🔧 Troubleshooting

### Cannot Login?
- Verify all services are running (Backend on port 8082 is required)
- Check browser console for any errors
- Ensure database connection is active

### Forgot Password?
- Run the `CREATE_SUPER_ADMIN.sql` script again to reset passwords
- Or manually update the password hash in the database

---

## 📊 Database Tables

- **admins** - Admin user accounts
- **users** - Customer accounts
- **products** - Product catalog
- **body_profiles** - Customer body measurements
- **try_on_sessions** - Virtual try-on history

---

**Created:** August 20, 2026  
**Platform:** Virtual Try-On SaaS Platform
