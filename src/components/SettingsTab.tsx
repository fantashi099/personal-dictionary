import { useDictionaryStore } from '../lib/store';
import { auth, signInWithCredential, signOut } from '../lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';

export function SettingsTab() {
    const user = useDictionaryStore(state => state.user);
    const loading = useDictionaryStore(state => state.loading);

    const handleSignIn = async () => {
        const currentAuth = auth;
        if (!currentAuth) return alert("Firebase not configured yet.");

        chrome.identity.getAuthToken({ interactive: true }, async (tokenResponse: any) => {
            const token = tokenResponse?.token || tokenResponse;
            if (chrome.runtime.lastError || !token) {
                console.error("Chrome Identity Error:", chrome.runtime.lastError);
                alert("Authentication failed! Ensure your manifest.json has a valid oauth2 client_id configured from Google Cloud Console.");
                return;
            }

            try {
                const credential = GoogleAuthProvider.credential(null, token);
                await signInWithCredential(currentAuth, credential);
            } catch (err) {
                console.error("Firebase auth error:", err);
                alert("Firebase auth failed: " + (err as Error).message);
            }
        });
    };

    const handleSignOut = async () => {
        if (!auth) return;
        try {
            await signOut(auth);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fafafa] p-6 overflow-y-auto pb-20">
            <div className="mb-10 text-black border-b border-black pb-4">
                <h2 className="font-serif text-3xl font-black tracking-tighter uppercase">Sync Strategy</h2>
            </div>

            <div className="border border-black bg-white p-6 flex flex-col items-start shadow-[6px_6px_0_0_#000]">
                {user ? (
                    <>
                        <div className="w-full border-b border-black pb-6 mb-6 flex items-end justify-between">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-black capitalize">{user.displayName}</h3>
                                <p className="font-sans text-[10px] tracking-widest uppercase text-[#555] mt-1">{user.email}</p>
                            </div>
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt="Avatar"
                                    className="w-12 h-12 grayscale border border-black"
                                />
                            )}
                        </div>

                        <p className="font-sans text-[10px] tracking-widest uppercase text-black leading-relaxed mb-8">
                            Status: <span className="text-green-600 font-bold ml-1">✓ Authenticated</span><br /><br />
                            Data flows actively across devices.
                        </p>

                        <button
                            onClick={handleSignOut}
                            className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase border border-black bg-white text-black hover:bg-black hover:text-white transition-colors w-full py-3.5 text-center"
                        >
                            Terminate Session
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-full border-b border-black pb-6 mb-6">
                            <h3 className="font-serif italic text-2xl text-black">Identity Protocol</h3>
                        </div>
                        <p className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#555] leading-loose mb-8">
                            Establish persistent connection across local clients. Unauthenticated sessions rely on ephemeral block storage.
                        </p>

                        <button
                            onClick={handleSignIn}
                            disabled={loading}
                            className="font-sans text-[10px] font-bold tracking-[0.2em] uppercase border border-black bg-black text-white hover:bg-white hover:text-black transition-colors w-full py-3.5 text-center disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Initialize via Google"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
