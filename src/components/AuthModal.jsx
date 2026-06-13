import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const RULES = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter',  test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter',  test: (p) => /[a-z]/.test(p) },
    { label: 'One number',            test: (p) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

const UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER   = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS  = '0123456789';
const SPECIAL = '!@#$%^&*()-_=+[]{}';
const ALL     = UPPER + LOWER + DIGITS + SPECIAL;

function generatePassword() {
    const pick = (str) => str[Math.floor(Math.random() * str.length)];
    // guarantee one of each required type, then fill to 14 chars
    const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)];
    for (let i = chars.length; i < 14; i++) chars.push(pick(ALL));
    // Fisher-Yates shuffle
    for (let i = chars.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join('');
}

const PasswordRules = ({ password }) => (
    <ul className="pw-rules">
        {RULES.map(({ label, test }) => {
            const met = test(password);
            return (
                <li key={label} className={`pw-rule${met ? ' pw-rule--met' : ''}`}>
                    <span className="pw-rule-icon">{met ? '✓' : '○'}</span>
                    {label}
                </li>
            );
        })}
    </ul>
);

const AuthModal = () => {
    const { authModal, setAuthModal, signIn, signUp } = useAuth();
    const [mode, setMode]         = useState('login');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw]     = useState(false);
    const [copied, setCopied]     = useState(false);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);
    const [success, setSuccess]   = useState('');
    const emailRef = useRef(null);

    useEffect(() => {
        if (authModal) {
            setError(''); setSuccess('');
            setEmail(''); setPassword('');
            setShowPw(false); setCopied(false);
            setMode('login');
            setTimeout(() => emailRef.current?.focus(), 50);
        }
    }, [authModal]);

    useEffect(() => {
        if (!authModal) return;
        const onKey = (e) => { if (e.key === 'Escape') setAuthModal(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [authModal, setAuthModal]);

    if (!authModal) return null;

    const isSignup    = mode === 'signup';
    const allRulesMet = RULES.every(({ test }) => test(password));

    const handleGenerate = () => {
        setPassword(generatePassword());
        setShowPw(true);
        setCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (isSignup && !allRulesMet) return;
        setLoading(true);

        const fn = isSignup ? signUp : signIn;
        const { error: err } = await fn(email, password);

        setLoading(false);
        if (err) {
            setError(err.message);
        } else if (isSignup) {
            setSuccess('Check your email to confirm your account.');
        } else {
            setAuthModal(false);
        }
    };

    return (
        <div className="auth-backdrop" onClick={() => setAuthModal(false)}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="auth-close" onClick={() => setAuthModal(false)}>✕</button>
                <h2 className="auth-title">{isSignup ? 'Create Account' : 'Sign In'}</h2>

                {success ? (
                    <p className="auth-success">{success}</p>
                ) : (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <input
                            ref={emailRef}
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="auth-input"
                        />

                        <div className="pw-field-wrap">
                            <input
                                type={showPw ? 'text' : 'password'}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="auth-input pw-input"
                            />
                            <div className="pw-field-actions">
                                <button type="button" className="pw-icon-btn" onClick={() => setShowPw((v) => !v)} title={showPw ? 'Hide' : 'Show'}>
                                    {showPw ? (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                                {isSignup && password.length > 0 && (
                                    <button type="button" className="pw-icon-btn" onClick={handleCopy} title="Copy password">
                                        {copied ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        ) : (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="9" y="9" width="13" height="13" rx="2"/>
                                                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>

                        {isSignup && (
                            <button type="button" className="pw-generate-btn" onClick={handleGenerate}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                                </svg>
                                Suggest password
                            </button>
                        )}

                        {isSignup && password.length > 0 && (
                            <PasswordRules password={password} />
                        )}

                        {error && <p className="auth-error">{error}</p>}
                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading || (isSignup && !allRulesMet)}
                        >
                            {loading ? '…' : isSignup ? 'Sign Up' : 'Sign In'}
                        </button>
                    </form>
                )}

                <p className="auth-switch">
                    {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        className="auth-switch-btn"
                        onClick={() => { setMode(isSignup ? 'login' : 'signup'); setError(''); setSuccess(''); }}
                    >
                        {isSignup ? 'Sign In' : 'Sign Up'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
