/*
 * Datacenter Quest - Windows Realm: Windows client and server administration,
 * from the help desk to Active Directory disaster recovery.
 * See QUEST-AUTHORING.md for the shape every quest file follows.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('../questions.js'), require('../world.js'));
    else factory(root.QuestQuestions, root.QuestWorld);
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';
    const { pick, randInt, shuffle, fromPool } = Q.util;

    // Distinct entries of `list` that are not `answer`, shuffled, at most n
    const others = (rng, list, answer, n) => shuffle(rng, list.filter(x => x !== answer)).slice(0, n);

    // ================= ACT 1: help desk =================

    const TOOLS = [
        ['Which MMC snap-in file opens Event Viewer?', 'eventvwr.msc', ['eventlog.msc', 'events.msc', 'perfmon.msc', 'services.msc', 'evtx.msc', 'compmgmt.exe'], 'The file name is "event viewer" with the vowels mostly squeezed out.', 'text', ['eventvwr']],
        ['Which command clears the DNS resolver cache on a Windows client?', 'ipconfig /flushdns', ['ipconfig /registerdns', 'ipconfig /displaydns', 'ipconfig /release', 'ipconfig /renew', 'nbtstat -R', 'netsh winsock reset'], 'It is an ipconfig switch. You are flushing, not displaying.', 'text', ['Clear-DnsClientCache']],
        ['Which command scans protected Windows system files and repairs the bad ones?', 'sfc /scannow', ['sfc /verifyonly', 'chkdsk /f', 'bootrec /fixboot', 'DISM /Online /Cleanup-Image /CheckHealth', 'defrag C: /O', 'winsat formal'], 'The System File Checker, told to scan right now.'],
        ['Which netstat command lists every connection and listening port with the owning process ID, numerically?', 'netstat -ano', ['netstat -r', 'netstat -e', 'netstat -s', 'netstat -a', 'netstat -b', 'arp -a'], 'All, numeric, and the Owner PID. Three letters.', 'text', ['netstat -aon', 'netstat -nao', 'netstat -noa', 'netstat -ona', 'netstat -oan']],
        ['Browsers fail but ping works after malware removal. Which command resets the Winsock catalog?', 'netsh winsock reset', ['netsh int ip reset', 'ipconfig /flushdns', 'netsh advfirewall reset', 'nbtstat -RR', 'route -f', 'netsh winhttp reset proxy'], 'It is a netsh context named after the Windows Sockets API.'],
        ['A laptop shows 169.254.23.7 and no gateway. What does Windows call this self-assigned address (one acronym)?', 'APIPA', ['DHCP', 'NAT', 'CGNAT', 'RFC1918', 'SLAAC', 'ULA'], 'Automatic Private IP Addressing: what you get when DHCP never answers.', 'text', ['automatic private ip addressing']],
        ['Which keyboard shortcut opens Task Manager directly, without the security screen?', 'Ctrl+Shift+Esc', ['Ctrl+Alt+Del', 'Ctrl+Shift+Del', 'Win+T', 'Alt+F4', 'Ctrl+Alt+Esc', 'Win+X'], 'Ctrl+Alt+Del makes you pick from a menu. The direct one swaps two keys.', 'text', ['ctrl shift esc', 'ctrl+shift+escape', 'ctrl-shift-esc']],
        ['Which MMC snap-in file manages local users and groups on a workstation?', 'lusrmgr.msc', ['usrmgr.msc', 'dsa.msc', 'secpol.msc', 'gpedit.msc', 'users.msc', 'useraccounts.msc'], 'Local USeR ManaGeR.', 'text', ['lusrmgr']],
        ['A user keeps landing on a temporary profile. Under HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion, which key maps SIDs to profile folders?', 'ProfileList', ['Winlogon', 'ProfileGuid', 'Profiles', 'UserList', 'Shell Folders', 'User Shell Folders'], 'Look for the SID that has a .bak twin. The key is a list of profiles.'],
        ['Which folder holds user profiles by default on Windows 11?', 'C:\\Users', ['C:\\Documents and Settings', 'C:\\ProgramData', 'C:\\Windows\\Profiles', 'C:\\Users\\Public', 'C:\\Windows\\System32\\config\\systemprofile', 'C:\\Program Files'], 'The XP-era path still exists, but only as a junction pointing here.', 'text', ['C:\\Users\\', '%SystemDrive%\\Users']]
    ];

    const WIN_PORTS = [
        ['What TCP port does Remote Desktop (RDP) listen on by default?', '3389', ['3390', '5900', '22', '445', '5985', '3268'], 'Four digits, starts with 33.'],
        ['What port does the Kerberos KDC on a domain controller listen on?', '88', ['464', '389', '636', '8080', '749', '135'], 'Two digits, both the same.'],
        ['What TCP port do clients use to query the Global Catalog over plain LDAP?', '3268', ['3269', '389', '636', '3389', '88', '135'], 'Plain LDAP is 389. The Global Catalog sits in the 3200s.'],
        ['What TCP port does the Global Catalog use over TLS?', '3269', ['3268', '636', '389', '3389', '443', '5986'], 'One above the plain Global Catalog port.'],
        ['What TCP port does WinRM (PowerShell remoting) use over HTTP?', '5985', ['5986', '80', '8080', '3389', '445', '135'], 'HTTPS remoting is one higher. Both start with 598.'],
        ['What TCP port does WinRM use over HTTPS?', '5986', ['5985', '443', '8443', '3389', '636', '5989'], 'One above the HTTP listener.'],
        ['What TCP port does the RPC Endpoint Mapper listen on?', '135', ['137', '139', '445', '593', '49152', '111'], 'The NetBIOS ports are 137 to 139. The endpoint mapper sits just below them.'],
        ['What port does Kerberos use for password changes (kpasswd)?', '464', ['88', '445', '389', '636', '749', '646'], 'Not the KDC port itself. Its little-used sibling sits in the 400s.'],
        ['What TCP port does SMB use when running directly over TCP, without NetBIOS?', '445', ['139', '137', '135', '443', '3389', '544'], 'One digit off HTTPS.'],
        ['What TCP port does plain LDAP use?', '389', ['636', '3268', '88', '3389', '398', '53'], 'LDAPS is 636. Plain is a lower three-digit number.']
    ];

    const RECOVERY = [
        ['On Windows 11, which key do you hold while clicking Restart to boot into Advanced startup (WinRE)?', 'Shift', ['Ctrl', 'Alt', 'F8', 'F11', 'Win', 'Esc'], 'F8 has not worked by default since Windows 8. Hold the key you use for capitals.'],
        ['Windows boots into WinRE on its own after how many consecutive failed boot attempts?', '2', ['3', '1', '5', '4', '10', '0'], 'It does not wait long. Fewer than three.', 'int'],
        ['Which command makes the next boots go to minimal Safe Mode?', 'bcdedit /set {current} safeboot minimal', ['bcdedit /set {current} safeboot network', 'bcdedit /deletevalue {current} safeboot', 'shutdown /r /o', 'msconfig /safe', 'bootrec /safemode', 'bcdedit /set {current} bootmenupolicy legacy'], 'It is a BCD edit. Remember to delete the value afterwards, or you live in Safe Mode.', 'text', ['bcdedit /set {default} safeboot minimal', 'bcdedit /set safeboot minimal']],
        ['Which command reports whether WinRE is enabled and where its image lives?', 'reagentc /info', ['reagentc /enable', 'bcdedit /enum', 'bootrec /scanos', 'dism /get-wiminfo', 'winre /status', 'diskpart list volume'], 'The Recovery Agent configuration tool, asked for information.'],
        ['Which WinRE option rolls Windows back to an earlier restore point?', 'System Restore', ['Startup Repair', 'Reset this PC', 'System Image Recovery', 'Uninstall Updates', 'Startup Settings', 'Go back to the previous version'], 'Restore points belong to the tool with "restore" in its name.', 'text', ['rstrui', 'rstrui.exe']],
        ['sfc keeps failing to repair files. Which command repairs the component store it uses as a source?', 'DISM /Online /Cleanup-Image /RestoreHealth', ['DISM /Online /Cleanup-Image /CheckHealth', 'DISM /Online /Cleanup-Image /ScanHealth', 'DISM /Online /Cleanup-Image /StartComponentCleanup', 'sfc /scannow', 'chkdsk /r', 'bootrec /rebuildbcd'], 'CheckHealth and ScanHealth only look. You want the one that restores.'],
        ['Which bootrec switch scans for Windows installations and rebuilds the BCD store?', 'bootrec /rebuildbcd', ['bootrec /fixmbr', 'bootrec /fixboot', 'bootrec /scanos', 'bcdedit /export', 'bcdboot /rebuild', 'sfc /scanboot'], 'You are rebuilding the Boot Configuration Data.'],
        ['On the Windows 11 Startup Settings screen, which number key picks "Enable Safe Mode with Networking"?', '5', ['4', '6', '3', '7', '8', '9'], 'Plain Safe Mode is 4. Command Prompt is 6.', 'int']
    ];

    const NTFS_LEVELS = ['Read', 'Modify', 'Full Control'];
    // Share Change and NTFS Modify are treated as the same level: Microsoft's "Share and NTFS
    // Permissions on a File Server" pairs them as equivalents, applies the more restrictive of
    // the two over the network, and notes share permissions don't apply to local users.
    const SHARE_LEVELS = ['Read', 'Change', 'Full Control'];
    const NTFS_DISTRACTORS = ['Read', 'Modify', 'Full Control', 'No access', 'Read & Execute', 'Write', 'List folder contents'];

    function genNtfs(rng) {
        const groups = shuffle(rng, ['Accounting', 'Finance-RW', 'Domain Users', 'Auditors', 'Payroll', 'Project-X']).slice(0, 2);
        const ntfs = groups.map(() => randInt(rng, 1, 3));
        const share = randInt(rng, 1, 3);
        const shareGroup = pick(rng, ['Everyone', 'Authenticated Users']);
        const local = rng() < 0.3;
        const deny = rng() < 0.15;
        const user = pick(rng, ['dana', 'priya', 'marcus', 'li.wei', 'jo.smith', 'omar']);
        let q = `${user} is in ${groups[0]} and ${groups[1]}. On the folder \\\\FS01\\Finance:\n` +
            `  NTFS: ${groups[0]} = Allow ${NTFS_LEVELS[ntfs[0] - 1]}, ${groups[1]} = Allow ${NTFS_LEVELS[ntfs[1] - 1]}\n` +
            `  Share: ${shareGroup} = ${SHARE_LEVELS[share - 1]}\n`;
        if (deny) q += `  ${user} is also in Contractors, which has an explicit NTFS Deny Full Control.\n`;
        q += local ? `${user} logs on at the file server's own console and opens the folder on its local disk. What is the effective access?`
            : `${user} opens the folder through the share from a workstation. What is the effective access?`;
        const best = Math.max(ntfs[0], ntfs[1]);
        let answer, accept, hint;
        if (deny) {
            answer = 'No access'; accept = ['No access', 'none', 'deny', 'denied', 'access denied'];
            hint = 'Check every group the user is in, not just the ones with Allow entries.';
        } else if (local) {
            answer = NTFS_LEVELS[best - 1]; accept = [answer];
            hint = 'Share permissions only apply to connections that come through the share.';
        } else {
            const eff = Math.min(best, share);
            answer = NTFS_LEVELS[eff - 1];
            accept = eff === 2 ? ['Modify', 'Change'] : [answer];
            hint = 'NTFS allows from different groups add up. Then the network path takes the more restrictive of share and NTFS.';
        }
        return { q, answer, accept, norm: 'text', distractors: NTFS_DISTRACTORS.filter(d => d !== answer), hint };
    }

    function genDhcp(rng) {
        const third = randInt(rng, 0, 254);
        const net = `10.20.${third}`;
        if (rng() < 0.6) {
            const start = randInt(rng, 10, 60);
            const end = randInt(rng, 150, 254);
            const total = end - start + 1;
            const exN = randInt(rng, 5, 30);
            const exStart = randInt(rng, start, start + 20);
            const res = randInt(rng, 0, 6);
            const answer = total - exN - res;
            return {
                q: `A Windows DHCP scope on ${net}.0/24 has the address range ${net}.${start} to ${net}.${end}, an exclusion range ${net}.${exStart} to ${net}.${exStart + exN - 1}, ` +
                    `and ${res} reservation${res === 1 ? '' : 's'} inside the range but outside the exclusion. How many addresses can it lease to clients that have no reservation?`,
                answer: String(answer), norm: 'int',
                distractors: [total, total - exN, total - res, answer - 1, answer + 1, end - start - exN - res, 254 - exN - res].map(String),
                hint: 'Count the range inclusively (end minus start plus one), then take out what is excluded and what is reserved.'
            };
        }
        const hosts = randInt(rng, 20, 2000);
        let p = 30;
        while (2 ** (32 - p) - 2 < hosts) p--;
        return {
            q: `You need one Windows DHCP scope for ${hosts} clients on a single subnet. What is the longest prefix (smallest subnet) that fits them? Answer as /nn.`,
            answer: '/' + p, norm: 'cidr',
            distractors: [p - 1, p + 1, p - 2, p + 2, 24, 16, 22, 23].filter(x => x !== p && x >= 8 && x <= 30).map(x => '/' + x),
            hint: `A /n leaves 2^(32-n) addresses, minus the network and broadcast. ${hosts} clients must fit in what is left.`
        };
    }

    const BSOD = [
        ['IRQL_NOT_LESS_OR_EQUAL', '0xA'], ['MEMORY_MANAGEMENT', '0x1A'], ['KMODE_EXCEPTION_NOT_HANDLED', '0x1E'],
        ['NTFS_FILE_SYSTEM', '0x24'], ['SYSTEM_SERVICE_EXCEPTION', '0x3B'], ['PAGE_FAULT_IN_NONPAGED_AREA', '0x50'],
        ['KERNEL_DATA_INPAGE_ERROR', '0x7A'], ['INACCESSIBLE_BOOT_DEVICE', '0x7B'], ['SYSTEM_THREAD_EXCEPTION_NOT_HANDLED', '0x7E'],
        ['UNEXPECTED_KERNEL_MODE_TRAP', '0x7F'], ['DRIVER_POWER_STATE_FAILURE', '0x9F'], ['DRIVER_IRQL_NOT_LESS_OR_EQUAL', '0xD1'],
        ['MANUALLY_INITIATED_CRASH', '0xE2'], ['UNMOUNTABLE_BOOT_VOLUME', '0xED'], ['CRITICAL_PROCESS_DIED', '0xEF'],
        ['CLOCK_WATCHDOG_TIMEOUT', '0x101'], ['VIDEO_TDR_FAILURE', '0x116'], ['WHEA_UNCORRECTABLE_ERROR', '0x124'],
        ['DPC_WATCHDOG_VIOLATION', '0x133'], ['KERNEL_SECURITY_CHECK_FAILURE', '0x139']
    ];

    const BSOD_SCENARIOS = [
        ['After someone switches the storage controller from AHCI to RAID in firmware, Windows stops at boot. Which stop code do you expect?', 'INACCESSIBLE_BOOT_DEVICE', 'Windows can no longer reach the disk it boots from.'],
        ['A server shows a stop code naming a machine-check hardware error the CPU could not correct. Which one?', 'WHEA_UNCORRECTABLE_ERROR', 'WHEA is the Windows Hardware Error Architecture.'],
        ['You crash a hung server on purpose with the keyboard (CrashOnCtrlScroll) to get a memory dump. Which stop code appears?', 'MANUALLY_INITIATED_CRASH', 'You did it by hand.'],
        ['A process Windows cannot live without, such as csrss.exe or wininit.exe, exits. Which stop code follows?', 'CRITICAL_PROCESS_DIED', 'A critical process, and it died.']
    ];

    function genBsod(rng) {
        const names = BSOD.map(b => b[0]);
        const roll = rng();
        if (roll < 0.2) {
            const [q, answer, hint] = pick(rng, BSOD_SCENARIOS);
            return { q, answer, norm: 'text', accept: [answer, answer.replace(/_/g, ' ')], distractors: others(rng, names, answer, 8), hint };
        }
        const [name, code] = pick(rng, BSOD);
        const bare = code.slice(2);
        if (roll < 0.6) {
            return {
                q: `A blue screen reads "Stop code: ${name}". What is its bug check code, in hex?`,
                answer: code, norm: 'text', accept: [code, bare, '0x' + bare.padStart(8, '0')],
                distractors: others(rng, BSOD.map(b => b[1]), code, 8),
                hint: `Answer as 0x followed by hex digits. This one is ${parseInt(code, 16) < 0x100 ? 'below' : 'above'} 0x100.`
            };
        }
        return {
            q: `A minidump reports bug check ${code}. What is its symbolic name?`,
            answer: name, norm: 'text', accept: [name, name.replace(/_/g, ' ')],
            distractors: others(rng, names, name, 8),
            hint: `Its name has ${name.split('_').length} words joined by underscores and starts with ${name[0]}.`
        };
    }

    // ================= ACT 2: server and Active Directory =================

    const FSMO = [
        ['Which FSMO role is the authoritative time source for its domain, and in the forest root syncs to an external NTP source?', 'PDC Emulator', ['RID Master', 'Infrastructure Master', 'Schema Master', 'Domain Naming Master', 'Global Catalog', 'Bridgehead Server'], 'The same role that hears about password changes first.', 'text', ['PDC', 'PDC emulator master']],
        ['Which FSMO role hands out blocks of relative IDs so DCs can create new security principals?', 'RID Master', ['PDC Emulator', 'Infrastructure Master', 'Schema Master', 'Domain Naming Master', 'Global Catalog', 'KDC'], 'Every SID ends in a relative ID. Someone has to allocate the pools.', 'text', ['RID', 'RID pool master']],
        ['Which FSMO role must be online to add or remove a domain in the forest?', 'Domain Naming Master', ['Schema Master', 'PDC Emulator', 'RID Master', 'Infrastructure Master', 'Global Catalog', 'Enterprise Admin'], 'It is forest-wide, and it keeps domain names unique.', 'text', ['Domain Naming']],
        ['Which forest-wide FSMO role controls every change to the Active Directory schema?', 'Schema Master', ['Domain Naming Master', 'PDC Emulator', 'RID Master', 'Infrastructure Master', 'Schema Admins', 'Global Catalog'], 'It is named after what it guards.', 'text', ['Schema']],
        ['Which FSMO role updates references to objects in other domains, and should not sit on a Global Catalog unless every DC is a GC?', 'Infrastructure Master', ['RID Master', 'PDC Emulator', 'Schema Master', 'Domain Naming Master', 'Bridgehead Server', 'ISTG'], 'It maintains the cross-domain plumbing: the infrastructure.', 'text', ['Infrastructure']],
        ['A single-domain forest has how many FSMO roles in total?', '5', ['3', '2', '7', '4', '1', '6'], 'Two forest-wide roles plus three per domain.', 'int'],
        ['Which command lists the holders of all FSMO roles?', 'netdom query fsmo', ['dcdiag /fsmo', 'repadmin /fsmo', 'nltest /fsmo', 'netdom query dc', 'ntdsutil roles', 'Get-ADDomainController -Fsmo'], 'The netdom tool, querying the operations masters by their nickname.'],
        ['Which PowerShell cmdlet transfers, or with -Force seizes, a FSMO role?', 'Move-ADDirectoryServerOperationMasterRole', ['Move-ADFSMORole', 'Set-ADFSMORole', 'Transfer-ADOperationMasterRole', 'Set-ADDomainController', 'Move-ADObject', 'Set-ADDomain'], 'Approved verb Move. The noun spells out "directory server operation master role" in full.']
    ];

    const DCAUTH = [
        ['By default, how many minutes of clock skew does Kerberos tolerate between a client and a DC?', '5', ['10', '15', '1', '30', '2', '60'], 'Less than ten. This is why the PDC Emulator\'s time matters.', 'int'],
        ['Which DNS SRV record does a client query to find any domain controller for corp.example.com?', '_ldap._tcp.dc._msdcs.corp.example.com', ['_dc._tcp.corp.example.com', '_ldap._udp.dc._msdcs.corp.example.com', '_ldap._tcp.pdc._msdcs.corp.example.com', '_gc._tcp.corp.example.com', '_msdcs._ldap.dc.corp.example.com', '_ldap.dc._msdcs.corp.example.com'], 'Service first, then protocol, then dc, then the _msdcs subdomain. The PDC record finds only one DC.'],
        ['Which service on a domain controller registers its SRV records in DNS, and re-registers them when restarted?', 'Netlogon', ['DNS Client', 'DHCP Client', 'NTDS', 'Kerberos Key Distribution Center', 'W32Time', 'LanmanServer'], 'Its records are also written to a .dns file of the same name in System32\\config.', 'text', ['net logon']],
        ['Which command lists the Kerberos tickets cached for your logon session?', 'klist', ['kinit', 'klist purge', 'setspn -L', 'whoami /groups', 'nltest /sc_query', 'ktpass'], 'Kerberos list.'],
        ['Which account\'s secret signs and encrypts every Kerberos TGT in a domain?', 'krbtgt', ['Administrator', 'Guest', 'SYSTEM', 'DefaultAccount', 'NetworkService', 'the DC computer account'], 'Kerberos ticket-granting ticket, as an account name.'],
        ['In the Default Domain Policy, what is the default maximum lifetime of a user ticket (TGT), in hours?', '10', ['8', '24', '7', '12', '1', '4'], 'A long working day. More than eight.', 'int'],
        ['Which tool lists service principal names and, with -X, finds duplicates that break Kerberos?', 'setspn', ['klist', 'ktpass', 'nltest', 'dsquery', 'repadmin', 'netdom'], 'Set SPN. It also reads them.'],
        ['You connect to a file server by IP address instead of name, so no SPN matches. Which protocol does Windows fall back to?', 'NTLM', ['LDAP', 'RADIUS', 'Basic', 'CHAP', 'Digest', 'SAML'], 'Kerberos tickets are bound to names. The fallback is the older challenge-response protocol.', 'text', ['NTLMv2']]
    ];

    const PSCMD = [
        ['Which cmdlet unlocks an Active Directory user who tripped the lockout threshold?', 'Unlock-ADAccount', ['Enable-ADAccount', 'Set-ADAccountPassword', 'Clear-ADAccountExpiration', 'Unlock-ADUser', 'Reset-ADAccount', 'Set-ADUser -Enabled $true'], 'Verb Unlock. The noun is account, not user.'],
        ['Which command finds every locked-out account in the domain?', 'Search-ADAccount -LockedOut', ['Get-ADUser -LockedOut', 'Find-ADAccount -Locked', 'Search-ADAccount -AccountDisabled', 'Search-ADAccount -PasswordExpired', 'Get-ADAccountLockout', 'Get-LockedAccount'], 'Searching, with a switch named for the state.'],
        ['Which cmdlet lists PowerShell\'s approved verbs?', 'Get-Verb', ['Get-Command -Verb', 'Get-ApprovedVerb', 'Show-Verb', 'Get-Member', 'Get-Alias', 'Get-Help about_Verbs'], 'Get, followed by the thing you want, singular.'],
        ['Which cmdlet, given -Port 3389, tells you whether a TCP port on a remote host is reachable?', 'Test-NetConnection', ['Test-Port', 'Get-NetTCPConnection', 'Resolve-DnsName', 'Test-NetPort', 'Get-NetRoute', 'Test-ComputerSecureChannel'], 'Its alias is tnc.', 'text', ['tnc']],
        ['Which cmdlet queries event logs with -FilterHashtable and works in both Windows PowerShell and PowerShell 7?', 'Get-WinEvent', ['Get-EventLog', 'Get-Event', 'Read-EventLog', 'Get-LogEvent', 'Show-EventLog', 'Get-WinLog'], 'Get-EventLog is the old one, gone from PowerShell 7. The newer one has "Win" in it.'],
        ['Which cmdlet opens an interactive remote shell on another machine?', 'Enter-PSSession', ['Invoke-Command', 'New-PSSession', 'Connect-PSSession', 'Start-PSSession', 'Enter-RemoteSession', 'Open-PSSession'], 'Invoke-Command runs a script block and returns. You want to walk in.'],
        ['Which cmdlet performs a DNS lookup, like nslookup but with objects?', 'Resolve-DnsName', ['Get-DnsClientCache', 'Get-DnsRecord', 'Test-DnsServer', 'Resolve-Host', 'Get-DnsName', 'Get-DnsServerResourceRecord'], 'Verb Resolve.'],
        ['Which cmdlet shows the properties and methods of whatever you pipe into it?', 'Get-Member', ['Get-Property', 'Get-Help', 'Format-List', 'Get-TypeData', 'Get-Variable', 'Select-Object'], 'It lists the members of an object. Alias gm.', 'text', ['gm']],
        ['What is the default PowerShell execution policy on Windows Server 2016 and later?', 'RemoteSigned', ['Restricted', 'AllSigned', 'Unrestricted', 'Bypass', 'Undefined', 'Default'], 'Windows client editions default to Restricted. Servers are a step more permissive.']
    ];

    const EVENTS = {
        Security: [
            [4624, 'An account successfully logged on'], [4625, 'An account failed to log on'], [4634, 'An account was logged off'],
            [4648, 'A logon was attempted with explicit credentials'], [4672, 'Special privileges were assigned to a new logon'],
            [4720, 'A user account was created'], [4722, 'A user account was enabled'], [4724, 'An attempt was made to reset an account\'s password'],
            [4725, 'A user account was disabled'], [4726, 'A user account was deleted'], [4728, 'A member was added to a security-enabled global group'],
            [4732, 'A member was added to a security-enabled local group'], [4740, 'A user account was locked out'], [4767, 'A user account was unlocked'],
            [4768, 'A Kerberos TGT was requested'], [4769, 'A Kerberos service ticket was requested'], [4771, 'Kerberos pre-authentication failed'],
            [4776, 'The DC attempted to validate an account\'s credentials (NTLM)'], [1102, 'The audit log was cleared']
        ],
        System: [
            [6005, 'The Event Log service was started'], [6006, 'The Event Log service was stopped'],
            [6008, 'The previous system shutdown was unexpected'], [1074, 'A user or process initiated a restart or shutdown'],
            [41, 'Kernel-Power: the system rebooted without cleanly shutting down']
        ]
    };
    const LOGON_TYPES = [[2, 'Interactive (at the console)'], [3, 'Network (for example, an SMB share)'], [4, 'Batch (scheduled task)'],
        [5, 'Service'], [7, 'Unlock'], [8, 'NetworkCleartext'], [9, 'NewCredentials (runas /netonly)'], [10, 'RemoteInteractive (RDP)'], [11, 'CachedInteractive (cached domain logon)']];

    function genEvents(rng) {
        if (rng() < 0.25) {
            const [n, label] = pick(rng, LOGON_TYPES);
            return {
                q: `A 4624 event shows a logon of type "${label}". What logon type number does the event record?`,
                answer: String(n), norm: 'int',
                distractors: others(rng, LOGON_TYPES.map(t => String(t[0])), String(n), 8),
                hint: 'Console is 2, network is 3. Remote Desktop and cached logons are the double digits.'
            };
        }
        const log = rng() < 0.8 ? 'Security' : 'System';
        const [id, meaning] = pick(rng, EVENTS[log]);
        const ids = EVENTS.Security.concat(EVENTS.System).map(e => String(e[0]));
        return {
            q: `In the ${log} log, which event ID records: "${meaning}"?`,
            answer: String(id), norm: 'int',
            distractors: others(rng, ids, String(id), 8),
            hint: log === 'Security'
                ? 'Logons live in the 4620s, account management in the 4720s to 4760s, Kerberos in the 4760s and 4770s.'
                : 'Event Log service events are in the 6000s. Kernel-Power and user-initiated restarts are the odd ones out.'
        };
    }

    const SERVICES = ['Spooler', 'W32Time', 'WinRM', 'BITS', 'wuauserv', 'Dnscache', 'LanmanServer', 'Netlogon', 'DNS', 'NTDS', 'TermService', 'DHCPServer', 'Kdc', 'DFSR'];

    function genPs(rng) {
        const names = shuffle(rng, SERVICES).slice(0, randInt(rng, 7, 10));
        const rows = names.map(n => ({ n, status: rng() < 0.6 ? 'Running' : 'Stopped', start: pick(rng, ['Automatic', 'Automatic', 'Manual', 'Disabled']) }))
            .map(r => (r.start === 'Disabled' ? Object.assign(r, { status: 'Stopped' }) : r));
        const table = rows.map(r => `  ${r.status.padEnd(8)} ${r.start.padEnd(10)} ${r.n}`).join('\n');
        const count = f => rows.filter(f).length;
        const variants = [
            ['Where-Object Status -eq \'Running\'', r => r.status === 'Running'],
            ['Where-Object Status -ne \'Running\'', r => r.status !== 'Running'],
            ['Where-Object StartType -eq \'Automatic\'', r => r.start === 'Automatic'],
            ['Where-Object { $_.StartType -eq \'Automatic\' -and $_.Status -eq \'Stopped\' }', r => r.start === 'Automatic' && r.status === 'Stopped'],
            ['Where-Object { $_.Status -eq \'Running\' -or $_.StartType -eq \'Disabled\' }', r => r.status === 'Running' || r.start === 'Disabled']
        ];
        const [filter, fn] = pick(rng, variants);
        const answer = count(fn);
        return {
            q: `Get-Service returns these ${rows.length} services (Status, StartType, Name):\n${table}\n` +
                `What Count does this print?\n  Get-Service | ${filter} | Measure-Object`,
            answer: String(answer), norm: 'int',
            distractors: [rows.length, rows.length - answer, answer + 1, answer - 1, count(r => r.status === 'Running'), count(r => r.start === 'Automatic'), count(r => r.status === 'Stopped')]
                .filter(x => x >= 0).map(String),
            hint: 'Go down the list one row at a time and tick the rows the filter keeps. -and needs both, -or needs either.'
        };
    }

    function genGpo(rng) {
        const ou = pick(rng, ['Workstations', 'Servers', 'Finance', 'Branch-Offices', 'Kiosks']);
        const child = pick(rng, ['Laptops', 'Payroll', 'Floor-3', 'Tier1', 'Lab']);
        const scenario = randInt(rng, 0, 2);
        let steps;
        if (scenario === 1) {
            steps = ['the computer\'s Local Group Policy', 'a GPO linked to the site HQ', 'a GPO linked to the domain corp.example.com',
                `a GPO linked to OU ${ou} with link order 2`, `a GPO linked to OU ${ou} with link order 1`];
        } else {
            steps = ['the computer\'s Local Group Policy', 'a GPO linked to the site HQ', 'a GPO linked to the domain corp.example.com',
                `a GPO linked to OU ${ou}`, `a GPO linked to child OU ${ou}/${child}`];
        }
        const letters = 'ABCDE'.split('');
        const order = shuffle(rng, [0, 1, 2, 3, 4]);  // order[k] = step index shown as letter k
        const listing = letters.map((l, k) => `  ${l}) ${steps[order[k]]}`).join('\n');
        const letterOf = i => letters[order.indexOf(i)];
        const processing = [0, 1, 2, 3, 4].map(letterOf).join('');
        const winsFirst = scenario === 2;
        const answer = winsFirst ? processing.split('').reverse().join('') : processing;
        const ask = winsFirst
            ? 'None are Enforced and nothing blocks inheritance. Order them by precedence, the one whose conflicting setting wins first. Answer with letters, like EDCBA.'
            : 'None are Enforced and nothing blocks inheritance. Order them as Windows processes them, first to last. Answer with letters, like EDCBA.';
        const perms = [];
        const permute = (rest, acc) => rest.length ? rest.forEach((c, i) => permute(rest.slice(0, i).concat(rest.slice(i + 1)), acc + c)) : perms.push(acc);
        permute(letters, '');
        const near = [winsFirst ? processing : processing.split('').reverse().join('')];
        return {
            q: `The Group Policy Hydra hisses five heads at you:\n${listing}\n${ask}`,
            answer, norm: 'sequence',
            distractors: near.concat(shuffle(rng, perms.filter(p => p !== answer && p !== near[0])).slice(0, 7)),
            hint: winsFirst
                ? 'Whatever is processed last overwrites the rest, so precedence runs backwards from processing.'
                : 'L, S, D, OU. Among GPOs on one OU, link order 1 has the highest precedence, so it goes last.'
        };
    }

    const GPTOOLS = [
        ['Which command re-applies every Group Policy setting right now, not just the changed ones?', 'gpupdate /force', ['gpupdate /sync', 'gpupdate /boot', 'gpresult /r', 'gpupdate /target:user', 'rsop.msc', 'secedit /refreshpolicy'], 'gpupdate on its own only applies changes. Add the switch that insists.'],
        ['Which command prints a summary of the GPOs that applied to this computer and user?', 'gpresult /r', ['gpupdate /r', 'Get-GPO -All', 'gpmc.msc', 'gpedit.msc', 'Get-GPInheritance', 'netsh gp show'], 'The Group Policy result tool, with the switch for RSoP summary data.', 'text', ['gpresult /r /scope computer', 'gpresult /r /scope user']],
        ['By default, how often (in minutes) do member computers refresh Group Policy in the background, before the random offset?', '90', ['30', '60', '120', '15', '5', '180'], 'An hour and a half, plus up to 30 minutes of random offset.', 'int'],
        ['By default, how often (in minutes) do domain controllers refresh Group Policy in the background?', '5', ['90', '15', '30', '1', '10', '60'], 'Much faster than member computers.', 'int'],
        ['Which GPO link option makes a parent\'s settings win over child OUs, even past Block Inheritance?', 'Enforced', ['Block Inheritance', 'Link Enabled', 'Loopback processing', 'Security filtering', 'WMI filtering', 'Link order 1'], 'In older tools this was called No Override.', 'text', ['No Override', 'Enforce']],
        ['Which setting applies user policy based on the computer\'s OU, for kiosks and RDS hosts?', 'Loopback processing', ['Block Inheritance', 'Enforced', 'Item-level targeting', 'WMI filtering', 'Security filtering', 'Slow link detection'], 'The user settings loop back to the computer\'s location. Modes: Merge or Replace.', 'text', ['loopback', 'user group policy loopback processing mode']],
        ['Which share, replicated to every DC, holds the Group Policy template files?', 'SYSVOL', ['NETLOGON', 'ADMIN$', 'C$', 'IPC$', 'NTDS', 'PolicyDefinitions'], 'NETLOGON is a folder inside it. The scripts and policies live in the system volume.'],
        ['Which console manages domain GPOs, their links and their backups?', 'gpmc.msc', ['gpedit.msc', 'rsop.msc', 'dsa.msc', 'secpol.msc', 'dssite.msc', 'domain.msc'], 'gpedit edits only the local policy. You want the Group Policy Management Console.', 'text', ['gpmc', 'Group Policy Management', 'Group Policy Management Console']]
    ];

    // ================= ACT 3: enterprise =================

    const REPL = [
        ['Which command prints one summary of replication health across every DC?', 'repadmin /replsummary', ['repadmin /showrepl', 'repadmin /syncall', 'repadmin /showconn', 'repadmin /queue', 'nltest /replsummary', 'dcdiag /replsummary'], 'repadmin, and a switch that summarizes replication.'],
        ['In a forest created on Windows Server 2003 SP1 or later, what is the default tombstone lifetime in days?', '180', ['60', '90', '365', '30', '120', '14'], 'It was 60 in the oldest forests. Newer ones get six months.', 'int'],
        ['Which component automatically builds the replication topology between DCs?', 'KCC', ['ISTG', 'DFSR', 'FRS', 'PDC Emulator', 'Infrastructure Master', 'Bridgehead Server'], 'It checks that the topology is consistent. Three letters.', 'text', ['Knowledge Consistency Checker']],
        ['What is the default replication interval, in minutes, on a new AD site link?', '180', ['15', '60', '90', '360', '30', '100'], 'Three hours. The default cost is a different number.', 'int'],
        ['What is the default cost of a new AD site link?', '100', ['180', '1', '10', '50', '1000', '15'], 'A round number. The interval is a different one.', 'int'],
        ['A DC offline past the tombstone lifetime comes back with objects deleted everywhere else. What are those objects called?', 'lingering objects', ['tombstones', 'phantom objects', 'conflict objects', 'orphaned objects', 'ghost objects', 'stale objects'], 'They linger.', 'text', ['lingering object']],
        ['Which repadmin switch removes lingering objects?', 'repadmin /removelingeringobjects', ['repadmin /syncall /AdeP', 'repadmin /replicate', 'repadmin /showobjmeta', 'repadmin /kcc', 'ntdsutil metadata cleanup', 'dcdiag /fix'], 'The switch says exactly what it does, in one long word.'],
        ['Which command runs the standard battery of domain controller health tests?', 'dcdiag', ['repadmin', 'nltest', 'netdom', 'ntdsutil', 'dsquery', 'ldp'], 'DC diagnostics.'],
        ['Which repadmin command pushes every partition from this DC to all partners, across sites, by distinguished name?', 'repadmin /syncall /AdeP', ['repadmin /syncall', 'repadmin /replsummary', 'repadmin /replicate', 'repadmin /kcc', 'repadmin /queue', 'dcdiag /syncall'], 'syncall plus four flags: All partitions, by DN, Enterprise-wide, Push.', 'text', ['repadmin /syncall /APed', 'repadmin /syncall /AePd', 'repadmin /syncall /AdPe', 'repadmin /syncall /ADEP']]
    ];

    const SECURITY = [
        ['Which built-in feature randomizes and rotates each machine\'s local Administrator password and stores it in AD or Entra ID?', 'Windows LAPS', ['gMSA', 'Credential Guard', 'BitLocker', 'Protected Users', 'Restricted Admin mode', 'Privileged Access Management'], 'The Local Administrator Password Solution, now built into Windows.', 'text', ['LAPS', 'Local Administrator Password Solution']],
        ['Which Windows LAPS cmdlet reads a computer\'s managed password from Active Directory?', 'Get-LapsADPassword', ['Get-AdmPwdPassword', 'Get-LapsAADPassword', 'Reset-LapsPassword', 'Get-LapsPassword', 'Get-ADLapsPassword', 'Get-ADComputer -Properties ms-Mcs-AdmPwd'], 'Get-AdmPwdPassword is legacy LAPS. The Entra one has AAD in the noun.'],
        ['In the AD tiered admin model, which tier holds domain controllers and other identity systems?', 'Tier 0', ['Tier 1', 'Tier 2', 'Tier 3', 'data plane', 'workload tier', 'user access tier'], 'Whoever controls AD controls everything, so it gets the lowest number.', 'text', ['0', 'tier0', 'control plane']],
        ['How many digits is a BitLocker recovery password?', '48', ['32', '64', '24', '40', '56', '36'], 'Eight groups of six digits.', 'int'],
        ['Which command shows a volume\'s BitLocker key protectors, including the numerical recovery password?', 'manage-bde -protectors -get C:', ['manage-bde -status C:', 'manage-bde -unlock C:', 'manage-bde -protectors -add C:', 'repair-bde', 'bdehdcfg', 'Backup-BitLockerKeyProtector'], 'manage-bde, the protectors subcommand, and the verb that reads.', 'text', ['manage-bde -protectors -get c']],
        ['Which built-in group blocks its members from NTLM, DES and RC4 in Kerberos, and credential delegation?', 'Protected Users', ['Domain Admins', 'Account Operators', 'Enterprise Key Admins', 'Denied RODC Password Replication Group', 'Schema Admins', 'Remote Management Users'], 'The name says what it does for its members.'],
        ['After a krbtgt compromise, how many times do you reset its password, letting replication finish in between?', '2', ['1', '3', '4', '5', '10', '0'], 'The account remembers its previous password as well as its current one.', 'int'],
        ['Which feature uses virtualization-based security to isolate NTLM hashes and Kerberos TGTs from LSASS?', 'Credential Guard', ['LSA Protection', 'Device Guard', 'BitLocker', 'AppLocker', 'SmartScreen', 'Windows Defender Firewall'], 'LSA Protection runs LSASS as a protected process, without VBS. This one guards credentials.']
    ];

    const ADOPS = [
        ['Which boot mode takes AD DS offline on a DC so you can restore or repair the database?', 'Directory Services Restore Mode', ['Safe Mode with Networking', 'WinRE', 'Last Known Good Configuration', 'Debugging Mode', 'Safe Mode with Command Prompt', 'Recovery Console'], 'Its password is set at promotion and forgotten by lunch.', 'text', ['DSRM']],
        ['Which tool marks restored AD objects as authoritative?', 'ntdsutil', ['repadmin', 'wbadmin', 'dcdiag', 'ldp', 'adsiedit.msc', 'dsamain'], 'wbadmin restores the backup, but another tool does the marking.'],
        ['By default, how much does an ntdsutil authoritative restore raise each restored attribute\'s version number per day since the backup?', '100000', ['1000', '10000', '1', '180', '1000000', '100'], 'A big round number, enough to beat any change made since.', 'int'],
        ['Restoring a DC\'s system state with no extra steps, so it then takes newer changes from partners, is what kind of restore?', 'non-authoritative', ['authoritative', 'primary', 'bare-metal', 'tombstone reanimation', 'forced', 'D4'], 'It does not claim to be the source of truth.', 'text', ['nonauthoritative', 'non authoritative']],
        ['Which ntdsutil command sets the DSRM Administrator password?', 'set dsrm password', ['reset dsrm password', 'metadata cleanup', 'activate instance ntds', 'dsrm reset', 'net user administrator *', 'authoritative restore'], 'You set it, then pick a server with "reset password on server".', 'text', ['set dsrm password reset password on server null']],
        ['Which feature, once enabled and never disabled, restores deleted objects with all attributes without booting into DSRM?', 'AD Recycle Bin', ['tombstone reanimation', 'authoritative restore', 'Volume Shadow Copy', 'AD snapshots', 'DFS Replication', 'the Deleted Objects container'], 'It is named after a desktop icon.', 'text', ['Recycle Bin', 'Active Directory Recycle Bin']],
        ['Which Windows Server release added the newest domain and forest functional level, the first new one since 2016?', 'Windows Server 2025', ['Windows Server 2019', 'Windows Server 2022', 'Windows Server 2016', 'Windows Server 2012 R2', 'Windows Server 2023', 'Windows Server 2024'], '2019 and 2022 did not add one.', 'text', ['2025', 'Server 2025']],
        ['Which cmdlet raises the forest functional level?', 'Set-ADForestMode', ['Set-ADDomainMode', 'Set-ADForest', 'Raise-ADForestLevel', 'Update-ADForest', 'Set-ADForestFunctionalLevel', 'Enable-ADOptionalFeature'], 'The forest level is the forest\'s "mode".']
    ];

    const HYPERV = [
        ['Which Hyper-V VM generation supports UEFI firmware and Secure Boot?', 'Generation 2', ['Generation 1', 'Generation 3', 'Generation 0', 'Generation 1 with BIOS', 'Legacy', 'Generation 4'], 'Generation 1 emulates a legacy BIOS.', 'text', ['2', 'gen 2', 'gen2', 'generation2']],
        ['What is the maximum size of a VHDX virtual disk, in TB?', '64', ['2', '16', '32', '128', '256', '4'], 'The old VHD format stopped at about 2 TB. VHDX is 32 times larger.', 'int'],
        ['What is the default checkpoint type for new VMs on Windows Server 2016 and later?', 'Production', ['Standard', 'Differencing', 'Saved-state', 'Crash-consistent', 'Replica', 'Incremental'], 'It uses VSS inside the guest, so it is fit for use in production.', 'text', ['production checkpoint', 'production checkpoints']],
        ['Which cmdlet lists the virtual machines on a Hyper-V host?', 'Get-VM', ['Get-VMHost', 'Get-VirtualMachine', 'Show-VM', 'Get-HyperVVM', 'Get-VMList', 'Get-VMSwitch'], 'The shortest possible Hyper-V noun.'],
        ['Which Hyper-V switch type lets VMs talk to each other and to the host, but not to the physical network?', 'Internal', ['External', 'Private', 'Bridged', 'Host-only', 'Trunk', 'Isolated'], 'Private leaves out the host. External adds the physical NIC.', 'text', ['Internal switch']],
        ['Which Hyper-V feature asynchronously copies a running VM to another host for disaster recovery?', 'Hyper-V Replica', ['Live Migration', 'Storage Migration', 'Quick Migration', 'Checkpoints', 'Storage Replica', 'Failover Clustering'], 'Storage Replica copies volumes. This one copies VMs.', 'text', ['Replica']],
        ['Which cmdlet sets -ExposeVirtualizationExtensions $true to enable nested virtualization on a VM?', 'Set-VMProcessor', ['Set-VM', 'Set-VMHost', 'Set-VMFirmware', 'Set-VMMemory', 'Enable-NestedVirtualization', 'Enable-WindowsOptionalFeature'], 'Virtualization extensions belong to the CPU.']
    ];

    const WSUS = [
        ['What TCP port does WSUS on Windows Server 2012 and later use for HTTP by default?', '8530', ['8531', '80', '443', '8080', '3389', '5985'], 'HTTPS is one higher. Both start with 853.', 'int'],
        ['What TCP port does WSUS use for HTTPS by default?', '8531', ['8530', '443', '8443', '636', '5986', '3269'], 'One higher than the HTTP port.', 'int'],
        ['Patch Tuesday falls on which Tuesday of the month?', 'second', ['first', 'third', 'fourth', 'last', 'every', '1st'], 'Not the first one. Close, though.', 'text', ['2nd', '2', 'the second']],
        ['Which Group Policy setting points Windows Update clients at your WSUS server?', 'Specify intranet Microsoft update service location', ['Configure Automatic Updates', 'Enable client-side targeting', 'Do not connect to any Windows Update Internet locations', 'Set WSUS server address', 'Specify Windows Update server', 'Turn on recommended updates via Automatic Updates'], 'It is about the intranet location of the update service.'],
        ['Which WSUS option lets a GPO place clients into WSUS computer groups on their own?', 'client-side targeting', ['server-side targeting', 'auto-approval rules', 'WMI filtering', 'security filtering', 'item-level targeting', 'deployment rings'], 'The client decides, so it is targeting from the client side.', 'text', ['client side targeting']],
        ['On Windows 10 and 11, which cmdlet merges the Windows Update ETL traces into a readable WindowsUpdate.log?', 'Get-WindowsUpdateLog', ['Get-WULog', 'Get-WindowsUpdate', 'Export-WindowsUpdateLog', 'Get-HotFix', 'wuauclt /log', 'Get-WinEvent -LogName WindowsUpdate'], 'Get, and then the name of the log file it produces.'],
        ['Which cmdlet lists the hotfixes (QFEs) installed on a machine?', 'Get-HotFix', ['Get-InstalledUpdate', 'Get-Update', 'Get-Patch', 'Get-QFE', 'Get-WUHotfix', 'Show-HotFix'], 'A hot fix, fetched.'],
        ['Which cmdlet runs the WSUS Server Cleanup Wizard tasks from PowerShell?', 'Invoke-WsusServerCleanup', ['Start-WsusCleanup', 'Invoke-WsusCleanup', 'Clear-WsusContent', 'Remove-WsusUpdate', 'Approve-WsusUpdate', 'Start-WsusServerSynchronization'], 'Verb Invoke. The noun names the server and what you are doing to it.']
    ];

    const RUNBOOKS = [
        {
            title: 'Restore an OU someone deleted, on a forest without the Recycle Bin',
            steps: ['Boot one DC into Directory Services Restore Mode', 'Restore a system state backup from before the deletion',
                'Run ntdsutil and mark the OU authoritative', 'Restart normally and let the OU replicate out',
                'Import the LDIF file ntdsutil wrote, to restore group memberships'],
            hint: 'Get into the special mode, restore, mark, rejoin the world, then fix up the back-links.'
        },
        {
            // Microsoft Learn, "AD Forest Recovery - Reset the krbtgt password": reset twice,
            // waiting at least the max ticket lifetime (10 h default) between resets
            title: 'Rotate the krbtgt password after a suspected Golden Ticket',
            steps: ['Reset the krbtgt password the first time', 'Wait at least the maximum ticket lifetime (10 hours by default)',
                'Reset the krbtgt password the second time', 'Reboot machines still failing Kerberos so they request new tickets'],
            hint: 'krbtgt remembers two passwords, so one reset is not enough. Give old tickets time to expire in between.'
        },
        {
            title: 'Roll out this month\'s patches with WSUS',
            steps: ['Synchronize WSUS with Microsoft Update', 'Approve the updates for the pilot group', 'Confirm pilot machines installed them and still work',
                'Approve the updates for the production group', 'Review the compliance report for stragglers'],
            hint: 'You cannot approve what you have not synced. Pilot before production. Report last.'
        },
        {
            title: 'Raise the functional levels after retiring the old DCs',
            steps: ['Upgrade or retire every DC running an older Windows Server version', 'Raise the domain functional level of every domain',
                'Raise the forest functional level'],
            hint: 'A level can only rise once nothing older is left, and the forest level needs every domain at that level first.'
        },
        {
            title: 'Recover a GPO someone deleted, from a GPMC backup',
            steps: ['Open Manage Backups in GPMC', 'Restore the GPO from its backup', 'Re-link the GPO to its OUs',
                'Run gpupdate /force on a test client', 'Confirm the GPO applied with gpresult /r'],
            hint: 'A restore brings back the GPO but not its links.'
        },
        {
            title: 'Unlock a BitLocker-locked laptop for a user on the phone',
            steps: ['Have the user read the recovery key ID shown on screen', 'Find the matching recovery password in AD or Entra ID',
                'Read the 48-digit recovery password to the user', 'Once it boots, find out why recovery triggered and rotate the disclosed password'],
            hint: 'You need the ID before you can look up the key. The aftermath comes last.'
        }
    ];

    function genRunbook(rng) {
        const rb = pick(rng, RUNBOOKS);
        const n = rb.steps.length;
        const letters = 'ABCDE'.slice(0, n).split('');
        const order = shuffle(rng, rb.steps.map((_, i) => i));
        const listing = letters.map((l, k) => `  ${l}) ${rb.steps[order[k]]}`).join('\n');
        const answer = rb.steps.map((_, i) => letters[order.indexOf(i)]).join('');
        const perms = [];
        const permute = (rest, acc) => rest.length ? rest.forEach((c, i) => permute(rest.slice(0, i).concat(rest.slice(i + 1)), acc + c)) : perms.push(acc);
        permute(letters, '');
        return {
            q: `Runbook: ${rb.title}. Put the steps in order. Answer with the letters, like ${letters.slice().reverse().join('')}.\n${listing}`,
            answer, norm: 'sequence',
            distractors: shuffle(rng, perms.filter(p => p !== answer)).slice(0, 8),
            hint: rb.hint
        };
    }

    Q.registerTopics({
        'windows-tools': { label: 'Windows tools', gen: fromPool(TOOLS, 'text') },
        'windows-ports': { label: 'Windows and AD ports', gen: fromPool(WIN_PORTS, 'int') },
        'windows-recovery': { label: 'Windows recovery', gen: fromPool(RECOVERY, 'text') },
        'windows-ntfs': { label: 'NTFS and share permissions', gen: genNtfs },
        'windows-dhcp': { label: 'Windows DHCP scopes', gen: genDhcp, tool: 'nettools/subnet-calculator.html' },
        'windows-bsod': { label: 'Stop codes', gen: genBsod },
        'windows-fsmo': { label: 'FSMO roles', gen: fromPool(FSMO, 'text') },
        'windows-dcauth': { label: 'Kerberos and DC location', gen: fromPool(DCAUTH, 'text') },
        'windows-pscmd': { label: 'PowerShell cmdlets', gen: fromPool(PSCMD, 'text') },
        'windows-events': { label: 'Event IDs', gen: genEvents },
        'windows-ps': { label: 'PowerShell pipelines', gen: genPs },
        'windows-gpo': { label: 'GPO processing order', gen: genGpo },
        'windows-gptools': { label: 'Group Policy tools', gen: fromPool(GPTOOLS, 'text') },
        'windows-repl': { label: 'AD replication', gen: fromPool(REPL, 'text') },
        'windows-security': { label: 'Windows security', gen: fromPool(SECURITY, 'text') },
        'windows-adops': { label: 'AD backup and restore', gen: fromPool(ADOPS, 'text') },
        'windows-hyperv': { label: 'Hyper-V', gen: fromPool(HYPERV, 'text') },
        'windows-wsus': { label: 'Windows Update and WSUS', gen: fromPool(WSUS, 'text') },
        'windows-runbook': { label: 'AD recovery runbooks', gen: genRunbook }
    });

    // ================= world =================

    const ITEMS = {
        'energy-drink': {
            name: 'Lukewarm Energy Drink', names: ['energy drink', 'drink', 'potion', 'can', 'lukewarm energy drink'], kind: 'potion',
            desc: 'A dented can of something neon, opened at some point this week. Drink it to restore a life, or trade it for a hint.'
        },
        'snapshot-vial': {
            name: 'Vial of Last Known Good', names: ['vial', 'potion', 'last known good', 'vial of last known good'], kind: 'potion',
            desc: 'A vial labelled "LastKnownGood - do not drink unless desperate". Drink it to undo one mistake, or trade it for a hint.'
        },
        'patch-tea': {
            name: 'Patch Tuesday Tea', names: ['tea', 'potion', 'mug', 'patch tuesday tea'], kind: 'potion',
            desc: 'Strong black tea, brewed every second Tuesday and never on any other day. Drink it to restore a life, or trade it for a hint.'
        },
        'recovery-usb': {
            name: 'Recovery USB Drive', names: ['usb', 'usb drive', 'drive', 'recovery usb', 'recovery drive', 'recovery usb drive'], kind: 'key',
            desc: 'A USB stick labelled "WinRE + drivers - DO NOT FORMAT" in three different handwritings. It boots anything with a pulse.'
        },
        'rsop-mirror': {
            name: 'Mirror of Resultant Set', names: ['mirror', 'rsop mirror', 'mirror of resultant set', 'rsop'], kind: 'key',
            desc: 'A hand mirror that shows not the policy you configured, but the policy that actually applied. Hydras hate it.'
        },
        'dsrm-envelope': {
            name: 'Sealed DSRM Envelope', names: ['envelope', 'dsrm envelope', 'sealed envelope', 'dsrm', 'sealed dsrm envelope'], kind: 'key',
            desc: 'A tamper-evident envelope holding the DSRM password, written down at promotion by someone who knew this day would come.'
        },
        'ticket-stub': {
            name: 'ticket stub', names: ['ticket', 'stub', 'ticket stub'], kind: 'curio',
            desc: 'INC0042117: "Computer slow." No further detail. Closed as "Rebooted, works now." Reopened eleven times.',
            use: 'You close it as "Rebooted, works now." Somewhere, a twelfth reopen begins to stir.'
        },
        'floppy': {
            name: 'floppy disk', names: ['floppy', 'floppy disk', 'disk', 'save icon'], kind: 'curio',
            desc: 'A 3.5-inch floppy labelled "NT4 SP6a". It is also the save icon, which is the only job it still has.',
            use: 'There is nothing in this building that can read it. You put it back.'
        },
        'smart-card': {
            name: 'expired smart card', names: ['smart card', 'card', 'badge', 'expired smart card'], kind: 'curio',
            desc: 'A smart card whose certificate expired in 2019. It still opens the break room, for reasons nobody has investigated.',
            use: 'You tap it on the nearest reader. Somewhere, very far away, the break room door clicks open.'
        },
        'win-cd': {
            name: 'Server 2003 R2 disc 2', names: ['cd', 'disc', 'disc 2', 'install cd', 'jewel case', 'server 2003 r2 disc 2'], kind: 'curio',
            desc: 'Windows Server 2003 R2, disc 2 of 2. Disc 2 only adds the R2 extras, so on its own it installs nothing at all. Disc 1 has not been seen since 2006.',
            use: 'You hold it up to the light. A rainbow, a scratch, and your reflection, younger, still believing in documentation.'
        },
        'dr-plan': {
            name: 'printed DR plan', names: ['plan', 'dr plan', 'disaster recovery plan', 'printout', 'printed dr plan'], kind: 'curio',
            desc: 'Disaster Recovery Plan v1.0, 2011, 86 pages. Step 1: "Call Dave." Steps 2 to 86 assume Dave picks up.',
            use: 'You call Dave. Voicemail. The greeting, recorded in 2018, says he is out until Monday. It does not say which Monday.'
        },
        'clippy': {
            name: 'paperclip figurine', names: ['paperclip', 'clip', 'figurine', 'paperclip figurine'], kind: 'curio',
            desc: 'A little paperclip with googly eyes, a relic of the Office 97 era. It is watching you. It has opinions about your letter.',
            use: '"It looks like you\'re trying to fix Active Directory. Would you like help?" You click "Don\'t show me this tip again." It shows you the tip again.'
        }
    };

    const MYSTERY = {
        title: 'Incident notes, things that don\'t add up:',
        clues: {
            'dc02-lease': '4:41 AM: the DHCP ledger leased an address to DC02. DC02 has been powered off since March.',
            'cleared-log': '5:03 AM: DC01\'s Security log was cleared. The account that did it: DC02$.',
            'emergency-change': 'CHG-2299, requested 4:30 AM: "Power on DC02 for one final replication." Approver: nightowl. No implementer.',
            'last-sync': 'DC01\'s last inbound replication from DC02 finished at 5:51 AM. Your phone rang at 5:52.'
        },
        solved: 'A week later, Facilities finally audits the PDUs. DC02\'s outlet was switched off in March, and the logs say it never came back on. Not once. Not that night. You are still reading the report when the queue refreshes with one new ticket, from DC02$. It says only: "Thank you for letting me finish."'
    };

    const AMBIENT = [
        { act: 1, text: 'An empty desk chimes with a chat notification: "nightowl is typing..." Then nightowl isn\'t.' },
        { act: 1, text: 'Two rooms away, a laptop finishes booting and plays the startup sound to nobody.' },
        { act: 2, text: 'A rack door clicks shut behind you. The aisle is empty, and the handle is still swinging.' },
        { act: 2, text: 'Somewhere across the room, a KVM switches channels on its own. DC01. DC02. DC01.' },
        { act: 3, text: 'Deep in the forest, a tape drive spins up, reads for a few seconds, and stops.' },
        { act: 3, text: 'Between the trees, a front panel blinks amber, then blue. The asset tag says DC02. When you look again, there are only trees.' }
    ];

    const ACTS = [
        {
            n: 1, name: 'The Help Desk', start: 'ticket-queue', boss: 'bsod-crypt', key: 'recovery-usb',
            intro: 'ACT I: THE HELP DESK\nYour phone lights up at 5:52 AM: "Nobody can log on. DC01 is not responding." The help desk queue has 412 new tickets, all titled "urgent". To reach the domain controllers, you have to get through the help desk first.'
        },
        {
            n: 2, name: 'The Domain', start: 'server-console', boss: 'hydra-ou', key: 'rsop-mirror',
            intro: 'ACT II: THE DOMAIN\nPast the help desk lies the server room, where every machine is joined to the domain and every domain is joined to its grudges. Somewhere in here, a policy is applying that nobody remembers writing.'
        },
        {
            n: 3, name: 'The Forest', start: 'forest-root', boss: 'tombstone-vault', key: 'dsrm-envelope',
            intro: 'ACT III: THE FOREST\nAt the root of the forest the trees are named after domains, and one of them is rotting. DC01 is up, but it is replicating garbage it learned from something that should have stayed dead.'
        }
    ];

    const ROOMS = {
        // ======================= ACT I =======================
        'ticket-queue': {
            act: 1, name: 'The Ticket Queue',
            text: 'Tickets pile up around a desk with three monitors and a headset still warm from the last shift. A corridor north leads to the Event Viewer archives, a hallway runs east to the file shares, and a supply closet sits to the west. A heavy door to the south hums an unhealthy blue.',
            exits: { north: 'event-archive', east: 'share-hall', west: 'supply-closet', south: 'bsod-crypt' },
            features: [
                {
                    names: ['tickets', 'queue', 'ticket'], text: 'Ticket 1: "Can\'t log on." Ticket 2: "Can\'t log on." Ticket 3: "Printer jammed, also can\'t log on." Ticket 412: "Is the network down? Asking for everyone."',
                    again: 'Ticket 207, from the CEO\'s assistant: "Is this outage a phishing test? If so, I passed." Priority: Critical. Assigned to: you.',
                    uses: { 'ticket-stub': 'You add the stub to the pile. The queue is now 413. Somewhere, a dashboard turns slightly redder.' }
                },
                {
                    names: ['monitors', 'desk', 'headset'], text: 'One monitor shows the queue, one shows a knowledge base article last updated in 2014, and one shows a sticky note that says "have you tried turning it off".',
                    again: 'The sticky note has a second line, in smaller writing: "and on again. in that order. please."'
                },
                { names: ['door', 'south door', 'south', 'seals', 'seal', 'runes'], text: 'The door glows the exact blue of a stop screen. Five runes are carved into it, one per guardian of this floor.' }
            ],
            sense: { listen: 'Forty desk phones ringing in forty slightly different ringtones, and under them all, the hold music, looping.', smell: 'Cold coffee and hand sanitizer nobody has refilled since 2021.' }
        },
        'supply-closet': {
            act: 1, name: 'The Supply Closet',
            text: 'Shelves of spare mice, orphaned power bricks and a monitor with a sticky note that says "broken?". A mini-fridge hums in the corner. The only way out is back east.',
            exits: { east: 'ticket-queue' },
            items: ['ticket-stub'],
            features: [
                {
                    names: ['fridge', 'mini-fridge', 'mini fridge'], text: 'Behind a sad yogurt with someone\'s name on it, you find an opened energy drink. Close enough.', reveals: 'energy-drink',
                    again: 'The name on the yogurt has been crossed out and rewritten so many times that it is now just a small black rectangle of ownership.'
                },
                {
                    names: ['bricks', 'power bricks', 'shelves', 'mice'], text: 'Forty-one power bricks, no two with the same barrel connector. Every one of them fits something that was thrown away.',
                    again: 'You find a brick that looks exactly right for your laptop. It is 19.5 volts instead of 20. You put it back with the dignity it deserves.'
                },
                { names: ['monitor', 'note'], text: 'You plug it in. It works. It was the cable. It is always the cable.', again: 'You unplug it again, just to be sure. It still works. You feel cheated.' }
            ],
            sense: { listen: 'The fridge hums, stops, and hums again, like it is thinking about something.', smell: 'Cardboard, anti-static bags, and a faint note of whatever that yogurt used to be.' }
        },
        'event-archive': {
            act: 1, name: 'The Event Viewer Archives',
            text: 'Endless shelves of .evtx scrolls, most of them warnings nobody has read since the server was built. A lamp burns over a reading desk where one scroll lies open. The path north climbs toward a firewall. The ticket queue is back south.',
            exits: { south: 'ticket-queue', north: 'firewall-gate' },
            quiz: { topic: 'windows-tools', guardian: 'the Archivist of Snap-ins', intro: 'A robed archivist with an MMC console for a face looks up from the scrolls. "This is not a place for clicking around. Name your tool."', cleared: 'The archivist adds your name to a log nobody will read. "Proceed. Warning level only."' },
            features: [
                {
                    names: ['scrolls', 'shelves', 'warnings', 'evtx'], text: 'You unroll one at random. The same warning, logged every hour since 2016. Nothing has ever broken because of it, which is exactly what everyone said about the last one that did.',
                    again: 'Another scroll is nothing but Information events, 300,000 of them, each one announcing that something started successfully. You feel very informed.'
                },
                {
                    names: ['reading desk', 'desk', 'open scroll', 'lamp'], text: 'The open scroll is tonight\'s System log. Somebody has been reading it by lamplight, and the lamp is still warm.',
                    again: 'A bookmark marks one spot: 4:41 AM. The entry under it has been smudged by a thumb.'
                }
            ],
            sense: { listen: 'Pages rustling, though there is no draft to move them.', smell: 'Old paper and warm lamp oil.' }
        },
        'firewall-gate': {
            act: 1, name: 'The Defender Firewall Gate',
            text: 'A stone gate studded with rules, half of them called "Allow All (temporary)". Someone has chalked a note on the gatepost. A recovery chapel lies east. The archives are back south.',
            exits: { south: 'event-archive', east: 'winre-chapel' },
            quiz: { topic: 'windows-ports', guardian: 'the Firewall Gargoyle', intro: 'A gargoyle wakes on the lintel, inbound rules scrolling across its wings. "Inbound traffic blocked by default. State your port."', cleared: 'The gargoyle creates a rule for you, scoped properly for once. "Allowed. Domain profile only."' },
            features: [
                {
                    names: ['rules', 'stone', 'gate'], text: '"Allow All (temporary)", created 2015. "Allow All (temporary) (2)", created 2015. "Block Bob", created the day after Bob\'s laptop discovered BitTorrent.',
                    again: 'At the very bottom, disabled, is a rule named "do not enable". Its description just says "you know why". You don\'t, and that is worse.'
                },
                {
                    names: ['gatepost', 'note', 'chalk'], text: '"FIREWALL OFF FOR TESTING - BACK ON BY FRIDAY." The chalk is old enough to have fossilized.',
                    extra: {
                        knight: 'You rap on the gatepost with a gauntlet. Somewhere a log records it as a dropped packet.',
                        rogue: 'Out of habit you look for a way around. There is one: a rule called "temp - vendor access". You decide you never saw it.'
                    }
                }
            ],
            sense: { listen: 'The gargoyle\'s wings click softly with every packet it drops. It drops a lot of packets.' }
        },
        'winre-chapel': {
            act: 1, name: 'The Chapel of Advanced Startup',
            text: 'Blue tiles, a single kneeler, and an altar with options: Continue, Troubleshoot, Turn off your PC. Something glints in a vestry to the east. The gate is back west.',
            exits: { west: 'firewall-gate', east: 'imaging-bench' },
            quiz: { topic: 'windows-recovery', guardian: 'the Recovery Priest', intro: 'A priest in a blue chasuble raises a hand. "Two failed boots brought you here, child. Prove you know the rites of recovery."', cleared: 'The priest blesses you with a restore point. "Go in peace, and keep your BCD backed up."' },
            features: [
                {
                    names: ['altar', 'options', 'tiles'], text: '"Continue" is worn smooth by desperate thumbs. "Turn off your PC" is pristine. Nobody has ever chosen it on purpose.',
                    again: 'Under the altar cloth there is a fourth option, scratched out but still legible: "Ask nightowl".'
                },
                { names: ['kneeler'], text: 'Two dents are worn into the kneeler, about the depth of an all-nighter.', again: 'The dents are still warm. You are the only one here.' }
            ],
            sense: { listen: 'An organ plays the startup chime very slowly, in a minor key.', smell: 'Incense and hot plastic.' }
        },
        'share-hall': {
            act: 1, name: 'The Hall of File Shares',
            text: 'A long hall of doors, each marked with a UNC path and an access-denied sign. A lost-and-found bin sits by the first door. A DHCP office lies further east. The ticket queue is back west.',
            exits: { west: 'ticket-queue', east: 'dhcp-office' },
            quiz: { topic: 'windows-ntfs', guardian: 'the Permissions Gatekeeper', intro: 'A gatekeeper with two keyrings, one for shares and one for NTFS, blocks the hall. "Everyone wants Full Control. Tell me what they actually get."', cleared: 'The gatekeeper grants you exactly the access you need and not a byte more. "Least privilege. Go on."' },
            features: [
                {
                    names: ['doors', 'paths', 'signs', 'unc'], text: '\\\\FS01\\Finance. \\\\FS01\\Finance-OLD. \\\\FS01\\Finance-OLD-DONOTUSE. The last one has the most recent files.',
                    again: 'One door, \\\\FS01\\Public, stands wide open. Someone has stored the entire 2019 holiday party slideshow in it. Twice.'
                },
                { names: ['bin', 'lost and found', 'lost-and-found'], text: 'Three phone chargers, a single glove, and a mapped drive letter nobody ever came back for: Q:.' }
            ],
            sense: { listen: 'Somewhere down the hall, a door keeps saying "Access is denied" in a polite, exhausted voice.' }
        },
        'dhcp-office': {
            act: 1, name: 'The Scope Office',
            text: 'A clerk hands out IP addresses from a ledger, crossing them off one at a time and thumping each with a rubber stamp. A stair north leads to the old workstation graveyard. The share hall is back west.',
            exits: { west: 'share-hall', north: 'workstation-graveyard' },
            quiz: { topic: 'windows-dhcp', guardian: 'the Scope Clerk', intro: 'The clerk looks up from a ledger full of exclusions. "The scope is nearly exhausted and half the floor is on 169.254. Can you count?"', cleared: 'The clerk hands you a lease for eight days. "That is the default. Bring it back renewed."' },
            features: [
                {
                    names: ['ledger', 'leases'], clue: 'dc02-lease',
                    text: 'You read over the clerk\'s shoulder. Most overnight leases went to laptops waking up for updates. One, at 4:41 AM, went to DC02. Domain controllers are supposed to have static addresses. DC02 isn\'t supposed to be switched on at all.',
                    again: 'The DC02 entry has been crossed out, and then written back in, in different ink.'
                },
                { names: ['stamp', 'rubber stamp'], text: 'The stamp says DENIED. The ink pad for APPROVED dried out years ago, and nobody has filed a ticket for a new one.' }
            ],
            sense: { listen: 'Thump. Scratch. Thump. Lease after lease, all night long.' }
        },
        'workstation-graveyard': {
            act: 1, name: 'The Workstation Graveyard',
            text: 'Beige towers stand in rows like headstones, each with a "Windows 7 - do not reimage" label. A floppy disk lies on one, and a CRT at the end of a row still flickers. North, a bench of imaging gear glows.',
            exits: { south: 'dhcp-office', north: 'imaging-bench' },
            items: ['floppy'],
            features: [
                {
                    names: ['towers', 'headstones', 'workstations', 'labels'], text: 'One reads: "ACCT-PC-07. Ran the payroll macro. Nobody knows how. Do not touch." It has been unplugged since 2020. Payroll still works. Nobody knows how.',
                    again: 'Another: "HR-PC-02. Kept alive for one internal app that only ran in IE6. Retired with honors. The app was not."',
                    uses: { 'floppy': 'ACCT-PC-07 has a floppy drive. Of course it does. You hover the disk over the slot and the tower\'s fan spins up, unplugged. You put the disk away and walk faster.' }
                },
                {
                    names: ['crt', 'glow'], text: 'Burned into the phosphor forever: a login screen with a single user tile named "Admin".',
                    again: 'Look closer. Underneath, burned in more faintly, a second tile: "Admin (2)". Someone needed a second admin. Nobody remembers who.'
                }
            ],
            sense: { listen: 'Wind through empty drive bays, and somewhere, one hard drive clicking.', smell: 'Dust bunnies and the warm-plastic ghost of beige.' }
        },
        'imaging-bench': {
            act: 1, name: 'The Imaging Bench',
            text: 'A bench strewn with USB sticks, SATA adapters and a laptop mid-reimage. One drive is labelled clearly, which is how you know it matters. Paths lead west to the chapel and south to the graveyard.',
            exits: { west: 'winre-chapel', south: 'workstation-graveyard' },
            items: ['recovery-usb'],
            features: [
                {
                    names: ['laptop', 'reimage', 'progress'], text: 'The progress bar reads 99% and has read 99% since you walked in. It will read 99% after you leave.',
                    again: 'Still 99%. Everyone who has ever touched a reimage at 99% has regretted it. You keep your hands in your pockets.'
                },
                {
                    names: ['sticks', 'usb sticks', 'adapters', 'bench'], text: 'Most of the sticks are labelled "misc". One is labelled "DO NOT USE". Nobody knows why, and nobody is brave enough to find out.',
                    again: 'The "DO NOT USE" stick has an older label peeling off underneath. It says "USE THIS ONE". You leave both alone.',
                    extra: { rogue: 'Reflex makes you palm one of the "misc" sticks. Then you think about where it has been, and put it back.' }
                }
            ],
            sense: { listen: 'The quiet whir of a laptop thinking very hard about the last 1%.' }
        },
        'bsod-crypt': {
            act: 1, name: 'The Crypt of the Blue Screen', boss: true,
            text: 'Everything here is the same shade of blue. A sad face hovers in the air above a QR code, and a percentage counter never quite reaches 100. Beyond it, a stair leads up to the server room.',
            exits: { north: 'ticket-queue' },
            features: [
                {
                    names: ['face', 'sad face'], text: 'The sad face is a colon and a parenthesis, eleven feet tall. It manages to look disappointed in you personally.',
                    again: 'It blinks. Colons should not be able to blink.'
                },
                { names: ['qr code', 'qr', 'code'], text: 'You scan it. Your phone opens a help page about stop codes, which is helpful in the way a smoke alarm is helpful.' },
                { names: ['counter', 'percentage'], text: '0% complete. 0% complete. Then, for one thrilling moment, 0% complete.' }
            ],
            sense: { listen: 'A fan running flat out on a machine that has stopped doing anything at all.' },
            bossFight: {
                name: 'the Blue Screen Wraith', topics: ['windows-bsod', 'windows-recovery'], key: 'recovery-usb',
                locked: 'The Wraith flickers, "Your device ran into a problem and needs to restart," and restarts. And restarts. You will never get past it without something that boots on its own.',
                intro: 'You slot the Recovery USB Drive into the nearest port. The Wraith freezes at 0% complete. ":( FINE," it says. "TELL ME WHAT I AM, AND HOW TO BE RID OF ME."',
                win: 'The Wraith collects its final dump and dissolves into a MEMORY.DMP nobody will ever open. The stair to the server room is clear.'
            }
        },

        // ======================= ACT II =======================
        'server-console': {
            act: 2, name: 'The Server Room Console',
            text: 'A KVM drawer slides out of a rack, its screen showing Server Manager with every tile red. A sticky note on the drawer lists the KVM channels. North is the operations hall, east a corridor of event logs, west a cold aisle. To the south, something with many heads is linking itself to OUs.',
            exits: { north: 'fsmo-hall', east: 'log-corridor', west: 'cold-aisle', south: 'hydra-ou' },
            features: [
                {
                    names: ['kvm', 'screen', 'server manager', 'tiles'], text: 'Server Manager reports 47 problems. It also offers to help you get started with Windows Admin Center, which is not the problem.',
                    again: 'You dismiss the offer. It comes back. Some things in Server Manager cannot be closed, only postponed.'
                },
                {
                    names: ['channels', 'sticky note', 'note'], text: 'Channel 1: DC01. Channel 2: DC02 (DEAD - DO NOT SELECT). Channel 3: "?". You check which channel is selected. Channel 2.',
                    again: 'You switched it back to channel 1. You are sure you did. It is on channel 2.'
                },
                { names: ['south', 'seals', 'seal', 'runes', 'heads'], text: 'Five runes glow over the southern arch, one per guardian of this realm. Behind it you can hear something hissing "link order one" over and over.' }
            ],
            sense: { listen: 'Fans, a UPS beeping politely every thirty seconds, and the hiss from the south.' }
        },
        'cold-aisle': {
            act: 2, name: 'The Cold Aisle',
            text: 'Perforated tiles blow freezing air at your ankles. Someone has left a jacket on a rack door and a toolbox on the floor, and the rack door hangs ajar. The console is back east.',
            exits: { east: 'server-console' },
            features: [
                {
                    names: ['toolbox', 'tool box', 'box'], text: 'Under a tangle of cage nuts you find a small vial labelled "LastKnownGood".', reveals: 'snapshot-vial',
                    again: 'Nothing else in there but cage nuts and a cage nut tool nobody has ever used, because everyone uses a screwdriver and bleeds.'
                },
                {
                    names: ['jacket'], text: 'The pocket holds a badge, a rack key and a receipt for 11 energy drinks. Whoever owns this has been here a while.',
                    again: 'The badge has no photo, only a name: nightowl. The receipt is timestamped 4:12 AM. Tonight.'
                },
                { names: ['tiles', 'floor'], text: 'One tile is missing. Through the gap you can see a cable labelled "DO NOT UNPLUG - DC01". It is unplugged.' },
                { names: ['rack door', 'rack', 'door'], text: 'Taped inside the rack door, "for emergencies": a jewel case so old the hinge has given up.', reveals: 'win-cd', again: 'The tape has left a rectangle of glue on the door. It will outlive the rack.' }
            ],
            sense: { listen: 'The tiles whistle. One of them whistles a slightly different note.', touch: 'Your ankles are now colder than the servers. Facilities says this is correct.' }
        },
        'fsmo-hall': {
            act: 2, name: 'The Hall of Operations Masters',
            text: 'Five thrones stand in a ring, each carved with a role. Two of them are much grander than the rest. A shrine to Kerberos lies north. The console is back south.',
            exits: { south: 'server-console', north: 'kerberos-shrine' },
            quiz: { topic: 'windows-fsmo', guardian: 'the Five Masters', intro: 'Five figures rise from the thrones at once. "Flexible, we are not. Single master, we are. Name us, or be seized."', cleared: 'The masters sit back down. "You may pass. Transfer us gently, when the time comes."' },
            features: [
                {
                    names: ['thrones', 'throne', 'ring'], text: 'The two grand thrones have velvet cushions. The other three are folding chairs on plinths, as if someone added them later and never got the budget.',
                    again: 'In the corner, under a dust sheet, sits an old chair with a tag: "DC02. Roles seized in March. Must never return to the network."',
                    extra: { knight: 'You bow out of habit. Two of the masters nod back. The other three are busy.' }
                }
            ],
            sense: { listen: 'A low argument between the thrones about who gets the final word.' }
        },
        'kerberos-shrine': {
            act: 2, name: 'The Shrine of the Three-Headed Dog',
            text: 'A shrine to Kerberos, guarded by a statue of a dog with three heads and a wall clock that is exactly five minutes fast. A cloister of PowerShell monks lies east. The hall is back south.',
            exits: { south: 'fsmo-hall', east: 'ps-cloister' },
            quiz: { topic: 'windows-dcauth', guardian: 'the Ticket-Granting Hound', intro: 'The statue\'s three heads turn toward you. "No ticket, no service. And your clock had better be right."', cleared: 'The hound stamps a TGT and drops it at your feet. "Valid for ten hours. Don\'t lose it."' },
            features: [
                {
                    names: ['statue', 'dog', 'collars'], text: 'Each head wears a collar: one for the client, one for the server, one for the KDC. The KDC head looks the most tired.',
                    again: 'A bowl at the statue\'s feet is labelled "tickets". It is full of expired ones, chewed.',
                    uses: { 'smart-card': 'The statue sniffs the card, reads the certificate\'s expiry date, and sneezes on it. Denied, but politely.' }
                }
            ],
            sense: { listen: 'A low growl, in three-part harmony.' }
        },
        'ps-cloister': {
            act: 2, name: 'The Cloister of Verb-Noun',
            text: 'Monks in hooded robes chant in strict Verb-Noun pairs. A scriptorium door to the east is half-open. The shrine is back west.',
            exits: { west: 'kerberos-shrine', east: 'gpo-scriptorium' },
            quiz: { topic: 'windows-pscmd', guardian: 'the Abbot of Approved Verbs', intro: 'An abbot steps forward with a scroll titled Get-Verb. "We do not Fetch here. We do not Grab. Speak the right cmdlet."', cleared: 'The abbot nods. "Approved." He makes a note in his transcript and lets you pass.' },
            features: [
                {
                    names: ['monks', 'robes', 'chant'], text: 'You listen in. "Start-Day. Stop-Meeting. Wait-Coffee." A young monk whispers "Yeet-Process" and is quietly led away.',
                    again: 'The young monk is back, chastened, copying out help files by hand. He has reached about_Quoting_Rules and is weeping softly.'
                },
                { names: ['door', 'scriptorium door'], text: 'The door is half-open, held by a wedge of folded printouts. Every one is an error message in red text that nobody read past the first line.' }
            ],
            sense: { listen: 'Chanting, strictly Verb-Noun, punctuated by the occasional pipe.' }
        },
        'log-corridor': {
            act: 2, name: 'The Security Log Corridor',
            text: 'The walls are covered in event IDs, most of them 4625. A chamber of pipelines opens to the east. The console is back west.',
            exits: { west: 'server-console', east: 'pipeline-works' },
            quiz: { topic: 'windows-events', guardian: 'the Auditor', intro: 'A grey-suited auditor blocks the corridor with a clipboard. "Somebody cleared a log last night. Before you go further, prove you can read one."', cleared: 'The auditor marks you "compliant, pending evidence" and steps aside.' },
            features: [
                {
                    names: ['walls', 'wall', 'events', 'ids'], clue: 'cleared-log',
                    text: 'Most of the wall is failed logons from one printer that still has an old password saved. Near the end, DC01\'s Security log simply stops. A note in the margin: cleared at 5:03 AM, by DC02$, the computer account of a server that is switched off.',
                    again: 'You look at the gap again. It is very neat. Whoever did this was in no hurry at all.'
                }
            ],
            sense: { smell: 'Hot toner, and the ozone of a log server that is out of disk.' }
        },
        'pipeline-works': {
            act: 2, name: 'The Pipeline Works',
            text: 'Brass pipes carry objects from one cmdlet to the next, hissing at every Where-Object valve. An annex of GUID-named folders lies north. The corridor is back west.',
            exits: { west: 'log-corridor', north: 'sysvol-annex' },
            quiz: { topic: 'windows-ps', guardian: 'the Pipeline Engineer', intro: 'An engineer in overalls taps a gauge. "Objects in, objects out. Tell me how many come out the other end."', cleared: 'The engineer opens the valve. "Measured. Off you go."' },
            features: [
                {
                    names: ['pipes', 'pipe', 'valves', 'gauge'], text: 'One pipe is labelled "| Out-Null". Whatever goes in is never seen again. You hold on to your pockets.',
                    again: 'You press an ear to the Out-Null pipe. Something inside is still trying to report an error.'
                }
            ],
            sense: { listen: 'Hiss, clunk, hiss. Objects being filtered, one at a time.', touch: 'The pipes are warm. Someone left a ForEach-Object running in here.' }
        },
        'sysvol-annex': {
            act: 2, name: 'The SYSVOL Annex',
            text: 'Folders named with GUIDs fill every shelf, and a long-retired FRS replication engine rusts in the corner. A smart card lies on a filing cabinet. Doors lead north to a scriptorium and south to the pipeline works.',
            exits: { south: 'pipeline-works', north: 'gpo-scriptorium' },
            items: ['smart-card'],
            features: [
                {
                    names: ['folders', 'guids', 'shelves'], text: 'You open {31B2F340-016D-11D2-945F-00C04FB984F9}. It is the Default Domain Policy, and someone has put a mapped drive in it.',
                    again: 'The next folder is {6AC1786C-016F-11D2-945F-00C04FB984F9}, the Default Domain Controllers Policy. Its modified date is tonight.',
                    extra: { wizard: 'You try reading a GUID aloud as an incantation. Nothing happens, which is the most reassuring thing that has happened tonight.' }
                },
                {
                    names: ['frs', 'engine', 'corner'], text: 'A plaque reads: "FRS. Replaced by DFSR. Still haunting migrations that were never finished."',
                    again: 'The engine shudders, as if it heard the word "migration". Then it is still again.'
                },
                { names: ['filing cabinet', 'cabinet'], text: 'The top drawer is labelled "Policies (paper)". It holds one sheet: "Users must not write passwords down." Taped to the back of it is a password.' }
            ],
            sense: { smell: 'Rust, and the faint machine-oil smell of a replication engine nobody dared to scrap.' }
        },
        'gpo-scriptorium': {
            act: 2, name: 'The Policy Scriptorium',
            text: 'Scribes copy policies onto scrolls and link them to OUs with red string. On a lectern lies a hand mirror that shows the policies that actually applied. Doors lead west to the cloister and south to the annex.',
            exits: { west: 'ps-cloister', south: 'sysvol-annex' },
            items: ['rsop-mirror'],
            features: [
                {
                    names: ['scribes', 'scrolls', 'string'], text: 'One scribe is writing "Disable Windows Firewall (temporary, 2017)". You decide to come back for him later.',
                    again: 'He has moved on to "Map drive Z: for everyone (temporary)". He hums while he works. He is very happy.'
                },
                { names: ['lectern'], text: 'Carved into the lectern: "Configured is not applied." Underneath, in smaller letters, someone has added "ask me how I know".' }
            ],
            sense: { listen: 'Quills scratching, and someone muttering "why is this filtered to Authenticated Users".' }
        },
        'hydra-ou': {
            act: 2, name: 'The Lair of the Group Policy Hydra', boss: true,
            text: 'A pit of tangled OUs, each with a GPO linked to it and three more inherited from above. The Group Policy Hydra coils in the middle, one head per link. A root-bound stair leads down into the forest.',
            exits: { north: 'server-console' },
            features: [
                {
                    names: ['pit', 'ous', 'ou'], text: 'You count the OUs. There is one called "New Organizational Unit". Inside it, "New Organizational Unit (2)". Inside that, for some reason, the CEO.',
                    again: 'At the bottom of the pit, an OU called "Disabled - Keep" holds 2,000 accounts. Exactly one of them is enabled. It is DC02$.'
                }
            ],
            sense: { smell: 'Wet scales and stale Registry.pol.' },
            bossFight: {
                name: 'the Group Policy Hydra', topics: ['windows-gpo', 'windows-gptools'], key: 'rsop-mirror',
                locked: 'Every time you look at a head, another policy applies on top of it. Without seeing what actually took effect, you can\'t tell which head is real.',
                intro: 'You raise the Mirror of Resultant Set. The Hydra sees what it actually applied and recoils. "WE ARE NOT WHAT WE WERE CONFIGURED TO BE," the heads wail. "ANSWER US."',
                win: 'The Hydra\'s heads unlink one by one until a single clean policy remains. Background refresh in 90 minutes, give or take 30. The stair to the forest is open.'
            }
        },

        // ======================= ACT III =======================
        'forest-root': {
            act: 3, name: 'The Forest Root',
            text: 'Ancient trees named after domains rise around a clearing, their roots tangled in replication links. North is a hall of replication, east a server farm, west a quiet records room. South, a vault door is covered in frost.',
            exits: { north: 'repl-hall', east: 'hyperv-farm', west: 'records-room', south: 'tombstone-vault' },
            features: [
                {
                    names: ['trees', 'roots', 'links'], text: 'The oldest tree is labelled corp.local. Everyone who planted it is sorry, and nobody will ever rename it.',
                    again: 'Carved into the bark of corp.local, very small: "nightowl was here". The cut is still pale. It was made tonight.'
                },
                {
                    names: ['vault', 'door', 'south', 'frost', 'seals', 'seal', 'runes'], text: 'The vault door has five frozen runes, one per guardian of this realm. A label reads: "DC02. Offline since last March. DO NOT POWER ON."',
                    again: 'Through the frost on the door you can see a status light on the other side, blinking slowly. Powered-off servers don\'t blink.'
                }
            ],
            sense: { listen: 'Wind in the branches, and far away, LDAP queries rustling like leaves.', smell: 'Pine needles and cold ozone.' }
        },
        'records-room': {
            act: 3, name: 'The Records Room',
            text: 'Change records line the walls in binders, most of them signed off after the change was made. A whiteboard by the door lists tonight\'s emergency changes. A kettle sits on a cabinet. The forest root is back east.',
            exits: { east: 'forest-root' },
            features: [
                {
                    names: ['kettle', 'cabinet'], text: 'The kettle is still warm, and next to it sits a mug of strong tea with a note: "Patch Tuesday only."', reveals: 'patch-tea',
                    again: 'The kettle is still warm. The sign-in sheet says nobody has been in here since Friday.'
                },
                {
                    names: ['binders', 'records', 'changes'], text: 'CHG-2231: "Raise forest functional level." Rollback plan: "None possible." Approved anyway. Wedged between two binders is a much thicker printout.', reveals: 'dr-plan',
                    again: 'CHG-1180: "Rename the domain." Status: "Withdrawn, with tears."'
                },
                {
                    names: ['whiteboard', 'board', 'emergency changes'], clue: 'emergency-change',
                    text: 'In marker: "CHG-2299 - Power on DC02 for one final replication. Requested 4:30 AM. Approver: nightowl." The implementer field is blank. Under "Risk", someone has drawn a small smiling face.',
                    again: 'You try to wipe the line off. The marker is permanent. Of course it is.'
                }
            ],
            sense: { smell: 'Burnt kettle, and the toner-and-guilt smell of retroactive approvals.' }
        },
        'repl-hall': {
            act: 3, name: 'The Hall of Replication',
            text: 'Every DC in the forest is painted on the walls, with arrows between them in the KCC\'s spidery handwriting. A restore chamber lies north. The root is back south.',
            exits: { south: 'forest-root', north: 'restore-chamber' },
            quiz: { topic: 'windows-repl', guardian: 'the Replication Warden', intro: 'A warden made of USNs steps away from the wall. "Changes flow both ways here, or not at all. Show me you know how."', cleared: 'The warden replicates you to the next room. "Converged. Eventually."' },
            features: [
                {
                    names: ['walls', 'arrows', 'handwriting', 'dcs'], text: 'The arrow to DC02 has been painted over in grey. The paint has been scratched away again, from the inside of the wall.',
                    again: 'You follow the arrows with a finger. Every path in the forest leads back to DC01 eventually. All but one, which leads into the floor.'
                }
            ],
            sense: { listen: 'A soft scratching, like a pen on plaster. Nobody is holding a pen.' }
        },
        'restore-chamber': {
            act: 3, name: 'The Restore Chamber',
            text: 'Backup tapes hang from the ceiling like bats, each labelled with a date and a hope. A locked vault of credentials lies east. The replication hall is back south.',
            exits: { south: 'repl-hall', east: 'cred-vault' },
            quiz: { topic: 'windows-adops', guardian: 'the Keeper of Backups', intro: 'An old keeper rises from a pile of tapes. "Anyone can back up. Few can restore. Prove you are one of the few."', cleared: 'The keeper hands you a tape. "Tested last quarter. Probably."' },
            features: [
                {
                    names: ['tapes', 'tape', 'bats', 'labels'], text: '"Full - March." "Incremental - Tuesday." "LEGAL HOLD - DO NOT OVERWRITE." "??". The one labelled "??" is the newest.',
                    again: 'One tape hangs apart from the rest, labelled "restore test - PASSED". It is the only one with dust on it.'
                }
            ],
            sense: { listen: 'Tape reels creaking as they sway, and somewhere a drive seeking, and seeking, and seeking.' }
        },
        'tier0-armory': {
            act: 3, name: 'The Tier 0 Armory',
            text: 'Admin credentials hang in locked cases, each one tier apart from the next. In a lockbox by the door sits a sealed envelope. Paths lead west to the credential vault and south to the update shed.',
            exits: { west: 'cred-vault', south: 'wsus-shed' },
            items: ['dsrm-envelope'],
            features: [
                {
                    names: ['cases', 'credentials', 'admin'], text: 'One case holds a Domain Admin account named "svc_backup". Its password has not changed since it was created. You add a ticket. It joins 412 others.',
                    again: 'Next to it hangs "svc_backup2", created the day someone forgot the first one\'s password. Both are Domain Admins. Both are in use.',
                    extra: { knight: 'Your gauntlet brushes a case and sets off a tamper alarm. It is the first alarm in the building that has worked tonight.' }
                },
                {
                    names: ['lockbox'], text: 'The lockbox is labelled "DSRM - break glass". The glass has been broken before.',
                    again: 'The break-glass log inside the lid has one entry from tonight: "4:29 AM - nightowl - just looking." The envelope is still sealed.'
                }
            ],
            sense: { touch: 'The cases are cold. Tier 0 is always a few degrees colder than everything else.' }
        },
        'cred-vault': {
            act: 3, name: 'The Credential Vault',
            text: 'Password hashes hang in jars along the walls, each labelled with an account and how long ago it should have been rotated. An armory lies east. The restore chamber is back west.',
            exits: { west: 'restore-chamber', east: 'tier0-armory' },
            quiz: { topic: 'windows-security', guardian: 'the Pass-the-Hash Phantom', intro: 'A phantom made of stolen NTLM hashes slides out of a jar. "I have been every admin in this forest. Prove you know how to keep me out."', cleared: 'The phantom tries to authenticate as you, finds nothing worth stealing, and evaporates.' },
            features: [
                {
                    names: ['jars', 'jar', 'hashes'], text: 'The biggest jar is labelled "Administrator - last rotated: never". It is very full.',
                    again: 'At the end of the shelf is an empty jar labelled DC02$. The lid is on the floor. Whatever was inside got out.'
                }
            ],
            sense: { smell: 'Formaldehyde and old NTLM.' }
        },
        'hyperv-farm': {
            act: 3, name: 'The Hyper-V Farm',
            text: 'Rows of hosts run hundreds of VMs, half of them called "test" and none of them tests. An update shed stands to the east. The forest root is back west.',
            exits: { west: 'forest-root', east: 'wsus-shed-yard' },
            quiz: { topic: 'windows-hyperv', guardian: 'the Hypervisor Shepherd', intro: 'A shepherd with a crook made of virtual switches herds VMs between hosts. "My flock is all virtual. Tell me how it is kept."', cleared: 'The shepherd live-migrates out of your way without dropping a packet.' },
            features: [
                {
                    names: ['vms', 'vm', 'hosts', 'test'], text: '"test". "test2". "test-old". "test-DO-NOT-DELETE". "Dave\'s test". Dave left in 2018. His VM is the busiest one in the farm.',
                    again: 'Dave\'s test VM is now using more CPU than it was a minute ago. You decide not to look at what it is doing.'
                }
            ],
            sense: { listen: 'The farm hums. Every so often a host sighs, the way hosts do when memory is overcommitted.' }
        },
        'wsus-shed-yard': {
            act: 3, name: 'The Update Yard',
            text: 'Crates of patches are stacked in neat piles, half approved and half "declined, pending review since 2021". The shed is north. The farm is back west.',
            exits: { west: 'hyperv-farm', north: 'wsus-shed' },
            quiz: { topic: 'windows-wsus', guardian: 'the Patch Warden', intro: 'A warden in a hi-vis vest blocks the crates. "Nothing gets installed here that I haven\'t approved. Prove you know the process."', cleared: 'The warden approves you for the production ring. "Reboot pending. Go."' },
            features: [
                {
                    names: ['crates', 'crate', 'piles', 'patches'], text: 'One crate has been pending review so long that a newer crate has arrived to replace it. That one is pending review too.',
                    again: 'A crate stamped "Optional" sits alone in the corner. Nobody approves optional things. It has started to grow a small, sad mold.'
                }
            ],
            sense: { smell: 'Packing straw and superseded updates.' }
        },
        'wsus-shed': {
            act: 3, name: 'The Update Shed',
            text: 'Inside, a WSUS server groans under a database that has never been cleaned up. Its fan sounds like a jet engine. A shelf above it holds one dusty ornament. Paths lead north to the armory and south to the update yard.',
            exits: { south: 'wsus-shed-yard', north: 'tier0-armory' },
            features: [
                {
                    names: ['server', 'wsus', 'database'], text: 'It is still synchronizing Itanium updates. Nobody here has ever owned an Itanium.',
                    again: 'It is also downloading drivers for printers the company sold in 2012. All of them. In every language.',
                    extra: { wizard: 'You cast a small cleanup spell. The database grows four gigabytes out of spite.' }
                },
                { names: ['fan'], text: 'You can feel the fan from across the room. It is the only part of the server that works hard.', again: 'The fan pitch rises whenever you say the word "cleanup". You stop saying it.' },
                { names: ['shelf', 'ornament', 'dust'], text: 'You blow the dust off the shelf. Something small and bent stares back at you with enormous eyes.', reveals: 'clippy', again: 'There is a clean outline in the dust where it stood. It had been there a long time, waiting for someone to need help.' }
            ],
            sense: { listen: 'The fan. Only the fan. It has drowned out every other sound in here since 2016.' }
        },
        'tombstone-vault': {
            act: 3, name: 'The Tombstone Vault', boss: true,
            text: 'A frozen vault where deleted objects wait out their 180 days. DC01 stands at the far end, its replication queue full of things that should not exist. Between you and it drifts a domain controller that died long ago and did not stay dead.',
            exits: { north: 'forest-root' },
            features: [
                {
                    names: ['dc01', 'console', 'queue'], clue: 'last-sync',
                    text: 'DC01\'s console is still lit. Under inbound partners there is one name: DC02. Last successful sync: 5:51 AM. One minute before your phone lit up.',
                    again: 'The console refreshes. DC02, last attempt: just now.',
                    uses: { 'clippy': 'You set the paperclip on DC01\'s console. "It looks like you\'re trying to restore a forest," it says. "Would you like help?" For the first time in its life, the answer is yes. It has no idea what to do.' }
                },
                { names: ['deleted objects', 'objects', 'ice'], text: 'Deleted accounts hang frozen in the ice, each with its date of death. One is your predecessor\'s. Their out-of-office is still on.' }
            ],
            sense: { touch: 'The ice is colder than anything in the building, and it hums faintly, like a disk trying to spin up.' },
            bossFight: {
                name: 'the Tombstoned Domain Controller', topics: ['windows-repl', 'windows-runbook'], key: 'dsrm-envelope',
                locked: 'The Tombstoned DC breathes lingering objects at you. "I was offline only 200 days," it moans. "Let me replicate." Without a way into the directory\'s restore mode, you can\'t touch it.',
                intro: 'You tear open the DSRM envelope. The password is still correct, which surprises everyone. The Tombstoned DC turns. "So you know the old ways. Then prove you know how to put the dead to rest."',
                win: 'The Tombstoned DC\'s lingering objects crumble, its metadata is cleaned out of the forest, and it fades for good. DC01\'s queue drains to zero. repadmin /replsummary comes back clean, and across the building, people start logging on.'
            }
        }
    };

    W.register({
        id: 'windows',
        name: 'Windows Realm',
        blurb: 'From the help desk to the forest root: NTFS, Group Policy, Kerberos, PowerShell and AD recovery.',
        target: 'DC01',
        epilogue: 'At 9:01 AM the first ticket of the day arrives: "Can\'t log on. Also, is the Wi-Fi slow?" You mark it resolved and go find breakfast.',
        items: ITEMS,
        acts: ACTS,
        rooms: ROOMS,
        mystery: MYSTERY,
        ambient: AMBIENT
    });
});
