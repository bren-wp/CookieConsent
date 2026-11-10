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
      text:doc.getElementById('bcc-text')
    };
    var text={
      hr:['Vaša privatnost, vaš izbor','Ostale tehnologije koristimo samo uz privolu.','Odbij sve','Postavke','Prihvati sve'],
      en:['Your privacy. Your choice.','Optional technologies require your consent.','Reject all','Customize','Accept all'],
      de:['Ihre Privatsphäre. Ihre Wahl.','Optionale Technologien benötigen Ihre Einwilligung.','Alle ablehnen','Einstellungen','Alle akzeptieren'],
      it:['La tua privacy. La tua scelta.','Le tecnologie facoltative richiedono il tuo consenso.','Rifiuta tutti','Personalizza','Accetta tutti'],
      ar:['خصوصيتك، اختيارك','التقنيات الاختيارية تتطلب موافقتك.','رفض الكل','تخصيص','قبول الكل']
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
      var values=text[language]||text.en;
      output.forEach(function(node,i){if(node)node.textContent=values[i];});
    }
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
