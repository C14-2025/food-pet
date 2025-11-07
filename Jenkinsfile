pipeline {
    agent any

    tools {
        nodejs 'NodeJS 20'
    }

    environment {
        NODE_ENV = 'test'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Current working directory:'
                sh 'pwd'
                echo 'Listing workspace contents:'
                sh 'ls -la /workspace'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('/workspace') {
                    echo 'Installing dependencies in /workspace...'
                    sh 'pwd'
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir('/workspace') {
                    echo 'Running tests with coverage...'
                    sh 'npx jest --coverage --json --outputFile=test-results.json'
                }
            }
        }

        stage('Archive Test Results') {
            steps {
                dir('/workspace') {
                    echo 'Archiving test results...'
                    archiveArtifacts artifacts: 'test-report.html,coverage/**,test-results.json',
                                allowEmptyArchive: false
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Tests passed successfully!'
        }
        failure {
            echo 'Tests failed. Please check the test reports.'
        }
    }
}