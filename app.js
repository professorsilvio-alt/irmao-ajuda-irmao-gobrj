/* ============================================================
   IRMÃO AJUDA IRMÃO – GOBRJ | Main App JS
   Firebase Firestore + Authentication
   ============================================================ */

// ── Firebase Config ──────────────────────────────────────────
// ⚠️ Substitua abaixo com as credenciais do seu projeto Firebase
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAThoZDHZvS7ho-tDNQBMex_FpLik9TrCQ",
  authDomain: "irmao-ajuda-irmao-gobrj.firebaseapp.com",
  projectId: "irmao-ajuda-irmao-gobrj",
  storageBucket: "irmao-ajuda-irmao-gobrj.firebasestorage.app",
  messagingSenderId: "886063563030",
  appId: "1:886063563030:web:1ebdf367480620225bd037",
  measurementId: "G-29YPV99YFB"
};

// ── Firebase Init ─────────────────────────────────────────────
firebase.initializeApp(FIREBASE_CONFIG);
const db   = firebase.firestore();
const auth = firebase.auth();

const COLLECTION = 'propostas';

/* ── DB helpers (Firestore) ──────────────────────────────────── */
async function getDB() {
  try {
    const snap = await db.collection(COLLECTION).orderBy('createdAt', 'desc').get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (e) {
    console.error('Firestore read error:', e);
    return [];
  }
}

async function addRecord(record) {
  return await db.collection(COLLECTION).add({
    ...record,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    status: 'em análise'
  });
}

async function updateRecord(id, fields) {
  return await db.collection(COLLECTION).doc(id).update({
    ...fields,
    statusAtualizadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function deleteRecord(id) {
  return await db.collection(COLLECTION).doc(id).delete();
}

function formatDate(ts) {
  if (!ts) return '—';
  // Aceita Firestore Timestamp, Date ou string ISO
  const d = ts?.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

/* ── Particles ──────────────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  for (let i = 0; i < 45; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = Math.random() * 100 + '%';
    p.style.top  = Math.random() * 100 + '%';
    const size = (Math.random() * 3 + 1) + 'px';
    p.style.width  = size;
    p.style.height = size;
    p.style.animationDuration = (Math.random() * 20 + 10) + 's';
    p.style.animationDelay   = (Math.random() * 10) + 's';
    container.appendChild(p);
  }
})();

/* ── Smooth scroll ──────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const t = document.querySelector(a.getAttribute('href'));
    if (t) t.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ── Masks ──────────────────────────────────────────────────── */
function applyPhoneMask(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g,'').slice(0,11);
    if (v.length > 6) v = `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
    else if (v.length > 2) v = `(${v.slice(0,2)}) ${v.slice(2)}`;
    else if (v.length) v = `(${v}`;
    input.value = v;
  });
}
function applyCPFMask(input) {
  input.addEventListener('input', () => {
    let v = input.value.replace(/\D/g,'').slice(0,11);
    if (v.length > 9) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6,9)}-${v.slice(9)}`;
    else if (v.length > 6) v = `${v.slice(0,3)}.${v.slice(3,6)}.${v.slice(6)}`;
    else if (v.length > 3) v = `${v.slice(0,3)}.${v.slice(3)}`;
    input.value = v;
  });
}

const waEl  = document.getElementById('whatsapp');
const cpfEl = document.getElementById('cpf');
if (waEl)  applyPhoneMask(waEl);
if (cpfEl) applyCPFMask(cpfEl);

/* ── Multi-step Form ────────────────────────────────────────── */
const TOTAL_STEPS = 4;
let currentStep = 1;
let lastRecord = null;

function showStep(n) {
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const el  = document.getElementById(`form-step-${i}`);
    const dot = document.getElementById(`step-dot-${i}`);
    if (el)  el.classList.toggle('hidden', i !== n);
    if (dot) {
      dot.classList.remove('active','done');
      if (i < n) dot.classList.add('done');
      if (i === n) dot.classList.add('active');
    }
  }
  currentStep = n;
  const formEl = document.getElementById('formulario');
  if (formEl) formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ── Validation ─────────────────────────────────────────────── */
function setError(id, msg) {
  const el  = document.getElementById(id);
  const err = document.getElementById(`error-${id}`);
  if (el)  el.classList.toggle('invalid', !!msg);
  if (err) err.textContent = msg || '';
}
function clearErr(id) { setError(id, ''); }

function validateStep(step) {
  let ok = true;
  if (step === 1) {
    const nome = document.getElementById('nome');
    const cpf  = document.getElementById('cpf');
    const mail = document.getElementById('email');
    const wa   = document.getElementById('whatsapp');
    if (!nome?.value.trim())                                    { setError('nome', 'Informe seu nome completo.'); ok=false; } else clearErr('nome');
    if (!cpf?.value.trim() || cpf.value.replace(/\D/g,'').length < 11) { setError('cpf',  'Informe um CPF válido (11 dígitos).'); ok=false; } else clearErr('cpf');
    if (!mail?.value.trim() || !/\S+@\S+\.\S+/.test(mail.value)) { setError('email','Informe um e-mail válido.'); ok=false; } else clearErr('email');
    if (!wa?.value.trim()   || wa.value.replace(/\D/g,'').length < 10)  { setError('whatsapp','Informe um WhatsApp válido.'); ok=false; } else clearErr('whatsapp');
  }
  if (step === 2) {
    const rs   = document.getElementById('razao_social');
    const seg  = document.getElementById('segmento');
    const cid  = document.getElementById('cidade');
    const desc = document.getElementById('descricao_negocio');
    const rep  = document.getElementById('representante');
    if (!rs?.value.trim())                        { setError('razao_social','Informe a razão social.'); ok=false; } else clearErr('razao_social');
    if (!seg?.value)                              { setError('segmento','Selecione um segmento.'); ok=false; } else clearErr('segmento');
    if (!cid?.value.trim())                       { setError('cidade','Informe a cidade/bairro.'); ok=false; } else clearErr('cidade');
    if (!rep?.value.trim())                       { setError('representante','Informe o representante legal.'); ok=false; } else clearErr('representante');
    if (!desc?.value.trim() || desc.value.trim().length < 20) { setError('descricao_negocio','Descreva seu negócio (mín. 20 caracteres).'); ok=false; } else clearErr('descricao_negocio');
  }
  if (step === 3) {
    const parceria = [...document.querySelectorAll('input[name="parceria"]:checked')];
    const pct  = document.getElementById('percentual_desconto');
    const pz   = document.getElementById('prazo_vigencia');
    const prop = document.getElementById('proposta_detalhes');
    if (parceria.length === 0)                          { setError('parceria','Selecione pelo menos um tipo.'); ok=false; } else clearErr('parceria');
    if (!pct?.value || +pct.value < 1 || +pct.value > 100) { setError('percentual_desconto','Informe um percentual entre 1 e 100.'); ok=false; } else clearErr('percentual_desconto');
    if (!pz?.value)                                     { setError('prazo_vigencia','Selecione o prazo.'); ok=false; } else clearErr('prazo_vigencia');
    if (!prop?.value.trim() || prop.value.trim().length < 30) { setError('proposta_detalhes','Descreva a proposta (mín. 30 caracteres).'); ok=false; } else clearErr('proposta_detalhes');
  }
  if (step === 4) {
    const ac  = document.getElementById('aceite_clausulas');
    const lg  = document.getElementById('aceite_lgpd');
    const sig = document.getElementById('nome_assinatura');
    if (!ac?.checked)  { setError('aceite_clausulas','É necessário aceitar as cláusulas.'); ok=false; } else clearErr('aceite_clausulas');
    if (!lg?.checked)  { setError('aceite_lgpd','É necessário autorizar o uso dos dados.'); ok=false; } else clearErr('aceite_lgpd');
    if (!sig?.value.trim() || sig.value.trim().length < 5) { setError('nome_assinatura','Confirme seu nome como assinatura.'); ok=false; } else clearErr('nome_assinatura');
  }
  return ok;
}

/* ── Step buttons ───────────────────────────────────────────── */
function addStepBtn(id, action) {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', action);
}
addStepBtn('btn-step1-next', () => { if (validateStep(1)) showStep(2); });
addStepBtn('btn-step2-back', () => showStep(1));
addStepBtn('btn-step2-next', () => { if (validateStep(2)) showStep(3); });
addStepBtn('btn-step3-back', () => showStep(2));
addStepBtn('btn-step3-next', () => { if (validateStep(3)) showStep(4); });
addStepBtn('btn-step4-back', () => showStep(3));

/* ── Form Submit → Firestore ────────────────────────────────── */
const form        = document.getElementById('registro-form');
const successCard = document.getElementById('success-card');
const successMeta = document.getElementById('success-meta');
const spinner     = document.getElementById('spinner');
const btnSubmit   = document.getElementById('btn-submit');
const btnSubmitTx = document.getElementById('btn-submit-text');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateStep(4)) return;

    btnSubmit.disabled = true;
    if (spinner)     spinner.classList.remove('hidden');
    if (btnSubmitTx) btnSubmitTx.textContent = 'Enviando...';

    const record = {
      nome:              v('nome'),
      cpf:               v('cpf'),
      email:             v('email'),
      whatsapp:          v('whatsapp'),
      loja:              v('loja'),
      cim:               v('cim'),
      razao_social:      v('razao_social'),
      cnpj_cpf:          v('cnpj_cpf'),
      segmento:          v('segmento'),
      cidade:            v('cidade'),
      endereco:          v('endereco'),
      representante:     v('representante'),
      descricao_negocio: v('descricao_negocio'),
      site:              v('site'),
      instagram:         v('instagram'),
      tipo_parceria:     [...document.querySelectorAll('input[name="parceria"]:checked')].map(c=>c.value),
      percentual_desconto: v('percentual_desconto'),
      prazo_vigencia:    v('prazo_vigencia'),
      proposta_detalhes: v('proposta_detalhes'),
      como_conheceu:     v('como_conheceu'),
      aceite_clausulas:  true,
      aceite_lgpd:       true,
      nome_assinatura:   v('nome_assinatura'),
      status:            'em análise'
    };

    try {
      const docRef = await addRecord(record);
      lastRecord = { id: docRef.id, ...record, createdAt: new Date().toISOString() };

      if (spinner)     spinner.classList.add('hidden');
      if (btnSubmitTx) btnSubmitTx.textContent = '✅ Enviar Proposta e Aceitar Convênio';
      btnSubmit.disabled = false;

      form.classList.add('hidden');
      if (successCard) {
        successCard.classList.add('visible');
        if (successMeta) {
          successMeta.innerHTML = `
            <strong>Irmão:</strong> ${record.nome}<br/>
            <strong>CPF:</strong> ${record.cpf}<br/>
            <strong>Empresa:</strong> ${record.razao_social}<br/>
            <strong>Segmento:</strong> ${record.segmento}<br/>
            <strong>Desconto ofertado:</strong> ${record.percentual_desconto}%<br/>
            <strong>Prazo proposto:</strong> ${record.prazo_vigencia} meses<br/>
            <strong>Assinatura digital:</strong> ${record.nome_assinatura}
          `;
        }
      }
    } catch (err) {
      console.error('Erro ao salvar:', err);
      alert('Erro ao enviar. Verifique sua conexão e tente novamente.');
      if (spinner)     spinner.classList.add('hidden');
      if (btnSubmitTx) btnSubmitTx.textContent = '✅ Enviar Proposta e Aceitar Convênio';
      btnSubmit.disabled = false;
    }
  });
}

function v(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

/* ── Novo cadastro ──────────────────────────────────────────── */
const btnNovo = document.getElementById('btn-novo-cadastro');
if (btnNovo) {
  btnNovo.addEventListener('click', () => {
    form?.reset();
    form?.classList.remove('hidden');
    successCard?.classList.remove('visible');
    lastRecord = null;
    showStep(1);
  });
}

/* ── Botão ver convênio (success) ───────────────────────────── */
const btnVerConvenio = document.getElementById('btn-ver-convenio');
if (btnVerConvenio) {
  btnVerConvenio.addEventListener('click', () => {
    if (lastRecord) openModal(lastRecord);
  });
}

/* ── MODAL ──────────────────────────────────────────────────── */
function openModal(record) {
  const overlay = document.getElementById('modal-overlay');
  const body    = document.getElementById('modal-body');
  if (!overlay || !body) return;
  body.innerHTML = gerarMinuta(record);
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  if (overlay) overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

document.getElementById('modal-close')?.addEventListener('click', closeModal);
document.getElementById('btn-fechar-modal')?.addEventListener('click', closeModal);
document.getElementById('modal-overlay')?.addEventListener('click', e => {
  if (e.target.id === 'modal-overlay') closeModal();
});
document.getElementById('btn-imprimir')?.addEventListener('click', () => window.print());

/* ── Gerador de Minuta ──────────────────────────────────────── */
function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[tag] || tag));
}

function gerarMinuta(r) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const parceriasTexto = esc(r.tipo_parceria?.join('; ') || '—');
  const prazoMeses = esc(r.prazo_vigencia) || '24';
  const prazoExtenso = prazoMeses === '12' ? 'doze' : prazoMeses === '24' ? 'vinte e quatro' : 'trinta e seis';

  return `
  <div class="minuta" id="minuta-print">
    <p class="minuta-title">TERMO DE CONVÊNIO</p>
    <p class="minuta-subtitle">Campanha <em>Irmão ajuda Irmão</em> · Grande Oriente do Brasil no Estado do Rio de Janeiro</p>
    <div class="minuta-partes">
      <p><strong>CONVENIANTE:</strong> Grande Oriente do Brasil no Estado do Rio de Janeiro – GOBRJ, representado pelo Grão-Mestre Estadual <strong>André Luís Rosa dos Santos</strong>.</p>
      <p><strong>CONVENIADA:</strong> ${esc(r.razao_social)}${r.cnpj_cpf ? `, CNPJ/CPF: ${esc(r.cnpj_cpf)}` : ''}, com atuação em <strong>${esc(r.cidade)}</strong>${r.endereco ? ` (${esc(r.endereco)})` : ''}, representada por <strong>${esc(r.representante)}</strong>.</p>
    </div>
    <h4>CLÁUSULA 1ª – DO OBJETO</h4>
    <p>Formalização de parceria comercial no âmbito da campanha <em>Irmão ajuda Irmão</em>. Segmento: <strong>${esc(r.segmento)}</strong>. Serviços: ${esc(r.descricao_negocio)}</p>
    <h4>CLÁUSULA 2ª – DOS BENEFICIÁRIOS</h4>
    <p><strong>2.1.</strong> São beneficiários:</p>
    <ul>
      <li><strong>a)</strong> Todos os jurisdicionados filiados às Lojas do GOB-RJ;</li>
      <li><strong>b)</strong> Funcionários do quadro permanente do GOB-RJ;</li>
      <li><strong>c)</strong> Cônjuge/companheiro(a) e dependentes diretos (ascendentes e descendentes de 1º grau).</li>
    </ul>
    <p><strong>2.2.</strong> Identificação por carteira de membro emitida pelo GOB-RJ ou documento equivalente.</p>
    <p><strong>2.3.</strong> A CONVENIADA não poderá restringir o atendimento a beneficiários regularizados.</p>
    <h4>CLÁUSULA 3ª – DOS BENEFÍCIOS</h4>
    <ul>
      <li><strong>Desconto:</strong> <strong>${esc(r.percentual_desconto)}%</strong>;</li>
      <li><strong>Tipo:</strong> ${parceriasTexto};</li>
      <li><strong>Condições:</strong> ${esc(r.proposta_detalhes)}.</li>
    </ul>
    <h4>CLÁUSULA 4ª – OBRIGAÇÕES DA CONVENIADA</h4>
    <ul>
      <li>a) Atender todos os beneficiários sem restrição indevida;</li>
      <li>b) Manter as condições da proposta durante a vigência;</li>
      <li>c) Avisar o GOB-RJ com 30 dias de antecedência sobre qualquer alteração;</li>
      <li>d) Manter a qualidade dos serviços/produtos ofertados.</li>
    </ul>
    <h4>CLÁUSULA 5ª – OBRIGAÇÕES DO GOB-RJ</h4>
    <ul>
      <li>a) Divulgar os serviços nos canais oficiais do GOBRJ;</li>
      <li>b) Fornecer credencial de identificação aos beneficiários;</li>
      <li>c) Informar os beneficiários sobre rescisão ou alteração do convênio.</li>
    </ul>
    <h4>CLÁUSULA 6ª – DO PRAZO</h4>
    <p>Vigência de <strong>${prazoMeses} (${prazoExtenso}) meses</strong> a partir da assinatura, renovável por igual período. Rescisão com aviso prévio de 30 dias.</p>
    <h4>CLÁUSULA 7ª – LGPD</h4>
    <p>As partes adotarão medidas de proteção de dados pessoais conforme Lei nº 13.709/2018.</p>
    <h4>CLÁUSULA 8ª – PUBLICIDADE E MARCAS</h4>
    <p>O uso de marcas do GOB-RJ pela CONVENIADA depende de autorização escrita prévia. Materiais publicitários devem ser aprovados em até 7 dias corridos.</p>
    <h4>CLÁUSULA 9ª – FORO</h4>
    <p>Foro do Município do Rio de Janeiro, com renúncia a qualquer outro.</p>
    <div class="minuta-assinaturas">
      <p>Rio de Janeiro, ${hoje}.</p>
      <div class="assinatura-grid">
        <div class="assinatura-bloco">Grande Oriente do Brasil no Estado do Rio de Janeiro<br/>André Luís Rosa dos Santos<br/>Grão-Mestre Estadual</div>
        <div class="assinatura-bloco">${esc(r.razao_social)}<br/>${esc(r.representante)}<br/>Representante Legal<br/><em>Assinatura digital: ${esc(r.nome_assinatura)}</em></div>
      </div>
      <p style="margin-top:24px;font-size:.8rem;color:#555;">TESTEMUNHAS:</p>
      <div class="assinatura-grid" style="margin-top:8px;">
        <div class="assinatura-bloco">1) Nome: _____________________<br/>CPF nº: ______________________</div>
        <div class="assinatura-bloco">2) Nome: _____________________<br/>CPF nº: ______________________</div>
      </div>
    </div>
    <div class="minuta-rodape">Documento gerado – Irmão ajuda Irmão · GOBRJ · ${new Date().toLocaleString('pt-BR')} · Aceite digital: ${esc(r.nome_assinatura)}</div>
  </div>`;
}

/* ── Exports para admin ─────────────────────────────────────── */
window.gerarMinuta  = gerarMinuta;
window.openModal    = openModal;
window.getDB        = getDB;
window.addRecord    = addRecord;
window.updateRecord = updateRecord;
window.deleteRecord = deleteRecord;
window.formatDate   = formatDate;
