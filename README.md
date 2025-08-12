# 🛠️ Kick AutoSend Development Tools

This directory contains private development tools for building and deploying the Kick AutoSend Chrome extension.

## 📁 Files

- **`build-remote.js`** - Node.js build script (cross-platform)
- **`build-remote-windows.bat`** - Windows batch build script
- **`package.json`** - NPM project configuration
- **`DEPLOYMENT.md`** - Detailed deployment guide
- **`QUICK_START.md`** - Quick reference guide

## 🚀 Quick Start

### For Windows Users
```bash
build-remote-windows.bat
```

### For Mac/Linux Users
```bash
node build-remote.js
```

## 📦 Output

The build process will:
1. Create a `dist/` folder in the `Kick-AutoSend/` directory
2. Generate a zip file in this directory ready for Chrome Web Store upload
3. Include build information and version tracking

## 🔒 Privacy

**These files are private and should never be uploaded to GitHub or the Chrome Web Store.**

They contain development documentation and build scripts that are for your use only.

## 📤 Chrome Web Store Upload

After building:
1. Upload the generated zip file to Chrome Web Store
2. Add release notes describing your changes
3. Submit for review

## 🔄 Version Management

- Update version in `Kick-AutoSend/manifest.json`
- Run the build script
- Upload the new zip file

---

**Need help?** Check `DEPLOYMENT.md` for detailed instructions.
