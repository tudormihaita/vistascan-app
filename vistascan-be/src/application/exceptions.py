
class UserAlreadyExists(Exception):
    """Raised when attempting to register a suer with an existing email or username."""
    def __init__(self, message="User already exists."):
        self.message = message
        super().__init__(self.message)

class InvalidCredentials(Exception):
    """Raised when the provided credentials are invalid."""
    def __init__(self, message="Invalid username or password."):
        self.message = message
        super().__init__(self.message)