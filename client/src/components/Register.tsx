import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RegisterProps {
    data?: {
        register: {
            token: string;
            user: {
                id: string;
                email: string;
                username: string;
            };
        };
    };
    errors?: Array<{ message: string }>;
}

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const navigate = useNavigate();

    const GRAPHQL_URL = import.meta.env.VITE_SOCKET_URL || 'https://looplab.onrender.com/graphql';

    const registerUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = `
            mutation Register($username: String!, $email: String!, $password: String!) {
                register(username: $username, email: $email, password: $password) {
                    token
                    user {
                        _id
                        email
                        username
                    }
                }
            }
        `;

        const response = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables: { username, email, password },
            }),
        });

        const result: RegisterProps = await response.json();

        if (result.errors) {
            setIsError(true);
            setMessage(result.errors[0].message);
        } else if (result.data) {
            setIsError(false);
            setMessage('User has been registered');
            setUsername('');
            setEmail('');
            setPassword('');
            navigate('/login');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-indigo-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Register</h2>

                <form onSubmit={registerUser} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-500 text-white py-2 px-4 rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Register
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-2 text-center rounded ${isError ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                        {message}
                    </div>
                )}
                <div className="mt-4 text-center">
                    Already have an account?{' '}
                    <button
                        onClick={() => navigate('/login')}
                        className="text-indigo-500 hover:underline"
                    >
                        Login here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;