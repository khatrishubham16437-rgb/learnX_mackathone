// --- 1. GLOBAL STATE & DATA ---
let quizState = { 
    xp: 24500, 
    streak: 14, 
    currentLevel: 1, 
    correctInARow: 0, 
    usedQuestions: [] 
};

const mentors = [
    { name: "Alex Rivera", spec: "Full Stack Expert", emoji: "👨‍🚀", price: "$45" },
    { name: "Sarah Chen", spec: "AI & Neural Nets", emoji: "👩‍💻", price: "$60" },
    { name: "Marcus Vane", spec: "Cybersecurity", emoji: "🕵️‍♂️", price: "$55" },
    { name: "Elena Ross", spec: "UI/UX Architect", emoji: "🦄", price: "$40" },
    { name: "D-01 Bot", spec: "Logic Engine", emoji: "🤖", price: "Free" }
];

const leaders = [
    { name: "SARAH TECH", streak: "45", xp: "12,400" },
    { name: "CODEKING", streak: "22", xp: "11,200" },
    { name: "DEVMASTER", streak: "18", xp: "9,800" }
];

// --- 2. THREE.JS STARFIELD ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starfield'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(3000 * 3);
for(let i=0; i<9000; i++) starPos[i] = (Math.random() - 0.5) * 1000;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.8})));
camera.position.z = 1;
function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); } animate();

// --- 3. LIFECYCLE ---
window.onload = () => {
    const tl = gsap.timeline();
    tl.to(".intro-lx", { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" });
    tl.to("#welcome-msg", { opacity: 1, duration: 1 }, "-=0.5");
    tl.to("#intro-overlay", { opacity: 0, display: "none", duration: 1, delay: 1, onStart: () => {
        gsap.to("#sidebar", { x: 0, duration: 0.6 });
        lucide.createIcons();
        initMentors();
        initLeaderboard();
    }});
};

// --- 4. NAVIGATION ---
function closeOverlays() {
    document.querySelectorAll('.overlay').forEach(o => { o.style.display = 'none'; o.style.opacity = '0'; });
}
function openMentors() { closeOverlays(); showOverlay('mentor-overlay'); }
function openLeaderboard() { closeOverlays(); showOverlay('leaderboard-overlay'); }
function triggerPractice() { closeOverlays(); showOverlay('practice-overlay'); fetchQuizQuestion(); }
function openProfile(n, s, x) {
    closeOverlays();
    document.getElementById('prof-name').innerHTML = `IDENTITY: <span class="text-blue-500">${n}</span>`;
    document.getElementById('prof-streak').innerText = `🔥 ${s}`;
    document.getElementById('prof-xp').innerText = x;
    showOverlay('profile-overlay');
    initBadge3D();
}
function showOverlay(id) {
    const el = document.getElementById(id);
    if(el) { el.style.display = 'block'; gsap.to(el, { opacity: 1, duration: 0.5 }); }
}

// --- 5. LEVEL OVERRIDE ---
function manualLevelChange(val) {
    quizState.currentLevel = parseInt(val);
    quizState.correctInARow = 0;
    fetchQuizQuestion();
}

// --- 6. AI QUIZ LOGIC ---
async function fetchQuizQuestion() {
    const root = document.getElementById('quiz-root');
    root.innerHTML = `<div class="text-center py-20 text-blue-500 font-black italic animate-pulse tracking-widest">Neural Link: Level ${quizState.currentLevel}...</div>`;
    
    const selector = document.getElementById('level-selector');
    if(selector) selector.value = quizState.currentLevel;

    try {
        const res = await fetch('http://localhost:5000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                topic: "C++ Programming", 
                difficulty: `Level ${quizState.currentLevel}`, 
                exclude: quizState.usedQuestions 
            })
        });
        const data = await res.json();
        renderQuiz(data);
    } catch (e) {
        root.innerHTML = `<div class="text-red-500 font-black uppercase text-center">Backend Offline! Check server.js</div>`;
    }
}

function renderQuiz(q) {
    document.getElementById('quiz-root').innerHTML = `
        <div class="bg-white/5 border border-white/10 p-10 rounded-[3rem]">
            <div class="flex justify-between items-center mb-8 text-[10px] font-black italic uppercase">
                <div class="flex gap-4">
                    <span class="text-orange-500">🔥 Streak: ${quizState.streak}</span>
                    <span class="text-green-400">📊 Lvl: ${quizState.currentLevel}</span>
                    <span class="text-purple-400">✅ Progress: ${quizState.correctInARow}/5</span>
                </div>
                <span class="text-blue-500">🏆 XP: ${quizState.xp}</span>
            </div>
            <h3 class="text-2xl font-bold mb-10">${q.question}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${q.options.map(o => `
                    <button class="q-opt border border-white/10 p-5 rounded-2xl text-left hover:bg-blue-500/10 transition font-bold" 
                            onclick="checkAnswer(this, '${o.replace(/'/g, "\\'")}', '${q.answer.replace(/'/g, "\\'")}', '${q.explanation.replace(/'/g, "\\'")}')">
                        ${o}
                    </button>`).join('')}
            </div>
            <div id="q-exp" class="hidden mt-8 p-6 bg-blue-500/10 border-l-4 border-blue-500 rounded-2xl text-sm italic"></div>
            <button id="q-next" onclick="fetchQuizQuestion()" class="hidden mt-8 w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition">Access Next Node</button>
        </div>`;
}

function checkAnswer(btn, sel, ans, exp) {
    const isCorrect = sel.trim().toLowerCase() === ans.trim().toLowerCase();
    document.querySelectorAll('.q-opt').forEach(b => b.disabled = true);

    if(isCorrect) {
        btn.style.background = "rgba(22, 163, 74, 0.4)";
        quizState.xp += 20; quizState.streak++; quizState.correctInARow++;
        
        // AUTO LEVEL UP LOGIC
        if(quizState.correctInARow >= 5 && quizState.currentLevel < 5) {
            quizState.currentLevel++;
            quizState.correctInARow = 0;
            setTimeout(() => alert(`🔥 NEURAL SYNC COMPLETE: Level Up to ${quizState.currentLevel}!`), 500);
        }
    } else {
        btn.style.background = "rgba(220, 38, 38, 0.4)";
        quizState.streak = 0; quizState.correctInARow = 0;
        quizState.xp = Math.max(0, quizState.xp - 10);
    }
    const expBox = document.getElementById('q-exp');
    expBox.innerHTML = `<p class="text-blue-400 font-black uppercase text-[10px] mb-2 tracking-tighter">Diagnostic Report</p>${exp}`;
    expBox.classList.remove('hidden');
    document.getElementById('q-next').classList.remove('hidden');
}

// --- 7. DATA RENDERING ---
function initMentors() {
    const grid = document.getElementById('mentor-grid'); if(!grid) return;
    grid.innerHTML = mentors.map(m => `<div class="bg-[#0b1120] border border-white/5 text-center p-8 rounded-[2.5rem] hover:border-blue-500 transition-all"><div class="text-4xl mb-4">${m.emoji}</div><h4 class="font-black text-[11px] uppercase italic text-white">${m.name}</h4><p class="text-[8px] text-blue-500 font-black uppercase tracking-[2px] mt-1 mb-6">${m.spec}</p><div class="flex flex-col gap-2"><button class="bg-blue-600/10 text-blue-400 text-[9px] font-black py-2 rounded-xl">Free Chat</button><button class="bg-white/5 text-white/50 text-[9px] font-black py-2 rounded-xl">Paid: ${m.price}/hr</button></div></div>`).join('');
}
function initLeaderboard() {
    const list = document.getElementById('leader-list'); if(!list) return;
    list.innerHTML = leaders.map(l => `<div class="bg-[#0b1120] border border-white/5 flex justify-between items-center p-6 rounded-[2rem] hover:border-blue-500/50 transition-all"><span class="font-black italic text-sm uppercase text-white">${l.name}</span><div class="flex items-center gap-6"><span class="text-orange-500 text-xs font-bold">🔥 ${l.streak}</span><span class="text-blue-500 font-black text-xs uppercase italic">${l.xp} XP</span></div></div>`).join('');
}
function initBadge3D() {
    const canv = document.getElementById('badge-canvas'); if(!canv) return;
    const bRenderer = new THREE.WebGLRenderer({ canvas: canv, antialias: true, alpha: true });
    bRenderer.setSize(300, 300); const bScene = new THREE.Scene();
    const bMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), new THREE.MeshPhongMaterial({ color: 0x3b82f6, shininess: 100 }));
    bScene.add(bMesh); const light = new THREE.PointLight(0xffffff, 1.5); light.position.set(5,5,5); bScene.add(light, new THREE.AmbientLight(0x404040));
    const bCam = new THREE.PerspectiveCamera(45, 1, 0.1, 100); bCam.position.z = 5;
    function an() { requestAnimationFrame(an); bMesh.rotation.y += 0.02; bRenderer.render(bScene, bCam); } an();
}