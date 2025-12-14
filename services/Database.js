import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('timer.db');

/**
 * Initializes the SQLite database.
 * 
 * Schema:
 * - timer_history:
 *   - id: INTEGER PRIMARY KEY
 *   - duration: INTEGER (Session duration in seconds)
 *   - timestamp: INTEGER (Unix timestamp of session end)
 *   - category: TEXT (e.g., 'Ders Çalışma', 'Kodlama')
 *   - distractions: INTEGER (Number of pauses/distractions)
 */
export const initDatabase = () => {
    try {
        db.execSync(`
        CREATE TABLE IF NOT EXISTS timer_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        duration INTEGER NOT NULL,
        timestamp INTEGER NOT NULL,
        category TEXT,
        distractions INTEGER DEFAULT 0
        );
        `);

        // Ensure 'category' column exists (for older app versions)
        try {
            db.execSync('ALTER TABLE timer_history ADD COLUMN category TEXT');
        } catch (error) {
            // Column already exists
        }

        // Ensure 'distractions' column exists (for older app versions)
        try {
            db.execSync('ALTER TABLE timer_history ADD COLUMN distractions INTEGER DEFAULT 0');
        } catch (error) {
            // Column already exists
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

export const addTimerRecord = (duration, category, distractions) => {
    try {
        const timestamp = Date.now();
        db.runSync(
            'INSERT INTO timer_history (duration, timestamp, category, distractions) VALUES (?, ?, ?, ?)',
            [duration, timestamp, category, distractions]
        );
        console.log('Timer record added:', { duration, timestamp, category, distractions });
    } catch (error) {
        console.error('Error adding timer record:', error);
    }
};

export const getTimerRecords = () => {
    try {
        const allRows = db.getAllSync('SELECT * FROM timer_history ORDER BY timestamp DESC');
        return allRows;
    } catch (error) {
        console.error('Error fetching timer records:', error);
        return [];
    }
};

export const clearTimerHistory = () => {
    try {
        db.runSync('DELETE FROM timer_history');
        console.log('Timer history cleared');
    } catch (error) {
        console.error('Error clearing timer history:', error);
    }
};

export const seedDatabase = () => {
    try {
        const CATEGORIES = ['Ders Çalışma', 'Kodlama', 'Proje', 'Kitap Okuma'];
        const now = Date.now();
        const DAY_MS = 24 * 60 * 60 * 1000;

        // Generate 30 random records distributed over the last 7 days

        for (let i = 0; i < 30; i++) { // 30 records
            const daysAgo = Math.floor(Math.random() * 7); // Last 7 days
            const timestamp = now - (daysAgo * DAY_MS) - Math.floor(Math.random() * DAY_MS); // Random time within that day

            const duration = Math.floor(Math.random() * 60 * 60); // 0-60 mins
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const distractions = Math.floor(Math.random() * 5);

            db.runSync(
                'INSERT INTO timer_history (duration, timestamp, category, distractions) VALUES (?, ?, ?, ?)',
                [duration, timestamp, category, distractions]
            );
        }
        console.log('Database seeded with dummy data');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
};
