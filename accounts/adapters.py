from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model

User = get_user_model()


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """
    Custom social account adapter that automatically connects Google OAuth accounts
    to existing user accounts with matching email addresses, bypassing intermediate
    signup/confirmation pages.
    """

    def pre_social_login(self, request, sociallogin):
        # If social login is already connected to an existing user, proceed
        if sociallogin.is_existing:
            return

        # Extract email from the social account
        email = None
        if sociallogin.email_addresses:
            for email_address in sociallogin.email_addresses:
                if email_address.email:
                    email = email_address.email.strip().lower()
                    break
        elif 'email' in sociallogin.account.extra_data:
            email = sociallogin.account.extra_data['email'].strip().lower()

        if not email:
            return

        # Check if an existing local user has this email
        user = User.objects.filter(email__iexact=email).first()
        if user:
            # Mark or create allauth EmailAddress record as verified
            EmailAddress.objects.get_or_create(
                user=user,
                email=user.email,
                defaults={'verified': True, 'primary': True}
            )

            # Auto-connect this social login to the existing user
            sociallogin.connect(request, user)
