"""
URL configuration for auth_demo project.
"""

from django.contrib import admin
from django.urls import path, re_path, include
from django.conf import settings
from django.views.static import serve

CYNERGY_ASSETS_DIR = settings.BASE_DIR / 'cynergy' / 'dist' / 'assets'

urlpatterns = [
    path('admin/', admin.site.urls),
    # django-allauth URLs (Google OAuth login, callback, etc.)
    path('accounts/', include('allauth.urls')),
    # Serve static assets (JS, CSS) for the Cynergy React application
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': CYNERGY_ASSETS_DIR}),
    # Accounts app (Home, Register, Login, Verify OTP, Resend OTP, Logout)
    path('', include('accounts.urls')),
]
