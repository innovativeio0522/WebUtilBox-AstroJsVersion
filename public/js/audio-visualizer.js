let audioContext;
let analyser;
let dataArray;
let bufferLength;
let animationId;
let playerSource;
let micSource;
let demoBufferSource;
let demoGainNode;
let canvas;
let ctx;
let activeAudioUrl = null;

let currentSource = 'demo'; // 'demo', 'file', 'mic'
let isDemoPlaying = false;
let isDemoMuted = false;
let isInitialized = false;

// Generate a rich multi-frequency synth beat loop in memory (0KB download)
function createDemoAudioBuffer(ctx) {
    const sampleRate = ctx.sampleRate;
    const duration = 4.0; // 4 second loop
    const numSamples = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(2, numSamples, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);

    const bpm = 120;
    const beatLen = 60 / bpm; // 0.5s per beat

    for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate;
        const currentBeat = Math.floor(t / beatLen);
        const beatProgress = (t % beatLen) / beatLen;

        // Kick drum on every beat (0, 1, 2, 3)
        const kickEnv = Math.exp(-beatProgress * 18);
        const kickFreq = 160 * Math.exp(-beatProgress * 28) + 45;
        const kick = Math.sin(2 * Math.PI * kickFreq * t) * kickEnv * 0.75;

        // Hi-hat on 16th notes
        const subBeat = Math.floor(t / (beatLen / 4)) % 4;
        let hihat = 0;
        if (subBeat === 2 || subBeat === 0) {
            const hhProgress = (t % (beatLen / 4)) / (beatLen / 4);
            const hhEnv = Math.exp(-hhProgress * 35);
            hihat = (Math.random() * 2 - 1) * hhEnv * 0.15;
        }

        // Chords (Am - F - C - G)
        const chordFreqs = [
            [220, 261.63, 329.63], // Am
            [174.61, 220, 261.63], // F
            [130.81, 164.81, 196.00], // C
            [196.00, 246.94, 293.66]  // G
        ];
        const chordIdx = Math.floor(t / beatLen) % 4;
        const freqs = chordFreqs[chordIdx];

        let synth = 0;
        const synthEnv = Math.exp(-beatProgress * 3.5) * 0.35;
        freqs.forEach((freq, idx) => {
            const phase = (t * freq) % 1;
            const saw = (phase * 2 - 1);
            const sub = Math.sin(2 * Math.PI * (freq * (1 + (idx * 0.5))) * t);
            synth += (saw * 0.5 + sub * 0.5) * synthEnv;
        });

        // Bass synth line
        const bassFreq = freqs[0] / 2;
        const bassEnv = Math.exp(-beatProgress * 5);
        const bass = Math.sin(2 * Math.PI * bassFreq * t) * bassEnv * 0.45;

        const sample = Math.max(-1, Math.min(1, kick + hihat + synth + bass));
        left[i] = sample;
        right[i] = sample;
    }

    return buffer;
}

function initCanvas() {
    canvas = document.getElementById('visualizer');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth || 800;
    canvas.height = canvas.offsetHeight || 300;
}

function updateSourceUI(source) {
    currentSource = source;
    const btnDemo = document.getElementById('btnDemoSource');
    const btnUpload = document.getElementById('btnUploadSource');
    const btnMic = document.getElementById('btnMicSource');
    const demoBar = document.getElementById('demoControlBar');

    if (btnDemo) btnDemo.className = source === 'demo' ? 'btn btn-primary' : 'btn btn-secondary';
    if (btnUpload) btnUpload.className = source === 'file' ? 'btn btn-primary' : 'btn btn-secondary';
    if (btnMic) btnMic.className = source === 'mic' ? 'btn btn-primary' : 'btn btn-secondary';

    if (demoBar) {
        demoBar.style.display = source === 'demo' ? 'flex' : 'none';
    }
}

async function startDemoAudio() {
    stopVisualization();
    updateSourceUI('demo');

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
    }

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const buffer = createDemoAudioBuffer(audioContext);
    demoBufferSource = audioContext.createBufferSource();
    demoBufferSource.buffer = buffer;
    demoBufferSource.loop = true;

    demoGainNode = audioContext.createGain();
    demoGainNode.gain.value = isDemoMuted ? 0 : 0.8;

    demoBufferSource.connect(analyser);
    analyser.connect(demoGainNode);
    demoGainNode.connect(audioContext.destination);

    demoBufferSource.start(0);
    isDemoPlaying = true;

    // Handle browser autoplay policy restrictions smoothly
    if (audioContext.state === 'suspended') {
        const unlockAudio = async () => {
            if (audioContext && audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            window.removeEventListener('pointerdown', unlockAudio);
            window.removeEventListener('keydown', unlockAudio);
            window.removeEventListener('click', unlockAudio);
        };
        window.addEventListener('pointerdown', unlockAudio);
        window.addEventListener('keydown', unlockAudio);
        window.addEventListener('click', unlockAudio);
    }

    initCanvas();
    visualize();
    updateDemoUIState();

    if (window.trackToolEvent) {
        window.trackToolEvent('start_demo', 'audio-visualizer');
    }
}

function updateDemoUIState() {
    const playBtn = document.getElementById('toggleDemoPlayBtn');
    const muteBtn = document.getElementById('toggleDemoMuteBtn');
    const badge = document.getElementById('demoStatusBadge');

    if (playBtn) playBtn.textContent = isDemoPlaying ? '⏸ Pause Demo' : '▶ Play Demo';
    if (muteBtn) muteBtn.textContent = isDemoMuted ? '🔈 Unmute Audio' : '🔊 Mute Audio';
    if (badge) {
        if (!isDemoPlaying) {
            badge.innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #eab308;"></span> Demo Paused`;
        } else if (isDemoMuted) {
            badge.innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #3b82f6;"></span> Visualizer Active (Muted)`;
        } else {
            badge.innerHTML = `<span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #10b981;"></span> Playing Built-in Demo`;
        }
    }
}

async function switchSource(source) {
    if (source === 'demo') {
        await startDemoAudio();
    }
}

async function toggleDemoPlay() {
    if (currentSource !== 'demo') {
        await switchSource('demo');
        return;
    }
    if (isDemoPlaying) {
        if (demoBufferSource) {
            try { demoBufferSource.stop(); } catch(e){}
            demoBufferSource = null;
        }
        isDemoPlaying = false;
        showToast('Demo paused');
    } else {
        await startDemoAudio();
        showToast('Demo playing');
    }
    updateDemoUIState();
    if (window.trackToolEvent) {
        window.trackToolEvent(isDemoPlaying ? 'play_demo' : 'pause_demo', 'audio-visualizer');
    }
}

function toggleDemoMute() {
    isDemoMuted = !isDemoMuted;
    if (demoGainNode) {
        demoGainNode.gain.value = isDemoMuted ? 0 : 0.8;
    }
    updateDemoUIState();
    showToast(isDemoMuted ? 'Audio muted' : 'Audio unmuted');
    if (window.trackToolEvent) {
        window.trackToolEvent(isDemoMuted ? 'mute_demo' : 'unmute_demo', 'audio-visualizer');
    }
}

async function loadAudioFile() {
    const file = document.getElementById('audioFile').files[0];
    if (!file) return;

    stopVisualization();
    updateSourceUI('file');

    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
    if (!analyser) {
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        analyser.smoothingTimeConstant = 0.8;
    }

    const player = document.getElementById('audioPlayer');
    if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl);
    }
    activeAudioUrl = URL.createObjectURL(file);
    player.src = activeAudioUrl;
    document.getElementById('audioPlayerSection').style.display = 'block';

    if (!playerSource) {
        playerSource = audioContext.createMediaElementSource(player);
        playerSource.connect(analyser);
        analyser.connect(audioContext.destination);
    }

    bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    initCanvas();
    visualize();
    player.play();

    showToast('Audio file loaded!');
    if (window.trackToolEvent) {
        window.trackToolEvent('upload_audio', 'audio-visualizer', { file_name: file.name });
    }
}

async function useMicrophone() {
    try {
        stopVisualization();
        updateSourceUI('mic');

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        if (!analyser) {
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;
        }

        micSource = audioContext.createMediaStreamSource(stream);
        micSource.connect(analyser);

        bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);

        document.getElementById('audioPlayerSection').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'inline-block';

        initCanvas();
        visualize();

        showToast('Microphone active!');
        if (window.trackToolEvent) {
            window.trackToolEvent('use_microphone', 'audio-visualizer');
        }
    } catch (error) {
        showToast('Microphone access denied', true);
    }
}

function visualize() {
    const vizType = document.getElementById('vizType').value;
    if (animationId) cancelAnimationFrame(animationId);

    function draw() {
        animationId = requestAnimationFrame(draw);

        if (!analyser || !ctx || !canvas) return;

        if (vizType === 'bars') {
            drawBars();
        } else if (vizType === 'wave') {
            drawWaveform();
        } else if (vizType === 'circular') {
            drawCircular();
        } else if (vizType === 'mirror') {
            drawMirror();
        }
    }

    draw();
}

function drawBars() {
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = getColor(i, bufferLength);
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
    }
}

function drawWaveform() {
    analyser.getByteTimeDomainData(dataArray);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.lineWidth = 2;
    ctx.strokeStyle = getColor(0, 1);
    ctx.beginPath();

    const sliceWidth = canvas.width / bufferLength;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }

        x += sliceWidth;
    }

    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.stroke();
}

function drawCircular() {
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 50;
    const bars = 180;

    for (let i = 0; i < bars; i++) {
        const angle = (i / bars) * Math.PI * 2;
        const barHeight = (dataArray[i] / 255) * 100;

        const x1 = centerX + Math.cos(angle) * radius;
        const y1 = centerY + Math.sin(angle) * radius;
        const x2 = centerX + Math.cos(angle) * (radius + barHeight);
        const y2 = centerY + Math.sin(angle) * (radius + barHeight);

        ctx.strokeStyle = getColor(i, bars);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

function drawMirror() {
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height / 2);
        const color = getColor(i, bufferLength);
        
        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height / 2 - barHeight, barWidth, barHeight);
        ctx.fillRect(x, canvas.height / 2, barWidth, barHeight);
        
        x += barWidth + 1;
    }
}

function getColor(index, total) {
    const scheme = document.getElementById('colorScheme').value;
    
    if (scheme === 'rainbow') {
        const hue = (index / total) * 360;
        return `hsl(${hue}, 100%, 50%)`;
    } else if (scheme === 'orange') {
        return '#f97316';
    } else if (scheme === 'blue') {
        return '#3b82f6';
    } else if (scheme === 'green') {
        return '#10b981';
    } else if (scheme === 'purple') {
        return '#a855f7';
    } else if (scheme === 'red') {
        return '#ef4444';
    }
}

function updateSettings() {
    const smoothing = parseFloat(document.getElementById('smoothing').value);
    document.getElementById('smoothingValue').textContent = smoothing;
    
    if (analyser) {
        analyser.smoothingTimeConstant = smoothing;
    }

    if (animationId) {
        cancelAnimationFrame(animationId);
        visualize();
    }

    if (window.trackToolEvent) {
        window.trackToolEvent('change_setting', 'audio-visualizer', {
            viz_type: document.getElementById('vizType').value,
            color_scheme: document.getElementById('colorScheme').value,
            smoothing: smoothing
        });
    }
}

function stopVisualization() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }

    if (demoBufferSource) {
        try { demoBufferSource.stop(); } catch(e) {}
        demoBufferSource = null;
    }
    isDemoPlaying = false;

    if (micSource) {
        if (micSource.mediaStream) {
            micSource.mediaStream.getTracks().forEach(track => track.stop());
        }
        micSource.disconnect();
        micSource = null;
    }

    const player = document.getElementById('audioPlayer');
    player.pause();
    if (activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl);
        activeAudioUrl = null;
    }
    player.src = '';

    document.getElementById('stopBtn').style.display = 'none';

    if (ctx && canvas) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

function showToast(message, isError = false) {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toastMessage');
    if (!toast || !msg) return;
    msg.textContent = message;
    toast.className = 'toast show' + (isError ? ' error' : '');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

function runInitialAutoPlay() {
    if (isInitialized) return;
    isInitialized = true;
    initCanvas();
    startDemoAudio();
}

window.addEventListener('DOMContentLoaded', runInitialAutoPlay);
window.addEventListener('load', runInitialAutoPlay);
window.addEventListener('resize', () => {
    initCanvas();
});
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    runInitialAutoPlay();
}