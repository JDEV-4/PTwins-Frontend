let currentPage = 1;
const pageSize = 10;
let totalPages = 1;
let mostrandoInactivos = false;
let productosCargados = [];

document.addEventListener("DOMContentLoaded", () => {
  cargarProductos(currentPage, false);

  document
    .getElementById("showInactiveProducts")
    .addEventListener("click", toggleProductosInactivos);
});

function cargarProductos(pageNumber, inactivos = false) {
  mostrandoInactivos = inactivos;
  const estado = inactivos ? "Inactivo" : "Activo";

  fetch(`https://localhost:7012/api/Producto/listar?pageNumber=${pageNumber}&pageSize=${pageSize}&estadoProducto=${estado}`)
    .then((res) => res.json())
    .then((data) => {
      productosCargados = data.items;
      totalPages = Math.ceil(data.totalCount / pageSize);
      currentPage = pageNumber;

      actualizarTabla();
      actualizarPaginacion();
      actualizarBotonMostrarInactivos();
    })
    .catch((error) => {
      console.error("Error al cargar productos:", error);
      alert("Error al cargar productos. Revisa la consola.");
    });
}

function actualizarTabla() {
  const tbody = document.getElementById("product-table-body");
  tbody.innerHTML = "";

  productosCargados.forEach((producto, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${producto.producto ?? "No disponible"}</td>
      <td>${producto.categoria ?? "No disponible"}</td>
      <td>${producto.existencia ?? 0}</td>
      <td>${producto.precioVenta != null ? producto.precioVenta.toFixed(2) : "No disponible"}</td>
      <td>${producto.estadoStock ?? "No disponible"}</td>
      <td>
        <button class="btn-Desactivar" onclick="DesactivarProducto(${index})">Desactivar</button>
        <button class="btn-ver" onclick="mostrarDetallesProducto(${index})" title="Ver detalles"><i class="fa fa-eye"></i></button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

function actualizarPaginacion() {
  const paginaTexto = totalPages && totalPages > 0 ? `Página ${currentPage} de ${totalPages}` : `Página ${currentPage}`;
  document.getElementById("pageNumber").textContent = paginaTexto;

  document.getElementById("prevPage").disabled = currentPage <= 1;
  document.getElementById("nextPage").disabled = currentPage >= totalPages || productosCargados.length === 0;
}

function abrirModalAgregar() {
  const modal = document.getElementById("agregar-producto-modal");
  modal.style.display = "flex";
}

function cerrarModalAgregar() {
  const modal = document.getElementById("agregar-producto-modal");
  modal.style.display = "none";
}



function actualizarBotonMostrarInactivos() {
  const btn = document.getElementById("showInactiveProducts");
  btn.textContent = mostrandoInactivos ? "Activos" : "Inactivos";
}

function goToPage(page) {
  if (page < 1 || page > totalPages) return; // Evita ir fuera de los límites

  fetch(`https://localhost:7012/api/Producto/listar?pageNumber=${page}&pageSize=${pageSize}&estadoProducto=${mostrandoInactivos ? "Inactivo" : "Activo"}`)
    .then((res) => res.json())
    .then((data) => {
      if (data.items.length > 0) { // Solo permite avanzar si hay productos
        productosCargados = data.items;
        currentPage = page;
        actualizarTabla();
        actualizarPaginacion();
      }
    })
    .catch((error) => console.error("Error al cargar productos:", error));
}


function toggleProductosInactivos() {
  cargarProductos(1, !mostrandoInactivos);
}

function mostrarDetallesProducto(index) {
  const producto = productosCargados[index];
  console.log(producto);

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


window.onclick = function (event) {
  const modal = document.getElementById("detalle-producto-modal");
  if (event.target === modal) {
    cerrarModalProducto();
  }
};

document.getElementById("formAgregarProducto").addEventListener("submit", function (e) {
  e.preventDefault();

  const producto = {
    nombre: document.getElementById("nombre").value,
    categoria: document.getElementById("nombreCategoria").value,
    descripcion: document.getElementById("descripcion").value,
    estado: document.getElementById("estado").value,
  };

  fetch("https://localhost:7012/api/Producto/agregar", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(producto),
  })
    .then((res) => {
      if (res.ok) {
        alert("Producto agregado correctamente.");
        cerrarModalAgregar();
        cargarProductos(1, mostrandoInactivos); // Recargar lista de productos
      } else {
        alert("Error al agregar producto.");
      }
    })
    .catch((error) => console.error("Error:", error));
});

