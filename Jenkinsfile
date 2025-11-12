pipeline {
    agent any

    tools {
        nodejs 'NodeJS 22'
    }

    environment {
        NODE_ENV = 'test'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo 'Current working directory:'
                sh 'pwd'
                echo 'Listing workspace contents:'
                sh 'ls -la ${WORKSPACE}'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir("${WORKSPACE}") {
                    echo 'Installing dependencies...'
                    sh 'pwd'
                    sh 'npm install'
                }
            }
        }

        stage('Run Tests') {
            steps {
                dir("${WORKSPACE}") {
                    echo 'Running tests with coverage...'
                    sh 'npx jest --coverage --json --outputFile=test-results.json'
                }
            }
        }

        stage('Archive Test Results') {
            steps {
                dir("${WORKSPACE}") {
                    echo 'Archiving test results...'
                    archiveArtifacts artifacts: 'test-report.html,coverage/**,test-results.json',
                                      allowEmptyArchive: false
                }
            }
        }

        stage('SonarQube Analysis and Quality Gate') {
            steps {
                dir("${WORKSPACE}") {
                    withSonarQubeEnv('SonarQubeServer') {
                        echo 'Running SonarQube analysis...'
                        sh 'sonar-scanner'
                    }

                    echo 'Checking Quality Gate status...'
                    timeout(time: 10, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }
        success {
            echo 'Tests passed successfully.'
        }
        failure {
            echo 'Tests failed. Please check the test reports.'
        }
    }
}
