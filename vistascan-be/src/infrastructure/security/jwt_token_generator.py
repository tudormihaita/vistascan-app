from jose import jwt
from datetime import datetime, timedelta
from uuid import UUID
from application.interfaces.security import TokenGenerator


class JWTTokenGenerator(TokenGenerator):
    def __init__(
            self,
            secret_key: str,
            algorithm: str = "HS256",
            expires_in: int = 1800,
    ):
        self._secret = secret_key
        self._alg = algorithm
        self._expires_in = expires_in

    def generate(self, user_id: UUID, role: str) -> str:
        time = datetime.now()
        payload = {
            "sub": str(user_id),
            "role": role,
            "iat": time,
            "exp": (time + timedelta(seconds=self._expires_in)).timestamp(),
        }
        return jwt.encode(payload, self._secret, algorithm=self._alg)