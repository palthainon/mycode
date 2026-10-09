param location string = 'eastus2'
param name string = 'oldweb-mcp'
param environmentId string
param identityId string
param identityClientId string
param registryServer string
param image string
param tableEndpoint string
@secure()
param insightsConnection string
@secure()
param hmacSecret string
@secure()
param testSecret string
param experimentStart string
param experimentEnd string
param listedAt string = ''
param allowedHosts string
param revisionSuffix string
param ingressEnabled bool = true
resource app 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  tags: { project: 'oldweb-mcp', lifecycle: 'experiment' }
  identity: { type: 'UserAssigned', userAssignedIdentities: { '${identityId}': {} } }
  properties: {
    managedEnvironmentId: environmentId
    workloadProfileName: 'Consumption'
    configuration: {
      activeRevisionsMode: 'Multiple'
      secrets: [{ name: 'insights', value: insightsConnection }, { name: 'hmac', value: hmacSecret }, { name: 'test', value: testSecret }]
      registries: [{ server: registryServer, identity: identityId }]
      ingress: ingressEnabled ? {
        external: true
        targetPort: 8080
        transport: 'http'
        allowInsecure: false
        traffic: [{ latestRevision: true, weight: 100 }]
      } : null
    }
    template: {
      revisionSuffix: revisionSuffix
      containers: [{
        name: 'mcp'
        image: image
        resources: { cpu: json('0.25'), memory: '0.5Gi' }
        env: [
          { name: 'NODE_ENV', value: 'production' }
          { name: 'AZURE_CLIENT_ID', value: identityClientId }
          { name: 'TABLE_ENDPOINT', value: tableEndpoint }
          { name: 'APPLICATIONINSIGHTS_CONNECTION_STRING', secretRef: 'insights' }
          { name: 'HMAC_SECRET', secretRef: 'hmac' }
          { name: 'TEST_SECRET', secretRef: 'test' }
          { name: 'ALLOWED_HOSTS', value: allowedHosts }
          { name: 'ALLOWED_ORIGINS', value: 'https://oldweb.tech,https://mcp.oldweb.tech' }
          { name: 'EXPERIMENT_START', value: experimentStart }
          { name: 'EXPERIMENT_END', value: experimentEnd }
          { name: 'LISTED_AT', value: listedAt }
        ]
        probes: [
          { type: 'Liveness', tcpSocket: { port: 8080 }, initialDelaySeconds: 10, periodSeconds: 30 }
          { type: 'Readiness', tcpSocket: { port: 8080 }, initialDelaySeconds: 5, periodSeconds: 10 }
        ]
      }]
      scale: { minReplicas: 0, maxReplicas: 1, rules: [{ name: 'http', http: { metadata: { concurrentRequests: '10' } } }] }
    }
  }
}
output fqdn string = app.properties.configuration.ingress.fqdn
output verificationId string = app.properties.customDomainVerificationId
