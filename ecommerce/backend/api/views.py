# ============================================================================
# ecommerce/backend/api/views.py
# Django REST Framework (DRF) Views implementing all required E-Commerce endpoints
# ============================================================================

import random
from decimal import Decimal
from django.db import transaction
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token

from users.models import User, Address
from products.models import Category, Product
from cart.models import Cart, CartItem
from wishlist.models import Wishlist
from orders.models import Order, OrderItem, Coupon
from reviews.models import Review
from .serializers import (
    UserSerializer, CategorySerializer, ProductSerializer,
    CartItemSerializer, OrderSerializer, ReviewSerializer, CouponSerializer
)


class RegisterAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        data = request.data
        if User.objects.filter(username=data.get('username')).exists():
            return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(
            username=data['username'],
            email=data.get('email', ''),
            password=data['password'],
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            phone=data.get('phone', '')
        )
        Cart.objects.create(user=user)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data}, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        identifier = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=identifier, password=password)
        if not user:
            return Response({'error': 'Invalid username/email or password'}, status=status.HTTP_401_UNAUTHORIZED)
        token, _ = Token.objects.get_or_create(user=user)
        return Response({'token': token.key, 'user': UserSerializer(user).data})


class ProductListCreateAPIView(APIView):
    def get(self, request):
        qs = Product.objects.select_related('category').all()
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        sort_by = request.query_params.get('sort', 'relevance')

        if category and category != 'All':
            qs = qs.filter(category__name__iexact=category)
        if search:
            qs = qs.filter(name__icontains=search) | qs.filter(brand__icontains=search)
        if sort_by == 'price_asc':
            qs = qs.order_by('discount_price')
        elif sort_by == 'price_desc':
            qs = qs.order_by('-discount_price')
        elif sort_by == 'rating':
            qs = qs.order_by('-rating')
        elif sort_by == 'newest':
            qs = qs.order_by('-created_at')

        return Response(ProductSerializer(qs, many=True).data)

    def post(self, request):
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrderCreateListAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart_items = cart.items.select_related('product').all()
        if not cart_items.exists():
            return Response({'error': 'Your cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

        subtotal = Decimal('0.00')
        for item in cart_items:
            if item.product.stock < item.quantity:
                return Response(
                    {'error': f"{item.product.name} is out of stock (only {item.product.stock} left)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            subtotal += item.product.discount_price * item.quantity

        discount = Decimal(str(request.data.get('discount', 0)))
        delivery_charge = Decimal('0.00') if subtotal >= 1999 else Decimal('120.00')
        total_amount = subtotal - discount + delivery_charge

        order = Order.objects.create(
            user=request.user,
            order_number=f"ORD{random.randint(100000, 999999)}",
            total_amount=total_amount,
            discount=discount,
            delivery_charge=delivery_charge,
            payment_method=request.data.get('payment_method', 'Cash on Delivery'),
            shipping_address=request.data.get('shipping_address', {}),
            status='Order Placed'
        )

        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.discount_price
            )
            item.product.stock -= item.quantity
            item.product.save()

        cart_items.delete()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
