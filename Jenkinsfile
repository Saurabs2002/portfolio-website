pipeline {
    agent any

    environment {
        SONAR_PROJECT_KEY = 'portfolio-app'
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
                        """
                    }
                }
            }
        }

        stage('Trivy Filesystem Scan') {
    steps {
        sh '''
            set -e

            echo "================================"
            echo "Trivy Filesystem Security Scan"
            echo "================================"

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
        sh '''
            set -e

            echo "================================"
            echo "Building Backend Docker Image"
            echo "================================"

            docker build \
              -t portfolio-backend:${BUILD_NUMBER} \
              ./backend

            echo "================================"
            echo "Building Frontend Docker Image"
            echo "================================"

            docker build \
              -t portfolio-frontend:${BUILD_NUMBER} \
              ./frontend

            echo "Docker images built successfully"

            docker images | grep portfolio
        '''
    }
}
stage('Trivy Image Scan') {
    steps {
        sh '''
            set -e

            echo "================================"
            echo "Trivy Backend Image Scan"
            echo "================================"

            trivy image \
              --severity HIGH,CRITICAL \
              --no-progress \
              portfolio-backend:${BUILD_NUMBER}

            echo "================================"
            echo "Trivy Frontend Image Scan"
            echo "================================"

            trivy image \
              --severity HIGH,CRITICAL \
              --no-progress \
              portfolio-frontend:${BUILD_NUMBER}
        '''
    }
}

        stage('Verify') {
            steps {
                sh '''
                    echo "================================"
                    echo "CI Pipeline Verification"
                    echo "================================"

                    echo "Current directory:"
                    pwd

                    echo ""
                    echo "Project files:"
                    ls -la

                    echo ""
                    echo "OWASP reports:"
                    find . -name "dependency-check-report.*" -ls || true

                    echo ""
                    echo "Pipeline verification completed."
                '''
            }
        }
    }

    post {
        success {
            echo '================================'
            echo 'Portfolio CI Pipeline SUCCESS'
            echo '================================'
        }

        failure {
            echo '================================'
            echo 'Portfolio CI Pipeline FAILED'
            echo '================================'
        }

        always {
            echo 'Pipeline execution completed.'
        }
    }
}
