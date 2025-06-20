// Variables globales para paginación y estado
let currentPage = 1;
const pageSize = 5;
let totalPages = 1;
let mostrandoInactivos = false;
let productosCargados = [];

/** ------------------------------
 * Inicialización al cargar DOM
 * ------------------------------ */
document.addEventListener("DOMContentLoaded", () => {
  // Cargar productos activos inicialmente y categorías
  cargarProductos(currentPage, false);
  cargarCategorias();

  // Eventos botones y formularios
  document.getElementById("showInactiveProducts").addEventListener("click", toggleProductosInactivos);

  document.getElementById("cerrar-modal-actualizar").addEventListener("click", cerrarModalActualizar);
  document.getElementById("formActualizarProducto").addEventListener("submit", e => {
    e.preventDefault();
    actualizarProducto();
  });

  document.getElementById("formAgregarProducto").addEventListener("submit", e => {
    e.preventDefault();
    agregarProducto();
  });

  document.getElementById("prevPage").addEventListener("click", () => goToPage(currentPage - 1));
  document.getElementById("nextPage").addEventListener("click", () => goToPage(currentPage + 1));

  // Evento para agregar categoría (se repite dentro de cargar categorías, mejor así para mantener separados)
  const formAgregarCategoria = document.getElementById("formAgregarCategoria");
  if (formAgregarCategoria) {
    formAgregarCategoria.addEventListener("submit", e => {
      e.preventDefault();
      agregarCategoria();
    });
  }
});

/** ------------------------------
 * FUNCIONES PRINCIPALES
 * ------------------------------ */

/**
 * Carga los productos desde el API con paginación y estado
 * @param {number} pageNumber 
 * @param {boolean} inactivos 
 */
function cargarProductos(pageNumber, inactivos = false) {
  mostrandoInactivos = inactivos;
  const estado = inactivos ? "Inactivo" : "Activo";

  fetch(`https://localhost:7012/api/Producto/listar?pageNumber=${pageNumber}&pageSize=${pageSize}&estadoProducto=${estado}`)
    .then(res => res.json())
    .then(data => {
      productosCargados = data.items;
      totalPages = Math.ceil(data.totalCount / pageSize);
      currentPage = pageNumber;

      actualizarTabla();
      actualizarPaginacion();
      actualizarBotonMostrarInactivos();
    })
    .catch(error => {
      console.error("Error al cargar productos:", error);
      alert("Error al cargar productos. Revisa la consola.");
    });
}

/**
 * Actualiza la tabla HTML con los productos cargados
 */
function actualizarTabla() {
  const tbody = document.getElementById("product-table-body");
  tbody.innerHTML = "";

  productosCargados.forEach((producto, index) => {
    const tr = document.createElement("tr");

    const botonEstado = mostrandoInactivos
      ? `<button class="btn-activar" onclick="cambiarEstadoProducto(${producto.idProducto}, 'Activo')">Activar</button>`
      : `<button class="btn-desactivar" onclick="cambiarEstadoProducto(${producto.idProducto}, 'Inactivo')">Desactivar</button>`;

    const botonActualizar = `<button class="btn-actualizar" onclick="abrirModalActualizar(${index})" title="Actualizar producto"><i class="fa fa-edit"></i></button>`;

    tr.innerHTML = `
      <td>${producto.producto ?? "No disponible"}</td>
      <td>${producto.categoria ?? "No disponible"}</td>
      <td>${producto.existencia ?? 0}</td>
      <td>${producto.precioVenta != null ? producto.precioVenta.toFixed(2) : "No disponible"}</td>
      <td>${producto.estadoStock ?? "No disponible"}</td>
      <td>
        ${botonEstado}
        <button class="btn-ver" onclick="mostrarDetallesProducto(${index})" title="Ver detalles"><i class="fa fa-eye"></i></button>
        ${botonActualizar}
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Actualiza el texto y estado de los botones de paginación
 */
function actualizarPaginacion() {
  const paginaTexto = totalPages && totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : `Página ${currentPage}`;
  document.getElementById("pageNumber").textContent = paginaTexto;

  document.getElementById("prevPage").disabled = currentPage <= 1;
  document.getElementById("nextPage").disabled = currentPage >= totalPages || productosCargados.length === 0;
}

/**
 * Actualiza el texto del botón para mostrar activos o inactivos
 */
function actualizarBotonMostrarInactivos() {
  const btn = document.getElementById("showInactiveProducts");
  btn.textContent = mostrandoInactivos ? "Mostrar Activos" : "Mostrar Inactivos";
}

/**
 * Navega a una página de productos
 * @param {number} page 
 */
function goToPage(page) {
  if (page < 1 || page > totalPages) return;
  cargarProductos(page, mostrandoInactivos);
}

/**
 * Alterna la vista entre productos activos e inactivos
 */
function toggleProductosInactivos() {
  cargarProductos(1, !mostrandoInactivos);
}

/** ------------------------------
 * MODALES Y DETALLES
 * ------------------------------ */

/**
 * Muestra detalles extendidos de un producto en modal
 * @param {number} index 
 */
function mostrarDetallesProducto(index) {
  const producto = productosCargados[index];
  if (!producto) return;

  const contenido = `
    <p><strong>Almacén:</strong> ${producto.almacen ?? "No disponible"}</p>
    <p><strong>Ubicación:</strong> ${producto.ubicacion ?? "No disponible"}</p>
    <p><strong>Precio Compra:</strong> ${producto.precioCompra != null ? producto.precioCompra.toFixed(2) : "No disponible"}</p>
    <p><strong>Lote:</strong> ${producto.lote ?? "No disponible"}</p>
    <p><strong>Fecha Entrada:</strong> ${producto.fechaEntrada ?? "No disponible"}</p>
    <p><strong>Fecha Vencimiento:</strong> ${producto.fechaVencimiento ?? "No disponible"}</p>
  `;

  document.getElementById("detalle-producto-contenido").innerHTML = contenido;
  document.getElementById("detalle-producto-modal").style.display = "flex";
}

function cerrarModalProducto() {
  document.getElementById("detalle-producto-modal").style.display = "none";
}

function abrirModalAgregar() {
  document.getElementById("agregar-producto-modal").style.display = "flex";
}

function cerrarModalAgregar() {
  document.getElementById("agregar-producto-modal").style.display = "none";
}

function abrirModalActualizar(index) {
  const producto = productosCargados[index];
  if (!producto) return;

  document.getElementById("idActualizar").value = producto.idProducto;
  document.getElementById("nombreActualizar").value = producto.producto ?? "";
  document.getElementById("categoriaActualizar").value = producto.categoria ?? "";
  document.getElementById("descripcionActualizar").value = producto.descripcion ?? "";

  document.getElementById("actualizar-producto-modal").style.display = "flex";
}

function cerrarModalActualizar() {
  document.getElementById("actualizar-producto-modal").style.display = "none";
}

/** ------------------------------
 * ACCIONES CRUD
 * ------------------------------ */

/**
 * Cambia el estado activo/inactivo de un producto
 * @param {number} idProducto 
 * @param {string} nuevoEstado 
 */
function cambiarEstadoProducto(idProducto, nuevoEstado) {
  fetch(`https://localhost:7012/api/Producto/cambiarEstado/${idProducto}?nuevoEstado=${nuevoEstado}`, {
    method: 'PUT',
    headers: { 'Accept': '*/*' }
  })
    .then(response => {
      if (!response.ok) throw new Error('Error al cambiar el estado del producto');
      return response.text();
    })
    .then(() => {
      alert('Estado actualizado correctamente');
      cargarProductos(currentPage, mostrandoInactivos);
    })
    .catch(error => {
      console.error("Error al cambiar el estado:", error);
      alert("No se pudo cambiar el estado del producto.");
    });
}

/**
 * Agrega un nuevo producto
 */
function agregarProducto() {
  const producto = {
    nombre: document.getElementById("nombre").value,
    categoria: document.getElementById("nombreCategoria").value,
    descripcion: document.getElementById("descripcion").value,
    estado: "Activo"
  };

  fetch("https://localhost:7012/api/Producto/insertar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  })
    .then(res => {
      if (res.ok) {
        alert("Producto agregado correctamente.");
        cerrarModalAgregar();
        cargarProductos(1, mostrandoInactivos);
      } else {
        alert("Error al agregar producto.");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      alert("Error al agregar producto.");
    });
}

function cargarCategorias() {
  fetch("https://localhost:7012/api/Categoria", {
    headers: { accept: "application/json" }
  })
    .then(res => {
      if (!res.ok) throw new Error("Error al cargar categorías");
      return res.json();
    })
    .then(data => {
      const categoriasActivas = data.filter(cat => cat.estado === "Activo");
      const selectAgregar = document.getElementById("nombreCategoria");
      const selectActualizar = document.getElementById("categoriaActualizar");

      // Limpiar opciones previas
      selectAgregar.innerHTML = "<option value=''>Seleccione una categoría</option>";
      selectActualizar.innerHTML = "<option value=''>Seleccione una categoría</option>";

      categoriasActivas.forEach(categoria => {
        const option1 = document.createElement("option");
        option1.value = categoria.nombre;
        option1.textContent = categoria.nombre;
        selectAgregar.appendChild(option1);

        const option2 = document.createElement("option");
        option2.value = categoria.nombre;
        option2.textContent = categoria.nombre;
        selectActualizar.appendChild(option2);
      });
    })
    .catch(err => {
      console.error("Error cargando categorías:", err);
      alert("No se pudieron cargar las categorías.");
    });
}


/**
 * Actualiza un producto existente
 */
function actualizarProducto() {
  const idProducto = document.getElementById("idActualizar").value;
  const productoActualizado = {
    idProducto: parseInt(idProducto),
    nombre: document.getElementById("nombreActualizar").value,
    categoria: document.getElementById("categoriaActualizar").value,
    descripcion: document.getElementById("descripcionActualizar").value,
    estado: mostrandoInactivos ? "Inactivo" : "Activo"
  };

  fetch(`https://localhost:7012/api/Producto/actualizar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productoActualizado),
  })
    .then(res => {
      if (res.ok) {
        alert("Producto actualizado correctamente.");
        cerrarModalActualizar();
        cargarProductos(currentPage, mostrandoInactivos);
      } else {
        alert("Error al actualizar producto.");
      }
    })
    .catch(error => {
      console.error("Error al actualizar producto:", error);
      alert("No se pudo actualizar el producto.");
    });
}




function cerrarModalGestionCategorias() {
  const modal = document.getElementById("modal-gestion-categorias");
  if (!modal) return;
  modal.style.display = "none";
}
