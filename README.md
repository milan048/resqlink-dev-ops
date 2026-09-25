[![ResQLink CI](https://github.com/HrishiSwant/ResQLink/actions/workflows/ci.yml/badge.svg)](https://github.com/HrishiSwant/ResQLink/actions/workflows/ci.yml)

# ResQLink Microservices

Smart Emergency Resource Coordination System using FastAPI and MongoDB Atlas.

## Services

### Incident Service
- FastAPI
- MongoDB Atlas
- JWT Authentication
- Role-Based Access Control
- Rate Limiting
- Swagger/OpenAPI
- Incident CRUD
- Resource matching through Resource Service API

Runs on:

Service 1 : http://127.0.0.1:8000

### Resource Service
- FastAPI
- MongoDB Atlas
- JWT Authentication
- Role-Based Access Control
- Rate Limiting
- Swagger/OpenAPI
- Resource CRUD
- Resource matching

Runs on:

http://127.0.0.1:8001

## Requirements

- Python 3.10+
- MongoDB Atlas account
- MongoDB Atlas database user

## Installation

Clone/download the project.

Create and activate a virtual environment:

```powershell
python -m venv venv
```
### From Creator 

after downloading the zip file Extrct it in your system open that ResQlink named folder in vs code after installing first step you have to do is in terminal run
python -m venv venv
then 
.\venv\Scripts\Activate.ps1 ( ask gpt if any error occur)
👉only if it dosent work 
If PowerShell blocks activation
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser then .\venv\Scripts\Activate.ps1

after that : python -m pip install -r requirements.txt

create .env named file in your root 

everything is setup now 

cd incident-service
uvicorn app.main:app --reload --port 8000
then : http://127.0.0.1:8000/docs


DevOps CI/CD workflow verified.
