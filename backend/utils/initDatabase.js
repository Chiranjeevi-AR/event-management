const database = require('./database');

async function initializeDatabase() {
    try {
        console.log('Initializing Campus Drive database...');
        
        // Connect to database
        await database.connect();
        
        // Initialize schema
        await database.initializeSchema();
        
        // Check if database already has data
        const hasData = await database.hasData();
        
        if (!hasData) {
            console.log('No existing data found. Seeding database with sample data...');
            await database.seedData();
        } else {
            console.log('Database already contains data. Skipping seed data insertion.');
        }
        
        console.log('Database initialization completed successfully!');
        console.log('Database file created at: campus_drive.db');
        
        // Close connection
        database.close();
        
    } catch (error) {
        console.error('Database initialization failed:', error);
        database.close();
        process.exit(1);
    }
}

// Run initialization if this file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;
