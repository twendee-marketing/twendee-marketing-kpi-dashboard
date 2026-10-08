// Notion KPI sync. Runs in GitHub Actions only; never in the browser.
import {mkdir, writeFile} from 'node:fs/promises';
const TOKEN=process.env.NOTION_TOKEN;
const METRICS=process.env.NOTION_METRICS_DATA_SOURCE_ID||'e414532d-950f-4a5b-9baf-2681e02969fd';
const WEEKS=process.env.NOTION_WEEKS_DATA_SOURCE_ID||'dfb76d28-91b2-45d9-9904-9be66ae47652';
if(!TOKEN) throw Error('NOTION_TOKEN is missing. Configure this GitHub Actions secret.');
async function query(id){
  let cursor,rows=[];
  do{
    const response=await fetch('https://api.notion.com/v1/data_sources/'+id+'/query',{
      method:'POST',
      headers:{Authorization:'Bearer '+TOKEN,'Notion-Version':'2025-09-03','Content-Type':'application/json'},
      body:JSON.stringify({page_size:100,...(cursor?{start_cursor:cursor}:{})})
    });
    if(!response.ok)throw Error('Notion query failed: HTTP '+response.status+' '+(await response.text()).slice(0,350));
    const json=await response.json();rows.push(...json.results);cursor=json.has_more?json.next_cursor:null;
  }while(cursor);
  return rows;
}
function get(p){
  if(!p)return null;
  if(p.type==='title'||p.type==='rich_text')return (p[p.type]||[]).map(x=>x.plain_text||x.text?.content||'').join('');
  if(p.type==='number')return p.number;
  if(p.type==='date')return p.date?.start||null;
  if(p.type==='select')return p.select?.name||null;
  if(p.type==='relation')return (p.relation||[]).map(x=>x.id);
  return null;
}
function values(item){return Object.fromEntries(Object.entries(item.properties||{}).map(([key,v])=>[key,get(v)]));}
const [metricPages,weekPages]=await Promise.all([query(METRICS),query(WEEKS)]);
const records=metricPages.map(values),weeks=weekPages.map(x=>({id:x.id,...values(x)}));
if(!records.length||!weeks.length)throw Error('Empty Notion response. Refusing to publish empty dashboard.');
const periodSet=new Set(weeks.map(x=>x['Reporting Period']));
const seen=new Set();
for(const r of records){
  if(!r['Reporting Period']||!r.Section||!r.Account||!r.Metric)throw Error('A KPI record is missing required fields');
  const key=[r['Reporting Period'],r.Section,r.Account,r.Metric].join('::');
  if(seen.has(key))throw Error('Duplicate KPI '+key);
  seen.add(key);
  if(!periodSet.has(r['Reporting Period']))throw Error('KPI lacks a matching Weekly Report: '+r['Reporting Period']);
}
await mkdir('data',{recursive:true});
await writeFile('data/kpi.json',JSON.stringify({records,weeks,updatedAt:new Date().toISOString()},null,2)+'\n');
console.log('Validated '+records.length+' KPI records and '+weeks.length+' weekly reports.');
