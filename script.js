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
    
    // Generate alien sound
    function playAlienSound() {
        const actx = initAudio();
        
        // Add analyzer node
        const analyser = actx.createAnalyser();
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        // Create oscillators for alien sound
        const mainOsc = actx.createOscillator();
        const modOsc = actx.createOscillator();
        const gainNode = actx.createGain();
        const filter = actx.createBiquadFilter();
        
        // Random parameters for alien sound
        const frequency = Math.random() * 300 + 100;
        const modFrequency = Math.random() * 50 + 5;
        const modGain = actx.createGain();
        modGain.gain.value = Math.random() * 50 + 10;
        
        // Setup oscillators
        mainOsc.type = ['sine', 'sawtooth', 'square', 'triangle'][Math.floor(Math.random() * 4)];
        mainOsc.frequency.value = frequency;
        
        modOsc.type = ['sine', 'sawtooth', 'square', 'triangle'][Math.floor(Math.random() * 4)];
        modOsc.frequency.value = modFrequency;
        
        // Filter settings
        filter.type = 'lowpass';
        filter.frequency.value = Math.random() * 3000 + 500;
        filter.Q.value = Math.random() * 10 + 1;
        
        // Setup gain
        gainNode.gain.value = 0.3;
        gainNode.gain.setValueAtTime(0.3, actx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 1);
        
        // Connect nodes
        modOsc.connect(modGain);
        modGain.connect(mainOsc.frequency);
        mainOsc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(analyser);
        analyser.connect(actx.destination);
        
        // Play sound
        modOsc.start();
        mainOsc.start();
        
        // Visualize
        drawCircularVisualizer(analyser, dataArray, bufferLength);
        
        // Stop sound after a second
        modOsc.stop(actx.currentTime + 1);
        mainOsc.stop(actx.currentTime + 1);
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

    // Event listeners
    document.addEventListener('keydown', (event) => {
        // Only respond to letter keys
        if (/^[a-zA-Z]$/.test(event.key)) {
            playAlienSound();
        }
    });
});