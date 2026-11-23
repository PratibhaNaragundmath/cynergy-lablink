from django.test import TestCase, Client
from django.urls import reverse
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.utils import timezone
from datetime import timedelta
from allauth.socialaccount.models import SocialAccount, SocialApp
from allauth.socialaccount.providers import registry

from .models import EmailOTP


class AuthDemoTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.register_url = reverse('register')
        self.verify_otp_url = reverse('verify_otp')
        self.resend_otp_url = reverse('resend_otp')
        self.login_url = reverse('login')
        self.logout_url = reverse('logout')
        self.home_url = reverse('home')

        self.valid_user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'StrongPassword123!',
            'confirm_password': 'StrongPassword123!',
        }

    # ---------------------------------------------------------
    # 1. Registration & OTP Generation Tests
    # ---------------------------------------------------------
    def test_registration_creates_otp_and_redirects(self):
        """Registering with valid data should generate an EmailOTP and redirect to verify_otp."""
        response = self.client.post(self.register_url, self.valid_user_data)
        self.assertRedirects(response, self.verify_otp_url)

        # OTP object should exist
        otp_record = EmailOTP.objects.filter(email='testuser@example.com').first()
        self.assertIsNotNone(otp_record)
        self.assertEqual(len(otp_record.otp_code), 6)
        self.assertTrue(otp_record.otp_code.isdigit())
        self.assertFalse(otp_record.is_verified)
        self.assertEqual(self.client.session.get('pending_otp_email'), 'testuser@example.com')

        # User should NOT be created in User model before OTP verification
        self.assertFalse(User.objects.filter(email='testuser@example.com').exists())

    def test_registration_password_mismatch(self):
        """Password and confirm password must match."""
        data = self.valid_user_data.copy()
        data['confirm_password'] = 'MismatchPassword123!'
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Passwords do not match.")
        self.assertFalse(EmailOTP.objects.filter(email='testuser@example.com').exists())

    def test_registration_duplicate_username_and_email(self):
        """Duplicate username or email should be rejected."""
        User.objects.create_user(username='existinguser', email='existing@example.com', password='password123')

        # Duplicate username
        data = self.valid_user_data.copy()
        data['username'] = 'existinguser'
        response = self.client.post(self.register_url, data)
        self.assertContains(response, "This username is already taken.")

        # Duplicate email
        data = self.valid_user_data.copy()
        data['email'] = 'existing@example.com'
        response = self.client.post(self.register_url, data)
        self.assertContains(response, "An account with this email address already exists.")

    # ---------------------------------------------------------
    # 2. OTP Verification Tests
    # ---------------------------------------------------------
    def test_otp_verification_success(self):
        """Submitting correct OTP creates User, authenticates session, and redirects to home."""
        # Initiate registration
        self.client.post(self.register_url, self.valid_user_data)
        otp_record = EmailOTP.objects.get(email='testuser@example.com')

        # Submit OTP
        response = self.client.post(self.verify_otp_url, {'otp_code': otp_record.otp_code})
        self.assertRedirects(response, self.home_url)

        # User is now created and logged in
        user = User.objects.filter(username='testuser').first()
        self.assertIsNotNone(user)
        self.assertEqual(user.email, 'testuser@example.com')

        otp_record.refresh_from_db()
        self.assertTrue(otp_record.is_verified)

        # Home page should be accessible now
        home_response = self.client.get(self.home_url)
        self.assertEqual(home_response.status_code, 200)
        self.assertContains(home_response, "testuser")
        self.assertContains(home_response, "Email OTP Verified")

    def test_otp_verification_invalid_code(self):
        """Submitting wrong OTP shows an error and does not activate user."""
        self.client.post(self.register_url, self.valid_user_data)

        # Submit invalid code
        response = self.client.post(self.verify_otp_url, {'otp_code': '000000'}, follow=True)
        self.assertContains(response, "Invalid OTP code")
        self.assertFalse(User.objects.filter(username='testuser').exists())

    def test_otp_expiration(self):
        """Expired OTP cannot be verified."""
        self.client.post(self.register_url, self.valid_user_data)
        otp_record = EmailOTP.objects.get(email='testuser@example.com')

        # Artificially age the OTP beyond expiry limit (6 minutes ago)
        EmailOTP.objects.filter(id=otp_record.id).update(
            updated_at=timezone.now() - timedelta(minutes=6)
        )

        response = self.client.post(self.verify_otp_url, {'otp_code': otp_record.otp_code}, follow=True)
        self.assertContains(response, "This OTP has expired")
        self.assertFalse(User.objects.filter(username='testuser').exists())

    # ---------------------------------------------------------
    # 3. Resend OTP Tests
    # ---------------------------------------------------------
    def test_resend_otp_cooldown_and_success(self):
        """Resend OTP respects cooldown and generates fresh code once cooldown passes."""
        self.client.post(self.register_url, self.valid_user_data)
        initial_otp = EmailOTP.objects.get(email='testuser@example.com')

        # Immediate resend attempt should trigger cooldown warning
        response = self.client.post(self.resend_otp_url, follow=True)
        self.assertContains(response, "Please wait")

        # Age the OTP past cooldown (e.g., 70 seconds ago)
        EmailOTP.objects.filter(id=initial_otp.id).update(
            updated_at=timezone.now() - timedelta(seconds=70)
        )

        # Resend should now succeed
        response = self.client.post(self.resend_otp_url, follow=True)
        self.assertContains(response, "A new OTP has been dispatched")

        updated_otp = EmailOTP.objects.get(email='testuser@example.com')
        self.assertIsNotNone(updated_otp.otp_code)

    # ---------------------------------------------------------
    # 4. Login and Logout Tests
    # ---------------------------------------------------------
    def test_login_and_logout_flow(self):
        """User can log in with username/email and password, and then log out."""
        # Create user directly
        user = User.objects.create_user(username='loginuser', email='loginuser@example.com', password='MyPassword123!')

        # 1. Login with username
        response = self.client.post(self.login_url, {
            'username_or_email': 'loginuser',
            'password': 'MyPassword123!',
        })
        self.assertRedirects(response, self.home_url)

        # Verify home page renders
        home_res = self.client.get(self.home_url)
        self.assertEqual(home_res.status_code, 200)
        self.assertContains(home_res, "loginuser")

        # 2. Logout
        logout_res = self.client.get(self.logout_url)
        self.assertRedirects(logout_res, self.login_url)

        # Home page now redirects to login
        unauth_res = self.client.get(self.home_url)
        self.assertEqual(unauth_res.status_code, 302)
        self.assertIn('/login/', unauth_res.url)

        # 3. Login with email
        response_email = self.client.post(self.login_url, {
            'username_or_email': 'loginuser@example.com',
            'password': 'MyPassword123!',
        })
        self.assertRedirects(response_email, self.home_url)

    def test_login_invalid_credentials(self):
        """Invalid credentials show error message."""
        response = self.client.post(self.login_url, {
            'username_or_email': 'nonexistent',
            'password': 'wrongpassword',
        })
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Invalid username/email or password.")

    # ---------------------------------------------------------
    # 5. Google OAuth 2.0 Integration Tests
    # ---------------------------------------------------------
    def test_google_provider_registered(self):
        """Ensure Google provider is loaded in allauth registry."""
        from allauth.socialaccount.providers.google.provider import GoogleProvider
        self.assertEqual(GoogleProvider.id, 'google')
        provider_class = registry.get_class('google')
        self.assertEqual(provider_class, GoogleProvider)

    def test_google_oauth_urls_and_buttons_exist(self):
        """Google OAuth login URL resolves and is displayed on login and register pages."""
        # Check login page contains Google Sign-In button
        login_res = self.client.get(self.login_url)
        self.assertEqual(login_res.status_code, 200)
        self.assertContains(login_res, "Continue with Google")
        self.assertContains(login_res, "/accounts/google/login/")

        # Check register page contains Google Sign-Up button
        register_res = self.client.get(self.register_url)
        self.assertEqual(register_res.status_code, 200)
        self.assertContains(register_res, "Sign up with Google")
        self.assertContains(register_res, "/accounts/google/login/")

    def test_google_authenticated_user_display(self):
        """A user logged in via Google OAuth shows 'Google OAuth 2.0' badge on home page."""
        user = User.objects.create_user(username='googleuser', email='googleuser@gmail.com')
        SocialAccount.objects.create(
            user=user,
            provider='google',
            uid='12345678901234567890',
            extra_data={'email': 'googleuser@gmail.com', 'name': 'Google User'}
        )

        self.client.force_login(user)
        response = self.client.get(self.home_url)
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Google OAuth 2.0")
