#!/usr/bin/env python3
"""
Fictional disk-backed E010 adapter acceptance.

Every filesystem operation is confined to a newly created, owner-controlled,
distinctly marked disposable directory below tempfile.gettempdir(). This module
cannot address SSH, production paths, Docker, live members, or external network.
It is NOT an operator deployment command or a production adapter.
"""
from __future__ import annotations

from contextlib import contextmanager
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import stat
import tempfile
from typing import Iterator, Optional

from reflect_e010_canary_control import (
    CanaryHold, FictionalRuntime, IMAGE_ID,
)

MARKER_NAME = "FICTIONAL_E010_ONLY"
MARKER_BYTES = b"reflect-e010-fictional-disk-acceptance-v1\n"
FIXTURE_PREFIX = "reflect-e010-fictional-"
INITIAL_CONFIG = b"NODE_ENV=production\nUNRELATED_SETTING=preserve\n"


def _write_new_0600(path: Path, contents: bytes) -> None:
    fd = os.open(str(path), os.O_CREAT | os.O_EXCL | os.O_WRONLY |
                 getattr(os, "O_NOFOLLOW", 0), 0o600)
    try:
        with os.fdopen(fd, "wb") as fh:
            fh.write(contents)
            fh.flush()
            os.fsync(fh.fileno())
    except Exception:
        raise


def _sync_dir(path: Path) -> None:
    fd = os.open(str(path), os.O_RDONLY)
    try:
        os.fsync(fd)
    finally:
        os.close(fd)


class FictionalDiskRuntime(FictionalRuntime):
    """Filesystem-real / Docker-in-memory. Never accepts a production backend."""

    def __init__(self, root: Path) -> None:
        super().__init__()
        self.root = Path(root)
        self.lock_fd: Optional[int] = None
        self.fail_atomic_once: Optional[str] = None
        self.simulate_concurrent_disk_change = False
        self._verify_root()
        self.config_path = self.root / ".env.production"
        self.backup_dir = self.root / "private-custody"
        self.runtime_state_path = self.root / ".fictional-reader-state.json"
        self.runtime_env = self._read_saved_reader_env()
        self.config = self.read_config()

    def _verify_root(self) -> None:
        root = self.root
        parent = Path(tempfile.gettempdir()).resolve()
        if (root.is_symlink() or not root.is_dir() or
                root.resolve().parent != parent or
                not root.name.startswith(FIXTURE_PREFIX) or
                root.stat().st_uid != os.getuid() or
                stat.S_IMODE(root.stat().st_mode) != 0o700):
            raise CanaryHold("NOT_A_DISPOSABLE_FICTIONAL_ROOT")
        marker = root / MARKER_NAME
        if marker.is_symlink() or not marker.is_file() or marker.read_bytes() != MARKER_BYTES:
            raise CanaryHold("FICTIONAL_MARKER_MISSING")
        if marker.stat().st_uid != os.getuid():
            raise CanaryHold("FICTIONAL_MARKER_OWNER")

    def _secure_read(self, path: Path) -> bytes:
        self._verify_root()
        if path.is_symlink() or not path.is_file():
            raise CanaryHold("FIXTURE_SYMLINK_OR_MISSING_FILE")
        fd = os.open(str(path), os.O_RDONLY | getattr(os, "O_NOFOLLOW", 0))
        try:
            info = os.fstat(fd)
            if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid():
                raise CanaryHold("FIXTURE_FILE_OWNERSHIP")
            if info.st_nlink != 1:
                raise CanaryHold("FIXTURE_HARDLINK_REFUSED")
            if stat.S_IMODE(info.st_mode) != 0o600:
                raise CanaryHold("FIXTURE_FILE_PERMISSIONS")
            if info.st_size > 1024 * 1024:
                raise CanaryHold("FIXTURE_FILE_TOO_LARGE")
            with os.fdopen(fd, "rb", closefd=False) as fh:
                return fh.read()
        finally:
            os.close(fd)

    def acquire(self) -> None:
        self._verify_root()
        if self.lock_fd is not None:
            raise CanaryHold("RELEASE_LOCK_BUSY")
        import fcntl
        fd = os.open(str(self.root / "fictional-release.lock"),
                     os.O_CREAT | os.O_RDWR | getattr(os, "O_NOFOLLOW", 0), 0o600)
        try:
            try:
                fcntl.flock(fd, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except (BlockingIOError, OSError):
                raise CanaryHold("RELEASE_LOCK_BUSY")
            super().acquire()
            self.lock_fd = fd
        except Exception:
            os.close(fd)
            raise

    def release(self) -> None:
        import fcntl
        try:
            super().release()
        finally:
            if self.lock_fd is not None:
                try:
                    fcntl.flock(self.lock_fd, fcntl.LOCK_UN)
                finally:
                    os.close(self.lock_fd)
                    self.lock_fd = None

    def read_config(self) -> bytes:
        return self._secure_read(self.config_path)

    def _read_saved_reader_env(self):
        # This file represents the *fictional* reader process environment as
        # distinct persisted state, so a new Python interpreter can observe ON
        # even if the previous controller exited between two writes.
        try:
            record = json.loads(self._secure_read(self.runtime_state_path).decode())
        except (ValueError, UnicodeError):
            raise CanaryHold("FICTIONAL_READER_STATE_CORRUPT")
        if (not isinstance(record, dict) or record.get("version") != 1
                or record.get("image") != IMAGE_ID
                or not isinstance(record.get("env"), dict)
                or not all(isinstance(k, str) and isinstance(v, str)
                           for k, v in record["env"].items())):
            raise CanaryHold("FICTIONAL_READER_STATE_INVALID")
        return record["env"]

    def _persist_reader_env(self, expected_old_env):
        if not self.locked or self.lock_fd is None:
            raise CanaryHold("RELEASE_LOCK_REQUIRED")
        if self._read_saved_reader_env() != expected_old_env:
            raise CanaryHold("FICTIONAL_READER_CONCURRENT_STATE_DRIFT")
        record = {"version": 1, "image": IMAGE_ID, "env": self.runtime_env}
        raw = (json.dumps(record, sort_keys=True, separators=(",", ":")) + "\n").encode()
        fd, filename = tempfile.mkstemp(prefix=".fictional-reader-write-", dir=str(self.root))
        try:
            os.fchmod(fd, 0o600)
            with os.fdopen(fd, "wb") as f:
                f.write(raw)
                f.flush()
                os.fsync(f.fileno())
            # Second compare guards a concurrent, uncoordinated fixture
            # writer during creation of the new reader-state artifact.
            if self._read_saved_reader_env() != expected_old_env:
                raise CanaryHold("FICTIONAL_READER_CONCURRENT_STATE_DRIFT")
            os.replace(filename, str(self.runtime_state_path))
            _sync_dir(self.root)
        finally:
            if os.path.exists(filename):
                os.unlink(filename)

    def backup(self, content: bytes) -> str:
        if self.read_config() != content:
            raise CanaryHold("CONCURRENT_CONFIG_DRIFT_BEFORE_BACKUP")
        token = super().backup(content)
        if not self.backup_dir.exists():
            self.backup_dir.mkdir(mode=0o700)
        if self.backup_dir.is_symlink() or stat.S_IMODE(self.backup_dir.stat().st_mode) != 0o700:
            raise CanaryHold("PRIVATE_BACKUP_DIRECTORY_INVALID")
        if not re.fullmatch(r"private-fixture-backup-[0-9]+", token):
            raise CanaryHold("BACKUP_TOKEN_INVALID")
        filename = self.backup_dir / token
        _write_new_0600(filename, content)
        _sync_dir(self.backup_dir)
        if not hmac.compare_digest(hashlib.sha256(self._secure_read(filename)).digest(),
                                   hashlib.sha256(content).digest()):
            raise CanaryHold("BACKUP_INTEGRITY")
        return token

    def restore_backup(self, token: str) -> bytes:
        if not re.fullmatch(r"private-fixture-backup-[0-9]+", token):
            raise CanaryHold("BACKUP_TOKEN_INVALID")
        # A separate operator process has no in-memory backup dictionary.
        # The owner-only disk file persists; a durable journal must verify its
        # SHA-256 separately before accepting it as a recovery authority.
        expected = (super().restore_backup(token) if token in self.backups
                    else self._secure_read(self.backup_dir / token))
        actual = self._secure_read(self.backup_dir / token)
        if not hmac.compare_digest(hashlib.sha256(actual).digest(),
                                   hashlib.sha256(expected).digest()):
            raise CanaryHold("BACKUP_INTEGRITY")
        return actual

    def _atomic_write(self, data: bytes, *, allow_fault: bool = True) -> None:
        self._secure_read(self.config_path)
        fd, name = tempfile.mkstemp(prefix=".reflect-fixture-atomic-", dir=str(self.root))
        tmp = Path(name)
        try:
            os.fchmod(fd, 0o600)
            with os.fdopen(fd, "wb") as fh:
                fh.write(data)
                fh.flush()
                os.fsync(fh.fileno())
            fault = self.fail_atomic_once if allow_fault else None
            if allow_fault:
                self.fail_atomic_once = None
            if fault == "before_replace":
                raise CanaryHold("FICTIONAL_INTERRUPTED_BEFORE_REPLACE")
            os.replace(str(tmp), str(self.config_path))
            _sync_dir(self.root)
            self.config = bytes(data)
            if fault == "after_replace":
                raise CanaryHold("FICTIONAL_INTERRUPTED_AFTER_REPLACE")
        finally:
            if tmp.exists():
                tmp.unlink()

    def write_config_atomically(self, content: bytes) -> None:
        if not self.locked or self.lock_fd is None:
            raise CanaryHold("RELEASE_LOCK_REQUIRED")
        # Detect any uncoordinated fixture write since the last observed config.
        # This is a test-only compare-and-swap witness, NOT a production CAS API.
        if self.read_config() != self.config:
            raise CanaryHold("CONCURRENT_CONFIG_DRIFT_BEFORE_WRITE")
        self._atomic_write(content)
        self.calls.append("atomic_config_write_0600")

    def recreate_reader(self, exact_image: str, *, no_build: bool, no_pull: bool,
                        no_dependencies: bool) -> None:
        self.config = self.read_config()
        expected_old_env = dict(self.runtime_env)
        super().recreate_reader(exact_image, no_build=no_build, no_pull=no_pull,
                                no_dependencies=no_dependencies)
        self._persist_reader_env(expected_old_env)
        # Simulate a concurrent *fixture-only* file writer after process start.
        if self.simulate_concurrent_disk_change:
            self.simulate_concurrent_disk_change = False
            self._atomic_write(self.read_config() + b"FICTIONAL_CONCURRENT_CHANGE=1\n",
                               allow_fault=False)


@contextmanager
def new_fictional_disk_runtime() -> Iterator[FictionalDiskRuntime]:
    """The ONLY fixture factory; it never accepts caller-supplied production paths."""
    with tempfile.TemporaryDirectory(prefix=FIXTURE_PREFIX) as directory:
        root = Path(directory)
        os.chmod(str(root), 0o700)
        (root / MARKER_NAME).write_bytes(MARKER_BYTES)
        _write_new_0600(root / ".env.production", INITIAL_CONFIG)
        _write_new_0600(
            root / ".fictional-reader-state.json",
            (json.dumps({
                "version": 1, "image": IMAGE_ID,
                "env": {"NODE_ENV": "production", "UNRELATED_SETTING": "preserve"}
            }, sort_keys=True, separators=(",", ":")) + "\n").encode())
        _sync_dir(root)
        yield FictionalDiskRuntime(root)
