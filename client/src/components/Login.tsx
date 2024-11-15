import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LoginProps {
    data?: {
        login: {
            token: string;
            user: {
                id: string;
                username: string;
                email: string;
            };
        };
    };
    errors?: Array<{ message: string }>;
}

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);
    const navigate = useNavigate();

    const GRAPHQL_URL = 'http://localhost:3001/graphql';

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = `
            mutation Login($email: String!, $password: String!) {  
                login(email: $email, password: $password) {
                    token
                    user {
                        id
                        username
                        email
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
                variables: { email, password },
            }),
        });

        const result: LoginProps = await response.json();

        if (result.errors) {
            setIsError(true);
            setMessage(result.errors[0].message);
        } else if (result.data) {
            setIsError(false);
            setMessage('Login successful');
            setEmail('');
            setPassword('');

            localStorage.setItem('token', result.data.login.token);
            navigate('/home');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Login</h2>

                <form onSubmit={handleLogin} className="space-y-4">
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
                        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    >
                        Login
                    </button>
                </form>

                {message && (
                    <div className={`mt-4 p-2 text-center rounded ${isError ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
                        {message}
                    </div>
                )}
                <div className="mt-4 text-center">
                    Don't have an account?{' '}
                    <button
                        onClick={() => navigate('/')}
                        className="text-indigo-600 hover:underline"
                    >
                        Register here
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;