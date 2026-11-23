import logging
from django.core.mail import send_mail
from django.conf import settings

logger = logging.getLogger(__name__)


def send_otp_email(email, otp_code, username):
    """
    Sends a 6-digit OTP code to the user's email via Gmail SMTP.
    Falls back gracefully to console logging and UI demo notification
    if credentials are placeholder or network/SMTP is unavailable.
    """
    expiry_minutes = getattr(settings, 'OTP_EXPIRY_SECONDS', 300) // 60
    subject = "Your Verification Code - Django Auth Demo"
    message = (
        f"Hi {username},\n\n"
        f"Thank you for registering on Django Auth Demo.\n"
        f"Your 6-digit OTP verification code is: {otp_code}\n\n"
        f"This code will expire in {expiry_minutes} minutes.\n"
        f"If you did not initiate this request, please disregard this email.\n\n"
        f"Best regards,\n"
        f"Django Auth Demo Team"
    )

    email_user = getattr(settings, 'EMAIL_HOST_USER', '').strip()
    email_pass = getattr(settings, 'EMAIL_HOST_PASSWORD', '').strip()

    # Determine if real SMTP credentials are provided
    is_real_smtp = (
        email_user
        and email_pass
        and "your_gmail" not in email_user.lower()
        and "your_gmail" not in email_pass.lower()
    )

    if is_real_smtp:
        try:
            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL or email_user,
                recipient_list=[email],
                fail_silently=False,
            )
            logger.info(f"OTP email dispatched successfully via Gmail SMTP to {email}")
            return True, "Verification code sent to your Gmail address.", otp_code
        except Exception as exc:
            logger.warning(f"SMTP dispatch failed: {exc}. Displaying fallback demo OTP.")
            print(f"\n==================================================================")
            print(f"[DEMO FALLBACK] SMTP Error: {exc}")
            print(f"[DEMO FALLBACK] OTP for {email} ({username}): {otp_code}")
            print(f"==================================================================\n")
            return (
                True,
                f"Demo mode: Code is {otp_code} (SMTP failed: {str(exc)[:50]}... Check .env App Password)",
                otp_code,
            )
    else:
        # Placeholder or demo mode
        print(f"\n==================================================================")
        print(f"[DEMO OTP] Recipient: {email} | Username: {username}")
        print(f"[DEMO OTP] 6-Digit Code: {otp_code}")
        print(f"[DEMO OTP] Add Gmail credentials in .env to send real emails.")
        print(f"==================================================================\n")
        return (
            True,
            f"Demo mode: Code is {otp_code} (Configure Gmail credentials in .env for real emails)",
            otp_code,
        )
