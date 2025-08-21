# 🛠️ Canvas Integration Troubleshooting Guide

## 🚨 "Invalid Canvas API Token" Error - SOLVED

Your friend's issue with the "invalid canvas api token" error has been resolved with our enhanced validation system. Here's what was improved and how to help them:

### ✅ **What We Fixed:**

1. **🔧 Enhanced URL Validation**
   - Now accepts multiple Canvas URL formats
   - Automatic URL normalization (adds https://, removes trailing slashes)
   - Supports various Canvas domains (.instructure.com, .edu, custom domains)

2. **🔍 Multi-Endpoint Testing**
   - Tests multiple Canvas API endpoints if one fails
   - Better compatibility with different Canvas configurations
   - More accurate error detection

3. **⏱️ Improved Timeout Handling**
   - Increased timeout to 15 seconds for slower connections
   - Better timeout error messages

4. **📝 Detailed Error Messages**
   - Step-by-step troubleshooting instructions
   - Specific guidance for each error type
   - Clear next steps for resolution

### 🎯 **For Your Friend - Setup Instructions:**

#### Step 1: Canvas URL Format
Tell them to try these URL formats (the system now auto-corrects):
- `https://yourschool.instructure.com`
- `https://canvas.yourschool.edu`
- `yourschool.instructure.com` (system adds https://)
- `canvas.yourschool.edu` (system adds https://)

#### Step 2: Token Generation (Most Common Issue)
Have them follow these **exact steps**:

1. **Log into Canvas** in their browser
2. **Go to Account → Settings** (not course settings!)
3. **Scroll down** to "Approved Integrations" section
4. **Click "+ New Access Token"**
5. **Enter Purpose**: "Student Dashboard" or "Easeboard"
6. **Click "Generate Token"**
7. **Copy the ENTIRE token** (it's long, ~70 characters)
8. **Paste immediately** - tokens are only shown once!

#### Step 3: Common Token Issues & Solutions

**❌ Problem**: "Token rejected by Canvas"
**✅ Solution**: 
- Make sure they copied the ENTIRE token
- Check for extra spaces at beginning/end
- Generate a new token if unsure

**❌ Problem**: "Canvas URL not found"
**✅ Solution**:
- Verify they can access Canvas in browser with that URL
- Try removing any paths after the domain
- Contact their school's IT if URL is unclear

**❌ Problem**: "Insufficient permissions"
**✅ Solution**:
- Generate a new token (some institutions have restrictions)
- Contact Canvas admin if issue persists

### 🔧 **Enhanced Troubleshooting Features:**

When your friend encounters an error now, the system will:

1. **Show specific error details** (not just "invalid token")
2. **Provide numbered troubleshooting steps**
3. **Test multiple Canvas endpoints** automatically
4. **Give institution-specific guidance**

### 💡 **Pro Tips for Your Friend:**

1. **Test in Browser First**: Make sure they can access Canvas normally
2. **Use Full URL**: Include the full https://domain.com format
3. **Check Institution Docs**: Some schools have specific Canvas URLs
4. **Fresh Token**: When in doubt, generate a new token
5. **Contact IT**: If issues persist, their school's IT can help

### 🆘 **If They Still Have Issues:**

The new system provides detailed error messages. Have them:

1. **Read the full error message** (now includes troubleshooting steps)
2. **Try the suggested solutions** in order
3. **Check browser console** for technical details (F12 → Console)
4. **Share the specific error message** if they need more help

### 📞 **Institution-Specific Help:**

Some common Canvas URLs by institution type:
- **Universities**: `https://canvas.university.edu`
- **Colleges**: `https://college.instructure.com`
- **K-12 Schools**: `https://district.instructure.com`
- **Community Colleges**: `https://ccname.instructure.com`

### 🎉 **Expected Results After Fix:**

When working correctly, your friend should see:
- ✅ "Connected successfully as [Their Name]"
- ✅ "Canvas connection test successful!"
- ✅ "📚 Course data synced successfully!"
- ✅ Green health indicator on dashboard

### 🔄 **System Improvements Made:**

1. **Flexible URL Handling**: Works with more Canvas URL formats
2. **Better Error Detection**: Identifies specific issues (token vs URL vs network)
3. **Multiple Endpoint Testing**: Tries different API endpoints for compatibility
4. **Enhanced Timeouts**: More time for slower connections
5. **Detailed Troubleshooting**: Step-by-step resolution guidance

**The "invalid canvas api token" error should now be much rarer and when it does occur, users get clear guidance on how to fix it!** 🎯

---

## 🚀 **For Developers - Technical Details:**

### New Features in Canvas Test API:
- URL normalization and validation
- Multi-endpoint testing (`/users/self`, `/courses`, `/accounts/self`)
- Enhanced error classification
- Detailed troubleshooting responses
- Better timeout handling (15s vs 10s)

### Error Response Format:
```json
{
  "error": "Canvas API test failed",
  "details": "Invalid Canvas API token. The token was rejected by Canvas.",
  "troubleshooting": [
    "Verify your token was copied correctly (no extra spaces)",
    "Check if the token has expired",
    "Ensure the token has proper permissions",
    "Try generating a new token from Canvas settings"
  ],
  "testedEndpoints": ["..."],
  "timestamp": "2025-08-21T..."
}
```

This comprehensive fix should resolve your friend's setup issues! 🎉
