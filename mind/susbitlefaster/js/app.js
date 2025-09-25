const state = {
    originalFileName: "",
    isTranslating: false,
};

const els = {
    fileInput: document.getElementById("fileInput"),
    dropZone: document.getElementById("dropZone"),
    fileName: document.getElementById("fileName"),
    browseBtn: document.getElementById("browseBtn"),
    inputText: document.getElementById("inputText"),
    outputText: document.getElementById("outputText"),
    translateBtn: document.getElementById("translateBtn"),
    downloadBtn: document.getElementById("downloadBtn"),
    progressBar: document.getElementById("progressBar"),
    progressBarInner: document.getElementById("progressBarInner"),
    deeplApiKey: document.getElementById("deeplApiKey"),
    apiKeyControls: document.getElementById("apiKeyControls"),
    toggleApiKeyBtn: document.getElementById("toggleApiKeyBtn"),
    saveApiKeyBtn: document.getElementById("saveApiKeyBtn"),
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
} else {
    init();
}

function init() {
    wireServiceControls();
    wireApiKeyControls();
    wireFileControls();
    wireTranslationControls();
    updateApiKeyVisibility();
    loadApiKey();
    setDownloadReady(false);
    hideProgress();
}

function wireServiceControls() {
    document.querySelectorAll('input[name="service"]').forEach((radio) => {
        radio.addEventListener("change", () => {
            updateApiKeyVisibility();
            if (radio.value === "deepl") {
                loadApiKey();
            }
        });
    });
}

function wireApiKeyControls() {
    els.toggleApiKeyBtn.addEventListener("click", toggleApiKeyVisibility);
    els.saveApiKeyBtn.addEventListener("click", saveApiKey);
}

function wireFileControls() {
    els.fileInput.addEventListener("change", (event) => {
        const [file] = event.target.files || [];
        if (file) {
            processFile(file);
        }
    });

    els.browseBtn.addEventListener("click", () => {
        els.fileInput.click();
    });

    els.dropZone.addEventListener("click", () => {
        els.fileInput.click();
    });

    ["dragenter", "dragover"].forEach((type) => {
        els.dropZone.addEventListener(type, (event) => {
            event.preventDefault();
            event.stopPropagation();
            if (event.dataTransfer) {
                event.dataTransfer.dropEffect = "copy";
            }
            els.dropZone.classList.add("upload-zone--active");
        });
    });

    ["dragleave", "dragend"].forEach((type) => {
        els.dropZone.addEventListener(type, (event) => {
            event.preventDefault();
            if (!els.dropZone.contains(event.relatedTarget)) {
                els.dropZone.classList.remove("upload-zone--active");
            }
        });
    });

    els.dropZone.addEventListener("drop", (event) => {
        event.preventDefault();
        event.stopPropagation();
        els.dropZone.classList.remove("upload-zone--active");
        const files = event.dataTransfer?.files;
        if (files && files.length) {
            const file = files[0];
            processFile(file);
            syncFileInput(file);
        }
    });

    els.inputText.addEventListener("input", () => {
        setDownloadReady(false);
    });
}

function wireTranslationControls() {
    els.translateBtn.addEventListener("click", translateText);
    els.downloadBtn.addEventListener("click", downloadSubtitle);
}

function updateApiKeyVisibility() {
    const service = getSelectedService();
    if (service === "deepl") {
        els.apiKeyControls.hidden = false;
    } else {
        els.apiKeyControls.hidden = true;
        resetApiKeyField();
    }
}

function getSelectedSpeed() {
    return document.querySelector('input[name="speed"]:checked')?.value || "normal";
}

function getSelectedService() {
    return document.querySelector('input[name="service"]:checked')?.value || "google";
}

function toggleApiKeyVisibility() {
    if (els.deeplApiKey.type === "password") {
        els.deeplApiKey.type = "text";
        els.toggleApiKeyBtn.textContent = "Hide";
    } else {
        els.deeplApiKey.type = "password";
        els.toggleApiKeyBtn.textContent = "Show";
    }
}

function saveApiKey() {
    const apiKey = (els.deeplApiKey.value || "").trim();
    try {
        localStorage.setItem("deeplApiKey", apiKey);
        alert("API key saved!");
    } catch (error) {
        console.error("Unable to save API key", error);
    }
}

function loadApiKey() {
    try {
        const savedKey = localStorage.getItem("deeplApiKey");
        if (savedKey) {
            els.deeplApiKey.value = savedKey;
        }
    } catch (error) {
        console.error("Unable to load API key", error);
    }
}

function resetApiKeyField() {
    els.deeplApiKey.type = "password";
    els.toggleApiKeyBtn.textContent = "Show";
}

function processFile(file) {
    if (!file.name.toLowerCase().endsWith(".srt")) {
        alert("Please upload an .srt subtitle file.");
        return;
    }

    state.originalFileName = file.name;
    els.fileName.textContent = file.name;

    readSubtitleFile(file)
        .then((content) => {
            els.inputText.value = content;
            setDownloadReady(false);
        })
        .catch((error) => {
            console.error("Unable to read file", error);
            alert("Failed to read the selected file.");
        });
}

function readSubtitleFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result || "");
        reader.onerror = () => reject(new Error("File could not be read"));
        reader.readAsText(file);
    });
}

function syncFileInput(file) {
    if (!els.fileInput) {
        return;
    }
    const isConstructable = typeof window.DataTransfer === "function";
    if (!isConstructable) {
        return;
    }
    try {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        els.fileInput.files = dataTransfer.files;
    } catch (error) {
        console.warn("Unable to sync hidden file input", error);
    }
}

async function translateText() {
    if (state.isTranslating) {
        return;
    }

    const rawInput = els.inputText.value.trim();
    if (!rawInput) {
        alert("Please paste subtitles or upload a file before translating.");
        return;
    }

    const targetLang = document.getElementById("targetLang").value;
    const service = getSelectedService();
    const speedMode = getSelectedSpeed();
    const deeplApiKey = els.deeplApiKey.value.trim();

    if (service === "deepl" && !deeplApiKey) {
        alert("Please provide your DeepL API key to continue.");
        els.deeplApiKey.focus();
        return;
    }

    const subtitles = rawInput
        .split(/\n\s*\n/)
        .map((block) => block.trim())
        .filter(Boolean);

    if (subtitles.length === 0) {
        alert("No subtitle entries were detected. Please check the format.");
        return;
    }

    state.isTranslating = true;
    setDownloadReady(false);
    els.outputText.value = "";
    els.translateBtn.disabled = true;
    els.translateBtn.textContent = "Translating…";
    showProgress();
    updateProgress(0, subtitles.length);

    const results = [];
    const speedConfig = {
        goat: subtitles.length,
        "super-turbo": 20,
        fast: 10,
        normal: 1,
    };
    const delayConfig = {
        goat: 0,
        "super-turbo": 5,
        fast: 10,
        normal: 100,
    };

    const batchSize = speedConfig[speedMode] || 1;
    const delay = delayConfig[speedMode] ?? 50;

    try {
        for (let index = 0; index < subtitles.length; index += batchSize) {
            const batch = subtitles.slice(index, index + batchSize);
            const translatedBatch = await translateBatch(
                batch,
                targetLang,
                service,
                deeplApiKey,
            );
            results.push(...translatedBatch);
            updateProgress(results.length, subtitles.length);
            if (delay > 0 && results.length < subtitles.length) {
                await pause(delay);
            }
        }
    } catch (error) {
        console.error("Translation error", error);
        alert("Something went wrong during translation. Please try again.");
    } finally {
        els.outputText.value = results.join("\n\n");
        hideProgress();
        els.translateBtn.disabled = false;
        els.translateBtn.textContent = "Translate";
        state.isTranslating = false;
        if (results.length) {
            setDownloadReady(true);
        }
    }
}

async function translateBatch(batch, targetLang, service, deeplApiKey) {
    return Promise.all(
        batch.map(async (subtitle) => {
            const lines = subtitle.split("\n");
            const textToTranslate = lines.slice(2).join(" ").trim();
            if (!textToTranslate) {
                return subtitle;
            }

            try {
                const translatedText = await translateSegment(
                    textToTranslate,
                    targetLang,
                    service,
                    deeplApiKey,
                );

                if (translatedText) {
                    lines.splice(2, lines.length - 2, translatedText);
                    return lines.join("\n");
                }
            } catch (error) {
                console.error("Failed to translate subtitle", error);
            }

            return subtitle;
        }),
    );
}

async function translateSegment(text, targetLang, service, deeplApiKey) {
    let url = "";
    if (service === "google") {
        url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(
            text,
        )}`;
    } else {
        url = `https://api-free.deepl.com/v2/translate?auth_key=${deeplApiKey}&text=${encodeURIComponent(
            text,
        )}&target_lang=${targetLang.toUpperCase()}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (service === "google") {
        if (Array.isArray(data) && Array.isArray(data[0])) {
            return data[0].map((segment) => segment[0]).join(" ");
        }
    } else if (data?.translations?.length) {
        return data.translations[0].text;
    }

    return text;
}

function pause(duration) {
    return new Promise((resolve) => setTimeout(resolve, duration));
}

function showProgress() {
    els.progressBar.setAttribute("aria-hidden", "false");
    els.progressBar.style.display = "block";
    updateProgress(0, 1);
}

function hideProgress() {
    els.progressBar.setAttribute("aria-hidden", "true");
    els.progressBar.style.display = "none";
}

function updateProgress(completed, total) {
    const percentage = Math.round((completed / total) * 100) || 0;
    els.progressBarInner.style.width = `${percentage}%`;
    els.progressBarInner.textContent = `${percentage}%`;
}

function setDownloadReady(isReady) {
    els.downloadBtn.disabled = !isReady;
}

function downloadSubtitle() {
    const translatedText = els.outputText.value;
    if (!translatedText.trim()) {
        alert("There is no translated subtitle to download yet.");
        return;
    }

    const targetLang = document.getElementById("targetLang").value;
    const baseName = state.originalFileName
        ? state.originalFileName.replace(/\.srt$/i, "")
        : "translated_subtitle";
    const downloadFileName = `${baseName}.${targetLang}.srt`;

    const blob = new Blob([translatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = downloadFileName;
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(url);
    anchor.remove();
}
