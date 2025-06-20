const apiBaseUrl = "https://localhost:7012/api/Proveedor";
const tablaProveedores = document.getElementById("proveedor-table-body");
const modalProveedor = document.getElementById("modalProveedor");
const formularioProveedor = document.getElementById("formProveedor");
const pageNumber = document.getElementById("pageNumber");
const btnPrev = document.getElementById("prevPage");
const btnNext = document.getElementById("nextPage");

let currentPage = 1;
const tamanioPagina = 5;
let totalPaginas = 1;

// Cargar proveedores con paginación
async function cargarProveedores(pagina = 1) {
  try {
    const response = await fetch(`${apiBaseUrl}?pagina=${pagina}&tamanioPagina=${tamanioPagina}`);
    if (!response.ok) throw new Error("Error al cargar proveedores");

    const data = await response.json();
    totalPaginas = data.totalPaginas || 1;

    tablaProveedores.innerHTML = "";

    data.proveedores.forEach(proveedor => {
      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${proveedor.Ruc}</td>
        <td>${proveedor.Proveedor}</td>
        <td>${proveedor.Nombre}</td>
        <td>${proveedor.Apellido}</td>
        <td>${proveedor["Teléfono"]}</td>
        <td>${proveedor["Dirección"]}</td>
        <td>${proveedor.Email}</td>
        <td>
          <button class="btn-ver" onclick="abrirModalEditar(${proveedor.ID_Proveedor})" title="Editar proveedor">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-desactivar" onclick="eliminarProveedor(${proveedor.ID_Proveedor})" title="Eliminar proveedor">
            <i class="fas fa-trash-alt"></i>
          </button>
        </td>
      `;
      tablaProveedores.appendChild(fila);
    });

    currentPage = pagina;
    pageNumber.textContent = `Página ${currentPage} de ${totalPaginas}`;
    btnPrev.disabled = currentPage <= 1;
    btnNext.disabled = currentPage >= totalPaginas;

  } catch (error) {
    console.error("Error al cargar proveedores:", error);
    alert("No se pudieron cargar los proveedores.");
  }
}

function goToPage(page) {
  if (page < 1 || page > totalPaginas) return;
  cargarProveedores(page);
}

function abrirModalAgregar() {
  document.getElementById("modalTitulo").textContent = "Agregar Proveedor";
  formularioProveedor.reset();
  document.getElementById("idProveedor").value = "";
  modalProveedor.style.display = "flex";
}

async function abrirModalEditar(id) {
  document.getElementById("modalTitulo").textContent = "Editar Proveedor";
  try {
    const response = await fetch(`${apiBaseUrl}/${id}`);
    if (!response.ok) throw new Error("Error al obtener proveedor");

    const proveedor = await response.json();

    document.getElementById("idProveedor").value = proveedor.ID_Proveedor;
    document.getElementById("numRuc").value = proveedor.Ruc;
    document.getElementById("razonSocial").value = proveedor.Proveedor;
    document.getElementById("nombre").value = proveedor.Nombre;
    document.getElementById("apellido").value = proveedor.Apellido;
    document.getElementById("telefono").value = proveedor["Teléfono"];
    document.getElementById("direccion").value = proveedor["Dirección"];
    document.getElementById("correo").value = proveedor.Email;

    modalProveedor.style.display = "flex";

  } catch (error) {
    console.error("Error al cargar proveedor para edición:", error);
    alert("No se pudo cargar el proveedor para editar.");
  }
}


function cerrarModal() {
  modalProveedor.style.display = "none";
}

async function eliminarProveedor(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este proveedor?")) {
    try {
      const response = await fetch(`${apiBaseUrl}/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Error al eliminar proveedor");
      cargarProveedores(currentPage);
    } catch (error) {
      console.error("Error al eliminar proveedor:", error);
      alert("No se pudo eliminar el proveedor.");
    }
  }
}

formularioProveedor.addEventListener("submit", async (e) => {
  e.preventDefault();

  const proveedor = {
  ID_Proveedor: Number(document.getElementById("idProveedor").value) || 0,
  Ruc: document.getElementById("numRuc").value.trim(),
  Proveedor: document.getElementById("razonSocial").value.trim(),
  Nombre: document.getElementById("nombre").value.trim(),
  Apellido: document.getElementById("apellido").value.trim(),
  "Teléfono": document.getElementById("telefono").value.trim(),
  "Dirección": document.getElementById("direccion").value.trim(),
  Email: document.getElementById("correo").value.trim()
};




  const isUpdate = proveedor.ID_Proveedor && proveedor.ID_Proveedor > 0;
  const method = isUpdate ? "PUT" : "POST";
  const url = isUpdate ? `${apiBaseUrl}/actualizar` : apiBaseUrl;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proveedor),
    });

    if (!response.ok) throw new Error("Error al guardar proveedor");

    const resultado = await response.json();

    cerrarModal();
    cargarProveedores(currentPage);

    if (resultado.message || resultado.mensaje) {
      alert(resultado.message || resultado.mensaje);
    }

  } catch (error) {
    console.error("Error al guardar proveedor:", error);
    alert("Hubo un problema al guardar el proveedor.");
  }
});


window.onload = () => {
  cargarProveedores();
};

btnPrev.addEventListener("click", () => goToPage(currentPage - 1));
btnNext.addEventListener("click", () => goToPage(currentPage + 1));
