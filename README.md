# VistaScan

**Remote radiology consultation platform for chest X-ray imaging studies.**

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)

## Repository Overview

```
vistascan-app/
├── vistascan-be/          # FastAPI backend server
└── vistascan-fe/          # React frontend web client
```

## Tech Stack

- **Backend**: FastAPI, MongoDB
- **Frontend**: React, TypeScript, RTK Query, Antd, Tailwind CSS
- **AI/ML**: Integration with CLIP-XRGen for automated report generation
- **Storage**: MinIO S3
- **Authentication**: JWT

## Quick Start

### Backend
```bash
cd vistascan-be
poetry install
poetry run uvicorn main:app --reload
```

### Frontend
```bash
cd vistascan-fe
npm install
npm start
```

### API Documentation
Interactive API documentation is available at `http://localhost:8000/docs`
