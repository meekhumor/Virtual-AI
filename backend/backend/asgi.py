# backend/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack  # <-- Re-add this

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Bootstrap Django FIRST
import django
django.setup()

# NOW it is safe to import app-level code
from api.auth import TokenAuthMiddleware      # <-- Re-add this
from api.routing import websocket_urlpatterns 

# This must also come after setup()
django_asgi_app = get_asgi_application()

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(  # <-- Wrap in AuthMiddlewareStack
        TokenAuthMiddleware(  # <-- Add your custom middleware
            URLRouter(
                websocket_urlpatterns
            )
        )
    ),
})