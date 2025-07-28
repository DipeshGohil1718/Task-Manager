document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    let tasks = [];
    let currentFilter = 'all';
    let searchQuery = '';

    // --- DOM ELEMENT REFERENCES ---
    const taskListContainer = document.getElementById('task-list');
    const newTaskTitleInput = document.getElementById('new-task-title');
    const newTaskPrioritySelect = document.getElementById('new-task-priority');
    const addTaskBtn = document.getElementById('add-task-btn');
    const searchInput = document.getElementById('search-input');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const statsTotal = document.getElementById('stats-total');
    const statsActive = document.getElementById('stats-active');
    const statsCompleted = document.getElementById('stats-completed');


    // --- CORE FUNCTIONS ---

    // Function to render tasks to the DOM
    const renderTasks = () => {
        taskListContainer.innerHTML = ''; // Clear existing tasks

        const filteredTasks = tasks
            .filter(task => {
                const matchesFilter = currentFilter === 'all' ||
                    (currentFilter === 'active' && !task.completed) ||
                    (currentFilter === 'completed' && task.completed);
                
                const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

                return matchesFilter && matchesSearch;
            });

        if (filteredTasks.length === 0) {
            taskListContainer.innerHTML = '<p style="text-align: center; color: #666;">No tasks match your criteria.</p>';
        } else {
            filteredTasks.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `task-item ${task.completed ? 'completed' : ''}`;
                taskElement.dataset.id = task.id;

                taskElement.innerHTML = `
                    <input type="checkbox" class="task-toggle" ${task.completed ? 'checked' : ''}>
                    <div class="task-item-details">
                        <p class="task-title">${task.title}</p>
                        <span class="priority-badge priority-${task.priority}">${task.priority}</span>
                    </div>
                    <div class="task-actions">
                        <button class="delete-btn">Delete</button>
                    </div>
                `;
                taskListContainer.appendChild(taskElement);
            });
        }
        updateStats();
        saveTasks();
    };
    
    // Function to add a new task
    const addTask = () => {
        const title = newTaskTitleInput.value.trim();
        if (title === '') {
            alert('Task title cannot be empty!');
            return;
        }

        const newTask = {
            id: crypto.randomUUID(),
            title: title,
            priority: newTaskPrioritySelect.value,
            completed: false,
            createdAt: new Date()
        };

        tasks.unshift(newTask); // Add to the beginning of the array
        newTaskTitleInput.value = '';
        renderTasks();
    };

    // Function to toggle a task's completion status
    const toggleTask = (id) => {
        tasks = tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        renderTasks();
    };

    // Function to delete a task
    const deleteTask = (id) => {
        tasks = tasks.filter(task => task.id !== id);
        renderTasks();
    };

    // Function to update the stats cards
    const updateStats = () => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const active = total - completed;

        statsTotal.textContent = total;
        statsActive.textContent = active;
        statsCompleted.textContent = completed;
    };

    // --- LOCALSTORAGE PERSISTENCE ---
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    const loadTasks = () => {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks).map(task => ({
                ...task,
                createdAt: new Date(task.createdAt)
            }));
        }
        renderTasks();
    };

    // --- EVENT LISTENERS ---

    // Add Task Button
    addTaskBtn.addEventListener('click', addTask);
    
    // Allow adding task by pressing Enter
    newTaskTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Handle clicks on the task list (for toggle and delete)
    taskListContainer.addEventListener('click', (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        if (!taskItem) return;
        const taskId = taskItem.dataset.id;
        
        if (target.matches('.task-toggle')) {
            toggleTask(taskId);
        } else if (target.matches('.delete-btn')) {
            deleteTask(taskId);
        }
    });

    // Search Input
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderTasks();
    });

    // Filter Buttons
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active class
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update filter state and re-render
            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    // --- INITIAL LOAD ---
    loadTasks();
});