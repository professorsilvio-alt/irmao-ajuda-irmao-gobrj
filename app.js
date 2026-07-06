/* ============================================================
   IRMÃO AJUDA IRMÃO – GOBRJ | Main App JS
   ============================================================ */

const DB_KEY = 'irmao_ajuda_irmao_registros';

/* ── Utils ─────────────────────────────────────────────────── */
function getDB() {
  try { return JSON.parse(localStorage.getItem(DB_KEY)) || []; }
  catch { return []; }
}
function saveDB(data) { localStorage.setItem(DB_KEY, JSON.stringify(data)); }
function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
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

    if (!nome?.value.trim())                           { setError('nome', 'Informe seu nome completo.'); ok=false; } else clearErr('nome');
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

/* ── Form submit ────────────────────────────────────────────── */
const form        = document.getElementById('registro-form');
const successCard = document.getElementById('success-card');
const successMeta = document.getElementById('success-meta');
const spinner     = document.getElementById('spinner');
const btnSubmit   = document.getElementById('btn-submit');
const btnSubmitTx = document.getElementById('btn-submit-text');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep(4)) return;

    btnSubmit.disabled = true;
    if (spinner)     spinner.classList.remove('hidden');
    if (btnSubmitTx) btnSubmitTx.textContent = 'Enviando...';

    setTimeout(() => {
      const record = {
        id:           Date.now(),
        createdAt:    new Date().toISOString(),
        // Pessoal
        nome:         v('nome'),
        cpf:          v('cpf'),
        email:        v('email'),
        whatsapp:     v('whatsapp'),
        loja:         v('loja'),
        cim:          v('cim'),
        // Empresa
        razao_social:      v('razao_social'),
        cnpj_cpf:          v('cnpj_cpf'),
        segmento:          v('segmento'),
        cidade:            v('cidade'),
        endereco:          v('endereco'),
        representante:     v('representante'),
        descricao_negocio: v('descricao_negocio'),
        site:              v('site'),
        instagram:         v('instagram'),
        // Proposta
        tipo_parceria:      [...document.querySelectorAll('input[name="parceria"]:checked')].map(c=>c.value),
        percentual_desconto: v('percentual_desconto'),
        prazo_vigencia:      v('prazo_vigencia'),
        proposta_detalhes:   v('proposta_detalhes'),
        como_conheceu:       v('como_conheceu'),
        // Aceite
        aceite_clausulas: true,
        aceite_lgpd:      true,
        nome_assinatura:  v('nome_assinatura'),
      };

      const db = getDB();
      db.unshift(record);
      saveDB(db);
      lastRecord = record;

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
            <strong>Assinatura digital:</strong> ${record.nome_assinatura}<br/>
            <strong>Data/hora:</strong> ${formatDate(record.createdAt)}
          `;
        }
      }
    }, 1400);
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
function gerarMinuta(r) {
  const hoje = new Date().toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const parceriasTexto = r.tipo_parceria?.join('; ') || '—';
  const prazoMeses = r.prazo_vigencia || '24';

  return `
  <div class="minuta" id="minuta-print">
    <p class="minuta-title">TERMO DE CONVÊNIO</p>
    <p class="minuta-subtitle">Campanha <em>Irmão ajuda Irmão</em> · Grande Oriente do Brasil no Estado do Rio de Janeiro</p>

    <div class="minuta-partes">
      <p><strong>CONVENIANTE:</strong> Grande Oriente do Brasil no Estado do Rio de Janeiro – GOBRJ, com sede no Rio de Janeiro/RJ, neste ato representado pelo Grão-Mestre Estadual, <strong>André Luís Rosa dos Santos</strong>.</p>
      <p><strong>CONVENIADA:</strong> ${r.razao_social}${r.cnpj_cpf ? `, CNPJ/CPF: ${r.cnpj_cpf}` : ''}, com atuação em <strong>${r.cidade}</strong>${r.endereco ? ` (${r.endereco})` : ''}, neste ato representada por <strong>${r.representante}</strong>.</p>
    </div>

    <p>As partes acima identificadas celebram o presente <strong>Termo de Convênio</strong>, nos termos da campanha <em>Irmão ajuda Irmão</em>, mediante as cláusulas e condições a seguir:</p>

    <h4>CLÁUSULA 1ª – DO OBJETO</h4>
    <p>O presente instrumento tem por objeto a formalização de parceria comercial entre a <strong>CONVENIADA</strong> e a <strong>CONVENIANTE</strong>, para concessão de benefícios, descontos e condições especiais nos serviços/produtos da CONVENIADA aos beneficiários definidos na Cláusula 2ª, no âmbito da campanha <em>Irmão ajuda Irmão</em>.</p>
    <p><strong>Segmento:</strong> ${r.segmento}</p>
    <p><strong>Descrição dos serviços/produtos:</strong> ${r.descricao_negocio}</p>

    <h4>CLÁUSULA 2ª – DOS BENEFICIÁRIOS</h4>
    <p><strong>2.1.</strong> São beneficiários do presente convênio:</p>
    <ul>
      <li><strong>a)</strong> Todos os <strong>jurisdicionados</strong> (maçons regularizados) filiados às Lojas vinculadas ao Grande Oriente do Brasil no Estado do Rio de Janeiro;</li>
      <li><strong>b)</strong> Os <strong>funcionários e colaboradores</strong> do quadro permanente e administrativo do GOB-RJ;</li>
      <li><strong>c)</strong> O <strong>cônjuge ou companheiro(a)</strong> e os <strong>dependentes diretos</strong> (ascendentes e descendentes de 1º grau) dos jurisdicionados e funcionários mencionados nas alíneas "a" e "b".</li>
    </ul>
    <p><strong>2.2.</strong> A identificação dos beneficiários se dará mediante apresentação de carteira de membro expedida pelo GOB-RJ, contracheque ou documento equivalente aceito pela CONVENIANTE.</p>
    <p><strong>2.3.</strong> A CONVENIADA não poderá restringir o atendimento a beneficiários devidamente identificados, salvo em casos de inadimplência ou vedação expressa prevista neste instrumento.</p>

    <h4>CLÁUSULA 3ª – DOS BENEFÍCIOS CONCEDIDOS</h4>
    <p><strong>3.1.</strong> A CONVENIADA concederá aos beneficiários definidos na Cláusula 2ª as seguintes condições especiais:</p>
    <ul>
      <li><strong>Percentual de desconto:</strong> <strong>${r.percentual_desconto}%</strong> sobre o valor dos serviços/produtos contratados;</li>
      <li><strong>Tipo de benefício:</strong> ${parceriasTexto};</li>
      <li><strong>Demais condições:</strong> ${r.proposta_detalhes}.</li>
    </ul>
    <p><strong>3.2.</strong> Os benefícios concedidos não são cumulativos com outras promoções ou campanhas comerciais, salvo expressa previsão em contrário.</p>
    <p><strong>3.3.</strong> Em nenhuma hipótese a CONVENIANTE responderá pelo inadimplemento ou por obrigações contraídas pelos beneficiários perante a CONVENIADA.</p>
    <p><strong>3.4.</strong> A CONVENIADA se compromete a manter a qualidade dos serviços/produtos ofertados, garantindo o mesmo padrão de atendimento prestado a clientes regulares.</p>

    <h4>CLÁUSULA 4ª – DAS OBRIGAÇÕES DA CONVENIADA</h4>
    <ul>
      <li><strong>a)</strong> Atender todos os beneficiários regularizados que se identificarem como tal, sem discriminação ou restrição indevida;</li>
      <li><strong>b)</strong> Manter as condições da proposta durante toda a vigência do convênio;</li>
      <li><strong>c)</strong> Comunicar ao GOB-RJ, com antecedência mínima de <strong>30 (trinta) dias</strong>, qualquer alteração nos benefícios ofertados;</li>
      <li><strong>d)</strong> Dar preferência, sempre que possível, à contratação de serviços e fornecedores maçons da jurisdição;</li>
      <li><strong>e)</strong> Disponibilizar material de divulgação dos serviços à CONVENIANTE para repasse aos jurisdicionados;</li>
      <li><strong>f)</strong> Participar, quando convidado, de eventos, feiras e reuniões promovidos pelo GOB-RJ.</li>
    </ul>

    <h4>CLÁUSULA 5ª – DAS OBRIGAÇÕES DA CONVENIANTE</h4>
    <ul>
      <li><strong>a)</strong> Divulgar os serviços da CONVENIADA nos canais oficiais do GOBRJ;</li>
      <li><strong>b)</strong> Fornecer credencial ou documento de identificação aos jurisdicionados e funcionários;</li>
      <li><strong>c)</strong> Informar prontamente os beneficiários sobre eventuais alterações ou rescisão do convênio.</li>
    </ul>

    <h4>CLÁUSULA 6ª – DO PRAZO</h4>
    <p><strong>6.1.</strong> O presente instrumento vigorará por <strong>${prazoMeses} (${prazoMeses === '12' ? 'doze' : prazoMeses === '24' ? 'vinte e quatro' : 'trinta e seis'}) meses</strong>, contados da data de assinatura, podendo ser renovado por igual período mediante acordo entre as partes.</p>
    <p><strong>6.2.</strong> O convênio poderá ser rescindido a qualquer tempo por qualquer das partes, mediante aviso prévio de 30 (trinta) dias, sem ônus para nenhuma das partes, ressalvados os compromissos em curso.</p>
    <p><strong>6.3.</strong> Em caso de rescisão, a CONVENIANTE informará imediatamente os beneficiários sobre a cessação dos benefícios.</p>

    <h4>CLÁUSULA 7ª – DA PROTEÇÃO DE DADOS (LGPD)</h4>
    <p><strong>7.1.</strong> As partes adotarão todas as medidas necessárias para proteção dos dados pessoais dos beneficiários, em conformidade com a <strong>Lei nº 13.709/2018 (LGPD)</strong>.</p>
    <p><strong>7.2.</strong> Os dados pessoais dos beneficiários serão utilizados exclusivamente para identificação e concessão dos benefícios previstos neste instrumento.</p>

    <h4>CLÁUSULA 8ª – DA PUBLICIDADE E USO DE MARCAS</h4>
    <p><strong>8.1.</strong> O uso de marcas, logotipos ou símbolos maçônicos do GOB-RJ dependerá de prévia autorização escrita da CONVENIANTE.</p>
    <p><strong>8.2.</strong> Materiais publicitários que referenciem o convênio devem ser submetidos à aprovação em até 7 (sete) dias corridos. O silêncio equivale a não aprovação.</p>

    <h4>CLÁUSULA 9ª – DO FORO</h4>
    <p>As partes elegem o foro do <strong>Município do Rio de Janeiro</strong> para dirimir quaisquer dúvidas, com renúncia a qualquer outro foro.</p>

    <div class="minuta-assinaturas">
      <p>Rio de Janeiro, ${hoje}.</p>
      <div class="assinatura-grid">
        <div class="assinatura-bloco">
          Grande Oriente do Brasil no Estado do Rio de Janeiro<br/>
          André Luís Rosa dos Santos<br/>
          Grão-Mestre Estadual
        </div>
        <div class="assinatura-bloco">
          ${r.razao_social}<br/>
          ${r.representante}<br/>
          Representante Legal<br/>
          <em>Assinatura digital: ${r.nome_assinatura}</em>
        </div>
      </div>
      <p style="margin-top:24px;font-size:.8rem;color:#555;">TESTEMUNHAS:</p>
      <div class="assinatura-grid" style="margin-top:8px;">
        <div class="assinatura-bloco">1) Nome: _____________________<br/>CPF nº: ______________________</div>
        <div class="assinatura-bloco">2) Nome: _____________________<br/>CPF nº: ______________________</div>
      </div>
    </div>

    <div class="minuta-rodape">
      Documento gerado pela plataforma Irmão ajuda Irmão – GOBRJ · ${new Date().toLocaleString('pt-BR')}
      · Aceite digital registrado para: ${r.nome_assinatura}
    </div>
  </div>
  `;
}

/* ── Exporta função para uso no admin ────────────────────────── */
window.gerarMinuta = gerarMinuta;
window.openModal   = openModal;
window.getDB       = getDB;
window.saveDB      = saveDB;
window.formatDate  = formatDate;
