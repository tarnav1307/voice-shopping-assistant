# 🛒 Voice Shopping Assistant

A highly interactive, modern web application that allows users to shop using voice commands. Built with **React**, **Vite**, and the **Web Speech API**, it acts as a smart supermarket assistant with an extreme black, premium aesthetic.

## ✨ Features

- **🎙️ Voice-Activated Commands**: Use your microphone to seamlessly add, remove, and search for items.
  - *Example:* "Add 2 bottles of water"
  - *Example:* "Search for organic apples under 100 rupees"
  - *Example:* "Remove milk"
  - *Example:* "Clear cart"
- **🧠 NLP Parsing**: Understands natural language quantities and price constraints.
- **📦 Massive Catalog**: Contains a simulated inventory of 380+ realistic supermarket items categorized across Produce, Dairy, Bakery, Pantry, Snacks, and Drinks.
- **🤖 Smart Recommendations**: Analyzes your cart in real-time and suggests pairings (e.g., if you add Bread, it recommends Butter & Jam).
- **⚠️ Missing Items Tracker**: If you request an item that doesn't exist in the 380-item catalog, it's flagged and added to a special "Not in Catalog" side menu.
- **🌑 Extreme Black Aesthetic**: Features a pure OLED black background, translucent glassmorphism panels, and neon-white glowing accents.
- **🎛️ Cart Management**: Interactive side-menu catalog, instant checkout, and `+` / `-` cart quantity adjusters.

## 🚀 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Pure CSS (Custom properties, CSS Animations, Glassmorphism)
- **Voice API**: Native Browser Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`)
- **Fonts**: Google Fonts (Outfit, JetBrains Mono)

## 🛠️ Local Setup

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone git@github.com:tarnav1307/voice-shopping-assistant.git
   cd voice-shopping-assistant
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173`. 
   
> **Note**: For the microphone to work, your browser must support the Web Speech API (Chrome, Edge, Safari) and you must allow microphone permissions when prompted.

## 🌐 Deployment

This project is optimized for easy deployment on [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).

To build for production locally:
```bash
npm run build
npm run preview
```
