pipeline {

    agent any

    environment {
        DOCKER = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        KUBECTL = 'C:\\Users\\Milan Chauhan\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\kubectl.exe'
        MINIKUBE = 'C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe'

        KUBECONFIG = 'C:\\ProgramData\\Jenkins\\.kube\\config'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Docker Version') {
            steps {
                bat '"%DOCKER%" --version'
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '"%DOCKER%" compose build'
            }
        }

        stage('Verify Docker Images') {
            steps {
                bat '"%DOCKER%" images'
            }
        }

        stage('Check Minikube') {
            steps {
                bat '"%MINIKUBE%" status'
            }
        }

        stage('Check Kubernetes') {
            steps {
                bat '"%KUBECTL%" config current-context'
                bat '"%KUBECTL%" get nodes'
            }
        }

        stage('Load Images into Minikube') {
            steps {
                bat '"%MINIKUBE%" image load resqlink-main-incident-service:latest'
                bat '"%MINIKUBE%" image load resqlink-main-resource-service:latest'
                bat '"%MINIKUBE%" image load resqlink-main-frontend:latest'
            }
        }

        stage('Verify Images in Minikube') {
            steps {
                bat '"%MINIKUBE%" image ls'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {

                bat '"%KUBECTL%" apply -f k8s/secret.yaml'

                bat '"%KUBECTL%" apply -f k8s/incident-deployment.yaml'
                bat '"%KUBECTL%" apply -f k8s/incident-service.yaml'

                bat '"%KUBECTL%" apply -f k8s/resource-deployment.yaml'
                bat '"%KUBECTL%" apply -f k8s/resource-service.yaml'

                bat '"%KUBECTL%" apply -f k8s/frontend-deployment.yaml'
                bat '"%KUBECTL%" apply -f k8s/frontend-service.yaml'
            }
        }

        stage('Check Deployment') {
            steps {

                bat '"%KUBECTL%" get pods'

                bat '"%KUBECTL%" get services'

                bat '"%KUBECTL%" get deployments'
            }
        }

        stage('Deployment Status') {
            steps {

                bat '"%KUBECTL%" rollout status deployment/incident-service --timeout=180s'

                bat '"%KUBECTL%" rollout status deployment/resource-service --timeout=180s'

                bat '"%KUBECTL%" rollout status deployment/frontend --timeout=180s'
            }
        }
    }

    post {

        success {
            echo '========================================'
            echo 'ResQLink DevOps Pipeline Successful!'
            echo 'Docker images built successfully.'
            echo 'Images loaded into Minikube.'
            echo 'Kubernetes deployment completed.'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo 'ResQLink DevOps Pipeline Failed.'
            echo 'Check the stage above for the exact error.'
            echo '========================================'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}