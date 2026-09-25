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
                bat 'docker compose build'
            }
        }

        stage('Verify Docker Images') {
            steps {
                bat 'docker images'
            }
        }

        stage('Load Images into Minikube') {
            steps {
                bat 'minikube image load resqlink-main-incident-service:latest'
                bat 'minikube image load resqlink-main-resource-service:latest'
                bat 'minikube image load resqlink-main-frontend:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f k8s/secret.yaml'
                bat 'kubectl apply -f k8s/incident-deployment.yaml'
                bat 'kubectl apply -f k8s/incident-service.yaml'
                bat 'kubectl apply -f k8s/resource-deployment.yaml'
                bat 'kubectl apply -f k8s/resource-service.yaml'
                bat 'kubectl apply -f k8s/frontend-deployment.yaml'
                bat 'kubectl apply -f k8s/frontend-service.yaml'
            }
        }

        stage('Check Deployment') {
            steps {
                bat 'kubectl get pods'
                bat 'kubectl get services'
            }
        }
    }
}