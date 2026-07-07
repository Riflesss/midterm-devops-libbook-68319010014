<template>
  <div class="page">
    <header class="placard">
      <h1 class="placard__title">Libbook</h1>
      <p class="placard__subtitle">ระบบบันทึกข้อมูลหนังสือห้องสมุด</p>
      <p class="placard__meta">
        <span>นายกนต์ธร สุติยวัน</span>
        <span class="dot">·</span>
        <span>รหัสนักศึกษา 68319010014</span>
      </p>
    </header>

    <main class="layout">
      <section class="card" aria-labelledby="form-heading">
        <span class="card__punch" aria-hidden="true"></span>
        <h2 id="form-heading" class="card__title">
          {{ editingId ? 'แก้ไขรายการ' : 'บัตรรายการใหม่' }}
        </h2>

        <form class="card__form" @submit.prevent="submitForm">
          <label class="field">
            <span class="field__label">เลขทะเบียน / ISBN</span>
            <input v-model="form.isbn" class="field__input field__input--mono" required />
          </label>

          <label class="field">
            <span class="field__label">ชื่อหนังสือ</span>
            <input v-model="form.title" class="field__input" required />
          </label>

          <label class="field">
            <span class="field__label">ผู้แต่ง</span>
            <input v-model="form.author" class="field__input" required />
          </label>

          <div class="field-row">
            <label class="field">
              <span class="field__label">หมวดหมู่</span>
              <input v-model="form.category" class="field__input" />
            </label>

            <label class="field field--narrow">
              <span class="field__label">ปีพิมพ์</span>
              <input v-model.number="form.year" class="field__input" type="number" />
            </label>
          </div>

          <label class="field">
            <span class="field__label">สถานะ</span>
            <select v-model="form.status" class="field__input field__select">
              <option value="available">พร้อมให้ยืม</option>
              <option value="borrowed">ถูกยืม</option>
              <option value="damaged">ชำรุด</option>
            </select>
          </label>

          <div class="card__actions">
            <button type="submit" class="btn btn--stamp">
              {{ editingId ? 'บันทึกการแก้ไข' : 'ประทับรายการ' }}
            </button>
            <button
              v-if="editingId"
              type="button"
              class="btn btn--ghost"
              @click="cancelEdit"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </section>

      <section class="ledger" aria-labelledby="ledger-heading">
        <div class="ledger__head">
          <h2 id="ledger-heading" class="ledger__title">รายการหนังสือทั้งหมด</h2>
          <span class="ledger__count">{{ books.length }} เล่ม</span>
        </div>

        <p v-if="loading" class="state state--loading">กำลังเปิดตู้บัตร...</p>
        <p v-if="error" class="state state--error">{{ error }}</p>

        <div v-if="books.length" class="ledger__scroll">
          <table class="ledger__table">
            <thead>
              <tr>
                <th>ISBN</th>
                <th>ชื่อหนังสือ</th>
                <th>ผู้แต่ง</th>
                <th>หมวดหมู่</th>
                <th>ปี</th>
                <th>สถานะ</th>
                <th class="col-actions">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in books" :key="book.id">
                <td class="mono">{{ book.isbn }}</td>
                <td class="title-cell">{{ book.title }}</td>
                <td>{{ book.author }}</td>
                <td>{{ book.category || '—' }}</td>
                <td>{{ book.year || '—' }}</td>
                <td>
                  <span class="stamp" :class="statusClass(book.status)">
                    {{ statusLabel(book.status) }}
                  </span>
                </td>
                <td class="col-actions">
                  <button class="icon-btn" title="แก้ไข" @click="editBook(book)">แก้ไข</button>
                  <button class="icon-btn icon-btn--danger" title="ลบ" @click="deleteBook(book.id)">
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="!loading" class="empty">
          <p class="empty__title">ตู้บัตรว่างเปล่า</p>
          <p class="empty__hint">เริ่มต้นด้วยการกรอกบัตรรายการทางด้านซ้าย</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || '/api/books';

const books = ref([]);
const loading = ref(false);
const error = ref('');
const editingId = ref(null);

const STATUS_MAP = {
  available: { label: 'พร้อมให้ยืม', class: 'stamp--available' },
  borrowed: { label: 'ถูกยืม', class: 'stamp--borrowed' },
  damaged: { label: 'ชำรุด', class: 'stamp--damaged' },
};

function statusLabel(status) {
  return STATUS_MAP[status]?.label || status;
}

function statusClass(status) {
  return STATUS_MAP[status]?.class || '';
}

const emptyForm = () => ({
  isbn: '',
  title: '',
  author: '',
  category: '',
  year: null,
  status: 'available',
});

const form = ref(emptyForm());

async function fetchBooks() {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('โหลดข้อมูลไม่สำเร็จ');
    books.value = await res.json();
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

async function submitForm() {
  try {
    const method = editingId.value ? 'PUT' : 'POST';
    const url = editingId.value ? `${API_URL}/${editingId.value}` : API_URL;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    });
    if (!res.ok) throw new Error('บันทึกข้อมูลไม่สำเร็จ');
    await fetchBooks();
    cancelEdit();
  } catch (e) {
    error.value = e.message;
  }
}

function editBook(book) {
  editingId.value = book.id;
  form.value = { ...book };
}

function cancelEdit() {
  editingId.value = null;
  form.value = emptyForm();
}

async function deleteBook(id) {
  // eslint-disable-next-line no-alert
  if (!window.confirm('ยืนยันการลบหนังสือนี้?')) return;
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('ลบข้อมูลไม่สำเร็จ');
    await fetchBooks();
  } catch (e) {
    error.value = e.message;
  }
}

onMounted(fetchBooks);
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Thai:wght@500;700&family=Sarabun:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  background: #e7ebe0;
  font-family: 'Sarabun', sans-serif;
  color: #23291f;
}

/* ---------- Header placard ---------- */
.placard {
  background: #1f3a2e;
  background-image:
    radial-gradient(circle at 15% 20%, rgba(255, 255, 255, 0.04), transparent 40%),
    radial-gradient(circle at 85% 80%, rgba(255, 255, 255, 0.03), transparent 45%);
  color: #f2ece0;
  padding: 48px 32px 40px;
  text-align: center;
  border-bottom: 6px double #a6822c;
}

.placard__eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #c9b98a;
  margin-bottom: 10px;
}

.placard__title {
  font-family: 'Noto Serif Thai', serif;
  font-weight: 700;
  font-size: clamp(2rem, 4vw, 2.8rem);
  margin: 0 0 6px;
  letter-spacing: 0.02em;
}

.placard__subtitle {
  margin: 0 0 14px;
  font-size: 1rem;
  color: #d7d0bd;
}

.placard__meta {
  margin: 0;
  font-size: 0.85rem;
  color: #a9b9ac;
}

.placard__meta .dot {
  margin: 0 8px;
  opacity: 0.6;
}

/* ---------- Layout ---------- */
.layout {
  max-width: 1080px;
  margin: -20px auto 60px;
  padding: 0 24px;
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 28px;
  align-items: start;
}

@media (max-width: 820px) {
  .layout {
    grid-template-columns: 1fr;
  }
}

/* ---------- Index card (form) ---------- */
.card {
  position: relative;
  background: #fbf8f1;
  border: 1px dashed #b7a982;
  border-radius: 4px;
  padding: 28px 22px 24px;
  box-shadow: 0 10px 24px rgba(31, 58, 46, 0.1);
  top: 20px;
}

.card__punch {
  position: absolute;
  top: 14px;
  left: 18px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e7ebe0;
  box-shadow: inset 0 0 0 1px #b7a982;
}

.card__title {
  font-family: 'Noto Serif Thai', serif;
  font-size: 1.15rem;
  margin: 4px 0 20px 8px;
  color: #1f3a2e;
}

.card__form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-row {
  display: flex;
  gap: 12px;
}

.field-row .field {
  flex: 1;
}

.field--narrow {
  flex: 0 0 90px;
}

.field__label {
  font-size: 0.75rem;
  color: #6b6152;
  letter-spacing: 0.03em;
}

.field__input {
  border: none;
  border-bottom: 1.5px solid #c9bd9e;
  background: transparent;
  padding: 6px 2px;
  font-size: 0.95rem;
  font-family: inherit;
  color: #23291f;
  transition: border-color 0.15s ease;
}

.field__input:focus {
  outline: none;
  border-bottom-color: #1f3a2e;
}

.field__input--mono {
  font-family: 'IBM Plex Mono', monospace;
  letter-spacing: 0.04em;
}

.field__select {
  border-bottom: 1.5px solid #c9bd9e;
  padding: 6px 2px;
  appearance: none;
  background: transparent;
  cursor: pointer;
}

.card__actions {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}

.btn {
  font-family: 'Sarabun', sans-serif;
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.03em;
  padding: 10px 18px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.btn:active {
  transform: translateY(1px);
}

.btn--stamp {
  background: #8c2f26;
  color: #f6ece4;
  box-shadow: 0 3px 0 #5f1f19;
}

.btn--stamp:hover {
  box-shadow: 0 4px 0 #5f1f19;
  transform: translateY(-1px);
}

.btn--ghost {
  background: transparent;
  color: #6b6152;
  border: 1px solid #c9bd9e;
}

.btn--ghost:hover {
  background: #efe9db;
}

/* ---------- Ledger (table) ---------- */
.ledger {
  background: #fbf8f1;
  border: 1px solid #ddd3ba;
  border-radius: 4px;
  padding: 22px 22px 12px;
  box-shadow: 0 10px 24px rgba(31, 58, 46, 0.08);
}

.ledger__head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  border-bottom: 2px solid #1f3a2e;
  padding-bottom: 10px;
  margin-bottom: 10px;
}

.ledger__title {
  font-family: 'Noto Serif Thai', serif;
  font-size: 1.15rem;
  color: #1f3a2e;
  margin: 0;
}

.ledger__count {
  font-size: 0.8rem;
  color: #8c8266;
  font-family: 'IBM Plex Mono', monospace;
}

.ledger__scroll {
  overflow-x: auto;
}

.ledger__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.ledger__table th {
  text-align: left;
  font-weight: 600;
  font-size: 0.72rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: #8c8266;
  padding: 8px 10px;
  border-bottom: 1px solid #ddd3ba;
}

.ledger__table td {
  padding: 12px 10px;
  border-bottom: 1px solid #ece6d6;
  vertical-align: middle;
}

.ledger__table tbody tr:hover {
  background: #f2ecdc;
}

.mono {
  font-family: 'IBM Plex Mono', monospace;
  font-size: 0.82rem;
  color: #6b6152;
}

.title-cell {
  font-weight: 600;
  color: #1f3a2e;
}

.col-actions {
  white-space: nowrap;
  text-align: right;
}

.icon-btn {
  background: none;
  border: 1px solid #c9bd9e;
  border-radius: 3px;
  padding: 5px 10px;
  font-size: 0.78rem;
  color: #23291f;
  cursor: pointer;
  margin-left: 6px;
}

.icon-btn:hover {
  background: #efe9db;
}

.icon-btn--danger {
  border-color: #c98b83;
  color: #8c2f26;
}

.icon-btn--danger:hover {
  background: #f3ded9;
}

/* ---------- Status stamps ---------- */
.stamp {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  padding: 4px 10px;
  border-radius: 3px;
  border: 1.5px solid currentColor;
  transform: rotate(-2deg);
}

.stamp--available {
  color: #1f3a2e;
  background: rgba(31, 58, 46, 0.08);
}

.stamp--borrowed {
  color: #a6822c;
  background: rgba(166, 130, 44, 0.1);
}

.stamp--damaged {
  color: #8c2f26;
  background: rgba(140, 47, 38, 0.1);
}

/* ---------- States ---------- */
.state {
  font-size: 0.9rem;
  padding: 10px 2px;
}

.state--loading {
  color: #8c8266;
}

.state--error {
  color: #8c2f26;
}

.empty {
  text-align: center;
  padding: 40px 20px;
  color: #8c8266;
}

.empty__title {
  font-family: 'Noto Serif Thai', serif;
  font-size: 1.05rem;
  color: #1f3a2e;
  margin: 0 0 6px;
}

.empty__hint {
  margin: 0;
  font-size: 0.85rem;
}
</style>