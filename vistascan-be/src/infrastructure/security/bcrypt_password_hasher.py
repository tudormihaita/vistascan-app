import bcrypt
from application.interfaces.security import PasswordHasher


class BcryptPasswordHasher(PasswordHasher):
    """
    Implementation of PasswordHasher using bcrypt for hashing and verifying passwords.
    """
    def hash(self, plain: str) -> str:
        hashed_bytes = bcrypt.hashpw(plain.encode('utf-8'), bcrypt.gensalt())
        return hashed_bytes.decode('utf-8')

    def verify(self, plain: str, hashed: str) -> bool:
        return bcrypt.checkpw(plain.encode('utf-8'), hashed.encode('utf-8'))