#!/usr/bin/env node

/**
 * Create App Store Assets for MAIA Sovereign
 * Generates icons, screenshots, and other required assets for TestFlight
 */

const fs = require('fs');
const path = require('path');

// Create assets directory
const assetsDir = path.join(__dirname, 'app-store-assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// App Store Icon SVG (1024x1024)
const appIconSVG = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="1024" height="1024" fill="url(#goldGradient)" rx="180"/>

  <!-- Gradient Definition -->
  <defs>
    <radialGradient id="goldGradient" cx="50%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#FFE55C"/>
      <stop offset="50%" stop-color="#FFD700"/>
      <stop offset="100%" stop-color="#DAA520"/>
    </radialGradient>
    <radialGradient id="logoGradient" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F0E68C"/>
    </radialGradient>
  </defs>

  <!-- Central Circle -->
  <circle cx="512" cy="512" r="200" fill="url(#logoGradient)" stroke="#B8860B" stroke-width="8"/>

  <!-- MAIA Text -->
  <text x="512" y="440" font-family="Arial, sans-serif" font-size="120" font-weight="bold"
        text-anchor="middle" fill="#B8860B">MAIA</text>

  <!-- Sovereign Text -->
  <text x="512" y="560" font-family="Arial, sans-serif" font-size="60"
        text-anchor="middle" fill="#8B7355">Sovereign</text>

  <!-- Voice Wave Elements -->
  <g transform="translate(512,650)">
    <circle cx="-60" cy="0" r="8" fill="#B8860B" opacity="0.8"/>
    <circle cx="-20" cy="0" r="12" fill="#B8860B" opacity="0.6"/>
    <circle cx="20" cy="0" r="16" fill="#B8860B" opacity="0.4"/>
    <circle cx="60" cy="0" r="12" fill="#B8860B" opacity="0.6"/>
  </g>
</svg>`;

// Write App Store icon
fs.writeFileSync(path.join(assetsDir, 'AppStoreIcon.svg'), appIconSVG);

// Create HTML file for screenshot generation
const screenshotHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MAIA Sovereign - Screenshots</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
            height: 100vh;
            display: flex;
            flex-direction: column;
            color: #333;
        }

        .header {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            padding: 20px;
            text-align: center;
            border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header h1 {
            font-size: 32px;
            font-weight: 700;
            color: #8B4513;
            margin-bottom: 8px;
        }

        .header p {
            font-size: 16px;
            color: #654321;
            opacity: 0.9;
        }

        .main-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 40px 20px;
        }

        .voice-button {
            width: 120px;
            height: 120px;
            border-radius: 60px;
            background: linear-gradient(145deg, #FFE55C, #DAA520);
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 48px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            margin-bottom: 30px;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .voice-button:active {
            transform: scale(0.95);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }

        .status-text {
            font-size: 24px;
            font-weight: 600;
            color: #8B4513;
            margin-bottom: 20px;
        }

        .features {
            display: flex;
            flex-direction: column;
            gap: 15px;
            max-width: 300px;
            width: 100%;
        }

        .feature {
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .feature-icon {
            font-size: 20px;
            margin-right: 10px;
        }

        .feature-text {
            font-size: 16px;
            font-weight: 500;
            color: #654321;
        }

        .wave-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
            margin-top: 20px;
        }

        .wave-bar {
            width: 4px;
            background: #B8860B;
            border-radius: 2px;
            animation: wave 1s ease-in-out infinite alternate;
        }

        .wave-bar:nth-child(1) { height: 10px; animation-delay: 0s; }
        .wave-bar:nth-child(2) { height: 20px; animation-delay: 0.1s; }
        .wave-bar:nth-child(3) { height: 15px; animation-delay: 0.2s; }
        .wave-bar:nth-child(4) { height: 25px; animation-delay: 0.3s; }
        .wave-bar:nth-child(5) { height: 18px; animation-delay: 0.4s; }

        @keyframes wave {
            0% { opacity: 0.3; transform: scaleY(0.5); }
            100% { opacity: 1; transform: scaleY(1); }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MAIA Sovereign</h1>
        <p>Advanced AI Voice Assistant</p>
    </div>

    <div class="main-content">
        <button class="voice-button">🎤</button>
        <div class="status-text">Tap to speak with MAIA</div>

        <div class="wave-indicator">
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
            <div class="wave-bar"></div>
        </div>

        <div class="features">
            <div class="feature">
                <span class="feature-icon">🧠</span>
                <span class="feature-text">Intelligent Conversations</span>
            </div>
            <div class="feature">
                <span class="feature-icon">🎯</span>
                <span class="feature-text">Personalized Responses</span>
            </div>
            <div class="feature">
                <span class="feature-icon">🔒</span>
                <span class="feature-text">Privacy Focused</span>
            </div>
            <div class="feature">
                <span class="feature-icon">⚡</span>
                <span class="feature-text">Real-time Processing</span>
            </div>
        </div>
    </div>
</body>
</html>`;

// Write screenshot template
fs.writeFileSync(path.join(assetsDir, 'screenshot-template.html'), screenshotHTML);

// App Store Description
const appDescription = `# MAIA Sovereign App Store Description

## App Name
MAIA Sovereign

## Subtitle
AI Voice Assistant

## Description
MAIA Sovereign is your personal AI voice assistant designed for intelligent, natural conversations. Experience the future of AI interaction through advanced voice technology.

**Key Features:**
• Natural voice conversations with advanced AI
• Real-time speech recognition and synthesis
• Personalized responses tailored to your needs
• Privacy-focused design with secure processing
• Intuitive interface optimized for voice interaction
• Cross-platform compatibility

**Perfect for:**
• Getting quick answers to complex questions
• Brainstorming and creative thinking
• Learning and research assistance
• Daily planning and organization
• Entertainment and casual conversation

Transform how you interact with AI through the power of voice. MAIA Sovereign brings you closer to the future of human-computer interaction.

## Keywords
AI, voice assistant, artificial intelligence, speech recognition, conversation, productivity, smart assistant, voice chat

## Support URL
https://soullab.life/support

## Privacy Policy URL
https://soullab.life/privacy

## Category
Productivity

## Age Rating
4+ (Safe for all ages)
`;

// Write app description
fs.writeFileSync(path.join(assetsDir, 'AppStore-Description.md'), appDescription);

// Privacy Policy Template
const privacyPolicy = `# MAIA Sovereign Privacy Policy

**Last Updated: ${new Date().toLocaleDateString()}**

## Information We Collect
MAIA Sovereign processes voice input locally on your device when possible. We may collect:
- Voice recordings during active sessions (processed and deleted after response)
- Basic usage analytics (anonymized)
- Technical error logs for app improvement

## How We Use Information
- Process voice input to provide AI responses
- Improve app performance and features
- Provide customer support when requested

## Data Storage and Security
- Voice data is processed in real-time and not permanently stored
- All data transmission is encrypted
- We follow industry-standard security practices

## Third-Party Services
MAIA Sovereign may use:
- AI processing services (OpenAI, Anthropic)
- Analytics services (anonymized data only)

## Your Rights
- Request deletion of any stored data
- Opt-out of analytics collection
- Review what data we have about you

## Contact
For privacy questions: privacy@soullab.life

This policy may be updated to reflect changes in our practices or legal requirements.
`;

fs.writeFileSync(path.join(assetsDir, 'Privacy-Policy.md'), privacyPolicy);

// Instructions file
const instructions = `# App Store Assets Created! 📱

## Generated Files:

### 1. AppStoreIcon.svg
- 1024x1024 App Store icon in SVG format
- Golden theme matching your app
- Ready to convert to PNG for submission

### 2. screenshot-template.html
- HTML template for creating App Store screenshots
- Open in browser and take screenshots at different iPhone sizes
- Shows your app's main interface

### 3. AppStore-Description.md
- Complete App Store listing description
- Keywords, categories, age rating
- Copy and paste into App Store Connect

### 4. Privacy-Policy.md
- Template privacy policy for your app
- Edit with your specific details
- Host on your website for App Store requirement

## Next Steps:

1. **Convert Icon**: Use online tool to convert SVG to 1024x1024 PNG
2. **Create Screenshots**: Open screenshot-template.html in browser, resize to iPhone dimensions, take screenshots
3. **Update Privacy Policy**: Edit and host on your website
4. **Upload to App Store Connect**: Use all these assets in your submission

## Required Screenshot Sizes:
- iPhone 6.7": 1290×2796
- iPhone 6.5": 1242×2688
- iPhone 5.5": 1242×2208
- iPad Pro 12.9": 2048×2732

Your app is ready for professional App Store submission! 🚀
`;

fs.writeFileSync(path.join(assetsDir, 'README.md'), instructions);

console.log('🎉 App Store assets created successfully!');
console.log('📁 Check the app-store-assets/ folder');
console.log('📱 Your MAIA Sovereign app is ready for TestFlight!');