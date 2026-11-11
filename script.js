/* ==========================================
   CAREERTRACK LITE
   Application Management System
========================================== */

/* 1. DOM ELEMENTS */

const addApplicationBtn = document.getElementById("addApplicationBtn");
const applicationModal = document.getElementById("applicationModal");
const closeModalBtn = document.getElementById("closeModalBtn");

const applicationForm = document.getElementById("applicationForm");

const companyInput = document.getElementById("company");
const positionInput = document.getElementById("position");
const locationInput = document.getElementById("location");
const jobLinkInput = document.getElementById("jobLink");
const statusInput = document.getElementById("status");
const appliedDateInput = document.getElementById("appliedDate");
const notesInput = document.getElementById("notes");

const modalTitle = document.getElementById("modalTitle");
const pageTitle = document.getElementById("pageTitle");

const totalApplications = document.getElementById("totalApplications");
const appliedCount = document.getElementById("appliedCount");
const interviewCount = document.getElementById("interviewCount");
const selectedCount = document.getElementById("selectedCount");

const recentApplicationsBody =
    document.getElementById("recentApplicationsBody");

const applicationsTableBody =
    document.getElementById("applicationsTableBody");

const dashboardEmptyState =
    document.getElementById("dashboardEmptyState");

const applicationsEmptyState =
    document.getElementById("applicationsEmptyState");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");

const navigationLinks = document.querySelectorAll(".nav-link");

const dashboardView = document.getElementById("dashboardView");
const applicationsView = document.getElementById("applicationsView");


/* 2. APPLICATION DATA */

const STORAGE_KEY = "careerTrackApplications";

let applications = loadApplications();
let editingId = null;


/* 3. LOAD DATA FROM LOCAL STORAGE */

function loadApplications() {

    try {

        const savedData = localStorage.getItem(STORAGE_KEY);

        if (!savedData) {
            return [];
        }

        const parsedData = JSON.parse(savedData);

        if (!Array.isArray(parsedData)) {
            return [];
        }

        return parsedData.filter(application =>
            application &&
            typeof application.id === "string" &&
            typeof application.company === "string" &&
            typeof application.position === "string" &&
            ["Applied", "Interview", "Selected", "Rejected"]
                .includes(application.status)
        );

    } catch (error) {

        console.error("Unable to load saved applications:", error);

        alert("Your saved application data could not be read.");

        return [];
    }
}


/* 4. SAVE DATA TO LOCAL STORAGE */

function saveApplications() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(applications)
        );

        return true;

    } catch (error) {

        console.error("Unable to save applications:", error);

        alert(
            "Unable to save your data. Your browser storage may be full or unavailable."
        );

        return false;
    }
}


/* 5. GENERATE UNIQUE ID */

function generateId() {

    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}


/* 6. FORMAT DATE */

function formatDate(dateString) {

    if (!dateString) {
        return "—";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}


/* 7. CREATE STATUS BADGE */

function createStatusBadge(status) {

    const badge = document.createElement("span");

    badge.classList.add("status-badge");

    const statusClasses = {
        Applied: "status-applied",
        Interview: "status-interview",
        Selected: "status-selected",
        Rejected: "status-rejected"
    };

    badge.classList.add(statusClasses[status] || "status-applied");

    badge.textContent = status;

    return badge;
}


/* 8. OPEN APPLICATION MODAL */

function openModal(application = null) {

    applicationForm.reset();

    editingId = application ? application.id : null;

    if (application) {

        modalTitle.textContent = "Edit Application";

        companyInput.value = application.company;
        positionInput.value = application.position;
        locationInput.value = application.location || "";
        jobLinkInput.value = application.jobLink || "";
        statusInput.value = application.status;
        appliedDateInput.value = application.appliedDate;
        notesInput.value = application.notes || "";

    } else {

        modalTitle.textContent = "Add Application";

        appliedDateInput.value = getTodayDate();
    }

    applicationModal.classList.remove("hidden");

    companyInput.focus();
}


/* 9. CLOSE APPLICATION MODAL */

function closeModal() {

    applicationModal.classList.add("hidden");

    applicationForm.reset();

    editingId = null;
}


/* 10. GET TODAY'S DATE */

function getTodayDate() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(today.getMonth() + 1).padStart(2, "0");

    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* 11. ADD OR UPDATE APPLICATION */

applicationForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const applicationData = {

        company: companyInput.value.trim(),

        position: positionInput.value.trim(),

        location: locationInput.value.trim(),

        jobLink: jobLinkInput.value.trim(),

        status: statusInput.value,

        appliedDate: appliedDateInput.value,

        notes: notesInput.value.trim()

    };


    if (
        !applicationData.company ||
        !applicationData.position ||
        !applicationData.appliedDate
    ) {

        alert("Please complete all required fields.");

        return;
    }


    const existingApplications = applications;

    let updatedApplications;


    if (editingId) {

        updatedApplications = applications.map(application => {

            if (application.id === editingId) {

                return {
                    ...application,
                    ...applicationData
                };

            }

            return application;

        });

    } else {

        const newApplication = {

            id: generateId(),

            ...applicationData,

            createdAt: new Date().toISOString()

        };

        updatedApplications = [
            newApplication,
            ...applications
        ];

    }


    applications = updatedApplications;

    if (!saveApplications()) {

        applications = existingApplications;

        return;
    }

    closeModal();

    renderDashboard();

    renderApplications();

    alert(
        editingId === null
            ? "Application added successfully!"
            : "Application updated successfully!"
    );

});


/* 12. DELETE APPLICATION */

function deleteApplication(id) {

    const application = applications.find(item => item.id === id);

    if (!application) {
        return;
    }

    const confirmDelete = confirm(
        `Are you sure you want to delete the application for ${application.company}?`
    );

    if (!confirmDelete) {
        return;
    }

    const previousApplications = applications;

    applications = applications.filter(item => item.id !== id);

    if (!saveApplications()) {

        applications = previousApplications;

        return;
    }

    renderDashboard();

    renderApplications();

}


/* 13. EDIT APPLICATION */

function editApplication(id) {

    const application = applications.find(item => item.id === id);

    if (!application) {
        return;
    }

    openModal(application);

}


/* 14. UPDATE DASHBOARD STATISTICS */

function updateStatistics() {

    totalApplications.textContent = applications.length;

    appliedCount.textContent = applications.filter(
        application => application.status === "Applied"
    ).length;

    interviewCount.textContent = applications.filter(
        application => application.status === "Interview"
    ).length;

    selectedCount.textContent = applications.filter(
        application => application.status === "Selected"
    ).length;

}


/* 15. GET RECENT APPLICATIONS */

function getRecentApplications() {

    return [...applications]
        .sort((a, b) => {

            const dateA = a.createdAt || a.appliedDate;
            const dateB = b.createdAt || b.appliedDate;

            return dateB.localeCompare(dateA);

        })
        .slice(0, 5);

}


/* 16. RENDER DASHBOARD */

function renderDashboard() {

    updateStatistics();

    recentApplicationsBody.replaceChildren();

    const recentApplications = getRecentApplications();

    dashboardEmptyState.style.display =
        recentApplications.length === 0 ? "block" : "none";


    recentApplications.forEach(application => {

        const row = document.createElement("tr");

        const companyCell = document.createElement("td");
        companyCell.textContent = application.company;

        const positionCell = document.createElement("td");
        positionCell.textContent = application.position;

        const statusCell = document.createElement("td");
        statusCell.appendChild(createStatusBadge(application.status));

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(application.appliedDate);

        row.append(
            companyCell,
            positionCell,
            statusCell,
            dateCell
        );

        recentApplicationsBody.appendChild(row);

    });

}


/* 17. RENDER APPLICATION TABLE */

function renderApplications() {

    applicationsTableBody.replaceChildren();

    const searchText = searchInput.value.trim().toLowerCase();

    const selectedStatus = statusFilter.value;


    const filteredApplications = applications.filter(application => {

        const matchesSearch =

            application.company.toLowerCase().includes(searchText) ||

            application.position.toLowerCase().includes(searchText) ||

            (application.location || "").toLowerCase().includes(searchText);


        const matchesStatus =

            selectedStatus === "all" ||

            application.status === selectedStatus;


        return matchesSearch && matchesStatus;

    });


    applicationsEmptyState.style.display =
        filteredApplications.length === 0 ? "block" : "none";


    filteredApplications.forEach(application => {

        const row = document.createElement("tr");

        const companyCell = document.createElement("td");
        companyCell.textContent = application.company;

        const positionCell = document.createElement("td");
        positionCell.textContent = application.position;

        const locationCell = document.createElement("td");
        locationCell.textContent = application.location || "—";

        const statusCell = document.createElement("td");
        statusCell.appendChild(createStatusBadge(application.status));

        const dateCell = document.createElement("td");
        dateCell.textContent = formatDate(application.appliedDate);


        const actionsCell = document.createElement("td");


        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.className = "action-btn";
        editButton.textContent = "Edit";

        editButton.addEventListener("click", function() {
            editApplication(application.id);
        });


        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.className = "action-btn delete-btn";
        deleteButton.textContent = "Delete";

        deleteButton.addEventListener("click", function() {
            deleteApplication(application.id);
        });


        actionsCell.append(editButton, deleteButton);

        row.append(
            companyCell,
            positionCell,
            locationCell,
            statusCell,
            dateCell,
            actionsCell
        );

        applicationsTableBody.appendChild(row);

    });

}


/* 18. SWITCH BETWEEN DASHBOARD AND APPLICATIONS */

function switchView(viewName) {

    dashboardView.classList.remove("active");

    applicationsView.classList.remove("active");

    navigationLinks.forEach(link => {

        link.classList.remove("active");

    });


    if (viewName === "applications") {

        applicationsView.classList.add("active");

        pageTitle.textContent = "Applications";

    } else {

        dashboardView.classList.add("active");

        pageTitle.textContent = "Dashboard";

    }


    const activeLink = document.querySelector(
        `.nav-link[data-view="${viewName}"]`
    );

    if (activeLink) {
        activeLink.classList.add("active");
    }

}


/* 19. NAVIGATION EVENTS */

navigationLinks.forEach(link => {

    link.addEventListener("click", function(event) {

        event.preventDefault();

        switchView(link.dataset.view);

    });

});


/* 20. SEARCH EVENTS */

searchInput.addEventListener("input", function() {

    renderApplications();

});


/* 21. FILTER EVENTS */

statusFilter.addEventListener("change", function() {

    renderApplications();

});


/* 22. MODAL EVENTS */

addApplicationBtn.addEventListener("click", function() {

    openModal();

});


closeModalBtn.addEventListener("click", closeModal);


applicationModal.addEventListener("click", function(event) {

    if (event.target === applicationModal) {

        closeModal();

    }

});


document.addEventListener("keydown", function(event) {

    if (
        event.key === "Escape" &&
        !applicationModal.classList.contains("hidden")
    ) {

        closeModal();

    }

});


/* 23. INITIALIZE APPLICATION */

function initializeApp() {

    renderDashboard();

    renderApplications();

    switchView("dashboard");

}


/* START APPLICATION */

initializeApp();
// Export Applications to CSV
function exportApplications() {
    if (applications.length === 0) {
        alert("No applications available to export!");
        return;
    }

    const headers = [
        "Company",
        "Position",
        "Location",
        "Status",
        "Applied Date",
        "Job Link",
        "Notes"
    ];

    const rows = applications.map(app => [
        app.company,
        app.position,
        app.location,
        app.status,
        app.appliedDate || app.date || "",
        app.jobLink || app.link || "",
        app.notes
    ]);

    const csvContent = [headers, ...rows]
        .map(row => row.map(value =>
            `"${String(value ?? "").replace(/"/g, '""')}"`
        ).join(","))
        .join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");

    downloadLink.href = url;
    downloadLink.download = "CareerTrack_Applications.csv";
    downloadLink.click();

    URL.revokeObjectURL(url);

    alert("Applications exported successfully!");
}
// Add Export CSV button to the Applications page
function addExportButton() {
    const headings = document.querySelectorAll("h1, h2, h3, h4");

    const heading = Array.from(headings).find(
        h => h.textContent.trim() === "My Applications"
    );

    if (!heading || document.getElementById("exportCsvBtn")) return;

    const button = document.createElement("button");

    button.id = "exportCsvBtn";
    button.textContent = "⬇ Export CSV";
    button.type = "button";

    button.style.cssText = `
        padding: 10px 18px;
        margin: 12px 0;
        border: none;
        border-radius: 8px;
        background: #7c3aed;
        color: white;
        cursor: pointer;
        font-weight: bold;
    `;

    button.addEventListener("click", exportApplications);

    heading.insertAdjacentElement("afterend", button);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addExportButton);
} else {
    addExportButton();
}
// ==========================================
// CAREERTRACK - JSON BACKUP & RESTORE
// ==========================================

const CAREERTRACK_STORAGE_KEY = "careerTrackApplications";

// Create JSON Backup
function backupApplications() {
    try {
        const savedData = localStorage.getItem(CAREERTRACK_STORAGE_KEY);

        if (!savedData) {
            alert("No application data available for backup!");
            return;
        }

        const applicationsData = JSON.parse(savedData);

        const backupData = {
            appName: "CareerTrack Lite",
            version: 1,
            exportedAt: new Date().toISOString(),
            applications: applicationsData
        };

        const blob = new Blob(
            [JSON.stringify(backupData, null, 4)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "CareerTrack_Backup.json";

        document.body.appendChild(link);
        link.click();
        link.remove();

        setTimeout(() => URL.revokeObjectURL(url), 1000);

        alert("Backup created successfully!");

    } catch (error) {
        console.error("Backup error:", error);
        alert("Unable to create backup. Please try again.");
    }
}


// Restore JSON Backup
async function restoreApplications(file) {
    if (!file) return;

    try {
        const fileText = await file.text();
        const backupData = JSON.parse(fileText);

        const importedApplications = Array.isArray(backupData)
            ? backupData
            : backupData.applications;

        if (!Array.isArray(importedApplications)) {
            alert("Invalid backup file!");
            return;
        }

        const validData = importedApplications.every(app =>
            app &&
            typeof app === "object" &&
            !Array.isArray(app) &&
            typeof app.company === "string" &&
            typeof app.position === "string"
        );

        if (!validData) {
            alert("Backup contains invalid application records!");
            return;
        }

        const confirmed = confirm(
            "Restoring this backup will replace your current applications. Continue?"
        );

        if (!confirmed) return;

        localStorage.setItem(
            CAREERTRACK_STORAGE_KEY,
            JSON.stringify(importedApplications)
        );

        alert("Applications restored successfully!");

        window.location.reload();

    } catch (error) {
        console.error("Restore error:", error);
        alert("Unable to restore backup. Please select a valid JSON file.");
    }
}


// Add Backup and Restore Buttons
function addBackupRestoreButtons() {

    const headings = document.querySelectorAll("h1, h2, h3, h4");

    const heading = Array.from(headings).find(
        h => h.textContent.trim() === "My Applications"
    );

    if (!heading ||
        document.getElementById("careerTrackBackupControls")) {
        return;
    }

    const container = document.createElement("div");

    container.id = "careerTrackBackupControls";

    container.style.cssText = `
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin: 15px 0;
    `;

    // Backup Button
    const backupButton = document.createElement("button");

    backupButton.textContent = "💾 Backup JSON";
    backupButton.type = "button";

    backupButton.style.cssText = `
        padding: 11px 18px;
        border: none;
        border-radius: 8px;
        background: #2563eb;
        color: white;
        cursor: pointer;
        font-weight: bold;
    `;

    backupButton.addEventListener("click", backupApplications);

    // Restore Button
    const restoreButton = document.createElement("button");

    restoreButton.textContent = "📂 Restore JSON";
    restoreButton.type = "button";

    restoreButton.style.cssText = `
        padding: 11px 18px;
        border: none;
        border-radius: 8px;
        background: #059669;
        color: white;
        cursor: pointer;
        font-weight: bold;
    `;

    // Hidden File Input
    const fileInput = document.createElement("input");

    fileInput.type = "file";
    fileInput.accept = ".json,application/json";
    fileInput.style.display = "none";

    restoreButton.addEventListener("click", () => {
        fileInput.click();
    });

    fileInput.addEventListener("change", async event => {
        const file = event.target.files[0];

        if (file) {
            await restoreApplications(file);
        }

        fileInput.value = "";
    });

    container.appendChild(backupButton);
    container.appendChild(restoreButton);
    container.appendChild(fileInput);

    const exportButton = document.getElementById("exportCsvBtn");

    const insertionPoint = exportButton || heading;

    insertionPoint.insertAdjacentElement("afterend", container);
}


// Initialize Backup and Restore
if (document.readyState === "loading") {
    document.addEventListener(
        "DOMContentLoaded",
        addBackupRestoreButtons
    );
} else {
    addBackupRestoreButtons();
}