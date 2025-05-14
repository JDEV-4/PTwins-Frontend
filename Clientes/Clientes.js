const btnRegistrarCliente = document.getElementById("btnRegistrarCliente");
const modalClientes = document.getElementById("modalClientes");
const cerrarModal = document.getElementById("cerrarModal");
const formClientes = document.getElementById("formClientes");
const tituloModal = document.getElementById("tituloModal");
const tbody = document.querySelector(".clientes-tabla tbody");
const idCliente = document.getElementById("idCliente");

const token = localStorage.getItem("token");

// Mostrar modal para agregar
btnRegistrarCliente.addEventListener("click", () => {
  tituloModal.textContent = "Registrar Cliente";
  idCliente.value = "";
  formClientes.reset();
  modalClientes.style.display = "block";
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

// Cargar clientes
async function cargarClientes() {
  try {
    const response = await fetch("https://localhost:7012/api/Cliente", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error("Error al obtener clientes");

    const clientes = await response.json();
    tbody.innerHTML = "";

    // Solo mostrar los clientes según el límite seleccionado
    clientes.slice(0, obtenerLimite()).forEach((c) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${c.nombre}</td>
        <td>${c.apellido}</td>
        <td>${c.telefono}</td>
        <td>
          <button class="btn-accion editar" 
                  data-id="${c.idCliente}" 
                  data-nombre="${c.nombre}" 
                  data-apellido="${c.apellido}" 
                  data-telefono="${c.telefono}">
            <i class="fas fa-edit"></i> Editar
          </button>
          <button class="btn-accion eliminar" data-id="${c.idCliente}">
            <i class="fas fa-trash"></i> Eliminar
          </button>
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

// Guardar o actualizar cliente
formClientes.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cliente = {
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    telefono: document.getElementById("telefono").value,
  };

  const id = idCliente.value;
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

// Eventos para editar y eliminar
function agregarEventosBotones() {
  const botonesEditar = document.querySelectorAll(".btn-accion.editar");
  const botonesEliminar = document.querySelectorAll(".btn-accion.eliminar");

  botonesEditar.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const nombre = btn.dataset.nombre;
      const apellido = btn.dataset.apellido;
      const telefono = btn.dataset.telefono;

      idCliente.value = id;
      document.getElementById("nombre").value = nombre;
      document.getElementById("apellido").value = apellido;
      document.getElementById("telefono").value = telefono;

      tituloModal.textContent = "Editar Cliente";
      modalClientes.style.display = "block";
    });
  });

  botonesEliminar.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const id = btn.dataset.id;
      if (!confirm("¿Estás seguro de eliminar este cliente?")) return;

      try {
        const response = await fetch(`https://localhost:7012/api/Cliente/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText);
        }

        alert("Cliente eliminado correctamente");
        cargarClientes();
      } catch (error) {
        console.error("Error:", error);
        alert("Error al eliminar cliente: " + error.message);
      }
    });
  });
}

// Funcionalidad para limitar la cantidad de registros mostrados
document.getElementById("cantidadRegistros").addEventListener("change", cargarClientes);

function obtenerLimite() {
  const select = document.getElementById("cantidadRegistros");
  return select ? parseInt(select.value) : 5;
}

// Inicializar
cargarClientes();