// Cisco ISE (SISE) practice questions for oldweb.tech.
// Original questions written against the public exam topics. Not affiliated with Cisco.
window.CERT_BANK = {
    id: 'cisco-ise',
    vendor: 'Cisco',
    exam: 'Cisco ISE (SISE)',
    code: '300-715 v1.2',
    asOf: '2026-10',
    objectivesUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/300-715-SISE-v1.2.pdf',
    domains: [
        { id: '1', name: 'Architecture and Deployment', weight: 10 },
        { id: '2', name: 'Policy Enforcement', weight: 25 },
        { id: '3', name: 'Web Auth and Guest Services', weight: 15 },
        { id: '4', name: 'Profiler', weight: 15 },
        { id: '5', name: 'BYOD', weight: 15 },
        { id: '6', name: 'Endpoint Compliance', weight: 10 },
        { id: '7', name: 'Network Access Device Administration', weight: 10 }
    ],
    questions: [
        {
            id: 'ise-001',
            domain: '1',
            objective: '1.1',
            type: 'single',
            q: 'A two-node ISE deployment has the primary PAN, MnT and PSN personas on node A and the secondary PAN, MnT and PSN personas on node B. Node A loses power and PAN automatic failover is not configured. What is the expected result?',
            choices: [
                'All RADIUS authentication stops until node A is restored because only the primary PAN can make policy decisions',
                'Node B automatically becomes the primary PAN within 30 seconds and all existing sessions are re-authenticated',
                'Node B keeps authenticating endpoints, but configuration changes wait until an administrator manually promotes node B to be the primary PAN',
                'Node B continues to authenticate endpoints, and changes made on node B are queued and synchronized back to node A when it returns'
            ],
            answer: [2],
            explain: 'PSNs make policy decisions from a locally replicated copy of the configuration, so authentication continues on node B. Without PAN auto-failover, the secondary PAN must be promoted manually before configuration can be changed.',
            why: [
                'Policy decisions are made by the PSN persona from its local copy of the policy, not by the PAN.',
                'Automatic promotion only happens when PAN auto-failover with a health-check node is configured, and it does not force re-authentication.',
                'Correct: the PSN keeps working, but the PAN role does not move by itself without auto-failover configured.',
                'The secondary PAN is read-only for configuration until promoted; there is no change queue that syncs back.'
            ]
        },
        {
            id: 'ise-002',
            domain: '1',
            objective: '1.1',
            type: 'single',
            q: 'A designer wants to know the maximum number of nodes in one ISE deployment that can hold the Policy Administration (PAN) persona. What is the limit?',
            choices: [
                'One',
                'One per PSN node group',
                'Four',
                'Two'
            ],
            answer: [3],
            explain: 'A deployment can have at most two PAN nodes, a primary and a secondary. The same two-node limit applies to the Monitoring (MnT) persona.',
            why: [
                'One PAN is allowed, but a secondary PAN can be added for redundancy.',
                'Node groups are a PSN construct and do not each get their own PAN.',
                'Four is not a valid PAN count; the PAN is limited to an active/standby pair.',
                'Correct: primary and secondary PAN, with the secondary promoted when needed.'
            ]
        },
        {
            id: 'ise-003',
            domain: '1',
            objective: '1.1',
            type: 'single',
            q: 'Which ISE persona collects syslog messages from the other nodes and provides Live Logs, Live Sessions and historical reports?',
            choices: [
                'Policy Service (PSN)',
                'Monitoring (MnT)',
                'Policy Administration (PAN)',
                'pxGrid'
            ],
            answer: [1],
            explain: 'The MnT persona is the log collector for the deployment. It correlates RADIUS and TACACS+ events from all nodes to build Live Logs, session views and reports.',
            why: [
                'The PSN generates authentication events but sends them to MnT rather than storing the deployment-wide view.',
                'Correct: MnT receives logs from all nodes and serves the operational data.',
                'The PAN holds configuration; it displays MnT data but does not collect logs itself.',
                'pxGrid shares context with other products; it is not the logging persona.'
            ]
        },
        {
            id: 'ise-004',
            domain: '1',
            objective: '1.1',
            type: 'single',
            q: 'A security team wants their firewall management platform to learn the username and Security Group Tag assigned to each IP address that ISE authenticates, without polling ISE. Which ISE persona provides this?',
            choices: [
                'pxGrid',
                'Monitoring with syslog forwarding',
                'Policy Administration with the ERS API enabled',
                'Policy Service with the SXP service enabled'
            ],
            answer: [0],
            explain: 'pxGrid is a publish/subscribe framework that lets ISE share session context such as user, IP and SGT with ecosystem partners. Subscribers receive updates as sessions change instead of polling.',
            why: [
                'Correct: pxGrid publishes session context to subscribed products.',
                'Syslog forwarding pushes log text, not a structured session context service.',
                'ERS is a REST API for configuration objects, and using it would mean polling.',
                'SXP shares IP-to-SGT bindings but not usernames, and it is aimed at network devices, not a publish/subscribe context service.'
            ]
        },
        {
            id: 'ise-005',
            domain: '1',
            objective: '1.2',
            type: 'multi',
            q: 'An organization is planning a large distributed ISE deployment with tens of thousands of endpoints across several regions. Which two statements reflect recommended design for this deployment model? (Choose two.)',
            choices: [
                'Every PSN keeps its own independent policy that administrators edit locally on that node',
                'Network devices should send RADIUS requests to the primary PAN so that policy is always current',
                'The MnT persona can be enabled on up to four nodes so that each region has a local copy of logs',
                'The PAN and MnT personas run on dedicated nodes that do not service RADIUS requests',
                'PSNs can sit behind a load balancer that keeps a given endpoint\'s RADIUS traffic on the same PSN'
            ],
            answer: [3, 4],
            explain: 'Large deployments dedicate nodes to PAN and MnT and scale out with PSNs. PSNs are often load balanced, with persistence so that all RADIUS traffic for one endpoint session reaches the same PSN.',
            why: [
                'All policy is configured on the PAN and replicated; PSNs are not edited independently.',
                'In a large deployment the PAN should not process RADIUS; NADs point at PSNs.',
                'MnT is limited to a primary and secondary node.',
                'Correct: dedicated PAN and MnT nodes are the large-deployment model.',
                'Correct: load balancing PSNs with persistence is a supported design.'
            ]
        },
        {
            id: 'ise-006',
            domain: '1',
            objective: '1.2',
            type: 'single',
            q: 'A WAN outage isolates a branch PSN from the primary PAN for four hours. Local switches at the branch use only that PSN for RADIUS. What happens during the outage?',
            choices: [
                'The PSN switches into monitor mode and returns Access-Accept for every request',
                'The PSN rejects every new request because it can no longer validate deployment licensing with the primary PAN',
                'The PSN keeps authenticating with its last replicated policy and catches up on changes when the WAN link returns',
                'The PSN promotes itself to a standalone PAN so that local administrators can make changes'
            ],
            answer: [2],
            explain: 'Each PSN holds a replicated copy of the configuration database and keeps working from it when the PAN is unreachable. Replication catches up after the link is restored.',
            why: [
                'There is no automatic accept-all mode on the PSN; monitor mode is a switch-side design.',
                'Licensing is not checked per request against the PAN; a temporary outage does not stop authentication.',
                'Correct: PSNs operate from their local replica while disconnected.',
                'A PSN never promotes itself to PAN.'
            ]
        },
        {
            id: 'ise-007',
            domain: '1',
            objective: '1.2',
            type: 'single',
            q: 'Two PSNs in the same data center are placed in a node group. What is the main benefit of the node group if one of the PSNs fails?',
            choices: [
                'A surviving member can send CoA for sessions the failed PSN left mid-flow, such as pending posture',
                'The surviving PSN replicates the failed node\'s database to the PAN to prevent data loss',
                'The surviving PSN takes over the failed node\'s IP address so that NADs need no RADIUS server changes',
                'Endpoint sessions are mirrored in real time so that the NAD never needs to send a new Access-Request'
            ],
            answer: [0],
            explain: 'Node group members monitor each other. When one fails, a peer can issue CoA for sessions that were mid-flow (for example redirected for posture) so they re-authenticate cleanly instead of being stuck.',
            why: [
                'Correct: CoA for transitional sessions is the node group failure behavior.',
                'The PAN, not a PSN peer, owns the configuration database.',
                'Node groups do not provide IP takeover; that would be a load balancer or VIP function.',
                'Sessions are not mirrored statefully; a new RADIUS exchange is still needed.'
            ]
        },
        {
            id: 'ise-008',
            domain: '1',
            objective: '1.3',
            type: 'single',
            q: 'An administrator deploys an ISE VM on a shared hypervisor cluster where CPU and memory are overcommitted and not reserved. Authentication latency spikes during busy periods. What does Cisco guidance recommend?',
            choices: [
                'Run ISE in evaluation mode, which uses fewer resources than a production install',
                'Disable the MnT persona on all nodes, because logging is the only resource-intensive function',
                'Reserve CPU and memory to match the appliance model the VM replaces',
                'Move the VM to a container platform, because ISE scales automatically there'
            ],
            answer: [2],
            explain: 'ISE VMs are sized against the physical appliance models and expect dedicated resources. Reserving CPU and memory to match the target appliance avoids contention that causes latency and dropped requests.',
            why: [
                'Evaluation mode limits endpoints but does not change the resource requirements of a production workload.',
                'MnT is needed for logging, and PSN policy evaluation also needs CPU and memory.',
                'Correct: resources should be reserved to match the equivalent appliance.',
                'ISE is not supported as a self-scaling container workload.'
            ]
        },
        {
            id: 'ise-009',
            domain: '1',
            objective: '1.3',
            type: 'single',
            q: 'When sizing a dedicated PSN, which factor most directly determines the maximum number of concurrent endpoint sessions that node can support?',
            choices: [
                'The appliance model, or the VM resources matching that model',
                'The total number of network devices and device groups defined in the deployment',
                'The number of policy sets configured on the PAN',
                'The disk size of the MnT nodes'
            ],
            answer: [0],
            explain: 'Cisco publishes per-PSN session capacity based on the appliance model (or a VM with equivalent resources). Larger platforms support more concurrent sessions per PSN.',
            why: [
                'Correct: per-PSN scale is tied to the platform size.',
                'The NAD count does not set the per-PSN session limit.',
                'Policy complexity affects processing, but capacity is published per platform, not per policy set count.',
                'MnT disk size affects log retention, not PSN session capacity.'
            ]
        },
        {
            id: 'ise-010',
            domain: '1',
            objective: '1.4',
            type: 'single',
            q: 'What does zero-touch provisioning (ZTP) provide for a new Cisco ISE node?',
            choices: [
                'It discovers new Cisco switches on the network and onboards them into ISE as network devices without any manual entry',
                'It reads the node\'s initial settings, such as hostname, IP, DNS and NTP, from a supplied file instead of the interactive setup wizard',
                'It automatically enrolls endpoints in the internal CA when they first connect',
                'It joins the node to Active Directory automatically, using the credentials of the first administrator who logs in to the GUI'
            ],
            answer: [1],
            explain: 'ISE ZTP lets a new appliance or VM read its initial setup parameters from a supplied configuration so it can install without console interaction. It is about bringing up the ISE node itself.',
            why: [
                'Discovering switches is a network management (Plug and Play) function, not ISE node ZTP.',
                'Correct: ZTP replaces the interactive setup with a supplied configuration.',
                'Endpoint certificate enrollment is part of BYOD onboarding, not ZTP.',
                'AD join is a separate post-install task and is not tied to the first admin login.'
            ]
        },
        {
            id: 'ise-011',
            domain: '2',
            objective: '2.1',
            type: 'single',
            q: 'Wireless users authenticate with PEAP (EAP-MSCHAPv2). The administrator points the authentication policy at an LDAP identity source that connects to the corporate directory. Every authentication fails, but EAP-GTC tests with the same accounts succeed. What is the cause?',
            choices: [
                'The LDAP server requires LDAPS on port 636 for MSCHAPv2 exchanges but still allows EAP-GTC over plain LDAP on port 389',
                'ISE cannot validate MSCHAPv2 through an LDAP bind; the directory must be joined as an AD identity source',
                'PEAP is not supported on wireless networks when the identity source is external',
                'The LDAP identity source needs the Process Host Lookup option enabled'
            ],
            answer: [1],
            explain: 'MSCHAPv2 is a challenge-response method that needs either the NT hash or a native AD join. An LDAP bind can verify a plaintext password (PAP, GTC) but cannot validate MSCHAPv2, so the directory must be used as an AD join point.',
            why: [
                'LDAPS protects the bind but still cannot validate MSCHAPv2.',
                'Correct: MSCHAPv2 requires the AD connector, not LDAP.',
                'PEAP works with external stores such as AD on wireless networks.',
                'Process Host Lookup relates to MAB, not user password validation.'
            ]
        },
        {
            id: 'ise-012',
            domain: '2',
            objective: '2.1',
            type: 'single',
            q: 'A company acquired another business whose users live in a separate AD forest with no trust to the corporate forest. Users from both forests must authenticate to the same SSID with PEAP. What is the appropriate ISE approach?',
            choices: [
                'Create a two-way forest trust first, because ISE can only be joined to a single Active Directory domain at a time',
                'Create one join point per forest and select between them, for example with an identity source sequence or authentication policy rule',
                'Configure the second forest as an LDAP identity source, because only one join point is permitted',
                'Import all users from the second forest into ISE internal users'
            ],
            answer: [1],
            explain: 'ISE supports multiple AD join points, each to a different, untrusted domain or forest. The authentication policy or an identity source sequence then decides which join point to query.',
            why: [
                'A trust is not required; ISE can join multiple untrusted forests.',
                'Correct: one join point per forest, then select between them.',
                'Multiple join points are supported, and LDAP would not handle MSCHAPv2.',
                'Copying users into the internal store creates password management overhead and is not needed.'
            ]
        },
        {
            id: 'ise-013',
            domain: '2',
            objective: '2.1',
            type: 'multi',
            q: 'An ISE node fails to join an Active Directory domain. Which two items are prerequisites for a successful join? (Choose two.)',
            choices: [
                'The ISE node must be on the same IP subnet as at least one domain controller',
                'ISE must store a domain administrator password that it uses for every user authentication',
                'The ISE clock must be within the Kerberos time-skew tolerance of the domain, normally by using NTP',
                'DNS servers configured on ISE must resolve the domain\'s SRV records for domain controllers',
                'An LDAPS certificate from the domain controller must be imported before joining'
            ],
            answer: [2, 3],
            explain: 'ISE locates domain controllers through DNS SRV records and uses Kerberos, which fails when clocks drift beyond the allowed skew. Join credentials are used only for the join and are not stored for later authentications.',
            why: [
                'Domain controllers can be reached across routed networks; same subnet is not required.',
                'Join credentials are not stored for per-user authentication.',
                'Correct: Kerberos requires synchronized time.',
                'Correct: DC discovery depends on DNS SRV records.',
                'The AD connector does not require an LDAPS certificate to join.'
            ]
        },
        {
            id: 'ise-014',
            domain: '2',
            objective: '2.2.c',
            type: 'single',
            q: 'Corporate laptops use EAP-TLS. The administrator needs ISE to take the username from the certificate\'s Subject Alternative Name rather than the Subject CN, and then look the user up in AD. Which ISE object defines this?',
            choices: [
                'Authorization Profile',
                'Allowed Protocols service',
                'Identity Source Sequence with the certificate option',
                'Certificate Authentication Profile'
            ],
            answer: [3],
            explain: 'A Certificate Authentication Profile (CAP) specifies which certificate attribute ISE uses as the identity and optionally which identity store to look the user up in, including binary certificate comparison.',
            why: [
                'Authorization profiles define results such as VLANs and ACLs.',
                'Allowed Protocols enables EAP-TLS but does not choose the certificate field.',
                'A sequence can reference a CAP, but the CAP is what defines the attribute.',
                'Correct: the CAP chooses the identity attribute and lookup store.'
            ]
        },
        {
            id: 'ise-015',
            domain: '2',
            objective: '2.2.c',
            type: 'single',
            q: 'A new batch of laptops received certificates from a recently deployed issuing CA. EAP-TLS fails for them, and the ISE log reports an unknown CA in the client certificate chain. Older laptops still work. What should the administrator do?',
            choices: [
                'Enable PEAP in the Allowed Protocols so that the laptops can fall back',
                'Import the new issuing CA chain into the ISE trusted certificates store with trust for client authentication enabled',
                'Replace the ISE EAP system certificate with a new one issued by the new CA so both sides share the same chain',
                'Add the laptops\' MAC addresses to an endpoint identity group'
            ],
            answer: [1],
            explain: 'ISE validates client certificates against its trusted certificates store. A chain ending in a CA that is not trusted for client authentication is rejected.',
            why: [
                'Fallback to PEAP does not fix certificate trust and weakens the design.',
                'Correct: ISE must trust the issuing CA chain for client authentication.',
                'The EAP system certificate is what ISE presents to clients; it does not affect trust of client certificates.',
                'Identity group membership does not influence certificate chain validation.'
            ]
        },
        {
            id: 'ise-016',
            domain: '2',
            objective: '2.2.d',
            type: 'single',
            q: 'A remote access VPN headend sends RADIUS requests to ISE. Security wants users to approve a push notification from an MFA service after their AD password is checked. The MFA vendor provides an on-premises RADIUS proxy. How is this most commonly integrated with ISE?',
            choices: [
                'Configure a TACACS+ profile that requests a second factor',
                'Define the MFA proxy as a network access device in ISE so that it can send CoA messages after each approval',
                'Configure the MFA service as an LDAP identity source with a second bind',
                'Add the MFA proxy as a RADIUS Token identity source used by the VPN authentication policy'
            ],
            answer: [3],
            explain: 'ISE treats RADIUS-based MFA servers and proxies as RADIUS Token identity sources. The proxy validates the primary credential and the second factor, then returns the result to ISE.',
            why: [
                'TACACS+ profiles are for device administration, not VPN user access.',
                'Defining the proxy as a NAD makes it a RADIUS client, which is the wrong direction.',
                'LDAP cannot trigger push approvals.',
                'Correct: RADIUS Token identity sources are the standard MFA integration point.'
            ]
        },
        {
            id: 'ise-017',
            domain: '2',
            objective: '2.2.e',
            type: 'single',
            q: 'An identity source sequence lists AD first and Internal Users second. During a domain controller outage, contractors who exist only in Internal Users must still authenticate. Which setting in the sequence controls whether ISE moves on to Internal Users when AD cannot be reached?',
            choices: [
                'The certificate-based authentication option',
                'The If User Not Found option configured on each rule of the policy set\'s authorization policy',
                'The setting for unreachable stores, set to treat the error as user not found and continue to the next store',
                'The retry count in the RADIUS server timeout settings'
            ],
            answer: [2],
            explain: 'An identity source sequence has an advanced setting for stores that cannot be accessed: either stop with a process error or treat it as user not found and continue to the next store in the list.',
            why: [
                'The certificate option selects a CAP and does not affect failover between stores.',
                'If User Not Found is an authentication rule option, not an authorization option, and does not control in-sequence failover.',
                'Correct: this setting decides whether an unreachable store halts the sequence.',
                'RADIUS timeouts are a NAD setting and do not control sequence behavior.'
            ]
        },
        {
            id: 'ise-018',
            domain: '2',
            objective: '2.3',
            type: 'single',
            q: 'A WLAN uses WPA2-Enterprise with ISE. The authorization profile returns a VLAN and an ACL name, and ISE shows the session as authorized with that profile, but clients always land in the WLAN\'s default VLAN. What is the most likely cause?',
            choices: [
                'AAA override is disabled, so the controller ignores the attributes returned by ISE',
                'The WLAN is not using the 802.1X key management option',
                'The controller does not have ISE configured as an accounting server',
                'The access points are in FlexConnect local switching mode, which never supports RADIUS VLAN assignment'
            ],
            answer: [0],
            explain: 'The wireless controller only applies RADIUS-returned VLAN, ACL and similar attributes when AAA override is enabled on the WLAN (or policy profile). Without it, the authentication succeeds but the local defaults are used.',
            why: [
                'Correct: AAA override must be enabled for the WLC to honor ISE attributes.',
                'If 802.1X were not in use, the session would not appear as an 802.1X authorization in ISE.',
                'Accounting does not control whether authorization attributes are applied.',
                'FlexConnect supports AAA VLAN override when configured.'
            ]
        },
        {
            id: 'ise-019',
            domain: '2',
            objective: '2.3',
            type: 'single',
            q: 'After a successful EAP-TLS authentication over wireless, the controller must derive encryption keys for the client. How does the controller obtain the keying material?',
            choices: [
                'The AP generates a random pairwise key and sends it to ISE in an accounting packet',
                'The client sends its private key to the controller in the EAPoL-Start frame',
                'ISE returns keying material in the MS-MPPE-Send-Key and MS-MPPE-Recv-Key attributes',
                'The controller downloads the client certificate from ISE and derives the key from its public key'
            ],
            answer: [2],
            explain: 'Key-generating EAP methods produce an MSK on the client and ISE. ISE delivers it to the authenticator in the MS-MPPE key attributes, and the 4-way handshake then derives the session keys.',
            why: [
                'Keys are not invented by the AP and sent to ISE in accounting.',
                'Private keys never leave the client.',
                'Correct: the MS-MPPE attributes carry the keying material to the authenticator.',
                'A public key cannot be used to derive a shared secret this way.'
            ]
        },
        {
            id: 'ise-020',
            domain: '2',
            objective: '2.4.a',
            type: 'single',
            q: 'An access port has this configuration:\ninterface GigabitEthernet1/0/10\n switchport mode access\n switchport access vlan 20\n authentication open\n authentication port-control auto\n mab\n dot1x pae authenticator\n\nA laptop with a misconfigured supplicant fails 802.1X, yet the user can still reach the network in VLAN 20. Why?',
            choices: [
                'authentication open lets traffic flow regardless of the authentication result (monitor mode)',
                'MAB always succeeds as a fallback when 802.1X fails on a port configured with authentication port-control auto',
                'The port is in multi-host mode by default, so other hosts authenticated the port',
                'dot1x pae authenticator permits all traffic until the first EAP-Success'
            ],
            answer: [0],
            explain: 'Open authentication lets the port forward traffic even before authentication and after failures. Combined with logging in ISE, this is the monitor mode phase used to find problems without impacting users.',
            why: [
                'Correct: open authentication explains the access despite the failure.',
                'MAB can fail too; it does not automatically succeed.',
                'The default host mode is single-host, and no other host is mentioned.',
                'PAE authenticator just enables the 802.1X authenticator role; it does not open the port.'
            ]
        },
        {
            id: 'ise-021',
            domain: '2',
            objective: '2.4.b',
            type: 'single',
            q: 'Which port design describes the low-impact mode deployment phase?',
            choices: [
                'Open access limited by a pre-auth port ACL, replaced by a dACL after authorization',
                'Port-control force-authorized with no ACLs, logging only to ISE',
                'Closed mode with MAB disabled and only EAPoL allowed',
                'Multi-host mode, where the first device to authenticate opens the port for every other device behind it'
            ],
            answer: [0],
            explain: 'Low-impact mode keeps the port open but uses a pre-authentication ACL (for example DHCP, DNS, and PXE) to limit access until ISE returns a dACL that defines the authorized access.',
            why: [
                'Correct: open plus pre-auth ACL plus dACL defines low-impact mode.',
                'Force-authorized disables authentication entirely.',
                'That describes closed mode, not low-impact mode.',
                'Multi-host is a host mode, not a deployment phase.'
            ]
        },
        {
            id: 'ise-022',
            domain: '2',
            objective: '2.4.c',
            type: 'single',
            q: 'A port is configured in closed mode for 802.1X. Before the connected device is authorized, which traffic does the switch forward from it?',
            choices: [
                'DHCP and DNS only, so the device can obtain an address',
                'Traffic permitted by the default port ACL',
                'All traffic in the native VLAN',
                'Only EAPoL; other traffic is dropped'
            ],
            answer: [3],
            explain: 'Closed mode is the traditional 802.1X behavior. The port drops everything except EAPoL until the session is authorized, though the switch can still learn the MAC address to trigger MAB.',
            why: [
                'Permitting DHCP and DNS before authentication is a low-impact design.',
                'A pre-auth port ACL is part of low-impact mode.',
                'No data traffic is forwarded before authorization in closed mode.',
                'Correct: closed mode allows only EAPoL before authorization.'
            ]
        },
        {
            id: 'ise-023',
            domain: '2',
            objective: '2.4.d',
            type: 'single',
            q: 'A conference room port connects to a small unmanaged switch with three laptops. Each laptop must authenticate individually and may receive a different dACL. Which host mode is required?',
            choices: [
                'single-host',
                'multi-auth',
                'multi-domain',
                'multi-host'
            ],
            answer: [1],
            explain: 'Multi-auth authenticates each MAC address on the port separately, allowing many data devices (and one voice device). Each session can receive its own authorization.',
            why: [
                'Single-host allows only one MAC and raises a violation for additional devices.',
                'Correct: multi-auth authenticates each device separately.',
                'Multi-domain allows one data device and one voice device only.',
                'Multi-host authenticates the first device and lets the others ride on that session.'
            ]
        },
        {
            id: 'ise-024',
            domain: '2',
            objective: '2.4',
            type: 'single',
            q: 'A switch uses IBNS 2.0 with this policy (the class-maps match a failed dot1x and a failed mab result):\npolicy-map type control subscriber DOT1X_MAB\n event session-started match-all\n  10 class always do-until-failure\n   10 authenticate using dot1x priority 10\n event authentication-failure match-first\n  10 class DOT1X_FAILED do-until-failure\n   10 terminate dot1x\n   20 authenticate using mab priority 20\n  20 class MAB_FAILED do-until-failure\n   10 terminate mab\n   20 authentication-restart 60\n\nA printer without a supplicant connects and its MAC is not known to ISE. What happens?',
            choices: [
                'The switch tries MAB immediately and never tries 802.1X',
                'The port goes err-disabled after the MAB failure',
                '802.1X times out and the port is moved to the critical VLAN until a RADIUS server responds again',
                '802.1X fails, MAB is tried and fails, and authentication restarts after 60 seconds'
            ],
            answer: [3],
            explain: 'The session-started event runs 802.1X first. When it fails, the DOT1X_FAILED class terminates dot1x and starts MAB. When MAB fails, the MAB_FAILED class restarts authentication after 60 seconds.',
            why: [
                'The session-started event begins with dot1x, not MAB.',
                'Nothing in the policy err-disables the port.',
                'No critical service template is referenced, and critical access is for AAA-down events.',
                'Correct: this is the sequential dot1x-then-MAB flow with a restart timer.'
            ]
        },
        {
            id: 'ise-025',
            domain: '2',
            objective: '2.4',
            type: 'single',
            q: 'An IBNS 2.0 access port has this configuration:\ninterface GigabitEthernet1/0/5\n switchport mode access\n switchport access vlan 30\n access-session port-control auto\n mab\n service-policy type control subscriber DOT1X_MAB\n\nLaptops with working supplicants never complete 802.1X and are always authenticated by MAB instead. What is missing?',
            choices: [
                'access-session closed',
                'authentication convert-to new-style',
                'dot1x pae authenticator',
                'ip device tracking'
            ],
            answer: [2],
            explain: 'Without dot1x pae authenticator, the port never acts as an 802.1X authenticator, so the switch does not send EAP Request-Identity frames. The policy then falls back to MAB.',
            why: [
                'access-session closed changes open versus closed behavior but does not enable 802.1X.',
                'The port already uses IBNS 2.0 syntax, so the conversion is not the missing piece.',
                'Correct: the PAE authenticator role is needed for 802.1X on the port.',
                'Device tracking supports dACL and IP learning, not EAP exchange.'
            ]
        },
        {
            id: 'ise-026',
            domain: '2',
            objective: '2.5',
            type: 'single',
            q: 'How does ISE recognize that an incoming RADIUS Access-Request is a MAC Authentication Bypass request from a Cisco switch?',
            choices: [
                'The request contains an EAP-Message attribute with the MAC address',
                'The Framed-IP-Address matches a DHCP lease in the endpoint database',
                'The NAS-Port-Type is Virtual',
                'Service-Type is Call Check and User-Name is the endpoint MAC'
            ],
            answer: [3],
            explain: 'Cisco switches send MAB requests with Service-Type Call Check and the MAC address as the username (and password by default). ISE processes them with Process Host Lookup when it is allowed in the Allowed Protocols.',
            why: [
                'Default MAB does not use EAP.',
                'MAB is identified before any IP address may exist.',
                'Wired switch ports report Ethernet, not Virtual.',
                'Correct: Call Check plus the MAC as username identifies MAB.'
            ]
        },
        {
            id: 'ise-027',
            domain: '2',
            objective: '2.5',
            type: 'single',
            q: 'Guests connect to a wired port that uses MAB. ISE should redirect unknown devices to the guest portal, but the Live Log shows the unknown MAC rejected during authentication, before authorization is evaluated. What should be changed?',
            choices: [
                'Disable Process Host Lookup in the Allowed Protocols',
                'Change the identity source for the MAB rule to Active Directory',
                'Set the MAB rule\'s If User Not Found option to Continue',
                'Move the guest redirect authorization rule to the top of the policy set'
            ],
            answer: [2],
            explain: 'An unknown MAC fails the internal endpoints lookup. Setting If User Not Found to Continue lets the request proceed to authorization, where a redirect rule can match.',
            why: [
                'Disabling Process Host Lookup would break MAB entirely.',
                'AD does not store endpoint MAC addresses for MAB.',
                'Correct: continuing on user-not-found is what makes CWA for unknown MACs possible.',
                'Authorization order does not matter if authentication rejects the request first.'
            ]
        },
        {
            id: 'ise-028',
            domain: '2',
            objective: '2.5',
            type: 'multi',
            q: 'Which two statements about MAC Authentication Bypass are true? (Choose two.)',
            choices: [
                'MAB is protected end to end by a TLS tunnel between the switch and ISE',
                'MAB is always attempted before 802.1X under IBNS 2.0',
                'Because MAC addresses can be spoofed, MAB endpoints are usually given limited access or combined with profiling',
                'The switch must learn the endpoint MAC address from a frame the endpoint sends before it can build the MAB request',
                'MAB requires a supplicant that responds to EAP Request-Identity frames'
            ],
            answer: [2, 3],
            explain: 'MAB uses the source MAC learned from traffic as the identity. It is a weak credential, so designs usually pair it with profiling and restrictive authorization.',
            why: [
                'MAB uses standard RADIUS, not a TLS tunnel.',
                'The order is set by the control policy; dot1x first is common.',
                'Correct: MAC spoofing risk drives limited access and profiling.',
                'Correct: the switch needs a frame from the device to learn its MAC.',
                'MAB exists for devices without a supplicant.'
            ]
        },
        {
            id: 'ise-029',
            domain: '2',
            objective: '2.6',
            type: 'single',
            q: 'A switch that cannot tag traffic inline must share its IP-to-SGT bindings with an upstream firewall that enforces policy. Which protocol and transport does this use?',
            choices: [
                'SXP over TCP port 64999',
                'SXP over UDP port 1812',
                'pxGrid over TCP port 49',
                'Cisco Metadata over UDP port 1700'
            ],
            answer: [0],
            explain: 'The SGT Exchange Protocol (SXP) propagates IP-to-SGT bindings between devices over a TCP connection on port 64999 when inline tagging is not available along the path.',
            why: [
                'Correct: SXP uses TCP 64999.',
                'UDP 1812 is RADIUS authentication.',
                'TCP 49 is TACACS+, and pxGrid is not a switch-to-firewall binding protocol.',
                'Cisco Metadata is an inline Ethernet header, and UDP 1700 is the Cisco CoA default.'
            ]
        },
        {
            id: 'ise-030',
            domain: '2',
            objective: '2.6',
            type: 'single',
            q: 'ISE assigns SGTs to users correctly, and the TrustSec matrix has a deny SGACL from Contractors to Finance-Servers. The Finance servers connect to a Catalyst switch that has learned their SGT, but contractors can still reach them. What is the most likely missing piece on that switch?',
            choices: [
                'ip dhcp snooping',
                'dot1x system-auth-control',
                'aaa accounting dot1x default start-stop group radius',
                'cts role-based enforcement'
            ],
            answer: [3],
            explain: 'SGACLs are enforced at egress, close to the destination. The switch only applies them when role-based enforcement is enabled (globally and, for switched traffic, on the relevant VLANs).',
            why: [
                'DHCP snooping does not enforce SGACLs.',
                'system-auth-control enables 802.1X globally but does not enable SGACL enforcement.',
                'Accounting sends records to ISE and does not enforce policy.',
                'Correct: without role-based enforcement the switch does not apply SGACLs.'
            ]
        },
        {
            id: 'ise-031',
            domain: '2',
            objective: '2.7',
            type: 'single',
            q: 'An administrator creates a new policy set for a branch SSID and places it below an existing policy set whose condition is Radius:NAS-Port-Type EQUALS Wireless - IEEE 802.11. The new policy set is never hit. Why?',
            choices: [
                'Policy sets are first-match, top-down, so the broader set above catches the traffic',
                'Policy sets are evaluated in alphabetical order',
                'Only the Default policy set is used for wireless traffic',
                'A newly created policy set stays inactive until the application service is restarted on every PSN'
            ],
            answer: [0],
            explain: 'ISE evaluates policy sets in order and uses the first set whose condition matches. More specific sets must sit above broader ones.',
            why: [
                'Correct: first match wins, so order matters.',
                'Names do not affect evaluation order.',
                'The Default set is used only when no other set matches.',
                'Policy changes take effect without restarting PSNs.'
            ]
        },
        {
            id: 'ise-032',
            domain: '2',
            objective: '2.7',
            type: 'single',
            q: 'In an ISE policy set that has local exceptions and global exceptions defined, in what order is the authorization policy evaluated?',
            choices: [
                'Standard rules, then local exceptions, then global exceptions',
                'Global exceptions, then standard rules, then local exceptions',
                'All three are evaluated and the most restrictive result is applied',
                'Local exceptions, then global exceptions, then standard rules'
            ],
            answer: [3],
            explain: 'ISE checks the policy set\'s local exceptions first, then the global exceptions, and finally the standard authorization rules. The first matching rule wins.',
            why: [
                'Exceptions are checked before standard rules, not after.',
                'Local exceptions come before global exceptions.',
                'ISE uses first match, not a most-restrictive merge.',
                'Correct: local, then global, then standard.'
            ]
        },
        {
            id: 'ise-033',
            domain: '2',
            objective: '2.7',
            type: 'single',
            q: 'An authorization profile must place wired users into VLAN \'STAFF\'. Which RADIUS attribute carries the VLAN ID or name in the Access-Accept?',
            choices: [
                'Filter-Id',
                'Airespace-Interface-Name',
                'Tunnel-Private-Group-ID',
                'Class'
            ],
            answer: [2],
            explain: 'Dynamic VLAN assignment uses Tunnel-Type = VLAN (13), Tunnel-Medium-Type = 802 (6), and Tunnel-Private-Group-ID carrying the VLAN number or name.',
            why: [
                'Filter-Id names a locally defined ACL.',
                'Airespace-Interface-Name selects an interface on a wireless controller, not a switch VLAN.',
                'Correct: Tunnel-Private-Group-ID carries the VLAN.',
                'Class is an opaque value echoed back in accounting.'
            ]
        },
        {
            id: 'ise-034',
            domain: '2',
            objective: '2.7',
            type: 'single',
            q: 'ISE returns a downloadable ACL with entries such as \'permit ip any host 10.10.5.20\'. On the switch, show access-session shows the dACL applied, but the entries were not rewritten with the endpoint\'s IP address and traffic is not filtered as expected. Which switch feature should be checked first?',
            choices: [
                'Device tracking (IPDT or SISF) on the access port',
                'Spanning-tree PortFast and BPDU Guard on the access interface',
                'The RADIUS dead-criteria timers',
                'dot1x pae supplicant on the uplink'
            ],
            answer: [0],
            explain: 'The switch replaces the \'any\' source in dACL entries with the host\'s IP address. It learns that address through device tracking (IPDT/SISF), so the feature must be active on the port.',
            why: [
                'Correct: device tracking provides the IP used for source substitution.',
                'PortFast affects spanning-tree convergence, not dACL rewriting.',
                'Dead-criteria timers only determine when a RADIUS server is considered down.',
                'A supplicant on the uplink does not affect access-port dACLs.'
            ]
        },
        {
            id: 'ise-035',
            domain: '2',
            objective: '2.7',
            type: 'multi',
            q: 'Security requires that network access is granted only when both the corporate machine and the logged-in user authenticate in the same 802.1X session. Which two EAP methods support this EAP chaining? (Choose two.)',
            choices: [
                'EAP-TTLS',
                'EAP-FAST',
                'PEAP',
                'EAP-TLS',
                'TEAP'
            ],
            answer: [1, 4],
            explain: 'EAP chaining carries machine and user credentials in one tunneled conversation. TEAP (RFC 7170) and Cisco EAP-FAST support it, and ISE can then check the chaining result in authorization.',
            why: [
                'EAP-TTLS is not used for chaining in ISE.',
                'Correct: EAP-FAST supports chaining.',
                'PEAP carries one inner method per authentication.',
                'EAP-TLS is a single certificate exchange without chaining.',
                'Correct: TEAP supports chaining.'
            ]
        },
        {
            id: 'ise-036',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'What is a key difference between Central Web Authentication (CWA) and Local Web Authentication (LWA) with ISE?',
            choices: [
                'CWA uses an ISE-hosted portal reached through MAB and redirect, while LWA has the NAD collect credentials and send them to ISE in RADIUS',
                'CWA requires an 802.1X supplicant on the endpoint to reach the portal, while LWA works with any web browser and no supplicant at all',
                'CWA works only on wireless networks, while LWA works only on wired networks',
                'LWA supports sponsored guest accounts, while CWA supports only hotspot access'
            ],
            answer: [0],
            explain: 'In CWA, ISE hosts the portal: the NAD performs MAB, ISE returns a redirect, the user logs in on ISE and a CoA re-authorizes the session. In LWA the NAD intercepts the login and sends the credentials to ISE as a normal RADIUS request.',
            why: [
                'Correct: portal location and the MAB/redirect/CoA flow are the difference.',
                'Neither web authentication method needs an 802.1X supplicant.',
                'Both methods can be used on wired and wireless networks.',
                'CWA supports all ISE guest portal types, including sponsored accounts.'
            ]
        },
        {
            id: 'ise-037',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'Put the Central Web Authentication flow for a new wireless guest in the correct order.',
            choices: [
                'Guest logs in on the portal; NAD sends MAB; ISE returns redirect; ISE sends CoA',
                'ISE sends CoA; NAD sends MAB; guest logs in; ISE returns redirect ACL',
                'NAD sends 802.1X with the guest credentials; ISE returns the redirect URL; guest accepts the AUP page; ISE sends a final Access-Accept',
                'MAB; ISE returns redirect URL and ACL; guest logs in on ISE portal; ISE sends CoA; NAD re-authenticates and gets guest access'
            ],
            answer: [3],
            explain: 'CWA starts with MAB for the unknown MAC, ISE answers with the redirect attributes, the user authenticates on the ISE-hosted portal, and ISE sends a CoA so the NAD re-authenticates and gets the final guest access.',
            why: [
                'The guest cannot reach the portal before MAB and redirect have occurred.',
                'CoA comes after the portal login, not first.',
                'Guests do not use 802.1X in CWA.',
                'Correct: MAB, redirect, portal login, CoA, re-authorization.'
            ]
        },
        {
            id: 'ise-038',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'ISE returns url-redirect-acl=REDIRECT-ACL to a Catalyst access switch, which has this ACL:\nip access-list extended REDIRECT-ACL\n 10 deny udp any any eq domain\n 20 deny ip any host 198.51.100.10\n 30 permit tcp any any eq www\n 40 permit tcp any any eq 443\n\nThe PSN is 198.51.100.10. Which statement describes how the switch handles the guest\'s traffic?',
            choices: [
                'DNS and traffic to the PSN are not redirected; HTTP and HTTPS to other hosts are redirected to the ISE guest portal page',
                'DNS queries and traffic to the PSN are dropped, and HTTP or HTTPS to any other host is permitted without redirection',
                'All traffic matching a permit line is forwarded normally, and everything else is redirected',
                'Only traffic to 198.51.100.10 is redirected'
            ],
            answer: [0],
            explain: 'On a Catalyst switch, a permit in the redirect ACL means the traffic is redirected, and a deny means it is not redirected. The ACL controls redirection, and other access controls decide what is actually forwarded.',
            why: [
                'Correct: deny bypasses redirection, permit triggers it.',
                'Deny entries in a redirect ACL mean do not redirect; they do not drop traffic.',
                'That inverts the switch semantics.',
                'Traffic to the PSN is explicitly excluded from redirection.'
            ]
        },
        {
            id: 'ise-039',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'An engineer copies the redirect ACL logic from a Catalyst switch to a legacy AireOS wireless controller without changes. Guests are no longer redirected and can reach the internet freely. Why?',
            choices: [
                'On AireOS, permit means pass without redirect and deny means redirect, the reverse of the switch',
                'AireOS does not support CWA',
                'AireOS only accepts the redirect ACL when it is pushed from ISE as a downloadable ACL instead of being defined locally',
                'AireOS redirects only HTTPS traffic'
            ],
            answer: [0],
            explain: 'On AireOS controllers, the redirect ACL permits the traffic that may pass before authentication, and traffic it denies is redirected. Copying switch-style logic inverts the behavior.',
            why: [
                'Correct: the permit and deny meanings are reversed on AireOS.',
                'AireOS supports CWA with the ISE NAC setting.',
                'The redirect ACL is a locally defined ACL referenced by name.',
                'HTTP is the primary redirected protocol.'
            ]
        },
        {
            id: 'ise-040',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'Wired guests on a Catalyst switch match the CWA authorization rule and receive the redirect attributes, but their browsers never reach the portal. show access-session shows the URL redirect applied. Which global configuration is most likely missing on the switch?',
            choices: [
                'aaa authorization network default group radius',
                'dot1x system-auth-control',
                'ip http server and ip http secure-server',
                'ip routing'
            ],
            answer: [2],
            explain: 'The switch intercepts the guest\'s web traffic with its own HTTP and HTTPS server processes before sending the redirect. Without them, the redirect never reaches the browser.',
            why: [
                'If network authorization were missing, the redirect attributes would not be applied at all.',
                'system-auth-control is needed for 802.1X and is not what CWA redirect depends on, which the session already shows working.',
                'Correct: the switch HTTP/HTTPS server is needed to perform the redirect.',
                'Layer 3 routing on the access switch is not required for redirection.'
            ]
        },
        {
            id: 'ise-041',
            domain: '3',
            objective: '3.1',
            type: 'multi',
            q: 'Which two Cisco AV pairs does ISE return to a Catalyst switch to start a Central Web Authentication redirect? (Choose two.)',
            choices: [
                'url-redirect-acl',
                'url-redirect',
                'cts:security-group-tag',
                'Tunnel-Private-Group-ID',
                'Filter-Id'
            ],
            answer: [0, 1],
            explain: 'The cisco-av-pair url-redirect provides the portal URL including the session ID, and url-redirect-acl names the local ACL that selects which traffic is redirected.',
            why: [
                'Correct: url-redirect-acl selects which traffic is redirected.',
                'Correct: url-redirect carries the portal URL.',
                'The SGT AV pair assigns a Security Group Tag.',
                'Tunnel-Private-Group-ID is used for VLAN assignment.',
                'Filter-Id applies a local ACL by name, not a redirect.'
            ]
        },
        {
            id: 'ise-042',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'After a guest logs in on the ISE guest portal, ISE sends a CoA and the NAD re-authenticates the endpoint with MAB. Which condition is commonly used in the authorization rule to give this session guest access instead of redirecting it again?',
            choices: [
                'Radius:Service-Type EQUALS Login',
                'Network Access:UseCase EQUALS Guest Flow',
                'Session:PostureStatus EQUALS Compliant',
                'Network Access:EapAuthentication EQUALS EAP-TLS'
            ],
            answer: [1],
            explain: 'When a portal login precedes the re-authentication, ISE marks the session with the Guest Flow use case. A rule using that condition above the redirect rule gives the guest final access.',
            why: [
                'MAB uses Service-Type Call Check, and Login does not mark a guest flow.',
                'Correct: Guest Flow identifies a session that completed portal authentication.',
                'Posture status is unrelated to guest login.',
                'Guests do not authenticate with EAP-TLS.'
            ]
        },
        {
            id: 'ise-043',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'A lobby SSID must give visitors internet access after they accept an acceptable use policy, without creating or entering any credentials. Which ISE guest portal type fits?',
            choices: [
                'Sponsored-Guest portal',
                'Hotspot Guest portal',
                'Self-Registered Guest portal',
                'My Devices portal'
            ],
            answer: [1],
            explain: 'The Hotspot portal grants access after AUP acceptance (and optionally an access code) without guest accounts. ISE usually records the endpoint in an identity group so returning devices are recognized.',
            why: [
                'Sponsored guests need accounts created by a sponsor.',
                'Correct: Hotspot is credential-free access.',
                'Self-registration creates an account and credentials.',
                'My Devices is for employees to manage their own registered devices.'
            ]
        },
        {
            id: 'ise-044',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'Contractor guest accounts must expire after a maximum of five days and may only log in on weekdays. Where are these limits defined?',
            choices: [
                'In the guest type',
                'In the sponsor portal theme',
                'In the authorization profile',
                'In the identity source sequence'
            ],
            answer: [0],
            explain: 'Guest types set account properties such as maximum access time, allowed login days and times, and maximum simultaneous logins. Sponsors and portals then create accounts of a guest type.',
            why: [
                'Correct: the guest type holds account duration and login restrictions.',
                'Portal themes control appearance.',
                'Authorization profiles control network access results, not account lifetime.',
                'Identity source sequences control the order of identity stores.'
            ]
        },
        {
            id: 'ise-045',
            domain: '3',
            objective: '3.3',
            type: 'single',
            q: 'Receptionists should be able to create Daily guest accounts but not Contractor accounts, while IT staff may create both. Membership comes from AD groups. What should the administrator configure?',
            choices: [
                'Two guest portals with different certificates',
                'Two sponsor groups mapped to the AD groups, each allowed only the right guest types',
                'Two authorization profiles that place each set of sponsors into a different VLAN when they log in',
                'Two TACACS+ shell profiles'
            ],
            answer: [1],
            explain: 'Sponsor groups define what sponsors can do, including which guest types they can create and which accounts they can manage. Members are mapped from internal or external groups such as AD.',
            why: [
                'Portal certificates do not control sponsor permissions.',
                'Correct: sponsor groups control which guest types each set of sponsors may create.',
                'Network authorization does not control sponsor portal privileges.',
                'TACACS+ is for device administration.'
            ]
        },
        {
            id: 'ise-046',
            domain: '3',
            objective: '3.3',
            type: 'single',
            q: 'Visitors must be able to register themselves at the door, but their accounts should only be activated after the employee they are visiting agrees. Which configuration meets this?',
            choices: [
                'A Hotspot portal with an access code',
                'A Sponsored-Guest portal with bulk CSV import',
                'A Self-Registered Guest portal that requires approval by the person being visited',
                'A BYOD portal that issues the visitor a certificate once the employee they are visiting logs in and approves'
            ],
            answer: [2],
            explain: 'The Self-Registered Guest portal can require sponsor approval before the account becomes active, including routing the approval request to the person being visited.',
            why: [
                'An access code is a shared value, not per-visitor approval.',
                'Bulk import is done by sponsors, not by visitors.',
                'Correct: self-registration with approval meets the requirement.',
                'BYOD onboarding is for employee devices.'
            ]
        },
        {
            id: 'ise-047',
            domain: '3',
            objective: '3.3',
            type: 'single',
            q: 'Guests see a browser certificate warning on the ISE guest portal. The portal URL uses guest.example.com, but the certificate presented carries only the PSN\'s internal hostname. What should be done?',
            choices: [
                'Disable HTTPS on the guest portal',
                'Assign a publicly trusted certificate containing guest.example.com to the portal\'s certificate group tag',
                'Import each guest browser\'s client certificate into the ISE trusted certificates store before the guest arrives on site',
                'Change the portal port from 8443 to 443'
            ],
            answer: [1],
            explain: 'Each portal references a certificate group tag. The system certificate with that tag must include the portal FQDN and be signed by a CA that guest devices trust, usually a public CA.',
            why: [
                'Guest portals use HTTPS; disabling it is not the fix.',
                'Correct: the portal certificate must match the FQDN and be publicly trusted.',
                'Guest browsers do not present certificates.',
                'Changing the port does not fix a name mismatch.'
            ]
        },
        {
            id: 'ise-048',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'Returning hotspot guests should not see the AUP page again for 24 hours. ISE adds their endpoints to the GuestEndpoints identity group on acceptance. What else is needed so that returning devices go straight to internet access?',
            choices: [
                'A guest type with a maximum access time of 24 hours assigned to the hotspot portal so accounts expire automatically',
                'A Profiler CoA type of Port Bounce',
                'A rule above the redirect rule that matches GuestEndpoints, plus a 24-hour endpoint purge policy',
                'An identity source sequence that includes GuestEndpoints'
            ],
            answer: [2],
            explain: 'Hotspot access has no account, so recognizing returning devices depends on endpoint identity group membership in an authorization rule. A purge policy keeps that membership from lasting forever.',
            why: [
                'Guest types govern guest accounts, which hotspot users do not have.',
                'Profiler CoA is unrelated to remembering guests.',
                'Correct: identity group match plus purge provides the 24-hour behavior.',
                'Identity source sequences are for authentication stores, not endpoint groups.'
            ]
        },
        {
            id: 'ise-049',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'Self-registered guests should receive their username and password as a text message. What must exist in ISE for this to work?',
            choices: [
                'A TACACS+ server for message delivery',
                'An SNMP trap receiver for each guest',
                'A pxGrid subscriber that relays the credentials to the guest\'s phone',
                'An SMS gateway provider enabled for the portal'
            ],
            answer: [3],
            explain: 'ISE sends SMS notifications through a configured SMS gateway (via an email-to-SMS service or an HTTP API provider). The portal then offers SMS as a delivery option.',
            why: [
                'TACACS+ does not deliver messages.',
                'SNMP traps do not reach phones.',
                'pxGrid shares context with security products, not guest credentials.',
                'Correct: an SMS gateway is required for text delivery.'
            ]
        },
        {
            id: 'ise-050',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'A Catalyst 9800 controller hosts an open guest SSID for CWA. Guests associate but never receive a redirect, and ISE Live Logs show no requests from their MAC addresses. Which WLAN setting is most likely missing?',
            choices: [
                'Fast transition (802.11r) over the DS',
                '802.1X key management',
                'MAC filtering (MAB) on the WLAN',
                'Band select'
            ],
            answer: [2],
            explain: 'CWA begins with MAB. On an open WLAN, MAC filtering is what makes the controller send the MAC-based RADIUS request to ISE. Without it, ISE never sees the client.',
            why: [
                'Fast transition speeds up roaming and does not trigger a RADIUS request for an open SSID.',
                'An open guest SSID does not use 802.1X.',
                'Correct: MAC filtering triggers the MAB request that starts CWA.',
                'Band select only steers clients between radio bands.'
            ]
        },
        {
            id: 'ise-051',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'An endpoint matches two profiling policies. Policy A has a minimum certainty factor of 20 and the endpoint scores 30 in it. Policy B has a minimum certainty factor of 40 and the endpoint scores 35 in it. Which profile is assigned?',
            choices: [
                'Policy B, because it has the higher minimum certainty factor',
                'Policy B, because its total score of 35 is higher',
                'Neither, because the endpoint matches more than one policy',
                'Policy A, because only its minimum certainty factor threshold is met'
            ],
            answer: [3],
            explain: 'A profile can be assigned only when the endpoint\'s total certainty factor meets that policy\'s minimum. Among qualifying policies, the highest total wins; here only Policy A qualifies.',
            why: [
                'The minimum is a threshold, not a ranking.',
                'A higher score only matters if the minimum is met.',
                'Matching more than one policy is normal; the profiler picks the best qualifying one.',
                'Correct: 30 meets 20, but 35 does not meet 40.'
            ]
        },
        {
            id: 'ise-052',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'A new model of medical device is being profiled as Unknown. Cisco has since published a matching profile. Which ISE capability brings in the new Cisco-provided profiling policies?',
            choices: [
                'pxGrid context sharing',
                'Posture feed updates',
                'The Profiler Feed Service',
                'Endpoint purge'
            ],
            answer: [2],
            explain: 'The Profiler Feed Service downloads new and updated profiling policies and OUI data from Cisco so devices can be classified without the administrator writing every policy.',
            why: [
                'pxGrid shares context but does not deliver Cisco profile libraries.',
                'Posture updates refresh posture conditions and checks.',
                'Correct: the feed service delivers Cisco profiling updates.',
                'Purge removes stale endpoints.'
            ]
        },
        {
            id: 'ise-053',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'The DHCP probe is enabled on a PSN at 198.51.100.21. Endpoints in VLAN 40 use a DHCP server at 10.1.1.5. Which SVI configuration lets the probe see their DHCP requests while normal addressing continues?',
            choices: [
                'interface Vlan40\n ip helper-address 198.51.100.21',
                'interface Vlan40\n ip helper-address 10.1.1.5\n ip helper-address 198.51.100.21',
                'interface Vlan40\n ip dhcp snooping trust',
                'interface Vlan40\n ip helper-address 10.1.1.5\n ip dhcp relay information option'
            ],
            answer: [1],
            explain: 'Adding the PSN as a second helper address copies each DHCP request to ISE, where the DHCP probe reads attributes such as the hostname and class identifier, while the real server still answers.',
            why: [
                'Pointing only at ISE would break addressing, because ISE does not hand out leases.',
                'Correct: two helpers keep DHCP working and feed the probe.',
                'Snooping trust is a security setting and does not forward requests to ISE.',
                'Option 82 adds relay information but does not send requests to ISE.'
            ]
        },
        {
            id: 'ise-054',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'Catalyst access switches run Device Sensor, collecting CDP, LLDP and DHCP information from endpoints. Which ISE probe must be enabled to use that data?',
            choices: [
                'SNMP Trap',
                'RADIUS',
                'NetFlow',
                'DNS'
            ],
            answer: [1],
            explain: 'Device Sensor sends the collected TLVs and DHCP options to ISE inside RADIUS accounting messages as Cisco AV pairs. The RADIUS probe parses them.',
            why: [
                'SNMP traps signal link events and do not carry device sensor data.',
                'Correct: device sensor data rides in RADIUS accounting.',
                'NetFlow carries traffic flow records.',
                'DNS resolves FQDNs and does not receive device sensor data.'
            ]
        },
        {
            id: 'ise-055',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'Which endpoint attribute does the HTTP probe primarily use to help identify an endpoint\'s operating system and device type?',
            choices: [
                'The DHCP class identifier',
                'The OUI of the MAC address',
                'The CDP platform field',
                'The User-Agent string'
            ],
            answer: [3],
            explain: 'The HTTP probe reads the User-Agent header from browser traffic, for example when the endpoint is redirected to an ISE portal, or from a SPAN of web traffic.',
            why: [
                'The class identifier comes from the DHCP probe.',
                'OUI comes from the MAC address itself.',
                'CDP information comes from SNMP Query or Device Sensor.',
                'Correct: User-Agent is the HTTP probe attribute.'
            ]
        },
        {
            id: 'ise-056',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'The DNS probe is enabled, but some endpoints never get an FQDN attribute. What does the DNS probe depend on to perform its lookup?',
            choices: [
                'A SPAN session that copies all DNS traffic to the PSN',
                'A full forward zone transfer from the corporate DNS server to every PSN',
                'An endpoint IP address learned from another source, such as DHCP or RADIUS accounting',
                'The NMAP probe completing an OS scan first'
            ],
            answer: [2],
            explain: 'The DNS probe does a reverse lookup on the endpoint IP address. If no other source has supplied the IP, there is nothing to look up.',
            why: [
                'The DNS probe queries DNS; it does not sniff DNS traffic.',
                'ISE does not request zone transfers.',
                'Correct: the DNS probe needs the IP address from another probe.',
                'NMAP is not a prerequisite for reverse DNS.'
            ]
        },
        {
            id: 'ise-057',
            domain: '4',
            objective: '4.2',
            type: 'multi',
            q: 'Which two profiling probes are active, meaning ISE itself initiates the traffic to gather data? (Choose two.)',
            choices: [
                'RADIUS',
                'NetFlow',
                'SNMP Query',
                'DHCP',
                'NMAP'
            ],
            answer: [2, 4],
            explain: 'NMAP scans endpoints and SNMP Query polls network devices for tables such as CDP, LLDP and ARP. DHCP, RADIUS and NetFlow are passive: ISE only receives what is sent to it.',
            why: [
                'RADIUS data arrives from NADs.',
                'NetFlow records are exported to ISE.',
                'Correct: SNMP Query is ISE polling the NAD.',
                'DHCP data arrives from helpers or SPAN; ISE does not ask for it.',
                'Correct: NMAP is an active scan.'
            ]
        },
        {
            id: 'ise-058',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'A switch cannot run Device Sensor. Which ISE profiling probe can still collect CDP and LLDP neighbor data about endpoints from that switch?',
            choices: [
                'SNMP Query, using the device\'s SNMP settings',
                'DHCP SPAN',
                'HTTP, using User-Agent strings from redirected sessions',
                'Active Directory'
            ],
            answer: [0],
            explain: 'The SNMP Query probe polls the network device for neighbor and interface information using the SNMP credentials configured on its network device entry.',
            why: [
                'Correct: SNMP Query retrieves CDP and LLDP data from the NAD.',
                'DHCP SPAN only sees DHCP packets.',
                'HTTP sees browser User-Agents.',
                'The AD probe gathers information about domain-joined computers, not switch neighbor tables.'
            ]
        },
        {
            id: 'ise-059',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'A printer authenticates with MAB and gets a limited authorization because it is profiled as Unknown at first. A few minutes later it is profiled as a printer, but it keeps the limited access until someone reconnects the cable. The printer authorization rule is correct. What is the likely cause?',
            choices: [
                'The printer does not support 802.1X',
                'The global profiler CoA type is set to No CoA',
                'The switch port is in multi-auth host mode',
                'The DHCP probe is disabled on the PSN that handles the printer'
            ],
            answer: [1],
            explain: 'When an endpoint\'s profile changes, ISE sends a CoA only if the global profiler CoA type is Reauth or Port Bounce. With No CoA, the new profile applies only at the next authentication.',
            why: [
                'MAB is already in use, so 802.1X support is irrelevant.',
                'Correct: No CoA prevents re-authorization after profiling changes.',
                'Multi-auth does not prevent a reauth CoA.',
                'The device was profiled correctly, so probe data is not the issue.'
            ]
        },
        {
            id: 'ise-060',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'The profiler CoA type is set to Port Bounce. An IP phone and a PC share a multi-domain port, and the PC\'s profile changes. What does ISE do?',
            choices: [
                'It bounces the port anyway, disconnecting both devices',
                'It shuts down the port administratively',
                'It sends no CoA at all, because Port Bounce applies only to wireless sessions',
                'It sends a Reauth CoA instead, to avoid disrupting the phone'
            ],
            answer: [3],
            explain: 'ISE avoids bouncing ports that carry more than one session and sends a reauthentication CoA instead, so the phone call is not dropped.',
            why: [
                'Bouncing would disrupt the phone; ISE avoids this.',
                'Port shutdown is not a profiler CoA result.',
                'Port Bounce is a wired concept, but it is not simply skipped here.',
                'Correct: ISE falls back to Reauth for multi-session ports.'
            ]
        },
        {
            id: 'ise-061',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'ISE sends CoA requests to an access switch at 10.20.0.2, but they are ignored and ISE reports a CoA timeout. The RADIUS server configuration on the switch works. Which configuration is missing on the switch?',
            choices: [
                'aaa accounting dot1x default start-stop group ISE',
                'radius server ISE1\n address ipv4 198.51.100.21 auth-port 1812 acct-port 1813\n key MySharedKey',
                'aaa server radius dynamic-author\n client 198.51.100.21 server-key MySharedKey',
                'ip radius source-interface Vlan100'
            ],
            answer: [2],
            explain: 'The switch only accepts CoA from clients listed under aaa server radius dynamic-author with a matching key. ISE sends Cisco CoA to UDP port 1700 by default.',
            why: [
                'Accounting is useful but does not enable CoA.',
                'The RADIUS server block defines where requests are sent; the stem says it already works, and it does not authorize incoming CoA.',
                'Correct: dynamic-author enables the switch to receive CoA from ISE.',
                'The source interface affects outbound RADIUS, not acceptance of CoA.'
            ]
        },
        {
            id: 'ise-062',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'An endpoint profiled as a printer suddenly authenticates over wireless and sends a DHCP class identifier typical of a Windows PC. Security suspects MAC spoofing. Which ISE capability is designed to detect this and act on it?',
            choices: [
                'TACACS+ command authorization on the access switch',
                'Posture reassessment',
                'Endpoint purge policy',
                'Anomalous behavior detection with enforcement'
            ],
            answer: [3],
            explain: 'Anomalous endpoint detection flags changes such as a NAS-Port-Type change, a DHCP class identifier change, or a move to an unrelated profile. With enforcement enabled, ISE can issue a CoA and the flag can be used in authorization rules.',
            why: [
                'Command authorization is for administrators on network devices.',
                'Posture assesses compliance on agent-capable devices.',
                'Purge removes inactive endpoints.',
                'Correct: anomalous behavior detection targets MAC spoofing patterns.'
            ]
        },
        {
            id: 'ise-063',
            domain: '4',
            objective: '4.4',
            type: 'single',
            q: 'A lab device keeps being re-profiled into the wrong group by the profiler. The administrator wants it to stay in the \'Lab-Approved\' identity group permanently. What should be done?',
            choices: [
                'Disable the RADIUS probe',
                'Statically assign the endpoint to that identity group',
                'Set the endpoint purge age to 0',
                'Create a dedicated policy set that matches the device\'s MAC address'
            ],
            answer: [1],
            explain: 'Static group assignment pins an endpoint to an identity group regardless of what profiling concludes. It is the normal way to override profiling for a specific endpoint.',
            why: [
                'Disabling a probe affects all endpoints and may break profiling.',
                'Correct: static assignment keeps the group fixed.',
                'Purge settings control removal, not group assignment.',
                'Policy sets do not fix identity group membership.'
            ]
        },
        {
            id: 'ise-064',
            domain: '4',
            objective: '4.4',
            type: 'single',
            q: 'The endpoint database has grown with hundreds of thousands of guest and transient devices that have not been seen in months. What should the administrator configure to clean this up automatically?',
            choices: [
                'Posture lease',
                'Profiler feed service',
                'Identity source sequence',
                'Endpoint purge policy rules'
            ],
            answer: [3],
            explain: 'Endpoint purge rules remove endpoints based on conditions such as inactivity days and identity group, keeping the database lean.',
            why: [
                'Posture lease controls reassessment frequency.',
                'The feed updates profiles but does not remove endpoints.',
                'Sequences order identity stores.',
                'Correct: purge removes stale endpoints.'
            ]
        },
        {
            id: 'ise-065',
            domain: '4',
            objective: '4.4',
            type: 'single',
            q: 'An administrator wants one authorization rule that matches every phone from several vendors, each with its own profiling policy. What is the cleanest way to do this?',
            choices: [
                'Group the phone profiles in a logical profile and use it in the rule',
                'Create one authorization rule per vendor',
                'Statically assign every phone MAC address to the Workstation identity group by hand',
                'Disable profiling for phones and use MAB only'
            ],
            answer: [0],
            explain: 'Logical profiles group related profiling policies so a single authorization condition can match all of them.',
            why: [
                'Correct: logical profiles group profiling policies for policy use.',
                'Per-vendor rules work but are harder to maintain.',
                'Assigning phones to the Workstation group is incorrect and manual.',
                'Removing profiling throws away the classification you need.'
            ]
        },
        {
            id: 'ise-066',
            domain: '5',
            objective: '5.1.a',
            type: 'single',
            q: 'Employees want to connect personal phones and laptops to the corporate SSID. IT requires certificate-based (EAP-TLS) access for these devices but cannot touch each device. Which ISE BYOD capability addresses this?',
            choices: [
                'Hotspot guest access with a 30-day account',
                'Native supplicant provisioning with certificate enrollment in a self-service onboarding flow',
                'TACACS+ device administration',
                'SXP propagation of each device\'s SGT to the wireless controller after its first login'
            ],
            answer: [1],
            explain: 'BYOD onboarding lets users self-register their devices. ISE provisions the native supplicant profile and issues a certificate so the device can then connect with EAP-TLS.',
            why: [
                'Guest access does not provide certificate-based corporate access.',
                'Correct: native supplicant provisioning is the self-service onboarding mechanism.',
                'TACACS+ controls administrator access to network devices.',
                'SXP shares SGT bindings and does not configure endpoints.'
            ]
        },
        {
            id: 'ise-067',
            domain: '5',
            objective: '5.1.b',
            type: 'multi',
            q: 'Which two ISE components are directly involved in onboarding a personal device for EAP-TLS with the internal CA? (Choose two.)',
            choices: [
                'The ISE internal CA issuing the endpoint certificate through SCEP',
                'The posture compliance module',
                'An SXP peer',
                'A native supplicant profile used by client provisioning',
                'A TACACS+ command set'
            ],
            answer: [0, 3],
            explain: 'BYOD onboarding combines client provisioning (the native supplicant profile and provisioning wizard) with certificate enrollment from the ISE internal CA, which acts as a SCEP CA for endpoints.',
            why: [
                'Correct: the internal CA issues the device certificate.',
                'The compliance module supports posture, not onboarding.',
                'SXP is a TrustSec protocol.',
                'Correct: the native supplicant profile defines how the device is configured.',
                'Command sets are for device administration.'
            ]
        },
        {
            id: 'ise-068',
            domain: '5',
            objective: '5.1.c',
            type: 'single',
            q: 'In a single-SSID BYOD flow, a user first connects to the secure SSID with PEAP using AD credentials. What is the correct sequence that follows?',
            choices: [
                'The user must disconnect and join a separate open provisioning SSID before ISE is able to redirect the browser',
                'ISE immediately grants full access, then pushes a certificate in the background through CoA',
                'Redirect to the BYOD portal, register and provision the device, then reconnect with EAP-TLS for full network access',
                'ISE sends the certificate to the WLC, which installs it on the device'
            ],
            answer: [2],
            explain: 'With a single SSID, the PEAP session gets a restricted, redirected authorization. After registration and provisioning, the device re-authenticates on the same SSID using EAP-TLS.',
            why: [
                'Using a separate open provisioning SSID is the dual-SSID flow.',
                'CoA cannot carry certificates, and full access is granted only after onboarding.',
                'Correct: redirect, register and provision, then reconnect with EAP-TLS.',
                'The WLC does not install certificates on endpoints.'
            ]
        },
        {
            id: 'ise-069',
            domain: '5',
            objective: '5.1.c',
            type: 'single',
            q: 'What distinguishes the dual-SSID BYOD flow from the single-SSID flow?',
            choices: [
                'The device is onboarded on a provisioning SSID and then joins a separate secure SSID',
                'The dual-SSID flow does not use certificates',
                'The dual-SSID flow requires an MDM',
                'In the dual-SSID flow the wireless controller, rather than ISE, onboards the device and issues its certificate'
            ],
            answer: [0],
            explain: 'Dual-SSID onboarding uses one SSID to reach the portal and provisioning flow and then moves the device to the secure SSID that the supplicant profile configures.',
            why: [
                'Correct: provisioning SSID first, then a separate secure SSID.',
                'Both flows typically provision certificates.',
                'MDM integration is optional in both flows.',
                'ISE performs onboarding in both flows.'
            ]
        },
        {
            id: 'ise-070',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'Employees authenticate with PEAP on the corporate SSID. Devices that are not yet registered should be sent to onboarding. What authorization result should the rule for unregistered PEAP users return?',
            choices: [
                'A native supplicant provisioning redirect with a redirect ACL',
                'PermitAccess with the employee VLAN',
                'A Hotspot portal redirect',
                'DenyAccess, so that the user must call the help desk to register the device'
            ],
            answer: [0],
            explain: 'The onboarding authorization profile redirects the user to the BYOD (native supplicant provisioning) flow while the redirect ACL limits the device to what onboarding needs.',
            why: [
                'Correct: NSP redirect with an ACL starts onboarding.',
                'Full access would skip onboarding.',
                'Hotspot is for guests and does not provision supplicants.',
                'Denying access prevents self-service onboarding.'
            ]
        },
        {
            id: 'ise-071',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'During single-SSID onboarding, Android devices reach the BYOD portal but stall when they need to download the provisioning app from the vendor\'s app store. Other platforms complete onboarding. What is the most likely cause?',
            choices: [
                'The internal CA is disabled',
                'The wireless controller does not have AAA override enabled on the WLAN',
                'The ISE portal certificate has expired',
                'The restricted access does not allow the app store'
            ],
            answer: [3],
            explain: 'Android onboarding requires downloading a provisioning app from the vendor store. During onboarding the device is restricted, so the ACLs must allow access to the store or the flow cannot finish.',
            why: [
                'A disabled CA would affect all platforms at certificate enrollment.',
                'Without AAA override, redirection would fail for all platforms.',
                'An expired portal certificate would affect all platforms at the portal.',
                'Correct: the restricted access must permit the app store.'
            ]
        },
        {
            id: 'ise-072',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'After onboarding, a device connects with EAP-TLS using its ISE-issued certificate. Which condition commonly identifies that this device completed BYOD registration?',
            choices: [
                'EndPoints:BYODRegistration EQUALS Yes',
                'Network Access:UseCase EQUALS Guest Flow',
                'Session:PostureStatus EQUALS Unknown',
                'Radius:Service-Type EQUALS Call Check'
            ],
            answer: [0],
            explain: 'ISE records the BYOD registration status on the endpoint. Rules for onboarded devices commonly combine this attribute with an EAP-TLS condition.',
            why: [
                'Correct: BYODRegistration marks onboarded endpoints.',
                'Guest Flow marks guest portal logins.',
                'Unknown posture is unrelated to onboarding.',
                'Call Check indicates MAB, not EAP-TLS.'
            ]
        },
        {
            id: 'ise-073',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'In the ISE internal CA hierarchy, which component issues certificates to BYOD endpoints?',
            choices: [
                'The endpoint sub-CA on the PSN that handles the device\'s onboarding request',
                'The root CA on the primary PAN signs every endpoint certificate directly',
                'The MnT node\'s certificate service',
                'The pxGrid CA'
            ],
            answer: [0],
            explain: 'The root CA lives on the primary PAN. Each PSN has a node CA and an endpoint sub-CA, and the endpoint sub-CA issues certificates to devices through SCEP.',
            why: [
                'Correct: the endpoint sub-CA on the PSN issues device certificates.',
                'The root signs the subordinate CAs, not endpoint certificates directly.',
                'MnT does not run certificate services.',
                'pxGrid certificates are separate from BYOD endpoint certificates.'
            ]
        },
        {
            id: 'ise-074',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'Why does the default ISE BYOD certificate template include the endpoint\'s MAC address in the Subject Alternative Name?',
            choices: [
                'So that the certificate can be used as a web server certificate',
                'Because EAP-TLS requires a MAC address in every certificate',
                'To bind the certificate to the registered device',
                'So that the switch can perform MAB with the certificate'
            ],
            answer: [2],
            explain: 'Including the MAC address binds the issued certificate to the specific registered device, which supports per-device lifecycle actions and misuse detection.',
            why: [
                'Endpoint certificates are for client authentication, not web servers.',
                'EAP-TLS itself does not require a MAC address.',
                'Correct: the MAC binds the certificate to one device.',
                'MAB does not use certificates.'
            ]
        },
        {
            id: 'ise-075',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'An administrator revokes a BYOD certificate issued by the ISE internal CA, but the device still connects with EAP-TLS. What must be in place for ISE to reject the revoked certificate?',
            choices: [
                'A new EAP system certificate signed by the internal CA',
                'A shorter posture lease',
                'OCSP or CRL status checking enabled for the issuing CA in the trusted store',
                'Profiler CoA set to Port Bounce'
            ],
            answer: [2],
            explain: 'Revocation only blocks access if ISE checks the certificate\'s status during authentication. The trusted certificate entry for the issuing CA must have OCSP or CRL validation enabled.',
            why: [
                'The EAP system certificate is presented by ISE, not checked for revocation of client certs.',
                'Posture lease has no effect on certificate validation.',
                'Correct: ISE must check revocation status for the issuing CA.',
                'Profiler CoA does not involve certificate status.'
            ]
        },
        {
            id: 'ise-076',
            domain: '5',
            objective: '5.4',
            type: 'single',
            q: 'A user reports a lost phone in the My Devices portal. Later, a person tries to connect with that phone. What normally happens?',
            choices: [
                'The phone connects normally, because its ISE-issued certificate has not been revoked and is still valid',
                'It matches the blocked list identity group and is denied or sent to the blocked list portal',
                'The phone is automatically wiped by ISE',
                'ISE sends a TACACS+ alert to the user\'s manager'
            ],
            answer: [1],
            explain: 'Marking a device lost places it in the blocked list identity group. Policy then denies the endpoint or redirects it to the blocked list portal.',
            why: [
                'Blocked list membership stops access even if the certificate is still valid.',
                'Correct: blocked list membership drives the deny or redirect.',
                'ISE does not wipe devices; an MDM could.',
                'TACACS+ is unrelated to endpoint access.'
            ]
        },
        {
            id: 'ise-077',
            domain: '5',
            objective: '5.4',
            type: 'multi',
            q: 'Which two statements about device lifecycle actions in the My Devices portal are true? (Choose two.)',
            choices: [
                'Marking a device stolen revokes the certificate the ISE internal CA issued to it',
                'Deleting a device from My Devices revokes the user\'s other certificates',
                'Only administrators can mark a device lost; users can only add devices',
                'Reinstating a lost device removes it from the blocked list so it can connect again',
                'Marking a device lost deletes the user\'s AD account'
            ],
            answer: [0, 3],
            explain: 'Stolen is the stronger action and revokes the device certificate. A lost device can be reinstated, which removes it from the blocked list.',
            why: [
                'Correct: stolen revokes the internal CA certificate.',
                'Lifecycle actions apply to the selected device only.',
                'Users can mark their own devices lost in My Devices.',
                'Correct: reinstate restores a lost device.',
                'ISE does not change AD accounts.'
            ]
        },
        {
            id: 'ise-078',
            domain: '5',
            objective: '5.4',
            type: 'single',
            q: 'An employee is terminated and their AD account disabled, but their onboarded BYOD laptop still connects with EAP-TLS because the certificate is valid. Which design change makes EAP-TLS sessions fail when the AD account is disabled?',
            choices: [
                'Reduce the RADIUS session timeout to 60 seconds so the laptop must re-authenticate every single minute',
                'Set the profiler CoA type to Reauth',
                'Enable the HTTP probe',
                'Look up the certificate identity in AD and use AD account or group conditions in the authorization policy'
            ],
            answer: [3],
            explain: 'EAP-TLS proves possession of a valid certificate but does not check the directory by itself. An AD lookup of the certificate identity makes disabled accounts fail.',
            why: [
                'A short timeout only re-runs the same certificate check.',
                'Profiler CoA reacts to profile changes, not account changes.',
                'The HTTP probe affects profiling, not account status.',
                'Correct: an AD lookup ties access to the account state.'
            ]
        },
        {
            id: 'ise-079',
            domain: '5',
            objective: '5.1.b',
            type: 'single',
            q: 'An organization already manages corporate phones with an MDM. Personal phones should only get full access after they enroll in the MDM. How does ISE support this?',
            choices: [
                'ISE uses the DHCP probe to read an MDM enrollment flag from the vendor-specific DHCP options the phone sends',
                'ISE installs the MDM agent through TACACS+',
                'The MDM sends SXP bindings to ISE',
                'Use MDM attributes from the integrated MDM API in authorization and redirect unenrolled devices to MDM enrollment'
            ],
            answer: [3],
            explain: 'ISE integrates with MDM servers through their APIs. Authorization conditions use MDM attributes, and an MDM redirect result sends unenrolled devices to enrollment.',
            why: [
                'DHCP does not reveal MDM enrollment.',
                'TACACS+ cannot install software on phones.',
                'SXP carries IP-to-SGT bindings, not MDM state.',
                'Correct: MDM API integration supplies attributes for policy.'
            ]
        },
        {
            id: 'ise-080',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'Onboarded devices must connect to the SSID CORP-SECURE using EAP-TLS with a 2048-bit key. Where are the SSID name, EAP method and key size defined for the provisioning flow?',
            choices: [
                'In the sponsor group',
                'In the guest type',
                'In the native supplicant profile',
                'In the device administration policy set'
            ],
            answer: [2],
            explain: 'The native supplicant profile describes the wireless or wired network to configure, the security and EAP method, and the certificate template or key settings used during onboarding.',
            why: [
                'Sponsor groups define sponsor permissions.',
                'Guest types define guest account properties.',
                'Correct: the native supplicant profile holds these settings.',
                'Device admin policy sets handle TACACS+.'
            ]
        },
        {
            id: 'ise-081',
            domain: '6',
            objective: '6.1',
            type: 'single',
            q: 'When a corporate laptop first connects and its posture has not yet been assessed, what posture status does ISE assign, and how is it typically handled?',
            choices: [
                'Compliant; the laptop gets full access until the agent reports otherwise',
                'Unknown; it gets restricted access so the agent can be provisioned and the assessment can run',
                'NonCompliant; the laptop is denied all access until an administrator reviews it',
                'Pending; the laptop is placed in the critical VLAN'
            ],
            answer: [1],
            explain: 'A session starts in Unknown posture status. Authorization rules usually give Unknown sessions limited access (and a client provisioning redirect when needed) until the agent reports Compliant or NonCompliant.',
            why: [
                'Starting as Compliant would bypass the assessment.',
                'Correct: Unknown with restricted access is the starting state.',
                'NonCompliant is assigned after a failed assessment.',
                'Pending is not the posture status used here, and the critical VLAN is for AAA-down events.'
            ]
        },
        {
            id: 'ise-082',
            domain: '6',
            objective: '6.1',
            type: 'single',
            q: 'Contractors\' laptops must be checked for running antivirus before access, but contractors refuse any permanently installed software. Which posture option fits?',
            choices: [
                'The temporal agent, which removes itself after the check',
                'The Cisco Secure Client ISE posture module installed by client provisioning',
                'SNMP Query probe',
                'TACACS+ command accounting'
            ],
            answer: [0],
            explain: 'The temporal agent is downloaded, checks compliance and exits without leaving a permanent install. It has fewer features than the full agent but suits unmanaged devices.',
            why: [
                'Correct: the temporal agent leaves nothing installed.',
                'The full posture module is a persistent install.',
                'SNMP Query is a profiling probe.',
                'Command accounting logs device admin commands.'
            ]
        },
        {
            id: 'ise-083',
            domain: '6',
            objective: '6.1',
            type: 'single',
            q: 'A third-party wireless controller cannot perform URL redirection. Corporate laptops have the posture agent installed. How can posture still work?',
            choices: [
                'Posture requires URL redirection and cannot work',
                'Use the Hotspot portal to trigger posture',
                'Use redirectionless posture, where the agent locates the PSN itself',
                'Use the NMAP probe to scan the laptops and read their antivirus status remotely'
            ],
            answer: [2],
            explain: 'With redirectionless posture, the agent contacts known discovery targets or a call-home list of PSNs to locate the node that owns its session, so the NAD does not need to redirect.',
            why: [
                'Redirection is not required with modern agents.',
                'Hotspot is a guest portal and does not perform posture.',
                'Correct: the agent finds the PSN itself.',
                'NMAP cannot reliably assess antivirus state.'
            ]
        },
        {
            id: 'ise-084',
            domain: '6',
            objective: '6.2',
            type: 'single',
            q: 'After the posture agent reports that a laptop is Compliant, how does the network device learn that it should apply the full-access authorization?',
            choices: [
                'The agent sends a RADIUS Access-Request directly to the switch',
                'ISE sends a CoA to the NAD, and the re-authentication matches the Compliant posture rule',
                'The switch polls ISE every 60 seconds for posture changes on authorized sessions',
                'The user must unplug and reconnect the laptop'
            ],
            answer: [1],
            explain: 'Posture results are applied through Change of Authorization. The re-authentication then matches an authorization rule that checks for Compliant posture status.',
            why: [
                'Agents talk to ISE, not to the switch with RADIUS.',
                'Correct: CoA triggers re-authorization with the new posture status.',
                'NADs do not poll ISE for posture.',
                'Reconnecting is not required because CoA handles it.'
            ]
        },
        {
            id: 'ise-085',
            domain: '6',
            objective: '6.2',
            type: 'single',
            q: 'A posture requirement checks for a disk encryption product, but administrators only want to record the result in reports while still allowing access. Which requirement type should be used in the posture policy?',
            choices: [
                'Mandatory',
                'Audit',
                'Optional',
                'Temporal'
            ],
            answer: [1],
            explain: 'Audit requirements are evaluated and reported but do not affect the compliance result or prompt the user. Optional requirements show remediation but let the user continue; mandatory requirements must pass.',
            why: [
                'Mandatory failures make the endpoint non-compliant.',
                'Correct: audit records results without affecting compliance.',
                'Optional requirements still prompt the user to remediate.',
                'Temporal is an agent type, not a requirement type.'
            ]
        },
        {
            id: 'ise-086',
            domain: '6',
            objective: '6.2',
            type: 'single',
            q: 'Users complain that the posture agent re-checks their laptops every time they move between buildings. Security accepts a once-per-day check. Which setting addresses this?',
            choices: [
                'Guest type maximum access time',
                'Endpoint purge',
                'Posture lease',
                'RADIUS session timeout on the switch'
            ],
            answer: [2],
            explain: 'The posture lease lets ISE reuse a compliant result for a set period, so the endpoint is not reassessed on every new connection within that time.',
            why: [
                'Guest types apply to guest accounts.',
                'Purge removes endpoints from the database.',
                'Correct: posture lease avoids reassessment within the lease period.',
                'A session timeout triggers re-authentication and would not reduce posture checks.'
            ]
        },
        {
            id: 'ise-087',
            domain: '6',
            objective: '6.2',
            type: 'single',
            q: 'macOS users are being offered the Windows agent package during client provisioning. Which ISE configuration controls which agent, compliance module and agent profile are offered to each OS?',
            choices: [
                'The client provisioning policy',
                'The posture requirement for macOS',
                'The profiler feed',
                'The sponsor group'
            ],
            answer: [0],
            explain: 'Client provisioning policy rules match on operating system and identity group or other conditions and select the agent package, compliance module and configuration to deliver.',
            why: [
                'Correct: client provisioning policy decides which package each OS gets.',
                'Posture requirements define checks and remediation.',
                'The profiler feed updates profiles.',
                'Sponsor groups manage guest sponsors.'
            ]
        },
        {
            id: 'ise-088',
            domain: '6',
            objective: '6.2',
            type: 'multi',
            q: 'Which two posture condition types rely on the compliance module\'s product definitions to recognize vendor products and their state? (Choose two.)',
            choices: [
                'File',
                'Service',
                'Disk Encryption',
                'Anti-Malware',
                'Registry'
            ],
            answer: [2, 3],
            explain: 'The compliance module (built on OPSWAT) knows supported anti-malware, disk encryption, firewall and patch management products. File, registry and service conditions are simple checks defined directly by the administrator.',
            why: [
                'File conditions check paths, dates or versions defined by the admin.',
                'Service conditions check whether a named service is running.',
                'Correct: disk encryption conditions use the compliance module.',
                'Correct: anti-malware conditions use the compliance module.',
                'Registry conditions check keys and values defined by the admin.'
            ]
        },
        {
            id: 'ise-089',
            domain: '6',
            objective: '6.2',
            type: 'single',
            q: 'Laptops that were compliant at connect time should be checked again periodically during long sessions, and remediated or restricted if they drift. Which posture feature provides this?',
            choices: [
                'Endpoint purge',
                'Posture lease',
                'Periodic reassessment',
                'Anomalous behavior detection'
            ],
            answer: [2],
            explain: 'Periodic reassessment (PRA) runs posture checks again at intervals during a session, with configurable actions such as remediate or quarantine when a check fails.',
            why: [
                'Purge removes endpoints.',
                'Posture lease reduces checks at connect time instead of adding them.',
                'Correct: PRA re-checks compliance during the session.',
                'Anomalous behavior detection is a profiler feature.'
            ]
        },
        {
            id: 'ise-090',
            domain: '6',
            objective: '6.3',
            type: 'single',
            q: 'An administrator wants a single place in ISE that groups posture elements, requirements, posture policy, client provisioning and posture settings for end-to-end configuration. What does the exam blueprint call this?',
            choices: [
                'The Posture Work Center',
                'The Context Visibility dashboard',
                'The Device Administration Work Center',
                'The Guest Access Work Center'
            ],
            answer: [0],
            explain: 'ISE work centers organize configuration by use case. The Posture work center collects the posture and client provisioning items in one workflow.',
            why: [
                'Correct: the Posture Work Center is the posture workflow.',
                'Context Visibility shows endpoint and user data rather than configuring posture.',
                'The Device Administration work center covers TACACS+.',
                'The Guest Access work center covers portals and sponsors.'
            ]
        },
        {
            id: 'ise-091',
            domain: '7',
            objective: '7.1',
            type: 'multi',
            q: 'Which two statements about TACACS+ compared with RADIUS are true? (Choose two.)',
            choices: [
                'TACACS+ runs over TCP port 49',
                'TACACS+ is used to carry EAP for 802.1X',
                'TACACS+ combines authentication and authorization in one Access-Accept',
                'TACACS+ encrypts only the password field',
                'TACACS+ encrypts the entire body of the packet'
            ],
            answer: [0, 4],
            explain: 'TACACS+ uses TCP port 49 and encrypts the whole payload. RADIUS uses UDP, protects only the password attribute, combines authentication and authorization, and carries EAP for network access.',
            why: [
                'Correct: TACACS+ uses TCP 49.',
                'EAP is carried by RADIUS.',
                'Separating authentication and authorization is a TACACS+ strength; combining them is RADIUS.',
                'Encrypting only the password is RADIUS behavior.',
                'Correct: the entire TACACS+ body is encrypted.'
            ]
        },
        {
            id: 'ise-092',
            domain: '7',
            objective: '7.1',
            type: 'single',
            q: 'Auditors require that each command an administrator enters on routers be individually approved by the AAA server. Which protocol is appropriate, and why?',
            choices: [
                'RADIUS, because it supports 802.1X',
                'TACACS+, because it supports per-command authorization',
                'RADIUS, because UDP transport makes each authorization decision faster',
                'SNMPv3, because it encrypts traffic'
            ],
            answer: [1],
            explain: 'TACACS+ handles authorization as its own exchange and can authorize each command a user enters, which is the standard design for device administration.',
            why: [
                '802.1X is about network access, not command control.',
                'Correct: TACACS+ provides per-command authorization.',
                'Speed is not the requirement, and RADIUS does not authorize individual commands.',
                'SNMP is a management protocol, not AAA.'
            ]
        },
        {
            id: 'ise-093',
            domain: '7',
            objective: '7.1',
            type: 'single',
            q: 'A new switch is added in ISE as a network device. Its RADIUS requests reach the PSN, but ISE logs show the Message-Authenticator attribute as invalid and the request is dropped. What is the most likely cause?',
            choices: [
                'The switch does not support 802.1X',
                'The switch is sending its requests to legacy UDP port 1645 instead of 1812',
                'The ISE node\'s certificate has expired',
                'The shared secret on the switch does not match ISE'
            ],
            answer: [3],
            explain: 'The Message-Authenticator is an HMAC keyed with the shared secret. A mismatched secret makes the check fail and ISE discards the request.',
            why: [
                'The request already reached ISE, so 802.1X support is not the issue.',
                'ISE listens on UDP 1645 as well as 1812 by default.',
                'RADIUS message integrity does not depend on the ISE certificate.',
                'Correct: a mismatched secret breaks the Message-Authenticator check.'
            ]
        },
        {
            id: 'ise-094',
            domain: '7',
            objective: '7.2',
            type: 'single',
            q: 'Routers are configured to use a PSN for TACACS+. The network device entry in ISE has the TACACS+ shared secret configured, but logins time out and nothing appears in the TACACS live log. What should be checked on the PSN first?',
            choices: [
                'Whether the posture feed has been updated recently',
                'Whether the profiler service is enabled',
                'Whether the pxGrid persona is enabled',
                'Whether the Device Admin service is enabled'
            ],
            answer: [3],
            explain: 'TACACS+ is processed only on PSNs where the Device Admin service is enabled (and with the appropriate license). Without it the node does not listen for TACACS+.',
            why: [
                'The posture feed has no role in device administration.',
                'Profiling is unrelated to TACACS+.',
                'pxGrid is unrelated to TACACS+.',
                'Correct: the Device Admin service must be enabled on the node.'
            ]
        },
        {
            id: 'ise-095',
            domain: '7',
            objective: '7.2',
            type: 'single',
            q: 'A router has this configuration:\naaa new-model\ntacacs server ISE-TAC\n address ipv4 198.51.100.30\n key S3cr3tK3y\naaa group server tacacs+ ISE-GRP\n server name ISE-TAC\naaa authentication login VTY-AUTH group ISE-GRP local\naaa authorization exec VTY-AUTH group ISE-GRP local\naaa authorization commands 15 VTY-AUTH group ISE-GRP local\nline vty 0 4\n login authentication VTY-AUTH\n authorization exec VTY-AUTH\n\nAdministrators log in with ISE accounts and reach privilege 15, but the ISE TACACS log shows no command authorization requests. Why?',
            choices: [
                'aaa authorization console is missing',
                'The vty lines do not apply the command authorization list',
                'The key must be configured on the aaa group instead of the server',
                'ISE does not support command authorization for privilege 15'
            ],
            answer: [1],
            explain: 'Named method lists only take effect where they are applied. The vty lines need authorization commands 15 VTY-AUTH so each privilege 15 command is sent to ISE.',
            why: [
                'aaa authorization console concerns the console line, not vty sessions.',
                'Correct: the named command authorization list must be applied to the lines.',
                'The key belongs in the tacacs server block as shown.',
                'ISE command sets support privilege 15 commands.'
            ]
        },
        {
            id: 'ise-096',
            domain: '7',
            objective: '7.2',
            type: 'single',
            q: 'Network administrators authenticate through ISE TACACS+ successfully but always land at privilege level 1 and must type enable. Which ISE element should be changed so they start at privilege 15?',
            choices: [
                'The RADIUS authorization profile for admins',
                'The command set',
                'The network device group',
                'The shell profile\'s default privilege'
            ],
            answer: [3],
            explain: 'A TACACS+ shell profile returns attributes such as the default and maximum privilege level to the device during exec authorization.',
            why: [
                'RADIUS authorization profiles are for network access.',
                'Command sets control which commands are allowed, not the starting privilege.',
                'Network device groups are used as policy conditions.',
                'Correct: the shell profile sets the starting privilege level.'
            ]
        },
        {
            id: 'ise-097',
            domain: '7',
            objective: '7.2',
            type: 'single',
            q: 'A device admin authorization rule returns two command sets for the NetOps group. Set A contains \'PERMIT show running-config\'. Set B contains \'DENY show running-config\'. When an engineer enters show running-config, what is the result?',
            choices: [
                'The command is denied, because a deny in any set wins',
                'ISE returns an error because command sets conflict',
                'The command is denied, because set B is listed second and so is evaluated last',
                'Permitted, because a PERMIT in any matching set wins unless another set uses DENY_ALWAYS'
            ],
            answer: [3],
            explain: 'When several command sets apply, a PERMIT from any of them allows the command. DENY_ALWAYS is the grant type that overrides permits from other sets.',
            why: [
                'A plain DENY does not override a PERMIT in another set.',
                'Multiple command sets are supported.',
                'Evaluation order across sets does not make a plain deny win.',
                'Correct: permit wins across sets unless DENY_ALWAYS is used.'
            ]
        },
        {
            id: 'ise-098',
            domain: '7',
            objective: '7.2',
            type: 'single',
            q: 'Auditors want ISE to record every privilege 15 command entered on the routers, including who ran it. Which router command enables this?',
            choices: [
                'aaa accounting commands 15 default start-stop group ISE-GRP',
                'aaa authorization commands 15 default group ISE-GRP if-authenticated',
                'logging host 198.51.100.30',
                'aaa accounting network default start-stop group ISE-GRP'
            ],
            answer: [0],
            explain: 'Command accounting sends a TACACS+ accounting record for each command at the given privilege level, which ISE stores and reports per user.',
            why: [
                'Correct: command accounting records each command.',
                'Authorization approves or denies commands but is not the audit record.',
                'Syslog is not tied to the TACACS+ identity in ISE reports.',
                'Network accounting covers network sessions such as PPP, not exec commands.'
            ]
        },
        {
            id: 'ise-099',
            domain: '7',
            objective: '7.2',
            type: 'single',
            q: 'A switch is configured with:\naaa authentication login default group ISE-GRP local\n\nAn administrator enters the wrong password for their ISE account. ISE is reachable and rejects the login. What happens next?',
            choices: [
                'The switch tries the local user database with the same credentials',
                'It fails; local is used only if no ISE server responds',
                'The switch locks the vty lines for 15 minutes',
                'The switch tries the enable password'
            ],
            answer: [1],
            explain: 'IOS moves to the next method in a list only when the current method returns an error, such as no server responding. A reject from ISE is a final answer.',
            why: [
                'A reject from ISE does not fall through to local.',
                'Correct: fallback happens only on an error or timeout, not on a reject.',
                'No lockout is configured.',
                'The enable method is not in this list.'
            ]
        },
        {
            id: 'ise-100',
            domain: '7',
            objective: '7.1',
            type: 'single',
            q: 'What does TACACS+ single-connect mode do when it is enabled on both the network device and ISE?',
            choices: [
                'It limits each administrator to one concurrent login',
                'It carries many TACACS+ sessions over one persistent TCP connection between device and ISE',
                'It forces every device to send all requests to a single PSN in the deployment',
                'It combines authentication and authorization into one packet'
            ],
            answer: [1],
            explain: 'Single-connect keeps one TCP connection open and carries many TACACS+ sessions over it, avoiding a TCP setup for every request.',
            why: [
                'Session limits per administrator are not what single-connect does.',
                'Correct: one persistent TCP connection carries many sessions.',
                'PSN selection is done with the server list on the device.',
                'TACACS+ keeps authentication and authorization as separate exchanges.'
            ]
        }
    ]
};
