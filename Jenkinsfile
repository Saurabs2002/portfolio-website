pipeline {
    agent any
     triggers {
        githubPush()
    }
    environment {
        SONAR_PROJECT_KEY = 'portfolio-app'

        // AWS / ECR
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = '573011045411.dkr.ecr.ap-south-1.amazonaws.com'

        BACKEND_REPO = 'portfolio-backend'
        FRONTEND_REPO = 'portfolio-frontend'
    }

    stages {

        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
                    set -e

                    echo "Installing frontend dependencies..."
                    cd frontend
                    npm ci

                    echo "Installing backend dependencies..."
                    cd ../backend
                    npm ci
                '''
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck(
                    odcInstallation: 'OWASP-Dependency-Check',
                    additionalArguments: '''
                        --project "Portfolio Application"
                        --scan .
                        --format XML
                        --format HTML
                        --noupdate
                    '''
                )
            }
        }

        stage('Publish OWASP Report') {
            steps {
                dependencyCheckPublisher(
                    pattern: '**/dependency-check-report.xml'
                )
            }
        }

        stage('SonarQube Analysis') {
            steps {
                echo 'Running SonarQube analysis...'

                withSonarQubeEnv('SonarQube') {

                    script {

                        def scannerHome = tool 'SonarScanner'

                        sh """
                            set -e

                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.projectName="Portfolio Application" \
                              -Dsonar.sources=frontend,backend \
                              -Dsonar.exclusions="**/node_modules/**"
                        """
                    }
                }
            }
        }

        stage('Trivy Filesystem Scan') {
            steps {
                echo 'Running Trivy filesystem scan...'

                sh '''
                    set -e

                    trivy fs \
                      --scanners vuln,secret,misconfig \
                      --severity HIGH,CRITICAL \
                      --no-progress \
                      .
                '''
            }
        }

        stage('Docker Build') {
            steps {
                echo 'Building backend Docker image...'

                sh '''
                    set -e

                    docker build \
                      -t portfolio-backend:latest \
                      ./backend
                '''

                echo 'Building frontend Docker image...'

                sh '''
                    set -e

                    docker build \
                      -t portfolio-frontend:latest \
                      ./frontend

                    echo "Docker images:"
                    docker images | grep portfolio
                '''
            }
        }

        stage('Docker Push to ECR') {
    steps {
        echo 'Logging in to AWS ECR...'

        sh '''
            set -e

            aws ecr get-login-password --region ${AWS_REGION} | \
            docker login --username AWS --password-stdin ${ECR_REGISTRY}

            echo "ECR login successful"

            echo "Tagging backend image..."

            docker tag \
              portfolio-backend:latest \
              ${ECR_REGISTRY}/${BACKEND_REPO}:latest

            echo "Tagging frontend image..."

            docker tag \
              portfolio-frontend:latest \
              ${ECR_REGISTRY}/${FRONTEND_REPO}:latest

            echo "Pushing backend image..."

            docker push \
              ${ECR_REGISTRY}/${BACKEND_REPO}:latest

            echo "Pushing frontend image..."

            docker push \
              ${ECR_REGISTRY}/${FRONTEND_REPO}:latest

            echo "Docker images pushed successfully."
        '''
    }
}
        stage('Verify') {
            steps {
                sh '''
                    echo "================================"
                    echo "Pipeline Verification"
                    echo "================================"

                    echo "Backend ECR image:"
                    echo "${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}"

                    echo "Frontend ECR image:"
                    echo "${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}"
                '''
            }
        }
    }

    post {

        success {
            echo '''
            ==========================================
            Portfolio CI Pipeline SUCCESS
            ==========================================
            '''
        }

        failure {
            echo '''
            ==========================================
            Portfolio CI Pipeline FAILED
            ==========================================
            Check the Jenkins console output.
            ==========================================
            '''
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
