<template>
  <div class="container">
    <header>
      <h1>📚 Libbook - ระบบบันทึกข้อมูลหนังสือห้องสมุด</h1>
      <p class="student-info">
        ชื่อ-นามสกุล: <strong>นายกนต์ธร สุติยวัน</strong> |
        รหัสนักศึกษา: <strong>68319010014</strong>
      </p>
    </header>

    <section class="form-section">
      <h2>{{ editingId ? 'แก้ไขหนังสือ' : 'เพิ่มหนังสือใหม่' }}</h2>
      <form @submit.prevent="submitForm">
        <input v-model="form.isbn" placeholder="เลขทะเบียน/ISBN" required />
        <input v-model="form.title" placeholder="ชื่อหนังสือ" required />
        <input v-model="form.author" placeholder="ผู้แต่ง" required />
        <input v-model="form.category" placeholder="หมวดหมู่" />
        <input v-model.number="form.year" placeholder="ปีที่พิมพ์" type="number" />
        <select v-model="form.status">
          <option value="available">พร้อมให้ยืม</option>
          <option value="borrowed">ถูกยืม</option>
          <option value="damaged">ชำรุด</option>
        </select>
        <button type="submit">{{ editingId ? 'บันทึกการแก้ไข' : 'เพิ่มหนังสือ' }}</button>
        <button type="button" v-if="editingId" @click="cancelEdit">ยกเลิก</button>
      </form>
    </section>

    <section>
      <h2>รายการหนังสือ</h2>
      <p v-if="loading">กำลังโหลด...</p>
      <p v-if="error" class="error">{{ error }}</p>
      <table v-if="books.length">
        <thead>
          <tr>
            <th>ISBN</th>
            <th>ชื่อหนังสือ</th>
            <th>ผู้แต่ง</th>
            <th>หมวดหมู่</th>
            <th>ปี</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="book in books" :key="book.id">
            <td>{{ book.isbn }}</td>
            <td>{{ book.title }}</td>
            <td>{{ book.author }}</td>
            <td>{{ book.category }}</td>
            <td>{{ book.year }}</td>
            <td>{{ book.status }}</td>
            <td>
              <button @click="editBook(book)">แก้ไข</button>
              <button @click="deleteBook(book.id)">ลบ</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else-if="!loading">ยังไม่มีข้อมูลหนังสือ</p>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const API_URL = import.meta.env.VITE_API_URL || '/api/books';

const books = ref([]);
const loading = ref(false);
const error = ref('');
const editingId = ref(null);

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
.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  font-family: sans-serif;
}
.student-info {
  color: #555;
  font-size: 0.9em;
}
form {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
input,
select {
  padding: 6px;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}
th {
  background: #f4f4f4;
}
.error {
  color: red;
}
</style>
