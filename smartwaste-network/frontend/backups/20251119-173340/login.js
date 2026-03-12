async function doLogin(api, email, password) {
  const res = await fetch("http://localhost:5000" + api, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();

  if (!data.success) {
    throw { error: data.msg || "Invalid credentials" };
  }

  localStorage.setItem("token", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));

  return data;
}
