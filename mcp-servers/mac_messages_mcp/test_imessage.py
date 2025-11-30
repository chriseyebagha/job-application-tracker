import sys
import os
sys.path.append(os.getcwd())
from mac_messages_mcp.messages import get_recent_messages

try:
    print("Attempting to fetch recent messages...")
    messages = get_recent_messages(hours=1)
    if "Error" in messages:
        print(f"FAILED: {messages}")
        sys.exit(1)
    else:
        print("SUCCESS: Successfully accessed messages database.")
        print(f"Sample output: {messages[:100]}...")
except Exception as e:
    print(f"FAILED: Exception occurred: {e}")
    sys.exit(1)
