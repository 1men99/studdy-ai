import logging
import sys
import json
from datetime import datetime, timezone


class StructuredJsonFormatter(logging.Formatter):
    """
    JSON log formatter that formats log records into structured JSON.
    Never logs sensitive keys, passwords, or raw study notes.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }

        request_id = getattr(record, "request_id", None)
        if request_id is not None:
            log_entry["request_id"] = request_id

        user_id_hash = getattr(record, "user_id_hash", None)
        if user_id_hash is not None:
            log_entry["user_id_hash"] = user_id_hash

        duration_ms = getattr(record, "duration_ms", None)
        if duration_ms is not None:
            log_entry["duration_ms"] = duration_ms

        status_code = getattr(record, "status_code", None)
        if status_code is not None:
            log_entry["status_code"] = status_code

        endpoint = getattr(record, "endpoint", None)
        if endpoint is not None:
            log_entry["endpoint"] = endpoint

        ai_status = getattr(record, "ai_status", None)
        if ai_status is not None:
            log_entry["ai_status"] = ai_status
        if record.exc_info:
            log_entry["exception"] = self.formatException(record.exc_info)

        return json.dumps(log_entry)


def setup_logging(level: str = "INFO"):
    logger = logging.getLogger()
    logger.setLevel(level.upper())

    # Clear existing handlers
    for handler in logger.handlers[:]:
        logger.removeHandler(handler)

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(StructuredJsonFormatter())
    logger.addHandler(handler)

    # Suppress verbose 3rd party logs
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("httpcore").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

    return logger
