from cryptography.fernet import Fernet

ENCRYPTION_KEY = b'lLVe-QyBCdYFcEr8Z4_2vUrfDEdJ7_8WTLhCf2YttqQ='
cipher = Fernet(ENCRYPTION_KEY)

def encrypt_data(data):
    return cipher.encrypt(data)

def decrypt_data(encrypted_data):
    return cipher.decrypt(encrypted_data)