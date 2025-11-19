document.getElementById("login-form").onsubmit = async (e) => {
 e.preventDefault();
 const form = new FormData(e.target);
 const res = await fetch('/admin/login', { method:'POST', body: form });
 if (res.redirected) window.location = res.url;
 else {
 // Try to fetch insights to check if logged in
 loadDashboard();
 }
};
async function loadDashboard(){
 const dashEl = document.getElementById("dashboard");
 try {
 const r = await fetch('/api/admin/insights');
 if (r.status === 401) {
 document.getElementById("login-box").style.display = "block";
 dashEl.style.display = "none";
 return;
 }
 const data = await r.json();
 document.getElementById("login-box").style.display = "none";
 dashEl.style.display = "block";
 // Age
 new Chart(document.getElementById("ageChart"), { type:'bar',
 data:{ labels:Object.keys(data.age_groups), 
datasets:[{label:"Users",data:Object.values(data.age_groups)}] }
 });
 // Jobs
 new Chart(document.getElementById("jobChart"), { type:'pie',
 data:{ labels:Object.keys(data.jobs), datasets:[{label:"Jobs", 
data:Object.values(data.jobs)}] }
 });
 // Services
 new Chart(document.getElementById("serviceChart"), { type:'doughnut',
 data:{ labels:Object.keys(data.services), datasets:[{label:"Services", 
data:Object.values(data.services)}] }
 });
 // Questions
 new Chart(document.getElementById("questionChart"), { type:'bar',
 data:{ labels:Object.keys(data.questions).slice(0,10), 
datasets:[{label:"Top Questions", 
data:Object.values(data.questions).slice(0,10)}] }
 });
 // premium list
 const pl = document.getElementById("premiumList");
 pl.innerHTML = data.premium_suggestions.length ? 
data.premium_suggestions.map(p => `<div>User:${p.user} question:${p.question}
count:${p.count}</div>`).join("") : "<div>No suggestions</div>";
 // engagements list
 const res = await fetch('/api/admin/engagements');
 const items = await res.json();
 const tbody = document.querySelector("#engTable tbody");
 tbody.innerHTML = "";
items.forEach(it=>{
const row = `<tr><td>${it.age||""}</td><td>${it.job||""}</td><td>${(it.desires||[]).join(", ")}</td><td>${it.question_clicked||""}</td><td>${it.service||""}</td><td>${it.timestamp||""}</td></tr>`;
tbody.insertAdjacentHTML('beforeend', row);
});
 } catch (err) {
 console.error(err);
 }
}
document.getElementById("logoutBtn")?.addEventListener('click', async ()=>{
 await fetch('/api/admin/logout', {method:'POST'});
 window.location="/admin";
});
document.getElementById("exportCsv")?.addEventListener('click', ()=>{ 
window.location = '/api/admin/export_csv'; });
window.onload = loadDashboard;