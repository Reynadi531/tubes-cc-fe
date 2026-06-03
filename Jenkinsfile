pipeline {
    agent any

    parameters {
        string(
            name: 'VITE_SERVER_URL',
            defaultValue: '',
            description: 'Backend server URL for Vite build (e.g., https://api.example.com)'
        )
        booleanParam(
            name: 'PUSH_IMAGE',
            defaultValue: false,
            description: 'Push the built image to registry'
        )
        string(
            name: 'REGISTRY',
            defaultValue: '',
            description: 'Docker registry URL (e.g., registry.example.com). Leave empty for Docker Hub'
        )
        string(
            name: 'IMAGE_NAME',
            defaultValue: 'tubes-fe',
            description: 'Docker image name'
        )
    }

    environment {
        // Shortened Git commit SHA (first 7 characters)
        GIT_COMMIT_SHORT = sh(
            script: 'git rev-parse --short HEAD',
            returnStdout: true
        ).trim()
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out ${env.GIT_BRANCH}..."
                checkout scm
            }
        }

        stage('Build Image') {
            steps {
                echo "Building Docker image..."
                script {
                    def buildArgs = ""
                    if (params.VITE_SERVER_URL?.trim()) {
                        buildArgs = "--build-arg VITE_SERVER_URL=${params.VITE_SERVER_URL}"
                    }
                    sh "docker build ${buildArgs} -t ${params.IMAGE_NAME}:${env.BUILD_NUMBER} -t ${params.IMAGE_NAME}:${env.GIT_COMMIT_SHORT} ."
                }
            }
        }

        stage('Push Image') {
            when {
                expression { params.PUSH_IMAGE }
            }
            steps {
                echo "Pushing image to registry..."
                script {
                    def registry = params.REGISTRY?.trim() ? "${params.REGISTRY}/" : ""
                    def imageName = "${registry}${params.IMAGE_NAME}"

                    // Tag for registry
                    sh "docker tag ${params.IMAGE_NAME}:${env.BUILD_NUMBER} ${imageName}:${env.BUILD_NUMBER}"
                    sh "docker tag ${params.IMAGE_NAME}:${env.GIT_COMMIT_SHORT} ${imageName}:${env.GIT_COMMIT_SHORT}"

                    // Push both tags
                    withCredentials([usernamePassword(
                        credentialsId: 'docker-registry-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )]) {
                        sh "echo ${DOCKER_PASSWORD} | docker login ${params.REGISTRY?.trim() ? params.REGISTRY : ''} -u ${DOCKER_USERNAME} --password-stdin"
                    }
                    sh "docker push ${imageName}:${env.BUILD_NUMBER}"
                    sh "docker push ${imageName}:${env.GIT_COMMIT_SHORT}"

                    // Tag latest if on main/master
                    if (env.GIT_BRANCH == 'origin/main' || env.GIT_BRANCH == 'origin/master') {
                        sh "docker tag ${params.IMAGE_NAME}:${env.BUILD_NUMBER} ${imageName}:latest"
                        sh "docker push ${imageName}:latest"
                    }
                }
            }
        }
    }

    post {
        always {
            echo "Build ${env.BUILD_NUMBER} completed for commit ${env.GIT_COMMIT_SHORT}"
        }
        success {
            echo 'Docker image built successfully!'
        }
        failure {
            echo 'Build failed!'
        }
        cleanup {
            script {
                // Logout from registry if we logged in
                if (params.PUSH_IMAGE && params.REGISTRY?.trim()) {
                    sh "docker logout ${params.REGISTRY} || true"
                } else if (params.PUSH_IMAGE) {
                    sh 'docker logout || true'
                }
            }
        }
    }
}
