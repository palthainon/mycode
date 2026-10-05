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
            q: 'A user wants to pay at a store checkout by holding a smartphone a few centimeters from the payment terminal. Which technology makes this possible?',
            choices: [
                'Bluetooth',
                'Wi-Fi hotspot',
                'NFC',
                'USB-C tethering'
            ],
            answer: [2],
            explain: 'Near-field communication (NFC) works only over a few centimeters, which is why it is used for tap-to-pay and badge-style interactions.',
            why: [
                'Bluetooth works over several meters and requires pairing; it is not the contactless payment standard.',
                'A hotspot shares the phone\'s cellular data with other devices; it does not talk to payment terminals.',
                'Correct: NFC is a very short-range radio technology designed for contactless payments and tap interactions.',
                'Tethering requires a cable connection and shares internet access, not payment credentials.'
            ]
        },
        {
            id: 'aplus-003',
            domain: 'c1-1',
            objective: '1.2',
            type: 'single',
            q: 'Which connector is reversible, so it can be inserted either way up, and is now common for charging and data on both laptops and phones?',
            choices: [
                'USB-C',
                'microUSB',
                'miniUSB',
                'USB 3.0 Type-A'
            ],
            answer: [0],
            explain: 'USB-C has a symmetrical oval connector that works in either orientation, and it carries power, data and often video.',
            why: [
                'Correct: USB-C is the reversible connector used widely on current laptops and phones.',
                'microUSB is keyed and only fits one way; it is found on older phones and accessories.',
                'miniUSB is an older, keyed connector used on older cameras and devices.',
                'Type-A is the flat rectangular host connector and only inserts one way.'
            ]
        },
        {
            id: 'aplus-004',
            domain: 'c1-1',
            objective: '1.3',
            type: 'single',
            q: 'A company lets employees read corporate email on their personal phones. Management wants to require a screen lock and be able to wipe only corporate data if an employee leaves. What should the technician implement?',
            choices: [
                'Enable location services on every phone.',
                'Replace each phone\'s physical SIM card with an eSIM from the company\'s carrier.',
                'Enroll the phones in an MDM solution with a BYOD policy.',
                'Require a Bluetooth pairing PIN on every phone.'
            ],
            answer: [2],
            explain: 'Mobile device management (MDM) enrolls devices and pushes policies such as passcode requirements. In a BYOD model, MDM can separate corporate apps and data so only that portion is wiped.',
            why: [
                'Location services help find a device but do not enforce screen locks or selectively remove corporate data.',
                'An eSIM changes how the carrier profile is stored; it has nothing to do with policy enforcement.',
                'Correct: MDM enforces device policies and supports selective wipe of corporate data on personally owned devices.',
                'Bluetooth PINs secure pairing with accessories, not access to corporate email.'
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
                'Turn off Bluetooth while traveling.',
                'Switch the phone from a physical SIM to an eSIM.'
            ],
            answer: [0],
            explain: 'Most cloud storage and sync apps can be limited to upload only on Wi-Fi. That keeps large media uploads from consuming a capped cellular data plan.',
            why: [
                'Correct: restricting sync to Wi-Fi stops large uploads from counting against the cellular data cap.',
                'Location tagging adds a tiny amount of data to each photo and does not cause the large uploads.',
                'Bluetooth traffic does not use the cellular data plan.',
                'The SIM type does not change how much data the apps consume.'
            ]
        },
        {
            id: 'aplus-007',
            domain: 'c1-2',
            objective: '2.1',
            type: 'single',
            q: 'A firewall administrator needs to allow inbound Remote Desktop Protocol connections to a Windows server. Which port should be opened by default?',
            choices: [
                '445',
                '3389',
                '22',
                '443'
            ],
            answer: [1],
            explain: 'RDP listens on TCP port 3389 by default. Exposing it directly to the internet is risky, so it is usually reached through a VPN or gateway.',
            why: [
                'Port 445 is SMB/CIFS file sharing.',
                'Correct: 3389 is the default RDP port.',
                'Port 22 is SSH.',
                'Port 443 is HTTPS.'
            ]
        },
        {
            id: 'aplus-008',
            domain: 'c1-2',
            objective: '2.1',
            type: 'multi',
            q: 'An email client must be configured to download or read messages from a mail server. Which two protocols are designed for retrieving mail? (Choose two.)',
            choices: [
                'SMTP',
                'POP3',
                'IMAP',
                'LDAP',
                'SMB'
            ],
            answer: [1, 2],
            explain: 'POP3 (port 110) and IMAP (port 143) are retrieval protocols used by mail clients. SMTP sends mail instead: port 25 between servers, and usually port 587 when a client submits mail.',
            why: [
                'SMTP sends and relays mail; it does not retrieve messages for a client.',
                'Correct: POP3 retrieves mail, typically downloading it to the client.',
                'Correct: IMAP retrieves mail while keeping messages and folders synchronized on the server.',
                'LDAP queries directory services such as user and group information.',
                'SMB provides file and printer sharing, not mail retrieval.'
            ]
        },
        {
            id: 'aplus-009',
            domain: 'c1-2',
            objective: '2.2',
            type: 'single',
            q: 'A small office wants its new wireless network to use the 6GHz band to avoid congestion on older bands. Which Wi-Fi generation must both the access points and the clients support at minimum?',
            choices: [
                'Wi-Fi 5 (802.11ac)',
                'Wi-Fi 6E (802.11ax in 6GHz)',
                'Wi-Fi 4 (802.11n)',
                '802.11g'
            ],
            answer: [1],
            explain: 'Wi-Fi 6E extends 802.11ax into the 6GHz band. Earlier generations such as Wi-Fi 5 and Wi-Fi 4 cannot use 6GHz at all.',
            why: [
                'Wi-Fi 5 operates only in the 5GHz band.',
                'Correct: Wi-Fi 6E is the first generation that operates in the 6GHz band.',
                'Wi-Fi 4 operates in 2.4GHz and 5GHz only.',
                '802.11g is a legacy 2.4GHz-only standard.'
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
                'Channel 13 is not permitted for normal Wi-Fi use in the U.S., and it overlaps channel 11.'
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
            q: 'A domain owner wants to publish, in a DNS TXT record, the list of mail servers that are allowed to send email for the domain. Which mechanism is this?',
            choices: [
                'SPF',
                'DKIM',
                'DMARC',
                'MX'
            ],
            answer: [0],
            explain: 'Sender Policy Framework (SPF) is a TXT record that lists the hosts authorized to send mail for a domain. Receivers check it to detect spoofed senders.',
            why: [
                'Correct: SPF publishes the authorized sending servers for a domain.',
                'DKIM publishes a public key used to verify a cryptographic signature on messages; it does not list sending servers.',
                'DMARC tells receivers what to do when SPF or DKIM checks fail and where to send reports.',
                'MX records identify servers that receive mail, not servers allowed to send it.'
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
                'Replace the switch with an unmanaged switch that has more ports.',
                'Terminate the cable on a patch panel.',
                'Install a PoE injector between the switch and the access point.',
                'Connect the access point to the cable modem.'
            ],
            answer: [2],
            explain: 'A PoE injector sits between a non-PoE switch and the device, adding power to the Ethernet cable so a single cable carries both data and power.',
            why: [
                'Being unmanaged has nothing to do with PoE; many unmanaged switches provide no power.',
                'A patch panel is a passive termination point and supplies no power.',
                'Correct: an injector adds PoE to a single link without replacing the switch.',
                'A cable modem provides the internet connection, not power for other devices.'
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
            q: 'Which network type is a dedicated high-speed network that gives servers block-level access to shared storage?',
            choices: [
                'PAN',
                'SAN',
                'MAN',
                'WLAN'
            ],
            answer: [1],
            explain: 'A storage area network (SAN) presents shared storage to servers as if it were locally attached block devices.',
            why: [
                'A personal area network links devices around one person, such as Bluetooth accessories.',
                'Correct: a SAN provides block-level storage access to servers.',
                'A metropolitan area network spans a city or campus; it is defined by geography, not storage.',
                'A wireless LAN connects clients over Wi-Fi and is not a storage network.'
            ]
        },
        {
            id: 'aplus-018',
            domain: 'c1-2',
            objective: '2.8',
            type: 'single',
            q: 'A technician needs to find which unlabeled cable in a bundle at a patch panel connects to a specific wall jack. Which tool is designed for this job?',
            choices: [
                'Loopback plug',
                'Crimper',
                'Wi-Fi analyzer',
                'Toner probe'
            ],
            answer: [3],
            explain: 'A toner probe puts a signal on the cable at the wall jack, and the probe detects that signal at the other end, so the technician can pick out the correct cable.',
            why: [
                'A loopback plug tests whether a port can send and receive; it does not locate cables.',
                'A crimper attaches connectors to cable ends.',
                'A Wi-Fi analyzer examines wireless signals and channels, not copper cabling.',
                'Correct: a toner and probe is used to trace and identify a specific cable.'
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
                'Plenum-rated',
                'Direct burial',
                'Shielded twisted pair',
                'Coaxial'
            ],
            answer: [0],
            explain: 'Plenum-rated cable has a jacket that produces less smoke and fewer toxic fumes when it burns, so it is required in air-handling spaces.',
            why: [
                'Correct: air-handling (plenum) spaces require plenum-rated cable.',
                'Direct burial cable is built for underground runs, not air-handling spaces.',
                'Shielding reduces interference; it says nothing about fire rating.',
                'Coax is a cable construction, not a fire rating, and is not normally used for Ethernet runs.'
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
            q: 'A technician terminates one end of a patch cable using the T568A standard and the other end using T568B. What type of cable has been made?',
            choices: [
                'Straight-through',
                'Crossover',
                'Rollover',
                'Loopback'
            ],
            answer: [1],
            explain: 'A cable with T568A on one end and T568B on the other swaps the transmit and receive pairs, which makes it a crossover cable.',
            why: [
                'A straight-through cable uses the same standard, either A or B, on both ends.',
                'Correct: mixing T568A and T568B on opposite ends produces a crossover cable.',
                'A rollover (console) cable reverses all eight pins and is used for device console ports.',
                'A loopback plug sends a port\'s output back to its own input; it is not a two-ended cable.'
            ]
        },
        {
            id: 'aplus-023',
            domain: 'c1-3',
            objective: '3.3',
            type: 'multi',
            q: 'Which two statements about error-correcting code (ECC) memory are true? (Choose two.)',
            choices: [
                'It doubles memory bandwidth compared to non-ECC memory.',
                'It is made only in the SODIMM form factor.',
                'It can detect and correct single-bit memory errors.',
                'It requires a motherboard and CPU that support ECC.',
                'It is required for dual-channel memory to work.'
            ],
            answer: [2, 3],
            explain: 'ECC memory stores extra check bits so it can detect and correct single-bit errors. It only works when the motherboard and CPU support it, which is why it is common in servers and workstations.',
            why: [
                'ECC adds reliability, not bandwidth; it can even be slightly slower.',
                'ECC is available in DIMM form factors and is very common in server DIMMs.',
                'Correct: that is the purpose of the extra ECC bits.',
                'Correct: ECC needs platform support to work.',
                'Dual-channel operation works with ordinary non-ECC memory.'
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
            q: 'A small server needs striping with distributed parity so it can keep running if one drive fails, using the fewest drives possible. Which configuration meets this requirement?',
            choices: [
                'RAID 0 with two drives',
                'RAID 5 with three drives',
                'RAID 1 with two drives',
                'RAID 10 with four drives'
            ],
            answer: [1],
            explain: 'RAID 5 stripes data with distributed parity across at least three drives and survives the loss of any one drive.',
            why: [
                'RAID 0 stripes without parity and has no fault tolerance.',
                'Correct: RAID 5 needs a minimum of three drives and tolerates one drive failure.',
                'RAID 1 mirrors; it is fault tolerant but uses no striping or parity.',
                'RAID 10 combines mirroring and striping without parity and needs four drives.'
            ]
        },
        {
            id: 'aplus-026',
            domain: 'c1-3',
            objective: '3.4',
            type: 'multi',
            q: 'Which two RAID levels provide fault tolerance by mirroring data? (Choose two.)',
            choices: [
                'RAID 1',
                'RAID 10',
                'RAID 0',
                'RAID 5',
                'RAID 6'
            ],
            answer: [0, 1],
            explain: 'RAID 1 mirrors data between drives, and RAID 10 stripes across mirrored pairs. RAID 5 and RAID 6 use parity instead, and RAID 0 has no redundancy.',
            why: [
                'Correct: RAID 1 is a straight mirror.',
                'Correct: RAID 10 stripes data across mirrored pairs.',
                'RAID 0 stripes data with no redundancy at all.',
                'RAID 5 uses distributed parity, not mirroring.',
                'RAID 6 uses dual parity, not mirroring.'
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
            q: 'Which motherboard component securely stores cryptographic keys, such as those used by BitLocker, and is a hardware requirement for Windows 11?',
            choices: [
                'HSM',
                'CMOS battery',
                'Secure Boot',
                'TPM'
            ],
            answer: [3],
            explain: 'The Trusted Platform Module (TPM) is a secure crypto processor that stores keys and measures the boot process. Windows 11 requires TPM 2.0.',
            why: [
                'A hardware security module is a separate, often network-attached, device for managing keys at scale, not a standard motherboard component.',
                'The CMOS battery keeps the real-time clock and firmware settings powered; it stores no keys.',
                'Secure Boot checks bootloader signatures, but it is a firmware feature, not key storage hardware.',
                'Correct: the TPM stores keys and is required by Windows 11.'
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
                'Duplex printing',
                'An automatic document feeder',
                'Secured print',
                'Network scan to email'
            ],
            answer: [2],
            explain: 'Secured print (also called pull printing) holds a job in the queue until the user authenticates at the device, often with a badge or PIN, so documents are not left unattended.',
            why: [
                'Duplex prints on both sides of the page and does nothing to protect output.',
                'The ADF feeds originals for scanning or copying, not print security.',
                'Correct: held jobs are released only when the owner authenticates at the printer.',
                'Scan to email sends scanned documents out; it does not hold print jobs.'
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
            q: 'Which statement best describes a Type 1 hypervisor?',
            choices: [
                'It runs directly on the host hardware, with no host OS beneath it.',
                'It runs as an application on top of an installed desktop operating system.',
                'It shares the host OS kernel among isolated application instances.',
                'It streams a single application to a client without installing it.'
            ],
            answer: [0],
            explain: 'A Type 1 (bare-metal) hypervisor runs directly on the host hardware with no general-purpose OS underneath. A Type 2 hypervisor runs as an application on top of a host OS.',
            why: [
                'Correct: that is the definition of a bare-metal (Type 1) hypervisor.',
                'This describes a Type 2 hypervisor.',
                'This describes containers, not a hypervisor.',
                'This describes application virtualization.'
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
                'A community cloud'
            ],
            answer: [2],
            explain: 'Containers bundle an application and its dependencies but share the host operating system kernel. That makes them lighter and faster to start than VMs, each of which runs a full guest OS.',
            why: [
                'A Type 2 hypervisor runs full VMs, each with its own OS, which uses more resources.',
                'VDI delivers complete hosted desktops to users, not lightweight application packages.',
                'Correct: containers share the host kernel and package the app with its dependencies.',
                'A community cloud is a deployment model shared by organizations, not a packaging method.'
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
                'File synchronization'
            ],
            answer: [1],
            explain: 'Elasticity is the ability to add and release resources automatically as demand changes, so capacity tracks load.',
            why: [
                'Multitenancy means multiple customers share the same underlying infrastructure.',
                'Correct: resources grow and shrink automatically with demand.',
                'Metering is how usage is measured for billing; it does not add or remove capacity.',
                'File synchronization keeps copies of files consistent across devices.'
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
            explain: 'A community cloud is shared by several organizations with common requirements, such as the same regulatory obligations, and is closed to the general public.',
            why: [
                'A public cloud is open to any paying customer.',
                'A private cloud serves a single organization.',
                'A hybrid cloud combines two or more models, such as private plus public.',
                'Correct: several organizations with shared concerns share the infrastructure.'
            ]
        },
        {
            id: 'aplus-037',
            domain: 'c1-5',
            objective: '5.1',
            type: 'single',
            q: 'A desktop shuts down without warning after about 20 minutes of video rendering. The technician finds the CPU heat sink clogged with dust, and monitoring software shows CPU temperatures climbing steadily before each shutdown. What should the technician do first?',
            choices: [
                'Replace the power supply with a higher-wattage modular unit.',
                'Clean the heat sink and fans and renew the thermal paste.',
                'Reinstall the operating system.',
                'Replace the CMOS battery.'
            ],
            answer: [1],
            explain: 'The symptoms point to thermal protection shutting the system down. Cleaning the heat sink and fans, and reapplying thermal paste if needed, addresses the root cause.',
            why: [
                'Rising temperatures before each shutdown point to heat, not insufficient power.',
                'Correct: restoring cooling removes the overheating that triggers the shutdowns.',
                'A software reinstall does nothing about a dust-clogged cooler.',
                'A weak CMOS battery causes lost time and settings, not shutdowns under load.'
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
                'Disable S.M.A.R.T. in the firmware to stop the warning.',
                'Run a full defragmentation to repair bad sectors.',
                'Reinstall the operating system on the same drive.'
            ],
            answer: [0],
            explain: 'S.M.A.R.T. warnings predict drive failure. The priority is to protect the data by backing it up immediately, then replace the drive.',
            why: [
                'Correct: the drive is predicting its own failure, so the data must be protected first.',
                'Hiding the warning does nothing about the failing drive and risks data loss.',
                'Defragmentation does not repair sectors and adds heavy wear to a failing drive.',
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
            q: 'Which two symptoms most commonly indicate that a mechanical hard drive is failing? (Choose two.)',
            choices: [
                'Clicking sounds',
                'Display burn-in',
                'Jitter on VoIP calls',
                'Capacitor swelling',
                'Grinding noises'
            ],
            answer: [0, 4],
            explain: 'Clicking and grinding noises come from the heads or spindle failing inside a mechanical drive. Both mean the data should be backed up and the drive replaced.',
            why: [
                'Correct: repeated clicking often means the read/write heads are failing.',
                'Burn-in is a display problem, not a storage problem.',
                'Jitter is a network symptom.',
                'Swollen capacitors are a motherboard or power supply problem, not a drive symptom.',
                'Correct: grinding points to bearing or platter damage.'
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
            q: 'A kiosk with an OLED display has shown the same menu bar for months. Now a faint outline of that menu bar stays visible even when other content is displayed. What is this called?',
            choices: [
                'Dead pixels',
                'Burn-in',
                'Incorrect color display',
                'A flashing screen'
            ],
            answer: [1],
            explain: 'Burn-in is permanent image retention caused by displaying static content for long periods. OLED pixels age unevenly, which leaves a ghost image.',
            why: [
                'Dead pixels are single dots that stay off; they do not form the outline of an image.',
                'Correct: static content has caused uneven pixel wear and a persistent ghost image.',
                'Incorrect color affects the whole picture, such as a tint, rather than leaving a ghost of old content.',
                'Flashing is an intermittent flicker, not a fixed ghost image.'
            ]
        },
        {
            id: 'aplus-044',
            domain: 'c1-5',
            objective: '5.3',
            type: 'single',
            q: 'A conference room projector shuts itself off after about 30 minutes of use, then refuses to power back on until it has sat for a while. What should the technician check first?',
            choices: [
                'The video cable between the laptop and projector',
                'The air filters and vents for dust or blockage',
                'The laptop\'s display resolution',
                'The projector\'s input source setting'
            ],
            answer: [1],
            explain: 'Intermittent projector shutdowns usually come from overheating. Clogged air filters or blocked vents make the thermal protection shut the lamp off.',
            why: [
                'A bad cable causes signal loss, not the projector turning itself off.',
                'Correct: a projector that shuts down after running and recovers after cooling is overheating.',
                'Resolution mismatches cause sizing or fuzzy-image problems, not shutdowns.',
                'A wrong input shows a "no signal" message; it does not power off the projector.'
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
                'Press the screen back into place with adhesive.',
                'Install an OS update to fix the battery driver.',
                'Power it off, stop charging it, and replace the battery.'
            ],
            answer: [3],
            explain: 'A bulging case is a classic sign of a swollen lithium-ion battery, which is a fire hazard. The device should be powered off, not charged, and the battery replaced and disposed of properly.',
            why: [
                'Cycling a swollen battery increases the risk of fire.',
                'Pressing on a swollen battery can puncture it and start a fire.',
                'Swelling is physical damage to the cell; software cannot fix it.',
                'Correct: a swollen battery is a safety hazard and must be replaced.'
            ]
        },
        {
            id: 'aplus-046',
            domain: 'c1-5',
            objective: '5.5',
            type: 'single',
            q: 'Users report choppy, robotic-sounding VoIP calls, but speed tests show plenty of bandwidth. Monitoring shows packet delay varying widely from one packet to the next. What is the problem, and what is a common fix?',
            choices: [
                'High jitter; configure QoS to prioritize voice traffic.',
                'Low bandwidth; upgrade the internet connection.',
                'A DNS failure; change the DNS servers.',
                'An APIPA address; renew the DHCP lease.'
            ],
            answer: [0],
            explain: 'Variation in packet delay is called jitter, and real-time voice is very sensitive to it. Quality of service (QoS) that prioritizes voice traffic is a common fix.',
            why: [
                'Correct: uneven delay is jitter, and QoS gives voice packets priority.',
                'Speed tests show bandwidth is sufficient.',
                'DNS affects name resolution at call setup, not audio quality during a call.',
                'A host with an APIPA address could not place calls at all.'
            ]
        },
        {
            id: 'aplus-047',
            domain: 'c1-5',
            objective: '5.5',
            type: 'single',
            q: 'A switch log shows that the port connected to one workstation goes down and up dozens of times an hour, and the user complains of constant disconnects. What should the technician try first?',
            choices: [
                'Reinstall the workstation\'s operating system.',
                'Change the Wi-Fi channel on the nearest access point.',
                'Replace the workstation\'s patch cable.',
                'Increase the DHCP lease time.'
            ],
            answer: [2],
            explain: 'Port flapping is often caused by a damaged cable, loose connector, or failing NIC. Replacing the patch cable is the quickest, least disruptive first step.',
            why: [
                'An OS reinstall is excessive and does not address physical link problems.',
                'The workstation is wired, so Wi-Fi channel settings do not apply.',
                'Correct: a faulty cable is the most common and easiest-to-test cause of a flapping port.',
                'Lease time does not affect whether the physical link stays up.'
            ]
        },
        {
            id: 'aplus-048',
            domain: 'c1-5',
            objective: '5.5',
            type: 'multi',
            q: 'Users in a break room lose their 2.4GHz Wi-Fi connection whenever the microwave oven is running. Which two actions would most likely resolve the problem? (Choose two.)',
            choices: [
                'Create DHCP reservations for the break room devices.',
                'Connect the clients to the 5GHz band instead.',
                'Increase the DHCP lease duration.',
                'Relocate the access point farther from the microwave oven.',
                'Replace the access point\'s patch cable with Cat 6.'
            ],
            answer: [1, 3],
            explain: 'Microwave ovens leak energy near 2.4GHz and interfere with Wi-Fi in that band. Moving clients to 5GHz or moving the access point away from the source reduces the interference.',
            why: [
                'Addressing has nothing to do with radio interference.',
                'Correct: 5GHz is not affected by microwave oven interference.',
                'Lease length does not prevent radio interference.',
                'Correct: more distance from the interference source improves the signal-to-noise ratio.',
                'The wired uplink is not where the interference occurs.'
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
                'Duplexing assembly',
                'Network interface'
            ],
            answer: [0],
            explain: 'The fuser uses heat and pressure to bond toner to the paper. If it is not getting hot enough, the toner stays loose and smears.',
            why: [
                'Correct: a weak or failing fuser leaves toner unbonded.',
                'Pickup rollers cause misfeeds and jams, not smearing toner.',
                'The duplexer only flips paper for two-sided printing.',
                'Connectivity problems stop jobs from arriving; they do not affect toner adhesion.'
            ]
        },
        {
            id: 'aplus-050',
            domain: 'c1-5',
            objective: '5.6',
            type: 'single',
            q: 'A Windows print queue shows several documents stuck as "Printing" and no new jobs go through, even though the printer itself is online and idle. What should the technician do first?',
            choices: [
                'Replace the printer\'s toner cartridge.',
                'Reinstall the operating system.',
                'Change the printer\'s paper tray settings.',
                'Restart the Print Spooler service.'
            ],
            answer: [3],
            explain: 'A frozen queue is usually cleared by restarting the Print Spooler service, which releases stuck jobs so printing can resume.',
            why: [
                'Toner does not affect whether jobs leave the Windows queue.',
                'An OS reinstall is excessive for a stuck queue.',
                'Tray settings affect paper selection, not a stalled queue.',
                'Correct: restarting the spooler clears a frozen queue.'
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
            q: 'A technician tries to open the Local Group Policy Editor on a user\'s home computer, but the tool cannot be found. The computer most likely runs which Windows edition?',
            choices: [
                'Windows 11 Home',
                'Windows 11 Pro',
                'Windows 11 Enterprise',
                'Windows 10 Pro for Workstations'
            ],
            answer: [0],
            explain: 'gpedit.msc is not included in Windows Home editions. Pro, Enterprise and Education include it.',
            why: [
                'Correct: Home editions do not include the Local Group Policy Editor.',
                'Pro includes gpedit.msc.',
                'Enterprise includes gpedit.msc.',
                'Pro for Workstations is built on Pro and includes gpedit.msc.'
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
                'Disk Cleanup (cleanmgr.exe)'
            ],
            answer: [0],
            explain: 'Event Viewer (eventvwr.msc) stores the Application and System logs, which record application errors with timestamps and event IDs.',
            why: [
                'Correct: the Application log records crashes with time and error details.',
                'Task Scheduler runs and tracks scheduled tasks; it is not the place for application error logs.',
                'Resource Monitor shows live resource usage, not past crashes.',
                'Disk Cleanup removes unnecessary files and records no events.'
            ]
        },
        {
            id: 'aplus-056',
            domain: 'c2-1',
            objective: '1.5',
            type: 'single',
            q: 'Windows on a workstation is behaving erratically, and the technician suspects that protected system files have been corrupted. Which command checks and repairs them?',
            choices: [
                'chkdsk /f',
                'gpupdate /force',
                'sfc /scannow',
                'diskpart'
            ],
            answer: [2],
            explain: 'System File Checker (sfc /scannow) verifies protected Windows system files and replaces corrupted ones with known good copies.',
            why: [
                'chkdsk repairs file system errors on a volume, not corrupted Windows system files.',
                'gpupdate reapplies Group Policy and does not check file integrity.',
                'Correct: SFC scans and repairs protected system files.',
                'diskpart manages disks, partitions and volumes.'
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
                'Display settings, under the multiple displays arrangement options',
                'Device Manager, on the monitor driver',
                'Power Options, under "Choose what closing the lid does"',
                'Ease of Access settings'
            ],
            answer: [2],
            explain: 'In Power Options, "Choose what closing the lid does" lets the technician set the lid action to "Do nothing" when the laptop is plugged in.',
            why: [
                'Display settings arrange monitors but do not control the lid action.',
                'Driver settings do not decide what the lid switch does.',
                'Correct: this setting controls the lid-close action.',
                'Ease of Access covers accessibility features, not power behavior.'
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
            q: 'A Mac user wants the entire startup disk encrypted so that data cannot be read if the laptop is stolen. Which built-in macOS feature should be enabled?',
            choices: [
                'Time Machine',
                'Keychain',
                'Disk Utility First Aid',
                'FileVault'
            ],
            answer: [3],
            explain: 'FileVault provides full-disk encryption for the macOS startup disk.',
            why: [
                'Time Machine is the macOS backup tool.',
                'Keychain stores passwords and certificates, not disk contents.',
                'First Aid checks and repairs disks; it does not encrypt them.',
                'Correct: FileVault encrypts the whole startup disk.'
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
            q: 'A user\'s Windows installation fails with a message that the application is not compatible with this version of Windows. The technician confirms that the vendor only ships a 64-bit build. What is the most likely cause?',
            choices: [
                'The computer does not have a dedicated graphics card.',
                'The user is not a member of the Administrators group.',
                'The computer is running a 32-bit version of Windows.',
                'The installer was downloaded instead of installed from physical media.'
            ],
            answer: [2],
            explain: 'A 64-bit application cannot run on a 32-bit operating system. A 64-bit OS, by contrast, can run most 32-bit applications.',
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
            q: 'A data center wants to stop unauthorized people from following employees through a secure door. Which physical control forces each person to pass through individually, with one door closing before the next opens?',
            choices: [
                'Access control vestibule',
                'Bollards',
                'Video surveillance',
                'Motion sensors'
            ],
            answer: [0],
            explain: 'An access control vestibule (formerly called a mantrap) has two interlocking doors, so only one person passes at a time. It is a direct countermeasure to tailgating.',
            why: [
                'Correct: interlocking doors allow only one authenticated person through at a time.',
                'Bollards stop vehicles; they do not control people at a doorway.',
                'Cameras record tailgating but do not physically prevent it.',
                'Motion sensors detect movement but do not control passage through a door.'
            ]
        },
        {
            id: 'aplus-066',
            domain: 'c2-2',
            objective: '2.1',
            type: 'multi',
            q: 'Which two are examples of the "something you have" authentication factor? (Choose two.)',
            choices: [
                'Fingerprint scan',
                'PIN',
                'Password',
                'Smart card',
                'Hardware token'
            ],
            answer: [3, 4],
            explain: 'Possession factors are physical or digital items the user holds, such as smart cards and hardware tokens. Passwords and PINs are "something you know," and biometrics are "something you are."',
            why: [
                'A fingerprint is "something you are" (biometric).',
                'A PIN is "something you know."',
                'A password is "something you know."',
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
            q: 'Which wireless security protocol replaces the pre-shared key handshake with Simultaneous Authentication of Equals (SAE) for stronger protection against offline password guessing?',
            choices: [
                'WPA3',
                'WPA2 with AES',
                'WPA2 with TKIP',
                'RADIUS'
            ],
            answer: [0],
            explain: 'WPA3-Personal uses SAE in place of the WPA2 pre-shared key exchange. That makes captured handshakes far less useful for offline dictionary attacks.',
            why: [
                'Correct: WPA3-Personal uses SAE.',
                'WPA2-Personal still uses the pre-shared key four-way handshake.',
                'TKIP is an older, deprecated encryption method and does not use SAE.',
                'RADIUS is an authentication server protocol used with enterprise Wi-Fi, not a Wi-Fi security protocol.'
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
            q: 'An attacker sends a carefully researched email, made to look like it came from outside legal counsel, to a company\'s CEO, asking the CEO to approve a confidential payment. What type of attack is this?',
            choices: [
                'Vishing',
                'Smishing',
                'Dumpster diving',
                'Whaling'
            ],
            answer: [3],
            explain: 'Whaling is spear phishing aimed specifically at senior executives, who have the authority to approve high-value actions.',
            why: [
                'Vishing uses voice calls, not email.',
                'Smishing uses SMS text messages.',
                'Dumpster diving means searching trash for information.',
                'Correct: a targeted phishing attack against a top executive is whaling.'
            ]
        },
        {
            id: 'aplus-073',
            domain: 'c2-2',
            objective: '2.5',
            type: 'single',
            q: 'At a coffee shop, a laptop connects to a network with the same name as the shop\'s Wi-Fi, but it is actually broadcast from an attacker\'s device. What is this attack called?',
            choices: [
                'Evil twin',
                'Tailgating',
                'SQL injection',
                'Brute-force attack'
            ],
            answer: [0],
            explain: 'An evil twin is a rogue access point that imitates a legitimate SSID to lure clients in so the attacker can intercept their traffic.',
            why: [
                'Correct: a rogue AP copying a legitimate network name is an evil twin.',
                'Tailgating is following someone through a secure door.',
                'SQL injection targets databases behind web applications.',
                'Brute force means trying many passwords; it does not involve a fake network.'
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
                'Educate the end user.',
                'Create a new restore point.',
                'Schedule scans and run updates.'
            ],
            answer: [0],
            explain: 'After investigating and quarantining, the next step is to disable System Restore in Windows Home so infected restore points are not kept or used to reinfect the system.',
            why: [
                'Correct: disabling System Restore follows quarantine in the process.',
                'User education is the final step.',
                'A restore point is created only after the system is clean.',
                'Scheduling scans comes after remediation.'
            ]
        },
        {
            id: 'aplus-075',
            domain: 'c2-2',
            objective: '2.8',
            type: 'single',
            q: 'An employee reports that a company smartphone containing customer data was left in a taxi and cannot be found. What should the technician do to protect the data?',
            choices: [
                'Disable the device\'s Bluetooth through MDM.',
                'Issue a remote wipe to the device.',
                'Push an OS update to the device.',
                'Change the user\'s Wi-Fi password.'
            ],
            answer: [1],
            explain: 'A remote wipe, usually sent through MDM or the platform\'s locator service, erases the device so the data cannot be recovered by whoever finds it.',
            why: [
                'Turning off Bluetooth leaves the data on the device.',
                'Correct: remote wipe removes the data from a lost device.',
                'Updates patch vulnerabilities but do not protect data on a lost device.',
                'The phone\'s stored data is still accessible to whoever has the device.'
            ]
        },
        {
            id: 'aplus-076',
            domain: 'c2-2',
            objective: '2.9',
            type: 'single',
            q: 'A company is decommissioning a batch of solid-state drives that held sensitive data. Which disposal method would NOT reliably destroy the data on these drives?',
            choices: [
                'Shredding',
                'Incineration',
                'Pulverizing the drives in a disintegrator',
                'Degaussing'
            ],
            answer: [3],
            explain: 'Degaussing works by disrupting magnetic media. SSDs store data in flash memory cells, so a degausser does not erase them; physical shredding is the reliable choice.',
            why: [
                'Shredding physically destroys the flash chips.',
                'Incineration destroys the storage media completely.',
                'Reducing the drives to small particles destroys the flash chips.',
                'Correct: SSDs are not magnetic storage, so degaussing does not reliably erase them.'
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
                'Lengthen the DHCP lease time.',
                'Update the router firmware.'
            ],
            answer: [2, 4],
            explain: 'Default administrator credentials are widely published, and outdated firmware may contain known vulnerabilities. Changing the credentials and updating the firmware close both gaps.',
            why: [
                'UPnP lets devices open ports automatically, which increases exposure.',
                'Exposing the admin interface to the internet increases the attack surface.',
                'Correct: default credentials are public knowledge.',
                'Lease time has no security effect.',
                'Correct: updates patch known vulnerabilities.'
            ]
        },
        {
            id: 'aplus-078',
            domain: 'c2-2',
            objective: '2.11',
            type: 'single',
            q: 'A technician downloads a utility installer from the vendor\'s website, which also publishes a SHA-256 value for the file. What is the purpose of comparing that value to one computed from the downloaded file?',
            choices: [
                'To decrypt the installer before running it',
                'To check that the browser\'s certificate store is current',
                'To compress the installer for faster installation',
                'To confirm the file was not altered after publication'
            ],
            answer: [3],
            explain: 'A hash value is a fingerprint of the file. If the computed hash matches the published one, the file was not corrupted or tampered with after the vendor published it.',
            why: [
                'Hashing is one-way and does not decrypt anything.',
                'A file hash says nothing about the browser\'s certificate store.',
                'Hashing does not compress files.',
                'Correct: matching hashes confirm file integrity.'
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
            q: 'Several domain users at one site cannot sign in, and the error mentions a time or date difference. Their workstation clocks are about 15 minutes behind the domain controller. What should the technician do?',
            choices: [
                'Reset each user\'s password and require a change at next sign-in.',
                'Rejoin each workstation to a workgroup.',
                'Increase each workstation\'s page file size.',
                'Resync the workstations\' clocks with the domain time source.'
            ],
            answer: [3],
            explain: 'Kerberos authentication rejects requests when the client and domain controller clocks differ by more than the allowed skew, which is five minutes by default. Resyncing the clocks restores sign-in.',
            why: [
                'The passwords are not the problem; authentication is failing on time skew.',
                'Leaving the domain would stop domain sign-in entirely.',
                'Virtual memory size does not affect authentication.',
                'Correct: fixing the time drift brings the clocks back within the Kerberos tolerance.'
            ]
        },
        {
            id: 'aplus-081',
            domain: 'c2-3',
            objective: '3.1',
            type: 'single',
            q: 'A Windows service fails to start. Its properties show that it depends on a second service, and that second service is set to Disabled. What should the technician do?',
            choices: [
                'Reinstall the operating system.',
                'Run sfc /scannow, reboot, and then try starting the service again.',
                'Delete the service\'s registry key and reinstall the application that uses it.',
                'Enable and start the dependency service, then start the original service.'
            ],
            answer: [3],
            explain: 'A service cannot start if a service it depends on cannot run. Setting the dependency to an appropriate startup type, starting it, and then starting the original service resolves the failure.',
            why: [
                'Reinstalling is excessive for a configuration problem.',
                'SFC repairs system files and will not change a service set to Disabled.',
                'Deleting a service is destructive and leaves the original problem unsolved.',
                'Correct: the dependency must be running first.'
            ]
        },
        {
            id: 'aplus-082',
            domain: 'c2-3',
            objective: '3.1',
            type: 'single',
            q: 'A user receives low memory warnings every afternoon. In Task Manager, one application\'s memory usage grows steadily throughout the day until the user closes it. What is the most likely cause?',
            choices: [
                'A memory leak in that application',
                'A failing hard drive',
                'An incorrect system time',
                'A disabled page file on a different drive'
            ],
            answer: [0],
            explain: 'Memory usage that keeps climbing in one process over time is the typical sign of a memory leak in that application. Updating or patching the application is the usual fix.',
            why: [
                'Correct: steadily growing memory in one process indicates a leak.',
                'Disk failure causes errors and slowness, not one process growing in memory.',
                'The clock setting does not affect memory consumption.',
                'Page file settings would affect all applications, not cause one process to keep growing.'
            ]
        },
        {
            id: 'aplus-083',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'A smartphone repeatedly fails to install an available app update, and the app store shows a generic error. Other updates installed last month. What should the technician check first?',
            choices: [
                'Whether the phone\'s screen rotation is locked',
                'Whether NFC is enabled',
                'The phone\'s Bluetooth pairing list',
                'Available storage space on the phone'
            ],
            answer: [3],
            explain: 'App updates need free space to download and unpack. Low storage is one of the most common reasons mobile updates fail.',
            why: [
                'Rotation lock does not affect app installs.',
                'NFC is not used to download app updates.',
                'Bluetooth pairing has no effect on app updates.',
                'Correct: insufficient free space is a frequent cause of failed updates.'
            ]
        },
        {
            id: 'aplus-084',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'A tablet user complains that the screen stays in portrait orientation when the device is turned sideways in every app. What is the most likely cause?',
            choices: [
                'The battery is failing.',
                'Rotation lock is enabled.',
                'The device is in airplane mode.',
                'The OS needs a factory reset.'
            ],
            answer: [1],
            explain: 'When rotation lock (orientation lock) is enabled, the display stays in one orientation regardless of how the device is held.',
            why: [
                'Battery health does not control screen orientation.',
                'Correct: rotation lock pins the screen in one orientation.',
                'Airplane mode disables radios, not the orientation sensor.',
                'A reset is unnecessary for a settings toggle.'
            ]
        },
        {
            id: 'aplus-085',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'A user\'s phone was replaced with a new model, and it now will not connect to the user\'s car over Bluetooth, although the old phone worked. The car still lists the old phone. What should the technician try first?',
            choices: [
                'Delete the old pairing in the car and pair again.',
                'Enable NFC on the new phone.',
                'Turn on the phone\'s Wi-Fi hotspot.',
                'Update the phone\'s cellular carrier settings and restart it.'
            ],
            answer: [0],
            explain: 'Removing the stale pairing from the car and pairing the new phone from scratch establishes a fresh trust relationship between the two devices.',
            why: [
                'Correct: a fresh pairing creates new keys for the new device.',
                'NFC is not used for this Bluetooth audio connection.',
                'A hotspot shares internet access and does not affect Bluetooth pairing.',
                'Carrier settings affect the cellular connection, not Bluetooth.'
            ]
        },
        {
            id: 'aplus-086',
            domain: 'c2-3',
            objective: '3.2',
            type: 'single',
            q: 'Shortly after an OS update, a user\'s phone battery drains much faster than before. What should the technician check first?',
            choices: [
                'The phone\'s NFC payment settings',
                'The phone\'s screen rotation setting',
                'The battery usage breakdown by app',
                'The cellular carrier\'s data cap'
            ],
            answer: [2],
            explain: 'The battery usage screen shows which apps consume the most power. After an update, a misbehaving app or a temporary background process is a common cause.',
            why: [
                'NFC is not a significant battery drain in normal use.',
                'Rotation settings do not meaningfully affect battery life.',
                'Correct: it shows which app or process is draining power.',
                'A data cap affects billing, not battery drain.'
            ]
        },
        {
            id: 'aplus-087',
            domain: 'c2-3',
            objective: '3.3',
            type: 'single',
            q: 'A user installed a free game from a third-party website instead of the official app store. Since then, the phone shows many ads outside the game and has used far more data than usual. What should the technician do first?',
            choices: [
                'Increase the phone\'s cellular data plan.',
                'Enable developer mode to get more detailed diagnostic options.',
                'Root the phone to gain full access for cleanup.',
                'Remove the unauthorized app, then run a malware scan.'
            ],
            answer: [3],
            explain: 'Apps from unofficial sources often carry adware or other malware. Removing the unauthorized app and then scanning the device addresses the likely source.',
            why: [
                'This hides one symptom and leaves the malicious app in place.',
                'Developer mode adds risk and does not remove the app.',
                'Rooting weakens the device\'s security model and is not a cleanup step.',
                'Correct: the sideloaded app is the most likely cause.'
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
                'The DHCP lease duration',
                'The hosts file and proxy settings',
                'The display driver version',
                'The print spooler service'
            ],
            answer: [0, 2],
            explain: 'Browser hijacking is often done by a malicious extension or by changes to the hosts file or proxy settings that redirect traffic. Checking both covers the common causes.',
            why: [
                'Correct: malicious extensions often take over search and redirect results.',
                'Lease time does not affect browser redirection.',
                'Correct: altered name resolution or a rogue proxy can redirect traffic.',
                'Display drivers do not control where the browser sends searches.',
                'The spooler handles printing only.'
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
                'Buy the advertised tool to remove the infections.',
                'Close it without clicking, then scan with trusted anti-malware.',
                'Disable the installed antivirus so the pop-up can finish its scan.',
                'Click the pop-up\'s "Scan now" button to confirm the infections.'
            ],
            answer: [1],
            explain: 'This is a false antivirus alert (scareware). The user should not interact with it. The technician should close the browser or process safely and scan the system with the legitimate security tools.',
            why: [
                'Paying rewards the scam and may install real malware.',
                'Correct: treat it as scareware and verify with trusted tools.',
                'Disabling protection makes the system more vulnerable.',
                'Interacting with the pop-up can trigger a malicious download.'
            ]
        },
        {
            id: 'aplus-091',
            domain: 'c2-4',
            objective: '4.2',
            type: 'single',
            q: 'A change request to modify a production firewall rule is being reviewed by the change board. Which item in the request describes how to restore the previous configuration if the change causes an outage?',
            choices: [
                'Purpose of the change',
                'End-user acceptance',
                'Rollback plan',
                'Scope of the change'
            ],
            answer: [2],
            explain: 'A rollback plan lists the steps to return the system to its prior state if the change fails or causes unexpected problems.',
            why: [
                'The purpose explains why the change is needed, not how to reverse it.',
                'End-user acceptance confirms the change meets users\' needs after it is made.',
                'Correct: the rollback plan defines how to undo the change.',
                'The scope defines what the change affects, not how to undo it.'
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
            q: 'Which statement describes the 3-2-1 backup rule?',
            choices: [
                'Run three full backups, two differentials and one incremental backup every week.',
                'Keep three copies of data on two different media types, with one copy offsite.',
                'Keep backups for three months, two years, and one decade.',
                'Test three backups, restore two, and archive one each month.'
            ],
            answer: [1],
            explain: 'The 3-2-1 rule calls for three copies of the data, on two different types of media, with one copy kept offsite.',
            why: [
                'This describes a schedule, not the 3-2-1 rule.',
                'Correct: this is the 3-2-1 rule.',
                'That describes a retention policy, not the 3-2-1 rule.',
                'This is not the 3-2-1 rule, though regular restore testing is good practice.'
            ]
        },
        {
            id: 'aplus-094',
            domain: 'c2-4',
            objective: '4.4',
            type: 'single',
            q: 'A technician is about to install a RAM module in a desktop in a carpeted office. Which precaution best protects the module from electrostatic discharge?',
            choices: [
                'Keep the PC plugged in and powered on while working.',
                'Wear an ESD wrist strap connected to a proper ground.',
                'Wear rubber-soled shoes while working.',
                'Wipe the module with a dry cloth before installing it.'
            ],
            answer: [1],
            explain: 'An ESD wrist strap attached to a proper ground keeps the technician at the same potential as the equipment, so static does not discharge into sensitive parts.',
            why: [
                'Working on powered equipment risks electrical damage and injury.',
                'Correct: a grounded wrist strap prevents static buildup from discharging into components.',
                'Insulating shoes do not bleed off static and can let a charge build up.',
                'Rubbing a component with a cloth can generate static.'
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
                'Delete the files, finish the repair, and note in the ticket that the system was cleaned up.',
                'Copy the files to a USB drive to show a coworker.',
                'Confront the employee about the files.',
                'Stop work, preserve the device unchanged, report it to management, and document the chain of custody.'
            ],
            answer: [3],
            explain: 'The technician should stop, avoid altering the evidence, report to management (who may involve law enforcement), and document the chain of custody for the device.',
            why: [
                'Deleting the files destroys evidence and may itself break policy or law.',
                'This spreads the material and breaks the chain of custody.',
                'Investigation is management\'s job; confronting the user can compromise the case.',
                'Correct: this preserves evidence and follows the incident response process.'
            ]
        },
        {
            id: 'aplus-097',
            domain: 'c2-4',
            objective: '4.7',
            type: 'single',
            q: 'A frustrated customer interrupts a technician several times and insists the problem is the technician\'s fault. What is the most professional response?',
            choices: [
                'Explain firmly that the problem is the customer\'s fault.',
                'Stay calm, do not argue, and ask open-ended questions.',
                'Leave and send a different technician later.',
                'Describe the issue in technical jargon to establish credibility.'
            ],
            answer: [1],
            explain: 'The technician should stay calm, avoid arguing or getting defensive, listen actively, and ask clarifying questions to narrow the problem.',
            why: [
                'Arguing and assigning blame escalates the conflict.',
                'Correct: this de-escalates the situation and helps gather useful information.',
                'Walking away dismisses the customer\'s issue and delays the fix.',
                'Jargon confuses customers and damages communication.'
            ]
        },
        {
            id: 'aplus-098',
            domain: 'c2-4',
            objective: '4.8',
            type: 'single',
            q: 'A technician is writing a script that will be run by the Bash shell on Linux workstations. Which file extension is conventionally used?',
            choices: [
                '.ps1',
                '.sh',
                '.bat',
                '.vbs'
            ],
            answer: [1],
            explain: 'Shell scripts for Bash and other Unix shells conventionally use the .sh extension.',
            why: [
                '.ps1 is used for PowerShell scripts.',
                'Correct: .sh is the conventional extension for shell scripts.',
                '.bat is a Windows batch file.',
                '.vbs is a VBScript file used on Windows.'
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
            q: 'A technician asks an AI assistant for a command to fix a printer problem. The assistant confidently gives a command-line switch that, according to the official documentation, does not exist. What is this AI limitation called?',
            choices: [
                'Bias',
                'Plagiarism',
                'Data privacy',
                'Hallucination'
            ],
            answer: [3],
            explain: 'A hallucination is when an AI system generates plausible-sounding but false information. AI output should be checked against authoritative sources before it is used.',
            why: [
                'Bias is a systematic skew in output, often learned from training data, not an invented fact.',
                'Plagiarism is presenting someone else\'s work as your own.',
                'Data privacy concerns how information shared with an AI is handled, not whether its answers are true.',
                'Correct: confidently stated but fabricated output is a hallucination.'
            ]
        }
    ]
};
