const handleLogin = async (e) => {
    e.preventDefault();
    try {
        const response = await authService.login(credentials);
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        // ... rest of your login logic
    } catch (error) {
        console.error('Login error:', error);
    }
}; 