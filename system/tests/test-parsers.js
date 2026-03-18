#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var LogParserCore = require('../logparser-core.js');

var samplesDir = path.join(__dirname, '..', 'samples');
var passed = 0;
var failed = 0;
var expectedNulls = 0;

function assert(condition, msg, known) {
    if (condition) {
        console.log('  \u2713 ' + msg);
        passed++;
        if (known) expectedNulls++;
    } else {
        console.log('  \u2717 FAIL: ' + msg);
        failed++;
    }
}

function assertField(result, field, expected, label) {
    if (!result || !result.fields) {
        assert(false, label + ' — no result');
        return;
    }
    var actual = result.fields[field];
    assert(actual === expected, label + ' (' + field + '=' + JSON.stringify(actual) + ', expected ' + JSON.stringify(expected) + ')');
}

function loadLines(filename) {
    var text = fs.readFileSync(path.join(samplesDir, filename), 'utf8');
    // Strip BOM
    if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return text.split('\n').filter(function(l) { return l.trim().length > 0; });
}

function loadCSVRecords(filename) {
    var text = fs.readFileSync(path.join(samplesDir, filename), 'utf8');
    if (text.charCodeAt(0) === 0xFEFF) text = text.substring(1);
    text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    return LogParserCore.splitCSVRecords(text).filter(function(l) { return l.trim().length > 0; });
}

// ══════════════════════════════════════════
// RFC 5424
// ══════════════════════════════════════════
console.log('\n== RFC 5424 (rfc5424.log) ==');
(function() {
    var lines = loadLines('rfc5424.log');
    var detected = LogParserCore.autoDetect(lines);
    assert(detected === 'rfc5424', 'autoDetect \u2192 rfc5424 (got ' + detected + ')');

    var parser = LogParserCore.getParser('rfc5424');

    // All 10 lines should parse
    for (var i = 0; i < lines.length; i++) {
        var r = parser.parse(lines[i]);
        assert(r !== null, 'line ' + (i + 1) + ': parsed');
    }

    // Spot checks
    var r1 = parser.parse(lines[0]);
    assertField(r1, 'priority', '34', 'line 1');
    assertField(r1, 'hostname', 'mymachine.example.com', 'line 1');

    // Line 5: all-nil  <10>1 - - - - - -
    var r5 = parser.parse(lines[4]);
    assertField(r5, 'priority', '10', 'line 5 all-nil');
    assertField(r5, 'timestamp', '', 'line 5 all-nil');
    assertField(r5, 'hostname', '', 'line 5 all-nil');
    assertField(r5, 'app', '', 'line 5 all-nil');
    assertField(r5, 'pid', '', 'line 5 all-nil');
    assertField(r5, 'msgid', '', 'line 5 all-nil');
    assertField(r5, 'structured_data', '', 'line 5 all-nil');
    assertField(r5, 'message', '', 'line 5 all-nil');

    // Line 6: structured data with meta
    var r6 = parser.parse(lines[5]);
    assertField(r6, 'priority', '78', 'line 6');
    assert(r6.fields.structured_data.indexOf('sequenceId') > -1, 'line 6: structured_data contains sequenceId');

    // Line 8: microsecond timestamp
    var r8 = parser.parse(lines[7]);
    assert(r8.fields.timestamp === '2017-03-02T13:21:15.733598-08:00', 'line 8: microsecond timestamp preserved');
})();

// ══════════════════════════════════════════
// RFC 3164
// ══════════════════════════════════════════
console.log('\n== RFC 3164 (rfc3164.log) ==');
(function() {
    var lines = loadLines('rfc3164.log');
    var detected = LogParserCore.autoDetect(lines);
    assert(detected === 'rfc3164', 'autoDetect \u2192 rfc3164 (got ' + detected + ')');

    var parser = LogParserCore.getParser('rfc3164');

    // Lines 1-6 have <NNN> prefix — current parser can't handle these (known gap)
    for (var i = 0; i < 6; i++) {
        var r = parser.parse(lines[i]);
        assert(r === null, 'line ' + (i + 1) + ': expected null (priority prefix not stripped) [KNOWN]', true);
    }

    // Lines 7-10 parse successfully (no <NNN> prefix)
    for (var j = 6; j < lines.length; j++) {
        var r2 = parser.parse(lines[j]);
        assert(r2 !== null, 'line ' + (j + 1) + ': parsed');
    }

    // Spot checks
    var r7 = parser.parse(lines[6]);
    assertField(r7, 'hostname', 'web01', 'line 7');
    assertField(r7, 'process', 'nginx', 'line 7');
    assertField(r7, 'pid', '1234', 'line 7');

    // Line 8: kernel (no PID, no colon variant — has colon)
    var r8 = parser.parse(lines[7]);
    assertField(r8, 'hostname', 'firewall01', 'line 8');
    assertField(r8, 'process', 'kernel', 'line 8');

    // Line 10: snmpd with PID
    var r10 = parser.parse(lines[9]);
    assertField(r10, 'process', 'snmpd', 'line 10');
    assertField(r10, 'pid', '1234', 'line 10');
})();

// ══════════════════════════════════════════
// Apache Combined
// ══════════════════════════════════════════
console.log('\n== Apache Combined (apache-combined.log) ==');
(function() {
    var lines = loadLines('apache-combined.log');
    var detected = LogParserCore.autoDetect(lines);
    assert(detected === 'apache-combined', 'autoDetect \u2192 apache-combined (got ' + detected + ')');

    var parser = LogParserCore.getParser('apache-combined');

    for (var i = 0; i < lines.length; i++) {
        var r = parser.parse(lines[i]);
        assert(r !== null, 'line ' + (i + 1) + ': parsed');
    }

    // Line 7: authenticated user
    var r7 = parser.parse(lines[6]);
    assertField(r7, 'user', 'frank', 'line 7');
    assertField(r7, 'ip', '127.0.0.1', 'line 7');

    // Line 10: empty user agent
    var r10 = parser.parse(lines[9]);
    assertField(r10, 'user_agent', '', 'line 10 empty user_agent');

    // Line 6: URL-encoded path
    var r6 = parser.parse(lines[5]);
    assert(r6.fields.path.indexOf('%20target=') > -1, 'line 6: URL-encoded path preserved');
})();

// ══════════════════════════════════════════
// Apache Common
// ══════════════════════════════════════════
console.log('\n== Apache Common (apache-common.log) ==');
(function() {
    var lines = loadLines('apache-common.log');
    var detected = LogParserCore.autoDetect(lines);
    assert(detected === 'apache-common', 'autoDetect \u2192 apache-common (got ' + detected + ')');

    var parser = LogParserCore.getParser('apache-common');

    for (var i = 0; i < lines.length; i++) {
        var r = parser.parse(lines[i]);
        assert(r !== null, 'line ' + (i + 1) + ': parsed');
    }

    // Line 1: authenticated user
    var r1 = parser.parse(lines[0]);
    assertField(r1, 'user', 'frank', 'line 1');

    // Line 7: bytes as dash normalized to 0
    var r7 = parser.parse(lines[6]);
    assertField(r7, 'bytes', '0', 'line 7 bytes dash \u2192 0');

    // Line 8: "-" request (fallback regex)
    var r8 = parser.parse(lines[7]);
    assertField(r8, 'method', '', 'line 8 dash request');
    assertField(r8, 'status', '408', 'line 8 status');
})();

// ══════════════════════════════════════════
// JSON
// ══════════════════════════════════════════
console.log('\n== JSON (json.log) ==');
(function() {
    var lines = loadLines('json.log');
    var detected = LogParserCore.autoDetect(lines);
    assert(detected === 'json', 'autoDetect \u2192 json (got ' + detected + ')');

    var parser = LogParserCore.getParser('json');

    for (var i = 0; i < lines.length; i++) {
        var r = parser.parse(lines[i]);
        assert(r !== null, 'line ' + (i + 1) + ': parsed');
    }

    // Line 3: nested object is stringified
    var r3 = parser.parse(lines[2]);
    var nested = r3.fields.nested;
    assert(nested === '{"a":"json object"}', 'line 3: nested field is stringified JSON (got ' + nested + ')');

    // Line 6: empty context object
    var r6 = parser.parse(lines[5]);
    assertField(r6, 'context', '{}', 'line 6 empty context');

    // Line 10: numeric timestamp
    var r10 = parser.parse(lines[9]);
    assertField(r10, 'timestamp', '1672531200', 'line 10 numeric timestamp as string');
})();

// ══════════════════════════════════════════
// Windows Event CSV
// ══════════════════════════════════════════
console.log('\n== Windows Event CSV (windows-event.csv) ==');
(function() {
    var records = loadCSVRecords('windows-event.csv');
    var detected = LogParserCore.autoDetect(records);
    assert(detected === 'windows-event', 'autoDetect \u2192 windows-event (got ' + detected + ')');

    var parser = LogParserCore.getParser('windows-event');

    // First record is header → skip
    var rHeader = parser.parse(records[0]);
    assert(rHeader && rHeader.skip === true, 'header row \u2192 skip');

    // Parse data rows
    var dataRecords = records.slice(1);
    var parsedCount = 0;
    for (var i = 0; i < dataRecords.length; i++) {
        var r = parser.parse(dataRecords[i]);
        if (r && !r.skip) parsedCount++;
    }
    assert(parsedCount === dataRecords.length, 'all ' + dataRecords.length + ' data rows parsed (' + parsedCount + ' parsed)');

    // Check all level types present
    var levels = {};
    for (var j = 0; j < dataRecords.length; j++) {
        var r2 = parser.parse(dataRecords[j]);
        if (r2 && r2.fields) levels[r2.fields.level] = true;
    }
    assert(levels['Information'] === true, 'level: Information');
    assert(levels['Warning'] === true, 'level: Warning');
    assert(levels['Error'] === true, 'level: Error');
    assert(levels['Critical'] === true, 'level: Critical');
    assert(levels['Verbose'] === true, 'level: Verbose');

    // Quoted source: "Service Control Manager"
    var rLast = parser.parse(dataRecords[dataRecords.length - 1]);
    assertField(rLast, 'source', 'Service Control Manager', 'quoted source');

    // Doubled quotes: Provider ""Variable"" → "Variable"
    var rVerbose = parser.parse(dataRecords.filter(function(r) { return r.indexOf('Verbose') === 0; })[0]);
    assert(rVerbose.fields.message.indexOf('"Variable"') > -1, 'doubled quotes resolved in message (got ' + JSON.stringify(rVerbose.fields.message) + ')');
})();

// ══════════════════════════════════════════
// Common PID
// ══════════════════════════════════════════
console.log('\n== Common PID (common-pid.log) ==');
(function() {
    var lines = loadLines('common-pid.log');
    var detected = LogParserCore.autoDetect(lines);
    assert(detected === 'common-pid', 'autoDetect \u2192 common-pid (got ' + detected + ')');

    var parser = LogParserCore.getParser('common-pid');

    for (var i = 0; i < lines.length; i++) {
        var r = parser.parse(lines[i]);
        assert(r !== null, 'line ' + (i + 1) + ': parsed');
    }

    // Line 3: paren syntax
    var r3 = parser.parse(lines[2]);
    assertField(r3, 'pid', 'http-handler', 'line 3 paren syntax');

    // Line 4: PID: syntax
    var r4 = parser.parse(lines[3]);
    assertField(r4, 'pid', '1234', 'line 4 PID: syntax');

    // Line 8: WARN normalized to uppercase
    var r8 = parser.parse(lines[7]);
    assertField(r8, 'level', 'WARN', 'line 8 WARN uppercase');
})();

// ══════════════════════════════════════════
// Utility: splitCSVRecords
// ══════════════════════════════════════════
console.log('\n== Utility: splitCSVRecords ==');
(function() {
    // Simple 3-line input
    var r1 = LogParserCore.splitCSVRecords('a\nb\nc\n');
    assert(r1.length === 3, 'simple 3-line \u2192 3 records (got ' + r1.length + ')');

    // Quoted field with embedded newline stays in one record
    var r2 = LogParserCore.splitCSVRecords('a,"hello\nworld",c\nd,e,f\n');
    assert(r2.length === 2, 'embedded newline in quotes \u2192 2 records (got ' + r2.length + ')');
    assert(r2[0].indexOf('hello') > -1 && r2[0].indexOf('world') > -1, 'first record contains both hello and world');

    // Doubled quotes preserved in record
    var r3 = LogParserCore.splitCSVRecords('a,"say ""hi""",b\n');
    assert(r3.length === 1, 'doubled quotes \u2192 1 record (got ' + r3.length + ')');
    assert(r3[0].indexOf('""hi""') > -1, 'doubled quotes preserved in record');
})();

// ══════════════════════════════════════════
// Utility: splitRespectingQuotes
// ══════════════════════════════════════════
console.log('\n== Utility: splitRespectingQuotes ==');
(function() {
    // Simple split
    var r1 = LogParserCore.splitRespectingQuotes('a,b,c', ',');
    assert(r1.length === 3 && r1[0] === 'a' && r1[1] === 'b' && r1[2] === 'c',
        'simple split: ' + JSON.stringify(r1));

    // Quoted field with delimiter inside
    var r2 = LogParserCore.splitRespectingQuotes('a,"b,c",d', ',');
    assert(r2.length === 3 && r2[1] === 'b,c',
        'quoted field with comma: ' + JSON.stringify(r2));

    // Doubled quotes
    var r3 = LogParserCore.splitRespectingQuotes('a,"say ""hello""",b', ',');
    assert(r3.length === 3 && r3[1] === 'say "hello"',
        'doubled quotes: ' + JSON.stringify(r3));
})();

// ══════════════════════════════════════════
// Summary
// ══════════════════════════════════════════
console.log('\n\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');
if (expectedNulls > 0) {
    console.log('Results: ' + passed + ' passed, ' + failed + ' failed (' + expectedNulls + ' expected nulls)');
} else {
    console.log('Results: ' + passed + ' passed, ' + failed + ' failed');
}
console.log('\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550');

process.exit(failed > 0 ? 1 : 0);
