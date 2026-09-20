pipeline {
    agent any

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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
