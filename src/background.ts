// We'll set up context menus here
chrome.runtime.onInstalled.addListener(() => {
    console.log("Personal Dictionary Extension installed.");
    chrome.contextMenus.create({
        id: "save-to-personal-dictionary",
        title: "Save '%s' to Personal Dictionary",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
    if (info.menuItemId === "save-to-personal-dictionary" && info.selectionText) {
        const word = info.selectionText.trim().toLowerCase();
        if (!word) return;

        console.log("Looking up word:", word);
        // 1. Fetch from Free Dictionary API
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            if (!res.ok) {
                console.error("Word not found.");
                return;
            }
            const data = await res.json();

            const entry = data[0];
            let definition = entry.meanings[0]?.definitions[0]?.definition || "No definition found";
            // P4: Validate and sanitize API response
            if (typeof definition !== 'string' || definition.length > 2000) {
                definition = "No definition found";
            }
            const rawAudioUrl = entry.phonetics.find((p: { audio?: string }) => p.audio)?.audio || "";
            // P4: Only allow audio URLs from the trusted dictionary API domain
            const audioUrl = rawAudioUrl.startsWith('https://api.dictionaryapi.dev/') ? rawAudioUrl : "";

            let phoneticUK = "";
            let phoneticUS = "";

            if (entry.phonetics && Array.isArray(entry.phonetics)) {
                entry.phonetics.forEach((p: { text?: string, audio?: string }) => {
                    if (p.text && p.audio) {
                        if (p.audio.includes('-uk')) phoneticUK = p.text;
                        if (p.audio.includes('-us')) phoneticUS = p.text;
                    } else if (p.text && !p.audio && !phoneticUK && !phoneticUS) {
                        // Sometimes the API provides text without audio marking UK/US
                        // We will just use it as a fallback later
                    }
                });
            }

            // Fallback to general phonetic if specific ones not found
            if (!phoneticUK && !phoneticUS && entry.phonetic) {
                phoneticUK = entry.phonetic;
                phoneticUS = entry.phonetic;
            } else if (!phoneticUK && phoneticUS) {
                phoneticUK = phoneticUS;
            } else if (!phoneticUS && phoneticUK) {
                phoneticUS = phoneticUK;
            }

            const newWord = {
                id: crypto.randomUUID(),
                word,
                definition,
                audioUrl,
                phoneticUK,
                phoneticUS,
                createdAt: Date.now()
            };

            // 2. Save to Chrome Local Storage (which will sync to Zustand when popup opens)
            chrome.storage.local.get("words", (result) => {
                const words: { word: string }[] = (result.words as { word: string }[]) || [];
                // Check if word already exists
                if (!words.find((w) => w.word === word)) {
                    words.unshift(newWord);
                    chrome.storage.local.set({ words });
                    console.log("Saved word successfully!", newWord);
                }
            });

        } catch (error) {
            console.error("Failed to fetch dictionary definition:", error);
        }
    }
});
