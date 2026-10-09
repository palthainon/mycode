/* Shared with the MCP network tools. Keep unsigned IPv4 conversion semantics. */
(function(root) {
    'use strict';
    function isValidIP(ip) {
        const parts = ip.split('.');
        return parts.length === 4 && parts.every(part => {
            const num = parseInt(part, 10);
            return !isNaN(num) && num >= 0 && num <= 255 && part === num.toString();
        });
    }
    function ipToInt(ip) {
        const parts = ip.split('.').map(Number);
        return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
    }
    function intToIP(int) {
        return [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
    }
    function cidrToMask(cidr) { return cidr === 0 ? 0 : (0xFFFFFFFF << (32 - cidr)) >>> 0; }
    const core = { isValidIP, ipToInt, intToIP, cidrToMask };
    if (typeof module !== 'undefined' && module.exports) module.exports = core;
    else root.SubnetCore = core;
})(typeof window !== 'undefined' ? window : globalThis);
