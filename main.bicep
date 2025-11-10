@description('Location for all resources.')
param location string = resourceGroup().location

@description('Name of the Static Web App')
param staticWebAppName string = 'innovation-platform-frontend'

@description('Name of the Container Apps Environment')
param containerAppsEnvironmentName string = 'innovation-platform-env'

@description('Name of the Container Registry')
param containerRegistryName string = 'innovationplatformacr'

@description('Name of the Resource Group tag')
param projectName string = 'InnovationPlatform'

@description('Environment tag')
param environment string = 'Production'

@description('JWT Secret for microservices')
param jwtSecret string

@description('Deployment timestamp to force updates')
param deploymentTimestamp string = utcNow()

// Tags for all resources
var tags = {
  Environment: environment
  Project: projectName
}

// ACR login server
var acrLoginServer = '${containerRegistryName}.azurecr.io'

// Azure Static Web App
resource staticWebApp 'Microsoft.Web/staticSites@2022-09-01' = {
  name: staticWebAppName
  location: location
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    buildProperties: {
      appLocation: 'frontend'
      apiLocation: ''
      outputLocation: 'build'
      appBuildCommand: 'npm run build'
    }
  }
  tags: tags
}

// Azure Container Registry
resource containerRegistry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: containerRegistryName
  location: location
  sku: {
    name: 'Basic'
  }
  properties: {
    adminUserEnabled: true
    publicNetworkAccess: 'Enabled'
  }
  tags: tags
}

// Container Apps Environment
resource containerAppsEnvironment 'Microsoft.App/managedEnvironments@2022-06-01-preview' = {
  name: containerAppsEnvironmentName
  location: location
  properties: {}
  tags: tags
}

// Gateway Container App
resource gatewayContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: 'gateway'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8000
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'gateway'
          image: '${acrLoginServer}/gateway:latest'
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'JWT_SECRET'
              value: jwtSecret
            }
            {
              name: 'LOG_LEVEL'
              value: 'INFO'
            }
            {
              name: 'AUTH_SERVICE_URL'
              value: 'http://${authContainerApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'EVENTS_SERVICE_URL'
              value: 'http://${eventsContainerApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'PROJECTS_SERVICE_URL'
              value: 'http://${projectsContainerApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'PARTICIPANTS_SERVICE_URL'
              value: 'http://${participantsContainerApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'NOTIFICATIONS_SERVICE_URL'
              value: 'http://${notificationsContainerApp.properties.configuration.ingress.fqdn}'
            }
            {
              name: 'ALLOW_ORIGINS'
              value: 'https://${staticWebApp.properties.defaultHostname}'
            }
            {
              name: 'DEPLOYMENT_TIMESTAMP'
              value: deploymentTimestamp
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  tags: tags
}

// Auth Service Container App
resource authContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: 'auth-service'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8001
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'auth-service'
          image: '${acrLoginServer}/auth-service:latest'
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'JWT_SECRET'
              value: jwtSecret
            }
            {
              name: 'LOG_LEVEL'
              value: 'INFO'
            }
            {
              name: 'DEV_AUTH_ENABLED'
              value: 'true'
            }
            {
              name: 'DEV_USER_ID'
              value: 'mock-user-001'
            }
            {
              name: 'DEV_USER_ROLE'
              value: 'organizer'
            }
            {
              name: 'DEV_USER_NAME'
              value: 'John Doe'
            }
            {
              name: 'DEV_USER_EMAIL'
              value: 'dev@example.com'
            }
            {
              name: 'DEPLOYMENT_TIMESTAMP'
              value: deploymentTimestamp
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  tags: tags
}

// Events Service Container App
resource eventsContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: 'events-service'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8002
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'events-service'
          image: '${acrLoginServer}/events-service:latest'
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'JWT_SECRET'
              value: jwtSecret
            }
            {
              name: 'LOG_LEVEL'
              value: 'INFO'
            }
            {
              name: 'DEV_AUTH_ENABLED'
              value: 'true'
            }
            {
              name: 'DEV_USER_ID'
              value: 'mock-user-001'
            }
            {
              name: 'DEV_USER_ROLE'
              value: 'organizer'
            }
            {
              name: 'DEV_USER_NAME'
              value: 'John Doe'
            }
            {
              name: 'DEV_USER_EMAIL'
              value: 'dev@example.com'
            }
            {
              name: 'DEPLOYMENT_TIMESTAMP'
              value: deploymentTimestamp
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  tags: tags
}

// Projects Service Container App
resource projectsContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: 'projects-service'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8003
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'projects-service'
          image: '${acrLoginServer}/projects-service:latest'
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'JWT_SECRET'
              value: jwtSecret
            }
            {
              name: 'LOG_LEVEL'
              value: 'INFO'
            }
            {
              name: 'DEV_AUTH_ENABLED'
              value: 'true'
            }
            {
              name: 'DEV_USER_ID'
              value: 'mock-user-001'
            }
            {
              name: 'DEV_USER_ROLE'
              value: 'organizer'
            }
            {
              name: 'DEV_USER_NAME'
              value: 'John Doe'
            }
            {
              name: 'DEV_USER_EMAIL'
              value: 'dev@example.com'
            }
            {
              name: 'DEPLOYMENT_TIMESTAMP'
              value: deploymentTimestamp
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  tags: tags
}

// Participants Service Container App
resource participantsContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: 'participants-service'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8004
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'participants-service'
          image: '${acrLoginServer}/participants-service:latest'
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'JWT_SECRET'
              value: jwtSecret
            }
            {
              name: 'LOG_LEVEL'
              value: 'INFO'
            }
            {
              name: 'DEV_AUTH_ENABLED'
              value: 'true'
            }
            {
              name: 'DEV_USER_ID'
              value: 'mock-user-001'
            }
            {
              name: 'DEV_USER_ROLE'
              value: 'organizer'
            }
            {
              name: 'DEV_USER_NAME'
              value: 'John Doe'
            }
            {
              name: 'DEV_USER_EMAIL'
              value: 'dev@example.com'
            }
            {
              name: 'DEPLOYMENT_TIMESTAMP'
              value: deploymentTimestamp
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  tags: tags
}

// Notifications Service Container App
resource notificationsContainerApp 'Microsoft.App/containerApps@2022-06-01-preview' = {
  name: 'notifications-service'
  location: location
  properties: {
    managedEnvironmentId: containerAppsEnvironment.id
    configuration: {
      ingress: {
        external: true
        targetPort: 8005
        transport: 'auto'
      }
      registries: [
        {
          server: acrLoginServer
          username: containerRegistry.listCredentials().username
          passwordSecretRef: 'acr-password'
        }
      ]
      secrets: [
        {
          name: 'acr-password'
          value: containerRegistry.listCredentials().passwords[0].value
        }
        {
          name: 'jwt-secret'
          value: jwtSecret
        }
      ]
    }
    template: {
      containers: [
        {
          name: 'notifications-service'
          image: '${acrLoginServer}/notifications-service:latest'
          resources: {
            cpu: 1
            memory: '2.0Gi'
          }
          env: [
            {
              name: 'JWT_SECRET'
              value: jwtSecret
            }
            {
              name: 'LOG_LEVEL'
              value: 'INFO'
            }
            {
              name: 'DEV_AUTH_ENABLED'
              value: 'true'
            }
            {
              name: 'DEV_USER_ID'
              value: 'mock-user-001'
            }
            {
              name: 'DEV_USER_ROLE'
              value: 'organizer'
            }
            {
              name: 'DEV_USER_NAME'
              value: 'John Doe'
            }
            {
              name: 'DEV_USER_EMAIL'
              value: 'dev@example.com'
            }
            {
              name: 'DEPLOYMENT_TIMESTAMP'
              value: deploymentTimestamp
            }
          ]
        }
      ]
      scale: {
        minReplicas: 1
        maxReplicas: 10
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
  tags: tags
}

// Outputs
output staticWebAppUrl string = staticWebApp.properties.defaultHostname
output gatewayUrl string = gatewayContainerApp.properties.configuration.ingress.fqdn
output authServiceUrl string = authContainerApp.properties.configuration.ingress.fqdn
output eventsServiceUrl string = eventsContainerApp.properties.configuration.ingress.fqdn
output projectsServiceUrl string = projectsContainerApp.properties.configuration.ingress.fqdn
output participantsServiceUrl string = participantsContainerApp.properties.configuration.ingress.fqdn
output notificationsServiceUrl string = notificationsContainerApp.properties.configuration.ingress.fqdn
output containerAppsEnvironmentId string = containerAppsEnvironment.id
