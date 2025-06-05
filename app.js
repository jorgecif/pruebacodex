class TaskManager {
    constructor() {
        try {
            const saved = localStorage.getItem('tasks');
            this.tasks = saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Error loading tasks from localStorage', e);
            this.tasks = [];
            localStorage.removeItem('tasks');
        }
        this.filters = {
            all: () => true,
            pending: (task) => !task.completed,
            completed: (task) => task.completed
        };
        this.currentFilter = localStorage.getItem('filter') || 'all';
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark');
        }
        const toggleBtn = document.getElementById('toggleTheme');
        toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
        this.initEventListeners();
        this.filterTasks(this.currentFilter);
    }

    initEventListeners() {
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => this.filterTasks(button.dataset.filter));
        });

        document.getElementById('toggleTheme').addEventListener('click', () => this.toggleTheme());
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (taskText) {
            this.tasks.push({
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date()
            });
            this.saveTasks();
            this.renderTasks();
            taskInput.value = '';
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    editTask(taskId, span) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        input.className = 'task-edit';
        span.replaceWith(input);
        input.focus();

        const finish = () => {
            const newText = input.value.trim();
            if (newText) {
                const task = this.tasks.find(t => t.id === taskId);
                task.text = newText;
                this.saveTasks();
            }
            input.replaceWith(span);
            span.textContent = newText || span.textContent;
        };

        input.addEventListener('blur', finish);
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') input.blur();
        });
    }

    deleteTask(taskId, li) {
        if (!confirm('¿Deseas eliminar esta tarea?')) return;
        li.classList.add('fade-out');
        li.addEventListener('animationend', () => {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
        }, { once: true });
    }

    toggleTheme() {
        document.body.classList.toggle('dark');
        const theme = document.body.classList.contains('dark') ? 'dark' : 'light';
        localStorage.setItem('theme', theme);
        const toggleBtn = document.getElementById('toggleTheme');
        toggleBtn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
    }

    filterTasks(filterType) {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.classList.remove('active');
            if (button.dataset.filter === filterType) {
                button.classList.add('active');
            }
        });
        this.currentFilter = filterType;
        localStorage.setItem('filter', this.currentFilter);
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        const filteredTasks = this.tasks.filter(this.filters[this.currentFilter]);

        document.getElementById('noTasks').classList.toggle('hidden', filteredTasks.length !== 0);

        document.getElementById('stats').textContent = `Total: ${this.tasks.length} - Completadas: ${this.tasks.filter(t => t.completed).length}`;

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''} fade-in`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTask(task.id));

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;
            span.addEventListener('dblclick', () => this.editTask(task.id, span));

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id, li));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            tasksList.appendChild(li);
        });
    }
}

// Inicializar la aplicación
new TaskManager();
