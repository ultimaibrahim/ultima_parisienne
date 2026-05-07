const fs=require('fs'); 
let c=fs.readFileSync('js/app.js','utf8'); 
c += `

// ── ADMIN: CRUD Usuarios ─────────────────────────────────────

async function renderAdminUsers() {
  const tb = document.getElementById('admin-users-body');
  if (!tb) return;
  tb.innerHTML = '<tr><td colspan="5" style="padding:16px;">Cargando usuarios...</td></tr>';
  const res = await apiCall('getUsers');
  if (!res.ok) { tb.innerHTML = '<tr><td colspan="5">Error: ' + escapeHtml(res.error) + '</td></tr>'; return; }
  
  tb.innerHTML = '';
  res.data.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = \`
      <td style="font-weight:600;">\${escapeHtml(u.nombre)}</td>
      <td>\${escapeHtml(u.correo)}</td>
      <td>\${escapeHtml(u.sucursal || '—')}</td>
      <td><span class="status-badge\${u.rol==='gerente'?' status-pending':' status-done'}">\${escapeHtml(u.rol)}</span></td>
      <td>
        <button class="btn-secondary" style="padding:4px 8px;font-size:11px;" onclick="abrirAdminNuevoUsuario('\${escapeHtml(u.correo)}', '\${escapeHtml(u.nombre)}', '\${escapeHtml(u.rol)}', '\${escapeHtml(u.sucursal||'')}')">Editar</button>
        <button class="btn-secondary" style="padding:4px 8px;font-size:11px;color:#c62828;" onclick="eliminarAdminUsuario('\${escapeHtml(u.correo)}')">X</button>
      </td>
    \`;
    tb.appendChild(tr);
  });
}

function abrirAdminNuevoUsuario(correo='', nombre='', rol='gerente', sucursal='') {
  document.getElementById('modal-user-correo').value = correo;
  document.getElementById('modal-user-correo').disabled = !!correo;
  document.getElementById('modal-user-nombre').value = nombre;
  document.getElementById('modal-user-rol').value = rol;
  document.getElementById('modal-user-pass').value = '';
  
  const sucSel = document.getElementById('modal-user-sucursal');
  sucSel.innerHTML = '<option value="">Ninguna</option>';
  SUCURSALES.forEach(s => {
    const opt = document.createElement('option'); opt.value = s; opt.textContent = s; sucSel.appendChild(opt);
  });
  sucSel.value = sucursal;
  
  document.getElementById('modal-user-title').textContent = correo ? 'Editar Usuario' : 'Nuevo Usuario';
  document.getElementById('modal-admin-user').classList.remove('hidden');
}

async function guardarAdminUsuario() {
  const btn = document.getElementById('btn-save-user');
  const correo = document.getElementById('modal-user-correo').value.trim();
  const nombre = document.getElementById('modal-user-nombre').value.trim();
  const rol = document.getElementById('modal-user-rol').value;
  const sucursal = document.getElementById('modal-user-sucursal').value;
  const password = document.getElementById('modal-user-pass').value;
  
  if (!correo || !nombre) { mostrarToast('⚠️ Completa nombre y correo'); return; }
  btn.disabled = true; btn.textContent = 'Guardando...';
  
  const res = await apiCall('saveUser', { correo, nombre, rol, sucursal, password });
  btn.disabled = false; btn.textContent = 'Guardar';
  
  if (res.ok) {
    document.getElementById('modal-admin-user').classList.add('hidden');
    mostrarToast('✅ Usuario guardado');
    renderAdminUsers();
  } else {
    mostrarToast('⚠️ Error: ' + res.error);
  }
}

async function eliminarAdminUsuario(correo) {
  if (!confirm('¿Seguro de eliminar al usuario ' + correo + '?')) return;
  const res = await apiCall('deleteUser', { correo });
  if (res.ok) { mostrarToast('🗑️ Usuario eliminado'); renderAdminUsers(); }
  else { mostrarToast('⚠️ Error: ' + res.error); }
}
`; 
fs.writeFileSync('js/app.js', c);
