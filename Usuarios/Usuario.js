const btnAgregarUsuario = document.getElementById("btnAgregarUsuario");
const modalUsuario = document.getElementById("modalUsuario");
const cerrarModal = document.getElementById("cerrarModal");
const formUsuario = document.getElementById("formUsuario");
const tituloModal = document.getElementById("tituloModal");
const idUsuario = document.getElementById("idUsuario");
const tbody = document.querySelector(".usuario-tabla tbody");

const token = localStorage.getItem("token");

// Mostrar modal para agregar
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

// Cargar usuarios
async function cargarUsuarios() {
  try {
    const response = await fetch("https://localhost:7012/api/Usuario", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener usuarios");

    const usuarios = await response.json();
    tbody.innerHTML = "";

    usuarios.forEach((u) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${u.usuario}</td>
        <td>${u.rol}</td>
        <td>${u.estado}</td>
        <td>
          <button class="btn-accion editar" data-id="${u.iD_Usuario}" 
                  data-usuario="${u.usuario}" data-rol="${u.rol}" data-estado="${u.estado}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-accion eliminar" data-id="${u.iD_Usuario}">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    agregarEventosBotones();
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar los usuarios");
  }
}

// Guardar o actualizar usuario
formUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datosUsuario = {
    UsuarioName: document.getElementById("usuario").value,
    UsuarioClave: document.getElementById("clave").value,
    Rol: document.getElementById("rol").value,
    Estado: document.getElementById("estado").value,
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

// Asignar eventos a los botones de editar y eliminar
function agregarEventosBotones() {
  const botonesEditar = document.querySelectorAll(".btn-accion.editar");
  const botonesEliminar = document.querySelectorAll(".btn-accion.eliminar");

  botonesEditar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const usuario = btn.dataset.usuario;
      const rol = btn.dataset.rol;
      const estado = btn.dataset.estado;

      idUsuario.value = id;
      document.getElementById("usuario").value = usuario;
      document.getElementById("clave").value = ""; // No se puede recuperar
      document.getElementById("rol").value = rol;
      document.getElementById("estado").value = estado;

      tituloModal.textContent = "Editar Usuario";
      modalUsuario.style.display = "block";
    });
  });

  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Estás seguro de eliminar este usuario?")) return;

      try {
        const response = await fetch(`https://localhost:7012/api/Usuario/${id}`, {

          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Usuario eliminado correctamente");
        cargarUsuarios();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar usuario: " + error.message);
      }
    });
  });
}

// Inicializar
cargarUsuarios();
