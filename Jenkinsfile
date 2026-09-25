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

        MINIKUBE_HOME = 'C:\\Users\\Milan Chauhan\\.minikube'

        INCIDENT_IMAGE = 'resqlink-main-incident-service:latest'
        RESOURCE_IMAGE = 'resqlink-main-resource-service:latest'
        FRONTEND_IMAGE = 'resqlink-main-frontend:latest'

        FRONTEND_URL = 'http://127.0.0.1:13000'
        INCIDENT_URL = 'http://127.0.0.1:18000'
        RESOURCE_URL = 'http://127.0.0.1:18001'
    }

    stages {

        stage('Verify Environment') {
            steps {
                bat '''
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
                        echo Start Minikube manually before running Jenkins.
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
                '''
            }
        }

        stage('Automated Test') {
            steps {
                bat '''
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
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
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
                    --build-arg VITE_INCIDENT_SERVICE_URL=%INCIDENT_URL% ^
                    --build-arg VITE_RESOURCE_SERVICE_URL=%RESOURCE_URL% ^
                    -t "%FRONTEND_IMAGE%" ^
                    ./frontend

                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Load Images into Minikube') {
            steps {
                bat '''
                    echo ================================
                    echo Loading Docker Images
                    echo ================================

                    "%MINIKUBE%" image load "%INCIDENT_IMAGE%"

                    if errorlevel 1 exit /b 1


                    "%MINIKUBE%" image load "%RESOURCE_IMAGE%"

                    if errorlevel 1 exit /b 1


                    "%MINIKUBE%" image load "%FRONTEND_IMAGE%"

                    if errorlevel 1 exit /b 1
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
                        Write-Host "================================"
                        Write-Host "Creating Kubernetes Secret"
                        Write-Host "================================"

                        $yaml = & $env:MINIKUBE kubectl -- create secret generic resqlink-secret `
                            --from-literal="MONGODB_URL=$env:MONGODB_URL" `
                            --from-literal="JWT_SECRET_KEY=$env:JWT_SECRET_KEY" `
                            --dry-run=client `
                            -o yaml

                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to create Kubernetes secret YAML."
                        }

                        ($yaml -join "`n") | & $env:MINIKUBE kubectl -- apply -f -

                        if ($LASTEXITCODE -ne 0) {
                            throw "Failed to apply Kubernetes secret."
                        }

                        Write-Host "Kubernetes secret created successfully."
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                    echo ================================
                    echo Deploying ResQLink
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
                '''
            }
        }

        stage('Configure Application') {
            steps {
                bat '''
                    echo ================================
                    echo Configuring Backend CORS
                    echo ================================

                    "%MINIKUBE%" kubectl -- set env deployment/incident-service FRONTEND_URL=%FRONTEND_URL%

                    if errorlevel 1 exit /b 1


                    "%MINIKUBE%" kubectl -- set env deployment/resource-service FRONTEND_URL=%FRONTEND_URL%

                    if errorlevel 1 exit /b 1


                    echo ================================
                    echo Restarting Deployments
                    echo ================================

                    "%MINIKUBE%" kubectl -- rollout restart deployment/incident-service
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- rollout restart deployment/resource-service
                    if errorlevel 1 exit /b 1

                    "%MINIKUBE%" kubectl -- rollout restart deployment/frontend
                    if errorlevel 1 exit /b 1
                '''
            }
        }

        stage('Deployment Status') {
            steps {
                bat '''
                    echo ================================
                    echo Waiting for Deployments
                    echo ================================

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
                    echo.
                    echo ========================================
                    echo             PODS
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get pods

                    echo.
                    echo ========================================
                    echo             SERVICES
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get services

                    echo.
                    echo ========================================
                    echo          DEPLOYMENTS
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get deployments

                    echo.
                    echo ========================================
                    echo          SECRET
                    echo ========================================

                    "%MINIKUBE%" kubectl -- get secret resqlink-secret

                    echo.
                    echo ========================================
                    echo     RESQLINK CI/CD SUCCESS
                    echo ========================================
                '''
            }
        }
    }

    post {
        success {
            echo 'ResQLink CI/CD Pipeline completed successfully.'
            echo 'Run the port-forward commands from your Windows terminal to access the Kubernetes application.'
        }

        failure {
            echo 'ResQLink CI/CD Pipeline failed. Check the failed stage above.'
        }
    }
}