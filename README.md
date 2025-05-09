# Alien Synth Pad

An interactive web application that generates ambient/alien sounds with visual effects. Press any letter key to create unique sounds, and press ESC to stop all sounds.

## Features
- Interactive sound generation with Web Audio API
- Real-time circular visualizer
- Responsive full-screen canvas
- Unique alien/ambient sound synthesis

## Running Locally

### Using Docker 
```bash
# Build the Docker image
docker build -t alien-synth-pad .

# Run the container
docker run -p 8080:80 alien-synth-pad
```

### Security Checks
```bash
trivy fs .
```

## Deployment
The application is deployed to Google Cloud Run. Required secrets for deployment:
- `GCP_PROJECT_ID`: Google Cloud Platform project ID
- `SA_KEY`: Google Cloud service account credentials (JSON)