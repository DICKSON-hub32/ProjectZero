from django.core.management.base import BaseCommand
from backend.sms_utils import sms_manager
import signal
import sys

class Command(BaseCommand):
    help = 'Start the SMS notification scheduler'
    
    def __init__(self):
        super().__init__()
        self.scheduler_running = False
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--stop',
            action='store_true',
            help='Stop the SMS scheduler',
        )
    
    def handle(self, *args, **options):
        if options['stop']:
            self.stdout.write('Stopping SMS scheduler...')
            sms_manager.stop_scheduler()
            self.stdout.write(self.style.SUCCESS('SMS scheduler stopped'))
            return
        
        # Set up signal handlers for graceful shutdown
        def signal_handler(sig, frame):
            self.stdout.write('\nReceived shutdown signal. Stopping SMS scheduler...')
            sms_manager.stop_scheduler()
            self.stdout.write(self.style.SUCCESS('SMS scheduler stopped gracefully'))
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        self.stdout.write('Starting SMS scheduler...')
        sms_manager.start_scheduler()
        self.stdout.write(self.style.SUCCESS('SMS scheduler started successfully'))
        
        # Keep the main thread alive
        try:
            while True:
                import time
                time.sleep(1)
        except KeyboardInterrupt:
            self.stdout.write('\nReceived keyboard interrupt. Stopping SMS scheduler...')
            sms_manager.stop_scheduler()
            self.stdout.write(self.style.SUCCESS('SMS scheduler stopped'))