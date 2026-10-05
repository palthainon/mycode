// CompTIA Security+ practice questions for oldweb.tech.
// Original questions written against the public exam objectives. Not affiliated with CompTIA.
window.CERT_BANK = {
    id: 'security-plus',
    vendor: 'CompTIA',
    exam: 'Security+',
    code: 'SY0-701',
    asOf: '2026-10',
    objectivesUrl: 'https://comptiacdn.azureedge.net/webcontent/docs/default-source/exam-objectives/comptia-security-sy0-701-exam-objectives-(6-0).pdf',
    domains: [
        { id: '1', name: 'General Security Concepts', weight: 12 },
        { id: '2', name: 'Threats, Vulnerabilities, and Mitigations', weight: 22 },
        { id: '3', name: 'Security Architecture', weight: 18 },
        { id: '4', name: 'Security Operations', weight: 28 },
        { id: '5', name: 'Security Program Management and Oversight', weight: 20 }
    ],
    questions: [
        {
            id: 'secplus-001',
            domain: '1',
            objective: '1.1',
            type: 'single',
            q: 'A company posts signs at every entrance stating that the premises are monitored by video cameras. Which control type do the signs primarily represent?',
            choices: [
                'Corrective',
                'Compensating',
                'Detective',
                'Deterrent'
            ],
            answer: [3],
            explain: 'Deterrent controls discourage a threat actor from attempting an attack. A warning sign does not stop or record anything by itself; it works by making the attempt look risky.',
            why: [
                'Corrective controls fix or limit damage after an event, such as restoring from backup.',
                'A compensating control substitutes for a primary control that cannot be implemented.',
                'The cameras themselves are detective; the warning sign is aimed at discouraging the act, not recording it.',
                'Correct: the signs are meant to discourage an attacker before an attempt is made.'
            ]
        },
        {
            id: 'secplus-002',
            domain: '1',
            objective: '1.1',
            type: 'single',
            q: 'A legacy controller cannot be patched because the vendor no longer supports it, so the team places it on an isolated VLAN reachable only from one management host. How is this isolation best classified?',
            choices: [
                'Directive control',
                'Compensating control',
                'Deterrent managerial control',
                'Preventive physical control'
            ],
            answer: [1],
            explain: 'A compensating control is an alternative safeguard used when the primary control (here, patching) is not feasible. It is chosen to reduce roughly the same risk.',
            why: [
                'Directive controls instruct people what to do, such as a policy or a sign saying "authorized personnel only".',
                'Correct: the isolation reduces the risk that the missing patch would have addressed.',
                'Network isolation is technical, and it limits access rather than merely discouraging attempts.',
                'VLAN isolation is a technical control, not a physical one.'
            ]
        },
        {
            id: 'secplus-003',
            domain: '1',
            objective: '1.1',
            type: 'single',
            q: 'Which of the following is the best example of a managerial security control?',
            choices: [
                'A documented risk assessment process',
                'Bollards installed outside the lobby',
                'A host-based firewall on each laptop',
                'Security awareness training delivered by staff'
            ],
            answer: [0],
            explain: 'Managerial (administrative) controls focus on governance and risk oversight, such as policies and risk assessments. Technical controls are enforced by systems, operational controls by people doing tasks, and physical controls by tangible barriers.',
            why: [
                'Correct: managerial controls are administrative oversight activities such as risk assessments and policies.',
                'Bollards are a physical control.',
                'A host firewall is a technical control enforced by software.',
                'Training delivered and carried out by people is usually classed as an operational control.'
            ]
        },
        {
            id: 'secplus-004',
            domain: '1',
            objective: '1.2',
            type: 'single',
            q: 'A hospital patient-records portal goes offline for six hours during a distributed denial-of-service attack. No data was read or altered. Which security principle was primarily affected?',
            choices: [
                'Non-repudiation',
                'Confidentiality',
                'Integrity',
                'Availability'
            ],
            answer: [3],
            explain: 'Availability means systems and data are accessible to authorized users when needed. DDoS attacks target availability by exhausting resources.',
            why: [
                'Non-repudiation is about proving who performed an action.',
                'Confidentiality concerns unauthorized disclosure, and no data was read.',
                'Integrity concerns unauthorized modification, and no data was altered.',
                'Correct: authorized users could not reach the system when they needed it.'
            ]
        },
        {
            id: 'secplus-005',
            domain: '1',
            objective: '1.2',
            type: 'single',
            q: 'A purchasing system must be able to prove that a specific manager approved an order, so that the manager cannot later deny approving it. Which mechanism best meets this requirement?',
            choices: [
                'Requiring TLS between the browser and the server',
                'Encrypting the order with a symmetric key shared by the team',
                'Storing a SHA-256 hash of the order in the database',
                'A digital signature created with the manager\'s private key'
            ],
            answer: [3],
            explain: 'Non-repudiation requires proof bound to a single identity. A digital signature uses a private key that only the signer holds, and anyone can verify it with the matching public key.',
            why: [
                'TLS protects data in transit; it does not create lasting proof of who approved the order.',
                'Anyone holding a shared symmetric key could have produced the ciphertext, so it cannot tie the action to one person.',
                'A hash shows the order was not changed, but it does not identify who approved it.',
                'Correct: only the holder of the private key could have produced the signature, which supports non-repudiation.'
            ]
        },
        {
            id: 'secplus-006',
            domain: '1',
            objective: '1.2',
            type: 'single',
            q: 'In a zero trust architecture, which component evaluates policy and makes the final decision to grant or deny a subject access to a resource?',
            choices: [
                'Policy engine',
                'Implicit trust zone',
                'Policy administrator',
                'Policy enforcement point'
            ],
            answer: [0],
            explain: 'Zero trust splits a control plane (policy engine and policy administrator) from a data plane (policy enforcement point). The policy engine decides, the administrator executes that decision, and the enforcement point enforces it on traffic.',
            why: [
                'Correct: the policy engine computes the access decision as part of the control plane.',
                'An implicit trust zone is the area behind the enforcement point; zero trust tries to make it as small as possible.',
                'The policy administrator acts on the engine\'s decision by setting up or tearing down the session; it does not make the decision itself.',
                'The policy enforcement point sits in the data plane and enables or blocks the connection based on the decision it receives.'
            ]
        },
        {
            id: 'secplus-007',
            domain: '1',
            objective: '1.2',
            type: 'single',
            q: 'A security team places a fake cloud access key in a private code repository. The key has no permissions, and any attempt to use it triggers an alert. What is this technique called?',
            choices: [
                'Honeytoken',
                'Honeypot',
                'DNS sinkhole',
                'Honeynet'
            ],
            answer: [0],
            explain: 'Honeytokens are deceptive data such as fake credentials or records. Legitimate users have no reason to touch them, so any use is a high-confidence alert.',
            why: [
                'Correct: a honeytoken is a fake piece of data whose use signals that someone found and tried to abuse it.',
                'A honeypot is a decoy system, not a single fake credential or record.',
                'A DNS sinkhole redirects lookups for malicious domains; it does not plant fake data.',
                'A honeynet is a network of decoy systems.'
            ]
        },
        {
            id: 'secplus-008',
            domain: '1',
            objective: '1.3',
            type: 'single',
            q: 'A change advisory board will not approve a core router upgrade until the engineer documents how to restore the previous firmware and configuration if the upgrade fails. What is the board asking for?',
            choices: [
                'An impact analysis',
                'A standard operating procedure',
                'A backout plan',
                'A maintenance window'
            ],
            answer: [2],
            explain: 'A backout (rollback) plan is a required part of change management so that a failed change can be reversed quickly with minimal downtime.',
            why: [
                'An impact analysis estimates what the change will affect; it does not describe how to reverse it.',
                'An SOP describes how a routine task is normally done, not how to reverse one specific change.',
                'Correct: a backout plan describes how to return to the last known good state.',
                'A maintenance window is the approved time to make the change.'
            ]
        },
        {
            id: 'secplus-009',
            domain: '1',
            objective: '1.3',
            type: 'single',
            q: 'After an approved update to an accounting application, the application stops launching on every workstation. Endpoint logs show the new executable is being blocked. Which technical implication of the change was most likely overlooked?',
            choices: [
                'The server needed a dependency on a legacy operating system',
                'The change did not include a stakeholder sign-off',
                'The application allow list was not updated for the new executable',
                'The firewall rules required a restart of the application service'
            ],
            answer: [2],
            explain: 'Allow lists and deny lists are a common technical side effect of change. Updating the binary changes its hash, so allow-list entries must be updated as part of the change.',
            why: [
                'Nothing indicates a legacy OS dependency; the logs point to a block on the executable.',
                'Missing sign-off is a process gap, but it would not cause endpoints to block the file.',
                'Correct: application allow lists often match by hash or path, so a new binary must be added or it is blocked.',
                'Firewall rules control network traffic, not whether a local executable may run.'
            ]
        },
        {
            id: 'secplus-010',
            domain: '1',
            objective: '1.4',
            type: 'single',
            q: 'Why is a unique random salt added to each password before it is hashed?',
            choices: [
                'So identical passwords hash differently, defeating precomputed tables',
                'So the stored hash no longer needs access control on the database',
                'So administrators can reverse the hash during a forgotten-password recovery',
                'So the hash function runs faster when users log in'
            ],
            answer: [0],
            explain: 'A salt is random data combined with the password before hashing and stored alongside the hash. It forces an attacker to crack each hash separately instead of using precomputed tables.',
            why: [
                'Correct: salting makes each hash unique, which defeats rainbow tables and hides reused passwords.',
                'Password hashes still need to be protected even when salted.',
                'Hashes are one-way; a salt does not make them reversible.',
                'A salt does not speed hashing; password hashing is often intentionally slow.'
            ]
        },
        {
            id: 'secplus-011',
            domain: '1',
            objective: '1.4',
            type: 'multi',
            q: 'Which of the following are asymmetric encryption algorithms? (Choose two.)',
            choices: [
                'SHA-256',
                'RSA',
                'Elliptic curve cryptography (ECC)',
                'Blowfish',
                'AES'
            ],
            answer: [1, 2],
            explain: 'Asymmetric algorithms use a mathematically related public and private key pair. RSA and ECC are asymmetric; AES and Blowfish are symmetric ciphers, and SHA-256 is a hash.',
            why: [
                'SHA-256 is a hashing algorithm, not an encryption algorithm.',
                'Correct: RSA uses a public and private key pair.',
                'Correct: ECC is an asymmetric approach based on elliptic curves and uses smaller keys than RSA for similar strength.',
                'Blowfish is a symmetric block cipher.',
                'AES is a symmetric block cipher using one shared key.'
            ]
        },
        {
            id: 'secplus-012',
            domain: '1',
            objective: '1.4',
            type: 'single',
            q: 'A web administrator needs one certificate that will be valid for www.example.com, shop.example.com, and any new first-level subdomains of example.com created later. Which type of certificate fits best?',
            choices: [
                'A certificate with a single common name of www.example.com',
                'A code-signing certificate issued to example.com',
                'A wildcard certificate for *.example.com',
                'A self-signed certificate for example.com'
            ],
            answer: [2],
            explain: 'A wildcard certificate such as *.example.com matches any one subdomain label. A SAN certificate lists names explicitly, so it would need to be reissued for each new subdomain.',
            why: [
                'A single common name would cover only www.example.com.',
                'Code-signing certificates sign software; they are not used for TLS on web servers.',
                'Correct: a wildcard covers any single label in place of the asterisk, including future subdomains.',
                'A self-signed certificate is not trusted by browsers by default, and this one would only name example.com.'
            ]
        },
        {
            id: 'secplus-013',
            domain: '2',
            objective: '2.1',
            type: 'single',
            q: 'A threat group with large funding and custom malware maintains stealthy access to defense contractors for months, collecting engineering data. Which threat actor type best fits this description?',
            choices: [
                'Unskilled attacker',
                'Nation-state',
                'Hacktivist',
                'Insider threat'
            ],
            answer: [1],
            explain: 'Nation-state actors have high sophistication and resources and are often motivated by espionage. Their campaigns are frequently called advanced persistent threats (APTs).',
            why: [
                'Unskilled attackers rely on existing tools and lack the resources for custom, long-running campaigns.',
                'Correct: long-term, well-funded espionage campaigns are typical of nation-state actors.',
                'Hacktivists usually seek publicity for a cause, often through defacement or leaks, rather than quiet long-term collection.',
                'Nothing indicates the actor is an employee or other trusted insider.'
            ]
        },
        {
            id: 'secplus-014',
            domain: '2',
            objective: '2.1',
            type: 'single',
            q: 'The marketing department signs up for an unapproved online file-sharing service with a company credit card and begins storing customer lists there. What does this situation describe?',
            choices: [
                'Shadow IT',
                'Organized crime',
                'Supply chain compromise',
                'Hacktivism'
            ],
            answer: [0],
            explain: 'Shadow IT is not usually malicious, but it creates unmanaged risk because the service has not been vetted and is not monitored by security.',
            why: [
                'Correct: shadow IT is technology adopted without the approval or oversight of the IT or security team.',
                'Organized crime refers to external financially motivated groups, not internal employees.',
                'No vendor or supplier has been compromised; staff simply chose an unsanctioned service.',
                'Hacktivism is attacking for an ideological cause.'
            ]
        },
        {
            id: 'secplus-015',
            domain: '2',
            objective: '2.1',
            type: 'single',
            q: 'Which motivation is most commonly associated with hacktivists?',
            choices: [
                'Testing defenses under contract',
                'Financial gain',
                'Philosophical or political beliefs',
                'Corporate espionage for a competitor'
            ],
            answer: [2],
            explain: 'Hacktivists are motivated by ideology. Common tactics include defacing sites, leaking data, and disrupting services to draw attention to a cause.',
            why: [
                'Contracted testing describes authorized penetration testers, not hacktivists.',
                'Financial gain is typical of organized crime and many ransomware groups.',
                'Correct: hacktivists attack to promote a cause or ideology.',
                'Espionage for a competitor is more associated with competitors or nation-states.'
            ]
        },
        {
            id: 'secplus-016',
            domain: '2',
            objective: '2.2',
            type: 'single',
            q: 'Several employees receive text messages claiming a package could not be delivered and asking them to tap a link to reschedule. The link leads to a credential-harvesting page. Which attack is this?',
            choices: [
                'Whaling',
                'Smishing',
                'Vishing',
                'Pharming'
            ],
            answer: [1],
            explain: 'Smishing (SMS phishing) uses text messages to lure victims to malicious links or to call fraudulent numbers.',
            why: [
                'Whaling targets senior executives specifically, not staff at large.',
                'Correct: smishing is phishing delivered by SMS text message.',
                'Vishing uses voice calls.',
                'Pharming redirects users to a fake site by tampering with DNS or host files, not by sending a link.'
            ]
        },
        {
            id: 'secplus-017',
            domain: '2',
            objective: '2.2',
            type: 'single',
            q: 'Attackers learn that engineers at a target company often visit a small industry forum. They compromise the forum and plant an exploit that runs when it is visited. Which attack is this?',
            choices: [
                'Business email compromise',
                'Brand impersonation',
                'Watering hole',
                'Typosquatting'
            ],
            answer: [2],
            explain: 'In a watering hole attack, the attacker waits for victims at a place they regularly go, rather than contacting them directly.',
            why: [
                'Business email compromise uses a hijacked or spoofed business mailbox to commit fraud.',
                'Brand impersonation pretends to be a known company; here a real site was compromised.',
                'Correct: a watering hole attack compromises a site the target group already trusts and visits.',
                'Typosquatting relies on users mistyping a domain name.'
            ]
        },
        {
            id: 'secplus-018',
            domain: '2',
            objective: '2.2',
            type: 'single',
            q: 'A managed service provider\'s remote management platform is breached, and attackers use it to push ransomware to dozens of the provider\'s customers. Which threat vector does this represent for the customers?',
            choices: [
                'Removable media',
                'Watering hole',
                'Pretexting',
                'Supply chain'
            ],
            answer: [3],
            explain: 'Supply chain attacks abuse trusted relationships with vendors, MSPs, or software suppliers. MSPs are attractive targets because one breach gives access to many customers.',
            why: [
                'No removable media such as USB drives was involved.',
                'A watering hole compromises a website the victims visit; this was a management platform with privileged access.',
                'Pretexting is a social engineering technique based on a made-up story.',
                'Correct: the customers were attacked through a trusted service provider in their supply chain.'
            ]
        },
        {
            id: 'secplus-019',
            domain: '2',
            objective: '2.2',
            type: 'single',
            q: 'Why is Telnet considered an unsecure protocol for managing network devices?',
            choices: [
                'It runs over UDP, so its traffic is easily spoofed',
                'It sends credentials and session data in cleartext',
                'It has no way to prompt the user for a password',
                'It only works on TCP port 22, which is heavily scanned'
            ],
            answer: [1],
            explain: 'Telnet provides no encryption. SSH should be used instead because it encrypts the session, including authentication.',
            why: [
                'Telnet runs over TCP, not UDP.',
                'Correct: anyone who can capture the traffic can read the username, password, and commands.',
                'Telnet sessions can prompt for a login and password; the problem is that they are not encrypted.',
                'Telnet uses TCP port 23; port 22 is SSH.'
            ]
        },
        {
            id: 'secplus-020',
            domain: '2',
            objective: '2.2',
            type: 'single',
            q: 'A caller says she is from the IT help desk running a mailbox audit. She mentions the employee\'s manager by name and asks the employee to read back the code from their authenticator app. Which technique is the caller primarily using?',
            choices: [
                'Pretexting',
                'Smishing',
                'Whaling',
                'Shoulder surfing'
            ],
            answer: [0],
            explain: 'Pretexting builds a believable story, often with real names or details, so the victim trusts the request. Here it is delivered by phone, which is also vishing.',
            why: [
                'Correct: pretexting uses an invented scenario and believable details to get the victim to cooperate.',
                'Smishing uses text messages, not phone calls.',
                'Whaling targets senior executives; nothing suggests the employee is one.',
                'Shoulder surfing is watching someone enter information in person.'
            ]
        },
        {
            id: 'secplus-021',
            domain: '2',
            objective: '2.3',
            type: 'single',
            q: 'A tester enters \' OR 1=1 -- into a login form, and the application returns every user record. Which vulnerability is present?',
            choices: [
                'Cross-site scripting',
                'Buffer overflow',
                'Directory traversal',
                'SQL injection'
            ],
            answer: [3],
            explain: 'SQL injection occurs when user input is placed directly into a query. Parameterized queries and input validation are the main defenses.',
            why: [
                'Cross-site scripting injects script that runs in a user\'s browser, not database logic.',
                'A buffer overflow writes past the end of a memory buffer.',
                'Directory traversal uses sequences like ../ to reach files outside the web root.',
                'Correct: the input changed the logic of the database query, which is SQL injection.'
            ]
        },
        {
            id: 'secplus-022',
            domain: '2',
            objective: '2.3',
            type: 'single',
            q: 'A privileged program checks that a user may write to a file, and then opens the file a moment later. An attacker swaps the file for a link to a system file between the check and the open. What type of vulnerability is this?',
            choices: [
                'Buffer overflow',
                'Cross-site request forgery',
                'TOCTOU race condition',
                'Memory leak'
            ],
            answer: [2],
            explain: 'A time-of-check to time-of-use (TOCTOU) race condition exploits the gap between checking a resource and using it. Fixes include atomic operations and opening the file once, then checking the open handle.',
            why: [
                'A buffer overflow writes data beyond allocated memory; no memory boundary is involved here.',
                'CSRF tricks a logged-in browser into sending a request; this is a local file attack.',
                'Correct: the condition checked is no longer true when the resource is used.',
                'A memory leak fails to release memory; it does not let an attacker swap files.'
            ]
        },
        {
            id: 'secplus-023',
            domain: '2',
            objective: '2.3',
            type: 'single',
            q: 'Which vulnerability allows code running inside a guest virtual machine to break out and interact with the hypervisor or other guests on the same host?',
            choices: [
                'Side loading',
                'Resource reuse',
                'VM escape',
                'Jailbreaking'
            ],
            answer: [2],
            explain: 'VM escape is especially serious in shared environments because one compromised guest could reach others. Patching the hypervisor is the main defense.',
            why: [
                'Side loading is installing apps from outside an official app store.',
                'Resource reuse is when memory or storage given to a new VM still holds another VM\'s data.',
                'Correct: VM escape breaks the isolation between a guest and the host.',
                'Jailbreaking removes restrictions on a mobile device operating system.'
            ]
        },
        {
            id: 'secplus-024',
            domain: '2',
            objective: '2.3',
            type: 'single',
            q: 'A user installs a mobile app by downloading the package from a website instead of the official app store. What is this practice called?',
            choices: [
                'Side loading',
                'Rooting',
                'Jailbreaking',
                'Bluejacking'
            ],
            answer: [0],
            explain: 'Side loaded apps skip the review that official stores perform, which increases the chance of installing malware. MDM can block it on managed devices.',
            why: [
                'Correct: side loading installs apps from outside the official store, bypassing store vetting.',
                'Rooting gains root access on Android; installing a package from a website does not require it.',
                'Jailbreaking removes iOS restrictions; it may make side loading possible but is a separate act.',
                'Bluejacking sends unsolicited messages over Bluetooth.'
            ]
        },
        {
            id: 'secplus-025',
            domain: '2',
            objective: '2.3',
            type: 'single',
            q: 'An attacker posts a forum comment that contains a script. The forum saves the comment, and the script runs in the browser of every user who views the thread. What type of attack is this?',
            choices: [
                'Cross-site request forgery',
                'SQL injection',
                'Reflected cross-site scripting',
                'Stored cross-site scripting'
            ],
            answer: [3],
            explain: 'Stored (persistent) XSS is saved by the application and served to other users. Output encoding and input validation are the key defenses.',
            why: [
                'CSRF makes a victim\'s browser send an unwanted request; it does not inject script into a page.',
                'SQL injection targets the database query, not the user\'s browser.',
                'Reflected XSS returns the script immediately in a response, usually from a crafted link, and is not saved.',
                'Correct: the script is saved on the server and delivered to every viewer.'
            ]
        },
        {
            id: 'secplus-026',
            domain: '2',
            objective: '2.4',
            type: 'single',
            q: 'Authentication logs show one IP address trying the password Autumn2026! once against each of 400 different accounts, then moving on. Which attack is most likely taking place?',
            choices: [
                'Pass-the-hash',
                'Brute-force attack on a single account',
                'Password spraying',
                'Credential stuffing'
            ],
            answer: [2],
            explain: 'Password spraying stays under lockout thresholds by trying a few common passwords across many accounts. MFA and banned-password lists are effective defenses.',
            why: [
                'Pass-the-hash reuses a captured hash rather than guessing a password.',
                'A brute-force attack makes many guesses against one account, which would trigger lockouts.',
                'Correct: spraying tries one common password across many accounts to avoid lockouts.',
                'Credential stuffing uses username and password pairs leaked from other breaches, so the passwords would differ.'
            ]
        },
        {
            id: 'secplus-027',
            domain: '2',
            objective: '2.4',
            type: 'single',
            q: 'A user signs out of a session from an office in Chicago. Twenty minutes later the same account signs in from Singapore. Which indicator does this represent?',
            choices: [
                'Impossible travel',
                'Concurrent session usage',
                'Resource inaccessibility',
                'Out-of-cycle logging'
            ],
            answer: [0],
            explain: 'Impossible travel compares location and timing of logins. It often indicates stolen credentials, though VPNs can cause false positives.',
            why: [
                'Correct: no one can travel that distance in twenty minutes, so the account is likely being used by someone else.',
                'The first session ended before the second began, so the sessions were not concurrent.',
                'Resource inaccessibility means users or systems cannot reach resources they normally can.',
                'Out-of-cycle logging refers to log events at unexpected times or gaps in logging.'
            ]
        },
        {
            id: 'secplus-028',
            domain: '2',
            objective: '2.4',
            type: 'single',
            q: 'A file server suddenly shows heavy disk activity, thousands of files are renamed with a new extension, and a text file appears in each folder demanding cryptocurrency. What is the most likely cause?',
            choices: [
                'Spyware',
                'Ransomware',
                'Rootkit',
                'Logic bomb'
            ],
            answer: [1],
            explain: 'Ransomware encrypts data and demands payment. Offline, tested backups are the most important recovery control.',
            why: [
                'Spyware tries to stay hidden while collecting data, not announce itself.',
                'Correct: mass encryption with renamed files and a payment note is the classic sign of ransomware.',
                'A rootkit hides its presence; it does not encrypt files and leave notes.',
                'A logic bomb triggers on a condition; this pattern of encryption and a ransom note points to ransomware.'
            ]
        },
        {
            id: 'secplus-029',
            domain: '2',
            objective: '2.4',
            type: 'single',
            q: 'On several hosts in one subnet, the ARP cache maps the default gateway\'s IP address to the MAC address of an ordinary workstation. What is the most likely explanation?',
            choices: [
                'ARP poisoning to perform an on-path attack',
                'A rogue DHCP server handing out addresses',
                'MAC flooding of the switch',
                'DNS cache poisoning'
            ],
            answer: [0],
            explain: 'ARP poisoning sends forged ARP replies so traffic for the gateway flows through the attacker. Dynamic ARP inspection on switches helps prevent it.',
            why: [
                'Correct: forged ARP replies make victims send gateway traffic to the attacker\'s machine.',
                'A rogue DHCP server could hand out a wrong gateway IP, but here the real gateway IP is mapped to the wrong MAC.',
                'MAC flooding overflows the switch\'s MAC table; it does not change host ARP caches.',
                'DNS poisoning changes name-to-IP mappings, not IP-to-MAC mappings.'
            ]
        },
        {
            id: 'secplus-030',
            domain: '2',
            objective: '2.4',
            type: 'single',
            q: 'Web server logs show many requests containing strings such as ../../../../etc/passwd in a file parameter. What is the attacker attempting?',
            choices: [
                'Directory traversal',
                'Cross-site request forgery',
                'SQL injection',
                'Server-side request forgery'
            ],
            answer: [0],
            explain: 'Directory (path) traversal tries to read files outside the intended directory. Canonicalizing paths and validating input against an allow list prevents it.',
            why: [
                'Correct: ../ sequences try to climb out of the web directory to read other files.',
                'CSRF abuses an authenticated user\'s browser; it does not use path sequences.',
                'SQL injection uses database syntax such as quotes and OR clauses.',
                'SSRF makes the server send requests to other URLs or internal services.'
            ]
        },
        {
            id: 'secplus-031',
            domain: '2',
            objective: '2.4',
            type: 'multi',
            q: 'An analyst is reviewing account activity for signs of compromise. Which two observations are the strongest indicators? (Choose two.)',
            choices: [
                'A user changing their desktop wallpaper',
                'A password change made when the 90-day expiry prompt appeared',
                'A login from the user\'s assigned laptop at 9 a.m. on a workday',
                'A burst of failed logins from an unfamiliar IP followed by an account lockout',
                'Repeated successful logins at 3 a.m. for a user who only works days'
            ],
            answer: [3, 4],
            explain: 'Indicators of compromise often show up as deviations from normal behavior. Account lockouts and logins at unusual times are both listed indicators of malicious activity.',
            why: [
                'Changing a wallpaper is normal user behavior.',
                'A password change prompted by policy is expected activity.',
                'A login from the assigned device during normal hours matches the baseline.',
                'Correct: an account lockout after a burst of failures suggests someone is guessing the password.',
                'Correct: activity far outside the user\'s normal pattern is a common sign that someone else is using the account.'
            ]
        },
        {
            id: 'secplus-032',
            domain: '2',
            objective: '2.5',
            type: 'single',
            q: 'A plant\'s industrial controllers are reachable from the office network, and leadership worries that ransomware on a workstation could spread to them. Which mitigation best addresses this concern?',
            choices: [
                'Deploy a honeypot on the office network',
                'Increase password length requirements for office users',
                'Enable full-disk encryption on the industrial controllers',
                'Segment the networks and filter traffic between them'
            ],
            answer: [3],
            explain: 'Segmentation divides a network into zones with controlled traffic between them. It limits the blast radius of an incident and is a key protection for OT systems.',
            why: [
                'A honeypot may detect attackers but does not block traffic to the controllers.',
                'Longer passwords help against guessing but do not stop malware already on a workstation.',
                'Encryption protects data at rest; it does not stop ransomware traveling over the network.',
                'Correct: segmentation limits which systems can talk to the controllers, stopping lateral spread.'
            ]
        },
        {
            id: 'secplus-033',
            domain: '2',
            objective: '2.5',
            type: 'single',
            q: 'Developers have local administrator rights on their laptops, and a recent malware infection installed a kernel driver on one of them. Which mitigation would most directly reduce this risk?',
            choices: [
                'Apply least privilege by removing local admin rights',
                'Change the default listening ports of services on the laptops',
                'Increase the logging level on the laptops',
                'Encrypt the laptops\' hard drives'
            ],
            answer: [0],
            explain: 'Least privilege limits users to the rights they need. Admin rights can be granted temporarily when needed instead of being permanent.',
            why: [
                'Correct: without admin rights, malware running as the user cannot install drivers.',
                'Changing listening ports does not stop a user-launched program from installing a driver.',
                'More logging may help detect the problem but does not prevent it.',
                'Disk encryption protects data if the laptop is lost, not against malware running as the user.'
            ]
        },
        {
            id: 'secplus-034',
            domain: '2',
            objective: '2.5',
            type: 'multi',
            q: 'Which two actions are appropriate hardening steps for a newly built Linux server? (Choose two.)',
            choices: [
                'Install a full desktop environment for easier administration',
                'Allow root SSH login with a password for emergency access',
                'Remove or disable unnecessary services and packages',
                'Change all default credentials',
                'Disable the host firewall because a network firewall exists'
            ],
            answer: [2, 3],
            explain: 'Hardening reduces attack surface and removes known weaknesses. Removing unneeded software and changing defaults are two of the most basic steps.',
            why: [
                'A desktop environment adds packages and services that increase attack surface on a server.',
                'Direct root login with a password increases risk; use named accounts with sudo and key-based SSH.',
                'Correct: fewer running services means a smaller attack surface.',
                'Correct: default credentials are widely published and easily guessed.',
                'Host firewalls add defense in depth, including against threats from inside the network.'
            ]
        },
        {
            id: 'secplus-035',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'In an Infrastructure as a Service (IaaS) deployment, who is normally responsible for patching the guest operating system on a virtual machine?',
            choices: [
                'The hypervisor vendor',
                'Responsibility is always split evenly under the SLA',
                'The cloud provider',
                'The customer'
            ],
            answer: [3],
            explain: 'Under the shared responsibility model, the customer\'s duties grow as you move from SaaS to PaaS to IaaS. In IaaS, the customer owns the OS, applications, and data.',
            why: [
                'The hypervisor vendor patches the hypervisor, not guest operating systems.',
                'A responsibility matrix assigns specific duties; it does not split each task evenly.',
                'The provider secures the physical hosts, network, and hypervisor, not the customer\'s guest OS.',
                'Correct: in IaaS the customer manages the OS and everything installed on it.'
            ]
        },
        {
            id: 'secplus-036',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'A team wants to run code only when an event occurs, such as a file upload, without managing any servers or operating systems. Which architecture model fits this requirement?',
            choices: [
                'Virtualization',
                'Containerization',
                'Infrastructure as code',
                'Serverless'
            ],
            answer: [3],
            explain: 'In serverless computing, the provider runs and scales the platform, and the customer supplies only code and configuration. Security focus shifts to code, permissions, and event inputs.',
            why: [
                'Virtualization still requires the team to manage VMs and guest operating systems.',
                'Containers still require a host and orchestration that someone must manage.',
                'Infrastructure as code defines infrastructure in files; it does not by itself remove server management.',
                'Correct: serverless runs functions on demand, and the provider manages the underlying servers.'
            ]
        },
        {
            id: 'secplus-037',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'Why are industrial control systems (ICS) and SCADA systems often difficult to patch promptly?',
            choices: [
                'They cannot accept software updates of any kind',
                'Downtime is costly, and changes may need vendor certification',
                'Their encryption prevents any changes to firmware',
                'They are always air-gapped, so vendor updates can never reach them'
            ],
            answer: [1],
            explain: 'ICS/SCADA systems control physical processes and prioritize availability and safety. Compensating controls such as segmentation are common when patching must wait.',
            why: [
                'Many ICS components can be updated; the challenge is scheduling and testing, not impossibility.',
                'Correct: downtime can halt physical processes, and vendors may only support tested configurations.',
                'Encryption is not what blocks patching; operational and vendor constraints are.',
                'Many ICS networks are connected to business networks, which is part of why they are at risk.'
            ]
        },
        {
            id: 'secplus-038',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'What is a main security benefit of managing cloud infrastructure with infrastructure as code (IaC)?',
            choices: [
                'It removes the need for a change management process',
                'Responsibility for configuration moves to the cloud provider',
                'Configurations are consistent and reviewable before deployment',
                'Deployed workloads are guaranteed to have no vulnerabilities'
            ],
            answer: [2],
            explain: 'IaC reduces configuration drift and manual error. Because templates live in version control, changes can be reviewed, tested, and rolled back.',
            why: [
                'IaC changes should still go through change management, often through code review.',
                'The customer still owns the configuration; IaC is just a way of expressing it.',
                'Correct: templates produce the same configuration every time and can be version-controlled and reviewed.',
                'IaC can still deploy vulnerable software or settings if the templates are wrong.'
            ]
        },
        {
            id: 'secplus-039',
            domain: '3',
            objective: '3.1',
            type: 'single',
            q: 'Which architecture separates the network control plane from the data plane so that forwarding decisions can be managed centrally through software?',
            choices: [
                'Air-gapped networking',
                'Network address translation (NAT)',
                'Microservices',
                'Software-defined networking (SDN)'
            ],
            answer: [3],
            explain: 'SDN moves routing and policy decisions to a central controller. This allows consistent, programmable policy, but the controller itself becomes a high-value target.',
            why: [
                'An air gap physically isolates a network; it is not a management architecture.',
                'NAT translates addresses; it does not separate control and data planes.',
                'Microservices is an application design pattern, not a network control model.',
                'Correct: SDN centralizes control in a controller that programs the forwarding devices.'
            ]
        },
        {
            id: 'secplus-040',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'A hospital places an inline intrusion prevention system between two network segments. Leadership requires that clinical traffic keep flowing if the IPS hardware fails. How should the device be configured?',
            choices: [
                'Active/passive clustering with no bypass',
                'Fail-closed',
                'Fail-open',
                'Passive monitoring through a SPAN port'
            ],
            answer: [2],
            explain: 'Fail-open favors availability, and fail-closed favors security. Which to choose depends on the business impact of an outage versus uninspected traffic.',
            why: [
                'Clustering helps but without a bypass, a failure of both units would still block traffic.',
                'Fail-closed blocks all traffic on failure, which would stop clinical systems.',
                'Correct: fail-open lets traffic pass if the device fails, preserving availability.',
                'A SPAN port would take the device out of line, but the requirement is to keep it inline.'
            ]
        },
        {
            id: 'secplus-041',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'Administrators must reach servers in a restricted zone only by first connecting to one hardened, heavily logged host and then connecting onward from it. What is this host called?',
            choices: [
                'Load balancer',
                'VPN concentrator',
                'Jump server',
                'Reverse proxy'
            ],
            answer: [2],
            explain: 'A jump server (jump box) concentrates administrative access through one monitored point. It should be hardened, require MFA, and log every session.',
            why: [
                'A load balancer spreads traffic across servers.',
                'A VPN concentrator terminates many VPN tunnels; it does not act as a hardened admin workstation inside the zone.',
                'Correct: a jump server is the controlled entry point for administrative access to a secure zone.',
                'A reverse proxy forwards client requests to internal web servers, not admin sessions.'
            ]
        },
        {
            id: 'secplus-042',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'A company needs to protect a public web application from attacks such as SQL injection and cross-site scripting by inspecting HTTP requests. Which control is best suited?',
            choices: [
                'Network access control (NAC)',
                'Web application firewall (WAF)',
                'Site-to-site VPN',
                'Stateful layer 4 firewall'
            ],
            answer: [1],
            explain: 'A WAF works at layer 7 and understands HTTP. It is commonly placed in front of web servers to filter injection and scripting attacks.',
            why: [
                'NAC decides whether devices may join the internal network.',
                'Correct: a WAF inspects HTTP content and blocks common web application attacks.',
                'A VPN encrypts traffic between sites; it does not inspect web requests for attacks.',
                'A layer 4 firewall filters by IP, port, and connection state, not by HTTP content.'
            ]
        },
        {
            id: 'secplus-043',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'In an 802.1X deployment for wired switch ports, which role does the switch perform?',
            choices: [
                'Certificate authority',
                'Authenticator',
                'Authentication server',
                'Supplicant'
            ],
            answer: [1],
            explain: '802.1X has three roles: supplicant (client), authenticator (switch or access point), and authentication server (usually RADIUS). The port stays blocked until authentication succeeds.',
            why: [
                'A CA issues certificates; it does not take part in each 802.1X exchange.',
                'Correct: the switch relays credentials and opens the port only after the server approves.',
                'The authentication server, often RADIUS, makes the decision.',
                'The supplicant is the client device requesting access.'
            ]
        },
        {
            id: 'secplus-044',
            domain: '3',
            objective: '3.2',
            type: 'single',
            q: 'Two offices are connected by a VPN that must encrypt the entire original IP packet, including its header, and add a new header between the gateways. Which mode is being used?',
            choices: [
                'Authentication Header (AH) only',
                'IPsec tunnel mode',
                'IPsec transport mode',
                'GRE without IPsec'
            ],
            answer: [1],
            explain: 'IPsec tunnel mode is typical for site-to-site VPNs between gateways. Transport mode is more common for host-to-host protection.',
            why: [
                'AH provides integrity and authentication but does not encrypt.',
                'Correct: tunnel mode encrypts the whole original packet and wraps it in a new IP header.',
                'Transport mode protects the payload but keeps the original IP header.',
                'GRE encapsulates packets but does not encrypt them.'
            ]
        },
        {
            id: 'secplus-045',
            domain: '3',
            objective: '3.2',
            type: 'multi',
            q: 'Which two capabilities distinguish a next-generation firewall (NGFW) from a basic stateful firewall? (Choose two.)',
            choices: [
                'Filtering only on source and destination IP and port',
                'Requiring all traffic to be routed through a cloud provider',
                'Identifying applications regardless of the port they use',
                'Operating only at layer 2 as a transparent bridge',
                'Integrated intrusion prevention'
            ],
            answer: [2, 4],
            explain: 'NGFWs add deep packet inspection, application awareness, and often IPS and user identity to stateful filtering.',
            why: [
                'Filtering only on IP and port describes a basic packet filter or stateful firewall.',
                'NGFWs can be on-premises appliances; cloud routing is not required.',
                'Correct: NGFWs inspect traffic to identify the actual application, not just the port.',
                'Many firewalls can run in transparent mode, but that is not what defines an NGFW.',
                'Correct: NGFWs commonly include IPS functions in the same device.'
            ]
        },
        {
            id: 'secplus-046',
            domain: '3',
            objective: '3.3',
            type: 'single',
            q: 'Customer data is loaded into a server\'s RAM while an application calculates totals. Which data state is this?',
            choices: [
                'Data at rest',
                'Data in archive',
                'Data in use',
                'Data in transit'
            ],
            answer: [2],
            explain: 'The three common data states are at rest, in transit, and in use. Data in use is the hardest to protect; secure enclaves are one approach.',
            why: [
                'Data at rest is stored on disk or other media.',
                'Archived data is a form of data at rest, not an active state.',
                'Correct: data being actively processed in memory or the CPU is in use.',
                'Data in transit is moving across a network.'
            ]
        },
        {
            id: 'secplus-047',
            domain: '3',
            objective: '3.3',
            type: 'single',
            q: 'A payment processor replaces card numbers with random values in its systems and keeps the mapping back to the real numbers in a separate, tightly controlled vault. Which technique is this?',
            choices: [
                'Steganography',
                'Hashing',
                'Data masking',
                'Tokenization'
            ],
            answer: [3],
            explain: 'Tokens have no mathematical link to the original data, so stolen tokens are useless without the vault. Tokenization can reduce the number of systems in scope for payment card audits.',
            why: [
                'Steganography hides data inside other data, such as an image.',
                'Hashing is one-way and has no vault for recovering the original value.',
                'Masking hides part of a value, such as showing only the last four digits, but does not use a vault mapping.',
                'Correct: tokenization swaps sensitive values for tokens that map back only through a secure vault.'
            ]
        },
        {
            id: 'secplus-048',
            domain: '3',
            objective: '3.3',
            type: 'single',
            q: 'A company is considering storing European customer data in a data center in another country and is told the data would then be subject to that country\'s laws. Which concept is being raised?',
            choices: [
                'Data sovereignty',
                'Data ownership',
                'Data retention',
                'Data classification'
            ],
            answer: [0],
            explain: 'Data sovereignty and related geographic restrictions affect where cloud data may be stored and processed. Regulations may require data to stay in certain regions.',
            why: [
                'Correct: data sovereignty means data is subject to the laws of the country where it is located.',
                'Ownership identifies who is accountable for the data inside the organization.',
                'Retention covers how long data is kept.',
                'Classification labels data by sensitivity.'
            ]
        },
        {
            id: 'secplus-049',
            domain: '3',
            objective: '3.3',
            type: 'single',
            q: 'A company wants DLP to block engineering design files from being emailed outside the company. Which step must happen first so that the DLP system can recognize these files?',
            choices: [
                'Move the files to a different country',
                'Place the engineering team on its own VLAN',
                'Hash every file in the engineering share',
                'Classify and label the design data'
            ],
            answer: [3],
            explain: 'Data classification assigns sensitivity labels, which other controls such as DLP and access control then enforce.',
            why: [
                'Moving data between countries is a sovereignty decision and does not help DLP identify it.',
                'VLANs separate network traffic but do not tell DLP which files are sensitive.',
                'Hashing can help match exact files, but files change; classification is the basis for policy.',
                'Correct: DLP needs labels or defined patterns to know which data is sensitive.'
            ]
        },
        {
            id: 'secplus-050',
            domain: '3',
            objective: '3.4',
            type: 'single',
            q: 'A business needs a recovery site that can take over within minutes, with equipment running and data replicated in near real time. Which type of site meets this need?',
            choices: [
                'Cold site',
                'Hot site',
                'Mobile site',
                'Warm site'
            ],
            answer: [1],
            explain: 'Hot sites cost the most and recover the fastest. Choosing a site type is a trade-off between cost and recovery time.',
            why: [
                'A cold site has space and power but little or no equipment, so recovery takes days or weeks.',
                'Correct: a hot site is fully equipped and current, so failover is fast.',
                'A mobile site is portable but usually needs setup time and is not kept in real-time sync.',
                'A warm site has some equipment but needs time to load data and configure systems.'
            ]
        },
        {
            id: 'secplus-051',
            domain: '3',
            objective: '3.4',
            type: 'multi',
            q: 'A web application currently runs on a single server. Which two changes would best keep the application available if that server fails? (Choose two.)',
            choices: [
                'Load balancing across multiple servers',
                'Clustering with automatic failover',
                'Sending a daily backup to offsite tape',
                'Enabling full-disk encryption on the server',
                'Requiring longer administrator passwords'
            ],
            answer: [0, 1],
            explain: 'High availability removes single points of failure through redundancy. Backups remain essential, but they restore after an outage rather than prevent one.',
            why: [
                'Correct: if one server fails, the load balancer sends traffic to the others.',
                'Correct: a cluster moves the workload to a healthy node automatically.',
                'Offsite backups support recovery, but restoring from tape takes time, so the application would be down.',
                'Encryption protects confidentiality, not availability.',
                'Password length is unrelated to surviving a hardware failure.'
            ]
        },
        {
            id: 'secplus-052',
            domain: '3',
            objective: '3.4',
            type: 'single',
            q: 'A data center has a backup generator that takes about 30 seconds to start. Which device keeps servers running during that gap?',
            choices: [
                'Uninterruptible power supply (UPS)',
                'Power distribution unit (PDU)',
                'Second utility feed without a battery',
                'Surge protector'
            ],
            answer: [0],
            explain: 'UPS units cover short outages and the gap before generators start. Generators handle longer outages.',
            why: [
                'Correct: a UPS supplies battery power instantly until the generator takes over.',
                'A basic PDU distributes power to equipment but does not store energy.',
                'A second utility feed helps if one feed fails, but not if the whole utility is down.',
                'A surge protector limits voltage spikes but cannot supply power during an outage.'
            ]
        },
        {
            id: 'secplus-053',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'A company wants employees to authenticate to Wi-Fi with their own credentials so that one person\'s access can be revoked without changing a shared passphrase. Which option best meets this requirement?',
            choices: [
                'Open network with a captive portal',
                'WPA2-Personal with a long passphrase',
                'WPA3-Personal using SAE',
                'WPA3-Enterprise with 802.1X and RADIUS'
            ],
            answer: [3],
            explain: 'WPA2/WPA3-Enterprise uses 802.1X with an authentication server such as RADIUS, giving per-user credentials and easy revocation.',
            why: [
                'An open network does not encrypt traffic with per-user keys, and a portal is not strong authentication.',
                'A long shared passphrase still has to be changed for everyone to remove one user.',
                'WPA3-Personal improves security over WPA2, but everyone still shares one passphrase.',
                'Correct: Enterprise mode authenticates each user individually against a central server.'
            ]
        },
        {
            id: 'secplus-054',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'A company issues phones to field staff and needs to enforce screen locks, push approved apps, and wipe a phone remotely if it is lost. Which solution should it use?',
            choices: [
                'Mobile device management (MDM)',
                'A BYOD acceptable use policy',
                'A full-tunnel VPN',
                'Geotagging'
            ],
            answer: [0],
            explain: 'MDM centrally manages mobile devices, including configuration, app control, and remote wipe.',
            why: [
                'Correct: MDM enforces device policies and supports remote lock and wipe.',
                'A policy sets rules, but it cannot technically enforce them or wipe a device.',
                'A VPN protects traffic but cannot enforce screen locks or wipe devices.',
                'Geotagging adds location data to files; it does not manage devices.'
            ]
        },
        {
            id: 'secplus-055',
            domain: '4',
            objective: '4.1',
            type: 'single',
            q: 'A web form uses JavaScript to validate input in the browser. Why must the server still validate the same input?',
            choices: [
                'Client-side checks only run when the user has administrator rights',
                'Server validation makes the page load faster for users',
                'An attacker can bypass client-side checks and send requests directly',
                'Browsers block JavaScript validation on HTTPS pages'
            ],
            answer: [2],
            explain: 'Client-side validation improves user experience, but only server-side validation is a security control. Attackers can use proxies or scripts to send any data they want.',
            why: [
                'Client-side scripts run regardless of the user\'s OS privileges.',
                'Server validation adds a small amount of work; it does not speed page loads.',
                'Correct: anything running in the browser is under the user\'s control and can be skipped.',
                'Browsers run JavaScript on HTTPS pages normally.'
            ]
        },
        {
            id: 'secplus-056',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'A company must return leased laptops with solid-state drives and needs the data to be unrecoverable without destroying the drives. Which method is most appropriate?',
            choices: [
                'Perform a quick format',
                'Run the drive\'s built-in secure erase command',
                'Delete all files, then empty the recycle bin on each laptop',
                'Degauss the drives'
            ],
            answer: [1],
            explain: 'SSDs spread writes across cells, so simple overwrites may miss data. Manufacturer secure erase or cryptographic erase is the recommended sanitization method when the drive must be reused.',
            why: [
                'A quick format mostly rewrites file system structures and leaves data recoverable.',
                'Correct: built-in sanitize or crypto erase commands are designed to handle SSD internals such as wear leveling.',
                'Deleted files can often be recovered with forensic tools.',
                'Degaussing relies on magnetism and does not erase flash memory; it may also damage the drive.'
            ]
        },
        {
            id: 'secplus-057',
            domain: '4',
            objective: '4.2',
            type: 'single',
            q: 'A company hires a vendor to dispose of retired hard drives. Which document should the vendor provide as proof that the drives were destroyed?',
            choices: [
                'Certificate of destruction',
                'Service-level agreement',
                'Data inventory',
                'Memorandum of understanding'
            ],
            answer: [0],
            explain: 'A certificate of destruction gives an audit trail for asset disposal and is often required for compliance.',
            why: [
                'Correct: a certificate of destruction records which assets were destroyed, when, and how.',
                'An SLA defines expected service levels, not proof of a completed disposal.',
                'A data inventory lists data the organization holds; it does not prove destruction.',
                'An MOU describes a general agreement between parties.'
            ]
        },
        {
            id: 'secplus-058',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'What does the Common Vulnerability Scoring System (CVSS) provide?',
            choices: [
                'A list of vulnerabilities known to be exploited',
                'A standardized severity score for a vulnerability',
                'A unique identifier for each publicly known vulnerability',
                'A vendor\'s schedule for releasing patches'
            ],
            answer: [1],
            explain: 'CVSS helps teams compare and prioritize vulnerabilities. CVE names a vulnerability; CVSS describes how severe it is.',
            why: [
                'Lists of exploited vulnerabilities are maintained separately, such as by government agencies.',
                'Correct: CVSS rates severity on a 0.0 to 10.0 scale from defined metrics.',
                'Unique identifiers come from the CVE program.',
                'Patch schedules are set by each vendor, not by CVSS.'
            ]
        },
        {
            id: 'secplus-059',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'A scanner flags a server as vulnerable because of its web server version string. The admin shows that the vendor backported the security fix into that version, and the issue is not present. How should the finding be classified?',
            choices: [
                'True negative',
                'False negative',
                'True positive',
                'False positive'
            ],
            answer: [3],
            explain: 'Version-based detection often causes false positives when vendors backport fixes. Credentialed scans and manual validation reduce them.',
            why: [
                'A true negative is a correct "not vulnerable" result, but the scanner reported a finding.',
                'A false negative is a real vulnerability the scanner failed to report.',
                'A true positive would mean the vulnerability really exists.',
                'Correct: the scanner reported a vulnerability that does not actually exist.'
            ]
        },
        {
            id: 'secplus-060',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'A vulnerability scan logs in to each host with a service account to read installed patches and local configuration. What kind of scan is this?',
            choices: [
                'Credentialed scan',
                'Non-credentialed scan',
                'Passive scan',
                'Penetration test'
            ],
            answer: [0],
            explain: 'Credentialed scans find missing patches and misconfigurations more accurately and produce fewer false positives than non-credentialed scans.',
            why: [
                'Correct: credentialed scans authenticate to the host for a more accurate inside view.',
                'A non-credentialed scan only sees what is exposed over the network.',
                'A passive scan watches traffic without connecting to hosts.',
                'A penetration test actively exploits weaknesses; logging in to read patch levels is not exploitation.'
            ]
        },
        {
            id: 'secplus-061',
            domain: '4',
            objective: '4.3',
            type: 'single',
            q: 'After a patch is deployed, the team runs another scan to confirm that the vulnerability no longer appears. Which vulnerability management activity is this?',
            choices: [
                'Vulnerability prioritization',
                'Threat hunting',
                'Validation of remediation',
                'Risk transference'
            ],
            answer: [2],
            explain: 'Validation, often by rescanning, closes the loop in vulnerability management. Patches can fail to install or need a reboot to take effect.',
            why: [
                'Prioritization ranks findings before remediation, not after.',
                'Threat hunting searches for signs of attackers already present.',
                'Correct: rescanning verifies that the fix actually worked.',
                'Risk transference shifts risk to another party, such as an insurer.'
            ]
        },
        {
            id: 'secplus-062',
            domain: '4',
            objective: '4.4',
            type: 'single',
            q: 'Which tool collects logs from many sources, correlates events, and raises alerts in one central console?',
            choices: [
                'Security information and event management (SIEM)',
                'Network access control (NAC)',
                'Data loss prevention (DLP)',
                'File integrity monitoring (FIM)'
            ],
            answer: [0],
            explain: 'A SIEM centralizes visibility. Its value depends on good log sources, correct time synchronization, and tuned correlation rules.',
            why: [
                'Correct: a SIEM aggregates, correlates, and alerts on log data from across the environment.',
                'NAC controls which devices may connect to the network.',
                'DLP detects and blocks sensitive data leaving the organization.',
                'FIM watches specific files for unauthorized changes.'
            ]
        },
        {
            id: 'secplus-063',
            domain: '4',
            objective: '4.4',
            type: 'single',
            q: 'An analyst wants to see which hosts talked to each other, on which ports, and how much data moved, without storing full packet contents. Which data source fits best?',
            choices: [
                'SNMP traps',
                'Vulnerability scan results',
                'Full packet capture',
                'NetFlow records'
            ],
            answer: [3],
            explain: 'Flow data gives a lightweight view of who talked to whom and how much. It is useful for spotting exfiltration and unusual connections.',
            why: [
                'SNMP traps are device-generated alerts, such as an interface going down.',
                'Scan results list weaknesses, not traffic between hosts.',
                'Full packet capture stores entire packets, which is much larger than needed here.',
                'Correct: flow records summarize conversations by addresses, ports, and byte counts.'
            ]
        },
        {
            id: 'secplus-064',
            domain: '4',
            objective: '4.4',
            type: 'single',
            q: 'A SOC receives hundreds of alerts each night from a known, approved backup script that triggers a "mass file access" rule. What is the best way to reduce this alert fatigue without losing visibility?',
            choices: [
                'Disable the mass file access rule entirely',
                'Tune the rule to exclude only that script',
                'Quarantine the backup server each night',
                'Raise the SIEM log retention period to one year'
            ],
            answer: [1],
            explain: 'Alert tuning reduces false positives so analysts can focus on real threats. Exclusions should be narrow and documented.',
            why: [
                'Disabling the rule would also hide real ransomware or exfiltration activity.',
                'Correct: tuning removes the known false positive and keeps the rule working for real threats.',
                'Quarantining the server would break backups.',
                'Longer retention does not change how many alerts are generated.'
            ]
        },
        {
            id: 'secplus-065',
            domain: '4',
            objective: '4.5',
            type: 'single',
            q: 'An organization wants to stop all devices, including IoT devices that cannot run agents, from reaching known malicious domains. Which control is most practical?',
            choices: [
                'Endpoint DLP agent',
                'Host-based firewall',
                'DNS filtering',
                'File integrity monitoring'
            ],
            answer: [2],
            explain: 'DNS filtering blocks lookups for malicious or unwanted domains at the resolver. Clients should be forced to use the filtering resolver for it to be effective.',
            why: [
                'An endpoint DLP agent cannot be installed on most IoT devices.',
                'Host-based firewalls require software on each device, which many IoT devices cannot run.',
                'Correct: filtering at the DNS resolver protects every device that uses it, with no agent needed.',
                'FIM detects changes to files; it does not block domains.'
            ]
        },
        {
            id: 'secplus-066',
            domain: '4',
            objective: '4.5',
            type: 'single',
            q: 'Which email authentication record tells receiving servers what to do with messages that fail SPF or DKIM alignment, and where to send reports?',
            choices: [
                'SPF',
                'MX',
                'DMARC',
                'DKIM'
            ],
            answer: [2],
            explain: 'DMARC builds on SPF and DKIM, checking that they align with the visible From domain and telling receivers how to handle failures.',
            why: [
                'SPF lists which servers may send mail for a domain, but does not set a failure policy with reporting.',
                'An MX record tells senders which servers receive mail for the domain.',
                'Correct: DMARC publishes a policy (none, quarantine, or reject) and reporting addresses.',
                'DKIM adds a signature to verify the message; it does not define handling of failures.'
            ]
        },
        {
            id: 'secplus-067',
            domain: '4',
            objective: '4.5',
            type: 'multi',
            q: 'An administrator is replacing FTP for file transfers and Telnet for remote command-line access. Which two protocols should be used instead? (Choose two.)',
            choices: [
                'rsh',
                'SFTP',
                'SNMPv1',
                'SSH',
                'TFTP'
            ],
            answer: [1, 3],
            explain: 'Secure replacements encrypt both credentials and data. SFTP and SSH replace FTP and Telnet; HTTPS replaces HTTP, and LDAPS replaces LDAP.',
            why: [
                'rsh is a legacy remote shell with no encryption.',
                'Correct: SFTP transfers files over an encrypted SSH session.',
                'SNMPv1 is for device monitoring and sends community strings in cleartext.',
                'Correct: SSH provides encrypted remote command-line access.',
                'TFTP has no authentication or encryption.'
            ]
        },
        {
            id: 'secplus-068',
            domain: '4',
            objective: '4.6',
            type: 'single',
            q: 'Employees sign in to a third-party SaaS application using their corporate identity provider, which sends an XML assertion to the application. Which standard is being used?',
            choices: [
                'TACACS+',
                'SAML',
                'RADIUS',
                'LDAP'
            ],
            answer: [1],
            explain: 'SAML enables federated single sign-on for web applications. The identity provider authenticates the user, and the service provider trusts its signed assertion.',
            why: [
                'TACACS+ is used mostly for administering network devices.',
                'Correct: SAML exchanges XML assertions between an identity provider and a service provider.',
                'RADIUS is used mostly for network access, such as VPN and Wi-Fi.',
                'LDAP is a directory access protocol, not a web federation standard.'
            ]
        },
        {
            id: 'secplus-069',
            domain: '4',
            objective: '4.6',
            type: 'single',
            q: 'A policy grants access to a payroll report only if the user is in the finance department, is on a managed device, and is connecting during business hours. Which access control model is this?',
            choices: [
                'Role-based access control (RBAC)',
                'Discretionary access control (DAC)',
                'Mandatory access control (MAC)',
                'Attribute-based access control (ABAC)'
            ],
            answer: [3],
            explain: 'ABAC makes decisions from attributes such as department, device state, location, and time. It is more flexible, but also more complex, than RBAC.',
            why: [
                'RBAC grants access by role alone and does not normally check device or time.',
                'DAC lets the resource owner decide who has access.',
                'MAC uses classification labels and clearances set by the system.',
                'Correct: ABAC evaluates several attributes of the user, device, and context.'
            ]
        },
        {
            id: 'secplus-070',
            domain: '4',
            objective: '4.6',
            type: 'single',
            q: 'Administrators receive elevated rights only for an approved task and time window. Their privileged credentials are checked out of a vault and rotated after use. What is being implemented?',
            choices: [
                'Federation with an external identity provider',
                'Attestation of user accounts',
                'Privileged access management (PAM)',
                'Single sign-on'
            ],
            answer: [2],
            explain: 'PAM reduces standing privilege by granting admin rights only when needed. Ephemeral credentials and password vaulting limit the value of stolen admin passwords.',
            why: [
                'Federation lets users sign in with an identity from another organization.',
                'Attestation is a periodic review that confirms users still need their access.',
                'Correct: PAM tools provide vaulting, rotation, and temporary elevation.',
                'SSO reduces logins but does not limit when admin rights are active.'
            ]
        },
        {
            id: 'secplus-071',
            domain: '4',
            objective: '4.6',
            type: 'single',
            q: 'Which of the following is an example of multifactor authentication?',
            choices: [
                'A password and a security question',
                'A password and an authenticator app code',
                'A fingerprint scan and a facial recognition scan',
                'A PIN and a passphrase'
            ],
            answer: [1],
            explain: 'MFA requires factors from at least two different categories: something you know, something you have, and something you are. Two items from the same category do not count.',
            why: [
                'Both are something you know, so this is a single factor type.',
                'Correct: it combines something you know with something you have.',
                'Both are something you are, so this is a single factor type.',
                'Both are something you know.'
            ]
        },
        {
            id: 'secplus-072',
            domain: '4',
            objective: '4.7',
            type: 'single',
            q: 'An organization links account deprovisioning to its HR system so that accounts are disabled automatically when an employee leaves. What is the main security benefit?',
            choices: [
                'Accounts no longer need periodic access reviews',
                'Users can reset their own passwords without the help desk',
                'Privileged accounts are exempt from logging',
                'Access is removed consistently and promptly at departure'
            ],
            answer: [3],
            explain: 'Automating user provisioning and deprovisioning enforces policy at speed and reduces human error, which is a core benefit of security automation.',
            why: [
                'Access reviews are still needed to find excess rights on active accounts.',
                'Self-service password reset is a different automation and does not address departures.',
                'Exempting privileged accounts from logging would reduce security.',
                'Correct: automation removes delays and forgotten steps that leave former employees with access.'
            ]
        },
        {
            id: 'secplus-073',
            domain: '4',
            objective: '4.7',
            type: 'single',
            q: 'A security team builds many interdependent automation scripts, and only one engineer understands how they work. Which concern does this most directly create?',
            choices: [
                'Excessive workforce multiplication',
                'A single point of failure',
                'Standardized infrastructure configuration',
                'Faster reaction time to incidents'
            ],
            answer: [1],
            explain: 'Automation brings benefits but also risks such as complexity, cost, single points of failure, and technical debt. Documentation and shared ownership reduce these risks.',
            why: [
                'Workforce multiplication is a benefit of automation, not a concern.',
                'Correct: if that engineer leaves or a script breaks, no one can maintain it, and the complexity keeps growing.',
                'Standardized configuration is a benefit of automation.',
                'Faster reaction is a benefit, not a concern.'
            ]
        },
        {
            id: 'secplus-074',
            domain: '4',
            objective: '4.8',
            type: 'single',
            q: 'In the incident response process, which phase comes immediately after containment?',
            choices: [
                'Lessons learned',
                'Eradication',
                'Recovery',
                'Analysis'
            ],
            answer: [1],
            explain: 'A common sequence is preparation, detection, analysis, containment, eradication, recovery, and lessons learned.',
            why: [
                'Lessons learned is the final phase.',
                'Correct: after the incident is contained, the cause, such as malware or a compromised account, is removed.',
                'Recovery restores systems to normal after eradication.',
                'Analysis comes before containment, to understand what is happening.'
            ]
        },
        {
            id: 'secplus-075',
            domain: '4',
            objective: '4.8',
            type: 'single',
            q: 'An analyst confirms that a workstation is beaconing to a known command-and-control server. Forensic analysis may be needed later. What should be done first?',
            choices: [
                'Isolate it from the network but leave it powered on',
                'Email the user and ask them to stop using the computer',
                'Power off the workstation to stop the malware',
                'Reimage the workstation immediately'
            ],
            answer: [0],
            explain: 'Containment limits damage while keeping evidence. Network isolation, often through EDR, stops command-and-control traffic without wiping memory.',
            why: [
                'Correct: isolation contains the threat and keeps volatile evidence such as memory available.',
                'Email may be slow or seen by the attacker, and it does not contain the threat.',
                'Powering off loses volatile data such as running processes and network connections.',
                'Reimaging destroys evidence and skips analysis of how the host was compromised.'
            ]
        },
        {
            id: 'secplus-076',
            domain: '4',
            objective: '4.8',
            type: 'multi',
            q: 'Which two activities belong to the preparation phase of incident response? (Choose two.)',
            choices: [
                'Reimaging infected hosts',
                'Writing the incident response plan and playbooks',
                'Isolating a compromised network segment',
                'Restoring systems from backup',
                'Running tabletop exercises with the response team'
            ],
            answer: [1, 4],
            explain: 'Preparation includes plans, playbooks, tools, training, and exercises. Good preparation makes every later phase faster.',
            why: [
                'Reimaging is part of eradication or recovery.',
                'Correct: plans and playbooks are created before incidents happen.',
                'Isolating a segment is containment.',
                'Restoring from backup is recovery.',
                'Correct: exercises train the team and test the plan before a real incident.'
            ]
        },
        {
            id: 'secplus-077',
            domain: '4',
            objective: '4.8',
            type: 'single',
            q: 'Legal counsel tells IT to stop all automatic deletion of email for five employees because of an expected lawsuit. What is this called?',
            choices: [
                'Legal hold',
                'Data retention policy',
                'Chain of custody',
                'E-discovery'
            ],
            answer: [0],
            explain: 'A legal hold requires an organization to preserve data relevant to expected litigation. Failing to preserve it can lead to legal penalties.',
            why: [
                'Correct: a legal hold preserves potentially relevant data, overriding normal deletion.',
                'A retention policy sets normal timeframes; the hold suspends it.',
                'Chain of custody documents who handled evidence and when.',
                'E-discovery is the process of finding and producing electronic data; the hold preserves it first.'
            ]
        },
        {
            id: 'secplus-078',
            domain: '4',
            objective: '4.9',
            type: 'single',
            q: 'Investigators know data was sent to an external IP and need to see exactly what content left the network. Which data source can show this?',
            choices: [
                'Vulnerability scan report',
                'NetFlow records',
                'Firewall allow logs',
                'Packet capture'
            ],
            answer: [3],
            explain: 'Packet captures provide the most detail but take the most storage. Encrypted traffic limits what they can reveal.',
            why: [
                'A scan report lists weaknesses, not traffic.',
                'NetFlow shows volumes and endpoints but not content.',
                'Firewall logs show that a connection was allowed, not what it carried.',
                'Correct: a full packet capture holds the actual payload, if it was not encrypted.'
            ]
        },
        {
            id: 'secplus-079',
            domain: '4',
            objective: '4.9',
            type: 'single',
            q: 'While investigating a phishing email, an analyst wants to trace which mail servers handled the message before it arrived. Where should the analyst look?',
            choices: [
                'The latest vulnerability scan',
                'The email header metadata',
                'The workstation\'s OS event log',
                'The SIEM dashboard summary'
            ],
            answer: [1],
            explain: 'Email headers are metadata that show routing, authentication results, and sender details. They are central to phishing investigations.',
            why: [
                'Vulnerability scans do not track email.',
                'Correct: Received headers record each mail server the message passed through.',
                'OS logs show workstation events, not the mail delivery path.',
                'Dashboards summarize data; the raw header holds the routing details.'
            ]
        },
        {
            id: 'secplus-080',
            domain: '4',
            objective: '4.9',
            type: 'multi',
            q: 'An analyst needs to identify which process on a laptop made a connection to a suspicious IP, and when. Which two data sources are most useful? (Choose two.)',
            choices: [
                'EDR telemetry from the laptop',
                'A recent vulnerability scan of the laptop',
                'Endpoint operating system logs that record process activity',
                'Patch compliance dashboard',
                'Switch port up/down logs'
            ],
            answer: [0, 2],
            explain: 'Network data can show that a connection happened, but host-based sources such as EDR and endpoint logs are needed to tie it to a specific process.',
            why: [
                'Correct: EDR records process launches and network connections on the host.',
                'A scan shows weaknesses, not which process made a connection.',
                'Correct: OS logs that record process and connection events can tie a connection to a process.',
                'A patch dashboard shows update status, not network activity.',
                'Port status logs show link changes, not process activity.'
            ]
        },
        {
            id: 'secplus-081',
            domain: '5',
            objective: '5.1',
            type: 'single',
            q: 'A document gives step-by-step instructions for creating accounts and assigning equipment to a new hire. What type of document is this?',
            choices: [
                'Procedure',
                'Standard',
                'Guideline',
                'Policy'
            ],
            answer: [0],
            explain: 'Policies say what and why, standards set specific mandatory rules, procedures say how step by step, and guidelines give advice.',
            why: [
                'Correct: procedures list the specific steps to complete a task.',
                'A standard sets mandatory specific requirements, such as a minimum encryption strength.',
                'Guidelines are recommendations, not required steps.',
                'A policy states high-level intent and requirements, not step-by-step tasks.'
            ]
        },
        {
            id: 'secplus-082',
            domain: '5',
            objective: '5.1',
            type: 'single',
            q: 'Which role is responsible for the day-to-day handling of data, such as running backups and applying access controls set by the owner?',
            choices: [
                'Data controller',
                'Data custodian',
                'Data subject',
                'Data owner'
            ],
            answer: [1],
            explain: 'Owners are accountable and make decisions; custodians carry out the technical work. Separating these roles supports clear accountability.',
            why: [
                'The controller decides the purposes and means of processing personal data.',
                'Correct: the custodian maintains and protects data according to the owner\'s requirements.',
                'The data subject is the person the personal data is about.',
                'The data owner is accountable for the data and decides classification and access.'
            ]
        },
        {
            id: 'secplus-083',
            domain: '5',
            objective: '5.1',
            type: 'single',
            q: 'A retailer decides what employee data to collect and why, and hires a payroll company to process that data for it. Under common privacy definitions, what is the payroll company\'s role?',
            choices: [
                'Data processor',
                'Data controller',
                'Data owner',
                'Data subject'
            ],
            answer: [0],
            explain: 'The controller determines why and how personal data is processed, and the processor acts on its instructions.',
            why: [
                'Correct: a processor handles personal data on behalf of the controller.',
                'The retailer is the controller because it decides the purpose and means.',
                'Data owner is an internal accountability role, not the privacy-law role for an outside service.',
                'The employees are the data subjects.'
            ]
        },
        {
            id: 'secplus-084',
            domain: '5',
            objective: '5.1',
            type: 'single',
            q: 'Which document defines what employees may and may not do with company computers, networks, and email?',
            choices: [
                'Business continuity plan',
                'Non-disclosure agreement',
                'Acceptable use policy',
                'Service-level agreement'
            ],
            answer: [2],
            explain: 'An acceptable use policy sets expectations for users and gives the organization grounds to act when rules are broken.',
            why: [
                'A BCP describes how the business keeps operating during a disruption.',
                'An NDA protects confidential information shared between parties.',
                'Correct: an AUP sets the rules for appropriate use of company IT resources.',
                'An SLA defines service expectations between a provider and a customer.'
            ]
        },
        {
            id: 'secplus-085',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'A server is valued at $200,000. A flood would damage 25% of its value, and a flood is expected once every two years. What is the annualized loss expectancy (ALE)?',
            choices: [
                '$25,000',
                '$12,500',
                '$100,000',
                '$50,000'
            ],
            answer: [0],
            explain: 'SLE = asset value x exposure factor. ALE = SLE x annualized rate of occurrence (ARO). Once every two years is an ARO of 0.5.',
            why: [
                'Correct: SLE is $200,000 x 0.25 = $50,000, and ALE is $50,000 x 0.5 = $25,000.',
                '$12,500 applies the annual rate twice.',
                '$100,000 results from multiplying by 2 instead of by the annual rate of 0.5.',
                '$50,000 is the single loss expectancy, before applying the annual rate.'
            ]
        },
        {
            id: 'secplus-086',
            domain: '5',
            objective: '5.2',
            type: 'multi',
            q: 'Which two actions are examples of risk transference? (Choose two.)',
            choices: [
                'Buying a cyber insurance policy',
                'Installing a firewall in front of the server',
                'Formally documenting acceptance of a risk',
                'Discontinuing a risky product line',
                'Outsourcing a service under a contract that shifts liability to the provider'
            ],
            answer: [0, 4],
            explain: 'Risk transference moves some impact to another party, usually through insurance or contracts. Accountability for protecting data usually stays with the organization.',
            why: [
                'Correct: insurance shifts financial impact to the insurer.',
                'Adding a control is risk mitigation.',
                'Documenting acceptance is risk acceptance.',
                'Stopping the activity is risk avoidance.',
                'Correct: a contract can shift some liability to the provider.'
            ]
        },
        {
            id: 'secplus-087',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'Leadership states that the business can lose at most four hours of transaction data after a disaster. Which metric does this define?',
            choices: [
                'Mean time between failures (MTBF)',
                'Mean time to repair (MTTR)',
                'Recovery point objective (RPO)',
                'Recovery time objective (RTO)'
            ],
            answer: [2],
            explain: 'RPO drives backup and replication frequency; RTO drives how fast recovery must be. A four-hour RPO needs backups or replication at least every four hours.',
            why: [
                'MTBF is the average time between failures.',
                'MTTR is the average time to repair a failed component.',
                'Correct: RPO is the maximum acceptable amount of data loss, measured in time.',
                'RTO is how long it may take to restore service.'
            ]
        },
        {
            id: 'secplus-088',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'Which document lists identified risks along with their owners, likelihood, impact, and planned treatments?',
            choices: [
                'Asset inventory',
                'Incident response plan',
                'Business impact analysis',
                'Risk register'
            ],
            answer: [3],
            explain: 'The risk register supports ongoing risk management. Entries often include key risk indicators and target dates.',
            why: [
                'An asset inventory lists hardware, software, and data.',
                'An IR plan describes how to respond to incidents.',
                'A BIA identifies critical functions and the impact of disruptions.',
                'Correct: a risk register is the central record used to track risks and responses.'
            ]
        },
        {
            id: 'secplus-089',
            domain: '5',
            objective: '5.2',
            type: 'single',
            q: 'A startup\'s board says it is willing to accept higher levels of risk to pursue rapid growth. Which term describes this position?',
            choices: [
                'Risk avoidance',
                'Expansionary risk appetite',
                'Risk transference',
                'Conservative risk appetite'
            ],
            answer: [1],
            explain: 'Risk appetite describes how much risk an organization is willing to take on. It guides decisions about which risks to accept or treat.',
            why: [
                'Avoidance means stopping the risky activity entirely.',
                'Correct: an expansionary appetite accepts more risk for potential reward.',
                'Transference shifts risk to another party.',
                'A conservative appetite prefers lower risk, even at the cost of opportunity.'
            ]
        },
        {
            id: 'secplus-090',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'A company wants the contractual right to assess a cloud vendor\'s security controls directly. Which contract provision provides this?',
            choices: [
                'Non-disclosure agreement',
                'Right-to-audit clause',
                'Memorandum of understanding',
                'Service-level agreement'
            ],
            answer: [1],
            explain: 'Right-to-audit clauses give customers visibility into vendor security. Some vendors offer independent audit reports instead.',
            why: [
                'An NDA protects confidential information but does not grant audit rights.',
                'Correct: a right-to-audit clause allows the customer to review or audit the vendor\'s controls.',
                'An MOU is a general, often non-binding, statement of intent.',
                'An SLA defines service targets such as uptime.'
            ]
        },
        {
            id: 'secplus-091',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'A hosting contract guarantees 99.9% monthly uptime and gives service credits if the target is missed. Which agreement contains these terms?',
            choices: [
                'Business partners agreement (BPA)',
                'Memorandum of agreement (MOA)',
                'Statement of work (SOW)',
                'Service-level agreement (SLA)'
            ],
            answer: [3],
            explain: 'SLAs set measurable expectations, such as uptime and response times, and penalties when they are not met.',
            why: [
                'A BPA governs a business partnership, such as sharing profits and duties.',
                'An MOA sets out cooperative responsibilities, usually without uptime metrics.',
                'An SOW defines specific deliverables and tasks for a project.',
                'Correct: an SLA defines measurable service levels and remedies.'
            ]
        },
        {
            id: 'secplus-092',
            domain: '5',
            objective: '5.3',
            type: 'single',
            q: 'Before signing with a new SaaS vendor, a company reviews the vendor\'s independent audit report, sends a security questionnaire, and checks its breach history. What is this process called?',
            choices: [
                'Rules of engagement',
                'Penetration testing',
                'Due diligence',
                'Supply chain attack'
            ],
            answer: [2],
            explain: 'Vendor due diligence happens before selection and should be followed by ongoing monitoring during the relationship.',
            why: [
                'Rules of engagement define how a test or assessment will be conducted.',
                'No active testing of the vendor\'s systems is described.',
                'Correct: due diligence investigates a vendor\'s risk before entering a relationship.',
                'A supply chain attack is a threat, not an assessment activity.'
            ]
        },
        {
            id: 'secplus-093',
            domain: '5',
            objective: '5.4',
            type: 'multi',
            q: 'Which two are possible consequences of failing to comply with a data protection regulation? (Choose two.)',
            choices: [
                'Regulatory fines',
                'Automatic renewal of certifications',
                'A reduced audit scope',
                'Loss of a license to operate',
                'Lower cyber insurance premiums'
            ],
            answer: [0, 3],
            explain: 'Consequences of non-compliance include fines, sanctions, reputational damage, loss of license, and contractual impacts.',
            why: [
                'Correct: regulators can impose financial penalties.',
                'Non-compliance puts certifications at risk; it does not renew them.',
                'Non-compliance usually leads to more scrutiny, not less.',
                'Correct: some regulators can suspend or revoke licenses.',
                'Insurers tend to raise premiums or deny coverage after compliance failures.'
            ]
        },
        {
            id: 'secplus-094',
            domain: '5',
            objective: '5.4',
            type: 'single',
            q: 'A customer asks a company to delete all of the personal data it holds about her. Which privacy right is she exercising?',
            choices: [
                'Data retention',
                'Legal hold',
                'Right to be forgotten',
                'Data sovereignty'
            ],
            answer: [2],
            explain: 'Laws such as GDPR give individuals the right to request erasure, with some exceptions, such as data needed to meet legal obligations.',
            why: [
                'Retention is the organization\'s rule for how long it keeps data.',
                'A legal hold is an obligation to preserve data, the opposite of deletion.',
                'Correct: the right to be forgotten (right to erasure) lets individuals request deletion of their data.',
                'Data sovereignty concerns which country\'s laws apply to data.'
            ]
        },
        {
            id: 'secplus-095',
            domain: '5',
            objective: '5.4',
            type: 'single',
            q: 'Every year, employees must sign a statement confirming that they have read and agree to the information security policy. What is this practice?',
            choices: [
                'External compliance reporting',
                'Data inventory',
                'Attestation and acknowledgement',
                'Due diligence'
            ],
            answer: [2],
            explain: 'Acknowledgement creates a record that users were informed of their obligations, which supports both compliance and enforcement.',
            why: [
                'External reporting goes to regulators or other outside parties, not staff sign-offs.',
                'A data inventory catalogs the data an organization holds.',
                'Correct: employees formally acknowledge the policy, which supports compliance monitoring.',
                'Due diligence is investigation before making a decision, such as choosing a vendor.'
            ]
        },
        {
            id: 'secplus-096',
            domain: '5',
            objective: '5.5',
            type: 'single',
            q: 'Penetration testers receive no information about the target environment before the test begins. Which type of test is this?',
            choices: [
                'Partially known environment',
                'Unknown environment',
                'Known environment',
                'Passive reconnaissance'
            ],
            answer: [1],
            explain: 'Unknown, partially known, and known environments describe how much information testers are given.',
            why: [
                'In a partially known environment test, testers receive some information.',
                'Correct: an unknown environment test simulates an outside attacker with no inside knowledge.',
                'In a known environment test, testers receive full details such as diagrams and code.',
                'Passive reconnaissance is an information-gathering technique, not a test type.'
            ]
        },
        {
            id: 'secplus-097',
            domain: '5',
            objective: '5.5',
            type: 'single',
            q: 'During a penetration test, a tester collects information from public DNS records, job postings, and social media without sending any traffic to the target\'s systems. What is this activity?',
            choices: [
                'Active reconnaissance',
                'Passive reconnaissance',
                'Lateral movement',
                'Privilege escalation'
            ],
            answer: [1],
            explain: 'Passive recon is hard for the target to detect. Active recon, such as scanning, may trigger alerts.',
            why: [
                'Active reconnaissance interacts with the target, for example by port scanning.',
                'Correct: passive reconnaissance uses public sources without touching the target.',
                'Lateral movement happens after access, moving between systems.',
                'Privilege escalation gains higher rights on a system already accessed.'
            ]
        },
        {
            id: 'secplus-098',
            domain: '5',
            objective: '5.6',
            type: 'single',
            q: 'What is the main purpose of running simulated phishing campaigns against employees?',
            choices: [
                'To meet a requirement that all users be locked out after a click',
                'To test the bandwidth limits of the email gateway',
                'To check that the mail server\'s SPF record is set up correctly',
                'To measure and improve how well users recognize and report phishing'
            ],
            answer: [3],
            explain: 'Phishing simulations are a key part of security awareness. Click rates and report rates show whether training is working.',
            why: [
                'Lockouts are not the goal; follow-up training is the usual response.',
                'Simulations send a small number of messages; they are not a load test.',
                'SPF can be checked directly; simulations measure user behavior, not DNS records.',
                'Correct: simulations build recognition skills and give metrics to track progress.'
            ]
        },
        {
            id: 'secplus-099',
            domain: '5',
            objective: '5.6',
            type: 'single',
            q: 'Awareness training teaches employees to report a coworker who suddenly downloads large amounts of data unrelated to their job before leaving the company. Which training topic does this cover?',
            choices: [
                'Insider threat',
                'Removable media handling',
                'Password management',
                'Situational awareness for tailgating'
            ],
            answer: [0],
            explain: 'Insider threat training helps staff recognize risky behavior by trusted users and know how to report it.',
            why: [
                'Correct: unusual data access by a trusted employee is a classic insider threat sign.',
                'Removable media training covers the risks of USB drives and similar devices.',
                'Password management covers creating and protecting passwords.',
                'Tailgating awareness focuses on people following others through secure doors.'
            ]
        },
        {
            id: 'secplus-100',
            domain: '5',
            objective: '5.6',
            type: 'single',
            q: 'Which metric best shows that a security awareness program is changing employee behavior?',
            choices: [
                'The number of employees who opened the training module',
                'The total volume of email filtered by the gateway',
                'The number of firewall rules reviewed each quarter',
                'Phishing simulation click rates falling while report rates rise'
            ],
            answer: [3],
            explain: 'Effective awareness programs track outcomes, not just completion. Rising reports and falling clicks show employees are applying what they learned.',
            why: [
                'Opening a module shows participation, not changed behavior.',
                'Filtered email volume reflects the gateway, not employee behavior.',
                'Firewall reviews are a technical activity unrelated to user awareness.',
                'Correct: it measures actual behavior, both avoiding and reporting phishing.'
            ]
        }
    ]
};
