import type { AppSettings, Note, SubjectItem } from '../types/note';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  defaultViewMode: 'grid',
  readingFontSize: 'md',
  showImportantPointsBanner: true,
  confirmBeforeDelete: true,
};

export const DEFAULT_SUBJECTS: SubjectItem[] = [
  {
    id: 'subj-cs',
    name: 'Computer Science',
    description: 'Operating Systems, DBMS, Networking, Algorithms & Data Structures',
    color: 'indigo',
  },
  {
    id: 'subj-math',
    name: 'Mathematics',
    description: 'Number System, Algebra, Trigonometry, Calculus & Quantitative Aptitude',
    color: 'sky',
  },
  {
    id: 'subj-polity',
    name: 'Polity',
    description: 'Indian Constitution, Parliament, Judiciary & Governance',
    color: 'emerald',
  },
  {
    id: 'subj-history',
    name: 'History',
    description: 'Ancient, Medieval, Modern History & Freedom Struggle',
    color: 'amber',
  },
  {
    id: 'subj-geography',
    name: 'Geography',
    description: 'Physical, Indian & World Geography, Climatology',
    color: 'teal',
  },
  {
    id: 'subj-economics',
    name: 'Economics',
    description: 'Macroeconomics, Monetary Policy, Fiscal Budget & Banking',
    color: 'violet',
  },
  {
    id: 'subj-science',
    name: 'General Science',
    description: 'Physics, Chemistry & Biology exam concepts',
    color: 'rose',
  },
  {
    id: 'subj-reasoning',
    name: 'Reasoning',
    description: 'Logical Deduction, Syllogisms, Puzzles & Series',
    color: 'slate',
  },
  {
    id: 'subj-english',
    name: 'English',
    description: 'Grammar, Voice, Narration, Comprehension & Vocabulary',
    color: 'sky',
  },
  {
    id: 'subj-hindi',
    name: 'Hindi',
    description: 'Vyakaran, Sandhi, Samas, Alankar & Muhavare',
    color: 'amber',
  },
  {
    id: 'subj-gk',
    name: 'General Knowledge',
    description: 'Static GK, Awards, International Organizations & Current Affairs',
    color: 'emerald',
  },
];

export const SEED_NOTES: Note[] = [
  {
    id: 'note-os-process-mgmt',
    title: 'Process Management & CPU Scheduling Algorithms',
    subject: 'Computer Science',
    chapter: 'Operating System',
    topic: 'Process Management',
    subtopic: 'Scheduling & States',
    content: `# Process Management & CPU Scheduling

> **Definition:** A **process** is a program in execution, along with its current values of program counter, registers, and variables (Process Control Block).

## 1. Process State Transitions

A process moves through five primary states during its lifecycle:

1. **New** – Process is being created.
2. **Ready** – Process is loaded in main memory, waiting for CPU allocation.
3. **Running** – Instructions are currently being executed by a CPU core.
4. **Waiting (Blocked)** – Process is waiting for an I/O event or signal.
5. **Terminated** – Process has finished execution and PCB is deallocated.

## 2. Comparison of CPU Scheduling Algorithms

| Algorithm | Preemptive? | Starvation Risk | Best For |
| :--- | :--- | :--- | :--- |
| **FCFS** (First Come First Serve) | No | No (Convoy Effect possible) | Batch systems |
| **SJF** (Shortest Job First) | Optional (SRTF) | Yes (long jobs may starve) | Minimum avg waiting time |
| **Round Robin (RR)** | Yes (Time Quantum) | No | Time-sharing / interactive |
| **Priority Scheduling** | Optional | Yes (Solved via Aging) | Real-time & critical tasks |

## 3. Turnaround & Waiting Time Formulas

\`\`\`python
# Core formulas frequently tested in numerical questions
turnaround_time = completion_time - arrival_time
waiting_time = turnaround_time - burst_time
response_time = first_cpu_time - arrival_time
\`\`\`

## 4. Exam Tips

- **Convoy Effect** occurs in **FCFS** when a long CPU-bound process delays shorter I/O-bound processes behind it.
- **SRTF** (Shortest Remaining Time First) gives the **provably minimum average waiting time** among all scheduling algorithms.
- If Time Quantum \`q\` in Round Robin approaches infinity, RR behaves identically to **FCFS**.`,
    importantPoints: [
      'PCB stores Process ID, state, program counter, CPU registers, and memory limits.',
      'SRTF achieves minimum average waiting time across all scheduling policies.',
      'Aging prevents starvation in Priority Scheduling by gradually increasing priority.',
      'Turnaround Time = Completion Time − Arrival Time.',
    ],
    tags: ['OS', 'Process', 'Scheduling', 'High-Yield'],
    important: true,
    favorite: true,
    revisionStatus: 'revised',
    createdAt: '2026-11-12',
    updatedAt: '2026-11-16',
    lastViewedAt: '2026-11-17T10:15:00.000Z',
  },
  {
    id: 'note-os-intro',
    title: 'Introduction to Operating System & Kernel Architecture',
    subject: 'Computer Science',
    chapter: 'Operating System',
    topic: 'Introduction',
    subtopic: 'Kernel & System Calls',
    content: `# Introduction to Operating System

> **Core Concept:** An **Operating System (OS)** acts as an intermediary between computer hardware and user applications, managing CPU, memory, storage, and I/O devices.

## Primary Functions of an OS

- **Process Management**: Creating, scheduling, and synchronizing processes.
- **Memory Management**: Allocation, paging, segmentation, and virtual memory.
- **File System Management**: Directory hierarchy, permissions, and disk blocks.
- **Device & I/O Management**: Buffering, caching, spooling, and device drivers.

## Monolithic vs Microkernel

| Feature | Monolithic Kernel | Microkernel |
| :--- | :--- | :--- |
| **Services Location** | All OS services run in Kernel space | Minimal services in Kernel; rest in User space |
| **Performance** | Faster (direct function calls) | Slightly slower (IPC overhead) |
| **Fault Isolation** | Low (driver crash can crash kernel) | High (service crash stays isolated) |
| **Examples** | Linux, Traditional UNIX | MINIX, QNX, L4 |

## System Calls & Mode Bit

- Hardware uses a **Mode Bit**: \`0\` for **Kernel Mode** (privileged) and \`1\` for **User Mode**.
- Switching from User Mode to Kernel Mode happens via a **Trap / Software Interrupt** during a system call (e.g., \`fork()\`, \`exec()\`, \`open()\`, \`read()\`).`,
    importantPoints: [
      'Mode Bit 0 = Kernel Mode (privileged instructions allowed); Mode Bit 1 = User Mode.',
      'fork() returns 0 to the child process and the child PID to the parent process.',
      'Microkernels trade IPC overhead for higher fault isolation and modularity.',
    ],
    tags: ['OS', 'Fundamentals', 'Kernel'],
    important: true,
    favorite: false,
    revisionStatus: 'learning',
    createdAt: '2026-11-10',
    updatedAt: '2026-11-14',
    lastViewedAt: '2026-11-16T18:20:00.000Z',
  },
  {
    id: 'note-dbms-normalization',
    title: 'Database Normalization: 1NF to BCNF Quick Reference',
    subject: 'Computer Science',
    chapter: 'Database Management Systems',
    topic: 'Normalization',
    subtopic: 'Functional Dependencies',
    content: `# Database Normalization (1NF to BCNF)

> **Goal:** Eliminate **data redundancy** and prevent **insertion, update, and deletion anomalies** while preserving lossless-join decomposition.

## Normal Forms Hierarchy

| Normal Form | Eliminates | Rule to Remember |
| :--- | :--- | :--- |
| **1NF** | Repeating groups / multivalued attributes | Every cell holds an **atomic** value |
| **2NF** | **Partial dependency** | Every non-prime attribute fully depends on the whole candidate key |
| **3NF** | **Transitive dependency** | For \`X -> Y\`, either \`X\` is superkey OR \`Y\` is a prime attribute |
| **BCNF** | Any non-trivial FD where LHS is not a superkey | For every \`X -> Y\`, \`X\` **must** be a superkey |

## SQL Check Example

\`\`\`sql
-- Well-normalized relation separating Students and Courses
CREATE TABLE Enrollments (
  student_id INT NOT NULL,
  course_code VARCHAR(16) NOT NULL,
  grade CHAR(2),
  PRIMARY KEY (student_id, course_code)
);
\`\`\`

## Key Exam Fact

- **3NF** always guarantees both **Lossless Join** and **Dependency Preservation**.
- **BCNF** always guarantees **Lossless Join**, but does **not** always guarantee dependency preservation.`,
    importantPoints: [
      'Every BCNF relation is automatically in 3NF, 2NF, and 1NF.',
      '2NF applies only when the candidate key is composite; single-attribute key relations in 1NF are already in 2NF.',
      '3NF preserves dependencies; BCNF may sacrifice dependency preservation.',
    ],
    tags: ['DBMS', 'SQL', 'Normalization'],
    important: true,
    favorite: true,
    revisionStatus: 'mastered',
    createdAt: '2026-11-08',
    updatedAt: '2026-11-15',
    lastViewedAt: '2026-11-17T08:40:00.000Z',
  },
  {
    id: 'note-polity-fundamental-rights',
    title: 'Fundamental Rights (Articles 12–35) & Five Writs',
    subject: 'Polity',
    chapter: 'Indian Constitution',
    topic: 'Fundamental Rights',
    subtopic: 'Articles 12 to 35',
    content: `# Fundamental Rights (Part III, Articles 12–35)

> **Magna Carta of India:** Borrowed primarily from the **US Constitution (Bill of Rights)**, Fundamental Rights are **justiciable**—citizens can directly approach the Supreme Court under **Article 32**.

## Six Categories of Fundamental Rights

1. **Right to Equality** (Articles 14–18)
2. **Right to Freedom** (Articles 19–22)
3. **Right against Exploitation** (Articles 23–24)
4. **Right to Freedom of Religion** (Articles 25–28)
5. **Cultural and Educational Rights** (Articles 29–30)
6. **Right to Constitutional Remedies** (Article 32)

*(Note: Right to Property was moved from Art. 31 to **Article 300A** as a Legal Right by the **44th Amendment Act, 1978**.)*

## Five Constitutional Writs (Art. 32 & Art. 226)

| Writ | Literal Meaning | Issued Against |
| :--- | :--- | :--- |
| **Habeas Corpus** | "To have the body of" | Illegal detention (both public & private persons) |
| **Mandamus** | "We command" | Public official failing to perform legal duty |
| **Prohibition** | "To forbid" | Lower court/tribunal exceeding jurisdiction (preventive) |
| **Certiorari** | "To be certified" | Quashing order of lower court/tribunal (curative + preventive) |
| **Quo-Warranto** | "By what authority" | Challenging legality of holding a public office |

## Exam Traps

- Articles **15, 16, 19, 29, and 30** are available **only to Indian citizens** (not foreigners).
- **Articles 20 and 21** can **never be suspended** even during a National Emergency.`,
    importantPoints: [
      'Art. 17 abolishes Untouchability; Art. 18 abolishes Titles (except military/academic).',
      'Art. 21A (Right to Education, 6–14 yrs) was added by the 86th Amendment Act, 2002.',
      'Only citizens get Articles 15, 16, 19, 29, 30.',
      'Articles 20 & 21 cannot be suspended during Emergency (44th Amendment).',
    ],
    tags: ['Polity', 'Constitution', 'Writs', 'High-Yield'],
    important: true,
    favorite: true,
    revisionStatus: 'learning',
    createdAt: '2026-11-14',
    updatedAt: '2026-11-17',
    lastViewedAt: '2026-11-17T09:30:00.000Z',
  },
  {
    id: 'note-math-modular-arithmetic',
    title: 'Divisibility, Remainders & Fermat / Euler Theorems',
    subject: 'Mathematics',
    chapter: 'Number System',
    topic: 'Remainders & Modular Arithmetic',
    subtopic: 'Divisibility Rules',
    content: `# Remainders & Modular Arithmetic

> **Division Algorithm:** For any integers \`a\` and \`b > 0\`, there exist unique integers \`q\` and \`r\` such that \`a = bq + r\` where \`0 <= r < b\`.

## Essential Remainder Theorems

### 1. Fermat's Little Theorem
If \`p\` is a **prime** and \`gcd(a, p) = 1\`:
- \`a^(p - 1) ≡ 1 (mod p)\`

### 2. Euler's Totient Theorem
For any coprime integers \`a\` and \`n\` (\`gcd(a, n) = 1\`):
- \`a^φ(n) ≡ 1 (mod n)\`
- Where \`φ(n) = n * Π(1 - 1/p)\` over distinct prime factors \`p\` of \`n\`.

### 3. Wilson's Theorem
For any prime \`p\`:
- \`(p - 1)! ≡ -1 (mod p)\`

## Quick Divisibility Cheatsheet

| Divisor | Rule |
| :--- | :--- |
| **3 or 9** | Sum of digits divisible by 3 or 9 |
| **4 / 8** | Last 2 digits divisible by 4 / Last 3 digits divisible by 8 |
| **11** | Difference between sum of odd-place and even-place digits is \`0\` or multiple of \`11\` |
| **7, 11, 13** | Alternating sum of 3-digit blocks from right is divisible by 7, 11, or 13 |

## Exam Tip

- Always break composite divisors into **coprime factors** (e.g., for 72, check divisibility by both **8** and **9**; for 88, check **8** and **11**).`,
    importantPoints: [
      'Negative remainders simplify power questions: e.g., 17 mod 18 = -1.',
      'Euler totient of a prime p is always p - 1.',
      'For composite divisors like 72 or 88, factor into coprime pairs (8 × 9, 8 × 11).',
    ],
    tags: ['NumberSystem', 'Remainders', 'Formulas'],
    important: true,
    favorite: false,
    revisionStatus: 'revised',
    createdAt: '2026-11-11',
    updatedAt: '2026-11-13',
  },
  {
    id: 'note-economics-monetary-policy',
    title: 'RBI Monetary Policy Tools: Repo, Reverse Repo, CRR & SLR',
    subject: 'Economics',
    chapter: 'Banking & Monetary Policy',
    topic: 'Monetary Policy Instruments',
    subtopic: 'Quantitative Tools',
    content: `# RBI Monetary Policy Instruments

> **Objective:** The **Monetary Policy Committee (MPC)** (6 members: 3 from RBI, 3 nominated by Govt) targets **CPI inflation at 4% (±2%)**.

## Quantitative (General) Instruments

| Instrument | Meaning | Effect of Increase |
| :--- | :--- | :--- |
| **Repo Rate** | Rate at which RBI lends short-term funds to commercial banks against govt securities | Borrowing cost rises → **Liquidity & Inflation decrease** |
| **SDF / Reverse Repo** | Rate at which RBI absorbs excess liquidity from banks (SDF requires no collateral) | Banks park more funds with RBI → **Money supply falls** |
| **CRR** (Cash Reserve Ratio) | % of NDTL banks must keep as **cash with RBI** (earns 0% interest) | Less lendable funds → **Credit creation shrinks** |
| **SLR** (Statutory Liquidity Ratio) | % of NDTL banks keep with **themselves** in cash, gold, or approved govt securities | Restricts bank lending capacity |
| **MSF** (Marginal Standing Facility) | Penal overnight borrowing rate for banks above SLR quota | Sets the **ceiling** of the LAF corridor |

## Quick Distinction: Fiscal vs Monetary Policy

- **Monetary Policy**: Controlled by **RBI** (interest rates, money supply, CRR, SLR, OMO).
- **Fiscal Policy**: Controlled by **Government / Ministry of Finance** (taxation, public expenditure, fiscal deficit).`,
    importantPoints: [
      'MPC has 6 members; RBI Governor has the casting vote in case of a tie.',
      'CRR is held only in cash with RBI and earns zero interest.',
      'Standing Deposit Facility (SDF) is now the floor of the LAF corridor.',
    ],
    tags: ['Economics', 'RBI', 'Banking'],
    important: true,
    favorite: false,
    revisionStatus: 'learning',
    createdAt: '2026-11-13',
    updatedAt: '2026-11-13',
  },
  {
    id: 'note-geography-indian-monsoon',
    title: 'Mechanism of Indian Monsoon & El Nino / La Nina Effects',
    subject: 'Geography',
    chapter: 'Indian Climatology',
    topic: 'Indian Monsoon',
    subtopic: 'SW & NE Monsoons',
    content: `# Mechanism of the Indian Monsoon

> **Monsoon:** Derived from the Arabic word *Mausim* (season), referring to seasonal reversal of wind direction across the Indian Ocean and Arabian Sea.

## Key Drivers of Southwest (SW) Monsoon

1. **Differential Heating**: Low-pressure trough over northwest India and high pressure over southern Indian Ocean.
2. **Shift of ITCZ**: Inter-Tropical Convergence Zone shifts northward over the Ganga plains (~20°N–25°N) in July.
3. **Tibetan Plateau Heating**: Intense summer heating generates an upper-level anticyclone and **Tropical Easterly Jet (TEJ)**.
4. **Somali Jet**: Cross-equatorial low-level jet stream strengthening moisture transport into the Arabian Sea.

## Ocean-Atmosphere Phenomena

| Phenomenon | Pacific Ocean Condition | Impact on Indian Monsoon |
| :--- | :--- | :--- |
| **El Nino** | Abnormal warming of Central/Eastern Pacific | **Weakens** monsoon; higher drought risk |
| **La Nina** | Abnormal cooling of Central/Eastern Pacific | **Strengthens** monsoon; above-normal rainfall |
| **Positive IOD** | Western Indian Ocean warmer than Eastern Indian Ocean | **Boosts** Indian monsoon (can offset weak El Nino) |

## SW vs NE (Retreating) Monsoon

- **SW Monsoon (June–Sept)**: Accounts for ~75% of India's rainfall; enters via **Kerala around June 1** in two branches (Arabian Sea & Bay of Bengal).
- **NE Monsoon (Oct–Dec)**: Blows from land to sea, picking up moisture over Bay of Bengal to bring primary rainfall to **Tamil Nadu coast (Coromandel)**.`,
    importantPoints: [
      'Tamil Nadu receives maximum rainfall from the Retreating / Northeast Monsoon (Oct–Dec).',
      'El Nino warms the eastern Pacific and weakens Indian SW monsoon.',
      'Positive Indian Ocean Dipole (IOD) favors strong rainfall over India.',
    ],
    tags: ['Geography', 'Monsoon', 'Climatology'],
    important: false,
    favorite: false,
    revisionStatus: 'not_started',
    createdAt: '2026-11-09',
    updatedAt: '2026-11-09',
  },
  {
    id: 'note-science-thermodynamics',
    title: 'Laws of Thermodynamics & Heat Engines',
    subject: 'General Science',
    chapter: 'Physics – Heat & Thermodynamics',
    topic: 'Laws of Thermodynamics',
    subtopic: 'Carnot Cycle & Entropy',
    content: `# Laws of Thermodynamics

## Summary of the Four Laws

| Law | Core Principle | Key Physical Quantity Defined |
| :--- | :--- | :--- |
| **Zeroth Law** | If \`A\` is in thermal equilibrium with \`B\` and \`B\` with \`C\`, then \`A\` is with \`C\` | **Temperature** |
| **First Law** | Conservation of Energy: \`ΔQ = ΔU + ΔW\` | **Internal Energy (\`U\`)** |
| **Second Law** | Heat cannot spontaneously flow from cold to hot without external work | **Entropy (\`S\`)** & Direction of process |
| **Third Law** | Entropy of a pure crystalline substance approaches zero at \`0 Kelvin\` | **Absolute Zero** limit |

## Special Thermodynamic Processes

- **Isothermal** (\`T = constant\`): \`ΔU = 0\`, so \`ΔQ = ΔW\`.
- **Adiabatic** (\`ΔQ = 0\`): No heat exchange; \`PV^γ = constant\`.
- **Isochoric** (\`V = constant\`): \`ΔW = 0\`, so \`ΔQ = ΔU\`.
- **Isobaric** (\`P = constant\`): \`ΔW = P ΔV\`.

## Carnot Engine Efficiency

\`η = 1 - (T_cold / T_hot)\` (temperatures strictly in **Kelvin**). Efficiency can reach 100% only if sink temperature \`T_cold = 0 K\`, which is impossible.`,
    importantPoints: [
      'First Law is energy conservation; Internal energy U of an ideal gas depends only on temperature.',
      'Carnot efficiency depends solely on source and sink temperatures in Kelvin.',
      'In an isochoric process, work done is strictly zero.',
    ],
    tags: ['Physics', 'Thermodynamics', 'Formulas'],
    important: true,
    favorite: false,
    revisionStatus: 'revised',
    createdAt: '2026-11-07',
    updatedAt: '2026-11-11',
  },
  {
    id: 'note-history-indus-valley',
    title: 'Indus Valley Civilization: Major Sites & Archaeological Findings',
    subject: 'History',
    chapter: 'Ancient India',
    topic: 'Indus Valley Civilization',
    subtopic: 'Harappan Sites',
    content: `# Indus Valley Civilization (c. 2500 – 1750 BCE)

> **Overview:** A **Bronze Age** urban civilization known for grid-pattern town planning, burnt-brick architecture, and covered underground drainage.

## Important Sites & Key Findings

| Site | River | Excavator & Year | Major Findings |
| :--- | :--- | :--- | :--- |
| **Harappa** | Ravi | Daya Ram Sahni (1921) | Six granaries in a row, sandstone male torso |
| **Mohenjo-daro** | Indus | R.D. Banerji (1922) | Great Bath, Great Granary, Bronze Dancing Girl, Pashupati Seal |
| **Lothal** | Bhogava | S.R. Rao (1953) | Artificial **Dockyard**, bead-making factory, rice husk |
| **Kalibangan** | Ghaggar | A. Ghosh / B.B. Lal | **Ploughed field** surface, fire altars, camel bones |
| **Dholavira** | Luni (Rann of Kutch) | R.S. Bisht (1990) | Unique **3-tier town plan**, advanced water reservoirs, 10-sign signboard |
| **Banawali** | Rangoi | R.S. Bisht | Terracotta plough model, radial streets |

## Exam Facts

- **Iron** was **unknown** to the Harappan people; primary metals were **copper, bronze, gold, and silver**.
- **Cotton** (called *Sindon* by Greeks) was first cultivated by the Harappans.
- Script was **pictographic** and **boustrophedon** (written right-to-left, then left-to-right), still **undeciphered**.`,
    importantPoints: [
      'Lothal is the famous port city with a brick-lined tidal dockyard.',
      'Dholavira (UNESCO World Heritage site) had a 3-part city layout and water harvesting reservoirs.',
      'Harappans did not use iron and had no knowledge of horses on a wide scale.',
    ],
    tags: ['AncientHistory', 'IVC', 'Sites'],
    important: false,
    favorite: false,
    revisionStatus: 'learning',
    createdAt: '2026-11-06',
    updatedAt: '2026-11-10',
  },
  {
    id: 'note-reasoning-syllogism',
    title: 'Syllogism Rules & Either-Or Complementary Pairs',
    subject: 'Reasoning',
    chapter: 'Verbal & Logical Deduction',
    topic: 'Syllogism',
    subtopic: 'Venn Diagram Rules',
    content: `# Syllogisms – Quick Exam Rules

## Standard Statement Types

1. **All A are B** (Universal Positive)
2. **No A is B** (Universal Negative)
3. **Some A are B** (Particular Positive)
4. **Some A are not B** (Particular Negative)

## Conditions for "Either-Or" (Complementary Pair)

A conclusion pair qualifies for **Either I or II follows** only when **all three** conditions hold:

1. **Both conclusions are individually false (uncertain / possible)** from the basic Venn diagram.
2. **Elements (Subject & Predicate) are identical** in both conclusions.
3. They form one of the valid **complementary pairs**:
   - \`Some A are B\` + \`No A is B\`
   - \`All A are B\` + \`Some A are not B\`
   - \`Some A are B\` + \`Some A are not B\` *(Note: \`All\` + \`No\` is NOT a valid Either-Or pair!)*

## "Only a few A are B" Shortcut

- **Only a few A are B** means **BOTH** \`Some A are B\` **AND** \`Some A are not B\`.
- Therefore, \`All A can be B\` is **false**, while \`All B can be A\` is **true**.`,
    importantPoints: [
      '"All A are B" + "No A is B" is NEVER an Either-Or pair.',
      '"Only a few A are B" implies Some A are B AND Some A are not B.',
      'In Possibility cases, if a relation is not forbidden by negative statements, it is possible.',
    ],
    tags: ['Reasoning', 'Syllogism', 'Tricks'],
    important: false,
    favorite: false,
    revisionStatus: 'not_started',
    createdAt: '2026-11-04',
    updatedAt: '2026-11-04',
  },
  {
    id: 'note-english-subject-verb',
    title: 'Subject-Verb Agreement: High-Frequency Exam Rules',
    subject: 'English',
    chapter: 'Grammar & Error Spotting',
    topic: 'Subject-Verb Agreement',
    subtopic: 'Core Rules',
    content: `# Subject-Verb Agreement – Exam Checklist

## 1. Proximity Rule (Conjunctions)
When two subjects are joined by **either...or**, **neither...nor**, **not only...but also**, the verb agrees with the **nearest subject**:
- *Neither the teacher nor the **students were** present.*
- *Neither the students nor the **teacher was** present.*

## 2. First Subject Rule
When joined by **as well as**, **along with**, **together with**, **in addition to**, **besides**, the verb agrees with the **first subject**:
- *The **captain**, along with his sailors, **was** rescued.*

## 3. Indefinite Pronouns (Always Singular)
- **Each, Every, Everyone, Everybody, Someone, Nobody, Anyone, Either, Neither, One of the** take a **singular verb**:
- *One of my **friends is** moving to Pune.*
- *Each of the boys **has** submitted the form.*

## 4. "A number of" vs "The number of"
- **A number of + Plural Noun** → **Plural Verb** (*A number of students **are** absent.*)
- **The number of + Plural Noun** → **Singular Verb** (*The number of applicants **is** rising.*)

## 5. Subjunctive / Hypothetical Mood
- After *If, As if, As though, I wish*, always use **were** regardless of singular subject: *If I **were** you...*`,
    importantPoints: [
      '"The number of" takes a singular verb; "A number of" takes a plural verb.',
      '"One of the + plural noun" always takes a singular verb unless followed by a relative pronoun (who/that) referring to the plural noun.',
      'With "as well as / along with", match the verb to the first subject.',
    ],
    tags: ['English', 'Grammar', 'ErrorSpotting'],
    important: false,
    favorite: false,
    revisionStatus: 'not_started',
    createdAt: '2026-11-03',
    updatedAt: '2026-11-03',
  },
  {
    id: 'note-hindi-samas',
    title: 'Hindi Vyakaran: Samas (समास) ke Bhed aur Pahchan',
    subject: 'Hindi',
    chapter: 'Hindi Vyakaran',
    topic: 'Samas (समास)',
    subtopic: 'Six Types of Samas',
    content: `# समास (Samas) – संक्षिप्त परीक्षा नोट्स

> **परिभाषा:** दो या दो से अधिक शब्दों के मेल से नया सार्थक शब्द बनने की प्रक्रिया को **समास** कहते हैं। मुख्यतः समास के **6 भेद** होते हैं।

## समास के 6 प्रमुख भेद

| समास का नाम | प्रधान पद | पहचान की ट्रिक | उदाहरण |
| :--- | :--- | :--- | :--- |
| **अव्ययीभाव समास** | पूर्वपद प्रधान | पहला पद उपसर्ग/अव्यय (यथा, प्रति, आ, भर) | यथाशक्ति, प्रतिदिन, आजन्म |
| **तत्पुरुष समास** | उत्तरपद प्रधान | विग्रह करने पर कारक चिह्न (का, के, को, से, में) | राजपुत्र (राजा का पुत्र), गगनचुंबी |
| **कर्मधारय समास** | उत्तरपद प्रधान | विशेषण-विशेष्य या उपमेय-उपमान ("है जो", "के समान") | नीलकमल, चरणकमल, महापुरुष |
| **द्विगु समास** | उत्तरपद प्रधान | पहला पद **संख्यावाचक** (समूह का बोध) | चौराहा, पंचवटी, तिरंगा |
| **द्वंद्व समास** | दोनों पद प्रधान | बीच में योजक चिह्न (-) और विग्रह में "और/या" | माता-पिता, दिन-रात, पाप-पुण्य |
| **बहुव्रीहि समास** | कोई पद प्रधान नहीं | दोनों पद मिलकर किसी **तीसरे विशेष अर्थ** की ओर संकेत करें | दशानन (रावण), पीतांबर (कृष्ण), लंबोदर (गणेश) |

## महत्वपूर्ण परीक्षा टिप

- यदि एक ही शब्द (जैसे **पीतांबर** या **दशानन**) में कर्मधारय/द्विगु और बहुव्रीहि दोनों विकल्प हों, और विग्रह तीसरा अर्थ दे रहा हो, तो **बहुव्रीहि समास** को प्राथमिकता दें।`,
    importantPoints: [
      'अव्ययीभाव में पहला पद अव्यय या उपसर्ग होता है (जैसे यथा, प्रति, भर)।',
      'द्विगु समास में पहला पद संख्यावाचक होता है और समूह का बोध कराता है।',
      'बहुव्रीहि समास में तीसरा अर्थ निकलता है (जैसे चक्रपाणि, नीलकंठ)।',
    ],
    tags: ['Hindi', 'Vyakaran', 'Samas'],
    important: false,
    favorite: false,
    revisionStatus: 'not_started',
    createdAt: '2026-11-02',
    updatedAt: '2026-11-02',
  },
  {
    id: 'note-gk-intl-orgs',
    title: 'Major International Organizations: Headquarters & Founding Years',
    subject: 'General Knowledge',
    chapter: 'Static GK',
    topic: 'International Organizations',
    subtopic: 'Headquarters & Chiefs',
    content: `# International Organizations – Headquarters Cheatsheet

## Quick Reference Table

| Organization | Headquarters | Founded | Key Fact |
| :--- | :--- | :--- | :--- |
| **United Nations (UN)** | New York, USA | 1945 | 6 principal organs; ICJ is in The Hague |
| **UNESCO** | Paris, France | 1945 | Education, Science & Culture; World Heritage List |
| **WHO** | Geneva, Switzerland | 1948 | World Health Day: April 7 |
| **WTO** | Geneva, Switzerland | 1995 | Replaced GATT (1948) via Marrakesh Agreement |
| **IMF & World Bank** | Washington D.C., USA | 1944 (Bretton Woods) | Known as Bretton Woods Twins |
| **ADB** | Manila, Philippines | 1966 | Regional development bank for Asia-Pacific |
| **ASEAN** | Jakarta, Indonesia | 1967 | 10 member nations (Bangkok Declaration) |
| **SAARC** | Kathmandu, Nepal | 1985 | 8 member nations (Dhaka Charter) |

## Memory Trick for Geneva

Most organizations starting with **"World"** and ending with **"Organization"** (WHO, WTO, WIPO, WMO, ILO, ITU) have headquarters in **Geneva, Switzerland**.`,
    importantPoints: [
      'Among the 6 UN organs, only the International Court of Justice (ICJ) is in The Hague (not New York).',
      'IMF and World Bank were both created at the 1944 Bretton Woods Conference.',
      'WTO replaced GATT on 1 January 1995.',
    ],
    tags: ['StaticGK', 'Organizations', 'Headquarters'],
    important: false,
    favorite: false,
    revisionStatus: 'not_started',
    createdAt: '2026-11-01',
    updatedAt: '2026-11-01',
  },
];
