import { useDictionaryStore } from '../lib/store';
import { auth, signInWithCredential, signOut } from '../lib/firebase';
import { GoogleAuthProvider } from 'firebase/auth';
import { LogIn, LogOut, Loader2, Cloud } from 'lucide-react';

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
                // Pass the Chrome access token to Firebase
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
        <div className="flex flex-col h-full bg-slate-50 p-6">
            <div className="flex items-center gap-3 mb-8 text-blue-600">
                <Cloud size={32} />
                <h2 className="text-2xl font-black tracking-tight text-slate-800">Sync Config</h2>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col items-center text-center">
                {user ? (
                    <>
                        <img
                            src={user.photoURL}
                            alt="Avatar"
                            className="w-16 h-16 rounded-full mb-4 shadow-sm"
                        />
                        <h3 className="font-bold text-lg text-slate-800">{user.displayName}</h3>
                        <p className="text-sm text-slate-500 mb-6">{user.email}</p>

                        <button
                            onClick={handleSignOut}
                            className="flex items-center gap-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full font-semibold transition-colors w-full justify-center"
                        >
                            <LogOut size={18} /> Sign Out
                        </button>
                        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
                            Your words are safely synced to the cloud. You can access them on any device by logging in.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Cloud size={24} className="text-slate-400" />
                        </div>
                        <h3 className="font-bold text-lg text-slate-800 mb-2">Sync Across Devices</h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Sign in with your Google account to automatically sync your personal dictionary across all your laptops.
                        </p>

                        <button
                            onClick={handleSignIn}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-md transition-all w-full"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
                            Sign in with Google
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
