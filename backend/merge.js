const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'src', 'data', 'coaches.json');
const newPath = path.join(__dirname, 'src', 'data', 'new_coaches.json');

let existingCoaches = [];
if (fs.existsSync(dataPath)) {
  const data = fs.readFileSync(dataPath, 'utf8');
  existingCoaches = JSON.parse(data);
}

const newData = JSON.parse(fs.readFileSync(newPath, 'utf8'));
const newCoaches = Array.isArray(newData.coaches) ? newData.coaches : newData;

// Merge and remove duplicates by ID
const map = new Map();
existingCoaches.forEach(c => map.set(c.id, c));
newCoaches.forEach(c => map.set(c.id, c));

const merged = Array.from(map.values());

fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2));
console.log(`Merged! Total coaches is now ${merged.length}`);
