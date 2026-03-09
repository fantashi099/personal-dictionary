import { useDictionaryStore } from '../lib/store';
import { auth, signInWithCredential, signOut } from '../lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth/web-extension';

export function SettingsTab() {
    const user = useDictionaryStore(state => state.user);
    const loading = useDictionaryStore(state => state.loading);

    const handleSignIn = async () => {
        const currentAuth = auth;
        if (!currentAuth) return alert("Firebase not configured yet.");

        chrome.identity.getAuthToken({ interactive: true }, async (tokenResponse: unknown) => {
            const token = typeof tokenResponse === 'string' ? tokenResponse : (tokenResponse as { token?: string })?.token;
            if (chrome.runtime.lastError || !token) {
                console.error("Chrome Identity Error:", chrome.runtime.lastError);
                alert("Sign-in failed. Please try again.");
                return;
            }

            try {
                const credential = GoogleAuthProvider.credential(null, token);
                await signInWithCredential(currentAuth, credential);
            } catch (err) {
                console.error("Firebase auth error:", err);
                alert("Sign-in failed. Please try again.");
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
        <div className="flex flex-col h-full bg-paper p-6 overflow-y-auto pb-20">
            <div className="mb-10 text-ink border-b border-ink pb-4">
                <h2 className="font-serif text-3xl font-black tracking-tighter uppercase">Sync Strategy</h2>
            </div>

            <div className="border border-ink bg-paper-dim p-6 flex flex-col items-start shadow-brutal-lg">
                {user ? (
                    <>
                        <div className="w-full border-b border-ink pb-6 mb-6 flex items-end justify-between">
                            <div>
                                <h3 className="font-serif text-2xl font-bold text-ink capitalize">{user.displayName}</h3>
                                <p className="font-sans text-micro tracking-widest uppercase opacity-60 mt-1">{user.email}</p>
                            </div>
                            {user.photoURL && (
                                <img
                                    src={user.photoURL}
                                    alt="Avatar"
                                    className="w-12 h-12 grayscale border border-ink"
                                />
                            )}
                        </div>

                        <p className="font-sans text-micro tracking-widest uppercase text-ink leading-relaxed mb-8">
                            Status: <span className="text-success font-bold ml-1">✓ Authenticated</span><br /><br />
                            Data flows actively across devices.
                        </p>

                        <button
                            onClick={handleSignOut}
                            className="font-sans text-micro font-bold tracking-[0.2em] uppercase border border-ink bg-paper text-ink hover:bg-ink hover:text-paper transition-colors duration-200 ease-out w-full py-3.5 text-center"
                        >
                            Terminate Session
                        </button>
                    </>
                ) : (
                    <>
                        <div className="w-full border-b border-ink pb-6 mb-6">
                            <h3 className="font-serif italic text-2xl text-ink">Identity Protocol</h3>
                        </div>
                        <p className="font-sans text-micro tracking-[0.15em] uppercase opacity-70 leading-loose mb-8">
                            Establish persistent connection across local clients. Unauthenticated sessions rely on ephemeral block storage.
                        </p>

                        <button
                            onClick={handleSignIn}
                            disabled={loading}
                            className="font-sans text-micro font-bold tracking-[0.2em] uppercase border border-ink bg-ink text-paper hover:bg-paper hover:text-ink transition-colors duration-200 ease-out w-full py-3.5 text-center disabled:opacity-50"
                        >
                            {loading ? "Authenticating..." : "Initialize via Google"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
