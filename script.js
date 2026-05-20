// LocalStorage Schlüssel
const STORAGE_KEY = "minimal_notes";

// DOM Elemente
const noteInput = document.getElementById("noteInput");
const saveBtn = document.getElementById("saveBtn");
const notesContainer = document.getElementById("notesContainer");

const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

const deBtn = document.getElementById("deBtn");
const enBtn = document.getElementById("enBtn");

// Standardsprache
let currentLanguage = "de";

// Übersetzungen
const translations = {
    de: {
        title: "Meine Notizen",
        createTitle: "Notiz erstellen",
        notesTitle: "Meine Notizen",
        dataTitle: "Daten",
        placeholder: "Deine Notiz schreiben...",
        saveBtn: "Notiz speichern",
        exportBtn: "Daten exportieren (.json)",
        importBtn: "Daten importieren (.json)",
        deleteBtn: "Löschen",
        empty: "Noch keine Notizen vorhanden.",
        info:
            "Hinweis: Notizen werden nur für 1 Tag im Browser gespeichert. Nutze den JSON-Export für eine dauerhafte Sicherung oder den Transfer auf andere Geräte.",
        created: "Erstellt"
    },

    en: {
        title: "My Notes",
        createTitle: "Create Note",
        notesTitle: "My Notes",
        dataTitle: "Data",
        placeholder: "Write your note...",
        saveBtn: "Save Note",
        exportBtn: "Export Data (.json)",
        importBtn: "Import Data (.json)",
        deleteBtn: "Delete",
        empty: "No notes available yet.",
        info:
            "Notice: Notes are only stored in the browser for 1 day. Use the JSON export for permanent backup or transfer to other devices.",
        created: "Created"
    }
};

// Sprache anwenden
function applyLanguage(lang) {
    currentLanguage = lang;

    document.getElementById("title").textContent =
        translations[lang].title;

    document.getElementById("createTitle").textContent =
        translations[lang].createTitle;

    document.getElementById("notesTitle").textContent =
        translations[lang].notesTitle;

    document.getElementById("dataTitle").textContent =
        translations[lang].dataTitle;

    document.getElementById("infoText").textContent =
        translations[lang].info;

    noteInput.placeholder =
        translations[lang].placeholder;

    saveBtn.textContent =
        translations[lang].saveBtn;

    exportBtn.textContent =
        translations[lang].exportBtn;

    document.querySelector(".import-label").textContent =
        translations[lang].importBtn;

    // Button Status
    deBtn.classList.remove("active");
    enBtn.classList.remove("active");

    if (lang === "de") {
        deBtn.classList.add("active");
    } else {
        enBtn.classList.add("active");
    }

    renderNotes();
}

// Notizen laden
function getNotes() {
    const notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return notes;
}

// Notizen speichern
function saveNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

// Alte Notizen entfernen (älter als 24h)
function removeExpiredNotes() {
    const notes = getNotes();

    const now = Date.now();

    const validNotes = notes.filter(note => {
        const age = now - note.timestamp;

        // 7 Tage
return age < 7 * 24 * 60 * 60 * 1000;
    });

    saveNotes(validNotes);
}

// Notizen anzeigen
function renderNotes() {

    const notes = getNotes();

    notesContainer.innerHTML = "";

    if (notes.length === 0) {
        notesContainer.innerHTML = `
            <p>${translations[currentLanguage].empty}</p>
        `;
        return;
    }

    // Neueste zuerst
    notes.reverse().forEach((note, index) => {

        const noteElement = document.createElement("div");
        noteElement.classList.add("note");

        const date = new Date(note.timestamp);

        noteElement.innerHTML = `
            <div class="note-text">${escapeHTML(note.text)}</div>

            <div class="note-date">
                ${translations[currentLanguage].created}: 
                ${date.toLocaleString(currentLanguage)}
            </div>

            <button class="delete-btn" onclick="deleteNote(${notes.length - 1 - index})">
                ${translations[currentLanguage].deleteBtn}
            </button>
        `;

        notesContainer.appendChild(noteElement);
    });
}

// XSS Schutz
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}

// Notiz speichern
saveBtn.addEventListener("click", () => {

    const text = noteInput.value.trim();

    if (!text) return;

    const notes = getNotes();

    const newNote = {
        text: text,
        timestamp: Date.now()
    };

    notes.push(newNote);

    saveNotes(notes);

    noteInput.value = "";

    renderNotes();
});

// Notiz löschen
function deleteNote(index) {

    const notes = getNotes();

    notes.splice(index, 1);

    saveNotes(notes);

    renderNotes();
}

// Export JSON
exportBtn.addEventListener("click", () => {

    const notes = getNotes();

    const dataStr = JSON.stringify(notes, null, 2);

    const blob = new Blob([dataStr], {
        type: "application/json"
    });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "notes-export.json";

    a.click();

    URL.revokeObjectURL(url);
});

// Import JSON
importFile.addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = function(e) {

        try {

            const importedNotes = JSON.parse(e.target.result);

            if (!Array.isArray(importedNotes)) {
                throw new Error("Invalid JSON");
            }

            saveNotes(importedNotes);

            removeExpiredNotes();

            renderNotes();

        } catch (error) {
            alert("Ungültige JSON-Datei.");
        }
    };

    reader.readAsText(file);
});

// Sprache wechseln
deBtn.addEventListener("click", () => {
    applyLanguage("de");
});

enBtn.addEventListener("click", () => {
    applyLanguage("en");
});

// Start
removeExpiredNotes();
renderNotes();
applyLanguage("de");
