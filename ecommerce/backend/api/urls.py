from django.urls import path
from .views import RegisterAPIView, LoginAPIView, ProductListCreateAPIView, OrderCreateListAPIView

urlpatterns = [
    path('register/', RegisterAPIView.as_view(), name='api-register'),
    path('login/', LoginAPIView.as_view(), name='api-login'),
    path('products/', ProductListCreateAPIView.as_view(), name='api-products'),
    path('orders/', OrderCreateListAPIView.as_view(), name='api-orders'),
]
