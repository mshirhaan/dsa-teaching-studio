# WorkPad

A versatile workspace for code, notes, and canvas - perfect for development, teaching, and office work. Combining a powerful code editor with a fully-featured drawing canvas for live teaching, screen sharing, note-taking, and interactive demonstrations.

## Features

### Core Layout & View Modes
- **Split View**: Code editor and drawing canvas side-by-side (50/50 split with resizable divider)
- **Code Only**: Full-screen code editor
- **Draw Only**: Full-screen drawing canvas
- **Picture-in-Picture**: Float one view over the other (planned)

### Code Editor
- Monaco Editor with syntax highlighting for JavaScript, Python, C++, and Java
- Multiple themes (Dark, Light, High Contrast)
- Line numbers, auto-indentation, bracket matching
- Customizable font size
- Console output for code execution results

### Drawing Canvas
- Powered by Excalidraw for professional whiteboard experience
- Full drawing tools: pen, shapes, text, arrows
- Undo/redo support
- Professional drawing features

### Session Management
- Save and load sessions to browser storage
- Export code as text files
- Load sessions from JSON files
- Auto-save functionality (planned)

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workpad
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
workpad/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── MainApp.tsx      # Main application component
│   │   ├── LayoutContainer.tsx  # Layout management
│   │   ├── CodeEditor.tsx   # Monaco editor wrapper
│   │   ├── DrawingCanvas.tsx    # Excalidraw canvas
│   │   ├── Toolbar.tsx      # Top toolbar
│   │   ├── Resizer.tsx      # Split view resizer
│   │   └── Console.tsx      # Code execution console
│   └── stores/              # State management
│       └── appStore.ts      # Zustand store
├── package.json
├── tsconfig.json
└── next.config.js
```

## Technologies Used

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **Monaco Editor**: VS Code's editor for the browser
- **Excalidraw**: Drawing canvas component
- **Zustand**: Lightweight state management
- **Lucide React**: Icon library

## Current Status

### Phase 1 (MVP) - Completed ✅
- Split view layout with resizable divider
- Basic code editor with syntax highlighting
- Drawing canvas with Excalidraw
- Session save/load
- Code export functionality
- Basic toolbar with view mode switching

### Planned Features
- Code execution for different languages
- Advanced canvas tools and features
- DSA-specific visualizers (Arrays, Trees, Graphs)
- Multiple slides/pages
- Export canvas as images
- Presentation mode
- Collaboration features

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Adding New Features

1. Create your component in `src/components/`
2. Add state management in `src/stores/appStore.ts` if needed
3. Wire up the component in the appropriate parent component
4. Update this README with new features

## Contributing

This is a teaching tool project. Contributions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - feel free to use for teaching and learning purposes!

## Roadmap

See the complete feature specification in `dsa_teaching_tool_spec.md` for detailed requirements and planned features.

