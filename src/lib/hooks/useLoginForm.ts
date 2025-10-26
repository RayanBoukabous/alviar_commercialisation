import { useState, useCallback, useMemo } from 'react';
import { useLogin } from '@/lib/hooks/useDjangoAuth';

interface UseLoginFormReturn {
    email: string;
    password: string;
    showPassword: boolean;
    isLoading: boolean;
    error: string;
    setEmail: (email: string) => void;
    setPassword: (password: string) => void;
    togglePasswordVisibility: () => void;
    handleSubmit: (e: React.FormEvent) => void;
    isFormValid: boolean;
}

export const useLoginForm = (): UseLoginFormReturn => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState('');

    const loginMutation = useLogin();

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const isFormValid = useMemo(() => {
        return email.trim() !== '' && password.trim() !== '' && !loginMutation.isPending;
    }, [email, password, loginMutation.isPending]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setLocalError('');

        if (!isFormValid) {
            setLocalError('Veuillez remplir tous les champs');
            return;
        }

        if (loginMutation.isPending) {
            return;
        }

        loginMutation.mutate({
            username: email,
            password,
        });
    }, [email, password, isFormValid, loginMutation]);

    const error = localError || loginMutation.error?.message || '';

    return {
        email,
        password,
        showPassword,
        isLoading: loginMutation.isPending,
        error,
        setEmail,
        setPassword,
        togglePasswordVisibility,
        handleSubmit,
        isFormValid,
    };
};
