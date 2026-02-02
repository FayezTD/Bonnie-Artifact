# 🚀 Kobie Loyalty Chatbot - Local Testing Instructions

## ✅ Server is Running!

Your Angular application with the Kobie Loyalty Chatbot library is now running successfully.

---

## 🌐 Access the Application

**URL:** `http://localhost:4200`

Or if you're accessing from a different machine, use your server's IP address:
**URL:** `http://YOUR_SERVER_IP:4200`

---

## 📊 Server Status

```bash
# Check if the server is running
sudo supervisorctl status angular-dev

# View server logs (live)
tail -f /var/log/supervisor/angular-dev.out.log

# View error logs
tail -f /var/log/supervisor/angular-dev.err.log

# Restart the server
sudo supervisorctl restart angular-dev

# Stop the server
sudo supervisorctl stop angular-dev

# Start the server
sudo supervisorctl start angular-dev
```

---

## 🎯 What You'll See

1. **Main Page** - A demo page with instructions and test controls
2. **Chatbot Icon** - Look in the bottom-right corner for the Bonnie avatar icon
3. **Click to Open** - Click the icon to expand the chatbot
4. **Start Chatting** - Type messages and interact with Bonnie!

---

## 🧪 Test Features

### Basic Chat
- Click the chatbot icon in the bottom-right corner
- Type a message and press Enter or click Send
- See typing indicators
- View bot responses

### Test Controls (on the demo page)
- **Clear Chat** button - Clears all messages
- **Log Messages** button - Logs current messages to browser console

### Features to Test
✅ Send messages
✅ View typing indicators  
✅ Click suggestion buttons
✅ Expand/collapse chat
✅ Maximize/minimize chat
✅ View KPI metrics (if API is configured)
✅ Export chat as PDF
✅ Copy messages
✅ Read aloud functionality
✅ Responsive design (resize browser window)

---

## 🔧 Troubleshooting

### Chatbot not appearing?
**Check browser console** (F12) for errors:
```javascript
// You should see:
// ✅ Kobie Chatbot Demo Started
// 📦 Library loaded from: kobie-loyalty-chatbot
```

### API errors?
The chatbot is configured with a default API endpoint. If you see API errors:
1. Open browser console (F12)
2. Check for network errors
3. The API might be down or unreachable
4. This won't prevent the UI from loading

### Port already in use?
```bash
# Kill the process on port 4200
sudo lsof -ti:4200 | xargs -r kill -9

# Restart the server
sudo supervisorctl restart angular-dev
```

---

## 🔍 Browser Console Commands

Open browser console (F12) and try these:

```javascript
// The chatbot should log:
// ✅ Kobie Chatbot Demo Started
// 📦 Library loaded from: kobie-loyalty-chatbot

// When you send a message, you'll see:
// 📨 Message Event: { userMessage: "...", ... }
```

---

## 📱 Mobile Testing

The chatbot is fully responsive. Test on mobile by:

1. **Option 1:** Resize your browser window to mobile size
2. **Option 2:** Use browser dev tools (F12) → Toggle device toolbar
3. **Option 3:** Access from your phone: `http://YOUR_SERVER_IP:4200`

---

## 🎨 What to Look For

### Visual Elements
✅ Beautiful gradient header (Orange → Purple)
✅ Bonnie avatar in chat icon
✅ Smooth animations when opening/closing
✅ Chat bubbles with proper styling
✅ Floating action button in bottom-right
✅ Notification badges (if any unread messages)

### Interactions
✅ Click icon to open/close
✅ Expand/collapse functionality
✅ Maximize for full-screen view
✅ Scroll through messages
✅ Type and send messages
✅ Click suggestions
✅ Export functionality

---

## 📦 Library Integration Confirmed

The page is using the installed library:
- **Package:** `kobie-loyalty-chatbot@1.0.0`
- **Component:** `<klc-chat>`
- **Location:** `/app/node_modules/kobie-loyalty-chatbot/`

---

## ✅ Success Indicators

You'll know it's working when you see:

1. ✅ Page loads with "Kobie Loyalty Chatbot - Demo" heading
2. ✅ Chatbot icon visible in bottom-right corner
3. ✅ Icon shows Bonnie avatar
4. ✅ Clicking icon opens the chat interface
5. ✅ Chat header shows "Bonnie" with gradient background
6. ✅ Input field is available to type messages
7. ✅ Test controls work (Clear Chat, Log Messages)

---

## 🎉 Enjoy Testing!

The library is fully functional. All features from the original chatbot are preserved:
- Real-time chat
- Beautiful UI
- Animations
- KPI metrics
- PDF export
- Form handling
- Responsive design

**Open your browser and visit: http://localhost:4200** 🚀

---

## 📝 Quick Reference

**Start:** `sudo supervisorctl start angular-dev`
**Stop:** `sudo supervisorctl stop angular-dev`  
**Restart:** `sudo supervisorctl restart angular-dev`
**Status:** `sudo supervisorctl status angular-dev`
**Logs:** `tail -f /var/log/supervisor/angular-dev.out.log`

---

**Compiled successfully at:** 2026-02-02T05:43:45
**Server listening on:** 0.0.0.0:4200
**Status:** ✅ READY FOR TESTING
