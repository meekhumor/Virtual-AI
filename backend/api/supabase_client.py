from django.conf import settings
from supabase import create_client, Client

SUPABASE_URL = settings.SUPABASE_URL
SUPABASE_SECRET_KEY = settings.SUPABASE_SECRET_KEY

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
