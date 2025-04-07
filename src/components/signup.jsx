import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from '../../SupabaseClient';
import { UserPlus } from 'lucide-react';

function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phoneNumber: '',
        businessName: '',
        role: 'user',
    });
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            // Sign up with Supabase Auth with detailed logging
            console.log('Attempting Supabase signup with:', formData);
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${window.location.origin}/login`,
                    data: {
                        full_name: formData.fullName,
                        phone_number: formData.phoneNumber,
                        role: formData.role,
                        business_name: formData.role === 'owner' ? formData.businessName : null,
                    },
                },
            });

            if (signUpError) {
                console.error('Supabase signup error:', signUpError);
                setError(`Signup failed: ${signUpError.message || 'An error occurred during signup'}`);
                setLoading(false);
                return;
            }

            console.log('Supabase signup successful. User data:', signUpData);

            if (signUpData?.user) {
                // Insert into profiles table with detailed logging
                console.log('Attempting to insert profile:', {
                    id: signUpData.user.id,
                    full_name: formData.fullName,
                    email: formData.email,
                    phone_number: formData.phoneNumber,
                    business_name: formData.role === 'owner' ? formData.businessName : null,
                    role: formData.role,
                    password: formData.password,
                });

                const { error: profileError } = await supabase
                    .from('profiles')
                    .insert([
                        {
                            id: signUpData.user.id,
                            full_name: formData.fullName,
                            email: formData.email,
                            phone_number: formData.phoneNumber,
                            business_name: formData.role === 'owner' ? formData.businessName : null,
                            role: formData.role,
                            password: formData.password,
                        },
                    ]);

                if (profileError) {
                    console.error('Profile insert error:', profileError);
                    setError(`Profile creation failed: ${profileError.message || 'An error occurred during profile creation'}`);
                    setLoading(false);
                    return;
                }

                console.log('Profile inserted successfully.');
                setSuccessMessage('Account created successfully! Redirecting to login...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                console.error('Signup successful, but no user data returned.');
                setError('Signup successful, but no user data was returned. Please try again.');
                setLoading(false);
            }
        } catch (err) {
            console.error('Unexpected error during signup:', err);
            setError(`An unexpected error occurred: ${err.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
                <div className="text-center">
                    <UserPlus className="mx-auto h-12 w-12 text-blue-500" />
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Already have an account?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Account Type</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            >
                                <option value="user">User</option>
                                <option value="owner">Station Owner</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input
                                id="phoneNumber"
                                name="phoneNumber"
                                type="tel"
                                required
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                            />
                        </div>

                        {formData.role === 'owner' && (
                            <div>
                                <label htmlFor="businessName" className="block text-sm font-medium text-gray-700">Business Name</label>
                                <input
                                    id="businessName"
                                    name="businessName"
                                    type="text"
                                    required
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
                                />
                            </div>
                        )}
                    </div>

                    {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                    {successMessage && <div className="text-green-600 text-sm text-center">{successMessage}</div>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Signup;