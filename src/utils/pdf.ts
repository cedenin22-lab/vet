// Paw-print watermark as inline SVG → data URL
// A single paw print repeated as a tiled background
export const PAW_WATERMARK_SVG = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80" opacity="0.07">
  <g fill="#38bdf8" transform="translate(20,18) scale(0.45)">
    <ellipse cx="10" cy="8" rx="5" ry="7"/>
    <ellipse cx="30" cy="4" rx="5" ry="7"/>
    <ellipse cx="50" cy="4" rx="5" ry="7"/>
    <ellipse cx="70" cy="8" rx="5" ry="7"/>
    <path d="M8,22 Q10,14 20,12 Q30,10 38,16 Q46,10 56,12 Q66,14 68,22 Q72,38 60,50 Q50,58 40,58 Q30,58 20,50 Q8,38 8,22Z"/>
  </g>
</svg>
`)}`;

export const SIGNATURE_IMG_PATH = '/assets/image_d714e5.png';

const HEADER_LAB = `
  <div style="text-align:center;border-bottom:2px solid #0d9488;padding-bottom:10px;margin-bottom:12px;">
    <div style="font-size:17px;font-weight:800;color:#0f172a;letter-spacing:0.5px;text-transform:uppercase;">Consultorio Veterinario Dr. Cedeño</div>
    <div style="font-size:9px;color:#475569;margin-top:3px;">R.U.C. 6-67-83 D.V.63</div>
    <div style="font-size:9px;color:#475569;">La Locería, Calle 22A, Norte &nbsp;|&nbsp; Teléfono: 236-9453 &nbsp;|&nbsp; Celular: 6719-9283</div>
    <div style="font-size:9px;color:#475569;">Horario: Lunes a Viernes: 8:00 a.m. - 7:00 p.m. &nbsp;|&nbsp; Sábado: 8:00 a.m. - 3:30 p.m.</div>
    <div style="font-size:14px;font-weight:700;color:#0f766e;margin-top:8px;letter-spacing:0.5px;">REPORTE DE RESULTADOS DE LABORATORIO</div>
  </div>`;

const HEADER_CERT = `
  <div style="text-align:center;border-bottom:2px solid #0d9488;padding-bottom:10px;margin-bottom:12px;">
    <div style="font-size:17px;font-weight:800;color:#0f172a;letter-spacing:0.5px;text-transform:uppercase;">Consultorio Veterinario Dr. Cedeño</div>
    <div style="font-size:9px;color:#475569;margin-top:3px;">Doctor Ricardo Cedeño &nbsp;|&nbsp; Idoneidad # 454</div>
    <div style="font-size:9px;color:#475569;">Dir. La Locería, Calle 22A Norte, Casa 96 A &nbsp;|&nbsp; Tel. 236-9453 / 6719-9283</div>
    <div style="font-size:14px;font-weight:700;color:#0f766e;margin-top:8px;letter-spacing:0.5px;">CERTIFICADO DE BUENA SALUD Y EXPORTACIÓN</div>
  </div>`;

function sectionTitle(title: string) {
  return `<div style="background:#e0f2fe;border-left:4px solid #0284c7;padding:5px 10px;font-size:10px;font-weight:700;color:#0c4a6e;margin:12px 0 8px;text-transform:uppercase;letter-spacing:0.5px;">${title}</div>`;
}

function dataRow(label: string, value: string) {
  return `<div style="display:flex;gap:4px;margin-bottom:4px;font-size:10px;">
    <span style="color:#64748b;min-width:130px;font-weight:600;">${label}:</span>
    <span style="color:#0f172a;">${value || '—'}</span>
  </div>`;
}

function resultBadge(result: string) {
  if (!result) return '';
  const isPos = result.toLowerCase().includes('positivo') || result.toLowerCase() === '+';
  const isNeg = result.toLowerCase().includes('negativo') || result.toLowerCase() === '-';
  const bg = isPos ? '#fef2f2' : isNeg ? '#f0fdf4' : '#f8fafc';
  const color = isPos ? '#b91c1c' : isNeg ? '#15803d' : '#475569';
  const border = isPos ? '#fca5a5' : isNeg ? '#86efac' : '#cbd5e1';
  return `<span style="display:inline-block;padding:2px 8px;border-radius:9999px;background:${bg};color:${color};border:1px solid ${border};font-size:9px;font-weight:700;">${result}</span>`;
}

function signatureBlock(includeSignature: boolean) {
  if (includeSignature) {
    return `
    <div style="margin-top:24px;display:flex;flex-direction:column;align-items:flex-start;gap:2px;">
      <img src="${SIGNATURE_IMG_PATH}" style="height:80px;max-width:200px;object-fit:contain;" crossorigin="anonymous"/>
      <div style="font-size:10px;font-weight:700;color:#0f172a;">Dr. Ricardo Cedeño</div>
      <div style="font-size:9px;color:#475569;">Médico Veterinario &nbsp;|&nbsp; Idoneidad # 454</div>
      <div style="font-size:9px;color:#475569;">Consultorio Veterinario Dr. Cedeño</div>
    </div>`;
  }
  return `
    <div style="margin-top:24px;">
      <div style="border-top:1px solid #0f172a;width:200px;margin-bottom:4px;"></div>
      <div style="font-size:10px;font-weight:700;color:#0f172a;">Dr. Ricardo Cedeño</div>
      <div style="font-size:9px;color:#475569;">Médico Veterinario &nbsp;|&nbsp; Idoneidad # 454</div>
      <div style="font-size:9px;color:#475569;">Consultorio Veterinario Dr. Cedeño</div>
    </div>`;
}

export interface LabTestData {
  name: string;
  details: string;
  result: string;
}

export async function generateLabResultPDF(data: {
  date: string;
  petName: string;
  ownerName: string;
  tests: LabTestData[];
  observations: string;
  photoDataUrl: string | null;
  includeSignature: boolean;
}) {
  const html2pdf = (await import('html2pdf.js')).default;

  const filledTests = data.tests.filter(t => t.result.trim() !== '');

  const tableRows = filledTests.map((t, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
      <td style="padding:6px 8px;font-size:9px;color:#0f172a;border-bottom:1px solid #e2e8f0;font-weight:600;">${t.name}</td>
      <td style="padding:6px 8px;font-size:9px;color:#334155;border-bottom:1px solid #e2e8f0;">${t.details || '—'}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${resultBadge(t.result)}</td>
    </tr>`).join('');

  const photoHtml = data.photoDataUrl ? `
    ${sectionTitle('Evidencia Fotográfica del Examen')}
    <div style="text-align:center;margin:8px 0;">
      <img src="${data.photoDataUrl}" style="max-width:100%;max-height:200px;border-radius:8px;border:1px solid #e2e8f0;object-fit:contain;" />
    </div>` : '';

  const html = `
  <div style="
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    padding: 24px 28px;
    color: #0f172a;
    background-image: url('${PAW_WATERMARK_SVG}');
    background-repeat: repeat;
    background-size: 80px 80px;
    min-height: 297mm;
    box-sizing: border-box;
  ">
    ${HEADER_LAB}

    ${sectionTitle('Información del Paciente')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 16px;">
      ${dataRow('Fecha', data.date)}
      ${dataRow('Paciente', data.petName)}
      ${dataRow('Propietario', data.ownerName)}
    </div>

    ${sectionTitle('Pruebas Realizadas')}
    ${filledTests.length > 0 ? `
    <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background:#0f766e;">
          <th style="padding:7px 8px;text-align:left;font-size:9px;color:#fff;font-weight:700;width:35%;">Prueba / Parámetro</th>
          <th style="padding:7px 8px;text-align:left;font-size:9px;color:#fff;font-weight:700;width:45%;">Detalles / Observaciones</th>
          <th style="padding:7px 8px;text-align:center;font-size:9px;color:#fff;font-weight:700;width:20%;">Resultado</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>` : `<p style="font-size:9px;color:#94a3b8;">No se registraron pruebas con resultados.</p>`}

    ${photoHtml}

    ${sectionTitle('Observaciones Clínicas')}
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;font-size:9.5px;color:#334155;min-height:50px;white-space:pre-wrap;">${data.observations || '—'}</div>

    ${signatureBlock(data.includeSignature)}
  </div>`;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  await html2pdf().set({
    margin: 0,
    filename: `Resultados_Laboratorio_${data.petName}_${data.date}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(container.firstElementChild as HTMLElement).save();

  document.body.removeChild(container);
}

export async function generateHealthCertificatePDF(data: {
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
  includeSignature: boolean;
}) {
  const html2pdf = (await import('html2pdf.js')).default;

  // Parse date for expedition text
  const dateObj = data.date ? new Date(data.date + 'T12:00:00') : new Date();
  const day = dateObj.getDate();
  const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  const html = `
  <div style="
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    padding: 24px 28px;
    color: #0f172a;
    background-image: url('${PAW_WATERMARK_SVG}');
    background-repeat: repeat;
    background-size: 80px 80px;
    min-height: 297mm;
    box-sizing: border-box;
  ">
    ${HEADER_CERT}

    ${sectionTitle('I. Datos del Paciente')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;">
      ${dataRow('Nombre', data.petName)}
      ${dataRow('Raza', data.breed)}
      ${dataRow('Especie', data.species)}
      ${dataRow('Peso', data.weight ? data.weight + ' kg' : '')}
      ${dataRow('Color', data.color)}
      ${dataRow('Sexo', data.gender)}
      ${dataRow('Fecha de Nacimiento', data.birthDate)}
    </div>

    ${sectionTitle('II. Declaración Médica Veterinaria')}
    <div style="font-size:9.5px;color:#334155;line-height:1.65;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;">
      <p style="margin:0 0 8px;">El médico veterinario que suscribe este documento, certifica que el animal descrito anteriormente fue examinado físicamente y se encuentra libre de evidencia de enfermedades infectocontagiosas, incluyendo lesiones de piel, diarrea, emaciación y síntomas que involucren el sistema nervioso.</p>
      <p style="margin:0 0 8px;">Certifico además que el paciente cumple con los siguientes requisitos sanitarios:</p>
      <ul style="margin:0;padding-left:18px;">
        <li style="margin-bottom:4px;">Cuenta con la vacuna <strong>Antirrábica</strong> vigente.</li>
        <li style="margin-bottom:4px;">Se encuentra debidamente desparasitado (interna y externamente).</li>
        <li>Está libre de miasis o presencia del Gusano Barrenador (<em>Cochliomyia hominivorax</em>).</li>
      </ul>
    </div>

    ${sectionTitle('III. Datos del Propietario y Exportación')}
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;">
      ${dataRow('Propietario', data.ownerName)}
      ${dataRow('Pasaporte / Cédula', data.passport)}
      ${dataRow('Teléfono', data.ownerPhone)}
      ${dataRow('Dirección', data.address)}
      ${dataRow('Exportación hacia', data.exportTo)}
    </div>

    ${sectionTitle('IV. Expedición')}
    <div style="font-size:9.5px;color:#334155;line-height:1.7;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;">
      <p style="margin:0 0 8px;">La presente certificación se expide a solicitud de la parte interesada.</p>
      <p style="margin:0;">Dado en la Ciudad de Panamá, a los <strong>${day}</strong> días del mes de <strong>${month}</strong> del año <strong>${year}</strong>.</p>
    </div>

    ${signatureBlock(data.includeSignature)}
  </div>`;

  const container = document.createElement('div');
  container.innerHTML = html;
  document.body.appendChild(container);

  await html2pdf().set({
    margin: 0,
    filename: `Certificado_Salud_${data.petName}_${data.date}.pdf`,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(container.firstElementChild as HTMLElement).save();

  document.body.removeChild(container);
}
