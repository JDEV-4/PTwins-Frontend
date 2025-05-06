document.addEventListener("DOMContentLoaded", async () => {
  const rol = localStorage.getItem("rol");
  const userRoleSpan = document.getElementById("user-role");

  const tokenValido = await verificarToken();

  if (!rol || !tokenValido) {
    localStorage.clear();
    window.location.href = "/Login/Login.html";
    return;
  }

  userRoleSpan.textContent = rol;
/*
  const logout = document.querySelector(".logout-btn");
  logout.addEventListener("click", () => {
    const confirmLogout = confirm("¿Estás seguro de que deseas cerrar sesión?");
    if (confirmLogout) {
      localStorage.clear();
      alert("Sesión cerrada.");
      window.location.href = "/Login/Login.html";
    }
  });
});*/

async function verificarToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch("https://tu-api.com/api/Auth/ValidarToken", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });
    return response.ok;
  } catch (error) {
    console.error("Error al validar token:", error);
    return false;
  }
}

function toggleMenu() {
  document.querySelector(".main-menu").classList.toggle("show");
}
