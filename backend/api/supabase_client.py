from supabase import create_client, Client
import requests

SUPABASE_URL = "https://gujkzryanfgrjnsvcplg.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1amt6cnlhbmZncmpuc3ZjcGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAwMDMsImV4cCI6MjA2NjI1NjAwM30._6pT9j415ZpxXnsz31HIQU81iKhRAFgLoh8HpF2B6yU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

response = supabase.auth.sign_in_with_password({
    "email": "om170904@gmail.com",          
    "password": "Om@170904"   
})

access_token = response.session.access_token
print("Access Token:", access_token)
