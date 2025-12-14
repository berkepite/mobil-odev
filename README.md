# Project Overview

This document provides a technical overview of the **Timer & Focus App**. It details the application architecture, key components, database services, and important implementation details.

## 📱 Screens

The application is built using **Expo Router** with a file-based routing system. The main interface is a Tab Navigator.

### 1. Home Screen (`app/(tabs)/index.tsx`)
- **Purpose**: The main landing page for the user.
- **Functionality**:
    - Acts as a container for the `TimerButton` component.
    - Provides the primary interface for starting focus sessions.

### 2. Reports Dashboard (`app/(tabs)/reports.tsx`)
- **Purpose**: A comprehensive dashboard for visualizing user productivity.
- **Functionality**:
    - **Statistics**: Displays "Today's Focus", "All Time Focus", "Today's Distractions", and "Total Distractions".
    - **Charts**:
        - **Bar Chart**: Shows focus duration for the last 7 days.
        - **Pie Chart**: Visualizes the distribution of time spent across different categories (e.g., Coding, Study).
    - **Data Management**: Includes options to **Clear History** (wipe DB) and **Add Sample Data** (seed DB).
- **Key Hook**: Uses `useFocusEffect` to reload data every time the user navigates back to this tab.

---

## 🧩 Components

Reusable UI building blocks located in the `components/` directory.

### 1. `TimerButton.tsx`
- **Role**: The core business logic component.
- **Features**:
    - **Countdown Logic**: Manages the 25-minute default timer.
    - **State Management**: Handles Active, Paused, and Finished states.
    - **Controls**: Start, Pause, Continue, Reset, and Finish buttons.
    - **Persistence**: automatically saves the session to SQLite upon completion.
    - **Background Handling**: listens to app background state to auto-pause.

### 2. `CategoryPicker.tsx`
- **Role**: A UI component for category selection.
- **Features**:
    - Displays categories as a wrapped group of selectable chips.
    - Supports: "Ders Çalışma" (Study), "Kodlama" (Coding), "Proje" (Project), "Kitap Okuma" (Reading).

### 3. `SessionSummaryModal.tsx`
- **Role**: A feedback modal shown after a session ends.
- **Features**:
    - Displays the final duration, selected category, and total distraction count.

---

## 🛠 Services

### `Database.ts` (`services/Database.ts`)
- **Technology**: `expo-sqlite`
- **Schema**:
    ```sql
    CREATE TABLE timer_history (
        id INTEGER PRIMARY KEY,
        duration INTEGER,      -- Duration in seconds
        timestamp INTEGER,     -- Unix timestamp
        category TEXT,         -- Selected category
        distractions INTEGER   -- Count of pauses
    )
    ```
- **Key Functions**:
    - `initDatabase()`: Creates tables and handles **schema migrations** (e.g., adding columns if they don't exist).
    - `addTimerRecord(...)`: Inserts a new completed session.
    - `getTimerRecords()`: Fetches all history sorted by date.
    - `seedDatabase()`: Generates dummy data for testing charts.

---

## ⚡ Key Hooks & Concepts

### 1. `AppState` & Auto-Pause
In `TimerButton.tsx`, we monitor if the user leaves the app (backgrounds it) while the timer is running.
- **Challenge**: Event listeners in `useEffect` often capture "stale" state from the initial render.
- **Solution**: We use `useRef` to track `isActive` and `isPaused` states. This allows the event listener to access the *current* values without re-binding the listener on every render.

```typescript
// TimerButton.tsx
const isActiveRef = useRef(isActive);

// Update ref whenever state changes
useEffect(() => {
    isActiveRef.current = isActive;
}, [isActive]);

// Listener checks the ref
AppState.addEventListener('change', nextState => {
    if (nextState.match(/inactive|background/) && isActiveRef.current) {
         handlePause(); // Auto-pause
    }
});
```

### 2. `useFocusEffect` (Expo Router)
Used in `reports.tsx`.
- **Why**: Standard `useEffect` only runs when the component mounts. In a Tab navigator, tabs remain mounted even when hidden.
- **Behavior**: `useFocusEffect` runs the callback *every time the screen comes into focus*, ensuring the charts always show the latest data from the database.

---

## 🏗 Directory Structure

```text
/app
  /(tabs)
    index.tsx        # Home Screen
    reports.tsx      # Dashboard Screen
    _layout.tsx      # Tab Navigator Configuration
/components
  TimerButton.tsx         # Main Timer Logic
  CategoryPicker.tsx      # Selection UI
  SessionSummaryModal.tsx # End-of-session Feedback
/services
  Database.ts        # SQLite Wrapper
/assets              # Images and Fonts
```
