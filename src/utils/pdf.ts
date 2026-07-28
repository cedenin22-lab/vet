// ============================================================
// PDF GENERATION UTILITY
// Uses html2pdf.js with carefully styled HTML templates.
// Fixes applied:
//  1. text-align: left (NOT justify) — prevents html2canvas word-join bug
//  2. Arial font-family (web-safe) + line-height: 1.5
//  3. A4 container with 40px padding
//  4. Signature embedded as Base64 data URL (no path/CORS issues)
//  5. Images awaited before html2canvas capture
//  6. Paw-print watermark via SVG data URL at opacity 0.1
// ============================================================

// Paw-print watermark — tiled SVG at low opacity
const PAW_WATERMARK = `data:image/svg+xml;utf8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
  <g fill="#7dd3fc" opacity="0.12">
    <ellipse cx="20" cy="15" rx="6" ry="8"/>
    <ellipse cx="40" cy="10" rx="6" ry="8"/>
    <ellipse cx="60" cy="10" rx="6" ry="8"/>
    <ellipse cx="80" cy="15" rx="6" ry="8"/>
    <path d="M15,30 Q18,20 30,18 Q42,16 50,24 Q58,16 70,18 Q82,20 85,30 Q90,48 75,62 Q60,72 50,72 Q40,72 25,62 Q10,48 15,30Z"/>
  </g>
</svg>
`)}`;

// ============================================================
// SIGNATURE IMAGE — Base64 placeholder
// Replace the string below with your actual signature/seal image
// converted to Base64. Keep the "data:image/png;base64," prefix.
// ============================================================
export const SIGNATURE_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

// Wait for all <img> elements inside a container to finish loading
function waitForImages(el: HTMLElement): Promise<void> {
  const imgs = Array.from(el.querySelectorAll<HTMLImageElement>('img'));
  if (imgs.length === 0) return Promise.resolve();
  return Promise.all(
    imgs.map(img =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>(res => {
            img.onload = () => res();
            img.onerror = () => res();
          })
    )
  ).then(() => undefined);
}

// Shared A4 container styles
const A4_STYLES = `
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11px;
  line-height: 1.5;
  color: #1e293b;
  text-align: left;
  width: 210mm;
  min-height: 297mm;
  padding: 40px;
  box-sizing: border-box;
  background-color: #ffffff;
  background-image: url('${PAW_WATERMARK}');
  background-repeat: repeat;
  background-size: 120px 120px;
`;

const CLINIC_HEADER = `
  <div style="text-align:center;border-bottom:3px solid #0d9488;padding-bottom:12px;margin-bottom:20px;">
    <div style="font-size:18px;font-weight:bold;color:#0f172a;letter-spacing:1px;text-transform:uppercase;">Consultorio Veterinario Dr. Cedeño</div>
    <div style="font-size:10px;color:#475569;margin-top:4px;">R.U.C. 6-67-83 D.V.63</div>
    <div style="font-size:10px;color:#475569;">La Loceria, Calle 22A, Norte &nbsp;|&nbsp; Telefono: 236-9453 &nbsp;|&nbsp; Celular: 6719-9283</div>
    <div style="font-size:10px;color:#475569;">Horario: Lunes a Viernes: 8:00 a.m. - 7:00 p.m. &nbsp;|&nbsp; Sabado: 8:00 a.m. - 3:30 p.m.</div>
  </div>`;

function sectionTitle(title: string): string {
  return `<div style="background:#e0f2fe;border-left:4px solid #0284c7;padding:6px 12px;font-size:11px;font-weight:bold;color:#0c4a6e;margin:16px 0 10px;text-transform:uppercase;letter-spacing:0.5px;">${title}</div>`;
}

function dataRow(label: string, value: string): string {
  return `<div style="margin-bottom:5px;font-size:11px;"><span style="color:#64748b;font-weight:bold;min-width:140px;display:inline-block;">${label}:</span> <span style="color:#1e293b;">${value || '---'}</span></div>`;
}

function resultBadge(result: string): string {
  if (!result) return '';
  const isPos = result.toLowerCase().includes('positivo');
  const isNeg = result.toLowerCase().includes('negativo');
  const bg = isPos ? '#fee2e2' : isNeg ? '#dcfce7' : '#f1f5f9';
  const color = isPos ? '#b91c1c' : isNeg ? '#15803d' : '#475569';
  const border = isPos ? '#fca5a5' : isNeg ? '#86efac' : '#cbd5e1';
  return `<span style="display:inline-block;padding:3px 10px;border-radius:9999px;background:${bg};color:${color};border:1px solid ${border};font-size:10px;font-weight:bold;">${result}</span>`;
}

function signatureBlock(includeSignature: boolean): string {
  if (includeSignature) {
    return `
    <div style="margin-top:30px;text-align:center;">
      <img src="${SIGNATURE_BASE64}" style="display:block;max-width:200px;margin:0 auto;height:80px;object-fit:contain;" />
      <div style="font-size:11px;font-weight:bold;color:#0f172a;margin-top:4px;">Dr. Ricardo Cedeno</div>
      <div style="font-size:10px;color:#475569;">Medico Veterinario &nbsp;|&nbsp; Idoneidad # 454</div>
      <div style="font-size:10px;color:#475569;">Consultorio Veterinario Dr. Cedeno</div>
    </div>`;
  }
  return `
    <div style="margin-top:30px;text-align:center;">
      <div style="border-top:1px solid #0f172a;width:250px;margin:0 auto 4px;"></div>
      <div style="font-size:11px;font-weight:bold;color:#0f172a;">Dr. Ricardo Cedeno</div>
      <div style="font-size:10px;color:#475569;">Medico Veterinario &nbsp;|&nbsp; Idoneidad # 454</div>
      <div style="font-size:10px;color:#475569;">Consultorio Veterinario Dr. Cedeno</div>
    </div>`;
}

async function generatePDF(htmlContent: string, filename: string) {
  const html2pdf = (await import('html2pdf.js')).default;

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.innerHTML = htmlContent;
  document.body.appendChild(container);

  const rootEl = container.firstElementChild as HTMLElement;
  await waitForImages(rootEl);

  await html2pdf().set({
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { useCORS: true, allowTaint: true, scale: 2, logging: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  }).from(rootEl).save();

  document.body.removeChild(container);
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
  const filledTests = data.tests.filter(t => t.result.trim() !== '');

  const tableRows = filledTests.map((t, i) => `
    <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'};">
      <td style="border:1px solid #ccc;padding:8px;font-size:10px;font-weight:bold;color:#1e293b;">${t.name}</td>
      <td style="border:1px solid #ccc;padding:8px;font-size:10px;color:#334155;">${t.details || '---'}</td>
      <td style="border:1px solid #ccc;padding:8px;text-align:center;">${resultBadge(t.result)}</td>
    </tr>`).join('');

  const photoHtml = data.photoDataUrl ? `
    ${sectionTitle('Evidencia Fotografica del Examen')}
    <div style="text-align:center;margin:10px 0;">
      <img src="${data.photoDataUrl}" style="display:block;max-width:300px;margin:0 auto;max-height:200px;border:1px solid #ccc;border-radius:8px;object-fit:contain;" />
    </div>` : '';

  const html = `
  <div style="${A4_STYLES}">
    ${CLINIC_HEADER}

    <div style="text-align:center;font-size:14px;font-weight:bold;color:#0f766e;margin-bottom:16px;letter-spacing:0.5px;">REPORTE DE RESULTADOS DE LABORATORIO</div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />

    ${sectionTitle('Informacion del Paciente')}
    ${dataRow('Fecha', data.date)}
    ${dataRow('Paciente', data.petName)}
    ${dataRow('Propietario', data.ownerName)}

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />

    ${sectionTitle('Pruebas Realizadas')}
    ${filledTests.length > 0 ? `
    <table style="border-collapse:collapse;width:100%;">
      <thead>
        <tr style="background:#e0f2fe;">
          <th style="border:1px solid #ccc;padding:8px;text-align:left;font-size:10px;color:#0c4a6e;font-weight:bold;width:35%;">Prueba / Parametro</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:left;font-size:10px;color:#0c4a6e;font-weight:bold;width:45%;">Detalles / Observaciones</th>
          <th style="border:1px solid #ccc;padding:8px;text-align:center;font-size:10px;color:#0c4a6e;font-weight:bold;width:20%;">Resultado</th>
        </tr>
      </thead>
      <tbody>${tableRows}</tbody>
    </table>` : `<p style="font-size:10px;color:#94a3b8;">No se registraron pruebas con resultados.</p>`}

    ${photoHtml}

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />

    ${sectionTitle('Observaciones Clinicas')}
    <div style="background:#f8fafc;border:1px solid #ccc;border-radius:6px;padding:10px;font-size:10px;color:#334155;min-height:50px;white-space:pre-wrap;">${data.observations || '---'}</div>

    ${signatureBlock(data.includeSignature)}
  </div>`;

  await generatePDF(html, `Resultados_Laboratorio_${data.petName}_${data.date}.pdf`);
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
  const dateObj = data.date ? new Date(data.date + 'T12:00:00') : new Date();
  const day = dateObj.getDate();
  const monthNames = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const month = monthNames[dateObj.getMonth()];
  const year = dateObj.getFullYear();

  const html = `
  <div style="${A4_STYLES}">
    ${CLINIC_HEADER}

    <div style="text-align:center;font-size:14px;font-weight:bold;color:#0f766e;margin-bottom:16px;letter-spacing:0.5px;">CERTIFICADO DE BUENA SALUD Y EXPORTACION</div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />

    ${sectionTitle('I. Datos del Paciente')}
    ${dataRow('Nombre', data.petName)}
    ${dataRow('Raza', data.breed)}
    ${dataRow('Especie', data.species)}
    ${dataRow('Peso', data.weight ? data.weight + ' kg' : '')}
    ${dataRow('Color', data.color)}
    ${dataRow('Sexo', data.gender)}
    ${dataRow('Fecha de Nacimiento', data.birthDate)}

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />

    ${sectionTitle('II. Declaracion Medica Veterinaria')}
    <div style="font-size:11px;color:#334155;line-height:1.5;text-align:left;background:#f8fafc;border:1px solid #ccc;border-radius:6px;padding:12px;">
      <p style="margin-bottom:8px;">El medico veterinario que suscribe este documento, certifica que el animal descrito anteriormente fue examinado fisicamente y se encuentra libre de evidencia de enfermedades infectocontagiosas, incluyendo lesiones de piel, diarrea, emaciacion y sintomas que involucren el sistema nervioso.</p>
      <p style="margin-bottom:8px;">Certifico ademas que el paciente cumple con los siguientes requisitos sanitarios:</p>
      <ul style="margin:0;padding-left:20px;">
        <li style="margin-bottom:4px;">Cuenta con la vacuna <strong>Antirrabica</strong> vigente.</li>
        <li style="margin-bottom:4px;">Se encuentra debidamente desparasitado (interna y externamente).</li>
        <li>Esta libre de miasis o presencia del Gusano Barrenador (<em>Cochliomyia hominivorax</em>).</li>
      </ul>
    </div>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />

    ${sectionTitle('III. Datos del Propietario y Exportacion')}
    ${dataRow('Propietario', data.ownerName)}
    ${dataRow('Pasaporte / Cedula', data.passport)}
    ${dataRow('Telefono', data.ownerPhone)}
    ${dataRow('Direccion', data.address)}
    ${dataRow('Exportacion hacia', data.exportTo)}

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;" />

    ${sectionTitle('IV. Expedicion')}
    <div style="font-size:11px;color:#334155;line-height:1.5;text-align:left;background:#f8fafc;border:1px solid #ccc;border-radius:6px;padding:12px;">
      <p style="margin-bottom:8px;">La presente certificacion se expide a solicitud de la parte interesada.</p>
      <p>Dado en la Ciudad de Panama, a los <strong>${day}</strong> dias del mes de <strong>${month}</strong> del ano <strong>${year}</strong>.</p>
    </div>

    ${signatureBlock(data.includeSignature)}
  </div>`;

  await generatePDF(html, `Certificado_Salud_${data.petName}_${data.date}.pdf`);
}
