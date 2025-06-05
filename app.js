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
        const theme = localStorage.getItem('theme');
        const themeBtn = document.getElementById('themeToggle');
        if (theme === 'dark') {
            document.body.classList.add('dark');
            themeBtn.textContent = 'Tema claro';
        } else {
            themeBtn.textContent = 'Tema oscuro';
        }
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

        document.getElementById('themeToggle').addEventListener('click', () => {
            document.body.classList.toggle('dark');
            const mode = document.body.classList.contains('dark') ? 'dark' : 'light';
            localStorage.setItem('theme', mode);
            const btn = document.getElementById('themeToggle');
            btn.textContent = mode === 'dark' ? 'Tema claro' : 'Tema oscuro';
        });
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        if (taskText && !this.tasks.some(t => t.text.toLowerCase() === taskText.toLowerCase())) {
            this.tasks.push({
                id: Date.now(),
                text: taskText,
                completed: false,
                createdAt: new Date()
            });
            this.saveTasks();
            this.renderTasks();
            taskInput.value = '';
        } else if (taskText) {
            alert('La tarea ya existe');
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

    deleteTask(taskId) {
        if (confirm('¿Eliminar esta tarea?')) {
            const index = this.tasks.findIndex(task => task.id === taskId);
            if (index > -1) {
                this.tasks.splice(index, 1);
                this.saveTasks();
                const li = document.querySelector(`li[data-id="${taskId}"]`);
                if (li) {
                    li.classList.add('fade-out');
                    li.addEventListener('animationend', () => this.renderTasks());
                } else {
                    this.renderTasks();
                }
            }
        }
    }

    filterTasks(filterType) {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.classList.remove('active');
            if (button.dataset.filter === filterType) {
                button.classList.add('active');
            }
        });
        this.currentFilter = filterType;
        localStorage.setItem('filter', filterType);
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';
        const emptyMsg = document.getElementById('emptyMessage');

        const filteredTasks = this.tasks.filter(this.filters[this.currentFilter]);

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;

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
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            tasksList.appendChild(li);
        });

        if (filteredTasks.length === 0) {
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
        }

        document.getElementById('totalCount').textContent = this.tasks.length;
        document.getElementById('completedCount').textContent = this.tasks.filter(t => t.completed).length;
    }

    editTask(id, span) {
        const input = document.createElement('input');
        input.type = 'text';
        input.value = span.textContent;
        input.className = 'edit-input';
        span.replaceWith(input);
        input.focus();

        const save = () => {
            const text = input.value.trim();
            if (!text) { input.replaceWith(span); return; }
            if (this.tasks.some(t => t.text.toLowerCase() === text.toLowerCase() && t.id !== id)) {
                alert('La tarea ya existe');
                input.focus();
                return;
            }
            const task = this.tasks.find(t => t.id === id);
            if (task) {
                task.text = text;
                this.saveTasks();
                this.renderTasks();
            }
        };

        input.addEventListener('blur', save);
        input.addEventListener('keypress', e => {
            if (e.key === 'Enter') save();
        });
    }
}

// Inicializar la aplicación
new TaskManager();
