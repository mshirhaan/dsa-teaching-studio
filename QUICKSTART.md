# Quick Start Guide

## First Time Setup

1. **Install Node.js** (if not already installed)
   - Download from [nodejs.org](https://nodejs.org/)
   - Recommended: Version 18 or higher

2. **Open Terminal** and navigate to the project directory:
   ```bash
   cd dsa-studio
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** and go to:
   ```
   http://localhost:3000
   ```

## How to Use

### Changing View Modes
Click the buttons in the top-left toolbar:
- **Split View** (default): See code and canvas side-by-side
- **Code Only**: Full-screen editor
- **Draw Only**: Full-screen whiteboard

### Resizing Panels
In Split View mode, drag the divider between code and canvas to adjust sizes.

### Writing Code
1. Click in the code editor
2. Select language (JavaScript, Python, C++, Java)
3. Start coding!
4. Code is auto-saved as you type

### Drawing on Canvas
1. Use the drawing tools at the top of the canvas
2. Draw shapes, add text, create diagrams
3. Use undo/redo as needed

### Saving Your Work
1. Click the **"Save"** button in the toolbar
2. Your session is saved to browser storage
3. Close and reopen - your work is still there!

### Exporting Code
1. Click **"Export"** button
2. Your code downloads as a text file

### Loading Sessions
1. Click **"Load"** button
2. Select a saved session JSON file
3. Your previous work loads instantly

## Tips

- **For Teaching**: Use Split View to show code and explain concepts on the canvas
- **For Coding**: Switch to Code Only mode for focused programming
- **For Diagramming**: Switch to Draw Only mode for whiteboard sessions
- **Keyboard Shortcuts**: Most standard editor shortcuts work (Ctrl+C, Ctrl+V, etc.)

## Troubleshooting

### Port Already in Use
If port 3000 is busy:
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found Errors
Try reinstalling dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Canvas Not Showing
Make sure JavaScript is enabled in your browser and you're using a modern browser (Chrome, Firefox, Safari, Edge).

## Next Steps

Check out the full feature specification in `dsa_teaching_tool_spec.md` for all available and planned features!

