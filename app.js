const KEY='dietApp_v2';
const defaultState={
  foods:[],water:0,
  profile:{name:'我',sex:'female',age:31,height:156,weight:70,activity:'moderate',goal:'lose',weeklyStrength:2,weeklyCardio:5,cardioMinutes:60},
  goals:{calories:1800,protein:100,carbs:200,fat:60,water:2000},
  couple:{enabled:false,inviteCode:'',partnerName:'另一半',partnerState:null}
};
let state=load();
const $=id=>document.getElementById(id);
function deepClone(x){return JSON.parse(JSON.stringify(x));}
function merge(base,src){if(!src)return base;Object.keys(src).forEach(k=>{if(src[k]&&typeof src[k]==='object'&&!Array.isArray(src[k])&&base[k]&&typeof base[k]==='object')base[k]=merge(base[k],src[k]);else base[k]=src[k]});return base}
function load(){try{return merge(deepClone(defaultState),JSON.parse(localStorage.getItem(KEY)||'null')||{})}catch{return deepClone(defaultState)}}
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function totals(foods=state.foods){return foods.reduce((a,f)=>({calories:a.calories+Number(f.calories||0),protein:a.protein+Number(f.protein||0),carbs:a.carbs+Number(f.carbs||0),fat:a.fat+Number(f.fat||0)}),{calories:0,protein:0,carbs:0,fat:0})}
function pct(v,g){return g?Math.min(100,Math.round(v/g*100)):0}
function activityFactor(p){return {sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9}[p.activity]||1.55}
function calcTDEE(p){const bmr=p.sex==='male'?(10*p.weight+6.25*p.height-5*p.age+5):(10*p.weight+6.25*p.height-5*p.age-161);const tdee=bmr*activityFactor(p);const goalDelta=p.goal==='lose'?-400:p.goal==='gain'?300:0;return {bmr:Math.round(bmr),tdee:Math.round(tdee),target:Math.max(1200,Math.round(tdee+goalDelta))}}
function recommendedMacros(calc,p){const calories=Math.max(1200,calc.target),protein=Math.round(p.weight*(p.goal==='lose'?1.6:1.4)),fat=Math.round(calories*.28/9),carbs=Math.max(1,Math.round((calories-protein*4-fat*9)/4));return {calories,protein,carbs,fat,water:Math.round(Math.max(1800,p.weight*30))}}
function render(){
 const t=totals(),g=state.goals,calc=calcTDEE(state.profile);
 $('todayLabel').textContent=new Date().toLocaleDateString('zh-TW',{year:'numeric',month:'long',day:'numeric',weekday:'long'});
 $('calorieValue').textContent=Math.round(t.calories);
 $('calorieHeadline').textContent=`今日已攝取 ${Math.round(t.calories)} kcal`;
 $('calorieGoalText').textContent=Math.round(g.calories);
 [['protein',t.protein,g.protein],['carb',t.carbs,g.carbs],['fat',t.fat,g.fat]].forEach(([k,v,goal])=>{$(k+'Total').textContent=Math.round(v)+'g';$(k+'GoalLabel').textContent=`/ ${goal}g`;$(k+'Bar').style.width=pct(v,goal)+'%' });
 const cp=pct(t.calories,g.calories);$('calorieRing').style.background=`conic-gradient(var(--accent) ${cp*3.6}deg,#d9e4cf ${cp*3.6}deg)`;
 $('waterTotal').textContent=state.water;$('waterGoal').textContent=g.water;$('waterPercent').textContent=pct(state.water,g.water)+'%';$('waterBar').style.width=pct(state.water,g.water)+'%';
 const list=$('foodList');list.innerHTML=state.foods.length?state.foods.map(f=>`<div class="food-item"><div class="food-main"><div class="food-name">${esc(f.name)}</div><div class="food-note">${esc(f.note||'')}</div></div><div class="food-macros">${Math.round(f.calories)} kcal<br>P ${Math.round(f.protein)}g · C ${Math.round(f.carbs)}g · F ${Math.round(f.fat)}g</div><button class="delete-btn" data-delete="${f.id}">刪除</button></div>`).join(''):`<div class="food-item empty"><div><div class="food-name">還沒有飲食紀錄</div><div class="food-note">點右上角「手動新增」開始記錄。</div></div></div>`;
 document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{state.foods=state.foods.filter(x=>x.id!==b.dataset.delete);save()});
 renderSuggestions(t,g,calc); renderTDEEPreview(); renderCouple();
}
function renderSuggestions(t,g,calc){const arr=[];if(t.protein<g.protein*.75)arr.push('🥚 蛋白質目前偏低，下一餐可加入雞胸肉、魚、蛋、豆腐或希臘優格。');else arr.push('💪 蛋白質進度不錯，維持平均分配到三餐。');if(t.carbs>g.carbs*1.1)arr.push('🍚 碳水已超過目標，下一餐可減少飯、麵、麵包等主食。');else if(t.carbs<g.carbs*.45)arr.push('🍚 碳水較少，可依活動量補適量全穀飯、地瓜或燕麥。');if(t.fat>g.fat*1.1)arr.push('🥑 脂肪偏高，今天可減少炸物、濃醬與高脂零食。');if(state.water<g.water*.6)arr.push('💧 今天飲水還不夠，先補 250–500 ml，分次喝。');else if(state.water>=g.water)arr.push('💧 今日飲水目標已完成。');arr.push(`🔥 目前估算 BMR ${calc.bmr} kcal、TDEE ${calc.tdee} kcal。`);$('suggestions').innerHTML=arr.map(x=>`<div class="suggestion"><span class="dot">•</span><span>${x}</span></div>`).join('');$('suggestionBadge').textContent='已更新'}
function renderTDEEPreview(){const p=state.profile;if(!$('tdeePreview'))return;const c=calcTDEE(p);$('tdeePreview').innerHTML=`<div><span>BMR</span><strong>${c.bmr} kcal</strong></div><div><span>TDEE</span><strong>${c.tdee} kcal</strong></div><div><span>建議攝取</span><strong>${c.target} kcal</strong></div><p>計算會依性別、年齡、身高、體重、活動量與目標更新。</p>`}
function renderCouple(){const box=$('coupleSummary');if(!box)return;if(!state.couple.enabled){box.innerHTML='<div class="couple-empty">尚未建立雙人協作。建立配對碼後，另一半可加入。</div>';return}const self=state.profile.name||'我',partner=state.couple.partnerState;box.innerHTML=`<div class="couple-grid"><div><span>你</span><b>${esc(self)}</b><small>今日 ${Math.round(totals().calories)} kcal</small></div><div><span>另一半</span><b>${esc(state.couple.partnerName||'另一半')}</b><small>${partner?`今日 ${Math.round(totals(partner.foods||[]).calories)} kcal`:'尚未同步資料'}</small></div></div><div class="invite-row"><span>配對碼</span><strong>${esc(state.couple.inviteCode||'')}</strong></div>`}
function openSettings(){const p=state.profile,g=state.goals;$('profileName').value=p.name;$('profileSex').value=p.sex;$('profileAge').value=p.age;$('profileHeight').value=p.height;$('profileWeight').value=p.weight;$('profileActivity').value=p.activity;$('profileGoal').value=p.goal;$('weeklyStrength').value=p.weeklyStrength;$('weeklyCardio').value=p.weeklyCardio;$('cardioMinutes').value=p.cardioMinutes;$('goalCalories').value=g.calories;$('goalProtein').value=g.protein;$('goalCarbs').value=g.carbs;$('goalFat').value=g.fat;$('goalWater').value=g.water;$('settingsModal').classList.remove('hidden');renderTDEEPreview()}
const modal=$('modal'),settingsModal=$('settingsModal'),coupleModal=$('coupleModal');
$('addFoodBtn').onclick=()=>{modal.classList.remove('hidden');$('foodName').focus()};$('closeModal').onclick=()=>modal.classList.add('hidden');$('settingsBtn').onclick=openSettings;$('profileBtn').onclick=openSettings;$('closeSettings').onclick=()=>settingsModal.classList.add('hidden');
$('foodForm').onsubmit=e=>{e.preventDefault();state.foods.push({id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),name:$('foodName').value,calories:+$('foodCalories').value,protein:+$('foodProtein').value,carbs:+$('foodCarbs').value,fat:+$('foodFat').value,note:$('foodNote').value});e.target.reset();modal.classList.add('hidden');save()};
$('settingsForm').onsubmit=e=>{e.preventDefault();state.profile={...state.profile,name:$('profileName').value,sex:$('profileSex').value,age:+$('profileAge').value,height:+$('profileHeight').value,weight:+$('profileWeight').value,activity:$('profileActivity').value,goal:$('profileGoal').value,weeklyStrength:+$('weeklyStrength').value,weeklyCardio:+$('weeklyCardio').value,cardioMinutes:+$('cardioMinutes').value};const calc=calcTDEE(state.profile),auto=recommendedMacros(calc,state.profile);state.goals={calories:+$('goalCalories').value||auto.calories,protein:+$('goalProtein').value||auto.protein,carbs:+$('goalCarbs').value||auto.carbs,fat:+$('goalFat').value||auto.fat,water:+$('goalWater').value||auto.water};settingsModal.classList.add('hidden');save()};
['profileAge','profileHeight','profileWeight','profileSex','profileActivity','profileGoal'].forEach(id=>$(id).addEventListener('input',renderTDEEPreview));
$('autoGoalsBtn').onclick=()=>{const a=recommendedMacros(calcTDEE({sex:$('profileSex').value,age:+$('profileAge').value,height:+$('profileHeight').value,weight:+$('profileWeight').value,activity:$('profileActivity').value,goal:$('profileGoal').value}),{...state.profile,sex:$('profileSex').value,age:+$('profileAge').value,height:+$('profileHeight').value,weight:+$('profileWeight').value,goal:$('profileGoal').value});$('goalCalories').value=a.calories;$('goalProtein').value=a.protein;$('goalCarbs').value=a.carbs;$('goalFat').value=a.fat;$('goalWater').value=a.water};
document.querySelectorAll('[data-water]').forEach(b=>b.onclick=()=>{state.water+=+b.dataset.water;save()});$('waterUndo').onclick=()=>{state.water=Math.max(0,state.water-250);save()};
$('historyBtn').onclick=()=>alert('之後可以在這裡加入日曆、週／月趨勢、體重曲線與體脂追蹤。');
$('coupleBtn').onclick=()=>coupleModal.classList.remove('hidden');$('closeCouple').onclick=()=>coupleModal.classList.add('hidden');
$('generateInvite').onclick=()=>{state.couple.enabled=true;state.couple.inviteCode=Math.random().toString(36).slice(2,8).toUpperCase();save();alert(`你的配對碼：${state.couple.inviteCode}\n目前為本機示範模式；跨裝置同步需接 Firebase/Supabase。`)};
$('joinInvite').onclick=()=>{const code=prompt('請輸入另一半提供的配對碼');if(code){state.couple.enabled=true;state.couple.inviteCode=code.toUpperCase();state.couple.partnerName='另一半';save();alert('已加入配對。跨裝置資料同步需再設定雲端資料庫。')}};
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});render();
