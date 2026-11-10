function randCode(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ';let s='';for(let i=0;i<4;i++)s+=c[Math.floor(Math.random()*c.length)];return s}
function xpForLevel(lv){return Math.floor(50+(lv-1)*40+Math.pow(lv-1,1.4)*8)}
function levelFromXp(xp){let lv=1,rem=xp||0;while(rem>=xpForLevel(lv)&&lv<99){rem-=xpForLevel(lv);lv++}return{level:lv,into:rem,need:xpForLevel(lv)}}

function userEmail(username){return username.trim().toLowerCase().replace(/[^a-z0-9_]/g,'')+'@boggle.local'}

const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
