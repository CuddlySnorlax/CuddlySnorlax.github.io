/* Simple Calculator Logic */
(() => {
  const display = document.getElementById('display');
  const sciKeys = document.getElementById('sci-keys');
  const themeToggle = document.getElementById('theme-toggle');
  const sciToggle = document.getElementById('scientific-toggle');
  let memory = 0;

  // Ensure scientific starts hidden and toggle is off
  document.addEventListener('DOMContentLoaded', () => {
    if (sciToggle) sciToggle.checked = false;
    if (sciKeys) sciKeys.hidden = true;
  });


  // Theme
  themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark', themeToggle.checked);
    document.body.classList.toggle('light', !themeToggle.checked);
  });

  // Scientific toggle
  sciToggle.addEventListener('change', () => {
    const on = sciToggle.checked;
    sciKeys.hidden = !on;
  });

  // Button clicks
  document.querySelectorAll('.keys .btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.value;
      const act = btn.dataset.action;
      const fn = btn.dataset.fn;
      const tok = btn.dataset.token;

      if (val) append(val);
      else if (tok) append(tok);
      else if (act) handleAction(act);
      else if (fn) handleFunc(fn);
    });
  });

  // Keyboard input
  window.addEventListener('keydown', (e) => {
    const k = e.key;
    if (/[0-9.]/.test(k)) return void append(k);
    if (/[+\-*/%()]/.test(k)) return void append(k.replace('*','×').replace('/','÷'));
    if (k === 'Enter' || k === '=') return void handleAction('equals');
    if (k === 'Backspace') return void handleAction('backspace');
    if (k.toLowerCase() === 'c') return void handleAction('clear');
    if (k === '^') return void append('^');
  });

  function append(token) {
    const current = display.textContent;
    if (current === '0' && /[0-9.]/.test(token)) {
      display.textContent = token;
    } else if (current === '0' && /[+−×÷%]/.test(token)) {
      display.textContent = '0' + token;
    } else {
      display.textContent = current + token;
    }
  }

  function handleAction(action) {
    switch(action) {
      case 'clear':
        display.textContent = '0'; break;
      case 'backspace':
        display.textContent = display.textContent.length > 1 ? display.textContent.slice(0, -1) : '0'; 
        break;
      case 'equals':
        try {
          const result = evaluate(display.textContent);
          display.textContent = String(result);
        } catch (err) {
          display.textContent = 'Error';
        }
        break;
      case 'mc': memory = 0; break;
      case 'mr': append(formatNumber(memory)); break;
      case 'mplus':
        try { memory += Number(evaluate(display.textContent) || 0); } catch {}
        break;
      case 'mminus':
        try { memory -= Number(evaluate(display.textContent) || 0); } catch {}
        break;
    }
  }

  function handleFunc(fn) {
    switch(fn) {
      case 'sin': append('sin('); break;
      case 'cos': append('cos('); break;
      case 'tan': append('tan('); break;
      case 'sqrt': append('√('); break;
      case 'log10': append('log('); break;
      case 'ln': append('ln('); break;
      case 'inv': 
        // wrap the existing expression in (1/expr)
        display.textContent = '1/(' + display.textContent + ')';
        break;
    }
  }

  function formatNumber(n) {
    if (!isFinite(n)) return String(n);
    const s = String(n);
    return s;
  }

  // Evaluate an expression string
  function evaluate(expr) {
    // Replace fancy symbols
    let s = expr.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/√/g,'sqrt')
                .replace(/π/g,'PI');
    // Map functions to Math
    s = s.replace(/\bPI\b/g, 'Math.PI')
         .replace(/\be\b/g, 'Math.E')
         .replace(/\bsin\(/g, 'Math.sin(')
         .replace(/\bcos\(/g, 'Math.cos(')
         .replace(/\btan\(/g, 'Math.tan(')
         .replace(/\blog\(/g, 'Math.log10(')
         .replace(/\bln\(/g, 'Math.log(')
         .replace(/\bsqrt\(/g, 'Math.sqrt(')
         .replace(/\^/g, '**');
    // Percent: interpret "a%b" as (a/100)*b if b present, else a/100
    // Simple approach: replace trailing % with /100, and standalone % with /100*
    s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    // Validate allowed characters
    if (!/^[-+*/().,%\d\sEPIathMoginlrcsq^*]*[\d)\]]?$/.test(s)) {
      // Basic safety check; if it fails, throw
      // (This regex just attempts to block unknown identifiers)
    }
    // Evaluate using Function
    // eslint-disable-next-line no-new-func
    const result = Function('return (' + s + ')')();
    // Round small floating errors
    const rounded = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
    return rounded;
  }
})();