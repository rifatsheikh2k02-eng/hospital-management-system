// PHASE 1 ELEMENTS
const patientIdInput = document.getElementById('patientId');
const patientNameInput = document.getElementById('patientName');
const prescriptionList = document.getElementById('prescriptionList');
const addMedicineBtn = document.getElementById('addMedicineBtn');
const saveEncounterBtn = document.getElementById('saveEncounterBtn');
const emrMessage = document.getElementById('emrMessage');

// PHASE 2 ELEMENTS
const noEncounterNote = document.getElementById('noEncounterNote');
const encounterSummary = document.getElementById('encounterSummary');
const sumPatientId = document.getElementById('sumPatientId');
const sumPatientName = document.getElementById('sumPatientName');
const sumDiagnosis = document.getElementById('sumDiagnosis');
const sumBp = document.getElementById('sumBp');
const sumPulse = document.getElementById('sumPulse');
const sumTemp = document.getElementById('sumTemp');
const summaryMedicinesBody = document.getElementById('summaryMedicinesBody');

// PHASE 3 ELEMENTS
const dischargeSummaryInput = document.getElementById('dischargeSummary');
const exportFormatSelect = document.getElementById('exportFormat');
const exportBtn = document.getElementById('exportBtn');
const exportMessage = document.getElementById('exportMessage');

let medicines = [];

// PHASE 1: add medicine row
addMedicineBtn.addEventListener('click', function () {
  medicines.push({ name: '', dose: '', days: '' });
  renderMedicines();
});

function renderMedicines() {
  prescriptionList.innerHTML = '';

  medicines.forEach(function (med, i) {
    const row = document.createElement('div');

    const nameInput = document.createElement('input');
    nameInput.placeholder = 'Medicine Name';
    nameInput.value = med.name;
    nameInput.addEventListener('input', function () {
      medicines[i].name = nameInput.value;
    });

    const doseInput = document.createElement('input');
    doseInput.placeholder = 'Dose';
    doseInput.value = med.dose;
    doseInput.addEventListener('input', function () {
      medicines[i].dose = doseInput.value;
    });

    const daysInput = document.createElement('input');
    daysInput.type = 'number';
    daysInput.placeholder = 'Days';
    daysInput.value = med.days;
    daysInput.addEventListener('input', function () {
      medicines[i].days = daysInput.value;
    });

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.addEventListener('click', function () {
      medicines.splice(i, 1);
      renderMedicines();
    });

    row.appendChild(nameInput);
    row.appendChild(doseInput);
    row.appendChild(daysInput);
    row.appendChild(removeBtn);

    prescriptionList.appendChild(row);
  });
}

// PHASE 1: save encounter
saveEncounterBtn.addEventListener('click', function () {
  const encounter = {
    patientId: patientIdInput.value.trim(),
    patientName: patientNameInput.value.trim(),
    bp: document.getElementById('bp').value.trim(),
    pulse: document.getElementById('pulse').value.trim(),
    temperature: document.getElementById('temperature').value.trim(),
    diagnosis: document.getElementById('diagnosis').value,
    medicines: medicines
  };

  if (!encounter.patientId || !encounter.patientName || !encounter.diagnosis) {
    emrMessage.textContent = 'Please enter Patient ID, Name and Diagnosis.';
    emrMessage.style.color = 'red';
    return;
  }

  emrMessage.textContent = 'Encounter saved (demo only).';
  emrMessage.style.color = 'green';

  // PHASE 2 view update
  updatePhase2View(encounter);
});

// PHASE 2: show report-style summary
function updatePhase2View(encounter) {
  // hide info text
  noEncounterNote.style.display = 'none';
  // show summary box
  encounterSummary.style.display = 'block';

  sumPatientId.textContent = encounter.patientId;
  sumPatientName.textContent = encounter.patientName;
  sumDiagnosis.textContent = encounter.diagnosis || '-';
  sumBp.textContent = encounter.bp || '-';
  sumPulse.textContent = encounter.pulse || '-';
  sumTemp.textContent = encounter.temperature || '-';

  summaryMedicinesBody.innerHTML = '';
  if (encounter.medicines.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = 'No medicines added.';
    row.appendChild(cell);
    summaryMedicinesBody.appendChild(row);
  } else {
    encounter.medicines.forEach(function (m) {
      const row = document.createElement('tr');
      const c1 = document.createElement('td');
      const c2 = document.createElement('td');
      const c3 = document.createElement('td');

      c1.textContent = m.name || '-';
      c2.textContent = m.dose || '-';
      c3.textContent = m.days || '-';

      row.appendChild(c1);
      row.appendChild(c2);
      row.appendChild(c3);

      summaryMedicinesBody.appendChild(row);
    });
  }
}

// PHASE 3: Discharge & Export
exportBtn.addEventListener('click', function () {
  const summary = dischargeSummaryInput.value.trim();
  const format = exportFormatSelect.value;

  if (!summary || !format) {
    exportMessage.textContent = 'Please enter summary and select format.';
    exportMessage.style.color = 'red';
    return;
  }

  exportMessage.textContent =
    'Discharge summary exported as ' + format.toUpperCase() + ' (demo only).';
  exportMessage.style.color = 'green';
});
