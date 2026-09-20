pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh '''
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
stage('SonarQube Analysis') {
    steps {
        withSonarQubeEnv('SonarQube') {
            sh '''
                sonar-scanner \
                  -Dsonar.projectKey=portfolio-app \
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
                    echo "Current directory:"
                    pwd

                    echo "Project files:"
                    ls -la
                '''
            }
        }
    }

    post {
        success {
            echo 'Portfolio CI successful'
        }

        failure {
            echo 'Portfolio CI failed'
        }
    }
}
