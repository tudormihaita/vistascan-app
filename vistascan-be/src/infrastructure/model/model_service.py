import httpx
import logging
from typing import BinaryIO

from domain.entities.report import ReportGenerationResult
from application.interfaces.model_client import ModelClient


class ModelServiceClient(ModelClient):
    def __init__(self, base_url: str, timeout: int = 30):
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout

    async def generate_report(self, image_data: BinaryIO, filename: str) -> ReportGenerationResult:
        try:
            files = {
                'file': (filename, image_data, 'image/jpeg')
            }

            async with httpx.AsyncClient(timeout=self.timeout) as client:
                response = await client.post(
                    f"{self.base_url}/generate-report",
                    files=files
                )

                if response.status_code == 200:
                    result = response.json()
                    return ReportGenerationResult(
                        report=result.get('report', ''),
                        success=result.get('success', False),
                        message=result.get('message', '')
                    )
                else:
                    error_detail = response.json().get('detail',
                                                       'Unknown error') if response.content else 'No response content'
                    logging.error(f"Model service request failed with status {response.status_code}: {error_detail}")
                    return ReportGenerationResult(
                        report="",
                        success=False,
                        message=f"Model service error: {error_detail}"
                    )

        except httpx.TimeoutException:
            logging.error("Timeout when calling model service")
            return ReportGenerationResult(
                report="",
                success=False,
                message="Request to AI model service timed out"
            )
        except httpx.RequestError as e:
            logging.error(f"Request error when calling model service: {str(e)}")
            return ReportGenerationResult(
                report="",
                success=False,
                message="Failed to connect to AI model service"
            )
        except Exception as e:
            logging.error(f"Unexpected error when calling model service: {str(e)}")
            return ReportGenerationResult(
                report="",
                success=False,
                message="An unexpected error occurred"
            )

    async def health_check(self) -> bool:
        try:
            async with httpx.AsyncClient(timeout=5) as client:
                response = await client.get(f"{self.base_url}/health")
                return response.status_code == 200
        except Exception as e:
            logging.error(f"Health check failed: {str(e)}")
            return False