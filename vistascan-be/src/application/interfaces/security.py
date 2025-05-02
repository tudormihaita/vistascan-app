from abc import ABC, abstractmethod
from uuid import UUID


class TokenGenerator(ABC):
    @abstractmethod
    def generate(self, user_id: UUID, role: str) -> str:
        """Generate a signed token for the given user ID."""
        ...

class PasswordHasher(ABC):
    @abstractmethod
    def hash(self, password: str) -> str:
        """Hash a password."""
        ...

    @abstractmethod
    def verify(self, password: str, hashed_password: str) -> bool:
        """Verify a password against a hashed password."""
        ...