
pipeline {

    agent any

    environment {
        // Actual paths from your Windows installation
        DOCKER = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        KUBECTL = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe'
        MINIKUBE = 'C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe'

        // ResQLink services
        INCIDENT_IMAGE = 'resqlink-incident-service:latest'
        RESOURCE_IMAGE = 'resqlink-resource-service:latest'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '========================================'
                echo 'Checking out ResQLink source code'
                echo '========================================'

                checkout scm
            }
        }


        stage('Check Project Structure') {
            steps {
                bat '''
                    echo ========================================
                    echo PROJECT STRUCTURE
                    echo ========================================

                    echo.
                    echo ===== ROOT DIRECTORY =====
                    dir /b

                    echo.
                    echo ===== INCIDENT SERVICE =====
                    if exist "incident-service" (
                        echo incident-service FOUND
                        dir /b "incident-service"
                    ) else (
                        echo ERROR: incident-service NOT FOUND
                        exit /b 1
                    )

                    echo.
                    echo ===== RESOURCE SERVICE =====
                    if exist "resource-serivice" (
                        echo resource-serivice FOUND
                        dir /b "resource-serivice"
                    ) else (
                        echo ERROR: resource-serivice NOT FOUND
                        exit /b 1
                    )

                    echo.
                    echo ===== DOCKERFILES =====
                    dir /s /b Dockerfile 2>nul

                    echo.
                    echo ===== KUBERNETES FILES =====
                    if exist "k8s" (
                        dir /s /b "k8s"
                    ) else (
                        echo WARNING: k8s directory not found at root
                    )
                '''
            }
        }


        stage('Check Docker') {
            steps {
                bat '''
                    echo ========================================
                    echo CHECKING DOCKER
                    echo ========================================

                    echo.
                    echo Docker executable:
                    "%DOCKER%" --version

                    echo.
                    echo Docker information:
                    "%DOCKER%" info
                '''
            }
        }


        stage('Check Minikube') {
            steps {
                bat '''
                    echo ========================================
                    echo CHECKING MINIKUBE
                    echo ========================================

                    echo.
                    echo Minikube version:
                    "%MINIKUBE%" version

                    echo.
                    echo Minikube status:
                    "%MINIKUBE%" status
                '''
            }
        }


        stage('Ensure Minikube Running') {
            steps {
                bat '''
                    echo ========================================
                    echo ENSURING MINIKUBE IS RUNNING
                    echo ========================================

                    "%MINIKUBE%" status

                    if errorlevel 1 (
                        echo.
                        echo Minikube is not running.
                        echo Starting Minikube with Docker driver...

                        "%MINIKUBE%" start --driver=docker

                        if errorlevel 1 (
                            echo ERROR: Failed to start Minikube
                            exit /b 1
                        )
                    ) else (
                        echo.
                        echo Minikube is already running.
                    )

                    echo.
                    echo ===== FINAL MINIKUBE STATUS =====
                    "%MINIKUBE%" status
                '''
            }
        }


        stage('Check Kubernetes Connection') {
            steps {
                bat '''
                    echo ========================================
                    echo CHECKING KUBERNETES CONNECTION
                    echo ========================================

                    echo.
                    echo ===== KUBECTL VERSION =====
                    "%KUBECTL%" version --client

                    echo.
                    echo ===== KUBERNETES NODES =====
                    "%KUBECTL%" get nodes

                    if errorlevel 1 (
                        echo ERROR: kubectl cannot connect to Kubernetes
                        exit /b 1
                    )

                    echo.
                    echo ===== ALL PODS =====
                    "%KUBECTL%" get pods -A
                '''
            }
        }


        stage('Build Incident Service') {
            steps {
                bat '''
                    echo ========================================
                    echo BUILDING INCIDENT SERVICE
                    echo ========================================

                    if not exist "incident-service\\Dockerfile" (
                        echo ERROR: incident-service\\Dockerfile not found
                        exit /b 1
                    )

                    "%DOCKER%" build ^
                        -t %INCIDENT_IMAGE% ^
                        incident-service

                    if errorlevel 1 (
                        echo ERROR: Incident Service Docker build failed
                        exit /b 1
                    )

                    echo.
                    echo Incident Service image built successfully.
                '''
            }
        }


        stage('Build Resource Service') {
            steps {
                bat '''
                    echo ========================================
                    echo BUILDING RESOURCE SERVICE
                    echo ========================================

                    if not exist "resource-serivice\\Dockerfile" (
                        echo ERROR: resource-serivice\\Dockerfile not found
                        exit /b 1
                    )

                    "%DOCKER%" build ^
                        -t %RESOURCE_IMAGE% ^
                        resource-serivice

                    if errorlevel 1 (
                        echo ERROR: Resource Service Docker build failed
                        exit /b 1
                    )

                    echo.
                    echo Resource Service image built successfully.
                '''
            }
        }


        stage('Show Docker Images') {
            steps {
                bat '''
                    echo ========================================
                    echo DOCKER IMAGES
                    echo ========================================

                    "%DOCKER%" images
                '''
            }
        }


        stage('Load Images into Minikube') {
            steps {
                bat '''
                    echo ========================================
                    echo LOADING IMAGES INTO MINIKUBE
                    echo ========================================

                    echo.
                    echo Loading Incident Service...
                    "%MINIKUBE%" image load %INCIDENT_IMAGE%

                    if errorlevel 1 (
                        echo ERROR: Failed to load Incident Service image
                        exit /b 1
                    )

                    echo.
                    echo Loading Resource Service...
                    "%MINIKUBE%" image load %RESOURCE_IMAGE%

                    if errorlevel 1 (
                        echo ERROR: Failed to load Resource Service image
                        exit /b 1
                    )

                    echo.
                    echo ===== MINIKUBE IMAGES =====
                    "%MINIKUBE%" image ls
                '''
            }
        }


        stage('Check Kubernetes Files') {
            steps {
                bat '''
                    echo ========================================
                    echo CHECKING KUBERNETES FILES
                    echo ========================================

                    if not exist "k8s" (
                        echo ERROR: k8s directory not found
                        exit /b 1
                    )

                    echo.
                    echo ===== K8S FILES =====
                    dir /s /b "k8s\\*.yaml"
                    dir /s /b "k8s\\*.yml"

                    echo.
                    echo Kubernetes files found.
                '''
            }
        }


        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                    echo ========================================
                    echo DEPLOYING RESQLINK TO KUBERNETES
                    echo ========================================

                    "%KUBECTL%" apply -f k8s\\

                    if errorlevel 1 (
                        echo ERROR: Kubernetes deployment failed
                        exit /b 1
                    )

                    echo.
                    echo Kubernetes resources applied successfully.
                '''
            }
        }


        stage('Wait for Deployment') {
            steps {
                bat '''
                    echo ========================================
                    echo WAITING FOR KUBERNETES
                    echo ========================================

                    timeout /t 20 /nobreak

                    echo.
                    echo ===== PODS =====
                    "%KUBECTL%" get pods -o wide

                    echo.
                    echo ===== SERVICES =====
                    "%KUBECTL%" get svc

                    echo.
                    echo ===== DEPLOYMENTS =====
                    "%KUBECTL%" get deployments
                '''
            }
        }


        stage('Check Kubernetes') {
            steps {
                bat '''
                    echo ========================================
                    echo KUBERNETES STATUS
                    echo ========================================

                    echo.
                    echo ===== NODES =====
                    "%KUBECTL%" get nodes

                    echo.
                    echo ===== ALL PODS =====
                    "%KUBECTL%" get pods -A -o wide

                    echo.
                    echo ===== SERVICES =====
                    "%KUBECTL%" get svc -A

                    echo.
                    echo ===== DEPLOYMENTS =====
                    "%KUBECTL%" get deployments -A

                    echo.
                    echo ===== REPLICASETS =====
                    "%KUBECTL%" get rs -A
                '''
            }
        }


        stage('Check Deployment') {
            steps {
                bat '''
                    echo ========================================
                    echo RESQLINK DEPLOYMENT CHECK
                    echo ========================================

                    echo.
                    echo ===== INCIDENT SERVICE PODS =====
                    "%KUBECTL%" get pods -l app=incident-service

                    echo.
                    echo ===== RESOURCE SERVICE PODS =====
                    "%KUBECTL%" get pods -l app=resource-service

                    echo.
                    echo ===== SERVICES =====
                    "%KUBECTL%" get svc

                    echo.
                    echo ===== MINIKUBE STATUS =====
                    "%MINIKUBE%" status

                    echo.
                    echo ========================================
                    echo RESQLINK DEPLOYMENT CHECK COMPLETED
                    echo ========================================
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

            Checkout              : SUCCESS
            Docker                : SUCCESS
            Minikube              : SUCCESS
            Kubernetes            : SUCCESS
            Incident Service      : BUILT
            Resource Service      : BUILT
            Images                : LOADED
            Deployment            : APPLIED

            ================================================
            '''
        }


        failure {
            echo '''
            ================================================
                  RESQLINK PIPELINE FAILED
            ================================================

            Collecting diagnostics...
            ================================================
            '''

            bat '''
                echo.
                echo ===== DOCKER VERSION =====
                "%DOCKER%" --version

                echo.
                echo ===== DOCKER INFO =====
                "%DOCKER%" info

                echo.
                echo ===== MINIKUBE STATUS =====
                "%MINIKUBE%" status

                echo.
                echo ===== KUBERNETES NODES =====
                "%KUBECTL%" get nodes

                echo.
                echo ===== ALL PODS =====
                "%KUBECTL%" get pods -A -o wide

                echo.
                echo ===== SERVICES =====
                "%KUBECTL%" get svc -A

                echo.
                echo ===== DEPLOYMENTS =====
                "%KUBECTL%" get deployments -A

                echo.
                echo ===== POD DESCRIPTIONS =====
                "%KUBECTL%" describe pods -A

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

