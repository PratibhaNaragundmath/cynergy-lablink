from django.urls import path, re_path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('register/', views.register_view, name='register'),
    path('verify-otp/', views.verify_otp_view, name='verify_otp'),
    path('resend-otp/', views.resend_otp_view, name='resend_otp'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    # React Router routes for Cynergy application
    re_path(r'^(?:resources|bookings|my-bookings|faculty|analytics|admin-portal|overview).*$', views.home_view, name='cynergy_routes'),
]
