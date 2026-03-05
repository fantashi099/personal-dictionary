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

        console.log("[BG] Looking up word:", word);
        // 1. Fetch from Free Dictionary API
        try {
            const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            console.log("[BG] API status:", res.status);
            if (!res.ok) {
                console.warn("[BG] Word not found in dictionary (status " + res.status + "):", word);
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon128.png',
                    title: 'Word Not Found',
                    message: `"${word}" was not found in the dictionary.`,
                });
                return;
            }
            const data = await res.json();
            console.log("[BG] API response type:", typeof data, Array.isArray(data));

            const entry = data?.[0];
            if (!entry || !entry.meanings) {
                console.warn("[BG] No valid entry found for word:", word);
                chrome.notifications.create({
                    type: 'basic',
                    iconUrl: 'icon128.png',
                    title: 'Word Not Found',
                    message: `"${word}" has no valid definition.`,
                });
                return;
            }
            let definition = entry.meanings[0]?.definitions[0]?.definition || "No definition found";
            // Validate and sanitize API response
            if (typeof definition !== 'string' || definition.length > 2000) {
                definition = "No definition found";
            }
            const rawAudioUrl = entry.phonetics?.find((p: { audio?: string }) => p.audio)?.audio || "";
            // Only allow audio URLs from the trusted dictionary API domain
            const audioUrl = rawAudioUrl.startsWith('https://api.dictionaryapi.dev/') ? rawAudioUrl : "";

            let phoneticUK = "";
            let phoneticUS = "";

            if (entry.phonetics && Array.isArray(entry.phonetics)) {
                entry.phonetics.forEach((p: { text?: string, audio?: string }) => {
                    if (p.text && p.audio) {
                        if (p.audio.includes('-uk')) phoneticUK = p.text;
                        if (p.audio.includes('-us')) phoneticUS = p.text;
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

            console.log("[BG] Saving word:", newWord.word);

            // 2. Save to Chrome Local Storage (which will sync to Zustand when popup opens)
            chrome.storage.local.get("words", (result) => {
                try {
                    const words: { word: string }[] = (result.words as { word: string }[]) || [];
                    // Check if word already exists
                    if (!words.find((w) => w.word === word)) {
                        words.unshift(newWord);
                        chrome.storage.local.set({ words });
                        console.log("[BG] Saved word successfully!", newWord.word);
                    } else {
                        console.log("[BG] Word already exists:", word);
                    }
                } catch (storageError) {
                    console.error("[BG] Error in storage callback:", storageError);
                }
            });

        } catch (error) {
            console.error("[BG] Failed to fetch dictionary definition:", error);
        }
    }
});
