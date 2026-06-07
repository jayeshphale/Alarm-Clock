# Alarm Clock SPA

A modern React + Redux Toolkit alarm clock single-page application with a polished Add/Edit alarm experience.

## Live Demo

https://alarm-clock-blond-kappa.vercel.app/

## Repository

https://github.com/jayeshphale/Alarm-Clock

## Project Overview

This project is a React SPA built with Vite and Redux Toolkit. It includes an alarm creation workflow, alarm list management, and a clean user interface styled to work around legacy template assets.

## Features

- Add, edit, and delete alarms
- Set alarm time with hour, minute, and AM/PM selection
- Repeat alarms on selected weekdays
- Choose alarm sound options
- Responsive UI optimized for desktop and mobile
- Built-in Redux state management
- Vite-powered development and build tooling

## Tech Stack

- React
- Redux Toolkit
- React Redux
- Vite

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Open the local URL shown in the terminal to preview the application.

## Production Build

```bash
npm run build
```

## Project Structure

- `src/` — application source files
- `src/pages/` — page-level components
- `src/components/` — reusable UI components
- `src/redux/` — Redux store and slice logic
- `src/styles.css` — app-specific styles and overrides
- `index.html` — Vite HTML entry point

## Notes

This repository includes legacy UI assets from the original Paperplane template while preserving the React application structure. App-specific styling is applied in `src/styles.css` to ensure consistent layout and readability.

## Assumptions

- Alarms are managed locally in the browser and do not persist to a backend server.
- The app uses browser-based state and does not include user authentication.
- Legacy Paperplane template assets are preserved for reference, with app-specific overrides applied in `src/styles.css`.
- The live demo is hosted on Vercel and reflects the current deployed repository state.


