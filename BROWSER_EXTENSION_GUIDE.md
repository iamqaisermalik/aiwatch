# Browser Extension Installation Guide

## ⚠️ Important: Safari vs Chrome/Edge

**Safari extensions work differently** and require a more complex setup. For testing, use **Chrome or Edge** instead.

## 🚀 Quick Installation (Chrome/Edge)

### Step 1: Enable Developer Mode
1. **Open Chrome/Edge**
2. **Go to Extensions**: `chrome://extensions/` or `edge://extensions/`
3. **Enable "Developer mode"** (toggle in top-right corner)

### Step 2: Load Extension
1. **Click "Load unpacked"** 
2. **Navigate to**: `/Users/qaisermalik/Documents/aiwatch/browser-extension`
3. **Select the folder** and click "Open"
4. **Extension is now installed!** ✅

### Step 3: Test the Extension
1. **Visit any website** (e.g., google.com)
2. **Look for the AIWatch floating interface** at bottom center
3. **Click the voice button** 🎤 to start talking
4. **The AI will respond with voice** 🔊

## 🎤 Voice Features:

Your AIWatch now has:
- ✅ **Voice Commands** - Click microphone to speak
- ✅ **Speech Responses** - AI speaks back to you  
- ✅ **Visual Conversation** - See chat history
- ✅ **Context Awareness** - Knows what page you're on

## 📱 How to Use:

1. **Click the microphone button** 🎤
2. **Speak your question** (e.g., "What is this page about?")
3. **Wait for AI response** - it will both show text and speak
4. **Continue conversation** with more voice commands

## 🔧 Troubleshooting:

### Extension Not Visible:
- Check if "Developer mode" is enabled
- Refresh the webpage after installing
- Check browser console for errors

### Voice Not Working:
- **Allow microphone permission** when prompted
- **Test on HTTPS sites** (voice APIs require secure context)
- **Use Chrome/Edge** - better voice API support

### No AI Response:
- Check if the Vercel app is running: https://aiwatch-nmtyvwy63-qaisers-projects-e9dbc08b.vercel.app
- Check browser console for WebSocket errors

## 🌐 Live Web App vs Extension:

- **Web App**: https://aiwatch-nmtyvwy63-qaisers-projects-e9dbc08b.vercel.app
- **Browser Extension**: Works on ANY website once installed

The extension gives you the **universal web assistant** experience you wanted - voice commands on any website! 🎯