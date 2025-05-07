const btnAgregarUsuario = document.getElementById("btnAgregarUsuario");
const modalUsuario = document.getElementById("modalUsuario");
const cerrarModal = document.getElementById("cerrarModal");
const formUsuario = document.getElementById("formUsuario");
const tituloModal = document.getElementById("tituloModal");
const idUsuario = document.getElementById("idUsuario");
const tbody = document.querySelector(".usuario-tabla tbody");

const token = localStorage.getItem("token");

// Mostrar modal
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

// Cargar usuarios desde el backend
async function cargarUsuarios() {
  try {
    const response = await fetch("https://localhost:7012/api/Usuario", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener usuarios");

    const usuarios = await response.json();

    tbody.innerHTML = ""; // Limpia la tabla antes de cargar

    usuarios.forEach((u) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${u.usuario}</td>
        <td>${u.rol}</td>
        <td>${u.estado}</td>
        <td>
          <button class="btn-accion editar" data-id="${u.id}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-accion eliminar" data-id="${u.id}">
            <i class="fas fa-trash"></i> Eliminar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar los usuarios");
  }
}

// Guardar usuario
formUsuario.addEventListener("submit", async (e) => {
  e.preventDefault();

  const datosUsuario = {
    UsuarioName: document.getElementById("usuario").value,
    UsuarioClave: document.getElementById("clave").value,
    Rol: document.getElementById("rol").value,
    Estado: document.getElementById("estado").value,
  };
  

  try {
    const response = await fetch("https://localhost:7012/api/Usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datosUsuario),
    });

    const contentType = response.headers.get("content-type");
    const data = contentType && contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const mensajeError = typeof data === "string" ? data : data.message || response.statusText;
      alert(`Error: ${mensajeError}`);
      return;
    }

    alert(data.mensaje || "Usuario guardado exitosamente");
    modalUsuario.style.display = "none";
    cargarUsuarios();
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    alert("Hubo un error al guardar el usuario");
  }
});

// Inicializar la tabla al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
});
