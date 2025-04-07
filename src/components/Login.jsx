import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../SupabaseClient';
import { LogIn } from 'lucide-react';

function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (!email || !password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            // Check if profile exists
            const { data: profileData, error: profileCheckError } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .single();

            if (profileCheckError) {
                console.error('Profile check error:', profileCheckError);
                setError(`Profile check failed: ${profileCheckError.message || 'User not found. Please check your email.'}`);
                setLoading(false);
                return;
            }

            // Attempt to sign in
            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
            });

            if (signInError) {
                console.error('Sign in error:', signInError);

                if (signInError.message === 'Email not confirmed') {
                    setError('Please confirm your email before logging in.');
                } else {
                    setError(`Sign in failed: ${signInError.message || 'Invalid email or password.'}`);
                }
                setLoading(false);
                return;
            }

            if (data?.user) {
                // Fetch user profile with role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role, id')
                    .eq('id', data.user.id)
                    .single();

                if (profileError) {
                    console.error('Profile fetch error:', profileError);
                    setError(`Profile fetch failed: ${profileError.message || 'Error fetching user profile. Please try again.'}`);
                    setLoading(false);
                    return;
                }

                setSuccessMessage('Login successful! Redirecting...');

                // Redirect based on role
                if (profile?.role === 'user') {
                    navigate('/user/home');
                } else if (profile?.role === 'owner') {
                    navigate('/owner/dashboard');
                } else {
                    setError('Invalid user role. Please contact support.');
                }
            } else {
                setError('No user data returned. Please try again.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError(`An unexpected error occurred: ${err.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <LogIn className="mx-auto h-12 w-12 text-blue-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Or{' '}
                        <button
                            onClick={() => navigate('/signup')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            create a new account
                        </button>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="email"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                autoComplete="current-password"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                    {successMessage && <div className="text-green-600 text-sm text-center">{successMessage}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;