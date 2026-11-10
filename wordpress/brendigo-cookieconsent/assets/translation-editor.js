/*!
 * CookieConsent by Brendigo - no dependency, no network.
 * Visual editor for per-language text overrides. JSON is validated again in PHP.
 */
(function (doc) {
  'use strict';
  function boot() {
    var raw=doc.getElementById('bcc-translations');
    var selector=doc.getElementById('bcc-translation-language');
    if(!raw || !selector)return;
    var keys=['heading','intro','accept','reject','settings'];
    var controls={};
    keys.forEach(function(key){controls[key]=doc.getElementById('bcc-tr-'+key);});
    function parse(){
      try {
        var value=JSON.parse(raw.value||'{}');
        return value && typeof value==='object' && !Array.isArray(value) ? value : {};
      }catch(_){return {};}
    }
    function show(){
      var data=parse(), values=data[selector.value]||{};
      keys.forEach(function(key){
        controls[key].value=typeof values[key]==='string' ? values[key] : '';
      });
    }
    function write(){
      var data=parse();
      var language=selector.value;
      if(!data[language] || typeof data[language]!=='object' ||
         Array.isArray(data[language]))data[language]={};
      keys.forEach(function(key){
        var value=controls[key].value.trim();
        if(value)data[language][key]=value;
        else delete data[language][key];
      });
      if(Object.keys(data[language]).length===0)delete data[language];
      raw.value=Object.keys(data).length?JSON.stringify(data,null,2):'';
      raw.dispatchEvent(new Event('input',{bubbles:true}));
    }
    selector.addEventListener('change',show);
    raw.addEventListener('change',show);
    keys.forEach(function(key){controls[key].addEventListener('input',write);});
    show();
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot);
  else boot();
})(document);
