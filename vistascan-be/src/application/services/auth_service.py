from datetime import datetime

from application.interfaces.services import UserAuthenticationUseCase
from application.dto.user_dto import (
    RegisterUserRequest, RegisterResponse,
    AuthUserRequest, AuthResponse,
    UserDTO
)
from domain.entities.user import User
from application.interfaces.repositories import UserRepository
from application.interfaces.security import TokenGenerator, PasswordHasher
from application.exceptions import UserAlreadyExists, InvalidCredentials


class AuthService(UserAuthenticationUseCase):
    def __init__(
            self,
            user_repository: UserRepository,
            token_generator: TokenGenerator,
            password_hasher: PasswordHasher
    ):
        self._repo = user_repository
        self._hasher = password_hasher
        self._token_generator = token_generator

    def register(self, dto: RegisterUserRequest) -> RegisterResponse:
        existing_email, existing_username = self._repo.find_by_email(str(dto.email)), self._repo.find_by_username(dto.username)
        if existing_email:
            raise UserAlreadyExists(f"Email {dto.email} already exists")
        if existing_username:
            raise UserAlreadyExists(f"Username {dto.username} already exists")

        hashed_password = self._hasher.hash(dto.password)
        user = User(
            username=dto.username,
            email=dto.email,
            password=hashed_password,
            full_name=dto.full_name,
            birthdate=datetime.strptime(dto.birthdate, '%Y-%m-%d'),
            gender=dto.gender,
            role=dto.role,
        )
        saved_user = self._repo.save(user)
        if not saved_user:
            raise ValueError("Failed to save user")

        access_token = self._token_generator.generate(user.id, user.role.value)
        return RegisterResponse(
            user=UserDTO(
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                birthdate=user.birthdate,
                gender=user.gender,
                role=user.role,
            ),
            access_token=access_token
        )

    def authenticate(self, dto: AuthUserRequest) -> AuthResponse:
        user = self._repo.find_by_username(dto.username)
        if not user or not self._hasher.verify(dto.password, user.password):
            raise InvalidCredentials("Invalid username or password")

        access_token = self._token_generator.generate(user.id, user.role)
        return AuthResponse(
            user=UserDTO(
                username=user.username,
                email=user.email,
                full_name=user.full_name,
                birthdate=user.birthdate,
                gender=user.gender,
                role=user.role
            ),
            access_token=access_token
        )
