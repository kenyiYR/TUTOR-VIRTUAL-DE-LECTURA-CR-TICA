// ✅ Email válido
export function validateEmail(email) {
  const re = /^\S+@\S+\.\S+$/;
  return re.test(email);
}

// ✅ Contraseña fuerte
export function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}

// ✅ Nombre completo (mínimo 2 apellidos + nombre, solo letras y espacios)
export function validateFullName(name) {
  return /^[A-Za-zÁÉÍÓÚáéíóúÑñ]+\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+$/.test(
    name.trim()
  );
}
