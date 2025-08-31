# 🏋️ CaloFit - Smart Nutrition Analyzer

A fast, mobile-first landing page that lets users upload or capture meal photos and get instant macronutrient analytics (protein, carbs, fat) via AI analysis.

## ✨ Features

- **📱 Mobile-First Design** - Optimized for mobile devices with responsive layout
- **📷 Photo Capture/Upload** - Support for both camera capture and file upload
- **🤖 AI Nutrition Analysis** - Instant macronutrient breakdown (protein, carbs, fat)
- **⚡ Fast Performance** - Built with Vite for lightning-fast development and builds
- **🎨 Beautiful UI** - Modern design with Tailwind CSS
- **📊 Visual Results** - Interactive charts and progress bars for nutrition data

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Visit `http://localhost:3000` to see the application

### Build for Production

```bash
npm run build
npm run preview
```

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Linting**: ESLint

## 📁 Project Structure

```
calorie-valorie/
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── ImageUploader.jsx
│   │   ├── NutritionResults.jsx
│   │   └── Footer.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🎯 Key Components

### ImageUploader
- Drag & drop functionality
- Camera capture support
- File validation
- Image preview

### NutritionResults
- Macronutrient breakdown visualization
- Confidence scoring
- Detected food items display
- Action buttons for saving/sharing

### Mobile-First Design
- Responsive grid layouts
- Touch-friendly buttons
- Optimized for various screen sizes

## 🔗 API Integration

The app is set up with a mock API response. To integrate with a real nutrition analysis API:

1. Replace the mock data in `src/App.jsx`
2. Update the API endpoint in the `handleImageAnalysis` function
3. Add your API key and authentication

```javascript
// Example API integration
const response = await fetch('/api/analyze-nutrition', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
})
```

## 🎨 Customization

### Colors
Update the color scheme in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  }
}
```

### Styling
Modify component styles in `src/index.css` or individual component files.

## 📱 Mobile Features

- **Camera Integration**: Direct camera access for meal photos
- **Touch Gestures**: Drag and drop support
- **Responsive Design**: Optimized for mobile screens
- **Fast Loading**: Optimized bundle size and lazy loading

## 🚀 Deployment

### Netlify/Vercel
```bash
npm run build
# Deploy the `dist` folder
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

## 📄 License

MIT License - feel free to use this project for your own nutrition analysis applications!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

**Built with ❤️ for healthier living**

