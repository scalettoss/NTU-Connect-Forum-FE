# NTU Connect - Frontend

## Description
NTU Connect is a modern web application built with Next.js, React, and TypeScript. It provides a comprehensive platform for connecting and interacting within the NTU community.

## Prerequisites
Before installing the application, make sure you have the following installed on your system:
- Node.js (version 18 or higher)
- npm (Node Package Manager) or yarn
- Git

## Installation Guide

### 1. Clone the Repository
```bash
git clone [repository-url]
cd NtuConnect-Fe
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Create a `.env.local` file in the root directory and configure the necessary environment variables:
```env
NEXT_PUBLIC_API_URL=your_backend_api_url
```

### 4. Development Mode
To run the application in development mode:
```bash
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:3000`

### 5. Production Build
To create a production build:
```bash
npm run build
# or
yarn build
```

To start the production server:
```bash
npm run start
# or
yarn start
```

## Tech Stack
- Next.js 15.2.3
- React 19
- TypeScript
- TailwindCSS
- Various UI components and libraries:
  - FullCalendar
  - ApexCharts
  - React Hook Form
  - Framer Motion
  - And more...

## Project Structure
```
NtuConnect-Fe/
├── src/           # Source code
├── public/        # Static files
├── .next/        # Next.js build output
└── node_modules/ # Dependencies
```

## Scripts
- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code linting

## Browser Support
The application supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Notes
- Make sure all required environment variables are properly set before running the application
- The application requires a stable internet connection for API communications
- For optimal development experience, use VS Code with recommended extensions

## License
See the LICENSE file for details. 