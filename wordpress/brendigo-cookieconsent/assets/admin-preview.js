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
      theme:doc.getElementById('bcc-theme'),
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
    // Presets only change design fields. Existing consent categories, stored
    // preferences, legal notices and service declarations remain untouched.
    var presets={
      balanced:{position:'bottom-center',style:'standard',accent:'#4357e8',surface:'#ffffff',
        text:'#17223e',width:0,mobileWidth:100,padding:0,radius:-1,offset:0,
        headingSize:0,bodySize:0,buttonHeight:0,buttonRadius:-1},
      floating:{position:'bottom-right',style:'compact',accent:'#2563eb',surface:'#ffffff',
        text:'#17223e',width:520,mobileWidth:96,padding:20,radius:22,offset:24,
        headingSize:20,bodySize:14,buttonHeight:48,buttonRadius:12},
      minimal:{position:'bottom-bar',style:'minimal',accent:'#173f93',surface:'#ffffff',
        text:'#18243b',width:0,mobileWidth:100,padding:20,radius:0,offset:12,
        headingSize:18,bodySize:14,buttonHeight:44,buttonRadius:4},
      dark:{position:'bottom-center',style:'standard',accent:'#8ea4ff',surface:'#171f34',
        text:'#f7f8ff',width:940,mobileWidth:100,padding:28,radius:20,offset:24,
        headingSize:22,bodySize:16,buttonHeight:48,buttonRadius:12}
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
      var theme=fields.theme.value;
      var accent=fields.accent.value;
      var surface=theme==='dark'?'#171f34':theme==='light'?'#ffffff':fields.surface.value;
      var body=theme==='dark'?'#f7f8ff':theme==='light'?'#17223e':fields.text.value;
      preview.dataset.position=position;
      preview.dataset.style=style;
      preview.dir=direction;
      preview.style.setProperty('--bcc-demo-accent',accent);
      preview.style.setProperty('--bcc-demo-button-text',readable('#ffffff',accent));
      preview.style.setProperty('--bcc-demo-surface',surface);
      preview.style.setProperty('--bcc-demo-foreground',readable(body,surface));
      var ratio=contrast(readable(body,surface),surface);
      var primary=contrast(readable('#ffffff',accent),accent);
      var status=doc.getElementById('bcc-preview-contrast');
      if(status)status.textContent='Kontrast teksta '+ratio.toFixed(1)+':1 · gumbi '+
        primary.toFixed(1)+':1 (minimalni WCAG AA cilj za običan tekst: 4.5:1).';
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
    doc.querySelectorAll('[data-bcc-design-preset]').forEach(function(button){
      button.addEventListener('click',function(){
        var choice=presets[button.getAttribute('data-bcc-design-preset')];
        if(!choice)return;
        Object.keys(choice).forEach(function(key){
          if(fields[key]) fields[key].value=String(choice[key]);
        });
        // The WP theme selector remains free for subsequent editing.
        var theme=doc.getElementById('bcc-theme');
        if(theme)theme.value=button.getAttribute('data-bcc-design-preset')==='dark'?'dark':'custom';
        update();
        var message=doc.getElementById('bcc-preset-message');
        if(message)message.textContent='Odabrani izgled je primijenjen. Spremite postavke za objavu.';
      });
    });
    doc.querySelectorAll('[data-bcc-preview-device]').forEach(function(button){
      button.addEventListener('click',function(){
        var device=button.getAttribute('data-bcc-preview-device');
        if(['desktop','mobile','narrow'].indexOf(device)===-1)return;
        preview.dataset.device=device;
        doc.querySelectorAll('[data-bcc-preview-device]').forEach(function(item){
          var current=item===button;
          item.setAttribute('aria-pressed',String(current));
          if(item.classList){
            item.classList.toggle('button-primary',current);
          }
        });
      });
    });
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
