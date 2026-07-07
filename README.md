# 📚 Libbook — ระบบบันทึกข้อมูลหนังสือห้องสมุด

**ชื่อ-นามสกุล:** นายกนต์ธร สุติยวัน
**รหัสนักศึกษา:** 68319010014
**ระดับชั้น/กลุ่มเรียน:** ปวส.2 / 3
**รหัสโปรเจกต์:** `libbook`

[![CI - libbook](https://github.com/Riflesss/midterm-devops-libbook-68319010014/actions/workflows/ci.yml/badge.svg)](https://github.com/Riflesss/midterm-devops-libbook-68319010014/actions/workflows/ci.yml)

> CI workflow: [GitHub Actions](https://github.com/Riflesss/midterm-devops-libbook-68319010014/actions/workflows/ci.yml)

## คำอธิบายระบบ
Libbook เป็นระบบจัดการทะเบียนหนังสือของห้องสมุดวิทยาลัย ซึ่งมี frontend, backend และ database แยกเป็น service โดยรันด้วย Docker Compose

- Backend: Node.js + Express + PostgreSQL
- Frontend: Vue 3 + Vite
- Database: PostgreSQL 16 (persistent volume)
- CI: GitHub Actions (lint → test → build)

ระบบรองรับการเพิ่ม, แก้ไข, ลบ, และแสดงผลรายการหนังสือทั้งหมดจากหน้าเว็บ โดยข้อมูลจะถูกเก็บอย่างถาวรใน PostgreSQL volume

## 📋 API Endpoints

| Method | Endpoint            | คำอธิบาย |
|--------|---------------------|----------|
| GET    | `/health`           | ตรวจสอบสถานะเซิร์ฟเวอร์และเวอร์ชัน |
| GET    | `/api/books`        | ดึงรายการหนังสือทั้งหมด |
| GET    | `/api/books/:id`    | ดึงหนังสือตาม `id` |
| POST   | `/api/books`        | สร้างหนังสือใหม่ |
| PUT    | `/api/books/:id`    | แก้ไขหนังสือทั้งหมดตาม `id` |
| PATCH  | `/api/books/:id`    | แก้ไขบางส่วนของหนังสือตาม `id` |
| DELETE | `/api/books/:id`    | ลบหนังสือตาม `id` |

### ตัวอย่าง

**GET /health**

Response:
```json
{
  "status": "ok",
  "version": "1.0.0"
}
```

**POST /api/books**

Request body:
```json
{
  "isbn": "978-616-000-000-0",
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "category": "Software Engineering",
  "year": 2008,
  "status": "available"
}
```

**PATCH /api/books/:id**

Request body:
```json
{
  "status": "borrowed"
}
```

> หาก `id` ไม่พบ จะตอบกลับ `404 Not Found` สำหรับ `GET`, `PUT`, `PATCH`, และ `DELETE`

## 🔧 Environment variables

ไฟล์ `.env` ถูกอ่านโดย backend และ frontend build-time

ค่าเริ่มต้นอยู่ใน `.env.example`

```bash
DB_HOST=db
DB_PORT=5432
DB_USER=libbook_user
DB_PASSWORD=changeme
DB_NAME=libbook
PORT=3000
VITE_API_URL=/api/books
```

## 🚀 วิธีรันระบบ

### 1. เตรียมไฟล์ environment

```bash
cp .env.example .env
```

### 2. โหมด Development (build image เอง)

```bash
docker compose up --build
```

บริการจะรันที่:
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

ข้อมูลหนังสือจะเก็บผ่าน volume `libbook-db-data` ซึ่งทำให้ข้อมูลยังอยู่หลัง restart container

หยุดระบบ:

```bash
docker compose down
```

### 3. โหมด Production (pull image จาก Docker Hub)

```bash
cp .env.example .env

docker compose -f docker-compose.prod.yml up -d
```

ระบบจะดึง images จาก Docker Hub และรันได้ทันทีโดยไม่ต้องแก้ไฟล์ใด ๆ

หยุดระบบ:

```bash
docker compose -f docker-compose.prod.yml down
```

## 🐳 Docker Hub

- Backend image: https://hub.docker.com/r/yinyaodebaoyea/libbook-api
- Frontend image: https://hub.docker.com/r/yinyaodebaoyea/libbook-web

Tags ที่ push:
- `latest`
- `v1.0.0`

> หากต้องการใช้ Docker Hub บัญชีอื่น ให้แก้ชื่อ image ใน `docker-compose.prod.yml`

## ✅ การทดสอบและ CI

### Run tests

```bash
cd backend
npm install
npm test
```

### Build Docker images local

```bash
docker build -t libbook-api ./backend
docker build -t libbook-web ./frontend
```

### GitHub Actions

Workflow `.github/workflows/ci.yml` จะรันเมื่อ:
- push ไปยัง `develop`
- push ไปยัง `feature/*`
- เปิด Pull Request เข้า `main`

Jobs:
1. **lint** — ตรวจสอบโค้ดด้วย ESLint
2. **test** — รัน unit tests ด้วย Jest + Supertest
3. **build** — ตรวจสอบการ build ของ Docker image backend และ frontend

## 📁 โครงสร้างโปรเจกต์

```
midterm-devops-libbook-68319010014/
├── README.md
├── .gitignore
├── .env.example
├── docker-compose.yml
├── docker-compose.prod.yml
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── Dockerfile
│   ├── .dockerignore
│   ├── package.json
│   ├── index.js
│   ├── db.js
│   ├── init.sql
│   ├── eslint.config.js
│   ├── routes/
│   │   └── books.js
│   └── tests/
│       ├── health.test.js
│       └── books.test.js
└── frontend/
    ├── Dockerfile
    ├── .dockerignore
    ├── nginx.conf
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.js
        └── App.vue
```
