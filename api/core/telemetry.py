"""OpenTelemetry distributed tracing setup.

Sends traces to any OTLP-compatible collector (Jaeger, Datadog, Honeycomb, etc).
Set OTLP_ENDPOINT env var to your collector endpoint.
"""
import os, logging

logger = logging.getLogger(__name__)

def init_telemetry(app_name: str = "geniai-api", version: str = "1.0.0"):
    """Initialize OpenTelemetry. No-ops if opentelemetry-sdk is not installed."""
    try:
        from opentelemetry import trace
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import BatchSpanProcessor
        from opentelemetry.sdk.resources import Resource, SERVICE_NAME, SERVICE_VERSION
        from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
        from opentelemetry.instrumentation.fastapi import FastAPIInstrumentor
        from opentelemetry.instrumentation.sqlalchemy import SQLAlchemyInstrumentor

        endpoint = os.environ.get("OTLP_ENDPOINT", "http://localhost:4318/v1/traces")
        resource = Resource.create({SERVICE_NAME: app_name, SERVICE_VERSION: version})
        provider = TracerProvider(resource=resource)
        provider.add_span_processor(BatchSpanProcessor(OTLPSpanExporter(endpoint=endpoint)))
        trace.set_tracer_provider(provider)
        FastAPIInstrumentor().instrument()
        SQLAlchemyInstrumentor().instrument()
        logger.info(f"OpenTelemetry initialized → {endpoint}")
    except ImportError:
        logger.info("opentelemetry-sdk not installed — tracing disabled")

def get_tracer(name: str = "geniai"):
    try:
        from opentelemetry import trace
        return trace.get_tracer(name)
    except ImportError:
        return _NoopTracer()

class _NoopTracer:
    def start_as_current_span(self, name, **kwargs):
        from contextlib import contextmanager
        @contextmanager
        def noop(): yield None
        return noop()
