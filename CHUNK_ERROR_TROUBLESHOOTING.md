# 🔧 ChunkLoadError Troubleshooting Guide for Easeboard

## What is ChunkLoadError?

A `ChunkLoadError` occurs when webpack (Next.js's bundler) fails to load JavaScript code chunks. This typically happens when:

1. **Stale build cache** - Most common cause
2. **PWA service worker conflicts** - Service worker serves stale content
3. **Network issues** - Chunks fail to download
4. **Webpack configuration conflicts** - Bundle splitting issues

## 🚀 Quick Fix (Run These Commands)

```powershell
# 1. Clear all caches
.\clear-cache.ps1

# 2. Reinstall dependencies
npm install

# 3. Start fresh development server
npm run dev
```

## 🛠️ Manual Fix Steps

### Step 1: Clear Build Cache
```powershell
# Remove Next.js build cache
Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue

# Remove node modules cache
Remove-Item -Recurse -Force "node_modules/.cache" -ErrorAction SilentlyContinue
```

### Step 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or go to Application > Storage > Clear storage

### Step 3: Clear PWA Cache
```powershell
# Remove service worker files
Remove-Item "public/sw.js" -ErrorAction SilentlyContinue
Remove-Item "public/workbox-*.js" -ErrorAction SilentlyContinue
```

### Step 4: Restart Development Server
```powershell
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Advanced Debugging

### Check Network Tab
1. Open Developer Tools > Network
2. Reload the page
3. Look for failed chunk requests (red entries)
4. Check if any chunks return 404 errors

### Check Console
Look for specific error patterns:
- `Loading chunk X failed`
- `ChunkLoadError: Loading CSS chunk`
- `Cannot read property of undefined`

### Check Service Worker
1. Open Developer Tools > Application > Service Workers
2. If you see an active service worker, click "Unregister"
3. Reload the page

## 🎯 Prevention Strategies

### 1. Updated Next.js Config
We've updated `next.config.js` with:
- Better chunk splitting strategy
- Improved caching for PWA
- Optimized package imports

### 2. Cache Clearing Script
Use `clear-cache.ps1` whenever you encounter issues:
```powershell
.\clear-cache.ps1
```

### 3. Development Best Practices
- Always clear cache when switching branches
- Run `npm install` after pulling updates
- Use `npm run dev` instead of cached builds
- Disable PWA during development (already configured)

## 🚨 When to Use Each Fix

| Scenario | Solution |
|----------|----------|
| First time seeing error | Clear cache + restart dev server |
| After git pull | Run `.\clear-cache.ps1` then `npm install` |
| Error persists | Manual browser cache clear |
| PWA-related issues | Unregister service worker |
| Webpack errors | Check `next.config.js` configuration |

## 🔗 Related Files

- `next.config.js` - Webpack and PWA configuration
- `clear-cache.ps1` - Automated cache clearing
- `public/sw.js` - Service worker (auto-generated)
- `public/manifest.json` - PWA manifest

## ✅ Success Indicators

You'll know the fix worked when:
- ✅ No red errors in browser console
- ✅ Page loads without chunk errors
- ✅ All navigation works smoothly
- ✅ No failed network requests for chunks

## 📞 Still Having Issues?

If the error persists after trying all steps:

1. **Check for conflicting browser extensions**
2. **Try incognito/private browsing mode**
3. **Verify your internet connection**
4. **Check if the issue occurs on different pages**
5. **Review the full error stack trace**

The updated configuration should prevent most chunk loading issues going forward!
