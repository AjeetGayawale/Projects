document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoDesc = document.getElementById('todo-desc');
    const todoList = document.getElementById('todo-list');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let todos = [];
    let currentFilter = 'all';

    // Initialize
    fetchTodos();

    // Event Listeners
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        const desc = todoDesc ? todoDesc.value.trim() : '';
        if (text) {
            addTodo(text, desc);
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTodos();
        });
    });

    // API Calls
    async function fetchTodos() {
        try {
            const res = await fetch('/api/todos');
            todos = await res.json();
            renderTodos();
        } catch (error) {
            console.error('Error fetching todos:', error);
        }
    }

    async function addTodo(text, description) {
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, description })
            });
            const newTodo = await res.json();
            todos.push(newTodo);
            todoInput.value = '';
            if (todoDesc) todoDesc.value = '';
            renderTodos();
        } catch (error) {
            console.error('Error adding todo:', error);
        }
    }

    async function toggleTodo(id, completed) {
        try {
            await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed })
            });
            const todo = todos.find(t => t.id === id);
            if (todo) {
                todo.completed = completed;
                renderTodos();
            }
        } catch (error) {
            console.error('Error toggling todo:', error);
        }
    }

    async function deleteTodo(id) {
        try {
            // Optimistic UI update or animation could go here
            await fetch(`/api/todos/${id}`, {
                method: 'DELETE'
            });
            todos = todos.filter(t => t.id !== id);
            renderTodos();
        } catch (error) {
            console.error('Error deleting todo:', error);
        }
    }

    // Rendering
    function renderTodos() {
        updateStats();
        todoList.innerHTML = '';

        let filteredTodos = todos;
        if (currentFilter === 'active') {
            filteredTodos = todos.filter(t => !t.completed);
        } else if (currentFilter === 'completed') {
            filteredTodos = todos.filter(t => t.completed);
        }

        if (filteredTodos.length === 0) {
            todoList.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="inbox"></i>
                    <p>No tasks found.</p>
                </div>
            `;
            // Re-initialize lucide icons for dynamically added ones
            if (window.lucide) {
                lucide.createIcons();
            }
            return;
        }

        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <div class="checkbox-wrapper">
                    <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
                    <div class="checkbox-custom"></div>
                </div>
                <div class="todo-content">
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    ${todo.description ? `<span class="todo-desc">${escapeHtml(todo.description)}</span>` : ''}
                </div>
                <button class="delete-btn" aria-label="Delete todo">
                    <i data-lucide="trash-2"></i>
                </button>
            `;

            // Event listener for checkbox
            const checkbox = li.querySelector('.todo-checkbox');
            checkbox.addEventListener('change', (e) => toggleTodo(todo.id, e.target.checked));

            // Event listener for delete button
            const deleteBtn = li.querySelector('.delete-btn');
            deleteBtn.addEventListener('click', () => {
                // Add a small fade out animation before deleting
                li.style.animation = 'slideIn 0.3s ease-in reverse forwards';
                setTimeout(() => deleteTodo(todo.id), 250);
            });

            todoList.appendChild(li);
        });

        // Re-initialize lucide icons for newly added buttons
        if (window.lucide) {
            lucide.createIcons();
        }
    }

    // Utility
    function escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // Initialization removed

    // Stats calculation
    function updateStats() {
        const total = todos.length;
        const completed = todos.filter(t => t.completed).length;
        const remaining = total - completed;

        const statTotal = document.getElementById('stat-total');
        const statRemaining = document.getElementById('stat-remaining');
        const statCompleted = document.getElementById('stat-completed');
        const progressBar = document.getElementById('progress-bar');

        if (statTotal) statTotal.textContent = total;
        if (statRemaining) statRemaining.textContent = remaining;
        if (statCompleted) statCompleted.textContent = completed;

        if (progressBar) {
            const percentage = total === 0 ? 0 : (completed / total) * 100;
            progressBar.style.width = `${percentage}%`;
        }
    }
});
