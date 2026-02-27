async function login() {
    const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "admin@hranalysis.com", password: "Admin123!" })
    });
    const data = await res.json();
    console.log("Status:", res.status);
    console.log("Data:", data);
}
login();
