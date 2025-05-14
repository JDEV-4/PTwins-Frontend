document.addEventListener("DOMContentLoaded", async () => {
  const userRoleSpan = document.getElementById("user-role");
  const rol = localStorage.getItem("rol");
  const tokenValido = await verificarToken();

  if (!rol || !tokenValido) {
    localStorage.clear();
    window.location.href = "/Login/Login.html";
    return;
  }

  // Actualiza el rol del usuario en el header
  userRoleSpan.textContent = rol;
});

async function verificarToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const response = await fetch("https://localhost:7012/api/Auth/validar", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.ok;
  } catch (error) {
    console.error("Error al validar token:", error);
    return false;
  }
}

function salirDelModulo() {
  window.location.href = "/Home/Home.html";
}
