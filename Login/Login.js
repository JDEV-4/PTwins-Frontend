document.getElementById('loginForm').addEventListener('submit', async function(e) {
  e.preventDefault();

  const usuario = document.getElementById('usuario').value.trim();
  const clave = document.getElementById('password').value.trim();

  try {
    const response = await fetch('https://localhost:7012/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usuario, clave })
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", data.usuario);
      localStorage.setItem("rol", data.rol);

      // **Guardamos el sexo
      if(data.sexo) {
        localStorage.setItem("sexo", data.sexo);
      } else {
        // Por si acaso colcamos un valor por defecto o alertar
        console.warn("No se recibió el sexo del usuario en la respuesta.");
      }

      alert('Inicio de sesión exitoso');
      window.location.href = "/Home/Home.html";
    } else {
      console.error("Error en login (respuesta no ok):", data);
      alert(data.message || 'Usuario o contraseña incorrectos');
    }

  } catch (error) {
    console.error('Error en el login:', error);
    alert('Hubo un error al intentar iniciar sesión');
  }
});
