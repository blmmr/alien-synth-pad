provider "google" {
  project = var.project_id
  region  = "eu-north2"
}

# Enable required APIs
resource "google_project_service" "required_apis" {
  for_each = toset([
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "cloudbuild.googleapis.com"
  ])

  project = var.project_id
  service = each.key

  disable_dependent_services = false
  disable_on_destroy         = false
}

# Create Artifact Registry repository
resource "google_artifact_registry_repository" "app_repo" {
  location      = var.region
  repository_id = "alien-synth-pad"
  description   = "Docker repository for Alien Synth Pad application"
  format        = "DOCKER"

  depends_on = [google_project_service.required_apis]
}

# Create Cloud Run service
resource "google_cloud_run_v2_service" "app" {
  name     = "alien-synth-pad"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.app_repo.repository_id}/alien-synth-pad:latest"

      resources {
        limits = {
          cpu    = "1000m"
          memory = "512Mi"
        }
      }

      ports {
        container_port = 8080
      }
    }
  }

  depends_on = [google_project_service.required_apis]
}

# Make the service publicly accessible
resource "google_cloud_run_service_iam_member" "public" {
  location = google_cloud_run_v2_service.app.location
  project  = google_cloud_run_v2_service.app.project
  service  = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "allUsers"
} 