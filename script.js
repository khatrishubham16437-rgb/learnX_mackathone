// --- 1. STARFIELD (Dost ka code) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starfield'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(3000 * 3);
for(let i=0; i<9000; i++) starPos[i] = (Math.random() - 0.5) * 1000;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.8}));
scene.add(stars);
camera.position.z = 1;
let warp = 0.2;

function animateStars() {
    requestAnimationFrame(animateStars);
    const p = starGeo.attributes.position.array;
    for(let i=2; i<p.length; i+=3) { p[i] += warp; if(p[i] > 500) p[i] = -500; }
    starGeo.attributes.position.needsUpdate = true;
    renderer.render(scene, camera);
}
animateStars();

// --- 2. INTRO & LOGIN SYNC ---
const tl = gsap.timeline();
tl.to(".intro-lx", { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" });
tl.to("#welcome-msg", { opacity: 1, duration: 1 }, "-=0.5");
tl.to({}, { duration: 1, onUpdate: () => { warp += 0.7; } });
tl.to("#intro-overlay", { opacity: 0, display: "none", duration: 1, onStart: () => {
    gsap.to("#sidebar", { x: 0, duration: 0.6 });
    lucide.createIcons();
    initMentors();
    initLeaderboard();
    
    // Login se naam uthao
    const savedName = localStorage.getItem('learnx_user') || 'User';
    document.getElementById('user-avatar').innerText = savedName.substring(0, 2);
}});

// --- 3. NEURAL PRACTICE LOGIC (Aapka Backend Integration) ---
let quizState = {
    xp: 0,
    streak: 0,
    usedQuestions: [],
    currentQuestion: null
};

// Practice Mode Trigger
function triggerPractice() {
    closeOverlays();
    document.getElementById('practice-overlay').style.display = 'block';
    fetchNeuralQuestion();
}

async function fetchNeuralQuestion() {
    const quizRoot = document.getElementById('quiz-root');
    quizRoot.innerHTML = `
        <div class="flex flex-col items-center justify-center py-20">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p class="text-blue-400 font-black italic animate-pulse tracking-widest">SYNCING WITH NEURAL CORE...</p>
        </div>
    `;

    try {
        const response = await fetch('http://localhost:5000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                topic: "C++ Programming",
                difficulty: quizState.xp > 200 ? "Level 2" : "Level 1",
                exclude: quizState.usedQuestions
            })
        });
        
        const data = await response.json();
        quizState.currentQuestion = data;
        quizState.usedQuestions.push(data.question);
        renderQuizCard(data);
    } catch (error) {
        quizRoot.innerHTML = `<p class="text-red-500 text-center font-bold">Error: Connection to Llama 3.2 failed. Ensure server.js is running.</p>`;
    }
}

function renderQuizCard(q) {
    const quizRoot = document.getElementById('quiz-root');
    quizRoot.innerHTML = `
        <div class="quiz-card">
            <div class="flex justify-between items-center mb-8">
                <div class="flex items-center gap-2">
                    <span class="text-orange-500 text-xl">🔥</span>
                    <span class="font-black text-orange-500 uppercase tracking-tighter">Streak: ${quizState.streak}</span>
                </div>
                <div class="bg-blue-600/20 px-4 py-1 rounded-full border border-blue-500/30">
                    <span class="text-blue-400 font-black text-xs uppercase">🏆 ${quizState.xp} XP</span>
                </div>
            </div>

            <h3 class="text-2xl font-bold text-white mb-8 leading-relaxed">${q.question}</h3>

            <div class="grid grid-cols-1 gap-3">
                ${q.options.map(opt => `
                    <button class="quiz-option-btn" onclick="handleAnswerSelection(this, '${opt}')">
                        ${opt}
                    </button>
                `).join('')}
            </div>

            <div id="feedback-area" class="mt-6">
                <button id="submit-ans-btn" onclick="validateAnswer()" class="next-challenge-btn" style="background: rgba(255,255,255,0.05); color: #475569;" disabled>Select an Option</button>
            </div>
        </div>
    `;
}

let selectedOption = null;
let selectedBtn = null;

function handleAnswerSelection(btn, opt) {
    if(document.getElementById('next-btn')) return; // Check if already submitted
    
    document.querySelectorAll('.quiz-option-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedOption = opt;
    selectedBtn = btn;
    
    const submitBtn = document.getElementById('submit-ans-btn');
    submitBtn.disabled = false;
    submitBtn.innerText = "Check Logic";
    submitBtn.style.background = "#3b82f6";
    submitBtn.style.color = "white";
}

function validateAnswer() {
    const isCorrect = selectedOption.trim() === quizState.currentQuestion.answer.trim();
    const feedbackArea = document.getElementById('feedback-area');
    const allBtns = document.querySelectorAll('.quiz-option-btn');

    allBtns.forEach(btn => {
        btn.disabled = true;
        if(btn.innerText.trim() === quizState.currentQuestion.answer.trim()) {
            btn.classList.add('correct');
        }
    });

    if (isCorrect) {
        quizState.xp += 20;
        quizState.streak += 1;
    } else {
        selectedBtn.classList.add('wrong');
        quizState.xp = Math.max(0, quizState.xp - 10);
        quizState.streak = 0;
    }

    feedbackArea.innerHTML = `
        <div class="explanation-box">
            <p class="text-blue-400 font-black text-[10px] uppercase tracking-widest mb-2">Neural Analysis</p>
            <p class="text-gray-300 text-sm leading-relaxed">${quizState.currentQuestion.explanation}</p>
        </div>
        <button id="next-btn" onclick="fetchNeuralQuestion()" class="next-challenge-btn">
            Next Challenge <i data-lucide="arrow-right" class="inline w-4 h-4 ml-2"></i>
        </button>
    `;
    lucide.createIcons();
    
    // Global profile update
    document.getElementById('prof-xp').innerText = quizState.xp.toLocaleString();
    document.getElementById('prof-streak').innerText = `🔥 ${quizState.streak}`;
}

// --- 4. DATA & UI (Baki functions wahi rahenge) ---
const mentorData = [
    { name: "Alex Rivera", spec: "Full Stack Expert", price: "$45", emoji: "👨‍🚀" },
    { name: "Sarah Chen", spec: "AI & Neural Nets", price: "$60", emoji: "👩‍💻" },
    { name: "Marcus Vane", spec: "Cybersecurity", price: "$55", emoji: "🕵️‍♂️" },
    { name: "Elena Ross", spec: "UI/UX Architect", price: "$40", emoji: "🦄" },
    { name: "D-01 Bot", spec: "Logic Engine", price: "Free", emoji: "🤖" }
];

function initMentors() {
    document.getElementById('mentor-grid').innerHTML = mentorData.map(m => `
        <div class="glass-panel text-center group border-white/5 hover:border-blue-500">
            <div class="text-4xl mb-4 transition">${m.emoji}</div>
            <h4 class="font-bold text-sm uppercase italic">${m.name}</h4>
            <p class="text-[9px] text-blue-400 font-black uppercase tracking-widest mt-1 mb-4">${m.spec}</p>
            <div class="flex flex-col gap-2">
                <button onclick="openChat('${m.name}')" class="text-[10px] bg-blue-600/20 py-2 rounded-lg font-bold">Free Chat</button>
                <button onclick="alert('Proceeding to Session...')" class="text-[10px] bg-white/5 py-2 rounded-lg font-bold">Paid: ${m.price}/hr</button>
            </div>
        </div>
    `).join('');
}

function initLeaderboard() {
    const leaders = [
        { name: "Sarah Tech", streak: "45", xp: "12,400" },
        { name: "CodeKing", streak: "22", xp: "11,200" },
        { name: "DevMaster", streak: "18", xp: "9,800" }
    ];
    document.getElementById('leader-list').innerHTML = leaders.map(l => `
        <div class="glass-panel flex justify-between items-center cursor-pointer hover:border-blue-500 transition" onclick="openProfile('${l.name}', '${l.streak}', '${l.xp}')">
            <span class="font-bold text-sm italic uppercase tracking-tighter">${l.name}</span>
            <div class="flex items-center gap-4">
                <span class="text-orange-500 text-xs font-bold">🔥 ${l.streak}</span>
                <span class="text-blue-500 font-mono text-xs">${l.xp} XP</span>
            </div>
        </div>
    `).join('');
}

function openProfile(n, s, x) {
    closeOverlays();
    document.getElementById('prof-name').innerHTML = `IDENTITY: <span class="text-blue-500">${n}</span>`;
    document.getElementById('prof-streak').innerText = `🔥 ${s}`;
    document.getElementById('prof-xp').innerText = x;
    document.getElementById('profile-overlay').style.display = 'block';
    initBadge3D();
}

function openMentors() { closeOverlays(); document.getElementById('mentor-overlay').style.display = 'block'; }
function openLeaderboard() { closeOverlays(); document.getElementById('leaderboard-overlay').style.display = 'block'; }
function closeOverlays() { document.querySelectorAll('.overlay').forEach(o => o.style.display='none'); toggleChat(false); }

function openChat(name) {
    document.getElementById('chat-title').innerText = name + " (AI)";
    document.getElementById('chat-window').style.display = 'block';
}

function toggleChat(s) { document.getElementById('chat-window').style.display = s ? 'block' : 'none'; }

function sendMsg() {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-msgs');
    if(!input.value) return;
    box.innerHTML += `<div class="bg-blue-600 p-2 rounded-lg self-end text-right max-w-[85%] mb-2 ml-auto">${input.value}</div>`;
    const userQ = input.value.toLowerCase();
    input.value = '';
    document.getElementById('typing').classList.remove('hidden');
    setTimeout(() => {
        document.getElementById('typing').classList.add('hidden');
        let r = "System processing your logic...";
        if(userQ.includes("javascript")) r = "In JS, check your 'this' context and asynchronous handlers.";
        if(userQ.includes("python")) r = "Python relies heavily on whitespace. Ensure your indentations match.";
        box.innerHTML += `<div class="bg-white/10 p-2 rounded-lg border-l-2 border-blue-500 max-w-[85%] mb-2">${r}</div>`;
        box.scrollTop = box.scrollHeight;
    }, 1200);
}

// --- 5. 3D BADGE ---
let bScene, bCamera, bRenderer, bMesh;
function initBadge3D() {
    const canv = document.getElementById('badge-canvas');
    if(bRenderer) return;
    bScene = new THREE.Scene();
    bCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    bRenderer = new THREE.WebGLRenderer({ canvas: canv, antialias: true, alpha: true });
    bRenderer.setSize(300, 300);
    bMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), new THREE.MeshPhongMaterial({ color: 0x3b82f6, shininess: 100 }));
    bScene.add(bMesh);
    const l = new THREE.PointLight(0xffffff, 1.5, 100); l.position.set(5,5,5);
    bScene.add(l, new THREE.AmbientLight(0x404040));
    bCamera.position.z = 5;
    function an() { requestAnimationFrame(an); bMesh.rotation.y += 0.02; bRenderer.render(bScene, bCamera); }
    an();
}