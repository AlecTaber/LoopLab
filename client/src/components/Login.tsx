import React, { useState } from 'react';

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
    errors?: Array<{message: string}>;
}

const Login: React.FC = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string | null>(null);
    const [isError, setIsError] = useState<boolean>(false);

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
