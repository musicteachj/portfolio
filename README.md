# My Portfolio Website

A modern, responsive portfolio website built with Vue 3, TypeScript, and Vuetify 3.

## 🚀 Features

- **Modern Stack**: Vue 3, TypeScript, Vuetify 3, Vite
- **Distinctive Design System**: Custom "Professional Navy" theme with JetBrains Mono + IBM Plex Sans typography (see [`DESIGN.md`](./DESIGN.md))
- **Responsive Design**: Mobile-first layout verified across desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes with persistence
- **Project Showcase**: Featured projects with detailed information
- **Smooth Animations**: Scroll-triggered reveals and micro-interactions (respects `prefers-reduced-motion`)
- **Type Safety**: Full TypeScript implementation
- **Tested**: Unit/component tests with Vitest + Vue Test Utils
- **Performance**: Optimized builds with Vite

## 🛠️ Built With

- [Vue.js 3](https://vuejs.org/) - Progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Vuetify 3](https://vuetifyjs.com/) - Material Design component library
- [Vite](https://vitejs.dev/) - Fast build tool
- [Pinia](https://pinia.vuejs.org/) - State management
- [Vue Router](https://router.vuejs.org/) - Client-side routing
- [Vitest](https://vitest.dev/) - Unit/component testing

## 🎨 Design System

The site's visual language — color tokens, typography, spacing, motion, and anti-patterns — is documented in [`DESIGN.md`](./DESIGN.md). It's the source of truth for any future UI work.

## 🏃 Getting Started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:3000)
npm run build    # type-check + production build
npm run test:run # run the test suite once
npm run lint     # lint and auto-fix
npm run format   # format with Prettier
```

## 🧪 Testing

Unit and component tests run on **Vitest** + **Vue Test Utils** (jsdom environment). Tests are co-located in `__tests__/` directories next to the code they cover — stores under `src/stores/__tests__/` and components under `src/components/**/__tests__/`. Shared setup and helpers (`mountComponent`, mock router, mock data) live in `src/test/`.

```bash
npm run test          # watch mode
npm run test:run      # run once
npm run test:ui       # interactive UI
npm run test:coverage # coverage report (v8)
```

## 📧 Contact

- Email: jameslittlefield3@gmail.com
- LinkedIn: [James Littlefield](https://www.linkedin.com/in/james-littlefield-93037713b/)
- GitHub: [MusicTeachJ](https://github.com/musicteachj)
