/*!
 * CookieConsent by Brendigo - administrator visual configurator.
 * No storage, analytics, external calls or WordPress frontend side effects.
 */
(function (doc) {
  'use strict';
  function boot() {
    var preview=doc.getElementById('bcc-admin-preview');
    if(!preview)return;
    var fields={
      position:doc.getElementById('bcc-position'),
      style:doc.getElementById('bcc-style'),
      language:doc.getElementById('bcc-language'),
      direction:doc.getElementById('bcc-direction'),
      accent:doc.getElementById('bcc-color'),
      surface:doc.getElementById('bcc-surface'),
      text:doc.getElementById('bcc-text'),
      width:doc.getElementById('bcc-width'),
      mobileWidth:doc.getElementById('bcc-mobile-width'),
      padding:doc.getElementById('bcc-padding'),
      radius:doc.getElementById('bcc-radius'),
      offset:doc.getElementById('bcc-offset'),
      headingSize:doc.getElementById('bcc-heading-size'),
      bodySize:doc.getElementById('bcc-body-size'),
      buttonHeight:doc.getElementById('bcc-button-height'),
      buttonRadius:doc.getElementById('bcc-button-radius')
    };
    var text={
      hr:['Vaša privatnost, vaš izbor','Ostale tehnologije koristimo samo uz privolu.','Odbij sve','Postavke','Prihvati sve'],
      en:['Your privacy. Your choice.','Optional technologies require your consent.','Reject all','Customize','Accept all'],
      de:['Ihre Privatsphäre. Ihre Wahl.','Optionale Technologien benötigen Ihre Einwilligung.','Alle ablehnen','Einstellungen','Alle akzeptieren'],
      it:['La tua privacy. La tua scelta.','Le tecnologie facoltative richiedono il tuo consenso.','Rifiuta tutti','Personalizza','Accetta tutti'],
      ar:['خصوصيتك، اختيارك','التقنيات الاختيارية تتطلب موافقتك.','رفض الكل','تخصيص','قبول الكل'],
      es:['Tu privacidad, tu elección','Las tecnologías opcionales requieren tu consentimiento.','Rechazar todo','Personalizar','Aceptar todo'],
      fr:['Votre vie privée, votre choix','Les technologies facultatives nécessitent votre consentement.','Tout refuser','Personnaliser','Tout accepter']
    };
    var output=[
      doc.getElementById('bcc-preview-heading'), doc.getElementById('bcc-preview-intro'),
      doc.getElementById('bcc-preview-reject'), doc.getElementById('bcc-preview-settings'),
      doc.getElementById('bcc-preview-accept')
    ];
    function channel(v) { v/=255; return v<=0.04045?v/12.92:Math.pow((v+0.055)/1.055,2.4); }
    function luma(hex) {
      var c=[1,3,5].map(function(i){return channel(parseInt(hex.slice(i,i+2),16));});
      return c[0]*0.2126+c[1]*0.7152+c[2]*0.0722;
    }
    function contrast(a,b){var x=luma(a),y=luma(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
    function readable(wanted,bg) {
      if(contrast(wanted,bg)>=4.5)return wanted;
      return contrast('#ffffff',bg)>=4.5?'#ffffff':'#000000';
    }
    function update(){
      var position=fields.position.value,style=fields.style.value;
      var language=fields.language.value==='auto'?'en':fields.language.value;
      var direction=fields.direction.value==='auto'?(language==='ar'?'rtl':'ltr'):fields.direction.value;
      var accent=fields.accent.value,surface=fields.surface.value,body=fields.text.value;
      preview.dataset.position=position;
      preview.dataset.style=style;
      preview.dir=direction;
      preview.style.setProperty('--bcc-demo-accent',accent);
      preview.style.setProperty('--bcc-demo-button-text',readable('#ffffff',accent));
      preview.style.setProperty('--bcc-demo-surface',surface);
      preview.style.setProperty('--bcc-demo-foreground',readable(body,surface));
      function setting(key) { return Number(fields[key] && fields[key].value); }
      function optional(key, auto, cssKey, transform) {
        var value=setting(key);
        var enabled=Number.isInteger(value) && value!==auto;
        preview.dataset[key.replace(/[A-Z]/g,function(c){return '-'+c.toLowerCase();})]=enabled?'1':'0';
        if(enabled)preview.style.setProperty(cssKey,transform(value));
        else preview.style.removeProperty(cssKey);
      }
      optional('width',0,'--bcc-demo-width',function(v){return Math.round(v*.57)+'px';});
      optional('padding',0,'--bcc-demo-padding',function(v){return Math.max(6,Math.round(v*.55))+'px';});
      optional('radius',-1,'--bcc-demo-radius',function(v){return Math.round(v*.55)+'px';});
      optional('offset',0,'--bcc-demo-offset',function(v){return Math.round(v*.55)+'px';});
      optional('headingSize',0,'--bcc-demo-heading-size',function(v){return Math.round(v*.75)+'px';});
      optional('bodySize',0,'--bcc-demo-body-size',function(v){return Math.round(v*.8)+'px';});
      optional('buttonHeight',0,'--bcc-demo-button-height',function(v){return Math.round(v*.7)+'px';});
      optional('buttonRadius',-1,'--bcc-demo-button-radius',function(v){return Math.round(v*.55)+'px';});
      preview.dataset.mobileWidth=fields.mobileWidth.value;
      var values=(text[language]||text.en).slice();
      var overrides={};
      try {
        var editor=doc.getElementById('bcc-translations');
        overrides=JSON.parse(editor && editor.value || '{}');
      } catch (_) { overrides={}; }
      var selected=overrides && overrides[language];
      if(selected && typeof selected==='object' && !Array.isArray(selected)){
        ['heading','intro','reject','settings','accept'].forEach(function(key,i){
          if(typeof selected[key]==='string' && selected[key].trim())values[i]=selected[key];
        });
      }
      output.forEach(function(node,i){if(node)node.textContent=values[i];});
    }
    var translationSource=doc.getElementById('bcc-translations');
    if(translationSource)translationSource.addEventListener('input',update);
    Object.keys(fields).forEach(function(key){
      if(fields[key]){
        fields[key].addEventListener('change',update);
        fields[key].addEventListener('input',update);
      }
    });
    update();
  }
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot);
  else boot();
})(document);
