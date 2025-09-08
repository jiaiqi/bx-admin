// Coerce Element-UI date util masks to strings globally
try {
  const dateUtil = require('element-ui/lib/utils/date-util');
  if (dateUtil && dateUtil.formatDate) {
    const origFormatDate = dateUtil.formatDate;
    dateUtil.formatDate = function(date, mask) {
      if (typeof mask !== 'string') {
        mask = 'yyyy-MM-dd HH:mm:ss';
      }
      return origFormatDate.call(this, date, mask);
    };
  }
  const fecha = require('element-ui/lib/utils/date');
  if (fecha && fecha.format) {
    const origFechaFormat = fecha.format;
    fecha.format = function(dateObj, mask) {
      if (typeof mask !== 'string') {
        mask = 'yyyy-MM-dd HH:mm:ss';
      }
      return origFechaFormat.call(this, dateObj, mask);
    };
  }
} catch (e) {}


