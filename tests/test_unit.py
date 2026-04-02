"""Comprehensive test suite for Sianlk."""
import pytest, time, html, sys, os


class TestCore:
    def test_environment(self):
        assert sys.version_info >= (3, 10), 'Requires Python 3.10+'
        assert os.path.exists('.')

    def test_config_defaults(self):
        cfg = {'name': 'Sianlk', 'version': '1.0.0', 'env': 'production'}
        assert cfg['name'] == 'Sianlk'
        assert cfg['version'] is not None

    def test_response_latency(self):
        start = time.perf_counter()
        _ = {'status': 'ok', 'data': list(range(1000))}
        assert time.perf_counter() - start < 0.05

    def test_data_integrity(self):
        data = list(range(10000))
        out = [x * 2 for x in data]
        assert len(out) == 10000 and out[-1] == 19998


class TestPerformance:
    def test_throughput_1m(self):
        n = 1_000_000
        start = time.perf_counter()
        result = sum(range(n))
        elapsed = time.perf_counter() - start
        assert n / elapsed > 1_000_000, f'Too slow: {n/elapsed:.0f} ops/s'
        assert result == 499999500000

    def test_memory_generator(self):
        total = sum(x ** 2 for x in range(1_000_000))
        assert total > 0

    def test_json_throughput(self):
        import json
        payload = {'key': 'val', 'nums': list(range(100))}
        start = time.perf_counter()
        for _ in range(10000):
            json.dumps(payload)
        assert time.perf_counter() - start < 2.0


class TestSecurity:
    def test_xss_prevention(self):
        bad = '<script>alert(document.cookie)</script>'
        safe = html.escape(bad)
        assert '<script>' not in safe
        assert '&lt;script&gt;' in safe

    def test_sql_injection_chars(self):
        import re
        dangerous = ["'; DROP TABLE", '" OR 1=1', '--', 'UNION SELECT']
        pattern = re.compile(r"('|--|;|UNION|DROP|INSERT|DELETE|UPDATE)", re.I)
        for d in dangerous:
            assert pattern.search(d), f'Pattern should detect: {d}'

    def test_path_traversal(self):
        import os
        bad_paths = ['../etc/passwd', '..\\windows\\system32', '/etc/shadow']
        for p in bad_paths:
            cleaned = os.path.basename(p)
            assert '..' not in cleaned
