from abc import ABC, abstractmethod
from typing import BinaryIO

from domain.entities.report import ReportGenerationResult


class ModelClient(ABC):
    @abstractmethod
    async def generate_report(self, image_data: BinaryIO, filename: str) -> ReportGenerationResult:
        """Generate a medical report from an image using the AI model service"""
        ...