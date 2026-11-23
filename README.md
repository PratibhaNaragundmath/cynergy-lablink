# Django Authentication Demo (Email OTP & Google OAuth 2.0)

A clean, standalone, production-ready Django authentication demo featuring:
- **Attractive, Responsive Modern UI** styled with Tailwind CSS.
- **Email Registration with Gmail OTP**: 6-digit one-time passcode verification.
- **OTP Expiration & Resend**: Timed expiry (default 5 minutes), live countdown timer, and 60-second resend cooldown protection.
- **Google Sign-In**: Integrated using **Google OAuth 2.0** and **django-allauth**.
- **Secure Environment Configurations**: Configured via `.env` and `python-dotenv`.
- **Protected Home Dashboard**: Displays authenticated user information, verification status, and provider method.
- **Logout Support**: Clean session invalidation with flash messages.
- **Zero Unnecessary Modules**: Kept strictly focused on authentication and easily extensible.

---

## 📁 Project Structure

```
PROMTWARS/
├── manage.py
├── requirements.txt
├── .env.example              # Template for environment variables
├── .env                      # Local secret variables (gitignored)
├── .gitignore
├── README.md
├── auth_demo/
│   ├── settings.py           # Configured with python-dotenv & django-allauth
│   ├── urls.py               # Root routes including allauth & accounts
│   ├── wsgi.py
│   └── asgi.py
├── accounts/
│   ├── models.py             # EmailOTP model with expiry and cooldown logic
│   ├── forms.py              # RegisterForm, LoginForm, VerifyOTPForm
│   ├── views.py              # Register, Verify OTP, Resend, Login, Home, Logout
│   ├── urls.py               # App routes
│   ├── utils.py              # Gmail SMTP dispatcher with fallback demo mode
│   ├── admin.py              # EmailOTP admin model registration
│   └── tests.py              # Comprehensive automated test suite (12 tests)
└── templates/
    ├── base.html             # Common Tailwind layout, navbar & flash alerts
    └── accounts/
        ├── login.html        # Sign-in form + Google OAuth button
        ├── register.html     # Registration form + Google OAuth button
        ├── verify_otp.html   # OTP code input + live countdown + Resend button
        └── home.html         # Protected user profile dashboard + logout
```

---

## 🚀 Quick Setup & Run Instructions

### 1. Prerequisites
- Python 3.10+ (tested on Python 3.12)
- Pip

### 2. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` (already created for you):
```bash
cp .env.example .env
```

Your `.env` contains:
```ini
SECRET_KEY=django-insecure-demo-secret-key-change-in-production-123456789
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Gmail SMTP Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_gmail@gmail.com
EMAIL_HOST_PASSWORD=your_gmail_app_password
DEFAULT_FROM_EMAIL=your_gmail@gmail.com

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# OTP Configuration
OTP_EXPIRY_SECONDS=300
OTP_RESEND_COOLDOWN_SECONDS=60
```

> **Note on Demo Mode**: If you run without entering real Gmail or Google credentials, the demo gracefully falls back to printing the generated 6-digit OTP in your terminal console and displaying it in a demo notice, so you can test the complete flow immediately out of the box!

### 4. Run Database Migrations
```bash
python manage.py makemigrations accounts
python manage.py migrate
```

### 5. Run the Application on Localhost
```bash
python manage.py runserver
```
Visit: **[http://127.0.0.1:8000/](http://127.0.0.1:8000/)**

---

## 📧 How to Configure Gmail SMTP

To send actual verification emails to Gmail inboxes:
1. Go to your **[Google Account Security Settings](https://myaccount.google.com/security)**.
2. Enable **2-Step Verification**.
3. Under **2-Step Verification**, scroll to **App passwords** (or go to **[https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**).
4. Create an App name (e.g., `Django Auth Demo`) and click **Create**.
5. Copy the 16-character password generated.
6. Open `.env` and fill:
   ```ini
   EMAIL_HOST_USER=your_actual_email@gmail.com
   EMAIL_HOST_PASSWORD=xxxx xxxx xxxx xxxx
   DEFAULT_FROM_EMAIL=your_actual_email@gmail.com
   ```

---

## 🌐 How to Configure Google OAuth 2.0 Sign-In

To enable one-click Google Sign-In with real credentials:
1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create a new project (e.g. `Django Auth Demo`).
3. Navigate to **APIs & Services > Credentials**.
4. Click **Create Credentials > OAuth client ID**.
5. Select Application type: **Web application**.
6. Set:
   - **Authorized JavaScript origins**: `http://127.0.0.1:8000` and `http://localhost:8000`
   - **Authorized redirect URIs**: `http://127.0.0.1:8000/accounts/google/login/callback/`
7. Copy the **Client ID** and **Client Secret** into your `.env`:
   ```ini
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

---

## 🧪 Running the Automated Tests

A comprehensive test suite is included covering:
- Registration validation (unique username, unique email, password matching, min-length).
- 6-digit OTP generation and dispatch.
- Correct OTP verification, user creation, session authentication, and redirect to Home.
- Invalid OTP rejection.
- OTP expiration handling.
- Resend OTP cooldown and refresh.
- Login with Username or Email.
- Logout session termination.
- Google OAuth 2.0 provider registration and button rendering.
- SocialAccount display on Home page.

Run all tests:
```bash
python manage.py test accounts
```
Expected output:
```
Ran 12 tests in ~13s
OK
```

---

## 🛡️ Security Features
- Environment variables never tracked in source control (`.env` in `.gitignore`).
- Passwords hashed with Django's cryptographic PBKDF2 algorithm (`make_password`).
- Cryptographically secure 6-digit random token generation (`secrets.randbelow`).
- OTP timestamping with strict expiry and cooldown protection against brute-force or spamming.
- Cross-Site Request Forgery (CSRF) protection on all POST forms.
- Protected dashboard routes with `@login_required`.
