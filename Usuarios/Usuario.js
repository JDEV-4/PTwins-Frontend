let currentPage = 1;
const pageSize = 6;

const btnAgregarUsuario = document.getElementById("btnAgregarUsuario");
const btnToggleEstado = document.getElementById("btnToggleEstado");
const modalUsuario = document.getElementById("modalUsuario");
const cerrarModal = document.getElementById("cerrarModal");
const formUsuario = document.getElementById("formUsuario");
const tituloModal = document.getElementById("tituloModal");
const idUsuario = document.getElementById("idUsuario");
const tbody = document.querySelector(".usuario-tabla tbody");

const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const spanNumeroPagina = document.getElementById("pageNumber");

const token = localStorage.getItem("token");

let mostrarActivos = true;
let totalPaginas = 1;

// Evento botón toggle estado
btnToggleEstado.addEventListener("click", () => {
  mostrarActivos = !mostrarActivos;
  currentPage = 1;
  btnToggleEstado.textContent = mostrarActivos
    ? "Mostrar Usuarios Inactivos"
    : "Mostrar Usuarios Activos";
  cargarUsuarios();
});

// Mostrar modal para agregar nuevo usuario
btnAgregarUsuario.addEventListener("click", () => {
  tituloModal.textContent = "Agregar Usuario";
  idUsuario.value = "";
  formUsuario.reset();
  modalUsuario.style.display = "block";
});

// Cerrar modal
cerrarModal.addEventListener("click", () => {
  modalUsuario.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modalUsuario) {
    modalUsuario.style.display = "none";
  }
});

// Botones de paginación
btnAnterior.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    cargarUsuarios();
  }
});

btnSiguiente.addEventListener("click", () => {
  if (currentPage < totalPaginas) {
    currentPage++;
    cargarUsuarios();
  }
});

async function cargarUsuarios() {
  try {
    const estadoFiltro = mostrarActivos ? "Activo" : "Inactivo";

    const response = await fetch(
      `https://localhost:7012/api/Usuario/paginado?pageNumber=${currentPage}&pageSize=${pageSize}&estado=${estadoFiltro}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error("Error al obtener usuarios");

    const resultado = await response.json();
    tbody.innerHTML = "";

    resultado.items.forEach((u) => {
      let botonesHtml = `
        <button class="btn-accion editar"
                data-id="${u.iD_Usuario}"
                data-usuario="${u.usuarioName}"
                data-rol="${u.rol}"
                data-estado="${u.estado}"
                data-sexo="${u.sexo || ''}">
          <i class="fas fa-edit"></i> Actualizar
        </button>
      `;

      if (mostrarActivos) {
        botonesHtml += `
          <button class="btn-accion desactivar" data-id="${u.iD_Usuario}">
            <i class="fas fa-user-slash"></i> Desactivar
          </button>
        `;
      } else {
        botonesHtml += `
          <button class="btn-accion activar" data-id="${u.iD_Usuario}">
            <i class="fas fa-user-check"></i> Activar
          </button>
        `;
      }

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.usuarioName}</td>
        <td>${u.rol}</td>
        <td>${u.estado}</td>
        <td>${botonesHtml}</td>
      `;
      tbody.appendChild(tr);
    });

        totalPaginas = resultado.totalPages || 1;
    actualizarNumeroPagina();
    agregarEventosBotones();
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar los usuarios");
  }
}

formUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datosUsuario = {
    UsuarioName: document.getElementById("usuario").value,
    UsuarioClave: document.getElementById("clave").value,
    Rol: document.getElementById("rol").value,
    Estado: document.getElementById("estado").value,
    Sexo: document.getElementById("sexo").value,
  };

  const id = idUsuario.value;
  const url = id
    ? `https://localhost:7012/api/Usuario/${id}`
    : "https://localhost:7012/api/Usuario";
  const method = id ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datosUsuario),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    alert(id ? "Usuario actualizado" : "Usuario agregado");
    modalUsuario.style.display = "none";
    cargarUsuarios();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar usuario: " + error.message);
  }
});

function agregarEventosBotones() {
  const botonesEditar = document.querySelectorAll(".btn-accion.editar");
  const botonesDesactivar = document.querySelectorAll(".btn-accion.desactivar");
  const botonesActivar = document.querySelectorAll(".btn-accion.activar");

  botonesEditar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const usuario = btn.dataset.usuario;
      const rol = btn.dataset.rol;
      const estado = btn.dataset.estado;
      const sexo = btn.dataset.sexo || "";

      idUsuario.value = id;
      document.getElementById("usuario").value = usuario;
      document.getElementById("clave").value = "";
      document.getElementById("rol").value = rol;
      document.getElementById("estado").value = estado;
      document.getElementById("sexo").value = sexo;

      tituloModal.textContent = "Actualizar Usuario";
      modalUsuario.style.display = "block";
    });
  });

  botonesDesactivar.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Deseas desactivar este usuario?")) return;

      try {
        const response = await fetch(
          `https://localhost:7012/api/Usuario/${id}/desactivar`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Usuario desactivado correctamente");
        cargarUsuarios();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al desactivar usuario: " + error.message);
      }
    });
  });

  botonesActivar.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Deseas activar este usuario?")) return;

      try {
        const response = await fetch(
          `https://localhost:7012/api/Usuario/${id}/activar`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Usuario activado correctamente");
        cargarUsuarios();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al activar usuario: " + error.message);
      }
    });
  });
}

function actualizarNumeroPagina() {
  if (spanNumeroPagina) {
    spanNumeroPagina.textContent = `Página ${currentPage} de ${totalPaginas}`;
  }

  btnAnterior.disabled = currentPage <= 1;
  btnSiguiente.disabled = currentPage >= totalPaginas;
}

// Inicializar
cargarUsuarios();
