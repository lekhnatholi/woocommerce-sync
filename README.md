# Matat Assessment Project

A full-stack application with a Node.js/Express backend API and a Next.js frontend client.

## Project Structure

```
matat-assessment/
├── client/          # Next.js frontend application
├── server/          # Node.js/Express backend API
└── README.md        # This file
```

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (for the backend database)

## Backend Setup (Server)

The backend is a Node.js/Express application with TypeScript that provides a WooCommerce API.

### Technologies Used
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Mongoose** - MongoDB ODM
- **Axios** - HTTP client
- **CORS** - Cross-origin resource sharing
- **Winston** - Logging
- **Node-cron** - Task scheduling
- **Jest** - Testing framework

### Installation & Setup

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create environment variables:
   Create a `.env` file in the server directory with the following variables:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/matat-assessment
   NODE_ENV=development
   ```

4. Build the TypeScript code:
   ```bash
   npm run build
   # or
   yarn build
   ```

### Running the Backend

#### Development Mode
```bash
npm run dev
# or
yarn dev
```

#### Production Mode
```bash
npm start
# or
yarn start
```

#### Running Tests
```bash
npm test
# or
yarn test
```

The backend server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## Frontend Setup (Client)

The frontend is a Next.js application with React and TypeScript.

### Technologies Used
- **Next.js 15** - React framework
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Zod** - Schema validation

### Installation & Setup

1. Navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the Frontend

#### Development Mode
```bash
npm run dev
# or
yarn dev
```

#### Production Build
```bash
npm run build
# or
yarn build
```

#### Start Production Server
```bash
npm start
# or
yarn start
```

#### Linting
```bash
npm run lint
# or
yarn lint
```

The frontend application will start on `http://localhost:3000`.

## Running the Complete Project

1. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

2. **Start the Backend** (in one terminal):
   ```bash
   cd server
   npm run dev
   ```

3. **Start the Frontend** (in another terminal):
   ```bash
   cd client
   npm run dev
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## API Endpoints

The backend provides a WooCommerce API. You can test the endpoints using the `request.rest` file in the server directory or tools like Postman.

## Development Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

### Backend (.env)
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/matat-assessment
NODE_ENV=development
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```
