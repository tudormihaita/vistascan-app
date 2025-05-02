import io
from datetime import timedelta

import minio
import logging
from uuid import UUID
from typing import Optional, Tuple, BinaryIO

from minio.error import MinioException
from application.interfaces.storage import FileStorageService


class MinioStorageService(FileStorageService):
    """Implementation of FileStorageService using MinIO."""

    def __init__(
            self,
            endpoint: str,
            access_key: str,
            secret_key: str,
            bucket_name: str,
            secure: bool = False,
    ):
        self.client = minio.Minio(
            endpoint=endpoint,
            access_key=access_key,
            secret_key=secret_key,
            secure=secure,
        )
        self.bucket = bucket_name
        self._ensure_bucket_exists()


    def _ensure_bucket_exists(self):
        try:
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                logging.info(f"Bucket {self.bucket} created")
        except MinioException as e:
            logging.error(f"Error creating bucket {self.bucket}: {e}")
            raise e

    def upload(self, data: BinaryIO, filename: str, content_type: str, user_id: UUID) -> Tuple[str, int]:
        try:
            object_name = f"{user_id}/{UUID()}-{filename}"

            data.seek(0, io.SEEK_END)
            size = data.tell()
            data.seek(0)

            self.client.put_object(
                bucket_name=self.bucket,
                object_name=object_name,
                data=data,
                length=size,
                content_type=content_type,
            )

            logging.info(f"File {filename} uploaded to {self.bucket}/{object_name}")

            return object_name, size
        except MinioException as e:
            logging.error(f"Error uploading file {filename}: {e}")
            raise e

    def get(self, path: str) -> Optional[BinaryIO]:
        try:
            response = self.client.get_object(
                bucket_name=self.bucket,
                object_name=path,
            )
            data = io.BytesIO(response.read())
            response.close()
            data.seek(0)

            return data
        except MinioException as e:
            logging.error(f"Error retrieving file {path}: {e}")
            return None

    def delete(self, file_path: str) -> bool:
        try:
            self.client.remove_object(
                bucket_name=self.bucket,
                object_name=file_path,
            )
            logging.info(f"File {file_path} deleted from {self.bucket}")
            return True
        except MinioException as e:
            logging.error(f"Error deleting file {file_path}: {e}")
            return False

    def get_download_url(self, path: str) -> str:
        try:
            url = self.client.presigned_get_object(
                bucket_name=self.bucket,
                object_name=path,
                expires=timedelta(days=1)  # URL valid for 1 day
            )
            return url
        except MinioException as e:
            logging.error(f"Error generating download URL for {path}: {e}")
            raise e