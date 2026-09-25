pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Test') {
            steps {
                bat '''
                    py -3 -m pip install -r requirements.txt
                    py -3 -m pytest tests -v
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                bat '''
                    minikube image build -t resqlink-incident:latest -f incident-service/Dockerfile .
                    minikube image build -t resqlink-resource:latest -f resource-serivice/Dockerfile .
                    minikube image build -t resqlink-frontend:latest -f frontend/Dockerfile .
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat '''
                    minikube status
                    minikube kubectl -- apply -f k8s
                '''
            }
        }

        stage('Check Deployment') {
            steps {
                bat '''
                    minikube kubectl -- get pods
                    minikube kubectl -- get services
                '''
            }
        }
    }

    post {
        success {
            echo 'ResQLink CI/CD Pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Jenkins Console Output.'
        }
    }
}