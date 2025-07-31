from django.apps import AppConfig
import os


class BackendConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'backend'
    
    def ready(self):
        # Only start SMS scheduler in the main process (not in migrations, etc.)
        if os.environ.get('RUN_MAIN') == 'true' or os.environ.get('DJANGO_SETTINGS_MODULE'):
            try:
                from .sms_utils import sms_manager
                import threading
                
                # Start SMS scheduler in a separate thread when Django is ready
                def start_scheduler():
                    import time
                    time.sleep(5)  # Wait 5 seconds for Django to fully initialize
                    sms_manager.start_scheduler()
                
                scheduler_thread = threading.Thread(target=start_scheduler, daemon=True)
                scheduler_thread.start()
            except Exception as e:
                print(f"Error starting SMS scheduler: {e}")
