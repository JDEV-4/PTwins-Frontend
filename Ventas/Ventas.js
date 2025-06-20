// Mostrar fecha actual en formato "día de mes de año" en español
document.addEventListener("DOMContentLoaded", () => {
  const fechaActual = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const fechaLabel = document.getElementById("fecha-label");
  if (fechaLabel) {
    fechaLabel.textContent = `Fecha: ${fechaActual}`;
  }

  const btnAgregar = document.getElementById("btnAgregar");
  btnAgregar.addEventListener("click", (e) => {
    e.preventDefault();
    agregarProducto();
  });
});

const detallesVenta = [];
let productoSeleccionadoId = null;

function agregarProducto() {
  const productoInput = document.getElementById("producto");
  const cantidadInput = document.getElementById("cantidad");
  const precioInput = document.getElementById("precio");

  const producto = productoInput.value.trim();
  const cantidad = parseInt(cantidadInput.value);
  const precio = parseFloat(precioInput.value);

  if (!producto) {
    alert("Ingrese el nombre del producto.");
    return;
  }
  if (productoSeleccionadoId === null) {
    alert("Seleccione un producto válido de la lista para continuar.");
    return;
  }
  if (!cantidad || cantidad <= 0) {
    alert("Ingrese una cantidad válida mayor a 0.");
    return;
  }
  if (!precio || precio <= 0) {
    alert("Ingrese un precio válido mayor a 0.");
    return;
  }

  detallesVenta.push({
    idProducto: productoSeleccionadoId,
    Producto: producto,
    Cantidad: cantidad,
    Precio: precio,
  });

  actualizarTabla();

  productoInput.value = "";
  cantidadInput.value = 1;
  precioInput.value = "";
  productoSeleccionadoId = null;

  productoInput.focus();
}

function actualizarTabla() {
  const tbody = document.querySelector("#tablaVenta tbody");
  tbody.innerHTML = "";

  let subtotal = 0;

  detallesVenta.forEach((item, index) => {
    const itemSubtotal = item.Cantidad * item.Precio;
    subtotal += itemSubtotal;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.Producto}</td>
      <td>${item.Cantidad}</td>
      <td>C$${item.Precio.toFixed(2)}</td>
      <td>C$${itemSubtotal.toFixed(2)}</td>
      <td><button onclick="eliminarProducto(${index})">Eliminar</button></td>
    `;

    tbody.appendChild(tr);
  });

  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  document.getElementById("subtotal").textContent = `C$ ${subtotal.toFixed(2)}`;
  document.getElementById("iva").textContent = `C$ ${iva.toFixed(2)}`;
  document.getElementById("total").textContent = `C$ ${total.toFixed(2)}`;
}

function eliminarProducto(index) {
  detallesVenta.splice(index, 1);
  actualizarTabla();
}

// Modal confirmación
const modal = document.getElementById("modalConfirmar");
const btnFactura = document.getElementById("btnFactura");
const btnSoloVenta = document.getElementById("btnSoloVenta");
const btnCerrar = document.getElementById("cerrarModal");
const btnRegistrarVenta = document.getElementById("btnRegistrarVenta");

btnRegistrarVenta.onclick = function (e) {
  e.preventDefault();
  modal.style.display = "block";
};

btnCerrar.onclick = function () {
  modal.style.display = "none";
};

window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

btnFactura.onclick = function () {
  modal.style.display = "none";
  registrarVenta(true);
};

btnSoloVenta.onclick = function () {
  modal.style.display = "none";
  registrarVenta(false);
};

async function registrarVenta(generarFactura = false) {
  const cliente = document.getElementById("cliente").value.trim();
  const usuario = localStorage.getItem("usuario");
  const area = "Área Demo";
  const mesa = "Mesa Demo";

  if (!usuario) {
    mostrarMensaje("Debe iniciar sesión para registrar la venta.");
    return;
  }

  if (!cliente) {
    mostrarMensaje("Ingrese el nombre del cliente.");
    return;
  }

  if (detallesVenta.length === 0) {
    mostrarMensaje("Agregue al menos un producto para registrar la venta.");
    return;
  }

  const venta = {
    usuario: usuario,
    cliente: cliente,
    area: area,
    mesa: mesa,
    detalles: detallesVenta,
    generarFactura: generarFactura,
  };

  const token = localStorage.getItem("token");

  try {
    const response = await fetch("https://localhost:7012/api/Ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: JSON.stringify(venta),
    });

    if (response.ok) {
      const data = await response.json();
      mostrarMensaje(
        data.mensaje ||
          (generarFactura
            ? "Factura generada y venta registrada."
            : "Venta registrada con éxito.")
      );
      limpiarFormulario();
    } else {
      const errorData = await response.json();
      mostrarMensaje(errorData.mensaje || "Error al registrar la venta.");
    }
  } catch (error) {
    mostrarMensaje("Error de red o del servidor: " + error.message);
  }
}

function mostrarMensaje(mensaje) {
  const modal = document.getElementById("modalMensaje");
  const texto = document.getElementById("textoMensaje");
  const cerrar = document.getElementById("cerrarMensaje");

  texto.textContent = mensaje;
  modal.style.display = "flex";

  cerrar.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
}

function limpiarFormulario() {
  document.getElementById("cliente").value = "";
  detallesVenta.length = 0;
  actualizarTabla();
  productoSeleccionadoId = null;
}

// Autocompletado cliente
const clienteInput = document.getElementById("cliente");
const listaClientes = document.getElementById("listaClientes");

clienteInput.addEventListener("input", async () => {
  const texto = clienteInput.value.trim();

  if (texto.length < 2) {
    listaClientes.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `https://localhost:7012/api/Ventas/BuscarClientes?filtro=${encodeURIComponent(
        texto
      )}`
    );

    if (!response.ok) throw new Error("Error al buscar clientes");

    const clientes = await response.json();

    if (clientes.length === 0) {
      listaClientes.innerHTML = "<p>No se encontraron clientes.</p>";
      return;
    }

    listaClientes.innerHTML = clientes
      .map((c) => `<div class="cliente-item">${c.nombreCompleto}</div>`)
      .join("");

    document.querySelectorAll(".cliente-item").forEach((item) => {
      item.addEventListener("click", () => {
        clienteInput.value = item.textContent;
        listaClientes.innerHTML = "";
      });
    });
  } catch (error) {
    listaClientes.innerHTML = "<p>Error al cargar clientes.</p>";
  }
});

document.addEventListener("click", (e) => {
  if (!clienteInput.contains(e.target) && !listaClientes.contains(e.target)) {
    listaClientes.innerHTML = "";
  }
});

// Autocompletado producto
const productoInput = document.getElementById("producto");
const listaProductos = document.getElementById("listaProductos");

productoInput.addEventListener("input", async () => {
  const texto = productoInput.value.trim();

  productoSeleccionadoId = null;

  if (texto.length < 2) {
    listaProductos.innerHTML = "";
    return;
  }

  try {
    const response = await fetch(
      `https://localhost:7012/api/Ventas/Buscar?nombre=${encodeURIComponent(texto)}`
    );

    if (!response.ok) throw new Error("Error al buscar productos");

    const productos = await response.json();

    if (productos.length === 0) {
      listaProductos.innerHTML = "<p>No se encontraron productos.</p>";
      return;
    }

    listaProductos.innerHTML = productos
      .map(
        (p) =>
          `<div class="producto-item" data-precio="${p.precioVenta}" data-nombre="${p.nombre}" data-id="${p.idProducto}">${p.nombre}</div>`
      )
      .join("");

    document.querySelectorAll(".producto-item").forEach((item) => {
      item.addEventListener("click", () => {
        productoInput.value = item.getAttribute("data-nombre");
        const precioInput = document.getElementById("precio");
        precioInput.value = item.getAttribute("data-precio") || "";
        productoSeleccionadoId = parseInt(item.getAttribute("data-id"));
        listaProductos.innerHTML = "";
      });
    });
  } catch (error) {
    listaProductos.innerHTML = "<p>Error al cargar productos.</p>";
  }
});

document.addEventListener("click", (e) => {
  if (!productoInput.contains(e.target) && !listaProductos.contains(e.target)) {
    listaProductos.innerHTML = "";
  }
});
