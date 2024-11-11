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

const Login: React.FC =
