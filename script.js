(() => {
  "use strict";

  const editableElements = [...document.querySelectorAll("[data-editable]")];
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");
  const printBtn = document.getElementById("printBtn");
  const statusMessage = document.getElementById("statusMessage");
  const storageKey = "abdulmalik-cv-updated-2026-v1";

  let editMode = false;

  function showStatus(message) {
    statusMessage.textContent = message;
    statusMessage.classList.add("show");
    window.setTimeout(() => statusMessage.classList.remove("show"), 2400);
  }

  function setEditMode(enabled) {
    editMode = enabled;
    document.body.classList.toggle("edit-mode", enabled);

    editableElements.forEach((element) => {
      element.contentEditable = enabled ? "true" : "false";
      element.spellcheck = enabled;
    });

    editBtn.textContent = enabled ? "إنهاء التعديل" : "تعديل المحتوى";
    saveBtn.hidden = !enabled;
    resetBtn.hidden = !enabled;
  }

  function collectEdits() {
    return editableElements.reduce((result, element) => {
      if (element.id) {
        result[element.id] = element.innerHTML;
      }
      return result;
    }, {});
  }

  function refreshContactLinks() {
    const phone = document.getElementById("phone");
    const email = document.getElementById("email");

    if (phone) {
      const normalizedPhone = phone.textContent.replace(/[^+\d]/g, "");
      phone.href = `tel:${normalizedPhone}`;
    }

    if (email) {
      email.href = `mailto:${email.textContent.trim()}`;
    }
  }

  function saveEdits() {
    try {
      refreshContactLinks();
      localStorage.setItem(storageKey, JSON.stringify(collectEdits()));
      showStatus("تم حفظ تعديلات السيرة الذاتية على هذا المتصفح.");
    } catch (error) {
      console.error("Unable to save CV edits:", error);
      showStatus("تعذر حفظ التعديلات.");
    }
  }

  function loadEdits() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || "null");
      if (!saved) return;

      editableElements.forEach((element) => {
        if (element.id && typeof saved[element.id] === "string") {
          element.innerHTML = saved[element.id];
        }
      });

      refreshContactLinks();
    } catch (error) {
      console.warn("Saved CV edits could not be loaded:", error);
    }
  }

  function resetEdits() {
    const confirmed = window.confirm(
      "هل تريد حذف جميع التعديلات المحفوظة واستعادة النسخة الأصلية؟"
    );

    if (!confirmed) return;

    localStorage.removeItem(storageKey);
    window.location.reload();
  }

  function prepareForPrint() {
    if (editMode) {
      setEditMode(false);
    }
    refreshContactLinks();
    window.print();
  }

  editBtn.addEventListener("click", () => setEditMode(!editMode));
  saveBtn.addEventListener("click", saveEdits);
  resetBtn.addEventListener("click", resetEdits);
  printBtn.addEventListener("click", prepareForPrint);

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();

    if ((event.ctrlKey || event.metaKey) && key === "s") {
      event.preventDefault();
      if (editMode) saveEdits();
    }

    if ((event.ctrlKey || event.metaKey) && key === "p") {
      event.preventDefault();
      prepareForPrint();
    }
  });

  loadEdits();
})();
