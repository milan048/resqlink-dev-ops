pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 20, unit: 'MINUTES')
    }

    environment {
        DOCKER = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        MINIKUBE = 'C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe'

        DOCKER_DIR = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'
        MINIKUBE_DIR = 'C:\\Program Files\\Kubernetes\\Minikube'

        MINIKUBE_HOME = 'C:\\Users\\Milan Chauhan\\.minikube'

        INCIDENT_IMAGE = 'resqlink-main-incident-service:latest'
        RESOURCE_IMAGE = 'resqlink-main-resource-service:latest'
        FRONTEND_IMAGE = 'resqlink-main-frontend:latest'
    }

    stages {

        stage('Verify Environment') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo ================================
                    echo Checking Docker
                    echo ================================

                    "%DOCKER%" --version
                    "%DOCKER%" info

                    if errorlevel 1 (
                        echo ERROR: Docker is not running.
                        exit /b 1
                    )

                    echo ================================
                    echo Checking Minikube
                    echo ================================

                    "%MINIKUBE%" version
                    "%MINIKUBE%" status -p minikube

                    if errorlevel 1 (
                        echo ERROR: Minikube is not running.
                        exit /b 1
                    )

                    echo ================================
                    echo Checking Kubernetes
                    echo ================================

                    "%MINIKUBE%" kubectl -- get nodes

                    if errorlevel 1 (
                        echo ERROR: Kubernetes is not reachable.
                        exit /b 1
                    )

                    echo Environment check successful.
                '''
            }
        }

        stage('Automated Test') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo ================================
                    echo Running Automated Tests
                    echo ================================

                    "%DOCKER%" run --rm ^
                    -v "%CD%:/workspace" ^
                    -w /workspace ^
                    python:3.12-slim ^
                    sh -c "pip install --no-cache-dir -r requirements.txt pytest && pytest tests -v"

                    if errorlevel 1 (
                        echo ERROR: Automated tests failed.
                        exit /b 1
                    )

                    echo Automated tests passed.
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo ================================
                    echo Building Incident Service
                    echo ================================

                    "%DOCKER%" build ^
                    -t "%INCIDENT_IMAGE%" ^
                    -f incident-service/Dockerfile ^
                    .

                    if errorlevel 1 exit /b 1


                    echo ================================
                    echo Building Resource Service
                    echo ================================

                    "%DOCKER%" build ^
                    -t "%RESOURCE_IMAGE%" ^
                    -f resource-serivice/Dockerfile ^
                    .

                    if errorlevel 1 exit /b 1


                    echo ================================
                    echo Building Frontend
                    echo ================================

                    "%DOCKER%" build ^
                    --build-arg VITE_INCIDENT_SERVICE_URL=http://127.0.0.1:18000 ^
                    --build-arg VITE_RESOURCE_SERVICE_URL=http://127.0.0.1:18001 ^
                    -t "%FRONTEND_IMAGE%" ^
                    ./frontend

                    if errorlevel 1 exit /b 1

                    echo All Docker images built successfully.
                '''
            }
        }

        stage('Load Images into Minikube') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo ================================
                    echo Loading Images into Minikube
                    echo ================================

                    "%MINIKUBE%" image load "%INCIDENT_IMAGE%"

                    if errorlevel 1 exit /b 1


                    "%MINIKUBE%" image load "%RESOURCE_IMAGE%"

                    if errorlevel 1 exit /b 1


                    "%MINIKUBE%" image load "%FRONTEND_IMAGE%"

                    if errorlevel 1 exit /b 1

                    echo Images loaded successfully.
                '''
            }
        }

        stage('Create Kubernetes Secret') {
            steps {
                withCredentials([
                    string(
                        credentialsId: 'resqlink-mongodb-url',
                        variable: 'MONGODB_URL'
                    ),
                    string(
                        credentialsId: 'resqlink-jwt-secret',
                        variable: 'JWT_SECRET_KEY'
                    )
                ]) {
                    powershell '''
                        $env:Path = "$env:DOCKER_DIR;$env:MINIKUBE_DIR;$env:Path"

                        if ([string]::IsNullOrWhiteSpace($env:MONGODB_URL)) {
                            throw "MONGODB_URL Jenkins credential is empty."
                        }

                        if ([string]::IsNullOrWhiteSpace($env:JWT_SECRET_KEY)) {
                            throw "JWT_SECRET_KEY Jenkins credential is empty."
                        }

                        Write-Host "================================"
                        Write-Host "Creating Kubernetes Secret"
                        Write-Host "================================"

                        $yaml = & $env:MINIKUBE kubectl -- create secret generic resqlink-secret `
                            --from-literal="MONGODB_URL=$env:MONGODB_URL" `
                            --from-literal="JWT_SECRET_KEY=$env:JWT_SECRET_KEY" `
                            --dry-run=client `
                            -o yaml

                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to generate Kubernetes secret."
                        }

                        $yaml | & $env:MINIKUBE kubectl -- apply -f -

                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to apply Kubernetes secret."
                        }

                        Write-Host "Kubernetes secret created successfully."
                    '''
                }
            }
        }

        stage('Deploy Kubernetes') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo ================================
                    echo Deploying Kubernetes Resources
                    echo ================================

                    "%MINIKUBE%" kubectl -- apply -f k8s/incident-service.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/incident-deployment.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/resource-service.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/resource-deployment.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/frontend-service.yaml
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- apply -f k8s/frontend-deployment.yaml
                    if errorlevel 1 exit /b 1

                    echo Kubernetes resources applied successfully.
                '''
            }
        }

        stage('Configure Backend') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo ================================
                    echo Configuring Backend CORS
                    echo ================================

                    "%MINIKUBE%" kubectl -- set env deployment/incident-service ^
                    FRONTEND_URL=http://127.0.0.1:13000

                    if errorlevel 1 exit /b 1


                    "%MINIKUBE%" kubectl -- set env deployment/resource-service ^
                    FRONTEND_URL=http://127.0.0.1:13000

                    if errorlevel 1 exit /b 1

                    echo Backend configuration updated.
                '''
            }
        }

        stage('Wait for Deployments') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo ================================
                    echo Waiting for Incident Service
                    echo ================================

                    "%MINIKUBE%" kubectl -- rollout status deployment/incident-service --timeout=180s

                    if errorlevel 1 exit /b 1


                    echo ================================
                    echo Waiting for Resource Service
                    echo ================================

                    "%MINIKUBE%" kubectl -- rollout status deployment/resource-service --timeout=180s

                    if errorlevel 1 exit /b 1


                    echo ================================
                    echo Waiting for Frontend
                    echo ================================

                    "%MINIKUBE%" kubectl -- rollout status deployment/frontend --timeout=180s

                    if errorlevel 1 exit /b 1

                    echo All deployments are ready.
                '''
            }
        }

        stage('Verify') {
            steps {
                bat '''
                    set "PATH=%DOCKER_DIR%;%MINIKUBE_DIR%;%PATH%"

                    echo.
                    echo ========================================
                    echo                 PODS
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get pods

                    echo.
                    echo ========================================
                    echo               SERVICES
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get services

                    echo.
                    echo ========================================
                    echo             DEPLOYMENTS
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get deployments

                    echo.
                    echo ========================================
                    echo                SECRET
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get secret resqlink-secret

                    echo.
                    echo ========================================
                    echo          RESQLINK DEPLOYED
                    echo ========================================
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