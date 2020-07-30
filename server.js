const fs = require('fs');
const path = require('path');
express = require('express')
const app = express();
const { notes } = require('./data/notes.json');
const PORT = process.env.PORT || 3001;
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

function filterByQuery(query, notesArray) {
    let filteredResults = notesArray;
    if (query.name) {
      filteredResults = filteredResults.filter(note => note.name === query.name);
    }
    if (query.content) {
      filteredResults = filteredResults.filter(note => note.content === query.content);
    }
    return filteredResults;
}

function findById(id, notesArray) {
    const result = notesArray.filter(note => note.id === id)[0];
    return result;
}

function createNewNote(body, notesArray) {
    const note = body;
    notesArray.push(note);
    fs.writeFileSync(
        path.join(__dirname, './data/notes.json'),
        JSON.stringify({ notes: notesArray }, null, 2)
    );
    return note;
}

function validateNote(note) {
    if (!note.name || typeof note.name !== 'string') {
      return false;
    }
    if (!note.content || typeof note.content !== 'string') {
      return false;
    }
    return true;
  }

app.get('/api/notes', (req,res) => {
    let results = notes;
    if (req.query) {
        results = filterByQuery(req.query, results);
    }
    res.json(results);
});

app.get('/api/notes/:id', (req, res) => {
    const result = findById(req.params.id, notes);
    if (result) {
        res.json(result);
    } else {
        res.send(404);
    }
})

app.post('/api/notes', (req, res) => {
    req.body.id = notes.length.toString();
    
    if (!validateNote(req.body)) {
        res.status(400).send('The note is not properly formatted.');
      } else {
        const note = createNewNote(req.body, notes);
        res.json(note);
      }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, './public/notes.html'));
});

app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
})