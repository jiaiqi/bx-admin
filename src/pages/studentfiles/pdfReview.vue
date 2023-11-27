<template>
    <div>
      <button @click="exportPDF">导出PDF</button>
    </div>
  </template>
   
  <script>
  import jsPDF from 'jspdf';
   
  export default {
    methods: {
      exportPDF() {
        const doc = new jsPDF();
        const elementHandler = {
          '#ignorePDF': function(element, renderer) {
            return true;
          }
        };
        const source = window.document.getElementById('content').innerHTML;
        doc.fromHTML(source, 15, 15, {
          'width': 170,
          'elementHandlers': elementHandler
        });
        doc.save('export.pdf');
      }
    }
  }
  </script>