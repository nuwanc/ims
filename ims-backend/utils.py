import bcrypt
from cryptography.fernet import Fernet

def hash_password(password):
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password, hashed):
    return bcrypt.checkpw(password.encode('utf-8'), hashed)



ENCRYPTION_KEY = b'lLVe-QyBCdYFcEr8Z4_2vUrfDEdJ7_8WTLhCf2YttqQ='
cipher = Fernet(ENCRYPTION_KEY)

def encrypt_data(data):
    return cipher.encrypt(data)

def decrypt_data(encrypted_data):
    return cipher.decrypt(encrypted_data)
