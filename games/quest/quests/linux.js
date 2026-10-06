/*
 * Datacenter Quest - Linux Realm: Linux system administration on RHEL and
 * Debian/Ubuntu, from shell basics to kernel-space incident response.
 * See QUEST-AUTHORING.md for the shape every quest file follows.
 */
(function (root, factory) {
    if (typeof module === 'object' && module.exports) module.exports = factory(require('../questions.js'), require('../world.js'));
    else factory(root.QuestQuestions, root.QuestWorld);
})(typeof self !== 'undefined' ? self : this, function (Q, W) {
    'use strict';
    const { pick, randInt, shuffle, fromPool } = Q.util;

    // ---------- helpers ----------

    // '755' -> 'rwxr-xr-x'
    const rwx = oct => oct.split('').map(c => {
        const n = Number(c);
        return (n & 4 ? 'r' : '-') + (n & 2 ? 'w' : '-') + (n & 1 ? 'x' : '-');
    }).join('');

    // Overlay setuid/setgid/sticky (special = 0-7) onto a 9-char rwx string
    function withSpecial(sym, special) {
        const a = sym.split('');
        if (special & 4) a[2] = a[2] === 'x' ? 's' : 'S';
        if (special & 2) a[5] = a[5] === 'x' ? 's' : 'S';
        if (special & 1) a[8] = a[8] === 'x' ? 't' : 'T';
        return a.join('');
    }

    const flipCase = sym => sym.replace(/[sStT]/g, c => (c === c.toLowerCase() ? c.toUpperCase() : c.toLowerCase()));

    // Digit-wise octal AND NOT: '666' & ~'027' -> '640'
    const maskOct = (base, mask) => base.split('').map((d, i) => String(Number(d) & ~Number(mask[i]) & 7)).join('');

    const round2 = x => Math.round(x * 100) / 100;

    // ================= ACT 1: shell and basics =================

    const FHS = [
        ['Which top-level directory holds host-specific system configuration files?', '/etc', ['/var', '/usr/share', '/opt', '/srv', '/usr/local', '/boot', '/root'], 'Every config you have ever broken lived here.', 'text', ['etc', '/etc/']],
        ['Which top-level directory holds variable data such as logs, spools and caches?', '/var', ['/tmp', '/usr', '/srv', '/run', '/opt', '/etc'], 'Its name is short for the kind of data that keeps changing.', 'text', ['var', '/var/']],
        ['Which directory is a tmpfs for runtime data since boot, such as PID files and sockets?', '/run', ['/tmp', '/var/lib', '/proc', '/sys', '/var/cache', '/etc'], 'Think of what a process does once it starts. Then drop the -ning.', 'text', ['run', '/run/']],
        ['What is the home directory of the root user?', '/root', ['/home/root', '/home', '/', '/usr/root', '/var/root', '/etc/root'], 'Root is too important to live with the other users in /home.', 'text', ['root', '/root/']],
        ['Which virtual filesystem holds a numbered directory for every running PID?', '/proc', ['/sys', '/dev', '/run', '/var/lib', '/tmp', '/boot'], 'Named for the things it lists.', 'text', ['proc', '/proc/']],
        ['Which directory does the FHS set aside for self-contained third-party add-on packages, like a vendor agent installed as one tree?', '/opt', ['/usr/local', '/srv', '/usr/share', '/var/lib', '/home', '/usr/lib'], 'The packages are optional, and so is the directory name, sort of.', 'text', ['opt', '/opt/']],
        ['Which top-level directory does the FHS reserve for site-specific data this system serves, such as web or FTP content?', '/srv', ['/var/www', '/opt', '/var/lib', '/home', '/usr/share', '/mnt'], 'Short for what the system does with the data.', 'text', ['srv', '/srv/']],
        ['Which directory holds the kernel images and initramfs files the bootloader loads?', '/boot', ['/lib/modules', '/usr/lib', '/etc/grub.d', '/root', '/proc', '/sys'], 'It is named after the moment those files are needed.', 'text', ['boot', '/boot/']],
        ['Which directory does the FHS provide for an admin to temporarily mount a filesystem?', '/mnt', ['/media', '/run/media', '/srv', '/opt', '/tmp', '/var/mnt'], 'Removable media gets its own place. This is the other one, abbreviated.', 'text', ['mnt', '/mnt/']]
    ];

    const REDIRECT = [
        ['In bash, which redirection sends stderr to wherever stdout is currently going?', '2>&1', ['1>&2', '2>1', '&>2', '2>/dev/null', '2|1', '>&2'], 'Descriptor 2, pointed at a copy of descriptor 1. Without the ampersand you get a file named 1.', 'text'],
        ['Which operator appends stdout to a file instead of truncating it first?', '>>', ['>', '>|', '<<', '&>', '|', '2>'], 'Twice the arrow, none of the data loss.', 'text'],
        ['Which command copies stdin to stdout and to a file, so you can watch output while you log it?', 'tee', ['cat', 'xargs', 'script', 'split', 'less', 'dd'], 'Named after a plumbing fitting with three ends.', 'text', ['tee -a']],
        ['What file descriptor number is stderr?', '2', ['0', '1', '3', '255', '-1', '9'], 'stdin and stdout come first.', 'text'],
        ['Which construct feeds a multi-line block of text to a command\'s stdin, ended by a delimiter word like EOF?', 'here-document', ['here-string', 'process substitution', 'pipe', 'subshell', 'command substitution', 'named pipe'], 'Written with two angle brackets. Three would be its one-line cousin.', 'text', ['heredoc', 'here doc', 'here document', '<<', '<<eof']],
        ['Which special file silently discards anything written to it?', '/dev/null', ['/dev/zero', '/dev/random', '/dev/tty', '/tmp/null', '/dev/full', '/proc/null'], 'The bit bucket. It lives with the other devices.', 'text', ['dev/null', 'null']],
        ['Which bash option makes a pipeline fail if any command in it fails, not just the last one?', 'set -o pipefail', ['set -e', 'set -u', 'set -x', 'set -o errexit', 'set -o nounset', 'shopt -s failglob'], 'The option name is literally what you want the pipe to do.', 'text', ['pipefail', '-o pipefail']],
        ['In an interactive shell, you run `cmd 2>&1 > out.log`. Where does stderr end up?', 'the terminal', ['out.log', '/dev/null', 'nowhere', 'both the terminal and out.log', 'a file named 1', 'stdout.log'], 'Redirections apply left to right. Where was stdout pointing when 2>&1 ran?', 'text', ['terminal', 'the screen', 'screen', 'the tty', 'tty', 'the console', 'console', 'the original stdout']]
    ];

    const PKG = [
        ['On RHEL 9, which command tells you which installed package owns /etc/ssh/sshd_config?', 'rpm -qf', ['rpm -ql', 'rpm -qi', 'dnf info', 'dnf list installed', 'rpm -qa', 'dpkg -S'], 'Query the RPM database by file.', 'text', ['rpm -qf /etc/ssh/sshd_config', 'rpm --query --file', 'dnf provides', 'dnf provides /etc/ssh/sshd_config']],
        ['On Ubuntu, which command tells you which installed package owns a given file?', 'dpkg -S', ['dpkg -s', 'dpkg -L', 'apt show', 'rpm -qf', 'apt-cache policy', 'dpkg -l'], 'dpkg, with a capital letter for Search. Lowercase is status.', 'code', ['dpkg --search']],
        ['Which command lists every file an installed RPM package put on disk?', 'rpm -ql', ['rpm -qf', 'rpm -qa', 'rpm -qi', 'rpm -qc', 'rpm -V', 'dnf list'], 'Query, then List.', 'text', ['rpm --query --list', 'rpm -q -l', 'dnf repoquery -l']],
        ['On Ubuntu, which command refreshes the package index from the configured repositories without upgrading anything?', 'apt update', ['apt upgrade', 'apt full-upgrade', 'apt refresh', 'apt-cache update', 'dpkg --update', 'apt dist-upgrade'], 'It updates the lists, not the packages.', 'text', ['apt-get update', 'sudo apt update', 'sudo apt-get update']],
        ['On RHEL 9, which directory holds the .repo files that define dnf repositories?', '/etc/yum.repos.d', ['/etc/dnf/repos.d', '/etc/apt/sources.list.d', '/etc/dnf/dnf.conf', '/var/cache/dnf', '/etc/yum.conf', '/etc/dnf.repos.d'], 'dnf kept its predecessor\'s furniture.', 'text', ['/etc/yum.repos.d/', 'yum.repos.d']],
        ['Which dnf subcommand shows past transactions so you can undo a bad update?', 'dnf history', ['dnf log', 'dnf rollback', 'dnf undo', 'dnf list --recent', 'rpm -qa --last', 'dnf check'], 'Those who forget it are doomed to repeat it.', 'text', ['history', 'dnf history list', 'dnf history undo']],
        ['Which apt command removes a package and its configuration files too?', 'apt purge', ['apt remove', 'apt autoremove', 'apt clean', 'dpkg -r', 'apt autoclean', 'apt delete'], 'Remove is polite. This one is thorough.', 'text', ['apt-get purge', 'apt remove --purge', 'apt-get remove --purge', 'sudo apt purge']]
    ];

    const GREPFIND = [
        ['Which grep option prints only the lines that do NOT match?', '-v', ['-i', '-n', '-c', '-l', '-x', '-w'], 'It inVerts the match.', 'text', ['grep -v', '--invert-match']],
        ['Which grep option makes the match case-insensitive?', '-i', ['-v', '-c', '-e', '-w', '-o', '-s'], 'Ignore case.', 'text', ['grep -i', '--ignore-case']],
        ['Which find test matches files last modified more than 7 days ago?', '-mtime +7', ['-mtime -7', '-mtime 7', '-atime +7', '-ctime -7', '-mmin +7', '-newer 7'], 'm for modified, and the sign says more or less than.', 'text', ['find -mtime +7']],
        ['In awk, which built-in variable holds the number of fields on the current line?', 'NF', ['NR', 'FS', '$0', 'OFS', 'FNR', 'RS'], 'Number of ... something. NR is the record count.', 'text'],
        ['Which command prints the third whitespace-separated field of each line?', "awk '{print $3}'", ["awk '{print $2}'", "awk '{print 3}'", "awk -F: '{print $3}'", 'cut -f3', "awk '{print $NF}'", "awk '{print $0}'"], 'awk splits on whitespace by default. Fields are numbered with a dollar sign.', 'code', ["awk '{ print $3 }'", "awk '{print $3;}'"]],
        ['`find . -name "*.tmp" -exec rm {} \\;` runs rm once per file. Which terminator batches many files into each rm call instead?', '+', ['\\;', ';', '{}', '|', '&&', '-print0'], 'One character, the one you would use to add things together.', 'text', ['{} +', '-exec rm {} +']],
        ['Which grep option searches every file under a directory?', '-r', ['-l', '-e', '-a', '-d', '-s', '-h'], 'Recursive.', 'text', ['-R', '--recursive', 'grep -r']]
    ];

    function genSpecial(rng) {
        const base = pick(rng, ['755', '750', '775', '770', '711', '700', '644', '640', '664', '777', '751', '754']);
        const d = pick(rng, [4, 4, 2, 2, 1, 1, 6, 3]);
        const what = d & 4 ? 'a program' : d & 1 ? 'a shared directory' : 'a directory';
        const sym = withSpecial(rwx(base), d);
        const others = [1, 2, 3, 4, 5, 6, 7].filter(x => x !== d);
        const hint = 'The leading digit adds up 4 (setuid), 2 (setgid) and 1 (sticky). Each borrows an execute slot, and a capital letter means the x under it is missing.';
        if (rng() < 0.5) {
            return {
                q: `You run \`chmod ${d}${base}\` on ${what}. What permission string does \`ls -l\` show (the nine characters after the file type)?`,
                answer: sym, norm: 'code', accept: [sym, '-' + sym, 'd' + sym],
                distractors: [rwx(base), flipCase(sym)].concat(others.map(x => withSpecial(rwx(base), x))),
                hint
            };
        }
        const ans = `${d}${base}`;
        // someone who reads a capital S/T as "x is set"
        const xd = base.split('').map((c, i) => String(Number(c) | ((d >> (2 - i)) & 1))).join('');
        return {
            q: `\`ls -l\` shows \`${d & 4 ? '-' : 'd'}${sym}\` on ${what}. What is its four-digit octal mode?`,
            answer: ans, norm: 'code', accept: [ans, '0' + ans],
            distractors: others.map(x => `${x}${base}`).concat([`0${base}`, `${d}${xd}`, `${base}${d}`]),
            hint
        };
    }

    function genUmask(rng) {
        const u = pick(rng, ['022', '002', '027', '077', '007', '026', '037', '023', '066']);
        const isFile = rng() < 0.5;
        const base = isFile ? '666' : '777';
        const ans = maskOct(base, u);
        const sub = base.split('').map((c, i) => Number(c) - Number(u[i]));
        const distractors = [maskOct(isFile ? '777' : '666', u), u, '755', '644', '775', '664', '700', '600', '750', '640', '751', '711'];
        if (sub.every(n => n >= 0)) distractors.unshift(sub.join(''));
        return {
            q: `Your shell's umask is 0${u}. With no default ACLs in play, what mode does a new ${isFile ? 'file created by `touch`' : 'directory created by `mkdir`'} get? (three octal digits)`,
            answer: ans, norm: 'octal', distractors,
            hint: 'Start from the mode the program asks for (files and directories ask for different ones), then clear every bit that is set in the umask.'
        };
    }

    function genTextCount(rng) {
        const hosts = ['web01', 'web02', 'web03', 'web04', 'db01', 'lb01'];
        const svcs = ['nginx', 'sshd', 'crond', 'chronyd', 'postfix', 'php-fpm'];
        const n = randInt(rng, 7, 9);
        const lines = [];
        for (let guard = 0; lines.length < n && guard < 500; guard++) {
            const line = `${pick(rng, hosts)} ${pick(rng, svcs)} ${rng() < 0.35 ? 'FAIL' : 'OK'}`;
            if (!lines.includes(line)) lines.push(line);
        }
        const file = '$ cat svc.txt\n' + lines.map(l => '  ' + l).join('\n') + '\n';
        const fails = lines.filter(l => / FAIL$/.test(l)).length;
        const webs = lines.filter(l => /^web/.test(l)).length;
        const lineQ = (cmd, idx, hint) => ({
            q: `${file}What single line does \`${cmd}\` print?`,
            answer: lines[idx], norm: 'text', distractors: lines.filter((_, i) => i !== idx), hint
        });
        const kind = pick(rng, ['wc', 'headtail', 'tailhead', 'tailplus', 'grepc', 'grepvc', 'grepanchor']);
        const k = randInt(rng, 2, n - 1);
        if (kind === 'headtail') return lineQ(`head -n ${k} svc.txt | tail -n 1`, k - 1, 'Work the pipe left to right: what does head leave behind, and which of those lines does tail keep?');
        if (kind === 'tailhead') return lineQ(`tail -n ${k} svc.txt | head -n 1`, n - k, 'Work the pipe left to right: tail keeps a block from the bottom, then head takes the top of that block.');
        if (kind === 'tailplus') return lineQ(`tail -n +${k} svc.txt | head -n 1`, k - 1, 'A plus sign changes tail\'s meaning: it counts from the top, not from the bottom.');
        const counts = { wc: n, grepc: fails, grepvc: n - fails, grepanchor: webs };
        const cmds = { wc: 'wc -l < svc.txt', grepc: 'grep -c FAIL svc.txt', grepvc: 'grep -vc FAIL svc.txt', grepanchor: "grep -c '^web' svc.txt" };
        const hints = {
            wc: 'wc -l counts newline characters, and every line here ends with one.',
            grepc: 'grep -c counts matching lines, not matches.',
            grepvc: '-v flips which lines count before -c counts them.',
            grepanchor: 'The caret pins the pattern to the start of the line.'
        };
        return {
            q: `${file}What number does \`${cmds[kind]}\` print?`,
            answer: String(counts[kind]), norm: 'int',
            distractors: [n, fails, n - fails, webs, n - webs, n - 1, n + 1].map(String),
            hint: hints[kind]
        };
    }

    // ================= ACT 2: admin =================

    const SYSTEMD = [
        ['Which command makes a unit start at boot AND starts it right now?', 'systemctl enable --now', ['systemctl enable', 'systemctl start', 'systemctl start --enable', 'systemctl unmask', 'systemctl reenable', 'systemctl daemon-reload'], 'Enable it, and do not wait for the next boot.', 'text', ['enable --now', 'systemctl enable --now nginx', 'systemctl --now enable']],
        ['After editing a unit file in /etc/systemd/system, which command makes systemd re-read it?', 'systemctl daemon-reload', ['systemctl reload', 'systemctl restart systemd', 'systemctl reset-failed', 'systemctl reload-or-restart', 'systemctl edit', 'systemctl refresh'], 'It is systemd itself, the daemon, that needs to reload.', 'text', ['daemon-reload']],
        ['Which systemd target is the equivalent of SysV runlevel 3 (multi-user, no GUI)?', 'multi-user.target', ['graphical.target', 'rescue.target', 'emergency.target', 'default.target', 'basic.target', 'sysinit.target'], 'Many users, no pictures.', 'text', ['multi-user']],
        ['Which command makes the host boot to a text console by default from now on?', 'systemctl set-default multi-user.target', ['systemctl isolate multi-user.target', 'systemctl enable multi-user.target', 'systemctl default multi-user.target', 'systemctl set-default graphical.target', 'systemctl get-default', 'init 3'], 'isolate changes it now. You want to change what boot defaults to.', 'text', ['set-default multi-user.target']],
        ['Which journalctl option shows only messages from the current boot?', '-b', ['-f', '-k', '-r', '-e', '-x', '-b -1'], 'b for boot. With no number, it means this one.', 'text', ['journalctl -b', '-b 0', '--boot']],
        ['Which journalctl option filters messages to a single unit, such as sshd.service?', '-u', ['-t', '-p', '-n', '-b', '-k', '-g'], 'u for unit.', 'text', ['journalctl -u', '--unit', '-u sshd', '-u sshd.service', 'journalctl -u sshd.service']],
        ['Which command stops a unit from being started at all, even manually or as a dependency?', 'systemctl mask', ['systemctl disable', 'systemctl stop', 'systemctl kill', 'systemctl isolate', 'systemctl revert', 'systemctl disable --now'], 'Disable only removes the boot links. This one links the unit to /dev/null.', 'text', ['mask']],
        ['Which command lists the units that are in a failed state?', 'systemctl --failed', ['systemctl status', 'journalctl -p err', 'systemctl list-unit-files', 'systemctl show', 'systemctl list-dependencies', 'systemctl list-jobs'], 'A single option on bare systemctl, named after the state.', 'text', ['systemctl list-units --failed', 'systemctl list-units --state=failed', '--failed']]
    ];

    const USERS = [
        ['Which command edits /etc/sudoers with a syntax check before saving?', 'visudo', ['sudoedit', 'vi /etc/sudoers', 'sudo -e', 'sudo -l', 'vipw', 'chage'], 'The one that refuses to let you lock everyone out with a typo.', 'text'],
        ['Which file holds the hashed user passwords on a modern Linux system?', '/etc/shadow', ['/etc/passwd', '/etc/gshadow', '/etc/login.defs', '/etc/security/passwd', '/etc/pam.d/passwd', '/etc/sudoers'], 'Not the world-readable one. Its sibling that hides in the dark.', 'text', ['shadow']],
        ['Which command adds existing user alice to the wheel group without removing her other supplementary groups?', 'usermod -aG wheel alice', ['usermod -G wheel alice', 'useradd -G wheel alice', 'usermod -g wheel alice', 'groupadd wheel alice', 'chgrp wheel alice', 'newgrp wheel'], 'Without the append flag, -G replaces her whole group list.', 'code', ['usermod -a -G wheel alice', 'usermod -G wheel -a alice', 'gpasswd -a alice wheel', 'sudo usermod -aG wheel alice']],
        ['On RHEL, members of which group get full sudo rights in the default sudoers?', 'wheel', ['sudo', 'admin', 'root', 'adm', 'sudoers', 'staff'], 'An old BSD name for the people who drive.', 'text', ['%wheel']],
        ['On Ubuntu, the first user gets sudo rights by being a member of which group?', 'sudo', ['wheel', 'adm', 'root', 'sudoers', 'staff', 'operator'], 'Ubuntu named it after the command.', 'text', ['%sudo']],
        ['Which command shows a user\'s password aging details, such as last change and expiry?', 'chage -l', ['id', 'last', 'lastlog', 'getent shadow', 'usermod -e', 'faillock'], 'It CHanges AGE, and with a list flag it just shows it.', 'text', ['chage -l alice', 'chage --list']],
        ['In /etc/passwd, which field number holds the login shell?', '7', ['6', '5', '1', '3', '4', '2'], 'It is the last field on the line.', 'text'],
        ['Which command lists what sudo lets the current user run?', 'sudo -l', ['sudo -v', 'sudo -i', 'sudo -k', 'visudo -c', 'id', 'groups'], 'l for list.', 'text', ['sudo --list']]
    ];

    const FSTAB = [
        ['How many whitespace-separated fields does each /etc/fstab entry have?', '6', ['4', '5', '7', '8', '3', '9'], 'Device, mount point, type, options, then the two little numbers at the end.', 'text', ['six']],
        ['In fstab, what value in the sixth (fsck pass) field tells boot to skip checking that filesystem?', '0', ['1', '2', '-1', 'none', 'skip', '9'], 'The lowest number there is.', 'text', ['zero']],
        ['Which fsck pass number should the root filesystem get in fstab?', '1', ['0', '2', '3', 'root', '-1', '6'], 'Root goes first. Everything else waits a step.', 'text', ['one']],
        ['Which command mounts everything in fstab that is not mounted yet, a good test before you reboot?', 'mount -a', ['mount -r', 'mount -o remount /', 'mountall', 'fsck -A', 'swapon -a', 'systemctl daemon-reload'], 'Mount them all.', 'text', ['sudo mount -a', 'mount --all']],
        ['Which fstab option still tries to mount at boot but does not fail the boot if the device is missing?', 'nofail', ['noauto', 'defaults', 'nobootwait', '_netdev', 'x-systemd.automount', 'errors=continue'], 'It says exactly what you want boot to do when the disk is gone.', 'text'],
        ['Which command prints a block device\'s filesystem UUID for use in fstab?', 'blkid', ['df -h', 'fdisk -l', 'mount', 'lsblk', 'parted -l', 'du -sh'], 'It identifies BLocK devices.', 'text', ['sudo blkid', 'lsblk -f', 'lsblk -o uuid', 'lsblk -o +uuid']],
        ['A filesystem lives on an iSCSI LUN. Which fstab option tells systemd it needs the network up first?', '_netdev', ['nofail', 'noauto', 'network', 'x-systemd.requires=network', 'defaults', 'hard'], 'It marks the device as a network device. Note the leading underscore.', 'text', ['netdev']],
        ['Which command shows mounted filesystems as a tree with source, target, type and options?', 'findmnt', ['lsblk', 'df -T', 'blkid', 'fdisk -l', 'du', 'lsof'], 'It FINDs MouNTs.', 'text']
    ];

    const SELINUX = [
        ['Which command prints the current SELinux mode in one word?', 'getenforce', ['setenforce', 'getsebool', 'semanage', 'seinfo', 'restorecon', 'selinuxenabled'], 'The getter for the thing setenforce sets.', 'text', ['sestatus']],
        ['Which SELinux mode logs denials but does not block anything?', 'permissive', ['enforcing', 'disabled', 'targeted', 'mls', 'audit', 'warn'], 'It permits, and takes notes.', 'text'],
        ['Which command switches a running system to permissive until the next reboot?', 'setenforce 0', ['setenforce 1', 'getenforce 0', 'selinux=0', 'setsebool 0', 'semanage permissive -a', 'echo 0 > /etc/selinux/config'], 'Enforcing is 1. You want the other one.', 'text', ['setenforce permissive', 'sudo setenforce 0']],
        ['Which command resets files to the SELinux contexts the policy says they should have?', 'restorecon', ['chcon', 'semanage fcontext', 'chmod', 'setsebool', 'getfattr', 'audit2allow'], 'It restores contexts.', 'text', ['restorecon -R', 'restorecon -Rv', 'restorecon -rv']],
        ['Which command adds a persistent file-context rule, so a custom path keeps its label after a full relabel?', 'semanage fcontext -a', ['chcon -t', 'restorecon', 'setsebool -P', 'chcon -R', 'semanage port -a', 'audit2allow -M'], 'chcon changes are temporary. The policy manager is where it sticks.', 'text', ['semanage fcontext', 'semanage fcontext -a -t']],
        ['Which flag makes setsebool\'s change survive a reboot?', '-P', ['-a', '-R', '-v', '--save', '-1', '-f'], 'Capital letter, for Persistent.', 'text', ['setsebool -P']],
        ['Which ls option shows SELinux security contexts?', '-Z', ['-l', '-c', '-x', '-n', '-a', '-i'], 'Same capital letter as ps and id use for contexts.', 'text', ['ls -Z', '--context']],
        ['With auditd running, which log on RHEL receives AVC denial records?', '/var/log/audit/audit.log', ['/var/log/messages', '/var/log/secure', '/var/log/selinux.log', '/var/log/avc.log', '/var/log/audit.log', '/var/log/kern.log'], 'The audit daemon writes them to its own directory.', 'text', ['audit.log', '/var/log/audit']],
        ['Which SELinux type is the standard label for read-only web content served by httpd?', 'httpd_sys_content_t', ['httpd_t', 'var_t', 'default_t', 'user_home_t', 'http_port_t', 'admin_home_t'], 'httpd_t is the process. You want the content type for the httpd system.', 'text']
    ];

    const NET = [
        ['Which command lists listening TCP sockets, numerically, with the process that owns each?', 'ss -tlnp', ['ss -s', 'ip route', 'ss -tan', 'ip addr', 'netstat -r', 'ss -u'], 'Socket statistics: tcp, listening, numeric, processes.', 'text', ['ss -tlpn', 'ss -ltnp', 'ss -lntp', 'ss -ltpn', 'ss -lnpt', 'ss -plnt', 'ss -tulpn', 'ss -tunlp', 'ss -lptn', 'netstat -tlnp', 'netstat -tulpn']],
        ['Which iproute2 command shows the IPv4 routing table?', 'ip route', ['ip addr', 'ip link', 'ip neigh', 'ss -r', 'ip rule', 'netstat -i'], 'ip, then the object you want to see.', 'text', ['ip r', 'ip route show', 'ip -4 route', 'ip ro']],
        ['Which firewall-cmd flag writes a change to the saved configuration instead of only the running one?', '--permanent', ['--reload', '--persistent', '--save', '--add', '--zone', '--commit'], 'A synonym for lasting forever.', 'text', ['permanent']],
        ['You added a rule with `firewall-cmd --permanent`. Which command makes it take effect now without a restart?', 'firewall-cmd --reload', ['firewall-cmd --save', 'firewall-cmd --apply', 'firewall-cmd --list-all', 'nft flush ruleset', 'iptables-restore', 'firewall-cmd --runtime-to-permanent'], 'Load the saved config again.', 'text', ['--reload']],
        ['Which command prints the entire nftables ruleset?', 'nft list ruleset', ['nft show', 'iptables -L', 'nft list tables', 'firewall-cmd --list-all', 'nft flush ruleset', 'nftables -L'], 'nft, list, and the word for the whole set of rules.', 'text', ['sudo nft list ruleset']],
        ['Which file lists the public keys allowed to log in as a user over SSH?', '~/.ssh/authorized_keys', ['~/.ssh/known_hosts', '~/.ssh/id_ed25519.pub', '~/.ssh/config', '/etc/ssh/sshd_config', '~/.ssh/id_rsa', '/etc/ssh/ssh_known_hosts'], 'known_hosts is about servers you trust. You want the keys the server trusts.', 'text', ['authorized_keys', '.ssh/authorized_keys']],
        ['Which command appends your public key to a remote user\'s authorized_keys for you?', 'ssh-copy-id', ['ssh-keygen', 'ssh-add', 'scp', 'ssh-agent', 'ssh-keyscan', 'sftp'], 'It copies your ID.', 'text', ['ssh-copy-id user@host']],
        ['Which sshd_config line turns off plain password authentication?', 'PasswordAuthentication no', ['PermitRootLogin no', 'PubkeyAuthentication yes', 'PermitEmptyPasswords no', 'UsePAM no', 'ChallengeResponseAuthentication yes', 'AllowUsers root'], 'The directive name says exactly which kind of authentication it controls.', 'text']
    ];

    function genLvm(rng) {
        const kind = pick(rng, ['extents', 'free', 'extend', 'pctfree']);
        if (kind === 'extents') {
            const pe = pick(rng, [4, 8, 16, 32]);
            const g = pick(rng, [5, 10, 20, 40, 50, 100]);
            const ans = g * 1024 / pe;
            return {
                q: `A volume group uses a ${pe} MiB physical extent size. How many extents does \`lvcreate -L ${g}G\` allocate?`,
                answer: String(ans), norm: 'int',
                distractors: [Math.round(g * 1000 / pe), g * 1024 / 4, g * 1024, g * pe, g * 1024 / (pe * 2), g * 1024 / pe * 2].map(String),
                hint: 'A GiB is 1024 MiB, and every extent in this group is the same size.'
            };
        }
        if (kind === 'free') {
            const pvs = [pick(rng, [50, 100, 200]), pick(rng, [100, 250, 500]), pick(rng, [50, 200, 500])];
            const sum = pvs[0] + pvs[1] + pvs[2];
            const lv = pick(rng, [40, 60, 80, 120, 150]);
            return {
                q: `You run \`vgcreate data\` with three PVs of ${pvs[0]}, ${pvs[1]} and ${pvs[2]} GiB, then \`lvcreate -L ${lv}G data\`. Ignoring metadata overhead, how many GiB are free in the VG?`,
                answer: String(sum - lv), norm: 'int',
                distractors: [sum, Math.max(...pvs) - lv, sum + lv, lv, pvs[0] - lv, sum - 2 * lv, Math.min(...pvs)].filter(x => x > 0).map(String),
                hint: 'A volume group pools every PV into one bucket of extents.'
            };
        }
        if (kind === 'extend') {
            const size = pick(rng, [10, 20, 30, 50]);
            const n = pick(rng, [5, 10, 15, 40, 60]);
            const relative = n <= size || rng() < 0.5;
            const ans = relative ? size + n : n;
            return {
                q: `An LV is ${size} GiB. What size in GiB is it after \`lvextend -L ${relative ? '+' : ''}${n}G\`?`,
                answer: String(ans), norm: 'int',
                distractors: [relative ? n : size + n, size, size + 2 * n, Math.abs(n - size), size * 2, n * 2].map(String),
                hint: 'Look closely at the size argument: with a plus sign it means "grow by", without one it means "grow to".'
            };
        }
        const gib = pick(rng, [5, 8, 10, 12, 20, 25, 40]);
        return {
            q: `\`vgdisplay\` reports a PE Size of 4.00 MiB and ${gib * 256} free extents. How many GiB does \`lvcreate -l 100%FREE\` give the new LV?`,
            answer: String(gib), norm: 'int',
            distractors: [gib * 4, gib * 256, gib * 1024, Math.round(gib * 1.024), gib * 2, Math.round(gib * 256 * 4 / 1000)].map(String),
            hint: 'Lowercase -l counts extents. Multiply by the extent size, then turn MiB into GiB.'
        };
    }

    // ================= ACT 3: senior =================

    const PERF = [
        ['In vmstat output, which CPU column shows the percentage of time spent waiting on I/O?', 'wa', ['id', 'sy', 'us', 'st', 'bi', 'b'], 'Two letters, short for what the CPU is doing while the disk thinks.', 'text'],
        ['In vmstat output, which procs column counts tasks in uninterruptible sleep, usually blocked on I/O?', 'b', ['r', 'wa', 'so', 'bo', 'in', 'cs'], 'r is runnable. Its neighbour is blocked.', 'text'],
        ['In vmstat, steady nonzero values in which pair of columns mean the box is actively swapping?', 'si and so', ['bi and bo', 'us and sy', 'r and b', 'in and cs', 'free and buff', 'wa and st'], 'They live under the swap heading: in and out.', 'text', ['si so', 'si/so', 'so and si', 'si, so', 'si,so']],
        ['Which `iostat -x` column shows the percentage of time the device had I/O requests in flight?', '%util', ['%iowait', 'await', 'tps', '%idle', 'r/s', 'svctm'], 'How utilized the device is. It is the last column.', 'text', ['util']],
        ['In top, which CPU field shows time stolen from this VM by the hypervisor?', 'st', ['wa', 'hi', 'si', 'ni', 'sy', 'id'], 'Two letters for theft.', 'text', ['steal']],
        ['Which sysstat tool records performance history (on RHEL, under /var/log/sa) and replays it later?', 'sar', ['vmstat', 'iostat', 'mpstat', 'pidstat', 'dstat', 'top'], 'The System Activity Reporter.', 'text', ['sar -f']],
        ['Which sysstat tool reports CPU, memory or disk statistics per process over time?', 'pidstat', ['sar', 'mpstat', 'iostat', 'iotop', 'ps', 'vmstat'], 'Statistics, broken down by process ID.', 'text'],
        ['Which column of `free` is the kernel\'s estimate of memory available for new programs without swapping?', 'available', ['free', 'buff/cache', 'shared', 'used', 'total', 'cached'], 'Not "free": the kernel counts reclaimable cache too. It is the last column.', 'text']
    ];

    const INODE = [
        ['`df -h` shows 40% used, but writes fail with "No space left on device". Which command checks the likely culprit?', 'df -i', ['du -sh', 'df -h', 'lsblk', 'fsck', 'free -m', 'iostat'], 'Space is fine. Count something else the filesystem can run out of.', 'text', ['df --inodes', 'df -ih', 'df -hi']],
        ['The disk is 100% full but du cannot find where the space went. Which command lists deleted files still held open by processes?', 'lsof +L1', ['du -sh /*', 'find / -size +1G', 'df -i', 'ls -la /tmp', 'ncdu', 'fuser -m'], 'List open files whose link count is below one.', 'text', ['lsof | grep deleted', 'lsof +l1']],
        ['Which ls option prints each file\'s inode number?', '-i', ['-n', '-l', '-s', '-a', '-d', '-h'], 'The first letter of what you want to see.', 'text', ['ls -i', '--inode']],
        ['Which of these filesystems allocates inodes dynamically, so it rarely runs out of them?', 'XFS', ['ext4', 'ext3', 'ext2', 'vfat', 'minix', 'iso9660'], 'RHEL\'s default filesystem, not the ext family.', 'text'],
        ['Which GNU du option counts inodes instead of disk blocks?', '--inodes', ['-i', '-s', '-c', '-a', '--files', '-x'], 'A long option, named for exactly what it counts.', 'text', ['du --inodes']],
        ['By default, what percentage of a new ext4 filesystem\'s blocks is reserved for root?', '5', ['0', '1', '10', '2', '3', '15'], 'Enough to log in and clean up on a full disk. A single digit.', 'text', ['5%', 'five']],
        ['Which tune2fs option changes the reserved-blocks percentage on ext4?', '-m', ['-i', '-c', '-l', '-o', '-e', '-j'], 'The same letter mke2fs uses for it.', 'text', ['tune2fs -m']]
    ];

    const LIMITS = [
        ['Which command loads every sysctl config file (/etc/sysctl.d and friends) without a reboot?', 'sysctl --system', ['sysctl -a', 'sysctl -w', 'systemctl restart sysctl', 'sysctl --reload', 'sysctl -e', 'modprobe sysctl'], '-p only reads one file by default. You want the whole system.', 'text', ['sudo sysctl --system']],
        ['Which sysctl key turns on IPv4 packet forwarding?', 'net.ipv4.ip_forward', ['net.ipv4.forward', 'net.ipv4.ip_routing', 'net.core.ip_forward', 'kernel.ip_forward', 'net.ipv4.tcp_forward', 'net.ipv6.conf.all.forwarding'], 'It lives under net.ipv4 and says what it forwards.', 'text', ['net.ipv4.ip_forward=1', 'net.ipv4.ip_forward = 1']],
        ['Which sysctl controls how eagerly the kernel swaps out anonymous memory?', 'vm.swappiness', ['vm.overcommit_memory', 'vm.dirty_ratio', 'vm.vfs_cache_pressure', 'vm.min_free_kbytes', 'kernel.swappiness', 'vm.swap_ratio'], 'A virtual-memory key that sounds like a personality trait.', 'text', ['swappiness']],
        ['Which ulimit flag shows or sets the maximum number of open file descriptors?', '-n', ['-f', '-u', '-s', '-v', '-c', '-l'], '-f is file size, a classic trap. You want the number.', 'text', ['ulimit -n']],
        ['limits.conf does not apply to systemd services. Which unit directive raises a service\'s open-files limit?', 'LimitNOFILE', ['LimitNPROC', 'MaxFiles', 'LimitFSIZE', 'TasksMax', 'OpenFilesLimit', 'LimitOFILE'], 'Limit, then the same resource name limits.conf uses for open files.', 'text', ['LimitNOFILE=']],
        ['Which systemd directive sets a hard cgroup v2 memory cap on a service?', 'MemoryMax', ['MemoryHigh', 'MemoryMin', 'MemoryLow', 'MemorySwapMax', 'LimitAS', 'LimitRSS'], 'High throttles. You want the absolute ceiling.', 'text', ['MemoryMax=']],
        ['Which cgroup version do RHEL 9 and Ubuntu 24.04 use by default?', 'v2', ['v1', 'hybrid', 'v3', 'both v1 and v2', 'none', 'legacy'], 'The unified hierarchy.', 'text', ['2', 'cgroup v2', 'cgroups v2', 'cgroup2', 'version 2', 'unified']],
        ['Which file sets persistent per-user ulimits that pam_limits applies at login?', '/etc/security/limits.conf', ['/etc/limits', '/etc/sysctl.conf', '/etc/login.defs', '/etc/security/pam_limits.conf', '/etc/systemd/system.conf', '/etc/profile'], 'It is in the security directory, named for what it holds.', 'text', ['limits.conf', '/etc/security/limits.d']]
    ];

    const OOM = [
        ['Which command shows the kernel ring buffer, where "Out of memory: Killed process" lines appear?', 'dmesg', ['top', 'free', 'vmstat', 'journalctl -u oom', 'cat /var/log/oom', 'lastlog'], 'Display MESsaGes from the kernel.', 'text', ['dmesg -T', 'journalctl -k', 'journalctl -k -b', 'journalctl --dmesg']],
        ['Which /proc/<pid> file lets you adjust a process\'s OOM-kill priority on a -1000 to 1000 scale?', 'oom_score_adj', ['oom_score', 'oom_adj', 'oom_priority', 'oom_kill', 'oom_score_min', 'nice'], 'oom_score is read-only. Its adjustable sibling is the one you write.', 'text', ['/proc/<pid>/oom_score_adj']],
        ['What oom_score_adj value exempts a process from the OOM killer entirely?', '-1000', ['-17', '0', '1000', '-999', '-1', '-100'], 'The very bottom of the scale.', 'text'],
        ['Which vm.overcommit_memory value means strict accounting: never overcommit?', '2', ['0', '1', '3', '-1', '100', '50'], '0 is the heuristic, 1 always says yes.', 'text'],
        ['Which systemd daemon watches memory pressure (PSI) and kills whole cgroups before the kernel OOM killer has to?', 'systemd-oomd', ['earlyoom', 'oom-killer', 'systemd-journald', 'kswapd', 'systemd-logind', 'tuned'], 'systemd, plus the problem it handles, plus d.', 'text', ['oomd', 'systemd-oomd.service']],
        ['Which kernel thread reclaims memory in the background when free pages run low?', 'kswapd', ['kworker', 'ksoftirqd', 'kthreadd', 'oom_reaper', 'khugepaged', 'swapper'], 'A kernel thread named for swapping.', 'text', ['kswapd0']],
        ['Which /proc/<pid> value does the OOM killer rank processes by, killing the highest first?', 'oom_score', ['oom_score_adj', 'nice', 'priority', 'rss', 'pid', 'statm'], 'The computed badness, not the knob that adjusts it.', 'text', ['/proc/<pid>/oom_score']]
    ];

    const RESCUE = [
        ['On RHEL 9, which tool changes kernel command-line arguments for installed kernels?', 'grubby', ['dracut', 'update-grub', 'efibootmgr', 'kexec', 'sysctl', 'modprobe'], 'Not grub2-mkconfig: RHEL 9 ships a dedicated tool that edits the boot entries for you.', 'text', ['grubby --update-kernel=ALL --args']],
        ['Which systemd target gives a single-user root shell with local filesystems mounted, the old runlevel 1?', 'rescue.target', ['emergency.target', 'multi-user.target', 'single.target', 'sysinit.target', 'recovery.target', 'basic.target'], 'Not the most drastic option, the one before it.', 'text', ['rescue']],
        ['Which systemd target mounts only the root filesystem, read-only, and starts almost nothing: the one for when rescue mode fails?', 'emergency.target', ['rescue.target', 'halt.target', 'basic.target', 'minimal.target', 'sysinit.target', 'initrd.target'], 'Worse than needing rescue.', 'text', ['emergency']],
        ['Which kernel command-line parameter makes the kernel reboot a number of seconds after a panic?', 'panic', ['reboot', 'panic_on_oops', 'oops=reboot', 'nmi_watchdog', 'crashkernel', 'kernel.reboot'], 'Named for the event it reacts to, written as name=seconds.', 'text', ['panic=10', 'panic=n', 'panic=<seconds>']],
        ['Which service boots a reserved crash kernel to save a vmcore when the main kernel panics?', 'kdump', ['abrt', 'systemd-coredump', 'rsyslog', 'sos', 'auditd', 'dmesg'], 'It dumps the kernel.', 'text', ['kdump.service', 'kdump-tools']],
        ['Where does kdump save vmcores by default?', '/var/crash', ['/var/log/crash', '/var/lib/systemd/coredump', '/tmp', '/boot/crash', '/var/spool/abrt', '/root/vmcore'], 'Under /var, in a directory named for the event.', 'text', ['/var/crash/']],
        ['Which sysctl makes the kernel panic on an oops instead of trying to carry on?', 'kernel.panic_on_oops', ['kernel.panic', 'kernel.oops_panic', 'vm.panic_on_oom', 'kernel.sysrq', 'kernel.softlockup_panic', 'kernel.hung_task_panic'], 'Panic, on, the event. In that order.', 'text'],
        ['With Magic SysRq enabled, which key triggers an immediate reboot, the last letter of REISUB?', 'b', ['s', 'u', 'e', 'i', 'r', 'c'], 'Read the mnemonic. s syncs, u remounts read-only.', 'text'],
        ['Which RHEL tool gathers configs, logs and command output into one archive for a support case?', 'sos report', ['abrt-cli', 'rpm -Va', 'dmesg', 'kdumpctl', 'journalctl --vacuum-size', 'tar czf /etc'], 'Named for a distress call.', 'text', ['sos', 'sosreport', 'sos report --batch']]
    ];

    function genLoad(rng) {
        const cores = pick(rng, [2, 4, 8, 16, 32]);
        const ld = () => round2(cores * randInt(rng, 15, 250) / 100);
        let loads = [ld(), ld(), ld()];
        const spread = l => { const p = l.map(x => x / cores); return Math.min(Math.abs(p[0] - p[1]), Math.abs(p[1] - p[2]), Math.abs(p[0] - p[2])); };
        for (let guard = 0; spread(loads) < 0.05 && guard < 50; guard++) loads = [ld(), ld(), ld()];
        const w = randInt(rng, 0, 2);
        const win = [1, 5, 15][w];
        const per = loads.map(x => round2(x / cores));
        const ans = per[w];
        return {
            q: `\`uptime\` on a host where \`nproc\` reports ${cores} shows:\n  load average: ${loads.map(x => x.toFixed(2)).join(', ')}\nWhat is the ${win}-minute load per CPU? (two decimals)`,
            answer: ans.toFixed(2), norm: 'num', tol: 0.01,
            distractors: per.filter((_, i) => i !== w).concat([loads[w], round2(loads[w] * cores), round2(cores / loads[w]), round2(loads[w] / (cores * 2))]).map(x => x.toFixed(2)),
            hint: 'The three numbers are the 1, 5 and 15-minute averages, in that order. Spread the one you need across the CPUs.'
        };
    }

    function genFindPerm(rng) {
        const names = shuffle(rng, ['deploy.sh', 'app.conf', 'id_ed25519', 'notes.txt', 'backup.tar', 'run.py', 'motd', 'token']).slice(0, 6);
        const MODES = ['755', '644', '600', '640', '664', '775', '777', '700', '750', '711', '444', '666', '620', '705'];
        const files = names.map(name => ({ name, mode: pick(rng, MODES) }));
        const kind = pick(rng, ['exact', 'all', 'all', 'any', 'any']);
        const x = kind === 'exact' ? pick(rng, files).mode
            : kind === 'all' ? pick(rng, ['644', '020', '002', '111', '600', '750', '444', '100', '022'])
                : pick(rng, ['022', '002', '111', '020', '006', '100', '007']);
        const bits = parseInt(x, 8);
        const count = {
            exact: files.filter(f => parseInt(f.mode, 8) === bits).length,
            all: files.filter(f => (parseInt(f.mode, 8) & bits) === bits).length,
            any: files.filter(f => (parseInt(f.mode, 8) & bits) !== 0).length
        };
        const expr = (kind === 'exact' ? '' : kind === 'all' ? '-' : '/') + x;
        const hints = {
            exact: 'With no prefix, -perm wants the whole mode to match, nothing more and nothing less.',
            all: 'A leading - means every listed bit must be set. Extra bits on the file do not matter.',
            any: 'A leading / means at least one of the listed bits must be set.'
        };
        return {
            q: `Modes of the files in ./drop:\n${files.map(f => `  ${f.mode}  ${f.name}`).join('\n')}\nHow many files does \`find ./drop -type f -perm ${expr}\` print?`,
            answer: String(count[kind]), norm: 'int',
            distractors: [count.exact, count.all, count.any, files.length, 0, 1, 2, 3].map(String),
            hint: hints[kind]
        };
    }

    Q.registerTopics({
        'linux-fhs': { label: 'Filesystem hierarchy', gen: fromPool(FHS, 'text') },
        'linux-special': { label: 'Special permission bits', gen: genSpecial },
        'linux-umask': { label: 'umask', gen: genUmask },
        'linux-redirect': { label: 'Pipes and redirection', gen: fromPool(REDIRECT, 'text') },
        'linux-textcount': { label: 'head, tail, wc and grep -c', gen: genTextCount },
        'linux-pkg': { label: 'dnf, rpm, apt and dpkg', gen: fromPool(PKG, 'text') },
        'linux-grepfind': { label: 'grep, find and awk', gen: fromPool(GREPFIND, 'text') },
        'linux-systemd': { label: 'systemd and journalctl', gen: fromPool(SYSTEMD, 'text') },
        'linux-users': { label: 'Users and sudo', gen: fromPool(USERS, 'text') },
        'linux-lvm': { label: 'LVM arithmetic', gen: genLvm },
        'linux-fstab': { label: 'Mounts and fstab', gen: fromPool(FSTAB, 'text') },
        'linux-selinux': { label: 'SELinux', gen: fromPool(SELINUX, 'text') },
        'linux-net': { label: 'ip, ss, firewalls and SSH', gen: fromPool(NET, 'text') },
        'linux-load': { label: 'Load average per CPU', gen: genLoad },
        'linux-perf': { label: 'vmstat, iostat and sar', gen: fromPool(PERF, 'text') },
        'linux-inode': { label: 'Inodes and full disks', gen: fromPool(INODE, 'text') },
        'linux-limits': { label: 'sysctl, ulimits and cgroups', gen: fromPool(LIMITS, 'text') },
        'linux-findperm': { label: 'find -perm', gen: genFindPerm },
        'linux-oom': { label: 'The OOM killer', gen: fromPool(OOM, 'text') },
        'linux-rescue': { label: 'Boot, panic and recovery', gen: fromPool(RESCUE, 'text') }
    });

    // ================= world =================

    const ITEMS = {
        'energy-drink': {
            name: 'Can of Energy Drink', names: ['can', 'energy drink', 'drink', 'potion', 'can of energy drink'], kind: 'potion',
            desc: 'A tall can of something neon, rated for 72 hours of continuous uptime. Drink it to restore a life, or trade it for a hint.'
        },
        'snapshot-vial': {
            name: 'Vial of LVM Snapshot', names: ['vial', 'snapshot', 'potion', 'vial of lvm snapshot', 'lvm snapshot'], kind: 'potion',
            desc: 'A small vial labelled "lvcreate -s, taken before the change". Drink it to restore a life, or trade it for a hint.'
        },
        'swap-tonic': {
            name: 'Tonic of Emergency Swap', names: ['tonic', 'swap', 'potion', 'tonic of emergency swap', 'swap tonic'], kind: 'potion',
            desc: 'A flask of swap made with fallocate and mkswap at the worst possible moment. Drink it to restore a life, or trade it for a hint.'
        },
        'signing-keyring': {
            name: 'Repo Signing Keyring', names: ['keyring', 'signing keyring', 'repo signing keyring', 'gpg keyring', 'keys'], kind: 'key', boss: 'basilisk-den',
            desc: 'An iron ring of GPG keys, each stamped with a repository fingerprint. Packages that fail its check turn to dust.'
        },
        'init-crook': {
            name: 'Crook of PID 1', names: ['crook', 'crook of pid 1', 'staff', 'pid 1'], kind: 'key', boss: 'zombie-crypt',
            desc: 'A shepherd\'s crook stamped "PID 1". Orphaned processes follow it home, where they are reaped at last.'
        },
        'rescue-iso': {
            name: 'Rescue ISO', names: ['iso', 'rescue iso', 'usb', 'rescue usb', 'stick'], kind: 'key', boss: 'oom-arena',
            desc: 'A USB stick with an install image on it and a strip of tape that reads "TROUBLESHOOT". It boots without asking the broken system for permission.'
        },
        'man-page': {
            name: 'man page', names: ['man page', 'page', 'manual', 'man'], kind: 'curio',
            desc: 'A torn page of man bash, somewhere deep in the section about parameter expansion. Nobody has read further than this.',
            use: 'You read it. It is correct, complete and of no help at all right now.'
        },
        'tux-plush': {
            name: 'Tux plush', names: ['tux', 'plush', 'penguin', 'tux plush'], kind: 'curio',
            desc: 'A small plush penguin with a conference lanyard. It has seen things.',
            use: 'You squeeze the penguin. It does not fix the cluster, but your blood pressure drops a little.'
        },
        'core-file': {
            name: 'core file', names: ['core', 'core file', 'core dump', 'dump'], kind: 'curio',
            desc: 'A 4 GB file named core.31337. Nobody remembers which binary made it, and nobody wants to open it.',
            use: 'You consider running gdb on it. You consider your life choices. You put it away.'
        },
        'esc-key': {
            name: 'Esc key', names: ['esc key', 'escape key', 'esc', 'escape'], kind: 'curio',
            desc: 'A single Esc keycap, prised off a console keyboard. Somewhere, someone is still trapped in vi because of this.',
            use: 'You press it. Nothing happens, because it is not attached to anything. It still feels like getting out of insert mode.'
        },
        'fortune-cookie': {
            name: 'fortune cookie', names: ['fortune cookie', 'cookie', 'fortune'], kind: 'curio',
            desc: 'A fortune cookie from the MOTD lounge. The slip inside looks like it was printed by /usr/games/fortune on a dot-matrix printer.',
            use: 'You crack it open. The slip reads: "You will be paged at an inconvenient time." You check the clock. It is already true.'
        },
        'rpmnew': {
            name: 'httpd.conf.rpmnew', names: ['rpmnew', 'httpd.conf.rpmnew', '.rpmnew'], kind: 'curio',
            desc: 'Left behind by an update three years ago: the package\'s idea of what your config should look like. Nobody has ever diffed it against the real one.',
            use: 'You diff it against the live config in your head. Four hundred lines change. You decide that is a problem for daylight.'
        },
        'tainted-flag': {
            name: 'Tainted flag', names: ['flag', 'tainted flag', 'taint'], kind: 'curio',
            desc: 'A small pennant that reads "Tainted: P". The kernel runs it up the pole whenever a proprietary module is loaded, and vendor support asks about it before saying hello.',
            use: 'You wave the flag. Somewhere, a support engineer closes your ticket as "unsupported configuration".'
        }
    };

    // The outage has a cause. It may also have an author.
    const MYSTERY = {
        title: 'Incident notes, things that don\'t add up:',
        clues: {
            'home-1066': 'In /home, a directory owned by "1066". Just a number: no account has that UID any more. Last modified 2:09 AM tonight.',
            'override': 'A php-fpm drop-in, created 2:11 AM by UID 1066, takes away the memory limit added after last year\'s outage. Its only comment: "one more night".',
            'sudoers-99': '/etc/sudoers.d/99-temp still grants #1066 full root, no password. It is dated three years ago, the week that account was deleted.',
            'oom-skip': 'The OOM Killer\'s ledger: every victim tonight was a PHP worker. One process, owned by 1066, is marked "do not touch" and is still running. Its name is "watch".'
        },
        solved: 'A week later, the access review comes back clean: "No user with UID 1066 exists on any host." You sign it off. That night at 2:09 AM your phone lights up, not with a page, but with a login notice for prod-web-01 from 10.0.0.66. No alert follows. Nothing breaks. Whoever it is, they just wanted you to know the lights were still on.'
    };

    const AMBIENT = [
        { act: 1, text: 'Down the corridor, a keyboard clacks. It stops the moment you round the corner. The terminal there is warm and logged out.' },
        { act: 1, text: 'Somewhere in the dark, someone types a long password, then backspaces over every character of it.' },
        { act: 2, text: 'A message flashes across every screen at once: "Broadcast message from nightowl (pts/3)". The body is blank. Then the screens clear.' },
        { act: 2, text: 'A process forks at the edge of your vision, sleeps, and exits. Its parent PID belongs to nothing that is running.' },
        { act: 3, text: 'Far above, in userland, a fan spins up the way fans do when someone has just logged in and started something.' },
        { act: 3, text: 'The kernel log prints one line, too fast to read. When you scroll back for it, the line isn\'t there.' }
    ];

    const ACTS = [
        {
            n: 1, name: 'The Userland', start: 'tty1', boss: 'basilisk-den', key: 'signing-keyring',
            intro: 'ACT I: THE USERLAND\nThe pager goes off at 2:13 AM: every node in the prod-web cluster is answering with 503 and the load balancer has given up on all of them. Someone needs to get a shell on those boxes. The on-call calendar says it is you.'
        },
        {
            n: 2, name: 'The Init Realm', start: 'pid1-plaza', boss: 'zombie-crypt', key: 'init-crook',
            intro: 'ACT II: THE INIT REALM\nPast the dead Basilisk, the shell gives way to the realm of systemd, where every service has a unit file and opinions about its dependencies. Somewhere below, something is raising processes that refuse to stay dead.'
        },
        {
            n: 3, name: 'Kernel Space', start: 'ring-zero', boss: 'oom-arena', key: 'rescue-iso',
            intro: 'ACT III: KERNEL SPACE\nBelow userland the air gets thin and the rules get absolute. There is no man page down here, only dmesg. At the bottom, the OOM Killer is choosing who on the prod-web cluster gets to live.'
        }
    ];

    const ROOMS = {
        // ======================= ACT I =======================
        'tty1': {
            act: 1, name: 'The Login Prompt',
            text: 'A cold console room lit by a single blinking "login:" prompt above a grimy keyboard. Your pager lies face down beside it. A stone hierarchy of directories rises to the north, a forge glows to the east, and a lounge hums to the west. Something hisses behind a sealed door to the south.',
            exits: { north: 'root-dir', east: 'umask-forge', west: 'motd-lounge', south: 'basilisk-den' },
            features: [
                {
                    names: ['pager'], text: 'CRITICAL: prod-web pool 0/6 healthy. HTTP 503 on all members. Runbook: "ssh in and check". Thanks, runbook.',
                    again: 'You scroll the pager history. There is one earlier alert tonight, at 2:09 AM: "New SSH login on prod-web-01". It auto-resolved. Nobody acked it, because nobody needed to.'
                },
                {
                    names: ['prompt', 'login', 'login prompt'], text: 'login: _ The cursor blinks with the patience of something that has watched many admins type their password into the username field.',
                    again: 'The cursor blinks. For one frame you could swear the username field already said something, and then it didn\'t.',
                    uses: { 'esc-key': 'You hold the Esc key up to the prompt. Nothing. You were never in insert mode. For once in your career, you are sure of that.' }
                },
                {
                    names: ['keyboard', 'keys', 'grimy keyboard'], text: 'A beige keyboard older than some of your coworkers. The Esc key is loose. You give it a nudge and it comes off in your hand.', reveals: 'esc-key',
                    again: 'Without its Esc key the keyboard looks oddly vulnerable. Someone has written "use Ctrl-[" on the bare switch. They are not wrong.'
                },
                { names: ['door', 'south door', 'seal', 'seals', 'south', 'runes'], text: 'A heavy door to the south, carved with five runes: one per guardian of this realm. Behind it, something with a broken dependency tree is coiling.' }
            ],
            sense: { listen: 'The hum of a console fan and the faint, rhythmic hiss from behind the south door. It hisses in time with the cursor.', touch: 'The keyboard is cold, except for the Enter key, which is warm, as if someone pressed it a lot just now.' }
        },
        'motd-lounge': {
            act: 1, name: 'The MOTD Lounge',
            text: 'A break lounge whose walls scroll the message of the day: "Authorized use only. All activity is logged." A humming mini-fridge sits in the corner beside a bowl of fortune cookies. The login prompt is back east.',
            exits: { east: 'tty1' },
            features: [
                { names: ['fridge', 'mini-fridge', 'mini fridge'], text: 'Behind a sad yogurt with a name on it, you find one cold can of energy drink.', reveals: 'energy-drink' },
                {
                    names: ['walls', 'motd', 'message'], text: 'Below the warning, someone has appended: "Last login: 3 years ago from 10.0.0.66". Nobody has asked who that was.',
                    again: 'The line has changed. It now reads "Last login: tonight from 10.0.0.66". You did not see it change.'
                },
                {
                    names: ['bowl', 'cookies', 'bowl of fortune cookies'], text: 'A bowl of fortune cookies from a team lunch nobody remembers. You take the one on top. It is still crisp, which is the most worrying thing you have seen tonight.', reveals: 'fortune-cookie',
                    again: 'The rest of the cookies are stale. Someone has already cracked one and left the slip face up: "The call is coming from inside the server."'
                },
                { names: ['yogurt', 'sad yogurt', 'name'], text: 'The name on the yogurt has been crossed out and rewritten three times. The expiry date has not.' }
            ],
            sense: { listen: 'The fridge hums. Over it, the MOTD scrolls with a faint teletype rattle, though nothing here has been a teletype since 1985.', smell: 'Old coffee, older yogurt, and the warm-plastic smell of a fridge that is mostly compressor.' }
        },
        'root-dir': {
            act: 1, name: 'The Root of All Directories',
            text: 'A great stone hall marked "/" with a dozen archways: etc, var, usr, opt, srv, home and more. A spiral tower rises to the north. The login prompt lies south.',
            exits: { south: 'tty1', north: 'sticky-tower' },
            features: [
                {
                    names: ['archways', 'archway', 'home'], clue: 'home-1066',
                    text: 'You peer through the archway marked home. Rows of doors with names on them, and one door with only a number: 1066. That is what ls shows when no account owns that UID any more. The door was opened at 2:09 AM tonight.',
                    again: 'The 1066 door is closed now. There is a faint warm draught under it, like a terminal left running.'
                },
                { names: ['hall', 'stone', 'floor'], text: 'The floor is one enormous slash. People have been arguing about what belongs under it since 1994 and they have written it all down, which is more than most teams manage.' }
            ],
            sense: { listen: 'Footsteps echo from every archway at once, as if someone is walking all of them in parallel.' },
            quiz: { topic: 'linux-fhs', guardian: 'the Hierarchy Warden', intro: 'A warden with a ring of mount points blocks the archways. "Everything has a place," it says. "Tell me where this goes."', cleared: 'The warden nods and files you correctly. "Not in /tmp. Good."' }
        },
        'sticky-tower': {
            act: 1, name: 'The Tower of Special Bits',
            text: 'A narrow tower whose steps are etched with permission strings, some with strange s and t letters where the x should be. Steam hisses from a doorway east. The root hall lies south.',
            exits: { south: 'root-dir', east: 'pipeworks' },
            features: [
                {
                    names: ['steps', 'step', 'permission strings', 'strings'], text: 'One step is shared by everyone. Anyone may put things on it, but you may only take away your own. A note taped to it says "please stop moving my files". It has been moved.',
                    extra: { wizard: 'A step near the top runs as its owner no matter who stands on it. Your staff tingles. It knows a fellow privilege escalation when it sees one.' }
                }
            ],
            sense: { touch: 'The steps are worn smooth in the middle and sharp at the edges, where nobody with the right permissions ever bothers to walk.' },
            quiz: { topic: 'linux-special', guardian: 'the Setuid Gargoyle', intro: 'A stone gargoyle peels itself off the wall, running as root no matter who woke it. "Read my bits," it grates, "or stay where you are."', cleared: 'The gargoyle drops its privileges and settles back onto its ledge.' }
        },
        'pipeworks': {
            act: 1, name: 'The Pipeworks',
            text: 'A maze of pipes, every joint labelled 0, 1 or 2. Output spurts from one joint straight into /dev/null. A mirror room glints to the east, and the tower lies west.',
            exits: { west: 'sticky-tower', east: 'repo-mirror' },
            features: [
                {
                    names: ['joint', 'joints', 'pipes', 'output'], text: 'The joint labelled 2 drips steadily into a bucket marked "errors, read later". The bucket is overflowing. Nobody has read later.',
                    again: 'You find a pipe that loops back into itself. A tag says "cat file | grep x | grep -v y | grep x | wc -l. it works, don\'t touch it."',
                    uses: { 'man-page': 'You feed the man page into the pipe that drains into /dev/null. A moment later it floats back out, unharmed. Even the bit bucket has standards.' }
                }
            ],
            sense: { listen: 'Gurgling, hissing, and every few seconds a tiny scream that drains away into nothing.' },
            quiz: { topic: 'linux-redirect', guardian: 'the Plumber of Descriptors', intro: 'A plumber in overalls stained with stderr blocks the valve. "Nothing flows until you tell me where it goes."', cleared: 'The plumber opens the valve. Your output flows exactly where you sent it, for once.' }
        },
        'repo-mirror': {
            act: 1, name: 'The Repo Mirror',
            text: 'Racks of package mirrors hum, each syncing from somewhere upstream. On a hook by the door hangs a heavy ring of GPG keys. The pipeworks lie west and a lost-and-found room lies south.',
            exits: { west: 'pipeworks', south: 'lost-found' },
            items: ['signing-keyring'],
            features: [
                {
                    names: ['mirrors', 'racks', 'mirror'], text: 'One mirror has a sticky note: "Last sync 2019. Do not update, the app breaks." It is serving packages to production.',
                    again: 'The mirror\'s access log scrolls past. One client, 10.0.0.66, has been downloading the same package every night at 2:00 AM for three years. Nobody has ever installed it.'
                },
                { names: ['hook', 'door'], text: 'The label on the hook reads "gpgcheck=1". Someone has scratched underneath it: "gpgcheck=0, temporary, for the demo". The demo was in 2017.' }
            ],
            sense: { listen: 'A hundred rsync jobs whispering to a hundred upstreams. One of them is just whispering "connection timed out" over and over.' }
        },
        'umask-forge': {
            act: 1, name: 'The Umask Forge',
            text: 'A forge where every new file is cast at 666 and every directory at 777, then struck with a mask on a great anvil. Sparks of cleared bits fly everywhere. A cellar door leads east, and the login prompt is west.',
            exits: { west: 'tty1', east: 'log-cellar' },
            features: [
                {
                    names: ['anvil', 'sparks', 'bits'], text: 'Engraved on the anvil: "The mask takes away. It never gives." A pile of cleared bits lies in a scrap bin, still glowing faintly.',
                    again: 'In the scrap bin, a single execute bit that someone has tried to hammer back onto a text file. It did not take. It never does.'
                }
            ],
            sense: { smell: 'Hot iron and the burnt-ozone smell of a permission being taken away from someone who really wanted it.' },
            quiz: { topic: 'linux-umask', guardian: 'the Umask Smith', intro: 'A smith with a hammer marked 0022 stops you at the anvil. "Everything I make comes out a little less permissive. Tell me how much less."', cleared: 'The smith quenches the file in oil. "Right mode. No one has to chmod it later."' }
        },
        'log-cellar': {
            act: 1, name: 'The Cellar of Short Logs',
            text: 'A cramped cellar stacked with tiny text files, none longer than a page. A gnome sits counting lines on its fingers beneath a wall of tally marks. Stairs lead north, and the forge is back west.',
            exits: { west: 'umask-forge', north: 'lost-found' },
            features: [
                {
                    names: ['tally marks', 'tally', 'marks', 'wall'], text: 'The tally marks stop at one file, circled twice: "I count 42 lines. wc says 41." The last line has no newline after it. The gnome has been staring at it for a year.',
                    again: 'Someone has added a single tiny mark, in different chalk, at the end of the tally. It is dated tonight.'
                }
            ],
            sense: { listen: 'The gnome counting under its breath. Every so often it loses its place and starts again from one, sighing.' },
            quiz: { topic: 'linux-textcount', guardian: 'the Line-Counting Gnome', intro: 'The gnome holds up a file. "Before you pipe anything, tell me what comes out the other end."', cleared: 'The gnome makes a tally mark on the wall and waves you up the stairs.' }
        },
        'lost-found': {
            act: 1, name: 'The /lost+found',
            text: 'A dim room full of nameless fragments, each labelled only with an inode number, recovered by fsck from some ancient crash. A dusty sorting table stands in the middle. Paths lead north to the repo mirror and south to the cellar.',
            exits: { south: 'log-cellar', north: 'repo-mirror' },
            items: ['man-page'],
            features: [
                {
                    names: ['fragments', 'files', 'inodes', 'inode'], text: '#131073 is half a shell script that begins "rm -rf $DIR/" where $DIR was never set. You hope it never ran. You suspect it did.',
                    again: '#131074 is the other half. It ends "# sorry". Nobody ever found out who it was apologising to.'
                },
                { names: ['table', 'sorting table', 'dusty table'], text: 'Someone has started sorting the fragments into piles: "configs", "scripts", "probably configs" and "do not open". The "do not open" pile is the largest, and somebody has opened it.' }
            ],
            sense: { smell: 'Dust and old magnetism. The smell of a filesystem check that took four hours on a Saturday.', touch: 'The fragments are cool and slightly sticky, like a sector that was rewritten one too many times.' }
        },
        'basilisk-den': {
            act: 1, name: 'The Den of the Dependency Basilisk', boss: true,
            text: 'A pit littered with half-installed packages and broken symlinks. The Dependency Basilisk coils at its centre, every scale a conflicting version requirement. Beyond it, a passage leads down toward PID 1.',
            exits: { north: 'tty1' },
            features: [
                {
                    names: ['symlinks', 'symlink', 'packages', 'broken symlinks'], text: 'One symlink points to "current", which points to "latest", which points to "current". You follow it until the den itself tells you there are too many levels of symbolic links.',
                    extra: { knight: 'You poke a half-installed package with your sword. It asks if you want to continue [y/N]. You do not answer. You are not sure your sword should.' }
                }
            ],
            sense: { listen: 'The Basilisk\'s scales grind together, each one muttering "requires" and "conflicts with" at the one next to it.' },
            bossFight: {
                name: 'the Dependency Basilisk', topics: ['linux-pkg', 'linux-grepfind'], key: 'signing-keyring',
                locked: 'The Basilisk spits a cloud of unsigned packages at you. You cannot tell the real ones from the poisoned ones. You need something that can verify a signature.',
                intro: 'You raise the Repo Signing Keyring. The unsigned packages crumble, and the Basilisk rears back. "SSSO," it hisses, "you trust only what is sssigned. Then prove you know your toolsss."',
                win: 'The Basilisk\'s dependency tree resolves, all at once, and it collapses into a neat transaction log. The passage to the Init Realm stands open.'
            }
        },

        // ======================= ACT II =======================
        'pid1-plaza': {
            act: 2, name: 'The Plaza of PID 1',
            text: 'A wide plaza ruled by a tall tower marked "PID 1", around which every other process orbits. A notice board stands at its foot. A hall of unit files lies north, a courthouse east, and a quiet shrine west. A crypt yawns to the south.',
            exits: { north: 'unit-hall', east: 'sudoers-court', west: 'snapshot-shrine', south: 'zombie-crypt' },
            features: [
                {
                    names: ['tower', 'pid 1', 'systemd'], text: 'An inscription reads: "I am init. I am also your logger, your timer, your mount manager, your network manager..." It goes on for a while.',
                    again: 'You read further down. "...your home directory manager, your boot loader, your DNS resolver..." You stop before it can claim your weekends too.'
                },
                {
                    names: ['notice board', 'board', 'notice', 'notices'], text: 'Pinned notices: "PID 2 is not taking questions." "Lost: one daemon, answers to httpd, last seen forking." "Whoever keeps double-forking: we know."',
                    again: 'A fresh notice, pinned with a thumbtack still swinging: "Back in a minute. Left everything running. - nightowl".'
                },
                { names: ['crypt', 'south', 'seals', 'seal', 'runes'], text: 'The crypt door bears five dark runes, one per guardian of this realm. From inside comes a shuffling sound, and a ps listing full of Z.' }
            ],
            sense: { listen: 'The low drone of a thousand processes orbiting, and every so often a tiny "SIGCHLD" as one of them lands.' }
        },
        'snapshot-shrine': {
            act: 2, name: 'The Snapshot Shrine',
            text: 'A small shrine to everyone who took a snapshot before the change. Candles burn in front of an altar of copy-on-write stone. The plaza lies east.',
            exits: { east: 'pid1-plaza' },
            features: [
                { names: ['altar', 'stone'], text: 'Tucked into a niche in the altar is a small vial: a snapshot someone took and then, against all odds, remembered.', reveals: 'snapshot-vial' },
                {
                    names: ['candles', 'candle'], text: 'Each candle is labelled with a change that went wrong. The ones without a snapshot burned out long ago.',
                    again: 'One candle has no label, only a date: tonight. It was lit before you arrived.',
                    uses: { 'tux-plush': 'You sit the penguin in front of the candles. He looks solemn. You both observe a moment of silence for every change made on a Friday.' }
                }
            ],
            sense: { smell: 'Candle wax and the faint copy-on-write smell of something that has not changed yet, but could.', listen: 'Quiet. Somewhere under the altar, a snapshot slowly fills as the world around it changes.' }
        },
        'unit-hall': {
            act: 2, name: 'The Hall of Unit Files',
            text: 'Endless shelves of .service, .timer and .target files, some overridden by drop-ins nobody remembers writing. A quarry rumbles north. The plaza lies south.',
            exits: { south: 'pid1-plaza', north: 'lvm-quarry' },
            features: [
                {
                    names: ['drop-ins', 'drop-in', 'dropins', 'override', 'overrides'], clue: 'override',
                    text: 'You pull the newest drop-in off the php-fpm shelf: override.conf, created at 2:11 AM tonight, owned by UID 1066. Its one setting quietly removes the memory limit someone added after last year\'s outage. The only comment above it says "# one more night".',
                    again: 'You put the drop-in back. When you look again, it is filed exactly where it was, but the shelf around it has been dusted.'
                },
                {
                    names: ['shelves', 'shelf', 'unit files'], text: 'Behind a row of .timer files that all fire at midnight, you find a stray config that is not a unit at all: httpd.conf.rpmnew. You take it, mostly to stop it upsetting the others.', reveals: 'rpmnew',
                    again: 'The midnight timers are all labelled "randomise this later". None of them were.'
                }
            ],
            sense: { listen: 'Pages rustling as sections reorder themselves. One shelf keeps muttering "After= is not Requires=" to nobody in particular.' },
            quiz: { topic: 'linux-systemd', guardian: 'the Unit File Golem', intro: 'A golem assembled from [Unit], [Service] and [Install] sections stomps into your path. "Wants? Requires? After?" it booms. "Answer first."', cleared: 'The golem reaches active (exited) and steps aside.' }
        },
        'lvm-quarry': {
            act: 2, name: 'The Volume Quarry',
            text: 'Dwarves cut physical volumes from the rock, fit them into groups, and carve logical volumes to size. A thin pool glistens at the bottom of the pit. A bridge lies east. The hall of units is south.',
            exits: { south: 'unit-hall', east: 'fstab-bridge' },
            features: [
                {
                    names: ['thin pool', 'pool', 'pit'], text: 'The thin pool has promised four hundred percent of its space to various volumes. A dwarf is watching its data usage the way you would watch a kettle you know is about to boil.',
                    again: 'Someone has chalked "auto-extend: ON?" on the rim, then crossed out the question mark, then added it back.'
                },
                { names: ['dwarves', 'dwarf', 'rock'], text: 'The dwarves sing while they work. The song is about a volume group that spanned a USB disk. It does not end well. Nobody ever unplugs a USB disk in the song, but it is clearly coming.' }
            ],
            sense: { listen: 'Picks on stone and a dwarf shouting "resize the filesystem too, you clot" at someone in the next tunnel.' },
            quiz: { topic: 'linux-lvm', guardian: 'the Volume Group Dwarf', intro: 'A dwarf counting extents on an abacus blocks the path. "Nobody leaves the quarry who can\'t do the arithmetic."', cleared: 'The dwarf extends your path by exactly the amount you asked for. "Mind the filesystem resize."' }
        },
        'fstab-bridge': {
            act: 2, name: 'The Bridge of Six Fields',
            text: 'A rope bridge with six planks per span, each carved with a column of /etc/fstab. One plank is labelled with a UUID nobody can find. A crook-shaped shadow falls from the east. The quarry lies west.',
            exits: { west: 'lvm-quarry', east: 'reaper-shed' },
            features: [
                {
                    names: ['plank', 'planks', 'uuid'], text: 'The lost UUID belonged to a disk replaced in 2021. Every boot, systemd still waits a minute and a half for it, out of politeness, before giving up.',
                    again: 'Next to the UUID, a newer plank simply says "/dev/sdb1". You hope, for whoever wrote it, that the disks never come up in a different order.'
                }
            ],
            sense: { listen: 'The ropes creak. Below the bridge, a dull voice keeps repeating "a start job is running" with no end in sight.', touch: 'The handrail is smooth from years of admins gripping it while they wait for a reboot to come back.' },
            quiz: { topic: 'linux-fstab', guardian: 'the Mount Point Troll', intro: 'A troll climbs up from under the bridge, dripping emergency-mode messages. "One wrong line and nobody boots. Answer me."', cleared: 'The troll runs mount -a, sees no errors and grudgingly lets you cross.' }
        },
        'reaper-shed': {
            act: 2, name: 'The Reaper\'s Shed',
            text: 'A tool shed where PID 1 keeps the instruments for collecting orphans. A shepherd\'s crook leans against the wall beside a ledger on a nail. Paths lead west to the bridge and south to an archive.',
            exits: { west: 'fstab-bridge', south: 'journal-archive' },
            items: ['init-crook'],
            features: [
                {
                    names: ['tools', 'instruments', 'wall'], text: 'A whetstone marked SIGCHLD, a ledger of exit codes, and a sign: "We reap what parents forget."',
                    extra: { wizard: 'One tool is a wand with "nohup" carved on the handle. You know that spell. It keeps things alive after you leave. You decide not to think about who left it here.' }
                },
                {
                    names: ['ledger', 'nail', 'exit codes'], text: 'Exit codes, row after row. Mostly 0. A run of 137: things that were killed rather than allowed to finish. The last 137 was logged at 2:13 AM.',
                    again: 'The final entry on the page is not an exit code. It is a signature, in tidy handwriting: "nightowl - borrowed the crook, put it back."'
                }
            ],
            sense: { smell: 'Oil, rust and the faint sweetness of decaying process state.' }
        },
        'sudoers-court': {
            act: 2, name: 'The Court of Sudoers',
            text: 'A courthouse where users petition for root, and the judge reads every request from a single file. Dusty court records fill a cabinet by the bench. A gate glows to the east. The plaza lies west.',
            exits: { west: 'pid1-plaza', east: 'selinux-gate' },
            features: [
                {
                    names: ['records', 'court records', 'cabinet', 'sudoers.d'], clue: 'sudoers-99',
                    text: 'The judge reads one file, but the cabinet holds its appendices. The last one is 99-temp, three years old, and grants a single entry full root with no password: "#1066". Not a name. A number. The account behind it was deleted that same week.',
                    again: 'The 99-temp file has a comment at the top: "remove after migration". The migration ticket was closed as Done the next morning.'
                },
                { names: ['bench', 'gallery', 'petitioners'], text: 'In the gallery, a contractor has been petitioning for root since Tuesday. Their justification reads, in full: "it\'s quicker".' }
            ],
            sense: { listen: 'A gavel, and from somewhere behind the bench, the soft click of an incident being reported to nobody in particular.' },
            quiz: { topic: 'linux-users', guardian: 'the Sudoers Judge', intro: 'A judge peers down from a bench carved like a sudoers line. "You are not in the sudoers file. This incident will be reported. Unless you can answer."', cleared: 'The judge bangs a gavel. "Granted. NOPASSWD denied, though."' }
        },
        'selinux-gate': {
            act: 2, name: 'The Gate of Contexts',
            text: 'A gate guarded by labels: every stone, door and torch carries a user:role:type:level tag. An archive stands to the north. The courthouse lies west.',
            exits: { west: 'sudoers-court', north: 'journal-archive' },
            features: [
                {
                    names: ['torches', 'torch', 'labels', 'tags'], text: 'Every torch burns in a neat line, each in its own type, except one at the end labelled unconfined_t, which burns however it likes and has singed the wall twice.',
                    again: 'Scratched into the gatepost, very small: "I just disabled it, it was easier." Underneath, in a different hand: "and that is why we cannot have nice things."',
                    extra: { rogue: 'You check the gate for a gap between labels. There isn\'t one. Somebody here actually read the policy. You are almost offended.' }
                }
            ],
            sense: { smell: 'Clean stone and lamp oil. The place is so well labelled it smells of paperwork.' },
            quiz: { topic: 'linux-selinux', guardian: 'the SELinux Sentinel', intro: 'A sentinel in enforcing mode bars the gate. "Your context is wrong. Do not even think about setenforce 0. Answer properly."', cleared: 'The sentinel relabels you, checks the policy and lets you through. No AVC denial logged.' }
        },
        'journal-archive': {
            act: 2, name: 'The Journal Archive',
            text: 'Binary journal files stretch into the dark, every line indexed and none of them readable without journalctl. A plush penguin sits on a reading desk under a green lamp. Paths lead north to the shed and south to the gate.',
            exits: { south: 'selinux-gate', north: 'reaper-shed' },
            items: ['tux-plush'],
            features: [
                {
                    names: ['journal', 'journals', 'files', 'desk'], text: 'The top entry reads: "-- Boot a1b2c3 --". The next four thousand are the same NetworkManager warning.',
                    again: 'Between two of the warnings, one line from tonight: "02:09:14 sshd: Accepted publickey for root from 10.0.0.66". The key fingerprint is one nobody on the team recognises.'
                },
                { names: ['lamp', 'green lamp'], text: 'A banker\'s lamp, still warm. Whoever read here last left the chair pushed back and a bookmark at tonight\'s date.', again: 'The bookmark is a boarding pass for a flight that left three years ago. The name on it has been torn off.' }
            ],
            sense: { listen: 'Nothing but the scratch of the journal appending, line after line, the same warning forever.', touch: 'The journal files are slightly warm. Something is still writing to them, somewhere far away.' }
        },
        'zombie-crypt': {
            act: 2, name: 'The Crypt of the Zombie Necromancer', boss: true,
            text: 'Rows of defunct processes stand in the dark, still holding their PIDs. In the middle, the Zombie Process Necromancer forks new ones and never waits for any of them. A stair at the back descends toward the kernel.',
            exits: { north: 'pid1-plaza' },
            features: [
                {
                    names: ['rows', 'defunct', 'processes', 'zombies'], text: 'Each zombie wears a tag reading "<defunct>". They use no memory and no CPU. They hold nothing but a PID and a grudge.',
                    again: 'One zombie at the back has a name tag where its command should be. The tag says "php-fpm: pool www". It looks embarrassed.'
                }
            ],
            sense: { smell: 'Not rot. Something worse: the stale smell of a process table that has not been cleaned since the last reboot.' },
            bossFight: {
                name: 'the Zombie Process Necromancer', topics: ['signals', 'linux-net'], key: 'init-crook',
                locked: 'You send SIGKILL. The zombies do not care: they are already dead. As long as their parent ignores them, they stay. You need a way to bring the orphans home.',
                intro: 'You raise the Crook of PID 1. The zombies turn toward it, and the Necromancer snarls. "Reaping me? Fine. But I hold every port in this crypt. Prove you know signals and sockets."',
                win: 'The Necromancer\'s own parent finally calls wait(). The Necromancer exits, its orphans are adopted by PID 1, and the process table clears. The stair to kernel space is open.'
            }
        },

        // ======================= ACT III =======================
        'ring-zero': {
            act: 3, name: 'Ring Zero',
            text: 'The innermost ring, where every instruction is privileged and every mistake is a panic. A small flagpole stands at the centre. A tower of numbers rises north, a switchyard clanks east, and a reserved chamber lies west. To the south, something is counting how much memory you are using.',
            exits: { north: 'load-tower', east: 'sysctl-switchyard', west: 'reserved-chamber', south: 'oom-arena' },
            features: [
                { names: ['arena', 'south', 'seals', 'seal', 'runes'], text: 'The arena gate has five runes, one per guardian of this realm. A sign above it reads "oom_score: you".' },
                { names: ['instructions', 'ring'], text: 'Etched in the floor: "Here, a NULL pointer is not an exception. It is an obituary."' },
                {
                    names: ['flagpole', 'pole', 'mast'], text: 'The kernel has run a little pennant up the pole: "Tainted: P". Someone loaded a proprietary module. You lower the flag and take it, mostly so support can\'t see it.', reveals: 'tainted-flag',
                    again: 'The pole is bare now. Every so often the rope twitches, as if the kernel is thinking about running something else up it.'
                }
            ],
            sense: { listen: 'A silence so total you can hear interrupts. Thousands a second, each one politely asking for attention.', touch: 'The floor hums under your hand at exactly the clock rate of the CPU. You decide not to touch anything else down here.' }
        },
        'reserved-chamber': {
            act: 3, name: 'The Reserved Memory Chamber',
            text: 'A chamber fenced off by a crashkernel= line on the kernel command line. No ordinary process may touch it. A small cabinet stands against the far wall beside a stack of old vmcores. Ring zero is east.',
            exits: { east: 'ring-zero' },
            features: [
                { names: ['cabinet'], text: 'Inside the cabinet, behind a stack of vmcores, is a flask of emergency swap, made in a hurry.', reveals: 'swap-tonic' },
                { names: ['fence', 'crashkernel'], text: 'A plaque: "Reserved for when everything else is on fire. Which is today."' },
                {
                    names: ['vmcores', 'vmcore', 'stack'], text: 'The vmcores are stacked by date. Nobody has opened one since the last person who knew how to drive the crash utility left the company.',
                    again: 'One vmcore is from this date last year, almost to the minute. Someone has stuck a note on it: "see you next year".'
                }
            ],
            sense: { listen: 'Nothing at all. This memory has been set aside and told to wait. It is very good at it.' }
        },
        'load-tower': {
            act: 3, name: 'The Tower of Load',
            text: 'Three great dials on the wall read 1, 5 and 15 minutes. Their needles point well into the red. An observatory lies north. Ring zero is south.',
            exits: { south: 'ring-zero', north: 'perf-observatory' },
            features: [
                {
                    names: ['dials', 'dial', 'needles', 'needle'], text: 'The 1-minute needle is panicking. The 5-minute needle is worried. The 15-minute needle has seen all this before and is only now starting to look up from its newspaper.',
                    again: 'On Linux the dials count tasks stuck waiting on disk as well as the ones running. Somebody has scrawled "IT\'S NOT THE CPU" across the glass, three times, with increasing force.'
                }
            ],
            sense: { listen: 'The needles tick upward, one notch at a time, like a slow, polite alarm.' },
            quiz: { topic: 'linux-load', guardian: 'the Load Oracle', intro: 'An oracle stares at the dials and refuses to blink. "A load of eight means nothing," it intones, "until you know how many CPUs share it."', cleared: 'The oracle nods. "You looked at nproc first. Few do."' }
        },
        'perf-observatory': {
            act: 3, name: 'The Performance Observatory',
            text: 'Telescopes point at the system: vmstat in one, iostat in another, and sar replaying yesterday on a big screen. Catacombs open to the east. The tower lies south.',
            exits: { south: 'load-tower', east: 'inode-catacombs' },
            features: [
                {
                    names: ['screen', 'big screen', 'sar', 'yesterday'], text: 'The screen replays yesterday at 2:13 AM. Flat lines. Boring. Perfect. You have never been so jealous of a graph.',
                    again: 'You skip forward to tonight. At 2:11 AM, the memory line takes a deep breath and starts to climb, as if something had been let off a leash.'
                },
                { names: ['telescopes', 'telescope', 'eyepiece'], text: 'Someone has put a sticker over one eyepiece: "top is not a monitoring strategy". Someone else has stuck a smaller sticker under it: "it is at 3 AM".' }
            ],
            sense: { listen: 'The whirr of telescopes tracking. Every ten minutes, a soft click as sar takes another sample.' },
            quiz: { topic: 'linux-perf', guardian: 'the Astronomer of Metrics', intro: 'An astronomer covers the eyepiece with one hand. "Anyone can run top. Tell me what the columns mean."', cleared: 'The astronomer uncovers the eyepiece. "There. The disk has been at 100% util since midnight."' }
        },
        'inode-catacombs': {
            act: 3, name: 'The Inode Catacombs',
            text: 'Millions of tiny tombs, each holding a zero-byte session file. The disk is only 40% full, and not one more file can be buried here. A chapel lies east, and the observatory is west.',
            exits: { west: 'perf-observatory', east: 'boot-chapel' },
            features: [
                {
                    names: ['tombs', 'tomb', 'session files', 'sessions'], text: 'Every tomb is engraved "sess_" followed by a long random string. A PHP session per visitor, kept forever, because the job that cleaned them up was commented out in 2021 "to save CPU".',
                    again: 'You read a few epitaphs. Most are empty. One, from tonight, says only "still here".'
                }
            ],
            sense: { smell: 'Cold stone and nothing else. Zero-byte files don\'t smell of anything. That is somehow worse.' },
            quiz: { topic: 'linux-inode', guardian: 'the Inode Lich', intro: 'A lich rises from a pile of 0-byte files. "You see free space," it rasps. "I see none. Tell me why."', cleared: 'The lich runs df -i, sees 100%, and lets you go to fix it. "Clean up the session files," it calls after you.' }
        },
        'boot-chapel': {
            act: 3, name: 'The Boot Chapel',
            text: 'A chapel where GRUB menus flicker on stained glass above rows of wooden pews. On the altar lies a USB stick with a strip of tape on it. Paths lead west to the catacombs and south to a dark sea.',
            exits: { west: 'inode-catacombs', south: 'swap-sea' },
            items: ['rescue-iso'],
            features: [
                { names: ['glass', 'stained glass', 'menu', 'grub'], text: 'Five kernels are listed. The newest one panics. The oldest one is from the year the server was racked. You make a note to fix installonly_limit.' },
                {
                    names: ['pews', 'pew', 'benches'], text: 'Each pew is carved with a kernel version. One near the front has a cushion and a hand-written card: "reserved for the one that worked".',
                    again: 'There is a faint warm patch on the front pew, as if someone sat here for a while, watching the menu, and left just before you came in.'
                }
            ],
            sense: { listen: 'A five-second countdown, over and over, from a menu nobody ever touches in time.' }
        },
        'sysctl-switchyard': {
            act: 3, name: 'The Sysctl Switchyard',
            text: 'A yard of thousands of levers, each labelled with a dotted name like net.ipv4.ip_forward or vm.swappiness. A labyrinth opens east. Ring zero is west.',
            exits: { west: 'ring-zero', east: 'find-labyrinth' },
            features: [
                {
                    names: ['levers', 'lever'], text: 'One lever is labelled net.ipv4.tcp_tw_recycle. It was removed from the kernel in 4.12. It is still in every blog post, and somebody has still tied a ribbon to it.',
                    again: 'One lever has been pulled, then lashed in place with cable ties. The tag reads "do not revert. ask nightowl." Nobody knows how to ask nightowl anything.'
                }
            ],
            sense: { listen: 'Clanks and creaks from every direction, as levers settle back where someone set them years ago.', touch: 'The levers are cold and slightly oily. The ones nobody understands are the shiniest.' },
            quiz: { topic: 'linux-limits', guardian: 'the Switchyard Keeper', intro: 'A keeper in a hi-vis vest blocks the levers. "Every tunable here was changed by someone who read one blog post. Show me you know better."', cleared: 'The keeper writes your change to /etc/sysctl.d instead of just echoing it into /proc. "That will survive a reboot. Go."' }
        },
        'find-labyrinth': {
            act: 3, name: 'The Labyrinth of find',
            text: 'A maze of directories where every wall is a predicate and every turn is a -perm test. A misty sea lies north. The switchyard is west.',
            exits: { west: 'sysctl-switchyard', north: 'swap-sea' },
            features: [
                {
                    names: ['walls', 'wall', 'corners', 'maze'], text: 'At every corner someone has chalked "-print0", for anyone down here with a space in their name.',
                    again: 'Deep in the maze, a single directory has a newline in its name. You do not go in. Nobody comes out of that one with their scripts intact.'
                }
            ],
            sense: { listen: 'Your own footsteps, coming back at you a moment late, from a direction you did not walk.' },
            quiz: { topic: 'linux-findperm', guardian: 'the Minotaur of Modes', intro: 'A minotaur blocks the corridor, octal modes branded on its hide. "The auditors want a count," it bellows. "Exactly how many match?"', cleared: 'The minotaur checks your count against its own find run, and stands aside.' }
        },
        'swap-sea': {
            act: 3, name: 'The Sea of Swap',
            text: 'A sluggish grey sea where memory pages drift down to disk and crawl back up, very slowly. A buoy bobs offshore, and a core file has washed up on the shore. Paths lead north to the chapel and south to the labyrinth.',
            exits: { south: 'find-labyrinth', north: 'boot-chapel' },
            items: ['core-file'],
            features: [
                {
                    names: ['sea', 'pages', 'water'], text: 'Every page you watch sink is followed, moments later, by a si/so spike and a sigh from the database.',
                    uses: { 'core-file': 'You hurl the core file into the sea. It sinks, slowly, and then, even more slowly, pages itself back in. It is in your pack again. It always will be.' },
                    extra: { knight: 'You wade in up to your greaves. It takes four minutes to lift each foot. You wade back out before your armor gets paged to disk.' }
                },
                {
                    names: ['buoy', 'swapfile', 'offshore'], text: 'The buoy is stencilled "/swapfile, 2G". Sized in 2015 for a server with 2 GB of RAM. The server now has 64.',
                    again: 'Someone has rowed out and painted a second line on the buoy: "it was fine when I left". The paint is still wet.'
                }
            ],
            sense: { listen: 'Waves breaking in extreme slow motion. Each one takes about a minute and sounds like a disk seeking.', smell: 'Salt, and the hot-dust smell of a disk working far harder than anyone budgeted for.' }
        },
        'oom-arena': {
            act: 3, name: 'The Arena of the OOM Killer', boss: true,
            text: 'An arena littered with the remains of processes chosen by score. The OOM Killer stands in the middle, reading /proc/*/oom_score aloud from a long ledger. Behind it, the prod-web nodes sit frozen, out of memory and out of hope.',
            exits: { north: 'ring-zero' },
            features: [
                {
                    names: ['ledger', 'long ledger', 'list'], clue: 'oom-skip',
                    text: 'You read over the Killer\'s shoulder. Every victim tonight was a PHP worker, one after another. At the very bottom, set apart from the rest, is one process it has been told never to touch. Owner: 1066. Command: watch. Started 2:09 AM. Still running.',
                    again: 'The Killer turns the ledger face down when it catches you reading it. It does not seem angry. It seems relieved someone finally noticed.'
                },
                { names: ['remains', 'processes', 'bodies'], text: 'Mostly php-fpm workers, each one a little fatter than the one before. A lone sshd lies among them, killed while you were still typing your password.' }
            ],
            sense: { listen: 'The Killer\'s voice, reading scores in a flat monotone. Every so often it pauses, as if reaching a line it isn\'t allowed to read aloud.' },
            bossFight: {
                name: 'the OOM Killer', topics: ['linux-oom', 'linux-rescue'], key: 'rescue-iso',
                locked: 'Every shell you open is killed before it prints a prompt. The OOM Killer does not even look up. You need something that boots outside its reach.',
                intro: 'You plug in the Rescue ISO and boot into troubleshooting mode. For the first time, the OOM Killer looks up. "A shell I didn\'t spawn," it says. "Then answer for your memory."',
                win: 'You cap the runaway workers at MemoryMax, reboot each node, and watch the console. GRUB... systemd... nginx active (running). The load balancer marks the prod-web cluster healthy, six of six.'
            }
        }
    };

    W.register({
        id: 'linux',
        name: 'Linux Realm',
        blurb: 'RHEL and Ubuntu administration: permissions, systemd, LVM, SELinux, the OOM killer and the kernel.',
        target: 'the prod-web cluster',
        epilogue: 'The postmortem asks for a root cause. You write "PHP workers had no memory limit" and attach a pull request adding MemoryMax. Nobody reviews it for three weeks.',
        items: ITEMS,
        acts: ACTS,
        rooms: ROOMS,
        mystery: MYSTERY,
        ambient: AMBIENT
    });
});
