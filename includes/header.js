document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
});

function inicializarEventos() {
  const btnCerrarModulo = document.getElementById("btn-cerrar-modulo");

  if (btnCerrarModulo) {
    btnCerrarModulo.addEventListener("click", () => {
      // Prompt the user for confirmation
      if (confirm("¿Deseas cerrar este módulo y regresar al inicio?")) {
        // Just redirect to the home page; do not remove the header
        window.location.href = "/Home/Home.html"; // Adjust the path as per your project structure
      }
    });
  } else {
    console.warn("Botón de cerrar módulo no encontrado.");
  }
}

// You can remove the cerrarModuloYRedirigirHome function
// as its functionality is now directly within the event listener.