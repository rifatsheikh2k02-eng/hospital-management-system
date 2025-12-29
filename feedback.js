document.addEventListener("DOMContentLoaded", function () {
  // PHASE 1 ELEMENTS
  const fbName = document.getElementById("fbName");
  const fbContact = document.getElementById("fbContact");
  const fbType = document.getElementById("fbType");
  const fbCategory = document.getElementById("fbCategory");
  const fbPriority = document.getElementById("fbPriority");
  const fbMessageText = document.getElementById("fbMessageText");
  const submitFbBtn = document.getElementById("submitFbBtn");
  const phase1Status = document.getElementById("phase1Status");

  // PHASE 2 ELEMENTS
  const filterType = document.getElementById("filterType");
  const filterStatus = document.getElementById("filterStatus");
  const filterPriority = document.getElementById("filterPriority");
  const applyFilterBtn = document.getElementById("applyFilterBtn");
  const clearFilterBtn = document.getElementById("clearFilterBtn");
  const complaintBody = document.getElementById("complaintBody");
  const statusUpdateId = document.getElementById("statusUpdateId");
  const newStatusSelect = document.getElementById("newStatusSelect");
  const updateStatusBtn = document.getElementById("updateStatusBtn");
  const phase2Status = document.getElementById("phase2Status");

  // PHASE 3 ELEMENTS
  const kpiFeedbackCount = document.getElementById("kpiFeedbackCount");
  const kpiComplaintCount = document.getElementById("kpiComplaintCount");
  const kpiOpenCount = document.getElementById("kpiOpenCount");
  const kpiClosedCount = document.getElementById("kpiClosedCount");
  const categoryBody = document.getElementById("categoryBody");
  const recalcAnalyticsBtn = document.getElementById("recalcAnalyticsBtn");
  const phase3Status = document.getElementById("phase3Status");

  // DATA
  let items = [];
  let idCounter = 1;

  // ---------- PHASE 1: SUBMIT ----------

  submitFbBtn.addEventListener("click", function () {
    const name = fbName.value.trim();
    const contact = fbContact.value.trim();
    const type = fbType.value;
    const category = fbCategory.value;
    const priority = fbPriority.value;
    const message = fbMessageText.value.trim();

    if (!name) {
      showStatus(phase1Status, "Please enter name.", "red");
      return;
    }
    if (!contact) {
      showStatus(phase1Status, "Please enter contact.", "red");
      return;
    }
    if (!category) {
      showStatus(phase1Status, "Please select category.", "red");
      return;
    }
    if (!message) {
      showStatus(phase1Status, "Please enter message.", "red");
      return;
    }

    const id = "FB-" + String(idCounter).padStart(3, "0");
    idCounter++;

    const item = {
      id: id,
      name: name,
      contact: contact,
      type: type,
      category: category,
      priority: priority,
      status: "Open",
      message: message
    };

    items.push(item);
    renderTable(items);
    updateAnalytics();

    fbMessageText.value = "";
    showStatus(phase1Status, "Submitted successfully. ID: " + id, "green");
  });

  // ---------- PHASE 2: TABLE & FILTER & STATUS ----------

  function renderTable(list) {
    complaintBody.innerHTML = "";

    if (list.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6; // ID, Name, Type, Category, Priority, Status
      cell.textContent = "No records.";
      row.appendChild(cell);
      complaintBody.appendChild(row);
      return;
    }

    list.forEach(function (it) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + it.id + "</td>" +
        "<td>" + it.name + "</td>" +
        "<td>" + it.type + "</td>" +
        "<td>" + it.category + "</td>" +
        "<td>" + it.priority + "</td>" +
        "<td>" + it.status + "</td>";
      complaintBody.appendChild(row);
    });
  }

  applyFilterBtn.addEventListener("click", function () {
    const t = filterType.value;
    const s = filterStatus.value;
    const p = filterPriority.value;

    const filtered = items.filter(function (it) {
      if (t && it.type !== t) return false;
      if (s && it.status !== s) return false;
      if (p && it.priority !== p) return false;
      return true;
    });

    renderTable(filtered);
    showStatus(phase2Status, "Filter applied.", "green");
  });

  clearFilterBtn.addEventListener("click", function () {
    filterType.value = "";
    filterStatus.value = "";
    filterPriority.value = "";
    renderTable(items);
    showStatus(phase2Status, "Filter cleared.", "green");
  });

  updateStatusBtn.addEventListener("click", function () {
    const id = statusUpdateId.value.trim();
    const newStatus = newStatusSelect.value;

    if (!id) {
      showStatus(phase2Status, "Please enter Complaint ID.", "red");
      return;
    }

    const found = items.find(function (it) { return it.id === id; });
    if (!found) {
      showStatus(phase2Status, "ID not found.", "red");
      return;
    }

    found.status = newStatus;
    renderTable(items);
    updateAnalytics();
    showStatus(phase2Status, "Status updated for " + id, "green");
  });

  // ---------- PHASE 3: ANALYTICS ----------

  function updateAnalytics() {
    const feedbackItems = items.filter(it => it.type === "Feedback");
    const complaintItems = items.filter(it => it.type === "Complaint");
    const openItems = items.filter(it => it.status === "Open");
    const closedItems = items.filter(it => it.status === "Closed");

    kpiFeedbackCount.textContent = feedbackItems.length;
    kpiComplaintCount.textContent = complaintItems.length;
    kpiOpenCount.textContent = openItems.length;
    kpiClosedCount.textContent = closedItems.length;

    const catMap = {};
    items.forEach(function (it) {
      if (!catMap[it.category]) catMap[it.category] = 0;
      catMap[it.category]++;
    });

    categoryBody.innerHTML = "";
    Object.keys(catMap).forEach(function (cat) {
      const row = document.createElement("tr");
      row.innerHTML =
        "<td>" + cat + "</td>" +
        "<td>" + catMap[cat] + "</td>";
      categoryBody.appendChild(row);
    });
  }

  recalcAnalyticsBtn.addEventListener("click", function () {
    updateAnalytics();
    showStatus(phase3Status, "Analytics recalculated.", "green");
  });

  // ---------- HELPERS & INITIAL ----------

  function showStatus(el, msg, color) {
    el.textContent = msg;
    el.style.color = color;
  }

  renderTable(items);
  updateAnalytics();
});
