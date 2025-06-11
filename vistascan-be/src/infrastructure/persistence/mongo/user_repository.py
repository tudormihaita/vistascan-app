import logging
import mongoengine as me
from typing import Optional, List
from uuid import UUID
from pymongo import MongoClient

from .models import UserDocument
from domain.entities.user import User
from application.interfaces.repositories import UserRepository


class MongoUserRepository(UserRepository):
    def __init__(self, db_name: str, db_uri: str):
        me.connect(db_name, host=db_uri)

    def save(self, user: User) -> Optional[User]:
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

    def find_all(self) -> List[User]:
        try:
            user_docs = UserDocument.objects.all()
            return [self._doc_to_entity(doc) for doc in user_docs]
        except Exception as e:
            logging.error(f"Error retrieving all users: {e}")
            return []

    def delete_by_id(self, user_id: UUID) -> bool:
        try:
            user_doc = UserDocument.objects.get(id=str(user_id))
            user_doc.delete()
            logging.info(f"User with ID {user_id} deleted successfully.")
            return True
        except me.DoesNotExist:
            logging.warning(f"User with ID {user_id} not found.")
            return False
        except Exception as e:
            logging.error(f"Error deleting user {user_id}: {e}")
            return False

    def update(self, user: User) -> Optional[User]:
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

            UserDocument.objects(id=str(user.id)).update_one(**user_dict)
            updated_doc = UserDocument.objects.get(id=str(user.id))
            return self._doc_to_entity(updated_doc)
        except me.DoesNotExist:
            logging.warning(f"User with ID {user.id} not found for update.")
            return None
        except Exception as e:
            logging.error(f"Error updating user {user.id}: {e}")
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
