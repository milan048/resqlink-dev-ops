pipeline {
    agent any

    environment {
      DOCKER = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
      MINIKUBE = 'C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe'

      DOCKER_DIR = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'
      MINIKUBE_DIR = 'C:\\Program Files\\Kubernetes\\Minikube'

      INCIDENT_IMAGE = 'resqlink-main-incident-service:latest'
      RESOURCE_IMAGE = 'resqlink-main-resource-service:latest'
      FRONTEND_IMAGE = 'resqlink-main-frontend:latest'
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
            echo Starting / Checking Minikube
            echo =========================

            set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

            "%MINIKUBE%" start -p minikube --driver=docker

            if errorlevel 1 (
                echo ERROR: Minikube could not start.
                exit /b 1
            )

            echo =========================
            echo Kubernetes Nodes
            echo =========================

            "%MINIKUBE%" kubectl -- get nodes

            if errorlevel 1 (
                echo ERROR: Kubernetes is not reachable.
                exit /b 1
            )
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
                    -t "%INCIDENT_IMAGE%" ^
                    -f incident-service/Dockerfile ^
                    .

                    if errorlevel 1 exit /b 1

                    echo =========================
                    echo Building Resource Service
                    echo =========================

                    "%DOCKER%" build ^
                    -t "%RESOURCE_IMAGE%" ^
                    -f resource-serivice/Dockerfile ^
                    .

                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Load Backend Images') {
            steps {
                bat '''
                    echo =========================
                    echo Loading Images into Minikube
                    echo =========================

                    "%MINIKUBE%" image load "%INCIDENT_IMAGE%"

                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" image load "%RESOURCE_IMAGE%"

                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Check Kubernetes Secret') {
            steps {
                bat '''
                    echo =========================
                    echo Checking Kubernetes Secret
                    echo =========================

                    "%MINIKUBE%" kubectl -- get secret resqlink-secret

                    if errorlevel 1 (
                        echo.
                        echo ERROR: resqlink-secret was not found.
                        echo Check the secret in the Minikube cluster.
                        exit /b 1
                    )
                '''
            }
        }

        stage('Deploy Backend') {
            steps {
                bat '''
                    echo =========================
                    echo Deploying Backend
                    echo =========================

                    "%MINIKUBE%" kubectl -- apply -f k8s/incident-service.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/incident-deployment.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/resource-service.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/resource-deployment.yaml
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Expose Backend') {
            steps {
                powershell '''
                    Write-Host "Exposing Incident Service..."

                    & $env:MINIKUBE kubectl -- patch service incident-service `
                        --type merge `
                        -p '{"spec":{"type":"NodePort","ports":[{"port":8000,"targetPort":8000,"nodePort":30080}]}}'

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to expose incident-service"
                    }

                    Write-Host "Exposing Resource Service..."

                    & $env:MINIKUBE kubectl -- patch service resource-service `
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

        stage('Build Frontend Image') {
            steps {
                bat '''
                    echo =========================
                    echo Building Frontend
                    echo =========================

                    "%DOCKER%" build ^
                    --build-arg VITE_INCIDENT_SERVICE_URL=http://%MINIKUBE_IP%:30080 ^
                    --build-arg VITE_RESOURCE_SERVICE_URL=http://%MINIKUBE_IP%:30081 ^
                    -t "%FRONTEND_IMAGE%" ^
                    ./frontend

                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Load Frontend Image') {
            steps {
                bat '''
                    echo =========================
                    echo Loading Frontend Image
                    echo =========================

                    "%MINIKUBE%" image load "%FRONTEND_IMAGE%"

                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Deploy Frontend') {
            steps {
                bat '''
                    echo =========================
                    echo Deploying Frontend
                    echo =========================

                    "%MINIKUBE%" kubectl -- apply -f k8s/frontend-service.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/frontend-deployment.yaml
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Expose Frontend') {
            steps {
                powershell '''
                    Write-Host "Exposing Frontend..."

                    & $env:MINIKUBE kubectl -- patch service frontend-service `
                        --type merge `
                        -p '{"spec":{"type":"NodePort","ports":[{"port":80,"targetPort":80,"nodePort":30082}]}}'

                    if ($LASTEXITCODE -ne 0) {
                        throw "Failed to expose frontend-service"
                    }
                '''
            }
        }

        stage('Configure CORS') {
            steps {
                bat '''
                    echo =========================
                    echo Configuring Backend CORS
                    echo =========================

                    "%MINIKUBE%" kubectl -- set env deployment/incident-service FRONTEND_URL=http://%MINIKUBE_IP%:30082

                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- set env deployment/resource-service FRONTEND_URL=http://%MINIKUBE_IP%:30082

                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Deployment Status') {
            steps {
                bat '''
                    echo =========================
                    echo Waiting for Deployments
                    echo =========================

                    "%MINIKUBE%" kubectl -- rollout status deployment/incident-service --timeout=180s
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- rollout status deployment/resource-service --timeout=180s
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- rollout status deployment/frontend --timeout=180s
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Verify') {
            steps {
                bat '''
                    echo =========================
                    echo PODS
                    echo =========================

                    "%MINIKUBE%" kubectl -- get pods

                    echo =========================
                    echo SERVICES
                    echo =========================

                    "%MINIKUBE%" kubectl -- get services

                    echo =========================
                    echo DEPLOYMENTS
                    echo =========================

                    "%MINIKUBE%" kubectl -- get deployments
                '''

                powershell '''
                    Write-Host ""
                    Write-Host "======================================"
                    Write-Host "     ResQLink Deployment Complete"
                    Write-Host "======================================"
                    Write-Host "Frontend : http://$env:MINIKUBE_IP`:30082"
                    Write-Host "Incident : http://$env:MINIKUBE_IP`:30080"
                    Write-Host "Resource : http://$env:MINIKUBE_IP`:30081"
                    Write-Host "======================================"
                '''
            }
        }
    }

    post {
        success {
            echo 'ResQLink CI/CD Pipeline completed successfully.'
        }

        failure {
            echo 'ResQLink CI/CD Pipeline failed.'
        }
    }
}