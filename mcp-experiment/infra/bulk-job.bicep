param location string = 'eastus2'
param name string = 'oldweb-mcp-bulk'
param environmentId string
param identityId string
param identityClientId string
param registryServer string
param image string
param tableEndpoint string
param experimentEnd string
resource job 'Microsoft.App/jobs@2024-03-01' = {
  name: name
  location: location
  tags: { project: 'oldweb-mcp', lifecycle: 'experiment', purpose: 'synthetic-bulk-prototype' }
  identity: { type: 'UserAssigned', userAssignedIdentities: { '${identityId}': {} } }
  properties: {
    environmentId: environmentId
    workloadProfileName: 'Consumption'
    configuration: {
      triggerType: 'Manual'
      replicaTimeout: 180
      replicaRetryLimit: 0
      manualTriggerConfig: { parallelism: 1, replicaCompletionCount: 1 }
      registries: [{ server: registryServer, identity: identityId }]
    }
    template: {
      containers: [{
        name: 'bulk'
        image: image
        command: ['node']
        args: ['--max-old-space-size=256', 'dist/bulk-worker.js', '--synthetic', '--records', '100000', '--cidrs', '10000']
        resources: { cpu: json('0.25'), memory: '0.5Gi' }
        env: [
          { name: 'BULK_CLOUD', value: 'true' }
          { name: 'AZURE_CLIENT_ID', value: identityClientId }
          { name: 'TABLE_ENDPOINT', value: tableEndpoint }
          { name: 'EXPERIMENT_END', value: experimentEnd }
        ]
      }]
    }
  }
}
output jobName string = job.name
