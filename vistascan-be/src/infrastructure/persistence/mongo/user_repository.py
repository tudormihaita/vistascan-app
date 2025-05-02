import logging
import mongoengine as me
from typing import Optional
from uuid import UUID
from pymongo import MongoClient

from .models import UserDocument
from domain.entities.user import User
from application.interfaces.repositories import UserRepository


class MongoUserRepository(UserRepository):
    def __init__(self, db_name: str, db_uri: str):
        # self._col = client[db_name]["users"]
        me.connect(db_name, host=db_uri)

    def save(self, user: User) -> Optional[User]:
        """
        Save a User to the MongoDB collection.
        If the user already exists, it will be updated.
        """
        try:
            user_dict = {
                "username": user.username,
                "email": user.email,
                "password": user.password,
                "full_name": user.full_name,
                "birthdate": user.birthdate,
                "gender": user.gender.value,
                "role": user.role.value
            }

            UserDocument.objects(id=str(user.id)).modify(
                upsert=True,
                new=True,
                **user_dict
            )
            return user
        except Exception as e:
            logging.error(f"Error saving user {user.username}: {e}")
            return None

    def find_by_id(self, user_id: UUID) -> Optional[User]:
        try:
            user_doc = UserDocument.objects.get(id=str(user_id))
            return self._doc_to_entity(user_doc)
        except me.DoesNotExist:
            logging.warning(f"User with ID {user_id} not found.")
            return None

    def find_by_email(self, email: str) -> Optional[User]:
        try:
            user_doc = UserDocument.objects.get(email=email)
            return self._doc_to_entity(user_doc)
        except me.DoesNotExist:
            logging.warning(f"User with email {email} not found.")
            return None

    def find_by_username(self, username: str) -> Optional[User]:
        try:
            user_doc = UserDocument.objects.get(username=username)
            return self._doc_to_entity(user_doc)
        except me.DoesNotExist:
            logging.warning(f"User with username {username} not found.")
            return None

    @staticmethod
    def _doc_to_entity(doc: UserDocument) -> User:
        return User(
            id=UUID(doc.id),
            username=doc.username,
            email=doc.email,
            password=doc.password,
            full_name=doc.full_name,
            birthdate=doc.birthdate,
            gender=doc.gender,
            role=doc.role
        )
