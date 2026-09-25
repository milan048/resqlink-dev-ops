pipeline {
    agent any

    environment {
        DOCKER_HOME = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin'
        MINIKUBE_HOME = 'C:\\Program Files\\Kubernetes\\Minikube'

        PATH = "${DOCKER_HOME};${MINIKUBE_HOME};${env.PATH}"

        DOCKER_EXE = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        KUBECTL_EXE = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe'
        MINIKUBE_EXE = 'C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe'
    }

    stages {

        stage('Environment Check') {
            steps {
                bat '''
                    echo ========================================
                    echo ENVIRONMENT CHECK
                    echo ========================================

                    echo.
                    echo PATH:
                    echo %PATH%

                    echo.
                    echo Docker:
                    where docker
                    docker --version

                    echo.
                    echo Kubectl:
                    where kubectl
                    kubectl version --client

                    echo.
                    echo Minikube:
                    where minikube
                    minikube version

                    echo.
                    echo Docker Info:
                    docker info
                '''
            }
        }

        stage('Checkout') {
            steps {
                echo 'Checking out ResQLink source code...'

                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        url: 'https://github.com/milan048/resqlink-dev-ops.git',
                        credentialsId: 'github-credentials'
                    ]]
                ])
            }
        }

        stage('Check Minikube') {
            steps {
                bat '''
                    echo ========================================
                    echo MINIKUBE CHECK
                    echo ========================================

                    echo.
                    echo Docker:
                    docker --version

                    echo.
                    echo Docker Info:
                    docker info

                    echo.
                    echo Minikube Version:
                    minikube version

                    echo.
                    echo Minikube Status:
                    minikube status
                '''
            }
        }

        stage('Ensure Minikube Running') {
            steps {
                bat '''
                    echo ========================================
                    echo ENSURING MINIKUBE IS RUNNING
                    echo ========================================

                    minikube status

                    if %ERRORLEVEL% NEQ 0 (
                        echo Minikube is not running.
                        echo Starting Minikube with Docker driver...

                        minikube start --driver=docker
                    ) else (
                        echo Minikube is already running.
                    )

                    echo.
                    echo Final Minikube Status:
                    minikube status
                '''
            }
        }

        stage('Check Kubernetes Connection') {
            steps {
                bat '''
                    echo ========================================
                    echo KUBERNETES CONNECTION
                    echo ========================================

                    kubectl config current-context

                    echo.
                    echo Kubernetes Nodes:
                    kubectl get nodes

                    echo.
                    echo All Pods:
                    kubectl get pods -A
                '''
            }
        }

        stage('Build Incident Service') {
            steps {
                bat '''
                    echo ========================================
                    echo BUILD INCIDENT SERVICE
                    echo ========================================

                    if exist incident-service (
                        cd incident-service
                        docker build -t resqlink-incident-service:latest .
                    ) else (
                        echo incident-service directory not found.
                        exit /b 1
                    )
                '''
            }
        }

        stage('Build Resource Service') {
            steps {
                bat '''
                    echo ========================================
                    echo BUILD RESOURCE SERVICE
                    echo ========================================

                    if exist resource-service (
                        cd resource-service
                        docker build -t resqlink-resource-service:latest .
                    ) else (
                        echo resource-service directory not found.
                        exit /b 1
                    )
                '''
            }
        }

        stage('Show Docker Images') {
            steps {
                bat '''
                    echo ========================================
                    echo DOCKER IMAGES
                    echo ========================================

                    docker images
                '''
            }
        }

        stage('Load Images into Minikube') {
            steps {
                bat '''
                    echo ========================================
                    echo LOADING IMAGES INTO MINIKUBE
                    echo ========================================

                    minikube image load resqlink-incident-service:latest
                    minikube image load resqlink-resource-service:latest

                    echo.
                    echo Images inside Minikube:
                    minikube image ls
                '''
            }
        }

        stage('Check Kubernetes Files') {
            steps {
                bat '''
                    echo ========================================
                    echo KUBERNETES FILES
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
                    echo DEPLOYING TO KUBERNETES
                    echo ========================================

                    if exist k8s (
                        kubectl apply -f k8s
                    ) else (
                        echo k8s directory not found.
                        exit /b 1
                    )

                    echo.
                    echo Kubernetes resources:
                    kubectl get all
                '''
            }
        }

        stage('Wait for Deployment') {
            steps {
                bat '''
                    echo ========================================
                    echo WAITING FOR DEPLOYMENT
                    echo ========================================

                    timeout /t 20 /nobreak

                    kubectl get pods -o wide

                    echo.
                    echo Deployments:
                    kubectl get deployments
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
                    echo Nodes:
                    kubectl get nodes -o wide

                    echo.
                    echo Pods:
                    kubectl get pods -A -o wide

                    echo.
                    echo Services:
                    kubectl get svc -A

                    echo.
                    echo Deployments:
                    kubectl get deployments -A
                '''
            }
        }

        stage('Check Deployment') {
            steps {
                bat '''
                    echo ========================================
                    echo FINAL DEPLOYMENT CHECK
                    echo ========================================

                    kubectl get all

                    echo.
                    echo Pod Details:
                    kubectl get pods -o wide

                    echo.
                    echo Service Details:
                    kubectl get svc
                '''
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }

        success {
            echo '''
===============================================
       RESQLINK PIPELINE SUCCESS
===============================================
Docker images built successfully.
Images loaded into Minikube.
Kubernetes deployment completed.
===============================================
'''
        }

        failure {
            echo '''
===============================================
       RESQLINK PIPELINE FAILED
===============================================
Collecting diagnostics...
===============================================
'''

            bat '''
                echo.
                echo ===== DOCKER VERSION =====
                "%DOCKER_EXE%" --version

                echo.
                echo ===== DOCKER INFO =====
                "%DOCKER_EXE%" info

                echo.
                echo ===== MINIKUBE STATUS =====
                "%MINIKUBE_EXE%" status

                echo.
                echo ===== KUBERNETES CONTEXT =====
                "%KUBECTL_EXE%" config current-context

                echo.
                echo ===== KUBERNETES NODES =====
                "%KUBECTL_EXE%" get nodes

                echo.
                echo ===== ALL PODS =====
                "%KUBECTL_EXE%" get pods -A -o wide

                echo.
                echo ===== SERVICES =====
                "%KUBECTL_EXE%" get svc -A

                echo.
                echo ===== DEPLOYMENTS =====
                "%KUBECTL_EXE%" get deployments -A

                echo.
                echo ===== EVENTS =====
                "%KUBECTL_EXE%" get events -A --sort-by=.lastTimestamp
            '''
        }
    }
}