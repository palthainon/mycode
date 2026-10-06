// Cisco CCNP Enterprise (ENCOR) practice questions for oldweb.tech.
// Original questions written against the public exam topics. Not affiliated with Cisco.
window.CERT_BANK = {
    id: 'ccnp-encor',
    vendor: 'Cisco',
    exam: 'CCNP Enterprise (ENCOR)',
    code: '350-401 v1.2',
    asOf: '2026-10',
    objectivesUrl: 'https://learningcontent.cisco.com/documents/marketing/exam-topics/350-401-ENCORE-v1.2.pdf',
    domains: [
        { id: '1', name: 'Architecture', weight: 15 },
        { id: '2', name: 'Virtualization', weight: 10 },
        { id: '3', name: 'Infrastructure', weight: 30 },
        { id: '4', name: 'Network Assurance', weight: 10 },
        { id: '5', name: 'Security', weight: 20 },
        { id: '6', name: 'Automation and Artificial Intelligence', weight: 15 }
    ],
    questions: [
        // ---------------- Domain 1: Architecture (15) ----------------
        {
            id: 'encor-001',
            domain: '1',
            objective: '1.1.a',
            type: 'single',
            q: 'A company occupies one building with eight access switches. A pair of Catalyst switches aggregates the access layer and also connects to the WAN routers and the server switches. There are no plans to add more buildings. Which campus design is this?',
            choices: [
                'Three-tier design with a dedicated core layer',
                'Two-tier collapsed core design',
                'Spine-leaf fabric design',
                'Hub-and-spoke design'
            ],
            answer: [1],
            explain: 'In a two-tier (collapsed core) design the distribution and core functions run on the same pair of switches. It fits a single building or small campus where a separate core layer would add cost without adding needed scale.',
            why: [
                'A three-tier design adds a separate core layer to interconnect several distribution blocks; here there is only one aggregation pair.',
                'Correct: the aggregation pair performs both the distribution and core roles, which is a collapsed core.',
                'Spine-leaf is a data center fabric in which every leaf connects to every spine; it does not describe this campus.',
                'Hub-and-spoke describes a WAN topology between sites, not the switching hierarchy inside a campus.'
            ]
        },
        {
            id: 'encor-002',
            domain: '1',
            objective: '1.1.a',
            type: 'single',
            q: 'A growing campus now has five buildings, each with its own pair of distribution switches. What is the main reason to introduce a dedicated core layer?',
            choices: [
                'To enforce port security, DHCP snooping, and 802.1X authentication close to the endpoints',
                'To classify and mark traffic at the QoS trust boundary',
                'To avoid a full mesh of links between distribution blocks as the campus grows',
                'To host the first-hop redundancy gateways for user VLANs'
            ],
            answer: [2],
            explain: 'Without a core, every distribution block must link to every other block, and the number of links grows quickly. A core layer gives each block a pair of uplinks to a high-speed backbone, which keeps the design modular and scalable.',
            why: [
                'Port security and 802.1X are access-layer functions.',
                'Classification and marking at the trust boundary normally happen at the access layer.',
                'Correct: the core removes the need for a full mesh between distribution blocks and provides a scalable backbone.',
                'FHRP gateways for user VLANs normally live on the distribution layer, not the core.'
            ]
        },
        {
            id: 'encor-003',
            domain: '1',
            objective: '1.1.a',
            type: 'single',
            q: 'Why does a spine-leaf fabric provide predictable latency between any two servers attached to different leaf switches?',
            choices: [
                'Spines are cabled to each other in a full mesh so traffic can take a shortcut',
                'Spanning tree blocks redundant leaf uplinks so only one deterministic path forwards',
                'Leaf switches are cabled to each other in a ring',
                'Every leaf connects to every spine, so leaf-to-leaf traffic crosses exactly one spine'
            ],
            answer: [3],
            explain: 'In a spine-leaf design each leaf has an uplink to every spine and spines do not interconnect. Any leaf-to-leaf path is leaf-spine-leaf, and the equal-cost paths through all spines can be used with ECMP.',
            why: [
                'Spines do not connect to each other in a spine-leaf design.',
                'Spine-leaf fabrics use routed or fabric uplinks with ECMP; they do not rely on STP blocking.',
                'Leaf switches do not connect to each other in a ring; they connect only to spines.',
                'Correct: the uniform leaf-to-every-spine cabling makes every inter-leaf path the same number of hops.'
            ]
        },
        {
            id: 'encor-004',
            domain: '1',
            objective: '1.1.b',
            type: 'single',
            q: 'A Catalyst 9400 with dual supervisors runs redundancy mode SSO, and its OSPF process is configured with nsf. The active supervisor fails. Which statement describes the expected behavior?',
            choices: [
                'The standby takes over with synchronized Layer 2 state and keeps forwarding from the FIB while OSPF gracefully restarts',
                'The standby supervisor reloads the whole chassis, and all line cards stop forwarding until OSPF has fully reconverged',
                'SSO alone synchronizes every OSPF adjacency and the full LSDB to the standby, so NSF has no role and neighbors never notice the switchover',
                'Neighbors immediately purge every route through the switch and relearn them only after the new active supervisor finishes booting'
            ],
            answer: [0],
            explain: 'SSO keeps the standby supervisor synchronized with configuration and Layer 2 protocol state so it can take over without a reload. NSF lets the switch keep forwarding on the existing FIB while routing adjacencies are re-established through graceful restart with NSF-aware neighbors.',
            why: [
                'Correct: SSO provides the stateful switchover and NSF keeps forwarding while OSPF recovers gracefully.',
                'SSO is designed to avoid a chassis reload; line cards keep forwarding during the switchover.',
                'Plain SSO does not keep routing protocol adjacencies synchronized; that is why NSF (or NSR) is used.',
                'With NSF, aware neighbors keep the routes during the restart instead of purging them.'
            ]
        },
        {
            id: 'encor-005',
            domain: '1',
            objective: '1.1.b',
            type: 'single',
            q: 'All hosts in a VLAN use a single default gateway address, and the design must actively forward traffic through two or more routers at the same time without configuring different gateways on different hosts. Which first-hop redundancy protocol meets this requirement?',
            choices: [
                'HSRP version 2 with a single group',
                'VRRP version 3 with a single group',
                'GLBP',
                'HSRP with interface tracking'
            ],
            answer: [2],
            explain: 'GLBP elects an active virtual gateway (AVG) that answers ARP requests for the single virtual IP with different virtual MAC addresses owned by up to four active virtual forwarders. Hosts that share one gateway IP are therefore spread across several routers.',
            why: [
                'A single HSRP group has only one active router forwarding for the virtual IP.',
                'A single VRRP group has only one master forwarding for the virtual IP.',
                'Correct: GLBP load balances one virtual IP across multiple forwarders.',
                'Tracking changes which router is active but still leaves only one router forwarding for the group.'
            ]
        },
        {
            id: 'encor-006',
            domain: '1',
            objective: '1.1.a',
            type: 'multi',
            q: 'A company moves an application to virtual machines in a public cloud infrastructure-as-a-service (IaaS) offering. Which two responsibilities remain with the customer? (Choose two.)',
            choices: [
                'Patching the guest operating system on the virtual machines',
                'Replacing failed disks in the provider physical servers',
                'Defining access rules such as security groups for the workload and protecting its data',
                'Maintaining and upgrading the hypervisor',
                'Physical security of the provider data center'
            ],
            answer: [0, 2],
            explain: 'In IaaS the provider operates the physical facility, hardware, and virtualization layer. The customer manages everything from the guest operating system up, including access policy and data.',
            why: [
                'Correct: the guest OS is the customer responsibility in IaaS.',
                'Physical hardware maintenance belongs to the cloud provider.',
                'Correct: workload access rules and data protection remain with the customer.',
                'The hypervisor is part of the infrastructure the provider operates.',
                'Data center physical security is the provider responsibility.'
            ]
        },
        {
            id: 'encor-007',
            domain: '1',
            objective: '1.2.a',
            type: 'single',
            q: 'In Cisco Catalyst SD-WAN, which component is the first point of contact for a new WAN Edge router, authenticates it, tells it how to reach the other controllers, and assists with NAT traversal?',
            choices: [
                'SD-WAN Manager',
                'SD-WAN Controller',
                'WAN Edge router acting as a hub',
                'SD-WAN Validator'
            ],
            answer: [3],
            explain: 'The SD-WAN Validator (formerly vBond) orchestrates onboarding. It authenticates devices, distributes the addresses of the Controllers and Manager, and must be reachable on a public address so it can help devices behind NAT.',
            why: [
                'SD-WAN Manager (formerly vManage) is the management plane for configuration and monitoring, not the onboarding orchestrator.',
                'SD-WAN Controller (formerly vSmart) is the control plane that runs OMP and distributes routes and policy.',
                'A hub WAN Edge is a data plane device; it does not authenticate other routers into the overlay.',
                'Correct: the Validator is the orchestration plane and the initial contact point.'
            ]
        },
        {
            id: 'encor-008',
            domain: '1',
            objective: '1.2.a',
            type: 'single',
            q: 'Which protocol runs over the secure DTLS or TLS control connections between Catalyst SD-WAN WAN Edge routers and SD-WAN Controllers to advertise prefixes, TLOCs, and policy?',
            choices: [
                'OMP',
                'BFD',
                'NETCONF',
                'IKEv2'
            ],
            answer: [0],
            explain: 'The Overlay Management Protocol (OMP) carries routing and TLOC information plus centralized policy between WAN Edges and Controllers. Data plane IPsec keys are also distributed through the control plane, so IKE is not required between WAN Edges.',
            why: [
                'Correct: OMP is the SD-WAN overlay control protocol.',
                'BFD runs inside the data plane tunnels between WAN Edges to measure liveness, loss, latency, and jitter.',
                'NETCONF is used by SD-WAN Manager to push configuration, not to advertise routes.',
                'IKEv2 is not used by default for WAN Edge tunnels because keys are exchanged through the Controllers.'
            ]
        },
        {
            id: 'encor-009',
            domain: '1',
            objective: '1.2.b',
            type: 'single',
            q: 'A branch has MPLS and broadband Internet transports. Voice must move to the other transport automatically whenever loss, latency, or jitter on the current path exceeds defined thresholds. Which Catalyst SD-WAN capability provides this?',
            choices: [
                'A centralized control policy that sets TLOC preference',
                'Application-aware routing with an SLA class',
                'Zone-based firewall policy',
                'Cflowd traffic export'
            ],
            answer: [1],
            explain: 'Application-aware routing uses BFD probe measurements on each tunnel and compares them against SLA classes. Traffic that matches the policy is steered to a tunnel that meets the SLA, which is a key benefit over traditional WAN routing.',
            why: [
                'TLOC preference influences path choice statically and does not react to measured loss, latency, or jitter.',
                'Correct: application-aware routing steers traffic based on real-time SLA measurements.',
                'Zone-based firewall controls security policy, not path selection.',
                'Cflowd exports flow records for visibility; it does not steer traffic.'
            ]
        },
        {
            id: 'encor-010',
            domain: '1',
            objective: '1.3.a',
            type: 'single',
            q: 'In a Cisco SD-Access fabric, which protocol does the control plane node use to keep track of which fabric edge (routing locator) each endpoint is attached to?',
            choices: [
                'IS-IS',
                'VXLAN-GPO',
                'SXP',
                'LISP'
            ],
            answer: [3],
            explain: 'SD-Access uses LISP for its control plane. Fabric edges register endpoint identifiers with the control plane node, which acts as the map-server and map-resolver for EID-to-RLOC lookups.',
            why: [
                'IS-IS is commonly used as the underlay routing protocol (for example, with LAN automation), not for endpoint tracking.',
                'VXLAN-GPO is the fabric data plane encapsulation.',
                'SXP propagates IP-to-SGT bindings for policy; it does not map endpoints to locators.',
                'Correct: LISP provides the EID-to-RLOC mapping system.'
            ]
        },
        {
            id: 'encor-011',
            domain: '1',
            objective: '1.3.a',
            type: 'multi',
            q: 'An SD-Access fabric edge encapsulates a user frame with VXLAN-GPO before sending it across the underlay. Which two values are carried in the VXLAN-GPO header itself? (Choose two.)',
            choices: [
                'The destination fabric edge routing locator (RLOC) address',
                'The VXLAN network identifier (VNI) for the virtual network',
                'The original 802.1Q tag of the endpoint',
                'The scalable group tag (SGT) of the source endpoint',
                'An MPLS label that identifies the VRF'
            ],
            answer: [1, 3],
            explain: 'The VXLAN-GPO header carries a 24-bit VNI that identifies the virtual network (VRF) or Layer 2 segment, and a group policy ID field that carries the source SGT. The RLOCs are carried in the outer IP header.',
            why: [
                'The destination RLOC is the outer IP destination address, not a field in the VXLAN header.',
                'Correct: the VNI identifies the virtual network.',
                'The original VLAN tag is not carried in the VXLAN header.',
                'Correct: the group policy field carries the source SGT for policy enforcement.',
                'SD-Access does not use MPLS labels in its data plane.'
            ]
        },
        {
            id: 'encor-012',
            domain: '1',
            objective: '1.3.b',
            type: 'single',
            q: 'An SD-Access fabric must exchange routes with the existing traditional campus core and the WAN. Which fabric role provides this connection?',
            choices: [
                'Border node',
                'Fabric edge node',
                'Control plane node',
                'Extended node'
            ],
            answer: [0],
            explain: 'Border nodes connect the fabric to networks outside it, such as a traditional campus, data center, WAN, or Internet. They translate between fabric virtual networks and external VRFs, typically using VRF-lite handoffs with BGP.',
            why: [
                'Correct: border nodes are the gateway between the fabric and external networks.',
                'Fabric edge nodes connect endpoints to the fabric, not external networks.',
                'The control plane node holds the endpoint mapping database; it is not the routing handoff point.',
                'Extended nodes extend fabric connectivity to devices such as industrial switches; they are not the external handoff.'
            ]
        },
        {
            id: 'encor-013',
            domain: '1',
            objective: '1.4',
            type: 'single',
            q: 'class-map match-any VOICE\n match dscp ef\npolicy-map WAN-OUT\n class VOICE\n  priority percent 20\n class class-default\n  fair-queue\ninterface GigabitEthernet0/0/1\n service-policy output WAN-OUT\n\nHow is EF-marked traffic treated when the interface is congested?',
            choices: [
                'It is serviced from a strict priority queue and policed to 20 percent of the interface bandwidth',
                'It is guaranteed a minimum of 20 percent and may borrow any unused bandwidth from other classes without limit',
                'It is remarked to AF41 when it exceeds 20 percent of the interface bandwidth',
                'It is shaped to 20 percent of the interface bandwidth whether or not congestion exists'
            ],
            answer: [0],
            explain: 'The priority command creates a low-latency queue (LLQ). During congestion, traffic in the priority class is sent first but is implicitly policed to the configured rate so it cannot starve other classes.',
            why: [
                'Correct: LLQ gives strict priority with an implicit policer during congestion.',
                'That describes the bandwidth command (CBWFQ), not priority.',
                'No remarking action is configured; excess priority traffic is dropped by the implicit policer.',
                'The priority command does not shape; the implicit policer acts only during congestion.'
            ]
        },
        {
            id: 'encor-014',
            domain: '1',
            objective: '1.4',
            type: 'single',
            q: 'A branch router connects to the provider over a 1 Gbps Ethernet handoff, but the contract rate is 50 Mbps. The engineer applies:\n\npolicy-map CHILD\n class VOICE\n  priority percent 20\n class class-default\n  fair-queue\npolicy-map PARENT\n class class-default\n  shape average 50000000\n  service-policy CHILD\ninterface GigabitEthernet0/0/0\n service-policy output PARENT\n\nWhat is the purpose of the PARENT policy?',
            choices: [
                'It polices all traffic above 50 Mbps and drops it before classification',
                'It marks all traffic with DSCP 0 so the provider can apply its own QoS',
                'It creates congestion at 50 Mbps on the router so the CHILD queuing policy takes effect',
                'It reserves 50 Mbps for voice and leaves the rest of the gigabit link for other traffic'
            ],
            answer: [2],
            explain: 'Queuing policies only act when the egress is congested. On a 1 Gbps port feeding a 50 Mbps service, the router never sees congestion, so the provider drops traffic blindly. The parent shaper creates a 50 Mbps bottleneck locally so the child LLQ and fair-queue policy can prioritize traffic.',
            why: [
                'Shaping buffers excess traffic instead of policing it, and classification happens in the child policy.',
                'There is no set action in the policy; nothing is remarked.',
                'Correct: this is hierarchical QoS, shaping to the contract rate so the child queuing works.',
                'The shaper limits all traffic to 50 Mbps; the voice reservation is 20 percent of that shaped rate.'
            ]
        },
        {
            id: 'encor-015',
            domain: '1',
            objective: '1.4',
            type: 'single',
            q: 'Packets marked AF31, AF32, and AF33 share one queue that uses DSCP-based WRED. As the queue depth grows, which marking is dropped first?',
            choices: [
                'AF31',
                'AF33',
                'AF32',
                'All three equally, because WRED only considers the class digit'
            ],
            answer: [1],
            explain: 'In AFxy the x is the class and y is the drop precedence. Within a class, a higher drop precedence gets a lower WRED minimum threshold, so AF33 is discarded before AF32, and AF32 before AF31.',
            why: [
                'AF31 has the lowest drop precedence in class 3 and is dropped last.',
                'Correct: AF33 has the highest drop precedence in the class.',
                'AF32 is dropped after AF33 but before AF31.',
                'DSCP-based WRED uses the full DSCP value, including drop precedence, to select thresholds.'
            ]
        },

        // ---------------- Domain 2: Virtualization (10) ----------------
        {
            id: 'encor-016',
            domain: '2',
            objective: '2.1.a',
            type: 'single',
            q: 'An engineer runs lab VMs with VMware Workstation on a Windows laptop. Production uses VMware ESXi installed directly on server hardware. Which statement is correct?',
            choices: [
                'Both are type 1 hypervisors because both run virtual machines',
                'Workstation is a type 1 hypervisor and ESXi is a type 2 hypervisor',
                'Both are type 2 hypervisors because each one requires a separate management client to create VMs',
                'Workstation is a type 2 (hosted) hypervisor and ESXi is a type 1 (bare-metal) hypervisor'
            ],
            answer: [3],
            explain: 'A type 1 hypervisor runs directly on the hardware, while a type 2 hypervisor runs as an application on top of a host operating system. Type 1 is preferred for production because it has less overhead and a smaller attack surface.',
            why: [
                'Running VMs does not make a hypervisor type 1; the distinction is what sits beneath it.',
                'This reverses the two: Workstation is hosted and ESXi is bare-metal.',
                'Needing a management client does not define the type; ESXi runs on bare metal.',
                'Correct: Workstation runs on a host OS, while ESXi runs directly on the hardware.'
            ]
        },
        {
            id: 'encor-017',
            domain: '2',
            objective: '2.1.b',
            type: 'single',
            q: 'Which statement correctly contrasts virtual machines with containers?',
            choices: [
                'Each VM runs its own guest operating system kernel, while containers share the host kernel',
                'Containers each include a full guest OS kernel, while VMs share the host kernel',
                'VMs and containers both share the host kernel and differ only in their image format',
                'Containers require a type 1 hypervisor, while VMs can run without one'
            ],
            answer: [0],
            explain: 'A virtual machine emulates hardware and boots a complete guest operating system. Containers isolate processes on a shared host kernel, which makes them lighter and faster to start but less isolated than VMs.',
            why: [
                'Correct: VMs carry a guest OS kernel; containers share the host kernel.',
                'This reverses the relationship.',
                'VMs do not share the host kernel; each has its own guest OS.',
                'Containers run on a container runtime on a host OS and do not need a hypervisor; VMs do need one.'
            ]
        },
        {
            id: 'encor-018',
            domain: '2',
            objective: '2.1.c',
            type: 'single',
            q: 'Two VMs on the same hypervisor host are attached to the same port group and VLAN on the same virtual switch. Where is traffic between them switched?',
            choices: [
                'On the upstream physical access switch, after leaving through the host uplink',
                'On the default gateway, because VMs always route through it',
                'Inside the virtual switch on the host, without leaving through a physical NIC',
                'On the hypervisor management interface'
            ],
            answer: [2],
            explain: 'A virtual switch forwards frames between virtual NICs on the same host and VLAN in software. Only traffic for destinations outside the host leaves through the physical uplinks.',
            why: [
                'Traffic between VMs on the same host, vSwitch, and VLAN does not need to leave the host.',
                'Hosts in the same VLAN communicate at Layer 2 without a gateway.',
                'Correct: the virtual switch handles local VM-to-VM switching.',
                'The management interface carries host management traffic, not VM data.'
            ]
        },
        {
            id: 'encor-019',
            domain: '2',
            objective: '2.2.a',
            type: 'single',
            q: 'An engineer enters the following on a router:\n\nvrf definition CUST-A\n rd 65000:1\n address-family ipv4\n exit-address-family\ninterface GigabitEthernet0/0/1\n ip address 10.1.1.1 255.255.255.0\n vrf forwarding CUST-A\n\nWhat is the state of GigabitEthernet0/0/1 afterward?',
            choices: [
                'It is in VRF CUST-A and keeps 10.1.1.1/24',
                'It is in VRF CUST-A with no IPv4 address, so the address must be entered again',
                'It stays in the global table because vrf forwarding must be entered before the rd',
                'It appears in both the global and CUST-A tables until the interface is bounced'
            ],
            answer: [1],
            explain: 'Assigning an interface to a VRF removes its existing IP addresses, and IOS XE logs that the addresses were removed. Configure vrf forwarding first, then the IP address.',
            why: [
                'The existing address is removed when the interface moves into the VRF.',
                'Correct: the address is removed and must be reapplied after vrf forwarding.',
                'The rd is configured under the VRF definition and was already present; the interface does join the VRF.',
                'An interface belongs to exactly one routing table at a time.'
            ]
        },
        {
            id: 'encor-020',
            domain: '2',
            objective: '2.2.a',
            type: 'single',
            q: 'A router has interfaces in VRF CUST-A. show ip route does not list the CUST-A prefixes. Which command displays the CUST-A routing table?',
            choices: [
                'show ip vrf detail CUST-A',
                'show ip route CUST-A',
                'show vrf CUST-A routes',
                'show ip route vrf CUST-A'
            ],
            answer: [3],
            explain: 'Each VRF has its own routing table, and commands without a vrf keyword operate on the global table. Use show ip route vrf NAME to see VRF routes and ping vrf NAME to test reachability inside it.',
            why: [
                'show ip vrf detail shows the RD, interfaces, and route targets, not the routing table.',
                'Without the vrf keyword the argument is treated as a destination to look up in the global table.',
                'This is not valid IOS XE syntax.',
                'Correct: this displays the routing table for VRF CUST-A.'
            ]
        },
        {
            id: 'encor-021',
            domain: '2',
            objective: '2.2.b',
            type: 'multi',
            q: 'Two sites are connected with a GRE tunnel interface protected by tunnel protection ipsec profile. Which two statements are true? (Choose two.)',
            choices: [
                'IPsec transport mode is required for GRE to work',
                'GRE encrypts the payload when tunnel keepalives are enabled',
                'GRE allows multicast traffic, such as OSPF hellos, to cross the tunnel',
                'The tunnel interface must be in the same subnet as the physical WAN interface',
                'GRE adds 24 bytes (a 20-byte IP header and a 4-byte GRE header) before IPsec overhead'
            ],
            answer: [2, 4],
            explain: 'GRE encapsulates any Layer 3 payload, including multicast, so routing protocols can run over the tunnel, while IPsec supplies confidentiality and integrity. Basic GRE adds a new 20-byte IP header plus a 4-byte GRE header.',
            why: [
                'Transport mode is common for GRE over IPsec because it saves a header, but tunnel mode also works.',
                'GRE provides no encryption; keepalives only check tunnel liveness.',
                'Correct: GRE carries multicast, which plain crypto-map IPsec does not.',
                'The tunnel uses its own subnet; it is sourced from the WAN interface but not addressed in its subnet.',
                'Correct: standard GRE overhead is 24 bytes.'
            ]
        },
        {
            id: 'encor-022',
            domain: '2',
            objective: '2.2.b',
            type: 'single',
            q: 'R1 Gi0/0/0 is 198.51.100.1/30 with a static default route to the ISP. R2 public address is 203.0.113.2.\n\nR1:\ninterface Tunnel0\n ip address 172.16.0.1 255.255.255.252\n tunnel source GigabitEthernet0/0/0\n tunnel destination 203.0.113.2\nrouter ospf 1\n network 172.16.0.0 0.0.0.3 area 0\n\nR2:\nrouter ospf 1\n network 172.16.0.0 0.0.0.3 area 0\n network 203.0.113.0 0.0.0.255 area 0\n\nShortly after the adjacency forms, R1 logs:\n%TUN-5-RECURDOWN: Tunnel0 temporarily disabled due to recursive routing\n\nWhat is the cause?',
            choices: [
                'R1 learns a more specific route to the tunnel destination through the tunnel itself',
                'The tunnel IP subnet overlaps with the physical WAN subnet',
                'OSPF cannot run over GRE without the ip ospf network point-to-point command',
                'The tunnel source must be a loopback interface rather than a physical interface'
            ],
            answer: [0],
            explain: 'R2 advertises 203.0.113.0/24 into OSPF over the tunnel. R1 now prefers that /24 over its static default, so packets to the tunnel destination would be sent into the tunnel itself. Do not advertise the tunnel endpoints through the tunnel, or filter those routes.',
            why: [
                'Correct: the tunnel destination resolves through the tunnel, which is recursive routing.',
                'The tunnel uses 172.16.0.0/30, which does not overlap the WAN subnet.',
                'OSPF runs over GRE with the default point-to-point network type of a tunnel interface.',
                'A physical interface is a valid tunnel source.'
            ]
        },
        {
            id: 'encor-023',
            domain: '2',
            objective: '2.2.b',
            type: 'single',
            q: 'Two sites must build an IPsec VPN, and one site sits behind a PAT device owned by the ISP. Which combination allows the VPN to work through the PAT device?',
            choices: [
                'AH in tunnel mode',
                'ESP encapsulated in UDP port 4500 (NAT-T)',
                'AH encapsulated in UDP port 500',
                'GRE with keepalives and no IPsec'
            ],
            answer: [1],
            explain: 'PAT needs port numbers to track sessions, and raw ESP has none. NAT traversal detects the NAT during IKE and then wraps ESP in UDP 4500 so it can be translated. AH cannot survive NAT because it authenticates the outer IP header.',
            why: [
                'AH integrity covers the outer IP addresses, so any address translation breaks it.',
                'Correct: NAT-T encapsulates ESP in UDP 4500 so PAT can translate it.',
                'UDP 500 is used for IKE negotiation, and AH still fails through NAT.',
                'GRE without IPsec provides no encryption and also has no ports for PAT to track.'
            ]
        },
        {
            id: 'encor-024',
            domain: '2',
            objective: '2.3.a',
            type: 'single',
            q: 'In a LISP deployment, an egress tunnel router (ETR) must register the endpoint identifier prefixes it serves. To which LISP component does it send Map-Register messages?',
            choices: [
                'Proxy ITR',
                'Map-Resolver',
                'Ingress tunnel router',
                'Map-Server'
            ],
            answer: [3],
            explain: 'ETRs send Map-Register messages to the Map-Server, which stores EID-to-RLOC mappings. ITRs send Map-Requests to the Map-Resolver, which forwards them so the authoritative ETR or Map-Server can reply.',
            why: [
                'A proxy ITR lets non-LISP sites reach LISP sites; it does not accept registrations.',
                'The Map-Resolver receives Map-Requests from ITRs, not registrations.',
                'The ITR encapsulates traffic toward RLOCs and issues Map-Requests.',
                'Correct: the Map-Server receives and stores ETR registrations.'
            ]
        },
        {
            id: 'encor-025',
            domain: '2',
            objective: '2.3.b',
            type: 'single',
            q: 'Which pair correctly describes the VXLAN segment identifier size and the IANA-assigned transport port?',
            choices: [
                '12-bit VNI carried over UDP port 4789',
                '16-bit VNI carried over UDP port 8472',
                '24-bit VNI carried over UDP port 4789',
                '24-bit VNI carried over TCP port 4789'
            ],
            answer: [2],
            explain: 'VXLAN (RFC 7348) uses a 24-bit VNI, allowing about 16 million segments compared with 4094 VLANs, and is carried in UDP with destination port 4789. The UDP source port is usually derived from a hash of the inner headers for ECMP.',
            why: [
                '12 bits is the size of an 802.1Q VLAN ID, not a VNI.',
                'The VNI is 24 bits, and 8472 is a legacy Linux default, not the IANA port.',
                'Correct: 24-bit VNI and UDP 4789.',
                'VXLAN uses UDP, not TCP.'
            ]
        },

        // ---------------- Domain 3: Infrastructure (30) ----------------
        {
            id: 'encor-026',
            domain: '3',
            objective: '3.1.a',
            type: 'single',
            q: 'SW1 and SW2 are connected on Gi1/0/1. Both ports are configured as:\n\ninterface GigabitEthernet1/0/1\n switchport mode dynamic auto\n\nshow interfaces trunk lists no trunk ports on either switch. What is the cause?',
            choices: [
                'Neither side actively starts DTP negotiation, so the link stays an access link',
                'A DTP mismatch has placed both ports in err-disabled state',
                'The native VLAN differs, which blocks DTP from completing',
                'A trunk formed but carries only VLAN 1, so it is hidden from the output'
            ],
            answer: [0],
            explain: 'Dynamic auto only responds to DTP requests; it never initiates them. Two auto ports never form a trunk. Set at least one side to dynamic desirable or, preferably, set both sides to switchport mode trunk.',
            why: [
                'Correct: auto plus auto results in an access link.',
                'DTP negotiation failure does not err-disable the port; it simply remains an access port.',
                'A native VLAN mismatch does not prevent DTP from forming a trunk; it causes CDP warnings and VLAN leaking.',
                'A formed trunk is always listed by show interfaces trunk.'
            ]
        },
        {
            id: 'encor-027',
            domain: '3',
            objective: '3.1.a',
            type: 'single',
            q: 'Both switches run Rapid PVST+, the default. SW1 logs:\n\n%CDP-4-NATIVE_VLAN_MISMATCH: Native VLAN mismatch discovered on GigabitEthernet1/0/24 (1), with SW2 GigabitEthernet1/0/24 (99).\n\nWhat is the impact of this condition?',
            choices: [
                'The trunk is shut down and placed in err-disabled state until the native VLANs match on both ends',
                'All tagged VLANs stop forwarding across the trunk',
                'STP blocks the trunk for VLANs 1 and 99 as port VLAN ID inconsistent, while the other VLANs keep forwarding',
                'Untagged frames sent in VLAN 1 on SW1 arrive in VLAN 99 on SW2, merging the two VLANs'
            ],
            answer: [2],
            explain: 'Native VLAN frames cross a trunk untagged, so a mismatch would merge the two VLANs into one broadcast domain. PVST+ guards against this: its BPDUs carry the sender\'s native VLAN, and when it differs from the local one the port is put in a PVID-inconsistent blocking state for the two native VLANs until they match. Tagged VLANs are not affected.',
            why: [
                'The trunk stays up. A native VLAN mismatch is logged and handled by STP, not by err-disable.',
                'Tagged VLANs keep their 802.1Q tags, so the mismatch does not affect them.',
                'Correct: per-VLAN STP detects the native VLAN mismatch and blocks only the two native VLANs on that trunk.',
                'This is what happens without per-VLAN STP, for example with MST or with STP disabled. Rapid PVST+ blocks the native VLANs instead, so they do not merge.'
            ]
        },
        {
            id: 'encor-028',
            domain: '3',
            objective: '3.1.a',
            type: 'single',
            q: 'A trunk carries VLANs 10 and 20. To add VLAN 30, an engineer enters:\n\ninterface GigabitEthernet1/0/48\n switchport trunk allowed vlan 30\n\nUsers in VLANs 10 and 20 on the far switch immediately lose connectivity. What happened?',
            choices: [
                'VLAN 30 became the native VLAN and replaced VLAN 10',
                'The trunk renegotiated with DTP and briefly went down',
                'VLAN 30 does not exist in the VLAN database, so the trunk was pruned',
                'The allowed list was replaced with only VLAN 30; the add keyword was needed'
            ],
            answer: [3],
            explain: 'switchport trunk allowed vlan with a plain list overwrites the existing list. Use switchport trunk allowed vlan add 30 to append a VLAN, and remove to delete one.',
            why: [
                'The native VLAN is set with switchport trunk native vlan, which was not used.',
                'Changing the allowed list does not trigger a DTP renegotiation that would explain a persistent outage.',
                'A missing VLAN would affect VLAN 30 only, not VLANs 10 and 20.',
                'Correct: the command replaced the allowed VLAN list.'
            ]
        },
        {
            id: 'encor-029',
            domain: '3',
            objective: '3.1.b',
            type: 'multi',
            q: 'Which two channel-group mode combinations on SW1 and SW2 form an EtherChannel? (Choose two.)',
            choices: [
                'LACP active on SW1 and LACP passive on SW2',
                'LACP passive on both switches',
                'PAgP auto on both switches',
                'PAgP desirable on SW1 and PAgP auto on SW2',
                'Mode on for SW1 and LACP active on SW2'
            ],
            answer: [0, 3],
            explain: 'At least one side must actively negotiate: LACP active with active or passive, or PAgP desirable with desirable or auto. Mode on does not send any negotiation protocol, so it only works with mode on at the other end.',
            why: [
                'Correct: the active side initiates and the passive side responds.',
                'Two passive sides wait for each other and never negotiate.',
                'Two auto sides wait for each other and never negotiate.',
                'Correct: the desirable side initiates and the auto side responds.',
                'Mode on sends no LACP, so the active side never gets a partner.'
            ]
        },
        {
            id: 'encor-030',
            domain: '3',
            objective: '3.1.b',
            type: 'single',
            q: 'SW1# show etherchannel summary\nFlags:  D - down        P - bundled in port-channel\n        I - stand-alone s - suspended\n        S - Layer2      U - in use\n<output omitted>\nGroup  Port-channel  Protocol    Ports\n------+-------------+-----------+--------------------------\n1      Po1(SU)         LACP      Gi1/0/1(P)  Gi1/0/2(I)\n\nWhat is the most likely reason Gi1/0/2 shows the I flag?',
            choices: [
                'Gi1/0/2 is administratively shut down',
                'Gi1/0/2 is not receiving LACPDUs, for example because the partner port is not in the channel group',
                'Gi1/0/2 is a hot-standby port because the bundle already has the maximum number of members',
                'Gi1/0/2 is bundled but only carries traffic for the native VLAN'
            ],
            answer: [1],
            explain: 'The I flag means the port is operating as an individual (stand-alone) link because LACP negotiation did not succeed, commonly because the neighbor port is not configured for the channel. Check the partner with show lacp neighbor and the far-end configuration.',
            why: [
                'A shut-down member is shown with the D (down) flag.',
                'Correct: without LACPDUs from a partner, the port falls back to stand-alone.',
                'Hot-standby members use a different flag (H), and two links do not hit the maximum.',
                'A port in P state is bundled; I is not a VLAN-specific state.'
            ]
        },
        {
            id: 'encor-031',
            domain: '3',
            objective: '3.1.c',
            type: 'single',
            q: 'In Rapid Spanning Tree (802.1w), which port role is a discarding port that provides an alternate path to the root bridge and can immediately become the root port if the current root port fails?',
            choices: [
                'Designated port',
                'Backup port',
                'Disabled port',
                'Alternate port'
            ],
            answer: [3],
            explain: 'An RSTP alternate port receives superior BPDUs from another bridge and offers a second path to the root. A backup port receives BPDUs from its own bridge on a shared segment and backs up a designated port.',
            why: [
                'A designated port forwards toward a segment; it is not a standby path to the root.',
                'A backup port backs up a designated port on the same shared segment, not the root port.',
                'A disabled port does not participate in STP.',
                'Correct: the alternate port is the fast-failover replacement for the root port.'
            ]
        },
        {
            id: 'encor-032',
            domain: '3',
            objective: '3.1.c',
            type: 'single',
            q: 'SW1:\nspanning-tree mode mst\nspanning-tree mst configuration\n name CAMPUS\n revision 1\n instance 1 vlan 10-20\n instance 2 vlan 21-30\n\nSW2:\nspanning-tree mode mst\nspanning-tree mst configuration\n name Campus\n revision 1\n instance 1 vlan 10-20\n instance 2 vlan 21-30\n\nWhat is the result?',
            choices: [
                'Both switches are in the same region because region names are not case-sensitive',
                'They are in different MST regions, so only the CIST runs across the link between them',
                'SW2 adopts the SW1 region name because SW1 has the lower bridge ID',
                'Both switches fall back to PVST+ because the configurations conflict'
            ],
            answer: [1],
            explain: 'Two switches are in the same MST region only if the name, revision number, and VLAN-to-instance mapping all match exactly, and the name is case-sensitive. Across a region boundary only the CIST is visible, so MSTI 1 and 2 do not extend between the switches.',
            why: [
                'MST region names are compared exactly, including case.',
                'Correct: CAMPUS and Campus are different names, which creates two regions.',
                'MST does not negotiate or copy region names between switches.',
                'Both switches still run MST; the link simply becomes a region boundary.'
            ]
        },
        {
            id: 'encor-033',
            domain: '3',
            objective: '3.1.c',
            type: 'single',
            q: 'A distribution switch port facing an access switch is configured with spanning-tree guard root. Someone connects a switch with priority 0 downstream, and the port receives superior BPDUs. What happens?',
            choices: [
                'The port goes root-inconsistent (blocking) and recovers on its own once superior BPDUs stop',
                'The port is err-disabled and stays down until an administrator enters shutdown and no shutdown',
                'The new switch becomes the root bridge, and the port becomes a root port',
                'The port is converted to an edge port and ignores the BPDUs'
            ],
            answer: [0],
            explain: 'Root guard prevents a port from becoming a root port. When superior BPDUs arrive, it blocks the port in the root-inconsistent state and unblocks it automatically once they stop. BPDU guard, by contrast, err-disables a port on any BPDU.',
            why: [
                'Correct: root guard blocks in root-inconsistent state with automatic recovery.',
                'Err-disable is the BPDU guard action, not root guard.',
                'Preventing this takeover is exactly what root guard is for.',
                'Root guard does not change the port type; BPDU reception actually removes edge status.'
            ]
        },
        {
            id: 'encor-034',
            domain: '3',
            objective: '3.2.a',
            type: 'single',
            q: 'A router has two paths to a remote network with different metrics. The design requires traffic to use both paths in proportion to their metrics. Which protocol feature supports this natively?',
            choices: [
                'OSPF with maximum-paths 4',
                'OSPF with auto-cost reference-bandwidth 100000',
                'EIGRP with variance 2',
                'EIGRP with eigrp stub'
            ],
            answer: [2],
            explain: 'EIGRP can install unequal-cost paths when the variance multiplier is set and the alternate path is a feasible successor whose metric is within variance times the best metric. OSPF load balances only across equal-cost paths.',
            why: [
                'maximum-paths controls how many equal-cost paths OSPF installs; it does not allow unequal costs.',
                'Changing the reference bandwidth recalculates costs but still only allows equal-cost load balancing.',
                'Correct: variance enables unequal-cost load balancing in EIGRP.',
                'eigrp stub limits queries and advertisements; it does not affect load balancing.'
            ]
        },
        {
            id: 'encor-035',
            domain: '3',
            objective: '3.2.a',
            type: 'single',
            q: 'R1# show ip eigrp topology all-links\n<output omitted>\nP 10.10.10.0/24, 1 successors, FD is 3072\n        via 192.0.2.2 (3072/2816), GigabitEthernet0/0\n        via 192.0.2.6 (3328/2560), GigabitEthernet0/1\n        via 192.0.2.10 (5120/3584), GigabitEthernet0/2\n\nWhich next hop is a feasible successor?',
            choices: [
                '192.0.2.6 only',
                '192.0.2.10 only',
                'Both 192.0.2.6 and 192.0.2.10',
                'Neither, because both have a higher metric than the successor'
            ],
            answer: [0],
            explain: 'The feasibility condition requires the neighbor reported distance (the second number) to be lower than the current feasible distance. 2560 is less than 3072, so 192.0.2.6 qualifies; 3584 is not, so 192.0.2.10 does not.',
            why: [
                'Correct: only 192.0.2.6 has a reported distance below the FD of 3072.',
                '192.0.2.10 reports 3584, which fails the feasibility condition.',
                '192.0.2.10 fails the feasibility condition, so it is not a feasible successor.',
                'The comparison uses reported distance against FD, not the total metric through the neighbor.'
            ]
        },
        {
            id: 'encor-036',
            domain: '3',
            objective: '3.2.a',
            type: 'single',
            q: 'An OSPF area must block Type 3 LSAs (except a default route), Type 4, and Type 5 LSAs, while still allowing an ASBR inside the area to inject external routes. Which area type meets the requirement?',
            choices: [
                'Stub area',
                'Totally stubby area',
                'Not-so-stubby area (NSSA)',
                'Totally NSSA'
            ],
            answer: [3],
            explain: 'A totally NSSA blocks inter-area Type 3 routes (replacing them with a default), Type 4, and Type 5 LSAs. An ASBR inside it originates Type 7 LSAs, which the ABR translates into Type 5 for the rest of the domain.',
            why: [
                'A stub area does not allow an internal ASBR and still accepts Type 3 LSAs.',
                'A totally stubby area does not allow an ASBR inside the area.',
                'A regular NSSA still accepts Type 3 inter-area LSAs.',
                'Correct: totally NSSA blocks Types 3, 4, and 5 and permits Type 7 externals.'
            ]
        },
        {
            id: 'encor-037',
            domain: '3',
            objective: '3.2.b',
            type: 'single',
            q: 'R1# show ip ospf neighbor\n\nNeighbor ID     Pri   State           Dead Time   Address         Interface\n192.0.2.2         1   EXSTART/DR      00:00:36    10.0.12.2       GigabitEthernet0/0/1\n\nThe neighbor stays in EXSTART for several minutes. What is the most likely cause?',
            choices: [
                'Mismatched hello and dead timers',
                'Mismatched OSPF authentication',
                'Mismatched interface MTU',
                'Mismatched area IDs'
            ],
            answer: [2],
            explain: 'OSPF compares the interface MTU in Database Description packets. When it differs, the router with the smaller MTU rejects the larger DBDs and the neighbors stay in EXSTART or EXCHANGE. Match the MTU, or as a last resort use ip ospf mtu-ignore.',
            why: [
                'Timer mismatches prevent the neighbor from being seen at all, so it would not reach EXSTART.',
                'Authentication mismatches cause hellos to be dropped before the neighbor reaches EXSTART.',
                'Correct: an MTU mismatch is the classic cause of a neighbor stuck in EXSTART/EXCHANGE.',
                'An area ID mismatch causes hellos to be rejected, so no neighbor is formed.'
            ]
        },
        {
            id: 'encor-038',
            domain: '3',
            objective: '3.2.b',
            type: 'multi',
            q: 'Two routers are connected by a dedicated Ethernet link, and both interfaces are configured with ip ospf network point-to-point. Which two results occur compared with the default broadcast network type? (Choose two.)',
            choices: [
                'The hello interval changes to 30 seconds',
                'No DR or BDR is elected on the segment',
                'A neighbor statement becomes required under the OSPF process',
                'The router with the highest priority generates a Type 2 LSA for the link',
                'The adjacency forms without waiting for the DR election wait timer'
            ],
            answer: [1, 4],
            explain: 'The point-to-point network type skips DR/BDR election, so there is no wait timer and no network (Type 2) LSA for the segment. Hello and dead timers stay at 10 and 40 seconds, and neighbors are still discovered with multicast hellos.',
            why: [
                'Point-to-point keeps the 10-second hello; 30 seconds is used on NBMA-type networks.',
                'Correct: there is no DR or BDR on a point-to-point network.',
                'Neighbor statements are used on NBMA networks, not point-to-point.',
                'Type 2 LSAs are generated only by a DR, which does not exist here.',
                'Correct: without an election, the adjacency forms faster.'
            ]
        },
        {
            id: 'encor-039',
            domain: '3',
            objective: '3.2.b',
            type: 'single',
            q: 'router ospf 1\n passive-interface default\n no passive-interface GigabitEthernet0/0/0\n network 10.0.0.0 0.255.255.255 area 0\n\nGi0/0/0 (10.0.12.1/30) faces another router, and Gi0/0/1 (10.20.1.1/24) faces users. Which statement is true?',
            choices: [
                'No interface sends hellos because passive-interface default overrides the no form',
                '10.20.1.0/24 is not advertised because passive interfaces are left out of the LSDB',
                'Hellos are sent only on Gi0/0/0, and 10.20.1.0/24 is still advertised to the neighbor',
                'Hellos are sent on both interfaces, but an adjacency forms only on Gi0/0/0'
            ],
            answer: [2],
            explain: 'A passive interface does not send or process OSPF hellos, so no adjacency forms on it, but its network is still advertised if a network statement or interface command enables OSPF on it. passive-interface default with a no exception is a common hardening practice.',
            why: [
                'The no passive-interface command creates an exception, so Gi0/0/0 does send hellos.',
                'Passive interfaces are still included in the router LSA when OSPF is enabled on them.',
                'Correct: only Gi0/0/0 sends hellos, and the user subnet is still advertised.',
                'A passive interface sends no hellos at all.'
            ]
        },
        {
            id: 'encor-040',
            domain: '3',
            objective: '3.2.b',
            type: 'single',
            q: 'R2 is an ABR between area 0 and area 1. Area 1 contains 10.1.0.0/24, 10.1.1.0/24, 10.1.2.0/24, and 10.1.3.0/24. Which command on R2 advertises a single summary for these networks into area 0?',
            choices: [
                'area 1 range 10.1.0.0 255.255.252.0',
                'summary-address 10.1.0.0 255.255.252.0',
                'area 0 range 10.1.0.0 255.255.252.0',
                'ip summary-address ospf 1 10.1.0.0 255.255.252.0 under the area 0 interface'
            ],
            answer: [0],
            explain: 'Inter-area summarization is configured on the ABR with area ID range, where the area ID is the area that contains the component routes. summary-address under the OSPF process summarizes external routes on an ASBR.',
            why: [
                'Correct: area 1 range summarizes area 1 routes into the other areas.',
                'summary-address summarizes redistributed external routes on an ASBR, not inter-area routes.',
                'The area ID must be the area where the component routes exist, which is area 1.',
                'OSPF does not use an interface-level summary-address command like EIGRP does.'
            ]
        },
        {
            id: 'encor-041',
            domain: '3',
            objective: '3.2.b',
            type: 'single',
            q: 'R2 in area 0 is configured with:\n\nip prefix-list BLOCK seq 5 deny 10.50.0.0/16\nip prefix-list BLOCK seq 10 permit 0.0.0.0/0 le 32\nrouter ospf 1\n distribute-list prefix BLOCK in\n\nR2 no longer has 10.50.0.0/16 in its routing table, but R3, downstream of R2 in area 0, still installs the route. Why?',
            choices: [
                'The prefix list needs a seq 15 deny entry to take effect for neighbors',
                'An inbound distribute-list only stops R2 from installing the route; the LSAs still flood to R3',
                'The distribute-list must be applied with the out keyword on R3',
                'R3 learns the route through a Type 7 LSA, which the prefix list on R2 is not able to match or filter'
            ],
            answer: [1],
            explain: 'Link-state protocols require every router in an area to hold an identical LSDB, so an inbound distribute-list in OSPF filters only what is installed into the local RIB. To stop a prefix from reaching other areas, filter at the ABR with area filter-list or summarize with area range not-advertise.',
            why: [
                'The prefix list already denies the route and permits everything else; another entry changes nothing.',
                'Correct: inbound OSPF distribute-lists affect only the local routing table.',
                'distribute-list out on R3 is not used this way for intra-area OSPF routes.',
                'Type 7 LSAs exist only in NSSAs; area 0 cannot be an NSSA.'
            ]
        },
        {
            id: 'encor-042',
            domain: '3',
            objective: '3.2.b',
            type: 'single',
            q: 'Which statement about OSPFv3 on IOS XE is correct?',
            choices: [
                'OSPFv3 requires a 128-bit IPv6 router ID',
                'OSPFv3 uses link-local addresses as the source of hellos and as next hops',
                'OSPFv3 is enabled only with network statements under the router process',
                'OSPFv3 cannot run on an interface that also has an IPv4 address'
            ],
            answer: [1],
            explain: 'OSPFv3 runs per link and forms adjacencies with IPv6 link-local addresses, which also appear as next-hop addresses. The router ID is still a 32-bit value, and OSPFv3 is enabled on interfaces rather than with network statements.',
            why: [
                'The OSPFv3 router ID is a 32-bit dotted-decimal value, which must be set manually if no IPv4 address exists.',
                'Correct: link-local addresses are used for hellos and next hops.',
                'OSPFv3 is enabled per interface, for example with ospfv3 1 ipv6 area 0.',
                'OSPFv3 can run on dual-stack interfaces and can even carry IPv4 with address families.'
            ]
        },
        {
            id: 'encor-043',
            domain: '3',
            objective: '3.2.c',
            type: 'single',
            q: 'R1:\nrouter bgp 65001\n neighbor 198.51.100.2 remote-as 65002\n\nR2:\nrouter bgp 65002\n neighbor 198.51.100.1 remote-as 65010\n\nThe routers are directly connected on 198.51.100.0/30. The session never reaches Established, and R2 logs a notification indicating the peer is in the wrong AS. What must be corrected?',
            choices: [
                'R1 must add neighbor 198.51.100.2 ebgp-multihop 2',
                'R1 must source the session from a loopback with update-source',
                'Both routers must be placed in the same autonomous system',
                'R2 must use neighbor 198.51.100.1 remote-as 65001'
            ],
            answer: [3],
            explain: 'Each side checks that the AS number in the received OPEN message matches its configured remote-as. R1 correctly announces AS 65001, but R2 expects 65010, so R2 rejects the session with a bad peer AS notification.',
            why: [
                'The peers are directly connected, so the default eBGP TTL of 1 is sufficient.',
                'Directly connected eBGP peers normally use their interface addresses; update-source is not required.',
                'eBGP is between different autonomous systems; merging them would make the session iBGP.',
                'Correct: R2 remote-as must match the AS R1 is actually in.'
            ]
        },
        {
            id: 'encor-044',
            domain: '3',
            objective: '3.2.c',
            type: 'single',
            q: 'A Cisco router learns three eBGP paths to 203.0.113.0/24:\n\nPath A: weight 0, local preference 200, AS path 65010 65020\nPath B: weight 0, local preference 100, AS path 65030\nPath C: weight 150, local preference 100, AS path 65040 65050 65060\n\nAll other attributes are equal. Which path is selected as best?',
            choices: [
                'Path C',
                'Path A',
                'Path B',
                'Paths A and B are both installed by default'
            ],
            answer: [0],
            explain: 'Cisco best-path selection checks weight first (highest wins), then local preference, then locally originated, then AS path length. Path C has the highest weight, so attributes later in the list are never compared.',
            why: [
                'Correct: weight is evaluated first, and Path C has the highest weight.',
                'Local preference is checked only when weight is tied.',
                'AS path length is checked only after weight and local preference.',
                'BGP installs one best path by default; multipath requires maximum-paths and equal attributes.'
            ]
        },
        {
            id: 'encor-045',
            domain: '3',
            objective: '3.2.d',
            type: 'single',
            q: 'access-list 110 permit tcp 10.10.0.0 0.0.255.255 any eq 443\nroute-map PBR permit 10\n match ip address 110\n set ip next-hop 198.51.100.9\ninterface GigabitEthernet0/0/1\n description LAN\n ip policy route-map PBR\n\nWhich statement describes how the router handles traffic arriving on Gi0/0/1?',
            choices: [
                'Traffic that does not match ACL 110 is dropped',
                'Traffic that does not match ACL 110 is forwarded using the normal routing table',
                'The policy also applies to traffic that the router itself originates, such as pings and syslog',
                'The policy is applied to traffic leaving Gi0/0/1 toward the LAN'
            ],
            answer: [1],
            explain: 'Policy-based routing is applied to packets received on the interface. Matching packets use the set next hop, and packets that do not match the route map fall back to destination-based routing. Router-originated traffic needs ip local policy route-map.',
            why: [
                'PBR does not drop unmatched traffic; it routes it normally.',
                'Correct: unmatched packets use normal routing.',
                'Locally generated traffic is only policy-routed with ip local policy route-map.',
                'ip policy route-map applies to inbound traffic on the interface.'
            ]
        },
        {
            id: 'encor-046',
            domain: '3',
            objective: '3.3.a',
            type: 'single',
            q: 'R1# show ntp associations\n\n  address         ref clock       st   when   poll reach  delay  offset   disp\n*~192.0.2.10      198.51.100.5     2     45     64   377  1.204  -0.311  0.952\n+~192.0.2.20      198.51.100.6     2     12     64   377  2.007   0.118  1.020\n ~192.0.2.30      .INIT.          16      -   1024     0  0.000   0.000 15937\n * sys.peer, # selected, + candidate, - outlyer, x falseticker, ~ configured\n\nWhat stratum does R1 advertise to its own NTP clients?',
            choices: [
                'Stratum 2, the same as its selected server',
                'Stratum 3, one more than its selected server',
                'Stratum 16, because one configured server is unreachable',
                'Stratum 1, because R1 is synchronized'
            ],
            answer: [1],
            explain: 'R1 is synchronized to 192.0.2.10 (the asterisk), which is stratum 2, so R1 operates at stratum 3. 192.0.2.20 is a valid candidate, and 192.0.2.30 has never been reached (reach 0, stratum 16).',
            why: [
                'A client is always one stratum higher than its time source.',
                'Correct: synchronized to a stratum 2 source, R1 becomes stratum 3.',
                'An unreachable extra server does not affect R1, because it is synchronized to another source.',
                'Stratum 1 is reserved for servers attached directly to a reference clock.'
            ]
        },
        {
            id: 'encor-047',
            domain: '3',
            objective: '3.3.a',
            type: 'single',
            q: 'A plant network uses Precision Time Protocol (IEEE 1588) for sub-microsecond timing. Which mechanism do PTP clocks use to choose the grandmaster?',
            choices: [
                'Comparing stratum values, as NTP does',
                'Electing the clock with the lowest IP address on the PTP VLAN as grandmaster',
                'Reusing the spanning tree root bridge election',
                'The best master clock algorithm, using attributes in Announce messages'
            ],
            answer: [3],
            explain: 'PTP clocks exchange Announce messages containing priority, clock class, accuracy, and identity, and the best master clock algorithm (BMCA) picks the grandmaster. PTP achieves higher accuracy than NTP mainly through hardware timestamping.',
            why: [
                'Stratum is an NTP concept; PTP uses clock class and other Announce fields.',
                'IP address is not the selection criterion, and PTP can run directly over Ethernet.',
                'PTP has its own election and does not use STP.',
                'Correct: the BMCA selects the grandmaster.'
            ]
        },
        {
            id: 'encor-048',
            domain: '3',
            objective: '3.3.b',
            type: 'single',
            q: 'interface GigabitEthernet0/0/0\n description To ISP\n ip address 203.0.113.2 255.255.255.252\n ip nat outside\ninterface GigabitEthernet0/0/1\n description To LAN\n ip address 10.10.0.1 255.255.255.0\n ip nat outside\naccess-list 10 permit 10.10.0.0 0.0.0.255\nip nat inside source list 10 interface GigabitEthernet0/0/0 overload\n\nLAN users cannot reach the Internet, and show ip nat translations is empty. What is the fix?',
            choices: [
                'Configure ip nat inside on GigabitEthernet0/0/1',
                'Change access-list 10 to an extended ACL that matches TCP and UDP',
                'Remove overload so each user gets a dedicated public address',
                'Add ip nat enable to both interfaces in addition to the existing commands'
            ],
            answer: [0],
            explain: 'Inside source NAT translates packets that arrive on an ip nat inside interface and leave through an ip nat outside interface. Both interfaces are marked outside, so no traffic is ever eligible for translation.',
            why: [
                'Correct: the LAN interface must be the NAT inside interface.',
                'A standard ACL is fine for matching source addresses for PAT.',
                'Removing overload would require an address pool and would not fix the interface roles.',
                'ip nat enable belongs to the separate NVI model and cannot be mixed in as a fix here.'
            ]
        },
        {
            id: 'encor-049',
            domain: '3',
            objective: '3.3.b',
            type: 'single',
            q: 'A router facing the Internet is configured with:\n\nip nat inside source static tcp 10.10.0.20 443 203.0.113.10 443\n\nThe interfaces are correctly marked inside and outside. What is the effect?',
            choices: [
                'Inside hosts that browse to 203.0.113.10 are redirected to 10.10.0.20',
                'All outbound traffic from 10.10.0.20, on any port, is translated to 203.0.113.10 permanently',
                'Inbound TCP to 203.0.113.10:443 is sent to 10.10.0.20:443, and replies are translated back',
                'A translation is created only after 10.10.0.20 first opens a session to the Internet'
            ],
            answer: [2],
            explain: 'A static port translation permanently maps one inside local address and port to an inside global address and port. Outside clients can initiate connections to the public socket, and return traffic from the server is translated back.',
            why: [
                'Inside-to-inside hairpinning is not provided by this entry.',
                'The static entry covers only TCP port 443, not all ports from the server.',
                'Correct: this is static port forwarding for HTTPS.',
                'Static entries exist permanently and allow outside-initiated connections.'
            ]
        },
        {
            id: 'encor-050',
            domain: '3',
            objective: '3.3.c',
            type: 'single',
            q: 'R1 and R2 run HSRP group 10. R1 has priority 110 and R2 has priority 100; neither has preempt configured. R1 reloads, R2 becomes active, and R1 then comes back online. Which router is active, and why?',
            choices: [
                'R1, because it has the higher priority',
                'R1, because HSRP preemption is enabled by default',
                'R2, because preemption is not configured on R1',
                'R2, because the router with the lower priority wins ties'
            ],
            answer: [2],
            explain: 'Without standby preempt, a returning higher-priority router does not take over from the current active router. HSRP preemption is disabled by default; VRRP preemption is enabled by default.',
            why: [
                'A higher priority wins only during an election or with preemption.',
                'HSRP preemption is disabled by default.',
                'Correct: R1 needs standby 10 preempt to reclaim the active role.',
                'In HSRP the higher priority wins, and the highest IP address breaks ties.'
            ]
        },
        {
            id: 'encor-051',
            domain: '3',
            objective: '3.3.c',
            type: 'single',
            q: 'R1:\ntrack 1 interface GigabitEthernet0/0/0 line-protocol\ninterface Vlan10\n ip address 10.10.10.2 255.255.255.0\n standby 10 ip 10.10.10.1\n standby 10 priority 110\n standby 10 preempt\n standby 10 track 1 decrement 20\n\nR2 is in the same group with priority 100 and preempt. R1 is active. R1 uplink Gi0/0/0 goes down. What happens?',
            choices: [
                'R1 stays active because its configured priority is 110',
                'Both routers become active until the uplink recovers',
                'R1 drops to 90, but R2 waits until R1 stops sending hellos',
                'R1 drops to 90, and R2 preempts to become active'
            ],
            answer: [3],
            explain: 'When the tracked object goes down, R1 priority is reduced by 20 to 90. Because R2 has priority 100 and preempt, it takes over as active. When the uplink recovers, R1 returns to 110 and preempts back.',
            why: [
                'Tracking lowers the effective priority to 90.',
                'HSRP elects one active router; both routers can still hear each other.',
                'With preempt configured, R2 takes over as soon as it has the higher priority.',
                'Correct: the decrement plus preempt on R2 moves the active role.'
            ]
        },
        {
            id: 'encor-052',
            domain: '3',
            objective: '3.3.c',
            type: 'single',
            q: 'An engineer is replacing HSRP with VRRP. Which default VRRP behavior differs from HSRP?',
            choices: [
                'VRRP preemption is enabled by default',
                'VRRP sends advertisements to UDP port 1985',
                'VRRP is a Cisco proprietary protocol',
                'VRRP elects the router with the lowest priority as master'
            ],
            answer: [0],
            explain: 'VRRP (RFC 5798) enables preemption by default, while HSRP requires the preempt command. VRRP is an IETF standard that sends advertisements as IP protocol 112 to 224.0.0.18, and the highest priority wins.',
            why: [
                'Correct: VRRP preempts by default.',
                'UDP 1985 is used by HSRP; VRRP uses IP protocol 112.',
                'VRRP is an open IETF standard; HSRP is Cisco proprietary.',
                'Like HSRP, VRRP elects the highest priority.'
            ]
        },
        {
            id: 'encor-053',
            domain: '3',
            objective: '3.3.d',
            type: 'multi',
            q: 'A video service will use Source-Specific Multicast (SSM) in the default SSM range. Which two items are required? (Choose two.)',
            choices: [
                'IGMPv3 on receiver-facing interfaces so hosts can request a specific source',
                'A rendezvous point configured for 232.0.0.0/8',
                'MSDP peering between rendezvous points',
                'PIM dense mode on the receiver LANs',
                'PIM sparse mode with ip pim ssm default to define 232.0.0.0/8 as the SSM range'
            ],
            answer: [0, 4],
            explain: 'With SSM, receivers signal (S,G) joins using IGMPv3, and routers build a source tree directly toward the source, so no RP is needed. ip pim ssm default enables SSM behavior for 232.0.0.0/8.',
            why: [
                'Correct: IGMPv3 lets receivers specify the source address.',
                'SSM builds shortest-path trees directly and does not use an RP.',
                'MSDP shares source information between RPs, which SSM does not need.',
                'SSM is a subset of PIM sparse mode, not dense mode.',
                'Correct: the SSM range must be defined on the PIM routers.'
            ]
        },
        {
            id: 'encor-054',
            domain: '3',
            objective: '3.3.d',
            type: 'single',
            q: 'R3 receives multicast traffic from source 192.0.2.50 for group 239.1.1.1 on GigabitEthernet0/1. The unicast routing table shows the best path back to 192.0.2.50 is through GigabitEthernet0/2. What does R3 do with these packets?',
            choices: [
                'Drops them because they fail the RPF check',
                'Forwards them because multicast ignores the unicast routing table',
                'Forwards them and sends a PIM assert to the upstream router',
                'Floods them out every PIM interface except Gi0/1'
            ],
            answer: [0],
            explain: 'The reverse path forwarding check accepts multicast only on the interface the router would use to reach the source. Packets arriving on any other interface are dropped, which prevents loops. A static mroute can adjust the RPF interface when needed.',
            why: [
                'Correct: Gi0/1 is not the RPF interface, so the packets are dropped.',
                'PIM is protocol independent but still relies on the unicast table for RPF.',
                'Asserts resolve duplicate forwarders on a shared segment; they do not override an RPF failure.',
                'Packets failing RPF are not forwarded at all.'
            ]
        },
        {
            id: 'encor-055',
            domain: '3',
            objective: '3.3.d',
            type: 'single',
            q: 'Two companies each run their own PIM-SM domain with their own rendezvous point. Receivers in one domain must discover active sources in the other domain. Which technology provides this?',
            choices: [
                'Bidirectional PIM',
                'Auto-RP',
                'IGMP snooping',
                'MSDP'
            ],
            answer: [3],
            explain: 'MSDP peers RPs together and exchanges Source-Active messages so each RP learns about sources registered in other domains. MSDP is also used within one domain to implement Anycast RP.',
            why: [
                'Bidir PIM builds shared trees within a domain for many-to-many applications; it does not share sources between RPs.',
                'Auto-RP distributes RP-to-group mappings within a domain.',
                'IGMP snooping limits multicast flooding on Layer 2 switches.',
                'Correct: MSDP shares active source information between RPs.'
            ]
        },

        // ---------------- Domain 4: Network Assurance (10) ----------------
        {
            id: 'encor-056',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'A busy WAN router has hundreds of IPsec peers. An engineer must troubleshoot negotiation with one peer, 198.51.100.7, without overwhelming the CPU or the log. What is the best approach?',
            choices: [
                'Enable all crypto debugs and send them only to the console',
                'Set a debug condition that matches the peer, then enable the crypto debugs',
                'Enable debugs and filter the output with show logging | include 198.51.100.7',
                'Lower logging buffered to severity 7 and wait for errors to appear'
            ],
            answer: [1],
            explain: 'Conditional debugging restricts debug processing to events that match a condition, such as a peer address or interface, so the router does not generate output for every session. On a busy device this protects the CPU and keeps the output readable.',
            why: [
                'Unconditional debugs are generated for every peer, and console logging is the most CPU-intensive destination.',
                'Correct: a debug condition limits output to the peer of interest.',
                'Filtering the display still requires the router to generate every debug message.',
                'Changing the logging level does not enable the protocol debugs that show negotiation details.'
            ]
        },
        {
            id: 'encor-057',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'R1# ping 203.0.113.50\nType escape sequence to abort.\nSending 5, 100-byte ICMP Echos to 203.0.113.50, timeout is 2 seconds:\nU.U.U\nSuccess rate is 0 percent (0/5)\n\nWhat does this output indicate?',
            choices: [
                'The destination answered every echo, but the replies were lost on the return path to R1',
                'The packets were too large and needed fragmentation',
                'A device on the path is sending ICMP unreachables, which IOS rate-limits (the dots)',
                'The TTL expired before the packets reached the destination'
            ],
            answer: [2],
            explain: 'In IOS ping output, U means an ICMP destination unreachable was received, often from a router with no route or an ACL. IOS rate-limits unreachables by default, so alternate probes time out and show as dots.',
            why: [
                'Successful replies are shown as exclamation points.',
                'A fragmentation-needed condition is shown as M.',
                'Correct: U indicates unreachable replies, and the dots are rate-limited probes.',
                'TTL expiry is shown as an ampersand.'
            ]
        },
        {
            id: 'encor-058',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'snmp-server group NMS v3 priv\nsnmp-server user ops NMS v3 auth sha <auth-pass> priv aes 128 <priv-pass>\n\nWhich SNMPv3 security level does user ops use?',
            choices: [
                'authPriv: messages are authenticated with SHA and encrypted with AES',
                'authNoPriv: messages are authenticated but sent in clear text',
                'noAuthNoPriv: only the user name is checked',
                'Community-based security, as in SNMPv2c'
            ],
            answer: [0],
            explain: 'The priv keyword on the group sets the authPriv level, which requires both authentication (SHA) and encryption (AES). This is the recommended level for production SNMP.',
            why: [
                'Correct: priv requires authentication and privacy.',
                'authNoPriv is configured with the auth keyword on the group, and it does not encrypt.',
                'noAuthNoPriv uses neither authentication nor encryption.',
                'SNMPv3 uses the user-based security model, not community strings.'
            ]
        },
        {
            id: 'encor-059',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'logging host 192.0.2.25\nlogging trap warnings\n\nWhich messages are sent to the syslog server?',
            choices: [
                'Only severity 4 (warnings) messages',
                'Severities 4 through 7',
                'All severities, because the trap level only affects the console',
                'Severities 0 through 4 (emergencies through warnings)'
            ],
            answer: [3],
            explain: 'A logging level includes that severity and every more severe (lower-numbered) level. warnings is severity 4, so messages from 0 (emergencies) through 4 are sent to the syslog host.',
            why: [
                'The level is a threshold, not a single severity.',
                'Higher numbers are less severe; they are excluded at this level.',
                'logging trap controls what is sent to syslog hosts; logging console controls the console.',
                'Correct: severities 0 through 4 are sent.'
            ]
        },
        {
            id: 'encor-060',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'flow record REC1\n match ipv4 source address\n match ipv4 destination address\n match transport destination-port\n collect counter bytes\n collect timestamp absolute first\nflow exporter EXP1\n destination 192.0.2.100\n transport udp 2055\nflow monitor MON1\n record REC1\n exporter EXP1\ninterface GigabitEthernet0/0/1\n ip flow monitor MON1 input\n\nWhat is the difference between the match and collect fields?',
            choices: [
                'match fields are exported, while collect fields stay only in the local cache',
                'match fields are key fields that define a flow; collect fields are non-key data recorded per flow',
                'match fields filter which packets are monitored, and all packets that do not match any field are dropped',
                'collect fields define the flow, while match fields are counters'
            ],
            answer: [1],
            explain: 'In Flexible NetFlow, match fields are the key fields; a packet with a new combination of key values creates a new cache entry. collect fields are non-key fields, such as counters and timestamps, that are recorded for each flow and exported with it.',
            why: [
                'Both key and non-key fields are exported in the flow record.',
                'Correct: match defines the flow key, and collect adds non-key data.',
                'Flexible NetFlow monitors traffic; it does not drop packets that create other flows.',
                'This reverses the roles of match and collect.'
            ]
        },
        {
            id: 'encor-061',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'A security team needs a copy of traffic from a branch switch port sent to an analyzer in a data center that is reachable only across a routed network. Which feature fits this requirement?',
            choices: [
                'Local SPAN',
                'RSPAN',
                'ERSPAN',
                'Port security'
            ],
            answer: [2],
            explain: 'ERSPAN encapsulates mirrored traffic in GRE so it can be routed across Layer 3 networks to a remote destination. RSPAN carries mirrored traffic in a dedicated VLAN, so it requires Layer 2 connectivity end to end.',
            why: [
                'Local SPAN sends the copy to a port on the same switch.',
                'RSPAN needs the remote-span VLAN to be trunked end to end over Layer 2.',
                'Correct: ERSPAN is routable because it uses GRE encapsulation.',
                'Port security limits MAC addresses on a port; it does not mirror traffic.'
            ]
        },
        {
            id: 'encor-062',
            domain: '4',
            objective: '4.4',
            type: 'single',
            q: 'ip sla 10\n icmp-echo 198.51.100.1 source-interface GigabitEthernet0/0/0\n frequency 10\nip sla schedule 10 life forever start-time now\ntrack 1 ip sla 10 reachability\nip route 0.0.0.0 0.0.0.0 198.51.100.1 track 1\nip route 0.0.0.0 0.0.0.0 203.0.113.1 10\n\nWhat happens when 198.51.100.1 stops answering pings?',
            choices: [
                'Both default routes stay installed in the routing table, and traffic is load balanced across them',
                'The router keeps the primary route until GigabitEthernet0/0/0 goes down',
                'The IP SLA operation stops, and both routes are removed',
                'The tracked default route is removed, and the floating static route via 203.0.113.1 is installed'
            ],
            answer: [3],
            explain: 'When the IP SLA probe fails, track 1 goes down and the static route tied to it is withdrawn. The backup default route with administrative distance 10 then becomes the best route. When the probe succeeds again, the primary route returns.',
            why: [
                'The routes have different administrative distances, so they are not load balanced.',
                'The point of IP SLA tracking is to detect failures beyond the local interface state.',
                'The operation keeps running with life forever, and the floating route is not tracked.',
                'Correct: the tracked route is withdrawn, and the floating static takes over.'
            ]
        },
        {
            id: 'encor-063',
            domain: '4',
            objective: '4.5',
            type: 'single',
            q: 'In Cisco Catalyst Center, an engineer builds the site hierarchy and defines the DNS, DHCP, NTP, and AAA servers and device credentials that devices at each site will use. Which workflow area is this?',
            choices: [
                'Provision',
                'Policy',
                'Design',
                'Assurance'
            ],
            answer: [2],
            explain: 'The Design area defines the network hierarchy, network settings, IP pools, credentials, and image standards. Provision then applies those settings to devices, Policy defines group-based and other policies, and Assurance monitors health.',
            why: [
                'Provision assigns devices to sites and pushes configuration that was defined elsewhere.',
                'Policy defines access, application, and group-based policies.',
                'Correct: site hierarchy and network settings are defined in Design.',
                'Assurance monitors health and troubleshoots issues.'
            ]
        },
        {
            id: 'encor-064',
            domain: '4',
            objective: '4.5',
            type: 'multi',
            q: 'Which two capabilities does Catalyst Center Assurance provide? (Choose two.)',
            choices: [
                'Distributing OMP routes to SD-WAN edge routers',
                'Health scores for network devices and clients',
                'Acting as the LISP map-server for the fabric',
                'Issue detection with probable causes and suggested remediation steps',
                'Terminating 802.1X authentication as the RADIUS server'
            ],
            answer: [1, 3],
            explain: 'Assurance collects telemetry from the network and presents health scores for devices, clients, and applications. It raises issues with probable root causes and guided remediation, and AI-driven analytics can learn baselines to detect anomalies.',
            why: [
                'OMP routes are distributed by SD-WAN Controllers.',
                'Correct: health scores are a core Assurance function.',
                'The fabric control plane node, not Catalyst Center, acts as the LISP map-server.',
                'Correct: Assurance detects issues and suggests remediation.',
                'RADIUS authentication is handled by Cisco ISE or another AAA server.'
            ]
        },
        {
            id: 'encor-065',
            domain: '4',
            objective: '4.6',
            type: 'single',
            q: 'AAA and a local privilege 15 user are already configured on an IOS XE router. Which pair of global commands enables the RESTCONF API over HTTPS?',
            choices: [
                'netconf-yang and ip ssh port 830',
                'restconf and ip http secure-server',
                'ip http server and transport input ssh',
                'restconf and line vty 0 4 transport input all'
            ],
            answer: [1],
            explain: 'RESTCONF runs over HTTPS on IOS XE and needs the restconf command plus the HTTPS server. NETCONF is enabled separately with netconf-yang and uses SSH on port 830.',
            why: [
                'These enable NETCONF over SSH, not RESTCONF.',
                'Correct: RESTCONF needs the restconf command and the HTTPS server.',
                'The plain HTTP server is not used for RESTCONF, and vty transport is unrelated.',
                'RESTCONF does not run over the vty lines.'
            ]
        },

        // ---------------- Domain 5: Security (20) ----------------
        {
            id: 'encor-066',
            domain: '5',
            objective: '5.1.a',
            type: 'single',
            q: 'username netadmin privilege 15 secret <redacted>\n!\nline vty 0 15\n login\n transport input ssh\n\nSSH is enabled and reachable, but netadmin cannot log in. aaa new-model is not configured. What is the fix?',
            choices: [
                'Add password 7 under the vty lines',
                'Change transport input ssh to transport input all',
                'Change privilege 15 to privilege 1 on the username',
                'Change login to login local under the vty lines'
            ],
            answer: [3],
            explain: 'Without AAA, the login command uses the line password, while login local uses the local username database. Because there is no line password and the user is defined locally, the lines need login local.',
            why: [
                'A line password would not let netadmin authenticate with a username and secret, and type 7 is weak.',
                'Allowing Telnet does not change which credential database is used.',
                'The privilege level controls authorization after login, not whether login succeeds.',
                'Correct: login local makes the lines use the local username database.'
            ]
        },
        {
            id: 'encor-067',
            domain: '5',
            objective: '5.1.a',
            type: 'multi',
            q: 'An engineer is enabling SSH version 2 on a new IOS XE switch that still has its default hostname and no aaa new-model. Which two items are required? (Choose two.)',
            choices: [
                'An enable password configured on the vty lines',
                'transport input all on the vty lines',
                'A hostname other than the default and an IP domain name, when the RSA key is generated without a label',
                'An RSA key pair generated on the device',
                'A reachable TACACS+ server'
            ],
            answer: [2, 3],
            explain: 'SSH needs an RSA key pair. When crypto key generate rsa is used without a label, the key is named from the hostname and domain name, so a non-default hostname and ip domain name must exist first.',
            why: [
                'The enable password controls privileged mode, not SSH.',
                'transport input all also allows Telnet and is not required for SSH.',
                'Correct: the default key name is built from the hostname and domain name.',
                'Correct: SSH cannot start without an RSA key pair.',
                'Local authentication works for SSH; TACACS+ is optional.'
            ]
        },
        {
            id: 'encor-068',
            domain: '5',
            objective: '5.1.a',
            type: 'single',
            q: 'A router has both enable password and enable secret configured with different values. Which statement is correct?',
            choices: [
                'Either value is accepted at the enable prompt',
                'Only the enable secret value is accepted',
                'Only the enable password value is accepted, because it was configured first',
                'Both values must be entered in sequence'
            ],
            answer: [1],
            explain: 'When both exist, enable secret takes precedence and enable password is ignored. enable secret is stored with a one-way hash; use a strong algorithm such as scrypt (type 9).',
            why: [
                'IOS does not accept both; the secret overrides the password.',
                'Correct: enable secret takes precedence.',
                'Configuration order does not matter; the secret always wins.',
                'Only one value is entered at the enable prompt.'
            ]
        },
        {
            id: 'encor-069',
            domain: '5',
            objective: '5.1.b',
            type: 'single',
            q: 'aaa new-model\ntacacs server ISE1\n address ipv4 192.0.2.40\n key <redacted>\naaa authentication login default group tacacs+ local\n\nUser jdoe exists in the local database with password A and on the reachable TACACS+ server with password B. jdoe logs in through SSH with password A. What happens?',
            choices: [
                'Login succeeds, because the local database is checked after TACACS+ rejects the password',
                'Login fails, because local is consulted only when the TACACS+ server does not respond',
                'Login succeeds only on the console line',
                'Login succeeds at privilege level 1'
            ],
            answer: [1],
            explain: 'AAA moves to the next method in the list only on an ERROR, such as no response from the server. A FAIL (reject) from a reachable server ends authentication, so the local password is never tried.',
            why: [
                'A rejection is a FAIL, which stops the method list.',
                'Correct: fallback happens only when the server is unavailable.',
                'The default list applies to all lines, including the console, and the result is the same.',
                'Authentication fails, so no privilege level is assigned.'
            ]
        },
        {
            id: 'encor-070',
            domain: '5',
            objective: '5.1.b',
            type: 'single',
            q: 'A team is choosing between TACACS+ and RADIUS for network device administration. Why is TACACS+ usually preferred for this use case?',
            choices: [
                'It uses UDP, which makes authentication faster',
                'It is the standard protocol for 802.1X network access',
                'It encrypts only the password field, which makes packet captures easier to read during troubleshooting',
                'It separates authentication, authorization, and accounting and supports per-command authorization'
            ],
            answer: [3],
            explain: 'TACACS+ uses TCP port 49, encrypts the entire packet body, and handles authentication, authorization, and accounting separately, which allows per-command authorization for administrators. RADIUS combines authentication and authorization and is the standard for network access such as 802.1X.',
            why: [
                'TACACS+ uses TCP port 49; RADIUS uses UDP.',
                'RADIUS is the protocol used for 802.1X network access.',
                'RADIUS encrypts only the password; TACACS+ encrypts the whole body.',
                'Correct: separate AAA functions and command authorization suit device administration.'
            ]
        },
        {
            id: 'encor-071',
            domain: '5',
            objective: '5.1.b',
            type: 'single',
            q: 'An engineer adds:\n\naaa authorization commands 15 default group tacacs+ local\n\nWhat is the effect for administrators who log in with privilege 15?',
            choices: [
                'Each level 15 command is checked with TACACS+ before it runs; local is used if the server is unreachable',
                'Only the login is authorized; individual commands are not checked',
                'Each command is logged to the TACACS+ server after it runs, but no command is ever blocked from running',
                'Users are moved to privilege 1 until the TACACS+ server approves privilege 15'
            ],
            answer: [0],
            explain: 'Command authorization checks each command at the specified privilege level with the method list before it runs. The local method is used only if TACACS+ returns an error, for example when the server is unreachable.',
            why: [
                'Correct: this enables per-command authorization for level 15 commands.',
                'Login authorization is controlled by aaa authorization exec, not commands.',
                'Logging commands after execution is command accounting, not authorization.',
                'Command authorization does not change the user privilege level.'
            ]
        },
        {
            id: 'encor-072',
            domain: '5',
            objective: '5.2.a',
            type: 'single',
            q: 'ip access-list extended EDGE-IN\n 10 permit tcp any host 203.0.113.10 eq 443\n 20 deny ip 198.51.100.0 0.0.0.255 any\n 30 permit icmp any any echo-reply\n\nThe ACL is applied inbound on the Internet-facing interface. Host 198.51.100.25 sends an HTTPS request to 203.0.113.10. What happens?',
            choices: [
                'It is denied by line 20, because deny entries are processed before permits',
                'It is denied by the implicit deny at the end of the ACL',
                'It is permitted by line 10, because ACLs stop at the first matching entry',
                'It is permitted only if the return traffic matches line 30'
            ],
            answer: [2],
            explain: 'ACL entries are evaluated top-down, and processing stops at the first match. The packet matches line 10 before reaching the deny on line 20. To block that subnet entirely, the deny must come first.',
            why: [
                'IOS does not reorder entries; they are processed in sequence order.',
                'The packet matches line 10 before reaching the implicit deny.',
                'Correct: first match wins.',
                'Line 30 matches ICMP echo replies and has nothing to do with this TCP session.'
            ]
        },
        {
            id: 'encor-073',
            domain: '5',
            objective: '5.2.a',
            type: 'single',
            q: 'Which address and wildcard mask match every address from 10.20.16.0 through 10.20.31.255 and nothing else?',
            choices: [
                '10.20.16.0 0.0.16.255',
                '10.20.16.0 0.0.15.255',
                '10.20.0.0 0.0.31.255',
                '10.20.16.0 0.0.31.255'
            ],
            answer: [1],
            explain: 'The range is 16 third-octet values (16 through 31), which is a /20 block. The wildcard is the inverse of 255.255.240.0, so 0.0.15.255 starting at 10.20.16.0.',
            why: [
                '0.0.16.255 is not a contiguous wildcard and does not match the required range.',
                'Correct: 10.20.16.0/20 equals 10.20.16.0 0.0.15.255.',
                'This matches 10.20.0.0 through 10.20.31.255, which is too wide.',
                'With 0.0.31.255 the range starts at 10.20.0.0, which is too wide.'
            ]
        },
        {
            id: 'encor-074',
            domain: '5',
            objective: '5.2.a',
            type: 'single',
            q: 'Only the management subnet 192.0.2.0/24 may open SSH sessions to a router. Which configuration applies standard ACL 10 correctly?',
            choices: [
                'interface Loopback0 then ip access-group 10 in',
                'line vty 0 15 then ip access-group 10 in',
                'control-plane then ip access-group 10 in',
                'line vty 0 15 then access-class 10 in'
            ],
            answer: [3],
            explain: 'Remote management access to the vty lines is filtered with access-class under the line configuration. ip access-group applies an ACL to an interface and only filters traffic through that specific interface.',
            why: [
                'An ACL on Loopback0 filters only traffic sent to that interface, not all vty access.',
                'ip access-group is an interface command and is not valid under line vty.',
                'The control plane is protected with a service-policy (CoPP), not ip access-group.',
                'Correct: access-class filters vty access.'
            ]
        },
        {
            id: 'encor-075',
            domain: '5',
            objective: '5.2.b',
            type: 'single',
            q: 'ip access-list extended ACL-SSH\n permit tcp 192.0.2.0 0.0.0.255 any eq 22\nclass-map match-all CM-SSH\n match access-group name ACL-SSH\npolicy-map PM-COPP\n class CM-SSH\n  police 64000 conform-action transmit exceed-action drop\ncontrol-plane\n service-policy input PM-COPP\n\nWhat does this configuration do?',
            choices: [
                'It rate-limits SSH from 192.0.2.0/24 that is destined to the router itself to 64 kbps',
                'It limits all SSH sessions passing through the router between any two hosts to 64 kbps',
                'It blocks SSH from every source except 192.0.2.0/24',
                'It guarantees 64 kbps of bandwidth for SSH on every interface'
            ],
            answer: [0],
            explain: 'Control Plane Policing applies a QoS policy to traffic punted to the route processor. Here, matching SSH to the router is policed at 64 kbps, and transit traffic is not affected because it never reaches the control plane.',
            why: [
                'Correct: CoPP affects only traffic destined to the control plane.',
                'Transit traffic is forwarded in the data plane and is not seen by CoPP.',
                'Traffic that matches no class falls into class-default, which has no action here, so other SSH is not blocked.',
                'Policing limits traffic; it does not guarantee bandwidth.'
            ]
        },
        {
            id: 'encor-076',
            domain: '5',
            objective: '5.2.b',
            type: 'single',
            q: 'A CoPP class map matches an ACL whose first entry is:\n\ndeny tcp host 192.0.2.5 any eq 22\n\nThe class is policed with exceed-action drop. How is SSH from 192.0.2.5 to the router handled?',
            choices: [
                'It is dropped immediately because the matching ACL entry is a deny, before any policing is applied',
                'It is policed by this class like any other matched traffic',
                'It does not match this class and is evaluated against the following classes and class-default',
                'It bypasses CoPP entirely and is always permitted'
            ],
            answer: [2],
            explain: 'When an ACL is used for classification, permit means the packet matches the class and deny means it does not. A deny entry never drops traffic by itself in a class map; the packet simply moves on to the next class.',
            why: [
                'In a class map, deny means no match, not drop.',
                'Denied traffic does not match this class, so this class policer does not apply.',
                'Correct: the traffic moves on to later classes and finally class-default.',
                'All control plane traffic is still subject to the policy, including class-default.'
            ]
        },
        {
            id: 'encor-077',
            domain: '5',
            objective: '5.2.a',
            type: 'single',
            q: 'An engineer applies an IPv6 ACL inbound on a LAN interface. The ACL permits specific application traffic and ends with an explicit deny ipv6 any any log. Shortly afterward, hosts lose IPv6 connectivity to the router. What is the most likely cause?',
            choices: [
                'IPv6 ACLs must be applied outbound only',
                'The explicit deny blocks Neighbor Discovery, which the implicit rules would otherwise permit',
                'The log keyword disables hardware forwarding, so all IPv6 traffic on the interface is dropped',
                'IPv6 ACLs do not support the any keyword'
            ],
            answer: [1],
            explain: 'IPv6 ACLs include implicit permits for Neighbor Discovery (NS and NA) before the implicit deny. An explicit deny ipv6 any any is evaluated before those implicit entries, so ND must be permitted explicitly above it.',
            why: [
                'IPv6 ACLs can be applied inbound or outbound with ipv6 traffic-filter.',
                'Correct: the explicit deny overrides the implicit ND permits.',
                'Logging may increase CPU load but does not cause a complete loss of connectivity.',
                'any is valid in IPv6 ACLs.'
            ]
        },
        {
            id: 'encor-078',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'A script sends a POST to https://catc.example.com/dna/system/api/v1/auth/token with HTTP Basic authentication and receives a JSON body containing a Token value. How must the script send the token on later Catalyst Center API calls?',
            choices: [
                'In an Authorization: Bearer header',
                'In a Cookie: JSESSIONID header',
                'In an X-Auth-Token header',
                'In an X-XSRF-TOKEN header'
            ],
            answer: [2],
            explain: 'Catalyst Center issues a time-limited token after Basic authentication to the token endpoint. Each later request carries it in the X-Auth-Token header, so the credentials are not resent with every call.',
            why: [
                'Catalyst Center intent APIs expect X-Auth-Token rather than a Bearer header.',
                'A JSESSIONID cookie is used by SD-WAN Manager sessions, not Catalyst Center tokens.',
                'Correct: X-Auth-Token carries the Catalyst Center token.',
                'X-XSRF-TOKEN is the anti-CSRF header used with SD-WAN Manager.'
            ]
        },
        {
            id: 'encor-079',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'A developer says HTTP Basic authentication protects API credentials because they are Base64-encoded in the Authorization header. What is the correct response?',
            choices: [
                'Base64 is an encoding, not encryption, so Basic authentication must be used only over TLS',
                'Base64 is safe because it requires a shared key to decode',
                'Basic authentication hashes the password with SHA-256 before sending it',
                'Basic authentication is safe over plain HTTP as long as the password is long, complex, and rotated'
            ],
            answer: [0],
            explain: 'Anyone who captures the header can decode Base64 instantly. REST APIs that use Basic authentication must run over HTTPS so the header is protected in transit, and should prefer short-lived tokens for subsequent calls.',
            why: [
                'Correct: Base64 offers no confidentiality, so TLS is required.',
                'Base64 decoding needs no key.',
                'Basic authentication sends the user name and password encoded, not hashed.',
                'Password length does not help when the value can be decoded from captured traffic.'
            ]
        },
        {
            id: 'encor-080',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'An automation service account token for a network controller API was accidentally committed to a public repository. Which practice would have reduced the impact most?',
            choices: [
                'Using HTTP instead of HTTPS so the token is easier to rotate',
                'Giving the service account full administrator rights so automation jobs never fail on permissions',
                'Embedding the token directly in every script for consistency',
                'Short-lived tokens with least-privilege scope, stored in a secrets manager and rotated'
            ],
            answer: [3],
            explain: 'Expiring, narrowly scoped tokens limit how long and how much a leaked credential can be abused. Keeping secrets out of code, in a vault or environment, and rotating them reduces the chance of exposure in the first place.',
            why: [
                'Plain HTTP exposes tokens in transit and does nothing for rotation.',
                'Full administrator rights maximize the damage from a leak.',
                'Hard-coding tokens in scripts is how this leak happened.',
                'Correct: limited lifetime and scope plus proper storage reduce exposure.'
            ]
        },
        {
            id: 'encor-081',
            domain: '5',
            objective: '5.4.a',
            type: 'single',
            q: 'A security team wants to detect internal hosts that suddenly send unusual volumes of data to new external destinations by analyzing NetFlow from switches and routers. Which Cisco solution is designed for this?',
            choices: [
                'Cisco Secure Endpoint',
                'Cisco Secure Network Analytics',
                'Cisco Identity Services Engine',
                'Cisco Umbrella'
            ],
            answer: [1],
            explain: 'Secure Network Analytics (formerly Stealthwatch) collects flow telemetry, builds behavioral baselines, and alerts on anomalies such as data hoarding or exfiltration. It turns the network itself into a sensor.',
            why: [
                'Secure Endpoint protects hosts with an endpoint agent; it does not analyze NetFlow.',
                'Correct: Secure Network Analytics performs flow-based behavioral analysis.',
                'ISE provides identity and access control, not flow analytics.',
                'Umbrella secures DNS and web traffic; it does not analyze internal NetFlow.'
            ]
        },
        {
            id: 'encor-082',
            domain: '5',
            objective: '5.4.b',
            type: 'single',
            q: 'A file was allowed onto several laptops because it was unknown at the time. Days later it is classified as malicious. Which endpoint security capability alerts the team and shows which hosts received and executed the file?',
            choices: [
                'DNS-layer security blocking',
                'Posture assessment during 802.1X',
                'Email attachment sandboxing at the gateway before messages are delivered',
                'Retrospective detection with file trajectory in Cisco Secure Endpoint'
            ],
            answer: [3],
            explain: 'Cisco Secure Endpoint continuously tracks file activity. When a file disposition later changes to malicious, retrospective detection raises alerts, and file trajectory shows where the file traveled and what it did so it can be contained.',
            why: [
                'DNS-layer security blocks malicious domains; it does not track files already on hosts.',
                'Posture assessment checks compliance at network access time; it does not trace files.',
                'Gateway sandboxing analyzes files before delivery and does not track them on endpoints afterward.',
                'Correct: retrospective detection and file trajectory provide this visibility.'
            ]
        },
        {
            id: 'encor-083',
            domain: '5',
            objective: '5.4.c',
            type: 'single',
            q: 'What distinguishes a next-generation firewall from a traditional stateful firewall?',
            choices: [
                'Application visibility and control, integrated intrusion prevention, and URL filtering',
                'The ability to track TCP session state',
                'Support for NAT and static routing',
                'Filtering traffic based on source and destination IP addresses, protocols, and port numbers'
            ],
            answer: [0],
            explain: 'A next-generation firewall adds application identification regardless of port, an integrated IPS, URL filtering, and often identity awareness and malware inspection. Stateful inspection, NAT, and 5-tuple filtering are already in traditional firewalls.',
            why: [
                'Correct: application awareness, IPS, and URL filtering define an NGFW.',
                'Session state tracking is what defines a traditional stateful firewall.',
                'NAT and static routing are common to traditional firewalls.',
                '5-tuple filtering is a basic firewall capability.'
            ]
        },
        {
            id: 'encor-084',
            domain: '5',
            objective: '5.4.d',
            type: 'multi',
            q: 'Which two statements about Cisco TrustSec are true? (Choose two.)',
            choices: [
                'SGTs are carried in the 802.1p priority bits of the 802.1Q tag',
                'SGTs are usually assigned at network ingress from ISE authorization results',
                'TrustSec requires MACsec on every link to work',
                'SXP propagates IP-to-SGT bindings over UDP port 1812',
                'SGACL enforcement normally happens at egress, close to the destination'
            ],
            answer: [1, 4],
            explain: 'TrustSec classifies traffic once at ingress, typically with an SGT assigned by ISE after 802.1X or MAB, and enforces group-based policy with SGACLs at egress. Tags travel inline (Cisco metadata) or through SXP, which runs over TCP.',
            why: [
                'The SGT is carried in a Cisco metadata header or in VXLAN-GPO, not in 802.1p bits.',
                'Correct: classification normally happens at ingress.',
                'MACsec can protect inline tags but is not required.',
                'SXP runs over TCP (port 64999); UDP 1812 is RADIUS authentication.',
                'Correct: SGACLs are typically enforced at egress.'
            ]
        },
        {
            id: 'encor-085',
            domain: '5',
            objective: '5.4.d',
            type: 'single',
            q: 'Which statement describes MACsec (IEEE 802.1AE)?',
            choices: [
                'It encrypts IP packets end to end between two hosts, across any number of routed hops in between',
                'It is an IPsec mode that encrypts only management traffic',
                'It provides hop-by-hop Layer 2 encryption and integrity, with keys commonly negotiated by MKA',
                'It replaces 802.1X for network access authentication'
            ],
            answer: [2],
            explain: 'MACsec encrypts Ethernet frames on a link between MACsec-capable devices, such as switch-to-switch or host-to-switch. Each hop decrypts and re-encrypts the frame. The MACsec Key Agreement protocol (MKA) negotiates keys, often after 802.1X authentication.',
            why: [
                'MACsec protects individual links, not end-to-end IP paths through routers.',
                'MACsec is an IEEE Layer 2 standard, not an IPsec mode.',
                'Correct: MACsec is hop-by-hop Layer 2 encryption with MKA key management.',
                'MACsec complements 802.1X; it does not replace authentication.'
            ]
        },

        // ---------------- Domain 6: Automation and Artificial Intelligence (15) ----------------
        {
            id: 'encor-086',
            domain: '6',
            objective: '6.1',
            type: 'single',
            q: 'interfaces = [\n    {"name": "Gi1", "status": "up"},\n    {"name": "Gi2", "status": "down"},\n    {"name": "Gi3", "status": "up"}\n]\nup = [i["name"] for i in interfaces if i["status"] == "up"]\nprint(len(up), up[-1])\n\nWhat does this Python code print?',
            choices: [
                '3 Gi3',
                '1 Gi2',
                '2 Gi3',
                '2 Gi1'
            ],
            answer: [2],
            explain: 'The list comprehension keeps only the names of interfaces whose status is up, producing ["Gi1", "Gi3"]. len() returns 2, and index -1 returns the last element, Gi3.',
            why: [
                'Gi2 is filtered out, so the list has two elements, not three.',
                'This would be the result of selecting interfaces that are down.',
                'Correct: two interfaces are up, and the last is Gi3.',
                'Index -1 returns the last element, not the first.'
            ]
        },
        {
            id: 'encor-087',
            domain: '6',
            objective: '6.1',
            type: 'single',
            q: 'device = {"hostname": "edge-1", "mgmt": "192.0.2.11", "vlans": [10, 20, 30]}\nfor key, value in device.items():\n    if isinstance(value, list):\n        print(key, sum(value))\n\nWhat does this Python code print?',
            choices: [
                'hostname edge-1',
                'vlans 60',
                'vlans [10, 20, 30]',
                'A TypeError, because a string cannot be summed'
            ],
            answer: [1],
            explain: 'items() yields each key and value pair. Only the vlans value is a list, so the loop prints the key and the sum of the list, 60. The string values are skipped by the isinstance check.',
            why: [
                'hostname is a string, so isinstance(value, list) is False and nothing is printed for it.',
                'Correct: only vlans passes the check, and its values sum to 60.',
                'sum() adds the elements; it does not print the list itself.',
                'The isinstance check prevents sum() from being called on strings.'
            ]
        },
        {
            id: 'encor-088',
            domain: '6',
            objective: '6.1',
            type: 'single',
            q: 'def mask_to_prefix(mask):\n    return sum(bin(int(octet)).count("1") for octet in mask.split("."))\n\nprint(mask_to_prefix("255.255.240.0"))\n\nWhat does this Python code print?',
            choices: [
                '4',
                '24',
                '12',
                '20'
            ],
            answer: [3],
            explain: 'The function splits the mask into octets, converts each to a binary string, and counts the 1 bits: 8 + 8 + 4 + 0 = 20. This is the prefix length of 255.255.240.0.',
            why: [
                '4 is only the count for the 240 octet.',
                '24 would be the result for 255.255.255.0.',
                '12 would correspond to 255.240.0.0.',
                'Correct: the mask has 20 one bits.'
            ]
        },
        {
            id: 'encor-089',
            domain: '6',
            objective: '6.2',
            type: 'single',
            q: 'Which of these is a valid JSON document?',
            choices: [
                '{"vlan": 10, "name": "users",}',
                '{\'vlan\': 10, \'name\': \'users\'}',
                '{"vlan": 10, "name": "users", "voice": null}',
                '{"vlan": 10, "name": "users", "voice": None}'
            ],
            answer: [2],
            explain: 'JSON requires double-quoted strings and keys, forbids trailing commas, and uses the lowercase literals true, false, and null. The third document follows all of these rules.',
            why: [
                'A trailing comma after the last member is not allowed in JSON.',
                'JSON strings and keys must use double quotes.',
                'Correct: this document is valid JSON.',
                'None is Python; JSON uses null.'
            ]
        },
        {
            id: 'encor-090',
            domain: '6',
            objective: '6.2',
            type: 'multi',
            q: 'An engineer writes this payload for an API call:\n\n{\n  "hostname": \'core-sw1\',\n  "vlans": [10, 20, 30],\n  "enabled": True\n}\n\nWhich two problems make it invalid JSON? (Choose two.)',
            choices: [
                'Integer values in the array must be quoted',
                'The hostname value uses single quotes',
                'Keys must not be quoted',
                'The boolean is written as True instead of true',
                'The top-level element must be an array'
            ],
            answer: [1, 3],
            explain: 'JSON strings must be enclosed in double quotes, and the boolean literals are lowercase true and false. Numbers are written without quotes, keys must be quoted, and an object is a valid top-level element.',
            why: [
                'JSON numbers are written without quotes.',
                'Correct: single-quoted strings are not valid JSON.',
                'JSON keys must be double-quoted strings.',
                'Correct: JSON booleans are lowercase.',
                'An object is a valid top-level JSON value.'
            ]
        },
        {
            id: 'encor-091',
            domain: '6',
            objective: '6.2',
            type: 'single',
            q: 'Which statement about JSON is correct?',
            choices: [
                'Objects are unordered sets of name/value pairs, while arrays are ordered lists of values',
                'Comments can be added anywhere in the document with // for single lines or /* */ for blocks',
                'Strings can be enclosed in single or double quotes',
                'Numbers may include leading zeros, such as 007'
            ],
            answer: [0],
            explain: 'JSON (RFC 8259) defines objects as unordered collections of name/value pairs and arrays as ordered sequences. It has no comment syntax, requires double-quoted strings, and does not allow leading zeros in numbers.',
            why: [
                'Correct: objects are unordered and arrays are ordered.',
                'JSON does not support comments.',
                'Only double quotes are allowed for strings.',
                'Leading zeros are not allowed in JSON numbers.'
            ]
        },
        {
            id: 'encor-092',
            domain: '6',
            objective: '6.3',
            type: 'single',
            q: 'container interfaces {\n  list interface {\n    key "name";\n    leaf name {\n      type string;\n    }\n    leaf enabled {\n      type boolean;\n      default true;\n    }\n  }\n}\n\nWhat does key "name" mean in this YANG module?',
            choices: [
                'name is a mandatory password field for the list',
                'name is encrypted when it is transmitted over NETCONF',
                'Each entry in the interface list is uniquely identified by its name value',
                'Only one interface can exist because the key limits the list to one entry'
            ],
            answer: [2],
            explain: 'A YANG list contains multiple entries, and the key statement names the leaf whose value uniquely identifies each entry. In RESTCONF the key appears in the URI, for example interface=GigabitEthernet1.',
            why: [
                'key has nothing to do with passwords.',
                'YANG defines data structure; transport security comes from SSH or TLS.',
                'Correct: the key uniquely identifies each list entry.',
                'A list can hold many entries; the key just keeps them unique.'
            ]
        },
        {
            id: 'encor-093',
            domain: '6',
            objective: '6.3',
            type: 'single',
            q: 'Which statement best describes the relationship between YANG and NETCONF or RESTCONF?',
            choices: [
                'YANG is the transport protocol, while NETCONF and RESTCONF are the data models it carries',
                'YANG replaces NETCONF and RESTCONF on IOS XE',
                'YANG is used only to model operational data, never configuration',
                'YANG defines the data structure, which NETCONF and RESTCONF carry encoded as XML or JSON'
            ],
            answer: [3],
            explain: 'YANG is a data modeling language that describes configuration and operational data with types and constraints. NETCONF (over SSH, XML) and RESTCONF (over HTTPS, XML or JSON) are the protocols that read and change data structured by those models.',
            why: [
                'This reverses the roles of the modeling language and the protocols.',
                'YANG cannot replace them; it needs a protocol to move the data.',
                'YANG models both configuration and operational state.',
                'Correct: YANG defines the data, and the protocols transport it.'
            ]
        },
        {
            id: 'encor-094',
            domain: '6',
            objective: '6.4',
            type: 'single',
            q: 'An IT service management platform must retrieve the device inventory from Catalyst Center using REST calls such as GET /dna/intent/api/v1/network-device. Which Catalyst Center API category is this?',
            choices: [
                'The southbound device API used to configure devices',
                'The northbound Intent API',
                'The events and notifications API that sends webhooks',
                'A NETCONF interface on Catalyst Center'
            ],
            answer: [1],
            explain: 'The northbound Intent API is a REST interface that external applications call to read data and request outcomes from Catalyst Center. Catalyst Center then uses its own southbound protocols to talk to devices.',
            why: [
                'Southbound interfaces are how Catalyst Center communicates with devices, not with external applications.',
                'Correct: /dna/intent/api paths belong to the northbound Intent API.',
                'Event notifications are pushed by Catalyst Center; this scenario is the client pulling data.',
                'The call shown is a REST request, not NETCONF.'
            ]
        },
        {
            id: 'encor-095',
            domain: '6',
            objective: '6.4',
            type: 'single',
            q: 'A script authenticates to the Catalyst SD-WAN Manager REST API by posting credentials to /j_security_check and receives a session cookie. Before sending POST or PUT requests, what else must it obtain and include?',
            choices: [
                'An XSRF token from /dataservice/client/token, sent in the X-XSRF-TOKEN header',
                'An X-Auth-Token obtained by posting to /dna/system/api/v1/auth/token with Basic authentication',
                'A NETCONF session ID from port 830',
                'An OMP session key from the SD-WAN Controller'
            ],
            answer: [0],
            explain: 'SD-WAN Manager uses a JSESSIONID session cookie after j_security_check. For requests that change data, it also requires an XSRF token retrieved from /dataservice/client/token and sent in the X-XSRF-TOKEN header.',
            why: [
                'Correct: modifying calls require the XSRF token header.',
                'That endpoint and header belong to Catalyst Center.',
                'NETCONF is a separate management protocol and is not part of REST authentication.',
                'OMP keys are internal control plane data and are not used for API access.'
            ]
        },
        {
            id: 'encor-096',
            domain: '6',
            objective: '6.5',
            type: 'single',
            q: 'GET https://192.0.2.1/restconf/data/ietf-interfaces:interfaces/interface=GigabitEthernet2\nAccept: application/yang-data+json\n\nHTTP/1.1 200 OK\n{\n  "ietf-interfaces:interface": {\n    "name": "GigabitEthernet2",\n    "type": "iana-if-type:ethernetCsmacd",\n    "enabled": false\n  }\n}\n\nWhat can you conclude?',
            choices: [
                'The request failed, because enabled is false',
                'The interface is up/up but has no IPv4 address',
                'RESTCONF is not allowed to manage this interface',
                'GigabitEthernet2 is configured with shutdown'
            ],
            answer: [3],
            explain: 'A 200 OK means the request succeeded and the body holds the data. In the ietf-interfaces configuration model, enabled false corresponds to an administratively shut down interface.',
            why: [
                'The 200 status shows the request succeeded; enabled is just a data value.',
                'enabled false means the interface is administratively down, not up/up.',
                'A permission problem would return an error status such as 401 or 403, not data.',
                'Correct: enabled false maps to shutdown.'
            ]
        },
        {
            id: 'encor-097',
            domain: '6',
            objective: '6.5',
            type: 'single',
            q: 'A script sends a POST to a Catalyst Center Intent API to start a device operation and receives:\n\nHTTP/1.1 202 Accepted\n{\n  "response": {\n    "taskId": "4bc5f2a4-1d2e-4a4b-9c3e-5f6a7b8c9d0e",\n    "url": "/api/v1/task/4bc5f2a4-1d2e-4a4b-9c3e-5f6a7b8c9d0e"\n  },\n  "version": "1.0"\n}\n\nWhat should the script do next?',
            choices: [
                'Treat the operation as complete, because 2xx means success',
                'Retry the POST, because 202 means the request was received but could not be processed',
                'Poll the task URL to learn whether the operation finished and whether it succeeded',
                'Request a new token, because 202 indicates the token is about to expire'
            ],
            answer: [2],
            explain: '202 Accepted means the request was queued for asynchronous processing. Catalyst Center returns a task ID, and the client polls the task API until the task completes, then checks for success or an error.',
            why: [
                '202 only confirms acceptance; the work may still fail.',
                '202 does not mean failure; retrying could start the operation twice.',
                'Correct: asynchronous operations are tracked through the task API.',
                'Token problems return 401, not 202.'
            ]
        },
        {
            id: 'encor-098',
            domain: '6',
            objective: '6.6',
            type: 'single',
            q: 'event manager applet SAVE-CONFIG\n event syslog pattern "%SYS-5-CONFIG_I"\n action 1.0 cli command "enable"\n action 2.0 cli command "write memory"\n\nWhat does this applet do?',
            choices: [
                'It saves the running configuration whenever a configuration change is logged',
                'It saves the configuration once at boot',
                'It blocks any further configuration changes until the running configuration has been saved',
                'It sends the configuration to a syslog server after each change'
            ],
            answer: [0],
            explain: 'The syslog event detector triggers when a message matches the pattern. %SYS-5-CONFIG_I is logged when someone leaves configuration mode, so the applet then runs enable and write memory to save the change.',
            why: [
                'Correct: each logged configuration change triggers a save.',
                'A boot-time action would use a different event, such as a timer or syslog boot message.',
                'A syslog event happens after the change; it cannot block it.',
                'write memory saves locally to NVRAM; it does not send anything to syslog.'
            ]
        },
        {
            id: 'encor-099',
            domain: '6',
            objective: '6.6',
            type: 'single',
            q: 'An engineer wants an EEM applet that prevents the reload command from running when someone types it at the CLI and prints a warning instead. Which event statement supports this?',
            choices: [
                'event syslog pattern "reload"',
                'event cli pattern "^reload" sync no skip yes',
                'event cli pattern "^reload" sync no skip no',
                'event timer watchdog time 60'
            ],
            answer: [1],
            explain: 'The CLI event detector matches commands as they are entered. With sync no and skip yes, the applet actions run and the matched command is not executed, so reload is blocked.',
            why: [
                'A syslog event occurs after something is logged and cannot stop the command.',
                'Correct: skip yes prevents the matched command from executing.',
                'skip no lets the reload command run after the applet is triggered.',
                'A watchdog timer runs periodically and is unrelated to typed commands.'
            ]
        },
        {
            id: 'encor-100',
            domain: '6',
            objective: '6.7',
            type: 'multi',
            q: 'A team is comparing Ansible with Puppet for network configuration management. Which two statements describe Ansible? (Choose two.)',
            choices: [
                'It is agentless and connects to managed devices over SSH or an API',
                'It requires a persistent agent installed on each managed node',
                'Managed nodes pull their configuration on a fixed schedule',
                'Playbooks are written in YAML',
                'Configuration is written as manifests in a Ruby-based DSL'
            ],
            answer: [0, 3],
            explain: 'Ansible is agentless and pushes changes from a control node over SSH, NETCONF, or APIs, which suits network devices that cannot run agents. Its playbooks are YAML. Puppet traditionally uses agents that pull catalogs and manifests written in its own DSL.',
            why: [
                'Correct: Ansible does not need an agent on managed devices.',
                'A persistent agent describes Puppet or Chef, not Ansible.',
                'A scheduled pull model describes Puppet agents.',
                'Correct: Ansible playbooks use YAML.',
                'Manifests in a Ruby-based DSL describe Puppet.'
            ]
        }
    ]
};
