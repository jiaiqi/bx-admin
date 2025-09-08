// Build-time alias patch for Element-UI date utils
// Maps 'element-ui/lib/utils/date' to this module via webpack alias
// Ensures any non-string mask is coerced to a safe default to avoid errors in production bundles

/* eslint-disable */
let fecha;
try {
  // Prefer the fecha package used by element-ui internally
  fecha = require('fecha');
} catch (e) {
  // Fallback: minimal shim if fecha is unavailable
  fecha = {
    format: function(dateObj, mask) {
      const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
      return d.toISOString();
    }
  };
}

const originalFormat = fecha && fecha.format ? fecha.format.bind(fecha) : null;

const patched = Object.assign({}, fecha);

patched.format = function(dateObj, mask) {
  if (typeof mask !== 'string') {
    mask = 'yyyy-MM-dd HH:mm:ss';
  }
  if (originalFormat) {
    return originalFormat(dateObj, mask);
  }
  // Fallback formatting
  const d = dateObj instanceof Date ? dateObj : new Date(dateObj);
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

module.exports = patched;
module.exports.default = patched;


