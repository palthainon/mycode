// CompTIA A+ practice questions for oldweb.tech.
// Original questions written against the public exam objectives. Not affiliated with CompTIA.
window.CERT_BANK = {
    id: 'a-plus',
    vendor: 'CompTIA',
    exam: 'A+',
    code: '220-1201 / 220-1202',
    asOf: '2026-10',
    objectivesUrl: 'https://assets.ctfassets.net/82ripq7fjls2/1oSdlyujpaX3GrM0rir6Ge/91afb2be72785281e8fb4c0d9a70c6f4/CompTIA-A-220-1201-Exam-Objectives-3.0.pdf',
    domains: [
        { id: 'c1-1', name: 'Core 1: Mobile Devices', weight: 13 },
        { id: 'c1-2', name: 'Core 1: Networking', weight: 23 },
        { id: 'c1-3', name: 'Core 1: Hardware', weight: 25 },
        { id: 'c1-4', name: 'Core 1: Virtualization and Cloud Computing', weight: 11 },
        { id: 'c1-5', name: 'Core 1: Hardware and Network Troubleshooting', weight: 28 },
        { id: 'c2-1', name: 'Core 2: Operating Systems', weight: 28 },
        { id: 'c2-2', name: 'Core 2: Security', weight: 28 },
        { id: 'c2-3', name: 'Core 2: Software Troubleshooting', weight: 23 },
        { id: 'c2-4', name: 'Core 2: Operational Procedures', weight: 21 }
    ],
    questions: [
        {
            id: 'aplus-001',
            domain: 'c1-1',
            objective: '1.1',
            type: 'single',
            q: 'A technician replaced the display assembly on a laptop. Afterward, the laptop shows a much weaker Wi-Fi signal than identical laptops at the same desk. What is the most likely cause?',
            choices: [
                'The wireless card driver was removed when the display was disconnected.',
                'The new display panel is emitting interference on the 2.4GHz band.',
                'The antenna leads in the display housing were not reconnected.',
                'The battery can no longer supply enough current to the wireless card.'
            ],
            answer: [2],
            explain: 'Most laptops route their Wi-Fi antenna leads through the hinge into the display bezel. If those leads are not reattached to the wireless card after a display swap, signal strength drops sharply.',
            why: [
                'Disconnecting a display does not uninstall drivers; a missing driver would mean no Wi-Fi at all, not a weak signal.',
                'A display panel is not a meaningful source of 2.4GHz interference, and the other laptops nearby are unaffected.',
                'Correct: laptop antennas usually sit in the lid, so a display replacement disturbs their cabling.',
                'A battery that cannot power the card would cause instability or shutdowns, and the problem began right after the display repair.'
            ]
        },
        {
            id: 'aplus-002',
            domain: 'c1-1',
            objective: '1.2',
            type: 'single',
            q: 'A user pays at a store checkout by holding a smartphone within about 4 cm of the payment terminal. The phone was never paired with the terminal, and moving it 30 cm away stops the exchange. Which technology is the phone using?',
            choices: [
                'Bluetooth Low Energy',
                'Wi-Fi Direct',
                'NFC',
                'Infrared (IR)'
            ],
            answer: [2],
            explain: 'Near-field communication (NFC) works only within a few centimeters and starts an exchange as soon as two devices come close, with no pairing step. That is why tap-to-pay and badge readers use it. Rule: centimeters and a tap with no pairing points to NFC; meters and pairing points to Bluetooth.',
            why: [
                'BLE is tempting because it is low power and used for proximity beacons, but it works over meters and the exchange would not stop at 30 cm.',
                'Wi-Fi Direct is tempting because it connects devices without a router, but it reaches tens of meters and needs a connection setup first.',
                'Correct: NFC only works within a few centimeters and needs no pairing, which matches both details in the scenario.',
                'IR is tempting because it is short range and needs no pairing, but most current phones lack an IR receiver and payment terminals do not use it.'
            ]
        },
        {
            id: 'aplus-003',
            domain: 'c1-1',
            objective: '1.2',
            type: 'single',
            q: 'A user with a thin laptop wants one cable from the laptop to a desk dock. That cable must charge the laptop, carry USB data to a keyboard and drive, and send video to an external monitor. Which laptop port should the dock connect to?',
            choices: [
                'USB-C',
                'HDMI',
                'USB 3.0 Type-A',
                'Mini DisplayPort'
            ],
            answer: [0],
            explain: 'A USB-C port can carry USB Power Delivery charging, USB data and DisplayPort Alt Mode video over one cable, as long as that port supports those features. Rule: check every requirement in the stem; a port that meets only one, such as video only, is wrong.',
            why: [
                'Correct: a USB-C port with Power Delivery and Alt Mode carries power, data and video over one cable.',
                'HDMI is tempting because it carries video and audio, but it cannot charge the laptop or carry USB data to the dock.',
                'Type-A is tempting because it carries fast USB data, but a laptop cannot take charging power through it or send native video.',
                'Mini DisplayPort is tempting for driving a monitor, but it carries no charging power and no USB data.'
            ]
        },
        {
            id: 'aplus-004',
            domain: 'c1-1',
            objective: '1.3',
            type: 'single',
            q: 'A company lets employees read corporate email on their personal phones. Management wants to require a screen lock and, if an employee leaves, remove company email and files without erasing the employee\'s personal photos. What should the technician implement?',
            choices: [
                'Have each user enable the phone maker\'s locate-and-erase service.',
                'Require full-device encryption on every personal phone.',
                'Enroll the phones in MDM and manage the corporate apps and data.',
                'Protect each email account with a strong password and 2FA.'
            ],
            answer: [2],
            explain: 'MDM pushes policies such as passcode requirements. On personally owned (BYOD) phones it usually manages only the corporate apps or a work profile, so a selective wipe removes company data and leaves personal content. Rule: company-owned devices can get a full wipe; personally owned devices call for a selective wipe of managed data.',
            why: [
                'A locate-and-erase service is tempting because it removes data remotely, but it wipes the whole phone, personal photos included, and the company does not control it.',
                'Encryption is tempting because it protects data on a lost phone, but it cannot remove corporate data selectively when an employee leaves.',
                'Correct: MDM enforces the screen lock policy and can wipe only the managed corporate apps and data.',
                'Strong sign-in protects the account, but it does not enforce a device screen lock or remove mail already stored on the phone.'
            ]
        },
        {
            id: 'aplus-005',
            domain: 'c1-1',
            objective: '1.3',
            type: 'single',
            q: 'A user is trying to connect a new Bluetooth headset to a smartphone. Bluetooth is enabled on the phone, but the headset does not appear in the list of available devices. What should the user do next?',
            choices: [
                'Enter the headset\'s PIN code on the phone.',
                'Turn on airplane mode and try again.',
                'Factory reset the phone\'s network settings, then restart and scan again.',
                'Put the headset into pairing mode so it becomes discoverable.'
            ],
            answer: [3],
            explain: 'A Bluetooth device only shows up in a scan while it is discoverable. Most headsets must be placed into pairing mode, usually by holding a button, before a phone can find them.',
            why: [
                'A PIN is entered after the device is found and selected; it cannot help the device appear in the list.',
                'Airplane mode disables radios, including Bluetooth on many phones, which makes the problem worse.',
                'A network reset is a drastic step that is not justified before trying the basic pairing procedure.',
                'Correct: the phone can only list the headset while the headset is advertising itself in pairing mode.'
            ]
        },
        {
            id: 'aplus-006',
            domain: 'c1-1',
            objective: '1.3',
            type: 'single',
            q: 'A traveling employee received a cellular overage charge. The technician finds that the phone\'s cloud storage app uploads every photo and video as soon as it is taken. What change best prevents this from happening again?',
            choices: [
                'Limit the cloud app\'s sync to Wi-Fi only.',
                'Disable location services for the camera app.',
                'Turn off cellular data for the camera app.',
                'Lower the camera\'s photo and video resolution.'
            ],
            answer: [0],
            explain: 'Most cloud storage apps can be set to upload only over Wi-Fi, so large media uploads wait until the phone is off the cellular network. Rule: find the app that actually moves the data and change that app\'s setting, rather than the app that creates the files.',
            why: [
                'Correct: restricting the cloud app to Wi-Fi stops large uploads from counting against the cellular data plan.',
                'Location tagging is tempting because it is a camera setting, but it adds only a few bytes to each photo and does not cause uploads.',
                'Tempting because the camera takes the photos, but the camera saves locally; the cloud app does the uploading over cellular.',
                'Smaller files use less data, so this is tempting, but every photo and video would still upload over cellular.'
            ]
        },
        {
            id: 'aplus-007',
            domain: 'c1-2',
            objective: '2.1',
            type: 'single',
            q: 'After a firewall change, users at a branch office can still browse internal HTTPS sites and open mapped file shares, but their Remote Desktop connections to a Windows server time out. Which port was most likely left closed?',
            choices: [
                '445',
                '3389',
                '5900',
                '443'
            ],
            answer: [1],
            explain: 'Remote Desktop Protocol listens on port 3389 by default. HTTPS (443) and SMB file sharing (445) still work, so those ports are open. Rule: map each working and failing service to its port; the services that still work rule out their own ports.',
            why: [
                'Port 445 is tempting because it is a common Windows port, but it carries SMB, and the mapped file shares still work.',
                'Correct: RDP uses port 3389 by default, and it is the only failing service.',
                'Port 5900 is tempting because VNC also provides a remote desktop, but VNC is a different protocol; Windows Remote Desktop uses 3389.',
                'Port 443 is tempting because some remote access gateways use it, but HTTPS browsing still works, so 443 is open.'
            ]
        },
        {
            id: 'aplus-008',
            domain: 'c1-2',
            objective: '2.1',
            type: 'multi',
            q: 'A technician sets up a new mail client. Test messages send successfully, but no incoming mail ever appears in the client. Which two protocols could the technician configure for the incoming mail server? (Choose two.)',
            choices: [
                'SMTP',
                'POP3',
                'IMAP',
                'LDAP',
                'SMB'
            ],
            answer: [1, 2],
            explain: 'POP3 (110, or 995 with TLS) and IMAP (143, or 993 with TLS) retrieve mail for a client. SMTP sends mail: port 25 between servers and usually 587 for client submission. Rule: sort mail protocols by direction; SMTP pushes mail out, while POP3 and IMAP pull it in.',
            why: [
                'SMTP is tempting because it appears in every mail setup, but it sends mail, and sending already works.',
                'Correct: POP3 retrieves mail, typically downloading it to one client.',
                'Correct: IMAP retrieves mail and keeps messages and folders synchronized on the server.',
                'LDAP is tempting because mail clients use it for address book lookups, but it queries directories and does not retrieve messages.',
                'SMB is tempting because it is a common Windows protocol, but it shares files and printers, not mail.'
            ]
        },
        {
            id: 'aplus-009',
            domain: 'c1-2',
            objective: '2.2',
            type: 'single',
            q: 'A small office wants its new wireless network to run in the 6GHz band to avoid congestion. To keep costs down, it will buy the oldest Wi-Fi generation that can do this. Which generation must both the access points and the clients support?',
            choices: [
                'Wi-Fi 5 (802.11ac)',
                'Wi-Fi 6E (802.11ax)',
                'Wi-Fi 6 (802.11ax)',
                'Wi-Fi 7 (802.11be)'
            ],
            answer: [1],
            explain: 'Wi-Fi 6E is 802.11ax extended into the 6GHz band; plain Wi-Fi 6 uses only 2.4GHz and 5GHz. Wi-Fi 7 also supports 6GHz but is newer. Rule: band support comes from the certified generation, and a link can use only a band that both ends support.',
            why: [
                'Wi-Fi 5 is tempting because it moved traffic off 2.4GHz, but it operates only in the 5GHz band.',
                'Correct: Wi-Fi 6E is the first and oldest generation that can operate in the 6GHz band.',
                'Tempting because it shares the 802.11ax standard with 6E, but original Wi-Fi 6 devices cannot use the 6GHz band.',
                'Wi-Fi 7 supports 6GHz, but it is newer and costs more, so it is not the oldest generation that meets the need.'
            ]
        },
        {
            id: 'aplus-010',
            domain: 'c1-2',
            objective: '2.2',
            type: 'single',
            q: 'A technician runs a Wi-Fi analyzer in a U.S. office before installing a 2.4GHz access point. Neighboring networks are using channels 1 and 11 at 20MHz width. Which channel should the new access point use?',
            choices: [
                '6',
                '3',
                '9',
                '13'
            ],
            answer: [0],
            explain: 'In North America, channels 1, 6 and 11 are the only non-overlapping 20MHz channels in the 2.4GHz band. With 1 and 11 taken, channel 6 avoids overlap.',
            why: [
                'Correct: channel 6 is the remaining non-overlapping channel alongside 1 and 11.',
                'Channel 3 overlaps with both channel 1 and channel 6.',
                'Channel 9 overlaps with channel 11.',
                'Channel 13 is allowed in the U.S. only at reduced power, many devices will not use it, and it overlaps channel 11.'
            ]
        },
        {
            id: 'aplus-011',
            domain: 'c1-2',
            objective: '2.4',
            type: 'single',
            q: 'After a company moves to a new email provider, other organizations can no longer deliver mail to the company\'s domain. Which DNS record most likely needs to be updated?',
            choices: [
                'CNAME',
                'MX',
                'AAAA',
                'TXT'
            ],
            answer: [1],
            explain: 'Mail exchanger (MX) records tell sending servers which host accepts mail for a domain. If they still point to the old provider, inbound mail goes to the wrong place.',
            why: [
                'A CNAME creates an alias from one name to another; it does not designate mail servers.',
                'Correct: MX records direct inbound email to the domain\'s mail servers.',
                'An AAAA record maps a hostname to an IPv6 address.',
                'TXT records hold text such as SPF data, but they do not direct where mail is delivered.'
            ]
        },
        {
            id: 'aplus-012',
            domain: 'c1-2',
            objective: '2.4',
            type: 'single',
            q: 'A company starts sending invoices through a third-party billing service that uses the company\'s domain in the From address. Receiving servers reject the invoices, and the bounce messages say the sending IP address is not authorized to send for the domain. Which record should the administrator update?',
            choices: [
                'SPF',
                'DKIM',
                'DMARC',
                'MX'
            ],
            answer: [0],
            explain: 'An SPF record is a DNS TXT record listing the hosts allowed to send mail for a domain, so the billing service\'s servers must be added to it. Rule: SPF answers which servers may send, DKIM proves a message was signed by the domain, DMARC sets the policy for failures, and MX names inbound servers.',
            why: [
                'Correct: SPF lists authorized sending hosts, and the error says the sending IP is not authorized.',
                'DKIM is tempting because third-party senders often need their own DKIM key, but DKIM checks a message signature, not the sending IP address.',
                'DMARC is tempting because it tells receivers to reject failures, but it only sets policy and does not list allowed senders.',
                'MX is tempting because it is the best-known mail record, but it names servers that receive mail, not servers allowed to send it.'
            ]
        },
        {
            id: 'aplus-013',
            domain: 'c1-2',
            objective: '2.4',
            type: 'single',
            q: 'A network printer gets its address from DHCP, but users lose access whenever its address changes. The administrator wants the printer to always receive the same address while still being managed by DHCP. What should be configured?',
            choices: [
                'A DHCP exclusion for the printer\'s current address',
                'A shorter lease time on the scope',
                'A DHCP reservation for the printer\'s MAC address',
                'A larger DHCP scope'
            ],
            answer: [2],
            explain: 'A DHCP reservation binds an IP address to a device\'s MAC address, so the device always gets that address from the DHCP server.',
            why: [
                'An exclusion stops DHCP from handing out that address at all, so the printer could not receive it.',
                'Shorter leases make address changes more likely, not less.',
                'Correct: a reservation guarantees the same address while keeping the device on DHCP.',
                'Adding more addresses to the scope does not tie any address to the printer.'
            ]
        },
        {
            id: 'aplus-014',
            domain: 'c1-2',
            objective: '2.5',
            type: 'single',
            q: 'A technician must mount a wireless access point on a ceiling where no electrical outlet is available. The existing switch does not provide Power over Ethernet. What is the simplest way to power the access point?',
            choices: [
                'Add a PoE splitter at the access point end.',
                'Use powerline adapters to carry data to the access point.',
                'Add a PoE injector at the switch end of the cable.',
                'Replace the switch with a managed switch.'
            ],
            answer: [2],
            explain: 'A PoE injector sits between a non-PoE switch and the device and adds power to the Ethernet cable, so one cable carries data and power. Rule: an injector adds power where the source lacks it; a splitter takes power off a PoE cable for a device that lacks PoE support.',
            why: [
                'A splitter is tempting because it is PoE equipment, but it separates power from an already powered cable, and this switch supplies none.',
                'Powerline adapters are tempting because they carry network traffic over building wiring, but they need an outlet at the access point.',
                'Correct: an injector adds PoE to one link without replacing the switch.',
                'Managed switches are tempting as an upgrade, but managed means configurable features such as VLANs, not that the ports supply power.'
            ]
        },
        {
            id: 'aplus-015',
            domain: 'c1-2',
            objective: '2.6',
            type: 'single',
            q: 'A workstation on a DHCP network shows an IPv4 address of 169.254.37.12 and cannot reach the internet. What does this address indicate?',
            choices: [
                'The workstation was given a public address by the ISP.',
                'It could not get a lease from a DHCP server.',
                'The DNS server address is configured incorrectly.',
                'The workstation has a manually configured static address.'
            ],
            answer: [1],
            explain: 'Addresses in 169.254.0.0/16 come from Automatic Private IP Addressing (APIPA). Windows assigns one when it cannot get a lease from a DHCP server.',
            why: [
                '169.254.x.x is a link-local range and is never assigned as a public address.',
                'Correct: APIPA addresses mean the DHCP request went unanswered.',
                'A DNS problem would not change the IP address the client uses.',
                'APIPA is assigned automatically; nobody would choose a 169.254 address as a working static address.'
            ]
        },
        {
            id: 'aplus-016',
            domain: 'c1-2',
            objective: '2.6',
            type: 'single',
            q: 'Which of the following IPv4 addresses is in a private address range?',
            choices: [
                '172.32.1.1',
                '192.169.1.1',
                '172.20.5.10',
                '11.0.0.1'
            ],
            answer: [2],
            explain: 'The private IPv4 ranges are 10.0.0.0/8, 172.16.0.0/12 (172.16.0.0 to 172.31.255.255) and 192.168.0.0/16. 172.20.5.10 falls inside 172.16.0.0/12.',
            why: [
                '172.32.x.x is just outside the 172.16.0.0/12 private block and is public.',
                'The private block is 192.168.x.x; 192.169.x.x is public.',
                'Correct: 172.20.x.x is within 172.16.0.0 to 172.31.255.255.',
                'The private block is 10.x.x.x; 11.x.x.x is public.'
            ]
        },
        {
            id: 'aplus-017',
            domain: 'c1-2',
            objective: '2.7',
            type: 'single',
            q: 'A database cluster needs shared storage that each server sees as a locally attached disk it can format with its own file system. The storage traffic must run on a dedicated high-speed network, separate from user traffic. What should be deployed?',
            choices: [
                'NAS',
                'SAN',
                'DAS',
                'VLAN'
            ],
            answer: [1],
            explain: 'A storage area network (SAN) presents block-level storage to servers over a dedicated network, often Fibre Channel or iSCSI, so each server formats it like a local disk. A NAS shares files over the regular LAN using SMB or NFS. Rule: block-level storage the server formats points to a SAN; file shares point to a NAS.',
            why: [
                'A NAS is tempting because it is shared network storage, but it serves files over the LAN, not raw disks the servers format themselves.',
                'Correct: a SAN gives servers block-level access to shared storage over a dedicated network.',
                'Direct-attached storage is tempting because it looks like a local disk, but it connects to one server and is not shared over a network.',
                'A VLAN is tempting because it separates traffic on shared switches, but it only segments the network; it provides no storage.'
            ]
        },
        {
            id: 'aplus-018',
            domain: 'c1-2',
            objective: '2.8',
            type: 'single',
            q: 'A technician needs to find which of 48 unlabeled cables at a patch panel connects to a specific wall jack, without disconnecting each cable to check it. Which tool is designed for this job?',
            choices: [
                'Loopback plug',
                'Punchdown tool',
                'Cable tester',
                'Toner probe'
            ],
            answer: [3],
            explain: 'A toner puts a signal on the cable at the wall jack, and the probe picks up that signal at the patch panel without disconnecting anything. Rule: a toner and probe traces or identifies a cable, a cable tester checks the wiring of a cable you already know, and a loopback plug tests a port.',
            why: [
                'A loopback plug is tempting for port testing, but it only checks whether one port can send and receive; it does not locate a cable.',
                'A punchdown tool is tempting because the work happens at a patch panel, but it terminates wires and does not identify them.',
                'A cable tester is tempting because it checks cables, but it needs both ends of a known cable connected, so each one would have to be checked.',
                'Correct: the toner and probe trace a specific cable through a bundle without unplugging anything.'
            ]
        },
        {
            id: 'aplus-019',
            domain: 'c1-3',
            objective: '3.1',
            type: 'single',
            q: 'A graphic designer needs a monitor with wide viewing angles and accurate color. Which LCD panel technology is generally the best fit?',
            choices: [
                'IPS',
                'TN',
                'VA',
                'Mini-LED'
            ],
            answer: [0],
            explain: 'In-plane switching (IPS) panels are known for wide viewing angles and good color accuracy. TN panels are fast and cheap but shift color at an angle, and VA sits in between with strong contrast.',
            why: [
                'Correct: IPS panels give the most consistent color and the widest viewing angles of the common LCD types.',
                'TN panels have fast response times but poor viewing angles and weaker color.',
                'VA panels have high contrast, but their color and viewing angles usually fall short of IPS.',
                'Mini-LED describes the backlight, not the liquid crystal panel type that sets viewing angles.'
            ]
        },
        {
            id: 'aplus-020',
            domain: 'c1-3',
            objective: '3.2',
            type: 'single',
            q: 'A contractor is running network cable through the space above a drop ceiling that the building uses as an air return for the HVAC system. Which cable type does fire code typically require?',
            choices: [
                'Plenum-rated (CMP)',
                'Riser-rated (CMR)',
                'PVC general-purpose (CM)',
                'Shielded twisted pair (STP)'
            ],
            answer: [0],
            explain: 'Plenum-rated cable has a jacket that produces less smoke and fewer toxic fumes when it burns, so it is required in air-handling spaces. Rule: fire ratings form a hierarchy, CMP above CMR above CM; a higher rating can replace a lower one, but not the other way around.',
            why: [
                'Correct: air-handling spaces require plenum-rated cable because its jacket limits smoke and toxic fumes in a fire.',
                'Riser cable is tempting because it is fire-rated, but it is rated for vertical shafts between floors, not air-handling spaces.',
                'General-purpose PVC cable is common and cheap, but it gives off dense, toxic smoke when burned, so it is not allowed in a plenum.',
                'STP is tempting because it is a higher-grade cable, but shielding reduces interference and says nothing about fire rating.'
            ]
        },
        {
            id: 'aplus-021',
            domain: 'c1-3',
            objective: '3.2',
            type: 'single',
            q: 'Two buildings on a campus are about 15 km apart and need a high-speed wired link. Which cable type is the best choice?',
            choices: [
                'Multimode fiber',
                'Cat 6a twisted pair',
                'RG-6 coaxial',
                'Single-mode fiber'
            ],
            answer: [3],
            explain: 'Single-mode fiber uses a narrow core and a laser light source, which supports runs of many kilometers. Multimode fiber and copper are limited to far shorter distances.',
            why: [
                'Multimode fiber suits shorter runs, typically within a building or a few hundred meters.',
                'Twisted-pair Ethernet is limited to 100 meters per segment.',
                'RG-6 is used for cable TV and broadband drops, not 15 km data links.',
                'Correct: single-mode fiber is designed for long-distance links measured in kilometers.'
            ]
        },
        {
            id: 'aplus-022',
            domain: 'c1-3',
            objective: '3.2',
            type: 'single',
            q: 'A technician must link two older switches through their regular access ports. Neither switch supports Auto-MDIX, and the link stays down with a standard patch cable. Which cable should the technician make?',
            choices: [
                'Straight-through (T568B to T568B)',
                'Crossover (T568A to T568B)',
                'Rollover (pin 1 to pin 8)',
                'Straight-through (T568A to T568A)'
            ],
            answer: [1],
            explain: 'Two like devices, such as switch to switch or PC to PC, need their transmit and receive pairs swapped unless a port supports Auto-MDIX. T568A on one end and T568B on the other does that swap. Rule: the same standard on both ends makes a straight-through cable; mixed standards make a crossover.',
            why: [
                'This is the standard patch cable already tried; it does not swap the pairs that two like devices need.',
                'Correct: mixing T568A and T568B swaps the transmit and receive pairs for a switch-to-switch link.',
                'A rollover is tempting because it is used with switches, but it connects a console port to a serial port, not two data ports.',
                'Tempting because T568A is linked with crossovers, but the same standard on both ends is still a straight-through cable.'
            ]
        },
        {
            id: 'aplus-023',
            domain: 'c1-3',
            objective: '3.3',
            type: 'multi',
            q: 'A technician installs unbuffered ECC DIMMs in a desktop built on a consumer motherboard and CPU. The system boots and runs normally, but the firmware reports that ECC is not active. Which two conclusions are correct? (Choose two.)',
            choices: [
                'Registered (buffered) ECC modules are needed to turn ECC on.',
                'Enabling dual-channel mode in firmware will activate ECC.',
                'The modules are most likely running as ordinary non-ECC memory.',
                'ECC needs support from both the CPU and the motherboard.',
                'ECC must be enabled in the operating system\'s memory settings.'
            ],
            answer: [2, 3],
            explain: 'ECC memory stores extra check bits so the memory controller can detect and correct single-bit errors. The CPU and motherboard must both support it; otherwise unbuffered ECC modules usually run as plain memory. Rule: a feature built into one component only works when every part of the platform supports it.',
            why: [
                'Tempting because registered DIMMs are common in servers, but registered refers to signal buffering, and consumer boards generally cannot use registered modules at all.',
                'Tempting because it is a memory setting, but channel mode affects bandwidth, not whether error correction runs.',
                'Correct: without platform support, the extra check bits are ignored and the modules work as standard memory.',
                'Correct: error correction is done by the memory controller, so the CPU and board must both support ECC.',
                'Tempting because many features are toggled in the OS, but ECC runs in the memory controller below the OS, which can only report it.'
            ]
        },
        {
            id: 'aplus-024',
            domain: 'c1-3',
            objective: '3.3',
            type: 'single',
            q: 'A technician bought a DDR5 DIMM to upgrade a desktop whose motherboard has DDR4 DIMM slots. The module will not seat in the slot. What explains this?',
            choices: [
                'DDR generations are keyed differently and are not interchangeable.',
                'The module must be installed in the second memory channel before the first.',
                'The UEFI firmware must be updated before DDR5 will fit.',
                'The module is a SODIMM and needs a laptop slot.'
            ],
            answer: [0],
            explain: 'Each DDR generation has its key notch in a different place, so a module physically cannot be inserted into a slot built for another generation. They are electrically incompatible as well.',
            why: [
                'Correct: the notch position blocks a DDR5 module from fitting a DDR4 slot.',
                'Slot population order affects performance, not whether a module physically fits.',
                'Firmware cannot change the physical keying of the slot.',
                'The scenario states it is a DIMM; the problem is the generation, not the form factor.'
            ]
        },
        {
            id: 'aplus-025',
            domain: 'c1-3',
            objective: '3.4',
            type: 'single',
            q: 'A small server must keep running if any one drive fails. The owner has three identical drives and wants as much usable capacity as possible from them. Which configuration meets these requirements?',
            choices: [
                'RAID 0 across all three drives',
                'RAID 5 across all three drives',
                'RAID 1 with the third drive as a hot spare',
                'RAID 6 across all three drives'
            ],
            answer: [1],
            explain: 'RAID 5 needs at least three drives, survives one drive failure, and gives the capacity of all drives but one. Rule: compare usable capacity for the drives you have: RAID 1 and RAID 10 give half, RAID 5 gives n-1, and RAID 6 gives n-2 but needs at least four drives.',
            why: [
                'RAID 0 is tempting because it uses all the capacity, but it has no fault tolerance, so one failure loses the array.',
                'Correct: RAID 5 survives one failure and leaves two drives\' worth of usable space.',
                'This survives a failure, but it leaves only one drive\'s worth of usable space, half of what RAID 5 provides.',
                'RAID 6 is tempting because it survives two failures, but it needs at least four drives.'
            ]
        },
        {
            id: 'aplus-026',
            domain: 'c1-3',
            objective: '3.4',
            type: 'multi',
            q: 'A server\'s storage must survive a drive failure. The administrator wants a rebuild to simply copy data from a surviving drive instead of recalculating parity. Which two RAID levels meet this goal? (Choose two.)',
            choices: [
                'RAID 1',
                'RAID 10',
                'RAID 0',
                'RAID 5',
                'RAID 6'
            ],
            answer: [0, 1],
            explain: 'RAID 1 mirrors data between drives, and RAID 10 stripes data across mirrored pairs, so a rebuild copies from the surviving mirror. RAID 5 and RAID 6 rebuild by calculating from parity. Rule: mirroring rebuilds by copying, parity rebuilds by computing, and RAID 0 has nothing to rebuild from.',
            why: [
                'Correct: RAID 1 is a straight mirror, so a rebuild copies the surviving drive.',
                'Correct: RAID 10 stripes across mirrored pairs, so a rebuild copies from the failed drive\'s partner.',
                'RAID 0 is tempting because it is part of RAID 10, but on its own it stripes with no redundancy.',
                'RAID 5 is the most common fault-tolerant level, but it rebuilds by recalculating from distributed parity.',
                'RAID 6 survives two failures, which is tempting, but it also rebuilds by calculating from dual parity.'
            ]
        },
        {
            id: 'aplus-027',
            domain: 'c1-3',
            objective: '3.4',
            type: 'single',
            q: 'A technician installs an M.2 NVMe SSD in a laptop. The drive fits the slot, but neither the firmware nor the OS detects it. The laptop\'s documentation says the M.2 slot supports SATA drives. What is the most likely cause?',
            choices: [
                'The drive must first be formatted as NTFS.',
                'The drive needs a separate SATA power cable from the power supply.',
                'The slot supports SATA M.2 drives only, not NVMe.',
                'The laptop needs more RAM to use an NVMe drive.'
            ],
            answer: [2],
            explain: 'An M.2 slot can be wired for SATA, PCIe/NVMe or both. An NVMe drive in a SATA-only slot may fit physically but will not be detected because the interface does not match.',
            why: [
                'Formatting happens after detection; an unformatted drive still appears in firmware and Disk Management.',
                'M.2 drives draw power through the slot and have no separate power connector.',
                'Correct: M.2 is a form factor, and this slot does not provide the PCIe lanes NVMe needs.',
                'RAM capacity has no effect on whether the storage controller detects a drive.'
            ]
        },
        {
            id: 'aplus-028',
            domain: 'c1-3',
            objective: '3.5',
            type: 'single',
            q: 'A technician updates the UEFI firmware on a Windows 11 laptop. On the next boot, BitLocker asks for the 48-digit recovery key instead of starting normally. Which security component holds the BitLocker key and releases it only when the boot measurements match?',
            choices: [
                'HSM',
                'UEFI administrator password',
                'Secure Boot',
                'TPM'
            ],
            answer: [3],
            explain: 'The Trusted Platform Module (TPM) seals the BitLocker key to measurements of the boot process. The TPM can be a discrete chip or firmware TPM in the CPU, such as Intel PTT or AMD fTPM; Windows 11 requires TPM 2.0. Rule: changed boot measurements stop the TPM from releasing keys, so suspend BitLocker before firmware updates.',
            why: [
                'An HSM is tempting because it stores keys in hardware, but it is a separate appliance or card for managing keys at scale, not what laptop BitLocker uses.',
                'Tempting because it is firmware security, but a setup password only controls access to firmware settings and stores no disk keys.',
                'Secure Boot is tempting because it checks boot components, but it verifies signatures and does not store the BitLocker key.',
                'Correct: the TPM, whether discrete or firmware-based, releases the key only when boot measurements match.'
            ]
        },
        {
            id: 'aplus-029',
            domain: 'c1-3',
            objective: '3.6',
            type: 'single',
            q: 'Which power supply output voltage feeds the most demanding components in a modern PC, such as the CPU voltage regulators and the graphics card?',
            choices: [
                '5V',
                '12V',
                '3.3V',
                '120V AC'
            ],
            answer: [1],
            explain: 'The 12V rail carries most of the load in a modern PC. The CPU and GPU take 12V and step it down with on-board voltage regulators.',
            why: [
                '5V powers some drives and USB devices but carries far less load in modern systems.',
                'Correct: the CPU and GPU draw their power from the 12V rail.',
                '3.3V powers some low-power motherboard circuits and is not the main rail for the CPU or GPU.',
                '120V AC is the input from the wall, not an output of the power supply.'
            ]
        },
        {
            id: 'aplus-030',
            domain: 'c1-3',
            objective: '3.7',
            type: 'single',
            q: 'Confidential documents are being left in the output tray of a shared multifunction printer. Management wants each job held until its owner is at the device. Which feature meets this need?',
            choices: [
                'Printer audit logging',
                'Badge access to the print room',
                'Secured print',
                'Encrypting print jobs in transit'
            ],
            answer: [2],
            explain: 'Secured print, also called pull printing, holds a job in the queue until the user authenticates at the device with a badge or PIN. Rule: put the control where the exposure happens; here the risk is pages sitting in the tray, so the job must wait for its owner.',
            why: [
                'Audit logging is tempting because it tracks who printed what, but it records events after the fact and leaves pages in the tray.',
                'Restricting the room is tempting, but everyone allowed in can still pick up other people\'s printouts from the shared device.',
                'Correct: held jobs print only when the owner authenticates at the printer.',
                'Encryption protects the job on the network, but once it prints, the pages still sit unattended in the tray.'
            ]
        },
        {
            id: 'aplus-031',
            domain: 'c1-3',
            objective: '3.8',
            type: 'single',
            q: 'A laser printer shows a "Perform printer maintenance" message after reaching a set page count. Print quality is still acceptable. What should the technician do?',
            choices: [
                'Replace the toner cartridge and recalibrate the printer.',
                'Install the maintenance kit and reset the counter.',
                'Clean the printheads.',
                'Replace the ribbon.'
            ],
            answer: [1],
            explain: 'Laser printers track pages and prompt for a maintenance kit, which usually contains a fuser and rollers. After installing it, the technician resets the maintenance counter.',
            why: [
                'Low toner produces its own message and faded output, and print quality is still fine here.',
                'Correct: the message is a page-count reminder that the maintenance kit is due.',
                'Printhead cleaning is inkjet maintenance; laser printers do not have printheads.',
                'Ribbons are used in impact printers, not laser printers.'
            ]
        },
        {
            id: 'aplus-032',
            domain: 'c1-4',
            objective: '4.1',
            type: 'single',
            q: 'A company buys a new rack server with no operating system installed. It will host a dozen VMs running both Windows and Linux, and the administrator wants the virtualization layer to run directly on the hardware with the least overhead. What should be installed?',
            choices: [
                'A Type 1 hypervisor',
                'A Type 2 hypervisor',
                'A container engine',
                'An application streaming service'
            ],
            answer: [0],
            explain: 'A Type 1 (bare-metal) hypervisor installs directly on the server hardware with no general-purpose OS beneath it. A Type 2 hypervisor runs as an application on an existing OS. Rule: bare metal and servers point to Type 1; a laptop or desktop that already runs an OS points to Type 2.',
            why: [
                'Correct: a bare-metal hypervisor runs directly on the hardware and hosts many VMs efficiently.',
                'Type 2 is tempting because tools like it are familiar on desktops, but it needs a host OS underneath, which adds overhead.',
                'Containers are tempting because they are lightweight, but they share one host kernel and cannot run full Windows and Linux VMs side by side.',
                'Application streaming delivers individual apps to clients; it does not run full virtual machines.'
            ]
        },
        {
            id: 'aplus-033',
            domain: 'c1-4',
            objective: '4.1',
            type: 'single',
            q: 'A developer wants to package an application with its libraries so it runs the same way on any Linux host, while using fewer resources than a full virtual machine. What should the developer use?',
            choices: [
                'A Type 2 hypervisor',
                'Virtual Desktop Infrastructure',
                'A container',
                'Application virtualization (streaming)'
            ],
            answer: [2],
            explain: 'Containers bundle an application and its dependencies but share the host OS kernel, so they are lighter and start faster than VMs, each of which runs a full guest OS. Rule: if the workloads can share one OS kernel, use containers; if each needs its own OS, use VMs.',
            why: [
                'A Type 2 hypervisor is tempting because it isolates workloads, but each VM runs its own full OS, which uses more resources.',
                'VDI is tempting because it is a virtualization technology, but it delivers complete hosted desktops to users, not packaged server apps.',
                'Correct: containers share the host kernel and package the app with its dependencies.',
                'Tempting because it isolates an app with its files, but it delivers desktop apps to client computers, not portable packages for Linux hosts.'
            ]
        },
        {
            id: 'aplus-034',
            domain: 'c1-4',
            objective: '4.2',
            type: 'single',
            q: 'A development team wants to deploy its web application code to a cloud provider without patching operating systems or managing runtime software. Which cloud service model fits best?',
            choices: [
                'IaaS',
                'SaaS',
                'PaaS',
                'Private cloud'
            ],
            answer: [2],
            explain: 'Platform as a service (PaaS) gives developers a managed runtime: the provider handles the OS and middleware, and the customer supplies the code and data.',
            why: [
                'With IaaS the customer still manages the operating systems on the virtual machines.',
                'SaaS delivers a finished application to end users; customers do not deploy their own code to it.',
                'Correct: PaaS hosts the customer\'s code while the provider manages the OS and runtime.',
                'Private cloud is a deployment model, not a service model, and does not by itself remove OS management.'
            ]
        },
        {
            id: 'aplus-035',
            domain: 'c1-4',
            objective: '4.2',
            type: 'single',
            q: 'An online retailer\'s cloud environment automatically adds servers during a holiday sales spike and removes them when traffic returns to normal. Which cloud characteristic does this describe?',
            choices: [
                'Multitenancy',
                'Elasticity',
                'Metered utilization',
                'High availability'
            ],
            answer: [1],
            explain: 'Elasticity is the ability to add and release resources automatically as demand changes, so capacity tracks load. Rule: elasticity grows and shrinks with demand, high availability survives failures, metering bills for use, and multitenancy means customers share infrastructure.',
            why: [
                'Multitenancy is tempting because cloud hosts serve many customers, but it describes sharing infrastructure, not changing capacity.',
                'Correct: resources grow and shrink automatically with demand.',
                'Metering is tempting because extra servers cost more, but it measures usage for billing and does not add or remove capacity.',
                'High availability is tempting because it keeps the site running, but it uses redundancy to survive failures, not to follow demand.'
            ]
        },
        {
            id: 'aplus-036',
            domain: 'c1-4',
            objective: '4.2',
            type: 'single',
            q: 'Several regional hospitals agree to share cloud infrastructure that is built to meet the same healthcare compliance requirements. No other organizations may use it. Which cloud model is this?',
            choices: [
                'Public cloud',
                'Private cloud',
                'Hybrid cloud',
                'Community cloud'
            ],
            answer: [3],
            explain: 'A community cloud is shared by several organizations with common requirements, such as the same regulations, and is closed to everyone else. Rule: ask who may use it: anyone (public), one organization (private), a defined group with shared needs (community), or a mix of models (hybrid).',
            why: [
                'Public cloud is tempting because many organizations share it, but it is open to any paying customer.',
                'Private cloud is tempting because it is closed and compliance-focused, but it serves a single organization.',
                'Hybrid is tempting because several parties are involved, but hybrid means combining deployment models, such as private plus public.',
                'Correct: several organizations with shared requirements share infrastructure closed to others.'
            ]
        },
        {
            id: 'aplus-037',
            domain: 'c1-5',
            objective: '5.1',
            type: 'single',
            q: 'A desktop shuts down without warning after about 20 minutes of video rendering and starts normally after sitting for a few minutes. Monitoring software shows the CPU temperature climbing steadily to about 100 degrees C just before each shutdown. What should the technician do first?',
            choices: [
                'Replace the power supply with a higher-wattage unit.',
                'Clean the CPU cooler and renew the thermal paste.',
                'Update the graphics card driver.',
                'Run a memory diagnostic overnight.'
            ],
            answer: [1],
            explain: 'A shutdown that follows a rising temperature and clears after the system cools is the CPU\'s thermal protection. Restoring cooling, by removing dust and renewing old thermal paste, fixes the root cause. Rule: when a failure tracks temperature and recovers after cooling, fix the cooling before replacing parts.',
            why: [
                'A weak PSU is tempting because the shutdowns happen under load, but the climbing CPU temperature before each one points to heat, not power.',
                'Correct: restoring heat transfer from the CPU removes the overheating that triggers the shutdowns.',
                'A driver is tempting because rendering uses the GPU, but a driver fault causes crashes or errors, not a temperature-linked power-off.',
                'Bad RAM can cause crashes under load, but it produces errors or blue screens, not shutdowns that follow the CPU temperature.'
            ]
        },
        {
            id: 'aplus-038',
            domain: 'c1-5',
            objective: '5.1',
            type: 'single',
            q: 'Every time an older desktop is unplugged overnight, it shows the wrong date and time the next morning and its firmware settings are back to defaults. What is the most likely fix?',
            choices: [
                'Replace the CMOS battery.',
                'Update the network time server address.',
                'Replace the power supply.',
                'Reseat the RAM modules.'
            ],
            answer: [0],
            explain: 'The CMOS battery keeps the real-time clock and firmware settings while the PC has no power. When it weakens, the time and settings reset whenever AC power is removed.',
            why: [
                'Correct: a weak CMOS battery cannot maintain the clock or settings without AC power.',
                'Time sync can correct the clock after boot, but it does not explain firmware settings resetting.',
                'The PSU provides power only while plugged in; it does not keep settings while unplugged.',
                'RAM contents are not involved in storing the time or firmware settings.'
            ]
        },
        {
            id: 'aplus-039',
            domain: 'c1-5',
            objective: '5.2',
            type: 'single',
            q: 'A user\'s computer displays a S.M.A.R.T. warning for the system drive at startup, but the computer still boots and works normally. What should the technician do first?',
            choices: [
                'Back up the data now, then replace the drive.',
                'Run chkdsk /r to repair the drive\'s bad sectors.',
                'Defragment the drive to move data off weak areas.',
                'Reinstall the operating system on the same drive.'
            ],
            answer: [0],
            explain: 'A S.M.A.R.T. warning means the drive is predicting its own failure. The priority is to copy the data off while the drive still works, then replace it. Rule: when hardware warns that it is failing, protect the data first; repairs and scans that stress the device come later, if at all.',
            why: [
                'Correct: the drive is predicting failure, so the data must be protected before anything else.',
                'chkdsk /r is tempting because it handles bad sectors, but its full surface scan stresses a failing drive before the data is safe.',
                'Defragmenting is tempting as maintenance, but it does not repair anything and adds heavy wear to a drive that is already failing.',
                'Reinstalling to a failing drive wastes time and can destroy data that has not been backed up.'
            ]
        },
        {
            id: 'aplus-040',
            domain: 'c1-5',
            objective: '5.2',
            type: 'single',
            q: 'A technician adds a second, blank SSD to a working desktop. On the next boot, the system reports that no bootable device was found. Both drives appear in the firmware setup. What should the technician check first?',
            choices: [
                'The SATA data cable on the original drive for damage',
                'Whether the new SSD needs to be formatted as NTFS',
                'The memory modules for errors',
                'The firmware boot order'
            ],
            answer: [3],
            explain: 'Adding a drive can change the firmware boot order so the blank drive is tried first. Putting the drive that holds the OS (or Windows Boot Manager) at the top of the boot order fixes it.',
            why: [
                'The firmware already sees both drives, so cabling is unlikely to be the problem.',
                'Formatting the new drive will not make it bootable or change the boot order.',
                'Memory problems cause POST errors or crashes, not a missing boot device right after adding a drive.',
                'Correct: the system is trying to boot from the blank drive.'
            ]
        },
        {
            id: 'aplus-041',
            domain: 'c1-5',
            objective: '5.2',
            type: 'multi',
            q: 'A user brings in a desktop that has a mechanical hard drive. It has become noisy, and opening files is slow. Which two noises most likely mean the hard drive is failing and the data should be backed up now? (Choose two.)',
            choices: [
                'Repeated clicking',
                'Fan noise that rises with CPU load',
                'Beeps from the motherboard at power-on',
                'A high-pitched whine under heavy load',
                'Grinding or scraping'
            ],
            answer: [0, 4],
            explain: 'A mechanical drive has spinning platters and moving read/write heads. Repeated clicking usually means the heads cannot read or keep resetting, and grinding points to bearing failure or heads touching the platters. Rule: tie each noise to a part that moves; only parts with moving pieces make mechanical failure sounds.',
            why: [
                'Correct: repeated clicking often means the read/write heads are failing.',
                'Fan noise is tempting because it is a mechanical sound in the case, but fan speed tracks temperature, not drive health.',
                'Beeps are tempting because they signal hardware faults, but POST beep codes usually point to RAM or video, before the drive is used.',
                'A whine is tempting because it sounds electrical and worrying, but coil whine comes from power supply or GPU components, not the drive.',
                'Correct: grinding points to bearing or platter damage inside the drive.'
            ]
        },
        {
            id: 'aplus-042',
            domain: 'c1-5',
            objective: '5.3',
            type: 'single',
            q: 'A laptop screen appears almost black, but when the technician shines a flashlight at it, the desktop image is faintly visible. What is the most likely cause?',
            choices: [
                'A failed graphics processor',
                'An incorrect input source',
                'Dead pixels',
                'A failed backlight or inverter'
            ],
            answer: [3],
            explain: 'If the image is present but unlit, the LCD panel is working and the backlight is not. On older CCFL panels this is often the inverter; on LED panels, the backlight or its driver.',
            why: [
                'A failed GPU would produce no image at all, not a faint but correct one.',
                'Input source selection applies to external monitors and projectors, not a built-in panel.',
                'Dead pixels are individual dots that stay dark, not a whole screen too dim to see.',
                'Correct: the LCD is drawing the image, but nothing is lighting it.'
            ]
        },
        {
            id: 'aplus-043',
            domain: 'c1-5',
            objective: '5.3',
            type: 'single',
            q: 'A kiosk with an OLED display has shown the same menu bar for months. A faint outline of that menu bar now stays visible over other content, even after the kiosk was off overnight and the panel\'s pixel refresh routine ran. What is this called?',
            choices: [
                'Dead pixels',
                'Burn-in',
                'Temporary image retention',
                'A failing backlight'
            ],
            answer: [1],
            explain: 'Burn-in is permanent image retention caused by showing static content for long periods, because OLED pixels age unevenly. Rule: a ghost image that fades after rest or a refresh cycle is temporary image retention; one that survives them is burn-in.',
            why: [
                'Dead pixels are tempting because they are permanent too, but they are single dots that stay off, not the outline of an image.',
                'Correct: uneven pixel wear from static content has left a permanent ghost image.',
                'Image retention is tempting because it looks the same at first, but it fades with rest or a pixel refresh, and this ghost did not.',
                'A backlight is tempting for display faults, but OLED pixels make their own light, so there is no backlight to fail.'
            ]
        },
        {
            id: 'aplus-044',
            domain: 'c1-5',
            objective: '5.3',
            type: 'single',
            q: 'A conference room projector shuts itself off after about 30 minutes of use, then refuses to power back on until it has sat for a while. The lamp was replaced last month. What should the technician check first?',
            choices: [
                'The video cable between the laptop and projector',
                'The air filters and vents for dust or blockage',
                'The lamp\'s remaining hours',
                'The auto power-off timer setting'
            ],
            answer: [1],
            explain: 'A projector that shuts down after running and will not restart until it cools is in thermal protection, usually from clogged filters or blocked vents. Rule: when a device fails after warming up and recovers after cooling, check airflow before anything else.',
            why: [
                'A bad cable is tempting for projector problems, but it causes signal loss or a blank image, not the projector powering off.',
                'Correct: shutting down after running and recovering after cooling points to overheating.',
                'An old lamp is tempting, but this lamp is new, and a worn lamp dims or fails to light rather than recovering after a rest.',
                'A power-off timer is tempting because it turns the projector off, but it would not stop the projector from powering on again right away.'
            ]
        },
        {
            id: 'aplus-045',
            domain: 'c1-5',
            objective: '5.4',
            type: 'single',
            q: 'A user reports that their phone\'s screen is lifting away from the frame and the back of the phone looks bulged. What should the technician advise?',
            choices: [
                'Fully discharge and recharge the battery to recalibrate it.',
                'Reglue the screen and watch for further lifting.',
                'Install an OS update to fix the battery driver.',
                'Stop using it and have the battery replaced.'
            ],
            answer: [3],
            explain: 'A bulging case is a classic sign of a swollen lithium-ion battery, which can catch fire. The phone should be powered off, not charged or pressed, and the battery replaced and recycled properly. Rule: physical swelling is a safety hazard that only replacement fixes; calibration and software cannot repair a damaged cell.',
            why: [
                'Calibration is tempting for battery complaints, but cycling a swollen battery adds stress and raises the risk of fire.',
                'Regluing is tempting because the screen is what lifted, but pressing on a swollen battery can puncture it and start a fire.',
                'An update is tempting for battery issues, but swelling is physical damage to the cell that software cannot fix.',
                'Correct: a swollen battery is a fire hazard, so the phone should not be used or charged until the battery is replaced.'
            ]
        },
        {
            id: 'aplus-046',
            domain: 'c1-5',
            objective: '5.5',
            type: 'single',
            q: 'Users report choppy, robotic VoIP audio, although speed tests show plenty of bandwidth. A continuous ping to the voice server returns 18 ms, 95 ms, 22 ms, 140 ms and 25 ms, with no lost packets. What is the problem, and what is a common fix?',
            choices: [
                'High jitter; configure QoS to prioritize voice traffic.',
                'Packet loss; replace the patch cables feeding the IP phones.',
                'High latency; move to a closer voice server.',
                'Low bandwidth; upgrade the internet connection.'
            ],
            answer: [0],
            explain: 'The replies swing widely from one packet to the next, which is jitter, and real-time voice is very sensitive to it. QoS that gives voice traffic priority is a common fix. Rule: latency is how long packets take, jitter is how much that delay varies, and packet loss is packets that never arrive.',
            why: [
                'Correct: the delay varies widely between packets, which is jitter, and QoS gives voice packets priority.',
                'Packet loss also causes choppy audio, but the ping shows every reply arrived.',
                'Latency is tempting because some replies are slow, but the delay is mostly low; the problem is how much it varies.',
                'Bandwidth is tempting for poor call quality, but the speed tests show plenty of it.'
            ]
        },
        {
            id: 'aplus-047',
            domain: 'c1-5',
            objective: '5.5',
            type: 'single',
            q: 'A switch log shows that the port connected to one workstation goes down and up dozens of times an hour, and the user complains of constant disconnects. What should the technician try first?',
            choices: [
                'Update the workstation\'s NIC driver.',
                'Set the switch port to a fixed speed and duplex.',
                'Replace the workstation\'s patch cable.',
                'Release and renew the workstation\'s IP address.'
            ],
            answer: [2],
            explain: 'A port that keeps going down and up is flapping, which usually comes from a damaged cable, a loose connector or a failing NIC. Replacing the patch cable is the quickest and least disruptive test. Rule: work up from the physical layer, and test the cheapest physical part first.',
            why: [
                'A driver is tempting because it can drop connections, but a link physically going down and up points first to the cable or connector.',
                'Hard-setting speed and duplex is tempting for link problems, but a mismatch causes slow, error-filled traffic rather than repeated link loss.',
                'Correct: a faulty cable is the most common and easiest-to-test cause of a flapping port.',
                'Renewing the address is tempting for disconnects, but IP addressing cannot bring the physical link down and up.'
            ]
        },
        {
            id: 'aplus-048',
            domain: 'c1-5',
            objective: '5.5',
            type: 'multi',
            q: 'Users in a break room lose their 2.4GHz Wi-Fi connection whenever the microwave oven is running. Which two actions would most likely resolve the problem? (Choose two.)',
            choices: [
                'Widen the access point\'s 2.4GHz channel to 40MHz.',
                'Connect the clients to the 5GHz band instead.',
                'Increase the access point\'s transmit power.',
                'Relocate the access point farther from the microwave oven.',
                'Change the network\'s security from WPA2 to WPA3.'
            ],
            answer: [1, 3],
            explain: 'Microwave ovens leak energy near 2.4GHz and drown out Wi-Fi signals in that band. Moving clients to 5GHz avoids the interference, and moving the access point away from the oven improves the signal-to-noise ratio. Rule: fix interference by moving away from it in frequency or distance, not by adding power or width.',
            why: [
                'A wider channel is tempting because it adds throughput, but it covers more of the 2.4GHz band and picks up even more interference.',
                'Correct: the 5GHz band is outside the frequencies a microwave oven disrupts.',
                'More power is tempting, but it only strengthens the access point\'s side; clients still transmit at the same power into the same noise.',
                'Correct: more distance from the interference source improves the signal-to-noise ratio.',
                'WPA3 improves security, but the encryption method has no effect on radio interference.'
            ]
        },
        {
            id: 'aplus-049',
            domain: 'c1-5',
            objective: '5.6',
            type: 'single',
            q: 'Pages from a laser printer come out with toner that smears or rubs off when touched. Which component is the most likely cause?',
            choices: [
                'Fuser assembly',
                'Pickup roller',
                'Imaging drum',
                'Transfer roller'
            ],
            answer: [0],
            explain: 'The fuser uses heat and pressure to bond toner to the paper. If it is not getting hot enough, the toner stays loose and smears. Rule: map the symptom to the laser printing step: loose toner is fusing, faint output is transfer, repeating marks are the drum, and jams are paper feed.',
            why: [
                'Correct: a weak or failing fuser leaves the toner unbonded.',
                'Pickup rollers are tempting because they wear out often, but they cause misfeeds and jams, not loose toner.',
                'The drum is tempting because it handles toner, but a bad drum causes repeating marks or ghost images, not smearing.',
                'The transfer roller is tempting because it moves toner onto the paper, but a fault there gives faint output, not toner that rubs off.'
            ]
        },
        {
            id: 'aplus-050',
            domain: 'c1-5',
            objective: '5.6',
            type: 'single',
            q: 'A Windows print queue shows several documents stuck as "Printing" and no new jobs go through, even though the printer itself is online and idle. What should the technician do first?',
            choices: [
                'Power-cycle the printer.',
                'Reinstall the printer driver.',
                'Cancel the jobs from the printer\'s control panel.',
                'Restart the Print Spooler service.'
            ],
            answer: [3],
            explain: 'The printer is idle, so the jobs are stuck on the Windows side. Restarting the Print Spooler service releases the frozen queue so printing can resume. Rule: find where the job is stuck; a problem in the computer\'s queue is fixed on the computer, not at the printer.',
            why: [
                'Power-cycling is tempting as a quick reset, but the printer is idle and the jobs are stuck in the Windows queue.',
                'A driver reinstall is tempting for print problems, but drivers affect output format, and restarting the spooler is quicker and fixes a stuck queue.',
                'Tempting because it clears jobs, but the jobs never reached the printer, so its control panel has nothing to cancel.',
                'Correct: restarting the spooler clears a frozen Windows print queue.'
            ]
        },
        {
            id: 'aplus-051',
            domain: 'c2-1',
            objective: '1.1',
            type: 'single',
            q: 'A user needs to move 8GB video files between a Windows PC and a Mac on a USB flash drive, reading and writing on both systems without extra software. Which file system should the drive use?',
            choices: [
                'FAT32',
                'NTFS',
                'exFAT',
                'APFS'
            ],
            answer: [2],
            explain: 'exFAT is supported for read and write by both Windows and macOS and has no 4GB file size limit, which makes it the usual choice for large files on removable media.',
            why: [
                'FAT32 works on both systems but cannot store a single file larger than 4GB.',
                'macOS can read NTFS but cannot write to it natively.',
                'Correct: exFAT works natively on both systems and supports files larger than 4GB.',
                'APFS is the macOS file system, and Windows cannot read it natively.'
            ]
        },
        {
            id: 'aplus-052',
            domain: 'c2-1',
            objective: '1.2',
            type: 'single',
            q: 'A technician is installing Windows on a new 4TB boot drive in a UEFI system and wants the whole drive usable as one partition. Which partition style should be used?',
            choices: [
                'GPT',
                'MBR',
                'exFAT',
                'ReFS'
            ],
            answer: [0],
            explain: 'GUID Partition Table (GPT) supports disks far larger than 2TB and is the partition style UEFI systems boot from. MBR is limited to 2TB disks and four primary partitions.',
            why: [
                'Correct: GPT supports very large disks and is used for UEFI boot.',
                'MBR cannot address more than 2TB, so part of a 4TB drive would be unusable.',
                'exFAT is a file system, not a partition style, and Windows cannot be installed on it.',
                'ReFS is a file system, not a partition style, and is not used for the Windows boot volume.'
            ]
        },
        {
            id: 'aplus-053',
            domain: 'c2-1',
            objective: '1.3',
            type: 'single',
            q: 'A new employee\'s laptop runs Windows 11 Home. The employee must join the company\'s Active Directory domain. What must the technician do?',
            choices: [
                'Enable Remote Desktop on the laptop.',
                'Install the Windows 11 Home N edition.',
                'Turn on BitLocker before joining the domain.',
                'Upgrade the laptop to Windows 11 Pro.'
            ],
            answer: [3],
            explain: 'Windows Home editions cannot join an Active Directory domain. Upgrading the laptop to Windows 11 Pro (or a higher edition) adds domain join.',
            why: [
                'Remote Desktop has nothing to do with domain membership, and Home cannot host RDP sessions anyway.',
                'N editions only lack bundled media features; they still cannot join a domain.',
                'Encryption is not a prerequisite for domain join, and it does not add the feature to Home.',
                'Correct: Pro and higher editions support joining a domain.'
            ]
        },
        {
            id: 'aplus-054',
            domain: 'c2-1',
            objective: '1.3',
            type: 'single',
            q: 'A technician tries to open the Local Group Policy Editor on a user\'s personal laptop, but gpedit.msc cannot be found. The computer most likely runs which Windows edition?',
            choices: [
                'Windows 11 Home',
                'Windows 11 Pro',
                'Windows 11 Enterprise',
                'Windows 10 Pro for Workstations'
            ],
            answer: [0],
            explain: 'gpedit.msc is not included in Windows Home. Home also lacks domain join, BitLocker management, Remote Desktop hosting and Hyper-V, which Pro and higher editions include. Rule: when a business or admin feature is missing, check the edition first.',
            why: [
                'Correct: Home editions do not include the Local Group Policy Editor.',
                'Pro is tempting because it is common on personal laptops, but it includes gpedit.msc.',
                'Enterprise is tempting because it is a business edition, but it includes gpedit.msc and more.',
                'Tempting because it is unusual, but it is built on Pro and includes gpedit.msc.'
            ]
        },
        {
            id: 'aplus-055',
            domain: 'c2-1',
            objective: '1.4',
            type: 'single',
            q: 'An accounting application crashed overnight while no one was logged on. The technician wants to see the error details and the exact time it happened. Which tool should be used?',
            choices: [
                'Event Viewer (eventvwr.msc)',
                'Task Scheduler (taskschd.msc)',
                'Resource Monitor (resmon.exe)',
                'Performance Monitor (perfmon.msc)'
            ],
            answer: [0],
            explain: 'Event Viewer stores the Application and System logs, which record application errors with timestamps, sources and event IDs. Rule: to find out what happened in the past, use a log; live monitoring tools show only what is happening now.',
            why: [
                'Correct: the Application log records crashes with the time and error details.',
                'Task Scheduler is tempting because the crash happened overnight, but it records task runs, not application error details.',
                'Resource Monitor is tempting for application problems, but it shows live usage and keeps no history of past crashes.',
                'Performance Monitor is tempting because it can log data, but it collects counters you set up in advance, not application error events.'
            ]
        },
        {
            id: 'aplus-056',
            domain: 'c2-1',
            objective: '1.5',
            type: 'single',
            q: 'A Windows PC boots, but several built-in tools crash on launch, and an event log entry says a protected system file failed an integrity check. chkdsk /f has already run and found no file system errors. Which command should the technician run next?',
            choices: [
                'chkdsk /r',
                'bootrec /rebuildbcd',
                'sfc /scannow',
                'gpupdate /force'
            ],
            answer: [2],
            explain: 'System File Checker compares protected Windows files with cached known-good copies and replaces damaged ones. If it cannot repair them, DISM /RestoreHealth repairs the component store and sfc is run again. Rule: match the tool to the layer: chkdsk fixes the file system and disk, sfc fixes Windows file contents.',
            why: [
                'chkdsk /r is tempting as a deeper scan, but the file system was already clean, and the problem is damaged file contents.',
                'bootrec is tempting because it repairs Windows, but it fixes boot records, and this PC already boots.',
                'Correct: sfc checks protected system files and replaces corrupted ones.',
                'gpupdate is tempting because policies change system behavior, but it reapplies Group Policy and does not check file integrity.'
            ]
        },
        {
            id: 'aplus-057',
            domain: 'c2-1',
            objective: '1.5',
            type: 'single',
            q: 'A domain user is not receiving a drive mapping that a Group Policy Object should provide. The technician wants a report of which policies were actually applied to that user and computer. Which command should be run?',
            choices: [
                'gpupdate /force',
                'gpresult /r',
                'net use',
                'whoami'
            ],
            answer: [1],
            explain: 'gpresult (for example, gpresult /r) reports the Resultant Set of Policy, showing which GPOs applied and which were filtered out.',
            why: [
                'gpupdate reapplies policy but does not report which GPOs took effect.',
                'Correct: gpresult shows which GPOs were applied to the user and computer.',
                'net use lists or creates drive mappings; it does not explain which policies applied.',
                'whoami shows the current user identity, not applied policies.'
            ]
        },
        {
            id: 'aplus-058',
            domain: 'c2-1',
            objective: '1.6',
            type: 'single',
            q: 'A user docks a Windows laptop to two external monitors and wants to keep working with the lid closed, but the laptop goes to sleep when the lid shuts. Where should the technician change this?',
            choices: [
                'Display settings, under Multiple displays',
                'Device Manager, on the monitor driver',
                'Power Options in Control Panel',
                'Screen saver settings in Personalization'
            ],
            answer: [2],
            explain: 'In Power Options, "Choose what closing the lid does" sets the lid action, for example to Do nothing when plugged in. Rule: what a hardware switch does, such as the lid or power button, is a power setting, not a display setting.',
            why: [
                'Display settings are tempting because the problem involves monitors, but they arrange screens and do not control the lid switch.',
                'Device Manager is tempting for monitor problems, but driver settings do not decide what closing the lid does.',
                'Correct: Power Options holds the lid-close action, which can be set to Do nothing.',
                'Screen saver settings are tempting because they control idle behavior, but they do not respond to the lid switch.'
            ]
        },
        {
            id: 'aplus-059',
            domain: 'c2-1',
            objective: '1.7',
            type: 'single',
            q: 'A field technician often connects a Windows laptop to a phone hotspot with a small data plan. Large Windows updates keep downloading over the hotspot. What should be configured?',
            choices: [
                'Change the network profile to Public.',
                'Mark the hotspot connection as metered.',
                'Assign a static IP address to the laptop.',
                'Configure a proxy server in Windows.'
            ],
            answer: [1],
            explain: 'Marking a network connection as metered tells Windows to limit background data, including deferring most update downloads, on that connection.',
            why: [
                'The Public profile changes discovery and firewall behavior, not data usage.',
                'Correct: metered connections limit background data use such as updates.',
                'Static addressing does not affect how much data is downloaded.',
                'A proxy changes how traffic is routed, not how much is downloaded.'
            ]
        },
        {
            id: 'aplus-060',
            domain: 'c2-1',
            objective: '1.8',
            type: 'single',
            q: 'A company issues MacBooks to its sales staff. If a laptop is stolen, the data on its internal drive must be unreadable without the user\'s password, and IT wants each recovery key stored centrally. Which feature should be enabled?',
            choices: [
                'Time Machine',
                'BitLocker',
                'Find My',
                'FileVault'
            ],
            answer: [3],
            explain: 'FileVault encrypts the whole macOS startup disk, and its recovery keys can be escrowed through MDM. Rule: protecting data on a stolen device calls for full-disk encryption; know each platform\'s tool: FileVault on macOS, BitLocker on Windows, and LUKS on Linux.',
            why: [
                'Time Machine is tempting because it protects data, but it makes backups and does nothing to stop a thief reading the drive.',
                'BitLocker is tempting because it is full-disk encryption, but it is a Windows feature and is not available on macOS.',
                'Find My is tempting for a stolen laptop, but it locates or erases the Mac remotely and does not encrypt the drive.',
                'Correct: FileVault encrypts the whole startup disk, and its recovery keys can be stored centrally.'
            ]
        },
        {
            id: 'aplus-061',
            domain: 'c2-1',
            objective: '1.9',
            type: 'single',
            q: 'A Linux user needs to run a single command that requires root privileges without logging in as root. Which command should precede it?',
            choices: [
                'su',
                'chmod',
                'sudo',
                'chown'
            ],
            answer: [2],
            explain: 'sudo runs one command with elevated privileges, after checking that the user is authorized. su switches the session to another user, root by default.',
            why: [
                'su switches to another user\'s shell, which is what the user wants to avoid.',
                'chmod changes file permissions; it does not elevate a command.',
                'Correct: sudo runs a single command as root for an authorized user.',
                'chown changes file ownership.'
            ]
        },
        {
            id: 'aplus-062',
            domain: 'c2-1',
            objective: '1.9',
            type: 'multi',
            q: 'A Linux workstation resolves some hostnames incorrectly. Which two files should the technician inspect for name resolution settings? (Choose two.)',
            choices: [
                '/etc/fstab',
                '/etc/hosts',
                '/etc/shadow',
                '/etc/passwd',
                '/etc/resolv.conf'
            ],
            answer: [1, 4],
            explain: '/etc/hosts holds static hostname-to-address entries checked locally, and /etc/resolv.conf lists the DNS servers the system queries.',
            why: [
                '/etc/fstab defines file systems to mount at boot.',
                'Correct: static entries in /etc/hosts can override DNS answers.',
                '/etc/shadow stores hashed user passwords.',
                '/etc/passwd stores user account information.',
                'Correct: this file lists the DNS servers and search domains in use.'
            ]
        },
        {
            id: 'aplus-063',
            domain: 'c2-1',
            objective: '1.10',
            type: 'single',
            q: 'A user\'s Windows 10 PC fails to install an application, showing a message that it is not compatible with this version of Windows. The technician confirms that the vendor only ships a 64-bit build. What is the most likely cause?',
            choices: [
                'The computer does not have a dedicated graphics card.',
                'The user is not a member of the Administrators group.',
                'The computer is running a 32-bit version of Windows.',
                'The installer was downloaded instead of installed from physical media.'
            ],
            answer: [2],
            explain: 'A 64-bit application cannot run on a 32-bit operating system, while a 64-bit OS can run most 32-bit applications. Windows 10 was sold in both versions, but Windows 11 is 64-bit only. Rule: check the OS architecture in System > About before blaming permissions or hardware.',
            why: [
                'A graphics requirement would cause a different message or poor performance, not an OS compatibility error.',
                'A permissions problem would produce an access or elevation error, not a compatibility error.',
                'Correct: 64-bit software requires a 64-bit OS.',
                'The distribution method does not change application-to-OS compatibility.'
            ]
        },
        {
            id: 'aplus-064',
            domain: 'c2-1',
            objective: '1.11',
            type: 'single',
            q: 'A new hire can sign in to the company\'s cloud productivity portal and use the web apps, but the installed desktop apps report that the product is unlicensed. What should the administrator check?',
            choices: [
                'The license assigned to the user\'s account',
                'The DNS server settings on the laptop',
                'The sync settings on the user\'s cloud storage folder',
                'The TPM status in the laptop\'s firmware'
            ],
            answer: [0],
            explain: 'Cloud productivity suites tie desktop app rights to a license assigned to the user\'s account. If no suitable license is assigned, the desktop apps run unlicensed even though sign-in works.',
            why: [
                'Correct: desktop app activation depends on the license assigned to the account.',
                'The user can already reach the portal, so name resolution is working.',
                'Sync settings affect file storage, not app licensing.',
                'A TPM is not required for productivity suite license activation.'
            ]
        },
        {
            id: 'aplus-065',
            domain: 'c2-2',
            objective: '2.1',
            type: 'single',
            q: 'A security review finds that visitors at a data center often walk in right behind employees who badge through the main door. Which physical control would best stop this?',
            choices: [
                'Access control vestibule',
                'Video surveillance',
                'Bollards',
                'Requiring a PIN with each badge swipe'
            ],
            answer: [0],
            explain: 'An access control vestibule, formerly called a mantrap, has two interlocking doors so only one person passes at a time. That directly stops tailgating. Rule: pick a control that physically prevents the behavior; controls that record it or strengthen someone else\'s login do not.',
            why: [
                'Correct: interlocking doors let only one authenticated person through at a time.',
                'Cameras are tempting because they watch the door, but they record tailgating rather than physically preventing it.',
                'Bollards are tempting as a physical barrier, but they stop vehicles, not people walking through a doorway.',
                'A PIN is tempting because it adds a factor, but it strengthens the employee\'s entry, and the visitor still walks in behind.'
            ]
        },
        {
            id: 'aplus-066',
            domain: 'c2-2',
            objective: '2.1',
            type: 'multi',
            q: 'A bank\'s login asks for a password and then the answer to a security question. An auditor says this is not true multifactor authentication. Which two items could replace the security question to make it MFA? (Choose two.)',
            choices: [
                'A PIN',
                'A longer, more complex password',
                'A second security question',
                'A smart card',
                'A hardware token'
            ],
            answer: [3, 4],
            explain: 'MFA needs factors from different categories: something you know, have or are. A password plus a security question is two knowledge factors. Smart cards and hardware tokens are things the user has. Rule: count factor categories, not the number of steps.',
            why: [
                'A PIN is tempting because it is a separate prompt, but it is something you know, the same category as the password.',
                'A stronger password is tempting because it improves security, but it is still the same knowledge factor.',
                'Adding another question adds a step but not a new category; it is still something you know.',
                'Correct: a smart card is a physical item the user possesses.',
                'Correct: a hardware token is a possession factor.'
            ]
        },
        {
            id: 'aplus-067',
            domain: 'c2-2',
            objective: '2.2',
            type: 'single',
            q: 'A shared folder grants the Sales group Read share permission. The NTFS permissions on the same folder grant Sales Full Control. What is a Sales user\'s effective access when connecting over the network?',
            choices: [
                'Full Control',
                'Modify',
                'Read',
                'No access'
            ],
            answer: [2],
            explain: 'When accessing a folder over the network, share and NTFS permissions are both evaluated and the more restrictive of the two applies. Here that is Read.',
            why: [
                'Full Control would apply only when accessing the folder locally, where share permissions do not apply.',
                'Modify is not granted by either permission set.',
                'Correct: the most restrictive of the share and NTFS permissions wins over the network.',
                'Both permission sets allow access, so the user is not denied.'
            ]
        },
        {
            id: 'aplus-068',
            domain: 'c2-2',
            objective: '2.2',
            type: 'single',
            q: 'Employees carry project files on USB flash drives. Management wants those drives encrypted so data cannot be read if one is lost. Which Windows feature should be used?',
            choices: [
                'Encrypting File System (EFS)',
                'User Account Control',
                'Windows Defender Firewall',
                'BitLocker To Go'
            ],
            answer: [3],
            explain: 'BitLocker To Go encrypts removable drives such as USB flash drives and requires a password or other unlock method to access them.',
            why: [
                'EFS encrypts individual files on NTFS for a user and is not the tool for securing whole removable drives.',
                'UAC prompts before administrative changes and does not encrypt data.',
                'A firewall filters network traffic and does not protect stored data.',
                'Correct: BitLocker To Go is designed for removable drives.'
            ]
        },
        {
            id: 'aplus-069',
            domain: 'c2-2',
            objective: '2.3',
            type: 'single',
            q: 'A coffee shop\'s WPA2-Personal network uses a short passphrase. The owner learns that someone nearby could capture a client\'s connection handshake and then guess the passphrase offline at leisure. Which change best removes that offline guessing risk?',
            choices: [
                'Move the network to WPA3-Personal.',
                'Switch the WPA2 cipher to AES-CCMP.',
                'Hide the network\'s SSID.',
                'Enable MAC address filtering on the AP.'
            ],
            answer: [0],
            explain: 'WPA3-Personal replaces the WPA2 pre-shared key handshake with Simultaneous Authentication of Equals (SAE). Each password guess then needs a live exchange with the access point, so a captured handshake is useless for offline cracking. Rule: offline cracking is stopped by changing the key exchange, not by changing the cipher or hiding the network.',
            why: [
                'Correct: WPA3-Personal uses SAE, which defeats offline guessing from a captured handshake.',
                'AES is tempting because it is a strong cipher, but the WPA2-Personal handshake stays the same and can still be cracked offline.',
                'Hiding the SSID is tempting, but the name still appears in client traffic, and the handshake can be captured as before.',
                'MAC filtering is tempting, but addresses are easy to spoof and filtering does not change the handshake.'
            ]
        },
        {
            id: 'aplus-070',
            domain: 'c2-2',
            objective: '2.3',
            type: 'single',
            q: 'A company wants employees to authenticate to Wi-Fi with their own domain credentials instead of a shared passphrase, and to revoke access centrally when someone leaves. What should the technician configure?',
            choices: [
                'WPA2/WPA3 Enterprise with a RADIUS server',
                'WPA3-Personal with a long passphrase',
                'MAC address filtering on the access point',
                'Disabling SSID broadcast'
            ],
            answer: [0],
            explain: 'WPA2 or WPA3 Enterprise uses 802.1X to pass each user\'s credentials to a central RADIUS server, so access is per user and can be revoked by disabling one account.',
            why: [
                'Correct: Enterprise mode authenticates each user against a central server.',
                'Personal mode still uses one shared secret for everyone.',
                'MAC filtering is easy to spoof and does not use domain credentials.',
                'Hiding the SSID does not authenticate users.'
            ]
        },
        {
            id: 'aplus-071',
            domain: 'c2-2',
            objective: '2.4',
            type: 'single',
            q: 'A technician suspects malware on a workstation, but antivirus scans come back clean and the suspicious processes do not appear in Task Manager. Network monitoring still shows the machine contacting an unknown server. Which type of malware best fits these symptoms?',
            choices: [
                'Adware',
                'Ransomware',
                'Potentially unwanted program',
                'Rootkit'
            ],
            answer: [3],
            explain: 'A rootkit hides itself by hooking deep into the OS, often at the kernel level, so normal tools cannot see it. Removal often means scanning from outside the OS or reinstalling.',
            why: [
                'Adware is usually visible through pop-ups and ads rather than hidden processes.',
                'Ransomware announces itself by encrypting files and demanding payment.',
                'PUPs are typically visible bundled software, not hidden kernel-level code.',
                'Correct: rootkits hide processes and files from the OS and security tools.'
            ]
        },
        {
            id: 'aplus-072',
            domain: 'c2-2',
            objective: '2.5',
            type: 'single',
            q: 'An attacker sends a carefully researched email, made to look like it came from outside legal counsel, to a company\'s CEO, asking the CEO to approve a confidential payment. Which term best describes this attack?',
            choices: [
                'Spear phishing',
                'Smishing',
                'Vishing',
                'Whaling'
            ],
            answer: [3],
            explain: 'Whaling is spear phishing aimed at senior executives, who have the authority to approve high-value actions. Rule: classify social engineering by channel first (email, SMS, voice), then by target: broad, a specific person, or a top executive. Pick the most specific term that fits.',
            why: [
                'Spear phishing is tempting because the email is targeted and researched, but whaling is the more specific term when the target is a top executive.',
                'Smishing is tempting as a phishing variant, but it arrives by SMS text message, not email.',
                'Vishing is tempting as a phishing variant, but it uses voice calls, not email.',
                'Correct: a targeted phishing attack against a top executive is whaling.'
            ]
        },
        {
            id: 'aplus-073',
            domain: 'c2-2',
            objective: '2.5',
            type: 'single',
            q: 'At a coffee shop, a laptop connects to a network with the same name as the shop\'s Wi-Fi, but the signal comes from a device in an attacker\'s backpack, not from the shop\'s equipment. Which term best describes this fake access point?',
            choices: [
                'Evil twin',
                'Rogue access point',
                'On-path attack',
                'Deauthentication attack'
            ],
            answer: [0],
            explain: 'An evil twin is an access point that imitates a legitimate network name to lure clients, so the attacker can intercept their traffic. Rule: an evil twin copies a trusted SSID from outside; a rogue AP is an unauthorized device connected to the organization\'s own network.',
            why: [
                'Correct: a fake AP copying a legitimate network name is an evil twin.',
                'A rogue AP is tempting because it is unauthorized, but the term usually means a device plugged into the organization\'s own network, not one imitating it.',
                'An on-path attack is what the evil twin enables, which makes it tempting, but the question asks for the term for the fake access point itself.',
                'A deauthentication attack is tempting because it often comes first, but it forces clients off a network rather than imitating one.'
            ]
        },
        {
            id: 'aplus-074',
            domain: 'c2-2',
            objective: '2.6',
            type: 'single',
            q: 'A technician has confirmed malware symptoms on a Windows 11 Home PC and has disconnected it from the network. According to the CompTIA malware removal process, what is the next step?',
            choices: [
                'Disable System Restore.',
                'Remediate the infected system.',
                'Create a new restore point.',
                'Schedule scans and run updates.'
            ],
            answer: [0],
            explain: 'The order is: investigate and verify, quarantine, disable System Restore in Windows Home, remediate, schedule scans and run updates, enable System Restore and create a restore point, then educate the user. Rule: delete restore points before cleaning so the malware cannot come back from one.',
            why: [
                'Correct: disabling System Restore follows quarantine, so infected restore points are removed.',
                'Remediation is tempting because cleaning is the goal, but System Restore must be disabled first so infected restore points are not kept.',
                'A restore point is tempting as a safety net, but creating one now would save the infection; it comes after the system is clean.',
                'Scans and updates are tempting as protection, but they follow remediation in the process.'
            ]
        },
        {
            id: 'aplus-075',
            domain: 'c2-2',
            objective: '2.8',
            type: 'single',
            q: 'A company smartphone containing customer data was left in a taxi. The taxi company has no record of it, and the locator service last showed it moving across the city two days ago. What should the technician do to protect the data?',
            choices: [
                'Remotely lock the device and show a contact message.',
                'Issue a remote wipe to the device.',
                'Keep tracking it with the locator service.',
                'Reset the user\'s account password.'
            ],
            answer: [1],
            explain: 'A remote wipe, sent through MDM or the platform\'s locator service, erases the device so whoever has it cannot recover the data. Rule: lock a device when getting it back is likely; wipe it when it is not, because only a wipe removes the data.',
            why: [
                'Locking is tempting because it is reversible, but the data stays on the device, and recovery here is unlikely.',
                'Correct: the phone is not coming back, so a remote wipe removes the customer data.',
                'Tracking is tempting because it might recover the phone, but it leaves the data exposed while the phone keeps moving.',
                'A password reset is tempting, but it protects the online account and does nothing to data already stored on the phone.'
            ]
        },
        {
            id: 'aplus-076',
            domain: 'c2-2',
            objective: '2.9',
            type: 'single',
            q: 'A company is decommissioning solid-state drives that held sensitive data. The disposal vendor offers four methods. Which method would leave the data recoverable on these drives?',
            choices: [
                'Shredding to a particle size rated for SSDs',
                'Incineration',
                'Disintegrating the drives into small particles',
                'Degaussing'
            ],
            answer: [3],
            explain: 'Degaussing erases magnetic media by disrupting its magnetic field. SSDs store data in flash memory cells, so a degausser leaves the data intact. Rule: match the method to how the media stores data; magnetic media can be degaussed, but flash needs physical destruction or a sanitize or crypto erase.',
            why: [
                'Tempting to doubt because flash chips are small, but a shred size rated for SSDs breaks the chips apart.',
                'Incineration destroys the flash chips completely, so no data survives.',
                'Reducing the drives to small particles destroys the flash chips that hold the data.',
                'Correct: SSDs are not magnetic storage, so degaussing does not erase them.'
            ]
        },
        {
            id: 'aplus-077',
            domain: 'c2-2',
            objective: '2.10',
            type: 'multi',
            q: 'A technician is setting up a new SOHO router. Which two actions most directly reduce the router\'s attack surface? (Choose two.)',
            choices: [
                'Enable Universal Plug and Play.',
                'Enable remote management from the WAN.',
                'Change the default administrator username and password.',
                'Disable SSID broadcast.',
                'Update the router firmware.'
            ],
            answer: [2, 4],
            explain: 'Default administrator credentials are widely published, and outdated firmware may have known vulnerabilities. Changing the credentials and updating the firmware close both gaps. Rule: real hardening removes known weaknesses and unneeded exposure; hiding information, such as the SSID, only slows a casual observer.',
            why: [
                'UPnP is tempting because it makes games and apps work, but it lets devices open ports automatically, which increases exposure.',
                'Remote management is tempting for convenience, but exposing the admin interface to the internet increases the attack surface.',
                'Correct: default credentials are public knowledge and must be changed.',
                'Hiding the SSID is common advice, but the name still appears in client traffic, so it adds little real protection.',
                'Correct: firmware updates patch known vulnerabilities that attackers actively scan for on SOHO routers.'
            ]
        },
        {
            id: 'aplus-078',
            domain: 'c2-2',
            objective: '2.11',
            type: 'single',
            q: 'A technician downloads a utility installer from the vendor\'s website, which also publishes a SHA-256 value for the file. What is the purpose of comparing that value to one computed from the downloaded file?',
            choices: [
                'To scan the installer for known malware',
                'To check that the browser\'s certificate store is current',
                'To verify the identity of the software publisher',
                'To confirm the file was not altered after publication'
            ],
            answer: [3],
            explain: 'A hash is a fingerprint of the file\'s contents. If the computed hash matches the published one, the file was not corrupted or changed after the vendor published it. Rule: a hash proves integrity, a digital signature proves integrity and who signed it, and encryption provides confidentiality.',
            why: [
                'Tempting because antivirus tools use hashes, but matching the vendor\'s hash only shows the file is unchanged, not that it is malware-free.',
                'A file hash says nothing about the browser\'s certificate store, which is used to validate websites.',
                'Tempting because signatures verify publishers, but a plain hash carries no identity; anyone who controls the page could post a matching hash.',
                'Correct: matching hashes confirm the file is exactly what the vendor published, unaltered and uncorrupted.'
            ]
        },
        {
            id: 'aplus-079',
            domain: 'c2-3',
            objective: '3.1',
            type: 'single',
            q: 'After a technician installs an updated graphics driver, a Windows PC shows a blue screen during every normal startup. What is the best next step?',
            choices: [
                'Replace the graphics card.',
                'Run chkdsk on the system drive and schedule it for the next restart.',
                'Boot into Safe Mode and roll back the graphics driver.',
                'Reinstall Windows from scratch.'
            ],
            answer: [2],
            explain: 'Safe Mode loads only basic drivers, so the system can start without the faulty driver. From there, the technician can roll back or uninstall it in Device Manager.',
            why: [
                'The crash started right after a driver change, which points to software, not hardware.',
                'Disk errors are not indicated by a crash that began right after a driver install.',
                'Correct: Safe Mode avoids the new driver so it can be rolled back.',
                'A reinstall is excessive when rolling back the driver is likely to fix the problem.'
            ]
        },
        {
            id: 'aplus-080',
            domain: 'c2-3',
            objective: '3.1',
            type: 'single',
            q: 'Several domain users at one site suddenly cannot sign in to their workstations. The same accounts work at other sites, and the technician notices the workstations\' clocks are about 15 minutes behind the domain controller. What should the technician do?',
            choices: [
                'Reset each user\'s password and require a change at next sign-in.',
                'Rejoin each workstation to the domain.',
                'Clear the cached credentials on each workstation.',
                'Resync the workstations\' clocks with the domain time source.'
            ],
            answer: [3],
            explain: 'Kerberos rejects authentication when the client and domain controller clocks differ by more than the allowed skew, five minutes by default. Resyncing the clocks restores sign-in. Rule: when many users at one location fail authentication at once, check time before accounts.',
            why: [
                'A password reset is tempting for sign-in failures, but the accounts work at other sites, so the passwords are fine.',
                'Rejoining is tempting for trust problems, but the clock skew would still break Kerberos, and rejoining itself needs working authentication.',
                'Clearing cached credentials is tempting, but the cache is not the problem; Kerberos is rejecting requests because of the time difference.',
                'Correct: fixing the time drift brings the clocks back within the Kerberos tolerance.'
            ]
        },
        {
            id: 'aplus-081',
            domain: 'c2-3',
            objective: '3.1',
            type: 'single',
            q: 'A Windows service will not start, and Windows shows: "Error 1068: The dependency service or group failed to start." The technician has already restarted the computer once. What should the technician do next?',
            choices: [
                'Reinstall the application that installed the service.',
                'Run sfc /scannow, reboot, and then try again.',
                'Set the service\'s Log On account to Local System.',
                'Find and start the services it depends on.'
            ],
            answer: [3],
            explain: 'Error 1068 means a service that this service needs did not start. The Dependencies tab lists them; set the required service to a suitable startup type, start it, then start the original. Rule: read the error code first; it usually points at the exact layer to check.',
            why: [
                'Reinstalling is tempting as a reset, but it is excessive when the error names a dependency problem.',
                'sfc is tempting for Windows faults, but it repairs system files and does not change the startup type of other services.',
                'Tempting because service logon problems are common, but those produce error 1069, not 1068.',
                'Correct: the required services must run before this service can start.'
            ]
        },
        {
            id: 'aplus-082',
            domain: 'c2-3',
            objective: '3.1',
            type: 'single',
            q: 'A user gets low memory warnings every afternoon. Task Manager shows one app using 600 MB at 9 a.m., 2.1 GB at noon and 4.8 GB at 4 p.m., while the user keeps the same two documents open all day. Other apps stay flat. What is the most likely cause?',
            choices: [
                'A memory leak in that application',
                'Not enough RAM installed for the workload',
                'A page file that is set too small',
                'A failing RAM module'
            ],
            answer: [0],
            explain: 'One process growing steadily while its workload stays the same is the typical sign of a memory leak. Updating or patching the application is the usual fix. Rule: growth in one process with a constant workload points to a leak; steady usage that is simply too high points to capacity.',
            why: [
                'Correct: memory that climbs in one process while the work stays the same indicates a leak.',
                'Tempting because more RAM would delay the warning, but the workload is constant, and the app would keep growing until it ran out again.',
                'A larger page file is tempting because it eases low memory, but it would only delay the warning while the app keeps growing.',
                'Failing RAM is tempting for memory problems, but it causes crashes or corrupted data, not one app\'s usage climbing.'
            ]
        },
        {
            id: 'aplus-083',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'A smartphone repeatedly fails to install a 1.5 GB game update, and the app store shows only a generic error. Several small app updates installed from the same store this morning. What should the technician check first?',
            choices: [
                'Whether the phone\'s date and time are correct',
                'Whether the OS version is too old for the app',
                'Whether the app store\'s cache needs clearing',
                'Available storage space on the phone'
            ],
            answer: [3],
            explain: 'App updates need free space to download and then unpack, so a large update can fail while small ones succeed. Rule: compare what works with what fails; here the difference is size, which points to storage space.',
            why: [
                'A wrong clock can break store connections, but small updates installed this morning, so the store is reachable.',
                'Tempting because old OS versions lose app support, but the store normally says an update needs a newer OS instead of failing generically.',
                'Clearing the store cache is a common fix, but small updates from the same store worked today, so the cache is not blocking downloads.',
                'Correct: a large update needs room for the download and the unpacked files, which small updates do not.'
            ]
        },
        {
            id: 'aplus-084',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'A tablet stays in portrait orientation when it is turned sideways. This happens in every app, including the web browser and photo viewer, which both rotated normally last week. What is the most likely cause?',
            choices: [
                'The accelerometer needs recalibration.',
                'Rotation lock is turned on.',
                'The current app supports only portrait mode.',
                'A factory reset is needed to restore rotation.'
            ],
            answer: [1],
            explain: 'When rotation lock is on, the display stays in one orientation no matter how the device is held. Rule: a symptom in every app points to a system-wide setting, while a symptom in one app points to that app; check simple toggles before blaming hardware.',
            why: [
                'A sensor fault is tempting, but it is far less likely than a toggle, and the lock should be ruled out first.',
                'Correct: rotation lock keeps the screen in one orientation in every app.',
                'Tempting because some apps are portrait only, but the problem happens in every app, including ones that rotated last week.',
                'A reset is tempting as a catch-all fix, but it wipes the device when one settings toggle is the likely cause.'
            ]
        },
        {
            id: 'aplus-085',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'A user\'s phone was replaced with a new model, and it will not pair with the user\'s car over Bluetooth. The car\'s display says its list of paired phones is full, and the old phone is still on it. What should the technician try first?',
            choices: [
                'Delete the old pairing in the car and pair again.',
                'Reset the network settings on the new phone and retry.',
                'Update the car\'s infotainment firmware.',
                'Extend the car\'s Bluetooth visibility timeout.'
            ],
            answer: [0],
            explain: 'The car can store only a limited number of pairings, and the old phone is using one of them. Removing the stale pairing frees a slot so the new phone can pair. Rule: start with the device that reports the problem, and remove stale pairings before resetting or updating anything.',
            why: [
                'Correct: removing the stale pairing frees a slot for the new phone.',
                'A network reset is tempting because it clears Bluetooth on the phone, but the car is the device refusing new pairings.',
                'A firmware update is tempting for compatibility, but it takes longer and does not free a slot in the full pairing list.',
                'Visibility is tempting for pairing trouble, but the car is not hidden; its pairing list is full.'
            ]
        },
        {
            id: 'aplus-086',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'Shortly after an OS update, a user\'s phone battery drains much faster than before. What should the technician do first?',
            choices: [
                'Replace the phone\'s battery.',
                'Factory reset the phone.',
                'Review battery usage by app.',
                'Turn on Low Power Mode to stretch the battery.'
            ],
            answer: [2],
            explain: 'The battery usage screen shows which apps or processes use the most power. After an update, a misbehaving app or temporary background indexing is a common cause. Rule: when a problem starts right after a change, gather data about that change before replacing hardware or wiping the device.',
            why: [
                'A worn battery is tempting for fast drain, but the drain started right after an update, which points to software.',
                'A reset is tempting as a clean start, but it is drastic and erases data before the cause is known.',
                'Correct: it shows which app or process is draining power, so the fix can target it.',
                'Low Power Mode is tempting because it extends battery life, but it hides the symptom and does not find the cause.'
            ]
        },
        {
            id: 'aplus-087',
            domain: 'c2-3',
            objective: '3.3',
            type: 'single',
            q: 'A user installed a free game from a third-party website instead of the official app store. Since then, ads appear on the home screen even when no browser is open, and the phone has used far more data than usual. What should the technician do first?',
            choices: [
                'Clear the browser\'s cache and cookies.',
                'Factory reset the phone right away.',
                'Install an ad-blocking app from the store.',
                'Remove the unauthorized app, then scan.'
            ],
            answer: [3],
            explain: 'Apps from unofficial sources skip app store vetting and often carry adware. Removing the sideloaded app and then scanning the phone addresses the likely source. Rule: remove the most likely source first, then verify with a scan; escalate to a reset only if that fails.',
            why: [
                'Clearing the browser is tempting for ad problems, but the ads appear with no browser open, so they come from an app.',
                'A reset would remove the app, but it is drastic and erases data before the simpler fix has been tried.',
                'An ad blocker is tempting, but it hides some symptoms and leaves the malicious app installed.',
                'Correct: the sideloaded game is the most likely source, so remove it and confirm with a scan.'
            ]
        },
        {
            id: 'aplus-088',
            domain: 'c2-3',
            objective: '3.4',
            type: 'multi',
            q: 'Every time a user types a search into the browser, they are sent to an unfamiliar search site, even after changing the default search engine back. Which two items should the technician check? (Choose two.)',
            choices: [
                'Installed browser extensions',
                'The browser cache',
                'The hosts file and proxy settings',
                'The default homepage setting',
                'The browser\'s pop-up blocker settings'
            ],
            answer: [0, 2],
            explain: 'Browser hijacking is often done by a malicious extension or by changes to the hosts file or proxy settings that redirect traffic. Rule: when a setting keeps reverting or being bypassed, look for the thing that is changing or overriding it, not the setting itself.',
            why: [
                'Correct: malicious extensions often take over search and change it back after the user fixes it.',
                'The cache is tempting because it stores browsing data, but cached pages do not reroute new searches.',
                'Correct: altered name resolution or a rogue proxy can redirect traffic regardless of browser settings.',
                'The homepage is tempting because hijackers often change it too, but it controls the start page, not where searches go.',
                'The pop-up blocker is tempting for unwanted sites, but it controls new windows and does not redirect searches.'
            ]
        },
        {
            id: 'aplus-089',
            domain: 'c2-3',
            objective: '3.4',
            type: 'single',
            q: 'A user reports certificate warnings on nearly every HTTPS website, including well-known ones. Other computers on the same network have no problems. What should the technician check first?',
            choices: [
                'The router\'s firmware version',
                'The computer\'s system date and time',
                'The browser\'s pop-up blocker',
                'The computer\'s screen resolution'
            ],
            answer: [1],
            explain: 'Certificates are only valid within a date range. If the computer\'s date and time are wrong, valid certificates appear expired or not yet valid on almost every site.',
            why: [
                'Other computers on the same network are fine, so the router is not the issue.',
                'Correct: an incorrect clock makes valid certificates look invalid.',
                'Pop-up blocking does not affect certificate validation.',
                'Display settings have nothing to do with certificates.'
            ]
        },
        {
            id: 'aplus-090',
            domain: 'c2-3',
            objective: '3.4',
            type: 'single',
            q: 'A pop-up on a user\'s screen claims the PC is infected with dozens of viruses and urges the user to buy a "cleanup" tool immediately. The company\'s installed antivirus shows no alerts. What should the technician do?',
            choices: [
                'Run System Restore to a point from last week.',
                'End the browser in Task Manager, then run a trusted scan.',
                'Disable the installed antivirus so the pop-up can finish its scan.',
                'Click the pop-up\'s "Scan now" button to confirm.'
            ],
            answer: [1],
            explain: 'This is a fake antivirus alert, often called scareware. Nobody should interact with it. Close it without clicking anything inside it, then check the system with the company\'s trusted security tools. Rule: verify alerts with tools you trust, never with the tool the alert is pushing.',
            why: [
                'System Restore is tempting because it undoes changes, but nothing has been confirmed as installed, and restore does not reliably remove malware.',
                'Correct: closing it without clicking avoids a malicious download, and a trusted scan checks whether anything got in.',
                'Disabling protection is tempting to let the pop-up finish, but it removes the real defense and leaves the system exposed.',
                'Clicking is tempting to confirm the warning, but any button in the pop-up can start a malicious download.'
            ]
        },
        {
            id: 'aplus-091',
            domain: 'c2-4',
            objective: '4.2',
            type: 'single',
            q: 'At 10 p.m., a technician applies an approved change to a production firewall rule. By 10:20 p.m., remote users cannot connect to the VPN, and the change is the suspected cause. Which part of the change request should the technician follow now?',
            choices: [
                'Purpose of the change',
                'Risk analysis',
                'Rollback plan',
                'Scheduled change window'
            ],
            answer: [2],
            explain: 'The rollback (backout) plan lists the steps to return the system to its previous state if a change fails or causes problems. Rule: each part of a change request answers one question: purpose says why, scope says what, the window says when, risk analysis says what could go wrong, and rollback says how to undo it.',
            why: [
                'The purpose is tempting as the reason for the change, but it explains why it was needed, not how to reverse it.',
                'Risk analysis is tempting because it may have predicted this outage, but it rates likelihood and impact; it does not list undo steps.',
                'Correct: the rollback plan defines how to undo the change.',
                'The change window is tempting because the work is still within it, but it sets when work may happen, not how to undo it.'
            ]
        },
        {
            id: 'aplus-092',
            domain: 'c2-4',
            objective: '4.3',
            type: 'single',
            q: 'A file server gets a full backup every Sunday and a differential backup every other night. The server fails on Thursday morning. Which backups are needed to restore the most recent data?',
            choices: [
                'Sunday\'s full backup and every differential from Monday through Wednesday',
                'Only Wednesday night\'s differential',
                'Sunday\'s full backup and Wednesday night\'s differential',
                'Only Sunday\'s full backup'
            ],
            answer: [2],
            explain: 'A differential backup contains everything changed since the last full backup. A restore therefore needs only the full backup plus the most recent differential.',
            why: [
                'Applying every differential is unnecessary, because each one includes the changes in the earlier ones.',
                'A differential holds only changes since the full backup, so it cannot be restored alone.',
                'Correct: the latest differential already includes all changes since Sunday.',
                'That would lose all changes made Monday through Wednesday.'
            ]
        },
        {
            id: 'aplus-093',
            domain: 'c2-4',
            objective: '4.3',
            type: 'single',
            q: 'A small office backs up its file server nightly to a NAS in the server closet. A second copy goes to LTO tape, and the tapes are stored on a shelf in the same closet. Which change would bring this setup in line with the 3-2-1 backup rule?',
            choices: [
                'Add a second NAS in the closet for another copy.',
                'Move each tape offsite after the backup runs.',
                'Switch the nightly backups from full to differential.',
                'Keep the backups for one year instead of 30 days.'
            ],
            answer: [1],
            explain: 'The 3-2-1 rule calls for three copies of the data, on two different media types, with one copy offsite. This office has three copies on disk and tape, but all are in one closet, so a fire or theft takes everything. Rule: check copies, media types and location separately, and fix whichever one is missing.',
            why: [
                'More copies are tempting, but another NAS in the same closet still leaves every copy onsite.',
                'Correct: the setup already has three copies on two media types; it lacks only an offsite copy.',
                'Changing the backup type is tempting, but it changes what each backup contains, not where the copies are kept.',
                'Longer retention is tempting, but it controls how long backups are kept, not whether one is offsite.'
            ]
        },
        {
            id: 'aplus-094',
            domain: 'c2-4',
            objective: '4.4',
            type: 'single',
            q: 'A technician must install a RAM module in a desktop at a customer\'s carpeted office in winter. The air is dry, and the technician gets a small shock touching the door handle. The PC is unplugged. Which precaution best protects the module?',
            choices: [
                'Touch the metal door handle first to discharge.',
                'Wear an ESD strap clipped to a proper ground.',
                'Wear rubber-soled shoes while working.',
                'Wipe the module with a dry cloth first.'
            ],
            answer: [1],
            explain: 'A grounded ESD wrist strap keeps the technician at the same electrical potential as the equipment the whole time, so static cannot discharge into the module. Rule: ESD protection must be continuous; a one-time discharge or insulating yourself does not stop charge from building up again.',
            why: [
                'Touching metal is tempting because it releases the charge once, but walking on carpet builds it up again before the work is done.',
                'Correct: a grounded strap continuously equalizes the technician\'s charge with the equipment.',
                'Rubber soles are tempting because they insulate, but they keep static from draining away, so charge can build up.',
                'Wiping is tempting for cleaning contacts, but rubbing a component with a dry cloth can create static.'
            ]
        },
        {
            id: 'aplus-095',
            domain: 'c2-4',
            objective: '4.5',
            type: 'single',
            q: 'An office has frequent brief brownouts that cause workstations to reboot and lose unsaved work. Which device best addresses this problem?',
            choices: [
                'Surge suppressor',
                'Redundant power supply',
                'Uninterruptible power supply',
                'Power over Ethernet injector'
            ],
            answer: [2],
            explain: 'An uninterruptible power supply (UPS) uses a battery to supply power through brownouts and short outages. A surge suppressor only protects against voltage spikes.',
            why: [
                'A surge suppressor clamps voltage spikes but cannot supply power during a sag.',
                'A redundant PSU protects against a PSU failure, but both units still lose power in a brownout.',
                'Correct: a UPS supplies battery power during sags and short outages.',
                'PoE powers network devices over Ethernet and does not condition building power.'
            ]
        },
        {
            id: 'aplus-096',
            domain: 'c2-4',
            objective: '4.6',
            type: 'single',
            q: 'While repairing an employee\'s laptop, a technician discovers files that appear to violate the law and company policy. What should the technician do?',
            choices: [
                'Delete the files, finish the repair, and note it in the ticket.',
                'Make an image of the drive, then finish the repair.',
                'Ask the employee to explain the files before reporting.',
                'Stop work, preserve the device, and report it to management.'
            ],
            answer: [3],
            explain: 'The technician should stop, avoid changing anything, report through the proper channel (management may involve law enforcement), and document the chain of custody. Rule: a first responder preserves and reports; investigating, judging or fixing belongs to the people authorized to handle the incident.',
            why: [
                'Deleting is tempting to clean up, but it destroys evidence and may itself break the law or policy.',
                'Imaging is tempting because it sounds forensic, but finishing the repair changes the evidence, and imaging belongs to authorized investigators.',
                'Asking the employee is tempting to be fair, but investigating is management\'s job, and it can alert the user and compromise the case.',
                'Correct: this preserves the evidence and follows the incident response process.'
            ]
        },
        {
            id: 'aplus-097',
            domain: 'c2-4',
            objective: '4.7',
            type: 'single',
            q: 'A frustrated customer interrupts a technician several times and insists the problem is the technician\'s fault. What is the most professional response?',
            choices: [
                'Apologize and promise a fix by the end of the day.',
                'Stay calm, avoid arguing, and ask open-ended questions.',
                'Escalate the call to a manager right away.',
                'Explain the technical cause in detail to show expertise.'
            ],
            answer: [1],
            explain: 'The technician should stay calm, not argue or get defensive, listen actively, and ask clarifying questions to narrow the problem. Rule: de-escalate by listening and gathering facts before committing to any outcome, and set expectations only once you know what the problem is.',
            why: [
                'Promising a fix is tempting to calm the customer, but it commits to a deadline before the problem is understood.',
                'Correct: this de-escalates the situation and gathers the information needed to solve the problem.',
                'Escalating is tempting with an upset customer, but it is premature before the technician has tried to de-escalate and diagnose.',
                'Detail is tempting to build credibility, but technical explanations to an upset customer usually come across as defensive and confusing.'
            ]
        },
        {
            id: 'aplus-098',
            domain: 'c2-4',
            objective: '4.8',
            type: 'single',
            q: 'A technician finds a script on a Linux workstation whose first line is #!/bin/bash. The file has no extension, and the team\'s convention is to name scripts by the interpreter that runs them. Which extension should it get?',
            choices: [
                '.ps1',
                '.sh',
                '.bat',
                '.py'
            ],
            answer: [1],
            explain: 'The first line, called a shebang, tells Linux which interpreter runs the script; here it is Bash, and shell scripts conventionally use .sh. Rule: on Linux the shebang and execute permission decide how a script runs, and the extension is a label; on Windows the extension decides.',
            why: [
                '.ps1 is tempting because PowerShell also runs on Linux, but the shebang names Bash, not PowerShell.',
                'Correct: .sh is the conventional extension for Bash and other shell scripts.',
                '.bat is tempting because it is a common script type, but it is a Windows batch file run by cmd.exe.',
                '.py is tempting because Python scripts are common on Linux, but they start with a python shebang, not /bin/bash.'
            ]
        },
        {
            id: 'aplus-099',
            domain: 'c2-4',
            objective: '4.9',
            type: 'multi',
            q: 'Which two remote access methods give a technician a full graphical view and control of a remote desktop? (Choose two.)',
            choices: [
                'RDP',
                'SSH',
                'WinRM',
                'VNC',
                'VPN'
            ],
            answer: [0, 3],
            explain: 'RDP and VNC both transmit the remote screen and accept keyboard and mouse input. SSH and WinRM provide command-line or management access, and a VPN only provides network access.',
            why: [
                'Correct: RDP provides a full graphical remote desktop session.',
                'SSH provides an encrypted command-line session.',
                'WinRM is used for remote command execution and management, not a graphical desktop.',
                'Correct: VNC shares the graphical desktop and accepts remote input.',
                'A VPN gives network-level access and does not by itself show a remote desktop.'
            ]
        },
        {
            id: 'aplus-100',
            domain: 'c2-4',
            objective: '4.10',
            type: 'single',
            q: 'A technician asks an AI assistant for a command to fix a printer problem. The assistant confidently gives a command-line switch. The switch is not in the official documentation, and running it returns "invalid parameter." What is this AI limitation called?',
            choices: [
                'Training data bias',
                'Plagiarism',
                'Data privacy',
                'Hallucination'
            ],
            answer: [3],
            explain: 'A hallucination is when an AI system produces plausible but false information, such as an option that does not exist. Rule: treat AI output as a draft; check commands against vendor documentation and test them somewhere safe before using them in production.',
            why: [
                'Bias is tempting because the answer is wrong, but bias is a consistent skew in output, often from training data, not an invented fact.',
                'Plagiarism is tempting as an AI concern, but it means presenting someone else\'s work as your own, not making something up.',
                'Data privacy is tempting as an AI concern, but it covers how shared information is handled, not whether answers are true.',
                'Correct: a confidently stated option that does not exist is a hallucination.'
            ]
        }
    ]
};
