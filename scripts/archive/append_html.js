const fs=require('fs'); 
let c=fs.readFileSync('pages/admin-section.html','utf8'); 
c += `

<!-- Modal de Usuario -->
<div id="modal-admin-user" class="modal-overlay hidden">
  <div class="modal-box">
    <h3 id="modal-user-title">Nuevo Usuario</h3>
    <input type="text" id="modal-user-nombre" placeholder="Nombre completo" class="modal-input">
    <input type="email" id="modal-user-correo" placeholder="Correo (login)" class="modal-input">
    <input type="password" id="modal-user-pass" placeholder="Contraseña (dejar en blanco si no cambia)" class="modal-input">
    <select id="modal-user-rol" class="modal-input">
      <option value="gerente">Gerente</option>
      <option value="regional">Regional</option>
      <option value="zonal">Zonal</option>
      <option value="analista">Analista</option>
      <option value="admin">Administrador</option>
    </select>
    <select id="modal-user-sucursal" class="modal-input">
      <option value="">Ninguna (Regional/Admin)</option>
      <!-- se puebla dinamicamente -->
    </select>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="document.getElementById('modal-admin-user').classList.add('hidden')">Cancelar</button>
      <button class="btn-primary" id="btn-save-user" onclick="guardarAdminUsuario()">Guardar</button>
    </div>
  </div>
</div>
`; 
c=c.replace('<span class="table-header-title">Usuarios del portal</span>', '<span class="table-header-title">Usuarios del portal</span><button onclick="abrirAdminNuevoUsuario()" style="background:rgba(255,255,255,.15);border:none;color:var(--crema);padding:7px 16px;border-radius:20px;font-size:12px;cursor:pointer;font-family:\\'DM Sans\\',sans-serif;font-weight:600;">+ Nuevo usuario</button>'); 
fs.writeFileSync('pages/admin-section.html', c);
