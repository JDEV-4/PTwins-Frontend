document.addEventListener("DOMContentLoaded", () => {
  const rol = localStorage.getItem("rol");
  const sexo = localStorage.getItem("sexo");
  const avatar = document.getElementById("user-avatar");
  const userRoleSpan = document.getElementById("user-role-text");
  const dropdown = document.getElementById("user-dropdown");
  const logout = document.getElementById("logout-btn");
  const menuToggle = document.querySelector(".menu-toggle");
  const mainMenu = document.querySelector(".main-menu");

  if (!avatar) {
    console.error("Elemento avatar no encontrado.");
    return;
  }
  if (!mainMenu) {
    console.error("No se encontró la clase '.main-menu'.");
  }

  const rutaBase = "/Assets/img/";
  const sexoLower = sexo ? sexo.toLowerCase() : null;

  if (sexoLower === "hombre" || sexoLower === "h") {
    avatar.src = `${rutaBase}Hombre.png`;
  } else if (sexoLower === "mujer" || sexoLower === "m") {
    avatar.src = `${rutaBase}Mujer.png`;
  } else {
    avatar.src = `${rutaBase}default-avatar.png`;
  }

  if (userRoleSpan && rol) {
    userRoleSpan.textContent = rol;
  }

  // Toggle dropdown usuario
  avatar.addEventListener("click", (e) => {
    e.stopPropagation(); // evitar que cierre inmediatamente al hacer clic
    dropdown.classList.toggle("hidden");
  });

  // Cerrar dropdown al hacer clic fuera
  document.addEventListener("click", () => {
    if (!dropdown.classList.contains("hidden")) {
      dropdown.classList.add("hidden");
    }
  });

  // Cerrar sesión
  if (logout) {
    logout.addEventListener("click", () => {
      if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        localStorage.clear();
        alert("Sesión cerrada.");
        window.location.href = "/Login/Login.html";
      }
    });
  } else {
    console.error("Botón de cerrar sesión no encontrado.");
  }
  
  // Toggle menú hamburguesa (responsive)
  if (menuToggle && mainMenu) {
    menuToggle.addEventListener("click", () => {
      mainMenu.classList.toggle("show");
    });
  }
});
