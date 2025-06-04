// Operating Systems Progress Tracker Application

class ProgressTracker {
    constructor() {
        this.syllabusData = {
            "course": {
                "name": "Operating Systems",
                "code": "CS 5402",
                "program": "B.Tech CSE",
                "semester": "IV"
            },
            "modules": [
                {
                    "id": 1,
                    "title": "Introduction to Operating System and Process Concept",
                    "contactHours": 30,
                    "outcome": "CO1",
                    "topics": [
                        "Operating system and functions",
                        "Classification of Operating System",
                        "System calls and System Programs",
                        "Process concept and Process control block",
                        "Context switching",
                        "Process state, Process control block, Context switching",
                        "Operation on process, Threads and their management",
                        "Benefits of multithreading",
                        "Types of threads, Threading issues",
                        "CPU-scheduling, Scheduling criteria",
                        "Scheduling Algorithms, Concurrent Process",
                        "Process Synchronization and Deadlock"
                    ]
                },
                {
                    "id": 2,
                    "title": "Process Synchronization and Deadlock",
                    "contactHours": 30,
                    "outcome": "CO2",
                    "topics": [
                        "Process synchronization, Producer-Consumer Problem",
                        "Critical Section Problem",
                        "Peterson's solution",
                        "Synchronization of hardware, Semaphores",
                        "Binary Semaphore",
                        "Deadlock Prevention, Deadlock Avoidance, Resource-",
                        "allocation graph, Banker's algorithm",
                        "Deadlock detection, Recovery from deadlock",
                        "Memory Management"
                    ]
                },
                {
                    "id": 3,
                    "title": "Memory Management",
                    "contactHours": 30,
                    "outcome": "CO3",
                    "topics": [
                        "Memory Management, Multiprogramming with fixed partitions",
                        "Multiprogramming with variable partitions",
                        "Paging, Segmentation, Paged segmentation",
                        "Virtual memory concepts, Demand paging",
                        "Performance of demand paging",
                        "Page replacement algorithms, Thrashing"
                    ]
                },
                {
                    "id": 4,
                    "title": "I/O Management and File System",
                    "contactHours": 30,
                    "outcome": "CO4",
                    "topics": [
                        "I/O System Organization, Implementation",
                        "Directory Implementation and Allocation Methods",
                        "Free space Management, Kernel I/O Subsystems",
                        "Disk Structure, Disk Scheduling, Disk Management",
                        "Swap-Space Management"
                    ]
                }
            ]
        };
        
        this.progress = this.loadProgress();
        this.currentTopicForModal = null;
        this.currentModuleForAdd = null;
        
        this.init();
    }

    init() {
        this.renderModules();
        this.updateOverallProgress();
        this.bindEvents();
        this.loadSearchState();
    }

    // LocalStorage methods
    loadProgress() {
        const saved = localStorage.getItem('osProgressTracker');
        if (saved) {
            const data = JSON.parse(saved);
            return this.mergeProgressData(data);
        }
        return this.initializeProgress();
    }

    mergeProgressData(savedData) {
        const merged = this.initializeProgress();
        
        if (savedData.topics) {
            Object.keys(savedData.topics).forEach(key => {
                if (merged.topics[key] !== undefined) {
                    merged.topics[key] = savedData.topics[key];
                }
            });
        }
        
        if (savedData.customTopics) {
            merged.customTopics = savedData.customTopics;
        }
        
        return merged;
    }

    initializeProgress() {
        const progress = {
            topics: {},
            customTopics: {}
        };
        
        this.syllabusData.modules.forEach(module => {
            progress.customTopics[module.id] = [];
            module.topics.forEach((topic, index) => {
                const topicKey = `${module.id}-${index}`;
                progress.topics[topicKey] = 0;
            });
        });
        
        return progress;
    }

    saveProgress() {
        localStorage.setItem('osProgressTracker', JSON.stringify(this.progress));
    }

    // Rendering methods
    renderModules() {
        const container = document.getElementById('modulesContainer');
        container.innerHTML = '';
        
        this.syllabusData.modules.forEach(module => {
            const moduleCard = this.createModuleCard(module);
            container.appendChild(moduleCard);
        });
    }

    createModuleCard(module) {
        const card = document.createElement('div');
        card.className = 'module-card';
        card.setAttribute('data-module-id', module.id);
        
        card.innerHTML = `
            <div class="module-header">
                <div class="module-title">
                    <div>
                        <h3>${module.title}</h3>
                        <div class="module-info">
                            <span class="module-outcome">${module.outcome}</span>
                            <span class="module-hours">${module.contactHours} Hours</span>
                        </div>
                        <div class="module-progress">
                            <div class="module-progress-bar">
                                <div class="module-progress-fill" data-module="${module.id}"></div>
                            </div>
                            <span class="module-progress-text" data-module="${module.id}">0%</span>
                        </div>
                    </div>
                    <span class="collapse-icon">▼</span>
                </div>
            </div>
            <div class="module-content">
                <div class="module-body">
                    <div class="topics-header">
                        <h4>Topics</h4>
                        <button class="btn btn--primary add-topic-btn">+ Add Topic</button>
                    </div>
                    <div class="topics-list" id="topics-${module.id}">
                        ${this.renderTopics(module)}
                    </div>
                </div>
            </div>
        `;
        
        // Bind events for this module
        this.bindModuleEvents(card, module.id);
        this.updateModuleProgress(module.id);
        
        return card;
    }

    bindModuleEvents(card, moduleId) {
        // Module toggle
        const header = card.querySelector('.module-header');
        header.addEventListener('click', () => {
            card.classList.toggle('expanded');
        });

        // Add topic button
        const addTopicBtn = card.querySelector('.add-topic-btn');
        addTopicBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.showAddTopicModal(moduleId);
        });

        // Topic checkboxes
        const topicCheckboxes = card.querySelectorAll('.topic-checkbox');
        topicCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
                const topicKey = checkbox.getAttribute('data-topic-key');
                this.showStatusModal(topicKey);
            });
        });

        // Remove topic buttons
        const removeButtons = card.querySelectorAll('.remove-topic-btn');
        removeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const topicKey = btn.getAttribute('data-topic-key');
                const isCustom = btn.getAttribute('data-custom') === 'true';
                if (confirm('Are you sure you want to remove this topic?')) {
                    this.removeTopic(topicKey, isCustom);
                }
            });
        });
    }

    renderTopics(module) {
        let html = '';
        
        // Render original topics
        module.topics.forEach((topic, index) => {
            const topicKey = `${module.id}-${index}`;
            const progress = this.progress.topics[topicKey] || 0;
            const statusClass = this.getStatusClass(progress);
            
            html += `
                <div class="topic-item ${progress === 100 ? 'completed' : ''}">
                    <div class="topic-checkbox ${statusClass}" data-topic-key="${topicKey}"></div>
                    <span class="topic-text">${topic}</span>
                    <div class="topic-actions">
                        <button class="remove-topic-btn" data-topic-key="${topicKey}" data-custom="false" style="display: none;">×</button>
                    </div>
                </div>
            `;
        });
        
        // Render custom topics
        const customTopics = this.progress.customTopics[module.id] || [];
        customTopics.forEach((topic, index) => {
            const topicKey = `${module.id}-custom-${index}`;
            const progress = this.progress.topics[topicKey] || 0;
            const statusClass = this.getStatusClass(progress);
            
            html += `
                <div class="topic-item ${progress === 100 ? 'completed' : ''}">
                    <div class="topic-checkbox ${statusClass}" data-topic-key="${topicKey}"></div>
                    <span class="topic-text">${topic}</span>
                    <div class="topic-actions">
                        <button class="remove-topic-btn" data-topic-key="${topicKey}" data-custom="true">×</button>
                    </div>
                </div>
            `;
        });
        
        return html;
    }

    getStatusClass(progress) {
        switch (progress) {
            case 0: return 'not-started';
            case 25: return 'in-progress';
            case 50: return 'review';
            case 100: return 'completed';
            default: return 'not-started';
        }
    }

    // Progress calculation methods
    updateModuleProgress(moduleId) {
        const module = this.syllabusData.modules.find(m => m.id === moduleId);
        if (!module) return;
        
        let totalProgress = 0;
        let topicCount = 0;
        
        // Calculate progress for original topics
        module.topics.forEach((topic, index) => {
            const topicKey = `${moduleId}-${index}`;
            totalProgress += this.progress.topics[topicKey] || 0;
            topicCount++;
        });
        
        // Calculate progress for custom topics
        const customTopics = this.progress.customTopics[moduleId] || [];
        customTopics.forEach((topic, index) => {
            const topicKey = `${moduleId}-custom-${index}`;
            totalProgress += this.progress.topics[topicKey] || 0;
            topicCount++;
        });
        
        const moduleProgress = topicCount > 0 ? Math.round(totalProgress / topicCount) : 0;
        
        // Update UI
        const progressFill = document.querySelector(`[data-module="${moduleId}"].module-progress-fill`);
        const progressText = document.querySelector(`[data-module="${moduleId}"].module-progress-text`);
        
        if (progressFill && progressText) {
            progressFill.style.width = `${moduleProgress}%`;
            progressText.textContent = `${moduleProgress}%`;
        }
        
        this.updateOverallProgress();
    }

    updateOverallProgress() {
        let totalProgress = 0;
        let moduleCount = 0;
        
        this.syllabusData.modules.forEach(module => {
            let moduleTotal = 0;
            let topicCount = 0;
            
            // Original topics
            module.topics.forEach((topic, index) => {
                const topicKey = `${module.id}-${index}`;
                moduleTotal += this.progress.topics[topicKey] || 0;
                topicCount++;
            });
            
            // Custom topics
            const customTopics = this.progress.customTopics[module.id] || [];
            customTopics.forEach((topic, index) => {
                const topicKey = `${module.id}-custom-${index}`;
                moduleTotal += this.progress.topics[topicKey] || 0;
                topicCount++;
            });
            
            if (topicCount > 0) {
                totalProgress += moduleTotal / topicCount;
                moduleCount++;
            }
        });
        
        const overallProgress = moduleCount > 0 ? Math.round(totalProgress / moduleCount) : 0;
        
        // Update UI
        const progressFill = document.querySelector('.progress-fill');
        const progressPercentage = document.querySelector('.progress-percentage');
        
        if (progressFill && progressPercentage) {
            progressFill.style.width = `${overallProgress}%`;
            progressFill.setAttribute('data-progress', overallProgress);
            progressPercentage.textContent = `${overallProgress}%`;
        }
    }

    // Topic management methods
    addCustomTopic(moduleId, topicName) {
        if (!this.progress.customTopics[moduleId]) {
            this.progress.customTopics[moduleId] = [];
        }
        
        this.progress.customTopics[moduleId].push(topicName);
        
        // Initialize progress for new topic
        const index = this.progress.customTopics[moduleId].length - 1;
        const topicKey = `${moduleId}-custom-${index}`;
        this.progress.topics[topicKey] = 0;
        
        this.saveProgress();
        this.refreshModule(moduleId);
    }

    removeTopic(topicKey, isCustom) {
        if (isCustom) {
            const [moduleId, type, index] = topicKey.split('-');
            const customTopics = this.progress.customTopics[parseInt(moduleId)];
            if (customTopics && customTopics[parseInt(index)]) {
                customTopics.splice(parseInt(index), 1);
                
                // Remove all custom topic progress and reindex
                Object.keys(this.progress.topics).forEach(key => {
                    if (key.startsWith(`${moduleId}-custom-`)) {
                        delete this.progress.topics[key];
                    }
                });
                
                // Reindex remaining custom topics
                customTopics.forEach((topic, newIndex) => {
                    const newKey = `${moduleId}-custom-${newIndex}`;
                    this.progress.topics[newKey] = 0;
                });
            }
        } else {
            delete this.progress.topics[topicKey];
        }
        
        this.saveProgress();
        const moduleId = parseInt(topicKey.split('-')[0]);
        this.refreshModule(moduleId);
    }

    refreshModule(moduleId) {
        const module = this.syllabusData.modules.find(m => m.id === moduleId);
        if (module) {
            const moduleCard = document.querySelector(`[data-module-id="${moduleId}"]`);
            if (moduleCard) {
                const topicsContainer = moduleCard.querySelector(`#topics-${moduleId}`);
                if (topicsContainer) {
                    topicsContainer.innerHTML = this.renderTopics(module);
                    this.bindModuleEvents(moduleCard, moduleId);
                    this.updateModuleProgress(moduleId);
                }
            }
        }
    }

    // Search functionality
    performGoogleSearch(query) {
        const searchQuery = encodeURIComponent(`${query} operating systems`);
        const searchUrl = `https://www.google.com/search?igu=1&q=${searchQuery}`;
        const iframe = document.getElementById('googleSearchFrame');
        if (iframe) {
            iframe.src = searchUrl;
        }
    }

    performBlackboxSearch(query) {
        const searchQuery = encodeURIComponent(query);
        const searchUrl = `https://www.blackbox.ai?q=${searchQuery}`;
        const iframe = document.getElementById('blackboxSearchFrame');
        if (iframe) {
            iframe.src = searchUrl;
        }
    }

    loadSearchState() {
        const savedSearches = localStorage.getItem('osSearchState');
        if (savedSearches) {
            const searches = JSON.parse(savedSearches);
            if (searches.google) {
                const input = document.getElementById('googleSearchInput');
                if (input) input.value = searches.google;
            }
            if (searches.blackbox) {
                const input = document.getElementById('blackboxSearchInput');
                if (input) input.value = searches.blackbox;
            }
        }
    }

    saveSearchState() {
        const googleInput = document.getElementById('googleSearchInput');
        const blackboxInput = document.getElementById('blackboxSearchInput');
        
        const searchState = {
            google: googleInput ? googleInput.value : '',
            blackbox: blackboxInput ? blackboxInput.value : ''
        };
        
        localStorage.setItem('osSearchState', JSON.stringify(searchState));
    }

    // Modal methods
    showStatusModal(topicKey) {
        this.currentTopicForModal = topicKey;
        const modal = document.getElementById('statusModal');
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideStatusModal() {
        const modal = document.getElementById('statusModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentTopicForModal = null;
    }

    showAddTopicModal(moduleId) {
        this.currentModuleForAdd = moduleId;
        const modal = document.getElementById('addTopicModal');
        const input = document.getElementById('newTopicInput');
        if (modal && input) {
            input.value = '';
            modal.classList.add('active');
            setTimeout(() => input.focus(), 100);
        }
    }

    hideAddTopicModal() {
        const modal = document.getElementById('addTopicModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.currentModuleForAdd = null;
    }

    updateTopicProgress(topicKey, progress) {
        this.progress.topics[topicKey] = progress;
        this.saveProgress();
        
        const moduleId = parseInt(topicKey.split('-')[0]);
        this.refreshModule(moduleId);
    }

    resetAllProgress() {
        this.progress = this.initializeProgress();
        localStorage.removeItem('osProgressTracker');
        this.renderModules();
        this.updateOverallProgress();
    }

    // Event binding
    bindEvents() {
        // Search functionality
        const googleSearchBtn = document.getElementById('googleSearchBtn');
        const blackboxSearchBtn = document.getElementById('blackboxSearchBtn');
        const googleSearchInput = document.getElementById('googleSearchInput');
        const blackboxSearchInput = document.getElementById('blackboxSearchInput');

        if (googleSearchBtn && googleSearchInput) {
            googleSearchBtn.addEventListener('click', () => {
                const query = googleSearchInput.value;
                if (query.trim()) {
                    this.performGoogleSearch(query);
                    this.saveSearchState();
                }
            });

            googleSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    googleSearchBtn.click();
                }
            });
        }

        if (blackboxSearchBtn && blackboxSearchInput) {
            blackboxSearchBtn.addEventListener('click', () => {
                const query = blackboxSearchInput.value;
                if (query.trim()) {
                    this.performBlackboxSearch(query);
                    this.saveSearchState();
                }
            });

            blackboxSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    blackboxSearchBtn.click();
                }
            });
        }

        // Modal events
        const closeModal = document.getElementById('closeModal');
        const confirmAddTopic = document.getElementById('confirmAddTopic');
        const cancelAddTopic = document.getElementById('cancelAddTopic');
        const newTopicInput = document.getElementById('newTopicInput');

        if (closeModal) {
            closeModal.addEventListener('click', () => {
                this.hideStatusModal();
            });
        }

        if (confirmAddTopic && newTopicInput) {
            confirmAddTopic.addEventListener('click', () => {
                const topicName = newTopicInput.value.trim();
                if (topicName && this.currentModuleForAdd) {
                    this.addCustomTopic(this.currentModuleForAdd, topicName);
                    this.hideAddTopicModal();
                }
            });

            newTopicInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    confirmAddTopic.click();
                }
            });
        }

        if (cancelAddTopic) {
            cancelAddTopic.addEventListener('click', () => {
                this.hideAddTopicModal();
            });
        }

        // Status buttons
        const statusButtons = document.querySelectorAll('.status-btn');
        statusButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const status = parseInt(btn.getAttribute('data-status'));
                if (this.currentTopicForModal) {
                    this.updateTopicProgress(this.currentTopicForModal, status);
                    this.hideStatusModal();
                }
            });
        });

        // Reset progress
        const resetBtn = document.getElementById('resetProgress');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
                    this.resetAllProgress();
                }
            });
        }

        // Sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.querySelector('.search-sidebar');
                if (sidebar) {
                    sidebar.classList.toggle('expanded');
                }
            });
        }

        // Close modals on outside click
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideStatusModal();
                this.hideAddTopicModal();
            }
        });
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProgressTracker();
});