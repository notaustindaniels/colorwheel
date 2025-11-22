# Adobe Color Wheel - Local Setup Guide

This guide explains how to run the Adobe Color Wheel application locally.

## Stopping the Server

If a server is already running on port 8080, you can stop it with:

```bash
lsof -ti:8080 | xargs kill -9
```

## Starting the Server

### Option 1: Using the Launch Script (Recommended)

The easiest way to start the color wheel is using the provided launch script:

```bash
cd "./color.adobe.com/color.adobe.com"
./start-color-wheel.sh
```

This script will:
- Start an HTTP server on port 8080
- Automatically open the color wheel page in your default browser
- Display the server URL and status

### Option 2: Using NPX Command

If you prefer to start the server manually:

```bash
cd "./color.adobe.com/color.adobe.com"
npx -y http-server -p 8080 --proxy "http://localhost:8080?" &
```

**Note:** The quotes around the proxy URL are important to prevent shell expansion of the `?` character.

Wait a few seconds for the server to start, then open the color wheel in your browser:

```bash
sleep 2
open http://localhost:8080/create/color-wheel
```

## Accessing the Application

Once the server is running, access the color wheel at:

**http://localhost:8080/create/color-wheel**

## What Was Fixed

The original issue was that the page was stuck on a loading screen. The following fixes were applied:

### 1. CSS Syntax Error
- **File**: `create/color-wheel.html`
- **Issue**: Missing closing brace `}` in the `@keyframes spin` animation
- **Fix**: Added the closing brace at line 45

### 2. File Path Configuration
- **Files**: `create/color-wheel.html`, `bundle.e1ae87997abfadd7001d.js`
- **Issue**: Paths were configured for file:// protocol instead of http-server
- **Fix**: Ensured all resource paths use absolute `/` paths (e.g., `/config.js`, `/bundle.*.js`)
- **Fix**: Webpack publicPath set to `l.p="/"` for proper dynamic chunk loading

## Technical Details

### Server Configuration

The application uses `http-server` with the following settings:
- **Port**: 8080
- **Proxy**: Routes unhandled requests to `http://localhost:8080?`
- **CORS**: Disabled (for local development)
- **Cache**: 3600 seconds

### Application Architecture

- **Framework**: React SPA (Single Page Application)
- **Bundler**: Webpack with code splitting
- **Entry Point**: `/create/color-wheel.html`
- **Assets**: All JavaScript bundles, CSS, images, and workers load from the root `/` path

### Resource Loading

The application loads the following resources:
- Core bundles: `bundle.db0019d5e94a59d0a644.js`, `bundle.e1ae87997abfadd7001d.js`
- Configuration: `config.js`, `newRelic.js`
- Styles: `style.a932f2cb20f2b9be8553.css`
- Dynamic chunks: Loaded on-demand based on routing (create, explore, home, etc.)
- Web Workers: `bundle.c9d0e4d013b92fd543c4.worker.js`, `bundle.cf2c56a076dbdfadc775.worker.js`
- WASM modules: `GradientCaptureCore.wasm`

## Stopping the Server

To stop the server, press `Ctrl+C` in the terminal where it's running.

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, you can:

1. Kill the process using port 8080:
   ```bash
   lsof -ti:8080 | xargs kill -9
   ```

2. Or use a different port:
   ```bash
   cd "./color.adobe.com/color.adobe.com"
   npx -y http-server -p 3000 --proxy "http://localhost:3000?" &
   sleep 2
   open http://localhost:3000/create/color-wheel
   ```

### Resources Not Loading

If JavaScript or CSS files fail to load:

1. Check that you're accessing via `http://localhost:8080` (not `file://`)
2. Verify all files exist in the root directory
3. Check browser console for specific error messages
4. Clear browser cache and hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

### Application Not Rendering

If the page shows a blank screen:

1. Check browser console for JavaScript errors
2. Verify the server is running and accessible
3. Ensure you're on the correct path: `/create/color-wheel`
4. Try a different browser

## Browser Compatibility

The application works best with modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Additional Notes

- The application requires an internet connection for external dependencies (Adobe services, fonts, analytics)
- Some features may require authentication with Adobe ID
- Local storage is used for user preferences and session data

## Support

For issues or questions:
1. Check the browser console for error messages
2. Verify all prerequisites are met
3. Ensure the server is running on the correct port
4. Review the server logs for failed resource requests
