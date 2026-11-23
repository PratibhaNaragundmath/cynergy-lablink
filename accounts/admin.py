from django.contrib import admin
from .models import EmailOTP


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'otp_code', 'is_verified', 'created_at', 'updated_at')
    list_filter = ('is_verified', 'created_at')
    search_fields = ('email', 'username', 'otp_code')
    readonly_fields = ('created_at', 'updated_at')
