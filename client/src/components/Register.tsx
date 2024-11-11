import React, { useState } from 'react';

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
    errors?: Array<{message: string}>;
}

const Register: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

    const GRAPHQL_URL = 'http://localhost:3001/graphql';

    const registerUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const query = `
            mutation Register($username: String!, $email: String!, $password: String!) {
                register(username: $username, email: $email, password: $password) {
                    token
                    user {
                        id
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
            setMessage('User ${result.data.register.user.username} has been registered');
            setUsername('');
            setEmail('');
            setPassword('');
        }
    };

    return (
        
    )


