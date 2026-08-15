// --- Utilities ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const getStartOfDay = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-teal-400', 'bg-blue-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];

// --- Application State ---
const app = {
    subjects: [],
    cards: [],
    currentView: 'dashboard',
    activeSubjectId: null,
    studyQueue: [],
    currentCardIndex: 0,
    sessionCardsDone: 0, 
    isDarkMode: false,
    
    // Swipe State
    isFlipped: false,
    isDragging: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    dragThreshold: 80,
    lastTapTime: 0,

    // --- Initialization ---
    init() {
        this.loadTheme();
        this.setupSwipeEvents();
        // loadData is now async, it will call renderDashboard once data is ready
        this.loadData();
        lucide.createIcons();
    },

    loadTheme() {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            this.isDarkMode = true;
            document.documentElement.classList.add('dark');
            document.getElementById('theme-icon').setAttribute('data-lucide', 'moon');
        } else {
            this.isDarkMode = false;
            document.documentElement.classList.remove('dark');
            document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
        }
    },

    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark';
            document.getElementById('theme-icon').setAttribute('data-lucide', 'moon');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light';
            document.getElementById('theme-icon').setAttribute('data-lucide', 'sun');
        }
        lucide.createIcons();
    },

    async loadData() {
        const lsSubjects = localStorage.getItem('fm_subjects');
        const lsCards = localStorage.getItem('fm_cards');
        
        if (lsSubjects && lsCards && JSON.parse(lsSubjects).length > 0) {
            this.subjects = JSON.parse(lsSubjects);
            this.cards = JSON.parse(lsCards);
            this.renderDashboard();
        } else {
            // Fetch from external cards.json if local storage is empty
            try {
                const response = await fetch('cards.json');
                if (!response.ok) throw new Error('Network response was not ok');
                const importedData = await response.json();

                this.subjects = [];
                this.cards = [];
                
                importedData.forEach(item => {
                    let sub = this.subjects.find(s => s.name.toLowerCase() === item.subjectName.toLowerCase());
                    let targetSubId;
                    
                    if (sub) {
                        targetSubId = sub.id;
                    } else {
                        targetSubId = generateId();
                        this.subjects.push({
                            id: targetSubId, 
                            name: item.subjectName,
                            color: colors[Math.floor(Math.random() * colors.length)],
                            streak: 0, 
                            lastStudied: null
                        });
                    }

                    // Prevent duplicates on auto-load
                    const isDuplicate = this.cards.some(card => card.q.toLowerCase() === item.question.toLowerCase());
                    if (!isDuplicate) {
                        this.cards.push({
                            id: generateId(), 
                            subjectId: targetSubId,
                            q: item.question, 
                            a: item.answer, 
                            exp: item.explanation || '',
                            nextReview: getStartOfDay(), 
                            interval: 0, 
                            ease: 2.5, 
                            reps: 0
                        });
                    }
                });
                this.saveData();
                this.renderDashboard();
            } catch (error) {
                console.error("Error loading cards.json:", error);
                this.notify("Failed to load cards.json. Ensure you are using a local server.", true);
                this.subjects = [];
                this.cards = [];
                this.renderDashboard();
            }
        }
    },

    saveData() {
        localStorage.setItem('fm_subjects', JSON.stringify(this.subjects));
        localStorage.setItem('fm_cards', JSON.stringify(this.cards));
    },

    notify(msg, isError = false) {
        const toast = document.getElementById('notification-toast');
        const msgEl = document.getElementById('notification-msg');
        msgEl.textContent = msg;
        toast.className = `px-6 py-3 rounded-full shadow-lg text-white font-medium ${isError ? 'bg-red-500' : 'bg-slate-800 dark:bg-slate-700'}`;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    },

    // --- Navigation ---
    navigate(view) {
        ['dashboard', 'study', 'add', 'manage'].forEach(v => {
            document.getElementById(`view-${v}`).classList.add('view-hidden');
            document.getElementById(`view-${v}`).classList.remove('flex');
        });

        this.currentView = view;
        const viewEl = document.getElementById(`view-${view}`);
        viewEl.classList.remove('view-hidden');
        
        if (view === 'dashboard') {
            this.renderDashboard();
        } else if (view === 'study') {
            viewEl.classList.add('flex');
            this.initStudySession();
        } else if (view === 'add') {
            this.renderAddForm();
        } else if (view === 'manage') {
            this.renderManage();
        }
        
        lucide.createIcons();
    },

    renderDashboard() {
        const container = document.getElementById('subjects-container');
        container.innerHTML = '';
        const today = getStartOfDay();

        if (this.subjects.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                    <p class="text-slate-500 dark:text-slate-400 mb-4">No subjects found.</p>
                    <button onclick="app.navigate('manage')" class="text-blue-600 dark:text-blue-400 font-medium hover:underline">Create your first subject</button>
                </div>`;
            return;
        }

        this.subjects.forEach(sub => {
            const subCards = this.cards.filter(c => c.subjectId === sub.id);
            const total = subCards.length;
            const dueCount = subCards.filter(c => c.nextReview <= today).length;
            
            const learnedCount = total - dueCount;
            const progress = total === 0 ? 0 : Math.round((learnedCount / total) * 100);

            const cardHtml = `
                <div onclick="app.startStudy('${sub.id}')" 
                     class="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm transition-all hover:shadow-md cursor-pointer hover:-translate-y-1 flex flex-col justify-between min-h-[160px]">
                    <div class="absolute top-0 left-0 w-2 h-full ${sub.color}"></div>
                    <div class="p-6 pl-8 flex-1 flex flex-col justify-between">
                        <div>
                            <div class="flex justify-between items-start mb-4">
                                <h3 class="text-xl font-bold dark:text-white">${sub.name}</h3>
                                ${sub.streak > 0 ? `<div class="flex items-center text-orange-500 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full text-sm font-bold"><i data-lucide="flame" class="w-4 h-4 mr-1"></i> ${sub.streak}</div>` : ''}
                            </div>
                            <div class="flex gap-4 mb-4 text-sm">
                                <div class="flex flex-col"><span class="text-slate-400 dark:text-slate-500">Total</span><span class="font-semibold dark:text-slate-200">${total}</span></div>
                                <div class="flex flex-col"><span class="text-slate-400 dark:text-slate-500">Due</span><span class="font-bold ${dueCount > 0 ? 'text-blue-600 dark:text-blue-400' : 'text-green-500 dark:text-green-400'}">${dueCount}</span></div>
                            </div>
                        </div>
                        <div>
                            <div class="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-1 overflow-hidden">
                                <div class="h-2 rounded-full transition-all duration-1000 ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}" style="width: ${progress}%"></div>
                            </div>
                            <div class="text-xs text-right text-slate-400 dark:text-slate-500">${progress}% mastery</div>
                        </div>
                    </div>
                </div>`;
            container.insertAdjacentHTML('beforeend', cardHtml);
        });
    },

    startStudy(subjectId) {
        this.activeSubjectId = subjectId;
        this.navigate('study');
    },

    exitStudy() {
        this.navigate('dashboard');
    },

    initStudySession() {
        const today = getStartOfDay();
        let sessionCards = this.cards.filter(c => c.subjectId === this.activeSubjectId && c.nextReview <= today);
        
        if (sessionCards.length === 0) {
            sessionCards = this.cards.filter(c => c.subjectId === this.activeSubjectId);
        }

        if (sessionCards.length === 0) {
            this.notify('No cards added to this subject yet!');
            this.navigate('dashboard');
            return;
        }

        this.studyQueue = sessionCards.sort(() => Math.random() - 0.5);
        this.currentCardIndex = 0;
        this.sessionCardsDone = 0;
        this.loadCurrentCard();
    },

    shuffleRemaining() {
        if (this.currentCardIndex >= this.studyQueue.length - 1) {
            this.notify('No remaining cards to shuffle!');
            return;
        }
        
        const remaining = this.studyQueue.slice(this.currentCardIndex);
        remaining.sort(() => Math.random() - 0.5);
        
        this.studyQueue.splice(this.currentCardIndex, remaining.length, ...remaining);
        
        this.loadCurrentCard();
        this.notify('Remaining deck shuffled!');
    },

    loadCurrentCard() {
        if (this.currentCardIndex >= this.studyQueue.length) {
            this.currentCardIndex = 0;
        }

        const card = this.studyQueue[this.currentCardIndex];
        
        this.isFlipped = false;
        const flashcardEl = document.getElementById('flashcard');
        flashcardEl.classList.remove('is-flipped');
        flashcardEl.style.transform = `translate(0px, 0px) rotate(0deg)`;
        flashcardEl.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
        flashcardEl.style.opacity = 1;

        document.getElementById('overlay-left').style.opacity = 0;
        document.getElementById('overlay-right').style.opacity = 0;
        document.getElementById('card-exp-container').classList.add('hidden');
        document.getElementById('card-exp-container').classList.remove('flex');

        document.getElementById('card-question').textContent = card.q;
        document.getElementById('card-answer').textContent = card.a;
        
        const expHint = document.getElementById('swipe-up-hint');
        if (card.exp) {
            document.getElementById('card-explanation').textContent = card.exp;
            expHint.classList.remove('hidden');
        } else {
            expHint.classList.add('hidden');
        }

        const progress = Math.min(Math.round((this.sessionCardsDone / this.studyQueue.length) * 100), 100);
        document.getElementById('study-progress-bar').style.width = `${progress}%`;
        document.getElementById('study-progress-text').textContent = `${this.sessionCardsDone} studied`;
    },

    flipCard() {
        this.isFlipped = !this.isFlipped;
        document.getElementById('flashcard').classList.toggle('is-flipped', this.isFlipped);
    },

    setupSwipeEvents() {
        const card = document.getElementById('flashcard');
        
        const handleDown = (e) => {
            if (e.type === 'mousedown' && e.button !== 0) return; 
            this.isDragging = true;
            this.startX = e.clientX || (e.touches && e.touches[0].clientX);
            this.startY = e.clientY || (e.touches && e.touches[0].clientY);
            this.currentX = this.startX;
            this.currentY = this.startY;
            
            if (this.isFlipped) {
                card.style.transition = 'none'; 
            }
        };

        const handleMove = (e) => {
            if (!this.isDragging) return;
            this.currentX = e.clientX || (e.touches && e.touches[0].clientX);
            this.currentY = e.clientY || (e.touches && e.touches[0].clientY);
            
            if (this.isFlipped) {
                const deltaX = this.currentX - this.startX;
                const deltaY = this.currentY - this.startY;
                
                if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY < 0) {
                    card.style.transform = `translateY(${deltaY * 0.3}px)`; 
                } else {
                    const rotation = deltaX * 0.05;
                    card.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
                    
                    const leftOverlay = document.getElementById('overlay-left');
                    const rightOverlay = document.getElementById('overlay-right');
                    
                    if (deltaX < 0) { 
                        leftOverlay.style.opacity = Math.min(Math.abs(deltaX) / 150, 1);
                        rightOverlay.style.opacity = 0;
                    } else { 
                        rightOverlay.style.opacity = Math.min(deltaX / 150, 1);
                        leftOverlay.style.opacity = 0;
                    }
                }
            }
        };

        const handleUp = (e) => {
            if (!this.isDragging) return;
            this.isDragging = false;
            
            const deltaX = this.currentX - this.startX;
            const deltaY = this.currentY - this.startY;
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);

            if (this.isFlipped) {
                card.style.transition = 'transform 0.3s ease-out, opacity 0.3s ease-out';
                
                if (deltaY < -this.dragThreshold && absDeltaY > absDeltaX) {
                    const expContainer = document.getElementById('card-exp-container');
                    const currentCard = this.studyQueue[this.currentCardIndex];
                    if (currentCard.exp) {
                        expContainer.classList.remove('hidden');
                        expContainer.classList.add('flex');
                        document.getElementById('swipe-up-hint').classList.add('hidden');
                    }
                    card.style.transform = `translate(0px, 0px) rotate(0deg)`; 
                    return;
                }

                if (absDeltaX > this.dragThreshold && absDeltaX > absDeltaY) {
                    const direction = deltaX > 0 ? 'right' : 'left';
                    this.handleSwipeResult(direction);
                    return; 
                } 
                
                card.style.transform = `translate(0px, 0px) rotate(0deg)`;
                document.getElementById('overlay-left').style.opacity = 0;
                document.getElementById('overlay-right').style.opacity = 0;
            }

            if (absDeltaX < 10 && absDeltaY < 10) { 
                const now = Date.now();
                if (now - this.lastTapTime < 400) { 
                    this.flipCard();
                    this.lastTapTime = 0; 
                } else {
                    this.lastTapTime = now;
                }
            }
        };

        card.addEventListener('mousedown', handleDown);
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        
        card.addEventListener('touchstart', handleDown, {passive: true});
        window.addEventListener('touchmove', handleMove, {passive: true});
        window.addEventListener('touchend', handleUp);
        window.addEventListener('touchcancel', handleUp); 
    },

    handleSwipeResult(direction) {
        if (!this.isFlipped && direction) {
             this.notify('Flip the card first!', true);
             return;
        }

        const isCorrect = direction === 'left';
        const cardEl = document.getElementById('flashcard');
        
        const exitX = direction === 'left' ? -window.innerWidth : window.innerWidth;
        cardEl.style.transform = `translateX(${exitX}px) rotate(${direction === 'left' ? -20 : 20}deg)`;
        cardEl.style.opacity = 0;

        const currentCardId = this.studyQueue[this.currentCardIndex].id;

        setTimeout(() => {
            this.updateCardSRS(currentCardId, isCorrect);
            this.sessionCardsDone++;
            this.currentCardIndex++;
            this.loadCurrentCard();
        }, 300); 
    },

    updateCardSRS(cardId, isCorrect) {
        const now = getStartOfDay();
        const cardIndex = this.cards.findIndex(c => c.id === cardId);
        if(cardIndex === -1) return false;
        
        let c = {...this.cards[cardIndex]};
        let { interval, ease, reps } = c;

        if (isCorrect) {
            if (reps === 0) {
                interval = 0; reps = 1;
            } else if (reps === 1) {
                interval = 1; reps = 2; ease = ease + 0.1;
            } else {
                interval = Math.round(interval * ease); reps += 1; ease = ease + 0.1;
            }
        } else {
            reps = 0; interval = 0; ease = Math.max(1.3, ease - 0.2);
        }

        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + interval);
        
        c.interval = interval; c.ease = ease; c.reps = reps; c.nextReview = nextDate.getTime();
        
        this.cards[cardIndex] = c;
        this.saveData();

        if (isCorrect) this.updateStreak();
        return true;
    },

    updateStreak() {
        const today = getStartOfDay();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const subIndex = this.subjects.findIndex(s => s.id === this.activeSubjectId);
        
        if(subIndex === -1) return;
        let s = {...this.subjects[subIndex]};

        if (s.lastStudied !== today) {
            if (s.lastStudied === yesterday.getTime()) {
                s.streak = (s.streak || 0) + 1;
            } else {
                s.streak = 1;
            }
            s.lastStudied = today;
            this.subjects[subIndex] = s;
            this.saveData();
        }
    },

    renderAddForm() {
        const select = document.getElementById('add-subject-id');
        const warning = document.getElementById('add-no-subject-warning');
        const form = document.getElementById('add-card-form');
        
        select.innerHTML = '';
        if(this.subjects.length === 0) {
            warning.classList.remove('hidden');
            form.classList.add('hidden');
        } else {
            warning.classList.add('hidden');
            form.classList.remove('hidden');
            this.subjects.forEach(s => {
                select.insertAdjacentHTML('beforeend', `<option value="${s.id}">${s.name}</option>`);
            });
        }
    },

    addCard(e) {
        e.preventDefault();
        const subId = document.getElementById('add-subject-id').value;
        const q = document.getElementById('add-question').value.trim();
        const a = document.getElementById('add-answer').value.trim();
        const exp = document.getElementById('add-explanation').value.trim();

        const isDuplicate = this.cards.some(card => card.q.toLowerCase() === q.toLowerCase());
        
        if (isDuplicate) {
            this.notify('This question already exists in your deck!', true);
            return; 
        }

        const newCard = {
            id: generateId(),
            subjectId: subId,
            q, a, exp,
            nextReview: getStartOfDay(),
            interval: 0, ease: 2.5, reps: 0
        };

        this.cards.push(newCard);
        this.saveData();
        this.notify('Card added successfully!');
        
        document.getElementById('add-question').value = '';
        document.getElementById('add-answer').value = '';
        document.getElementById('add-explanation').value = '';
    },

    renderManage() {
        const list = document.getElementById('manage-subjects-list');
        list.innerHTML = '';
        this.subjects.forEach(sub => {
            const count = this.cards.filter(c => c.subjectId === sub.id).length;
            list.insertAdjacentHTML('beforeend', `
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="w-4 h-4 rounded-full ${sub.color}"></div>
                        <span class="font-semibold dark:text-white">${sub.name}</span>
                        <span class="text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600">${count} cards</span>
                    </div>
                    <button onclick="app.deleteSubject('${sub.id}')" class="p-2 text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <i data-lucide="trash-2" class="w-5 h-5"></i>
                    </button>
                </div>
            `);
        });
        lucide.createIcons();
    },

    addSubject(e) {
        e.preventDefault();
        const input = document.getElementById('new-subject-name');
        const name = input.value.trim();
        if(!name) return;

        const newSub = {
            id: generateId(),
            name: name,
            color: colors[Math.floor(Math.random() * colors.length)],
            streak: 0, lastStudied: null
        };
        
        this.subjects.push(newSub);
        this.saveData();
        input.value = '';
        this.renderManage();
        this.notify('Subject created!');
    },

    deleteSubject(id) {
        if(confirm('Delete this subject and all its cards?')) {
            this.subjects = this.subjects.filter(s => s.id !== id);
            this.cards = this.cards.filter(c => c.subjectId !== id);
            this.saveData();
            this.renderManage();
            this.notify('Subject deleted.');
        }
    },

    downloadBackup() {
        const data = JSON.stringify(this.cards, null, 2);
        const blob = new Blob([data], {type: "application/json"});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = "arise_backup.json";
        a.click();
        URL.revokeObjectURL(url);
    },

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        localStorage.setItem('fm_backup', JSON.stringify({s: this.subjects, c: this.cards}));

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const imported = JSON.parse(event.target.result);
                if(!Array.isArray(imported)) throw new Error("Need an array");

                let newCount = 0;
                imported.forEach(item => {
                    if (!item.question || !item.answer) return;
                    
                    let targetSubId = this.subjects[0]?.id;
                    
                    if (item.subjectName) {
                        let sub = this.subjects.find(s => s.name.toLowerCase() === item.subjectName.toLowerCase());
                        if(sub) targetSubId = sub.id;
                        else {
                            targetSubId = generateId();
                            this.subjects.push({
                                id: targetSubId, name: item.subjectName,
                                color: colors[Math.floor(Math.random() * colors.length)],
                                streak: 0, lastStudied: null
                            });
                        }
                    }

                    if(targetSubId) {
                        const isDuplicate = this.cards.some(card => card.q.toLowerCase() === item.question.toLowerCase());
                        if (!isDuplicate) {
                            this.cards.push({
                                id: generateId(), subjectId: targetSubId,
                                q: item.question, a: item.answer, exp: item.explanation || '',
                                nextReview: getStartOfDay(), interval: 0, ease: 2.5, reps: 0
                            });
                            newCount++;
                        }
                    }
                });

                this.saveData();
                this.notify(`Imported ${newCount} new cards!`);
                this.renderManage();
            } catch(err) {
                this.notify('Invalid JSON file format.', true);
            }
            e.target.value = ''; 
        };
        reader.readAsText(file);
    }
};

window.addEventListener('DOMContentLoaded', () => {
    app.init();
});