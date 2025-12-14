# Deep Dive: Code interactions and Data Flow

This document explains the technical relationships between the application's Screens, Components, and Hooks, illustrating how data and events flow through the system.

## 1. Flow: The Timer Lifecycle
The core feature of the app is the relationship between the **Home Screen**, **Timer Component**, and **Database**.

### Data & Event Flow
1.  **User Interaction**: The user interacts with the **Home Screen** (`app/(tabs)/index.tsx`). This screen simply renders the `TimerButton` component.
2.  **State Management**: `TimerButton` (`components/TimerButton.tsx`) manages all local state:
    *   `timer`: Current countdown value.
    *   `isActive`: Whether the timer is running.
    *   `category`: The currently selected task type (from `CategoryPicker`).
3.  **Background Handling**:
    *   When the user **backgrounds the app** (e.g., switches to another app), the `AppState` listener triggers.
    *   It checks `isActive` via a `useRef` (to avoid stale state) and automatically pauses the timer if it's running.
    *   This triggers a state update in `TimerButton` to mark it as `isPaused`.
4.  **Completion & Storage**:
    *   When the timer ends or the user clicks "Finish", `TimerButton` calls `Database.ts`.
    *   It runs an `INSERT` command to save `duration`, `timestamp`, `category`, and `distractions` into the SQLite database.
    *   Finally, the `SessionSummaryModal` is displayed to the user.

### Key Relationships
1.  **Home Screen -> TimerButton**: The Home screen is a "dumb" container. It simply mounts `TimerButton`, which contains 100% of the state logic.
2.  **TimerButton -> Database**: When `handleFinish()` is called, `TimerButton` directly imports `addTimerRecord` from the service layer to persist data.
3.  **TimerButton -> AppState**: This is a critical hook relationship. The component subscribes to the global `AppState` event.
    *   **The Problem**: Closures. If we just used `isActive` state inside the listener, the listener would remember the value from when it was created (false).
    *   **The Fix**: `useRef`. We sync state to a ref (`isActiveRef.current = isActive`). The listener reads the **ref**, which always points to the live value.

## 2. Flow: The Reports Dashboard
The reports screen relies on "pulling" data rather than real-time subscriptions.

### Data & Event Flow
1.  **User Navigation**: The user taps the "Reports" tab.
2.  **Triggering Fetch**:
    *   The `ReportsScreen` (`app/(tabs)/reports.tsx`) component mounts (or becomes focused).
    *   The `useFocusEffect` hook fires. This is crucial because it runs *every time* the tab is viewed, unlike `useEffect` which only runs on mount.
3.  **Loading Data**:
    *   The hook calls `loadData()`.
    *   `loadData()` calls `getTimerRecords()` from `Database.ts`.
    *   `Database.ts` executes a `SELECT *` query against the SQLite database.
4.  **Processing & Rendering**:
    *   The raw rows are returned to the component.
    *   `calculateStats()` iterates through the rows to calculate totals (Today, All Time) and chart data strings (Last 7 Days).
    *   State is updated (`setStats`, `setBarData`), forcing a re-render to display the charts.

### Key Relationships
1.  **Navigation -> ReportsScreen**: We use `useFocusEffect` (from `expo-router`) instead of `useEffect`.
    *   *Why?* If you start a timer on Home, finish it, and tap "Reports", the Reports component is *already mounted* (just hidden). `useEffect` wouldn't run again. `useFocusEffect` guarantees the data refresh happens every time the tab is selected.
2.  **ReportsScreen -> Database**: The screen acts as a "view-controller". It fetches raw rows from `Database.ts` and transforms them locally into chart-friendly formats (grouping by day, grouping by category).

## 3. Hook Deep Dive

### `useCallback` inside `reports.tsx`
```typescript
const loadData = useCallback(() => {
    const records = getTimerRecords();
    calculateStats(records);
}, []);
```
**Relation**: This wraps the data fetching logic. We pass this stable function reference to `useFocusEffect` to prevent infinite re-render loops or unnecessary effect firing.

### `useRef` inside `TimerButton.tsx`
```typescript
const appState = useRef(AppState.currentState);
const isActiveRef = useRef(isActive);
```
**Relation**: These bridges React's declarative rendering cycle with React Native's imperative Event system. They allow the imperative `AppState` listener to "peek" into the current declarative state of the React component without being part of the render cycle itself.

---

## 4. Component Hierarchy & Prop Drilling

*   **`TimerButton` (Parent)**
    *   `state: category` -> **`CategoryPicker` (Child)**
        *   *Relation*: Controlled Component. Parent holds state (`category`), Child receives value and setter (`onSelectCategory`).
    *   `state: lastSession` -> **`SessionSummaryModal` (Child)**
        *   *Relation*: Pure display. Child receives data object to display; has no internal state.
