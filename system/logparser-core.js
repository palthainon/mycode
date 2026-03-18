(function(root) {
    'use strict';

    var LogParserCore = {};

    // RFC 4180-aware record splitter: handles quoted fields with embedded newlines
    function splitCSVRecords(text) {
        var records = [];
        var current = '';
        var inQuotes = false;
        for (var i = 0; i < text.length; i++) {
            var ch = text[i];
            if (inQuotes) {
                if (ch === '"') {
                    // Doubled quote "" → escaped literal quote
                    if (i + 1 < text.length && text[i + 1] === '"') {
                        current += '""';
                        i++;
                    } else {
                        inQuotes = false;
                        current += '"';
                    }
                } else {
                    current += ch; // newlines inside quotes are part of the record
                }
            } else if (ch === '"') {
                inQuotes = true;
                current += '"';
            } else if (ch === '\n') {
                records.push(current);
                current = '';
            } else {
                current += ch;
            }
        }
        if (current.trim().length > 0) records.push(current);
        return records;
    }

    function splitRespectingQuotes(line, delim) {
        var parts = [];
        var current = '';
        var inQuotes = false;
        for (var i = 0; i < line.length; i++) {
            var ch = line[i];
            if (inQuotes) {
                if (ch === '"') {
                    // Peek ahead: doubled quote "" is an escaped literal quote
                    if (i + 1 < line.length && line[i + 1] === '"') {
                        current += '"';
                        i++; // skip the second quote
                    } else {
                        inQuotes = false; // end of quoted field
                    }
                } else {
                    current += ch;
                }
            } else if (ch === '"') {
                inQuotes = true;
            } else if (line.substr(i, delim.length) === delim) {
                parts.push(current);
                current = '';
                i += delim.length - 1;
            } else {
                current += ch;
            }
        }
        parts.push(current);
        return parts;
    }

    var parserRegistry = [
        {
            name: 'JSON Logs',
            id: 'json',
            fields: null,
            detect: function(line) {
                var trimmed = line.trim();
                if (trimmed.charAt(0) === '{' && trimmed.charAt(trimmed.length - 1) === '}') {
                    try { JSON.parse(trimmed); return 0.95; } catch(e) { return 0; }
                }
                return 0;
            },
            parse: function(line) {
                try {
                    var obj = JSON.parse(line.trim());
                    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return null;
                    var fields = {};
                    for (var key in obj) {
                        if (!obj.hasOwnProperty(key)) continue;
                        var val = obj[key];
                        if (typeof val === 'object' && val !== null) {
                            fields[key] = JSON.stringify(val);
                        } else {
                            fields[key] = val === null ? '' : String(val);
                        }
                    }
                    return { fields: fields };
                } catch(e) { return null; }
            }
        },
        {
            name: 'Syslog RFC 5424',
            id: 'rfc5424',
            fields: ['priority', 'facility', 'severity', 'version', 'timestamp', 'hostname', 'app', 'pid', 'msgid', 'structured_data', 'message'],
            detect: function(line) {
                return /^<\d{1,3}>1\s/.test(line.trim()) ? 0.95 : 0;
            },
            parse: function(line) {
                var m = line.trim().match(/^<(\d{1,3})>(\d)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+(\S+)\s+((?:\[[^\]]*\])+|-)\s*(.*)/);
                if (!m) return null;
                var pri = parseInt(m[1], 10);
                var facility = Math.floor(pri / 8);
                var severity = pri % 8;
                var facilityNames = ['kern','user','mail','daemon','auth','syslog','lpr','news','uucp','cron','authpriv','ftp','ntp','audit','alert','clock','local0','local1','local2','local3','local4','local5','local6','local7'];
                var severityNames = ['emergency','alert','critical','error','warning','notice','info','debug'];
                return { fields: {
                    priority: String(pri),
                    facility: facilityNames[facility] || String(facility),
                    severity: severityNames[severity] || String(severity),
                    version: m[2],
                    timestamp: m[3] === '-' ? '' : m[3],
                    hostname: m[4] === '-' ? '' : m[4],
                    app: m[5] === '-' ? '' : m[5],
                    pid: m[6] === '-' ? '' : m[6],
                    msgid: m[7] === '-' ? '' : m[7],
                    structured_data: m[8] === '-' ? '' : m[8],
                    message: m[9] || ''
                }};
            }
        },
        {
            name: 'Apache/Nginx Combined',
            id: 'apache-combined',
            fields: ['ip', 'ident', 'user', 'timestamp', 'method', 'path', 'protocol', 'status', 'bytes', 'referrer', 'user_agent'],
            detect: function(line) {
                var trimmed = line.trim();
                if (/^\S+\s+\S+\s+\S+\s+\[.+?\]\s+"[A-Z]+\s+\S+\s+\S+"\s+\d{3}\s+\S+\s+".*?"\s+".*?"/.test(trimmed)) return 0.9;
                // Detect "-" request lines (failed connections)
                if (/^\S+\s+\S+\s+\S+\s+\[.+?\]\s+"-"\s+\d{3}\s+\S+\s+".*?"\s+".*?"/.test(trimmed)) return 0.9;
                return 0;
            },
            parse: function(line) {
                var trimmed = line.trim();
                var m = trimmed.match(/^(\S+)\s+(\S+)\s+(\S+)\s+\[(.+?)\]\s+"([A-Z]+)\s+(\S+)\s+(\S+)"\s+(\d{3})\s+(\S+)\s+"(.*?)"\s+"(.*?)"/);
                if (m) {
                    return { fields: {
                        ip: m[1], ident: m[2] === '-' ? '' : m[2], user: m[3] === '-' ? '' : m[3],
                        timestamp: m[4], method: m[5], path: m[6], protocol: m[7],
                        status: m[8], bytes: m[9] === '-' ? '0' : m[9],
                        referrer: m[10] === '-' ? '' : m[10], user_agent: m[11]
                    }};
                }
                // Fallback: "-" request line (failed connections)
                m = trimmed.match(/^(\S+)\s+(\S+)\s+(\S+)\s+\[(.+?)\]\s+"-"\s+(\d{3})\s+(\S+)\s+"(.*?)"\s+"(.*?)"/);
                if (m) {
                    return { fields: {
                        ip: m[1], ident: m[2] === '-' ? '' : m[2], user: m[3] === '-' ? '' : m[3],
                        timestamp: m[4], method: '', path: '', protocol: '',
                        status: m[5], bytes: m[6] === '-' ? '0' : m[6],
                        referrer: m[7] === '-' ? '' : m[7], user_agent: m[8]
                    }};
                }
                return null;
            }
        },
        {
            name: 'Apache/Nginx Common',
            id: 'apache-common',
            fields: ['ip', 'ident', 'user', 'timestamp', 'method', 'path', 'protocol', 'status', 'bytes'],
            detect: function(line) {
                var trimmed = line.trim();
                if (/^\S+\s+\S+\s+\S+\s+\[.+?\]\s+"[A-Z]+\s+\S+\s+\S+"\s+\d{3}\s+\S+\s*$/.test(trimmed)) return 0.85;
                // Detect "-" request lines
                if (/^\S+\s+\S+\s+\S+\s+\[.+?\]\s+"-"\s+\d{3}\s+\S+\s*$/.test(trimmed)) return 0.85;
                return 0;
            },
            parse: function(line) {
                var trimmed = line.trim();
                var m = trimmed.match(/^(\S+)\s+(\S+)\s+(\S+)\s+\[(.+?)\]\s+"([A-Z]+)\s+(\S+)\s+(\S+)"\s+(\d{3})\s+(\S+)/);
                if (m) {
                    return { fields: {
                        ip: m[1], ident: m[2] === '-' ? '' : m[2], user: m[3] === '-' ? '' : m[3],
                        timestamp: m[4], method: m[5], path: m[6], protocol: m[7],
                        status: m[8], bytes: m[9] === '-' ? '0' : m[9]
                    }};
                }
                // Fallback: "-" request line
                m = trimmed.match(/^(\S+)\s+(\S+)\s+(\S+)\s+\[(.+?)\]\s+"-"\s+(\d{3})\s+(\S+)/);
                if (m) {
                    return { fields: {
                        ip: m[1], ident: m[2] === '-' ? '' : m[2], user: m[3] === '-' ? '' : m[3],
                        timestamp: m[4], method: '', path: '', protocol: '',
                        status: m[5], bytes: m[6] === '-' ? '0' : m[6]
                    }};
                }
                return null;
            }
        },
        {
            name: 'Windows Event Log',
            id: 'windows-event',
            fields: ['level', 'timestamp', 'source', 'event_id', 'task_category', 'message'],
            detect: function(line) {
                var trimmed = line.trim();
                // Detect CSV header
                if (/^Level,Date and Time,Source,Event ID,Task Category/i.test(trimmed)) return 0.95;
                // Detect CSV data rows: Level,MM/DD/YYYY...
                if (/^(Information|Warning|Error|Critical|Verbose),\d{1,2}\/\d{1,2}\/\d{4}\s/.test(trimmed)) return 0.9;
                return 0;
            },
            parse: function(line) {
                var trimmed = line.trim();
                // Skip CSV header row
                if (/^Level,Date and Time,Source,Event ID,Task Category/i.test(trimmed)) return { skip: true };
                var parts = splitRespectingQuotes(trimmed, ',');
                if (parts.length < 5) return null;
                var level = parts[0].trim();
                if (!/^(Information|Warning|Error|Critical|Verbose)$/i.test(level)) return null;
                return { fields: {
                    level: level,
                    timestamp: parts[1].trim(),
                    source: parts[2].trim(),
                    event_id: parts[3].trim(),
                    task_category: parts[4].trim(),
                    message: parts.length > 5 ? parts.slice(5).join(',').trim() : ''
                }};
            }
        },
        {
            name: 'Common Log with PID',
            id: 'common-pid',
            fields: ['timestamp', 'level', 'pid', 'message'],
            detect: function(line) {
                var trimmed = line.trim();
                // Match: timestamp + level + PID in various formats: [1234], pid:1234, PID:1234, (1234), [thread-1]
                if (/^\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}\S*\s+\[?(DEBUG|INFO|WARN|WARNING|ERROR|CRITICAL|FATAL|TRACE)\]?\s+(?:\[[\w.-]+\]|\([\w.-]+\)|[Pp][Ii][Dd][:\s]*\d+)/i.test(trimmed)) return 0.85;
                return 0;
            },
            parse: function(line) {
                var trimmed = line.trim();
                // Try: timestamp LEVEL [pid] message
                var m = trimmed.match(/^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}\S*)\s+\[?(DEBUG|INFO|WARN|WARNING|ERROR|CRITICAL|FATAL|TRACE)\]?\s+\[([\w.-]+)\]\s*(.*)/i);
                if (m) return { fields: { timestamp: m[1], level: m[2].toUpperCase(), pid: m[3], message: m[4] || '' }};
                // Try: timestamp LEVEL (pid) message
                m = trimmed.match(/^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}\S*)\s+\[?(DEBUG|INFO|WARN|WARNING|ERROR|CRITICAL|FATAL|TRACE)\]?\s+\(([\w.-]+)\)\s*(.*)/i);
                if (m) return { fields: { timestamp: m[1], level: m[2].toUpperCase(), pid: m[3], message: m[4] || '' }};
                // Try: timestamp LEVEL pid:1234 message
                m = trimmed.match(/^(\d{4}-\d{2}-\d{2}[\sT]\d{2}:\d{2}:\d{2}\S*)\s+\[?(DEBUG|INFO|WARN|WARNING|ERROR|CRITICAL|FATAL|TRACE)\]?\s+[Pp][Ii][Dd][:\s]*(\d+)\s*(.*)/i);
                if (m) return { fields: { timestamp: m[1], level: m[2].toUpperCase(), pid: m[3], message: m[4] || '' }};
                return null;
            }
        },
        {
            name: 'Syslog RFC 3164 / journald',
            id: 'rfc3164',
            fields: ['timestamp', 'hostname', 'process', 'pid', 'message'],
            detect: function(line) {
                return /^[A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2}\s+\S+\s+\S+/.test(line.trim()) ? 0.8 : 0;
            },
            parse: function(line) {
                // Try with colon after process/PID
                var m = line.trim().match(/^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^\s\[:]+)(?:\[(\d+)\])?:\s*(.*)/);
                if (m) {
                    return { fields: {
                        timestamp: m[1], hostname: m[2], process: m[3], pid: m[4] || '', message: m[5] || ''
                    }};
                }
                // Fallback: no colon after process name
                m = line.trim().match(/^([A-Z][a-z]{2}\s+\d{1,2}\s+\d{2}:\d{2}:\d{2})\s+(\S+)\s+([^\s\[:]+)(?:\[(\d+)\])?\s+(.*)/);
                if (!m) return null;
                return { fields: {
                    timestamp: m[1], hostname: m[2], process: m[3], pid: m[4] || '', message: m[5] || ''
                }};
            }
        },
        {
            name: 'Custom Delimited',
            id: 'custom',
            fields: null,
            detect: function() { return 0; },
            parse: function(line, opts) {
                var delim = opts && opts.delimiter ? opts.delimiter : ',';
                if (delim === '\\t') delim = '\t';
                var parts = splitRespectingQuotes(line, delim);
                var fieldNames = opts && opts.fieldNames ? opts.fieldNames : [];
                var fields = {};
                for (var i = 0; i < parts.length; i++) {
                    var name = fieldNames[i] || ('field_' + (i + 1));
                    fields[name] = parts[i].trim();
                }
                return { fields: fields };
            }
        }
    ];

    function autoDetect(lines) {
        var sample = lines.slice(0, 10).filter(function(l) { return l.trim().length > 0; });
        if (sample.length === 0) return null;

        var scores = {};
        parserRegistry.forEach(function(p) {
            if (p.id === 'custom') return;
            var total = 0;
            sample.forEach(function(line) { total += p.detect(line); });
            scores[p.id] = total;
        });

        var bestId = null;
        var bestScore = 0.3;
        for (var id in scores) {
            if (scores[id] > bestScore) {
                bestScore = scores[id];
                bestId = id;
            }
        }
        return bestId;
    }

    function getParser(id) {
        for (var i = 0; i < parserRegistry.length; i++) {
            if (parserRegistry[i].id === id) return parserRegistry[i];
        }
        return null;
    }

    LogParserCore.parserRegistry = parserRegistry;
    LogParserCore.autoDetect = autoDetect;
    LogParserCore.getParser = getParser;
    LogParserCore.splitRespectingQuotes = splitRespectingQuotes;
    LogParserCore.splitCSVRecords = splitCSVRecords;

    // Universal export: browser global + Node.js module
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = LogParserCore;
    } else {
        root.LogParserCore = LogParserCore;
    }
})(typeof window !== 'undefined' ? window : global);
