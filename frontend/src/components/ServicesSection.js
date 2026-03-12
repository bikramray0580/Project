import React, { useEffect, useState } from "react";

export default function ServicesSection() {
  const [services, setServices] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data || []))
      .catch((err) => { console.error("Error fetching services:", err); setServices([]); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:20, textAlign:"center"}}>Loading services…</div>;
  if (!services.length) return <div style={{padding:20, textAlign:"center"}}>No services found.</div>;

  return (
    <div style={{padding: "40px 20px", fontFamily: "Arial, Helvetica, sans-serif" }}>
      <h2 style={{textAlign: "center", marginBottom: 24}}>Our Services</h2>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 16,
        maxWidth: 1000,
        margin: "0 auto"
      }}>
        {services.map(s => (
          <div key={s.id}
               onClick={() => setSelected(s)}
               style={{
                 background: "#fff",
                 borderRadius: 12,
                 padding: 18,
                 boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
                 cursor: "pointer",
                 textAlign: "center"
               }}>
            {s.iconUrl ? (
              <img
                src={s.iconUrl.startsWith("http") ? s.iconUrl : `http://localhost:5000${s.iconUrl}`}
                alt={s.title}
                style={{height:60, objectFit:"contain", marginBottom:12}}
              />
            ) : (
              <div style={{height:60, fontSize:40, lineHeight:"60px"}}>??</div>
            )}
            <h3 style={{margin: "8px 0"}}>{s.title}</h3>
            <p style={{color:"#555", fontSize:14}}>{s.short}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
