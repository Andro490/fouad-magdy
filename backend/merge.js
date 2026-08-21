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

// Merge and remove duplicates by ID, putting new coaches FIRST!
const map = new Map();
// أولاً: نضع المدربين الجدد ليكونوا في البداية
newCoaches.forEach(c => map.set(c.id, c));
// ثانياً: نضع المدربين القدامى (إذا كان هناك مدرب قديم بنفس الـ ID لن يتم إضافته مرة أخرى)
existingCoaches.forEach(c => {
  if (!map.has(c.id)) {
    map.set(c.id, c);
  }
});

const merged = Array.from(map.values());

fs.writeFileSync(dataPath, JSON.stringify(merged, null, 2));
console.log(`Merged! Total coaches is now ${merged.length}. New coaches are at the top!`);
