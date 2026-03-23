const express = require('express');
const path = require('path');
const fs = require('fs');
const { getPeopleData } = require('./helpers');

const app = express();
const PORT = process.env.PORT || 3000;

const personTemplate = fs.readFileSync(path.join(__dirname, 'person.html'), 'utf8');
const notFoundTemplate = fs.readFileSync(path.join(__dirname, 'not_found.html'), 'utf8');

// Serve static directory 'docs' from the parent directory
app.use(express.static(path.join(__dirname, '../docs')));

app.get('/people', (req, res) => {
  getPeopleData((err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to read database' });
    }
    
    if (req.query.firstName) {
      const person = results.find(p => p.firstName && p.firstName.toLowerCase() === req.query.firstName.toLowerCase());
      if (person) {
        const html = personTemplate
          .replace(/{{firstName}}/g, person.firstName)
          .replace(/{{lastName}}/g, person.lastName)
          .replace(/{{age}}/g, person.age);
        return res.send(html);
      } else {
        return res.status(404).send(notFoundTemplate);
      }
    }
    
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
