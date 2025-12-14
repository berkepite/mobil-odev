import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('timer.db');

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

        // Migration: Add category column if it doesn't exist
        try {
            db.execSync('ALTER TABLE timer_history ADD COLUMN category TEXT');
            console.log('Added category column to timer_history');
        } catch (error) {
            // Column likely already exists, ignore
        }

        // Migration: Add distractions column if it doesn't exist
        try {
            db.execSync('ALTER TABLE timer_history ADD COLUMN distractions INTEGER DEFAULT 0');
            console.log('Added distractions column to timer_history');
        } catch (error) {
            // Column likely already exists, ignore
        }

        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

export const addTimerRecord = (duration: number, category: string, distractions: number) => {
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

        // Clear existing data first? Maybe optional, but user asked to add.
        // Let's add without clearing to preserve existing if any, or maybe clearing is safer for stress testing.
        // I will just ADD.

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
