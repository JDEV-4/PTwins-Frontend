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
    const response = await fetch("https://servidor/api/usuario", {
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
        <td>${u.id}</td>
        <td>${u.usuario}</td>
        <td>${u.rol}</td>
        <td>${u.estado}</td>
        <td>
          <button class="btn-editar" data-id="${u.id}">Editar</button>
          <button class="btn-eliminar" data-id="${u.id}">Eliminar</button>
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
    Usuario: document.getElementById("usuario").value,
    Clave: document.getElementById("clave").value,
    Rol: document.getElementById("rol").value,
    Estado: document.getElementById("estado").value,
  };

  try {
    const response = await fetch("https://servidor/api/usuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(datosUsuario),
    });

    if (!response.ok) {
      const errorData = await response.json();
      alert(`Error: ${errorData.message || response.statusText}`);
      return;
    }

    alert("Usuario agregado exitosamente");
    modalUsuario.style.display = "none";
    cargarUsuarios(); // Recargar la tabla
  } catch (error) {
    console.error("Error al guardar usuario:", error);
    alert("Hubo un error al guardar el usuario");
  }
});

// Inicializar la tabla al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  cargarUsuarios();
});
