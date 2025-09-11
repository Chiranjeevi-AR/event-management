const fs = require('fs');
const path = require('path');

console.log('Debugging seed data parsing...');

const seedPath = path.join(__dirname, 'sql', 'seed.sql');
const seedData = fs.readFileSync(seedPath, 'utf8');

console.log('Raw seed data:');
console.log(seedData);
console.log('\n--- Splitting by semicolon ---');

const statements = seedData.split(';').filter(stmt => stmt.trim().length > 0);

console.log(`Found ${statements.length} statements after splitting:`);

statements.forEach((stmt, index) => {
    console.log(`\n--- Statement ${index + 1} ---`);
    console.log(`Trimmed: "${stmt.trim()}"`);
    console.log(`Starts with INSERT: ${stmt.trim().startsWith('INSERT')}`);
});

console.log('\n--- Filtering for INSERT statements ---');

const insertStatements = statements.filter(stmt => stmt.trim().startsWith('INSERT'));

console.log(`Found ${insertStatements.length} INSERT statements:`);

insertStatements.forEach((stmt, index) => {
    console.log(`\n--- INSERT Statement ${index + 1} ---`);
    console.log(stmt.trim());
});
