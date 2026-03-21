const state = {
  balance: Number(localStorage.getItem('pvk_balance') || 0),
  discount: 0
};

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/**
 * --- Форма проверки физлиц: UX улучшения ---
 * Универсальная валидация для форм проверки физлица (ФИО, дата рождения, согласие)
 */

// Универсальная функция валидации формы проверки физлица
function validatePersonForm(formId, fieldPrefix = '') {
  const form = document.getElementById(formId);
  if (!form) return false;

  let valid = true;
  let firstInvalid = null;

  // Список обязательных полей (ФИО, дата рождения, согласие)
  const requiredFields = [
    { id: fieldPrefix + 'personName', type: 'text' },
    { id: fieldPrefix + 'personBirthDate', type: 'date' },
    { id: fieldPrefix + 'personConsent', type: 'checkbox' }
  ];

  requiredFields.forEach(field => {
    const el = document.getElementById(field.id);
    if (!el) return;
    let isValid = true;
    if (field.type === 'checkbox') {
      isValid = el.checked;
    } else {
      isValid = !!el.value.trim();
    }
    if (!isValid) {
      valid = false;
      if (!firstInvalid) firstInvalid = el;
      el.classList.add('input-error');
    } else {
      el.classList.remove('input-error');
    }
  });

  if (!valid && firstInvalid) {
    firstInvalid.focus();
  }
  return valid;
}

// Обработчик отправки формы проверки физлица
function setupPersonFormValidation(formId, fieldPrefix = '', errorId = 'personFormError') {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', function (e) {
    if (!validatePersonForm(formId, fieldPrefix)) {
      e.preventDefault();
      setText(errorId, 'Пожалуйста, заполните все обязательные поля и дайте согласие.');
    } else {
      setText(errorId, '');
    }
  });
}

// Автоматически инициализировать для article.html и articles.html
document.addEventListener('DOMContentLoaded', function () {
  // Для article.html
  if (document.getElementById('personForm')) {
    setupPersonFormValidation('personForm');
  }
  // Для articles.html
  if (document.getElementById('personFormArticles')) {
    setupPersonFormValidation('personFormArticles', 'articles', 'personFormErrorArticles');
  }
  // Для других форм, если есть
  if (document.getElementById('personCheckForm')) {
    setupPersonFormValidation('personCheckForm');
  }
});

function openModal() {
  const m = document.getElementById('authModal');
  if (m) m.hidden = false;
}
function closeModal() {
  const m = document.getElementById('authModal');
  if (m) m.hidden = true;
}

document.querySelector('[data-open-auth]')?.addEventListener('click', openModal);
document.querySelector('[data-close-auth]')?.addEventListener('click', closeModal);

document.querySelectorAll('.tabs button').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.auth-pane').forEach(pane => pane.classList.add('hidden'));
    document.querySelector(`[data-pane="${tab}"]`)?.classList.remove('hidden');
  });
});

document.querySelectorAll('.auth-pane').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    closeModal();
    alert('Действие выполнено. Проверьте почту.');
  });
});

document.getElementById('searchForm')?.addEventListener('submit', e => {
  e.preventDefault();
  setText('formStatus', 'Форма принята. Переходим к оплате...');
  setTimeout(() => window.location.href = 'checkout.html', 700);
});

document.getElementById('articleForm')?.addEventListener('submit', e => {
  e.preventDefault();
  window.location.href = 'checkout.html';
});

function updatePrice(discount = 0) {
  const final = 249 - discount;
  setText('discount', `${discount} ₽`);
  setText('finalPrice', `${final} ₽`);
}

document.getElementById('applyPromo')?.addEventListener('click', () => {
  const code = (document.getElementById('promo')?.value || '').trim().toUpperCase();
  const promoError = document.getElementById('promoError');
  if (code === 'PROVERKA77') {
    state.discount = 50;
    updatePrice(50);
    if (promoError) {
      promoError.textContent = 'Промокод применён. Скидка 50 ₽.';
      promoError.style.color = '#080';
      promoError.style.display = '';
    }
  } else if (code.length > 0) {
    state.discount = 0;
    updatePrice(0);
    if (promoError) {
      promoError.textContent = 'Промокод не найден или недействителен.';
      promoError.style.color = '#c00';
      promoError.style.display = '';
    }
  } else {
    state.discount = 0;
    updatePrice(0);
    if (promoError) {
      promoError.textContent = '';
      promoError.style.display = 'none';
    }
  }
});

document.getElementById('payBtn')?.addEventListener('click', () => {
  const amount = 249 - (state.discount || 0);
  state.balance += 500;
  localStorage.setItem('pvk_balance', String(state.balance));
  setText('payStatus', `Оплата ${amount} ₽ прошла успешно. Отчёт доступен в кабинете.`);
  setTimeout(() => window.location.href = 'dashboard.html', 900);
});

setText('balanceView', `${state.balance} ₽`);

function downloadSimplePdf() {
  const lines = [
    'PROVERKA77 REPORT',
    'Person: GORIN ALEKSEY SERGEEVICH',
    'Birth date: 11.08.1991',
    'Region: Moscow',
    'Credit risk: LOW',
    'Enforcement: 0',
    'Court cases: 1 completed civil case',
    'Conclusion: no critical risk found'
  ];

  let content = 'BT /F1 12 Tf 50 760 Td (' + lines[0] + ') Tj';
  for (let i = 1; i < lines.length; i++) {
    content += ` T* (${lines[i]}) Tj`;
  }
  content += ' ET';

  const objects = [];
  objects.push('1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj');
  objects.push('2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj');
  objects.push('3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj');
  objects.push('4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj');
  objects.push(`5 0 obj << /Length ${content.length} >> stream\n${content}\nendstream endobj`);

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach(obj => {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  });

  const xrefPos = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  offsets.slice(1).forEach(off => {
    pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const blob = new Blob([pdf], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'proverka77-report.pdf';
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('downloadPdf')?.addEventListener('click', downloadSimplePdf);
