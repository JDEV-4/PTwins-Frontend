document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const usuario = document.getElementById('usuario').value.trim();
    const contrasena = document.getElementById('contrasena').value.trim();
  
    if (usuario === 'admin' && contrasena === '1234') {
      alert('Inicio de sesión exitoso');
    } else {
      alert('Usuario o contraseña incorrectos');
    }
  });
  