import asyncio
import mimetypes
from typing import AsyncGenerator, Generator
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


async def stream_smb_file_async(unc_path: str, start: int, end: int) -> AsyncGenerator[bytes, None]:
    loop = asyncio.get_running_loop()

    def _open_and_seek():
        f = smbclient.open_file(unc_path, mode="rb", share_access="r")
        f.seek(start)
        return f

    f = await loop.run_in_executor(None, _open_and_seek)
    try:
        remaining = end - start + 1
        while remaining > 0:
            chunk = await loop.run_in_executor(None, f.read, min(CHUNK_SIZE, remaining))
            if not chunk:
                break
            remaining -= len(chunk)
            yield chunk
    finally:
        await loop.run_in_executor(None, f.close)


def guess_content_type(path: str) -> str:
    content_type, _ = mimetypes.guess_type(path)
    return content_type or "application/octet-stream"
