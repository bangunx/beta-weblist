# Changelog - Node.js Update

## [1.0.1] - 2024-12-19

### Updated
- **Node.js Engine**: Updated from `>=14.0.0` to `>=22.0.0` (LTS)
- **Dependencies**:
  - `@types/node`: `^18.0.6` → `^22.0.0`
  - `express`: `^4.19.2` → `^4.21.0`

### Added
- **Build Script**: Added `npm run build` command
- **Test Script**: Updated `npm test` to be more descriptive

### Technical Notes
- **No Breaking Changes**: Project uses minimal dependencies (Express.js) which are backward compatible
- **Static File Serving**: All existing functionality preserved
- **Vercel Compatibility**: Updated dependencies maintain compatibility with Vercel deployment
- **Security**: No vulnerabilities found in updated dependencies

### Migration Guide
1. Ensure Node.js version 22.x or higher is installed
2. Run `npm install` to update dependencies
3. All existing routes and static file serving remain unchanged
4. No code changes required for this update

### Verification
- ✅ `npm run build` - Success
- ✅ `npm test` - Success  
- ✅ `npm start` - Server runs on localhost:3000
- ✅ No vulnerabilities detected
- ✅ All static routes functional (/game, /tools, /mind, /random)
