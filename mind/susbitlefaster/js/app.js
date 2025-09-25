const state = {
    originalFileName: "",
    isTranslating: false,
    activeFormat: "srt",
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

const formatHandlers = createFormatHandlers();
const formatById = new Map(formatHandlers.map((handler) => [handler.id, handler]));
const formatByExtension = new Map();
formatHandlers.forEach((handler) => {
    handler.extensions.forEach((ext) => {
        formatByExtension.set(ext.toLowerCase(), handler);
    });
});
const supportedExtensionsOrder = [".srt", ".sub", ".sbv", ".ass", ".vtt", ".stl"];
const supportedExtensions = supportedExtensionsOrder.filter((ext) => formatByExtension.has(ext)).concat(
    Array.from(formatByExtension.keys()).filter((ext) => !supportedExtensionsOrder.includes(ext)),
);
const supportedExtensionsText = supportedExtensions.join(", ");

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
    updateFileNameDisplay(state.originalFileName, getHandlerById(state.activeFormat));
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
        if (!state.originalFileName && els.fileName) {
            els.fileName.textContent = "Pasted text";
        }
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
    const extension = getFileExtension(file.name);
    const handler = extension ? getHandlerByExtension(extension) : null;
    if (!handler) {
        alert(`Unsupported subtitle format. Supported formats: ${supportedExtensionsText}`);
        return;
    }

    state.activeFormat = handler.id;
    state.originalFileName = file.name;
    updateFileNameDisplay(file.name, handler);

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

    const rawInput = els.inputText.value;
    const trimmedInput = rawInput.trim();
    if (!trimmedInput) {
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

    const resolved = resolveFormat(trimmedInput);
    if (!resolved) {
        alert("The subtitle text could not be parsed. Please confirm the format is supported.");
        return;
    }

    const { handler, parsed } = resolved;
    const entries = parsed.entries || [];
    const totalEntries = entries.length;

    const queue = entries
        .map((entry, index) => ({ entry, index }))
        .filter(({ entry }) => entry.text && entry.text.trim());

    state.isTranslating = true;
    setDownloadReady(false);
    els.outputText.value = "";
    els.translateBtn.disabled = true;
    els.translateBtn.textContent = "Translating…";

    const totalTranslatable = queue.length;
    if (totalTranslatable > 0) {
        showProgress();
        updateProgress(0, totalTranslatable);
    } else {
        hideProgress();
    }

    const translations = new Array(totalEntries).fill(undefined);
    const speedConfig = {
        goat: totalTranslatable,
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

    let translatedCount = 0;

    try {
        for (let i = 0; i < queue.length; i += batchSize) {
            const batchItems = queue.slice(i, i + batchSize);
            const translatedBatch = await Promise.all(
                batchItems.map(({ entry }) =>
                    translateSegment(entry.text, targetLang, service, deeplApiKey).catch((error) => {
                        console.error("Translation error", error);
                        return entry.text;
                    }),
                ),
            );

            batchItems.forEach(({ index }, idx) => {
                translations[index] = translatedBatch[idx];
            });

            translatedCount += batchItems.length;
            if (totalTranslatable > 0) {
                updateProgress(translatedCount, totalTranslatable);
            }

            if (delay > 0 && translatedCount < totalTranslatable) {
                await pause(delay);
            }
        }
    } catch (error) {
        console.error("Translation error", error);
        alert("Something went wrong during translation. Please try again.");
    } finally {
        hideProgress();
        const finalText = parsed.build(translations);
        els.outputText.value = finalText;
        els.translateBtn.disabled = false;
        els.translateBtn.textContent = "Translate";
        state.isTranslating = false;
        if (finalText.trim()) {
            setDownloadReady(true);
        }
    }
}

function resolveFormat(inputText) {
    const normalized = normalizeLineEndings(inputText);
    const attempts = [];
    const activeHandler = getHandlerById(state.activeFormat);
    if (activeHandler) {
        attempts.push(activeHandler);
    }

    const detected = detectFormatFromText(normalized);
    if (detected && !attempts.includes(detected)) {
        attempts.push(detected);
    }

    const defaultHandler = getHandlerById("srt");
    if (defaultHandler && !attempts.includes(defaultHandler)) {
        attempts.push(defaultHandler);
    }

    for (const handler of attempts) {
        try {
            const parsed = handler.parse(normalized);
            if (!parsed) {
                continue;
            }
            state.activeFormat = handler.id;
            if (!state.originalFileName) {
                updateFileNameDisplay("", handler, { reason: "pasted" });
            } else {
                updateFileNameDisplay(state.originalFileName, handler);
            }
            return { handler, parsed };
        } catch (error) {
            console.error(`Unable to parse subtitle as ${handler.id}`, error);
        }
    }

    return null;
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
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
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
    const handler = getHandlerById(state.activeFormat) || getHandlerById("srt");
    const baseName = state.originalFileName
        ? stripSupportedExtension(state.originalFileName)
        : "translated_subtitle";
    const extension = (handler?.extensions?.[0] || ".srt").replace(/^\./, "");
    const downloadFileName = `${baseName}.${targetLang}.${extension}`;

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

function updateFileNameDisplay(fileName, handler, options = {}) {
    if (!els.fileName) {
        return;
    }

    if (fileName) {
        const label = handler ? `${fileName} • ${handler.label}` : fileName;
        els.fileName.textContent = label;
        return;
    }

    if (options.reason === "pasted" && handler) {
        els.fileName.textContent = `Pasted text • ${handler.label}`;
    } else {
        els.fileName.textContent = "No file selected yet";
    }
}

function getHandlerById(id) {
    return id ? formatById.get(id) : null;
}

function getHandlerByExtension(extension) {
    if (!extension) {
        return null;
    }
    return formatByExtension.get(extension.toLowerCase()) || null;
}

function getFileExtension(name) {
    const match = name?.toLowerCase().match(/\.[^.]+$/);
    return match ? match[0] : "";
}

function stripSupportedExtension(name) {
    const extension = getFileExtension(name);
    if (extension && supportedExtensions.includes(extension)) {
        return name.slice(0, -extension.length);
    }
    return name;
}

function detectFormatFromText(text) {
    for (const handler of formatHandlers) {
        try {
            if (handler.detect && handler.detect(text)) {
                return handler;
            }
        } catch (error) {
            console.error(`Detection failed for format ${handler.id}`, error);
        }
    }
    return null;
}

function normalizeLineEndings(text) {
    return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function chooseTranslation(translated, fallback) {
    if (typeof translated === "string" && translated.trim()) {
        return translated;
    }
    return fallback;
}

function createFormatHandlers() {
    return [
        createVttHandler(),
        createAssHandler(),
        createSubHandler(),
        createSbvHandler(),
        createStlHandler(),
        createSrtHandler(),
    ];
}

function createSrtHandler() {
    return {
        id: "srt",
        label: "SRT",
        extensions: [".srt"],
        detect: (text) => /-->/.test(text) && /^\d+\s*\n.*-->/.test(text),
        parse(content) {
            const normalized = normalizeLineEndings(content).trim();
            if (!normalized) {
                return { entries: [], build: () => "" };
            }
            const blocks = normalized.split(/\n\s*\n/);
            const entries = blocks.map((block) => {
                const lines = block.split("\n");
                const timeIndex = lines.findIndex((line) => line.includes("-->"));
                if (timeIndex === -1) {
                    return {
                        text: "",
                        compose: () => block,
                    };
                }
                const prefix = lines.slice(0, timeIndex + 1);
                const textLines = lines.slice(timeIndex + 1);
                const joined = textLines.join("\n");
                return {
                    text: joined,
                    compose(translated) {
                        if (!joined.trim()) {
                            return block;
                        }
                        const safe = chooseTranslation(translated, joined);
                        const bodyLines = safe.split(/\r?\n/);
                        return [...prefix, ...bodyLines].join("\n");
                    },
                };
            });
            return {
                entries,
                build(translations = []) {
                    return entries
                        .map((entry, index) => entry.compose(translations[index]))
                        .join("\n\n");
                },
            };
        },
    };
}

function createVttHandler() {
    return {
        id: "vtt",
        label: "WebVTT",
        extensions: [".vtt"],
        detect: (text) => /^WEBVTT/m.test(text),
        parse(content) {
            const normalized = normalizeLineEndings(content);
            const lines = normalized.split("\n");
            let index = 0;
            const headerLines = [];

            if (lines[0]?.trim().toUpperCase().startsWith("WEBVTT")) {
                while (index < lines.length && lines[index].trim() !== "") {
                    headerLines.push(lines[index]);
                    index++;
                }
                while (index < lines.length && lines[index].trim() === "") {
                    index++;
                }
            }

            const rest = lines.slice(index).join("\n").trim();
            if (!rest) {
                return {
                    entries: [],
                    build: () => headerLines.join("\n"),
                };
            }

            const blocks = rest.split(/\n\s*\n/);
            const entries = blocks.map((block) => {
                const blockLines = block.split("\n");
                const firstLine = blockLines[0]?.trim().toUpperCase();
                if (firstLine?.startsWith("NOTE")) {
                    return {
                        text: "",
                        compose: () => block,
                    };
                }
                const timeIndex = blockLines.findIndex((line) => line.includes("-->"));
                if (timeIndex === -1) {
                    return {
                        text: "",
                        compose: () => block,
                    };
                }
                const prefix = blockLines.slice(0, timeIndex + 1);
                const textLines = blockLines.slice(timeIndex + 1);
                const joined = textLines.join("\n");
                return {
                    text: joined,
                    compose(translated) {
                        if (!joined.trim()) {
                            return block;
                        }
                        const safe = chooseTranslation(translated, joined);
                        const bodyLines = safe.split(/\r?\n/);
                        return [...prefix, ...bodyLines].join("\n");
                    },
                };
            });

            return {
                entries,
                build(translations = []) {
                    const body = entries
                        .map((entry, index) => entry.compose(translations[index]))
                        .join("\n\n");
                    if (!headerLines.length) {
                        return body;
                    }
                    const header = headerLines.join("\n");
                    return [header, body].filter(Boolean).join("\n\n");
                },
            };
        },
    };
}

function createSbvHandler() {
    return {
        id: "sbv",
        label: "SBV",
        extensions: [".sbv"],
        detect: (text) => /\d+:\d{2}:\d{2}\.\d{3},\d+:\d{2}:\d{2}\.\d{3}/.test(text),
        parse(content) {
            const normalized = normalizeLineEndings(content).trim();
            if (!normalized) {
                return { entries: [], build: () => "" };
            }
            const blocks = normalized.split(/\n\s*\n/);
            const entries = blocks.map((block) => {
                const lines = block.split("\n");
                if (!lines.length) {
                    return { text: "", compose: () => block };
                }
                const timestamp = lines[0];
                const textLines = lines.slice(1);
                const joined = textLines.join("\n");
                const isTimestamp = /\d+:\d{2}:\d{2}\.\d{3},\d+:\d{2}:\d{2}\.\d{3}/.test(timestamp);
                if (!isTimestamp) {
                    return { text: "", compose: () => block };
                }
                return {
                    text: joined,
                    compose(translated) {
                        if (!joined.trim()) {
                            return block;
                        }
                        const safe = chooseTranslation(translated, joined);
                        const bodyLines = safe.split(/\r?\n/);
                        return [timestamp, ...bodyLines].join("\n");
                    },
                };
            });
            return {
                entries,
                build(translations = []) {
                    return entries
                        .map((entry, index) => entry.compose(translations[index]))
                        .join("\n\n");
                },
            };
        },
    };
}

function createSubHandler() {
    const linePattern = /^\s*\{(\d+)\}\{(\d+)\}(.*)$/;
    return {
        id: "sub",
        label: "MicroDVD SUB",
        extensions: [".sub"],
        detect: (text) => /\{\d+\}\{\d+\}/.test(text),
        parse(content) {
            const normalized = normalizeLineEndings(content);
            const lines = normalized.split("\n");
            const entries = [];
            lines.forEach((line, lineIndex) => {
                const match = line.match(linePattern);
                if (!match) {
                    entries.push({
                        text: "",
                        compose: () => line,
                        lineIndex,
                    });
                    return;
                }
                const header = `{${match[1]}}{${match[2]}}`;
                const body = match[3];
                const text = body.replace(/\|/g, "\n");
                entries.push({
                    text,
                    compose(translated) {
                        if (!text.trim()) {
                            return line;
                        }
                        const safe = chooseTranslation(translated, text);
                        const formatted = safe.replace(/\n/g, "|");
                        return `${header}${formatted}`;
                    },
                    lineIndex,
                });
            });
            return {
                entries,
                build(translations = []) {
                    const outputLines = lines.slice();
                    entries.forEach((entry, index) => {
                        if (typeof entry.lineIndex !== "number") {
                            return;
                        }
                        const translated = translations[index];
                        const updated = entry.compose(translated);
                        outputLines[entry.lineIndex] = updated;
                    });
                    return outputLines.join("\n");
                },
            };
        },
    };
}

function createAssHandler() {
    return {
        id: "ass",
        label: "ASS",
        extensions: [".ass"],
        detect: (text) => /\[Script Info\]/i.test(text) || /^Dialogue:/m.test(text),
        parse(content) {
            const normalized = normalizeLineEndings(content);
            const lines = normalized.split("\n");
            const entries = [];

            lines.forEach((line, lineIndex) => {
                if (!line.startsWith("Dialogue:")) {
                    entries.push({
                        text: "",
                        compose: () => line,
                        lineIndex,
                    });
                    return;
                }

                const afterKeyword = line.slice("Dialogue:".length);
                const parsed = splitAssDialogue(afterKeyword);
                if (!parsed) {
                    entries.push({
                        text: "",
                        compose: () => line,
                        lineIndex,
                    });
                    return;
                }

                const { fields, text } = parsed;
                const prepared = prepareAssText(text);

                entries.push({
                    text: prepared.sanitized,
                    compose(translated) {
                        if (!prepared.sanitized.trim()) {
                            return line;
                        }
                        const safe = chooseTranslation(translated, prepared.sanitized);
                        const restored = restoreAssText(safe, prepared);
                        return `Dialogue:${fields.join(",")},${restored}`;
                    },
                    lineIndex,
                });
            });

            return {
                entries,
                build(translations = []) {
                    const outputLines = lines.slice();
                    entries.forEach((entry, index) => {
                        if (typeof entry.lineIndex !== "number") {
                            return;
                        }
                        const translated = translations[index];
                        const updated = entry.compose(translated);
                        outputLines[entry.lineIndex] = updated;
                    });
                    return outputLines.join("\n");
                },
            };
        },
    };
}

function splitAssDialogue(afterKeyword) {
    let remaining = afterKeyword.trimStart();
    const fields = [];
    for (let i = 0; i < 9; i += 1) {
        const commaIndex = remaining.indexOf(",");
        if (commaIndex === -1) {
            return null;
        }
        const field = remaining.slice(0, commaIndex);
        fields.push(field);
        remaining = remaining.slice(commaIndex + 1);
    }
    return { fields, text: remaining };
}

function prepareAssText(text) {
    const tags = [];
    const spacingTokens = [];
    let sanitized = text.replace(/\{[^}]*\}/g, (match) => {
        const placeholder = `__ASS_TAG_${tags.length}__`;
        tags.push(match);
        return placeholder;
    });

    sanitized = sanitized.replace(/\\h/g, () => {
        const placeholder = `__ASS_SPACE_${spacingTokens.length}__`;
        spacingTokens.push("\\h");
        return placeholder;
    });

    sanitized = sanitized.replace(/\\N|\\n/g, "\n");

    return { sanitized, tags, spacingTokens };
}

function restoreAssText(translated, prepared) {
    const { tags, spacingTokens } = prepared;
    let restored = translated;

    spacingTokens.forEach((token, index) => {
        const placeholder = new RegExp(`__ASS_SPACE_${index}__`, "g");
        restored = restored.replace(placeholder, token);
    });

    restored = restored.replace(/\n/g, "\\N");

    tags.forEach((tag, index) => {
        const placeholder = new RegExp(`__ASS_TAG_${index}__`, "g");
        restored = restored.replace(placeholder, tag);
    });

    return restored;
}

function createStlHandler() {
    const linePattern = /^(\s*)(\d{2}:\d{2}:\d{2}[:;,]\d{2})(\s*[,;]\s*)(\d{2}:\d{2}:\d{2}[:;,]\d{2})(\s*[,;]\s*)(.*)$/;
    return {
        id: "stl",
        label: "STL",
        extensions: [".stl"],
        detect: (text) => linePattern.test(text),
        parse(content) {
            const normalized = normalizeLineEndings(content);
            const lines = normalized.split("\n");
            const entries = [];
            lines.forEach((line, lineIndex) => {
                const match = line.match(linePattern);
                if (!match) {
                    entries.push({
                        text: "",
                        compose: () => line,
                        lineIndex,
                    });
                    return;
                }
                const [leading, start, startSeparator, end, endSeparator, body] = match.slice(1);
                const text = body.replace(/\|/g, "\n");
                entries.push({
                    text,
                    compose(translated) {
                        if (!text.trim()) {
                            return line;
                        }
                        const safe = chooseTranslation(translated, text);
                        const formatted = safe.replace(/\n/g, "|");
                        return `${leading}${start}${startSeparator}${end}${endSeparator}${formatted}`;
                    },
                    lineIndex,
                });
            });
            return {
                entries,
                build(translations = []) {
                    const outputLines = lines.slice();
                    entries.forEach((entry, index) => {
                        if (typeof entry.lineIndex !== "number") {
                            return;
                        }
                        const translated = translations[index];
                        const updated = entry.compose(translated);
                        outputLines[entry.lineIndex] = updated;
                    });
                    return outputLines.join("\n");
                },
            };
        },
    };
}
