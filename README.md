# 📚 Libbook — ระบบบันทึกข้อมูลหนังสือห้องสมุด

**ชื่อ-นามสกุล:** นายกนต์ธร สุติยวัน
**รหัสนักศึกษา:** 68319010014
**ระดับชั้น/กลุ่มเรียน:** ปวส.2 / 3
**รหัสโปรเจกต์:** `libbook`

[![CI - libbook](https://github.com/Riflesss/midterm-devops-libbook-68319010014/actions/workflows/ci.yml/badge.svg)](https://github.com/<github-username>/midterm-devops-libbook-68319010014/actions/workflows/ci.yml)

> ⚠️ แทนที่ `<github-username>` และ `<รหัสนักศึกษา>` ใน badge URL ด้านบนด้วยข้อมูลจริงของคุณ หลังจาก push repo ขึ้น GitHub แล้ว badge จะแสดงสถานะ CI ล่าสุดโดยอัตโนมัติ

## คำอธิบายระบบ
Libbook เป็นระบบบันทึกทะเบียนหนังสือของห้องสมุดวิทยาลัย พัฒนาด้วยสถาปัตยกรรม 3 ส่วน (frontend / backend / database) ที่รันแยกกันผ่าน Docker Compose ผู้ใช้สามารถเพิ่ม แก้ไข ลบ และดูรายการหนังสือได้ผ่านหน้าเว็บ โดยข้อมูลจะถูกเก็บอย่างถาวรใน PostgreSQL

**Stack ที่ใช้:**
- Backend: Node.js + Express + PostgreSQL (`pg`)
- Frontend: Vue 3 + Vite
- Container: Docker + Docker Compose
- CI/CD: GitHub Actions (lint → test → build)

## 📋 API Endpoints

| Method | Endpoint            | คำอธิบาย                     |
|--------|----------------------|-------------------------------|
| GET    | `/health`            | ตรวจสอบสถานะเซิร์ฟเวอร์ → `{ status, version }` |
| GET    | `/api/books`         | ดึงรายการหนังสือทั้งหมด        |
| GET    | `/api/books/:id`     | ดึงข้อมูลหนังสือตาม id         |
| POST   | `/api/books`         | เพิ่มหนังสือใหม่               |
| PUT    | `/api/books/:id`     | แก้ไขข้อมูลหนังสือ             |
| PATCH  | `/api/books/:id`     | แก้ไขบางส่วนของข้อมูลหนังสือ   |
| DELETE | `/api/books/:id`     | ลบหนังสือ                      |

**ตัวอย่าง Body สำหรับ POST/PUT:**
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

## 🚀 วิธีรันระบบ

### 1. เตรียมไฟล์ environment
```bash
cp .env.example .env
# แก้ไขค่าใน .env ตามต้องการ (DB_USER, DB_PASSWORD, DB_NAME)
```

### 2. โหมด Development (build image เอง)
```bash
docker compose up --build
```
- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- Health check: http://localhost:3000/health

หยุดระบบ:
```bash
docker compose down
```

### 3. โหมด Production (pull image จาก Docker Hub)
แก้ไข `docker-compose.prod.yml` ให้ `<dockerhub-username>` เป็นชื่อบัญชี Docker Hub จริงของคุณ จากนั้นรัน:
```bash
docker compose -f docker-compose.prod.yml up -d
```
คำสั่งนี้จะ pull image `libbook-api` และ `libbook-web` จาก Docker Hub มารันได้ทันทีโดยไม่ต้องแก้โค้ดใด ๆ

## 🐳 Docker Hub

- Backend image: `https://hub.docker.com/r/<dockerhub-username>/libbook-api`
- Frontend image: `https://hub.docker.com/r/<dockerhub-username>/libbook-web`

Tags ที่ push: `latest`, `v1.0.0`

> หมายเหตุ: ก่อนใช้ `docker-compose.prod.yml` ให้แทนที่ `<dockerhub-username>` ด้วยชื่อผู้ใช้ Docker Hub ของคุณ

- `main` — production-ready code
- `develop` — integration branch
- `feature/*` — feature branches (merge เข้า develop ผ่าน Pull Request)

Commit message ใช้รูปแบบ: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`

## 🔄 CI Pipeline

Pipeline (`.github/workflows/ci.yml`) รันเมื่อ push ไป `develop`/`feature/*` และเมื่อเปิด Pull Request เข้า `main` ประกอบด้วย 3 jobs เรียงลำดับ:

1. **lint** — ตรวจสอบโค้ดด้วย ESLint
2. **test** — รัน Unit Test ด้วย Jest + Supertest
3. **build** — ตรวจสอบว่า Docker image ทั้ง backend และ frontend build ผ่าน

## 📁 โครงสร้างโปรเจกต์

```
midterm-devops-libbook-<รหัสนักศึกษา>/
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
