pipeline {

    agent any

    environment {
        AWS_REGION = 'ap-south-1'
        ECR_REGISTRY = '573011045411.dkr.ecr.ap-south-1.amazonaws.com'

        BACKEND_REPO = 'portfolio-backend'
        FRONTEND_REPO = 'portfolio-frontend'

        SONAR_PROJECT_KEY = 'portfolio-app'
    }

    stages {

        stage('Checkout') {
            steps {
                echo '================================'
                echo 'Checking out source code'
                echo '================================'

                checkout scm
            }
        }


        stage('Install Dependencies') {
            steps {
                echo '================================'
                echo 'Installing dependencies'
                echo '================================'

                sh '''
                    set -e

                    echo "Installing frontend dependencies..."
                    cd frontend
                    npm ci

                    echo "Installing backend dependencies..."
                    cd ../backend
                    npm ci

                    echo "Dependencies installed successfully"
                '''
            }
        }


        stage('OWASP Dependency Check') {
            steps {
                echo '================================'
                echo 'OWASP Dependency Check'
                echo '================================'

                dependencyCheck(
                    additionalArguments: '''
                        --scan .
                        --format XML
                        --format HTML
                        --out .
                        --disableOssIndex
                    ''',
                    odcInstallation: 'OWASP Dependency-Check'
                )
            }
        }


        stage('Publish OWASP Report') {
            steps {
                echo '================================'
                echo 'Publishing OWASP Report'
                echo '================================'

                dependencyCheckPublisher(
                    pattern: 'dependency-check-report.xml'
                )

                archiveArtifacts(
                    artifacts: 'dependency-check-report.html',
                    allowEmptyArchive: true
                )
            }
        }


        stage('SonarQube Analysis') {
            steps {
                echo '================================'
                echo 'SonarQube Analysis'
                echo '================================'

                withSonarQubeEnv('SonarQube') {

                    script {

                        def scannerHome = tool 'SonarScanner'

                        sh """
                            set -e

                            echo "Running SonarQube analysis..."

                            ${scannerHome}/bin/sonar-scanner \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.projectName="Portfolio Application" \
                              -Dsonar.sources=frontend,backend \
                              -Dsonar.exclusions="**/node_modules/**"

                            echo "SonarQube analysis completed"
                        """
                    }
                }
            }
        }


        stage('Trivy Filesystem Scan') {
            steps {
                echo '================================'
                echo 'Trivy Filesystem Security Scan'
                echo '================================'

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
                echo '================================'
                echo 'Building Backend Docker Image'
                echo '================================'

                sh '''
                    set -e

                    docker build \
                      -t portfolio-backend:${BUILD_NUMBER} \
                      ./backend

                    echo "Backend image built successfully"
                '''

                echo '================================'
                echo 'Building Frontend Docker Image'
                echo '================================'

                sh '''
                    set -e

                    docker build \
                      -t portfolio-frontend:${BUILD_NUMBER} \
                      ./frontend

                    echo "Frontend image built successfully"

                    echo "Docker images:"
                    docker images | grep portfolio
                '''
            }
        }


        stage('Trivy Image Scan') {
            steps {
                echo '================================'
                echo 'Trivy Backend Image Scan'
                echo '================================'

                sh '''
                    set -e

                    trivy image \
                      --severity HIGH,CRITICAL \
                      --no-progress \
                      portfolio-backend:${BUILD_NUMBER}
                '''

                echo '================================'
                echo 'Trivy Frontend Image Scan'
                echo '================================'

                sh '''
                    set -e

                    trivy image \
                      --severity HIGH,CRITICAL \
                      --no-progress \
                      portfolio-frontend:${BUILD_NUMBER}
                '''
            }
        }


        stage('Push Images to ECR') {
            steps {
                echo '================================'
                echo 'Logging in to AWS ECR'
                echo '================================'

                sh '''
                    set -e

                    aws ecr get-login-password \
                      --region ${AWS_REGION} | \
                    docker login \
                      --username AWS \
                      --password-stdin ${ECR_REGISTRY}

                    echo "ECR login successful"
                '''

                echo '================================'
                echo 'Tagging Docker Images'
                echo '================================'

                sh '''
                    set -e

                    docker tag \
                      portfolio-backend:${BUILD_NUMBER} \
                      ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}

                    docker tag \
                      portfolio-frontend:${BUILD_NUMBER} \
                      ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

                    echo "Images tagged successfully"
                '''

                echo '================================'
                echo 'Pushing Backend Image to ECR'
                echo '================================'

                sh '''
                    set -e

                    docker push \
                      ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}
                '''

                echo '================================'
                echo 'Pushing Frontend Image to ECR'
                echo '================================'

                sh '''
                    set -e

                    docker push \
                      ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}
                '''

                echo '================================'
                echo 'ECR Push Successful'
                echo '================================'
            }
        }


        stage('Verify') {
            steps {
                echo '================================'
                echo 'Pipeline Verification'
                echo '================================'

                sh '''
                    echo "Backend image:"
                    docker images ${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}

                    echo "Frontend image:"
                    docker images ${ECR_REGISTRY}/${FRONTEND_REPO}:${BUILD_NUMBER}

                    echo ""
                    echo "ECR images pushed:"
                    echo "${ECR_REGISTRY}/${BACKEND_REPO}:${BUILD_NUMBER}"
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
