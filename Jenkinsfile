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
                    sh '''
                        set -e

                        echo "Running SonarQube analysis..."

                        sonar-scanner \
                          -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                          -Dsonar.projectName="Portfolio Application" \
                          -Dsonar.sources=frontend,backend \
                          -Dsonar.exclusions="**/node_modules/**"
                    '''
                }
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
