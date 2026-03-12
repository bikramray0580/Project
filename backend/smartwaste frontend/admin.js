// admin.js
(() => {
  const API_BASE = '/api/admin';
  const ADMIN_KEY = prompt('Enter admin key to open admin panel (will be sent as x-admin-key)') || '';

  const headers = { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY };

  const searchInput = document.getElementById('searchInput');
  const typeSelect = document.getElementById('typeSelect');
  const searchBtn = document.getElementById('searchBtn');
  const listContainer = document.getElementById('listContainer');
  const refreshBtn = document.getElementById('refreshBtn');

  const editModal = document.getElementById('editModal');
  const closeModal = document.getElementById('closeModal');
  const editForm = document.getElementById('editForm');
  const modalTitle = document.getElementById('modalTitle');
  const editMsg = document.getElementById('editMsg');
  const deleteBtn = document.getElementById('deleteBtn');
  const approveToggle = document.getElementById('approveToggle');

  const historyModal = document.getElementById('historyModal');
  const showHistoryBtn = document.getElementById('showHistoryBtn');
  const closeHistory = document.getElementById('closeHistory');
  const historyList = document.getElementById('historyList');

  const setLoading = (el, txt='') => el.innerHTML = txt ? `<em>${txt}</em>` : '';

  async function fetchList() {
    const type = typeSelect.value;
    const q = encodeURIComponent(searchInput.value || '');
    setLoading(listContainer, 'Loading...');
    try {
      const res = await fetch(`${API_BASE}/${type}?q=${q}&limit=200`, { headers });
      if (res.status === 401) return showAuthError();
      const data = await res.json();
      renderList(type, data.items || []);
    } catch (err) {
      console.error(err);
      setLoading(listContainer, 'Failed to load list');
    }
  }

  function showAuthError() {
    listContainer.innerHTML = `<p style="color:crimson">Unauthorized: invalid admin key. Reload and provide correct key.</p>`;
  }

  function renderList(type, items) {
    if (!items || items.length === 0) {
      listContainer.innerHTML = `<p class="small">No ${type} items found.</p>`;
      return;
    }

    const rows = items.map(it => {
      const approved = it.approved ? '✅' : '—';
      const title = it.title || (it.name || 'Untitled');
      const material = it.material || '-';
      const qty = it.quantity || it.qty || '-';
      const created = new Date(it.createdAt).toLocaleString();
      return `
        <tr data-id="${it.id}" data-type="${type}">
          <td>${title}</td>
          <td>${material}</td>
          <td>${qty}</td>
          <td>${approved}</td>
          <td class="small">${created}</td>
          <td>
            <button class="btn btn-edit btn-open">Edit</button>
            <button class="btn btn-danger btn-delete">Delete</button>
          </td>
        </tr>
      `;
    }).join('');

    listContainer.innerHTML = `
      <table>
        <thead><tr><th>Title</th><th>Material</th><th>Qty</th><th>Approved</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;

    document.querySelectorAll('.btn-open').forEach(b => b.addEventListener('click', openFromRow));
    document.querySelectorAll('.btn-delete').forEach(b => b.addEventListener('click', deleteFromRow));
  }

  function openFromRow(e) {
    const tr = e.target.closest('tr');
    const id = tr.dataset.id;
    const type = tr.dataset.type;
    openEditModal(type, id);
  }

  async function deleteFromRow(e) {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    const tr = e.target.closest('tr');
    const id = tr.dataset.id;
    const type = tr.dataset.type;
    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, { method: 'DELETE', headers });
      if (res.status === 401) return showAuthError();
      const data = await res.json();
      if (data.success) {
        alert('Deleted');
        fetchList();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  }

  // fetch specific item and open modal
  async function openEditModal(type, id) {
    try {
      const url = type === 'waste' ? `/api/waste/${id}` : `/api/request/${id}`;
      const res = await fetch(url); // public endpoint expected to exist in your app
      if (!res.ok) {
        const text = await res.text();
        alert('Failed to fetch item: ' + text);
        return;
      }
      const item = await res.json();
      // fill form
      document.getElementById('editType').value = type;
      document.getElementById('editId').value = id;
      document.getElementById('editTitle').value = item.title || item.name || '';
      document.getElementById('editMaterial').value = item.material || '';
      document.getElementById('editDesc').value = item.description || item.desc || '';
      document.getElementById('editQty').value = item.quantity || item.qty || '';
      document.getElementById('editLocation').value = item.location || '';
      document.getElementById('editApproved').value = (!!item.approved).toString();
      modalTitle.textContent = `${type.toUpperCase()} · Edit #${id}`;
      editMsg.textContent = '';
      editModal.classList.add('show');
      editModal.setAttribute('aria-hidden', 'false');
    } catch (err) {
      console.error(err);
      alert('Failed to open modal');
    }
  }

  closeModal.addEventListener('click', () => {
    editModal.classList.remove('show');
    editModal.setAttribute('aria-hidden', 'true');
  });

  editForm.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const type = document.getElementById('editType').value;
    const id = document.getElementById('editId').value;
    const payload = {
      title: document.getElementById('editTitle').value,
      material: document.getElementById('editMaterial').value,
      description: document.getElementById('editDesc').value,
      quantity: document.getElementById('editQty').value,
      location: document.getElementById('editLocation').value,
      approved: document.getElementById('editApproved').value === 'true'
    };
    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.status === 401) return showAuthError();
      const data = await res.json();
      if (data.success) {
        editMsg.textContent = 'Saved';
        fetchList();
        setTimeout(() => { editModal.classList.remove('show'); }, 700);
      } else {
        editMsg.textContent = 'Save failed';
      }
    } catch (err) {
      console.error(err);
      editMsg.textContent = 'Save error';
    }
  });

  deleteBtn.addEventListener('click', async () => {
    if (!confirm('Delete this item? This cannot be undone.')) return;
    const type = document.getElementById('editType').value;
    const id = document.getElementById('editId').value;
    try {
      const res = await fetch(`${API_BASE}/${type}/${id}`, { method: 'DELETE', headers });
      if (res.status === 401) return showAuthError();
      const data = await res.json();
      if (data.success) {
        alert('Deleted');
        editModal.classList.remove('show');
        fetchList();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      console.error(err);
      alert('Delete failed');
    }
  });

  approveToggle.addEventListener('click', async () => {
    const type = document.getElementById('editType').value;
    const id = document.getElementById('editId').value;
    const currently = document.getElementById('editApproved').value === 'true';
    try {
      const res = await fetch(`${API_BASE}/${type}/${id}/approve`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ approve: !currently })
      });
      if (res.status === 401) return showAuthError();
      const data = await res.json();
      if (data.success) {
        document.getElementById('editApproved').value = (!currently).toString();
        alert(`Item is now ${!currently ? 'approved' : 'unapproved'}`);
        fetchList();
      } else {
        alert('Approval failed');
      }
    } catch (err) {
      console.error(err);
      alert('Approval failed');
    }
  });

  // history
  showHistoryBtn.addEventListener('click', async () => {
    historyModal.classList.add('show');
    try {
      const res = await fetch(`${API_BASE}/history?limit=200`, { headers });
      if (res.status === 401) {
        historyList.innerHTML = '<p style="color:crimson">Unauthorized</p>';
        return;
      }
      const data = await res.json();
      historyList.innerHTML = data.items.map(h => {
        const time = new Date(h.createdAt).toLocaleString();
        return `<div class="card"><div class="small">${time} — <strong>${h.action}</strong> on <em>${h.entity}</em> #${h.entityId}</div>
                 <pre style="white-space:pre-wrap">${h.payload || ''}</pre></div>`;
      }).join('');
    } catch (err) {
      console.error(err);
      historyList.innerHTML = '<p>Failed to load history</p>';
    }
  });

  closeHistory.addEventListener('click', () => historyModal.classList.remove('show'));

  // search / refresh
  searchBtn.addEventListener('click', fetchList);
  refreshBtn.addEventListener('click', fetchList);

  // initial
  fetchList();

})();
