document.addEventListener("DOMContentLoaded", function () {
  cargarProductos();
});

function cargarProductos() {
  fetch("https://localhost:7012/api/Producto/listar")
    .then(response => response.json())
    .then(data => {
      const tbody = document.getElementById("product-table-body");
      tbody.innerHTML = "";

      data.forEach(producto => {
        let row = `
          <tr>
            <td>${producto.producto ?? "No disponible"}</td>
            <td>${producto.categoria ?? "No disponible"}</td>
            <td>${producto.existencia ?? 0}</td>
            <td>${producto.precioVenta ?? "No disponible"}</td>
            <td>${producto.estadoStock ?? "No disponible"}</td>
            <td>
              <button class="btn-editar" onclick="editarProducto()">Editar</button>
              <button class="btn-eliminar" onclick="eliminarProducto()">Eliminar</button>
              <i class="fas fa-eye toggle-icon" onclick="showProductDetails('${producto.producto.replace(/'/g, "\\'")}')"></i>
            </td>
          </tr>`;
        tbody.innerHTML += row;
      });
    })
    .catch(error => console.error("Error al cargar productos:", error));
}

function showProductDetails(productName) {
  fetch("https://localhost:7012/api/Producto/listar")
    .then(response => response.json())
    .then(data => {
      const producto = data.find(p => p.producto === productName);
      if (producto) {
        document.getElementById("modal-details").innerHTML = `
          <strong>Descripción:</strong> ${producto.descripcion}<br>
          <strong>Estado:</strong> ${producto.estadoProducto}<br>
          <strong>Categoría:</strong> ${producto.categoria}<br>
          <strong>Almacén:</strong> ${producto.almacen}<br>
          <strong>Ubicación:</strong> ${producto.ubicacion}<br>
          <strong>Precio Compra:</strong> ${producto.precioCompra}<br>
          <strong>Lote:</strong> ${producto.lote}<br>
          <strong>Fecha Entrada:</strong> ${producto.fechaEntrada}<br>
          <strong>Fecha Vencimiento:</strong> ${producto.fechaVencimiento}
        `;
        document.getElementById("product-modal").style.display = "flex";
      } else {
        console.error("Producto no encontrado.");
      }
    })
    .catch(error => console.error("Error al obtener detalles:", error));
}

function closeModal() {
  document.getElementById("product-modal").style.display = "none";
}

function showTab(tabId) {
  document.querySelectorAll('.tab-content').forEach(tab => {
    tab.classList.remove('active');
  });
  document.getElementById(tabId).classList.add('active');

  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.remove('active');
  });
  event.target.classList.add('active');
}
