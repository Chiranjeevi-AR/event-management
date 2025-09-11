const database = require('./utils/database');

async function testEventCreation() {
    try {
        console.log('Testing database connection and event creation...');
        
        // Connect to database
        await database.connect();
        console.log('Connected to database successfully');
        
        // Test if colleges exist
        const colleges = await database.all('SELECT * FROM colleges');
        console.log('Colleges found:', colleges);
        
        if (colleges.length === 0) {
            console.log('No colleges found, initializing database...');
            await database.initializeSchema();
            await database.seedData();
            console.log('Database initialized and seeded');
            
            // Check colleges again after seeding
            const collegesAfterSeed = await database.all('SELECT * FROM colleges');
            console.log('Colleges after seeding:', collegesAfterSeed);
        }
        
        // Test event creation
        const testEvent = {
            title: 'Test Event',
            description: 'Test Description',
            event_type: 'Workshop',
            date: '2024-12-15',
            start_time: '10:00',
            end_time: '16:00',
            venue: 'Test Venue',
            max_capacity: 50,
            college_id: 1,
            created_by: 'Admin Test'
        };
        
        console.log('Attempting to create event:', testEvent);
        
        const result = await database.run(
            `INSERT INTO events (title, description, event_type, date, start_time, end_time, venue, max_capacity, college_id, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                testEvent.title,
                testEvent.description,
                testEvent.event_type,
                testEvent.date,
                testEvent.start_time,
                testEvent.end_time,
                testEvent.venue,
                testEvent.max_capacity,
                testEvent.college_id,
                testEvent.created_by
            ]
        );
        
        console.log('Event creation result:', result);
        
        // Fetch the created event
        const event = await database.get(`SELECT * FROM events WHERE id = ?`, [result.id]);
        console.log('Created event:', event);
        
        // List all events
        const allEvents = await database.all('SELECT * FROM events');
        console.log('All events in database:', allEvents);
        
        database.close();
        console.log('Test completed successfully!');
        
    } catch (error) {
        console.error('Test failed with error:', error);
        database.close();
    }
}

testEventCreation();
