import mimetypes
from typing import Generator
from urllib.parse import urlparse

import smbclient

CHUNK_SIZE = 65536


def smb_url_to_unc(smb_url: str) -> tuple[str, str]:
    """smb://host/share/path/file を (host, \\\\host\\share\\path\\file) に変換する"""
    parsed = urlparse(smb_url)
    host = parsed.hostname
    parts = parsed.path.lstrip("/").split("/", 1)
    share = parts[0]
    file_path = parts[1].replace("/", "\\") if len(parts) > 1 else ""
    return host, f"\\\\{host}\\{share}\\{file_path}"


def register_smb_session(host: str, username: str, password: str) -> None:
    smbclient.register_session(host, username=username, password=password)


def get_smb_file_size(unc_path: str) -> int:
    return smbclient.stat(unc_path).st_size


def stream_smb_file(unc_path: str, start: int, end: int) -> Generator[bytes, None, None]:
    with smbclient.open_file(unc_path, mode="rb", share_access="r") as f:
        f.seek(start)
        remaining = end - start + 1
        while remaining > 0:
            chunk = f.read(min(CHUNK_SIZE, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk


def guess_content_type(path: str) -> str:
    content_type, _ = mimetypes.guess_type(path)
    return content_type or "application/octet-stream"
