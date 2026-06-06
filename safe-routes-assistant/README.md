# 🛡️ Safe Routes Assistant

A professional React application for calculating safe routes using Mapbox GL JS. This application provides real-time zone safety analysis and turn-by-turn navigation with an interactive chat assistant.

## ✨ Features

- 🗺️ **Interactive Map**: Powered by Mapbox GL JS with geocoding and geolocation
- 💬 **Chat Assistant**: Intelligent assistant for route planning and safety analysis
- 🧭 **Turn-by-Turn Navigation**: Step-by-step route guidance
- 📊 **Safety Analysis**: Zone safety evaluation with recommendations
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Clean, professional interface with CSS modules

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Mapbox account and access token

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd safe-routes-assistant
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:

Create a `.env` file in the root directory (copy from `.env.example`):

```env
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here
VITE_MAP_DEFAULT_CENTER_LNG=-99.1341
VITE_MAP_DEFAULT_CENTER_LAT=19.2853
VITE_MAP_DEFAULT_ZOOM=13
VITE_API_BASE_URL=http://localhost:3000/api
```

**Important**: Replace `your_mapbox_token_here` with your actual Mapbox access token from [Mapbox Account](https://account.mapbox.com/).

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📁 Project Structure

```
safe-routes-assistant/
├── src/
│   ├── components/          # React components
│   │   ├── MapContainer.jsx
│   │   ├── MapContainer.module.css
│   │   ├── ChatPanel.jsx
│   │   ├── ChatPanel.module.css
│   │   ├── NavigationPanel.jsx
│   │   └── NavigationPanel.module.css
│   ├── hooks/              # Custom React hooks
│   │   └── useMapbox.js
│   ├── services/           # API services
│   │   ├── mapboxService.js
│   │   └── geolocationService.js
│   ├── utils/              # Utility functions
│   │   └── formatters.js
│   ├── styles/             # Global styles
│   ├── App.jsx             # Main application component
│   ├── App.css             # Global application styles
│   └── main.jsx            # Application entry point
├── .env                    # Environment variables (not in git)
├── .env.example            # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

## 🏗️ Architecture

### Components

- **MapContainer**: Renders the Mapbox map with controls
- **ChatPanel**: Interactive chat interface for user interaction
- **NavigationPanel**: Displays route information and navigation steps

### Services

- **mapboxService**: Handles all Mapbox API interactions (routing, geocoding, safety analysis)
- **geolocationService**: Manages user location detection

### Hooks

- **useMapbox**: Custom hook for Mapbox map initialization and management

### Utils

- **formatters**: Utility functions for formatting distances, durations, and translations

## 🔐 Environment Variables

The application uses Vite's environment variable system. All variables must be prefixed with `VITE_` to be exposed to the client.

### Required Variables

- `VITE_MAPBOX_ACCESS_TOKEN`: Your Mapbox access token
- `VITE_MAP_DEFAULT_CENTER_LNG`: Default map center longitude
- `VITE_MAP_DEFAULT_CENTER_LAT`: Default map center latitude
- `VITE_MAP_DEFAULT_ZOOM`: Default map zoom level

### Optional Variables

- `VITE_API_BASE_URL`: Backend API URL for future integration

**Security Note**: Never commit your `.env` file to version control. The `.env` file is already included in `.gitignore`.

## 🔌 API Integration

The application is designed to integrate with a backend API for real safety data. Currently, safety analysis uses simulated data.

### Integrating Real Safety Data

1. Set up your backend API endpoint in `.env`:
```env
VITE_API_BASE_URL=https://your-api.com/api
```

2. Update `src/services/mapboxService.js` in the `analyzeZoneSafety` function:

```javascript
// Replace the simulation with real API call
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/safety/analyze`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ coordinates: coords })
});

const data = await response.json();
```

## 🛠️ Development

### Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

### Code Style

The project uses:
- ESLint for code linting
- CSS Modules for component styling
- Functional components with hooks

## 📦 Building for Production

```bash
npm run build
```

The build output will be in the `dist/` directory, ready to be deployed to any static hosting service.

## 🚀 Deployment

### Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

### Netlify

1. Build command: `npm run build`
2. Publish directory: `dist`
3. Add environment variables in Netlify dashboard

### Other Platforms

The application can be deployed to any static hosting service that supports SPA routing.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/) for mapping functionality
- [React](https://react.dev/) for the UI framework
- [Vite](https://vitejs.dev/) for the build tool

## 📧 Contact

For questions or support, please open an issue in the repository.

---

**Note**: This is a portfolio project demonstrating modern React development practices, API integration, and professional code organization.
