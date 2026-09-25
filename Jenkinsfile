pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                 bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker-compose.exe" build'
            }
        }

        stage('Verify Docker Images') {
            steps {
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe" images'
            }
        }

        stage('Start Minikube') {
            steps {
                withEnv(['PATH+DOCKER=C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin']) {
                  bat 'docker --version'
                  bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" start --driver=docker'
                }
            }
        }
           
        stage('Check Minikube') {
            steps {
               withEnv(['PATH+DOCKER=C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin']) {
                  bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" status'
                }
            }
        }

        stage('Load Images into Minikube') {
            steps {
                bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" image load resqlink-main-incident-service:latest'
                bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" image load resqlink-main-resource-service:latest'
                bat '"C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe" image load resqlink-main-frontend:latest'
            }
        }

        stage('Check Kubernetes') {
            steps {
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" version --client'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" config current-context'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" get nodes'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" apply -f k8s/secret.yaml'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" apply -f k8s/incident-deployment.yaml'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" apply -f k8s/incident-service.yaml'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" apply -f k8s/resource-deployment.yaml'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" apply -f k8s/resource-service.yaml'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" apply -f k8s/frontend-deployment.yaml'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" apply -f k8s/frontend-service.yaml'
            }
        }

        stage('Check Deployment') {
            steps {
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" get pods'
                bat '"C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe" get services'
            }
        }
    }
}