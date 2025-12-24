const User = require('../models/User');
const { importData } = require('../seeder');

const seedData = async () => {
    try {
        const count = await User.countDocuments();
        if (count > 0) {
            console.log('Database already has data. Skipping auto-seed.');
            return;
        }

        console.log('No data found. Starting automated seeder...');
        await importData();

    } catch (error) {
        console.error('Auto-Seeding Failed:', error);
    }
};

module.exports = seedData;
