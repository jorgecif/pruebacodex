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
            li.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${task.text}</span>
                <button class="delete-btn">Eliminar</button>
            `;

            li.querySelector('.task-checkbox').addEventListener('change', () => this.toggleTask(task.id));
            li.querySelector('.delete-btn').addEventListener('click', () => this.deleteTask(task.id));

            tasksList.appendChild(li);
        });
    }
}

// Inicializar la aplicación
new TaskManager();
