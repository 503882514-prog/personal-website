import http.server
import socketserver
import json
import os

PORT = 8000
DATA_FILE = 'data.json'

class RequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*') # Allow all origins for simplicity
            self.end_headers()
            
            try:
                with open(DATA_FILE, 'r') as f:
                    data = f.read()
                    self.wfile.write(data.encode('utf-8'))
            except FileNotFoundError:
                self.wfile.write(json.dumps({}).encode('utf-8'))
        else:
            # Serve static files
            super().do_GET()

    def do_POST(self):
        if self.path == '/api/data':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                # Write to file
                with open(DATA_FILE, 'w') as f:
                    json.dump(data, f, indent=4, ensure_ascii=False)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'success', 'message': 'Data saved successfully'}).encode('utf-8'))
                
            except json.JSONDecodeError:
                self.send_response(400)
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': 'Invalid JSON'}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(json.dumps({'status': 'error', 'message': str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
            
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

print(f"Serving at http://localhost:{PORT}")
print(f"Admin Panel: http://localhost:{PORT}/admin.html")
print(f"Website: http://localhost:{PORT}/index.html")

# Create server
with socketserver.TCPServer(("", PORT), RequestHandler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
