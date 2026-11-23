from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
import secrets


class EmailOTP(models.Model):
    """
    Stores one-time passwords for email verification during registration.
    Tracks expiration timestamp, resend cooldown, and verification status.
    """
    email = models.EmailField(db_index=True)
    username = models.CharField(max_length=150)
    password = models.CharField(max_length=256)  # Pre-hashed with make_password
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ['-updated_at']
        verbose_name = 'Email OTP'
        verbose_name_plural = 'Email OTPs'

    def __str__(self):
        return f"{self.email} | OTP: {self.otp_code} | Verified: {self.is_verified}"

    def is_expired(self, expiry_seconds=None):
        """Check if the OTP has expired beyond configured lifetime."""
        if expiry_seconds is None:
            expiry_seconds = getattr(settings, 'OTP_EXPIRY_SECONDS', 300)
        return timezone.now() > self.updated_at + timedelta(seconds=expiry_seconds)

    def can_resend(self, cooldown_seconds=None):
        """Check if enough time has passed since last OTP was issued."""
        if cooldown_seconds is None:
            cooldown_seconds = getattr(settings, 'OTP_RESEND_COOLDOWN_SECONDS', 60)
        return timezone.now() >= self.updated_at + timedelta(seconds=cooldown_seconds)

    def seconds_until_resend(self, cooldown_seconds=None):
        """Seconds remaining before user is permitted to request another OTP."""
        if cooldown_seconds is None:
            cooldown_seconds = getattr(settings, 'OTP_RESEND_COOLDOWN_SECONDS', 60)
        diff = (self.updated_at + timedelta(seconds=cooldown_seconds) - timezone.now()).total_seconds()
        return max(0, int(diff))

    def seconds_until_expiration(self, expiry_seconds=None):
        """Seconds remaining before current OTP expires."""
        if expiry_seconds is None:
            expiry_seconds = getattr(settings, 'OTP_EXPIRY_SECONDS', 300)
        diff = (self.updated_at + timedelta(seconds=expiry_seconds) - timezone.now()).total_seconds()
        return max(0, int(diff))

    @staticmethod
    def generate_otp():
        """Generates a cryptographically secure 6-digit OTP string."""
        return f"{secrets.randbelow(900000) + 100000}"
