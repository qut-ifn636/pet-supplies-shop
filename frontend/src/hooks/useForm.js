import { useState } from 'react';

export function useForm(initialValues) {
    const [formData, setFormData] = useState(initialValues);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return { formData, setFormData, error, setError, loading, setLoading, handleChange };
}
