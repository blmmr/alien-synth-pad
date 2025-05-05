// initialize activeNodes array to keep track of active nodes
const activeNodes = [];

// main wrapper, makes sure the DOM is loaded before running the script
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    let audioContext = null;

    // Set canvas to full screen
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // Resize canvas on window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialize audio context on first interaction
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    // Generate alien/ambient sound
    function playAlienSound() {
        const actx = initAudio();

        // Add analyzer node
        const analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        // Frequency base
        const frequency = Math.random() * 300 + 100;

        // Oscillators
        const osc1 = actx.createOscillator();
        const osc2 = actx.createOscillator();
        osc1.type = osc2.type = 'sine';
        osc1.frequency.value = frequency;
        osc2.frequency.value = frequency * 1.01;

        // Modulation oscillator
        const modOsc = actx.createOscillator();
        const modGain = actx.createGain();
        modOsc.type = ['sine', 'sawtooth', 'square', 'triangle'][Math.floor(Math.random() * 4)];
        modOsc.frequency.value = Math.random() * 50 + 5;
        modGain.gain.value = Math.random() * 50 + 10;

        // Filter
        const filter = actx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = Math.random() * 3000 + 500;
        filter.Q.value = Math.random() * 10 + 1;

        // Filter LFO
        const filterLFO = actx.createOscillator();
        const filterLFOGain = actx.createGain();
        filterLFO.type = 'sine';
        filterLFO.frequency.value = 0.1 + Math.random() * 0.5;
        filterLFOGain.gain.value = 1000;
        filterLFO.connect(filterLFOGain);
        filterLFOGain.connect(filter.frequency);
        filterLFO.start();

        // Gain with ADSR envelope
        const gainNode = actx.createGain();
        const now = actx.currentTime;
        const attack = 0.5;
        const decay = 1.0;
        const sustain = 2.0;
        const release = 2.0;
        const maxGain = 0.3;
        const sustainLevel = 0.1;

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(maxGain, now + attack); // Attack
        gainNode.gain.linearRampToValueAtTime(sustainLevel, now + attack + decay); // Decay
        gainNode.gain.setValueAtTime(sustainLevel, now + attack + decay + sustain); // Sustain
        gainNode.gain.linearRampToValueAtTime(0.0001, now + attack + decay + sustain + release); // Release

        // Delay for reverb effect
        const delay = actx.createDelay();
        delay.delayTime.value = 0.5;
        const feedback = actx.createGain();
        feedback.gain.value = 0.4;
        delay.connect(feedback);
        feedback.connect(delay);

        // Connections
        modOsc.connect(modGain);
        modGain.connect(osc1.frequency);
        modGain.connect(osc2.frequency);
        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(delay);
        delay.connect(analyser);
        analyser.connect(actx.destination);

        // Start
        osc1.start();
        osc2.start();
        modOsc.start();
        // Keeps track of the active nodes
        activeNodes.push({osc1, osc2, modOsc, filterLFO, actx});

        const stopTime = now + attack + decay + sustain + release;
        osc1.stop(stopTime);
        osc2.stop(stopTime);
        modOsc.stop(stopTime);

        // Visualize
        drawCircularVisualizer(analyser, dataArray, bufferLength);
    }

    // drawCircularVisualizer
    function drawCircularVisualizer(analyser, dataArray, bufferLength) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(canvas.width, canvas.height) / 4;

        function draw() {
            // Clear canvas with fade effect
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Get frequency data
            analyser.getByteFrequencyData(dataArray);

            // Draw circular visualizer
            ctx.beginPath();
            for (let i = 0; i < bufferLength; i++) {
                const value = dataArray[i];
                const percent = value / 255;

                const angle = (i / bufferLength) * Math.PI * 2;
                const length = radius + (percent * radius);

                const x = centerX + Math.cos(angle) * length;
                const y = centerY + Math.sin(angle) * length;

                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }

            // Close the path
            ctx.closePath();

            // Create gradient
            const gradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius * 2);
            gradient.addColorStop(0, '#0000ff');
            gradient.addColorStop(0.5, '#0077ff');
            gradient.addColorStop(1, '#00ccff');

            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Continue animation
            requestAnimationFrame(draw);
        }

        draw();
    }


    // Stop all active sounds
    function stopAllSounds() {
        const now = audioContext?.currentTime || 0;
        activeNodes.forEach(({osc1, osc2, modOsc, filterLFO}) => {
            try {
                osc1.stop(now);
                osc2.stop(now);
                modOsc.stop(now);
                filterLFO.stop(now);
            } catch (e) {}
        });
        activeNodes.length = 0;
    }

    // Event listeners
    document.addEventListener('keydown', (event) => {
        if (/^[a-zA-Z]$/.test(event.key)) {
            playAlienSound();
        }
        if (event.key === 'Escape') {
            stopAllSounds();
        }        
    });
});
