// Dynamically set API URL based on current hostname
// This allows the app to work on mobile devices on the same network
const API_URL = `http://${window.location.hostname}:5000/api/auth`;

// Toggle Password Visibility
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function () {
        const input = this.parentElement.querySelector('input');
        const icon = this.querySelector('.eye-icon');
        if (input.type === 'password') {
            input.type = 'text';
            icon.src = 'assets/icon-eye-off.png';
        } else {
            input.type = 'password';
            icon.src = 'assets/icon-eye.png';
        }
    });
});

// Password Strength Indicator
const passwordInput = document.getElementById('password');
const strengthBar = document.querySelector('.strength-bar span');
const strengthText = document.querySelector('.strength-text');

if (passwordInput && strengthBar) {
    passwordInput.addEventListener('input', function () {
        const password = this.value;
        let strength = 0;
        let text = 'Weak';
        let color = '#ef4444';

        // Length check
        if (password.length >= 8) strength += 25;
        if (password.length >= 12) strength += 15;

        // Contains lowercase
        if (/[a-z]/.test(password)) strength += 15;

        // Contains uppercase
        if (/[A-Z]/.test(password)) strength += 15;

        // Contains number
        if (/[0-9]/.test(password)) strength += 15;

        // Contains special character
        if (/[^a-zA-Z0-9]/.test(password)) strength += 15;

        // Set text and color based on strength
        if (strength >= 80) {
            text = 'Strong';
            color = '#22c55e';
        } else if (strength >= 50) {
            text = 'Medium';
            color = '#f59e0b';
        } else if (strength >= 25) {
            text = 'Weak';
            color = '#ef4444';
        } else {
            text = 'Very Weak';
            color = '#ef4444';
        }

        strengthBar.style.width = `${Math.min(strength, 100)}%`;
        strengthBar.style.background = color;
        strengthText.textContent = text;
        strengthText.style.color = color;
    });
}

// Confirm Password Validation
const confirmPasswordInput = document.getElementById('confirmPassword');

if (passwordInput && confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', function () {
        if (this.value !== passwordInput.value) {
            this.setCustomValidity('Passwords do not match');
        } else {
            this.setCustomValidity('');
        }
    });
}

// Show notification message
function showNotification(message, type = 'error') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 5000);

    // Close button
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
}

// Login Form Submission
const loginForm = document.getElementById('loginForm');

if (loginForm) {
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<span>Logging in...</span>';
            submitBtn.disabled = true;

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));

                showNotification('Login successful! Redirecting...', 'success');

                // Redirect to dashboard or home
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            } else {
                showNotification(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Unable to connect to server. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Signup Form Submission
const signupForm = document.getElementById('signupForm');

if (signupForm) {
    signupForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const name = document.getElementById('fullname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            showNotification('Passwords do not match!', 'error');
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long', 'error');
            return;
        }

        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        try {
            // Show loading state
            submitBtn.innerHTML = '<span>Creating account...</span>';
            submitBtn.disabled = true;

            const response = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                showNotification('Account created successfully! Redirecting to login...', 'success');

                // Redirect to login page
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                showNotification(data.message || 'Signup failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Unable to connect to server. Please try again.', 'error');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Input Focus Animation
document.querySelectorAll('.input-wrapper input').forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.classList.add('focused');
    });

    input.addEventListener('blur', function () {
        this.parentElement.classList.remove('focused');
    });
});

// Check if user is already logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (token && user) {
        // User is logged in
        return JSON.parse(user);
    }
    return null;
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        gap: 1rem;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: var(--shadow-lg);
        max-width: 400px;
    }
    
    .notification-error {
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #dc2626;
    }
    
    .notification-success {
        background: #f0fdf4;
        border: 1px solid #bbf7d0;
        color: #16a34a;
    }
    
    [data-theme="dark"] .notification-error {
        background: #450a0a;
        border-color: #7f1d1d;
        color: #fca5a5;
    }
    
    [data-theme="dark"] .notification-success {
        background: #052e16;
        border-color: #166534;
        color: #86efac;
    }
    
    .notification-close {
        background: none;
        border: none;
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0.6;
        color: inherit;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    .notification.fade-out {
        animation: slideOut 0.3s ease forwards;
    }
    
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(notificationStyles);

