from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from .supabase_client import supabase
from .models import User

class SupabaseJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return None
        token = auth_header.split(' ')[1]
        try:
            user = supabase.auth.get_user(token)
            django_user = User.objects.get(supabase_id=user.user.id)
            return (django_user, token)
        except Exception as e:
            raise AuthenticationFailed(f'Invalid token: {str(e)}')