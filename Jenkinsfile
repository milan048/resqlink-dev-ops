pipeline {
    agent any

    environment {
        DOCKER = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        KUBECTL = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe'
        MINIKUBE = 'C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe'
    }

    stages {

        stage('Test') {
            steps {
                bat '''
                    echo =========================
                    echo Running Automated Tests
                    echo =========================

                    "%DOCKER%" run --rm ^
                    -v "%CD%:/workspace" ^
                    -w /workspace ^
                    python:3.12-slim ^
                    sh -c "pip install --no-cache-dir -r requirements.txt pytest && pytest tests -v"
                '''
            }
        }

        stage('Start Minikube') {
            steps {
                bat '''
                    echo =========================
                    echo Starting Minikube
                    echo =========================

                    "%MINIKUBE%" start -p minikube

                    "%KUBECTL%" config use-context minikube
                '''
            }
        }

        stage('Build Backend Images') {
            steps {
                bat '''
                    echo =========================
                    echo Building Incident Service
                    echo =========================

                    "%DOCKER%" build ^
                    -t resqlink-main-incident-service:latest ^
                    -f incident-service/Dockerfile ^
                    .

                    echo =========================
                    echo Building Resource Service
                    echo =========================

                    "%DOCKER%" build ^
                    -t resqlink-main-resource-service:latest ^
                    -f resource-serivice/Dockerfile ^
                    .
                '''
            }
        }

        stage('Load Backend Images') {
            steps {
                bat '''
                    echo =========================
                    echo Loading Images into Minikube
                    echo =========================

                    "%MINIKUBE%" image load resqlink-main-incident-service:latest
                    "%MINIKUBE%" image load resqlink-main-resource-service:latest
                '''
            }
        }

        stage('Deploy Backend') {
            steps {

                bat '''
                    echo =========================
                    echo Checking Kubernetes Secret
                    echo =========================

                    "%KUBECTL%" get secret resqlink-secret

                    if errorlevel 1 (
                        echo.
                        echo ERROR: resqlink-secret is missing.
                        echo Create resqlink-secret in Minikube before running Jenkins.
                        exit /b 1
                    )

                    echo =========================
                    echo Deploying Backend Services
                    echo =========================

                    "%KUBECTL%" apply -f k8s/incident-service.yaml
                    "%KUBECTL%" apply -f k8s/incident-deployment.yaml

                    "%KUBECTL%" apply -f k8s/resource-service.yaml
                    "%KUBECTL%" apply -f k8s/resource-deployment.yaml
                '''

                powershell '''
                    Write-Host "Exposing Incident Service..."

                    & $env:KUBECTL patch service incident-service `
                        --type merge `
                        -p '{"spec":{"type":"NodePort","ports":[{"port":8000,"targetPort":8000,"nodePort":30080}]}}'

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to expose incident-service"
                    }

                    Write-Host "Exposing Resource Service..."

                    & $env:KUBECTL patch service resource-service `
                        --type merge `
                        -p '{"spec":{"type":"NodePort","ports":[{"port":8001,"targetPort":8001,"nodePort":30081}]}}'

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to expose resource-service"
                    }
                '''

                script {
                    env.MINIKUBE_IP = bat(
                        returnStdout: true,
                        script: '"%MINIKUBE%" ip -p minikube'
                    ).trim()

                    echo "Minikube IP: ${env.MINIKUBE_IP}"
                }
            }
        }

        stage('Build Frontend') {
            steps {
                bat '''
                    echo =========================
                    echo Building Frontend
                    echo =========================

                    "%DOCKER%" build ^
                    --build-arg VITE_INCIDENT_SERVICE_URL=http://%MINIKUBE_IP%:30080 ^
                    --build-arg VITE_RESOURCE_SERVICE_URL=http://%MINIKUBE_IP%:30081 ^
                    -t resqlink-main-frontend:latest ^
                    ./frontend
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {

                bat '''
                    echo =========================
                    echo Loading Frontend Image
                    echo =========================

                    "%MINIKUBE%" image load resqlink-main-frontend:latest

                    echo =========================
                    echo Deploying Frontend
                    echo =========================

                    "%KUBECTL%" apply -f k8s/frontend-service.yaml
                    "%KUBECTL%" apply -f k8s/frontend-deployment.yaml
                '''

                powershell '''
                    Write-Host "Setting Frontend NodePort..."

                    & $env:KUBECTL patch service frontend-service `
                        --type merge `
                        -p '{"spec":{"type":"NodePort","ports":[{"port":80,"targetPort":80,"nodePort":30082}]}}'

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to expose frontend-service"
                    }
                '''

                bat '''
                    echo =========================
                    echo Updating Backend CORS URL
                    echo =========================

                    "%KUBECTL%" set env deployment/incident-service FRONTEND_URL=http://%MINIKUBE_IP%:30082
                    "%KUBECTL%" set env deployment/resource-service FRONTEND_URL=http://%MINIKUBE_IP%:30082
                '''
            }
        }

        stage('Deployment Status') {
            steps {
                bat '''
                    echo =========================
                    echo Waiting for Deployments
                    echo =========================

                    "%KUBECTL%" rollout status deployment/incident-service --timeout=180s
                    "%KUBECTL%" rollout status deployment/resource-service --timeout=180s
                    "%KUBECTL%" rollout status deployment/frontend --timeout=180s
                '''
            }
        }

        stage('Verify') {
            steps {
                bat '''
                    echo =========================
                    echo Kubernetes Pods
                    echo =========================

                    "%KUBECTL%" get pods

                    echo =========================
                    echo Kubernetes Services
                    echo =========================

                    "%KUBECTL%" get services

                    echo =========================
                    echo Kubernetes Deployments
                    echo =========================

                    "%KUBECTL%" get deployments
                '''

                powershell '''
                    $incidentUrl = "http://$env:MINIKUBE_IP`:30080/docs"
                    $resourceUrl = "http://$env:MINIKUBE_IP`:30081/docs"
                    $frontendUrl = "http://$env:MINIKUBE_IP`:30082"

                    Write-Host "Checking Incident Service..."
                    Invoke-WebRequest $incidentUrl -UseBasicParsing -TimeoutSec 30 | Out-Null

                    Write-Host "Checking Resource Service..."
                    Invoke-WebRequest $resourceUrl -UseBasicParsing -TimeoutSec 30 | Out-Null

                    Write-Host "Checking Frontend..."
                    Invoke-WebRequest $frontendUrl -UseBasicParsing -TimeoutSec 30 | Out-Null

                    Write-Host ""
                    Write-Host "======================================"
                    Write-Host " ResQLink Deployment Successful"
                    Write-Host "======================================"
                    Write-Host "Frontend : http://$env:MINIKUBE_IP`:30082"
                    Write-Host "Incident : http://$env:MINIKUBE_IP`:30080/docs"
                    Write-Host "Resource : http://$env:MINIKUBE_IP`:30081/docs"
                    Write-Host "======================================"
                '''
            }
        }
    }

    post {
        success {
            echo 'ResQLink Jenkins CI/CD Pipeline completed successfully.'
        }

        failure {
            echo 'ResQLink Jenkins Pipeline failed. Check the stage where the error occurred.'
        }
    }
}