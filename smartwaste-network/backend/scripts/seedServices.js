// scripts/seedServices.js
const sequelize = require('../config/database');
require('../models/Service');
const Service = require('../models/Service');

(async () => {
  try {
    await sequelize.sync();
    const items = [
      {
        title: 'Post Your Waste',
        short: 'Industries can list available waste materials.',
        long: 'Industries can list available waste materials like metal scraps, used oils, packaging, and more for others to reuse.',
        iconUrl: '/uploads/post-waste.png',
        order: 1
      },
      {
        title: 'Request Materials',
        short: 'Search and request specific waste materials you need.',
        long: 'Search and request specific waste materials you need for your manufacturing process.',
        iconUrl: '/uploads/request-materials.png',
        order: 2
      },
      {
        title: 'Map-Based Discovery',
        short: 'Find available materials nearby.',
        long: 'Find available materials nearby using our interactive map interface.',
        iconUrl: '/uploads/map-discovery.png',
        order: 3
      },
      {
        title: 'Live Waste Statistics',
        short: 'Track total waste reused and your environmental impact.',
        long: 'Track total waste reused and your environmental impact in real-time using our analytics dashboard.',
        iconUrl: '/uploads/live-stats.png',
        order: 4
      }
    ];

    for (const it of items) {
      await Service.upsert(it);
    }
    console.log('? Seeded services');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
