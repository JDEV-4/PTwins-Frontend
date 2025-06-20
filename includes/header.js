document.addEventListener("DOMContentLoaded", () => {
  inicializarEventos();
  establecerAvatar();
});

function inicializarEventos() {
  const btnCerrarModulo = document.getElementById("btn-cerrar-modulo");

  if (btnCerrarModulo) {
    btnCerrarModulo.addEventListener("click", () => {
      if (confirm("¿Deseas cerrar este módulo y regresar al inicio?")) {
        window.location.href = "/Home/Home.html";
      }
    });
  } else {
    console.warn("Botón de cerrar módulo no encontrado.");
  }
}

function establecerAvatar() {
  let avatar = document.getElementById("user-avatar");

  if (!avatar) {
    console.warn("Esperando a que el avatar esté disponible...");
    const checkInterval = setInterval(() => {
      avatar = document.getElementById("user-avatar");
      if (avatar) {
        clearInterval(checkInterval);
        asignarAvatar(avatar);
      }
    }, 100); 
    return;
  }

  asignarAvatar(avatar);
}

function asignarAvatar(avatar) {
  const userRoleSpan = document.getElementById("user-role-text");
  const rutaBase = "/Assets/img/";
  const sexo = localStorage.getItem("sexo") || "default";

  const sexoLower = sexo.toLowerCase();
  avatar.src =
    sexoLower === "hombre" || sexoLower === "h"
      ? `${rutaBase}Hombre.png`
      : sexoLower === "mujer" || sexoLower === "m"
      ? `${rutaBase}Mujer.png`
      : `${rutaBase}default-avatar.png`;

  if (userRoleSpan) {
    userRoleSpan.textContent = localStorage.getItem("rol") || "Sin rol";
  }

  console.log(`Avatar asignado correctamente: ${avatar.src}`);
}
