pipeline {
    agent any

    environment {
        MINIKUBE_HOME = "${env.USERPROFILE}\\.minikube"
        KUBECONFIG = "${env.USERPROFILE}\\.kube\\config"

        // Change these image names only if your Kubernetes YAML uses different names
        FRONTEND_IMAGE = "resqlink-frontend:latest"
        INCIDENT_IMAGE = "resqlink-incident-service:latest"

        MINIKUBE = "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe"
        KUBECTL = "C:\\Program Files\\Kubernetes\\Minikube\\kubectl.exe"
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out ResQLink source code...'

                checkout scm
            }
        }

        stage('Check Docker') {
            steps {
                bat '''
                    echo ========================================
                    echo Checking Docker
                    echo ========================================

                    docker version
                    docker info
                '''
            }
        }

        stage('Check Minikube') {
            steps {
                bat '''
                    echo ========================================
                    echo Checking Minikube
                    echo ========================================

                    "%MINIKUBE%" status

                    echo.
                    echo Checking Kubernetes nodes...
                    "%KUBECTL%" get nodes
                '''
            }
        }

        stage('Ensure Minikube Running') {
            steps {
                bat '''
                    echo ========================================
                    echo Ensuring Minikube is running
                    echo ========================================

                    "%MINIKUBE%" status

                    if errorlevel 1 (
                        echo Minikube is not running.
                        echo Starting Minikube with Docker driver...

                        "%MINIKUBE%" start --driver=docker

                        if errorlevel 1 (
                            echo ERROR: Minikube failed to start.
                            exit /b 1
                        )
                    ) else (
                        echo Minikube is already running.
                    )

                    echo.
                    echo Final Minikube status:
                    "%MINIKUBE%" status

                    echo.
                    echo Kubernetes nodes:
                    "%KUBECTL%" get nodes
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                    echo ========================================
                    echo Building Docker Images
                    echo ========================================

                    echo Current directory:
                    cd

                    echo.
                    echo Directory contents:
                    dir

                    echo.
                    echo Building ResQLink Docker images...

                    if exist frontend\\Dockerfile (
                        echo Building frontend image...
                        docker build -t %FRONTEND_IMAGE% frontend
                    )

                    if exist incident-service\\Dockerfile (
                        echo Building incident-service image...
                        docker build -t %INCIDENT_IMAGE% incident-service
                    )

                    if exist Dockerfile (
                        echo Root Dockerfile found.
                        docker build -t resqlink:latest .
                    )

                    echo.
                    echo Docker images:
                    docker images
                '''
            }
        }

        stage('Load Images into Minikube') {
            steps {
                bat '''
                    echo ========================================
                    echo Loading Docker Images into Minikube
                    echo ========================================

                    "%MINIKUBE%" image load %FRONTEND_IMAGE%

                    if errorlevel 1 (
                        echo WARNING: Could not load frontend image.
                    )

                    "%MINIKUBE%" image load %INCIDENT_IMAGE%

                    if errorlevel 1 (
                        echo WARNING: Could not load incident-service image.
                    )

                    echo.
                    echo Images available in Minikube:
                    "%MINIKUBE%" image ls
                '''
            }
        }

        stage('Check Kubernetes Files') {
            steps {
                bat '''
                    echo ========================================
                    echo Checking Kubernetes Files
                    echo ========================================

                    dir /s /b *.yaml
                    dir /s /b *.yml
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                    echo ========================================
                    echo Deploying ResQLink to Kubernetes
                    echo ========================================

                    echo Applying Kubernetes manifests...

                    if exist k8s (
                        "%KUBECTL%" apply -f k8s
                    ) else if exist kubernetes (
                        "%KUBECTL%" apply -f kubernetes
                    ) else if exist k8s.yaml (
                        "%KUBECTL%" apply -f k8s.yaml
                    ) else if exist deployment.yaml (
                        "%KUBECTL%" apply -f deployment.yaml
                    ) else (
                        echo ERROR: Kubernetes manifest directory/file not found.
                        echo Please check your repository structure.
                        exit /b 1
                    )

                    echo.
                    echo Kubernetes resources:
                    "%KUBECTL%" get all
                '''
            }
        }

        stage('Wait for Deployment') {
            steps {
                bat '''
                    echo ========================================
                    echo Waiting for Kubernetes Pods
                    echo ========================================

                    timeout /t 10 /nobreak

                    echo.
                    echo Pods:
                    "%KUBECTL%" get pods -o wide

                    echo.
                    echo Services:
                    "%KUBECTL%" get services

                    echo.
                    echo Deployments:
                    "%KUBECTL%" get deployments
                '''
            }
        }

        stage('Check Kubernetes') {
            steps {
                bat '''
                    echo ========================================
                    echo Kubernetes Health Check
                    echo ========================================

                    echo Nodes:
                    "%KUBECTL%" get nodes

                    echo.
                    echo All Pods:
                    "%KUBECTL%" get pods -A

                    echo.
                    echo Services:
                    "%KUBECTL%" get svc

                    echo.
                    echo Deployments:
                    "%KUBECTL%" get deployments
                '''
            }
        }

        stage('Check Deployment') {
            steps {
                bat '''
                    echo ========================================
                    echo Checking Deployment Status
                    echo ========================================

                    "%KUBECTL%" get deployments

                    "%KUBECTL%" get pods

                    echo.
                    echo Kubernetes events:
                    "%KUBECTL%" get events --sort-by=.lastTimestamp
                '''
            }
        }
    }

    post {

        success {
            echo '''
            ================================================
                     RESQLINK PIPELINE SUCCESS
            ================================================
            Kubernetes deployment completed successfully.
            '''
        }

        failure {
            echo '''
            ================================================
                     RESQLINK PIPELINE FAILED
            ================================================
            Collecting Kubernetes diagnostics...
            '''

            bat '''
                echo.
                echo ===== MINIKUBE STATUS =====
                "%MINIKUBE%" status

                echo.
                echo ===== KUBERNETES NODES =====
                "%KUBECTL%" get nodes

                echo.
                echo ===== ALL PODS =====
                "%KUBECTL%" get pods -A

                echo.
                echo ===== SERVICES =====
                "%KUBECTL%" get svc -A

                echo.
                echo ===== DEPLOYMENTS =====
                "%KUBECTL%" get deployments -A

                echo.
                echo ===== EVENTS =====
                "%KUBECTL%" get events -A --sort-by=.lastTimestamp
            '''
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}