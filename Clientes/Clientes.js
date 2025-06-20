const btnRegistrarCliente = document.getElementById("btnRegistrarCliente");
const modalClientes = document.getElementById("modalClientes");
const cerrarModal = document.getElementById("cerrarModal");
const formClientes = document.getElementById("formClientes");
const tituloModal = document.getElementById("tituloModal");
const tbody = document.getElementById("product-table-body");
const idCliente = document.getElementById("idCliente");

const token = localStorage.getItem("token");

let mostrarInactivos = false;
let currentPage = 1;

// Mostrar modal para agregar
btnRegistrarCliente.addEventListener("click", () => {
  tituloModal.textContent = "Registrar Cliente";
  idCliente.value = "";
  formClientes.reset();
  modalClientes.style.display = "block";
});

// Toggle para mostrar activos/inactivos
document.getElementById("btnToggleEstado").addEventListener("click", () => {
  mostrarInactivos = !mostrarInactivos;
  document.getElementById("btnToggleEstado").textContent = mostrarInactivos
    ? "Mostrar Clientes Activos"
    : "Mostrar Clientes Inactivos";
  currentPage = 1;
  cargarClientes();
});

// Cerrar modal
cerrarModal.addEventListener("click", () => {
  modalClientes.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === modalClientes) {
    modalClientes.style.display = "none";
  }
});

async function cargarClientes() {
  try {
    const pageSize = 6;
    const estado = mostrarInactivos ? false : true;

    const response = await fetch(`https://localhost:7012/api/Cliente?pageNumber=${currentPage}&pageSize=${pageSize}&estado=${estado}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener clientes");

    const clientesData = await response.json();
    const clientes = clientesData.items || clientesData;

    tbody.innerHTML = "";

    clientes.forEach((c) => {
      const id = c.idCliente || c.iD_Cliente || c.id;
      const estadoTexto = c.estado === true || c.estado === "Activo" || c.estado === "activo" ? "Activo" : "Inactivo";

      const botonEstado = estadoTexto === "Activo"
        ? `<button class="btn-accion desactivar" data-id="${id}"><i class="fas fa-user-slash"></i> Desactivar</button>`
        : `<button class="btn-accion activar" data-id="${id}"><i class="fas fa-user-check"></i> Activar</button>`;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.apellido}</td>
        <td>${c.telefono}</td>
        <td>
          <button class="btn-accion actualizar" 
                  data-id="${id}" 
                  data-nombre="${c.nombre}" 
                  data-apellido="${c.apellido}" 
                  data-telefono="${c.telefono}">
            <i class="fas fa-edit"></i> Actualizar
          </button>
          ${botonEstado}
        </td>
      `;
      tbody.appendChild(tr);
    });

    agregarEventosBotones();

  } catch (error) {
    console.error("Error:", error);
    alert("No se pudieron cargar los clientes");
  }
}

function agregarEventosBotones() {
  const botonesActualizar = document.querySelectorAll(".btn-accion.actualizar");
  const botonesActivar = document.querySelectorAll(".btn-accion.activar");
  const botonesDesactivar = document.querySelectorAll(".btn-accion.desactivar");

  botonesActualizar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const apellido = btn.dataset.apellido;
      const telefono = btn.dataset.telefono;

      idCliente.value = id;
      document.getElementById("nombre").value = nombre;
      document.getElementById("apellido").value = apellido;
      document.getElementById("telefono").value = telefono;

      tituloModal.textContent = "Actualizar Cliente";
      modalClientes.style.display = "block";
    });
  });

  botonesActivar.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Estás seguro de activar este cliente?")) return;

      try {
        const response = await fetch(`https://localhost:7012/api/Cliente/activar/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(await response.text());
        alert("Cliente activado correctamente");
        cargarClientes();
      } catch (error) {
        alert("Error al activar cliente: " + error.message);
      }
    });
  });

  botonesDesactivar.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Estás seguro de desactivar este cliente?")) return;

      try {
        const response = await fetch(`https://localhost:7012/api/Cliente/desactivar/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error(await response.text());
        alert("Cliente desactivado correctamente");
        cargarClientes();
      } catch (error) {
        alert("Error al desactivar cliente: " + error.message);
      }
    });
  });
}
formClientes.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = idCliente.value;

  const nombre = document.getElementById("nombre").value.trim();
  const apellido = document.getElementById("apellido").value.trim();
  const telefono = document.getElementById("telefono").value.trim();

  // Validar teléfono: solo 8 dígitos numéricos sin espacios
const regexTelefono = /^\d{8}$/;

if (!regexTelefono.test(telefono)) {
  alert("El teléfono solo debe contener 8 dígitos numéricos sin espacios ni otros caracteres.");
  return;
}

const telefonoSinEspacios = telefono.replace(/\s+/g, "");


  const cliente = id
    ? {
        iD_Cliente: parseInt(id),
        nombre,
        apellido,
        telefono,
        estado: mostrarInactivos ? "Inactivo" : "Activo"
      }
    : {
        nombre,
        apellido,
        telefono,
      };

  const url = id
    ? `https://localhost:7012/api/Cliente/${id}`
    : "https://localhost:7012/api/Cliente";
  const method = id ? "PUT" : "POST";

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(cliente),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    alert(id ? "Cliente actualizado" : "Cliente agregado");
    modalClientes.style.display = "none";
    cargarClientes();
  } catch (error) {
    console.error("Error:", error);
    alert("Error al guardar cliente: " + error.message);
  }
});


// Función para paginación
function goToPage(page) {
  if(page < 1) return;
  currentPage = page;
  cargarClientes();
}

// Inicializar carga
cargarClientes();
