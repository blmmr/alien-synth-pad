# alien-synth-pad

This project generates alien-like ambient sounds triggered by keypresses and visualizes them in a circular spectrum using the Web Audio API and HTML5 Canvas.

The program is automatically deployed using GitHub Pages.

## Features

- Interactive sound generation via keyboard input
- ADSR envelopes, modulation, filters, and delay effects
- Circular spectrum visualizer with dynamic gradient
- Press any letter key to play a sound
- Press `Escape` to stop all sounds

## ⚙️ In progress
Circular vspectrum visualizer to be replaced with [circular-audio-wave](https://github.com/kelvinau/circular-audio-wave)

## CI/CD & Security

### ✅ GitHub Actions Workflow

This repo uses two workflows triggered on every push to `main`:

1. **Trivy Security Scanning**
   - Scans the full project directory in filesystem (`fs`) mode.
   - Outputs results to a `trivy.txt` file.
   - Publishes findings in the GitHub Actions summary.

2. **Deploy to GitHub Pages**
   - Automatically deploys static files in the root directory.
   - Makes the app available at GitHub Pages after every push.

### 📄 Key Workflow Files

- `.github/workflows/deploy.yml`:  
  Handles page deployment.

- `.github/workflows/security_check.yml`:  
  Installs and runs Trivy to check for vulnerabilities.

### 🔒 Security Tools Used

- [Trivy](https://github.com/aquasecurity/trivy): Vulnerability scanner for containers, filesystems, and Git repos.
  - Version: `v0.57.1`
  - Runs in GitHub-hosted Ubuntu runners.

### Sample Security Output (GitHub Summary)

<details>
<summary>Click to expand</summary>

```text
# Example Trivy output
testfile.js (node)
===================
Total: 0 (HIGH: 0, MEDIUM: 0, LOW: 0)