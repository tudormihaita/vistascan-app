from abc import ABC, abstractmethod
from typing import BinaryIO, Optional, Tuple
from uuid import UUID


class FileStorageService(ABC):
    """Interface for file storage operations."""
    @abstractmethod
    def upload(self, data: BinaryIO, filename: str, content_type: str, user_id: UUID) -> Tuple[str, int]:
        """Upload a file to a storage service and return its path and size in bytes."""
        ...

    @abstractmethod
    def get(self, path: str) -> Optional[BinaryIO]:
        """Retrieve a file from the storage service based on its path."""
        ...

    @abstractmethod
    def delete(self, file_path: str) -> bool:
        """Delete a file from the storage service based on its path."""
        ...

    @abstractmethod
    def get_download_url(self, path: str) -> str:
        """Get a pre-signed URL for downloading a file."""
        ...