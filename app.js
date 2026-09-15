const KEY='dietApp_v1';
const defaultState={foods:[],water:0,goals:{calories:1800,protein:100,carbs:200,fat:60,water:2000}};
let state=load();
function load(){try{return Object.assign({},defaultState,JSON.parse(localStorage.getItem(KEY)||'null'),{goals:{...defaultState.goals,...(JSON.parse(localStorage.getItem(KEY)||'null')?.goals||{})}})}catch{return structuredClone(defaultState)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function totals(){return state.foods.reduce((a,f)=>({calories:a.calories+f.calories,protein:a.protein+f.protein,carbs:a.carbs+f.carbs,fat:a.fat+f.fat}),{calories:0,protein:0,carbs:0,fat:0})}
function pct(v,g){return Math.min(100,Math.round(v/g*100));}
function render(){
 const t=totals(),g=state.goals;
 document.getElementById('todayLabel').textContent=new Date().toLocaleDateString('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
 document.getElementById('calorieValue').textContent=Math.round(t.calories);
 document.getElementById('calorieHeadline').textContent=t.calories?`今天已攝取 ${Math.round(t.calories)} kcal`:'先記錄第一餐吧';
 document.getElementById('proteinTotal').textContent=Math.round(t.protein)+'g'; document.getElementById('proteinGoalLabel').textContent=`/ ${g.protein}g`;
 document.getElementById('carbTotal').textContent=Math.round(t.carbs)+'g'; document.getElementById('carbGoalLabel').textContent=`/ ${g.carbs}g`;
 document.getElementById('fatTotal').textContent=Math.round(t.fat)+'g'; document.getElementById('fatGoalLabel').textContent=`/ ${g.fat}g`;
 document.getElementById('foodCount').textContent=state.foods.length;
 document.getElementById('proteinBar').style.width=pct(t.protein,g.protein)+'%'; document.getElementById('carbBar').style.width=pct(t.carbs,g.carbs)+'%'; document.getElementById('fatBar').style.width=pct(t.fat,g.fat)+'%';
 const cp=Math.min(100,Math.round(t.calories/g.calories*100)); document.getElementById('calorieRing').style.background=`conic-gradient(var(--accent) ${cp*3.6}deg,#d9e4cf ${cp*3.6}deg)`;
 document.getElementById('dailyAdvice').textContent=adviceText(t,g);
 document.getElementById('waterTotal').textContent=state.water; document.getElementById('waterGoal').textContent=g.water; const wp=Math.min(100,Math.round(state.water/g.water*100)); document.getElementById('waterPercent').textContent=wp+'%'; document.getElementById('waterBar').style.width=wp+'%';
 const list=document.getElementById('foodList'); list.innerHTML=state.foods.length?state.foods.map(f=>`<div class="food-item"><div><div class="food-name">${esc(f.name)}</div><div class="food-note">${esc(f.note||'')}</div></div><div class="food-macros">${Math.round(f.calories)} kcal<br>P ${Math.round(f.protein)}g · C ${Math.round(f.carbs)}g · F ${Math.round(f.fat)}g</div><button class="delete-btn" data-delete="${f.id}">刪除</button></div>`).join(''):`<div class="food-item"><div><div class="food-name">還沒有飲食紀錄</div><div class="food-note">使用上方拍照或手動新增。</div></div></div>`;
 document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{state.foods=state.foods.filter(x=>x.id!==b.dataset.delete);save()});
 renderSuggestions(t,g);
}
function adviceText(t,g){if(!state.foods.length)return'拍照或手動加入食物，APP 會幫你整理今天的營養。';const rem=Math.max(0,g.calories-t.calories);return rem<=0?'今天的熱量已達到設定目標，可以優先選擇蔬菜、蛋白質與無糖飲品。':`距離今日熱量目標約 ${Math.round(rem)} kcal；接下來可優先補足蛋白質與蔬菜。`}
function renderSuggestions(t,g){const box=document.getElementById('suggestions');const arr=[];if(t.protein<g.protein*.75)arr.push('🥚 蛋白質目前偏低，下一餐可以加入雞胸肉、魚、蛋、豆腐或希臘優格。');else arr.push('💪 蛋白質進度不錯，接下來維持平均分配即可。');if(t.carbs>g.carbs*1.1)arr.push('🍚 碳水已超過目標，下一餐可減少飯、麵、麵包等主食份量。');else if(t.carbs<g.carbs*.45)arr.push('🍚 碳水目前較少，依活動量可加入適量全穀飯、地瓜或燕麥。');if(t.fat>g.fat*1.1)arr.push('🥑 脂肪偏高，今天可先減少油煎、炸物、濃醬與高脂肪零食。');if(state.water<g.water*.6)arr.push('💧 今天飲水還不夠，先補 250–500 ml，分次喝比一次大量喝更容易完成目標。');else if(state.water>=g.water)arr.push('💧 今日飲水目標已完成，保持穩定補水即可。');if(!arr.length)arr.push('🌿 今天的營養分布看起來穩定，繼續維持三餐均衡與適量活動。');box.innerHTML=arr.map(x=>`<div class="suggestion"><span class="dot">•</span><span>${x}</span></div>`).join('');document.getElementById('suggestionBadge').textContent=state.foods.length?'已更新':'待記錄'}

const modal=document.getElementById('modal'), settingsModal=document.getElementById('settingsModal');
document.getElementById('addFoodBtn').onclick=()=>{modal.classList.remove('hidden');document.getElementById('foodName').focus()};
document.getElementById('closeModal').onclick=()=>modal.classList.add('hidden');
document.getElementById('settingsBtn').onclick=()=>{const g=state.goals;goalCalories.value=g.calories;goalProtein.value=g.protein;goalCarbs.value=g.carbs;goalFat.value=g.fat;goalWater.value=g.water;settingsModal.classList.remove('hidden')};
document.getElementById('closeSettings').onclick=()=>settingsModal.classList.add('hidden');
document.getElementById('foodForm').onsubmit=e=>{e.preventDefault();state.foods.push({id:crypto.randomUUID(),name:foodName.value,calories:+foodCalories.value,protein:+foodProtein.value,carbs:+foodCarbs.value,fat:+foodFat.value,note:foodNote.value});e.target.reset();modal.classList.add('hidden');save()};
document.getElementById('settingsForm').onsubmit=e=>{e.preventDefault();state.goals={calories:+goalCalories.value,protein:+goalProtein.value,carbs:+goalCarbs.value,fat:+goalFat.value,water:+goalWater.value};settingsModal.classList.add('hidden');save()};
document.querySelectorAll('[data-water]').forEach(b=>b.onclick=()=>{state.water+=+b.dataset.water;save()}); document.getElementById('waterUndo').onclick=()=>{state.water=Math.max(0,state.water-250);save()};

document.getElementById('photoBtn').onclick=()=>document.getElementById('photoInput').click();
document.getElementById('photoInput').onchange=e=>{const file=e.target.files[0];if(!file)return;const url=URL.createObjectURL(file);document.getElementById('photoPreview').src=url;document.getElementById('photoPreviewWrap').classList.remove('hidden');document.getElementById('photoResultTitle').textContent='照片已載入';document.getElementById('photoResultText').textContent='目前這個 GitHub Pages 版本會先展示照片並提供估算入口；請用「手動新增」確認食物與份量。之後可接 AI 視覺 API 自動辨識。'};

document.getElementById('historyBtn').onclick=()=>alert('歷史紀錄功能可在下一版加入日曆、週／月趨勢與體重曲線。');document.getElementById('profileBtn').onclick=()=>settingsBtn.click();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
render();
