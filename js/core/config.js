const firebaseConfig={apiKey:"AIzaSyDQ297TWTIRzV_IUq_8buocCf9Xsi3iCGU",authDomain:"boggle-eb8a9.firebaseapp.com",databaseURL:"https://boggle-eb8a9-default-rtdb.asia-southeast1.firebasedatabase.app",projectId:"boggle-eb8a9",storageBucket:"boggle-eb8a9.firebasestorage.app",messagingSenderId:"1077661800224",appId:"1:1077661800224:web:aae382ce2afddaee3da945",measurementId:"G-B9970XTCQX"};
firebase.initializeApp(firebaseConfig);
const auth=firebase.auth(),db=firebase.database();
let SRV_OFF=0;function srvNow(){return Date.now()+SRV_OFF}
db.ref('.info/serverTimeOffset').on('value',x=>{SRV_OFF=x.val()||0});
const MAX_PLAYERS=3,DRAW_MAX_PLAYERS=6,SPY_MAX_PLAYERS=6,ROUND_SECONDS=210,MIN_LEN=3,SHAKE_SECONDS=3,DRAW_SECONDS=75,DRAW_MAX_LEVELS=10,SPY_MAX_ROUNDS=5,SPY_CLUE_SECONDS=90;
function maxPlayersFor(gt){const g=gt||selectedGame;if(g==='chain')return 6;if(g==='board')return 5;if(g==='draw'||g==='spy')return g==='spy'?SPY_MAX_PLAYERS:DRAW_MAX_PLAYERS;return MAX_PLAYERS;}
const DICE=['AAEEGN','ABBJOO','ACHOPS','AFFKPS','AOOTTW','CIMOTU','DEILRX','DELRVY','DISTTY','EEGHNW','EEINSU','EHRTVW','EIOSST','ELRTTY','HIMNQU','HLNNRZ'];
const SCORE_TABLE={3:1,4:1,5:2,6:3,7:5};
function wordScore(w){const n=w.length;return n>=8?11:(SCORE_TABLE[n]||0)}
