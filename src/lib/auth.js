// Single source of truth for the client-side session.
//
// This is a demo/internal gate, not real authentication: the credentials below
// ship in the JS bundle and anyone can read them. Swap `verifyCredentials` for
// a real API call if this ever needs to actually protect something.

const SESSION_KEYS = ['isAuthenticated', 'userRole', 'username', 'displayName', 'loginTime'];

export const SESSION_DURATION = 3600000; // 1 hour

// `username` is what you sign in with; `name` and `role` are what the header
// shows. They're separate on purpose — the login is an account id, the other
// two are how the person is presented.
const ACCOUNTS = [
    { username: 'admin', password: 'admin2026', name: 'Thor', role: 'Super Admin' },
    { username: 'moderator', password: 'mod123', name: 'Moderator', role: 'Moderator' },
];

export const verifyCredentials = (username, password) =>
    ACCOUNTS.find((a) => a.username === username && a.password === password) || null;

export const clearSession = () => {
    SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
};

// Must be called at render time, never at module load — see main.jsx.
export const isAuthenticated = () => {
    if (localStorage.getItem('isAuthenticated') !== 'true') return false;

    const loginTime = Number(localStorage.getItem('loginTime'));
    if (!loginTime || Date.now() - loginTime >= SESSION_DURATION) {
        clearSession();
        return false;
    }

    return true;
};

export const startSession = ({ username, name, role }) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('username', username);
    localStorage.setItem('displayName', name);
    localStorage.setItem('loginTime', Date.now().toString());
};
