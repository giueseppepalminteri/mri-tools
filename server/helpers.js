const fs = require('fs');
const path = require('path');

function getPeopleData(callback) {
  fs.readFile(path.join(__dirname, 'database.csv'), 'utf8', (err, data) => {
    if (err) {
      return callback(err);
    }
    const lines = data.trim().split('\n');
    if (lines.length === 0) return callback(null, []);
    
    const headers = lines[0].split(',').map(h => h.trim());
    const results = lines.slice(1).filter(line => line.trim() !== '').map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, index) => {
        const val = values[index] ? values[index].trim() : '';
        obj[header] = header === 'age' && val !== '' ? Number(val) : val;
      });
      return obj;
    });
    
    callback(null, results);
  });
}

module.exports = {
  getPeopleData
};
