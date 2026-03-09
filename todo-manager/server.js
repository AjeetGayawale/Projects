const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

let todos = [
    { id: 1, text: 'Learn Node.js', description: 'Understand Express and APIs', completed: false },
    { id: 2, text: 'Experience the new UI', description: 'Interact with the animated background', completed: true }
];
let currentId = 3;

// API Routes
app.get('/api/todos', (req, res) => {
    res.json(todos);
});

app.post('/api/todos', (req, res) => {
    const { text, description } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const newTodo = { id: currentId++, text, description: description || '', completed: false };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const todo = todos.find(t => t.id === id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });

    if (req.body.text !== undefined) todo.text = req.body.text;
    if (req.body.description !== undefined) todo.description = req.body.description;
    if (req.body.completed !== undefined) todo.completed = req.body.completed;

    res.json(todo);
});

app.delete('/api/todos/:id', (req, res) => {
    const id = parseInt(req.params.id);
    todos = todos.filter(t => t.id !== id);
    res.status(204).send();
});

// Only listen if run directly (local development)
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

// Export for Vercel serverless function deployment
module.exports = app;
