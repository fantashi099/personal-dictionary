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
            const definition = entry.meanings[0]?.definitions[0]?.definition || "No definition found";
            const audioUrl = entry.phonetics.find((p: { audio?: string }) => p.audio)?.audio || "";

            const newWord = {
                id: Date.now().toString(),
                word,
                definition,
                audioUrl,
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
