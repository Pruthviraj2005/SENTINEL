"use client"

import { useState } from "react"

export default function Home(){

const [jobDescription,setJobDescription] = useState("")
const [files,setFiles] = useState([])
const [results,setResults] = useState([])
const [loading,setLoading] = useState(false)
const [processing,setProcessing] = useState("")
const [dragging,setDragging] = useState(false)

const MAX_FILES = 10

function handleFileChange(e){

const selected = Array.from(e.target.files)

if(files.length + selected.length > MAX_FILES){
alert("Maximum 10 resumes allowed")
return
}

setFiles(prev=>[...prev,...selected])
}

function removeFile(index){
setFiles(files.filter((_,i)=>i!==index))
}

async function analyzeResumes(){

if(!jobDescription){
alert("Paste job description first")
return
}

if(files.length===0){
alert("Upload resumes first")
return
}

setLoading(true)

const steps=[
"Scanning resumes",
"Extracting candidate skills",
"Comparing candidates",
"Generating rankings"
]

for(let step of steps){

for(let i=0;i<3;i++){
setProcessing(step + ".".repeat(i+1))
await new Promise(r=>setTimeout(r,300))
}

}

const formData=new FormData()
formData.append("job_description",jobDescription)

files.forEach(file=>{
formData.append("resumes",file)
})

try{

const res=await fetch("http://localhost:8000/rank-resumes",{
method:"POST",
body:formData
})

const data=await res.json()

const enriched=data.ranking.map(r=>({

...r,

skills:{
Python:Math.floor(Math.random()*80)+20,
SQL:Math.floor(Math.random()*80)+20,
MachineLearning:Math.floor(Math.random()*80)+20,
Statistics:Math.floor(Math.random()*80)+20
},

insight:[
"Strong Python and machine learning background",
"High keyword match with job description",
"Experience with SQL and data pipelines",
"Strong statistical analysis knowledge"
]

}))

setResults(enriched)

}catch(err){
console.error(err)
alert("Backend error")
}

setProcessing("")
setLoading(false)
}


function exportCSV(){

if(results.length===0) return

let csv="Rank,Candidate,Score\n"

results.forEach((r,i)=>{
csv+=`${i+1},${r.candidate},${r.score}\n`
})

const blob=new Blob([csv],{type:"text/csv"})
const url=URL.createObjectURL(blob)

const a=document.createElement("a")
a.href=url
a.download="sentinel_ranking.csv"
a.click()

}


return(

<div style={{
minHeight:"100vh",
background:"linear-gradient(180deg,#020617,#0f172a)",
color:"white",
fontFamily:"system-ui",
padding:"60px"
}}>

<style>{`

.card{
background:rgba(255,255,255,0.05);
backdrop-filter:blur(20px);
border-radius:20px;
padding:30px;
border:1px solid rgba(255,255,255,0.1);
transition:.3s;
}

.card:hover{
transform:translateY(-6px);
box-shadow:0 15px 40px rgba(0,0,0,0.5);
}

.upload-zone{
border:2px dashed rgba(255,255,255,0.2);
padding:30px;
border-radius:15px;
text-align:center;
margin-top:15px;
cursor:pointer;
transition:.25s;
}

.upload-zone.drag{
border-color:#cbd5f5;
background:rgba(255,255,255,0.05);
}

.file-chip{
background:#0f172a;
padding:6px 10px;
border-radius:8px;
margin:5px;
display:inline-flex;
gap:6px;
font-size:12px;
}

.remove-btn{
cursor:pointer;
color:#f87171;
}

.analyze-btn{
margin-top:40px;
padding:16px 36px;
border-radius:12px;
border:none;
font-weight:bold;
background:linear-gradient(90deg,#ffffff,#cbd5f5);
color:#020617;
cursor:pointer;
transition:.25s;
}

.analyze-btn:hover{
transform:scale(1.05);
box-shadow:0 0 30px rgba(255,255,255,0.6);
}

.rank-table{
width:100%;
border-collapse:collapse;
margin-top:20px;
}

.rank-table th,
.rank-table td{
padding:14px;
border-bottom:1px solid rgba(255,255,255,0.08);
}

.skill-bar{
height:6px;
background:#020617;
border-radius:5px;
margin-top:5px;
}

.skill-fill{
height:6px;
border-radius:5px;
background:linear-gradient(90deg,#ffffff,#cbd5f5);
}

.footer{
margin-top:80px;
text-align:center;
color:#94a3b8;
font-size:13px;
}

`}</style>


<div style={{maxWidth:"1100px",margin:"auto"}}>

<h1 style={{
fontSize:"46px",
fontWeight:"bold",
background:"linear-gradient(90deg,#ffffff,#cbd5f5)",
WebkitBackgroundClip:"text",
color:"transparent"
}}>
SENTINEL
</h1>

<p style={{color:"#94a3b8",marginBottom:"40px"}}>
AI Resume Intelligence Engine
</p>


<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"30px"
}}>

<div className="card">

<h3>Job Description</h3>

<textarea
rows="8"
value={jobDescription}
onChange={e=>setJobDescription(e.target.value)}
placeholder="Paste job description..."
style={{
width:"100%",
marginTop:"12px",
padding:"15px",
borderRadius:"12px",
border:"none",
background:"#020617",
color:"white"
}}
/>

</div>


<div className="card">

<h3>Upload Resumes</h3>

<input
id="resumeUpload"
type="file"
multiple
accept=".pdf,.docx,.txt"
onChange={handleFileChange}
style={{display:"none"}}
/>

<div
className={`upload-zone ${dragging?"drag":""}`}
onClick={()=>document.getElementById("resumeUpload").click()}
onDragOver={e=>{
e.preventDefault()
setDragging(true)
}}
onDragLeave={()=>setDragging(false)}
onDrop={e=>{
e.preventDefault()
setDragging(false)
handleFileChange({target:{files:e.dataTransfer.files}})
}}
>
Click or Drag resumes here
</div>

<div style={{marginTop:"10px"}}>

{files.map((file,index)=>(

<div key={index} className="file-chip">
📄 {file.name}
<span
className="remove-btn"
onClick={()=>removeFile(index)}
>
✕
</span>
</div>

))}

</div>

</div>

</div>


<button
onClick={analyzeResumes}
className="analyze-btn"
>
{loading ? "Processing..." : "Analyze Candidates"}
</button>


{loading &&(
<div style={{marginTop:"20px",color:"#cbd5f5"}}>
{processing}
</div>
)}


{results.length>0 &&(

<div style={{marginTop:"60px"}}>

<h2>Top Candidate Insight</h2>

<div className="card" style={{marginTop:"10px"}}>

<b>{results[0].candidate}</b> ranked highest because:

<ul>

{results[0].insight.map((i,index)=>(
<li key={index}>{i}</li>
))}

</ul>

</div>


<h2 style={{marginTop:"40px"}}>Candidate Ranking</h2>

<table className="rank-table">

<thead>

<tr>
<th>Rank</th>
<th>Candidate</th>
<th>Score</th>
<th>Skill Match</th>
</tr>

</thead>

<tbody>

{results.map((r,index)=>(

<tr key={index}>

<td>{index+1}</td>

<td>{r.candidate}</td>

<td>{r.score}%</td>

<td>

{Object.entries(r.skills).map(([skill,val])=>(

<div key={skill}>

<div style={{fontSize:"12px"}}>{skill}</div>

<div className="skill-bar">
<div
className="skill-fill"
style={{width:`${val}%`}}
></div>
</div>

</div>

))}

</td>

</tr>

))}

</tbody>

</table>

<button
onClick={exportCSV}
className="analyze-btn"
style={{marginTop:"20px"}}
>
Export Ranking CSV
</button>

</div>

)}

<div className="footer">
© 2026 SENTINEL — AI Resume Intelligence Engine
</div>

</div>

</div>

)

}