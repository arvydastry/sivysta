#!/usr/bin/env python3
"""Vietinis serveris su HTTP Range palaikymu (reikalingas <video> persukimui ir ciklui).
Naudojimas: python3 tools/serve.py [portas]   (numatyta 8141)
"""
import os, re, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class RangeHandler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def send_head(self):
        path = self.translate_path(self.path)
        rng = self.headers.get('Range')
        if not rng or os.path.isdir(path) or not os.path.exists(path):
            return super().send_head()
        m = re.match(r'bytes=(\d*)-(\d*)', rng)
        size = os.path.getsize(path)
        start = int(m.group(1)) if m and m.group(1) else 0
        end = int(m.group(2)) if m and m.group(2) else size - 1
        end = min(end, size - 1)
        if start > end:
            self.send_error(416); return None
        f = open(path, 'rb'); f.seek(start)
        self.send_response(206)
        self.send_header('Content-Type', self.guess_type(path))
        self.send_header('Accept-Ranges', 'bytes')
        self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
        self.send_header('Content-Length', str(end - start + 1))
        self.end_headers()
        self._range_left = end - start + 1
        return f

    def copyfile(self, source, outputfile):
        left = getattr(self, '_range_left', None)
        if left is None:
            return super().copyfile(source, outputfile)
        while left > 0:
            chunk = source.read(min(64 * 1024, left))
            if not chunk: break
            outputfile.write(chunk); left -= len(chunk)

    def end_headers(self):
        if 'Accept-Ranges' not in self._headers_buffer_str():
            self.send_header('Accept-Ranges', 'bytes')
        super().end_headers()

    def _headers_buffer_str(self):
        return b''.join(getattr(self, '_headers_buffer', [])).decode('latin-1', 'ignore')

    def log_message(self, *a):
        pass

class Server(ThreadingHTTPServer):
    request_queue_size = 128  # numatytas 5 perpildomas, kai puslapis vienu metu prašo ~45 nuotraukų
    allow_reuse_address = True


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8141
    print(f'SiVySta maketas: http://localhost:{port}/')
    Server(('', port), RangeHandler).serve_forever()
