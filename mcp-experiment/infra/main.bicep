targetScope = 'resourceGroup'
param location string = 'eastus2'
param prefix string = 'oldwebmcp'
param budgetStart string
var suffix = uniqueString(resourceGroup().id)
var tags = { project: 'oldweb-mcp', lifecycle: 'experiment' }
resource registry 'Microsoft.ContainerRegistry/registries@2023-07-01' = {
  name: '${prefix}${suffix}'
  location: location
  tags: tags
  sku: { name: 'Basic' }
  properties: { adminUserEnabled: false }
}
resource storage 'Microsoft.Storage/storageAccounts@2023-05-01' = {
  name: '${prefix}${suffix}'
  location: location
  tags: tags
  kind: 'StorageV2'
  sku: { name: 'Standard_LRS' }
  properties: { minimumTlsVersion: 'TLS1_2', supportsHttpsTrafficOnly: true, allowBlobPublicAccess: false, allowSharedKeyAccess: false }
}
resource tables 'Microsoft.Storage/storageAccounts/tableServices@2023-05-01' = {
  parent: storage
  name: 'default'
}
resource quotas 'Microsoft.Storage/storageAccounts/tableServices/tables@2023-05-01' = {
  parent: tables
  name: 'quotas'
}
resource identity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' = {
  name: '${prefix}-runtime'
  location: location
  tags: tags
}
resource tableRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(storage.id, identity.id, 'table')
  scope: storage
  properties: { principalId: identity.properties.principalId, principalType: 'ServicePrincipal', roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '0a9a7e1f-b9d0-4cc4-a60d-0319b160aaa3') }
}
resource pullRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(registry.id, identity.id, 'pull')
  scope: registry
  properties: { principalId: identity.properties.principalId, principalType: 'ServicePrincipal', roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '7f951dda-4ed3-4680-a7ca-43fe172d538d') }
}
resource workspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: '${prefix}-logs'
  location: location
  tags: tags
  properties: { sku: { name: 'PerGB2018' }, retentionInDays: 60, workspaceCapping: { dailyQuotaGb: json('0.05') } }
}
resource insights 'Microsoft.Insights/components@2020-02-02' = {
  name: '${prefix}-insights'
  location: location
  tags: tags
  kind: 'web'
  properties: { Application_Type: 'web', WorkspaceResourceId: workspace.id, IngestionMode: 'LogAnalytics', RetentionInDays: 60, DisableIpMasking: false }
}
resource environment 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: '${prefix}-environment'
  location: location
  tags: tags
  properties: {
    appLogsConfiguration: { destination: 'log-analytics', logAnalyticsConfiguration: { customerId: workspace.properties.customerId, sharedKey: workspace.listKeys().primarySharedKey } }
    workloadProfiles: [{ name: 'Consumption', workloadProfileType: 'Consumption' }]
  }
}
resource budget 'Microsoft.Consumption/budgets@2023-11-01' = {
  name: '${prefix}-monthly'
  properties: {
    amount: 25
    category: 'Cost'
    timeGrain: 'Monthly'
    timePeriod: { startDate: budgetStart }
    notifications: {
      ten: { enabled: true, operator: 'GreaterThanOrEqualTo', threshold: 40, thresholdType: 'Actual', contactRoles: ['Owner'], contactEmails: [] }
      twenty: { enabled: true, operator: 'GreaterThanOrEqualTo', threshold: 80, thresholdType: 'Actual', contactRoles: ['Owner'], contactEmails: [] }
      twentyFive: { enabled: true, operator: 'GreaterThanOrEqualTo', threshold: 100, thresholdType: 'Actual', contactRoles: ['Owner'], contactEmails: [] }
    }
  }
}
resource workbook 'Microsoft.Insights/workbooks@2023-06-01' = {
  name: guid(resourceGroup().id, 'mcp-workbook')
  location: location
  kind: 'shared'
  properties: { displayName: 'OldWeb MCP experiment', sourceId: insights.id, category: 'workbook', serializedData: loadTextContent('workbook.json') }
}
output registryName string = registry.name
output registryServer string = registry.properties.loginServer
output environmentId string = environment.id
output identityId string = identity.id
output identityClientId string = identity.properties.clientId
output tableEndpoint string = storage.properties.primaryEndpoints.table
output insightsId string = insights.id
output workspaceId string = workspace.id
