import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

const RULES = [
    { label: 'At least 8 characters', test: (p) => p.length >= 8 },
    { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p) },
    { label: 'One number', test: (p) => /[0-9]/.test(p) },
    { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

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
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const emailRef = useRef(null);

    useEffect(() => {
        if (authModal) {
            setError('');
            setSuccess('');
            setEmail('');
            setPassword('');
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

    const allRulesMet = RULES.every(({ test }) => test(password));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (mode === 'signup' && !allRulesMet) return;
        setLoading(true);

        const fn = mode === 'login' ? signIn : signUp;
        const { error: err } = await fn(email, password);

        setLoading(false);
        if (err) {
            setError(err.message);
        } else if (mode === 'signup') {
            setSuccess('Check your email to confirm your account.');
        } else {
            setAuthModal(false);
        }
    };

    return (
        <div className="auth-backdrop" onClick={() => setAuthModal(false)}>
            <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
                <button className="auth-close" onClick={() => setAuthModal(false)}>✕</button>
                <h2 className="auth-title">{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>

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
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="auth-input"
                        />
                        {mode === 'signup' && password.length > 0 && (
                            <PasswordRules password={password} />
                        )}
                        {error && <p className="auth-error">{error}</p>}
                        <button
                            type="submit"
                            className="auth-submit"
                            disabled={loading || (mode === 'signup' && !allRulesMet)}
                        >
                            {loading ? '…' : mode === 'login' ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                )}

                <p className="auth-switch">
                    {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                    <button
                        className="auth-switch-btn"
                        onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); setSuccess(''); }}
                    >
                        {mode === 'login' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default AuthModal;
