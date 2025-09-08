// Build-time alias patch for Element-UI date-util
// Maps 'element-ui/lib/utils/date-util' to this module via webpack alias
/* eslint-disable */

let base;
try {
  base = require('element-ui/lib/utils/date-util');
} catch (e) {
  base = {};
}

function coerceMask(mask) {
  return typeof mask === 'string' ? mask : 'yyyy-MM-dd HH:mm:ss';
}

const patched = Object.assign({}, base);

if (base && typeof base.formatDate === 'function') {
  const original = base.formatDate.bind(base);
  patched.formatDate = function(date, mask) {
    return original(date, coerceMask(mask));
  };
} else {
  // Minimal fallback
  patched.formatDate = function(date, mask) {
    mask = coerceMask(mask);
    const d = date instanceof Date ? date : new Date(date);
    const pad = (n) => (n < 10 ? '0' + n : '' + n);
    return (
      d.getFullYear() +
      '-' + pad(d.getMonth() + 1) +
      '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) +
      ':' + pad(d.getMinutes()) +
      ':' + pad(d.getSeconds())
    );
  };
}

module.exports = patched;
module.exports.default = patched;


