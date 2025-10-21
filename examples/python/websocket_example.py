import websocket
import json
import threading
import time
from datetime import datetime
import ssl, certifi

# Add api.prixe.io certs to trust store
# To get certs: openssl s_client -connect api.prixe.io:443 -servername api.prixe.io -showcerts
# get location of cert store: python3 -c "import certifi; print(certifi.where())"

# SSL context for secure connections
ssl_context = ssl.create_default_context()
ssl_context.load_verify_locations(cafile=certifi.where())

def get_timestamp():
    """Get current timestamp for logging"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]

# Define WebSocket callback functions
def on_message(ws, message):
    print(f"[{get_timestamp()}] RAW MESSAGE RECEIVED: {message}")
    
    try:
        data = json.loads(message)
        print(f"[{get_timestamp()}] PARSED JSON DATA: {json.dumps(data, indent=2)}")
        
        event_type = data.get('event')
        print(f"[{get_timestamp()}] EVENT TYPE: {event_type}")
        
        if event_type == 'connect_status':
            connection_id = data.get('data', {}).get('connection_id', 'Unknown')
            print(f"[{get_timestamp()}] ✅ CONNECTED with ID: {connection_id}")
        elif event_type == 'subscription_status':
            status = data.get('data', {}).get('status', 'Unknown')
            print(f"[{get_timestamp()}] 📊 SUBSCRIPTION STATUS: {status}")
        elif event_type == 'price_update':
            ticker = data.get('data', {}).get('ticker', 'Unknown')
            price_data = data.get('data', {}).get('data', {})
            current_price = price_data.get('currentPrice', 'N/A')
            print(f"[{get_timestamp()}] 💰 PRICE UPDATE for {ticker}: ${current_price}")
            print(f"[{get_timestamp()}] 📈 FULL PRICE DATA: {json.dumps(price_data, indent=2)}")
        elif event_type == 'error':
            error_msg = data.get('data', {}).get('message', 'Unknown error')
            print(f"[{get_timestamp()}] ❌ SERVER ERROR: {error_msg}")
        else:
            print(f"[{get_timestamp()}] ❓ UNKNOWN EVENT TYPE: {event_type}")
            
    except json.JSONDecodeError as e:
        print(f"[{get_timestamp()}] ⚠️  JSON DECODE ERROR: {e}")
        print(f"[{get_timestamp()}] RAW MESSAGE WAS: {message}")
    except Exception as e:
        print(f"[{get_timestamp()}] ⚠️  UNEXPECTED ERROR in on_message: {e}")

def on_error(ws, error):
    print(f"[{get_timestamp()}] 🚨 WEBSOCKET ERROR: {error}")
    print(f"[{get_timestamp()}] ERROR TYPE: {type(error)}")

def on_close(ws, close_status_code, close_msg):
    print(f"[{get_timestamp()}] 🔌 CONNECTION CLOSED")
    print(f"[{get_timestamp()}] CLOSE STATUS CODE: {close_status_code}")
    print(f"[{get_timestamp()}] CLOSE MESSAGE: {close_msg}")

def on_open(ws):
    print(f"[{get_timestamp()}] 🔗 CONNECTION ESTABLISHED SUCCESSFULLY")
    
    # Subscribe to a ticker
    subscribe_message = {
        'event': 'subscribe',
        'data': {
            'ticker': 'AAPL'
        }
    }
    
    print(f"[{get_timestamp()}] 📤 SENDING SUBSCRIPTION MESSAGE: {json.dumps(subscribe_message, indent=2)}")
    
    try:
        ws.send(json.dumps(subscribe_message))
        print(f"[{get_timestamp()}] ✅ SUBSCRIPTION MESSAGE SENT SUCCESSFULLY")
    except Exception as e:
        print(f"[{get_timestamp()}] ❌ FAILED TO SEND SUBSCRIPTION MESSAGE: {e}")

# Connect to WebSocket
ws_url = "wss://ws.prixe.io/ws?api_key=YOUR_API_KEY"

print(f"[{get_timestamp()}] 🚀 STARTING WEBSOCKET CLIENT")
print(f"[{get_timestamp()}] 🌍 CONNECTING TO: {ws_url}")

ws = websocket.WebSocketApp(ws_url,
                          on_open=on_open,
                          on_message=on_message,
                          on_error=on_error,
                          on_close=on_close)

print(f"[{get_timestamp()}] 📝 WEBSOCKET APP CREATED SUCCESSFULLY")

# Start WebSocket connection in a separate thread
print(f"[{get_timestamp()}] 🧵 STARTING WEBSOCKET THREAD")
wst = threading.Thread(target=lambda: ws.run_forever(sslopt={"context": ssl_context}))
wst.daemon = True
wst.start()

print(f"[{get_timestamp()}] ✅ WEBSOCKET THREAD STARTED")
print(f"[{get_timestamp()}] 🔄 ENTERING MAIN LOOP (Press Ctrl+C to exit)")

# Keep the main thread running
counter = 0
try:
    while True:
        time.sleep(5)  # Heartbeat every 5 seconds
        counter += 1
        print(f"[{get_timestamp()}] ❤️ HEARTBEAT #{counter} - WebSocket thread alive: {wst.is_alive()}")
except KeyboardInterrupt:
    print(f"[{get_timestamp()}] 🛑 KEYBOARD INTERRUPT RECEIVED")
    print(f"[{get_timestamp()}] 📤 SENDING UNSUBSCRIBE MESSAGE")
    
    # To unsubscribe before disconnecting
    try:
        unsubscribe_message = {'event': 'unsubscribe'}
        ws.send(json.dumps(unsubscribe_message))
        print(f"[{get_timestamp()}] ✅ UNSUBSCRIBE MESSAGE SENT: {json.dumps(unsubscribe_message)}")
    except Exception as e:
        print(f"[{get_timestamp()}] ❌ FAILED TO SEND UNSUBSCRIBE MESSAGE: {e}")
    
    # Close the connection
    try:
        print(f"[{get_timestamp()}] 🔌 CLOSING WEBSOCKET CONNECTION")
        ws.close()
        print(f"[{get_timestamp()}] ✅ WEBSOCKET CONNECTION CLOSED")
    except Exception as e:
        print(f"[{get_timestamp()}] ❌ ERROR CLOSING WEBSOCKET: {e}")
    
    print(f"[{get_timestamp()}] 👋 WEBSOCKET CLIENT TERMINATED")
