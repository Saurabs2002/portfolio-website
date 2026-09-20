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
                    cd frontend
                    npm ci

                    cd ../backend
                    npm ci
                '''
            }
        }

        stage('OWASP Dependency Check') {
            steps {
                dependencyCheck(
                    additionalArguments: '''
                        --project "Portfolio Application"
                        --scan .
                        --format XML
                        --format HTML
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
