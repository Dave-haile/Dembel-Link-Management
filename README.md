# Dembel City Center - Link Management Hub

A modern, responsive link management platform for Dembel City Center, built with React, TypeScript, and Node.js. This application allows administrators to manage social media links and provides visitors with a beautiful, interactive hub to discover all of Dembel City Center's online presence.

## 🌟 Features

### For Visitors
- **Beautiful Hub Interface**: Clean, modern design with smooth animations
- **Mobile Responsive**: Optimized for all devices
- **Click Analytics**: Track link engagement
- **Share Functionality**: Easy sharing via native share API or clipboard
- **Professional Branding**: Customizable colors and profile information

### For Administrators
- **Secure Authentication**: JWT-based admin access
- **Link Management**: Add, edit, delete, and reorder links
- **Analytics Dashboard**: View click statistics for all links
- **Settings Management**: Customize profile information and colors
- **Real-time Updates**: Instant changes without page reload

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **TailwindCSS** for styling
- **Framer Motion** for animations
- **Lucide React** for icons

### Backend
- **Node.js** with Express
- **Better-SQLite3** for database
- **JWT** for authentication
- **bcrypt** for password hashing
- **Vite** for development server

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
1. Clone the repository
```bash
git clone https://github.com/Dave-haile/Dembel-Link-Management.git
cd Dembel-Link-Management
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:3000`

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```
JWT_SECRET=your-secret-key-here
```

### Default Admin Credentials
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change the default password after first login!

## 📱 Screenshots

### Main Hub View
<!-- Add screenshot of the main hub interface here -->
![Hub View](./screenshots/hub-view.png)

### Admin Dashboard
<!-- Add screenshot of the admin dashboard here -->
![Admin Dashboard](./screenshots/admin-dashboard.png)

### Analytics Panel
<!-- Add screenshot of the analytics section here -->
![Analytics](./screenshots/analytics.png)

### Mobile View
<!-- Add screenshot of mobile responsive design here -->
![Mobile View](./screenshots/mobile-view.png)

## 🎨 Customization

### Branding
The application can be fully customized through the admin panel:

- **Profile Name**: Display name for the hub
- **Profile Username**: Social media handle (@username)
- **Profile Image**: Profile picture URL
- **Background Color**: Page background color
- **Button Color**: Link button background color
- **Text Color**: Link button text color

### Link Management
Each link supports:
- **Title**: Display text for the link
- **Subtitle**: Additional descriptive text
- **URL**: Destination URL
- **Icon**: Choose from available icons
- **Sort Order**: Arrange links in preferred order
- **Active/Inactive**: Enable or disable links without deleting

## 📊 Database Schema

The application uses SQLite with the following tables:

### Links
```sql
CREATE TABLE links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  subtitle TEXT,
  icon TEXT,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Analytics
```sql
CREATE TABLE analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  link_id INTEGER,
  clicked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (link_id) REFERENCES links(id)
);
```

### Settings
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  profile_name TEXT DEFAULT 'Dembel City Center',
  profile_username TEXT DEFAULT '@dembelcitycenter',
  profile_image TEXT DEFAULT 'https://picsum.photos/seed/mall/200/200',
  bg_color TEXT DEFAULT '#ffffff',
  button_color TEXT DEFAULT '#1e40af',
  text_color TEXT DEFAULT '#ffffff'
);
```

### Users
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);
```

## 🔐 Security

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **SQL Injection Protection**: Parameterized queries throughout
- **CORS Ready**: Configured for cross-origin requests

## 📁 Project Structure

```
├── src/
│   ├── components/
│   │   ├── Hub.tsx          # Main hub view component
│   │   ├── Login.tsx         # Login form component
│   │   └── Admin.tsx        # Admin dashboard component
│   ├── App.tsx               # Main application component
│   ├── main.tsx              # Application entry point
│   ├── types.ts              # TypeScript type definitions
│   └── index.css             # Global styles
├── server.ts                 # Express server and API endpoints
├── package.json              # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
└── README.md               # This file
```

## 🎯 API Endpoints

### Public Endpoints
- `GET /api/links` - Get all active links
- `GET /api/settings` - Get public settings

### Authenticated Endpoints
- `POST /api/login` - Authenticate user
- `GET /api/admin/links` - Get all links (including inactive)
- `POST /api/admin/links` - Create new link
- `PUT /api/admin/links/:id` - Update existing link
- `DELETE /api/admin/links/:id` - Delete link
- `PUT /api/settings` - Update settings
- `GET /api/analytics` - Get click analytics

### Utility Endpoints
- `POST /api/links/:id/click` - Track link click

## 🚀 Deployment

### Production Build
```bash
npm run build
# or
yarn build
```

### Environment Setup
1. Set `NODE_ENV=production`
2. Configure your `JWT_SECRET` environment variable
3. Ensure the database file has proper write permissions

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- **Email**: support@dembelcitycenter.com
- **GitHub Issues**: [Create an issue](https://github.com/Dave-haile/Dembel-Link-Management/issues)

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Fast build tool
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Lucide](https://lucide.dev/) - Beautiful icons
- [Better-SQLite3](https://github.com/WiseLibs/better-sqlite3) - Fast SQLite library

---

**© 2026 Dembel City Center. All rights reserved.**