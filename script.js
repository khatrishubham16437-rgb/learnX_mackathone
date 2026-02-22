// --- 1. STARFIELD BACKGROUND (Dost ka code) ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('starfield'), antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const starGeo = new THREE.BufferGeometry();
const starPos = new Float32Array(3000 * 3);
for(let i=0; i<9000; i++) starPos[i] = (Math.random() - 0.5) * 1000;
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
scene.add(new THREE.Points(starGeo, new THREE.PointsMaterial({color: 0xffffff, size: 0.8})));
camera.position.z = 1;
function animateStars() { requestAnimationFrame(animateStars); renderer.render(scene, camera); }
animateStars();

// --- 2. INTRO TIMELINE ---
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

// --- 3. OVERLAY NAVIGATION ---
function closeOverlays() {
    document.querySelectorAll('.overlay').forEach(o => {
        o.style.display = 'none';
        o.style.opacity = '0';
    });
}

function openMentors() { closeOverlays(); const el = document.getElementById('mentor-overlay'); el.style.display = 'block'; gsap.to(el, { opacity: 1, duration: 0.5 }); }
function openLeaderboard() { closeOverlays(); const el = document.getElementById('leaderboard-overlay'); el.style.display = 'block'; gsap.to(el, { opacity: 1, duration: 0.5 }); }
function openProfile(n, s, x) { 
    closeOverlays(); 
    document.getElementById('prof-name').innerHTML = `IDENTITY: <span class="text-blue-500">${n}</span>`;
    document.getElementById('prof-streak').innerText = `🔥 ${s}`;
    document.getElementById('prof-xp').innerText = x;
    const el = document.getElementById('profile-overlay'); el.style.display = 'block'; gsap.to(el, { opacity: 1, duration: 0.5 });
    initBadge3D(); 
}

// --- 4. DATA RENDERING (Exact Screenshot Look) ---
function initMentors() {
    const mentors = [
        { name: "Alex Rivera", spec: "Full Stack Expert", emoji: "👨‍🚀", price: "$45" },
        { name: "Sarah Chen", spec: "AI & Neural Nets", emoji: "👩‍💻", price: "$60" },
        { name: "Marcus Vane", spec: "Cybersecurity", emoji: "🕵️‍♂️", price: "$55" },
        { name: "Elena Ross", spec: "UI/UX Architect", emoji: "🦄", price: "$40" },
        { name: "D-01 Bot", spec: "Logic Engine", emoji: "🤖", price: "Free" }
    ];
    document.getElementById('mentor-grid').innerHTML = mentors.map(m => `
        <div class="bg-[#0b1120] border border-white/5 text-center p-8 rounded-[2.5rem] hover:border-blue-500 transition-all">
            <div class="text-4xl mb-4">${m.emoji}</div>
            <h4 class="font-black text-[11px] uppercase italic tracking-tight text-white">${m.name}</h4>
            <p class="text-[8px] text-blue-500 font-black uppercase tracking-[2px] mt-1 mb-6">${m.spec}</p>
            <div class="flex flex-col gap-2">
                <button class="bg-blue-600/10 text-blue-400 text-[9px] font-black py-2 rounded-xl uppercase">Free Chat</button>
                <button class="bg-white/5 text-white/50 text-[9px] font-black py-2 rounded-xl uppercase">Paid: ${m.price}/hr</button>
            </div>
        </div>
    `).join('');
}

function initLeaderboard() {
    const leaders = [
        { name: "SARAH TECH", streak: "45", xp: "12,400" },
        { name: "CODEKING", streak: "22", xp: "11,200" },
        { name: "DEVMASTER", streak: "18", xp: "9,800" }
    ];
    document.getElementById('leader-list').innerHTML = leaders.map(l => `
        <div class="bg-[#0b1120] border border-white/5 flex justify-between items-center p-6 rounded-[2rem] hover:border-blue-500/50 transition-all">
            <span class="font-black italic text-sm uppercase tracking-tighter text-white">${l.name}</span>
            <div class="flex items-center gap-6">
                <span class="text-orange-500 text-xs font-bold">🔥 ${l.streak}</span>
                <span class="text-blue-500 font-black text-xs uppercase italic">${l.xp} XP</span>
            </div>
        </div>
    `).join('');
}

// --- 5. QUIZ LOGIC (Llama 3.2 Backend) ---
let quizState = { xp: 24500, streak: 14, usedQuestions: [] };

function triggerPractice() {
    closeOverlays();
    const el = document.getElementById('practice-overlay');
    el.style.display = 'block'; gsap.to(el, { opacity: 1, duration: 0.5 });
    fetchQuizQuestion();
}

async function fetchQuizQuestion() {
    const root = document.getElementById('quiz-root');
    root.innerHTML = `<div class="text-center py-20 text-blue-500 font-black italic animate-pulse">Neural Link Initializing...</div>`;
    try {
        const res = await fetch('http://localhost:5000/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: "C++ Masterclass", difficulty: "Level 4", exclude: quizState.usedQuestions })
        });
        const data = await res.json();
        renderQuiz(data);
    } catch (e) { root.innerHTML = `<div class="text-red-500 font-black uppercase text-center">Backend Offline! Start server.js first.</div>`; }
}

function renderQuiz(q) {
    document.getElementById('quiz-root').innerHTML = `
        <div class="bg-white/5 border border-white/10 p-10 rounded-[3rem]">
            <div class="flex justify-between mb-8">
                <span class="text-orange-500 font-black italic">🔥 STREAK: ${quizState.streak}</span>
                <span class="text-blue-500 font-black italic">🏆 XP: ${quizState.xp}</span>
            </div>
            <h3 class="text-2xl font-bold mb-10 leading-snug">${q.question}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${q.options.map(o => `<button class="q-opt" onclick="checkAnswer(this, '${o}', '${q.answer}', '${q.explanation.replace(/'/g, "\\'")}')">${o}</button>`).join('')}
            </div>
            <div id="q-exp" class="hidden mt-8 p-6 bg-blue-500/10 border-l-4 border-blue-500 rounded-2xl"></div>
            <button id="q-next" onclick="fetchQuizQuestion()" class="hidden mt-8 w-full bg-blue-600 py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition">Next Challenge</button>
        </div>`;
}

function checkAnswer(btn, sel, ans, exp) {
    const correct = sel.trim() === ans.trim();
    if(correct) { btn.classList.add('bg-green-600'); quizState.xp += 20; quizState.streak++; }
    else { btn.classList.add('bg-red-600'); quizState.streak = 0; }
    document.getElementById('q-exp').innerHTML = `<p class="text-[10px] font-black text-blue-400 mb-2 uppercase tracking-widest">Analysis</p><p class="text-sm text-gray-300 leading-relaxed">${exp}</p>`;
    document.getElementById('q-exp').classList.remove('hidden');
    document.getElementById('q-next').classList.remove('hidden');
    document.querySelectorAll('.q-opt').forEach(b => b.disabled = true);
}

// --- 6. 3D BADGE ---
function initBadge3D() {
    const canv = document.getElementById('badge-canvas');
    const bRenderer = new THREE.WebGLRenderer({ canvas: canv, antialias: true, alpha: true });
    bRenderer.setSize(300, 300);
    const bScene = new THREE.Scene();
    const bMesh = new THREE.Mesh(new THREE.OctahedronGeometry(1.5, 0), new THREE.MeshPhongMaterial({ color: 0x3b82f6, shininess: 100 }));
    bScene.add(bMesh);
    const light = new THREE.PointLight(0xffffff, 1.5); light.position.set(5,5,5); bScene.add(light, new THREE.AmbientLight(0x404040));
    const bCam = new THREE.PerspectiveCamera(45, 1, 0.1, 100); bCam.position.z = 5;
    function an() { requestAnimationFrame(an); bMesh.rotation.y += 0.02; bRenderer.render(bScene, bCam); } an();
}