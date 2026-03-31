# KChat

KChat is a full-stack real-time messaging application. It features a high-performance **Kotlin** backend that serves a modern **React** frontend as static content.

## 🚀 Tech Stack

### Backend
- **Kotlin**: Type-safe, concise language targeting the JVM.
- **Real-time**: [WebSockets/gRPC] for low-latency message delivery.

### Frontend
- **React 18.3.1**: Leveraging the latest features like Concurrent Mode and improved Suspense.
- **TypeScript**: Providing static typing for a robust and maintainable codebase.
- **CSSType**: Ensuring strict and autocompleted CSS typings for all component styles.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Version 16 or higher recommended)
- npm or yarn
- [JDK 17+](https://adoptium.net/) (for the Kotlin backend)

### Installation

1.  Clone the repository.
2.  Install frontend dependencies (required for the initial build):
    ```bash
    cd frontend && npm install
    ```

### Running the Application

To build the frontend and start the server in one command:
```bash
./gradlew run
```
The application will be available at [http://localhost:8080](http://localhost:8080).

## 📂 Project Structure

- `src/`: Contains all React components, hooks, and application logic.
- `public/`: Static assets and the entry HTML file.

## 🧪 Testing

Run the test suite using:
```bash
npm test
```

## 📦 Deployment

To create an optimized production build:
```bash
npm run build
```