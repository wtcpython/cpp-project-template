export function checkCppQualifiedName(value: string): string {
  if (!value || !value.trim()) {
    return "Name cannot be empty";
  }

  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
    return "Invalid name";
  }

  return "";
}
