(function () {
    'use strict';

    // ===== State =====
    let features = [];
    let editingId = null;
    let draggedFeatureId = null;

    // ===== API Helpers =====
    const API = '/api/features';

    async function apiFetch(url, options = {}) {
        const res = await fetch(url, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        return res.json();
    }

    async function fetchFeatures() {
        features = await apiFetch(API);
        render();
    }

    async function addFeature(title, description) {
        await apiFetch(API, {
            method: 'POST',
            body: JSON.stringify({ title, description })
        });
        await fetchFeatures();
    }

    async function editFeature(id, title, description) {
        await apiFetch(`${API}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ title, description })
        });
        editingId = null;
        await fetchFeatures();
    }

    async function deleteFeature(id) {
        await apiFetch(`${API}/${id}`, { method: 'DELETE' });
        editingId = null;
        await fetchFeatures();
    }

    async function updateStatus(id, status) {
        const feature = features.find(f => f.id === id);
        const wasDone = feature && feature.status === 'done';

        await apiFetch(`${API}/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });

        if (status === 'done' && !wasDone) {
            showCelebration();
        }

        await fetchFeatures();
    }

    // ===== Rendering =====
    function render() {
        renderKanbanBoard();
        renderBacklog();
    }

    function renderKanbanBoard() {
        const kanbanFeatures = features.filter(f => f.status !== 'backlog');
        const emptyEl = document.getElementById('kanban-empty');
        const columnsEl = document.getElementById('kanban-columns');

        if (kanbanFeatures.length === 0) {
            emptyEl.classList.remove('hidden');
            columnsEl.classList.add('hidden');
        } else {
            emptyEl.classList.add('hidden');
            columnsEl.classList.remove('hidden');
        }

        // Render each column
        ['todo', 'inProgress', 'done'].forEach(status => {
            const columnFeatures = features.filter(f => f.status === status);
            const container = document.getElementById(`cards-${status}`);
            const countEl = document.querySelector(`[data-count="${status}"]`);

            if (countEl) countEl.textContent = columnFeatures.length;

            // Build cards HTML
            let html = '';
            if (columnFeatures.length === 0) {
                html = '<div class="column-empty">Drag features here</div>';
            } else {
                columnFeatures.forEach((feature, i) => {
                    html += buildFeatureCard(feature, 'kanban', i);
                });
            }
            container.innerHTML = html;

            // Attach event listeners
            columnFeatures.forEach(feature => {
                attachCardListeners(feature, 'kanban');
            });

            // Setup drag-and-drop targets
            setupDropTarget(container, status);
        });

        // Setup draggable on all kanban cards
        document.querySelectorAll('.kanban-columns .feature-card:not(.editing)').forEach(card => {
            setupDraggable(card);
        });
    }

    function renderBacklog() {
        const backlogFeatures = features.filter(f => f.status === 'backlog');
        const emptyEl = document.getElementById('backlog-empty');
        const listEl = document.getElementById('backlog-list');
        const addForm = document.getElementById('add-form');

        if (backlogFeatures.length === 0 && addForm.classList.contains('hidden')) {
            emptyEl.classList.remove('hidden');
        } else {
            emptyEl.classList.add('hidden');
        }

        let html = '';
        backlogFeatures.forEach((feature, i) => {
            html += buildFeatureCard(feature, 'backlog', i);
        });
        listEl.innerHTML = html;

        backlogFeatures.forEach(feature => {
            attachCardListeners(feature, 'backlog');
        });
    }

    function buildFeatureCard(feature, context, index) {
        const isEditing = editingId === feature.id;
        const delay = index * 0.05;

        if (isEditing) {
            return `
                <div class="feature-card editing" data-id="${feature.id}" style="animation-delay: ${delay}s">
                    <input type="text" class="form-input edit-title" value="${escapeHtml(feature.title)}" placeholder="Feature title">
                    <textarea class="form-textarea edit-description" placeholder="Feature description">${escapeHtml(feature.description)}</textarea>
                    <div class="form-actions">
                        <button class="btn btn-primary btn-sm btn-save-edit">Save</button>
                        <button class="btn btn-outline btn-sm btn-cancel-edit">Cancel</button>
                    </div>
                    <div class="edit-actions">
                        <button class="btn-delete" data-action="delete">
                            <span>&#128465;</span>
                            <span>Delete</span>
                        </button>
                        ${feature.status !== 'backlog' ? `
                            <button class="btn-back-to-backlog" data-action="to-backlog">
                                <span>&#8592;</span>
                                <span>Back to Backlog</span>
                            </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        let actionHtml = '';
        if (context === 'backlog') {
            actionHtml = `
                <button class="card-action action-start" data-action="start">
                    <span>Start Working</span>
                    <span>&#8594;</span>
                </button>
            `;
        } else if (feature.status === 'done') {
            actionHtml = `
                <div class="card-action action-completed">
                    <span>&#10004;</span>
                    <span>Completed!</span>
                </div>
            `;
        }

        return `
            <div class="feature-card" data-id="${feature.id}" draggable="${context === 'kanban' && !isEditing}" style="animation-delay: ${delay}s">
                <div class="card-header">
                    <span class="card-title">${escapeHtml(feature.title)}</span>
                    <button class="btn-edit-card" data-action="edit" title="Edit feature">&#9998;</button>
                </div>
                ${feature.description ? `<p class="card-description">${escapeHtml(feature.description)}</p>` : ''}
                ${actionHtml}
            </div>
        `;
    }

    function attachCardListeners(feature, context) {
        const card = document.querySelector(`.feature-card[data-id="${feature.id}"]`);
        if (!card) return;

        // Edit button
        const editBtn = card.querySelector('[data-action="edit"]');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                editingId = feature.id;
                render();
                // Focus the title input
                const input = document.querySelector(`.feature-card[data-id="${feature.id}"] .edit-title`);
                if (input) input.focus();
            });
        }

        // Save edit
        const saveBtn = card.querySelector('.btn-save-edit');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                const titleInput = card.querySelector('.edit-title');
                const descInput = card.querySelector('.edit-description');
                const title = titleInput.value.trim();
                if (title) {
                    editFeature(feature.id, title, descInput.value.trim());
                }
            });
        }

        // Cancel edit
        const cancelBtn = card.querySelector('.btn-cancel-edit');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                editingId = null;
                render();
            });
        }

        // Delete
        const deleteBtn = card.querySelector('[data-action="delete"]');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                deleteFeature(feature.id);
            });
        }

        // Back to backlog
        const backlogBtn = card.querySelector('[data-action="to-backlog"]');
        if (backlogBtn) {
            backlogBtn.addEventListener('click', () => {
                editingId = null;
                updateStatus(feature.id, 'backlog');
            });
        }

        // Start Working (backlog → todo)
        const startBtn = card.querySelector('[data-action="start"]');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                updateStatus(feature.id, 'todo');
            });
        }
    }

    // ===== Drag and Drop (HTML5) =====
    function setupDraggable(card) {
        card.addEventListener('dragstart', (e) => {
            draggedFeatureId = card.dataset.id;
            card.classList.add('dragging');

            // Create a custom drag ghost
            const ghost = document.createElement('div');
            ghost.className = 'drag-ghost';
            ghost.textContent = card.querySelector('.card-title').textContent;
            document.body.appendChild(ghost);
            e.dataTransfer.setDragImage(ghost, 20, 20);

            // Clean up ghost after a frame
            requestAnimationFrame(() => {
                document.body.removeChild(ghost);
            });

            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            draggedFeatureId = null;

            // Remove all drag-over states
            document.querySelectorAll('.kanban-column').forEach(col => {
                col.classList.remove('drag-over');
            });
        });
    }

    function setupDropTarget(container, status) {
        const column = container.closest('.kanban-column');

        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            column.classList.add('drag-over');
        });

        container.addEventListener('dragleave', (e) => {
            // Only remove if leaving the container entirely
            if (!container.contains(e.relatedTarget)) {
                column.classList.remove('drag-over');
            }
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            column.classList.remove('drag-over');

            if (draggedFeatureId) {
                const feature = features.find(f => f.id === draggedFeatureId);
                if (feature && feature.status !== status) {
                    updateStatus(draggedFeatureId, status);
                }
            }
        });
    }

    // ===== Celebration =====
    function showCelebration() {
        const el = document.getElementById('celebration');
        const confettiContainer = document.getElementById('confetti-container');
        const sparkleRing = document.getElementById('sparkle-ring');

        // Clear previous particles
        confettiContainer.innerHTML = '';
        sparkleRing.innerHTML = '';

        // Generate 30 confetti particles
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'confetti-particle';
            const angle = (Math.random() * Math.PI * 2);
            const distance = 200 + Math.random() * 400;
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance + Math.random() * 300;
            const xMid = x * 0.4;
            const yMid = y * 0.3 - 100;
            const rotateMid = (Math.random() * 360) + 'deg';
            const rotate = (Math.random() * 720) + 'deg';
            const duration = (2 + Math.random()) + 's';

            particle.style.setProperty('--confetti-x', x + 'px');
            particle.style.setProperty('--confetti-y', y + 'px');
            particle.style.setProperty('--confetti-x-mid', xMid + 'px');
            particle.style.setProperty('--confetti-y-mid', yMid + 'px');
            particle.style.setProperty('--confetti-rotate', rotate);
            particle.style.setProperty('--confetti-rotate-mid', rotateMid);
            particle.style.setProperty('--confetti-duration', duration);
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

            confettiContainer.appendChild(particle);
        }

        // Generate 12 sparkle emojis in a ring
        for (let i = 0; i < 12; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle-emoji';
            sparkle.textContent = '\u2728';
            const angle = (i / 12) * Math.PI * 2;
            const radius = 200;
            sparkle.style.setProperty('--sparkle-x', (Math.cos(angle) * radius) + 'px');
            sparkle.style.setProperty('--sparkle-y', (Math.sin(angle) * radius) + 'px');
            sparkle.style.setProperty('--sparkle-delay', (i * 0.05) + 's');
            sparkleRing.appendChild(sparkle);
        }

        el.classList.remove('hidden');

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            el.classList.add('hidden');
        }, 3000);
    }

    // ===== Dark Mode =====
    function initTheme() {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (saved === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // Auto-detect system preference
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                document.documentElement.classList.add('dark');
            }
        }
    }

    function toggleTheme() {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    // ===== Particles =====
    function initParticles() {
        const container = document.getElementById('particles');
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = (Math.random() * 100) + '%';
            particle.style.top = (Math.random() * 100) + '%';
            particle.style.setProperty('--duration', (15 + Math.random() * 20) + 's');
            particle.style.setProperty('--dx1', (Math.random() * 200 - 100) + 'px');
            particle.style.setProperty('--dy1', (Math.random() * 200 - 100) + 'px');
            particle.style.setProperty('--dx2', (Math.random() * 200 - 100) + 'px');
            particle.style.setProperty('--dy2', (Math.random() * 200 - 100) + 'px');
            particle.style.setProperty('--dx3', (Math.random() * 200 - 100) + 'px');
            particle.style.setProperty('--dy3', (Math.random() * 200 - 100) + 'px');
            particle.style.setProperty('--dx4', (Math.random() * 200 - 100) + 'px');
            particle.style.setProperty('--dy4', (Math.random() * 200 - 100) + 'px');
            particle.style.animationDelay = (Math.random() * 10) + 's';
            container.appendChild(particle);
        }
    }

    // ===== Add Feature Form =====
    function initAddForm() {
        const btnAdd = document.getElementById('btn-add-feature');
        const form = document.getElementById('add-form');
        const titleInput = document.getElementById('add-title');
        const descInput = document.getElementById('add-description');
        const btnSubmit = document.getElementById('btn-add-submit');
        const btnCancel = document.getElementById('btn-add-cancel');

        btnAdd.addEventListener('click', () => {
            form.classList.remove('hidden');
            document.getElementById('backlog-empty').classList.add('hidden');
            titleInput.value = '';
            descInput.value = '';
            titleInput.focus();
        });

        btnSubmit.addEventListener('click', () => {
            const title = titleInput.value.trim();
            if (title) {
                addFeature(title, descInput.value.trim());
                form.classList.add('hidden');
            }
        });

        btnCancel.addEventListener('click', () => {
            form.classList.add('hidden');
            render();
        });

        // Enter key in title to submit
        titleInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                btnSubmit.click();
            }
        });
    }

    // ===== Utility =====
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ===== Kanban column inner wrappers =====
    function wrapColumnInners() {
        document.querySelectorAll('.kanban-column').forEach(col => {
            // Only wrap if not already wrapped
            if (!col.querySelector('.column-inner')) {
                const inner = document.createElement('div');
                inner.className = 'column-inner';
                while (col.firstChild) {
                    inner.appendChild(col.firstChild);
                }
                col.appendChild(inner);
            }
        });
    }

    // ===== Init =====
    function init() {
        initTheme();
        initParticles();
        wrapColumnInners();
        initAddForm();

        document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

        fetchFeatures();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
