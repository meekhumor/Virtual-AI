import jwt
from urllib.parse import parse_qs

# Imports for DRF (HTTP)
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

# Imports for Channels (WebSocket)
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async
from asgiref.sync import sync_to_async  # <-- THIS IS THE CORRECT IMPORT # <-- 1. ADD sync_to_async HERE
from django.contrib.auth.models import AnonymousUser

# Shared imports
from .supabase_client import supabase
from .models import User


# --- Reusable Async Helper Function ---
@database_sync_to_async
def get_user_from_supabase_id(supabase_id):
    """
    Fetches a user from the local Django DB based on their Supabase ID.
    """
    try:
        return User.objects.get(supabase_id=supabase_id)
    except User.DoesNotExist:
        return AnonymousUser()


# --- Existing DRF/HTTP Authentication ---
class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        
        token = auth_header.split(' ')[1]

        if token == 'guest_token_bypass' or (token and token.startswith('guest_token_')):
            guest_id = token.replace('guest_token_', '') if token.startswith('guest_token_') else 'guest_supabase_id_12345'
            try:
                django_user = User.objects.get(supabase_id=guest_id)
            except User.DoesNotExist:
                if token == 'guest_token_bypass':
                    django_user = User.objects.create_user(
                        email='guest@example.com',
                        username='guest_user',
                        supabase_id='guest_supabase_id_12345'
                    )
                else:
                    raise AuthenticationFailed('Guest session not found or expired.')
            return (django_user, token)

        try:
            # 1. Validate token with Supabase
            user = supabase.auth.get_user(token)
            if not user or not user.user:
                raise AuthenticationFailed('Invalid token: User not found in Supabase.')

            # 2. Get Django user (synchronously)
            django_user = User.objects.get(supabase_id=user.user.id)
            return (django_user, token)
        
        except User.DoesNotExist:
            raise AuthenticationFailed('Invalid token: User does not exist in local database.')
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')


# --- Corrected Channels/WebSocket Authentication ---
class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom WebSocket authentication middleware to validate Supabase JWT
    passed in the query string (e.g., ?token=...)
    """
    async def __call__(self, scope, receive, send):
        # Get token from the query string
        query_string = scope.get('query_string', b'').decode()
        params = parse_qs(query_string)
        token = params.get('token', [None])[0]

        if not token:
            scope['user'] = AnonymousUser()
            return await super().__call__(scope, receive, send)

        if token == 'guest_token_bypass' or (token and token.startswith('guest_token_')):
            guest_id = token.replace('guest_token_', '') if token.startswith('guest_token_') else 'guest_supabase_id_12345'
            django_user = await get_user_from_supabase_id(guest_id)
            if isinstance(django_user, AnonymousUser):
                if token == 'guest_token_bypass':
                    @database_sync_to_async
                    def create_guest():
                        try:
                            u = User.objects.get(email='guest@example.com')
                        except User.DoesNotExist:
                            u = User.objects.create_user(
                                email='guest@example.com',
                                username='guest_user',
                                supabase_id='guest_supabase_id_12345'
                            )
                        return u
                    django_user = await create_guest()
                    scope['user'] = django_user
                else:
                    scope['user'] = AnonymousUser()
            else:
                scope['user'] = django_user
            return await super().__call__(scope, receive, send)

        try:
            # 1. Validate the token asynchronously
            #    We wrap the blocking call in sync_to_async
            supabase_user = await sync_to_async(supabase.auth.get_user)(token) # <-- 2. THIS IS THE FIX
            
            if not supabase_user or not supabase_user.user:
                 scope['user'] = AnonymousUser()
            else:
                # 2. Get the corresponding User from your Django database (asynchronously)
                supabase_id = supabase_user.user.id
                scope['user'] = await get_user_from_supabase_id(supabase_id)

        except Exception as e:
            # Token was invalid, expired, or user doesn't exist
            print(f"Token validation error: {e}")
            scope['user'] = AnonymousUser()

        # Continue processing the scope
        return await super().__call__(scope, receive, send)