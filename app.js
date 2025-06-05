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
        this.currentFilter = 'all';
        this.initEventListeners();
        this.renderTasks();
    }

    initEventListeners() {
        document.getElementById('addTask').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', () => this.filterTasks(button.dataset.filter));
        });
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

    deleteTask(taskId) {
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        this.saveTasks();
        this.renderTasks();
    }

    filterTasks(filterType) {
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.classList.remove('active');
            if (button.dataset.filter === filterType) {
                button.classList.add('active');
            }
        });
        this.currentFilter = filterType;
        this.renderTasks();
    }

    saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        tasksList.innerHTML = '';

        const filteredTasks = this.tasks.filter(this.filters[this.currentFilter]);

        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = task.completed;
            checkbox.addEventListener('change', () => this.toggleTask(task.id));

            const span = document.createElement('span');
            span.className = 'task-text';
            span.textContent = task.text;

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'delete-btn';
            deleteBtn.textContent = 'Eliminar';
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(span);
            li.appendChild(deleteBtn);

            tasksList.appendChild(li);
        });
    }
}

// Inicializar la aplicación
new TaskManager();
