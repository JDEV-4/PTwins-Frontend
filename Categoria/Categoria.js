const apiUrl = "https://localhost:7012/api/Categoria";
const pageSize = 7;
let currentPage = 1;
let categorias = [];
let mostrandoInactivos = false;

async function cargarCategorias() {
  try {
    const response = await fetch(apiUrl, {
      headers: { accept: "application/json" },
    });

    if (!response.ok) throw new Error("Error al obtener categorías");

    const data = await response.json();

    categorias = (data.items || data).filter((cat) => {
      const estado = cat.estado?.toString().toLowerCase();
      return mostrandoInactivos
        ? estado !== "activo" && estado !== "true"
        : estado === "activo" || estado === "true";
    });

    mostrarPagina(currentPage);
  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar las categorías");
  }
}

function abrirModalAgregar() {
  document.getElementById("modalAgregarCategoria").style.display = "block";
}

function cerrarModalAgregar() {
  document.getElementById("modalAgregarCategoria").style.display = "none";
}

const formAgregar = document.getElementById("formAgregarCategoria");
if (formAgregar) {
  formAgregar.addEventListener("submit", async function (e) {
    e.preventDefault();

    const nombre = document.getElementById("nombreCategoria").value.trim();
    const descripcion = document.getElementById("descripcionCategoria").value.trim();
    const estado = document.getElementById("estadoCategoria").value === "true";

    if (!nombre) {
      alert("El nombre de la categoría es obligatorio.");
      return;
    }

    const nuevaCategoria = {
      nombre,
      descripcion,
      estado: estado ? "Activo" : "Inactivo",
    };

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaCategoria),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || "Error al insertar");
      }

      alert("Categoría agregada correctamente.");
      cerrarModalAgregar();
      cargarCategorias();
      this.reset();
    } catch (error) {
      console.error("Error al agregar categoría:", error);
      alert(error.message || "Ocurrió un error.");
    }
  });
}

const formActualizar = document.getElementById("formActualizarCategoria");
if (formActualizar) {
  formActualizar.addEventListener("submit", async function (e) {
    e.preventDefault();

    const id = document.getElementById("categoriaIdActualizar").value.trim();
    const nombre = document.getElementById("nombreCategoriaActualizar").value.trim();
    const descripcion = document.getElementById("descripcionCategoriaActualizar").value.trim();

    if (!id) {
      alert("El ID de la categoría no está definido.");
      console.warn("ID inválido:", id);
      return;
    }

    if (!nombre) {
      alert("El nombre es obligatorio.");
      return;
    }

    const categoriaActualizada = {
      nombre,
      descripcion,
      estado: "Activo", // Se puede ajustar según tu lógica
    };

    try {
      console.log("Enviando PUT con ID:", id);
      const response = await fetch(`${apiUrl}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(categoriaActualizada),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.mensaje || "Error al actualizar la categoría");
      }

      alert("Categoría actualizada correctamente.");
      cerrarModalActualizar();
      cargarCategorias();
    } catch (error) {
      console.error("Error al actualizar categoría:", error);
      alert(error.message || "Ocurrió un error.");
    }
  });
}

function mostrarPagina(page) {
  const tbody = document.getElementById("categoria-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const totalPages = Math.ceil(categorias.length / pageSize);
  currentPage = Math.max(1, Math.min(page, totalPages || 1));

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const categoriasPage = categorias.slice(start, end);

  categoriasPage.forEach((cat) => {
    const id = cat.idCategoria ?? cat.iD_Categoria ?? cat.id ?? "";
    const nombre = cat.nombre || "";
    const descripcion = cat.descripcion || "";
    const estado = cat.estado;
    const estadoTexto = estado?.toString().toLowerCase() === "activo" || estado === true
      ? "Activo"
      : "Inactivo";

    const tr = document.createElement("tr");

    const accionesTd = document.createElement("td");

    const actualizarBtn = document.createElement("button");
    actualizarBtn.className = "btn-accion actualizar";
    actualizarBtn.innerHTML = `<i class="fas fa-edit"></i> Actualizar`;
    actualizarBtn.addEventListener("click", () => {
      console.log("Abrir modal actualizar con ID:", id);
      editarCategoria(id, nombre, descripcion, estado);
    });
    accionesTd.appendChild(actualizarBtn);

    const estadoBtn = document.createElement("button");
    estadoBtn.className = `btn-accion ${estadoTexto === "Activo" ? "desactivar" : "activar"}`;
    estadoBtn.innerHTML =
      estadoTexto === "Activo"
        ? `<i class="fas fa-ban"></i> Desactivar`
        : `<i class="fas fa-check-circle"></i> Activar`;
    estadoBtn.addEventListener("click", () => {
      cambiarEstadoCategoria(id, estadoTexto !== "Activo");
    });
    accionesTd.appendChild(estadoBtn);

    tr.innerHTML = `
      <td>${nombre}</td>
      <td>${descripcion}</td>
      <td>${estadoTexto}</td>
    `;
    tr.appendChild(accionesTd);
    tbody.appendChild(tr);
  });

  document.getElementById("pageNumber").textContent = `Página ${currentPage} de ${totalPages || 1}`;
  document.getElementById("prevPage").disabled = currentPage === 1 || totalPages === 0;
  document.getElementById("nextPage").disabled = currentPage === totalPages || totalPages === 0;
}

function goToPage(page) {
  mostrarPagina(page);
}

function cambiarEstadoCategoria(id, activar) {
  const accion = activar ? "activar" : "desactivar";
  const mensaje = activar ? "activar" : "desactivar";

  if (confirm(`¿Deseas ${mensaje} esta categoría?`)) {
    fetch(`${apiUrl}/${accion}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error al ${mensaje}`);
        return res.json();
      })
      .then(() => {
        alert(`Categoría ${activar ? "activada" : "desactivada"} correctamente`);
        cargarCategorias();
      })
      .catch((err) => {
        console.error(err);
        alert(`No se pudo ${mensaje} la categoría`);
      });
  }
}

function editarCategoria(id, nombre, descripcion, estado) {
  console.log("Rellenando modal con ID:", id);

  document.getElementById("categoriaIdActualizar").value = id || "";
  document.getElementById("nombreCategoriaActualizar").value = nombre || "";
  document.getElementById("descripcionCategoriaActualizar").value = descripcion || "";

  const modal = document.getElementById("modalActualizarCategoria");
  if (modal) modal.style.display = "block";
}

function cerrarModalActualizar() {
  const modal = document.getElementById("modalActualizarCategoria");
  if (modal) modal.style.display = "none";
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCategorias();

  const btnMostrarInactivos = document.getElementById("btnMostrarInactivos");
  if (btnMostrarInactivos) {
    btnMostrarInactivos.addEventListener("click", () => {
      mostrandoInactivos = !mostrandoInactivos;
      btnMostrarInactivos.textContent = mostrandoInactivos
        ? "Mostrar Activos"
        : "Mostrar Inactivos";
      currentPage = 1;
      cargarCategorias();
    });
  }

  document.getElementById("prevPage").addEventListener("click", () => {
    if (currentPage > 1) goToPage(currentPage - 1);
  });

  document.getElementById("nextPage").addEventListener("click", () => {
    const totalPages = Math.ceil(categorias.length / pageSize);
    if (currentPage < totalPages) goToPage(currentPage + 1);
  });
});
