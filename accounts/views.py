from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout as auth_logout
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.utils import timezone
from django.conf import settings

from .models import EmailOTP
from .forms import RegisterForm, LoginForm, VerifyOTPForm
from .utils import send_otp_email


@login_required(login_url='login')
def home_view(request):
    """
    Renders the Cynergy platform (LabLink application) after successful login.
    Displays user info, email, auth provider (Google OAuth vs Email OTP), and logout button.
    """
    social_account = None
    if hasattr(request.user, 'socialaccount_set'):
        social_account = request.user.socialaccount_set.first()

    context = {
        'user': request.user,
        'social_account': social_account,
        'auth_method': 'Google OAuth 2.0' if social_account else 'Email OTP Verified',
    }
    return render(request, 'cynergy_app.html', context)


def register_view(request):
    """
    Registration page.
    Validates user credentials, creates a pending EmailOTP record,
    dispatches Gmail OTP verification, and redirects to the OTP verification page.
    """
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            username = form.cleaned_data['username']
            email = form.cleaned_data['email']
            password = form.cleaned_data['password']

            hashed_password = make_password(password)
            otp_code = EmailOTP.generate_otp()

            # Create or update pending registration OTP
            otp_obj, created = EmailOTP.objects.update_or_create(
                email=email,
                defaults={
                    'username': username,
                    'password': hashed_password,
                    'otp_code': otp_code,
                    'is_verified': False,
                }
            )

            # Ensure timestamp is refreshed if an existing record was updated
            if not created:
                otp_obj.updated_at = timezone.now()
                otp_obj.save(update_fields=['updated_at'])

            # Dispatch OTP to Gmail
            _, msg, _ = send_otp_email(email, otp_code, username)

            # Store pending email in session for OTP verification
            request.session['pending_otp_email'] = email
            messages.success(request, msg)
            return redirect('verify_otp')
    else:
        form = RegisterForm()

    return render(request, 'accounts/register.html', {'form': form})


def verify_otp_view(request):
    """
    OTP verification page with expiration check and resend functionality.
    Once verified, user account is created/activated, user is logged in, and redirected to home.
    """
    if request.user.is_authenticated:
        return redirect('home')

    email = request.session.get('pending_otp_email')
    if not email:
        messages.warning(request, "No pending registration found. Please register first.")
        return redirect('register')

    otp_obj = EmailOTP.objects.filter(email=email, is_verified=False).first()
    if not otp_obj:
        messages.warning(request, "No active OTP request found. Please register again.")
        return redirect('register')

    if request.method == 'POST':
        form = VerifyOTPForm(request.POST)
        if form.is_valid():
            entered_code = form.cleaned_data['otp_code']

            # Check if OTP expired
            if otp_obj.is_expired():
                messages.error(request, "This OTP has expired. Please click 'Resend OTP' to get a new code.")
                return redirect('verify_otp')

            # Check if OTP matches
            if entered_code != otp_obj.otp_code:
                messages.error(request, "Invalid OTP code. Please check your email and try again.")
                return redirect('verify_otp')

            # Verification successful: create or retrieve user account
            user, created = User.objects.get_or_create(
                username=otp_obj.username,
                defaults={
                    'email': otp_obj.email,
                    'password': otp_obj.password,
                }
            )
            if not created:
                # Update password and email if user existed
                user.email = otp_obj.email
                user.password = otp_obj.password
                user.save()

            # Mark OTP as verified
            otp_obj.is_verified = True
            otp_obj.save()

            # Record verified email in allauth EmailAddress model for seamless OAuth linking
            try:
                from allauth.account.models import EmailAddress
                EmailAddress.objects.get_or_create(
                    user=user,
                    email=user.email,
                    defaults={'verified': True, 'primary': True}
                )
            except Exception:
                pass

            # Clear pending session variable
            request.session.pop('pending_otp_email', None)

            # Log the user in
            login(request, user, backend='django.contrib.auth.backends.ModelBackend')
            messages.success(request, f"Email verified successfully! Welcome, {user.username}.")
            return redirect('home')
    else:
        form = VerifyOTPForm()

    context = {
        'form': form,
        'email': email,
        'username': otp_obj.username,
        'seconds_left': otp_obj.seconds_until_expiration(),
        'can_resend': otp_obj.can_resend(),
        'seconds_until_resend': otp_obj.seconds_until_resend(),
        'otp_expiry_minutes': getattr(settings, 'OTP_EXPIRY_SECONDS', 300) // 60,
    }
    return render(request, 'accounts/verify_otp.html', context)


def resend_otp_view(request):
    """
    Resends OTP with cooldown protection.
    Generates a fresh code, updates timestamp, and dispatches via Gmail SMTP.
    """
    email = request.session.get('pending_otp_email')
    if not email:
        messages.warning(request, "Session expired. Please register again.")
        return redirect('register')

    otp_obj = EmailOTP.objects.filter(email=email, is_verified=False).first()
    if not otp_obj:
        messages.warning(request, "No pending registration found.")
        return redirect('register')

    # Enforce resend cooldown
    if not otp_obj.can_resend():
        remaining = otp_obj.seconds_until_resend()
        messages.warning(request, f"Please wait {remaining} seconds before requesting a new OTP.")
        return redirect('verify_otp')

    # Generate fresh code and reset timestamp
    new_otp = EmailOTP.generate_otp()
    otp_obj.otp_code = new_otp
    otp_obj.updated_at = timezone.now()
    otp_obj.save()

    # Dispatch email
    _, msg, _ = send_otp_email(email, new_otp, otp_obj.username)
    messages.success(request, f"A new OTP has been dispatched. {msg}")
    return redirect('verify_otp')


def login_view(request):
    """
    Login page supporting username or email + password,
    alongside a Google Sign-In button powered by django-allauth.
    """
    if request.user.is_authenticated:
        return redirect('home')

    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            identifier = form.cleaned_data['username_or_email'].strip()
            password = form.cleaned_data['password']

            # Look up user by email or username
            user_obj = User.objects.filter(email__iexact=identifier).first()
            if not user_obj:
                user_obj = User.objects.filter(username__iexact=identifier).first()

            if user_obj:
                user = authenticate(request, username=user_obj.username, password=password)
                if user is not None:
                    login(request, user)
                    messages.success(request, f"Welcome back, {user.username}!")
                    next_url = request.GET.get('next') or request.POST.get('next') or 'home'
                    return redirect(next_url)

            messages.error(request, "Invalid username/email or password.")
    else:
        form = LoginForm()

    return render(request, 'accounts/login.html', {'form': form})


def logout_view(request):
    """
    Logout view that terminates session and redirects to login with flash notification.
    """
    auth_logout(request)
    messages.info(request, "You have been logged out successfully.")
    return redirect('login')
