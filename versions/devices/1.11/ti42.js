(function(){/*
 http://pcjs.org/modules/devices/device.js (C) Jeff Parsons 2012-2017
 http://pcjs.org/modules/devices/input.js (C) Jeff Parsons 2012-2017
 http://pcjs.org/modules/devices/led.js (C) Jeff Parsons 2012-2017
 http://pcjs.org/modules/devices/rom.js (C) Jeff Parsons 2012-2017
 http://pcjs.org/modules/devices/time.js (C) Jeff Parsons 2012-2017
 http://pcjs.org/modules/devices/tms1500.js (C) Jeff Parsons 2012-2017
 http://pcjs.org/modules/devices/machine.js (C) Jeff Parsons 2012-2017
*/
var q,aa="function"==typeof Object.create?Object.create:function(a){function b(){}b.prototype=a;return new b},ba;if("function"==typeof Object.setPrototypeOf)ba=Object.setPrototypeOf;else{var ca;a:{var da={va:!0},ea={};try{ea.__proto__=da;ca=ea.va;break a}catch(a){}ca=!1}ba=ca?function(a,b){a.__proto__=b;if(a.__proto__!==b)throw new TypeError(a+" is not extensible");return a}:null}var fa=ba;
function r(a,b){a.prototype=aa(b.prototype);a.prototype.constructor=a;if(fa)fa(a,b);else for(var c in b)if("prototype"!=c)if(Object.defineProperties){var d=Object.getOwnPropertyDescriptor(b,c);d&&Object.defineProperty(a,c,d)}else a[c]=b[c];a.Ba=b.prototype}var ha="function"==typeof Object.defineProperties?Object.defineProperty:function(a,b,c){a!=Array.prototype&&a!=Object.prototype&&(a[b]=c.value)},t="undefined"!=typeof window&&window===this?this:"undefined"!=typeof global&&null!=global?global:this;
function ia(){ia=function(){};t.Symbol||(t.Symbol=ja)}var ja=function(){var a=0;return function(b){return"jscomp_symbol_"+(b||"")+a++}}();function ka(){ia();var a=t.Symbol.iterator;a||(a=t.Symbol.iterator=t.Symbol("iterator"));"function"!=typeof Array.prototype[a]&&ha(Array.prototype,a,{configurable:!0,writable:!0,value:function(){return la(this)}});ka=function(){}}function la(a){var b=0;return ma(function(){return b<a.length?{done:!1,value:a[b++]}:{done:!0}})}
function ma(a){ka();a={next:a};a[t.Symbol.iterator]=function(){return this};return a}function na(a){ka();var b=a[Symbol.iterator];return b?b.call(a):la(a)}function oa(a){for(var b,c=[];!(b=a.next()).done;)c.push(b.value);return c}function v(a,b){if(b){var c=t;a=a.split(".");for(var d=0;d<a.length-1;d++){var e=a[d];e in c||(c[e]={});c=c[e]}a=a[a.length-1];d=c[a];b=b(d);b!=d&&null!=b&&ha(c,a,{configurable:!0,writable:!0,value:b})}}v("Number.parseInt",function(a){return a||parseInt});
v("Math.trunc",function(a){return a?a:function(a){a=Number(a);if(isNaN(a)||Infinity===a||-Infinity===a||0===a)return a;var b=Math.floor(Math.abs(a));return 0>a?-b:b}});v("Array.prototype.fill",function(a){return a?a:function(a,c,d){var b=this.length||0;0>c&&(c=Math.max(0,b+c));if(null==d||d>b)d=b;d=Number(d);0>d&&(d=Math.max(0,b+d));for(c=Number(c||0);c<d;c++)this[c]=a;return this}});v("Math.log2",function(a){return a?a:function(a){return Math.log(a)/Math.LN2}});var pa="Machine";
function x(a,b,c,d){this.K=d||{};this.I=a;this.na=b;this.version=c||0;this.O={};y[this.I]||(y[this.I]=[]);y[this.I].push(this);qa(this,this.K);ra(this,this.K);sa(this,this.K.bindings)}var ta;
x.prototype.fa=function(a,b){var c=this;switch(a){case ua:b.onclick=function(){var a=va(c);a&&(a.value="")};break;case wa:b.value="",b.addEventListener("keypress",function(a){a=a||window.event;var d=a.which||a.keyCode;if(d){var f=b.value;b.setSelectionRange(f.length,f.length);a.stopPropagation();if(13==d&&(d=xa,d=z[c.I]&&z[c.I][d]))for(a.preventDefault(),f=b.value+="\n",b.blur(),b.focus(),a=f.slice(f.lastIndexOf("\n",f.length-2)+1,-1),f=0;f<d.length&&!d[f](a);f++);}})}};
function sa(a,b){var c=Array.isArray(b),d;for(d in b){var e=b[d];c&&(d=e);var f=document.getElementById(e);f?(a.O[d]=f,a.fa(d,f)):c||A(a,"unable to find device ID: "+e)}}
function ra(a,b){if(b.overrides){var c,d=ta;if(!d){d={};if(window){c||(c=window.location.search.substr(1));for(var e,f=/\+/g,g=/([^&=]+)=?([^&]*)/g;e=g.exec(c);)d[decodeURIComponent(e[1].replace(f," ")).trim()]=decodeURIComponent(e[2].replace(f," ")).trim()}ta=d}c=d;for(var l in c)0<=b.overrides.indexOf(l)&&(e=c[l],e.match(/^[+-]?[0-9.]+$/)?d=Number.parseInt(e,10):"true"==e?d=!0:"false"==e?d=!1:(d=e,e='"'+e+'"'),b[l]=d,A(a,"overriding "+a.na+" property '"+l+"' with "+e))}}
function qa(a,b){if(a.version){var c="",d=ya(a,a.I);if(d.version!=a.version){c="Machine";var e=d.version}else b.version&&b.version>a.version&&(c="Config",e=b.version);c&&(b="Error: "+a.ca("%s Device version (%3.2f) incompatible with %s version (%3.2f)",b.Aa,a.version,c,e)+"\n\nClearing your browser's cache may resolve the issue.",(c=za)&&0>Aa.indexOf(c)&&(alert(b),Aa.push(c)),A(a,b))}}
function va(a){var b=wa,c=a.O[b];if(void 0===c){var d=y[a.I],e;for(e in d)if(c=d[e].O[b])break;c||(c=null);a.O[b]=c}return c}function ya(a,b){if(a=y[a.I])for(var c in a)if(a[c].na==b){var d=a[c];break}return d}function B(a,b){if(a=y[a.I])for(var c in a)if(a[c].K["class"]==b){var d=a[c];break}return d}function Ba(a){var b=Ca;return a.K.bindings&&a.K.bindings[b]}function Da(a){if(a=a.O[Ea])var b=a.textContent;return b}function C(a,b,c){a=+a||0;a<b&&(a=b);a>c&&(a=c);return a}
function D(a,b,c){a=a.K[b];void 0===a?a=c:(b=typeof c,typeof a!=b&&("boolean"==b?a=!!a:"number"==typeof c&&(a=+a)));return a}function Fa(a){if(void 0===Ga){var b=!1;if(window)try{window.localStorage.setItem(E,E),b=window.localStorage.getItem(E)==E,window.localStorage.removeItem(E)}catch(c){A(a,c.message),b=!1}Ga=b}return!!Ga}
function Ha(a){if(window){var b=window.navigator.userAgent;return"iOS"==a&&!!b.match(/(iPod|iPhone|iPad)/)&&!!b.match(/AppleWebKit/)||"MSIE"==a&&!!b.match(/(MSIE|Trident)/)||0<=b.indexOf(a)}return!1}function Ia(a,b){if(F&&0<=F.indexOf(Ja))G+=b;else{if(a=va(a))a.value+=b,8192<a.value.length&&(a.value=a.value.substr(a.value.length-4096)),a.scrollTop=a.scrollHeight;a||(a=b.lastIndexOf("\n"),0<=a&&(console.log(G+b.substr(0,a)),G="",b=b.substr(a+1)),G+=b)}}function A(a,b){Ia(a,b+"\n")}
x.prototype.ga=function(a,b){for(var c=[],d=1;d<arguments.length;++d)c[d-1]=arguments[d];Ia(this,this.ca.apply(this,[].concat([a],c instanceof Array?c:oa(na(c)))))};function H(a,b,c){if(a=a.O[b])a.textContent=c}
x.prototype.ca=function(a,b){for(var c=[],d=1;d<arguments.length;++d)c[d-1]=arguments[d];d="";var e=a.split(/%([-+ 0#]?)([0-9]*)(\.?)([0-9]*)([hlL]?)([A-Za-z%])/),f=0,g;for(g=0;g<e.length-7;g+=7){d+=e[g];var l=c[f++],h=e[g+1],m=+e[g+2]||0,n=+e[g+4]||0,k=e[g+6],p=null;switch(k){case "d":l=Math.trunc(l);case "f":k=Math.trunc(l)+"";n&&(m-=n+1);k.length<m&&("0"==h?(0>l&&m--,k=("0000000000"+Math.abs(l)).slice(-m),0>l&&(k="-"+k)):k=("          "+k).slice(-m));n&&(l=Math.trunc((l-Math.trunc(l))*Math.pow(10,
n)),k+="."+("0000000000"+Math.abs(l)).slice(-n));d+=k;break;case "s":for(;l.length<m;)l="-"==h?l+" ":" "+l;d+=l;break;case "X":p=I;case "x":p||(p=Ka);k="";do k=p[l&15]+k,l>>>=4;while(0<--m||l);d+=k;break;default:d+="(unrecognized printf conversion %"+k+")"}}return d+=e[g]};var ua="clear",wa="print",Ja="buffer",xa="command",Aa=[],za="version",Ga=void 0,E="PCjs.localStorage",z={},y={},F="",G="",Ka="0123456789abcdef",I="0123456789ABCDEF";
function J(a,b,c){x.call(this,a,b,La,c);this.time=B(this,K);this.N=this.M=this.f=this.L=null;this.ka=D(this,"drag",!1);this.W=D(this,"scroll",!1);this.h=!1;if(a=this.O[Ma]){b=this.K.location;this.ma=b[0];this.pa=b[1];this.g=b[2];this.s=b[3];this.u=b[4]||1;this.H=b[5]||1;this.ha=b[6]||a.naturalWidth||this.g;this.ja=b[7]||a.naturalHeight||this.s;this.Z=b[8]||0;this.V=b[9]||0;this.da=b[10]||0;this.ia=b[11]||0;(this.b=this.K.map)?(this.w=this.b.length,this.l=this.b[0].length):(this.l=this.u,this.w=this.H,
this.u=this.H=0);this.aa=D(this,"hexagonal",!1);this.a=D(this,"buttonDelay",0);this.S=this.g/(this.l+this.l*this.u)|0;this.T=this.s/(this.w+this.w*this.H)|0;this.ba=this.S*this.u|0;this.U=this.T*this.H|0;this.m=this.J=-1;Na(this,a);Oa(this,a);if(this.time){var d=this;this.a&&(this.Y=Pa(this.time,"timerInputRelease",function(){0>d.m&&0>d.J&&L(d,-1,-1)}));this.b&&(this.a&&(this.la=Pa(this.time,"timerKeyRelease",function(){Qa(d)})),this.j=0,this.v=[],Ra(this))}this.R=this.X=-1}}r(J,x);
J.prototype.fa=function(a,b){var c=this;switch(a){case Sa:b.onclick=function(){c.f&&c.f()};break;case Ta:b.onclick=function(){c.M&&c.M()}}x.prototype.fa.call(this,a,b)};function Ua(a,b){a.N=b}function Va(a){a.a?M(a.time,a.la,a.a):Qa(a)}
function Ra(a){var b=document;b.addEventListener("keydown",function(b){b=b||window.event;if(document.activeElement==a.O[Sa]){var c=Wa[b.which||b.keyCode];c&&Xa(a,c)&&b.preventDefault()}});b.addEventListener("keypress",function(b){b=b||window.event;var c=String.fromCharCode(b.which||b.charCode);c&&Xa(a,c)&&b.preventDefault()})}
function Na(a,b){b.addEventListener("mousedown",function(c){if(!a.h){var d=a.O[Sa];if(d){var e=window.scrollX,f=window.scrollY;d.focus();window.scrollTo(e,f)}c.button||N(a,b,Ya,c)}});b.addEventListener("mousemove",function(c){a.h||N(a,b,Za,c)});b.addEventListener("mouseup",function(c){a.h||c.button||N(a,b,O,c)});b.addEventListener("mouseout",function(c){a.h||(0>a.m?N(a,b,Za,c):N(a,b,O,c))})}
function Oa(a,b){b.addEventListener("touchstart",function(c){a.W&&(a.h=!0);N(a,b,Ya,c)});b.addEventListener("touchmove",function(c){N(a,b,Za,c)});b.addEventListener("touchend",function(c){N(a,b,O,c)})}function Xa(a,b){for(var c=0;c<a.b.length;c++)for(var d=a.b[c],e=0;e<d.length;e++)if(0<=d[e].split("|").indexOf(b))return a.j?16>a.v.length&&a.v.push(b):(a.j=1,L(a,e,c),Va(a)),!0;a.ga("unrecognized key '%s' (0x%02x)\n",b,b.charCodeAt(0));return!1}
function Qa(a){1==a.j?(a.j++,L(a,-1,-1),Va(a)):(a.j=0,a.v.length&&Xa(a,a.v.shift()))}
function N(a,b,c,d){var e=-1,f=-1,g=!1,l;if(c<O){d=d||window.event;if(d.targetTouches&&d.targetTouches.length){var h=d.targetTouches[0].pageX;var m=d.targetTouches[0].pageY;g=1<d.targetTouches.length}else h=d.pageX,m=d.pageY;var n=l=0;var k=b;do isNaN(k.offsetLeft)||(l+=k.offsetLeft,n+=k.offsetTop);while(k=k.offsetParent);h=a.ha/b.offsetWidth*(h-l)|0;m=a.ja/b.offsetHeight*(m-n)|0;b=h-a.ma;var p=m-a.pa;n=l=!1;k=h>=a.Z&&h<a.Z+a.da&&m>=a.V&&m<a.V+a.ia;if(0<=b&&b<a.g&&0<=p+a.U||k)if(g||a.W||d.preventDefault(),
0<=b&&b<a.g&&0<=p&&p<a.s){n=!0;d=a.g/a.l|0;var w=a.s/a.w|0,u=b/d|0,P=p/w|0;!a.aa||P&1||(b-=d>>1,u=b/d|0,u==a.l-1&&(b=-1));w=P*w+(a.U>>1);b-=u*d+(a.ba>>1);p-=w;0<=b&&b<a.S&&0<=p&&p<a.T&&(e=u,f=P,l=!0)}}if(!g)if(c==Ya)a.m=h,a.J=m,n?(L(a,e,f),l&&a.a&&M(a.time,a.Y,a.a,!0)):k&&a.f&&a.f();else if(c==Za)0<=a.m&&0<=a.J&&a.ka?L(a,e,f):a.N&&a.N(e,f);else if(c==O){if(c=a.a)c=a.time,e=a.Y,c=c.a&&0<e&&e<=c.b.length?0<=c.b[e-1].$:!1;c||L(a,-1,-1);a.m=a.J=-1}else A(a,"unrecognized action: "+c)}
function L(a,b,c){if(b!=a.R||c!=a.X)a.R=b,a.X=c,a.L&&a.L(b,c)}var Ya=1,Za=2,O=3,Sa="power",Ta="reset",Ma="surface",Wa={8:"\b"},La=1.11;
function $a(a,b,c){x.call(this,a,b,ab,c);a=this.O[bb];if(!a)throw Error("LED binding for '"+bb+"' missing: '"+this.K.O[bb]+"'");b=document.createElement("canvas");if(!b||!b.getContext)throw a.innerHTML="LED device requires HTML5 canvas support",Error("LED device requires HTML5 canvas support");this.da=a;this.type=C(this.K.type||cb,cb,db);this.g=eb[this.type][0];this.j=eb[this.type][1];this.width=D(this,"width",this.g);this.height=D(this,"height",this.j);this.f=D(this,"cols",1);this.m=this.f+D(this,
"colsExtra",0);this.R=D(this,"rows",1);this.v=this.R+D(this,"rowsExtra",0);this.T=this.width*this.f;this.M=this.height*this.R;this.u=Q("black",0);this.h=fb(this.K.color)||this.u;this.Y=Q(this.h,1,.25);this.X=Q(this.h,1,2);this.l=fb(this.K.backgroundColor);this.Z=D(this,"fixed",!1);this.Z||(b.style.width="100%",b.style.height="auto");this.W=D(this,"hexagonal",!1);this.V=D(this,"highlight",!0);this.H=D(this,"persistent",this.type<db);b.setAttribute("width",this.T.toString());b.setAttribute("height",
this.M.toString());b.style.backgroundColor=this.u;a.appendChild(b);this.U=b.getContext("2d");if(this.s=document.createElement("canvas"))this.s.width=this.S=this.g*this.f,this.s.height=this.L=this.j*this.R,this.a=this.s.getContext("2d");this.aa=(this.v+1)*this.m*4;this.b=Array(this.aa);this.ba=this.f<this.m?4*(this.m-this.f):0;this.w=this.J=!1;this.N=-1;var d=this;(this.time=B(this,K))&&gb(this.time,function(){R(d)})}r($a,x);
function hb(a){for(var b=a.b,c=0;c<b.length;c+=4)b[c]=a.type<db?ib:" ",b[c+1]=a.h==a.u?null:a.h,b[c+2]=0,b[c+3]=S;a.w=a.J=!0;R(a,!0)}function jb(a){a.l?(a.a.fillStyle=a.l,a.a.fillRect(0,0,a.S,a.L)):a.a.clearRect(0,0,a.S,a.L)}
function R(a,b){b=void 0===b?!1:b;if(a.w||b){if(a.type<db){a.H&&!b||jb(a);for(var c=0,d=0;d<a.v;d++){for(var e=0;e<a.f;e++){var f=a.b[c],g=a.b[c+1]||a.u,l=a.V&&c==a.N;if(a.b[c+3]&S||l||b){a:{var h=a;var m=g;var n=e;g=d;var k=l;n=void 0===n?0:n;g=void 0===g?0:g;k=void 0===k?!1:k;var p=0;if(h.W&&!(g&1)&&(p=h.g>>1,n==h.f-1))break a;if(h.H){var w=n*h.g+p;var u=g*h.j;h.l?(h.a.fillStyle=h.l,h.a.fillRect(w,u,h.g,h.j)):h.a.clearRect(w,u,h.g,h.j)}m&&m!=h.h?(w=k?Q(m,1,2):m,m=Q(m,1,.25)):(w=k?h.X:h.h,m=h.Y);
k=!1;m=f?w:m;w==h.u&&(m=h.l,k=!0);h.a.fillStyle=m;f=n*h.g+p;g*=h.j;n=kb[h.type];3==n.length?(h.a.beginPath(),h.a.arc(n[0]+f,n[1]+g,n[2],0,2*Math.PI),k?(h.a.globalCompositeOperation="destination-out",h.a.fill(),h.a.globalCompositeOperation="source-over"):h.a.fill()):h.a.fillRect(n[0]+f,n[1]+g,n[2],n[3])}a.b[c+3]&=~S;l&&(a.b[c+3]|=S)}c+=4}c+=a.ba}}else{b="";for(c=0;c<a.b.length;c+=4)b+=a.b[c]||" ",a.b[c+3]&lb&&(b+=".");jb(a);for(e=d=c=0;c<b.length;c++){g=b[c];"."==g&&d&&d--;l=a;h=d;f=e;h=void 0===h?
0:h;f=void 0===f?0:f;if(g=mb[g])for(n=0;n<g.length;n++)if(p=l,k=nb[g[n]]){m=(void 0===h?0:h)*p.g;w=(void 0===f?0:f)*p.j;p.a.fillStyle=p.h;p.a.beginPath();if(3==k.length)p.a.arc(k[0]+m,k[1]+w,k[2],0,2*Math.PI);else for(u=0;u<k.length;u+=2)u?p.a.lineTo(k[u]+m,k[u+1]+w):p.a.moveTo(k[u]+m,k[u+1]+w);p.a.closePath();p.a.fill()}if(++d==a.f&&(d=0,++e==a.v))break}}a.U.globalCompositeOperation=a.l&&!a.H?"source-over":"copy";a.U.drawImage(a.s,0,0,a.S,a.L,0,0,a.T,a.M);a.w=!1;a.N=-1}else a.H||a.J||hb(a);a.J=!1}
function fb(a){return(a=a||void 0)&&ob[a]||a}function Q(a,b,c){b=void 0===b?1:b;c=void 0===c?1:c;if(a){var d=[];a=ob[a]||a;var e=a;var f=16;var g=e.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);g||(f=10,g=e.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,?\s*(\d+|)\)$/i));if(g){for(e=1;e<g.length;e++)d[e-1]=Number.parseInt(g[e],f);d.length=e-1;f=!0}else f=!1;if(f){a="rgba(";for(f=0;3>f;f++)g=Math.round(d[f]*c),g=0>g?0:255<g?255:g,a+=g+",";a+=(f<d.length?d[f]:b)+")"}}return a}
function pb(a,b,c,d,e){e=void 0===e?0:e;var f=null;if(0<=c&&c<a.v&&0<=b&&b<a.m){f=!1;b=4*(c*a.m+b);if(a.b[b]!==d||(a.b[b+3]&qb)!==e)a.b[b]=d,a.b[b+3]=a.b[b+3]&~qb|e|S,a.w=f=!0;a.N=b;a.J=!0}return f}
var cb=1,db=3,bb="container",ob={aliceblue:"#f0f8ff",antiquewhite:"#faebd7",aqua:"#00ffff",aquamarine:"#7fffd4",azure:"#f0ffff",beige:"#f5f5dc",bisque:"#ffe4c4",black:"#000000",blanchedalmond:"#ffebcd",blue:"#0000ff",blueviolet:"#8a2be2",brown:"#a52a2a",burlywood:"#deb887",cadetblue:"#5f9ea0",chartreuse:"#7fff00",chocolate:"#d2691e",coral:"#ff7f50",cornflowerblue:"#6495ed",cornsilk:"#fff8dc",crimson:"#dc143c",cyan:"#00ffff",darkblue:"#00008b",darkcyan:"#008b8b",darkgoldenrod:"#b8860b",darkgray:"#a9a9a9",
darkgreen:"#006400",darkkhaki:"#bdb76b",darkmagenta:"#8b008b",darkolivegreen:"#556b2f",darkorange:"#ff8c00",darkorchid:"#9932cc",darkred:"#8b0000",darksalmon:"#e9967a",darkseagreen:"#8fbc8f",darkslateblue:"#483d8b",darkslategray:"#2f4f4f",darkturquoise:"#00ced1",darkviolet:"#9400d3",deeppink:"#ff1493",deepskyblue:"#00bfff",dimgray:"#696969",dodgerblue:"#1e90ff",firebrick:"#b22222",floralwhite:"#fffaf0",forestgreen:"#228b22",fuchsia:"#ff00ff",gainsboro:"#dcdcdc",ghostwhite:"#f8f8ff",gold:"#ffd700",
goldenrod:"#daa520",gray:"#808080",green:"#008000",greenyellow:"#adff2f",honeydew:"#f0fff0",hotpink:"#ff69b4","indianred ":"#cd5c5c",indigo:"#4b0082",ivory:"#fffff0",khaki:"#f0e68c",lavender:"#e6e6fa",lavenderblush:"#fff0f5",lawngreen:"#7cfc00",lemonchiffon:"#fffacd",lightblue:"#add8e6",lightcoral:"#f08080",lightcyan:"#e0ffff",lightgoldenrodyellow:"#fafad2",lightgrey:"#d3d3d3",lightgreen:"#90ee90",lightpink:"#ffb6c1",lightsalmon:"#ffa07a",lightseagreen:"#20b2aa",lightskyblue:"#87cefa",lightslategray:"#778899",
lightsteelblue:"#b0c4de",lightyellow:"#ffffe0",lime:"#00ff00",limegreen:"#32cd32",linen:"#faf0e6",magenta:"#ff00ff",maroon:"#800000",mediumaquamarine:"#66cdaa",mediumblue:"#0000cd",mediumorchid:"#ba55d3",mediumpurple:"#9370d8",mediumseagreen:"#3cb371",mediumslateblue:"#7b68ee",mediumspringgreen:"#00fa9a",mediumturquoise:"#48d1cc",mediumvioletred:"#c71585",midnightblue:"#191970",mintcream:"#f5fffa",mistyrose:"#ffe4e1",moccasin:"#ffe4b5",navajowhite:"#ffdead",navy:"#000080",oldlace:"#fdf5e6",olive:"#808000",
olivedrab:"#6b8e23",orange:"#ffa500",orangered:"#ff4500",orchid:"#da70d6",palegoldenrod:"#eee8aa",palegreen:"#98fb98",paleturquoise:"#afeeee",palevioletred:"#d87093",papayawhip:"#ffefd5",peachpuff:"#ffdab9",peru:"#cd853f",pink:"#ffc0cb",plum:"#dda0dd",powderblue:"#b0e0e6",purple:"#800080",rebeccapurple:"#663399",red:"#ff0000",rosybrown:"#bc8f8f",royalblue:"#4169e1",saddlebrown:"#8b4513",salmon:"#fa8072",sandybrown:"#f4a460",seagreen:"#2e8b57",seashell:"#fff5ee",sienna:"#a0522d",silver:"#c0c0c0",skyblue:"#87ceeb",
slateblue:"#6a5acd",slategray:"#708090",snow:"#fffafa",springgreen:"#00ff7f",steelblue:"#4682b4",tan:"#d2b48c",teal:"#008080",thistle:"#d8bfd8",tomato:"#ff6347",turquoise:"#40e0d0",violet:"#ee82ee",wheat:"#f5deb3",white:"#ffffff",whitesmoke:"#f5f5f5",yellow:"#ffff00",yellowgreen:"#9acd32"},ib=0,qb=129,lb=1,S=128,rb={},kb=(rb[cb]=[16,16,14],rb[2]=[2,2,28,28],rb),eb=[[],[32,32],[32,32],[96,128]],nb={A:[30,8,79,8,67,19,37,19],B:[83,10,77,52,67,46,70,22],C:[77,59,71,100,61,89,64,64],D:[28,91,58,91,69,
104,15,104],E:[18,59,28,64,25,88,12,100],F:[24,10,34,21,31,47,18,52],G:[24,56,34,50,60,50,71,56,61,61,33,61],P:[80,102,8]},mb={" ":[],0:"ABCDEF".split(""),1:["B","C"],2:["A","B","D","E","G"],3:["A","B","C","D","G"],4:["B","C","F","G"],5:["A","C","D","F","G"],6:"ACDEFG".split(""),7:["A","B","C"],8:"ABCDEFG".split(""),9:"ABCDFG".split(""),"-":["G"],E:["A","D","E","F","G"],".":["P"]},ab=1.11;
function sb(a,b,c){x.call(this,a,b,tb,c);this.data=c.values;this.h=this.data.length-1;if(this.O[Ca]){var d=this;c=Math.log2(this.data.length)/2;this.f=Math.pow(2,Math.ceil(c));this.g=Math.pow(2,Math.floor(c));this.a=new $a(a,b+"LEDs",{"class":"LED",bindings:{container:Ba(this)},type:cb,cols:this.f,rows:this.g,color:D(this,"colorROM","green"),backgroundColor:D(this,"backgroundColorROM","black"),persistent:!0}),hb(this.a);this.j=new J(a,b+"Input",{"class":"Input",location:[0,0,this.a.T,this.a.M,this.f,
this.g],bindings:{surface:Ba(this)}});this.l=Da(this);Ua(this.j,function(a,b){if(d.b){var c=d.l;0<=a&&0<=b&&(a=b*d.f+a,c=ub(d.b,d.data[a],a));H(d,Ea,c)}})}}r(sb,x);function vb(a,b,c){a.a&&!c&&pb(a.a,b%a.f,b/a.f|0,1,S);return a.data[b]}function wb(a,b){(b=b.shift())&&a.a&&a.a.b.length==b.length&&(a.a.b=b,R(a.a,!0))}function xb(a,b){a.a&&b.push(a.a.b)}var Ca="array",Ea="cellDesc",tb=1.11;
function T(a,b,c){x.call(this,a,b,yb,c);this.aa=D(this,"cyclesMinimum",1E5);this.ja=D(this,"cyclesMaximum",3E6);this.U=C(D(this,"cyclesPerSecond",65E4),this.aa,this.ja);this.H=C(D(this,"yieldsPerSecond",zb),30,120);this.ka=C(D(this,"yieldsPerUpdate",Ab),1,this.H);this.Y=D(this,"requestAnimationFrame",!0);this.ha=this.ia=this.R=1;this.V=this.U/1E4/100;this.h=this.s=this.V*this.R;this.v=0;this.T=Math.round(1E3/this.H);this.W=[];this.S=[];this.b=[];this.X=[];this.a=this.Z=this.m=!1;this.w=this.g=0;this.ma=
this.ya.bind(this);this.la=this.da.bind(this);this.ba=(window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.setTimeout).bind(window);var d=this;Pa(this,"timerYield",function(){d.Z=!0;var a=d.v,b=Bb(d);b>=d.H?d.v++:d.v+=Math.ceil(d.H/b);d.v>=d.ka&&a<d.ka&&U(d);d.v>=d.H&&(d.v=0)},this.T);this.M=this.L=this.l=0;Cb(this)||Db(this,this.ha)}r(T,x);function gb(a,b){a.W.push(b)}
T.prototype.fa=function(a,b){var c=this;switch(a){case Eb:b.onclick=function(){c.a?V(c):c.start()};break;case Fb:b.onclick=function(){Gb(c)};break;case Hb:b.addEventListener("mousedown",function(){c.m=!0}),b.addEventListener("mouseup",function(){Cb(c);c.m=!1}),b.addEventListener("mousemove",function(){c.m&&Cb(c)}),b.addEventListener("change",function(){c.m=!0;Cb(c);c.m=!1})}x.prototype.fa.call(this,a,b)};
function Pa(a,b,c,d){d=void 0===d?-1:d;var e=a.b.length+1;a.b.push({id:b,wa:c,oa:d,$:-1});0<=d&&M(a,e,d);return e}T.prototype.da=function(){for(var a=0;a<this.W.length;a++)this.W[a]();this.a&&this.Y&&this.ba(this.la)};function Ib(a){var b=a.h/a.V;if(!b||b>a.R)b=a.R;a.pa=a.U/a.H*b;a.ia=b}function Jb(a,b,c){a.L=a.l=b;if(!a.S.length)return a.l=0,a.L;for(var d=0;0<a.l;)d<a.S.length?b=a.S[d++](c?0:b)||1:d=b=0,a.l-=b;return a.L-a.l}function Kb(a,b){var c=Date.now();b()&&(a.J+=Date.now()-c)}
function Lb(a,b){b=void 0===b?a.L-a.l:b;a.L=a.l=0;a.N+=b;a.M+=b;a.a||(a.M=0);return b}function Bb(a,b){return Math.ceil(a.U*a.ia/1E3*(void 0===b?1E3:b))}function Mb(a){1<=a?a=a.toFixed(2)+"Mhz":(a=Math.round(1E6*a),a=999>=a?a+"Hz":Math.ceil(a/1E3)+"Khz");return a}function Gb(a,b){a.a?A(a,"already running"):a.g?V(a):Nb(a,b)}
T.prototype.ya=function(){this.w=0;if(this.a){Ib(this);this.J=this.N=0;this.u=Date.now();this.f||(this.f=this.u);if(this.j){var a=this.u-this.j;a>this.T&&(this.f+=a,this.f>this.u&&(this.f=this.u))}try{this.Z=!1;do{for(var b=Bb(this,this.T),c=this.b.length;0<c;c--){var d=this.b[c-1];!(0>d.$)&&b>d.$&&(b=d.$)}Ob(this,Lb(this,Jb(this,b)))}while(this.a&&!this.Z)}catch(e){A(this,e.message);V(this);return}if(this.a){a=setTimeout;b=this.ma;this.j=Date.now();this.J&&(this.f+=this.J,this.u+=this.J);c=this.T;
this.N&&(c=Math.round(c*this.N/this.pa));c-=this.j-this.u;if(d=this.j-this.f)this.h=this.M/(10*d)/100;0>c?(-1E3>c&&(this.f-=c),c=0):this.h<this.s&&(c=0);this.j+=c;F&&0<=F.indexOf("time")&&this.ga("after running %d cycles, resting for %dms\n",this.N,c);this.w=a(b,c);this.Y||this.da()}}};function Cb(a){var b=a.O[Hb];return b?(Db(a,Math.floor((b.value-b.min)/(b.max-b.min)*(a.ja-a.aa)+a.aa)/a.U),!0):!1}
function Db(a,b){void 0!==b&&(!a.m&&0<a.h&&a.h<.9*a.s&&(b=a.ha),a.R=b,b=a.V*a.R,a.s!=b&&(a.s=b,H(a,Pb,Mb(a.s))),a.h=a.s);a.M=0;a.f=a.j=0;Ib(a);for(b=a.b.length;0<b;b--){var c=a.b[b-1];0<=c.oa&&M(a,b,c.oa,!0)}}function M(a,b,c,d){0<b&&b<=a.b.length&&(b=a.b[b-1],d||0>b.$)&&(c=Bb(a,c),a.a&&(c+=Lb(a)),b.$=c)}T.prototype.start=function(){if(this.a||this.g)return!1;this.w&&(clearTimeout(this.w),this.w=0);this.a=!0;this.f=this.j=0;U(this,!0);this.w=setTimeout(this.ma,0);this.Y&&this.ba(this.la);return!0};
function Nb(a,b){b=void 0===b?1:b;a.a||(b&&!a.g&&(a.g=b),a.g&&(a.g--,Ob(a,Lb(a,Jb(a,1,!0))),U(a),a.g&&setTimeout(function(){Nb(a,0)},0)))}function V(a){return a.g?(a.g=0,U(a,!0),!0):a.a?(a.a=!1,Lb(a),U(a,!0),!0):!1}function U(a,b){b&&(a.a?A(a,"starting (target speed: "+Mb(a.s)+")"):A(a,"stopping"));H(a,Eb,a.a?"Halt":"Run");H(a,Fb,a.g?"Stop":"Step");a.m||H(a,Pb,a.a&&a.h?Mb(a.h):"Stopped");for(var c=0;c<a.X.length;c++)a.X[c](b)}
function Ob(a,b){for(var c=a.b.length;0<c;c--){var d=a.b[c-1];0>d.$||(d.$-=b,0>=d.$&&(d.$=-1,d.wa(),0<=d.oa&&M(a,c,d.oa)))}}var Eb="run",Pb="speed",Fb="step",Hb="throttle",zb=120,Ab=60,yb=1.11;function W(a,b,c){x.call(this,a.I,b,a.version);this.b=a;this.name=b;this.c=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];if(!c){b=[];c="reg"+this.name;b.push(c);a.Z[c]=[this,-1];for(var d=0;d<this.c.length;d++)c=this.ca("reg%s-%02d",this.name,d),b.push(c),a.Z[c]=[this,d];sa(a,b)}}r(W,x);q=W.prototype;
q.add=function(a,b,c,d){for(var e=0,f=c[0],g=c[1];f<=g;f++)this.c[f]=a.c[f]+b.c[f]+e,e=0,this.c[f]>=d&&(this.c[f]-=d,e=1);e&&(this.b.l=!0);X(this,c)};q.get=function(){return this.c};function Qb(a,b,c){c=void 0===c?[0,15]:c;for(var d=0;d<a.c.length;d++)a.c[d]=0;d=c[0];for(c=c[1];d<=c;d++)a.c[d]=b&15,b>>>=4;return a}q.move=function(a,b){for(var c=b[0],d=b[1];c<=d;c++)this.c[c]=a.c[c];X(a,b)};q.set=function(a){if(a&&a.length==this.c.length)for(var b=0;b<this.c.length;b++)this.c[b]=a[b]};
q.store=function(a){for(var b=0,c=this.c.length;b<c;b++)this.c[b]=a.c[b]};q.sub=function(a,b,c,d){for(var e=0,f=c[0],g=c[1];f<=g;f++)this.c[f]=a.c[f]-b.c[f]-e,e=0,0>this.c[f]&&(this.c[f]+=d,e=1);e&&(this.b.l=!0);X(this,c)};q.toString=function(a){a=void 0===a?!1:a;var b=this.na+"\x3d";a&&3>b.length&&(b+=" ");for(var c=this.c.length-1;0<=c;c--)b=a?b+I[this.c[c]]:b+(Ka[this.c[c]]+(c%4?"":" "));return b};function X(a,b){a.b.j=a.c[b[0]];b[0]<b[1]&&(a.b.j|=a.c[b[0]+1]<<4)}
function Rb(a,b,c){x.call(this,a,b,Sb,c);this.type=Number.parseInt(D(this,"type","1501").slice(-4),10);this.Z={};this.a=Array(4);for(a=0;4>a;a++)this.a[a]=new W(this,String.fromCharCode(65+a));this.H=this.a[0];this.M=this.a[1];this.ba=this.a[2];this.da=this.a[3];this.v=Array(8);for(a=0;8>a;a++)this.v[a]=new W(this,"X"+a);this.J=Array(8);for(a=0;8>a;a++)this.J[a]=new W(this,"Y"+a);this.V=new W(this,"Supp",!0);this.R=new W(this,"Temp",!0);this.s=10;this.l=!1;this.N=this.b=this.j=this.m=0;this.h=[-1,
-1,-1];this.u=0;this.aa=ya(this,this.K.input);this.aa.L=this.sa.bind(this);a=this.aa;b=this.ta.bind(this);a.f=this.ea.bind(this);a.M=b;this.g=ya(this,this.K.output);if(this.f=B(this,Tb))this.f.b=this;(this.time=B(this,K))&&this.f&&(this.time.S.push(this.xa.bind(this)),this.time.X.push(this.ua.bind(this)));this.X=this.Y=this.L=void 0;this.W=this.T=-1;this.w={};this.S="";this.U=Ub;a=this.za.bind(this);b=xa;z[this.I]||(z[this.I]={});z[this.I][b]||(z[this.I][b]=[]);z[this.I][b].push(a)}r(Rb,x);
function Vb(a,b){a.w[b]&&(a.w[b]=!1,A(a,"break on "+Wb[b]),V(a.time))}function Xb(a){a.g&&hb(a.g);if(a.f){var b=a.f;b.a&&hb(b.a)}Yb(a,!1)}q=Rb.prototype;q.xa=function(a){a=void 0===a?0:a;for(this.u=0;this.u<=a;){if(this.W==this.b){this.W=-1;A(this,"break");V(this.time);break}var b=vb(this.f,this.b),c=this.b;this.b=c+1&this.f.h;if(void 0==b||!Zb(this,b,c)){this.b=c;A(this,"unimplemented opcode");V(this.time);break}this.u+=$b}if(0>=a){var d=this;Kb(this.time,function(){var a=d.f;a.a&&R(a.a);A(d,d.toString())})}return this.u};
function Zb(a,b,c){if(b&4096)return b&2048?!!(b&1024)==a.l&&(a.b=c&1024|b&1023):(a.push(a.b),a.b=b&2047),a.l=!1,!0;var d;c=b&ac;switch(c){case bc:case cc:case dc:case ec:case fc:case gc:case hc:case ic:case jc:case kc:case lc:case mc:c=nc[c];var e=(b&oc)>>pc;var f=(b&qc)>>rc;var g=(b&sc)>>tc;var l=(d=b&uc)?vc:wc;switch(f){case 0:case 1:case 2:case 3:var h=a.a[f];break;case 4:h=Qb(a.R,1,c);break;case 5:l=d?xc:yc;break;case 6:h=Qb(a.R,a.j&15,c);break;case 7:h=Qb(a.R,a.j&255,c)}switch(g){case 0:var m=
a.a[e];break;case 1:m=4>f?a.a[f]:void 0;break;case 2:m=5>f?a.V:5==f?a.a[e]:void 0;break;case 3:if(d)a.a[e].move(h,c);else{a=a.H;e=h;b=c[0];for(h=c[1];b<=h;b++)m=a.c[b],a.c[b]=e.c[b],e.c[b]=m;X(e,c)}return!0}if(!m)break;b=b>=ic?16:a.s;switch(l){case wc:m.add(a.a[e],h,c,b);break;case vc:m.sub(a.a[e],h,c,b);break;case yc:b=m;a=a.a[e];e=c[1];for(h=c[0];e>h;e--)b.c[e]=a.c[e-1];b.c[e]=0;X(b,c);break;case xc:b=m;a=a.a[e];e=c[0];for(h=c[1];e<h;e++)b.c[e]=a.c[e+1];b.c[e]=0;X(b,c)}return!0;case zc:e=(b&Ac)>>
Bc;c=(b&Cc)>>Dc;h=1<<((b&Ec)>>Fc);if(!c)break;c+=12;switch(b&Gc){case Hc:a.a[e].c[c]|=h;break;case Ic:a.a[e].c[c]&=~h;break;case Jc:a.a[e].c[c]&h&&(a.l=!0);break;case Kc:a.a[e].c[c]^=h}return!0;case Lc:switch(b&Mc){case Nc:a.H.store(a.J[a.m]);break;case Oc:a.m=b>>4&7;break;case Pc:a.b=a.j;break;case Qc:a.l=!1;c=a.h[0];e=0;for(b=a.h.length-1;e<b;)a.h[e]=a.h[++e];a.h[e]=-1;a.b=c;break;case Rc:a.v[a.m].store(a.H);break;case Sc:a.H.store(a.v[a.m]);break;case Tc:a.J[a.m].store(a.H);break;case Uc:Vb(a,
"o");if(a.g){c=0;for(e=11;0<=e;c++,e--)b=void 0,a.M.c[e]&8?b=" ":a.M.c[e]&1?b="-":b=I[a.H.c[e]],pb(a.g,c,0,b,a.M.c[e]&2?lb:0)&&Vb(a,"om");Yb(a)}a.u+=31*$b;a.N&&(a.j=a.N,a.l=!0,Vb(a,"i"));break;case Vc:a.s=10;break;case Wc:a.s=16;break;case Xc:a.m=a.j&7;break;default:return!1}return!0}return!1}
function ub(a,b,c,d){var e="???",f="";if(b&4096)b&2048?(e="BR",e=b&1024?e+"C":e+"NC",f=c&1024|b&1023):(e="CALL",f=b&2047),f=a.ca("0x%04x",f);else if(0<=b){var g=b&ac;switch(g){case bc:case cc:case dc:case ec:case fc:case gc:case hc:case ic:case jc:case kc:case lc:case mc:f="";e=nc[g];for(g=0;16>g;g++)g%4||(f=" "+f),f=(e?g>=e[0]&&g<=e[1]?"F":"0":"?")+f;g=(b&oc)>>pc;var l=(b&qc)>>rc,h=(b&sc)>>tc,m=b&uc;e="LOAD";var n="?",k="?";var p=m?5==l?"\x3e\x3e":"-":5==l?"\x3c\x3c":"+";switch(h){case 0:n=Y[g];
break;case 1:4>l&&(n=Y[l]);break;case 2:6>l&&(n="NUL");break;case 3:m?(e="MOVE",n=Y[g],k=Y[l]):(e="XCHG",g||(n="A"),4>l&&(k=Y[l])),l=-1}switch(l){case 0:case 1:case 2:case 3:k=Y[g]+p+Y[l];break;case 4:case 5:k=Y[g]+p+"1";break;case 6:k=Y[g]+p+"R5L";break;case 7:k=Y[g]+p+"R5"}f=n+","+k+","+f;break;case zc:switch(b&Gc){case Hc:e="SET";break;case Ic:e="CLR";break;case Jc:e="TST";break;case Kc:e="NOT"}f=a.a[(b&Ac)>>Bc].name;g=(b&Cc)>>Dc;f+="["+(g?g+12:"?")+":"+((b&Ec)>>Fc)+"]";break;case Lc:switch(b&
Mc){case Nc:e="STORE";f="A,Y[RAB]";break;case Oc:e="STORE";f="RAB,"+((b&112)>>4);break;case Pc:e="BR";f="R5";break;case Qc:e="RET";break;case Rc:e="STORE";f="X[RAB],A";break;case Sc:e="STORE";f="A,X[RAB]";break;case Tc:e="STORE";f="Y[RAB],A";break;case Uc:e="DISP";break;case Vc:e="BCDS";break;case Wc:e="BCDR";break;case Xc:e="STORE",f="RAB,R5L"}}}return a.ca((void 0===d?0:d)?"%03X %04X\n":"0x%04x: 0x%04x  %-8s%s\n",c,b,e,f)}
function Yc(a,b){if(b){var c=b.stateChip||b[0];if(c&&c.length){var d=c.shift();if((d|0)!==(Sb|0))a.ga("Saved state version mismatch: %3.2f\n",d);else{try{a.a.forEach(function(a){return a.set(c.shift())}),a.v.forEach(function(a){return a.set(c.shift())}),a.J.forEach(function(a){return a.set(c.shift())}),a.V.set(c.shift()),a.R.set(c.shift()),a.s=c.shift(),a.l=c.shift(),a.m=c.shift(),a.j=c.shift(),a.b=c.shift(),a.h=c.shift(),a.N=c.shift()}catch(e){A(a,"Chip state error: "+e.message);return}(b=b.stateROM||
b[1])&&a.f&&wb(a.f,b)}}else A(a,"Invalid saved state")}}
q.za=function(a){var b="";""==a&&(a=this.S);this.S="";this.U=Ub;a=a.trim();var c=a.split(" "),d=c[0],e=Number.parseInt(c[1],16);isNaN(e)&&(e=-1);var f=Number.parseInt(c[2],10)||8;switch(d[0]){case "b":a=d.substr(1);if("l"==a){for(a in Wb)e=Wb[a],b+="break on "+e+" (b"+a+"): "+(this.w[a]||!1)+"\n";break}(e=Wb[a])?(this.w[a]=!this.w[a],b="break on "+e+" (b"+a+"): "+this.w[a]):a&&(b="unrecognized break option '"+a+"'");break;case "g":this.time.start()?this.W=e:b="already started";break;case "h":V(this.time)||
(b="already stopped");break;case "t":"c"==d[1]&&(this.U=Zc);f=Number.parseInt(c[1],10)||1;Gb(this.time,f);this.S=a;break;case "r":"c"==d[1]&&(this.U=Zc);$c(this,d.substr(1),e);b+=this.toString(d[1]);this.S=a;break;case "u":for(e=0<=e?e:0<=this.T?this.T:this.b;f--;){c=this.f&&vb(this.f,e,!0);if(void 0==c)break;b+=ub(this,c,e++)}this.T=e;this.S=a;break;case "?":b="available commands:";ad.forEach(function(a){b+="\n"+a});break;default:a&&(b="unrecognized command '"+a+"' (try '?')")}b&&A(this,b.trim());
return!0};q.sa=function(a,b){var c=0;0<=a&&0<=b&&(c=b|a+1<<4);this.N=c};q.ea=function(a){void 0==a&&(a=!this.time.a)&&(this.b=0);a?this.time.start():(V(this.time),Xb(this))};q.ta=function(){A(this,"reset");this.b=0;Xb(this);this.time.a||this.status()};q.qa=function(){var a=null;if(Fa(this)){var b;if(window)try{(b=window.localStorage.getItem(this.I))&&(a=JSON.parse(b))}catch(c){A(this,c.message)}}Yc(this,a)};
q.ra=function(){var a=bd(this);if(Fa(this)){a=JSON.stringify(a);try{window.localStorage.setItem(this.I,a)}catch(b){A(this,b.message)}}};q.push=function(a){for(var b=this.h.length-1;0<b;)this.h[b]=this.h[--b];this.h[0]=a};
function bd(a){var b=[[],[]],c=b[0],d=b[1];c.push(Sb);a.a.forEach(function(a){return c.push(a.get())});a.v.forEach(function(a){return c.push(a.get())});a.J.forEach(function(a){return c.push(a.get())});c.push(a.V.get());c.push(a.R.get());c.push(a.s);c.push(a.l);c.push(a.m);c.push(a.j);c.push(a.b);c.push(a.h);c.push(a.N);a.f&&xb(a.f,d);return b}function $c(a,b,c){if(b&&!(0>c))switch(b){case "pc":a.b=c;break;default:A(a,"unrecognized register: "+b)}}q.status=function(){A(this,this.toString())};
q.toString=function(a,b){var c=this;a=void 0===a?"":a;b=void 0===b?null:b;var d="";if(this.U){this.f&&(d+=ub(this,vb(this.f,this.b,!0),this.b,!0));d+="  ";b=0;for(a=this.a.length;b<a;b++)d+=this.a[b].toString()+" ";d+="\n ";d+=" COND\x3d"+(this.l?1:0);d+=" BASE\x3d"+this.s;d+=" R5\x3d"+this.ca("%02X",this.j);d+=" RAB\x3d"+this.m+" ST\x3d";this.h.forEach(function(a){d+=c.ca("%03X ",0>a?0:a&4095)});return d.trim()}if(b){var e=0;for(a=b.length>>1;e<a;e++)d+=b[e].toString(!0)+"  "+b[e+a].toString(!0)+
"\n";return d}d+=this.toString(a,this.a);0<=a.indexOf("a")&&(d+=this.toString(a,this.v),d+=this.toString(a,this.J));d+="COND\x3d"+(this.l?1:0);d+=" BASE\x3d"+this.s;d+=" R5\x3d"+this.ca("0x%02x",this.j);d+=" RAB\x3d"+this.m+" ";this.h.forEach(function(a,b){d+=c.ca("ST%d\x3d0x%04x ",b,a&65535)});this.f&&(d+="\n"+ub(this,vb(this.f,this.b,!0),this.b));this.T=this.b;return d.trim()};
function Yb(a,b){b=void 0===b?!0:b;var c,d=b&&(a.type==cd?!!(a.ba.c[14]&8):!!(a.M.c[15]&4));if(a.X!==d){if(c=a.O["2nd"])c.style.opacity=d?"1":"0",void 0===a.X&&a.g&&(c.style.color=a.g.color);a.X=d}d=b&&(a.type==cd?!!(a.M.c[15]&4):!!(a.da.c[15]&8));if(a.Y!==d){if(c=a.O.INV)c.style.opacity=d?"1":"0",void 0===a.Y&&a.g&&(c.style.color=a.g.color);a.Y=d}c=a.type==cd?a.v[4].c[15]>>2:a.ba.c[15];b=b?c?1==c?dd:ed:fd:gd;if(a.L!==b){if(c=a.O.Deg)c.style.opacity=b==fd?"1":"0",void 0===a.L&&a.g&&(c.style.color=
a.g.color);if(c=a.O.Rad)c.style.opacity=b==dd?"1":"0",void 0===a.L&&a.g&&(c.style.color=a.g.color);if(c=a.O.Grad)c.style.opacity=b==ed?"1":"0",void 0===a.L&&a.g&&(c.style.color=a.g.color);a.L=b}}q.ua=function(a){for(var b in this.O){var c=this.Z[b];if(c){var d=c[0];c=c[1];H(this,b,0>c?d.toString():I[d.c[c]])}}a&&!this.time.a&&(a=this.f,a.a&&R(a.a),A(this,this.toString()))};
var ac=3840,bc=0,cc=256,dc=512,ec=768,fc=1024,gc=1280,hc=1792,ic=2048,jc=2304,kc=2560,zc=3072,lc=3328,Lc=3584,mc=3840,oc=192,pc=6,qc=56,rc=3,sc=6,tc=1,uc=1,Gc=3,Hc=0,Ic=1,Jc=2,Kc=3,Ac=192,Bc=6,Cc=48,Dc=4,Ec=12,Fc=2,Mc=15,Nc=0,Oc=1,Pc=2,Qc=3,Rc=4,Sc=5,Tc=6,Uc=7,Vc=8,Wc=9,Xc=10,Z={},nc=(Z[bc]=[12,12],Z[cc]=[0,15],Z[dc]=[2,12],Z[ec]=[0,12],Z[fc]=[2,2],Z[gc]=[0,1],Z[hc]=[0,13],Z[ic]=[14,14],Z[jc]=[13,15],Z[kc]=[14,15],Z[lc]=[13,13],Z[mc]=[15,15],Z),$b=128,wc=0,vc=1,yc=2,xc=3,cd=1501,gd=0,fd=1,dd=2,ed=
3,Wb={i:"input",o:"output",om:"output modification"},Ub=0,Zc=1,Y="A B C D 1 ? R5L R5".split(" "),ad="b[c]\t\tbreak on condition c;bl\t\tlist break conditions;g [addr]\trun (to addr);h\t\thalt;r[a]\t\tdump (all) registers;t [n]\t\tstep (n instructions);u [addr] [n]\tdisassemble (at addr)".split(";"),Sb=1.11;pa="TMS1500";
function hd(a,b){x.call(this,a,a,id);try{this.K=JSON.parse(b);var c=this.K[a];qa(this,c);ra(this,c);sa(this,c.bindings);this.a=!1!==c.autoPower}catch(g){c=g.message;var d=c.match(/position ([0-9]+)/);d&&(c+=" ('"+b.substr(+d[1],40).replace(/\s+/g," ")+"...')");A(this,"machine '"+a+"' initialization error: "+c)}var e=this,f=null;window.addEventListener("load",function(){for(var a,b,c,d,n=0;n<jd.length;n++)for(a in e.K)try{var k=e.K[a],p="";b=k["class"];if(b==jd[n]){switch(b){case kd:d=c=new Rb(e.I,
a,k);break;case ld:c=new J(e.I,a,k);break;case md:c=new $a(e.I,a,k);break;case Tb:c=new sb(e.I,a,k);c.K.revision&&(p="revision "+c.K.revision);break;case K:c=new T(e.I,a,k);break;case nd:e.ga("PCjs %s v%3.2f\n",k.name,id);A(e,od);A(e,pd);continue;default:A(e,"unrecognized device class: "+b);continue}A(e,b+" device initialized"+(p?" ("+p+")":""))}}catch(P){A(e,"error initializing "+b+" device '"+a+"':\n"+P.message);p=void 0;var w=a,u=y[e.I];if(u)for(p in u)if(u[p].na==w){u.splice(p,1);break}}if(f=
d)f.qa&&f.qa(),f.ea&&e.a&&f.ea(!0)});window.addEventListener((Ha("iOS")?"pagehide":Ha("Opera")?"unload":void 0)||"beforeunload",function(){f&&(f.ra&&f.ra(),f.ea&&f.ea(!1))})}r(hd,x);var kd="Chip",ld="Input",md="LED",nd="Machine",Tb="ROM",K="Time",jd=[nd,K,md,ld,Tb,kd],od="Copyright \u00a9 2012-2017 Jeff Parsons \x3cJeff@pcjs.org\x3e",pd="License: GPL version 3 or later \x3chttp://gnu.org/licenses/gpl.html\x3e",id=1.11;window[pa]=hd;})()
//# sourceMappingURL=ti42.js.map
