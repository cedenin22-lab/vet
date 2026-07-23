import { jsPDF } from 'jspdf';

const CLINIC_NAME = 'Consultorio Veterinario Dr. Cedeño';
const DOCTOR_NAME = 'Dr. Ricardo Cedeño';
const DOCTOR_TITLE = 'Médico Veterinario';

const LEFT_MARGIN = 15;
const RIGHT_MARGIN = 195;
const PAGE_WIDTH = RIGHT_MARGIN - LEFT_MARGIN;

function drawHeader(doc: jsPDF, subtitle: string) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text(CLINIC_NAME, 105, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('R.U.C. 6-67-83 D.V.63', 105, 24, { align: 'center' });
  doc.text('La Locería, Calle 22A, Norte | Teléfono: 236-9453 | Celular: 6719-9283', 105, 29, { align: 'center' });
  doc.text('Horario: Lunes a Viernes: 8:00 a.m. - 7:00 p.m. | Sábado: 8:00 a.m. - 3:30 p.m.', 105, 34, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(LEFT_MARGIN, 37, RIGHT_MARGIN, 37);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(subtitle, 105, 45, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(LEFT_MARGIN, 48, RIGHT_MARGIN, 48);

  return 55;
}

function drawFooter(doc: jsPDF, y: number) {
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setDrawColor(200, 200, 200);
  doc.line(LEFT_MARGIN, y, RIGHT_MARGIN, y);
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(DOCTOR_NAME, LEFT_MARGIN, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(DOCTOR_TITLE, LEFT_MARGIN, y);
  y += 5;
  doc.text(CLINIC_NAME, LEFT_MARGIN, y);
  return y;
}

export interface LabTestResultData {
  name: string;
  details: string;
  result: string;
}

export function generateLabResultPDF(data: {
  date: string;
  petName: string;
  ownerName: string;
  tests: LabTestResultData[];
  observations: string;
}) {
  const doc = new jsPDF();
  let y = drawHeader(doc, 'REPORTE DE RESULTADOS DE LABORATORIO');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  y += 4;
  doc.text(`Fecha: ${data.date}`, LEFT_MARGIN, y);
  y += 6;
  doc.text(`Paciente: ${data.petName}`, LEFT_MARGIN, y);
  y += 6;
  doc.text(`Propietario: ${data.ownerName}`, LEFT_MARGIN, y);
  y += 10;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Pruebas Realizadas:', LEFT_MARGIN, y);
  y += 7;

  const filledTests = data.tests.filter(t => t.result.trim() !== '');
  if (filledTests.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setFillColor(240, 240, 240);
    doc.rect(LEFT_MARGIN, y - 4, PAGE_WIDTH, 7, 'F');
    doc.text('Prueba / Parámetro', LEFT_MARGIN + 2, y);
    doc.text('Detalles / Observaciones', 80, y);
    doc.text('Resultado', 160, y);
    y += 7;

    doc.setFont('helvetica', 'normal');
    filledTests.forEach((t, i) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }
      if (i % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(LEFT_MARGIN, y - 4, PAGE_WIDTH, 7, 'F');
      }
      doc.text(t.name, LEFT_MARGIN + 2, y);
      doc.text(t.details || '—', 80, y);
      doc.text(t.result, 160, y);
      y += 7;
    });
  } else {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('No se registraron pruebas con resultados.', LEFT_MARGIN, y);
    y += 7;
  }

  y += 8;
  if (y > 230) {
    doc.addPage();
    y = 20;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('OBSERVACIONES CLÍNICAS', LEFT_MARGIN, y);
  y += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const obsLines = doc.splitTextToSize(data.observations || '—', PAGE_WIDTH);
  doc.text(obsLines, LEFT_MARGIN, y);
  y += obsLines.length * 5 + 10;

  drawFooter(doc, y);

  doc.save(`Resultados_Laboratorio_${data.petName}_${data.date}.pdf`);
}

export function generateHealthCertificatePDF(data: {
  date: string;
  petName: string;
  breed: string;
  species: string;
  weight: string;
  color: string;
  gender: string;
  birthDate: string;
  ownerName: string;
  ownerPhone: string;
  passport: string;
  address: string;
  exportTo: string;
}) {
  const doc = new jsPDF();

  // Custom header for health certificate
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('CONSULTORIO VETERINARIO DR. CEDEÑO', 105, 18, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Doctor Ricardo Cedeño | Idoneidad # 454', 105, 24, { align: 'center' });
  doc.text('Dir. La Locería, Calle 22A Norte, Casa 96 A | Tel. 236-9453 / 6719-9283', 105, 29, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(LEFT_MARGIN, 33, RIGHT_MARGIN, 33);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('CERTIFICADO DE BUENA SALUD Y EXPORTACIÓN', 105, 41, { align: 'center' });

  doc.setDrawColor(200, 200, 200);
  doc.line(LEFT_MARGIN, 44, RIGHT_MARGIN, 44);

  let y = 52;

  // Section I
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('I. DATOS DEL PACIENTE', LEFT_MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const patientFields = [
    `Nombre: ${data.petName}`,
    `Raza: ${data.breed || '—'}`,
    `Especie: ${data.species}`,
    `Peso: ${data.weight || '—'} kg`,
    `Color: ${data.color || '—'}`,
    `Sexo: ${data.gender}`,
    `Fecha Nacimiento: ${data.birthDate || '—'}`,
  ];
  patientFields.forEach((f, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    doc.text(f, LEFT_MARGIN + col * 95, y + row * 6);
  });
  y += Math.ceil(patientFields.length / 2) * 6 + 6;

  // Section II
  if (y > 200) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('II. DECLARACIÓN MÉDICA VETERINARIA', LEFT_MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const declaration = [
    'El médico veterinario que suscribe este documento, certifica que el animal descrito',
    'anteriormente fue examinado físicamente y se encuentra libre de evidencia de',
    'enfermedades infectocontagiosas, incluyendo lesiones de piel, diarrea, emaciación y',
    'síntomas que involucren el sistema nervioso.',
    '',
    'Certifico además que el paciente cumple con los siguientes requisitos sanitarios:',
    '',
    '• Cuenta con la vacuna Antirrábica vigente.',
    '• Se encuentra debidamente desparasitado (interna y externamente).',
    '• Está libre de miasis o presencia del Gusano Barrenador (Cochliomyia hominivorax).',
  ];
  declaration.forEach(line => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(line, LEFT_MARGIN, y);
    y += 5;
  });
  y += 6;

  // Section III
  if (y > 240) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('III. DATOS DEL PROPIETARIO Y EXPORTACIÓN', LEFT_MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const ownerFields = [
    `Propietario: ${data.ownerName}`,
    `Pasaporte / Cédula: ${data.passport || '—'}`,
    `Teléfono: ${data.ownerPhone || '—'}`,
    `Dirección: ${data.address || '—'}`,
    `Exportación hacia: ${data.exportTo || '—'}`,
  ];
  ownerFields.forEach(f => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(f, LEFT_MARGIN, y);
    y += 6;
  });
  y += 6;

  // Section IV
  if (y > 230) { doc.addPage(); y = 20; }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('IV. EXPEDICIÓN', LEFT_MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const expedicion = [
    'La presente certificación se expide a solicitud de la parte interesada.',
    '',
    `Dado en la Ciudad de Panamá, a los _____ días del mes de ____________ del año 2026.`,
    '',
    '',
    '',
    '_________________________________',
    'Firma y Sello del Médico Veterinario',
  ];
  expedicion.forEach(line => {
    if (y > 270) { doc.addPage(); y = 20; }
    doc.text(line, LEFT_MARGIN, y);
    y += 5;
  });

  doc.save(`Certificado_Salud_${data.petName}_${data.date}.pdf`);
}
