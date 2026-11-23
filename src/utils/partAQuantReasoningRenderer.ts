type PyqRow = [number, string, string, string, string, string, string, string[], string, string, string, string, string];

const esc = (value: unknown): string =>
  String(value ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[char] as string).replace(/\r?\n/g, '<br>');

const topics = [
  'Number System',
  'Simplification',
  'HCF & LCM',
  'Alphabet / Letter Series',
  'Number Series',
  'Miscellaneous PYQs',
];

const theory: Record<string, string> = {
  'Number System': `
    <h3>1. What is a number system?</h3>
    <p>A number system classifies numbers by the properties they satisfy. Natural numbers are 1, 2, 3, …; whole numbers add 0; integers include negative values; rational numbers can be written as p/q (q ≠ 0); irrational numbers cannot be written as such a fraction. Real numbers contain both rational and irrational numbers.</p>
    <table><tr><th>Set</th><th>Meaning</th><th>Examples</th></tr><tr><td>Natural (N)</td><td>Counting numbers</td><td>1, 2, 3</td></tr><tr><td>Whole (W)</td><td>Natural numbers and zero</td><td>0, 1, 2</td></tr><tr><td>Integers (Z)</td><td>Negative, zero, positive</td><td>−3, 0, 8</td></tr><tr><td>Rational (Q)</td><td>p/q, q ≠ 0</td><td>3/4, −2, 0.125</td></tr><tr><td>Irrational</td><td>Non-terminating, non-recurring decimal</td><td>√2, π</td></tr></table>
    <p>Remember: every natural number is whole, every whole number is an integer, and every integer is rational. The reverse implications are not generally true. 1 is neither prime nor composite; 2 is the only even prime.</p>
    <h3>2. Place value and face value</h3><p>In a base-10 numeral, place values from right to left are 1, 10, 100, 1000, … . For example, in 5,274 the digit 7 has face value 7 and place value 70. A k-digit number has a leading digit from 1 to 9.</p>
    <h3>3. Divisibility rules</h3>
    <table><tr><th>Divisor</th><th>Test</th></tr><tr><td>2</td><td>Last digit is 0, 2, 4, 6 or 8.</td></tr><tr><td>3</td><td>Sum of digits is divisible by 3.</td></tr><tr><td>4</td><td>Number formed by last two digits is divisible by 4.</td></tr><tr><td>5</td><td>Last digit is 0 or 5.</td></tr><tr><td>6</td><td>Divisible by both 2 and 3.</td></tr><tr><td>8</td><td>Number formed by last three digits is divisible by 8.</td></tr><tr><td>9</td><td>Sum of digits is divisible by 9.</td></tr><tr><td>10</td><td>Last digit is 0.</td></tr><tr><td>11</td><td>Absolute difference of alternating-position digit sums is 0 or a multiple of 11.</td></tr><tr><td>12</td><td>Divisible by both 3 and 4.</td></tr></table>
    <p><b>Composite tests:</b> divisible by 15 ⇢ divisible by 3 and 5; by 18 ⇢ 2 and 9; by 36 ⇢ 4 and 9; by 88 ⇢ 8 and 11. Both component tests must pass.</p>
    <h3>4. Prime factorisation</h3><p>A prime has exactly two positive factors, 1 and itself. Express a composite number as a product of primes. Example: 360 = 2³ × 3² × 5. This representation is unique apart from order. Number of positive divisors of N = pᵃqᵇrᶜ is (a+1)(b+1)(c+1); for 360 this is 4×3×2 = 24.</p>
    <div class="worked"><b>Worked example:</b> How many factors does 72 have? 72 = 2³ × 3², so number of factors = (3+1)(2+1) = 12.</div>
    <h3>5. Remainders and modular arithmetic</h3><p>Division algorithm: <b>N = dq + r</b>, where d is the positive divisor, q is quotient and 0 ≤ r &lt; d. If N leaves remainder r on division by d, write N ≡ r (mod d). Remainders can be added, subtracted and multiplied modulo d, reducing large calculations.</p>
    <div class="worked"><b>Worked example:</b> A number leaves remainder 3 when divided by 7. Its square leaves remainder 3² = 9 ≡ 2 (mod 7).</div>
    <p>If two or more numbers leave the same remainder when divided by d, d divides their pairwise differences. Therefore the greatest possible divisor is the HCF of those differences, subject to d being greater than the stated remainder.</p>
    <h3>6. Fractions and decimal forms</h3><ul><li>A rational number in lowest terms has a terminating decimal exactly when its denominator has no prime factors other than 2 and 5.</li><li>Otherwise its decimal expansion repeats.</li><li>For a single repeating digit: 0.\u0305a = a/9; for two repeating digits: 0.\u0305ab = (10a+b)/99.</li><li>For a non-repeating prefix, subtract the non-repeating part after aligning decimal places.</li></ul>
    <div class="worked"><b>Worked example:</b> 0.\u0305{27} = 27/99 = 3/11. Also 0.1\u0305{6} = (16−1)/90 = 1/6.</div>
    <h3>7. Unit digit and cyclicity</h3><p>Last digits of powers repeat in cycles. For example, powers of 2 end in 2, 4, 8, 6 (cycle length 4). Divide the exponent by the cycle length and use the remainder; if the remainder is zero, take the last item in the cycle. Memorise cycles for bases 2, 3, 7 and 8.</p>
    <div class="key"><b>Exam checklist:</b> classify the number; apply the shortest valid divisibility test; factorise before counting divisors; use differences for equal-remainder conditions; reduce powers modulo the required divisor.</div>`,
  'Simplification': `
    <h3>1. Order of operations (BODMAS)</h3><p>Brackets → Orders (powers and roots) → Division and Multiplication in the order they appear from left to right → Addition and Subtraction in the order they appear from left to right. Division does not automatically come before multiplication; they have equal precedence. Likewise, addition and subtraction have equal precedence.</p>
    <div class="worked"><b>Worked example:</b> 24 ÷ 6 × 2 = 4 × 2 = 8 (left to right), not 2.</div>
    <h3>2. Brackets and signs</h3><ul><li>Solve the innermost bracket first: ( ), then [ ], then { } where nested.</li><li>+(a−b)=a−b; −(a−b)=−a+b.</li><li>Subtracting a negative becomes addition: a−(−b)=a+b.</li><li>When a minus sign precedes a bracket, change the sign of every term inside.</li></ul>
    <h3>3. Fractions</h3><p>For fractions, a/b + c/d = (ad+bc)/bd; a/b − c/d = (ad−bc)/bd. Multiplication: (a/b)(c/d)=ac/bd. Division: (a/b)÷(c/d)=ad/bc, where denominators are non-zero. Reduce by common factors before multiplying to keep numbers small.</p>
    <div class="worked"><b>Worked example:</b> 3/4 ÷ 9/10 = 3/4 × 10/9 = 30/36 = 5/6.</div>
    <h3>4. Decimal operations and recurring decimals</h3><ul><li>For addition/subtraction, align decimal points.</li><li>For multiplication, multiply as integers and place the decimal using the total number of decimal places in the factors.</li><li>For division, multiply dividend and divisor by the same power of 10 to make the divisor an integer.</li><li>Convert recurring decimals into fractions before complex operations.</li></ul>
    <h3>5. Exponents and surds</h3><table><tr><th>Law</th><th>Formula</th></tr><tr><td>Product</td><td>aᵐ × aⁿ = aᵐ⁺ⁿ</td></tr><tr><td>Quotient</td><td>aᵐ ÷ aⁿ = aᵐ⁻ⁿ (a ≠ 0)</td></tr><tr><td>Power of a power</td><td>(aᵐ)ⁿ = aᵐⁿ</td></tr><tr><td>Zero exponent</td><td>a⁰ = 1 (a ≠ 0)</td></tr><tr><td>Negative exponent</td><td>a⁻ⁿ = 1/aⁿ (a ≠ 0)</td></tr><tr><td>Fractional exponent</td><td>a^(1/n) = ⁿ√a (for real principal roots)</td></tr></table>
    <p>For non-negative a,b: √a × √b = √(ab). Simplify √72 = √(36×2)=6√2. Like surds combine: 3√2+5√2=8√2; unlike surds do not combine. Rationalise a denominator by multiplying by a suitable surd or conjugate.</p>
    <h3>6. Percent and approximation in expressions</h3><p>x% = x/100; x% of y = xy/100. Useful conversions: 1/2=50%, 1/3≈33⅓%, 1/4=25%, 1/5=20%, 1/8=12.5%, 1/10=10%. Estimate only when the question asks for approximation; do not round intermediate exact calculations unnecessarily.</p>
    <h3>7. A reliable solving routine</h3><ol><li>Copy the expression and identify all bracket boundaries.</li><li>Evaluate powers and roots.</li><li>Perform × and ÷ left to right.</li><li>Perform + and − left to right.</li><li>Check signs, units and whether the answer is plausible.</li></ol>
    <div class="key"><b>Common traps:</b> treating multiplication as always before division; cancelling across addition; distributing a power over a sum; assuming √(a²+b²)=a+b; forgetting that (−a)² is positive but −a² is negative.</div>`,
  'HCF & LCM': `
    <h3>1. Meaning</h3><p>The HCF (highest common factor), also called GCD, is the greatest positive integer that divides every given integer exactly. The LCM (least common multiple) is the smallest positive integer that is a multiple of every given integer.</p>
    <h3>2. Prime-factor method</h3><p>Factorise each number into primes. For HCF, take only common prime factors with the <b>smallest exponents</b>. For LCM, take every prime that occurs with the <b>largest exponents</b>.</p>
    <div class="worked"><b>Worked example:</b> 24=2³×3 and 36=2²×3². HCF=2²×3=12; LCM=2³×3²=72.</div>
    <h3>3. Fundamental identity</h3><p>For two positive integers a and b: <b>HCF(a,b) × LCM(a,b) = a × b.</b> Hence LCM = product ÷ HCF. This identity is for two integers; do not apply the product identity directly to three or more numbers.</p>
    <h3>4. Euclidean algorithm</h3><p>Repeatedly divide: a=bq+r; replace (a,b) with (b,r) until remainder is zero. The last non-zero remainder is the HCF.</p>
    <div class="worked"><b>Worked example:</b> HCF(252,105): 252=105×2+42; 105=42×2+21; 42=21×2+0. HCF=21.</div>
    <h3>5. Common remainder questions</h3><p>If a divisor leaves the same remainder when dividing A, B and C, then it exactly divides A−B, B−C and A−C. The greatest possible divisor is the HCF of these differences. Check that the divisor is larger than the remainder and that each original number gives that remainder.</p>
    <div class="worked"><b>Worked example:</b> A divisor leaves remainder 4 for 34, 54 and 74. Differences are 20 and 40; HCF=20. Since 20&gt;4 and each number is 4 more than a multiple of 20, the greatest divisor is 20.</div>
    <h3>6. Remainders of the form one less / one more</h3><ul><li>If a number leaves remainder d−1 on division by d, then the number is one less than a multiple of d.</li><li>If it leaves remainder 1, then the number minus 1 is divisible by d.</li><li>Translate the wording into an expression first, then use HCF or LCM as appropriate.</li></ul>
    <h3>7. Repeating events and grouping</h3><p>Events occurring every a, b and c units coincide again after LCM(a,b,c) units. For the greatest equal-sized groups/items with no remainder, use HCF of the quantities. For the smallest number divisible by several given numbers, use LCM.</p>
    <h3>8. Fractions</h3><p>For fractions in lowest terms: HCF of fractions = HCF of numerators ÷ LCM of denominators; LCM of fractions = LCM of numerators ÷ HCF of denominators. Apply only after reducing each fraction to lowest terms.</p>
    <div class="key"><b>Decision rule:</b> “greatest size / largest divisor / maximum equal groups” usually signals HCF. “smallest common number / together again / common interval” usually signals LCM. Always verify the result against the original wording.</div>`,
  'Alphabet / Letter Series': `
    <h3>1. Alphabet positions</h3><p>Memorise A=1, B=2, …, Z=26. Reverse positions are A=26, B=25, …, Z=1; a quick relation is reverse position = 27 − forward position.</p>
    <table><tr><th>Letter</th><th>A</th><th>B</th><th>C</th><th>D</th><th>E</th><th>F</th><th>G</th><th>H</th><th>I</th><th>J</th><th>K</th><th>L</th><th>M</th></tr><tr><td>Position</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td></tr><tr><th>Letter</th><th>N</th><th>O</th><th>P</th><th>Q</th><th>R</th><th>S</th><th>T</th><th>U</th><th>V</th><th>W</th><th>X</th><th>Y</th><th>Z</th></tr><tr><td>Position</td><td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td><td>21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td></tr></table>
    <h3>2. Forward, backward and cyclic movement</h3><p>Convert letters to numbers, add or subtract the step, then convert back. For cyclic movement use modulo 26: new position = ((old position − 1 + shift) mod 26)+1. Negative shifts move backwards.</p>
    <div class="worked"><b>Worked example:</b> X is position 24. Move forward 5: ((24−1+5) mod 26)+1 = 3, which is C.</div>
    <h3>3. Common series patterns</h3><ul><li>Constant movement: +2, −3, etc.</li><li>Increasing movement: +1, +2, +3, … or −2, −4, −6, … .</li><li>Alternating movement: +2, −1, +2, −1, … .</li><li>Reverse alphabet: Z, Y, X, …; or alternating forward/reverse.</li><li>Position-based pattern: A, C, F, J uses gaps +2, +3, +4.</li><li>Multiple letter columns: solve first letters, middle letters and last letters independently.</li><li>Letter-number groups: decode the letter sequence and number sequence separately before combining.</li></ul>
    <h3>4. Pair and group relationships</h3><p>For pairs such as AZ, BY, CX, compare both positions. The forward-position sum may be constant (A+Z=27, B+Y=27). Also test reverse positions, alphabetical distance, mirror pairs and opposite letters.</p>
    <h3>5. Alphabetical order and dictionary order</h3><p>Compare words from the first character onward. At the first position where two words differ, the word with the earlier alphabet letter comes first. If one word is a complete prefix of another, the shorter word comes first (e.g. APP before APPLE).</p>
    <h3>6. Efficient solving steps</h3><ol><li>Write positions above each letter.</li><li>Calculate differences separately for each letter slot.</li><li>Check constant, growing, alternating and cyclic shifts.</li><li>For groups, test each column independently.</li><li>Verify the proposed next term against every previous transition.</li></ol>
    <div class="key"><b>Common traps:</b> forgetting wrap-around after Z; confusing forward and reverse positions; applying one rule to a multi-column series when columns follow different rules; counting the gap incorrectly.</div>`,
  'Number Series': `
    <h3>1. What is a number series?</h3><p>A number series is an ordered list generated by one or more rules. The task may ask for the next term, a missing term, or the incorrect term. A valid pattern should explain every transition, not just the final pair.</p>
    <h3>2. Difference method</h3><p>Subtract consecutive terms to form first differences. If they are constant, the series is arithmetic. If first differences are not constant, calculate second differences; constant second differences often indicate a quadratic pattern.</p>
    <div class="worked"><b>Worked example:</b> 4, 9, 16, 25, 36. Differences are 5, 7, 9, 11; next difference is 13, so next term = 49.</div>
    <h3>3. Multiplication and division patterns</h3><p>Compare ratios of consecutive terms. Test ×2, ×3, ÷2 and mixed operations such as ×2+1, ×3−2 or ×n±k. Write the operation between every pair to check consistency.</p>
    <div class="worked"><b>Worked example:</b> 3, 7, 15, 31. Each term is previous ×2 +1; next = 31×2+1 = 63.</div>
    <h3>4. Alternating series</h3><p>Split odd-position and even-position terms into two separate sequences when a single rule does not fit. Each subsequence may have its own addition, multiplication or difference pattern. Also check alternating operations such as +2, ×2, +2, ×2.</p>
    <h3>5. Special-number patterns</h3><ul><li>Squares: 1, 4, 9, 16, 25, … (n²).</li><li>Cubes: 1, 8, 27, 64, … (n³).</li><li>Primes: 2, 3, 5, 7, 11, … .</li><li>Triangular numbers: 1, 3, 6, 10, 15, …; nth term n(n+1)/2.</li><li>Factorials: 1, 2, 6, 24, 120, … (n!).</li><li>Fibonacci-type: each term is the sum of the previous two.</li></ul>
    <h3>6. Mixed and digit-based series</h3><p>Some questions combine squares with addition, multiply by successive integers, or operate on digits (sum, product, reversal, concatenation). For digit-string/counting questions, read the exact condition: “immediately before”, “between”, “adjacent” and “followed by” are not interchangeable.</p>
    <h3>7. Missing term and wrong term</h3><p>For a missing term, calculate the pattern from both sides where possible. For a wrong-term question, test each candidate by checking whether the remaining terms follow a single coherent rule. Do not force a complicated rule if a simpler consistent one exists.</p>
    <h3>8. Exam-solving checklist</h3><ol><li>Check differences.</li><li>Check ratios and mixed ×/÷ operations.</li><li>Check alternating positions.</li><li>Check squares, cubes, primes, factorials and triangular numbers.</li><li>Check digit operations and position-dependent rules.</li><li>Verify every term and all options; prefer the simplest consistent rule.</li></ol>
    <div class="key"><b>Common traps:</b> assuming every series uses one operation; ignoring alternating terms; fitting a rule to only two terms; overlooking the difference between the next-term and wrong-term formats.</div>`,
  'Miscellaneous PYQs': `<p>These records belong to other syllabus areas and are kept separate from the five chapter notes.</p>`,
};

const css = `
<style>
body{font:15px/1.62 system-ui,-apple-system,Segoe UI,sans-serif;color:#243044;background:#fff}
section{max-width:980px;margin:auto;padding:16px 18px 55px}
h1{font-size:1.85rem;line-height:1.2;color:#17243a}h2{font-size:1.35rem;margin:2em 0 .5em;padding-bottom:.35em;border-bottom:2px solid #e4eaf1;color:#1c3557}
h3{font-size:1.05rem;margin:1.1em 0 .4em;color:#263d5a}p{margin:.5em 0}li{margin:.25em 0}
.intro,.subtopic{background:#f5f8fc;border:1px solid #dce5ef;border-radius:8px;padding:12px 14px}
.key{background:#fff7cf;border-left:4px solid #e2bf43;padding:10px 13px;margin:12px 0;border-radius:4px}
.note{background:#eaf6e8;border-left:4px solid #79ae70;padding:10px 13px;margin:12px 0;border-radius:4px}
.nav{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}.nav a{background:#eef3fa;border:1px solid #d9e2ed;border-radius:16px;padding:4px 9px;text-decoration:none;color:#23476e;font-size:.85rem}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px}.stat{background:#f5f8fc;border:1px solid #e0e8f1;border-radius:7px;padding:9px}.stat b{display:block;font-size:1.35rem;color:#1e416b}
.pyq{border:1px solid #e6e1c7;border-radius:7px;margin:9px 0;background:#fffef7;overflow:hidden}.pyq summary{cursor:pointer;padding:10px 12px;background:#fff8d8;font-weight:600}
.pyq-body{padding:11px 14px}.qid{color:#705d17;font-size:.8rem;margin-right:7px}.options{padding-left:1.5rem}.options li{padding:4px 7px}.correct{background:#e6f4e4;border-left:3px solid #70a96b}.answer{background:#e9f5e7;border-left:4px solid #71a76b;padding:8px 10px}
.explanation{background:#f7fbf5;border:1px solid #dcebd8;padding:9px 11px;border-radius:5px}.warn{background:#fff0e7;border-left:3px solid #d78a57;padding:7px 10px;font-size:.9rem}
.meta,.muted{font-size:.8rem;color:#68778a}.meta{border-top:1px solid #e7eaf0;padding-top:7px;margin-top:9px}
table{border-collapse:collapse;width:100%;margin:10px 0;font-size:.9rem}th,td{border:1px solid #dce3eb;padding:7px 9px;text-align:left}th{background:#eef3f8}.high{background:#e7f4e4}.mid{background:#fff6d4}
@media(max-width:600px){section{padding:10px 12px 40px}h1{font-size:1.5rem}h2{font-size:1.2rem}}
</style>`;

const displaySubtopic = (row: PyqRow): string => {
  if (row[1] !== 'Miscellaneous PYQs') return row[2];
  const groups: Record<number, string> = {
    126: 'Non-verbal figure series',
    171: 'Time, Speed & Distance',
    273: 'Time, Speed & Distance',
    268: 'Direct and inverse variation',
    387: 'Direct and inverse variation',
    382: 'Ratio & Proportion',
    488: 'Ratio & Proportion',
    495: 'Ratio & Proportion',
    594: 'Ratio & Proportion',
    816: 'Ratio & Proportion',
    490: 'Data Interpretation',
    601: 'Data Interpretation',
    709: 'Data Interpretation',
    713: 'Data Interpretation',
    814: 'Data Interpretation',
    603: 'Percentage',
    820: 'Profit & Loss',
  };
  return groups[row[0]] ?? 'Other syllabus questions';
};

const subAdvice = (topic: string): string => ({
  'Number Series': 'Check differences, ratios, alternating operations and special sequences; verify the rule against every term.',
  'Alphabet / Letter Series': 'Convert letters to positions and solve each column independently.',
  'HCF & LCM': 'Use HCF for greatest common divisor/common-remainder differences; use LCM for first common multiple/repeating events.',
  'Number System': 'Translate the condition into a divisibility, factorisation or number-property test before substituting digits.',
  'Simplification': 'Follow operation precedence exactly; simplify fractions and powers before multiplying.',
  'Miscellaneous PYQs': 'Use the matching quantitative/reasoning method; this question is outside the five requested focus topics.',
} as Record<string, string>)[topic] ?? '';

export function renderPartAQuantReasoningHtml(data: PyqRow[], selectedTopic?: string): string {
  const activeTopics = selectedTopic ? [selectedTopic] : topics;
  const count = (topic: string) => data.filter((r) => r[1] === topic).length;
  const pct = (topic: string) => (100 * count(topic) / data.length).toFixed(1);
  const questionCard = (r: PyqRow, index: number): string => {
    const [id, topic, subtopic, paper, sectionName, sourceTopic, question, options, answer, explanation, review, topicStatus, imageBased] = r;
    const optionHtml = options.map((option, i) => option ? `<li class="${'ABCD'[i] === answer ? 'correct' : ''}"><b>${'ABCD'[i]}.</b> ${esc(option)}${'ABCD'[i] === answer ? ' <b>✓ Workbook key</b>' : ''}</li>` : '').filter(Boolean).join('');
    const keyText = id === 273
      ? 'UNRESOLVED — workbook key A points to 52, but the explanation calculates 48; verify the original paper.'
      : answer ? `Option ${esc(answer)}${optionHtml ? '' : ' (option text missing from extraction)'}` : 'No answer key supplied';
    const inferred = topicStatus.startsWith('Inferred');
    const warnings = [
      imageBased.toLowerCase() === 'yes' ? '<p class="warn">Image/figure-dependent record: the extraction does not contain the complete visual/options.</p>' : '',
      inferred || review ? `<p class="warn">${esc(review || 'Topic inferred from question text')}. Check the original paper/source record.</p>` : '',
    ].join('');
    return `<details class="pyq" id="pyq-${id}"><summary><span class="qid">PYQ ${index} · Source row ${id}</span>${esc(paper || 'Paper/date not recorded')}</summary>
      <div class="pyq-body"><p><b>${esc(question)}</b></p>
      ${optionHtml ? `<ol class="options" type="A">${optionHtml}</ol>` : '<p class="warn">Option texts are not available in the extracted workbook.</p>'}
      <p class="answer"><b>Answer from workbook key:</b> ${keyText}</p>
      ${explanation ? `<div class="explanation"><b>Workbook explanation:</b><p>${esc(explanation)}</p></div>` : '<p class="warn">No explanation was supplied in the workbook.</p>'}
      ${warnings}<p class="meta">Section: ${esc(sectionName)} · Source topic: ${esc(sourceTopic || 'blank')} · Classification: ${inferred ? 'inferred' : 'existing topic label'}</p></div></details>`;
  };

  let html = css + '<section><h1>' + (selectedTopic ? esc(selectedTopic) + ' — DSSSB Part A Complete Notes &amp; PYQs' : 'DSSSB TGT Part A — Quantitative Aptitude &amp; Reasoning Short Notes') + '</h1>';
  html += '<div class="intro"><p><b>Coverage:</b> Number System, Simplification, HCF &amp; LCM, Alphabet/Letter Series and Number Series. Theory is syllabus-aligned. PYQ wording, paper labels, options, answer keys and explanations are reproduced from the uploaded workbook. Source row IDs refer to the workbook sheet.</p><p><b>Source caution:</b> Some Topic fields were blank and inferred from question content; some OCR text/options are incomplete. The answer shown is the workbook key unless a conflict is explicitly flagged. A key is not treated as independently verified when source fields conflict.</p></div>';
  if (!selectedTopic) html += '<div class="stats">' + topics.map((t) => `<div class="stat"><b>${count(t)}</b>${esc(t)}</div>`).join('') + '</div>';
  if (!selectedTopic) html += '<nav class="nav">' + topics.map((t) => `<a href="#${t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${esc(t)}</a>`).join('') + '</nav>';
  html += '<div class="note"><b>How to revise:</b> Read theory and shortcuts first, then open the PYQs immediately below the matching subtopic. Yellow marks priority concepts; green marks workbook-keyed answers; orange marks source limitations or review flags.</div>';
  if (!selectedTopic) html += '<h2 id="frequency-snapshot">PYQ frequency snapshot</h2><p>Counts below are records in the refined 141-record focus/misc set, not guaranteed independent exam appearances. The five requested topics contain 124 records; 17 cross-topic records are retained separately.</p>';
  html += '<table><thead><tr><th>Topic</th><th>Records</th><th>Share</th><th>Priority in this extract</th></tr></thead><tbody>';
  if (!selectedTopic) for (const t of topics) { const p = t === 'Number Series' || t === 'Simplification'; html += `<tr class="${p ? 'high' : 'mid'}"><td>${esc(t)}</td><td>${count(t)}</td><td>${pct(t)}%</td><td>${p ? 'High' : t === 'Number System' ? 'Moderate' : 'Targeted'}</td></tr>`; }
  if (!selectedTopic) html += '</tbody></table><p class="muted">Descriptive workbook frequency only; not an official DSSSB weightage or prediction guarantee.</p>';

  for (const topic of activeTopics) {
    const topicRows = data.filter((r) => r[1] === topic);
    html += `<h2 id="${topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}">${esc(topic)} <span class="muted">(${topicRows.length} PYQs)</span></h2>${theory[topic]}`;
    const subtopics = [...new Set(topicRows.map(displaySubtopic))];
    for (const sub of subtopics) {
      const subRows = topicRows.filter((r) => displaySubtopic(r) === sub);
      html += `<div class="subtopic"><h3>${esc(sub)} — ${subRows.length} PYQs</h3><p class="muted">${esc(subAdvice(topic))}</p></div>`;
      subRows.forEach((r, i) => { html += questionCard(r, i + 1); });
    }
  }

  if (!selectedTopic) html += '<h2 id="source-analysis">Detailed PYQ and syllabus analysis</h2>';
  if (!selectedTopic) {
  html += '<h3>Workbook scope</h3><ul><li>Four relevant sections — Reasoning (160), Arithmetic (160), Arithmetical &amp; Numerical Ability (577), and General Intelligence &amp; Reasoning Ability (69): <b>966 records</b>.</li><li><b>646</b> records had a populated Topic field; <b>320</b> had a blank Topic field and were assigned provisional suggestions in the audit.</li><li>The initial five-focus audit selected 139 records. Content review separated clear speed/ratio/data-interpretation/profit/figure questions into Miscellaneous instead of mislabelling them.</li></ul>';
  html += '<h3>Most frequent suggested labels across all 966 records</h3><table><thead><tr><th>Topic label</th><th>Total</th><th>Existing</th><th>Inferred</th></tr></thead><tbody>';
  const allTopics = [['Time & Work',213,201,12],['Percentage',113,59,54],['Mensuration',71,56,15],['Pipes & Cisterns',62,62,0],['Number Series',50,43,7],['Time, Speed & Distance',50,37,13],['Simplification',43,14,29],['Numerical Techniques',27,27,0],['Number System',26,19,7],['Syllogism / Venn Diagram',24,0,24],['Ratio & Proportion',24,11,13],['Statistics',19,19,0],['Non-Verbal Reasoning',19,1,18],['Probability',19,19,0],['Coding-Decoding',17,10,7]];
  for (const r of allTopics) html += `<tr><td>${esc(r[0])}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`;
  html += '</tbody></table>';
  html += '<h3>Interpretation by focus topic</h3><ul><li><b>Number Series:</b> highest record count in the refined focus set. Practise arithmetic/mixed patterns, wrong-term detection and digit-string questions.</li><li><b>Simplification:</b> BODMAS, fractions, powers and surds appear. Ratio, speed, DI, percentage and profit questions were moved to Miscellaneous.</li><li><b>Number System:</b> divisibility, remainders, prime/factor properties, number types and recurring decimals appear.</li><li><b>HCF &amp; LCM:</b> common remainders, HCF×LCM identity, direct HCF and repeated-event LCM are represented.</li><li><b>Alphabet/Letter Series:</b> letter movement, cyclic shifts, multi-column clusters and letter-number patterns appear.</li></ul>';
  html += '<h3>Syllabus coverage gaps and lower-evidence areas</h3><p>The supplied syllabus explicitly names simplification/BODMAS, fractions, decimals, surds/powers, divisibility, remainders, HCF-LCM, Number System, alphabet/letter series and number series. The extract has examples for each broad area, but not every subskill is well represented. Formal prime-factorisation drills and a wide variety of surd forms have thinner evidence in this selected set. “Not seen” at subtopic level means not clearly represented in these selected records, not proof that it will not appear.</p>';
  html += '<h3>Source quality and answer-key limitations</h3><ul><li>320/966 rows had blank Topic labels; inferred classifications remain provisional.</li><li>Some records have incomplete option fields or OCR artefacts. Image-dependent questions may not be reconstructable from text alone.</li><li>Four selected records have no explanation text in the audit extract.</li><li><b>Known answer conflict:</b> source row 273 has workbook key A/52 while its explanation calculates 48; it is marked unresolved in its PYQ card.</li><li>Counts are workbook record counts; repeated stems may be duplicate imports rather than independent exam appearances.</li></ul>';
  html += '<h3>Classification rules for future questions</h3><ul><li>Divisibility, remainders, prime/factor properties, number types and recurring decimals → Number System.</li><li>BODMAS, arithmetic expressions, fractions, recurring-decimal arithmetic, powers and surds → Simplification.</li><li>Greatest common divisor, least common multiple, common remainders, HCF×LCM identity and repeating events → HCF &amp; LCM.</li><li>Alphabet positions, letter movements, cyclic shifts and letter/letter-number sequences → Alphabet / Letter Series.</li><li>Missing/wrong numerical terms and numerical patterns → Number Series.</li><li>Ratio, percentage, profit/loss, time-speed-distance, data interpretation and figure series → their own topic in a broader notes set; otherwise Miscellaneous PYQs.</li></ul>';
  html += '<p class="muted">Sources: uploaded syllabus text; dsssb pyq part a.xlsx (part A sheet); DSSSB_PYQ_Topic_Audit.xlsx. Theory shortcuts are explanatory notes. PYQ data is workbook-derived and flagged where uncertain.</p></section>';
  }
  return html;
}
